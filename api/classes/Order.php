<?php
/**
 * Classe Order — gestion des commandes (OOP / MySQL)
 */
class Order
{
    private Database $db;

    // Points gagnés par tranche de 10 DT dépensés
    const POINTS_PAR_10DT = 5;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    // ── Lecture ─────────────────────────────────────────────

    public function getAll(): array
    {
        $orders = $this->db->query(
            'SELECT o.*, u.name AS client_account_name, u.email AS client_account_email
             FROM orders o
             JOIN users u ON o.user_id = u.id
             ORDER BY o.id DESC'
        )->fetchAll();

        foreach ($orders as &$order) {
            $order['panier'] = $this->getItems((int) $order['id']);
        }

        return $orders;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->query(
            'SELECT * FROM orders WHERE id = ? LIMIT 1',
            [$id]
        );
        $row = $stmt->fetch();
        if (!$row) return null;

        $row['panier'] = $this->getItems($id);
        return $row;
    }

    public function getByUser(int $userId): array
    {
        $orders = $this->db->query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
            [$userId]
        )->fetchAll();

        foreach ($orders as &$order) {
            $order['panier'] = $this->getItems((int) $order['id']);
        }

        return $orders;
    }

    public function count(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) AS n FROM orders')->fetch()['n'];
    }

    public function totalRevenue(): float
    {
        $result = $this->db->query('SELECT COALESCE(SUM(total), 0) AS rev FROM orders')->fetch();
        return (float) $result['rev'];
    }

    // ── Articles de commande ─────────────────────────────────

    private function getItems(int $orderId): array
    {
        return $this->db->query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [$orderId]
        )->fetchAll();
    }

    // ── Écriture ─────────────────────────────────────────────

    public function create(int $userId, array $data, array $user): int
    {
        $total = (float) ($data['total'] ?? 0);

        $this->db->query(
            'INSERT INTO orders
             (user_id, client_name, client_email, delivery_name, telephone,
              adresse, livraison, note, sous_total, frais_livraison, total, statut)
             VALUES
             (:user_id, :client_name, :client_email, :delivery_name, :telephone,
              :adresse, :livraison, :note, :sous_total, :frais_livraison, :total, :statut)',
            [
                ':user_id'         => $userId,
                ':client_name'     => $user['name'] ?? '',
                ':client_email'    => $user['email'] ?? '',
                ':delivery_name'   => trim($data['client']),
                ':telephone'       => trim($data['telephone']),
                ':adresse'         => trim($data['adresse']),
                ':livraison'       => trim($data['livraison']),
                ':note'            => trim($data['note'] ?? ''),
                ':sous_total'      => (float) ($data['sousTotal'] ?? 0),
                ':frais_livraison' => (float) ($data['fraisLivraison'] ?? 0),
                ':total'           => $total,
                ':statut'          => 'en attente',
            ]
        );

        $orderId = (int) $this->db->lastInsertId();

        foreach (($data['panier'] ?? []) as $item) {
            $this->db->query(
                'INSERT INTO order_items (order_id, product_id, name, price, quantity)
                 VALUES (?, ?, ?, ?, ?)',
                [
                    $orderId,
                    (int) ($item['id']       ?? 0),
                    trim($item['name']       ?? ''),
                    (float) ($item['price']  ?? 0),
                    (int) ($item['quantity'] ?? 1),
                ]
            );
        }

        // ── Points fidélité : +X pts par tranche de 10 DT ───────────
        if ($total >= 10) {
            $pointsGagnes = (int) floor($total / 10) * self::POINTS_PAR_10DT;

            // Vérifier si la table points_fidelite existe
            $colExists = $this->db->query(
                "SELECT COUNT(*) AS n FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                 AND COLUMN_NAME = 'points_fidelite'"
            )->fetch();

            if ((int)($colExists['n'] ?? 0) > 0 && $pointsGagnes > 0) {
                $this->db->query(
                    'UPDATE users SET points_fidelite = points_fidelite + ? WHERE id = ?',
                    [$pointsGagnes, $userId]
                );

                // Historique des points si la table existe
                $histExists = $this->db->query(
                    "SELECT COUNT(*) AS n FROM information_schema.TABLES
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'points_history'"
                )->fetch();
                if ((int)($histExists['n'] ?? 0) > 0) {
                    $this->db->query(
                        'INSERT INTO points_history (user_id, points, raison, order_id) VALUES (?,?,?,?)',
                        [$userId, $pointsGagnes, "Commande #{$orderId} — " . number_format($total, 2) . " DT", $orderId]
                    );
                }
            }
        }

        return $orderId;
    }

    public function updateStatus(int $id, string $statut): bool
    {
        $stmt = $this->db->query(
            'UPDATE orders SET statut = ? WHERE id = ?',
            [$statut, $id]
        );
        $updated = $stmt->rowCount() > 0;

        // Quand une commande passe à "livrée", recalculer total_depense du client
        if ($updated && $statut === 'livrée') {
            $order = $this->db->query(
                'SELECT user_id FROM orders WHERE id = ?',
                [$id]
            )->fetch();

            if ($order) {
                $this->db->query(
                    'UPDATE users
                     SET total_depense = (
                         SELECT COALESCE(SUM(total), 0)
                         FROM orders
                         WHERE user_id = ? AND statut = \'livrée\'
                     )
                     WHERE id = ?',
                    [$order['user_id'], $order['user_id']]
                );
            }
        }

        return $updated;
    }
}
