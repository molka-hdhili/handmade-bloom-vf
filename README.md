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


- Le CSS et les interfaces sont **identiques** à la version originale
- Les fichiers React/TypeScript/Next.js ont été supprimés
- Le PHP procédural a été remplacé par du PHP OOP avec classes
- Les données JSON (fichiers plats) ont été remplacées par MySQL
- Toute la logique frontend utilise désormais du JavaScript vanilla (ES6+)
