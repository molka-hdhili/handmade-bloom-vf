<?php
/**
 * Classe Feedback — gestion des avis clients (OOP / MySQL)
 */
class Feedback
{
    private Database $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // ── Lecture ─────────────────────────────────────────────

    public function getAll(): array
    {
        return $this->db->query(
            'SELECT * FROM feedbacks ORDER BY id DESC'
        )->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->query(
            'SELECT * FROM feedbacks WHERE id = ? LIMIT 1',
            [$id]
        );
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function count(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) AS n FROM feedbacks')->fetch()['n'];
    }

    // ── Écriture ─────────────────────────────────────────────

    public function create(string $name, string $rating, string $text): array
    {
        $this->db->query(
            'INSERT INTO feedbacks (name, rating, text_avis) VALUES (?, ?, ?)',
            [trim($name), $rating, trim($text)]
        );

        $id = (int) $this->db->lastInsertId();
        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->query('DELETE FROM feedbacks WHERE id = ?', [$id]);
        return $stmt->rowCount() > 0;
    }
}
