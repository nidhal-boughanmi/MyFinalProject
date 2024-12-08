-- Insérer un utilisateur gérant de test
INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles)
VALUES (
    'Gérant',
    'Test',
    '12345678',
    'gerant.test@station.com',
    '$2a$10$9CQasSgmAVaReV2N.FdK/eBWfZXIVCGAkADz4b0TxdxGHtSMXFplq',  -- Mot de passe: Test123!
    123456,
    'GERANT'
);

-- Récupérer l'ID de l'utilisateur créé
SET @gerant_id = LAST_INSERT_ID();

-- Insérer les informations du gérant dans la table Gerant
INSERT INTO Gerant (idGerant, nom, prenom, matricule, numGerant, idStation)
VALUES (
    @gerant_id,
    'Gérant',
    'Test',
    123456,
    789012,
    1  -- Assurez-vous qu'une station avec cet ID existe
);
