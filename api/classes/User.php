<?php
/**
 * Classe User — gestion des utilisateurs (OOP / MySQL)
 */
class User
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // ── Lecture ─────────────────────────────────────────────

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->query(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [strtolower(trim($email))]
        );
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
            [$id]
        );
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getAll(): array
    {
        return $this->db->query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY id ASC'
        )->fetchAll();
    }

    // ── Écriture ─────────────────────────────────────────────

    public function create(string $name, string $email, string $password): array
    {
        $hashed = password_hash($password, PASSWORD_DEFAULT);

        $this->db->query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [trim($name), strtolower(trim($email)), $hashed, 'client']
        );

        return [
            'id'    => (int) $this->db->lastInsertId(),
            'name'  => trim($name),
            'email' => strtolower(trim($email)),
            'role'  => 'client',
        ];
    }

    // ── Validation ─────────────────────────────────────────

    public function verifyPassword(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function emailExists(string $email): bool
    {
        return $this->findByEmail($email) !== null;
    }

    /** Retire le mot de passe de l'array avant de l'envoyer au client */
    public static function safe(array $user): array
    {
        unset($user['password']);
        return $user;
    }
}
