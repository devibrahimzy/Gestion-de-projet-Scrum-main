const Project = require("../models/project.model");
const { v4: uuid } = require("uuid");


const isScrumMaster = async (projectId, userId) => {
    const [rows] = await Project.isScrumMaster(projectId, userId);
    return rows.length > 0;
};

exports.getAllProjects = async (req, res) => {
    try {
        const [projects] = await Project.findAll();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving projects", error: err.message });
    }
};
exports.getMyProjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, sort } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (sort) filters.sort = sort;

        const [projects] = await Project.findProjectsByUser(userId, filters);

        // Parse objectives back to array
        const parsedProjects = projects.map(p => ({
            ...p,
            objectives: p.objectives ? JSON.parse(p.objectives) : []
        }));

        res.json(parsedProjects);
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving user projects",
            error: err.message
        });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const [rows] = await Project.findById(req.params.id);
        if (rows.length === 0) return res.status(404).json({ message: "Project not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving project", error: err.message });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, description, objectives, methodology, sprint_duration, start_date } = req.body;

        // Validation
        if (!name || name.length < 3 || name.length > 100) {
            return res.status(400).json({ message: "Project name is required (3-100 characters)" });
        }
        if (!description || description.length > 1000) {
            return res.status(400).json({ message: "Description is required (max 1000 characters)" });
        }
        if (!objectives || !Array.isArray(objectives) || objectives.length < 3) {
            return res.status(400).json({ message: "At least 3 main objectives are required" });
        }
        if (methodology && !['SCRUM', 'KANBAN'].includes(methodology)) {
            return res.status(400).json({ message: "Methodology must be SCRUM or KANBAN" });
        }
        if (sprint_duration && ![1, 2, 3, 4].includes(sprint_duration)) {
            return res.status(400).json({ message: "Sprint duration must be 1, 2, 3, or 4 weeks" });
        }

        const projectId = uuid();
        const userId = req.user.id;

        const newProject = {
            id: projectId,
            name,
            description,
            objectives: JSON.stringify(objectives),
            methodology: methodology || 'SCRUM',
            sprint_duration: sprint_duration || 2,
            start_date,
            created_by: userId
        };

        await Project.create(newProject);

        // ➜ créateur = SCRUM_MASTER
        await Project.addMember({
            id: uuid(),
            project_id: projectId,
            user_id: userId,
            role: "SCRUM_MASTER"
        });

        res.status(201).json({
            message: "Project created",
            project: { ...newProject, objectives }
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating project", error: err.message });
    }
};


exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, objectives, methodology, sprint_duration, start_date, end_date, status, isActive } = req.body;

        const allowed = await isScrumMaster(id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can update project" });
        }

        const [rows] = await Project.findById(id);
        if (rows.length === 0) return res.status(404).json({ message: "Project not found" });

        const current = rows[0];

        // Validation
        if (name && (name.length < 3 || name.length > 100)) {
            return res.status(400).json({ message: "Project name must be 3-100 characters" });
        }
        if (description && description.length > 1000) {
            return res.status(400).json({ message: "Description max 1000 characters" });
        }
        if (objectives && (!Array.isArray(objectives) || objectives.length < 3)) {
            return res.status(400).json({ message: "At least 3 objectives required" });
        }
        if (methodology && !['SCRUM', 'KANBAN'].includes(methodology)) {
            return res.status(400).json({ message: "Methodology must be SCRUM or KANBAN" });
        }
        if (sprint_duration && ![1, 2, 3, 4].includes(sprint_duration)) {
            return res.status(400).json({ message: "Sprint duration must be 1, 2, 3, or 4 weeks" });
        }

        // Validate Status if provided
        let finalStatus = status || current.status;
        const validStatuses = ['PLANNING', 'ACTIVE', 'COMPLETED'];

        if (status === 'IN_PROGRESS') finalStatus = 'ACTIVE';
        else if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status value",
                allowed: validStatuses
            });
        }

        const updatedProject = {
            name: name ?? current.name,
            description: description ?? current.description,
            objectives: objectives ? JSON.stringify(objectives) : current.objectives,
            methodology: methodology ?? current.methodology,
            sprint_duration: sprint_duration ?? current.sprint_duration,
            start_date: start_date ?? current.start_date,
            end_date: end_date ?? current.end_date,
            status: finalStatus,
            isActive: isActive ?? current.isActive
        };

        // Log changes
        const fieldsToCheck = ['name', 'description', 'objectives', 'methodology', 'sprint_duration', 'start_date', 'end_date', 'status', 'isActive'];
        for (const field of fieldsToCheck) {
            if (updatedProject[field] !== current[field]) {
                await Project.logChange(id, req.user.id, 'UPDATE', field, current[field], updatedProject[field]);
            }
        }

        await Project.update(id, updatedProject, req.user.id);

        res.json({ message: "Project updated successfully", project: { ...updatedProject, objectives: objectives || (current.objectives ? JSON.parse(current.objectives) : []) } });
    } catch (err) {
        res.status(500).json({ message: "Error updating project", error: err.message });
    }
};



exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { confirm } = req.query;

        // Vérifie si l'utilisateur est Scrum Master
        const allowed = await isScrumMaster(projectId, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can delete this project" });
        }

        if (confirm === 'hard') {
            // Hard delete - requires double confirmation
            await Project.hardDelete(projectId);
            res.json({ message: "Project permanently deleted" });
        } else {
            // Soft delete (archive)
            await Project.softDelete(projectId);
            await Project.logChange(projectId, req.user.id, 'ARCHIVE', null, null, null);
            res.json({ message: "Project archived successfully" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error deleting project", error: err.message });
    }
};

// Member Management
exports.addMember = async (req, res) => {
    try {
        const { project_id, user_id, role } = req.body;

        const allowed = await isScrumMaster(project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can add members" });
        }

        const newMember = {
            id: uuid(),
            project_id,
            user_id,
            role: role || "TEAM_MEMBER"
        };

        await Project.addMember(newMember);
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ message: "Error adding member", error: err.message });
    }
};


exports.getProjectMembers = async (req, res) => {
    try {
        const [members] = await Project.getMembers(req.params.id);
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: "Error retrieving members", error: err.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const allowed = await isScrumMaster(req.params.id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can remove members" });
        }

        await Project.removeMember(req.params.id, req.params.userId);
        res.json({ message: "Member removed" });
    } catch (err) {
        res.status(500).json({ message: "Error removing member", error: err.message });
    }
};

exports.getProjectDashboard = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Check if user is member
        const [members] = await Project.getMembers(projectId);
        const isMember = members.some(m => m.id === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Current sprint
        const [sprints] = await db.query(
            "SELECT * FROM sprints WHERE project_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1",
            [projectId]
        );
        const currentSprint = sprints[0] || null;

        // Metrics
        const [taskStats] = await db.query(`
            SELECT
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status != 'DONE' AND due_date < CURDATE() THEN 1 ELSE 0 END) as overdue_tasks
            FROM backlog_items
            WHERE project_id = ?
        `, [projectId]);

        const metrics = {
            total_tasks: taskStats[0].total_tasks,
            completed_tasks: taskStats[0].completed_tasks,
            overdue_tasks: taskStats[0].overdue_tasks,
            average_velocity: 0 // Placeholder
        };

        // Active members
        const activeMembers = members;

        // Upcoming deadlines (next 7 days)
        const [deadlines] = await db.query(`
            SELECT title, due_date FROM backlog_items
            WHERE project_id = ? AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY due_date
        `, [projectId]);

        res.json({
            current_sprint: currentSprint,
            metrics,
            active_members: activeMembers,
            upcoming_deadlines: deadlines
        });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving dashboard", error: err.message });
    }
};
