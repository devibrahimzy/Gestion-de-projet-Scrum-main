-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 16, 2026 at 03:17 AM
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
  `type` enum('USER_STORY','BUG','TASK','SPIKE') DEFAULT 'USER_STORY',
  `story_points` int(11) DEFAULT 0,
  `priority` int(11) DEFAULT 0,
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

--
-- Dumping data for table `backlog_items`
--

INSERT INTO `backlog_items` (`id`, `project_id`, `sprint_id`, `title`, `description`, `type`, `story_points`, `priority`, `status`, `position`, `assigned_to_id`, `created_by_id`, `created_at`, `updated_at`, `isActive`, `started_at`, `completed_at`) VALUES
('0350de16-e275-41a9-b1b0-c2e7b782ea09', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', 'c555881b-ba86-4b77-9086-61ee6991982f', 'En tant que user je peux creer un sprint', 'Formulaire de sprint', 'USER_STORY', 5, 3, 'TODO', 0, NULL, '55e350e5-9252-46d9-87c6-56fd183408ad', '2026-01-15 21:02:46', '2026-01-15 21:07:44', 1, NULL, NULL),
('16ebaaf4-1c7b-48ed-b7e6-1e2310803e30', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', NULL, 'je voulais changer un projet', 'Formulaire de projet', 'USER_STORY', 5, 1, 'IN_PROGRESS', 0, NULL, '55e350e5-9252-46d9-87c6-56fd183408ad', '2026-01-15 16:53:57', '2026-01-15 17:10:31', 1, NULL, NULL),
('515f2b87-a72b-4e32-bb15-4b7a23f0e20b', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', '71aee8a6-61d1-46bf-b08a-bd88dfae1684', 'En tant que user je peux créer un compte', 'Formulaire d\'inscription', 'USER_STORY', 5, 3, 'DONE', 1, '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', '55e350e5-9252-46d9-87c6-56fd183408ad', '2026-01-15 14:01:30', '2026-01-16 00:05:44', 1, NULL, NULL),
('cf0dda3f-0fcb-4d07-8776-245f5d5bc021', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', NULL, 'En tant que user je peux creer un sprint', 'Formulaire de sprint', 'USER_STORY', 5, 3, 'BACKLOG', 0, NULL, '55e350e5-9252-46d9-87c6-56fd183408ad', '2026-01-15 21:03:59', '2026-01-15 21:03:59', 1, NULL, NULL),
('d739e0fb-c111-4ef8-a421-0a64af43ebfb', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', '71aee8a6-61d1-46bf-b08a-bd88dfae1684', 'En tant que user je peux suprimer un compte', 'Formulaire d\'inscription', 'USER_STORY', 5, 1, 'IN_PROGRESS', 0, '146fae23-ddf1-4a3f-a39f-d8f525602964', '55e350e5-9252-46d9-87c6-56fd183408ad', '2026-01-15 14:03:07', '2026-01-15 23:16:23', 1, NULL, NULL);

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
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` char(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('PLANNING','ACTIVE','COMPLETED') DEFAULT 'PLANNING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1,
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`, `isActive`, `created_by`) VALUES
('0ceb56d3-eefa-11f0-97cc-a0510b5e8c9c', 'OurScrum MVP', 'MVP Agile Project', '2025-01-10', '2025-03-10', 'ACTIVE', '2026-01-11 14:30:17', '2026-01-14 03:25:33', 0, NULL),
('1350cd50-5687-4b5e-af93-567b8ea7f231', 'OurScrum Platform 3', 'Agile project management tool 3', '2026-02-10', '2026-04-30', 'PLANNING', '2026-01-14 02:43:03', '2026-01-14 03:29:44', 0, NULL),
('2372e798-44a7-46c4-8249-49cec4f5dfc2', 'Finale', 'finale match', '2026-02-10', '2026-04-30', 'PLANNING', '2026-01-15 14:00:28', '2026-01-15 14:00:28', 1, '55e350e5-9252-46d9-87c6-56fd183408ad'),
('26fa95b7-60a0-4b2a-ba98-6772f60f6683', 'OurScrum Platform 4', 'Agile project management tool 4', '2026-02-10', '2026-04-30', 'COMPLETED', '2026-01-14 02:48:18', '2026-01-14 03:21:57', 1, '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c'),
('3a48051d-b25f-4e65-9eb3-8e68b888bd31', 'OurScrum Platform', 'Agile project management tool', '2026-01-10', '2026-03-30', 'PLANNING', '2026-01-14 02:27:54', '2026-01-14 02:27:54', 1, NULL),
('7525124d-4064-4114-ba6f-5791e5328c40', 'OurScrum Platform 6', 'Agile project management tool 6', '2026-02-10', '2026-04-30', 'PLANNING', '2026-01-14 23:30:40', '2026-01-14 23:30:40', 1, '4b3d65cd-0369-40f0-b18b-34d0c46c143d'),
('926b9064-c4aa-41c6-b142-0ea2b6ea4163', 'OurScrum Platform 2', 'Agile project management tool 2', '2026-02-10', '2026-04-30', 'PLANNING', '2026-01-14 02:41:38', '2026-01-14 02:41:38', 1, NULL),
('c7867adc-972c-4e4f-9811-031f3a3c7042', 'OurScrum Platform 5', 'Agile project management tool 5', '2026-02-10', '2026-04-30', 'PLANNING', '2026-01-14 02:59:27', '2026-01-14 02:59:27', 1, '4b3d65cd-0369-40f0-b18b-34d0c46c143d'),
('ea4b036b-875e-4c29-b6f3-3101aba560c4', 'CAF', 'finale match', '2026-02-10', '2026-04-30', 'PLANNING', '2026-01-15 02:51:12', '2026-01-15 02:51:12', 1, '146fae23-ddf1-4a3f-a39f-d8f525602964');

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

--
-- Dumping data for table `project_members`
--

INSERT INTO `project_members` (`id`, `project_id`, `user_id`, `role`, `joined_at`) VALUES
('0397e6e7-0742-4f40-b7c1-da0888431257', '26fa95b7-60a0-4b2a-ba98-6772f60f6683', 'e8347bd5-9aea-4592-9233-05f697c43813', 'TEAM_MEMBER', '2026-01-14 02:52:09'),
('0f4d1cfa-8ee9-46c7-8f02-f45f0ab14c87', '926b9064-c4aa-41c6-b142-0ea2b6ea4163', '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', 'SCRUM_MASTER', '2026-01-14 02:41:38'),
('1cae6897-b89f-46b6-a6dd-3753c5a26490', 'c7867adc-972c-4e4f-9811-031f3a3c7042', '4b3d65cd-0369-40f0-b18b-34d0c46c143d', 'SCRUM_MASTER', '2026-01-14 02:59:27'),
('2e5be155-72e8-47fc-b219-3c342a293c82', '26fa95b7-60a0-4b2a-ba98-6772f60f6683', '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', 'SCRUM_MASTER', '2026-01-14 02:48:18'),
('63a65d5d-fe2b-4bb5-b729-ca12ed3c09db', '7525124d-4064-4114-ba6f-5791e5328c40', '4b3d65cd-0369-40f0-b18b-34d0c46c143d', 'SCRUM_MASTER', '2026-01-14 23:30:40'),
('652a7138-0654-4d23-a60a-511d579519f7', '2372e798-44a7-46c4-8249-49cec4f5dfc2', '55e350e5-9252-46d9-87c6-56fd183408ad', 'SCRUM_MASTER', '2026-01-15 14:00:28'),
('79c1ef24-41f3-4a3a-83cb-21832d7284bd', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', '146fae23-ddf1-4a3f-a39f-d8f525602964', 'SCRUM_MASTER', '2026-01-15 02:51:12'),
('86cf182d-7362-4437-bbe3-3a9266f56e6a', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', 'TEAM_MEMBER', '2026-01-16 00:04:37'),
('ab52e522-1fd1-46f2-b6e2-63788619687b', '1350cd50-5687-4b5e-af93-567b8ea7f231', '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', 'SCRUM_MASTER', '2026-01-14 02:43:03'),
('cc8ec007-886a-4e56-b9de-e01e44cc0ee3', '3a48051d-b25f-4e65-9eb3-8e68b888bd31', '75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', 'SCRUM_MASTER', '2026-01-14 02:27:54');

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

--
-- Dumping data for table `retrospectives`
--

INSERT INTO `retrospectives` (`id`, `sprint_id`, `date`, `status`, `facilitator_id`, `created_at`, `updated_at`) VALUES
('30dfb91f-0b56-4ca0-bb9c-7e9cc2bd6d2d', '71aee8a6-61d1-46bf-b08a-bd88dfae1684', '2026-01-20', 'PUBLISHED', '146fae23-ddf1-4a3f-a39f-d8f525602964', '2026-01-15 23:54:10', '2026-01-16 00:33:04');

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

--
-- Dumping data for table `retro_items`
--

INSERT INTO `retro_items` (`id`, `retrospective_id`, `category`, `text`, `votes`, `author_id`, `created_at`, `is_completed`) VALUES
('3b78dfb7-58bf-4a37-ad88-fbccac5ec7ed', '30dfb91f-0b56-4ca0-bb9c-7e9cc2bd6d2d', 'POSITIVE', 'Super travail d\'équipe', 2, '146fae23-ddf1-4a3f-a39f-d8f525602964', '2026-01-16 00:18:02', 1);

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
  `planned_velocity` int(11) DEFAULT 0,
  `actual_velocity` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sprints`
--

INSERT INTO `sprints` (`id`, `project_id`, `name`, `start_date`, `end_date`, `status`, `planned_velocity`, `actual_velocity`, `created_at`, `updated_at`, `isActive`) VALUES
('71aee8a6-61d1-46bf-b08a-bd88dfae1684', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', 'Sprint 3', '2026-02-01', '2030-02-14', 'ACTIVE', 46, 10, '2026-01-15 15:33:50', '2026-01-15 23:53:57', 0),
('c555881b-ba86-4b77-9086-61ee6991982f', 'ea4b036b-875e-4c29-b6f3-3101aba560c4', 'Sprint 1', '2026-02-01', '2026-02-14', 'PLANNING', 30, 0, '2026-01-15 15:07:28', '2026-01-15 21:01:24', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('ADMIN','PRODUCT_OWNER','SCRUM_MASTER','TEAM_MEMBER') NOT NULL DEFAULT 'TEAM_MEMBER',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1,
  `lastLogin` datetime DEFAULT NULL,
  `resetToken` varchar(255) DEFAULT NULL,
  `resetTokenExpires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `role`, `created_at`, `updated_at`, `isActive`, `lastLogin`, `resetToken`, `resetTokenExpires`) VALUES
('146fae23-ddf1-4a3f-a39f-d8f525602964', 'bono@ourscrum.com', '$2b$10$0mOLfqBq665hRAmgbV2sXOA.jyk1C5eYmqjjZiDd7KrswN7MXQoGy', 'yassine', 'bono', 'TEAM_MEMBER', '2026-01-15 02:49:44', '2026-01-15 16:01:16', 1, NULL, NULL, NULL),
('4b3d65cd-0369-40f0-b18b-34d0c46c143d', 'test@ourscrum.com', '$2b$10$C/.MlCXoC9pIDS0o2fbME.glC.ueT9f91DiC4uZw27qd6TIN6KHCW', 'Test', 'User', 'TEAM_MEMBER', '2026-01-13 11:23:24', '2026-01-13 11:23:24', 1, NULL, NULL, NULL),
('55e350e5-9252-46d9-87c6-56fd183408ad', 'NAYEL@ourscrum.com', '$2b$10$AatRGL7HGOT25PdOOUJchuOzdzrDU07YryOiqi7UTXakhy7aK7yCK', 'NAYEL', 'EUNAOUI', 'SCRUM_MASTER', '2026-01-15 13:56:35', '2026-01-15 13:56:35', 1, NULL, NULL, NULL),
('75b246fb-cd4c-45bc-8ff1-6d6d4c65894c', 'imano@ourscrum.com', '$2b$10$ZX0q4ERaunnNmFiJUaEmkeJgoTrwaxi5mYlsp0Jq3NVrQHS7WEYIa', 'lili', 'lolo', 'SCRUM_MASTER', '2026-01-14 02:24:16', '2026-01-14 02:24:16', 1, NULL, NULL, NULL),
('e4b1eb6a-f07d-11f0-9b9e-a0510b5e8c9c', 'ichikh03@gmail.com', '$2b$10$O4sX.b.Okmr52.31qVytIOKpvX/rmMQvFLa1qTyPHKgpKO5fCRlYG', 'imane', 'chikh', 'ADMIN', '2026-01-13 19:01:48', '2026-01-13 19:01:48', 1, NULL, NULL, NULL),
('e8347bd5-9aea-4592-9233-05f697c43813', 'imane@ourscrum.com', '$2b$10$VzJEkLLntvXy5GAsaqgxeeNHvfRs7qV2acDMBK30gMmXH/nEzO/qG', 'Test', 'User', 'TEAM_MEMBER', '2026-01-13 11:24:40', '2026-01-13 19:52:35', 1, NULL, NULL, NULL);

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
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;