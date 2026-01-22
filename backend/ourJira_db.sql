-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 17, 2026 at 02:24 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ourJira_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `backlog_items`
--

CREATE TABLE `backlog_items` (
  `id` char(36) NOT NULL,
  `project_id` char(36) DEFAULT NULL,
  `sprint_id` char(36) DEFAULT NULL,
  `title` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('USER_STORY','BUG','TECHNICAL_TASK','IMPROVEMENT') DEFAULT 'USER_STORY',
  `story_points` int(11) DEFAULT 0,
  `priority` enum('CRITICAL','HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
  `tags` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `is_blocked` tinyint(1) DEFAULT 0,
  `status` enum('BACKLOG','TODO','IN_PROGRESS','DONE') DEFAULT 'BACKLOG',
  `position` int(11) NOT NULL DEFAULT 0,
  `assigned_to_id` char(36) DEFAULT NULL,
  `created_by_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `backlog_item_comments`
--

CREATE TABLE `backlog_item_comments` (
  `id` char(36) NOT NULL,
  `backlog_item_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `backlog_acceptance_criteria`
--

CREATE TABLE `backlog_acceptance_criteria` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `backlog_item_id` char(36) NOT NULL,
  `description` text NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `backlog_acceptance_criteria`
--

--
-- Constraints for table `backlog_acceptance_criteria`
--
ALTER TABLE `backlog_acceptance_criteria`
  ADD CONSTRAINT `fk_criteria_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `backlog_attachments`
--

CREATE TABLE `backlog_attachments` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `backlog_item_id` char(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size` int(11) NOT NULL,
  `path` varchar(500) NOT NULL,
  `uploaded_by` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `backlog_attachments`
--
ALTER TABLE `backlog_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attachment_backlog` (`backlog_item_id`),
  ADD KEY `fk_attachment_user` (`uploaded_by`);

--
-- Constraints for table `backlog_attachments`
--
ALTER TABLE `backlog_attachments`
  ADD CONSTRAINT `fk_attachment_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attachment_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `kanban_columns`
--

CREATE TABLE `kanban_columns` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `project_id` char(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `wip_limit` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `kanban_columns`
--
ALTER TABLE `kanban_columns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_kanban_project` (`project_id`);

--
-- Constraints for table `kanban_columns`
--
ALTER TABLE `kanban_columns`
  ADD CONSTRAINT `fk_kanban_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `burndown_data`
--

CREATE TABLE `burndown_data` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `sprint_id` char(36) NOT NULL,
  `date` date NOT NULL,
  `remaining_story_points` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `burndown_data`
--
ALTER TABLE `burndown_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_burndown` (`sprint_id`,`date`),
  ADD KEY `fk_burndown_sprint` (`sprint_id`);

--
-- Constraints for table `burndown_data`
--
ALTER TABLE `burndown_data`
  ADD CONSTRAINT `fk_burndown_sprint` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `backlog_history`
--

CREATE TABLE `backlog_history` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `backlog_item_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `field_changed` varchar(100) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `backlog_history`
--
ALTER TABLE `backlog_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_history_backlog` (`backlog_item_id`),
  ADD KEY `fk_history_user` (`user_id`);

--
-- Constraints for table `backlog_history`
--
ALTER TABLE `backlog_history`
  ADD CONSTRAINT `fk_history_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `project_invitations`
--

CREATE TABLE `project_invitations` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `project_id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('PRODUCT_OWNER','SCRUM_MASTER','TEAM_MEMBER') NOT NULL DEFAULT 'TEAM_MEMBER',
  `invited_by` char(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `status` enum('PENDING','ACCEPTED','REFUSED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `project_invitations`
--
ALTER TABLE `project_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_invitation` (`project_id`,`email`),
  ADD KEY `fk_invitation_project` (`project_id`),
  ADD KEY `fk_invitation_user` (`invited_by`);

--
-- Constraints for table `project_invitations`
--
ALTER TABLE `project_invitations`
  ADD CONSTRAINT `fk_invitation_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invitation_user` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `project_audit`
--

CREATE TABLE `project_audit` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `project_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `field_changed` varchar(100) DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `project_audit`
--
ALTER TABLE `project_audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_project` (`project_id`),
  ADD KEY `fk_audit_user` (`user_id`);

--
-- Constraints for table `project_audit`
--
ALTER TABLE `project_audit`
  ADD CONSTRAINT `fk_audit_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` char(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('PLANNING','ACTIVE','COMPLETED') DEFAULT 'PLANNING',
  `methodology` enum('SCRUM','KANBAN') DEFAULT 'SCRUM',
  `sprint_duration` int(11) DEFAULT 2,
  `objectives` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1,
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `id` char(36) NOT NULL,
  `project_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `role` enum('PRODUCT_OWNER','SCRUM_MASTER','TEAM_MEMBER') NOT NULL,
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retrospectives`
--

CREATE TABLE `retrospectives` (
  `id` char(36) NOT NULL,
  `sprint_id` char(36) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED') DEFAULT 'DRAFT',
  `facilitator_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `retro_items`
--

CREATE TABLE `retro_items` (
  `id` char(36) NOT NULL,
  `retrospective_id` char(36) DEFAULT NULL,
  `category` enum('POSITIVE','IMPROVE','ACTION') DEFAULT 'IMPROVE',
  `text` text DEFAULT NULL,
  `votes` int(11) DEFAULT 0,
  `author_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_completed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sprints`
--

CREATE TABLE `sprints` (
  `id` char(36) NOT NULL,
  `project_id` char(36) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('PLANNING','ACTIVE','COMPLETED') DEFAULT 'PLANNING',
  `objective` text DEFAULT NULL,
  `planned_velocity` int(11) DEFAULT 0,
  `actual_velocity` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),

  -- Basic identity
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,

  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,

  -- Address
  `address_line` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,

  -- Role & status
  `role` ENUM('ADMIN','PRODUCT_OWNER','SCRUM_MASTER','TEAM_MEMBER')
    NOT NULL DEFAULT 'TEAM_MEMBER',

  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,

  -- Verification (reduced)
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `verification_code` VARCHAR(10) DEFAULT NULL,

  -- Password reset
  `reset_token` VARCHAR(255) DEFAULT NULL,
  `reset_token_expires` TIMESTAMP NULL DEFAULT NULL,

  -- Account locking
  `failed_attempts` INT DEFAULT 0,
  `lock_until` TIMESTAMP NULL DEFAULT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `backlog_items`
--
ALTER TABLE `backlog_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_backlog_project` (`project_id`),
  ADD KEY `fk_backlog_assigned` (`assigned_to_id`);

--
-- Indexes for table `backlog_item_comments`
--
ALTER TABLE `backlog_item_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comment_backlog` (`backlog_item_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_member` (`project_id`,`user_id`);

--
-- Indexes for table `retrospectives`
--
ALTER TABLE `retrospectives`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `retro_items`
--
ALTER TABLE `retro_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sprints`
--
ALTER TABLE `sprints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sprint_project` (`project_id`);



--
-- Constraints for dumped tables
--

--
-- Constraints for table `backlog_items`
--
ALTER TABLE `backlog_items`
  ADD CONSTRAINT `fk_backlog_assigned` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_backlog_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `backlog_item_comments`
--
ALTER TABLE `backlog_item_comments`
  ADD CONSTRAINT `fk_comment_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sprints`
--
ALTER TABLE `sprints`
  ADD CONSTRAINT `fk_sprint_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);
COMMIT;

-- Add columns for account locking
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `failed_attempts` int(11) DEFAULT 0,
ADD COLUMN IF NOT EXISTS `lock_until` datetime DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `profile_photo` varchar(255) DEFAULT NULL;

-- Add columns for project details
ALTER TABLE `projects` ADD COLUMN IF NOT EXISTS `methodology` enum('SCRUM','KANBAN') DEFAULT 'SCRUM',
ADD COLUMN IF NOT EXISTS `sprint_duration` int(11) DEFAULT 2,
ADD COLUMN IF NOT EXISTS `objectives` text DEFAULT NULL;

-- Add objective to sprints
ALTER TABLE `sprints` ADD COLUMN IF NOT EXISTS `objective` text DEFAULT NULL;

-- Insert default Kanban columns for existing projects
INSERT IGNORE INTO kanban_columns (id, project_id, name, position, wip_limit)
SELECT uuid(), p.id, 'To-Do', 1, NULL FROM projects p
UNION ALL
SELECT uuid(), p.id, 'In Progress', 2, NULL FROM projects p
UNION ALL
SELECT uuid(), p.id, 'Done', 3, NULL FROM projects p;

-- Update backlog_items for enhanced features
ALTER TABLE `backlog_items` MODIFY COLUMN `type` enum('USER_STORY','BUG','TECHNICAL_TASK','IMPROVEMENT') DEFAULT 'USER_STORY';
ALTER TABLE `backlog_items` MODIFY COLUMN `priority` enum('CRITICAL','HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM';
ALTER TABLE `backlog_items` ADD COLUMN IF NOT EXISTS `tags` text DEFAULT NULL;
ALTER TABLE `backlog_items` ADD COLUMN IF NOT EXISTS `due_date` date DEFAULT NULL;
ALTER TABLE `backlog_items` ADD COLUMN IF NOT EXISTS `is_blocked` tinyint(1) DEFAULT 0;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;