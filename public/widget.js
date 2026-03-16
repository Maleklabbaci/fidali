// ============================================
// FIDALI WIDGET v3 — Design Premium
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
  cl:T.getAttribute('data-color')||'#9333ea',
  a:T.getAttribute('data-auto')!=='false'
};
if(!C.c||!C.k){console.warn('[Fidali] data-card et data-key requis');return}

var cl2='#db2777';
var css=document.createElement('style');css.id='fidali-css';
css.textContent=`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

#fl-fab{
  position:fixed;z-index:99998;
  ${C.p.includes('right')?'right:24px;':'left:24px;'}
  ${C.p.includes('top')?'top:24px;':'bottom:24px;'}
  width:64px;height:64px;border-radius:20px;border:none;outline:none;
  background:linear-gradient(135deg,${C.cl} 0%,${cl2} 100%);
  box-shadow:0 8px 32px rgba(147,51,234,0.35),0 2px 8px rgba(0,0,0,0.1);
  cursor:pointer;font-size:26px;
  display:flex;align-items:center;justify-content:center;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  -webkit-tap-highlight-color:transparent;
}
#fl-fab:hover{transform:scale(1.08) rotate(-3deg);box-shadow:0 12px 40px rgba(147,51,234,0.45)}
#fl-fab:active{transform:scale(0.95)}
#fl-fab.open{border-radius:50%;transform:rotate(90deg)}

#fl-badge{
  position:absolute;top:-4px;right:-4px;
  min-width:22px;height:22px;border-radius:11px;
  background:#ef4444;color:white;
  font-size:11px;font-weight:800;
  display:none;align-items:center;justify-content:center;
  border:3px solid white;padding:0 5px;
  font-family:'Inter',sans-serif;
}

#fl-panel{
  position:fixed;z-index:99999;
  ${C.p.includes('right')?'right:24px;':'left:24px;'}
  ${C.p.includes('top')?'top:100px;':'bottom:100px;'}
  width:380px;max-height:560px;
  background:#ffffff;border-radius:24px;
  box-shadow:0 24px 80px rgba(0,0,0,0.12),0 4px 16px rgba(0,0,0,0.06);
  overflow:hidden;display:none;
  font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
}
#fl-panel.open{display:block;animation:fl-in .35s cubic-bezier(.16,1,.3,1)}
@keyframes fl-in{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
#fl-panel *{box-sizing:border-box;margin:0;padding:0}

.fl-hd{
  background:linear-gradient(135deg,${C.cl} 0%,${cl2} 100%);
  padding:28px 24px 24px;color:white;position:relative;overflow:hidden;
}
.fl-hd::before{
  content:'';position:absolute;top:-40px;right:-40px;
  width:120px;height:120px;border-radius:50%;
  background:rgba(255,255,255,0.08);
}
.fl-hd::after{
  content:'';position:absolute;bottom:-30px;left:-30px;
  width:80px;height:80px;border-radius:50%;
  background:rgba(255,255,255,0.05);
}
.fl-hd h3{font-size:18px;font-weight:800;position:relative;z-index:1;letter-spacing:-0.3px}
.fl-hd p{font-size:12px;opacity:.7;margin-top:4px;position:relative;z-index:1}
.fl-x{
  position:absolute;top:16px;right:16px;z-index:2;
  background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);
  border:none;color:white;width:32px;height:32px;border-radius:12px;
  cursor:pointer;font-size:16px;
  display:flex;align-items:center;justify-content:center;
  transition:background .2s;
}
.fl-x:hover{background:rgba(255,255,255,0.25)}

.fl-bd{padding:24px}
.fl-row{display:flex;gap:10px;margin-bottom:20px}
.fl-inp{
  flex:1;padding:14px 16px;
  border:2px solid #f0f0f0;border-radius:14px;
  font-size:15px;outline:none;
  font-family:inherit;color:#1a1a1a;
  transition:border .2s,box-shadow .2s;
  background:#fafafa;
}
.fl-inp:focus{border-color:${C.cl};box-shadow:0 0 0 3px ${C.cl}22;background:white}
.fl-inp::placeholder{color:#b0b0b0}
.fl-btn{
  padding:14px 20px;
  background:linear-gradient(135deg,${C.cl},${cl2});color:white;
  border:none;border-radius:14px;
  font-weight:700;font-size:15px;
  cursor:pointer;font-family:inherit;
  transition:all .2s;
  white-space:nowrap;
}
.fl-btn:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 4px 16px ${C.cl}40}
.fl-btn:active{transform:translateY(0)}
.fl-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}

.fl-crd{
  background:linear-gradient(135deg,${C.cl} 0%,${cl2} 100%);
  border-radius:20px;padding:24px;color:white;
  position:relative;overflow:hidden;
}
.fl-crd-d{position:absolute;border-radius:50%;background:rgba(255,255,255,0.07)}
.fl-bar{background:rgba(255,255,255,0.15);border-radius:12px;height:10px;margin:14px 0;overflow:hidden}
.fl-bar-f{background:white;border-radius:12px;height:100%;transition:width 1s cubic-bezier(.4,0,.2,1)}
.fl-bar-f.done{background:linear-gradient(90deg,#34d399,#10b981)}
.fl-claim{
  margin-top:16px;width:100%;padding:14px;
  background:white;color:${C.cl};border:none;
  border-radius:14px;font-weight:800;font-size:15px;
  cursor:pointer;font-family:inherit;
  transition:all .2s;
  box-shadow:0 4px 12px rgba(0,0,0,0.1);
}
.fl-claim:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.15)}
.fl-claim:active{transform:translateY(0)}

.fl-ft{
  text-align:center;padding:14px;
  border-top:1px solid #f5f5f5;
  background:#fafafa;
}
.fl-ft a{font-size:11px;color:#aaa;text-decoration:none;font-weight:500}
.fl-ft a b{color:${C.cl};font-weight:700}

.fl-err{
  padding:14px 18px;border-radius:14px;
  background:#fef2f2;border:1.5px solid #fecaca;
  color:#dc2626;font-size:13px;
  margin-bottom:16px;text-align:center;
  font-weight:500;line-height:1.5;
}
.fl-ok{
  padding:14px 18px;border-radius:14px;
  background:#f0fdf4;border:1.5px solid #bbf7d0;
  color:#16a34a;font-size:13px;
  margin-bottom:16px;text-align:center;
  font-weight:600;
}
.fl-ld{text-align:center;padding:28px;color:#aaa;font-size:14px}
.fl-ld::after{
  content:'';display:block;width:28px;height:28px;
  border:3px solid #eee;border-top-color:${C.cl};
  border-radius:50%;margin:12px auto 0;
  animation:fl-spin .7s linear infinite;
}
@keyframes fl-spin{to{transform:rotate(360deg)}}

#fl-toast{
  position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:999999;
  padding:18px 28px;border-radius:18px;
  background:linear-gradient(135deg,${C.cl},${cl2});
  color:white;font-family:'Inter',sans-serif;
  font-size:15px;font-weight:600;
  box-shadow:0 12px 40px rgba(147,51,234,0.4);
  display:none;text-align:center;max-width:90vw;
  letter-spacing:-0.2px;
}
#fl-toast.show{display:block;animation:fl-toast .4s cubic-bezier(.16,1,.3,1)}
@keyframes fl-toast{from{opacity:0;transform:translateX(-50%) translateY(-24px) scale(.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}

@media(max-width:440px){
  #fl-panel{width:calc(100vw - 32px);left:16px;right:16px;bottom:88px}
  #fl-fab{width:56px;height:56px;border-radius:18px;font-size:22px;
    ${C.p.includes('right')?'right:16px;':'left:16px;'}
    bottom:16px;
  }
}
`;
document.head.appendChild(css);

// FAB
var fab=document.createElement('button');
fab.id='fl-fab';
fab.innerHTML='🎯<span id="fl-badge"></span>';
fab.setAttribute('aria-label','Programme fidélité');
document.body.appendChild(fab);

// Panel
var panel=document.createElement('div');
panel.id='fl-panel';
panel.innerHTML=
'<div class="fl-hd">'+
  '<h3>🎯 Programme Fidélité</h3>'+
  '<p>Consultez et cumulez vos points</p>'+
  '<button class="fl-x" id="fl-close" aria-label="Fermer">✕</button>'+
'</div>'+
'<div class="fl-bd">'+
  '<div class="fl-row">'+
    '<input type="tel" class="fl-inp" id="fl-phone" placeholder="Votre numéro (05xx...)">'+
    '<button class="fl-btn" id="fl-check">Voir</button>'+
  '</div>'+
  '<div id="fl-result"></div>'+
'</div>'+
'<div class="fl-ft">'+
  '<a href="https://fidali.vercel.app" target="_blank" rel="noopener">Propulsé par <b>Fidali</b> 💜</a>'+
'</div>';
document.body.appendChild(panel);

// Toast
var toast=document.createElement('div');
toast.id='fl-toast';
document.body.appendChild(toast);

// Logic
var open=false;
var ph=document.getElementById('fl-phone');
var btn=document.getElementById('fl-check');
var cls=document.getElementById('fl-close');
var res=document.getElementById('fl-result');

function toggle(){
  open=!open;
  panel.classList.toggle('open',open);
  fab.classList.toggle('open',open);
  if(open&&ph)setTimeout(function(){ph.focus()},100);
}

fab.onclick=toggle;
cls.onclick=toggle;

document.addEventListener('click',function(e){
  if(open&&!panel.contains(e.target)&&!fab.contains(e.target)){
    open=false;panel.classList.remove('open');fab.classList.remove('open');
  }
});

btn.onclick=function(){loadPts()};
ph.onkeydown=function(e){if(e.key==='Enter')loadPts()};

function showToast(m,d){
  toast.innerHTML=m;toast.classList.add('show');
  setTimeout(function(){toast.classList.remove('show')},d||5000);
}

function loadPts(){
  var p=ph.value.trim();
  if(!p||p.length<8){res.innerHTML='<div class="fl-err">Entrez un numéro valide</div>';return}
  res.innerHTML='<div class="fl-ld">Recherche en cours</div>';
  btn.disabled=true;

  fetch(C.u+'/client/'+encodeURIComponent(p),{
    headers:{'Authorization':'Bearer '+C.k}
  })
  .then(function(r){return r.json()})
  .then(function(d){
    btn.disabled=false;
    if(d.error||!d.cards||!d.cards.length){
      res.innerHTML='<div class="fl-err">Aucune carte trouvée pour ce numéro 😕<br><span style="font-size:11px;opacity:.7;display:block;margin-top:6px">Passez une commande pour être inscrit automatiquement !</span></div>';
      return;
    }
    var c=d.cards[0];
    var pct=Math.min((c.points/c.max_points)*100,100);
    var ok=c.points>=c.max_points;
    var left=c.max_points-c.points;

    res.innerHTML=
    '<div class="fl-crd">'+
      '<div class="fl-crd-d" style="width:120px;height:120px;top:-40px;right:-40px"></div>'+
      '<div class="fl-crd-d" style="width:70px;height:70px;bottom:-25px;left:-25px"></div>'+
      '<div style="position:relative;z-index:1">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'+
          '<div>'+
            '<div style="font-size:16px;font-weight:800;letter-spacing:-0.3px">'+(d.name||'Client')+'</div>'+
            '<div style="font-size:11px;opacity:.5;margin-top:2px">'+(c.total_visits||0)+' visite(s)</div>'+
          '</div>'+
          '<div style="background:rgba(255,255,255,.15);backdrop-filter:blur(8px);padding:6px 14px;border-radius:20px;font-size:11px;font-weight:700">'+
            (c.business_name||'')+
          '</div>'+
        '</div>'+
        '<div style="text-align:center;margin:24px 0">'+
          '<div style="font-size:48px;font-weight:900;letter-spacing:-2px;line-height:1">'+
            c.points+
            '<span style="font-size:20px;opacity:.4;font-weight:600;letter-spacing:0"> / '+c.max_points+'</span>'+
          '</div>'+
          '<div style="font-size:12px;opacity:.5;margin-top:6px">points collectés</div>'+
        '</div>'+
        '<div class="fl-bar"><div class="fl-bar-f'+(ok?' done':'')+'" style="width:'+pct+'%"></div></div>'+
        '<div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">'+
          '<span style="opacity:.85">🎁 '+c.reward+'</span>'+
          '<span style="opacity:.4;font-weight:600">'+Math.round(pct)+'%</span>'+
        '</div>'+
        (ok?
          '<button class="fl-claim" onclick="window._flRedeem(\''+p+'\')">🎉 Réclamer ma récompense !</button>':
          '<p style="text-align:center;font-size:12px;opacity:.45;margin-top:14px">Plus que '+left+' achat'+(left>1?'s':'')+' avant votre récompense !</p>'
        )+
      '</div>'+
    '</div>';
  })
  .catch(function(){
    btn.disabled=false;
    res.innerHTML='<div class="fl-err">Erreur de connexion</div>';
  });
}

// Redeem
window._flRedeem=function(p){
  res.innerHTML='<div class="fl-ld">Réclamation en cours</div>';
  fetch(C.u+'/reward/redeem',{
    method:'POST',
    headers:{'Authorization':'Bearer '+C.k,'Content-Type':'application/json'},
    body:JSON.stringify({card_code:C.c,phone:p})
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      showToast('🎉 '+d.reward+' — Profitez-en !',6000);
      res.innerHTML='<div class="fl-ok">🎉 '+d.reward+'<br><span style="font-size:11px;opacity:.7;display:block;margin-top:4px">Points remis à zéro — continuez à cumuler !</span></div>';
      setTimeout(loadPts,3000);
    }else{
      res.innerHTML='<div class="fl-err">'+(d.error||'Erreur')+'</div>';
    }
  })
  .catch(function(){res.innerHTML='<div class="fl-err">Erreur de connexion</div>'});
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
        ?'🎯 Bienvenue ! Carte fidélité créée + '+(pts||1)+' point !'
        :'⭐ +'+(pts||1)+' point fidélité ! ('+d.points+'/'+d.max_points+')';
      if(d.reward_reached)m='🎉 Félicitations ! Vous avez gagné : '+d.reward+' !';
      showToast(m,6000);
      var b=document.getElementById('fl-badge');
      if(b){b.style.display='flex';b.textContent=d.points;setTimeout(function(){b.style.display='none'},10000)}
    }
    return d;
  })
  .catch(function(e){console.error('[Fidali]',e);return{success:false}});
};

// Auto-detect forms
if(C.a){
  function findPhone(f){
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
  function findName(f){
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
    var pf=findPhone(f);if(!pf)return;
    var p=pf.value.trim();if(!p||p.length<8)return;
    var nf=findName(f);
    var n=nf?nf.value.trim():'Client';
    setTimeout(function(){window.fidaliAddPoints(p,n,1)},500);
  },true);
}

console.log('[Fidali] Widget v3 ✅ Carte:',C.c);
})();
