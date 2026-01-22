const db = require("../config/database");

exports.getMainMetrics = (projectId) => {
    return db.query(
        `SELECT
            p.name as project_name,
            COUNT(bi.id) as total_items,
            SUM(CASE WHEN bi.status = 'DONE' THEN 1 ELSE 0 END) as completed_items,
            SUM(CASE WHEN bi.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_items,
            SUM(CASE WHEN bi.status = 'TO_DO' THEN 1 ELSE 0 END) as todo_items,
            SUM(CASE WHEN bi.status = 'DONE' AND bi.due_date < bi.completed_at THEN 1 ELSE 0 END) as overdue_items,
            SUM(bi.story_points) as total_story_points,
            SUM(CASE WHEN bi.status = 'DONE' THEN bi.story_points ELSE 0 END) as completed_story_points
         FROM projects p
         LEFT JOIN backlog_items bi ON p.id = bi.project_id AND bi.isActive = 1
         WHERE p.id = ?`,
        [projectId]
    );
};

exports.getMemberWorkload = (projectId) => {
    return db.query(
        `SELECT
            u.id, u.first_name, u.last_name,
            COUNT(bi.id) as assigned_tasks,
            SUM(CASE WHEN bi.status = 'DONE' THEN 1 ELSE 0 END) as completed_tasks,
            SUM(CASE WHEN bi.status != 'DONE' THEN 1 ELSE 0 END) as in_progress_tasks,
            SUM(bi.story_points) as total_story_points,
            SUM(CASE WHEN bi.status = 'DONE' THEN bi.story_points ELSE 0 END) as completed_story_points
         FROM users u
         JOIN project_members pm ON u.id = pm.user_id
         LEFT JOIN backlog_items bi ON u.id = bi.assigned_to_id AND bi.project_id = ? AND bi.isActive = 1
         WHERE pm.project_id = ?
         GROUP BY u.id, u.first_name, u.last_name`,
        [projectId, projectId]
    );
};

exports.getVelocityHistory = (projectId) => {
    return db.query(
        `SELECT name, planned_velocity, actual_velocity 
         FROM sprints 
         WHERE project_id = ? AND status = 'COMPLETED' AND isActive = 1
         ORDER BY end_date ASC 
         LIMIT 5`,
        [projectId]
    );
};

exports.getAgileMetrics = (projectId) => {
    return db.query(
        `SELECT 
            AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) as avg_lead_time_hours,
            AVG(TIMESTAMPDIFF(HOUR, started_at, completed_at)) as avg_cycle_time_hours
         FROM backlog_items 
         WHERE project_id = ? AND status = 'DONE' AND completed_at IS NOT NULL`,
        [projectId]
    );
};

exports.getCurrentSprint = (projectId) => {
    return db.query(
        `SELECT
            s.id, s.name, s.start_date, s.end_date, s.status,
            COUNT(bi.id) as total_tasks,
            SUM(CASE WHEN bi.status = 'DONE' THEN 1 ELSE 0 END) as completed_tasks,
            SUM(bi.story_points) as total_story_points,
            SUM(CASE WHEN bi.status = 'DONE' THEN bi.story_points ELSE 0 END) as completed_story_points,
            DATEDIFF(s.end_date, CURDATE()) as days_remaining
         FROM sprints s
         LEFT JOIN backlog_items bi ON s.id = bi.sprint_id AND bi.isActive = 1
         WHERE s.project_id = ? AND s.status = 'ACTIVE' AND s.isActive = 1
         GROUP BY s.id
         LIMIT 1`,
        [projectId]
    );
};

exports.getSprintOverview = (projectId) => {
    return db.query(
        `SELECT
            s.name, s.status,
            COUNT(bi.id) as total_tasks,
            SUM(CASE WHEN bi.status = 'DONE' THEN 1 ELSE 0 END) as done_tasks
         FROM sprints s
         LEFT JOIN backlog_items bi ON s.id = bi.sprint_id AND bi.isActive = 1
         WHERE s.project_id = ? AND s.isActive = 1
         GROUP BY s.id
         ORDER BY s.created_at DESC`,
        [projectId]
    );
};

exports.getBurndownData = (projectId) => {
    return db.query(
        `SELECT
            DATE(bi.completed_at) as date,
            COUNT(*) as completed_tasks,
            SUM(bi.story_points) as completed_points
         FROM backlog_items bi
         JOIN sprints s ON bi.sprint_id = s.id
         WHERE s.project_id = ? AND s.status = 'ACTIVE' AND bi.status = 'DONE' AND bi.completed_at IS NOT NULL
         GROUP BY DATE(bi.completed_at)
         ORDER BY DATE(bi.completed_at)`,
        [projectId]
    );
};

exports.getVelocityComparison = (projectId) => {
    return db.query(
        `SELECT
            AVG(actual_velocity) as avg_velocity,
            (SELECT actual_velocity FROM sprints WHERE project_id = ? AND status = 'ACTIVE' LIMIT 1) as current_velocity
         FROM sprints
         WHERE project_id = ? AND status = 'COMPLETED'`,
        [projectId, projectId]
    );
};

exports.getHealthIndicators = (projectId) => {
    return db.query(
        `SELECT
            COUNT(CASE WHEN bi.status != 'DONE' AND bi.due_date < CURDATE() THEN 1 END) as overdue_tasks,
            COUNT(CASE WHEN bi.type = 'BUG' THEN 1 END) as total_bugs,
            COUNT(CASE WHEN bi.type = 'BUG' AND bi.status = 'DONE' THEN 1 END) as resolved_bugs,
            AVG(s.actual_velocity) as avg_velocity,
            STDDEV(s.actual_velocity) as velocity_stddev
         FROM backlog_items bi
         LEFT JOIN sprints s ON s.project_id = bi.project_id AND s.status = 'COMPLETED'
         WHERE bi.project_id = ? AND bi.isActive = 1`,
        [projectId]
    );
};
