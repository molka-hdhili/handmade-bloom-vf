<?php
/**
 * api/feedbacks.php — Avis clients
 * GET (public) | POST (public) | DELETE (admin)
 */
require_once __DIR__ . '/bootstrap.php';

$input       = getInput();
$feedbackModel = new Feedback();

switch (method()) {

    // ── GET : tous les feedbacks ──────────────────────────────
    case 'GET':
        Response::json([
            'success'   => true,
            'feedbacks' => $feedbackModel->getAll(),
        ]);

    // ── POST : ajouter un feedback ────────────────────────────
    case 'POST':
        $name   = clean($input['name']   ?? '');
        $rating = clean($input['rating'] ?? '★★★★★');
        $text   = clean($input['text']   ?? '');

        if (!$name || !$text) {
            Response::error('Veuillez remplir le feedback.');
        }

        $feedback = $feedbackModel->create($name, $rating, $text);
        Response::success('Feedback ajouté 💕', ['feedback' => $feedback], 201);

    // ── DELETE : supprimer un feedback (admin) ────────────────
    case 'DELETE':
        Auth::requireAdmin();

        $id = (int) ($_GET['id'] ?? ($input['id'] ?? 0));
        if (!$id) Response::error('ID feedback manquant.');

        $deleted = $feedbackModel->delete($id);
        if (!$deleted) Response::notFound('Feedback introuvable.');

        Response::success('Feedback supprimé.');

    default:
        Response::error('Méthode non autorisée.', 405);
}
