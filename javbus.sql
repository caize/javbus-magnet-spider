-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 2017-01-20 01:50:07
-- 服务器版本： 5.7.14
-- PHP Version: 5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `javbus`
--

-- --------------------------------------------------------

--
-- 表的结构 `detail`
--

CREATE TABLE `detail` (
  `id` int(30) NOT NULL,
  `title` varchar(1500) NOT NULL COMMENT '标题',
  `name` varchar(80) NOT NULL COMMENT '番号',
  `releaseDate` date NOT NULL DEFAULT '1990-01-01' COMMENT '发行日期',
  `time` varchar(50) CHARACTER SET latin1 NOT NULL DEFAULT '0' COMMENT '片长',
  `actor` varchar(1500) NOT NULL DEFAULT '""' COMMENT '演员(&&&分割)',
  `bPic` varchar(50) NOT NULL COMMENT '大图地址',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '类型：0无码,1有码'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='番号相亲表';

-- --------------------------------------------------------

--
-- 表的结构 `magnet`
--

CREATE TABLE `magnet` (
  `id` int(30) NOT NULL,
  `name` varchar(50) NOT NULL COMMENT '番号',
  `magnet` varchar(2000) NOT NULL COMMENT '磁力链接',
  `magnetName` varchar(800) NOT NULL COMMENT '磁力名',
  `size` varchar(50) NOT NULL COMMENT '磁力大小',
  `isHD` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否高清',
  `isSubtitled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否含有字幕',
  `createTime` date NOT NULL DEFAULT '1990-01-01'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `preview`
--

CREATE TABLE `preview` (
  `id` int(30) NOT NULL,
  `title` varchar(500) NOT NULL COMMENT '标题',
  `name` varchar(50) NOT NULL COMMENT '番号',
  `updateTime` date DEFAULT '2017-01-01' COMMENT '更新日期',
  `picUrl` varchar(50) NOT NULL COMMENT '图片url,只存储文件名',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '类型：0无码,1有码',
  `isHD` tinyint(1) DEFAULT '0' COMMENT '是否高清',
  `isSubtitled` tinyint(1) DEFAULT '0' COMMENT '是否含有字幕'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='预览表';

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detail`
--
ALTER TABLE `detail`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `magnet`
--
ALTER TABLE `magnet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `preview`
--
ALTER TABLE `preview`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `detail`
--
ALTER TABLE `detail`
  MODIFY `id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=188375;
--
-- 使用表AUTO_INCREMENT `magnet`
--
ALTER TABLE `magnet`
  MODIFY `id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=597020;
--
-- 使用表AUTO_INCREMENT `preview`
--
ALTER TABLE `preview`
  MODIFY `id` int(30) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=188445;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
