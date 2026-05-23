<?php
/**
 * Classe Auth — gestion des sessions utilisateur
 */
class Auth
{
    private const SESSION_KEY = 'hb_user';

    public static function start(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function login(array $user): void
    {
        self::start();
        $_SESSION[self::SESSION_KEY] = User::safe($user);
    }

    public static function logout(): void
    {
        self::start();
        $_SESSION = [];
        session_destroy();
    }

    public static function currentUser(): ?array
    {
        self::start();
        return $_SESSION[self::SESSION_KEY] ?? null;
    }

    public static function requireLogin(): array
    {
        $user = self::currentUser();
        if (!$user) {
            Response::unauthorized();
        }
        return $user;
    }

    public static function requireAdmin(): array
    {
        $user = self::requireLogin();
        if (($user['role'] ?? '') !== 'admin') {
            Response::forbidden('Accès réservé à l\'administrateur.');
        }
        return $user;
    }

    public static function isLoggedIn(): bool
    {
        return self::currentUser() !== null;
    }

    public static function isAdmin(): bool
    {
        $user = self::currentUser();
        return $user && ($user['role'] ?? '') === 'admin';
    }
}
