-- Create database
CREATE DATABASE IF NOT EXISTS ProjetPfeAgil;
USE ProjetPfeAgil;

-- Create Utilisateur table
CREATE TABLE IF NOT EXISTS Utilisateur (
    identifiant BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    mail VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    matricule BIGINT UNIQUE NOT NULL,
    roles ENUM('ADMIN', 'GERANT', 'COMMERCIAL', 'DEPOT', 'ELECTROMECANIQUE', 'TECHNIQUE') NOT NULL
);

-- Create StationService table
CREATE TABLE IF NOT EXISTS StationService (
    idStation BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    adresse TEXT NOT NULL,
    ville VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    capacite INT
);

-- Create Gerant table
CREATE TABLE IF NOT EXISTS Gerant (
    idGerant BIGINT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    matricule BIGINT UNIQUE NOT NULL,
    numGerant BIGINT UNIQUE NOT NULL,
    idStation BIGINT,
    FOREIGN KEY (idStation) REFERENCES StationService(idStation),
    FOREIGN KEY (idGerant) REFERENCES Utilisateur(identifiant)
);

-- Create Produit table
CREATE TABLE IF NOT EXISTS Produit (
    idProduit BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    disponibilite VARCHAR(50),
    prix FLOAT NOT NULL,
    CODPRD VARCHAR(20),
    LIBPRD VARCHAR(100),
    CODEMB VARCHAR(20),
    LIBEMB VARCHAR(100),
    TYPPRD VARCHAR(50)
);

-- Create Depot table
CREATE TABLE IF NOT EXISTS Depot (
    idDepot BIGINT PRIMARY KEY AUTO_INCREMENT,
    nomDepot VARCHAR(100) NOT NULL,
    adresse TEXT NOT NULL
);

-- Create Commande table
CREATE TABLE IF NOT EXISTS Commande (
    idCommande BIGINT PRIMARY KEY AUTO_INCREMENT,
    montant FLOAT NOT NULL,
    date DATETIME NOT NULL,
    idProduit BIGINT,
    idUtilisateur BIGINT,
    etat ENUM('En instance', 'En cours', 'Validée') NOT NULL DEFAULT 'En instance',
    RefCommande VARCHAR(50) UNIQUE NOT NULL,
    FOREIGN KEY (idProduit) REFERENCES Produit(idProduit),
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(identifiant)
);

-- Create Livraison table
CREATE TABLE IF NOT EXISTS Livraison (
    idLivraison BIGINT PRIMARY KEY AUTO_INCREMENT,
    idCommande BIGINT,
    dateLivraison DATETIME NOT NULL,
    numChauffeur BIGINT NOT NULL,
    quantiteLv FLOAT NOT NULL,
    FOREIGN KEY (idCommande) REFERENCES Commande(idCommande)
);

-- Create Material table
CREATE TABLE IF NOT EXISTS Material (
    idStation BIGINT,
    Actif VARCHAR(50) NOT NULL,
    Description TEXT,
    Emplacement VARCHAR(100),
    status VARCHAR(50),
    FOREIGN KEY (idStation) REFERENCES StationService(idStation)
);

-- Create Reclamation table
CREATE TABLE IF NOT EXISTS Reclamation (
    idReclamation BIGINT PRIMARY KEY AUTO_INCREMENT,
    idGerant BIGINT,
    idCommercial BIGINT,
    description TEXT NOT NULL,
    date DATETIME NOT NULL,
    type ENUM('TECHNIQUE', 'COMMERCIALE') NOT NULL,
    etat ENUM('En instance', 'En cours', 'Validée') NOT NULL DEFAULT 'En instance',
    material VARCHAR(50),
    FOREIGN KEY (idGerant) REFERENCES Gerant(idGerant),
    FOREIGN KEY (idCommercial) REFERENCES Utilisateur(identifiant)
);

-- Création de l'administrateur permanent
DELETE FROM Utilisateur WHERE mail = 'admin@pfe.tn';
INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles)
VALUES (
    'Admin',
    'System',
    '21612345678',
    'admin@pfe.tn',
    '$2a$10$2EZZzs0Gz9LCva1RU.3fDegZan0cQuLvMGr8zVEdypM6hz8UmcVVu',
    '9999',
    'ADMIN'
);
-- Identifiants permanents :
-- Email: admin@pfe.tn
-- Mot de passe: admin123
