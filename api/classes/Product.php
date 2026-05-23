<?php
/**
 * Classe Product — gestion des produits (OOP / MySQL)
 */
class Product
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
            'SELECT * FROM products ORDER BY id ASC'
        )->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->query(
            'SELECT * FROM products WHERE id = ? LIMIT 1',
            [$id]
        );
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function getByCategory(string $category): array
    {
        return $this->db->query(
            'SELECT * FROM products WHERE category = ? ORDER BY id ASC',
            [$category]
        )->fetchAll();
    }

    public function count(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) AS n FROM products')->fetch()['n'];
    }

    // ── Écriture ─────────────────────────────────────────────

    public function create(array $data): array
    {
        $this->db->query(
            'INSERT INTO products (name, price, category, img, description, badge, rating)
             VALUES (:name, :price, :category, :img, :description, :badge, :rating)',
            [
                ':name'        => trim($data['name']),
                ':price'       => (float) $data['price'],
                ':category'    => trim($data['category']),
                ':img'         => trim($data['img']),
                ':description' => trim($data['desc'] ?? ''),
                ':badge'       => trim($data['badge'] ?? 'New'),
                ':rating'      => trim($data['rating'] ?? '4.8'),
            ]
        );

        $id = (int) $this->db->lastInsertId();
        return $this->findById($id);
    }

    public function update(int $id, array $data): bool
    {
        $product = $this->findById($id);
        if (!$product) return false;

        $this->db->query(
            'UPDATE products
             SET name = :name, price = :price, category = :category,
                 img = :img, description = :description, badge = :badge, rating = :rating
             WHERE id = :id',
            [
                ':name'        => trim($data['name']        ?? $product['name']),
                ':price'       => (float) ($data['price']   ?? $product['price']),
                ':category'    => trim($data['category']    ?? $product['category']),
                ':img'         => trim($data['img']         ?? $product['img']),
                ':description' => trim($data['desc']        ?? $product['description']),
                ':badge'       => trim($data['badge']       ?? $product['badge']),
                ':rating'      => trim($data['rating']      ?? $product['rating']),
                ':id'          => $id,
            ]
        );

        return true;
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->query('DELETE FROM products WHERE id = ?', [$id]);
        return $stmt->rowCount() > 0;
    }
}
