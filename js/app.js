/**
 * app.js — Page principale Handmade Bloom (vanilla JS)
 * Communique avec api/products.php, api/orders.php, api/feedbacks.php, api/points.php
 */

// ── Produits par défaut (fallback si API indisponible) ────────
const DEFAULT_PRODUCTS = [
  { id:1,  name:'Bijou handmade rose',       price:25, category:'bijoux',      img:'image/A2.jpg',  desc:'Bijou handmade élégant et girly.',              badge:'Best seller', rating:'4.9' },
  { id:2,  name:'Bracelet perlé doux',        price:28, category:'bijoux',      img:'image/A14.jpg', desc:'Bracelet fait main avec finition raffinée.',    badge:'Nouveau',     rating:'4.8' },
  { id:3,  name:'Collier minimaliste',        price:32, category:'bijoux',      img:'image/A15.jpg', desc:'Collier doux pour un look féminin.',            badge:'Chic',        rating:'4.7' },
  { id:4,  name:'Bijou fleuri',               price:30, category:'bijoux',      img:'image/A12.jpg', desc:'Création handmade inspirée des fleurs.',        badge:'Lovely',      rating:'4.9' },
  { id:5,  name:'Bracelet mer vibe',          price:24, category:'bijoux',      img:'image/A7.jpg',  desc:'Un bracelet léger, doux et élégant.',           badge:'Cute',        rating:'4.8' },
  { id:6,  name:'Collier cœur',               price:38, category:'bijoux',      img:'image/A16.jpg', desc:'Collier cœur parfait pour un cadeau.',          badge:'Top',         rating:'5.0' },
  { id:7,  name:'Bracelet Tortue',            price:27, category:'bijoux',      img:'image/A4.jpg',  desc:'Bracelet croché avec une tortue fine.',         badge:'Handmade',    rating:'4.8' },
  { id:8,  name:'Bracelet coccinelle',        price:29, category:'bijoux',      img:'image/A5.jpg',  desc:'Bracelet féminin pour tous les jours.',         badge:'Favori',      rating:'4.9' },
  { id:9,  name:'Bijou abeille',              price:34, category:'bijoux',      img:'image/A3.jpg',  desc:'Création cute faite avec amour.',               badge:'Romantic',    rating:'4.8' },
  { id:10, name:'Boucle fraise',              price:45, category:'bijoux',      img:'image/A10.jpg', desc:'Set handmade élégant et doux.',                badge:'Set',         rating:'5.0' },
  { id:11, name:'Bougie vanille fleurie',     price:32, category:'bougies',     img:'image/B6.jpg',  desc:'Bougie parfumée artisanale douce et girly.',    badge:'Nouveau',     rating:'4.8' },
  { id:12, name:'Bougie Lavende',             price:29, category:'bougies',     img:'image/B9.jpg',  desc:'Bougie décorative parfaite pour un cadeau.',    badge:'Promo',       rating:'4.8' },
  { id:13, name:'Bougie florale',             price:35, category:'bougies',     img:'image/B5.jpg',  desc:'Parfum floral doux et ambiance cosy.',          badge:'Flower',      rating:'4.9' },
  { id:14, name:'Tasse Bougie',               price:30, category:'bougies',     img:'image/B13.jpg', desc:'Bougie handmade au style pastel.',              badge:'Cute',        rating:'4.7' },
  { id:15, name:'Bougie décorative Bois',     price:33, category:'bougies',     img:'image/B10.jpg', desc:'Belle bougie pour décorer votre espace.',       badge:'Decor',       rating:'4.8' },
  { id:16, name:'Bougie cadeau',              price:39, category:'bougies',     img:'image/B2.jpg',  desc:'Bougie parfaite pour offrir.',                  badge:'Gift',        rating:'5.0' },
  { id:17, name:'Bougie romantique',          price:36, category:'bougies',     img:'image/B8.jpg',  desc:'Ambiance romantique et senteur douce.',         badge:'Romantic',    rating:'4.9' },
  { id:18, name:'Bougie cosy',                price:31, category:'bougies',     img:'image/B3.jpg',  desc:'Bougie cosy pour une ambiance chaleureuse.',    badge:'Cosy',        rating:'4.7' },
  { id:19, name:'Bougie artisanale',          price:34, category:'bougies',     img:'image/B5.jpg',  desc:'Bougie faite main avec soin.',                  badge:'Handmade',    rating:'4.8' },
  { id:20, name:'Bougie soft pink',           price:37, category:'bougies',     img:'image/B7.jpg',  desc:'Bougie girly aux tons doux.',                   badge:'Soft',        rating:'4.9' },
  { id:21, name:'Bougie bloom',               price:40, category:'bougies',     img:'image/B4.jpg',  desc:"Bougie inspirée de l'univers floral.",          badge:'Bloom',       rating:'5.0' },
  { id:22, name:'Bougie Fraise',              price:45, category:'bougies',     img:'image/B11.jpg', desc:'Bougie premium avec finition élégante.',        badge:'Premium',     rating:'5.0' },
  { id:23, name:'Porte feuille en croché',    price:18, category:'accessoires', img:'image/H1.jpg',  desc:'Accessoire handmade doux et pratique.',         badge:'Cute',        rating:'4.7' },
  { id:24, name:'Porte bijoux en croché',     price:45, category:'accessoires', img:'image/H6.jpg',  desc:'Petite pochette handmade chic et pratique.',    badge:'Chic',        rating:'4.9' },
  { id:25, name:'Porte bijoux en croché',     price:15, category:'accessoires', img:'image/H7.jpg',  desc:'Accessoire cheveux doux et féminin.',           badge:'Top',         rating:'4.8' },
  { id:26, name:'Pack 4 Hair Clips',          price:35, category:'accessoires', img:'image/H10.jpg', desc:'Trousse handmade avec détails floraux.',        badge:'Flower',      rating:'4.8' },
  { id:27, name:'Porte bijoux en croché',     price:28, category:'accessoires', img:'image/H9.jpg',  desc:'Pièce brodée avec amour.',                     badge:'Brodé',       rating:'4.9' },
  { id:28, name:'Porte clé pinky',            price:55, category:'accessoires', img:'image/H4.jpg',  desc:'Sac doux et pratique pour tous les jours.',     badge:'Bag',         rating:'5.0' },
  { id:29, name:'Set Chapeau bébé fraise',    price:24, category:'accessoires', img:'image/H5.jpg',  desc:'Accessoire inspiré des fleurs.',                badge:'Lovely',      rating:'4.7' },
  { id:30, name:'Bande à cheveux',            price:42, category:'accessoires', img:'image/H12.jpg', desc:'Pochette pastel douce et élégante.',            badge:'Pastel',      rating:'4.8' },
  { id:31, name:'Bande à cheveux rosé',       price:20, category:'accessoires', img:'image/H14.jpg', desc:'Création douce pour compléter votre style.',   badge:'Soft',        rating:'4.7' },
  { id:32, name:'Porte lunettes en croché',   price:33, category:'accessoires', img:'image/H2.jpg',  desc:'Mini pochette pratique et girly.',              badge:'Mini',        rating:'4.8' },
  { id:33, name:'Porte accessoires en cœur',  price:26, category:'accessoires', img:'image/H8.jpg',  desc:'Accessoire élégant fait main.',                badge:'Elegant',     rating:'4.9' },
  { id:34, name:'Création brodée',            price:39, category:'accessoires', img:'image/H13.jpg', desc:'Création artisanale avec broderie.',            badge:'Handmade',    rating:'4.8' },
  { id:35, name:'Sac croché',                 price:27, category:'accessoires', img:'image/H18.jpg', desc:"Accessoire inspiré de Handmade Bloom.",         badge:'Bloom',       rating:'4.7' },
  { id:36, name:'Sac croché',                 price:44, category:'accessoires', img:'image/H19.jpg', desc:'Pochette girly idéale pour offrir.',            badge:'Gift',        rating:'4.9' },
  { id:37, name:'Sac plage croché',           price:48, category:'accessoires', img:'image/H20.jpg', desc:'Accessoire premium avec finition soignée.',    badge:'Premium',     rating:'5.0' },
  { id:38, name:'Porte clé papillon',         price:60, category:'accessoires', img:'image/H21.jpg', desc:'Set handmade doux, pratique et élégant.',      badge:'Set',         rating:'5.0' },
];

// ── État global ───────────────────────────────────────────────
let products        = [...DEFAULT_PRODUCTS];
let cart            = JSON.parse(localStorage.getItem('hb_cart')) || [];
let currentCategory = 'all';

// ── Références DOM ────────────────────────────────────────────
const productsGrid  = document.getElementById('productsGrid');
const cartDrawer    = document.getElementById('cartDrawer');
const cartOverlay   = document.getElementById('cartOverlay');
const openCartBtn   = document.getElementById('openCart');
const closeCartBtn  = document.getElementById('closeCart');
const cartItemsEl   = document.getElementById('cartItems');
const cartTotalEl   = document.getElementById('cartTotal');
const subTotalEl    = document.getElementById('subTotal');
const deliveryFeeEl = document.getElementById('deliveryFee');
const cartCountEl   = document.getElementById('cartCount');
const searchInput   = document.getElementById('searchInput');
const categoryBtns  = document.querySelectorAll('.category');
const confirmOrder  = document.getElementById('confirmOrder');
const orderMessage  = document.getElementById('orderMessage');
const deliveryMethod= document.getElementById('deliveryMethod');
const sendFeedback  = document.getElementById('sendFeedback');
const feedbackMsgEl = document.getElementById('feedbackMessage');
const feedbackGrid  = document.getElementById('feedbackGrid');
const menuBtn       = document.getElementById('menuBtn');
const navbar        = document.getElementById('navbar');
const toastEl       = document.getElementById('toast');

// ── Rendu produits ────────────────────────────────────────────
function renderProducts() {
  const search = searchInput.value.toLowerCase();

  const filtered = products.filter(p => {
    const matchCat  = currentCategory === 'all' || p.category === currentCategory;
    const matchText = p.name.toLowerCase().includes(search) ||
                      (p.desc || p.description || '').toLowerCase().includes(search) ||
                      p.category.toLowerCase().includes(search);
    return matchCat && matchText;
  });

  productsGrid.innerHTML = '';

  if (filtered.length === 0) {
    productsGrid.innerHTML =
      '<p style="text-align:center;grid-column:1/-1;color:#777">Aucun produit trouvé.</p>';
    return;
  }

  filtered.forEach(p => {
    const desc = p.desc || p.description || '';
    productsGrid.innerHTML += `
      <div class="product-card">
        <span class="product-badge">${p.badge}</span>
        <button class="wishlist-btn" onclick="showToast('Produit ajouté aux favoris 💕')">♡</button>
        <div class="product-img">
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
        </div>
        <h3>${p.name}</h3>
        <p>${desc}</p>
        <div class="product-meta">
          <span>⭐ ${p.rating}</span>
          <span>${p.category}</span>
        </div>
        <div class="price-row">
          <span class="price">${p.price} DT</span>
          <button class="add-btn" onclick="addToCart(${p.id})">Ajouter</button>
        </div>
      </div>`;
  });
}

// ── Panier ────────────────────────────────────────────────────
function addToCart(id) {
  const product  = products.find(p => String(p.id) === String(id));
  if (!product) return;
  const existing = cart.find(item => String(item.id) === String(id));
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });
  saveCart(); renderCart(); openCartDrawer();
  showToast('Produit ajouté au panier 🛍️');
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart">
        <h3>Votre panier est vide</h3>
        <p>Ajoutez des produits pour commencer votre commande.</p>
      </div>`;
  }
  let subtotal = 0, count = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    count    += item.quantity;
    cartItemsEl.innerHTML += `
      <div class="cart-item">
        <div class="cart-img"><img src="${item.img}" alt="${item.name}" /></div>
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>${item.price} DT</p>
          <div class="qty">
            <button onclick="changeQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Supprimer</button>
      </div>`;
  });
  const fee = getDeliveryFee();
  subTotalEl.textContent    = `${subtotal} DT`;
  deliveryFeeEl.textContent = `${fee} DT`;
  cartTotalEl.textContent   = `${subtotal + fee} DT`;
  cartCountEl.textContent   = count;
}

function changeQuantity(id, delta) {
  const item = cart.find(p => String(p.id) === String(id));
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); }
}

function removeFromCart(id) {
  cart = cart.filter(item => String(item.id) !== String(id));
  saveCart(); renderCart();
  showToast('Produit supprimé du panier');
}

function getDeliveryFee() {
  return deliveryMethod.value === 'domicile' && cart.length > 0 ? 7 : 0;
}
function saveCart() { localStorage.setItem('hb_cart', JSON.stringify(cart)); }
function openCartDrawer()  { cartDrawer.classList.add('open');  cartOverlay.classList.add('show'); }
function closeCartDrawer() { cartDrawer.classList.remove('open'); cartOverlay.classList.remove('show'); }

// ── Confirmation commande ─────────────────────────────────────
async function confirmCustomerOrder() {
  const currentUser = JSON.parse(localStorage.getItem('hb_current_user'));
  if (!currentUser || currentUser.role !== 'client') {
    showOrderMessage('Veuillez vous connecter avant de confirmer la commande.', 'crimson');
    showToast('Connectez-vous pour passer votre commande 💖');
    localStorage.setItem('hb_redirect_after_login', 'index.html');
    localStorage.setItem('hb_after_login_action', 'open_cart');
    setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    return;
  }
  const name     = document.getElementById('customerName').value.trim();
  const phone    = document.getElementById('customerPhone').value.trim();
  const address  = document.getElementById('customerAddress').value.trim();
  const delivery = deliveryMethod.value;
  const note     = document.getElementById('orderNote').value.trim();
  if (cart.length === 0)                        { showOrderMessage('Votre panier est vide.', 'crimson'); return; }
  if (!name || !phone || !address || !delivery) { showOrderMessage('Veuillez remplir toutes les informations.', 'crimson'); return; }
  if (phone.length < 8)                         { showOrderMessage('Numéro de téléphone invalide.', 'crimson'); return; }
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  try {
    const res  = await fetch('api/orders.php', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: name, telephone: phone, adresse: address,
        livraison: delivery, note, panier: cart,
        sousTotal: subtotal, fraisLivraison: getDeliveryFee(),
        total: subtotal + getDeliveryFee(),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      if (res.status === 401) {
        localStorage.setItem('hb_redirect_after_login', 'index.html');
        localStorage.setItem('hb_after_login_action', 'open_cart');
        window.location.href = 'login.html'; return;
      }
      showOrderMessage(data.message || 'Erreur lors de la commande.', 'crimson'); return;
    }
    // ── Message succès + points ────────────────────────────
    let successMsg = data.message || 'Commande confirmée avec succès 💖';
    if (data.points_gagnes > 0) {
      successMsg += ` (+${data.points_gagnes} pts fidélité 🌸)`;
    }
    showOrderMessage(successMsg, '#ff7eb6');
    showToast('Commande confirmée 💖');

    // Stocker infos de la commande pour la roue
    if (data.order && data.order.id) {
      lastOrderId    = data.order.id;
      lastOrderTotal = data.order_total || subtotal;
    }

    cart = []; saveCart(); renderCart();
    ['customerName','customerPhone','customerAddress','orderNote'].forEach(id => {
      document.getElementById(id).value = '';
    });
    deliveryMethod.value = '';

    // ── Roue : si commande ≥ 50 DT, ouvrir immédiatement ──
    if (data.wheel_eligible) {
      setTimeout(() => openClientWheelModal(lastOrderId, lastOrderTotal), 800);
    } else {
      // Pour les anciennes commandes sans données, vérifier via API
      setTimeout(checkClientGift, 1000);
    }
  } catch {
    showOrderMessage('Impossible de contacter le serveur PHP.', 'crimson');
  }
}

function showOrderMessage(msg, color) {
  orderMessage.textContent = msg;
  orderMessage.style.color = color;
}

// ── Feedback ──────────────────────────────────────────────────
async function sendCustomerFeedback() {
  const name   = document.getElementById('feedbackName').value.trim();
  const rating = document.getElementById('feedbackRating').value;
  const text   = document.getElementById('feedbackText').value.trim();
  if (!name || !text) {
    feedbackMsgEl.textContent = 'Veuillez remplir le feedback.';
    feedbackMsgEl.style.color = 'crimson'; return;
  }
  try {
    const res  = await fetch('api/feedbacks.php', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating, text }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      feedbackMsgEl.textContent = data.message || "Erreur lors de l'envoi.";
      feedbackMsgEl.style.color = 'crimson'; return;
    }
    const card = document.createElement('div');
    card.className = 'feedback-card';
    card.innerHTML = `<div class="stars">${rating}</div><p>"${text}"</p><h4>- ${name}</h4>`;
    feedbackGrid.prepend(card);
    feedbackMsgEl.textContent = data.message || 'Merci pour votre avis 💕';
    feedbackMsgEl.style.color = '#ff7eb6';
    document.getElementById('feedbackName').value   = '';
    document.getElementById('feedbackRating').value = '★★★★★';
    document.getElementById('feedbackText').value   = '';
    showToast('Feedback ajouté 💕');
  } catch {
    feedbackMsgEl.textContent = 'Impossible de contacter le serveur PHP.';
    feedbackMsgEl.style.color = 'crimson';
  }
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ── Barre de navigation ───────────────────────────────────────
function updateNavbar() {
  const user      = JSON.parse(localStorage.getItem('hb_current_user'));
  const loginLink = document.getElementById('navLoginLink');
  const adminLink = document.getElementById('navAdminLink');
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (!loginLink) return;
  if (user) {
    loginLink.style.display = 'none';
    logoutBtn.style.display = 'inline';
    if (adminLink) adminLink.style.display = user.role === 'admin' ? 'inline' : 'none';
  } else {
    loginLink.style.display = 'inline';
    logoutBtn.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

function prefillUserInfo() {
  const user = JSON.parse(localStorage.getItem('hb_current_user'));
  if (!user || user.role !== 'client') return;
  const nameField = document.getElementById('customerName');
  if (nameField && !nameField.value) nameField.value = user.name;
}

function openCartAfterLogin() {
  if (localStorage.getItem('hb_after_login_action') === 'open_cart') {
    localStorage.removeItem('hb_after_login_action');
    setTimeout(() => {
      openCartDrawer();
      showToast('Vous pouvez maintenant confirmer votre commande 💖');
    }, 500);
  }
}

async function loadProductsFromBackend() {
  try {
    const res  = await fetch('api/products.php', { credentials: 'same-origin' });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.products) && data.products.length > 0) {
      products = data.products; renderProducts();
    }
  } catch { console.log('Backend PHP non disponible, produits locaux utilisés.'); }
}

async function syncSession() {
  try {
    const res  = await fetch('api/auth.php?action=current', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.success && data.loggedIn && data.user) {
      localStorage.setItem('hb_current_user', JSON.stringify(data.user));
    } else if (data.success && !data.loggedIn) {
      localStorage.removeItem('hb_current_user');
    }
  } catch { /* PHP non dispo */ }
  updateNavbar();
  prefillUserInfo();
  checkClientGift();
}

async function logoutUser() {
  try {
    await fetch('api/auth.php?action=logout', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
  } catch { /* PHP non dispo */ }
  localStorage.removeItem('hb_current_user');
  window.location.href = 'login.html';
}

// ══════════════════════════════════════════════════════════════
// 🎡 SPINNING WHEEL — Côté CLIENT (segments dynamiques)
// ══════════════════════════════════════════════════════════════

let WHEEL_SEGMENTS      = [];   // chargés depuis l'API
let clientWheelAngle    = 0;
let clientWheelAnimId   = null;
let clientWheelSpun     = false;
let clientWheelResult   = null;  // segment gagné { segment_key, label, segment_type, valeur, ... }
let lastOrderId         = null;
let lastOrderTotal      = 0;

// ── Charger les segments actifs depuis l'API ──────────────────
async function loadWheelSegments(orderTotal) {
  try {
    const res  = await fetch('api/points.php?action=wheel_config', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.success && data.segments) {
      // Filtrer selon le total de commande
      WHEEL_SEGMENTS = data.segments
        .filter(s => orderTotal >= parseFloat(s.seuil_min))
        .map(s => ({
          segment_key:  s.segment_key,
          label:        s.label,
          segment_type: s.segment_type,
          valeur:       s.valeur,
          color:        s.color_bg,
          text:         s.color_text,
          seuil_min:    parseFloat(s.seuil_min),
        }));
    }
  } catch { /* fallback */ }

  // Fallback si API indisponible
  if (!WHEEL_SEGMENTS.length) {
    WHEEL_SEGMENTS = [
      { segment_key:'livraison_gratuite_1', label:'Livraison gratuite',  segment_type:'livraison_gratuite', color:'#dbeafe', text:'#1d4ed8' },
      { segment_key:'points_50',            label:'50 Points fidélité',  segment_type:'points', valeur:'50', color:'#dcfce7', text:'#15803d' },
      { segment_key:'produit_offert_1',     label:'Produit offert',      segment_type:'produit_offert',     color:'#fce7f3', text:'#be185d' },
      { segment_key:'reduction_10',         label:'Réduction -10%',      segment_type:'reduction', valeur:'10', color:'#fef9c3', text:'#a16207' },
      { segment_key:'points_100',           label:'100 Points fidélité', segment_type:'points', valeur:'100', color:'#f0fdf4', text:'#166534' },
      { segment_key:'livraison_gratuite_2', label:'Livraison gratuite',  segment_type:'livraison_gratuite', color:'#e0f2fe', text:'#0369a1' },
    ];
  }
}

// ── Vérifie si cadeau disponible (ancienne méthode, fallback) ─
async function checkClientGift() {
  const user = JSON.parse(localStorage.getItem('hb_current_user'));
  if (!user || user.role !== 'client') return;
  try {
    const res  = await fetch('api/points.php?action=my_status', { credentials: 'same-origin' });
    const data = await res.json();
    if (data.success) updateClientPointsBadge(data.points_fidelite || 0);
  } catch { /* PHP non dispo */ }
}

// ── Badge points dans la navbar ───────────────────────────────
function updateClientPointsBadge(pts) {
  let badge = document.getElementById('navPointsBadge');
  if (!badge) return;
  badge.textContent = pts + ' pts 🌸';
  badge.style.display = pts > 0 ? 'inline' : 'none';
}

// ── Ouvrir la roue (appelé après commande ou depuis bannière) ─
async function openClientWheelModal(orderId, orderTotal) {
  lastOrderId    = orderId    || lastOrderId;
  lastOrderTotal = orderTotal || lastOrderTotal;

  if (!lastOrderId || lastOrderTotal < 50) return;

  clientWheelSpun   = false;
  clientWheelResult = null;
  clientWheelAngle  = 0;

  // Charger les segments adaptés au montant
  await loadWheelSegments(lastOrderTotal);

  if (!WHEEL_SEGMENTS.length) return;

  const resultEl = document.getElementById('clientWheelResult');
  const spinBtn  = document.getElementById('clientWheelSpinBtn');
  const claimBtn = document.getElementById('clientWheelClaimBtn');
  const orderAmtEl = document.getElementById('wheelOrderAmount');

  if (resultEl)   resultEl.textContent  = '';
  if (spinBtn)  { spinBtn.disabled = false; spinBtn.style.display = 'inline-block'; spinBtn.textContent = '🎡 Tourner !'; }
  if (claimBtn)   claimBtn.style.display = 'none';
  if (orderAmtEl) orderAmtEl.textContent = parseFloat(lastOrderTotal).toFixed(2) + ' DT';

  drawClientWheel(0);
  document.getElementById('clientWheelModal').classList.add('open');
}

function closeClientWheelModal() {
  if (clientWheelAnimId) { cancelAnimationFrame(clientWheelAnimId); clientWheelAnimId = null; }
  document.getElementById('clientWheelModal').classList.remove('open');
}

function drawClientWheel(angle) {
  const canvas = document.getElementById('clientWheelCanvas');
  if (!canvas || !WHEEL_SEGMENTS.length) return;
  const ctx = canvas.getContext('2d');
  const cx  = canvas.width  / 2;
  const cy  = canvas.height / 2;
  const r   = cx - 6;
  const n   = WHEEL_SEGMENTS.length;
  const arc = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ombre externe
  ctx.save();
  ctx.shadowColor = 'rgba(176,106,190,0.25)';
  ctx.shadowBlur  = 18;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.restore();

  WHEEL_SEGMENTS.forEach((seg, i) => {
    const start = angle + i * arc;
    const end   = start + arc;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = seg.text;
    ctx.font = 'bold 10px Arial';
    ctx.fillText(seg.label, r - 10, 4);
    ctx.restore();
  });

  // Cercle central décoratif
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
  grad.addColorStop(0, '#ff7eb6');
  grad.addColorStop(1, '#b06abe');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌸', cx, cy);
}

function spinClientWheel() {
  if (clientWheelSpun || !WHEEL_SEGMENTS.length) return;
  clientWheelSpun = true;
  const spinBtn = document.getElementById('clientWheelSpinBtn');
  if (spinBtn) { spinBtn.disabled = true; spinBtn.textContent = '🎡 En cours...'; }

  const n   = WHEEL_SEGMENTS.length;
  const arc = (2 * Math.PI) / n;

  // Choisir un segment aléatoire parmi tous les segments actifs
  const targetIdx  = Math.floor(Math.random() * n);
  const segMid     = targetIdx * arc + arc / 2;
  const totalSpins = 6 * 2 * Math.PI;
  const finalAngle = totalSpins + ((-Math.PI / 2) - segMid);

  const startAngle = clientWheelAngle;
  const duration   = 4500;
  const startTime  = performance.now();

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    clientWheelAngle = startAngle + finalAngle * ease;
    drawClientWheel(clientWheelAngle);

    if (progress < 1) {
      clientWheelAnimId = requestAnimationFrame(animate);
    } else {
      clientWheelAnimId = null;
      clientWheelResult = WHEEL_SEGMENTS[targetIdx];
      const resultEl = document.getElementById('clientWheelResult');
      if (resultEl) {
        resultEl.textContent = '🎁 Vous avez gagné : ' + clientWheelResult.label + ' !';
        resultEl.style.animation = 'none';
        setTimeout(() => resultEl.style.animation = '', 10);
      }
      const claimBtn = document.getElementById('clientWheelClaimBtn');
      if (claimBtn) claimBtn.style.display = 'block';
    }
  }
  clientWheelAnimId = requestAnimationFrame(animate);
}

async function claimClientGift() {
  if (!clientWheelResult || !lastOrderId) return;
  const claimBtn = document.getElementById('clientWheelClaimBtn');
  if (claimBtn) { claimBtn.disabled = true; claimBtn.textContent = '⏳ Enregistrement...'; }

  try {
    const res = await fetch('api/points.php', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action      : 'spin',
        order_id    : lastOrderId,
        order_total : lastOrderTotal,
        segment_key : clientWheelResult.segment_key,
        gift_label  : clientWheelResult.label,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || '🎁 Cadeau enregistré !');
      closeClientWheelModal();

      // Si points, mettre à jour le badge
      if (data.points_gagnes > 0) {
        setTimeout(checkClientGift, 500);
      }

      const banner = document.getElementById('wheelBanner');
      if (banner) banner.style.display = 'none';
      lastOrderId = null;
    } else {
      showToast(data.message || 'Erreur lors de l\'enregistrement.');
      if (claimBtn) { claimBtn.disabled = false; claimBtn.textContent = '✅ Confirmer mon cadeau'; }
    }
  } catch {
    showToast('Impossible de contacter le serveur.');
    if (claimBtn) { claimBtn.disabled = false; claimBtn.textContent = '✅ Confirmer mon cadeau'; }
  }
}

// ── Événements ────────────────────────────────────────────────
openCartBtn.addEventListener('click',    openCartDrawer);
closeCartBtn.addEventListener('click',   closeCartDrawer);
cartOverlay.addEventListener('click',    closeCartDrawer);
deliveryMethod.addEventListener('change', renderCart);
confirmOrder.addEventListener('click',   confirmCustomerOrder);
sendFeedback.addEventListener('click',   sendCustomerFeedback);
searchInput.addEventListener('input',    renderProducts);
menuBtn.addEventListener('click', () => navbar.classList.toggle('show'));
document.querySelectorAll('.navbar a').forEach(a =>
  a.addEventListener('click', () => navbar.classList.remove('show'))
);
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderProducts();
  });
});

// ── Initialisation ────────────────────────────────────────────
renderProducts();
renderCart();
loadProductsFromBackend();
syncSession();
openCartAfterLogin();
