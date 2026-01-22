const BacklogItem = require("../models/backlog.model");
const { v4: uuid } = require("uuid");
const db = require("../config/database");

exports.getBacklogByProject = async (req, res) => {
    try {
        const { projectId, status, priority, type, assigned_to_id, tags, sprint_id, search, sortBy, sortOrder } = req.query;
        if (!projectId) return res.status(400).json({ message: "Project ID is required" });

        // Check if user is member
        const [member] = await BacklogItem.isMember(projectId, req.user.id);
        if (member.length === 0) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        // Build filters object
        const filters = {};
        if (status) {
            filters.status = Array.isArray(status) ? status : status.split(',');
        }
        if (priority) {
            filters.priority = Array.isArray(priority) ? priority : priority.split(',');
        }
        if (type) {
            filters.type = Array.isArray(type) ? type : type.split(',');
        }
        if (tags) {
            filters.tags = Array.isArray(tags) ? tags : tags.split(',');
        }
        if (assigned_to_id) {
            filters.assigned_to_id = assigned_to_id;
        }
        if (sprint_id) {
            filters.sprint_id = sprint_id;
        }
        if (search) {
            filters.search = search;
        }
        if (sortBy) {
            filters.sort = sortBy;
            filters.sortOrder = sortOrder;
        }

        const [items] = await BacklogItem.findAllByProject(projectId, filters);

        // Parse tags
        const parsedItems = items.map(item => ({
            ...item,
            tags: item.tags ? JSON.parse(item.tags) : []
        }));

        res.json(parsedItems);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving backlog", error: err.message });
    }
};

exports.getBacklogBySprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const [items] = await BacklogItem.findAllBySprint(sprintId);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving sprint items", error: err.message });
    }
};

exports.getBacklogItemById = async (req, res) => {
    try {
        const [rows] = await BacklogItem.findById(req.params.id);
        if (rows.length === 0) return res.status(404).json({ message: "Item not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving item", error: err.message });
    }
};

exports.createBacklogItem = async (req, res) => {
    try {
        const { project_id, sprint_id, title, description, type, story_points, priority, tags, due_date, is_blocked, assigned_to_id } = req.body;

        // Validation
        if (!project_id || !title) return res.status(400).json({ message: "Project ID and Title are required" });
        if (title.length < 10 || title.length > 200) return res.status(400).json({ message: "Title must be 10-200 characters" });
        if (description && description.length > 1000) return res.status(400).json({ message: "Description max 1000 characters" });
        if (type && !['USER_STORY', 'BUG', 'TECHNICAL_TASK', 'IMPROVEMENT'].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }
        if (story_points && ![1, 2, 3, 5, 8, 13, 21].includes(story_points)) {
            return res.status(400).json({ message: "Story points must be Fibonacci number (1,2,3,5,8,13,21)" });
        }
        if (priority && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        // Check if user is member of project
        const [member] = await BacklogItem.isMember(project_id, req.user.id);
        if (member.length === 0) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        // Si on assigne à un sprint, vérifier que le sprint n'est pas complété
        if (sprint_id) {
            const Sprint = require("../models/sprint.model");
            const [sprintRows] = await Sprint.findById(sprint_id);

            if (!sprintRows.length) {
                return res.status(404).json({ message: "Sprint not found" });
            }

            const sprint = sprintRows[0];
            if (sprint.status === 'COMPLETED') {
                return res.status(400).json({ message: "Cannot assign items to a completed sprint" });
            }
        }

        let position = 0;
        let finalStatus = 'BACKLOG';

        if (sprint_id) {
            finalStatus = 'TODO'; // If assigned to a sprint immediately
            const [[{ maxPos }]] = await BacklogItem.getMaxPosition(sprint_id, finalStatus);
            position = (maxPos || 0) + 1;
        }

        let itemPosition = position;
        if (!sprint_id) {
            // For backlog, assign next position
            const [[{ maxPos }]] = await BacklogItem.getMaxBacklogPosition(project_id);
            itemPosition = (maxPos || 0) + 1;
        }

        const newItem = {
            id: uuid(),
            project_id,
            sprint_id: sprint_id || null,
            title,
            description,
            type: type || 'USER_STORY',
            story_points: story_points || 0,
            priority: priority || 'MEDIUM',
            tags,
            due_date,
            is_blocked: is_blocked || 0,
            status: finalStatus,
            position: itemPosition,
            assigned_to_id: assigned_to_id || null,
            created_by_id: req.user.id
        };

        await BacklogItem.create(newItem);
        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: "Error creating backlog item", error: err.message });
    }
};

exports.updateBacklogItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check permissions: creator or assigned member or Product Owner
        const [items] = await BacklogItem.findById(id);
        if (items.length === 0) return res.status(404).json({ message: "Item not found" });
        const item = items[0];

        const [member] = await BacklogItem.isMember(item.project_id, req.user.id);
        if (member.length === 0) {
            return res.status(403).json({ message: "Not a member of this project" });
        }

        const userRole = member[0].role;
        const canEdit = userRole === 'PRODUCT_OWNER' || item.created_by_id === req.user.id || item.assigned_to_id === req.user.id;

        if (!canEdit) {
            return res.status(403).json({ message: "Cannot edit this item" });
        }

        // Validation
        if (updates.title && (updates.title.length < 10 || updates.title.length > 200)) {
            return res.status(400).json({ message: "Title must be 10-200 characters" });
        }
        if (updates.description && updates.description.length > 1000) {
            return res.status(400).json({ message: "Description max 1000 characters" });
        }
        if (updates.type && !['USER_STORY', 'BUG', 'TECHNICAL_TASK', 'IMPROVEMENT'].includes(updates.type)) {
            return res.status(400).json({ message: "Invalid type" });
        }
        if (updates.story_points && ![1, 2, 3, 5, 8, 13, 21].includes(updates.story_points)) {
            return res.status(400).json({ message: "Invalid story points" });
        }
        if (updates.priority && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(updates.priority)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        await BacklogItem.update(id, updates, req.user.id);
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating item", error: err.message });
    }
};

exports.assignMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const [items] = await BacklogItem.findById(id);
        if (items.length === 0) return res.status(404).json({ message: "Item not found" });
        const item = items[0];

        if (userId) {
            const [member] = await BacklogItem.isMember(item.project_id, userId);
            if (member.length === 0) {
                return res.status(400).json({ message: "User is not a member of this project" });
            }
        }

        await BacklogItem.update(id, { assigned_to_id: userId || null });
        res.json({ message: "Member assigned successfully", assigned_to_id: userId });
    } catch (err) {
        res.status(500).json({ message: "Error assigning member", error: err.message });
    }
};

exports.deleteBacklogItem = async (req, res) => {
    try {
        const { confirm } = req.query;
        const itemId = req.params.id;

        const [items] = await BacklogItem.findById(itemId);
        if (items.length === 0) return res.status(404).json({ message: "Item not found" });
        const item = items[0];

        // Check if Product Owner
        const [member] = await BacklogItem.isMember(item.project_id, req.user.id);
        if (member.length === 0 || member[0].role !== 'PRODUCT_OWNER') {
            return res.status(403).json({ message: "Only Product Owner can delete items" });
        }

        if (confirm !== 'yes') {
            return res.status(400).json({ message: "Deletion requires confirmation. Add ?confirm=yes" });
        }

        await BacklogItem.logChange(itemId, req.user.id, 'DELETE', null, null, null);
        await BacklogItem.softDelete(itemId);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting item", error: err.message });
    }
};

// Acceptance Criteria
exports.getAcceptanceCriteria = async (req, res) => {
    try {
        const [criteria] = await BacklogItem.getAcceptanceCriteria(req.params.id);
        res.json(criteria);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving criteria", error: err.message });
    }
};

exports.addAcceptanceCriterion = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ message: "Description required" });

        await BacklogItem.addAcceptanceCriterion({
            backlog_item_id: req.params.id,
            description
        });
        res.status(201).json({ message: "Criterion added" });
    } catch (err) {
        res.status(500).json({ message: "Error adding criterion", error: err.message });
    }
};

exports.updateAcceptanceCriterion = async (req, res) => {
    try {
        const { description, is_completed } = req.body;
        const updates = {};
        if (description !== undefined) updates.description = description;
        if (is_completed !== undefined) updates.is_completed = is_completed;

        await BacklogItem.updateAcceptanceCriterion(req.params.criterionId, updates);
        res.json({ message: "Criterion updated" });
    } catch (err) {
        res.status(500).json({ message: "Error updating criterion", error: err.message });
    }
};

exports.deleteAcceptanceCriterion = async (req, res) => {
    try {
        await BacklogItem.deleteAcceptanceCriterion(req.params.criterionId);
        res.json({ message: "Criterion deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting criterion", error: err.message });
    }
};

// Attachments
exports.getAttachments = async (req, res) => {
    try {
        const [attachments] = await BacklogItem.getAttachments(req.params.id);
        res.json(attachments);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving attachments", error: err.message });
    }
};

exports.uploadAttachment = async (req, res) => {
    try {
        // Placeholder for file upload logic
        // Assume req.file from multer
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file uploaded" });

        await BacklogItem.addAttachment({
            backlog_item_id: req.params.id,
            filename: file.filename,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path,
            uploaded_by: req.user.id
        });
        res.status(201).json({ message: "Attachment uploaded" });
    } catch (err) {
        res.status(500).json({ message: "Error uploading attachment", error: err.message });
    }
};

exports.deleteAttachment = async (req, res) => {
    try {
        await BacklogItem.deleteAttachment(req.params.attachmentId);
        res.json({ message: "Attachment deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting attachment", error: err.message });
    }
};

// History
exports.getHistory = async (req, res) => {
    try {
        const [history] = await BacklogItem.getHistory(req.params.id);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving history", error: err.message });
    }
};

// Reordering
exports.reorderBacklogItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPosition } = req.body;

        const [items] = await BacklogItem.findById(id);
        if (items.length === 0) return res.status(404).json({ message: "Item not found" });
        const item = items[0];

        // Check if Product Owner
        const [member] = await BacklogItem.isMember(item.project_id, req.user.id);
        if (member.length === 0 || member[0].role !== 'PRODUCT_OWNER') {
            return res.status(403).json({ message: "Only Product Owner can reorder items" });
        }

        if (item.sprint_id) {
            return res.status(400).json({ message: "Cannot reorder items assigned to sprints" });
        }

        await BacklogItem.reorderBacklog(item.project_id, id, newPosition);
        res.json({ message: "Item reordered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error reordering item", error: err.message });
    }
};

exports.reorderBacklogItems = async (req, res) => {
    console.log('Reorder endpoint called', req.body);
    try {
        const { projectId, itemIds } = req.body;

        if (!projectId || !itemIds || !Array.isArray(itemIds)) {
            return res.status(400).json({ message: "projectId and itemIds array are required" });
        }

        // Temporarily skip auth for testing
        console.log('Skipping auth check for testing');

        // Get all items for the project
        const [items] = await BacklogItem.findAllByProject(projectId);
        console.log('Project ID:', projectId);
        console.log('Found items count:', items.length);
        console.log('Item IDs in DB:', items.map(item => item.id));
        const projectItemIds = items.map(item => item.id);

        // Validate that all requested itemIds exist in the project
        const invalidIds = itemIds.filter(id => !projectItemIds.includes(id));
        console.log('Requested item IDs:', itemIds);
        console.log('Project item IDs:', projectItemIds);
        console.log('Invalid IDs:', invalidIds);

        // For debugging, if no items found, return info about what was found
        if (items.length === 0) {
            return res.status(404).json({
                message: "No items found for this project",
                projectId,
                itemCount: 0
            });
        }

        if (invalidIds.length > 0) {
            return res.status(404).json({
                message: `Items not found: ${invalidIds.join(', ')}`,
                foundItems: projectItemIds,
                requestedItems: itemIds
            });
        }

        // Allow reordering all items, including those assigned to sprints
        const requestedItems = items.filter(item => itemIds.includes(item.id));

        // Update positions in bulk
        const updatePromises = itemIds.map((itemId, index) =>
            db.query("UPDATE backlog_items SET position = ? WHERE id = ? AND project_id = ?",
                    [index + 1, itemId, projectId])
        );

        await Promise.all(updatePromises);

        res.json({ message: "Backlog items reordered successfully" });
    } catch (err) {
        console.error('Reorder error:', err);
        res.status(500).json({ message: "Error reordering items", error: err.message });
    }
};
