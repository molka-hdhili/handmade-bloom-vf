-- ============================================================
-- Handmade Bloom - Base de données MySQL / XAMPP
-- Exécutez ce fichier dans phpMyAdmin ou la console MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS handmade_bloom
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE handmade_bloom;

-- ============================================================
-- Table : utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(180)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('client','admin') NOT NULL DEFAULT 'client',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table : produits
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200)  NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  category    VARCHAR(80)   NOT NULL,
  img         VARCHAR(300)  NOT NULL,
  description TEXT,
  badge       VARCHAR(60)   DEFAULT 'New',
  rating      VARCHAR(10)   DEFAULT '4.8',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table : commandes
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  client_name     VARCHAR(120) NOT NULL,
  client_email    VARCHAR(180),
  delivery_name   VARCHAR(120) NOT NULL,
  telephone       VARCHAR(30)  NOT NULL,
  adresse         TEXT NOT NULL,
  livraison       VARCHAR(50)  NOT NULL,
  note            TEXT,
  sous_total      DECIMAL(10,2) NOT NULL DEFAULT 0,
  frais_livraison DECIMAL(10,2) NOT NULL DEFAULT 0,
  total           DECIMAL(10,2) NOT NULL DEFAULT 0,
  statut          VARCHAR(50)  NOT NULL DEFAULT 'en attente',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table : articles de commande (panier)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT NOT NULL,
  product_id INT NOT NULL,
  name       VARCHAR(200) NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table : feedbacks
-- ============================================================
CREATE TABLE IF NOT EXISTS feedbacks (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  rating     VARCHAR(20)  NOT NULL DEFAULT '★★★★★',
  text_avis  TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Compte administrateur par défaut
-- Email : admin@handmade.com  /  Mot de passe : admin123
-- ============================================================
INSERT IGNORE INTO users (name, email, password, role)
VALUES (
  'Admin Handmade Bloom',
  'admin@handmade.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'admin'
);

-- ============================================================
-- Produits de démonstration
-- ============================================================
INSERT IGNORE INTO products (name, price, category, img, description, badge, rating) VALUES
-- Bijoux
('Bijou handmade rose',    25.00, 'bijoux',      'image/A2.jpg',  'Bijou handmade élégant et girly.',                  'Best seller', '4.9'),
('Bracelet perlé doux',    28.00, 'bijoux',      'image/A14.jpg', 'Bracelet fait main avec finition raffinée.',         'Nouveau',     '4.8'),
('Collier minimaliste',    32.00, 'bijoux',      'image/A15.jpg', 'Collier doux pour un look féminin.',                 'Chic',        '4.7'),
('Bijou fleuri',           30.00, 'bijoux',      'image/A12.jpg', 'Création handmade inspirée des fleurs.',             'Lovely',      '4.9'),
('Bracelet mer vibe',      24.00, 'bijoux',      'image/A7.jpg',  'Un bracelet léger, doux et élégant.',                'Cute',        '4.8'),
('Collier cœur',           38.00, 'bijoux',      'image/A16.jpg', 'Collier cœur parfait pour un cadeau.',               'Top',         '5.0'),
('Bracelet Tortue',        27.00, 'bijoux',      'image/A4.jpg',  'Bracelet croché avec une tortue fine.',              'Handmade',    '4.8'),
('Bracelet coccinelle',    29.00, 'bijoux',      'image/A5.jpg',  'Bracelet féminin pour tous les jours.',              'Favori',      '4.9'),
('Bijou abeille',          34.00, 'bijoux',      'image/A3.jpg',  'Création cute faite avec amour.',                   'Romantic',    '4.8'),
('Boucle fraise',          45.00, 'bijoux',      'image/A10.jpg', 'Set handmade élégant et doux.',                     'Set',         '5.0'),
-- Bougies
('Bougie vanille fleurie', 32.00, 'bougies',     'image/B6.jpg',  'Bougie parfumée artisanale douce et girly.',         'Nouveau',     '4.8'),
('Bougie Lavende',         29.00, 'bougies',     'image/B9.jpg',  'Bougie décorative parfaite pour un cadeau.',         'Promo',       '4.8'),
('Bougie florale',         35.00, 'bougies',     'image/B5.jpg',  'Parfum floral doux et ambiance cosy.',               'Flower',      '4.9'),
('Tasse Bougie',           30.00, 'bougies',     'image/B13.jpg', 'Bougie handmade au style pastel.',                   'Cute',        '4.7'),
('Bougie décorative Bois', 33.00, 'bougies',     'image/B10.jpg', 'Belle bougie pour décorer votre espace.',            'Decor',       '4.8'),
('Bougie cadeau',          39.00, 'bougies',     'image/B2.jpg',  'Bougie parfaite pour offrir.',                       'Gift',        '5.0'),
('Bougie romantique',      36.00, 'bougies',     'image/B8.jpg',  'Ambiance romantique et senteur douce.',              'Romantic',    '4.9'),
('Bougie cosy',            31.00, 'bougies',     'image/B3.jpg',  'Bougie cosy pour une ambiance chaleureuse.',         'Cosy',        '4.7'),
-- Accessoires
('Carnet fleuri',          18.00, 'accessoires', 'image/H1.jpg',  'Carnet décoré à la main.',                          'Nouveau',     '4.8'),
('Pochette brodée',        22.00, 'accessoires', 'image/H2.jpg',  'Pochette brodée avec motifs floraux.',               'Chic',        '4.9'),
('Porte-clés cœur',        14.00, 'accessoires', 'image/H3.jpg',  'Porte-clés fait main, cadeau idéal.',                'Cute',        '4.7'),
('Scrunchie satiné',       12.00, 'accessoires', 'image/H4.jpg',  'Scrunchie doux et élégant.',                        'Girly',       '4.8'),
('Kit papeterie',          26.00, 'accessoires', 'image/H5.jpg',  'Kit papeterie handmade coloré.',                    'Set',         '4.9'),
('Marque-page floral',     10.00, 'accessoires', 'image/H6.jpg',  'Marque-page décoré de fleurs séchées.',             'Handmade',    '4.8');

-- ============================================================
-- Feedbacks de démonstration
-- ============================================================
INSERT IGNORE INTO feedbacks (name, rating, text_avis) VALUES
('Lina',   '★★★★★', 'J\'ai adoré le packaging, très doux et girly !'),
('Mariem', '★★★★★', 'Produit magnifique, exactement comme sur la photo.'),
('Nour',   '★★★★☆', 'Très belle qualité handmade, je recommande.');
