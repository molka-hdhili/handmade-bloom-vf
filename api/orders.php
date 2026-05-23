<?php
/**
 * api/orders.php — Commandes
 * GET (admin) | POST (client connecté) | PUT statut (admin)
 */
require_once __DIR__ . '/bootstrap.php';

$input = getInput();
$orderModel = new Order();

switch (method()) {

    // ── GET : toutes les commandes (admin) ────────────────────
    case 'GET':
        Auth::requireAdmin();
        Response::json([
            'success' => true,
            'orders'  => $orderModel->getAll(),
        ]);

    // ── POST : passer une commande (client) ───────────────────
    case 'POST':
        $user = Auth::requireLogin();

        if (($user['role'] ?? '') === 'admin') {
            Response::forbidden('L\'admin ne peut pas passer une commande.');
        }

        $client    = clean($input['client']    ?? '');
        $telephone = clean($input['telephone'] ?? '');
        $adresse   = clean($input['adresse']   ?? '');
        $livraison = clean($input['livraison'] ?? '');
        $panier    = $input['panier'] ?? [];

        if (!$client || !$telephone || !$adresse || !$livraison || !is_array($panier) || count($panier) === 0) {
            Response::error('Informations de commande incomplètes.', 400);
        }

        $orderId = $orderModel->create((int) $user['id'], $input, $user);
        $order   = $orderModel->findById($orderId);

        // Points calculés automatiquement dans Order::create
        $total        = (float)($input['total'] ?? 0);
        $pointsGagnes = $total >= 10 ? (int)floor($total / 10) * Order::POINTS_PAR_10DT : 0;

        // Points courants du client
        $db = Database::getInstance();
        $colExists = $db->query(
            "SELECT COUNT(*) AS n FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
             AND COLUMN_NAME = 'points_fidelite'"
        )->fetch();
        $currentPts = 0;
        if ((int)($colExists['n'] ?? 0) > 0) {
            $row = $db->query('SELECT points_fidelite FROM users WHERE id = ?', [$user['id']])->fetch();
            $currentPts = (int)($row['points_fidelite'] ?? 0);
        }

        // Roue éligible si total ≥ 50 DT
        $wheelEligible = $total >= 50.0;

        Response::json([
            'success'         => true,
            'message'         => 'Commande confirmée avec succès 💖',
            'order'           => $order,
            'wheel_eligible'  => $wheelEligible,
            'order_total'     => $total,
            'points_gagnes'   => $pointsGagnes,
            'points_total'    => $currentPts,
        ], 201);

    // ── PUT : changer le statut (admin) ───────────────────────
    case 'PUT':
        Auth::requireAdmin();

        $id     = (int) ($input['id']     ?? 0);
        $statut = clean($input['statut']  ?? '');

        if (!$id || !$statut) {
            Response::error('ID ou statut manquant.');
        }

        $updated = $orderModel->updateStatus($id, $statut);
        if (!$updated) Response::notFound('Commande introuvable.');

        Response::success('Statut modifié.');

    default:
        Response::error('Méthode non autorisée.', 405);
}
