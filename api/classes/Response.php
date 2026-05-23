<?php
/**
 * Classe Response — envoie les réponses JSON et gère les en-têtes HTTP
 */
class Response
{
    public static function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public static function success(string $message, array $extra = [], int $status = 200): void
    {
        self::json(array_merge(['success' => true, 'message' => $message], $extra), $status);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json(['success' => false, 'message' => $message], $status);
    }

    public static function notFound(string $message = 'Ressource introuvable.'): void
    {
        self::error($message, 404);
    }

    public static function unauthorized(string $message = 'Vous devez vous connecter.'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Accès interdit.'): void
    {
        self::error($message, 403);
    }
}
