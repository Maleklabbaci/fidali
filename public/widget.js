// ============================================
// FIDALI WIDGET v6 — Clean & Minimal
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

var css=document.createElement('style');css.id='fl-css';
css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

#fl-fab{
  position:fixed;z-index:99998;
  ${C.p.includes('right')?'right:20px;':'left:20px;'}
  ${C.p.includes('top')?'top:20px;':'bottom:20px;'}
  width:56px;height:56px;border-radius:50%;border:none;outline:none;
  background:${C.cl};color:white;
  box-shadow:0 4px 20px ${C.cl}45;
  cursor:pointer;font-size:24px;
  display:flex;align-items:center;justify-content:center;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  -webkit-tap-highlight-color:transparent;
  animation:fl-glow 3s ease-in-out infinite;
  font-family:'Inter',sans-serif;
}
#fl-fab:hover{transform:scale(1.1);box-shadow:0 6px 28px ${C.cl}55}
#fl-fab:active{transform:scale(.92)}
#fl-fab.open{animation:none;background:#1a1a1a;box-shadow:0 4px 16px rgba(0,0,0,.2);font-size:18px}
@keyframes fl-glow{0%,100%{box-shadow:0 4px 20px ${C.cl}45}50%{box-shadow:0 4px 20px ${C.cl}45,0 0 0 8px ${C.cl}12}}

#fl-badge{
  position:absolute;top:-4px;right:-4px;
  min-width:18px;height:18px;border-radius:9px;
  background:#ef4444;color:white;
  font-size:9px;font-weight:800;
  display:none;align-items:center;justify-content:center;
  border:2px solid white;padding:0 4px;
  font-family:'Inter',sans-serif;
}

#fl-over{
  position:fixed;inset:0;z-index:99998;
  background:rgba(0,0,0,.5);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  display:none;
}
#fl-over.open{display:block;animation:fl-fade .25s ease}
@keyframes fl-fade{from{opacity:0}to{opacity:1}}

#fl-panel{
  position:fixed;z-index:99999;
  top:50%;left:50%;
  transform:translate(-50%,-50%) scale(.92);
  width:380px;max-width:calc(100vw - 32px);
  background:#fff;border-radius:28px;
  box-shadow:0 32px 80px rgba(0,0,0,.2);
  overflow:hidden;
  display:none;opacity:0;
  font-family:'Inter',-apple-system,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
  transition:all .35s cubic-bezier(.16,1,.3,1);
}
#fl-panel.open{display:block;opacity:1;transform:translate(-50%,-50%) scale(1)}
#fl-panel *{box-sizing:border-box;margin:0;padding:0}

/* Header */
.fl-hd{
  background:${C.cl};
  padding:32px 28px 28px;
  color:white;position:relative;overflow:hidden;
}
.fl-hd-deco{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.06);pointer-events:none;
}
.fl-hd-logo-bg{
  position:absolute;bottom:-10px;right:10px;
  font-size:80px;opacity:.06;pointer-events:none;
  line-height:1;
}
.fl-hd-row{display:flex;align-items:center;gap:14px;position:relative;z-index:1;margin-bottom:10px}
.fl-hd-icon{
  width:42px;height:42px;border-radius:14px;
  background:rgba(255,255,255,.15);
  display:flex;align-items:center;justify-content:center;
  font-size:20px;flex-shrink:0;
}
.fl-hd-txt h3{font-size:18px;font-weight:800;letter-spacing:-.3px;line-height:1.2}
.fl-hd-txt p{font-size:11px;opacity:.55;font-weight:500;margin-top:2px}
.fl-hd-sub{font-size:12px;opacity:.5;position:relative;z-index:1;line-height:1.5;font-weight:400}
.fl-x{
  position:absolute;top:22px;right:22px;z-index:2;
  background:rgba(255,255,255,.12);
  border:none;color:white;width:34px;height:34px;border-radius:12px;
  cursor:pointer;font-size:15px;
  display:flex;align-items:center;justify-content:center;
  transition:background .15s;font-family:'Inter',sans-serif;
}
.fl-x:hover{background:rgba(255,255,255,.22)}

/* Body */
.fl-bd{padding:28px}
.fl-lbl{
  font-size:11px;font-weight:700;color:#999;
  text-transform:uppercase;letter-spacing:1px;
  margin-bottom:10px;
}
.fl-row{display:flex;gap:10px}
.fl-inp{
  flex:1;padding:0 16px;height:50px;
  border:2px solid #eee;border-radius:14px;
  font-size:16px;outline:none;
  font-family:inherit;color:#111;
  transition:all .2s;background:white;
  font-weight:500;
}
.fl-inp:focus{border-color:${C.cl};box-shadow:0 0 0 4px ${C.cl}10}
.fl-inp::placeholder{color:#ccc;font-weight:400}
.fl-btn{
  height:50px;padding:0 24px;
  background:${C.cl};color:white;
  border:none;border-radius:14px;
  font-weight:700;font-size:14px;
  cursor:pointer;font-family:inherit;
  transition:all .15s;white-space:nowrap;
}
.fl-btn:hover{filter:brightness(1.08)}
.fl-btn:active{transform:scale(.97)}
.fl-btn:disabled{opacity:.3;cursor:not-allowed;transform:none;filter:none}

.fl-res{margin-top:24px}

/* Card */
.fl-card{
  background:${C.cl};border-radius:20px;
  overflow:hidden;color:white;position:relative;
}
.fl-card-deco{
  position:absolute;border-radius:50%;
  background:rgba(255,255,255,.05);pointer-events:none;
}
.fl-card-wm{
  position:absolute;bottom:-8px;right:8px;
  font-size:64px;opacity:.04;pointer-events:none;line-height:1;
}
.fl-card-in{padding:24px;position:relative;z-index:1}
.fl-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.fl-card-name{font-size:16px;font-weight:800;letter-spacing:-.3px}
.fl-card-vis{font-size:10px;opacity:.4;margin-top:3px;font-weight:500}
.fl-card-tag{
  font-size:10px;font-weight:700;
  background:rgba(255,255,255,.12);
  padding:5px 12px;border-radius:10px;
}
.fl-card-mid{text-align:center;padding:4px 0 24px}
.fl-card-pts{font-size:56px;font-weight:900;letter-spacing:-3px;line-height:1}
.fl-card-max{font-size:20px;font-weight:500;opacity:.3}
.fl-card-sub{font-size:10px;opacity:.3;margin-top:6px;font-weight:600;letter-spacing:2px;text-transform:uppercase}

.fl-bar{background:rgba(255,255,255,.1);border-radius:6px;height:6px;overflow:hidden}
.fl-bar-f{height:100%;border-radius:6px;background:rgba(255,255,255,.8);transition:width 1.5s cubic-bezier(.22,1,.36,1)}
.fl-bar-f.ok{background:linear-gradient(90deg,#6ee7b7,#34d399)}

.fl-card-bot{display:flex;justify-content:space-between;align-items:center;margin-top:16px}
.fl-card-rw{font-size:13px;opacity:.7;font-weight:500}
.fl-card-pct{font-size:11px;opacity:.25;font-weight:700}
.fl-card-rem{text-align:center;font-size:11px;opacity:.3;margin-top:14px;font-weight:500}

.fl-clm{
  margin-top:18px;width:100%;height:48px;
  background:white;color:${C.cl};border:none;
  border-radius:14px;font-weight:800;font-size:14px;
  cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:all .15s;
}
.fl-clm:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.12)}
.fl-clm:active{transform:translateY(0)}

/* Footer */
.fl-ft{
  padding:16px 28px;border-top:1px solid #f5f5f5;
  text-align:center;background:#fafafa;
}
.fl-ft a{font-size:10px;color:#bbb;text-decoration:none;font-weight:500;letter-spacing:.3px}
.fl-ft a b{color:${C.cl};font-weight:700}

/* Messages */
.fl-msg{padding:16px 20px;border-radius:16px;font-size:13px;text-align:center;font-weight:500;line-height:1.5}
.fl-err{background:#fef2f2;border:1px solid #fee2e2;color:#dc2626}
.fl-err span{display:block;font-size:11px;color:#f87171;margin-top:6px;font-weight:400}
.fl-suc{background:#f0fdf4;border:1px solid #dcfce7;color:#16a34a}
.fl-suc span{display:block;font-size:11px;color:#4ade80;margin-top:6px;font-weight:400}
.fl-ld{text-align:center;padding:40px 20px;color:#bbb;font-size:13px;font-weight:500}
.fl-ld::after{content:'';display:block;width:24px;height:24px;border:2.5px solid #eee;border-top-color:${C.cl};border-radius:50%;margin:12px auto 0;animation:fl-sp .6s linear infinite}
@keyframes fl-sp{to{transform:rotate(360deg)}}

/* Toast */
#fl-toast{
  position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:999999;
  padding:16px 28px;border-radius:16px;
  background:#111;color:white;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:600;
  box-shadow:0 16px 48px rgba(0,0,0,.25);
  display:none;text-align:center;max-width:92vw;
  -webkit-font-smoothing:antialiased;
}
#fl-toast.show{display:block;animation:fl-ti .3s cubic-bezier(.16,1,.3,1)}
@keyframes fl-ti{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

@media(max-width:440px){
  #fl-panel{width:calc(100vw - 24px);border-radius:24px}
  #fl-fab{width:50px;height:50px;font-size:20px;${C.p.includes('right')?'right:14px;':'left:14px;'}bottom:14px}
  .fl-card-pts{font-size:44px}
  .fl-hd{padding:26px 22px 22px}
  .fl-bd{padding:22px}
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
  '<div class="fl-hd-deco" style="width:200px;height:200px;top:-80px;right:-60px"></div>'+
  '<div class="fl-hd-deco" style="width:100px;height:100px;bottom:-50px;left:-30px"></div>'+
  '<div class="fl-hd-logo-bg">🎯</div>'+
  '<button class="fl-x" id="fl-close">✕</button>'+
  '<div class="fl-hd-row">'+
    '<div class="fl-hd-icon">🎯</div>'+
    '<div class="fl-hd-txt">'+
      '<h3>Programme Fidélité</h3>'+
      '<p>by Fidali</p>'+
    '</div>'+
  '</div>'+
  '<div class="fl-hd-sub">Consultez vos points et réclamez vos récompenses</div>'+
'</div>'+
'<div class="fl-bd">'+
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
var isOpen=false,ph=document.getElementById('fl-phone'),btn=document.getElementById('fl-check'),cls=document.getElementById('fl-close'),res=document.getElementById('fl-result');

function open(){isOpen=true;panel.classList.add('open');fab.classList.add('open');over.classList.add('open');fab.innerHTML='✕<span id="fl-badge"></span>';document.body.style.overflow='hidden';setTimeout(function(){if(ph)ph.focus()},200)}
function close(){isOpen=false;panel.classList.remove('open');fab.classList.remove('open');over.classList.remove('open');fab.innerHTML='🎯<span id="fl-badge"></span>';document.body.style.overflow=''}

fab.onclick=function(){isOpen?close():open()};
cls.onclick=close;
over.onclick=close;
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen)close()});

btn.onclick=function(){loadPts()};
ph.onkeydown=function(e){if(e.key==='Enter')loadPts()};

function showToast(m,d){toast.innerHTML=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},d||4500)}

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
          '<div class="fl-card-pts">'+c.points+'<span class="fl-card-max"> / '+c.max_points+'</span></div>'+
          '<div class="fl-card-sub">Points collectés</div>'+
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

console.log('[Fidali] Widget v6 ✅',C.c);
})();
