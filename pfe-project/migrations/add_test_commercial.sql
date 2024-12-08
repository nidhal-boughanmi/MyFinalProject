USE ProjetPfeAgil;

-- Insert a test commercial user (if not exists)
INSERT INTO Utilisateur (nom, prenom, telephone, mail, mot_de_passe, matricule, roles)
SELECT 'Commercial', 'Test', '123456789', 'commercial@agil.com', 
       '$2a$10$AfqJUAuuTCvRAiPCRiUj0e1lT.Qcr1RpdSIzHOGcehzKYEvtmSfgO', 1003, 'COMMERCIAL'
FROM dual
WHERE NOT EXISTS (
    SELECT 1 FROM Utilisateur WHERE mail = 'commercial@agil.com'
);
