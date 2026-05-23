<?php
/**
 * bootstrap.php — chargement automatique des classes + headers communs
 * Inclus en tête de chaque endpoint API
 */

session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Gestion des requêtes OPTIONS (CORS preflight pour développement local)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Auto-chargement des classes ─────────────────────────────
spl_autoload_register(function (string $class): void {
    $file = __DIR__ . '/classes/' . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// ── Helpers globaux ────────────────────────────────────────

/** Lit et décode le corps JSON de la requête */
function getInput(): array
{
    $raw  = file_get_contents('php://input');
    $json = json_decode($raw, true);
    return is_array($json) ? $json : ($_POST ?: []);
}

/** Nettoie une chaîne */
function clean(mixed $value): string
{
    return trim((string) $value);
}

/** Retourne la méthode HTTP courante */
function method(): string
{
    return $_SERVER['REQUEST_METHOD'];
}
