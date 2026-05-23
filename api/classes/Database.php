<?php
/**
 * Classe Database — connexion PDO unique (Singleton)
 * Compatible XAMPP / MySQL
 */
class Database
{
    private static ?Database $instance = null;
    private PDO $pdo;

    // ── Paramètres XAMPP par défaut ─────────────────────────
    private string $host     = 'localhost';
    private string $dbname   = 'handmade_bloom';
    private string $username = 'root';
    private string $password = '';           // XAMPP : mot de passe vide
    private string $charset  = 'utf8mb4';
    // ────────────────────────────────────────────────────────

    private function __construct()
    {
        $dsn = "mysql:host={$this->host};dbname={$this->dbname};charset={$this->charset}";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
    }

    /** Retourne l'instance unique */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /** Retourne l'objet PDO */
    public function getPdo(): PDO
    {
        return $this->pdo;
    }

    /** Raccourci : prépare et exécute une requête */
    public function query(string $sql, array $params = []): \PDOStatement
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    /** Retourne le dernier ID inséré */
    public function lastInsertId(): string
    {
        return $this->pdo->lastInsertId();
    }

    // Empêche le clonage et la désérialisation
    private function __clone() {}
    public function __wakeup() { throw new \RuntimeException('Cannot unserialize singleton.'); }
}
