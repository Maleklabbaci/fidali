// ============================================
// FIDALI WIDGET v2 — 100% Automatique
// Le commerçant colle 1 ligne, tout marche.
// ============================================

(function() {
  'use strict';

  // Récupérer la config depuis le script tag
  var scripts = document.querySelectorAll('script[data-card]');
  var scriptTag = scripts[scripts.length - 1];
  if (!scriptTag) return;

  var CONFIG = {
    apiUrl: 'https://fidali.vercel.app/api/v1',
    cardCode: scriptTag.getAttribute('data-card') || '',
    apiKey: scriptTag.getAttribute('data-key') || '',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    color: scriptTag.getAttribute('data-color') || '#9333ea',
    autoDetect: scriptTag.getAttribute('data-auto') !== 'false', // Auto-detect par défaut
  };

  if (!CONFIG.cardCode || !CONFIG.apiKey) {
    console.warn('[Fidali] data-card et data-key sont requis');
    return;
  }

  // ── INJECTER LES STYLES ──
  var style = document.createElement('style');
  style.id = 'fidali-css';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    #fidali-fab{
      position:fixed;z-index:99998;
      ${CONFIG.position.includes('right')?'right:20px;':'left:20px;'}
      ${CONFIG.position.includes('top')?'top:20px;':'bottom:20px;'}
      width:60px;height:60px;border-radius:50%;border:none;outline:none;
      background:linear-gradient(135deg,${CONFIG.color},#db2777);
      box-shadow:0 4px 24px rgba(147,51,234,0.4);
      cursor:pointer;font-size:24px;
      display:flex;align-items:center;justify-content:center;
      transition:transform .3s,box-shadow .3s;
    }
    #fidali-fab:hover{transform:scale(1.1);box-shadow:0 6px 32px rgba(147,51,234,0.5)}
    
    /* Badge notification */
    #fidali-badge{
      position:absolute;top:-2px;right:-2px;
      width:20px;height:20px;border-radius:50%;
      background:#ef4444;color:white;
      font-size:10px;font-weight:800;
      display:none;align-items:center;justify-content:center;
      border:2px solid white;
    }

    #fidali-panel{
      position:fixed;z-index:99999;
      ${CONFIG.position.includes('right')?'right:20px;':'left:20px;'}
      ${CONFIG.position.includes('top')?'top:90px;':'bottom:90px;'}
      width:370px;max-height:540px;
      background:white;border-radius:20px;
      box-shadow:0 12px 48px rgba(0,0,0,0.15);
      overflow:hidden;display:none;
      font-family:'Inter',-apple-system,sans-serif;
    }
    #fidali-panel.open{display:block;animation:fidali-up .3s ease}
    @keyframes fidali-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    #fidali-panel *{box-sizing:border-box;margin:0;padding:0}

    .fidali-hd{background:linear-gradient(135deg,${CONFIG.color},#db2777);padding:20px 20px 16px;color:white}
    .fidali-hd h3{font-size:16px;font-weight:800}
    .fidali-hd p{font-size:11px;opacity:.65;margin-top:3px}
    .fidali-hd-close{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;color:white;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}

    .fidali-bd{padding:20px}
    .fidali-row{display:flex;gap:8px;margin-bottom:16px}
    .fidali-inp{flex:1;padding:12px 14px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:14px;outline:none;font-family:inherit;color:#111;transition:border .2s}
    .fidali-inp:focus{border-color:${CONFIG.color}}
    .fidali-inp::placeholder{color:#9ca3af}
    .fidali-btn{padding:12px 18px;background:${CONFIG.color};color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;transition:opacity .2s}
    .fidali-btn:hover{opacity:.9}
    .fidali-btn:disabled{opacity:.4;cursor:not-allowed}

    .fidali-crd{background:linear-gradient(135deg,${CONFIG.color},#db2777);border-radius:16px;padding:22px;color:white;position:relative;overflow:hidden}
    .fidali-crd-d{position:absolute;border-radius:50%;background:rgba(255,255,255,.08)}
    .fidali-bar-bg{background:rgba(255,255,255,.15);border-radius:10px;height:8px;margin:12px 0;overflow:hidden}
    .fidali-bar-fill{background:white;border-radius:10px;height:100%;transition:width .8s ease}
    .fidali-claim{margin-top:14px;width:100%;padding:12px;background:white;color:${CONFIG.color};border:none;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit;transition:transform .2s}
    .fidali-claim:hover{transform:scale(1.02)}

    .fidali-ft{text-align:center;padding:10px;border-top:1px solid #f3f4f6}
    .fidali-ft a{font-size:10px;color:#9ca3af;text-decoration:none}
    .fidali-ft a b{color:${CONFIG.color};font-weight:700}

    .fidali-err{padding:10px 14px;border-radius:10px;background:#fef2f2;border:1px solid #fecaca;color:#ef4444;font-size:12px;margin-bottom:12px;text-align:center}
    .fidali-ok{padding:10px 14px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;color:#16a34a;font-size:12px;margin-bottom:12px;text-align:center;font-weight:600}
    .fidali-ld{text-align:center;padding:20px;color:#9ca3af;font-size:13px}

    /* Notification toast */
    #fidali-toast{
      position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;
      padding:16px 28px;border-radius:16px;
      background:linear-gradient(135deg,${CONFIG.color},#db2777);
      color:white;font-family:'Inter',sans-serif;
      font-size:14px;font-weight:600;
      box-shadow:0 8px 32px rgba(147,51,234,0.4);
      display:none;text-align:center;max-width:90vw;
      animation:fidali-toast-in .4s ease;
    }
    #fidali-toast.show{display:block}
    @keyframes fidali-toast-in{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

    @media(max-width:420px){
      #fidali-panel{width:calc(100vw - 40px);left:20px;right:20px}
    }
  `;
  document.head.appendChild(style);

  // ── CRÉER LE BOUTON FLOTTANT ──
  var fab = document.createElement('button');
  fab.id = 'fidali-fab';
  fab.innerHTML = '🎯<span id="fidali-badge"></span>';
  fab.title = 'Ma fidélité';
  document.body.appendChild(fab);

  // ── CRÉER LE PANEL ──
  var panel = document.createElement('div');
  panel.id = 'fidali-panel';
  panel.innerHTML = 
    '<div class="fidali-hd" style="position:relative">' +
      '<h3>🎯 Programme Fidélité</h3>' +
      '<p>Consultez et cumulez vos points</p>' +
      '<button class="fidali-hd-close" id="fidali-close">✕</button>' +
    '</div>' +
    '<div class="fidali-bd">' +
      '<div class="fidali-row">' +
        '<input type="tel" class="fidali-inp" id="fidali-phone" placeholder="Votre numéro (05xx...)">' +
        '<button class="fidali-btn" id="fidali-check">Voir</button>' +
      '</div>' +
      '<div id="fidali-result"></div>' +
    '</div>' +
    '<div class="fidali-ft">' +
      '<a href="https://fidali.vercel.app" target="_blank">Propulsé par <b>Fidali</b> 💜</a>' +
    '</div>';
  document.body.appendChild(panel);

  // ── CRÉER LE TOAST ──
  var toast = document.createElement('div');
  toast.id = 'fidali-toast';
  document.body.appendChild(toast);

  // ── LOGIQUE ──
  var isOpen = false;
  var phoneInput = document.getElementById('fidali-phone');
  var checkBtn = document.getElementById('fidali-check');
  var closeBtn = document.getElementById('fidali-close');
  var resultDiv = document.getElementById('fidali-result');

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
  }

  fab.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', togglePanel);

  document.addEventListener('click', function(e) {
    if (isOpen && !panel.contains(e.target) && !fab.contains(e.target)) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });

  checkBtn.addEventListener('click', function() { loadPoints(); });
  phoneInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loadPoints();
  });

  // ── AFFICHER UN TOAST ──
  function showToast(msg, duration) {
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, duration || 5000);
  }

  // ── CHARGER LES POINTS ──
  function loadPoints() {
    var phone = phoneInput.value.trim();
    if (!phone || phone.length < 8) {
      resultDiv.innerHTML = '<div class="fidali-err">Entrez un numéro valide</div>';
      return;
    }

    resultDiv.innerHTML = '<div class="fidali-ld">Chargement...</div>';
    checkBtn.disabled = true;

    fetch(CONFIG.apiUrl + '/client/' + encodeURIComponent(phone), {
      headers: { 'Authorization': 'Bearer ' + CONFIG.apiKey }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      checkBtn.disabled = false;

      if (data.error || !data.cards || !data.cards.length) {
        resultDiv.innerHTML = '<div class="fidali-err">Aucune carte trouvée pour ce numéro.<br><span style="font-size:11px;opacity:.7">Passez une commande pour être inscrit automatiquement !</span></div>';
        return;
      }

      var card = data.cards[0];
      var pct = Math.min((card.points / card.max_points) * 100, 100);
      var complete = card.points >= card.max_points;

      resultDiv.innerHTML = 
        '<div class="fidali-crd">' +
          '<div class="fidali-crd-d" style="width:100px;height:100px;top:-30px;right:-30px"></div>' +
          '<div class="fidali-crd-d" style="width:60px;height:60px;bottom:-20px;left:-20px"></div>' +
          '<div style="position:relative;z-index:1">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
              '<div>' +
                '<div style="font-size:14px;font-weight:700">' + (data.name || 'Client') + '</div>' +
                '<div style="font-size:10px;opacity:.5">' + (card.total_visits || 0) + ' visite(s)</div>' +
              '</div>' +
              '<div style="background:rgba(255,255,255,.15);padding:4px 10px;border-radius:20px;font-size:10px;font-weight:700">' + 
                (card.business_name || '') + 
              '</div>' +
            '</div>' +
            '<div style="text-align:center;margin:18px 0">' +
              '<div style="font-size:40px;font-weight:900;letter-spacing:-1px">' + card.points + ' <span style="font-size:18px;opacity:.4;font-weight:600">/ ' + card.max_points + '</span></div>' +
              '<div style="font-size:11px;opacity:.5;margin-top:2px">points collectés</div>' +
            '</div>' +
            '<div class="fidali-bar-bg"><div class="fidali-bar-fill" style="width:' + pct + '%"></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:12px;opacity:.8">' +
              '<span>🎁 ' + card.reward + '</span>' +
              '<span>' + Math.round(pct) + '%</span>' +
            '</div>' +
            (complete ? '<button class="fidali-claim" onclick="window._fidaliRedeem(\'' + phone + '\')">🎉 Réclamer ma récompense !</button>' : 
              '<p style="text-align:center;font-size:11px;opacity:.5;margin-top:12px">Encore ' + (card.max_points - card.points) + ' achat(s) !</p>') +
          '</div>' +
        '</div>';
    })
    .catch(function() {
      checkBtn.disabled = false;
      resultDiv.innerHTML = '<div class="fidali-err">Erreur de connexion</div>';
    });
  }

  // ── RÉCLAMER UNE RÉCOMPENSE ──
  window._fidaliRedeem = function(phone) {
    resultDiv.innerHTML = '<div class="fidali-ld">Réclamation...</div>';

    fetch(CONFIG.apiUrl + '/reward/redeem', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + CONFIG.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_code: CONFIG.cardCode, phone: phone })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        showToast('🎉 ' + data.reward + ' — Profitez-en !', 6000);
        resultDiv.innerHTML = '<div class="fidali-ok">🎉 ' + data.reward + '<br>Points remis à zéro !</div>';
        setTimeout(loadPoints, 3000);
      } else {
        resultDiv.innerHTML = '<div class="fidali-err">' + (data.error || 'Erreur') + '</div>';
      }
    })
    .catch(function() {
      resultDiv.innerHTML = '<div class="fidali-err">Erreur de connexion</div>';
    });
  };

  // ── FONCTION GLOBALE : AJOUTER DES POINTS ──
  window.fidaliAddPoints = function(phone, name, points) {
    return fetch(CONFIG.apiUrl + '/auto-points', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + CONFIG.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_code: CONFIG.cardCode, phone: phone, name: name || 'Client', points: points || 1 })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.success) {
        var msg = data.new_client
          ? '🎯 Bienvenue ! Carte fidélité créée + ' + (points||1) + ' point(s) !'
          : '⭐ +' + (points||1) + ' point(s) fidélité ! (' + data.points + '/' + data.max_points + ')';

        if (data.reward_reached) {
          msg = '🎉 Félicitations ! Vous avez gagné : ' + data.reward + ' !';
        }

        showToast(msg, 6000);

        // Montrer le badge
        var badge = document.getElementById('fidali-badge');
        if (badge) {
          badge.style.display = 'flex';
          badge.textContent = data.points;
          setTimeout(function() { badge.style.display = 'none'; }, 10000);
        }
      }
      return data;
    })
    .catch(function(e) {
      console.error('[Fidali] Erreur:', e);
      return { success: false };
    });
  };

  // ============================================
  // ✅ AUTO-DÉTECTION DES FORMULAIRES
  // Le widget détecte automatiquement les 
  // formulaires de commande et ajoute des points
  // ============================================
  if (CONFIG.autoDetect) {

    // Trouver un champ téléphone dans un formulaire
    function findPhoneField(form) {
      var inputs = form.querySelectorAll('input');
      for (var i = 0; i < inputs.length; i++) {
        var inp = inputs[i];
        var type = (inp.type || '').toLowerCase();
        var name = (inp.name || '').toLowerCase();
        var placeholder = (inp.placeholder || '').toLowerCase();
        var id = (inp.id || '').toLowerCase();

        if (type === 'tel') return inp;
        if (name.match(/phone|tel|mobile|numero|num/)) return inp;
        if (id.match(/phone|tel|mobile|numero|num/)) return inp;
        if (placeholder.match(/phone|tel|mobile|05|numéro|numero/)) return inp;
      }
      return null;
    }

    // Trouver un champ nom dans un formulaire
    function findNameField(form) {
      var inputs = form.querySelectorAll('input');
      for (var i = 0; i < inputs.length; i++) {
        var inp = inputs[i];
        var name = (inp.name || '').toLowerCase();
        var placeholder = (inp.placeholder || '').toLowerCase();
        var id = (inp.id || '').toLowerCase();

        if (name.match(/^name$|fullname|full_name|nom|prenom|customer/)) return inp;
        if (id.match(/^name$|fullname|full_name|nom|prenom|customer/)) return inp;
        if (placeholder.match(/nom|name|prénom/)) return inp;
      }
      return null;
    }

    // Intercepter les soumissions de formulaires
    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (!form || form.tagName !== 'FORM') return;

      var phoneField = findPhoneField(form);
      if (!phoneField) return; // Pas un formulaire de commande

      var phone = phoneField.value.trim();
      if (!phone || phone.length < 8) return;

      var nameField = findNameField(form);
      var name = nameField ? nameField.value.trim() : 'Client';

      // Ajouter les points automatiquement (non bloquant)
      setTimeout(function() {
        window.fidaliAddPoints(phone, name, 1);
      }, 500);
    }, true);

    // Aussi intercepter les boutons qui ne sont pas dans un formulaire
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('button[type="submit"], input[type="submit"]');
      if (!btn) return;

      var form = btn.closest('form');
      if (form) return; // Déjà géré par l'event submit

      // Chercher un formulaire proche
      var parent = btn.closest('div, section, main');
      if (!parent) return;

      var phoneField = findPhoneField(parent);
      if (!phoneField) return;

      var phone = phoneField.value.trim();
      if (!phone || phone.length < 8) return;

      var nameField = findNameField(parent);
      var name = nameField ? nameField.value.trim() : 'Client';

      setTimeout(function() {
        window.fidaliAddPoints(phone, name, 1);
      }, 500);
    }, true);
  }

  console.log('[Fidali] Widget chargé ✅ — Carte:', CONFIG.cardCode);

})();
