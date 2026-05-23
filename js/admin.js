/**
 * admin.js v3 — Dashboard Handmade Bloom
 * - Upload image depuis PC
 * - Tableau commandes + filtres + section livrées groupées par client
 * - Spinning wheel pour cadeaux basés sur montant dépensé
 */

let adminProducts = [];
let orders        = [];
let feedbacks     = [];
let allClients    = [];
let allGiftsData  = {};
let currentFilter = 'all';

// Spinning wheel state
let wheelCurrentClient = null;
let wheelGiftType      = null;
let wheelSpun          = false;

// ── Fetch ──────────────────────────────────────────────────────
async function apiRequest(url, options = {}) {
  const res  = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({ success: false, message: 'Réponse invalide.' }));
  if (!res.ok && !data.message) data.message = 'Erreur serveur.';
  return data;
}

// ── Init ──────────────────────────────────────────────────────
async function initAdminDashboard() {
  const user = await protectAdminPage();
  if (!user) return;
  await loadAdminData();
  renderAll();
  bindUploadZone();
  bindOrderTabs();
}

async function loadAdminData() {
  const [pData, oData, fData, sData, gData] = await Promise.all([
    apiRequest('api/products.php'),
    apiRequest('api/orders.php'),
    apiRequest('api/feedbacks.php'),
    apiRequest('api/stats.php'),
    apiRequest('api/points.php'),
  ]);

  adminProducts = pData.products  || [];
  orders        = oData.orders    || [];
  feedbacks     = fData.feedbacks || [];
  allClients    = gData.clients   || [];
  allGiftsData  = gData;   // stocke pending_spins, etc.

  if (sData.success) {
    document.getElementById('totalProducts').textContent  = sData.totalProducts;
    document.getElementById('totalOrders').textContent    = sData.totalOrders;
    document.getElementById('totalFeedbacks').textContent = sData.totalFeedbacks;
    document.getElementById('totalRevenue').textContent   = parseFloat(sData.totalRevenue).toFixed(2) + ' DT';
  }

  const livrees = orders.filter(o => o.statut === 'livrée');
  document.getElementById('totalLivrees').textContent = livrees.length;

  const pendingCount = (gData.pending_spins || []).length;
  document.getElementById('totalGifts').textContent = pendingCount;
}

function renderAll() {
  renderAdminProducts();
  renderOrdersTable();
  renderLivrees();
  renderGifts();
  renderFeedbacks();
}

// ══════════════════════════════════════════════════════════════
// UPLOAD IMAGE
// ══════════════════════════════════════════════════════════════
function bindUploadZone() {
  const input       = document.getElementById('imageFileInput');
  const preview     = document.getElementById('uploadPreview');
  const status      = document.getElementById('uploadStatus');
  const placeholder = document.getElementById('uploadPlaceholder');

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    };
    reader.readAsDataURL(file);

    status.textContent = 'Upload en cours...';
    status.style.color = '#aaa';

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res  = await fetch('api/upload.php', {
        method: 'POST', credentials: 'same-origin', body: formData,
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById('productImage').value = data.path;
        status.textContent = 'Image enregistrée : ' + data.path;
        status.style.color = '#2e7d32';
      } else {
        status.textContent = data.message || 'Erreur upload.';
        status.style.color = 'crimson';
      }
    } catch {
      status.textContent = 'Erreur réseau.';
      status.style.color = 'crimson';
    }
  });
}

// ══════════════════════════════════════════════════════════════
// PRODUITS
// ══════════════════════════════════════════════════════════════
function renderAdminProducts() {
  const tbody = document.getElementById('adminProductsTable');
  tbody.innerHTML = '';

  if (!adminProducts.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#aaa;padding:20px">Aucun produit.</td></tr>';
    return;
  }

  adminProducts.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td><img src="${p.img}" alt="${p.name}"
              style="width:52px;height:52px;object-fit:cover;border-radius:10px;border:1px solid #eee" /></td>
        <td>
          <strong>${p.name}</strong>
          <div style="font-size:12px;color:#aaa">${p.description || ''}</div>
        </td>
        <td style="text-transform:capitalize">${p.category}</td>
        <td><strong style="color:#c2185b">${parseFloat(p.price).toFixed(2)} DT</strong></td>
        <td>
          <button class="edit-admin-btn"   onclick="editAdminProduct('${p.id}')">Modifier</button>
          <button class="delete-admin-btn" onclick="deleteAdminProduct('${p.id}')">Supprimer</button>
        </td>
      </tr>`;
  });
}

async function saveAdminProduct() {
  const editId   = document.getElementById('editProductId').value;
  const name     = document.getElementById('productName').value.trim();
  const price    = document.getElementById('productPrice').value.trim();
  const category = document.getElementById('productCategory').value;
  const img      = document.getElementById('productImage').value.trim();
  const badge    = document.getElementById('productBadge').value.trim() || 'New';
  const rating   = document.getElementById('productRating').value.trim() || '4.8';
  const desc     = document.getElementById('productDesc').value.trim();

  if (!name || !price || !img || !desc) {
    alert('Veuillez remplir : nom, prix, image et description.');
    return;
  }

  const data = await apiRequest('api/products.php', {
    method: editId ? 'PUT' : 'POST',
    body: JSON.stringify({ id: editId, name, price: Number(price), category, img, desc, badge, rating }),
  });

  if (!data.success) { alert(data.message || 'Erreur.'); return; }

  await loadAdminData();
  renderAll();
  resetProductForm();
}

function editAdminProduct(id) {
  const p = adminProducts.find(item => String(item.id) === String(id));
  if (!p) return;

  document.getElementById('editProductId').value   = p.id;
  document.getElementById('productName').value     = p.name;
  document.getElementById('productPrice').value    = p.price;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productImage').value    = p.img;
  document.getElementById('productBadge').value    = p.badge  || 'New';
  document.getElementById('productRating').value   = p.rating || '4.8';
  document.getElementById('productDesc').value     = p.description || '';

  const preview     = document.getElementById('uploadPreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  preview.src = p.img;
  preview.style.display     = 'block';
  placeholder.style.display = 'none';

  document.getElementById('saveProductBtn').textContent = 'Enregistrer les modifications';
  window.location.href = '#productsAdmin';
}

async function deleteAdminProduct(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  const data = await apiRequest(`api/products.php?id=${id}`, { method: 'DELETE' });
  if (!data.success) { alert(data.message || 'Erreur.'); return; }
  await loadAdminData();
  renderAll();
}

function resetProductForm() {
  ['editProductId','productName','productPrice','productImage','productBadge','productRating','productDesc']
    .forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('productCategory').value      = 'bijoux';
  document.getElementById('saveProductBtn').textContent = 'Ajouter le produit';
  document.getElementById('uploadPreview').style.display     = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'block';
  document.getElementById('uploadStatus').textContent        = '';
  document.getElementById('imageFileInput').value            = '';
}

// ══════════════════════════════════════════════════════════════
// COMMANDES — TABLEAU + FILTRES
// ══════════════════════════════════════════════════════════════
function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  tbody.innerHTML = '';

  // Compteurs onglets (excluent les livrées du tableau principal)
  const nonLivrees = orders.filter(o => o.statut !== 'livrée');
  const counts = {
    all         : nonLivrees.length,
    'en attente': nonLivrees.filter(o => o.statut === 'en attente').length,
    'confirmée' : nonLivrees.filter(o => o.statut === 'confirmée').length,
    'en livraison': nonLivrees.filter(o => o.statut === 'en livraison').length,
    'annulée'   : nonLivrees.filter(o => o.statut === 'annulée').length,
  };

  document.getElementById('cnt-all').textContent       = counts.all;
  document.getElementById('cnt-attente').textContent   = counts['en attente'];
  document.getElementById('cnt-confirmee').textContent = counts['confirmée'];
  document.getElementById('cnt-livraison').textContent = counts['en livraison'];
  document.getElementById('cnt-annulee').textContent   = counts['annulée'];

  let filtered = nonLivrees;
  if (currentFilter !== 'all') {
    filtered = filtered.filter(o => o.statut === currentFilter);
  }

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#aaa;padding:20px">Aucune commande.</td></tr>';
    return;
  }

  filtered.forEach(order => {
    const clientName  = order.client_name  || order.client_account_name  || 'Client';
    const clientEmail = order.client_email || order.client_account_email || '';

    const statutMap = {
      'en attente'   : 'en-attente',
      'confirmée'    : 'confirmee',
      'en livraison' : 'en-livraison',
      'livrée'       : 'livree',
      'annulée'      : 'annulee',
    };
    const cls = statutMap[order.statut] || '';

    tbody.innerHTML += `
      <tr>
        <td><strong>#${order.id}</strong></td>
        <td>
          <strong>${clientName}</strong>
          <div style="font-size:12px;color:#aaa">${clientEmail}</div>
        </td>
        <td>${order.telephone}</td>
        <td style="max-width:130px;font-size:13px">${order.adresse}</td>
        <td><strong style="color:#c2185b">${parseFloat(order.total).toFixed(2)} DT</strong></td>
        <td style="font-size:13px">${order.livraison}</td>
        <td style="font-size:12px;color:#888">${(order.created_at || '').slice(0, 10)}</td>
        <td><span class="statut-badge ${cls}">${order.statut}</span></td>
        <td>
          <select class="statut-select" onchange="updateOrderStatus('${order.id}', this.value)">
            <option value="en attente"   ${order.statut === 'en attente'   ? 'selected' : ''}>En attente</option>
            <option value="confirmée"    ${order.statut === 'confirmée'    ? 'selected' : ''}>Confirmée</option>
            <option value="en livraison" ${order.statut === 'en livraison' ? 'selected' : ''}>En livraison</option>
            <option value="livrée"       ${order.statut === 'livrée'       ? 'selected' : ''}>Livrée</option>
            <option value="annulée"      ${order.statut === 'annulée'      ? 'selected' : ''}>Annulée</option>
          </select>
        </td>
      </tr>`;
  });
}

async function updateOrderStatus(id, statut) {
  const data = await apiRequest('api/orders.php', {
    method: 'PUT',
    body: JSON.stringify({ id, statut }),
  });
  if (!data.success) { alert(data.message || 'Erreur.'); return; }
  await loadAdminData();
  renderAll();
}

function bindOrderTabs() {
  document.querySelectorAll('.orders-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.orders-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderOrdersTable();
    });
  });
}

// ── Section livrées regroupées par client ─────────────────────
function renderLivrees() {
  const livrees = orders.filter(o => o.statut === 'livrée');
  const grid    = document.getElementById('livreesGrid');
  document.getElementById('livrees-count').textContent = livrees.length;

  if (!livrees.length) {
    grid.innerHTML = '<p style="color:#aaa;font-size:14px">Aucune commande livrée.</p>';
    return;
  }

  // Grouper par client
  const byClient = {};
  livrees.forEach(order => {
    const uid  = order.user_id || order.id;
    const name = order.client_name || order.client_account_name || 'Client';
    if (!byClient[uid]) byClient[uid] = { name, orders: [] };
    byClient[uid].orders.push(order);
  });

  grid.innerHTML = '';
  Object.values(byClient).forEach(group => {
    const initial = group.name.charAt(0).toUpperCase();
    const nb      = group.orders.length;

    let rowsHtml = '';
    group.orders.forEach((o, i) => {
      rowsHtml += `
        <div class="livree-commande-row">
          <span class="livree-commande-num">Commande #${o.id} — ${i + 1}</span>
          <span class="livree-commande-date">${(o.created_at || '').slice(0, 10)}</span>
          <span class="livree-commande-total">${parseFloat(o.total).toFixed(2)} DT</span>
        </div>`;
    });

    grid.innerHTML += `
      <div class="livree-client-card">
        <div class="livree-client-header">
          <div class="client-avatar">${initial}</div>
          <div>
            <div class="client-name-label">${group.name}</div>
            <div class="client-nb-cmd">${nb} commande${nb > 1 ? 's' : ''} livrée${nb > 1 ? 's' : ''}</div>
          </div>
        </div>
        ${rowsHtml}
      </div>`;
  });
}

// ══════════════════════════════════════════════════════════════
// CADEAUX — SPINNING WHEEL
// ══════════════════════════════════════════════════════════════
const GIFT_CONFIG = {
  livraison_gratuite  : { label: 'Livraison gratuite', tagClass: 'tag-livraison',    seuil: 50  },
  produit_offert      : { label: 'Produit offert',      tagClass: 'tag-produit',      seuil: 100 },
  cadeau_personnalise : { label: 'Cadeau personnalisé', tagClass: 'tag-personnalise', seuil: 150 },
};

function renderGifts() {
  const giftsCount = document.getElementById('giftsCount');
  const pendingSpins = allGiftsData?.pending_spins || [];
  if (giftsCount) giftsCount.textContent = pendingSpins.length;

  renderPendingSpins();
  renderPointsTable();
}

function renderPointsTable() {
  const tbody = document.getElementById('pointsTableBody');
  tbody.innerHTML = '';

  if (!allClients.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#aaa">Aucun client.</td></tr>';
    return;
  }

  allClients.forEach(c => {
    const montant    = parseFloat(c.total_depense) || 0;
    const pts        = parseInt(c.points_fidelite) || 0;
    const cadeauGagne = c.cadeau_gagne || '—';

    tbody.innerHTML += `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td style="font-size:13px;color:#888">${c.email}</td>
        <td><strong style="color:#c2185b">${montant.toFixed(2)} DT</strong></td>
        <td style="text-align:center">${c.nb_commandes_livrees || 0}</td>
        <td style="text-align:center">
          <span style="background:linear-gradient(135deg,#ff7eb6,#b06abe);color:#fff;border-radius:20px;padding:3px 12px;font-weight:700;font-size:13px;">
            ${pts} pts 🌸
          </span>
        </td>
        <td style="font-size:13px;color:#7c3aed">${cadeauGagne}</td>
        <td>
          <button onclick="adminAddPoints(${c.id},'${c.name.replace(/'/g,"\\'")}')"
            style="background:#f3e8ff;color:#7c3aed;border:none;border-radius:10px;padding:5px 12px;font-size:12px;cursor:pointer;font-weight:600;">
            +/- Points
          </button>
        </td>
      </tr>`;
  });
}

// ── Spinning Wheel ────────────────────────────────────────────
const WHEEL_SEGMENTS = [
  { label: 'Livraison gratuite', color: '#e3f2fd', text: '#1565c0' },
  { label: 'Produit offert',     color: '#fce4ec', text: '#c2185b' },
  { label: 'Cadeau personnalisé',color: '#f3e5f5', text: '#6a1b9a' },
  { label: 'Livraison gratuite', color: '#e8f5e9', text: '#2e7d32' },
  { label: 'Produit offert',     color: '#fff8e1', text: '#f57f17' },
  { label: 'Cadeau personnalisé',color: '#fce4ec', text: '#ad1457' },
];

let wheelAngle    = 0;
let wheelAnimId   = null;
let wheelLanded   = null;

function drawWheel(angle) {
  const canvas  = document.getElementById('wheelCanvas');
  const ctx     = canvas.getContext('2d');
  const cx      = canvas.width  / 2;
  const cy      = canvas.height / 2;
  const r       = cx - 4;
  const n       = WHEEL_SEGMENTS.length;
  const arc     = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.lineWidth = 2;
    ctx.stroke();

    // Texte
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = seg.text;
    ctx.font      = 'bold 12px Arial';
    ctx.fillText(seg.label, r - 10, 5);
    ctx.restore();
  });

  // Cercle central
  ctx.beginPath();
  ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#e0c0d0';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function openWheelModal(clientId, clientName, giftType) {
  wheelCurrentClient = { id: clientId, name: clientName };
  wheelGiftType      = giftType;
  wheelSpun          = false;
  wheelLanded        = null;
  wheelAngle         = 0;

  document.getElementById('wheelClientName').textContent = clientName;
  document.getElementById('wheelResult').textContent     = '';
  document.getElementById('wheelSpinBtn').disabled       = false;
  document.getElementById('wheelConfirmBtn').style.display = 'none';

  drawWheel(0);
  document.getElementById('wheelModal').classList.add('open');
}

function closeWheelModal() {
  if (wheelAnimId) { cancelAnimationFrame(wheelAnimId); wheelAnimId = null; }
  document.getElementById('wheelModal').classList.remove('open');
}

function spinWheel() {
  if (wheelSpun) return;
  wheelSpun = true;
  document.getElementById('wheelSpinBtn').disabled = true;
  document.getElementById('wheelResult').textContent = '';

  const n       = WHEEL_SEGMENTS.length;
  const arc     = (2 * Math.PI) / n;

  // Déterminer le segment gagnant selon le type de cadeau du client
  let targetSegments = [];
  WHEEL_SEGMENTS.forEach((seg, i) => {
    const key = wheelGiftType === 'livraison_gratuite'  ? 'Livraison gratuite'
              : wheelGiftType === 'produit_offert'      ? 'Produit offert'
              : 'Cadeau personnalisé';
    if (seg.label === key) targetSegments.push(i);
  });

  const targetIdx = targetSegments[Math.floor(Math.random() * targetSegments.length)];

  // Calculer l'angle final pour que l'aiguille (en haut = -PI/2) pointe sur ce segment
  const segMid     = targetIdx * arc + arc / 2;
  const totalSpins = 5 * 2 * Math.PI; // 5 tours
  const finalAngle = totalSpins + ((-Math.PI / 2) - segMid);

  const startAngle = wheelAngle;
  const duration   = 4000;
  const startTime  = performance.now();

  function animate(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Easing out cubic
    const ease     = 1 - Math.pow(1 - progress, 3);
    wheelAngle = startAngle + finalAngle * ease;
    drawWheel(wheelAngle);

    if (progress < 1) {
      wheelAnimId = requestAnimationFrame(animate);
    } else {
      wheelAnimId = null;
      wheelLanded = WHEEL_SEGMENTS[targetIdx];
      document.getElementById('wheelResult').textContent = 'Résultat : ' + wheelLanded.label;
      document.getElementById('wheelConfirmBtn').style.display = 'inline-block';
    }
  }

  wheelAnimId = requestAnimationFrame(animate);
}

async function confirmGift() {
  if (!wheelCurrentClient || !wheelGiftType) return;

  const data = await apiRequest('api/points.php', {
    method: 'POST',
    body: JSON.stringify({
      user_id   : wheelCurrentClient.id,
      action    : 'give_gift',
      gift_type : wheelGiftType,
    }),
  });

  if (!data.success) { alert(data.message || 'Erreur.'); return; }

  alert('Cadeau enregistré pour ' + wheelCurrentClient.name + ' — ' + (wheelLanded ? wheelLanded.label : ''));
  closeWheelModal();
  await loadAdminData();
  renderAll();
}

// ══════════════════════════════════════════════════════════════
// FEEDBACKS
// ══════════════════════════════════════════════════════════════
function renderFeedbacks() {
  const el = document.getElementById('feedbackList');
  el.innerHTML = '';

  if (!feedbacks.length) {
    el.innerHTML = '<p class="empty-admin-message">Aucun feedback.</p>';
    return;
  }

  feedbacks.forEach(fb => {
    el.innerHTML += `
      <div class="admin-order-card">
        <div class="order-headline">
          <h3>${fb.rating}</h3>
          <span>${(fb.created_at || '').slice(0, 10)}</span>
        </div>
        <p><strong>Nom :</strong> ${fb.name}</p>
        <p><strong>Avis :</strong> ${fb.text_avis || ''}</p>
        <button class="delete-admin-btn" style="margin-top:8px"
          onclick="deleteFeedback('${fb.id}')">Supprimer</button>
      </div>`;
  });
}

async function deleteFeedback(id) {
  if (!confirm('Supprimer ce feedback ?')) return;
  const data = await apiRequest(`api/feedbacks.php?id=${id}`, { method: 'DELETE' });
  if (!data.success) { alert(data.message || 'Erreur.'); return; }
  await loadAdminData();
  renderAll();
}

// ══════════════════════════════════════════════════════════════
// 🎡 CONFIG ROUE — ADMIN
// ══════════════════════════════════════════════════════════════

let wheelConfigSegments = [];

async function loadWheelConfig() {
  try {
    const data = await apiRequest('api/points.php?action=admin_config');
    if (data.success) {
      wheelConfigSegments = data.segments || [];
      renderWheelConfig();
    }
  } catch { /* PHP non dispo */ }
}

function renderWheelConfig() {
  const container = document.getElementById('wheelConfigList');
  if (!container) return;

  if (!wheelConfigSegments.length) {
    container.innerHTML = '<p style="color:#aaa">Aucun segment configuré.</p>';
    return;
  }

  container.innerHTML = wheelConfigSegments.map((seg, i) => `
    <div class="wheel-config-row" data-key="${seg.segment_key}" style="
      background:#fff; border:1px solid #f0e0f0; border-radius:14px;
      padding:16px 20px; margin-bottom:12px; display:flex; align-items:center;
      gap:16px; flex-wrap:wrap;">
      <div style="width:18px;height:18px;border-radius:50%;background:${seg.color_bg};border:2px solid ${seg.color_text};flex-shrink:0;"></div>
      <div style="flex:1;min-width:200px;">
        <input type="text" value="${seg.label}" placeholder="Label du segment"
          onchange="updateSegmentField('${seg.segment_key}','label',this.value)"
          style="width:100%;border:1px solid #eee;border-radius:8px;padding:6px 10px;font-size:14px;margin-bottom:6px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <select onchange="updateSegmentField('${seg.segment_key}','segment_type',this.value)"
            style="border:1px solid #eee;border-radius:8px;padding:5px 8px;font-size:13px;">
            <option value="livraison_gratuite" ${seg.segment_type==='livraison_gratuite'?'selected':''}>🚚 Livraison gratuite</option>
            <option value="produit_offert" ${seg.segment_type==='produit_offert'?'selected':''}>🎁 Produit offert</option>
            <option value="cadeau_personnalise" ${seg.segment_type==='cadeau_personnalise'?'selected':''}>💝 Cadeau spécial</option>
            <option value="points" ${seg.segment_type==='points'?'selected':''}>⭐ Points fidélité</option>
            <option value="reduction" ${seg.segment_type==='reduction'?'selected':''}>🏷️ Réduction %</option>
          </select>
          <input type="number" value="${seg.valeur||''}" placeholder="Valeur (pts ou %)"
            onchange="updateSegmentField('${seg.segment_key}','valeur',this.value)"
            style="width:130px;border:1px solid #eee;border-radius:8px;padding:5px 8px;font-size:13px;">
          <input type="number" value="${seg.seuil_min}" placeholder="Seuil min DT" min="0" step="5"
            onchange="updateSegmentField('${seg.segment_key}','seuil_min',this.value)"
            style="width:120px;border:1px solid #eee;border-radius:8px;padding:5px 8px;font-size:13px;"
            title="Montant minimum de commande pour voir ce segment">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
        <label style="font-size:12px;color:#888;">Fond</label>
        <input type="color" value="${seg.color_bg}"
          onchange="updateSegmentField('${seg.segment_key}','color_bg',this.value)"
          style="width:40px;height:32px;border:none;cursor:pointer;">
        <label style="font-size:12px;color:#888;">Texte</label>
        <input type="color" value="${seg.color_text}"
          onchange="updateSegmentField('${seg.segment_key}','color_text',this.value)"
          style="width:40px;height:32px;border:none;cursor:pointer;">
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
          <input type="checkbox" ${seg.actif?'checked':''} 
            onchange="updateSegmentField('${seg.segment_key}','actif',this.checked?1:0)">
          Actif
        </label>
        <input type="number" value="${seg.sort_order}" placeholder="Ordre" min="0"
          onchange="updateSegmentField('${seg.segment_key}','sort_order',this.value)"
          style="width:60px;border:1px solid #eee;border-radius:8px;padding:4px 6px;font-size:12px;"
          title="Ordre d'affichage">
      </div>
    </div>
  `).join('');
}

function updateSegmentField(key, field, value) {
  const seg = wheelConfigSegments.find(s => s.segment_key === key);
  if (seg) seg[field] = value;
}

async function saveWheelConfig() {
  const btn = document.getElementById('saveWheelConfigBtn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Sauvegarde...'; }

  const data = await apiRequest('api/points.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'update_config', segments: wheelConfigSegments }),
  });

  if (btn) { btn.disabled = false; btn.textContent = '💾 Sauvegarder la roue'; }

  if (data.success) {
    showAdminToast('✅ Configuration de la roue sauvegardée !');
    await loadWheelConfig();
  } else {
    alert(data.message || 'Erreur de sauvegarde.');
  }
}

// ── Points fidélité admin ─────────────────────────────────────

async function adminAddPoints(userId, clientName) {
  const pts   = parseInt(prompt(`Points à ajouter pour ${clientName} (négatif pour retirer) :`));
  if (isNaN(pts) || pts === 0) return;
  const raison = prompt('Raison (ex: remboursement, bonus) :') || 'Ajout manuel admin';

  const data = await apiRequest('api/points.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'add_points', user_id: userId, points: pts, raison }),
  });
  if (data.success) {
    showAdminToast(`✅ ${pts > 0 ? '+' : ''}${pts} pts pour ${clientName} (total : ${data.points_fidelite} pts)`);
    await loadAdminData();
    renderAll();
  } else {
    alert(data.message || 'Erreur.');
  }
}

async function adminConfirmSpin(spinId) {
  const data = await apiRequest('api/points.php', {
    method: 'POST',
    body: JSON.stringify({ action: 'confirm_spin', spin_id: spinId }),
  });
  if (data.success) {
    showAdminToast('✅ Spin confirmé comme traité.');
    await loadAdminData();
    renderAll();
  } else {
    alert(data.message || 'Erreur.');
  }
}

function renderPendingSpins() {
  const el = document.getElementById('pendingSpinsList');
  if (!el) return;

  const pending = allGiftsData?.pending_spins || [];

  if (!pending.length) {
    el.innerHTML = '<p style="color:#aaa;font-size:14px">Aucun cadeau en attente de traitement.</p>';
    return;
  }

  el.innerHTML = pending.map(spin => `
    <div style="background:#fff;border:1px solid #fde;border-radius:14px;padding:14px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <div style="font-size:28px;">🎁</div>
      <div style="flex:1;">
        <div style="font-weight:700;color:#333;">${spin.client_name}</div>
        <div style="font-size:13px;color:#888;">${spin.client_email}</div>
        <div style="font-size:13px;margin-top:3px;">
          <strong style="color:#b06abe;">${spin.gift_label}</strong>
          <span style="color:#aaa;font-size:12px;margin-left:6px;">${(spin.created_at||'').slice(0,16)}</span>
        </div>
      </div>
      <button onclick="adminConfirmSpin(${spin.id})" style="
        background:linear-gradient(135deg,#43e97b,#38f9d7);color:#0d5c36;
        border:none;border-radius:20px;padding:8px 18px;font-weight:700;cursor:pointer;font-size:13px;">
        ✅ Traité
      </button>
    </div>
  `).join('');
}

function showAdminToast(msg) {
  let t = document.getElementById('adminToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'adminToast';
    t.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#333;color:#fff;padding:12px 22px;border-radius:12px;font-size:14px;z-index:9999;opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

// ── Config Roue ───────────────────────────────────────────────
// ── Boutons ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveProductBtn')?.addEventListener('click', saveAdminProduct);
  document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
  document.getElementById('saveWheelConfigBtn')?.addEventListener('click', saveWheelConfig);
  bindOrderTabs();
  loadWheelConfig();
});

initAdminDashboard();
