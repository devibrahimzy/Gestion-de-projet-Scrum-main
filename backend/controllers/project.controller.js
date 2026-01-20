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

        const [projects] = await Project.findProjectsByUser(userId);

        res.json(projects);
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
        const { name, description, start_date, end_date } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Project name is required" });
        }

        const projectId = uuid();
        const userId = req.user.id;

        const newProject = {
            id: projectId,
            name,
            description,
            start_date,
            end_date,
            status: "PLANNING",
            isActive: 1,
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
            project: newProject
        });
    } catch (err) {
        res.status(500).json({ message: "Error creating project", error: err.message });
    }
};


exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, start_date, end_date, status, isActive } = req.body;

        const allowed = await isScrumMaster(id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can update project" });
        }

        const [rows] = await Project.findById(id);
        if (rows.length === 0) return res.status(404).json({ message: "Project not found" });

        const current = rows[0];

        // Validate Status if provided
        let finalStatus = status || current.status;
        const validStatuses = ['PLANNING', 'ACTIVE', 'COMPLETED'];

        // Map common synonyms or handle invalid values
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
            start_date: start_date ?? current.start_date,
            end_date: end_date ?? current.end_date,
            status: finalStatus,
            isActive: isActive ?? current.isActive
        };

        await Project.update(id, updatedProject);

        res.json({ message: "Project updated successfully", project: updatedProject });
    } catch (err) {
        res.status(500).json({ message: "Error updating project", error: err.message });
    }
};



exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Vérifie si l'utilisateur est Scrum Master
        const allowed = await isScrumMaster(projectId, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can delete this project" });
        }

        // Soft delete
        await Project.softDelete(projectId);

        res.json({ message: "Project soft-deleted successfully" });
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
