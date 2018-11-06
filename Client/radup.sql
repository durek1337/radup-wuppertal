-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 06. Nov 2018 um 22:02
-- Server-Version: 10.1.13-MariaDB
-- PHP-Version: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `radup`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `bike`
--

CREATE TABLE `bike` (
  `id` int(11) NOT NULL,
  `type` smallint(1) NOT NULL,
  `name` varchar(50) NOT NULL,
  `holderid` int(11) NOT NULL,
  `holdertype` tinyint(1) NOT NULL DEFAULT '0',
  `sponsorid` int(10) NOT NULL,
  `frame` int(11) NOT NULL DEFAULT '26',
  `status` int(11) NOT NULL,
  `akku` smallint(5) NOT NULL DEFAULT '10000',
  `distance` int(11) NOT NULL DEFAULT '0',
  `lat_gps` decimal(11,8) NOT NULL,
  `lon_gps` decimal(11,8) NOT NULL,
  `properties` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `bike`
--

INSERT INTO `bike` (`id`, `type`, `name`, `holderid`, `holdertype`, `sponsorid`, `frame`, `status`, `akku`, `distance`, `lat_gps`, `lon_gps`, `properties`, `timestamp`) VALUES
(1, 1, 'Flash', 1, 0, 1, 26, 2, 10000, 0, '0.00000000', '0.00000000', '{ \"Hersteller / Modell\" : \"Kreator / P12Qj82\", \"Geeignet für Größe\" : \"145 - 175 cm\", \"Max. Reichweite\" : \"35 km\", \"Akkukapazität\" : \"10Ah\", \"Motor\" : \"Graupner Race (2 PS)\", \"Schaltung (Gänge)\" : \"Shimano Bla (27)\", \"Bremsen\" : \"Breaker xblax\" }', '2018-11-06 20:49:05'),
(2, 1, 'Storm', 3, 0, 1, 26, 2, 10000, 0, '0.00000000', '0.00000000', '{}', '2017-05-11 23:37:39'),
(3, 0, 'Thunder', 1, 1, 1, 26, 2, 10000, 0, '0.00000000', '0.00000000', '{}', '2017-05-11 23:37:39');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `bike_transfer`
--

CREATE TABLE `bike_transfer` (
  `id` int(11) NOT NULL,
  `bikeid` int(11) NOT NULL,
  `holderid` int(11) NOT NULL,
  `holdertype` int(11) NOT NULL DEFAULT '0',
  `receiverid` int(11) NOT NULL,
  `receivertype` tinyint(1) NOT NULL DEFAULT '0',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `bike_transfer`
--

INSERT INTO `bike_transfer` (`id`, `bikeid`, `holderid`, `holdertype`, `receiverid`, `receivertype`, `timestamp`) VALUES
(1, 1, 0, 0, 1, 0, '2017-05-11 23:37:39'),
(2, 3, 0, 0, 2, 0, '2017-05-11 23:37:39');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `charge`
--

CREATE TABLE `charge` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lat` decimal(11,8) NOT NULL,
  `lon` decimal(11,8) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `desc` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `street` varchar(100) NOT NULL,
  `housenumber` varchar(255) NOT NULL,
  `country` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `charge`
--

INSERT INTO `charge` (`id`, `name`, `lat`, `lon`, `timestamp`, `desc`, `city`, `street`, `housenumber`, `country`) VALUES
(1, 'Ladestation Zweiradplatz', '51.24562000', '7.14924700', '2017-05-11 23:37:39', '', 'Unknowncity', 'Unbekannte Str.', '1336', 'Deutschland');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `message`
--

CREATE TABLE `message` (
  `id` int(11) NOT NULL,
  `senderid` int(11) NOT NULL,
  `receiverid` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `content` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notification`
--

CREATE TABLE `notification` (
  `id` varchar(255) NOT NULL,
  `userid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `picture`
--

CREATE TABLE `picture` (
  `id` int(10) NOT NULL,
  `title` varchar(255) NOT NULL,
  `data` longblob NOT NULL,
  `ticketid` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `repair`
--

CREATE TABLE `repair` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lat` decimal(11,8) NOT NULL,
  `lon` decimal(11,8) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `desc` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `street` varchar(100) NOT NULL,
  `housenumber` varchar(6) NOT NULL,
  `country` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `repair`
--

INSERT INTO `repair` (`id`, `name`, `lat`, `lon`, `timestamp`, `desc`, `city`, `street`, `housenumber`, `country`) VALUES
(1, 'Werkstatt Uni-Wuppertal', '51.24621900', '7.14863700', '2017-05-11 23:37:39', '', 'Wuppertal', 'Unbekannte Str.', '1337a', 'Deutschland');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `sponsor`
--

CREATE TABLE `sponsor` (
  `id` int(10) NOT NULL,
  `name` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `desc` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `sponsor`
--

INSERT INTO `sponsor` (`id`, `name`, `url`, `timestamp`, `desc`) VALUES
(1, 'ASTA Uni Wuppertal', 'http://www.asta-wuppertal.de/', '2017-05-11 23:37:39', '<b>Allgemeiner Studierendenausschuss der Uni Wuppertal</b>: Von Studierenden für Studierende');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `station`
--

CREATE TABLE `station` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `lat` decimal(11,8) NOT NULL,
  `lon` decimal(11,8) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `desc` text NOT NULL,
  `street` varchar(100) NOT NULL,
  `housenumber` varchar(6) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `station`
--

INSERT INTO `station` (`id`, `name`, `lat`, `lon`, `timestamp`, `desc`, `street`, `housenumber`, `city`, `country`) VALUES
(1, 'AStA Uni-Wuppertal', '51.24627600', '7.14715600', '2017-05-11 23:37:39', '<u>HTML hier</u>', 'Max-Horkheimer-Straße', '15', 'Wuppertal', 'Deutschland');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `matnr` int(10) DEFAULT NULL,
  `password` varchar(100) NOT NULL,
  `activated` tinyint(1) NOT NULL DEFAULT '0',
  `rank` smallint(1) NOT NULL DEFAULT '1',
  `gender` tinyint(4) NOT NULL,
  `forename` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `registered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `street` varchar(100) NOT NULL,
  `housenumber` varchar(6) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `bike_lat` decimal(11,8) NOT NULL,
  `bike_lon` decimal(11,8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `user`
--

INSERT INTO `user` (`id`, `matnr`, `password`, `activated`, `rank`, `gender`, `forename`, `surname`, `registered`, `street`, `housenumber`, `city`, `country`, `bike_lat`, `bike_lon`) VALUES
(1, 123456, 'test', 1, 10, 1, 'Dominik', 'Höltgen', '2017-05-11 23:37:39', 'Testweg', '12', 'Hilden', 'Deutschland', '51.25409810', '7.14405266'),
(2, NULL, 'test', 1, 1, 1, 'Lukas', 'Greiler', '2017-05-11 23:37:39', 'Teststr.', '3a', 'Vaupelweg', 'Matthiasland', '51.24370000', '7.00000000'),
(3, NULL, 'test', 1, 1, 0, 'Karoline', 'Kronehügel', '2017-05-11 23:37:39', 'Zum Berg', '5', 'Testdorf', 'Testien', '51.24170000', '6.95000000'),
(4, 654321, 'test', 0, 1, 0, 'Werner', 'Wernersen', '2018-01-24 00:27:38', 'Universitätsallee', '1', 'Wuppertal', 'Deutschland', '51.17025800', '6.93888500');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_rating`
--

CREATE TABLE `user_rating` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `voterid` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `user_ticket`
--

CREATE TABLE `user_ticket` (
  `id` int(10) NOT NULL,
  `userid` int(11) NOT NULL,
  `supportid` int(11) DEFAULT NULL,
  `type` smallint(2) NOT NULL,
  `subject` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `hidden` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `log` text NOT NULL,
  `conversation` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `user_ticket`
--

INSERT INTO `user_ticket` (`id`, `userid`, `supportid`, `type`, `subject`, `content`, `hidden`, `timestamp`, `log`, `conversation`) VALUES
(1, 1, NULL, 1, '', '', '', '2018-01-21 21:26:53', '[2018-01-21 22:26:53] Ticket wurde erstellt', NULL),
(2, 1, NULL, 1, 'test', 'test', '', '2018-01-21 21:29:43', '[2018-01-21 22:29:43] Ticket wurde erstellt', NULL),
(3, 1, NULL, 1, 'test', 'test', '', '2018-01-21 21:29:43', '[2018-01-21 22:29:43] Ticket wurde erstellt', NULL),
(4, 1, NULL, 1, 'test', 'test', '', '2018-01-21 21:31:06', '[2018-01-21 22:31:06] Ticket wurde erstellt', NULL),
(5, 1, NULL, 1, 'test', 'test', '', '2018-01-21 21:32:37', '[2018-01-21 22:32:37] Ticket wurde erstellt', NULL),
(6, 1, NULL, 1, 'teeeest', 'Hilfe, meine Fotos!', '', '2018-01-21 22:15:38', '[2018-01-21 23:15:38] Ticket wurde erstellt', NULL),
(7, 1, NULL, 1, 'test', 'etsttettes', '', '2018-01-21 22:16:51', '[2018-01-21 23:16:51] Ticket wurde erstellt', NULL);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `bike`
--
ALTER TABLE `bike`
  ADD PRIMARY KEY (`id`),
  ADD KEY `N:1` (`sponsorid`);

--
-- Indizes für die Tabelle `bike_transfer`
--
ALTER TABLE `bike_transfer`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbike_trans173354` (`bikeid`);

--
-- Indizes für die Tabelle `charge`
--
ALTER TABLE `charge`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKmessage476971` (`senderid`),
  ADD KEY `FKmessage799494` (`receiverid`);

--
-- Indizes für die Tabelle `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKnotificati194486` (`userid`);

--
-- Indizes für die Tabelle `picture`
--
ALTER TABLE `picture`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKpicture621899` (`ticketid`);

--
-- Indizes für die Tabelle `repair`
--
ALTER TABLE `repair`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `sponsor`
--
ALTER TABLE `sponsor`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `station`
--
ALTER TABLE `station`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `user_rating`
--
ALTER TABLE `user_rating`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKuser_ratin579431` (`userid`),
  ADD KEY `FKuser_ratin789912` (`voterid`);

--
-- Indizes für die Tabelle `user_ticket`
--
ALTER TABLE `user_ticket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKuser_ticke437688` (`userid`),
  ADD KEY `FKuser_ticke209796` (`supportid`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `bike`
--
ALTER TABLE `bike`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT für Tabelle `bike_transfer`
--
ALTER TABLE `bike_transfer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `charge`
--
ALTER TABLE `charge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `message`
--
ALTER TABLE `message`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `repair`
--
ALTER TABLE `repair`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `sponsor`
--
ALTER TABLE `sponsor`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `station`
--
ALTER TABLE `station`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT für Tabelle `user_rating`
--
ALTER TABLE `user_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `user_ticket`
--
ALTER TABLE `user_ticket`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `bike`
--
ALTER TABLE `bike`
  ADD CONSTRAINT `N:1` FOREIGN KEY (`sponsorid`) REFERENCES `sponsor` (`id`);

--
-- Constraints der Tabelle `bike_transfer`
--
ALTER TABLE `bike_transfer`
  ADD CONSTRAINT `FKbike_trans173354` FOREIGN KEY (`bikeid`) REFERENCES `bike` (`id`);

--
-- Constraints der Tabelle `message`
--
ALTER TABLE `message`
  ADD CONSTRAINT `FKmessage476971` FOREIGN KEY (`senderid`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FKmessage799494` FOREIGN KEY (`receiverid`) REFERENCES `user` (`id`);

--
-- Constraints der Tabelle `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FKnotificati194486` FOREIGN KEY (`userid`) REFERENCES `user` (`id`);

--
-- Constraints der Tabelle `picture`
--
ALTER TABLE `picture`
  ADD CONSTRAINT `FKpicture621899` FOREIGN KEY (`ticketid`) REFERENCES `user_ticket` (`id`);

--
-- Constraints der Tabelle `user_rating`
--
ALTER TABLE `user_rating`
  ADD CONSTRAINT `FKuser_ratin579431` FOREIGN KEY (`userid`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FKuser_ratin789912` FOREIGN KEY (`voterid`) REFERENCES `user` (`id`);

--
-- Constraints der Tabelle `user_ticket`
--
ALTER TABLE `user_ticket`
  ADD CONSTRAINT `FKuser_ticke209796` FOREIGN KEY (`supportid`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `FKuser_ticke437688` FOREIGN KEY (`userid`) REFERENCES `user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
