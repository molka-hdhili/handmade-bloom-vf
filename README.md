# Handmade Bloom — Guide d'installation XAMPP

## Stack technique
- **Frontend** : HTML5 / CSS3 / JavaScript vanilla (ES6+)
- **Backend**  : PHP 8+ OOP (classes, PDO, sessions)
- **Base de données** : MySQL via XAMPP
- **Serveur** : Apache (XAMPP)

---

## Structure du projet

```
handmade-bloom/
├── index.html          ← Page principale
├── login.html          ← Connexion
├── register.html       ← Inscription
├── admin.html          ← Dashboard administrateur
├── style.css           ← Feuille de style complète
│
├── js/
│   ├── app.js          ← Logique frontend principale
│   ├── auth.js         ← Authentification côté client
│   └── admin.js        ← Dashboard admin côté client
│
├── api/
│   ├── bootstrap.php   ← Config commune + autoload classes
│   ├── auth.php        ← Endpoint authentification
│   ├── products.php    ← Endpoint produits (CRUD)
│   ├── orders.php      ← Endpoint commandes
│   ├── feedbacks.php   ← Endpoint feedbacks
│   ├── stats.php       ← Endpoint statistiques admin
│   ├── database.sql    ← Script SQL à exécuter dans phpMyAdmin
│   └── classes/
│       ├── Database.php ← Connexion PDO Singleton
│       ├── Auth.php     ← Gestion sessions
│       ├── User.php     ← Modèle utilisateurs
│       ├── Product.php  ← Modèle produits
│       ├── Order.php    ← Modèle commandes
│       ├── Feedback.php ← Modèle feedbacks
│       └── Response.php ← Helper réponses JSON
│
└── image/
    └── ...             ← Photos produits, logo, owners
```

---

## Installation pas à pas

### 1. Démarrer XAMPP

Ouvrez le **XAMPP Control Panel** et démarrez :
- ✅ **Apache**
- ✅ **MySQL**

---

### 2. Copier le projet

Placez le dossier `handmade-bloom` dans le répertoire htdocs de XAMPP :

- **Windows** : `C:\xampp\htdocs\handmade-bloom\`
- **Mac/Linux** : `/opt/lampp/htdocs/handmade-bloom/`

---

### 3. Créer la base de données

1. Ouvrez **phpMyAdmin** : http://localhost/phpmyadmin
2. Cliquez sur **"Importer"** (onglet en haut)
3. Choisissez le fichier `api/database.sql`
4. Cliquez **"Exécuter"**

Cela crée automatiquement :
- La base `handmade_bloom`
- Les tables `users`, `products`, `orders`, `order_items`, `feedbacks`
- Le compte admin et les produits de démonstration

---

### 4. Vérifier la configuration DB

Si votre XAMPP a un mot de passe MySQL différent de vide, modifiez :

**`api/classes/Database.php`** — ligne 16 :
```php
private string $password = '';  // Mettez votre mot de passe ici
```

---

### 5. Lancer le site

Ouvrez : **http://localhost/handmade-bloom/**

---

## Comptes disponibles

| Rôle  | Email                 | Mot de passe |
|-------|-----------------------|--------------|
| Admin | admin@handmade.com    | admin123     |
| Client| Créez un compte via Register |         |

---

## Architecture PHP OOP

Chaque classe a une responsabilité unique :

| Classe       | Rôle                              |
|--------------|-----------------------------------|
| `Database`   | Connexion PDO Singleton           |
| `Auth`       | Sessions PHP (login/logout)       |
| `User`       | CRUD utilisateurs + hachage MDP   |
| `Product`    | CRUD produits                     |
| `Order`      | Commandes + items                 |
| `Feedback`   | Avis clients                      |
| `Response`   | Réponses JSON standardisées       |

---

## Notes importantes

- Le CSS et les interfaces sont **identiques** à la version originale
- Les fichiers React/TypeScript/Next.js ont été supprimés
- Le PHP procédural a été remplacé par du PHP OOP avec classes
- Les données JSON (fichiers plats) ont été remplacées par MySQL
- Toute la logique frontend utilise désormais du JavaScript vanilla (ES6+)
