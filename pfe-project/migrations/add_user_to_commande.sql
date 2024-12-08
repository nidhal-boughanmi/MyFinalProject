USE ProjetPfeAgil;

-- Ajout de la colonne idUtilisateur
ALTER TABLE Commande
ADD COLUMN idUtilisateur BIGINT,
ADD CONSTRAINT fk_commande_utilisateur
FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(identifiant);
