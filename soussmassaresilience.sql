-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 07 avr. 2026 à 14:25
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `soussmassaresilience`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_refresh_capacity` (IN `p_id_zone` INT)   BEGIN
    UPDATE zoneregroupement 
    SET capacite_restante = capacite_max - (
        SELECT COUNT(*) 
        FROM pointaffectation
        WHERE id_zone = p_id_zone AND statut != 'Libre'
    )
    WHERE id_zone = p_id_zone;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `distribuer`
--

CREATE TABLE `distribuer` (
  `id_distribution` int(11) NOT NULL,
  `id_zone` int(11) DEFAULT NULL,
  `id_sinistre` int(11) DEFAULT NULL,
  `id_ressource` int(11) DEFAULT NULL,
  `id_equipe` int(11) DEFAULT NULL,
  `quantite_donnee` float DEFAULT NULL,
  `unite_mesure` varchar(50) DEFAULT NULL,
  `date_distribution` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `distribuer`
--

INSERT INTO `distribuer` (`id_distribution`, `id_zone`, `id_sinistre`, `id_ressource`, `id_equipe`, `quantite_donnee`, `unite_mesure`, `date_distribution`) VALUES
(1, 1, 22, 1, NULL, 5, 'Litre', '2026-03-25 13:49:21'),
(2, 1, 22, 2, NULL, 1, 'Unit', '2026-03-25 14:12:01'),
(3, 1, 28, 2, NULL, 1, 'Unit', '2026-03-27 12:49:00'),
(4, 1, NULL, 6, NULL, 2, 'Unit', '2026-04-06 18:53:18');

--
-- Déclencheurs `distribuer`
--
DELIMITER $$
CREATE TRIGGER `fn_deduct_stock` AFTER INSERT ON `distribuer` FOR EACH ROW BEGIN
    UPDATE stocker
    SET quantite_disponible = quantite_disponible - NEW.quantite_donnee
    WHERE id_zone = NEW.id_zone AND id_ressource = NEW.id_ressource;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `equipe`
--

CREATE TABLE `equipe` (
  `id_equipe` int(11) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `nom_equipe` varchar(100) NOT NULL DEFAULT 'Equipe sans nom',
  `statut` enum('Disponible','En_mission','En_repos') NOT NULL DEFAULT 'Disponible',
  `id_zone` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `specialite` varchar(100) DEFAULT 'Logistique'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `equipe`
--

INSERT INTO `equipe` (`id_equipe`, `role`, `contact`, `nom_equipe`, `statut`, `id_zone`, `user_id`, `specialite`) VALUES
(1, 'Logistique - Agadir Centre', '06010101033', 'Equipe sans nom', 'Disponible', 1, NULL, 'Logistique'),
(2, 'Secours M‚dical - Taroudant', '0602020202', 'Equipe sans nom', 'Disponible', NULL, NULL, 'Logistique'),
(3, 'S‚curit‚ - Stade Adrar', '0603030303', 'Equipe sans nom', 'Disponible', NULL, NULL, 'Logistique'),
(4, 'Gestion de Stock - Inzegane', '0604040404', 'Equipe sans nom', 'Disponible', NULL, NULL, 'Logistique'),
(6, 'Medical Rescue', '+212600000000', 'Equipe sans nom', 'Disponible', 1, NULL, 'Logistique');

-- --------------------------------------------------------

--
-- Structure de la table `intervention`
--

CREATE TABLE `intervention` (
  `id_intervention` int(11) NOT NULL,
  `id_equipe` int(11) NOT NULL,
  `id_zone` int(11) NOT NULL,
  `description` text NOT NULL,
  `statut` varchar(50) DEFAULT 'En cours',
  `date_debut` datetime DEFAULT current_timestamp(),
  `date_fin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `pointaffectation`
--

CREATE TABLE `pointaffectation` (
  `id_point` int(11) NOT NULL,
  `num_emplacement` varchar(50) DEFAULT NULL,
  `statut` enum('Libre','Occup') NOT NULL DEFAULT 'Libre',
  `id_zone` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `pointaffectation`
--

INSERT INTO `pointaffectation` (`id_point`, `num_emplacement`, `statut`, `id_zone`) VALUES
(1, 'Tente-A1', 'Occup', 1),
(2, 'Tente-A2', 'Occup', 1),
(3, 'Tente-A3', 'Occup', 1),
(4, 'Bloc-B1', 'Libre', 1),
(5, 'Bloc-B2', 'Libre', 1),
(6, 'Bloc-B3', 'Libre', 1),
(7, 'Tente-A4', 'Libre', 1),
(8, 'Tente-A5', 'Libre', 1),
(9, 'Bloc-B4', 'Libre', 1),
(10, 'Bloc-B5', 'Libre', 1),
(11, 'ENS-P1', 'Occup', 4),
(12, 'ENS-P2', 'Occup', 4),
(13, 'ENS-P3', 'Libre', 4),
(14, 'ENS-P4', 'Libre', 4),
(15, 'ENS-P5', 'Libre', 4),
(16, 'ENS-P6', 'Libre', 4),
(17, 'ENS-P7', 'Libre', 4),
(18, 'ENS-P8', 'Libre', 4),
(19, 'ENS-P9', 'Libre', 4),
(20, 'ENS-P10', 'Libre', 4),
(21, 'Z11-S1', 'Libre', 11),
(22, 'Z11-S2', 'Libre', 11),
(23, 'Z11-S3', 'Libre', 11),
(24, 'Z11-S4', 'Libre', 11),
(25, 'Z11-S5', 'Libre', 11),
(26, 'Z11-S6', 'Libre', 11),
(27, 'Z11-S7', 'Libre', 11),
(28, 'Z11-S8', 'Libre', 11),
(29, 'Z11-S9', 'Libre', 11),
(30, 'Z11-S10', 'Libre', 11);

-- --------------------------------------------------------

--
-- Structure de la table `ressource`
--

CREATE TABLE `ressource` (
  `id_ressource` int(11) NOT NULL,
  `type_ressource` varchar(100) DEFAULT NULL,
  `unite_mesure` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ressource`
--

INSERT INTO `ressource` (`id_ressource`, `type_ressource`, `unite_mesure`) VALUES
(1, 'Eau Potable', 'Litre'),
(2, 'Tente Familiale', 'Unit'),
(3, 'Kit de Premier Secours', 'Unit'),
(4, 'Couverture', 'Unit'),
(5, 'Ration Alimentaire', 'Unit'),
(6, 'Blankets', 'Unit'),
(7, 'dolipra', 'Piece');

-- --------------------------------------------------------

--
-- Structure de la table `sinistre`
--

CREATE TABLE `sinistre` (
  `id_sinistre` int(11) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `cin` varchar(20) DEFAULT NULL,
  `id_point` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `statut_reservation` enum('Pending','Confirmed','Rejected') DEFAULT NULL,
  `nombre_membres` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `sinistre`
--

INSERT INTO `sinistre` (`id_sinistre`, `nom`, `prenom`, `cin`, `id_point`, `user_id`, `statut_reservation`, `nombre_membres`) VALUES
(22, 'El Boukaa', 'Ghait', 'JH12348', 1, 5, 'Confirmed', 1),
(24, 'El Boukaa', 'test2', 'JH22344', 12, 8, 'Confirmed', 1),
(28, 'El Boukaa', 'test4', 'JH22444', 2, 12, 'Confirmed', 1),
(32, 'el boukaa2', 'ghait2', 'JM1052322', NULL, 19, 'Rejected', 1),
(33, 'el boukaa3', 'ghait3', 'JM10523233', NULL, 20, NULL, 1),
(34, 'el boukaa6', 'ghait6', 'JM10523226', NULL, 21, NULL, 1),
(35, 'test6', 'test6', 'JM8273486', NULL, 22, 'Rejected', 1);

-- --------------------------------------------------------

--
-- Structure de la table `stocker`
--

CREATE TABLE `stocker` (
  `id_zone` int(11) NOT NULL,
  `id_ressource` int(11) NOT NULL,
  `quantite_disponible` float DEFAULT 0,
  `seuil_alerte` float NOT NULL DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stocker`
--

INSERT INTO `stocker` (`id_zone`, `id_ressource`, `quantite_disponible`, `seuil_alerte`) VALUES
(1, 1, 6800, 50),
(1, 2, 198, 50),
(1, 6, 198, 50),
(4, 1, 1000, 50),
(4, 3, 50, 50);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','sinistre') NOT NULL DEFAULT 'sinistre',
  `id_zone` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id_user`, `email`, `password`, `role`, `id_zone`) VALUES
(5, 'ghait@test.com', 'scrypt:32768:8:1$CrFjkCvHlYWtuMvq$9923262f94c3a64f10034535d9089c15f352eba4cd898b2d85311345d2513818a1dd4fd003cf606722371fac7eb83605735dcc11197d960aa978c593a2d11454', 'sinistre', NULL),
(6, 'admin@ensisd.ma', 'scrypt:32768:8:1$WZ49exObQP6L4X9k$d664dec1cf0a09b0d1269a4c68310d786971c340c635a9e6e321186ee72e65a931b5df8de200da4376696261a5432a734f928dd3481d4bcd5c1245ea7d829a62', 'super_admin', NULL),
(8, 'test2@test2.ma', 'scrypt:32768:8:1$71rHX2ZoXWJgQ8uv$cf22a660ba8c745ca1eac36013c0ef8022d59f20c897b649f0f8580f66ce83994cde70d1a8e0cf3545de9ffc5673a08dee47eaaaabe213766d388afa6d39971b', 'sinistre', NULL),
(12, 'test4@test4.ma', 'scrypt:32768:8:1$5dCEBkSLIaTNtdoT$0ef1c0251240d10fae7b09bc16857d2991204d0479a0b0997c15281e0369d2c3e4bc09c468c4885e5c518e6298a4a6423ef6e412bb694d6f7509461b7223a463', 'sinistre', NULL),
(17, 'admin_zone1@example.com', 'scrypt:32768:8:1$P272VhRiYpsG1qH5$3bef656e2a6937b8be20cb59502971296a183d9fcb2d3432cafb2bbc962066bbe9af63dbf62bdd4525cccb158eb3934970c345006eeabb348d6af0e06f00b61f', 'admin', 1),
(18, 'ghaitelboukaa@gmail.com', 'scrypt:32768:8:1$GcO1WUkUtNVMmELP$ed2202579cfc910de97a778241fc2db2dfdc7a1ad6f2763c2f3f65a52f28e8dcc391f20adb70219a5519fb14fdeb58a2fe79e0640fd3204822c71923ba70298a', 'admin', 1),
(19, 'ghaitelboukaa2@gmail.com', 'scrypt:32768:8:1$t9eHRPeLqt8XsQYL$7b1887cfef768e856fc48e03f4d454ead9e146ae520a2aa9a812b2089acc6530a048040d8add8c4f3cb8982c658a837c941a60e2c4a4691cdecabd4613feec7b', 'sinistre', NULL),
(20, 'ghaitelboukaa3@gmail.com', 'scrypt:32768:8:1$jAMlGyaeO76tW9yN$297de4e1d4f0980e358461fa59ebbfd72309b8e04e53d76559b987553c8aaa4577eeafbffbbcbf425c1e2b359183c8800adc1e0f93650f21afa5b5bb32edefef', 'sinistre', NULL),
(21, 'ghaitelboukaa6@gmail.com', 'scrypt:32768:8:1$BmVCgQkDgnYDC1gk$647d65bf8e772b31d2afdc2e40cb9f313e5c3bba95bbc494edcbe823d4dc710e4db70af253d84a72a31ce4bb64bc9da0c14a47f75e55ac5d0a09ca5e464ca391', 'sinistre', NULL),
(22, 'test6@test6.ma', 'scrypt:32768:8:1$JutBCsONzFNWaNvM$77475c49b126e7cb6876e981b76869d974d62a777aa9adbf1ba2990d01dea5ce134c3cb7128fb46c0b853246ea103d947f1055fdb19811f49c04cd0609d6773a', 'sinistre', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `zoneregroupement`
--

CREATE TABLE `zoneregroupement` (
  `id_zone` int(11) NOT NULL,
  `nom_zone` varchar(100) NOT NULL,
  `adress_gps` varchar(255) DEFAULT NULL,
  `capacite_max` int(11) NOT NULL,
  `capacite_restante` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `zoneregroupement`
--

INSERT INTO `zoneregroupement` (`id_zone`, `nom_zone`, `adress_gps`, `capacite_max`, `capacite_restante`) VALUES
(1, 'Stade Adrar - Updated2', '30.423, -9.537', 600, 596),
(3, 'Parc Ibn Zohr', '30.410, -9.555', 150, 2),
(4, 'Campus ENSISD Taroudant', '30.485, -8.857', 200, 198),
(6, 'Corniche Agadir Sector 1', '30.415, -9.605', 400, 400),
(7, 'Inzegane - Souk Tlat', '30.365, -9.532', 250, 250),
(11, 'Inzegane - Souk Tlat2', '30.345, -9.232', 4, 10);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `distribuer`
--
ALTER TABLE `distribuer`
  ADD PRIMARY KEY (`id_distribution`),
  ADD KEY `id_zone` (`id_zone`),
  ADD KEY `id_sinistre` (`id_sinistre`),
  ADD KEY `id_ressource` (`id_ressource`),
  ADD KEY `id_equipe` (`id_equipe`);

--
-- Index pour la table `equipe`
--
ALTER TABLE `equipe`
  ADD PRIMARY KEY (`id_equipe`),
  ADD KEY `equipe_zone_fk` (`id_zone`),
  ADD KEY `equipe_user_fk` (`user_id`);

--
-- Index pour la table `intervention`
--
ALTER TABLE `intervention`
  ADD PRIMARY KEY (`id_intervention`),
  ADD KEY `id_equipe` (`id_equipe`),
  ADD KEY `id_zone` (`id_zone`);

--
-- Index pour la table `pointaffectation`
--
ALTER TABLE `pointaffectation`
  ADD PRIMARY KEY (`id_point`),
  ADD KEY `id_zone` (`id_zone`);

--
-- Index pour la table `ressource`
--
ALTER TABLE `ressource`
  ADD PRIMARY KEY (`id_ressource`);

--
-- Index pour la table `sinistre`
--
ALTER TABLE `sinistre`
  ADD PRIMARY KEY (`id_sinistre`),
  ADD UNIQUE KEY `cin` (`cin`),
  ADD UNIQUE KEY `id_point` (`id_point`),
  ADD KEY `fk_user_sinistre` (`user_id`);

--
-- Index pour la table `stocker`
--
ALTER TABLE `stocker`
  ADD PRIMARY KEY (`id_zone`,`id_ressource`),
  ADD KEY `id_ressource` (`id_ressource`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_user_zone` (`id_zone`);

--
-- Index pour la table `zoneregroupement`
--
ALTER TABLE `zoneregroupement`
  ADD PRIMARY KEY (`id_zone`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `distribuer`
--
ALTER TABLE `distribuer`
  MODIFY `id_distribution` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `equipe`
--
ALTER TABLE `equipe`
  MODIFY `id_equipe` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `intervention`
--
ALTER TABLE `intervention`
  MODIFY `id_intervention` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `pointaffectation`
--
ALTER TABLE `pointaffectation`
  MODIFY `id_point` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `ressource`
--
ALTER TABLE `ressource`
  MODIFY `id_ressource` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `sinistre`
--
ALTER TABLE `sinistre`
  MODIFY `id_sinistre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `zoneregroupement`
--
ALTER TABLE `zoneregroupement`
  MODIFY `id_zone` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `distribuer`
--
ALTER TABLE `distribuer`
  ADD CONSTRAINT `distribuer_ibfk_1` FOREIGN KEY (`id_zone`) REFERENCES `zoneregroupement` (`id_zone`),
  ADD CONSTRAINT `distribuer_ibfk_2` FOREIGN KEY (`id_sinistre`) REFERENCES `sinistre` (`id_sinistre`),
  ADD CONSTRAINT `distribuer_ibfk_3` FOREIGN KEY (`id_ressource`) REFERENCES `ressource` (`id_ressource`),
  ADD CONSTRAINT `distribuer_ibfk_4` FOREIGN KEY (`id_equipe`) REFERENCES `equipe` (`id_equipe`);

--
-- Contraintes pour la table `equipe`
--
ALTER TABLE `equipe`
  ADD CONSTRAINT `equipe_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`) ON DELETE SET NULL,
  ADD CONSTRAINT `equipe_zone_fk` FOREIGN KEY (`id_zone`) REFERENCES `zoneregroupement` (`id_zone`) ON DELETE SET NULL;

--
-- Contraintes pour la table `intervention`
--
ALTER TABLE `intervention`
  ADD CONSTRAINT `intervention_ibfk_1` FOREIGN KEY (`id_equipe`) REFERENCES `equipe` (`id_equipe`),
  ADD CONSTRAINT `intervention_ibfk_2` FOREIGN KEY (`id_zone`) REFERENCES `zoneregroupement` (`id_zone`);

--
-- Contraintes pour la table `pointaffectation`
--
ALTER TABLE `pointaffectation`
  ADD CONSTRAINT `pointaffectation_ibfk_1` FOREIGN KEY (`id_zone`) REFERENCES `zoneregroupement` (`id_zone`) ON DELETE CASCADE;

--
-- Contraintes pour la table `sinistre`
--
ALTER TABLE `sinistre`
  ADD CONSTRAINT `fk_user_sinistre` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `sinistre_ibfk_1` FOREIGN KEY (`id_point`) REFERENCES `pointaffectation` (`id_point`);

--
-- Contraintes pour la table `stocker`
--
ALTER TABLE `stocker`
  ADD CONSTRAINT `stocker_ibfk_1` FOREIGN KEY (`id_zone`) REFERENCES `zoneregroupement` (`id_zone`),
  ADD CONSTRAINT `stocker_ibfk_2` FOREIGN KEY (`id_ressource`) REFERENCES `ressource` (`id_ressource`);

--
-- Contraintes pour la table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_user_zone` FOREIGN KEY (`id_zone`) REFERENCES `zoneregroupement` (`id_zone`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
