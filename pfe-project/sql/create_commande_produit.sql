-- Création de la table CommandeProduit
CREATE TABLE IF NOT EXISTS CommandeProduit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idCommande INT NOT NULL,
    idProduit INT NOT NULL,
    quantite INT NOT NULL,
    prix DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
