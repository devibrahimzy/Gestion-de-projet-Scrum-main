const Dashboard = require("../models/dashboard.model");
const Project = require("../models/project.model");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

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
        const [[currentSprint]] = await Dashboard.getCurrentSprint(projectId);
        const [memberWorkload] = await Dashboard.getMemberWorkload(projectId);
        const [velocityHistory] = await Dashboard.getVelocityHistory(projectId);
        const [[velocityComparison]] = await Dashboard.getVelocityComparison(projectId);
        const [[agileMetrics]] = await Dashboard.getAgileMetrics(projectId);
        const [sprints] = await Dashboard.getSprintOverview(projectId);

        res.json({
            summary: mainMetrics,
            currentSprint: currentSprint || null,
            workload: memberWorkload,
            velocity: velocityHistory,
            velocityComparison: velocityComparison || { avg_velocity: 0, current_velocity: 0 },
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

exports.generateProjectReport = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Check access
        const [members] = await Project.getMembers(projectId);
        const isMember = members.some(m => m.id === req.user.id);
        if (!isMember) return res.status(403).json({ message: "Unauthorized" });

        // Gather data
        const [[mainMetrics]] = await Dashboard.getMainMetrics(projectId);
        const [velocityHistory] = await Dashboard.getVelocityHistory(projectId);
        const [[agileMetrics]] = await Dashboard.getAgileMetrics(projectId);
        const [sprints] = await Dashboard.getSprintOverview(projectId);

        const report = {
            project_id: projectId,
            generated_at: new Date().toISOString(),
            summary: {
                total_tasks: mainMetrics.total_items,
                completed_tasks: mainMetrics.completed_items,
                total_story_points: mainMetrics.total_story_points,
                completed_story_points: mainMetrics.completed_story_points,
                progress_percentage: mainMetrics.total_story_points > 0 ?
                    Math.round((mainMetrics.completed_story_points / mainMetrics.total_story_points) * 100) : 0
            },
            velocity_history: velocityHistory,
            agile_metrics: agileMetrics,
            sprint_overview: sprints
        };

        res.json(report);
    } catch (err) {
        res.status(500).json({ message: "Error generating report", error: err.message });
    }
};

exports.getBurndownData = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [burndownData] = await Dashboard.getBurndownData(projectId);
        res.json(burndownData);
    } catch (err) {
        res.status(500).json({ message: "Error fetching burndown data", error: err.message });
    }
};

exports.getHealthIndicators = async (req, res) => {
    try {
        const { projectId } = req.params;
        const [[indicators]] = await Dashboard.getHealthIndicators(projectId);
        res.json(indicators);
    } catch (err) {
        res.status(500).json({ message: "Error fetching health indicators", error: err.message });
    }
};

exports.exportBacklogCSV = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Check access
        const [members] = await Project.getMembers(projectId);
        const isMember = members.some(m => m.id === req.user.id);
        if (!isMember) return res.status(403).json({ message: "Unauthorized" });

        const db = require("../config/database");
        const [rows] = await db.query(`
            SELECT
                bi.id,
                bi.title,
                bi.description,
                bi.type,
                bi.priority,
                bi.story_points,
                bi.status,
                bi.tags,
                bi.due_date,
                bi.is_blocked,
                u.first_name as assigned_first_name,
                u.last_name as assigned_last_name,
                bi.created_at
            FROM backlog_items bi
            LEFT JOIN users u ON bi.assigned_to_id = u.id
            WHERE bi.project_id = ? AND bi.isActive = 1
            ORDER BY bi.created_at DESC
        `, [projectId]);

        if (rows.length === 0) return res.status(404).json({ message: "No data to export" });

        const csvWriter = createCsvWriter({
            path: 'temp.csv',
            header: [
                {id: 'id', title: 'ID'},
                {id: 'title', title: 'Title'},
                {id: 'description', title: 'Description'},
                {id: 'type', title: 'Type'},
                {id: 'priority', title: 'Priority'},
                {id: 'story_points', title: 'Story Points'},
                {id: 'status', title: 'Status'},
                {id: 'tags', title: 'Tags'},
                {id: 'due_date', title: 'Due Date'},
                {id: 'is_blocked', title: 'Is Blocked'},
                {id: 'assigned_first_name', title: 'Assigned First Name'},
                {id: 'assigned_last_name', title: 'Assigned Last Name'},
                {id: 'created_at', title: 'Created At'}
            ]
        });

        await csvWriter.writeRecords(rows);
        const fs = require('fs');
        const csv = fs.readFileSync('temp.csv');
        fs.unlinkSync('temp.csv');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=backlog-${projectId}.csv`);
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: "Error exporting CSV", error: err.message });
    }
};
