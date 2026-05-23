<?php
/**
 * api/points.php — Fidélité : roue, points, configuration admin
 *
 * GET  ?action=my_status        → statut complet du client (roue dispo + pts)
 * GET  ?action=wheel_config     → segments actifs de la roue (public)
 * GET  (admin)                  → liste clients + stats cadeaux
 * GET  ?action=admin_config     → config roue pour l'admin
 *
 * POST action=spin              → client tourne la roue après commande ≥ 50 DT
 * POST action=use_points        → client utilise ses points
 * POST action=update_config     → admin modifie les segments de la roue
 * POST action=reset_spin        → admin reset le spin d'un client
 * POST action=add_points        → admin ajoute/retire des points manuellement
 * POST action=confirm_spin      → admin confirme/marque le spin comme traité
 */
require_once __DIR__ . '/bootstrap.php';

$db    = Database::getInstance();
$input = getInput();

$httpMethod = method();
$action     = $_GET['action'] ?? ($input['action'] ?? '');

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

/** Vérifie si le client est éligible à la roue (commande ≥ seuil min global = 50 DT) */
function isEligibleForWheel(float $orderTotal): bool {
    return $orderTotal >= 50.0;
}

/** Récupère les segments actifs de la roue depuis la DB */
function getActiveSegments(object $db): array {
    return $db->query(
        'SELECT * FROM wheel_config WHERE actif = 1 ORDER BY sort_order ASC'
    )->fetchAll();
}

/** Retourne les segments compatibles avec le total de commande du client */
function getEligibleSegments(array $segments, float $orderTotal): array {
    return array_values(array_filter($segments, fn($s) => $orderTotal >= (float)$s['seuil_min']));
}

// ════════════════════════════════════════════════════════════
// GET — statut client (roue dispo, points, historique)
// ════════════════════════════════════════════════════════════
if ($httpMethod === 'GET' && $action === 'my_status') {
    $user = Auth::currentUser();
    if (!$user || $user['role'] !== 'client') Response::error('Non autorisé.', 401);

    $row = $db->query(
        'SELECT total_depense, cadeau_offert, cadeau_gagne, points_fidelite FROM users WHERE id = ?',
        [$user['id']]
    )->fetch();

    // Historique des spins
    $spins = $db->query(
        'SELECT * FROM wheel_spins WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [$user['id']]
    )->fetchAll();

    // Historique des points
    $pts_history = $db->query(
        'SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [$user['id']]
    )->fetchAll();

    Response::json([
        'success'          => true,
        'total_depense'    => (float)($row['total_depense'] ?? 0),
        'points_fidelite'  => (int)($row['points_fidelite'] ?? 0),
        'cadeau_gagne'     => $row['cadeau_gagne'] ?? null,
        'spins'            => $spins,
        'points_history'   => $pts_history,
    ]);
}

// ════════════════════════════════════════════════════════════
// GET — configuration roue (segments actifs, public)
// ════════════════════════════════════════════════════════════
if ($httpMethod === 'GET' && $action === 'wheel_config') {
    $segments = getActiveSegments($db);
    Response::json(['success' => true, 'segments' => $segments]);
}

// ════════════════════════════════════════════════════════════
// GET — config roue pour admin
// ════════════════════════════════════════════════════════════
if ($httpMethod === 'GET' && $action === 'admin_config') {
    Auth::requireAdmin();
    $all = $db->query('SELECT * FROM wheel_config ORDER BY sort_order ASC')->fetchAll();
    Response::json(['success' => true, 'segments' => $all]);
}

// ════════════════════════════════════════════════════════════
// GET — liste clients (admin principal)
// ════════════════════════════════════════════════════════════
if ($httpMethod === 'GET') {
    Auth::requireAdmin();

    $clients = $db->query(
        'SELECT u.id, u.name, u.email, u.total_depense, u.cadeau_offert,
                u.cadeau_gagne, u.points_fidelite,
                COUNT(o.id) AS nb_commandes_livrees
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id AND o.statut = \'livrée\'
         WHERE u.role = \'client\'
         GROUP BY u.id
         ORDER BY u.total_depense DESC'
    )->fetchAll();

    // Spins en attente de confirmation admin
    $pendingSpins = $db->query(
        'SELECT ws.*, u.name AS client_name, u.email AS client_email
         FROM wheel_spins ws
         JOIN users u ON ws.user_id = u.id
         WHERE ws.statut = \'en_attente\'
         ORDER BY ws.created_at DESC'
    )->fetchAll();

    foreach ($clients as &$c) {
        $c['total_depense']   = (float)$c['total_depense'];
        $c['points_fidelite'] = (int)$c['points_fidelite'];
    }

    $seuils = ['livraison_gratuite' => 50, 'produit_offert' => 100, 'cadeau_personnalise' => 150];

    Response::json([
        'success'       => true,
        'clients'       => array_values($clients),
        'pending_spins' => $pendingSpins,
        'total_gifts'   => count($pendingSpins),
        'seuils'        => $seuils,
    ]);
}

// ════════════════════════════════════════════════════════════
// POST
// ════════════════════════════════════════════════════════════
if ($httpMethod === 'POST') {

    // ── spin : client tourne la roue après commande ──────────
    if ($action === 'spin') {
        $user = Auth::currentUser();
        if (!$user || $user['role'] !== 'client') Response::error('Non autorisé.', 401);

        $orderId    = (int)($input['order_id']    ?? 0);
        $orderTotal = (float)($input['order_total'] ?? 0);
        $segmentKey = clean($input['segment_key'] ?? '');
        $giftLabel  = clean($input['gift_label']  ?? '');

        if (!$orderId || !$segmentKey || !$giftLabel) {
            Response::error('Données manquantes.');
        }

        if (!isEligibleForWheel($orderTotal)) {
            Response::error('Commande inférieure à 50 DT — pas de roue.');
        }

        // Vérifier que ce spin n'a pas déjà été fait pour cette commande
        $existingSpin = $db->query(
            'SELECT id FROM wheel_spins WHERE user_id = ? AND order_id = ?',
            [$user['id'], $orderId]
        )->fetch();
        if ($existingSpin) Response::error('Vous avez déjà tourné la roue pour cette commande.');

        // Récupérer le segment choisi
        $segment = $db->query(
            'SELECT * FROM wheel_config WHERE segment_key = ? AND actif = 1',
            [$segmentKey]
        )->fetch();
        if (!$segment) Response::error('Segment invalide.');

        // Calculer les points à attribuer directement si c'est un segment "points"
        $pointsGagnes = 0;
        if ($segment['segment_type'] === 'points') {
            $pointsGagnes = (int)($segment['valeur'] ?? 0);
            // Ajouter les points immédiatement
            $db->query(
                'UPDATE users SET points_fidelite = points_fidelite + ? WHERE id = ?',
                [$pointsGagnes, $user['id']]
            );
            // Historique
            $db->query(
                'INSERT INTO points_history (user_id, points, raison, order_id) VALUES (?,?,?,?)',
                [$user['id'], $pointsGagnes, 'Roue fidélité — ' . $giftLabel, $orderId]
            );
        }

        // Enregistrer le spin
        $db->query(
            'INSERT INTO wheel_spins (user_id, order_id, segment_key, gift_label, points_gagnes, statut)
             VALUES (?,?,?,?,?,?)',
            [
                $user['id'], $orderId, $segmentKey, $giftLabel, $pointsGagnes,
                $segment['segment_type'] === 'points' ? 'confirme' : 'en_attente'
            ]
        );

        // Mettre à jour cadeau_gagne sur le user (pour compatibilité ancienne)
        $db->query(
            'UPDATE users SET cadeau_gagne = ? WHERE id = ?',
            [$giftLabel, $user['id']]
        );

        $msg = $segment['segment_type'] === 'points'
            ? "🎉 +{$pointsGagnes} points ajoutés à votre compte !"
            : "🎁 Cadeau enregistré ! L'admin vous contactera bientôt.";

        Response::json([
            'success'       => true,
            'message'       => $msg,
            'points_gagnes' => $pointsGagnes,
            'statut'        => $segment['segment_type'],
        ]);
    }

    // ── use_points : client utilise ses points ───────────────
    if ($action === 'use_points') {
        $user = Auth::currentUser();
        if (!$user || $user['role'] !== 'client') Response::error('Non autorisé.', 401);

        $pointsToUse = (int)($input['points'] ?? 0);
        $raison      = clean($input['raison'] ?? 'Utilisation points');

        if ($pointsToUse <= 0) Response::error('Nombre de points invalide.');

        $row = $db->query(
            'SELECT points_fidelite FROM users WHERE id = ?',
            [$user['id']]
        )->fetch();

        if ((int)$row['points_fidelite'] < $pointsToUse) {
            Response::error('Points insuffisants (' . $row['points_fidelite'] . ' pts disponibles).');
        }

        $db->query(
            'UPDATE users SET points_fidelite = points_fidelite - ? WHERE id = ?',
            [$pointsToUse, $user['id']]
        );
        $db->query(
            'INSERT INTO points_history (user_id, points, raison) VALUES (?,?,?)',
            [$user['id'], -$pointsToUse, $raison]
        );

        Response::success('Points utilisés avec succès.', ['points_restants' => (int)$row['points_fidelite'] - $pointsToUse]);
    }

    // ── update_config : admin modifie les segments ───────────
    if ($action === 'update_config') {
        Auth::requireAdmin();
        $segments = $input['segments'] ?? [];
        if (!is_array($segments)) Response::error('Format invalide.');

        foreach ($segments as $seg) {
            $key = clean($seg['segment_key'] ?? '');
            if (!$key) continue;

            // Vérifier si existe
            $existing = $db->query('SELECT id FROM wheel_config WHERE segment_key = ?', [$key])->fetch();

            $label    = clean($seg['label']    ?? '');
            $colorBg  = clean($seg['color_bg'] ?? '#fce7f3');
            $colorTxt = clean($seg['color_text'] ?? '#9d174d');
            $seuilMin = (float)($seg['seuil_min'] ?? 50);
            $actif    = isset($seg['actif']) ? (int)(bool)$seg['actif'] : 1;
            $type     = clean($seg['segment_type'] ?? 'livraison_gratuite');
            $valeur   = clean($seg['valeur'] ?? '');
            $order    = (int)($seg['sort_order'] ?? 0);

            if ($existing) {
                $db->query(
                    'UPDATE wheel_config SET label=?, segment_type=?, valeur=?, color_bg=?, color_text=?,
                     seuil_min=?, actif=?, sort_order=? WHERE segment_key=?',
                    [$label, $type, $valeur ?: null, $colorBg, $colorTxt, $seuilMin, $actif, $order, $key]
                );
            } else {
                $db->query(
                    'INSERT INTO wheel_config (segment_key,label,segment_type,valeur,color_bg,color_text,seuil_min,actif,sort_order)
                     VALUES (?,?,?,?,?,?,?,?,?)',
                    [$key, $label, $type, $valeur ?: null, $colorBg, $colorTxt, $seuilMin, $actif, $order]
                );
            }
        }
        Response::success('Configuration mise à jour.');
    }

    // ── confirm_spin : admin confirme un spin ────────────────
    if ($action === 'confirm_spin') {
        Auth::requireAdmin();
        $spinId = (int)($input['spin_id'] ?? 0);
        if (!$spinId) Response::error('spin_id manquant.');

        $db->query(
            'UPDATE wheel_spins SET statut = ? WHERE id = ?',
            ['confirme', $spinId]
        );
        Response::success('Spin confirmé.');
    }

    // ── reset_spin : admin reset le spin d'un client ─────────
    if ($action === 'reset_spin') {
        Auth::requireAdmin();
        $userId = (int)($input['user_id'] ?? 0);
        if (!$userId) Response::error('user_id manquant.');

        $db->query(
            'UPDATE wheel_spins SET statut = \'utilise\' WHERE user_id = ? AND statut = \'en_attente\'',
            [$userId]
        );
        $db->query('UPDATE users SET cadeau_gagne = NULL WHERE id = ?', [$userId]);
        Response::success('Spin réinitialisé.');
    }

    // ── add_points : admin ajoute/retire des points ──────────
    if ($action === 'add_points') {
        Auth::requireAdmin();
        $userId = (int)($input['user_id'] ?? 0);
        $points = (int)($input['points']  ?? 0);
        $raison = clean($input['raison']  ?? 'Ajout manuel admin');
        if (!$userId || $points === 0) Response::error('Données manquantes.');

        $db->query(
            'UPDATE users SET points_fidelite = GREATEST(0, points_fidelite + ?) WHERE id = ?',
            [$points, $userId]
        );
        $db->query(
            'INSERT INTO points_history (user_id, points, raison) VALUES (?,?,?)',
            [$userId, $points, $raison]
        );
        $newPts = $db->query('SELECT points_fidelite FROM users WHERE id = ?', [$userId])->fetch();
        Response::success('Points mis à jour.', ['points_fidelite' => (int)$newPts['points_fidelite']]);
    }

    Response::error('Action inconnue.');
}

Response::error('Méthode non autorisée.', 405);
