-- ============================================================
-- Handmade Bloom — SQL UPDATE
-- Exécutez ce fichier dans phpMyAdmin > Onglet SQL
-- ============================================================

USE handmade_bloom;

-- 1. Ajouter les colonnes si elles n'existent pas encore
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_depense  DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER role,
  ADD COLUMN IF NOT EXISTS cadeau_offert  VARCHAR(50)   NOT NULL DEFAULT 'aucun' AFTER total_depense,
  ADD COLUMN IF NOT EXISTS cadeau_gagne   VARCHAR(100)  DEFAULT NULL AFTER cadeau_offert;

-- 2. Recalculer total_depense pour tous les clients existants
--    (basé sur leurs commandes déjà marquées "livrée")
UPDATE users u
SET u.total_depense = (
    SELECT COALESCE(SUM(o.total), 0)
    FROM orders o
    WHERE o.user_id = u.id AND o.statut = 'livrée'
)
WHERE u.role = 'client';

-- 3. Vérification : voir les clients et leur solde
SELECT id, name, email, total_depense, cadeau_offert, cadeau_gagne
FROM users
WHERE role = 'client'
ORDER BY total_depense DESC;
