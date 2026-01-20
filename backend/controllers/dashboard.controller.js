const Dashboard = require("../models/dashboard.model");
const Project = require("../models/project.model");

exports.getProjectDashboard = async (req, res) => {
    try {
        const { projectId } = req.params;
        console.log(`DEBUG Dashboard: Checking access for project ${projectId}, user ${req.user.id}`);

        // Check if project exists and user is a member
        const [members] = await Project.getMembers(projectId);
        const isMember = members.some(m => m.id === req.user.id);

        if (!isMember) {
            console.log(`DEBUG Dashboard: Access denied. ID found in DB:`, members.map(m => m.id));
            return res.status(403).json({ message: "Unauthorized: You are not a member of this project" });
        }

        const [[mainMetrics]] = await Dashboard.getMainMetrics(projectId);
        const [memberWorkload] = await Dashboard.getMemberWorkload(projectId);
        const [velocityHistory] = await Dashboard.getVelocityHistory(projectId);
        const [[agileMetrics]] = await Dashboard.getAgileMetrics(projectId);
        const [sprints] = await Dashboard.getSprintOverview(projectId);

        res.json({
            summary: mainMetrics,
            workload: memberWorkload,
            velocity: velocityHistory,
            agile: agileMetrics,
            sprints: sprints
        });
    } catch (err) {
        res.status(500).json({ message: "Error generating dashboard", error: err.message });
    }
};

exports.getVelocityData = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [rows] = await Dashboard.getVelocityHistory(projectId);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching velocity data", error: err.message });
    }
};

exports.getAgilePerformance = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [rows] = await Dashboard.getAgileMetrics(projectId);
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ message: "Error fetching agile performance", error: err.message });
    }
};
