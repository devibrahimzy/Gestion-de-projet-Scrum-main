-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 22, 2026 at 08:57 AM
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
-- Database: `ourjira_db`
--

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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
-- Dumping data for table `backlog_history`
--

INSERT INTO `backlog_history` (`id`, `backlog_item_id`, `user_id`, `action`, `field_changed`, `old_value`, `new_value`, `created_at`) VALUES
('04f55cbc-e73e-44e0-b176-b5fe38454072', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'DONE', 'IN_PROGRESS', '2026-01-22 05:17:50'),
('09f31eb5-8e18-4eb0-bebb-193127c42b70', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'TODO', 'DONE', '2026-01-22 04:47:42'),
('0d84aa87-a22b-430c-a67e-2a28d96489e8', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'IN_PROGRESS', '2026-01-22 04:46:19'),
('0ef2a178-43c2-4a96-baf6-507e26cf1600', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', NULL, 'faa872ca-7533-47e4-9f6e-c29889d604ca', '2026-01-22 06:49:17'),
('1282d11f-539f-4f69-8a33-0d47b9a09d56', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'IN_PROGRESS', '2026-01-22 06:54:59'),
('12baaa70-79e5-4254-96ef-e9e618a68e12', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'priority', 'HIGH', 'CRITICAL', '2026-01-22 03:12:37'),
('13cc7af1-5687-4111-a2c2-48d3acae27f9', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 05:17:44'),
('1d65a747-28b8-4313-b1c2-f1f96b2bda24', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'IN_PROGRESS', '2026-01-22 06:54:39'),
('1d84d896-0ec8-443c-8e23-5ec8b2fa632c', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', '6402e47c-17d0-4812-ab69-eec3622ac9d8', NULL, '2026-01-22 06:48:54'),
('278ff428-cf9b-4a16-9031-cd600e78a229', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 04:46:22'),
('3592ed61-7b3b-4505-8fe1-4dd263fdf7dc', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'TODO', '2026-01-22 06:12:47'),
('3b6f0299-9dac-4afb-b923-ec4bc67919c2', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'tags', '[\"tfhfh\"]', 'tfhfh', '2026-01-22 05:48:53'),
('3c016db8-12b9-403e-a758-a76685dfde38', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 06:55:01'),
('3c3a6853-53c9-46e9-8890-3ebd3d954e07', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'IN_PROGRESS', '2026-01-22 06:55:00'),
('3d97be9a-952c-45c6-b0d9-1048e41f47b5', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'BACKLOG', 'TODO', '2026-01-22 06:50:30'),
('3e058e86-5e8d-4dc9-b4e8-d6e47577ecf2', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'due_date', '2026-01-15 00:00:00.000', '2026-01-15', '2026-01-22 05:48:53'),
('3fc539d2-e133-45dc-a8eb-da7ad93ee018', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'IN_PROGRESS', '2026-01-22 06:54:49'),
('490f62b3-d53f-48ce-8f7c-931bb1105872', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'TODO', 'IN_PROGRESS', '2026-01-22 06:50:12'),
('49199512-f247-448b-b9ab-f340665a15c4', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'TODO', 'DONE', '2026-01-22 06:54:56'),
('538027ad-61b1-4345-9067-ad313fc96d8b', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'TODO', 'DONE', '2026-01-22 06:33:27'),
('57c09c25-35bf-4636-a47f-35987709c64f', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'TODO', 'IN_PROGRESS', '2026-01-22 04:46:12'),
('57fae892-f1b4-4829-8920-627f3458f31e', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', NULL, '6402e47c-17d0-4812-ab69-eec3622ac9d8', '2026-01-22 06:49:19'),
('76edd11a-3acf-4cf6-b1b6-c389f40c4ff9', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', NULL, '8c4dd50b-dd50-405e-965e-33731ef4393a', '2026-01-22 05:17:03'),
('7c2f05ff-4a48-4753-83c2-ed1471abd508', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'BACKLOG', 'TODO', '2026-01-22 05:17:06'),
('7f489fd5-b317-4184-b061-5bebcd941bf1', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'priority', 'MEDIUM', 'HIGH', '2026-01-22 03:12:36'),
('7fee2f7b-a598-49d3-9b8d-9ce834e3bed9', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'TODO', 'DONE', '2026-01-22 06:54:58'),
('834973d1-1701-4574-9561-4ad554e742dd', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'DONE', 'TODO', '2026-01-22 06:54:55'),
('884491b6-3e1c-40d2-9fe3-06e8100f9fa4', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'TODO', '2026-01-22 06:54:47'),
('94678064-4216-4018-b17c-4ef34f623f2b', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 06:55:03'),
('9f448a4e-f54c-415d-bc52-b600dfe64924', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', '8c4dd50b-dd50-405e-965e-33731ef4393a', '6402e47c-17d0-4812-ab69-eec3622ac9d8', '2026-01-22 06:12:26'),
('a282cdea-966a-4214-82b5-e53e59c3af07', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'priority', 'CRITICAL', 'LOW', '2026-01-22 03:12:38'),
('a4020333-cdb4-4c70-9df8-b5900fe5643a', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 04:46:14'),
('a88aa781-21ed-4d86-898a-7538023f62d4', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 06:50:13'),
('aabc83b4-f04c-4796-9aee-b6307c53b615', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', NULL, '8c4dd50b-dd50-405e-965e-33731ef4393a', '2026-01-22 04:46:01'),
('ae951683-23c6-4075-8f18-1c14b911ee0f', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'BACKLOG', 'TODO', '2026-01-22 03:25:38'),
('b0464189-c294-4aa0-aecb-bb1051406dd5', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'TODO', 'IN_PROGRESS', '2026-01-22 05:17:16'),
('b1bbf69f-26a2-4e0f-ad5a-4cda486b84a2', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'DONE', '2026-01-22 06:54:50'),
('be2ac0f7-f71e-4d16-9f79-2f500820b464', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'tags', '[\"tfhfh\"]', 'tfhfh', '2026-01-22 03:25:19'),
('cc92af92-2a68-4817-8b5c-a7686f5565ac', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'due_date', NULL, '2026-01-24', '2026-01-22 03:25:19'),
('d06ea8f4-6f8a-4634-9deb-0c67f0ae8fa8', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'priority', 'HIGH', 'CRITICAL', '2026-01-22 03:24:28'),
('d1fe0b45-c96a-46db-8af9-5412a4878d9a', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'MOVED', 'status', 'IN_PROGRESS', 'TODO', '2026-01-22 05:48:22'),
('d42d2f4a-6805-4daf-970f-e3cfe42e0083', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', 'faa872ca-7533-47e4-9f6e-c29889d604ca', NULL, '2026-01-22 06:49:00'),
('d7b3268e-97e3-4b83-b608-56ed2c433444', 'ee29695b-1257-43de-a7b0-be3c5975efbd', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'TODO', 'DONE', '2026-01-22 06:50:32'),
('daff755b-ea0c-4bbb-abb0-5da84b7d7df7', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'BACKLOG', 'TODO', '2026-01-22 03:12:40'),
('edec03ba-0f3b-464f-b399-4c0f63185036', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'priority', 'HIGH', 'MEDIUM', '2026-01-22 03:12:34'),
('eef8aa43-a6ef-40b2-ac77-01055a736658', '64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'status', 'DONE', 'TODO', '2026-01-22 04:47:38'),
('fd1b927e-14c5-4e28-80a4-5086c48a4d83', '9daed639-a0d4-46d2-bedc-a9bffc2569bc', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'sprint_id', NULL, '6402e47c-17d0-4812-ab69-eec3622ac9d8', '2026-01-22 06:49:09');

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

--
-- Dumping data for table `backlog_items`
--

INSERT INTO `backlog_items` (`id`, `project_id`, `sprint_id`, `title`, `description`, `type`, `story_points`, `priority`, `tags`, `due_date`, `is_blocked`, `status`, `position`, `assigned_to_id`, `created_by_id`, `created_at`, `updated_at`, `isActive`, `started_at`, `completed_at`) VALUES
('64fda6ec-d40c-4e0b-a902-8c7d3710f5ac', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'faa872ca-7533-47e4-9f6e-c29889d604ca', 'dwbhgwbgbfthfrhthth', 'wbfbfjwgfh', 'BUG', 2, 'LOW', '[\"tfhfh\"]', '2026-01-15', 0, 'DONE', 3, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', '2026-01-22 03:11:05', '2026-01-22 06:49:17', 1, '2026-01-22 04:46:12', '2026-01-22 06:33:27'),
('9daed639-a0d4-46d2-bedc-a9bffc2569bc', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', '6402e47c-17d0-4812-ab69-eec3622ac9d8', 'dwbhgwbgbfthfrhthth (Copy)', 'wbfbfjwgfh', 'BUG', 2, 'CRITICAL', '[\"tfhfh\"]', '2026-01-24', 0, 'DONE', 2, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', '2026-01-22 03:11:15', '2026-01-22 07:29:05', 1, '2026-01-22 06:50:12', '2026-01-22 06:55:01'),
('ee29695b-1257-43de-a7b0-be3c5975efbd', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', '6402e47c-17d0-4812-ab69-eec3622ac9d8', 'spnjvps<rv<', 'r<svsr', 'BUG', 3, 'HIGH', '[]', '2026-01-24', 0, 'DONE', 1, 'a43121fa-4dcf-4054-8fab-16553baf7978', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', '2026-01-22 03:13:16', '2026-01-22 06:55:03', 1, '2026-01-22 06:54:39', '2026-01-22 06:55:03');

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
-- Dumping data for table `burndown_data`
--

INSERT INTO `burndown_data` (`id`, `sprint_id`, `date`, `remaining_story_points`, `created_at`) VALUES
('2b9615bb-aae7-4159-99ba-2665d5ca52bd', '6402e47c-17d0-4812-ab69-eec3622ac9d8', '2026-01-22', 0, '2026-01-22 06:12:00'),
('b96efe13-fb3c-4282-9cce-0b8564000faf', 'faa872ca-7533-47e4-9f6e-c29889d604ca', '2026-01-22', 0, '2026-01-22 06:15:06'),
('f5dbf39a-ae64-4470-9e97-768527d18170', '8c4dd50b-dd50-405e-965e-33731ef4393a', '2026-01-22', 0, '2026-01-22 04:34:48');

-- --------------------------------------------------------

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
  `status` enum('PLANNING','ACTIVE','COMPLETED','ARCHIVED') DEFAULT 'PLANNING',
  `methodology` enum('SCRUM','KANBAN') DEFAULT 'SCRUM',
  `sprint_duration` int(11) DEFAULT 2,
  `objectives` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isActive` tinyint(1) DEFAULT 1,
  `created_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `start_date`, `end_date`, `status`, `methodology`, `sprint_duration`, `objectives`, `created_at`, `updated_at`, `isActive`, `created_by`) VALUES
('08df113c-f031-4b21-b23f-62403bcc1274', '', NULL, NULL, NULL, '', NULL, NULL, NULL, '2026-01-22 02:16:16', '2026-01-22 02:17:35', NULL, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee'),
('839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'sgrfoom', '<rsvv', '2026-01-21', NULL, 'PLANNING', 'KANBAN', 3, '[\"s<vsv\",\"<srvrsv\",\"r<v\"]', '2026-01-22 02:20:36', '2026-01-22 07:51:37', 1, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee'),
('cad317f7-46f2-4826-a4f6-621c0aa973de', '', NULL, NULL, NULL, '', NULL, NULL, NULL, '2026-01-22 02:14:26', '2026-01-22 02:15:53', NULL, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee'),
('e3ddad27-0ff3-4993-b233-56a09a746a13', 'dgrw<g', 'rdgrdghfth', '2026-01-22', NULL, 'ARCHIVED', 'KANBAN', 2, '[\"fhxfh\",\"fxgh\",\"fxhgth\"]', '2026-01-22 02:25:48', '2026-01-22 02:29:54', 1, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee'),
('e69ce30b-5c72-4395-9e6c-504b78984506', 'iot ', 'dwfrgbd', '2026-01-22', NULL, 'PLANNING', 'SCRUM', 1, '[\"dfb\",\"wfrbdwr\",\"bdrb\"]', '2026-01-22 07:26:36', '2026-01-22 07:26:36', 1, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee'),
('eb983ee6-b7a2-47ba-bc96-1c67fcfb58f1', '<fvbf', 'dgtbb', '2026-01-22', NULL, 'PLANNING', 'KANBAN', 2, '[\"tdqbqf\",\"vdqv<fr\",\"<vrv\"]', '2026-01-22 02:21:47', '2026-01-22 07:26:21', 1, 'd5e609c0-3afd-4603-aa5c-f0cc830266ee');

-- --------------------------------------------------------

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
-- Dumping data for table `project_audit`
--

INSERT INTO `project_audit` (`id`, `project_id`, `user_id`, `action`, `field_changed`, `old_value`, `new_value`, `created_at`) VALUES
('0edb9e0a-9794-470a-b86d-b9843631b422', 'e3ddad27-0ff3-4993-b233-56a09a746a13', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', 'PLANNING', 'ARCHIVED', '2026-01-22 02:25:52'),
('27908007-a7d3-497a-b852-ab33609b51e2', '08df113c-f031-4b21-b23f-62403bcc1274', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'name', 'gukg', 'gukgrd<rf', '2026-01-22 02:16:52'),
('3172ff29-fd6f-43f9-9c70-3d89cac9be74', 'eb983ee6-b7a2-47ba-bc96-1c67fcfb58f1', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'start_date', '2026-01-23 00:00:00.000', '2026-01-22', '2026-01-22 07:26:21'),
('354f3a79-ae9d-4999-94ea-526589148097', 'e3ddad27-0ff3-4993-b233-56a09a746a13', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', '', 'ARCHIVED', '2026-01-22 02:29:54'),
('3c8c49ed-f265-43ef-8510-7e93b2d6ee1a', '08df113c-f031-4b21-b23f-62403bcc1274', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'start_date', '2026-01-22 00:00:00.000', '2026-01-21', '2026-01-22 02:16:45'),
('4fb29944-5bb7-4282-95ae-98bdd7e32093', 'eb983ee6-b7a2-47ba-bc96-1c67fcfb58f1', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'name', '<fvbfrb', '<fvbf', '2026-01-22 07:26:21'),
('64170fcf-263c-4702-9d38-4a966ea71655', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'start_date', '2026-01-22 00:00:00.000', '2026-01-21', '2026-01-22 07:26:42'),
('81af4ac6-e384-4f47-b5d5-7522846f0f46', '08df113c-f031-4b21-b23f-62403bcc1274', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', 'PLANNING', 'ARCHIVED', '2026-01-22 02:17:35'),
('967c485b-7c62-4b4c-9d20-cf82dc819d5f', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', 'PLANNING', 'ARCHIVED', '2026-01-22 02:20:41'),
('9b005acc-3fb7-4072-afb3-1c82824af0c3', '08df113c-f031-4b21-b23f-62403bcc1274', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'start_date', '2026-01-21 00:00:00.000', '2026-01-20', '2026-01-22 02:16:52'),
('9fd5c180-6f7f-4792-ba9d-d323e9a61ddb', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', '', 'ARCHIVED', '2026-01-22 02:21:11'),
('aa282626-ed2e-436f-bfe3-aaa2a81b4a57', '08df113c-f031-4b21-b23f-62403bcc1274', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'name', 'gukghjkgh', 'gukg', '2026-01-22 02:16:45'),
('bb3bec1a-6f9a-48bb-99ea-cec8e9da4391', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'UPDATE', 'name', 'sgrf', 'sgrfoom', '2026-01-22 07:26:42'),
('c3243aa2-2f06-471b-a3ea-80361833e0a2', 'cad317f7-46f2-4826-a4f6-621c0aa973de', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', 'PLANNING', 'ARCHIVED', '2026-01-22 02:15:53'),
('e0ca900a-6e9c-48f9-8abd-7ea09871e5f7', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', '', 'ARCHIVED', '2026-01-22 02:29:58'),
('e5229a16-4010-4a30-a5b6-ec446ceb9537', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'ARCHIVE', 'status', 'ACTIVE', 'ARCHIVED', '2026-01-22 07:24:30');

-- --------------------------------------------------------

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
  `invitation_code` varchar(10) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `status` enum('PENDING','ACCEPTED','REFUSED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_invitations`
--

INSERT INTO `project_invitations` (`id`, `project_id`, `email`, `role`, `invited_by`, `token`, `invitation_code`, `expires_at`, `status`, `created_at`) VALUES
('26ca20a7-5e07-42c1-bf14-423c0615aba6', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'wabevoy437@oremal.com', 'PRODUCT_OWNER', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', '', '2VXFQ9H4', '2026-01-29 06:47:17', 'ACCEPTED', '2026-01-22 05:47:17'),
('bbfe153a-cdfa-4037-ae20-a05671a8c2ff', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'sanonec773@noihse.com', 'TEAM_MEMBER', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'b58f01f8fcfb1770da9423200db9ecd00c744ae5feba8b44e82031b24b015875', 'BA8G7Y34', '2026-01-29 03:49:36', 'PENDING', '2026-01-22 02:49:36'),
('d889358d-70b1-487b-a41e-d6806ba1f9c1', 'eb983ee6-b7a2-47ba-bc96-1c67fcfb58f1', 'sanonec773@noihse.com', 'TEAM_MEMBER', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', '', 'BA8G7Y38', '2026-01-29 06:26:08', 'ACCEPTED', '2026-01-22 05:26:08');

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
('160ba388-cccd-41cf-aee3-1c9ea77806de', 'cad317f7-46f2-4826-a4f6-621c0aa973de', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'SCRUM_MASTER', '2026-01-22 02:14:26'),
('2ff1968b-df4f-4f53-9f59-02934be0a94a', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'SCRUM_MASTER', '2026-01-22 02:20:36'),
('4ebee4f2-d257-49f0-8b72-350e206dae28', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'a43121fa-4dcf-4054-8fab-16553baf7978', 'PRODUCT_OWNER', '2026-01-22 05:47:53'),
('86246591-5e61-4235-8cc5-78d14851c394', 'e69ce30b-5c72-4395-9e6c-504b78984506', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'SCRUM_MASTER', '2026-01-22 07:26:36'),
('af129515-9ed6-4fcb-838c-0fc5e0a0c732', '08df113c-f031-4b21-b23f-62403bcc1274', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'SCRUM_MASTER', '2026-01-22 02:16:16'),
('cb450bc3-1fd8-4525-b33d-5a6791af8a1d', 'eb983ee6-b7a2-47ba-bc96-1c67fcfb58f1', '9d5e4ab5-af40-4a18-b9db-30aaad86be14', 'TEAM_MEMBER', '2026-01-22 05:33:03'),
('e4700c96-92a0-4fe3-b2d8-2a967705aef9', 'eb983ee6-b7a2-47ba-bc96-1c67fcfb58f1', 'd5e609c0-3afd-4603-aa5c-f0cc830266ee', 'SCRUM_MASTER', '2026-01-22 02:21:47');

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

--
-- Dumping data for table `sprints`
--

INSERT INTO `sprints` (`id`, `project_id`, `name`, `start_date`, `end_date`, `status`, `objective`, `planned_velocity`, `actual_velocity`, `created_at`, `updated_at`, `isActive`) VALUES
('6402e47c-17d0-4812-ab69-eec3622ac9d8', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'iot ', '2026-01-15', '2026-01-16', 'ACTIVE', NULL, 3, 0, '2026-01-22 04:38:55', '2026-01-22 07:44:56', 0),
('8c4dd50b-dd50-405e-965e-33731ef4393a', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'hrgqgfrg', '2026-01-22', '2026-01-24', 'COMPLETED', NULL, 3, 2, '2026-01-22 04:34:43', '2026-01-22 06:11:45', 0),
('faa872ca-7533-47e4-9f6e-c29889d604ca', '839d7368-db10-4c0b-b1ff-aacbdd519b1b', 'hrgqgfrg', '2026-01-22', '2026-01-24', 'COMPLETED', 'hello ', 2, 2, '2026-01-22 06:14:46', '2026-01-22 07:51:37', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT uuid(),
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `role` enum('ADMIN','PRODUCT_OWNER','SCRUM_MASTER','TEAM_MEMBER') NOT NULL DEFAULT 'TEAM_MEMBER',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_code` varchar(10) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `failed_attempts` int(11) DEFAULT 0,
  `lock_until` timestamp NULL DEFAULT NULL,
  `lastLogin` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password`, `first_name`, `last_name`, `address_line`, `city`, `country`, `role`, `is_active`, `is_verified`, `verification_code`, `reset_token`, `reset_token_expires`, `failed_attempts`, `lock_until`, `lastLogin`, `created_at`, `updated_at`, `profile_photo`) VALUES
('9d5e4ab5-af40-4a18-b9db-30aaad86be14', 'sanonec773@noihse.com', NULL, '$2b$10$2/leFhv.os.VhDqyYGAMWu.jV9MtJvowHpFzdH2Gu37hUpxyWZ5FO', 'brahim', 'zaryouh', NULL, NULL, NULL, 'TEAM_MEMBER', 1, 1, NULL, NULL, NULL, 0, NULL, '2026-01-22 02:44:00', '2026-01-22 02:43:29', '2026-01-22 02:44:00', NULL),
('a43121fa-4dcf-4054-8fab-16553baf7978', 'wabevoy437@oremal.com', NULL, '$2b$10$a.eEJFuqoRhsgqg0D3qZ9e7HG6MrGMDAcr/tocZRGuiA0RCAq9Whi', 'brahim', 'zaryouh', NULL, NULL, NULL, 'TEAM_MEMBER', 1, 1, NULL, NULL, NULL, 0, NULL, '2026-01-22 05:46:27', '2026-01-22 05:45:55', '2026-01-22 05:46:27', NULL),
('ca567e9b-02f5-495f-8b42-02c22c7c1c78', 'brahim0@gmail.com', NULL, '$2b$10$r30VxN1LsOA4nbCwnGvxuubY2pwuMEaBA.YOhZdyA8urEUs/zTceK', 'brahim', 'zaryouh', NULL, NULL, NULL, 'TEAM_MEMBER', 1, 0, '5AD46E', NULL, NULL, 0, NULL, NULL, '2026-01-22 02:42:04', '2026-01-22 02:42:04', NULL),
('d5e609c0-3afd-4603-aa5c-f0cc830266ee', 'hihifi5322@noihse.com', NULL, '$2b$10$KR8OrRNhboyI1LM.o.eHb.te6MYFGqg1EyV7HUFsqQuXK.HSSI.Fa', 'ahme', 'zaryouh', NULL, NULL, NULL, 'SCRUM_MASTER', 1, 1, NULL, NULL, NULL, 0, NULL, '2026-01-22 01:43:40', '2026-01-22 01:43:04', '2026-01-22 01:58:23', '/uploads/profiles/d5e609c0-3afd-4603-aa5c-f0cc830266ee_1769047103407_image.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `backlog_acceptance_criteria`
--
ALTER TABLE `backlog_acceptance_criteria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_criteria_backlog` (`backlog_item_id`);

--
-- Indexes for table `backlog_attachments`
--
ALTER TABLE `backlog_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attachment_backlog` (`backlog_item_id`),
  ADD KEY `fk_attachment_user` (`uploaded_by`);

--
-- Indexes for table `backlog_history`
--
ALTER TABLE `backlog_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_history_backlog` (`backlog_item_id`),
  ADD KEY `fk_history_user` (`user_id`);

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
-- Indexes for table `burndown_data`
--
ALTER TABLE `burndown_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_burndown` (`sprint_id`,`date`),
  ADD KEY `fk_burndown_sprint` (`sprint_id`);

--
-- Indexes for table `kanban_columns`
--
ALTER TABLE `kanban_columns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_kanban_project` (`project_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project_audit`
--
ALTER TABLE `project_audit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_audit_project` (`project_id`),
  ADD KEY `fk_audit_user` (`user_id`);

--
-- Indexes for table `project_invitations`
--
ALTER TABLE `project_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_invitation` (`project_id`,`email`),
  ADD KEY `fk_invitation_project` (`project_id`),
  ADD KEY `fk_invitation_user` (`invited_by`),
  ADD KEY `idx_invitation_code` (`invitation_code`);

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
-- Constraints for table `backlog_acceptance_criteria`
--
ALTER TABLE `backlog_acceptance_criteria`
  ADD CONSTRAINT `fk_criteria_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `backlog_attachments`
--
ALTER TABLE `backlog_attachments`
  ADD CONSTRAINT `fk_attachment_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attachment_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `backlog_history`
--
ALTER TABLE `backlog_history`
  ADD CONSTRAINT `fk_history_backlog` FOREIGN KEY (`backlog_item_id`) REFERENCES `backlog_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `burndown_data`
--
ALTER TABLE `burndown_data`
  ADD CONSTRAINT `fk_burndown_sprint` FOREIGN KEY (`sprint_id`) REFERENCES `sprints` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kanban_columns`
--
ALTER TABLE `kanban_columns`
  ADD CONSTRAINT `fk_kanban_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_audit`
--
ALTER TABLE `project_audit`
  ADD CONSTRAINT `fk_audit_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_invitations`
--
ALTER TABLE `project_invitations`
  ADD CONSTRAINT `fk_invitation_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invitation_user` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sprints`
--
ALTER TABLE `sprints`
  ADD CONSTRAINT `fk_sprint_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
