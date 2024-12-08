USE ProjetPfeAgil;

-- Add new columns to StationService table if they don't exist
ALTER TABLE StationService 
ADD COLUMN IF NOT EXISTS ville VARCHAR(100),
ADD COLUMN IF NOT EXISTS telephone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email VARCHAR(100),
ADD COLUMN IF NOT EXISTS capacite INT;
