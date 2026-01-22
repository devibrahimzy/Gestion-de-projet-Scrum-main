const Project = require("../models/project.model");
const { v4: uuid } = require("uuid");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../config/database");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateInvitationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const sendInvitationEmail = async (email, invitationCode, projectName, role) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Project Invitation - ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You have been invited to join a project!</h2>
        <p>You have been invited to join <strong>${projectName}</strong> as <strong>${role.replace('_', ' ')}</strong>.</p>

        <div style="margin: 30px 0; text-align: center;">
          <p style="font-size: 18px; margin-bottom: 10px;">Your invitation code:</p>
          <div style="background-color: #f3f4f6; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 4px; border-radius: 8px;">
            ${invitationCode}
          </div>
        </div>

        <p><strong>Please note:</strong> This invitation will expire in 7 days.</p>
        <p>Enter this code on your dashboard to accept the invitation.</p>

        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
    text: `You have been invited to join ${projectName} as ${role.replace('_', ' ')}.

Your invitation code: ${invitationCode}

Enter this code on your dashboard to accept the invitation.
This invitation will expire in 7 days.`,
  };
  await transporter.sendMail(mailOptions);
};


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



exports.archiveProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        const allowed = await isScrumMaster(projectId, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can archive this project" });
        }

        const [rows] = await Project.findById(projectId);
        if (rows.length === 0) return res.status(404).json({ message: "Project not found" });

        const current = rows[0];
        if (current.status === 'ARCHIVED') {
            return res.status(400).json({ message: "Project is already archived" });
        }

        await Project.update(projectId, { status: 'ARCHIVED' }, req.user.id);
        await Project.logChange(projectId, req.user.id, 'ARCHIVE', 'status', current.status, 'ARCHIVED');

        res.json({ message: "Project archived successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error archiving project", error: err.message });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { confirm } = req.query;

        const allowed = await isScrumMaster(projectId, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can delete this project" });
        }

        if (confirm === 'hard') {
            await Project.hardDelete(projectId);
            res.json({ message: "Project permanently deleted" });
        } else {
            await Project.softDelete(projectId);
            await Project.logChange(projectId, req.user.id, 'ARCHIVE', null, null, null);
            res.json({ message: "Project archived successfully" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error deleting project", error: err.message });
    }
};

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

exports.updateMemberRole = async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;

        const allowed = await isScrumMaster(projectId, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can update member roles" });
        }

        const validRoles = ['PRODUCT_OWNER', 'SCRUM_MASTER', 'TEAM_MEMBER'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        await Project.updateMemberRole(projectId, userId, role);
        res.json({ message: "Member role updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating member role", error: err.message });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const allowed = await isScrumMaster(req.params.id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can remove members" });
        }

        await Project.removeMember(req.params.id, req.params.userId);
        await Project.reassignTasks(req.params.userId);
        res.json({ message: "Member removed and tasks reassigned to backlog" });
    } catch (err) {
        res.status(500).json({ message: "Error removing member", error: err.message });
    }
};

exports.inviteMember = async (req, res) => {
    try {
        const { project_id, email, role } = req.body;

        const allowed = await isScrumMaster(project_id, req.user.id);
        if (!allowed) {
            return res.status(403).json({ message: "Only Scrum Master can invite members" });
        }

        const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length === 0) {
            return res.status(400).json({ message: "User with this email does not exist" });
        }

        const userId = existingUser[0].id;

        const [member] = await Project.getMembers(project_id);
        if (member.some(m => m.id === userId)) {
            return res.status(400).json({ message: "User is already a member of this project" });
        }

        // Check if there's already a pending invitation for this email and project
        const [existingInvitation] = await db.query(
            "SELECT id FROM project_invitations WHERE project_id = ? AND email = ? AND status = 'PENDING'",
            [project_id, email]
        );
        if (existingInvitation.length > 0) {
            return res.status(400).json({ message: "An invitation has already been sent to this email for this project" });
        }

        const invitationCode = generateInvitationCode();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const [projectRows] = await Project.findById(project_id);
        const projectName = projectRows.length > 0 ? projectRows[0].name : 'Project';

        await Project.inviteMember({
            id: uuid(),
            project_id,
            email,
            role: role || 'TEAM_MEMBER',
            invited_by: req.user.id,
            invitation_code: invitationCode,
            expires_at: expiresAt
        });

        try {
            await sendInvitationEmail(email, invitationCode, projectName, role);
        } catch (error) {
            console.error('Error sending invitation email:', error);
        }

        res.status(201).json({ message: "Invitation sent", invitationCode });
    } catch (err) {
        res.status(500).json({ message: "Error sending invitation", error: err.message });
    }
};

exports.acceptInvitation = async (req, res) => {
    try {
        const { code } = req.body;

        const [invitations] = await Project.getInvitationByCode(code);
        if (invitations.length === 0) {
            return res.status(400).json({ message: "Invalid or expired invitation code" });
        }

        const invitation = invitations[0];

        await Project.addMember({
            id: uuid(),
            project_id: invitation.project_id,
            user_id: req.user.id,
            role: invitation.role
        });

        await Project.updateInvitationStatus(invitation.id, 'ACCEPTED');

        res.json({ message: "Invitation accepted, you are now a member of the project" });
    } catch (err) {
        res.status(500).json({ message: "Error accepting invitation", error: err.message });
    }
};

exports.refuseInvitation = async (req, res) => {
    try {
        const { code } = req.body;

        const [invitations] = await Project.getInvitationByCode(code);
        if (invitations.length === 0) {
            return res.status(400).json({ message: "Invalid or expired invitation code" });
        }

        await Project.updateInvitationStatus(invitations[0].id, 'REFUSED');

        res.json({ message: "Invitation refused" });
    } catch (err) {
        res.status(500).json({ message: "Error refusing invitation", error: err.message });
    }
};

exports.getProjectDashboard = async (req, res) => {
    try {
        const projectId = req.params.id;

        const [members] = await Project.getMembers(projectId);
        const isMember = members.some(m => m.id === req.user.id);
        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const [sprints] = await db.query(
            "SELECT * FROM sprints WHERE project_id = ? AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1",
            [projectId]
        );
        const currentSprint = sprints[0] || null;

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
            average_velocity: 0
        };

        const activeMembers = members;

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
