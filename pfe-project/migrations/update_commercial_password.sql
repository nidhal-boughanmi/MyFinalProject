USE ProjetPfeAgil;

-- Update the commercial user's password with the new hash
UPDATE Utilisateur 
SET mot_de_passe = '$2a$10$thCh07Vv7S88WrOo9uDPy.ihUMAw1Z.MAurgYNPXrEpAd4Jo9OgTG'
WHERE mail = 'commercial@agil.com';
