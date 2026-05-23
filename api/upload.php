<?php
/**
 * api/upload.php — Upload image produit (admin uniquement)
 * POST multipart/form-data avec champ "image"
 */
require_once __DIR__ . '/bootstrap.php';

Auth::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Méthode non autorisée.', 405);
}

if (empty($_FILES['image'])) {
    Response::error('Aucun fichier envoyé.');
}

$file      = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$maxSize   = 5 * 1024 * 1024; // 5 Mo

// Vérifications
if ($file['error'] !== UPLOAD_ERR_OK) {
    Response::error('Erreur lors de l\'upload. Code : ' . $file['error']);
}

if (!in_array($file['type'], $allowedTypes)) {
    Response::error('Format non autorisé. Utilisez JPG, PNG, WEBP ou GIF.');
}

if ($file['size'] > $maxSize) {
    Response::error('Fichier trop lourd (max 5 Mo).');
}

// Dossier de destination
$uploadDir = __DIR__ . '/../image/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Nom unique
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$filename = 'prod_' . uniqid() . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    Response::error('Impossible de sauvegarder le fichier.');
}

Response::success('Image uploadée avec succès.', [
    'path' => 'image/' . $filename,
    'url'  => 'image/' . $filename,
]);
