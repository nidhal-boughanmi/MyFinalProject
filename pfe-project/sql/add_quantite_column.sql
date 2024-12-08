-- Ajout de la colonne quantite à la table Produit
ALTER TABLE Produit
ADD COLUMN quantite INT DEFAULT 0;
