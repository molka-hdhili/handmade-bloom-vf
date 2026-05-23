<?php
/**
 * api/auth.php — Authentification (register / login / logout / current)
 * Utilise les classes : Auth, User, Response
 */
require_once __DIR__ . '/bootstrap.php';

$input  = getInput();
$action = $_GET['action'] ?? ($input['action'] ?? 'current');
$userModel = new User();

// ── GET current ─────────────────────────────────────────────
if ($action === 'current') {
    $user = Auth::currentUser();
    Response::json([
        'success'  => true,
        'loggedIn' => (bool) $user,
        'user'     => $user,
    ]);
}

// ── POST register ────────────────────────────────────────────
if ($action === 'register') {
    $name            = clean($input['name']            ?? '');
    $email           = strtolower(clean($input['email'] ?? ''));
    $password        = (string) ($input['password']        ?? '');
    $confirmPassword = (string) ($input['confirmPassword'] ?? '');

    if (!$name || !$email || !$password || !$confirmPassword) {
        Response::error('Veuillez remplir tous les champs.');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Response::error('Adresse email invalide.');
    }

    if (strlen($password) < 6) {
        Response::error('Le mot de passe doit contenir au moins 6 caractères.');
    }

    if ($password !== $confirmPassword) {
        Response::error('Les mots de passe ne sont pas identiques.');
    }

    if ($email === 'admin@handmade.com') {
        Response::error('Cet email est réservé à l\'administrateur.');
    }

    if ($userModel->emailExists($email)) {
        Response::error('Cet email existe déjà.', 409);
    }

    $newUser = $userModel->create($name, $email, $password);

    Response::success('Compte créé avec succès 🌸', ['user' => $newUser], 201);
}

// ── POST login ───────────────────────────────────────────────
if ($action === 'login') {
    $email    = strtolower(clean($input['email']    ?? ''));
    $password = (string) ($input['password'] ?? '');

    if (!$email || !$password) {
        Response::error('Veuillez remplir tous les champs.');
    }

    $userRow = $userModel->findByEmail($email);

    if (!$userRow || !$userModel->verifyPassword($password, $userRow['password'])) {
        Response::error('Email ou mot de passe incorrect.', 401);
    }

    $safeUser = User::safe($userRow);
    Auth::login($userRow);

    Response::success('Connexion réussie 💖', ['user' => $safeUser]);
}

// ── POST logout ──────────────────────────────────────────────
if ($action === 'logout') {
    Auth::logout();
    Response::success('Déconnexion réussie.');
}

Response::error('Action inconnue.', 400);
