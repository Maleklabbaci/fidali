// ============================================
// FIDALI WIDGET v7 — Bulletproof Design
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
  a:T.getAttribute('data-auto')!=='false'
};
if(!C.c||!C.k)return;

// Inject styles with !important to override host site
var css=document.createElement('style');
css.id='fl-css';
css.textContent=`

/* === RESET for widget elements === */
#fl-fab,#fl-fab *,
#fl-over,
#fl-panel,#fl-panel *,
#fl-toast{
  font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif !important;
  -webkit-font-smoothing:antialiased !important;
  line-height:normal !important;
  letter-spacing:normal !important;
  text-transform:none !important;
  box-sizing:border-box !important;
}

/* === FAB === */
#fl-fab{
  position:fixed !important;z-index:99998 !important;
  ${C.p.includes('right')?'right:20px !important;':'left:20px !important;'}
  ${C.p.includes('top')?'top:20px !important;':'bottom:20px !important;'}
  width:56px !important;height:56px !important;
  border-radius:50% !important;border:none !important;outline:none !important;
  background:${C.cl} !important;color:white !important;
  box-shadow:0 4px 20px ${C.cl}50 !important;
  cursor:pointer !important;font-size:24px !important;
  display:flex !important;align-items:center !important;justify-content:center !important;
  transition:all .3s cubic-bezier(.4,0,.2,1) !important;
  padding:0 !important;margin:0 !important;
  animation:fl-glow 3s ease-in-out infinite !important;
  min-width:0 !important;min-height:0 !important;
  max-width:none !important;max-height:none !important;
}
#fl-fab:hover{transform:scale(1.1) !important;box-shadow:0 6px 28px ${C.cl}60 !important}
#fl-fab:active{transform:scale(.92) !important}
#fl-fab.open{
  animation:none !important;background:#1a1a1a !important;
  box-shadow:0 4px 16px rgba(0,0,0,.25) !important;font-size:18px !important;
}
@keyframes fl-glow{
  0%,100%{box-shadow:0 4px 20px ${C.cl}50}
  50%{box-shadow:0 4px 20px ${C.cl}50,0 0 0 8px ${C.cl}12}
}

#fl-badge{
  position:absolute !important;top:-4px !important;right:-4px !important;
  min-width:18px !important;height:18px !important;border-radius:9px !important;
  background:#ef4444 !important;color:white !important;
  font-size:9px !important;font-weight:800 !important;
  display:none !important;align-items:center !important;justify-content:center !important;
  border:2px solid white !important;padding:0 4px !important;
}

/* === OVERLAY === */
#fl-over{
  position:fixed !important;top:0 !important;left:0 !important;right:0 !important;bottom:0 !important;
  z-index:99998 !important;
  background:rgba(0,0,0,.55) !important;
  backdrop-filter:blur(10px) !important;-webkit-backdrop-filter:blur(10px) !important;
  display:none !important;margin:0 !important;padding:0 !important;
  width:100% !important;height:100% !important;
}
#fl-over.open{display:block !important;animation:fl-fade .25s ease !important}
@keyframes fl-fade{from{opacity:0}to{opacity:1}}

/* === PANEL === */
#fl-panel{
  position:fixed !important;z-index:99999 !important;
  top:50% !important;left:50% !important;
  transform:translate(-50%,-50%) scale(.92) !important;
  width:420px !important;max-width:calc(100vw - 32px) !important;
  background:#ffffff !important;border-radius:24px !important;
  box-shadow:0 32px 80px rgba(0,0,0,.25) !important;
  overflow:hidden !important;
  display:none !important;opacity:0 !important;
  margin:0 !important;padding:0 !important;
  border:none !important;
  transition:all .35s cubic-bezier(.16,1,.3,1) !important;
}
#fl-panel.open{
  display:block !important;opacity:1 !important;
  transform:translate(-50%,-50%) scale(1) !important;
}

/* === HEADER === */
.fl-hd{
  background:${C.cl} !important;
  padding:32px 32px 28px 32px !important;
  color:white !important;position:relative !important;overflow:hidden !important;
  margin:0 !important;border:none !important;
  display:block !important;
}
.fl-hd-deco{
  position:absolute !important;border-radius:50% !important;
  background:rgba(255,255,255,.06) !important;pointer-events:none !important;
}
.fl-hd-wm{
  position:absolute !important;bottom:8px !important;right:16px !important;
  font-size:72px !important;opacity:.05 !important;pointer-events:none !important;
  line-height:1 !important;
}
.fl-x{
  position:absolute !important;top:24px !important;right:24px !important;z-index:2 !important;
  background:rgba(255,255,255,.15) !important;
  border:none !important;color:white !important;
  width:36px !important;height:36px !important;border-radius:12px !important;
  cursor:pointer !important;font-size:16px !important;
  display:flex !important;align-items:center !important;justify-content:center !important;
  transition:background .15s !important;padding:0 !important;margin:0 !important;
  min-width:0 !important;
}
.fl-x:hover{background:rgba(255,255,255,.25) !important}
.fl-hd-row{
  display:flex !important;align-items:center !important;gap:14px !important;
  position:relative !important;z-index:1 !important;margin-bottom:12px !important;
  padding:0 !important;
}
.fl-hd-icon{
  width:44px !important;height:44px !important;border-radius:14px !important;
  background:rgba(255,255,255,.15) !important;
  display:flex !important;align-items:center !important;justify-content:center !important;
  font-size:20px !important;flex-shrink:0 !important;
  padding:0 !important;margin:0 !important;
}
.fl-hd-t{font-size:20px !important;font-weight:800 !important;color:white !important;letter-spacing:-.3px !important;margin:0 !important;padding:0 !important}
.fl-hd-st{font-size:12px !important;color:white !important;opacity:.5 !important;margin-top:2px !important;font-weight:500 !important;padding:0 !important}
.fl-hd-sub{
  font-size:13px !important;color:white !important;opacity:.55 !important;
  position:relative !important;z-index:1 !important;
  line-height:1.5 !important;font-weight:400 !important;
  margin:0 !important;padding:0 !important;
}

/* === BODY === */
.fl-bd{
  padding:28px 32px 32px 32px !important;
  background:white !important;
  position:relative !important;
  margin:0 !important;border:none !important;
  display:block !important;
}
.fl-bd-wm{
  position:absolute !important;bottom:12px !important;right:16px !important;
  font-size:60px !important;opacity:.03 !important;pointer-events:none !important;
  line-height:1 !important;
}
.fl-lbl{
  font-size:11px !important;font-weight:700 !important;color:#999 !important;
  text-transform:uppercase !important;letter-spacing:1.2px !important;
  margin:0 0 12px 0 !important;padding:0 !important;
  display:block !important;
}
.fl-row{
  display:flex !important;gap:10px !important;
  margin:0 !important;padding:0 !important;
  flex-wrap:nowrap !important;align-items:stretch !important;
}
.fl-inp{
  flex:1 1 0% !important;
  padding:0 18px !important;height:52px !important;
  border:2px solid #e8e8e8 !important;border-radius:14px !important;
  font-size:16px !important;outline:none !important;
  color:#111 !important;background:#fafafa !important;
  transition:all .2s !important;font-weight:500 !important;
  min-width:0 !important;max-width:none !important;
  margin:0 !important;display:block !important;
  -webkit-appearance:none !important;appearance:none !important;
  box-shadow:none !important;
  width:auto !important;
}
.fl-inp:focus{
  border-color:${C.cl} !important;background:#fff !important;
  box-shadow:0 0 0 4px ${C.cl}12 !important;
}
.fl-inp::placeholder{color:#bbb !important;font-weight:400 !important}
.fl-btn{
  flex:0 0 auto !important;
  height:52px !important;padding:0 28px !important;
  background:${C.cl} !important;color:white !important;
  border:none !important;border-radius:14px !important;
  font-weight:700 !important;font-size:15px !important;
  cursor:pointer !important;
  transition:all .15s !important;white-space:nowrap !important;
  display:flex !important;align-items:center !important;justify-content:center !important;
  margin:0 !important;min-width:0 !important;
  box-shadow:none !important;
}
.fl-btn:hover{filter:brightness(1.08) !important}
.fl-btn:active{transform:scale(.97) !important}
.fl-btn:disabled{opacity:.3 !important;cursor:not-allowed !important;transform:none !important;filter:none !important}

.fl-res{margin-top:24px !important;position:relative !important;z-index:1 !important}

/* === CARD === */
.fl-card{
  background:${C.cl} !important;border-radius:20px !important;
  overflow:hidden !important;color:white !important;position:relative !important;
  margin:0 !important;padding:0 !important;border:none !important;
}
.fl-card-deco{
  position:absolute !important;border-radius:50% !important;
  background:rgba(255,255,255,.05) !important;pointer-events:none !important;
}
.fl-card-wm{
  position:absolute !important;bottom:-5px !important;right:10px !important;
  font-size:56px !important;opacity:.04 !important;pointer-events:none !important;
  line-height:1 !important;
}
.fl-card-in{padding:24px 24px 22px 24px !important;position:relative !important;z-index:1 !important}
.fl-card-top{
  display:flex !important;justify-content:space-between !important;
  align-items:flex-start !important;margin-bottom:24px !important;
  padding:0 !important;
}
.fl-card-name{font-size:17px !important;font-weight:800 !important;color:white !important;letter-spacing:-.3px !important;margin:0 !important;padding:0 !important}
.fl-card-vis{font-size:11px !important;color:white !important;opacity:.4 !important;margin-top:3px !important;font-weight:500 !important;padding:0 !important}
.fl-card-tag{
  font-size:10px !important;font-weight:700 !important;color:white !important;
  background:rgba(255,255,255,.12) !important;
  padding:6px 14px !important;border-radius:10px !important;
  margin:0 !important;white-space:nowrap !important;
}
.fl-card-mid{text-align:center !important;padding:4px 0 26px 0 !important;margin:0 !important}
.fl-card-pts{
  font-size:56px !important;font-weight:900 !important;
  letter-spacing:-3px !important;line-height:1 !important;
  color:white !important;margin:0 !important;padding:0 !important;
}
.fl-card-mx{font-size:20px !important;font-weight:500 !important;opacity:.3 !important;letter-spacing:0 !important}
.fl-card-lbl{
  font-size:10px !important;color:white !important;opacity:.3 !important;
  margin-top:8px !important;font-weight:600 !important;
  letter-spacing:2px !important;text-transform:uppercase !important;
  padding:0 !important;
}

.fl-bar{
  background:rgba(255,255,255,.1) !important;border-radius:6px !important;
  height:6px !important;overflow:hidden !important;
  margin:0 !important;padding:0 !important;
}
.fl-bar-f{
  height:100% !important;border-radius:6px !important;
  background:rgba(255,255,255,.8) !important;
  transition:width 1.5s cubic-bezier(.22,1,.36,1) !important;
}
.fl-bar-f.ok{background:linear-gradient(90deg,#6ee7b7,#34d399) !important}

.fl-card-bot{
  display:flex !important;justify-content:space-between !important;
  align-items:center !important;margin-top:16px !important;padding:0 !important;
}
.fl-card-rw{font-size:13px !important;color:white !important;opacity:.7 !important;font-weight:500 !important;margin:0 !important;padding:0 !important}
.fl-card-pct{font-size:11px !important;color:white !important;opacity:.25 !important;font-weight:700 !important;margin:0 !important;padding:0 !important}
.fl-card-rem{
  text-align:center !important;font-size:11px !important;color:white !important;
  opacity:.3 !important;margin-top:16px !important;font-weight:500 !important;
  padding:0 !important;
}
.fl-clm{
  margin-top:18px !important;width:100% !important;height:48px !important;
  background:white !important;color:${C.cl} !important;border:none !important;
  border-radius:14px !important;font-weight:800 !important;font-size:14px !important;
  cursor:pointer !important;
  display:flex !important;align-items:center !important;justify-content:center !important;
  gap:8px !important;transition:all .15s !important;
  padding:0 !important;min-width:0 !important;box-shadow:none !important;
}
.fl-clm:hover{transform:translateY(-2px) !important;box-shadow:0 6px 20px rgba(0,0,0,.12) !important}
.fl-clm:active{transform:translateY(0) !important}

/* === FOOTER === */
.fl-ft{
  padding:16px 32px !important;border-top:1px solid #f0f0f0 !important;
  text-align:center !important;background:#fafafa !important;
  margin:0 !important;display:block !important;
}
.fl-ft a{
  font-size:11px !important;color:#bbb !important;text-decoration:none !important;
  font-weight:500 !important;letter-spacing:.3px !important;
  display:inline !important;
}
.fl-ft a b{color:${C.cl} !important;font-weight:700 !important}

/* === MESSAGES === */
.fl-msg{
  padding:18px 20px !important;border-radius:16px !important;
  font-size:13px !important;text-align:center !important;
  font-weight:500 !important;line-height:1.5 !important;
  margin:0 !important;display:block !important;
}
.fl-err{background:#fef2f2 !important;border:1px solid #fee2e2 !important;color:#dc2626 !important}
.fl-err span{display:block !important;font-size:11px !important;color:#f87171 !important;margin-top:6px !important;font-weight:400 !important;padding:0 !important}
.fl-suc{background:#f0fdf4 !important;border:1px solid #dcfce7 !important;color:#16a34a !important}
.fl-suc span{display:block !important;font-size:11px !important;color:#4ade80 !important;margin-top:6px !important;font-weight:400 !important;padding:0 !important}
.fl-ld{
  text-align:center !important;padding:40px 20px !important;
  color:#bbb !important;font-size:13px !important;font-weight:500 !important;
  margin:0 !important;display:block !important;
}
.fl-ld::after{
  content:'' !important;display:block !important;
  width:24px !important;height:24px !important;
  border:2.5px solid #eee !important;border-top-color:${C.cl} !important;
  border-radius:50% !important;margin:12px auto 0 !important;
  animation:fl-sp .6s linear infinite !important;
}
@keyframes fl-sp{to{transform:rotate(360deg)}}

/* === TOAST === */
#fl-toast{
  position:fixed !important;top:24px !important;left:50% !important;
  transform:translateX(-50%) !important;z-index:999999 !important;
  padding:16px 28px !important;border-radius:16px !important;
  background:#111 !important;color:white !important;
  font-size:14px !important;font-weight:600 !important;
  box-shadow:0 16px 48px rgba(0,0,0,.25) !important;
  display:none !important;text-align:center !important;
  max-width:92vw !important;margin:0 !important;border:none !important;
}
#fl-toast.show{display:block !important;animation:fl-ti .3s cubic-bezier(.16,1,.3,1) !important}
@keyframes fl-ti{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* === MOBILE === */
@media(max-width:480px){
  #fl-panel{width:calc(100vw - 24px) !important;max-width:420px !important;border-radius:22px !important}
  #fl-fab{width:50px !important;height:50px !important;font-size:20px !important;
    ${C.p.includes('right')?'right:14px !important;':'left:14px !important;'}bottom:14px !important;
  }
  .fl-card-pts{font-size:44px !important}
  .fl-hd{padding:28px 24px 24px 24px !important}
  .fl-bd{padding:24px !important}
  .fl-ft{padding:14px 24px !important}
  .fl-inp{height:48px !important;font-size:15px !important}
  .fl-btn{height:48px !important;padding:0 22px !important;font-size:14px !important}
}
`;
document.head.appendChild(css);

// FAB
var fab=document.createElement('button');
fab.id='fl-fab';
fab.innerHTML='🎯<span id="fl-badge"></span>';
document.body.appendChild(fab);

// Overlay
var over=document.createElement('div');
over.id='fl-over';
document.body.appendChild(over);

// Panel
var panel=document.createElement('div');
panel.id='fl-panel';
panel.innerHTML=
'<div class="fl-hd">'+
  '<div class="fl-hd-deco" style="width:220px;height:220px;top:-90px;right:-70px"></div>'+
  '<div class="fl-hd-deco" style="width:120px;height:120px;bottom:-60px;left:-40px"></div>'+
  '<div class="fl-hd-wm">🎯</div>'+
  '<button class="fl-x" id="fl-close">✕</button>'+
  '<div class="fl-hd-row">'+
    '<div class="fl-hd-icon">🎯</div>'+
    '<div>'+
      '<div class="fl-hd-t">Programme Fidélité</div>'+
      '<div class="fl-hd-st">by Fidali</div>'+
    '</div>'+
  '</div>'+
  '<div class="fl-hd-sub">Consultez vos points et réclamez vos récompenses</div>'+
'</div>'+
'<div class="fl-bd">'+
  '<div class="fl-bd-wm">🎯</div>'+
  '<div class="fl-lbl">Votre numéro de téléphone</div>'+
  '<div class="fl-row">'+
    '<input type="tel" class="fl-inp" id="fl-phone" placeholder="05xx xx xx xx">'+
    '<button class="fl-btn" id="fl-check">Consulter</button>'+
  '</div>'+
  '<div class="fl-res" id="fl-result"></div>'+
'</div>'+
'<div class="fl-ft">'+
  '<a href="https://fidali.vercel.app" target="_blank" rel="noopener">Propulsé par <b>Fidali</b> 💜</a>'+
'</div>';
document.body.appendChild(panel);

// Toast
var toast=document.createElement('div');
toast.id='fl-toast';
document.body.appendChild(toast);

// State
var isOpen=false;
var ph=document.getElementById('fl-phone');
var btn=document.getElementById('fl-check');
var cls=document.getElementById('fl-close');
var res=document.getElementById('fl-result');

function openW(){
  isOpen=true;
  panel.classList.add('open');fab.classList.add('open');over.classList.add('open');
  fab.innerHTML='✕<span id="fl-badge"></span>';
  document.body.style.overflow='hidden';
  setTimeout(function(){if(ph)ph.focus()},200);
}
function closeW(){
  isOpen=false;
  panel.classList.remove('open');fab.classList.remove('open');over.classList.remove('open');
  fab.innerHTML='🎯<span id="fl-badge"></span>';
  document.body.style.overflow='';
}

fab.onclick=function(){isOpen?closeW():openW()};
cls.onclick=closeW;
over.onclick=closeW;
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen)closeW()});

btn.onclick=function(){loadPts()};
ph.onkeydown=function(e){if(e.key==='Enter')loadPts()};

function showToast(m,d){
  toast.innerHTML=m;toast.classList.add('show');
  setTimeout(function(){toast.classList.remove('show')},d||4500);
}

function loadPts(){
  var p=ph.value.trim();
  if(!p||p.length<8){res.innerHTML='<div class="fl-msg fl-err">Veuillez entrer un numéro valide</div>';return}
  res.innerHTML='<div class="fl-ld">Recherche en cours</div>';
  btn.disabled=true;

  fetch(C.u+'/client/'+encodeURIComponent(p),{headers:{'Authorization':'Bearer '+C.k}})
  .then(function(r){return r.json()})
  .then(function(d){
    btn.disabled=false;
    if(d.error||!d.cards||!d.cards.length){
      res.innerHTML='<div class="fl-msg fl-err">Aucune carte trouvée pour ce numéro<span>Passez une commande pour être inscrit automatiquement</span></div>';
      return;
    }
    var c=d.cards[0],pct=Math.min((c.points/c.max_points)*100,100),ok=c.points>=c.max_points,left=c.max_points-c.points;
    res.innerHTML=
    '<div class="fl-card">'+
      '<div class="fl-card-deco" style="width:180px;height:180px;top:-70px;right:-50px"></div>'+
      '<div class="fl-card-deco" style="width:90px;height:90px;bottom:-35px;left:-25px"></div>'+
      '<div class="fl-card-wm">🎯</div>'+
      '<div class="fl-card-in">'+
        '<div class="fl-card-top">'+
          '<div><div class="fl-card-name">'+(d.name||'Client')+'</div><div class="fl-card-vis">'+(c.total_visits||0)+' visite'+((c.total_visits||0)>1?'s':'')+'</div></div>'+
          '<div class="fl-card-tag">'+(c.business_name||'')+'</div>'+
        '</div>'+
        '<div class="fl-card-mid">'+
          '<div class="fl-card-pts">'+c.points+'<span class="fl-card-mx"> / '+c.max_points+'</span></div>'+
          '<div class="fl-card-lbl">Points collectés</div>'+
        '</div>'+
        '<div class="fl-bar"><div class="fl-bar-f'+(ok?' ok':'')+'" style="width:'+pct+'%"></div></div>'+
        '<div class="fl-card-bot"><div class="fl-card-rw">🎁 '+c.reward+'</div><div class="fl-card-pct">'+Math.round(pct)+'%</div></div>'+
        (ok?'<button class="fl-clm" onclick="window._flR(\''+p+'\')">🎉 Réclamer ma récompense</button>':'<div class="fl-card-rem">Plus que '+left+' achat'+(left>1?'s':'')+' !</div>')+
      '</div>'+
    '</div>';
  })
  .catch(function(){btn.disabled=false;res.innerHTML='<div class="fl-msg fl-err">Impossible de se connecter</div>'});
}

window._flR=function(p){
  res.innerHTML='<div class="fl-ld">Réclamation en cours</div>';
  fetch(C.u+'/reward/redeem',{method:'POST',headers:{'Authorization':'Bearer '+C.k,'Content-Type':'application/json'},body:JSON.stringify({card_code:C.c,phone:p})})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){showToast('🎉 '+d.reward+' — Profitez-en !',5000);res.innerHTML='<div class="fl-msg fl-suc">🎉 '+d.reward+'<span>Points remis à zéro · Continuez à cumuler !</span></div>';setTimeout(loadPts,3000)}
    else{res.innerHTML='<div class="fl-msg fl-err">'+(d.error||'Erreur')+'</div>'}
  })
  .catch(function(){res.innerHTML='<div class="fl-msg fl-err">Erreur de connexion</div>'});
};

window.fidaliAddPoints=function(p,n,pts){
  return fetch(C.u+'/auto-points',{method:'POST',headers:{'Authorization':'Bearer '+C.k,'Content-Type':'application/json'},body:JSON.stringify({card_code:C.c,phone:p,name:n||'Client',points:pts||1})})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      var m=d.new_client?'🎯 Carte fidélité créée · +'+(pts||1)+' point':'⭐ +'+(pts||1)+' point · '+d.points+'/'+d.max_points;
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

console.log('[Fidali] Widget v7 ✅',C.c);
})();
