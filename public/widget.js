// ============================================
// FIDALI WIDGET v4 — Premium Design
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
if(!C.c||!C.k){console.warn('[Fidali] data-card et data-key requis');return}

var css=document.createElement('style');css.id='fl-css';
css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

:root{--fl-c:${C.cl};--fl-c2:#a78bfa;--fl-r:16px}

#fl-fab{
  position:fixed;z-index:99998;
  ${C.p.includes('right')?'right:20px;':'left:20px;'}
  ${C.p.includes('top')?'top:20px;':'bottom:20px;'}
  width:56px;height:56px;border-radius:16px;border:none;outline:none;
  background:var(--fl-c);
  box-shadow:0 2px 8px rgba(0,0,0,.08),0 8px 24px ${C.cl}30;
  cursor:pointer;font-size:22px;color:white;
  display:flex;align-items:center;justify-content:center;
  transition:all .25s cubic-bezier(.4,0,.2,1);
  -webkit-tap-highlight-color:transparent;
  font-family:'Inter',system-ui,sans-serif;
}
#fl-fab:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.1),0 12px 32px ${C.cl}40}
#fl-fab:active{transform:translateY(0) scale(.96)}
#fl-fab.open{border-radius:14px;background:#18181b}
#fl-fab.open .fl-ico{display:none}
#fl-fab.open .fl-cls{display:flex}
.fl-ico{display:flex;align-items:center;justify-content:center;pointer-events:none}
.fl-cls{display:none;align-items:center;justify-content:center;pointer-events:none;font-size:18px}

#fl-badge{
  position:absolute;top:-6px;right:-6px;
  min-width:20px;height:20px;border-radius:10px;
  background:#ef4444;color:white;
  font-size:10px;font-weight:700;line-height:1;
  display:none;align-items:center;justify-content:center;
  border:2.5px solid white;padding:0 4px;
  font-family:'Inter',sans-serif;
}

#fl-panel{
  position:fixed;z-index:99999;
  ${C.p.includes('right')?'right:20px;':'left:20px;'}
  ${C.p.includes('top')?'top:88px;':'bottom:88px;'}
  width:360px;
  background:#fff;border-radius:20px;
  border:1px solid rgba(0,0,0,.06);
  box-shadow:0 24px 64px -12px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.03);
  overflow:hidden;display:none;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
}
#fl-panel.open{display:block;animation:fl-in .3s cubic-bezier(.16,1,.3,1)}
@keyframes fl-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
#fl-panel *{box-sizing:border-box;margin:0;padding:0}

.fl-hd{
  padding:24px 24px 20px;
  background:#fafafa;
  border-bottom:1px solid rgba(0,0,0,.05);
  position:relative;
}
.fl-hd-t{font-size:15px;font-weight:700;color:#18181b;letter-spacing:-.2px}
.fl-hd-s{font-size:12px;color:#a1a1aa;margin-top:2px;font-weight:450}
.fl-x{
  position:absolute;top:18px;right:18px;
  background:transparent;border:none;
  color:#a1a1aa;width:28px;height:28px;border-radius:8px;
  cursor:pointer;font-size:16px;
  display:flex;align-items:center;justify-content:center;
  transition:all .15s;
}
.fl-x:hover{background:#f4f4f5;color:#52525b}

.fl-bd{padding:20px 24px 24px}

.fl-row{display:flex;gap:8px;margin-bottom:0}
.fl-inp{
  flex:1;padding:0 14px;height:44px;
  border:1.5px solid #e4e4e7;border-radius:12px;
  font-size:14px;outline:none;
  font-family:inherit;color:#18181b;
  transition:all .15s;background:#fff;
  font-weight:450;
}
.fl-inp:focus{border-color:var(--fl-c);box-shadow:0 0 0 3px ${C.cl}15}
.fl-inp::placeholder{color:#c4c4c9;font-weight:400}
.fl-btn{
  height:44px;padding:0 18px;
  background:var(--fl-c);color:white;
  border:none;border-radius:12px;
  font-weight:600;font-size:13px;letter-spacing:-.1px;
  cursor:pointer;font-family:inherit;
  transition:all .15s;white-space:nowrap;
}
.fl-btn:hover{opacity:.9}
.fl-btn:active{transform:scale(.97)}
.fl-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}

.fl-res{margin-top:20px}

.fl-card{
  background:var(--fl-c);border-radius:16px;
  padding:0;overflow:hidden;color:white;
  position:relative;
}
.fl-card-inner{padding:22px 22px 20px;position:relative;z-index:1}
.fl-card::before{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.06) 100%);
  pointer-events:none;
}
.fl-card::after{
  content:'';position:absolute;
  width:200px;height:200px;border-radius:50%;
  background:rgba(255,255,255,.04);
  top:-80px;right:-60px;pointer-events:none;
}

.fl-card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
.fl-card-name{font-size:14px;font-weight:700;letter-spacing:-.2px;opacity:.95}
.fl-card-visits{font-size:10px;opacity:.45;margin-top:2px;font-weight:500}
.fl-card-badge{
  font-size:10px;font-weight:600;
  background:rgba(255,255,255,.12);
  padding:4px 10px;border-radius:8px;
  letter-spacing:-.1px;opacity:.8;
}

.fl-card-pts{text-align:center;margin:0 0 18px}
.fl-card-pts-n{font-size:44px;font-weight:900;letter-spacing:-2px;line-height:1}
.fl-card-pts-m{font-size:18px;font-weight:500;opacity:.35;letter-spacing:0}
.fl-card-pts-l{font-size:11px;opacity:.4;margin-top:4px;font-weight:500;letter-spacing:.5px;text-transform:uppercase}

.fl-bar{background:rgba(255,255,255,.12);border-radius:8px;height:6px;overflow:hidden}
.fl-bar-f{height:100%;border-radius:8px;transition:width 1.2s cubic-bezier(.4,0,.2,1);background:rgba(255,255,255,.9)}
.fl-bar-f.done{background:linear-gradient(90deg,#6ee7b7,#34d399)}

.fl-card-bot{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
.fl-card-reward{font-size:12px;opacity:.75;font-weight:500}
.fl-card-pct{font-size:11px;opacity:.3;font-weight:600}

.fl-card-left{
  text-align:center;font-size:11px;opacity:.35;
  margin-top:12px;font-weight:500;
}

.fl-claim{
  margin-top:16px;width:100%;padding:0;height:44px;
  background:white;color:var(--fl-c);border:none;
  border-radius:12px;font-weight:700;font-size:13px;
  cursor:pointer;font-family:inherit;letter-spacing:-.1px;
  transition:all .15s;
}
.fl-claim:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.12)}
.fl-claim:active{transform:translateY(0)}

.fl-ft{
  padding:14px 24px;
  border-top:1px solid rgba(0,0,0,.04);
  background:#fafafa;
  text-align:center;
}
.fl-ft a{
  font-size:10px;color:#b4b4b4;text-decoration:none;
  font-weight:500;letter-spacing:.2px;
}
.fl-ft a b{color:var(--fl-c);font-weight:700}

.fl-msg{
  padding:14px 16px;border-radius:12px;
  font-size:12px;text-align:center;
  font-weight:500;line-height:1.5;
}
.fl-msg-err{background:#fef2f2;border:1px solid #fee2e2;color:#dc2626}
.fl-msg-err span{display:block;font-size:11px;color:#f87171;margin-top:4px;font-weight:400}
.fl-msg-ok{background:#f0fdf4;border:1px solid #dcfce7;color:#16a34a}
.fl-msg-ok span{display:block;font-size:11px;color:#4ade80;margin-top:4px;font-weight:400}
.fl-ld{
  text-align:center;padding:32px 20px;
  color:#b4b4b4;font-size:13px;font-weight:500;
}
.fl-ld::after{
  content:'';display:block;width:24px;height:24px;
  border:2.5px solid #f0f0f0;border-top-color:var(--fl-c);
  border-radius:50%;margin:10px auto 0;
  animation:fl-spin .65s linear infinite;
}
@keyframes fl-spin{to{transform:rotate(360deg)}}

#fl-toast{
  position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;
  padding:14px 24px;border-radius:14px;
  background:#18181b;color:white;
  font-family:'Inter',system-ui,sans-serif;
  font-size:13px;font-weight:600;letter-spacing:-.1px;
  box-shadow:0 12px 40px rgba(0,0,0,.2);
  display:none;text-align:center;max-width:90vw;
  -webkit-font-smoothing:antialiased;
}
#fl-toast.show{display:block;animation:fl-toast .35s cubic-bezier(.16,1,.3,1)}
@keyframes fl-toast{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

@media(max-width:440px){
  #fl-panel{width:calc(100vw - 24px);left:12px;right:12px;bottom:84px;border-radius:18px}
  #fl-fab{width:50px;height:50px;border-radius:14px;font-size:20px;
    ${C.p.includes('right')?'right:12px;':'left:12px;'}bottom:14px;
  }
  .fl-card-pts-n{font-size:38px}
}
`;
document.head.appendChild(css);

// FAB
var fab=document.createElement('button');
fab.id='fl-fab';
fab.innerHTML='<span class="fl-ico">🎯</span><span class="fl-cls">✕</span><span id="fl-badge"></span>';
fab.setAttribute('aria-label','Programme fidélité');
document.body.appendChild(fab);

// Panel
var panel=document.createElement('div');
panel.id='fl-panel';
panel.innerHTML=
'<div class="fl-hd">'+
  '<div class="fl-hd-t">Programme Fidélité</div>'+
  '<div class="fl-hd-s">Consultez vos points et récompenses</div>'+
  '<button class="fl-x" id="fl-close" aria-label="Fermer">✕</button>'+
'</div>'+
'<div class="fl-bd">'+
  '<div class="fl-row">'+
    '<input type="tel" class="fl-inp" id="fl-phone" placeholder="Votre numéro de téléphone">'+
    '<button class="fl-btn" id="fl-check">Consulter</button>'+
  '</div>'+
  '<div class="fl-res" id="fl-result"></div>'+
'</div>'+
'<div class="fl-ft">'+
  '<a href="https://fidali.vercel.app" target="_blank" rel="noopener">Propulsé par <b>Fidali</b></a>'+
'</div>';
document.body.appendChild(panel);

// Toast
var toast=document.createElement('div');
toast.id='fl-toast';
document.body.appendChild(toast);

// Logic
var isOpen=false;
var ph=document.getElementById('fl-phone');
var btn=document.getElementById('fl-check');
var cls=document.getElementById('fl-close');
var res=document.getElementById('fl-result');

function toggle(){
  isOpen=!isOpen;
  panel.classList.toggle('open',isOpen);
  fab.classList.toggle('open',isOpen);
  if(isOpen&&ph)setTimeout(function(){ph.focus()},150);
}

fab.onclick=toggle;
cls.onclick=toggle;

document.addEventListener('click',function(e){
  if(isOpen&&!panel.contains(e.target)&&!fab.contains(e.target)){
    isOpen=false;panel.classList.remove('open');fab.classList.remove('open');
  }
});

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
      '<div class="fl-card-inner">'+
        '<div class="fl-card-top">'+
          '<div>'+
            '<div class="fl-card-name">'+(d.name||'Client')+'</div>'+
            '<div class="fl-card-visits">'+(c.total_visits||0)+' visite'+(((c.total_visits||0)>1)?'s':'')+'</div>'+
          '</div>'+
          '<div class="fl-card-badge">'+(c.business_name||'')+'</div>'+
        '</div>'+
        '<div class="fl-card-pts">'+
          '<div class="fl-card-pts-n">'+c.points+'<span class="fl-card-pts-m"> /'+c.max_points+'</span></div>'+
          '<div class="fl-card-pts-l">Points</div>'+
        '</div>'+
        '<div class="fl-bar"><div class="fl-bar-f'+(ok?' done':'')+'" style="width:'+pct+'%"></div></div>'+
        '<div class="fl-card-bot">'+
          '<div class="fl-card-reward">🎁 '+c.reward+'</div>'+
          '<div class="fl-card-pct">'+Math.round(pct)+'%</div>'+
        '</div>'+
        (ok?
          '<button class="fl-claim" onclick="window._flR(\''+p+'\')">Réclamer ma récompense →</button>':
          '<div class="fl-card-left">Plus que '+left+' achat'+(left>1?'s':'')+' avant la récompense</div>'
        )+
      '</div>'+
    '</div>';
  })
  .catch(function(){
    btn.disabled=false;
    res.innerHTML='<div class="fl-msg fl-msg-err">Impossible de se connecter au serveur</div>';
  });
}

// Redeem
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
      res.innerHTML='<div class="fl-msg fl-msg-ok">🎉 '+d.reward+'<span>Points remis à zéro — continuez à cumuler !</span></div>';
      setTimeout(loadPts,3000);
    }else{
      res.innerHTML='<div class="fl-msg fl-msg-err">'+(d.error||'Erreur')+'</div>';
    }
  })
  .catch(function(){res.innerHTML='<div class="fl-msg fl-msg-err">Erreur de connexion</div>'});
};

// Global addPoints
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
        :'⭐ +'+(pts||1)+' point fidélité · '+d.points+'/'+d.max_points;
      if(d.reward_reached)m='🎉 Récompense débloquée : '+d.reward;
      showToast(m,5000);
      var b=document.getElementById('fl-badge');
      if(b){b.style.display='flex';b.textContent=d.points;setTimeout(function(){b.style.display='none'},8000)}
    }
    return d;
  })
  .catch(function(e){console.error('[Fidali]',e);return{success:false}});
};

// Auto-detect
if(C.a){
  function fp(f){
    var i=f.querySelectorAll('input');
    for(var x=0;x<i.length;x++){
      var t=(i[x].type||'').toLowerCase();
      var n=(i[x].name||'').toLowerCase();
      var p=(i[x].placeholder||'').toLowerCase();
      var d=(i[x].id||'').toLowerCase();
      if(t==='tel')return i[x];
      if(n.match(/phone|tel|mobile|numero/))return i[x];
      if(d.match(/phone|tel|mobile|numero/))return i[x];
      if(p.match(/phone|tel|mobile|05|numéro|numero/))return i[x];
    }
    return null;
  }
  function fn(f){
    var i=f.querySelectorAll('input');
    for(var x=0;x<i.length;x++){
      var n=(i[x].name||'').toLowerCase();
      var p=(i[x].placeholder||'').toLowerCase();
      var d=(i[x].id||'').toLowerCase();
      if(n.match(/^name$|fullname|full_name|nom|prenom|customer/))return i[x];
      if(d.match(/^name$|fullname|full_name|nom|prenom|customer/))return i[x];
      if(p.match(/nom|name|prénom/))return i[x];
    }
    return null;
  }
  document.addEventListener('submit',function(e){
    var f=e.target;if(!f||f.tagName!=='FORM')return;
    var pf=fp(f);if(!pf)return;
    var p=pf.value.trim();if(!p||p.length<8)return;
    var nf=fn(f);var n=nf?nf.value.trim():'Client';
    setTimeout(function(){window.fidaliAddPoints(p,n,1)},500);
  },true);
}

console.log('[Fidali] Widget v4 ✅',C.c);
})();
