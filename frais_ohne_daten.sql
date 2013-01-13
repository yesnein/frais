-- MySQL Administrator dump 1.4
--
-- ------------------------------------------------------
-- Server version	5.1.37


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


--
-- Create schema frais
--

CREATE DATABASE IF NOT EXISTS frais;
USE frais;

--
-- Definition of table `ebene`
--

DROP TABLE IF EXISTS `ebene`;
CREATE TABLE `ebene` (
  `ebene_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `haus_id` int(10) unsigned NOT NULL,
  `projekt_id` int(10) unsigned NOT NULL,
  `stockwerk` int(10) unsigned NOT NULL,
  `beschreibung` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `grafik_pfad` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `grafik_breite` int(10) DEFAULT NULL,
  `grafik_hoehe` int(10) DEFAULT NULL,
  `grafik_massstab` int(10) DEFAULT NULL,
  `grafik_referenz_x` int(10) DEFAULT NULL,
  `grafik_referenz_y` int(10) DEFAULT NULL,
  PRIMARY KEY (`ebene_id`),
  KEY `haus_FK` (`haus_id`),
  KEY `projekt_FK` (`projekt_id`),
  CONSTRAINT `ebene_haus_FK` FOREIGN KEY (`haus_id`) REFERENCES `haus` (`haus_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ebene_projekt_FK` FOREIGN KEY (`projekt_id`) REFERENCES `projekt` (`projekt_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


--
-- Definition of table `grundriss`
--

DROP TABLE IF EXISTS `grundriss`;
CREATE TABLE `grundriss` (
  `grundriss_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ebene_id` int(10) unsigned NOT NULL,
  `haus_id` int(10) unsigned NOT NULL,
  `projekt_id` int(10) unsigned NOT NULL,
  `art` varchar(2) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `beschreibung` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `geom` geometry NOT NULL,
  PRIMARY KEY (`grundriss_id`),
  KEY `ebene_FK` (`ebene_id`),
  KEY `haus_FK` (`haus_id`),
  KEY `projekt_FK` (`projekt_id`),
  CONSTRAINT `grundriss_ebene_FK` FOREIGN KEY (`ebene_id`) REFERENCES `ebene` (`ebene_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grundriss_haus_FK` FOREIGN KEY (`haus_id`) REFERENCES `haus` (`haus_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grundriss_projekt_FK` FOREIGN KEY (`projekt_id`) REFERENCES `projekt` (`projekt_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Definition of table `haus`
--

DROP TABLE IF EXISTS `haus`;
CREATE TABLE `haus` (
  `haus_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `projekt_id` int(10) unsigned NOT NULL,
  `beschreibung` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  PRIMARY KEY (`haus_id`),
  KEY `projekt_FK` (`projekt_id`),
  CONSTRAINT `haus_projekt_FK` FOREIGN KEY (`projekt_id`) REFERENCES `projekt` (`projekt_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Definition of table `nachbarpunkt`
--

DROP TABLE IF EXISTS `nachbarpunkt`;
CREATE TABLE `nachbarpunkt` (
  `wp1_id` int(10) unsigned NOT NULL,
  `wp2_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`wp1_id`,`wp2_id`),
  KEY `WP_FK1` (`wp1_id`),
  KEY `WP_FK2` (`wp2_id`),
  CONSTRAINT `WP_FK1` FOREIGN KEY (`wp1_id`) REFERENCES `wegpunkt` (`wp_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `WP_FK2` FOREIGN KEY (`wp2_id`) REFERENCES `wegpunkt` (`wp_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


--
-- Definition of table `projekt`
--

DROP TABLE IF EXISTS `projekt`;
CREATE TABLE `projekt` (
  `projekt_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  PRIMARY KEY (`projekt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Definition of table `wegpunkt`
--

DROP TABLE IF EXISTS `wegpunkt`;
CREATE TABLE `wegpunkt` (
  `wp_id` int(10) unsigned NOT NULL,
  `haus_id` int(10) unsigned NOT NULL,
  `ebene_id` int(10) unsigned NOT NULL,
  `projekt_id` int(10) unsigned NOT NULL,
  `X` int(10) unsigned NOT NULL,
  `Y` int(10) unsigned NOT NULL,
  `bezeichnung` varchar(100) CHARACTER SET latin1 COLLATE latin1_bin DEFAULT NULL,
  `art` varchar(2) CHARACTER SET latin1 COLLATE latin1_bin NOT NULL,
  `ziel` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`wp_id`),
  KEY `haus_FK` (`haus_id`),
  KEY `ebene_FK` (`ebene_id`),
  KEY `projekt_FK` (`projekt_id`),
  CONSTRAINT `wegpunkt_ebene_FK` FOREIGN KEY (`ebene_id`) REFERENCES `ebene` (`ebene_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wegpunkt_haus_FK` FOREIGN KEY (`haus_id`) REFERENCES `haus` (`haus_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wegpunkt_projekt_FK` FOREIGN KEY (`projekt_id`) REFERENCES `projekt` (`projekt_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
