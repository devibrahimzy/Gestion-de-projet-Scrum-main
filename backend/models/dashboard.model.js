const db = require("../config/database");

exports.getMainMetrics = (projectId) => {
    return db.query(
        `SELECT 
            COUNT(*) as total_items,
            SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as completed_items,
            SUM(story_points) as total_story_points,
            SUM(CASE WHEN status = 'DONE' THEN story_points ELSE 0 END) as completed_story_points
         FROM backlog_items 
         WHERE project_id = ? AND isActive = 1`,
        [projectId]
    );
};

exports.getMemberWorkload = (projectId) => {
    return db.query(
        `SELECT 
            u.first_name, u.last_name,
            COUNT(bi.id) as task_count,
            SUM(CASE WHEN bi.status = 'DONE' THEN 1 ELSE 0 END) as completed_count
         FROM users u
         JOIN project_members pm ON u.id = pm.user_id
         LEFT JOIN backlog_items bi ON u.id = bi.assigned_to_id AND bi.project_id = ? AND bi.isActive = 1
         WHERE pm.project_id = ?
         GROUP BY u.id`,
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
