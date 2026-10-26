/* Touchline 4.1: deterministic, decorative motion. No simulation state or RNG access. */
(function (global) {
  'use strict';
  if (global.TouchlineMotion) return;
  var STORAGE = 'touchline-motion-v41', selected = 'full', serial = 0;
  var media = global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var entered = typeof WeakSet === 'function' ? new WeakSet() : null;
  var decorated = typeof WeakSet === 'function' ? new WeakSet() : null;
  var currentEffect = null, currentTimer = 0;
  var kinds = ['goal','save','assist','tackle','miss','concede','yellow','red','achievement','contract','growth','child','generation'];
  try { var saved = global.localStorage.getItem(STORAGE); if (/^(full|light|off)$/.test(saved || '')) selected = saved; } catch (_) {}
  function escape(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function shortName(value) { return Array.from(String(value || '')).slice(0, 7).join(''); }
  function effectiveMode() { return media && media.matches && selected === 'full' ? 'light' : selected; }
  function syncSVG() {
    if (!document.querySelectorAll) return;
    var svgs = document.querySelectorAll('.v41-pitch > svg, .v41-fx-emblem svg');
    Array.prototype.forEach.call(svgs, function (svg) {
      try {
        if (effectiveMode() !== 'full') { if (svg.pauseAnimations) svg.pauseAnimations(); if (svg.setCurrentTime) svg.setCurrentTime(0); }
        else if (svg.unpauseAnimations) svg.unpauseAnimations();
      } catch (_) {}
    });
  }
  function syncMode() {
    if (document.documentElement) document.documentElement.setAttribute('data-v41-motion', effectiveMode());
    if (effectiveMode() === 'off' && currentEffect) { currentEffect.remove(); currentEffect = null; global.clearTimeout(currentTimer); }
    syncSVG();
    return effectiveMode();
  }
  function mode(value) {
    if (/^(full|light|off)$/.test(value || '')) {
      selected = value;
      try { global.localStorage.setItem(STORAGE, value); } catch (_) {}
    }
    return syncMode();
  }
  if (media) {
    if (media.addEventListener) media.addEventListener('change', syncMode);
    else if (media.addListener) media.addListener(syncMode);
  }
  syncMode();

  function category(raw) {
    var text = String(raw || '').toLowerCase();
    if (/yellow|red|foul|card|discipline|犯规|吃牌|黄牌|红牌/.test(text)) return 'foul';
    if (/save|keeper|goalkeep|扑救|门将|守门/.test(text)) return 'save';
    if (/assist|pass|creativ|playmak|teammate|传球|助攻|组织|同队|队友|中场调度/.test(text)) return 'pass';
    if (/tackle|defen|recover|intercept|press|防守|回防|拦截|抢断|逼抢/.test(text)) return 'defend';
    if (/mentor|train|learn|social|growth|学习|指导|加练|训练/.test(text)) return 'training';
    if (/sprint|speed|wing|dribbl|pace|counter|run|冲刺|突破|边路|过人|回追/.test(text)) return 'run';
    return 'shot';
  }
  function movingActor(x, y, label, side, route, duration, delay) {
    var motion = route && effectiveMode() === 'full' ? '<animateMotion class="v41-smil" path="'+route+'" dur="'+(duration||'4s')+'" begin="'+(delay||'0s')+'" repeatCount="indefinite" />' : '';
    return '<g transform="translate('+x+' '+y+')"><g class="v41-actor v41-'+side+'"><circle r="8.5"/><circle class="v41-actor-core" r="3"/><text y="20" text-anchor="middle">'+escape(shortName(label))+'</text>'+motion+'</g></g>';
  }
  function movingBall(x, y, path, duration) {
    return '<g transform="translate('+x+' '+y+')"><g class="v41-ball"><circle r="4.1"/><path d="m-1.7-1.8 2.3-.6 1.5 2-1.6 2-2.2-.9z"/>'+(path && effectiveMode() === 'full'?'<animateMotion class="v41-smil" path="'+path+'" dur="'+(duration||'4s')+'" repeatCount="indefinite" />':'')+'</g></g>';
  }
  function pitch(options) {
    var o = options || {}, kind = category(o.category), id = 'v41-pitch-' + (++serial);
    var own = String(o.ownName || '你'), star = String(o.playerName || '对手');
    var together = kind === 'training' || /teammate|同队|队友/.test(String(o.category || '').toLowerCase()) || /team|ally|friend|mentor|teammate|同队|队友|指导/.test(String(o.relation || '').toLowerCase());
    var ownLabel = shortName(own), starLabel = shortName(star), route = '', actors = '', ball = '', extra = '';
    var title = {shot:'禁区终结',save:'门前扑救',pass:'传递与跑位',defend:'防线协作',run:'高速突破',foul:'对抗与判罚',training:'训练交流'}[kind];
    var description = own+'与'+star+' · '+title+' · 模拟战术演示';
    if (kind === 'shot') {
      route = 'M160 85 Q215 52 316 64';
      actors = movingActor(134,88,ownLabel,'own','M0 0 Q18 -11 32 -7 L32 -7 L0 0','4s') + movingActor(205,74,starLabel,together?'ally':'rival','M0 0 L-18 8 L-18 8 L0 0','4s') + movingActor(311,70,'门将','keeper','M0 0 L0 -19 L0 -19 L0 0','4s');
      ball = movingBall(160,85,'M0 0 L0 0 Q55 -33 156 -21 L156 -21 L0 0','4s');
      extra = '<path class="v41-target" d="M313 53h13v19h-13z"/><circle class="v41-net-flash" cx="320" cy="63" r="11"/>';
    } else if (kind === 'save') {
      route = 'M145 62 Q232 37 312 87';
      actors = movingActor(306,67,ownLabel,'own','M0 0 Q-1 20 2 24 L2 24 L0 0','4s') + movingActor(142,63,starLabel,'rival','M0 0 L18 4 L18 4 L0 0','4s');
      ball = movingBall(151,64,'M0 0 L0 0 Q80 -27 158 25 L158 25 L0 0','4s');
      extra = '<g class="v41-glove-reach" transform="translate(310 88)"><path d="m-7 0 3-8 3 3 5-7 3 2-2 9-6 5z"/><circle class="v41-save-ring" r="15"/></g>';
    } else if (kind === 'pass') {
      route = 'M92 96 Q152 39 218 53 Q258 60 283 95';
      actors = movingActor(85,96,ownLabel,'own','M0 0 L28 -12 L28 -12 L0 0','4s') + movingActor(207,54,starLabel,together?'ally':'rival','M0 0 L64 39 L64 39 L0 0','4s') + movingActor(172,99,'接应','ally','M0 0 L16 -25 L16 -25 L0 0','4s');
      ball = movingBall(92,96,'M0 0 Q60 -57 126 -43 Q166 -36 191 -1 L191 -1 L0 0','4s');
      extra = '<circle class="v41-space-ring" cx="276" cy="94" r="15"/>';
    } else if (kind === 'defend') {
      route = 'M218 45 Q173 73 132 103';
      actors = movingActor(121,99,ownLabel,'own','M0 0 Q22 -27 54 -25 L54 -25 L0 0','4s') + movingActor(219,45,starLabel,'rival','M0 0 Q-10 26 -39 35 L-39 35 L0 0','4s') + movingActor(93,52,'协防','ally','M0 0 L48 15 L48 15 L0 0','4s');
      ball = movingBall(210,51,'M0 0 Q-10 26 -35 28 L-35 28 L0 0','4s');
      extra = '<path class="v41-defence-line" d="M112 37 147 114"/><circle class="v41-space-ring" cx="178" cy="79" r="14"/>';
    } else if (kind === 'run') {
      route = 'M71 94 Q130 19 191 48 T290 83';
      actors = movingActor(72,95,ownLabel,'own','M0 0 Q59 -76 120 -47 T218 -12 L218 -12 L0 0','4.4s') + movingActor(111,57,starLabel,'rival','M0 0 Q56 -9 112 21 L112 21 L0 0','4.4s');
      ball = movingBall(83,93,'M0 0 Q59 -76 120 -47 T218 -12 L218 -12 L0 0','4.4s');
      extra = '<path class="v41-speed-line" d="M55 91h-24m33-10H38m35-9H47"/>';
    } else if (kind === 'foul') {
      route = 'M96 83 184 73';
      actors = movingActor(106,84,ownLabel,'own','M0 0 L65 -7 L65 -7 L0 0','4s') + movingActor(211,70,starLabel,'rival','M0 0 L-29 9 L-29 9 L0 0','4s') + movingActor(260,45,'裁判','referee');
      ball = movingBall(174,80,'M0 0 L13 10 L13 10 L0 0','4s');
      extra = '<g class="v41-referee-card"><rect x="265" y="26" width="9" height="13" rx="1"/><path d="M185 62v-5m-12 8-5-3m30 5 5-2"/></g>';
    } else {
      route = 'M112 78 210 68 112 78';
      actors = movingActor(111,81,ownLabel,'own','M0 0 L9 -8 L9 -8 L0 0','4s') + movingActor(219,69,starLabel,'ally','M0 0 L-9 7 L-9 7 L0 0','4s');
      ball = movingBall(125,78,'M0 0 L75 -10 L0 0','3s');
      extra = '<g class="v41-cones"><path d="m158 40-5 9h10zM170 103l-5 9h10zM260 85l-5 9h10z"/></g>';
    }
    return '<figure class="v41-pitch v41-pitch-'+kind+'" aria-label="'+escape(description)+'"><figcaption><span class="v41-live-dot"></span><strong>'+escape(title)+'</strong><span>'+escape(together?'同队配合':'球星互动')+' · 战术演示</span></figcaption><svg viewBox="0 0 360 142" aria-hidden="true" focusable="false"><defs><pattern id="'+id+'-grass" width="48" height="142" patternUnits="userSpaceOnUse"><rect width="24" height="142" fill="#123e43"/><rect x="24" width="24" height="142" fill="#123a40"/></pattern><marker id="'+id+'-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="#d6fc50"/></marker></defs><rect x="8" y="8" width="344" height="126" rx="8" fill="url(#'+id+'-grass)"/><g class="v41-field-lines"><rect x="21" y="18" width="313" height="106"/><path d="M177 18v106M21 43h40v56H21M334 43h-40v56h40M21 57h15v28H21M334 57h-15v28h15"/><circle cx="177" cy="71" r="25"/><circle cx="177" cy="71" r="1.7"/><path d="M335 57h10v28h-10"/></g><path class="v41-route" d="'+route+'" marker-end="url(#'+id+'-arrow)"/>'+extra+actors+ball+'</svg><div class="v41-pitch-legend"><span><i></i>'+escape(own)+'</span><span><i></i>'+escape(star)+'</span></div></figure>';
  }

  var icons = {
    goal:'<path class="v41-fx-net" d="M17 29h66v46H17zm9 0v46m12-46v46m12-46v46m12-46v46m12-46v46M17 41h66M17 53h66M17 65h66"/><g class="v41-fx-goal-ball"><circle cx="54" cy="55" r="12"/><path d="m49 50 8-2 5 7-5 7-9-3z"/></g><path class="v41-fx-rays" d="m33 14-3-7m21 5V3m19 12 5-7"/>',
    save:'<path class="v41-fx-glove v41-fx-glove-left" d="m17 68-3-23 6-4 4 10 1-22 7-1 3 22 2-26 7 1 1 27 7-18 6 3-5 26-14 17-15-1z"/><path class="v41-fx-glove v41-fx-glove-right" d="m83 68 3-23-6-4-4 10-1-22-7-1-3 22-2-26-7 1-1 27-7-18-6 3 5 26 14 17 15-1z"/><circle class="v41-fx-caught-ball" cx="50" cy="40" r="10"/>',
    assist:'<path class="v41-fx-pass-route" d="M17 72Q35 13 55 35T84 24"/><circle cx="17" cy="72" r="9"/><circle cx="55" cy="35" r="8"/><circle cx="84" cy="24" r="9"/><circle class="v41-fx-pass-ball" cx="17" cy="72" r="4"><animateMotion class="v41-smil" path="M0 0Q18 -59 38 -37T67 -48" dur=".8s" fill="freeze"/></circle><path d="m76 9 15 9-13 10"/>',
    tackle:'<path class="v41-fx-shield" d="M50 10 82 22v25c0 22-32 39-32 39S18 69 18 47V22z"/><path class="v41-fx-check" d="m32 48 12 13 25-28"/><path class="v41-fx-impact" d="M7 46h-6m91 0h7M14 18l-5-5m77 5 5-5"/>',
    miss:'<path class="v41-fx-net" d="M16 30h57v46H16M16 41h57M16 53h57M16 65h57M30 30v46m14-46v46m14-46v46m14-46v46"/><path class="v41-fx-miss-trail" d="M28 83Q51 38 88 15"/><g class="v41-fx-miss-ball"><circle cx="87" cy="17" r="9"/><path d="m84 14 6-1 2 5-5 3-4-3z"/></g>',
    concede:'<path class="v41-fx-net" d="M17 29h66v46H17zm9 0v46m12-46v46m12-46v46m12-46v46m12-46v46M17 41h66M17 53h66M17 65h66"/><circle class="v41-fx-concede-ball" cx="64" cy="60" r="10"/><path class="v41-fx-alert" d="M49 10v18m0 8v2"/>',
    yellow:'<g class="v41-fx-card-lift"><rect x="29" y="12" width="44" height="66" rx="5"/><path d="M36 27h30M36 35h21"/></g>',
    red:'<g class="v41-fx-card-lift"><rect x="29" y="12" width="44" height="66" rx="5"/><path d="m40 34 22 23m0-23L40 57"/></g>',
    achievement:'<g class="v41-fx-trophy"><path d="M32 15h36v20c0 15-18 25-18 25S32 50 32 35zm0 7H18v13c0 13 17 14 17 14m33-27h14v13c0 13-17 14-17 14M50 60v16m-15 6h30M34 76h32v8H34"/><path d="m50 24 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></g><path class="v41-fx-sparkles" d="M13 9v10m-5-5h10m68 37v12m-6-6h12M20 64v8m-4-4h8"/>',
    contract:'<path class="v41-fx-paper" d="M24 10h39l15 16v60H24zM63 10v18h15M34 38h31M34 47h24M34 56h20"/><path class="v41-fx-signature" d="M33 74q7-15 10-3t10-2q2 9 13 0"/><path class="v41-fx-pen" d="m61 60 20-25 6 5-20 25-9 4z"/>',
    growth:'<path class="v41-fx-growth-bar v41-fx-growth-a" d="M20 76V57h13v19z"/><path class="v41-fx-growth-bar v41-fx-growth-b" d="M44 76V40h13v36z"/><path class="v41-fx-growth-bar v41-fx-growth-c" d="M68 76V23h13v53z"/><path class="v41-fx-growth-arrow" d="M16 42 45 19 59 27 81 10m-15 0h15v15"/>',
    child:'<g class="v41-fx-family-parent"><circle cx="31" cy="25" r="10"/><path d="m16 78 3-34h24l5 34M26 78v10m12-10v10M19 48l-8 15m32-13 13 13"/></g><g class="v41-fx-family-child"><circle cx="69" cy="43" r="8"/><path d="m58 81 3-24h17l4 24M66 81v7m9-7v7M61 60l-9 8"/></g><path class="v41-fx-heart" d="M55 23c-11-14-23 4 0 15 23-11 11-29 0-15z"/>',
    generation:'<g class="v41-fx-old-shirt"><path d="m11 31 14-12 9 7 9-7 14 12-8 13-7-5v39H25V39l-7 5z"/><text x="33" y="59" text-anchor="middle">10</text></g><g class="v41-fx-new-shirt"><path d="m49 31 14-12 9 7 9-7 14 12-8 13-7-5v39H63V39l-7 5z"/><text x="71" y="59" text-anchor="middle">10</text></g><path class="v41-fx-generation-arrow" d="M40 87h27m-7-6 8 6-8 6"/>'
  };
  var labels = {goal:'精彩进球',save:'关键扑救',assist:'默契助攻',tackle:'成功拦截',miss:'错失机会',concede:'防线失守',yellow:'黄牌警告',red:'红牌罚下',achievement:'成就解锁',contract:'签约完成',growth:'能力成长',child:'陪伴成长',generation:'下一代 · 接棒'};
  function effect(type, options) {
    if (kinds.indexOf(type) < 0 || syncMode() === 'off' || !document.body) return false;
    var o = options || {}, layer = document.createElement('div');
    layer.className = 'v41-fx-layer v41-fx-'+type;
    layer.setAttribute('aria-hidden', 'true');
    var festive = /^(goal|achievement|contract|generation)$/.test(type), pieces = '';
    if (festive && effectiveMode() === 'full') {
      for (var i = 0; i < 18; i++) pieces += '<i class="v41-confetti" style="--v41-x:'+((i*47)%101)+'%;--v41-y:'+((i*19)%35)+'%;--v41-r:'+(i*37)+'deg;--v41-d:'+(i%6)*26+'ms;--v41-c:'+(['#57e4f4','#d6fc50','#e9bf70'][i%3])+'"></i>';
    }
    var art = effectiveMode() === 'full' ? icons[type] : icons[type].replace(/<animateMotion\b[^>]*\/>/g, '');
    layer.innerHTML = '<div class="v41-fx-wash"></div>'+pieces+'<div class="v41-fx-panel"><div class="v41-fx-emblem"><svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">'+art+'</svg></div><div class="v41-fx-copy"><small>TOUCHLINE MOMENT</small><strong>'+escape(o.title || labels[type])+'</strong>'+(o.subtitle?'<span>'+escape(o.subtitle)+'</span>':'')+'</div></div>';
    if (currentEffect) currentEffect.remove();
    global.clearTimeout(currentTimer);
    document.body.appendChild(layer); currentEffect = layer;
    currentTimer = global.setTimeout(function () { layer.remove(); if (currentEffect === layer) currentEffect = null; }, 1120);
    return true;
  }
  function enter() {
    if (syncMode() === 'off') return;
    var app = document.getElementById('app');
    var targets = app ? app.querySelectorAll('.page > .heading, .page > .grid, .page > .v4-hero, .modal, .modal-content, .v4-dialog, .v4-star-card, .v41-star-card') : [];
    if (!targets.length && app) targets = app.querySelectorAll('.page');
    Array.prototype.forEach.call(targets, function (node, index) {
      if ((entered && entered.has(node)) || node.hasAttribute('data-v41-entered')) return;
      if (entered) entered.add(node);
      node.setAttribute('data-v41-entered','');
      node.style.setProperty('--v41-enter-delay', Math.min(index, 5)*28+'ms');
      node.classList.add('v41-enter');
      global.setTimeout(function () { node.classList.remove('v41-enter'); node.style.removeProperty('--v41-enter-delay'); }, 540);
    });
  }
  function decorateButtons(root) {
    root = root || document;
    if (!root.addEventListener || (decorated && decorated.has(root))) return;
    if (decorated) decorated.add(root);
    root.addEventListener('pointerdown', function (event) {
      if (effectiveMode() === 'off' || event.isPrimary === false || (event.pointerType === 'mouse' && event.button !== 0)) return;
      var button = event.target && event.target.closest ? event.target.closest('button, [role="button"], summary') : null;
      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true' || (root !== document && !root.contains(button))) return;
      button.classList.remove('v41-pressed');
      button.classList.add('v41-pressed');
      global.setTimeout(function () { button.classList.remove('v41-pressed'); }, 190);
      if (effectiveMode() !== 'full' || !document.body) return;
      var bounds = button.getBoundingClientRect(), ripple = document.createElement('span');
      var x = Math.max(0, Math.min(global.innerWidth, event.clientX || bounds.left+bounds.width/2));
      var y = Math.max(0, Math.min(global.innerHeight, event.clientY || bounds.top+bounds.height/2));
      ripple.className = 'v41-touch-ring';
      ripple.style.left = x+'px'; ripple.style.top = y+'px';
      ripple.setAttribute('aria-hidden','true'); document.body.appendChild(ripple);
      global.setTimeout(function () { ripple.remove(); }, 420);
    }, {passive:true});
    root.addEventListener('keydown', function (event) {
      if ((event.key !== 'Enter' && event.key !== ' ') || effectiveMode() === 'off') return;
      var button = event.target && event.target.closest ? event.target.closest('button, [role="button"], summary') : null;
      if (!button || button.disabled) return;
      button.classList.add('v41-pressed');
      global.setTimeout(function () { button.classList.remove('v41-pressed'); }, 190);
    }, {passive:true});
  }
  global.TouchlineMotion = Object.freeze({pitch:pitch,effect:effect,enter:enter,mode:mode,getMode:effectiveMode,decorateButtons:decorateButtons});
})(window);
