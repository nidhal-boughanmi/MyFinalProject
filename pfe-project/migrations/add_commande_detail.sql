-- Create CommandeDetail table
CREATE TABLE IF NOT EXISTS CommandeDetail (
    idDetail INT PRIMARY KEY AUTO_INCREMENT,
    idCommande INT NOT NULL,
    idProduit INT NOT NULL,
    quantite INT NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (idCommande) REFERENCES Commande(idCommande),
    FOREIGN KEY (idProduit) REFERENCES Produit(idProduit),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add description field to Commande table if it doesn't exist
ALTER TABLE Commande
ADD COLUMN IF NOT EXISTS description VARCHAR(255) NULL;
