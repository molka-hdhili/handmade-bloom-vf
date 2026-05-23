-- ============================================================
-- Handmade Bloom — Système Fidélité + Roue Configurable
-- Exécutez dans phpMyAdmin > Onglet SQL
-- ============================================================

USE handmade_bloom;

-- 1. Colonnes fidélité dans users (si pas déjà présentes)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS total_depense    DECIMAL(10,2) NOT NULL DEFAULT 0     AFTER role,
  ADD COLUMN IF NOT EXISTS cadeau_offert    VARCHAR(50)   NOT NULL DEFAULT 'aucun' AFTER total_depense,
  ADD COLUMN IF NOT EXISTS cadeau_gagne     VARCHAR(200)  DEFAULT NULL            AFTER cadeau_offert,
  ADD COLUMN IF NOT EXISTS points_fidelite  INT           NOT NULL DEFAULT 0      AFTER cadeau_gagne;

-- 2. Table de configuration de la roue (admin peut modifier les segments)
CREATE TABLE IF NOT EXISTS wheel_config (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  segment_key VARCHAR(60)   NOT NULL UNIQUE,   -- ex: 'livraison_gratuite', 'points_100', 'reduction_10'
  label       VARCHAR(100)  NOT NULL,           -- affiché sur la roue
  segment_type ENUM('livraison_gratuite','produit_offert','cadeau_personnalise','points','reduction') NOT NULL,
  valeur      VARCHAR(50)   DEFAULT NULL,       -- ex: '100' pour 100 pts, '10' pour -10%
  color_bg    VARCHAR(20)   NOT NULL DEFAULT '#fce7f3',
  color_text  VARCHAR(20)   NOT NULL DEFAULT '#9d174d',
  seuil_min   DECIMAL(10,2) NOT NULL DEFAULT 50.00, -- montant minimum commandé pour être éligible
  actif       TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Segments par défaut (admin peut les modifier)
INSERT IGNORE INTO wheel_config 
  (segment_key, label, segment_type, valeur, color_bg, color_text, seuil_min, actif, sort_order)
VALUES
  ('livraison_gratuite_1', 'Livraison gratuite',  'livraison_gratuite',    NULL,  '#dbeafe', '#1d4ed8', 50.00,  1, 1),
  ('points_50',            '50 Points fidélité',  'points',                '50',  '#dcfce7', '#15803d', 50.00,  1, 2),
  ('produit_offert_1',     'Produit offert',      'produit_offert',        NULL,  '#fce7f3', '#be185d', 100.00, 1, 3),
  ('reduction_10',         'Réduction -10%',      'reduction',             '10',  '#fef9c3', '#a16207', 50.00,  1, 4),
  ('points_100',           '100 Points fidélité', 'points',                '100', '#f0fdf4', '#166534', 100.00, 1, 5),
  ('livraison_gratuite_2', 'Livraison gratuite',  'livraison_gratuite',    NULL,  '#e0f2fe', '#0369a1', 50.00,  1, 6),
  ('cadeau_personnalise',  'Cadeau spécial 🎁',   'cadeau_personnalise',   NULL,  '#f3e8ff', '#7c3aed', 150.00, 1, 7),
  ('points_200',           '200 Points fidélité', 'points',                '200', '#fdf4ff', '#a21caf', 150.00, 1, 8);

-- 4. Table d'historique des spins
CREATE TABLE IF NOT EXISTS wheel_spins (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  order_id   INT           DEFAULT NULL,
  segment_key VARCHAR(60)  NOT NULL,
  gift_label VARCHAR(200)  NOT NULL,
  points_gagnes INT        DEFAULT 0,
  statut     ENUM('en_attente','confirme','utilise') NOT NULL DEFAULT 'en_attente',
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table historique des points (pour transparence)
CREATE TABLE IF NOT EXISTS points_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  points     INT           NOT NULL,             -- positif = gain, négatif = utilisation
  raison     VARCHAR(200)  NOT NULL,
  order_id   INT           DEFAULT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Recalculer total_depense clients existants
UPDATE users u
SET u.total_depense = (
    SELECT COALESCE(SUM(o.total), 0)
    FROM orders o
    WHERE o.user_id = u.id AND o.statut = 'livrée'
)
WHERE u.role = 'client';

-- Vérification
SELECT id, name, email, total_depense, points_fidelite, cadeau_offert
FROM users WHERE role = 'client' ORDER BY total_depense DESC;
