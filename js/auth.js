/**
 * auth.js — Authentification côté client (vanilla JS)
 * Communique avec api/auth.php
 */

const AUTH_API = 'api/auth.php';

// ── Utilitaire fetch ──────────────────────────────────────────
async function hbApi(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const data = await response
    .json()
    .catch(() => ({ success: false, message: 'Réponse serveur invalide.' }));

  if (!response.ok && !data.message) data.message = 'Une erreur est survenue.';

  return data;
}

function showMsg(el, message, color) {
  if (!el) return;
  el.textContent = message;
  el.style.color = color;
}

// ── Session courante ──────────────────────────────────────────
async function getCurrentUser() {
  const data = await hbApi(`${AUTH_API}?action=current`, { method: 'GET' });

  if (data.success && data.loggedIn && data.user) {
    localStorage.setItem('hb_current_user', JSON.stringify(data.user));
    return data.user;
  }

  localStorage.removeItem('hb_current_user');
  return null;
}

// ── Inscription ───────────────────────────────────────────────
async function registerUser() {
  const name            = document.getElementById('registerName').value.trim();
  const email           = document.getElementById('registerEmail').value.trim();
  const password        = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const msgEl           = document.getElementById('registerMessage');

  if (!name || !email || !password || !confirmPassword) {
    showMsg(msgEl, 'Veuillez remplir tous les champs.', 'crimson');
    return;
  }

  showMsg(msgEl, 'Création du compte...', '#777');

  const data = await hbApi(`${AUTH_API}?action=register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  if (!data.success) {
    showMsg(msgEl, data.message || "Erreur lors de l'inscription.", 'crimson');
    return;
  }

  showMsg(msgEl, data.message || 'Compte créé avec succès 💖', '#ff7eb6');

  setTimeout(() => { window.location.href = 'login.html'; }, 1200);
}

// ── Connexion ─────────────────────────────────────────────────
async function loginUser() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const msgEl    = document.getElementById('loginMessage');

  if (!email || !password) {
    showMsg(msgEl, 'Veuillez remplir tous les champs.', 'crimson');
    return;
  }

  showMsg(msgEl, 'Connexion en cours...', '#777');

  const data = await hbApi(`${AUTH_API}?action=login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!data.success) {
    showMsg(msgEl, data.message || 'Email ou mot de passe incorrect.', 'crimson');
    return;
  }

  localStorage.setItem('hb_current_user', JSON.stringify(data.user));
  showMsg(msgEl, data.message || 'Connexion réussie 💖', '#ff7eb6');

  const redirect = localStorage.getItem('hb_redirect_after_login');
  localStorage.removeItem('hb_redirect_after_login');

  setTimeout(() => {
    if (data.user.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      window.location.href = redirect || 'index.html';
    }
  }, 900);
}

// ── Déconnexion ───────────────────────────────────────────────
async function logoutUser() {
  await hbApi(`${AUTH_API}?action=logout`, { method: 'POST', body: JSON.stringify({}) });
  localStorage.removeItem('hb_current_user');
  window.location.href = 'login.html';
}

// ── Protection page admin ─────────────────────────────────────
async function protectAdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

// ── Boutons login/register (binding déclaratif) ───────────────
document.addEventListener('DOMContentLoaded', () => {
  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (loginBtn)    loginBtn.addEventListener('click', loginUser);
  if (registerBtn) registerBtn.addEventListener('click', registerUser);

  // Soumettre avec Entrée
  document.querySelectorAll('#loginEmail, #loginPassword').forEach(input => {
    input.addEventListener('keydown', e => { if (e.key === 'Enter') loginUser(); });
  });
});
