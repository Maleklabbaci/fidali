// ============================================
// FIDALI WIDGET v5 — Premium Out of the Box
// ============================================
(function(){
'use strict';
var S=document.querySelectorAll('script[data-card]');
var T=S[S.length-1];if(!T)return;
var C={
  u:'https://fidali.vercel.app/api/v1',
  c:T.getAttribute('data-card')||'',
  k:T.getAttribute('data-key')||'',
  p:T.getAttribute('data-position')||'bottom-right',
  cl:T.getAttribute('data-color')||'#7c3aed',
  a:T.getAttribute('data-auto')!=='false',
  logo:'https://fidali.vercel.app/logo.png'
};
if(!C.c||!C.k){console.warn('[Fidali] data-card et data-key requis');return}

var css=document.createElement('style');css.id='fl-css';
css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── FAB ── */
#fl-fab{
  position:fixed;z-index:99998;
  ${C.p.includes('right')?'right:20px;':'left:20px;'}
  ${C.p.includes('top')?'top:20px;':'bottom:20px;'}
  width:58px;height:58px;border-radius:50%;border:none;outline:none;
  background:${C.cl};
  box-shadow:0 4px 24px ${C.cl}50,0 0 0 0 ${C.cl}40;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  -webkit-tap-highlight-color:transparent;
  animation:fl-pulse 3s ease-in-out infinite;
  overflow:hidden;
}
#fl-fab img{width:30px;height:30px;object-fit:contain;filter:brightness(10);transition:all .3s}
#fl-fab:hover{transform:scale(1.08);box-shadow:0 6px 32px ${C.cl}60}
#fl-fab:active{transform:scale(.94)}
#fl-fab.open{animation:none;background:#111;box-shadow:0 4px 20px rgba(0,0,0,.25)}
#fl-fab.open img{opacity:0;transform:scale(0) rotate(90deg)}
#fl-fab .fl-fab-x{
  position:absolute;color:white;font-size:20px;font-weight:300;
  opacity:0;transform:scale(0) rotate(-90deg);transition:all .3s;
  font-family:'Inter',sans-serif;
}
#fl-fab.open .fl-fab-x{opacity:1;transform:scale(1) rotate(0)}

@keyframes fl-pulse{
  0%,100%{box-shadow:0 4px 24px ${C.cl}50,0 0 0 0 ${C.cl}40}
  50%{box-shadow:0 4px 24px ${C.cl}50,0 0 0 12px ${C.cl}00}
}

#fl-badge{
  position:absolute;top:-3px;right:-3px;
  min-width:20px;height:20px;border-radius:10px;
  background:#ef4444;color:white;
  font-size:10px;font-weight:800;line-height:1;
  display:none;align-items:center;justify-content:center;
  border:2.5px solid white;padding:0 4px;
  font-family:'Inter',sans-serif;
}

/* ── OVERLAY ── */
#fl-overlay{
  position:fixed;inset:0;z-index:99998;
  background:rgba(0,0,0,.4);
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  display:none;opacity:0;
  transition:opacity .3s;
}
#fl-overlay.open{display:block;opacity:1}

/* ── PANEL ── */
#fl-panel{
  position:fixed;z-index:99999;
  top:50%;left:50%;
  transform:translate(-50%,-50%) scale(.95);
  width:400px;max-width:calc(100vw - 32px);
  max-height:calc(100vh - 48px);
  background:#fff;border-radius:24px;
  box-shadow:0 32px 80px -12px rgba(0,0,0,.25);
  overflow:hidden;display:none;opacity:0;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  transition:all .35s cubic-bezier(.16,1,.3,1);
}
#fl-panel.open{display:block;opacity:1;transform:translate(-50%,-50%) scale(1)}
#fl-panel *{box-sizing:border-box;margin:0;padding:0}

/* ── HEADER ── */
.fl-hd{
  padding:28px 28px 24px;
  background:${C.cl};
  position:relative;overflow:hidden;
  color:white;
}
.fl-hd-bg{
  position:absolute;bottom:-20px;right:-10px;
  width:120px;height:120px;
  opacity:.06;pointer-events:none;
}
.fl-hd-bg img{width:100%;height:100%;object-fit:contain}
.fl-hd-circle{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.06);pointer-events:none;
}
.fl-hd-top{
  display:flex;align-items:center;gap:12px;
  position:relative;z-index:1;margin-bottom:14px;
}
.fl-hd-logo{
  width:36px;height:36px;border-radius:10px;
  background:rgba(255,255,255,.15);
  backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
}
.fl-hd-logo img{width:22px;height:22px;object-fit:contain;filter:brightness(10)}
.fl-hd-t{font-size:17px;font-weight:800;letter-spacing:-.3px}
.fl-hd-s{
  font-size:12px;opacity:.6;
  position:relative;z-index:1;
  font-weight:450;line-height:1.4;
}
.fl-x{
  position:absolute;top:20px;right:20px;z-index:2;
  background:rgba(255,255,255,.12);backdrop-filter:blur(8px);
  border:none;color:white;width:32px;height:32px;border-radius:10px;
  cursor:pointer;font-size:14px;font-weight:500;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;font-family:'Inter',sans-serif;
}
.fl-x:hover{background:rgba(255,255,255,.22)}

/* ── BODY ── */
.fl-bd{
  padding:24px 28px 28px;
  position:relative;
}
.fl-bd-wm{
  position:absolute;bottom:10px;right:10px;
  width:80px;height:80px;opacity:.03;pointer-events:none;
}
.fl-bd-wm img{width:100%;height:100%;object-fit:contain}

.fl-label{
  font-size:11px;font-weight:600;color:#a1a1aa;
  text-transform:uppercase;letter-spacing:.8px;
  margin-bottom:10px;
}
.fl-row{display:flex;gap:8px}
.fl-inp{
  flex:1;padding:0 16px;height:48px;
  border:2px solid #f0f0f0;border-radius:14px;
  font-size:15px;outline:none;
  font-family:inherit;color:#18181b;
  transition:all .2s;background:#fafafa;
  font-weight:500;
}
.fl-inp:focus{
  border-color:${C.cl};background:#fff;
  box-shadow:0 0 0 4px ${C.cl}10;
}
.fl-inp::placeholder{color:#ccc;font-weight:400}
.fl-btn{
  height:48px;padding:0 22px;
  background:${C.cl};color:white;
  border:none;border-radius:14px;
  font-weight:700;font-size:14px;
  cursor:pointer;font-family:inherit;
  transition:all .2s;white-space:nowrap;
  letter-spacing:-.1px;
}
.fl-btn:hover{filter:brightness(1.1);transform:translateY(-1px)}
.fl-btn:active{transform:translateY(0)}
.fl-btn:disabled{opacity:.3;cursor:not-allowed;transform:none;filter:none}

.fl-res{margin-top:24px;position:relative;z-index:1}

/* ── CARD ── */
.fl-card{
  background:${C.cl};border-radius:18px;
  overflow:hidden;color:white;position:relative;
}
.fl-card-bg{
  position:absolute;bottom:-15px;right:-10px;
  width:100px;height:100px;opacity:.05;pointer-events:none;
}
.fl-card-bg img{width:100%;height:100%;object-fit:contain}
.fl-card-circle{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.05);pointer-events:none;
}
.fl-card-in{padding:22px;position:relative;z-index:1}

.fl-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px}
.fl-card-nm{font-size:15px;font-weight:800;letter-spacing:-.3px}
.fl-card-vs{font-size:10px;opacity:.4;margin-top:3px;font-weight:500}
.fl-card-tag{
  font-size:10px;font-weight:600;
  background:rgba(255,255,255,.12);backdrop-filter:blur(4px);
  padding:5px 12px;border-radius:8px;opacity:.85;
}

.fl-card-center{text-align:center;padding:8px 0 22px}
.fl-card-num{font-size:52px;font-weight:900;letter-spacing:-3px;line-height:1}
.fl-card-max{font-size:20px;font-weight:500;opacity:.3;letter-spacing:0}
.fl-card-lbl{
  font-size:10px;opacity:.35;margin-top:6px;
  font-weight:600;letter-spacing:1.5px;text-transform:uppercase;
}

.fl-bar{background:rgba(255,255,255,.1);border-radius:6px;height:5px;overflow:hidden}
.fl-bar-f{height:100%;border-radius:6px;transition:width 1.5s cubic-bezier(.22,1,.36,1);background:rgba(255,255,255,.85)}
.fl-bar-f.done{background:linear-gradient(90deg,#6ee7b7,#34d399)}

.fl-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
.fl-card-rw{font-size:12px;opacity:.7;font-weight:500}
.fl-card-pc{font-size:11px;opacity:.25;font-weight:700}

.fl-card-left{
  text-align:center;font-size:11px;opacity:.3;
  margin-top:14px;font-weight:500;letter-spacing:-.1px;
}

.fl-claim{
  margin-top:18px;width:100%;height:46px;
  background:white;color:${C.cl};border:none;
  border-radius:13px;font-weight:800;font-size:14px;
  cursor:pointer;font-family:inherit;letter-spacing:-.2px;
  transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
}
.fl-claim:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,.15)}
.fl-claim:active{transform:translateY(0)}

/* ── FOOTER ── */
.fl-ft{
  padding:16px 28px;
  border-top:1px solid #f5f5f5;
  display:flex;align-items:center;justify-content:center;gap:6px;
}
.fl-ft img{width:14px;height:14px;object-fit:contain;opacity:.4}
.fl-ft a{
  font-size:10px;color:#c4c4c4;text-decoration:none;
  font-weight:500;letter-spacing:.2px;
}
.fl-ft a b{color:${C.cl};font-weight:700}

/* ── MESSAGES ── */
.fl-msg{
  padding:16px 18px;border-radius:14px;
  font-size:13px;text-align:center;
  font-weight:500;line-height:1.5;
}
.fl-msg-err{background:#fef2f2;border:1px solid #fee2e2;color:#dc2626}
.fl-msg-err span{display:block;font-size:11px;color:#f87171;margin-top:6px;font-weight:400}
.fl-msg-ok{background:#f0fdf4;border:1px solid #dcfce7;color:#16a34a}
.fl-msg-ok span{display:block;font-size:11px;color:#4ade80;margin-top:6px;font-weight:400}
.fl-ld{
  text-align:center;padding:36px 20px;
  color:#b4b4b4;font-size:13px;font-weight:500;
}
.fl-ld::after{
  content:'';display:block;width:22px;height:22px;
  border:2.5px solid #eee;border-top-color:${C.cl};
  border-radius:50%;margin:12px auto 0;
  animation:fl-spin .6s linear infinite;
}
@keyframes fl-spin{to{transform:rotate(360deg)}}

/* ── TOAST ── */
#fl-toast{
  position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;
  padding:16px 28px;border-radius:16px;
  background:#18181b;color:white;
  font-family:'Inter',system-ui,sans-serif;
  font-size:14px;font-weight:600;letter-spacing:-.2px;
  box-shadow:0 16px 48px rgba(0,0,0,.2);
  display:none;text-align:center;max-width:92vw;
  -webkit-font-smoothing:antialiased;
  border:1px solid rgba(255,255,255,.06);
}
#fl-toast.show{display:block;animation:fl-toast .35s cubic-bezier(.16,1,.3,1)}
@keyframes fl-toast{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

@media(max-width:480px){
  #fl-panel{
    width:calc(100vw - 24px);max-width:400px;
    border-radius:22px;
  }
  #fl-fab{width:52px;height:52px;
    ${C.p.includes('right')?'right:14px;':'left:14px;'}bottom:14px;
  }
  #fl-fab img{width:26px;height:26px}
  .fl-card-num{font-size:44px}
  .fl-hd{padding:24px 22px 20px}
  .fl-bd{padding:20px 22px 24px}
  .fl-ft{padding:14px 22px}
}
`;
document.head.appendChild(css);

// ── FAB ──
var fab=document.createElement('button');
fab.id='fl-fab';
fab.innerHTML=
  '<img src="'+C.logo+'" alt="Fidali">'+
  '<span class="fl-fab-x">✕</span>'+
  '<span id="fl-badge"></span>';
document.body.appendChild(fab);

// ── OVERLAY ──
var overlay=document.createElement('div');
overlay.id='fl-overlay';
document.body.appendChild(overlay);

// ── PANEL ──
var panel=document.createElement('div');
panel.id='fl-panel';
panel.innerHTML=
  '<div class="fl-hd">'+
    '<div class="fl-hd-circle" style="width:180px;height:180px;top:-60px;right:-40px"></div>'+
    '<div class="fl-hd-circle" style="width:100px;height:100px;bottom:-40px;left:-30px"></div>'+
    '<div class="fl-hd-bg"><img src="'+C.logo+'" alt=""></div>'+
    '<button class="fl-x" id="fl-close">✕</button>'+
    '<div class="fl-hd-top">'+
      '<div class="fl-hd-logo"><img src="'+C.logo+'" alt="Fidali"></div>'+
      '<div class="fl-hd-t">Programme Fidélité</div>'+
    '</div>'+
    '<div class="fl-hd-s">Entrez votre numéro pour consulter vos points<br>et récompenses</div>'+
  '</div>'+
  '<div class="fl-bd">'+
    '<div class="fl-bd-wm"><img src="'+C.logo+'" alt=""></div>'+
    '<div class="fl-label">Votre numéro</div>'+
    '<div class="fl-row">'+
      '<input type="tel" class="fl-inp" id="fl-phone" placeholder="05xx xx xx xx">'+
      '<button class="fl-btn" id="fl-check">Consulter</button>'+
    '</div>'+
    '<div class="fl-res" id="fl-result"></div>'+
  '</div>'+
  '<div class="fl-ft">'+
    '<img src="'+C.logo+'" alt="">'+
    '<a href="https://fidali.vercel.app" target="_blank" rel="noopener">Propulsé par <b>Fidali</b></a>'+
  '</div>';
document.body.appendChild(panel);

// ── TOAST ──
var toast=document.createElement('div');
toast.id='fl-toast';
document.body.appendChild(toast);

// ── LOGIC ──
var isOpen=false;
var ph=document.getElementById('fl-phone');
var btn=document.getElementById('fl-check');
var cls=document.getElementById('fl-close');
var res=document.getElementById('fl-result');

function toggle(){
  isOpen=!isOpen;
  panel.classList.toggle('open',isOpen);
  fab.classList.toggle('open',isOpen);
  overlay.classList.toggle('open',isOpen);
  if(isOpen&&ph)setTimeout(function(){ph.focus()},200);
  document.body.style.overflow=isOpen?'hidden':'';
}

function close(){
  isOpen=false;
  panel.classList.remove('open');
  fab.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow='';
}

fab.onclick=toggle;
cls.onclick=close;
overlay.onclick=close;

document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen)close()});

btn.onclick=function(){loadPts()};
ph.onkeydown=function(e){if(e.key==='Enter')loadPts()};

function showToast(m,d){
  toast.innerHTML=m;toast.classList.add('show');
  setTimeout(function(){toast.classList.remove('show')},d||4500);
}

function loadPts(){
  var p=ph.value.trim();
  if(!p||p.length<8){
    res.innerHTML='<div class="fl-msg fl-msg-err">Veuillez entrer un numéro valide</div>';
    return;
  }
  res.innerHTML='<div class="fl-ld">Recherche en cours</div>';
  btn.disabled=true;

  fetch(C.u+'/client/'+encodeURIComponent(p),{
    headers:{'Authorization':'Bearer '+C.k}
  })
  .then(function(r){return r.json()})
  .then(function(d){
    btn.disabled=false;
    if(d.error||!d.cards||!d.cards.length){
      res.innerHTML='<div class="fl-msg fl-msg-err">Aucune carte trouvée pour ce numéro<span>Passez une commande pour être inscrit automatiquement</span></div>';
      return;
    }
    var c=d.cards[0];
    var pct=Math.min((c.points/c.max_points)*100,100);
    var ok=c.points>=c.max_points;
    var left=c.max_points-c.points;

    res.innerHTML=
    '<div class="fl-card">'+
      '<div class="fl-card-circle" style="width:160px;height:160px;top:-60px;right:-40px"></div>'+
      '<div class="fl-card-circle" style="width:80px;height:80px;bottom:-30px;left:-20px"></div>'+
      '<div class="fl-card-bg"><img src="'+C.logo+'" alt=""></div>'+
      '<div class="fl-card-in">'+
        '<div class="fl-card-top">'+
          '<div>'+
            '<div class="fl-card-nm">'+(d.name||'Client')+'</div>'+
            '<div class="fl-card-vs">'+(c.total_visits||0)+' visite'+((c.total_visits||0)>1?'s':'')+'</div>'+
          '</div>'+
          '<div class="fl-card-tag">'+(c.business_name||'')+'</div>'+
        '</div>'+
        '<div class="fl-card-center">'+
          '<div class="fl-card-num">'+c.points+'<span class="fl-card-max"> /'+c.max_points+'</span></div>'+
          '<div class="fl-card-lbl">Points collectés</div>'+
        '</div>'+
        '<div class="fl-bar"><div class="fl-bar-f'+(ok?' done':'')+'" style="width:'+pct+'%"></div></div>'+
        '<div class="fl-card-foot">'+
          '<div class="fl-card-rw">🎁 '+c.reward+'</div>'+
          '<div class="fl-card-pc">'+Math.round(pct)+'%</div>'+
        '</div>'+
        (ok?
          '<button class="fl-claim" onclick="window._flR(\''+p+'\')">🎉 Réclamer ma récompense</button>':
          '<div class="fl-card-left">Plus que '+left+' achat'+(left>1?'s':'')+' avant la récompense</div>'
        )+
      '</div>'+
    '</div>';
  })
  .catch(function(){
    btn.disabled=false;
    res.innerHTML='<div class="fl-msg fl-msg-err">Impossible de se connecter</div>';
  });
}

window._flR=function(p){
  res.innerHTML='<div class="fl-ld">Réclamation en cours</div>';
  fetch(C.u+'/reward/redeem',{
    method:'POST',
    headers:{'Authorization':'Bearer '+C.k,'Content-Type':'application/json'},
    body:JSON.stringify({card_code:C.c,phone:p})
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      showToast('🎉 '+d.reward+' — Profitez-en !',5000);
      res.innerHTML='<div class="fl-msg fl-msg-ok">🎉 '+d.reward+'<span>Points remis à zéro · Continuez à cumuler !</span></div>';
      setTimeout(loadPts,3000);
    }else{
      res.innerHTML='<div class="fl-msg fl-msg-err">'+(d.error||'Erreur')+'</div>';
    }
  })
  .catch(function(){res.innerHTML='<div class="fl-msg fl-msg-err">Erreur de connexion</div>'});
};

window.fidaliAddPoints=function(p,n,pts){
  return fetch(C.u+'/auto-points',{
    method:'POST',
    headers:{'Authorization':'Bearer '+C.k,'Content-Type':'application/json'},
    body:JSON.stringify({card_code:C.c,phone:p,name:n||'Client',points:pts||1})
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      var m=d.new_client
        ?'🎯 Carte fidélité créée · +'+(pts||1)+' point'
        :'⭐ +'+(pts||1)+' point · '+d.points+'/'+d.max_points;
      if(d.reward_reached)m='🎉 Récompense débloquée : '+d.reward;
      showToast(m,5000);
      var b=document.getElementById('fl-badge');
      if(b){b.style.display='flex';b.textContent=d.points;setTimeout(function(){b.style.display='none'},8000)}
    }
    return d;
  })
  .catch(function(e){console.error('[Fidali]',e);return{success:false}});
};

if(C.a){
  function fp(f){var i=f.querySelectorAll('input');for(var x=0;x<i.length;x++){var t=(i[x].type||'').toLowerCase(),n=(i[x].name||'').toLowerCase(),p=(i[x].placeholder||'').toLowerCase(),d=(i[x].id||'').toLowerCase();if(t==='tel')return i[x];if(n.match(/phone|tel|mobile|numero/))return i[x];if(d.match(/phone|tel|mobile|numero/))return i[x];if(p.match(/phone|tel|mobile|05|numéro|numero/))return i[x]}return null}
  function fn(f){var i=f.querySelectorAll('input');for(var x=0;x<i.length;x++){var n=(i[x].name||'').toLowerCase(),p=(i[x].placeholder||'').toLowerCase(),d=(i[x].id||'').toLowerCase();if(n.match(/^name$|fullname|full_name|nom|prenom|customer/))return i[x];if(d.match(/^name$|fullname|full_name|nom|prenom|customer/))return i[x];if(p.match(/nom|name|prénom/))return i[x]}return null}
  document.addEventListener('submit',function(e){var f=e.target;if(!f||f.tagName!=='FORM')return;var pf=fp(f);if(!pf)return;var p=pf.value.trim();if(!p||p.length<8)return;var nf=fn(f);var n=nf?nf.value.trim():'Client';setTimeout(function(){window.fidaliAddPoints(p,n,1)},500)},true);
}

console.log('[Fidali] Widget v5 ✅',C.c);
})();
