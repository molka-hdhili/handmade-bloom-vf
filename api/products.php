<?php
/**
 * api/products.php — CRUD produits
 * GET (public) | POST, PUT, DELETE (admin uniquement)
 */
require_once __DIR__ . '/bootstrap.php';

$input   = getInput();
$product = new Product();

switch (method()) {

    // ── GET : liste de tous les produits ──────────────────────
    case 'GET':
        Response::json([
            'success'  => true,
            'products' => $product->getAll(),
        ]);

    // ── POST : créer un produit ───────────────────────────────
    case 'POST':
        Auth::requireAdmin();

        $name     = clean($input['name']     ?? '');
        $price    = (float) ($input['price'] ?? 0);
        $category = clean($input['category'] ?? '');
        $img      = clean($input['img']      ?? '');
        $desc     = clean($input['desc']     ?? '');

        if (!$name || $price <= 0 || !$category || !$img || !$desc) {
            Response::error('Veuillez remplir tous les champs du produit.');
        }

        $newProduct = $product->create($input);
        Response::success('Produit ajouté avec succès.', ['product' => $newProduct], 201);

    // ── PUT : modifier un produit ─────────────────────────────
    case 'PUT':
        Auth::requireAdmin();

        $id = (int) ($input['id'] ?? 0);
        if (!$id) Response::error('ID produit manquant.');

        $updated = $product->update($id, $input);
        if (!$updated) Response::notFound('Produit introuvable.');

        Response::success('Produit modifié avec succès.');

    // ── DELETE : supprimer un produit ─────────────────────────
    case 'DELETE':
        Auth::requireAdmin();

        $id = (int) ($_GET['id'] ?? ($input['id'] ?? 0));
        if (!$id) Response::error('ID produit manquant.');

        $deleted = $product->delete($id);
        if (!$deleted) Response::notFound('Produit introuvable.');

        Response::success('Produit supprimé avec succès.');

    default:
        Response::error('Méthode non autorisée.', 405);
}
