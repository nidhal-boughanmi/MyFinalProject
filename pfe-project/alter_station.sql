USE ProjetPfeAgil;

-- Ajout des colonnes manquantes à la table StationService
ALTER TABLE StationService
ADD COLUMN ville VARCHAR(100) AFTER adresse,
ADD COLUMN telephone VARCHAR(20) AFTER ville,
ADD COLUMN email VARCHAR(100) AFTER telephone,
ADD COLUMN capacite INT AFTER email;
