/* Touchline 4.2 — deterministic Canvas match theatre, independent from career state. */
(function (global) {
  'use strict';
  if (global.CareerReplay) return;
  var active = null, serial = 0, DURATION = 4200;
  function clamp(n, a, b) { return Math.max(a, Math.min(b, Number(n) || 0)); }
  function mix(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function slice(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function escape(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function short(v, length) { return Array.from(String(v || '')).slice(0, length || 9).join(''); }
  function motionMode() {
    if (global.TouchlineMotion && global.TouchlineMotion.getMode) return global.TouchlineMotion.getMode();
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'light' : 'full';
  }
  function readOptions(raw) {
    var o = raw || {}, choice = o.choice && typeof o.choice === 'object' ? (o.choice.key || o.choice.label || '') : o.choice;
    var text = [o.key, choice, o.category, o.pos].join(' ').toLowerCase(), card = /^(yellow|red)$/.test(String(o.card)) ? String(o.card) : '';
    if (!card && /红牌/.test(String(o.card))) card = 'red';
    if (!card && /黄牌/.test(String(o.card))) card = 'yellow';
    var scored = o.scored === true || o.scored === 1, conceded = o.conceded === true || o.conceded === 1;
    var actionKind = /handling|reflexes|keeper|save|\bgk\b|扑救|守门|门将/.test(text) ? 'save' :
      /passing|vision|pass|assist|传球|视野|组织|直塞/.test(text) ? 'pass' :
      /tackling|positioning|defen|tackle|intercept|防守|抢断|卡位|回防/.test(text) ? 'defend' :
      /finishing|shoot|shot|射门|终结/.test(text) ? 'shot' :
      /teammate|同队|队友/.test(String(o.relation)) ? 'pass' : 'dribble';
    // A settled goal controls the outcome, while the chosen attribute still controls the buildup.
    var explicitKey = String(o.key || choice || '').toLowerCase();
    if (scored && /passing|vision/.test(explicitKey)) actionKind='pass';
    else if (scored && /pace|technique/.test(explicitKey)) actionKind='dribble';
    else if (scored && /finishing/.test(explicitKey)) actionKind='shot';
    var kind = conceded ? 'concede' : scored ? 'goal' : card ? 'card' : actionKind;
    var preview = o.mode === 'preview', training = /training|learn|mentor|训练|请教/.test(String(o.relation) + ' ' + String(o.category));
    return Object.freeze({ownName:short(o.ownName || '你',12), playerName:short(o.playerName || '对方球员',12),
      ownTeam:short(o.ownTeam || '我方',18), opponent:short(o.opponent || '对方',18),
      pos:String(o.pos || 'CM'), height:clamp(o.height || 178,140,215), weight:clamp(o.weight || 72,40,120),
      kind:kind, actionKind:actionKind, success:o.success === true || o.success === 1, scored:scored && !preview, conceded:conceded && !preview,
      card:preview ? '' : card, preview:preview, training:training,
      together:/teammate|training|learn|mentor|同队|队友|请教|训练/.test(String(o.relation)),
      baseOwn:Math.floor(clamp(o.score && o.score[0],0,99)), baseAway:Math.floor(clamp(o.score && o.score[1],0,99))});
  }
  function title(o) {
    if(o.kind==='goal'&&o.actionKind==='pass')return '传接终结';
    if(o.kind==='goal'&&o.actionKind==='dribble')return '突破终结';
    return {goal:'禁区终结',concede:'防线回追',save:'门前扑救',pass:'传切配合',defend:'正面对抗',shot:'射门处理',dribble:'持球突破',card:'身体对抗'}[o.kind];
  }
  function finalCue(o) {
    if (o.preview) return '战术预览 · 比赛结果由你的选择决定';
    if (o.scored && o.conceded) return '本段已记录进球与失球';
    if (o.scored) return '皮球入网 · 进球已记录';
    if (o.conceded) return '对方破门 · 失球已记录';
    if (o.card) return o.card === 'red' ? '裁判出示红牌' : '裁判出示黄牌';
    return {pass:o.success?'传球到位 · 接应成功':'传球线路被对手切断',defend:o.success?'成功断球 · 重新组织':'对手摆脱 · 继续协防',
      save:o.success?'化解来球 · 球门安全':'处理不稳 · 皮球偏出底线',shot:o.success?'射门形成威胁 · 被门将化解':'射门偏离目标',
      dribble:o.success?'突破成功 · 保持球权':'突破受阻 · 对手拿到球权',card:'对抗结束 · 裁判示意'}[o.kind] || '本次行动结束';
  }
  function cue(o, t) {
    if (t >= .78) return finalCue(o);
    if(o.kind==='goal'&&o.scored){
      if(o.actionKind==='pass')return t<.24?'观察队友前插 · 拉开传球角度':t<.52?'直塞送入空当 · 接应球员前插':t<.58?'队友接球调整 · 准备射门':'接应队友起脚 · 皮球飞向球门';
      if(o.actionKind==='dribble')return t<.24?'持球加速 · 逼近防线':t<.48?'连续变向 · 突破防守球员':'突破后起脚 · 皮球飞向球门';
      if(o.actionKind==='shot')return t<.24?'禁区站稳 · 观察门将位置':t<.48?'调整触球 · 准备直接起脚':'直接射门 · 皮球飞向球门';
    }
    if (t < .24) return o.preview || o.training ? '演示开始 · 观察身体姿态与站位' : '观察空间 · 寻找处理时机';
    if (t < .50) return {goal:'拉开身位 · 准备起脚',concede:'全速回追 · 封堵射门角度',save:'降低重心 · 判断来球方向',
      pass:'队友前插 · 找到传球窗口',defend:'压缩空间 · 接近持球人',shot:'调整步点 · 寻找射门角度',dribble:'加速变向 · 攻击防线空当',card:'进入对抗 · 争夺球权'}[o.kind];
    return {goal:'起脚射门 · 皮球飞向球门',concede:'对手起脚 · 最后一道防线',save:'来球接近 · 伸展扑救',
      pass:'送出传球 · 跑动接应',defend:'伸脚断球 · 争夺落点',shot:'起脚攻门 · 门将做出反应',dribble:'身体对抗 · 争夺突破线路',card:'裁判鸣哨 · 判罚确认'}[o.kind];
  }
  function point(x,y,z) { return {x:x,y:y,z:z||0}; }
  function route(from, to, t) { return point(mix(from.x,to.x,smooth(t)),mix(from.y,to.y,smooth(t)),mix(from.z||0,to.z||0,smooth(t))); }
  function actor(id,name,side,p,run,pose) { return {id:id,name:name,side:side,p:p,run:run,pose:pose||''}; }
  function sample(o,t) {
    var a = slice(t,.04,.48), b = slice(t,.48,.78), c = slice(t,.78,.94), success = o.success || o.preview;
    var own, star, keeper, helper, ball, owner = '', arc = 0, actors = [], jersey = o.together ? 'ally' : 'rival';
    if (o.kind==='goal'&&o.scored&&o.actionKind==='pass') {
      var first=slice(t,.04,.32),receive=slice(t,.16,.52),flight=slice(t,.58,.78);
      own=route(point(42,43),point(54,38),first);helper=route(point(64,19),point(78,31),receive);
      star=route(point(71,24),point(72,37),slice(t,.20,.58));keeper=route(point(96,32),point(96,40),flight);
      if(t<.32)ball=point(own.x+2,own.y);
      else if(t<.52){var pass=slice(t,.32,.52);ball=route(point(56,38),point(78,31),pass);arc=Math.sin(pass*Math.PI)*1.3;}
      else if(t<.58)ball=point(79,31);
      else if(t<.78){ball=route(point(79,31),point(100,30),flight);arc=Math.sin(flight*Math.PI)*3.5;}
      else ball=point(mix(100,102,smooth(c)),30,mix(0,1,c));
      actors.push(actor(0,o.ownName,'own',own,t<.32,t>=.32&&t<.44?'kick':''),actor(1,o.together?'盯防球员':o.playerName,'rival',star,t<.58),actor(2,'门将','keeper',keeper,t>.58&&t<.78,t>.65?'dive':''),actor(3,o.together?o.playerName:'接应队友','ally',helper,t<.52,t>=.58&&t<.70?'kick':''));
    } else if (o.kind === 'goal' || o.kind === 'shot') {
      own=route(point(48,39),point(73,34),a); star=route(point(65,28),point(69,36),a);
      if(o.kind==='goal'&&o.actionKind==='shot')own=route(point(72,34),point(73,34),a);
      if(o.kind==='goal'&&o.actionKind==='dribble'&&t<.48){own.y+=Math.sin(a*Math.PI*2)*3.3;star.y-=Math.sin(a*Math.PI)*2;}
      keeper=route(point(96,32),point(96,40),b);
      if(t<.48)ball=point(own.x+2,own.y+1); else if(t<.78){ball=route(point(75,35),point(o.scored?100:success?95:105,o.scored?30:success?38:46,0),b);arc=Math.sin(b*Math.PI)*(o.scored?4:3);}
      else ball=o.scored?point(mix(100,102,smooth(c)),30,mix(0,1,c)):success?point(95,38):point(105,46);
      actors.push(actor(0,o.ownName,'own',own,(o.kind!=='goal'||o.actionKind!=='shot')&&(t<.5||t>.8),t>.48&&t<.64?'kick':''),actor(1,o.playerName,jersey,star,t<.5),actor(2,'门将','keeper',keeper,t>.5&&t<.78,t>.57?'dive':''));
      helper=route(point(45,19),point(80,23),a);actors.push(actor(3,'接应','ally',helper,t<.65));
    } else if(o.kind==='save'||o.kind==='concede') {
      var isOwnGK = /GK|门将/.test(o.pos) || o.kind==='save';
      star=route(point(64,37),point(76,34),a); keeper=route(point(96,32),point(96,o.kind==='concede'?40:success?28:41),b);
      own=route(point(72,21),point(82,33),a);
      if(t<.48)ball=point(star.x+2,star.y);else if(t<.78){ball=route(point(78,34),point(o.conceded?100:success?96:104,o.conceded?29:success?28:44),b);arc=Math.sin(b*Math.PI)*3.5;}
      else ball=o.conceded?point(mix(100,101,smooth(c)),29,mix(0,1,c)):success?point(keeper.x,keeper.y,2):point(104,44);
      actors.push(actor(1,o.playerName,'rival',star,t<.52,t>.48&&t<.64?'kick':''),actor(0,isOwnGK?o.ownName:'门将',isOwnGK?'own':'keeper',keeper,t>.5&&t<.78,t>.56?'dive':''),actor(2,isOwnGK?'协防':o.ownName,'ally',own,t<.72));
    } else if(o.kind==='pass') {
      own=route(point(38,41),point(51,36),a); star=route(point(63,19),point(81,29),slice(t,.15,.82));
      var rival=route(point(62,38),point(success?65:67,success?40:30),b);
      if(t<.48)ball=point(own.x+2,own.y);else if(t<.78){ball=route(point(53,36),point(success?star.x:67,success?star.y:30),b);arc=Math.sin(b*Math.PI)*1.4;}
      else ball=success?point(star.x+1,star.y+1):point(67,30);
      actors.push(actor(0,o.ownName,'own',own,t<.5,t>.48&&t<.62?'kick':''),actor(1,o.together?o.playerName:'接应队友','ally',star,t<.85),actor(2,o.together?'拦截者':o.playerName,'rival',rival,t>.45&&t<.8));
      actors.push(actor(3,'边路接应','ally',route(point(55,51),point(83,50),a),t<.6));
    } else if(o.kind==='defend') {
      star=route(point(73,26),point(58,35),a);own=route(point(50,43),point(60,37),a);
      var exit = success?point(51,41):point(43,32);
      if(t<.48)ball=point(star.x-2,star.y+1);else ball=route(point(60,36),exit,b);
      if(t>.78) {if(success)own=route(own,point(50,40),c);else star=route(star,point(44,31),c);}
      actors.push(actor(0,o.ownName,'own',own,t<.5||t>.78,t>.48&&t<.67?'tackle':''),actor(1,o.playerName,'rival',star,t<.5||(!success&&t>.78)),actor(2,'保护','ally',route(point(38,25),point(48,29),a),t<.5));
    } else if(o.kind==='card') {
      own=route(point(46,41),point(63,34),a);star=route(point(72,27),point(64,33),a);ball=route(point(49,42),point(t>.5?73:64,35),slice(t,.1,.65));
      actors.push(actor(0,o.ownName,'own',own,t<.48,t>.45&&t<.65?'tackle':''),actor(1,o.playerName,'rival',star,t<.48),actor(2,'裁判','referee',route(point(78,21),point(74,26),a),t<.48,t>.61?'card':''));
    } else {
      own=route(point(41,43),point(66,35),a);star=route(point(67,29),point(68,34),a);
      var end=success?point(87,25):point(69,35);
      if(t>.48){own=route(own,success?end:point(67,38),b);star=route(star,success?point(71,39):point(73,30),b);}
      ball=t<.48?point(own.x+2,own.y+1):success?point(own.x+2,own.y+1):route(point(68,35),point(74,30),b);
      actors.push(actor(0,o.ownName,'own',own,t<.83),actor(1,o.playerName,jersey,star,t<.83,t>.5&&t<.7&&!success?'tackle':''));
      actors.push(actor(3,'队友','ally',route(point(49,15),point(81,17),a),t<.7));
    }
    ball.z=(ball.z||0)+arc;
    return {actors:actors,ball:ball,ballOwner:owner,cue:cue(o,t),score:[o.baseOwn+(o.scored&&t>=.78?1:0),o.baseAway+(o.conceded&&t>=.78?1:0)],goalVisible:!!(o.scored&&t>=.78),concedeVisible:!!(o.conceded&&t>=.78)};
  }
  function html() { return '<div class="v42-replay-slot"></div>'; }
  function mount(container, options) {
    if (typeof container === 'string') container=document.querySelector(container);
    if (!container || !container.appendChild) return null;
    if (active) active.destroy();
    var o=readOptions(options), host=document.createElement('section'), id='v42-replay-'+(++serial), camera='broadcast', progress=0, speed=1, playing=false, destroyed=false, raf=0, last=0, drawAt=0;
    var width=640,height=346,ratio=1,ctx,resizeObserver=null,removeObserver=null,modeObserver=null,wasVisible=false,renderedFrames=0,clock=0;
    host.className='v42-replay';host.setAttribute('aria-label','足球场景动画演示');
    host.innerHTML='<div class="v42-replay-heading"><div><small>TOUCHLINE MATCH THEATRE</small><strong>'+escape(title(o))+'</strong></div><span class="v42-replay-badge">'+escape(o.preview?'战术预览':o.training?'训练演示':'已发生片段 · 2D回放')+'</span></div><div class="v42-replay-stage"><canvas role="img" aria-label="'+escape(o.ownName+'与'+o.playerName+'的'+title(o)+'动画')+'"></canvas><div class="v42-replay-score"><span>'+escape(short(o.ownTeam,8))+'</span><b data-replay-score>'+o.baseOwn+' : '+o.baseAway+'</b><span>'+escape(short(o.opponent,8))+'</span></div><div class="v42-replay-cue" aria-live="off"></div><span class="v42-replay-camera-label">转播镜头</span></div><div class="v42-replay-controls"><button type="button" data-replay="play" aria-label="播放回放">播放</button><button type="button" data-replay="restart">重播</button><label>速度<select aria-label="回放速度" data-replay-speed><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label><button type="button" class="v42-replay-angle" data-replay="camera">切换俯视</button><div class="v42-replay-timeline"><label for="'+id+'-seek" class="v42-replay-sr">回放进度</label><input id="'+id+'-seek" data-replay-seek type="range" min="0" max="1000" value="0" step="1"><output data-replay-time>0.0 / 4.2 秒</output></div></div><p class="v42-replay-note">'+escape(o.preview?'预览只展示处理方式；实际结果以比赛选择结算为准。':o.training?'训练画面根据本次结果演示，不计为正式比赛进球。':'根据已结算结果演示；重播与拖动不会改变比分或重新判定。')+'</p>';
    container.appendChild(host);
    var canvas=host.querySelector('canvas'),stage=host.querySelector('.v42-replay-stage'),playButton=host.querySelector('[data-replay="play"]'),scoreNode=host.querySelector('[data-replay-score]'),cueNode=host.querySelector('.v42-replay-cue'),seekNode=host.querySelector('[data-replay-seek]'),timeNode=host.querySelector('[data-replay-time]');
    try {ctx=canvas.getContext('2d',{alpha:false});}catch(_){ctx=canvas.getContext('2d');}
    if(!ctx){host.innerHTML='<p class="v42-replay-note">当前浏览器无法显示动画，比赛结果已经保存。</p>';return {play:function(){},pause:function(){},restart:function(){},seek:function(){},destroy:function(){host.remove();},snapshot:function(){return {unavailable:true};}};}
    function project(x,y,z) {
      var u=x/100,v=y/64,s=.64+.36*v;
      return camera==='top'?{x:width*(.065+u*.87),y:height*(.13+v*.73)-((z||0)*height*.0105),scale:.82}:
        {x:width*.5+(u-.5)*width*.88*s+(v-.5)*width*.10,y:height*(.245+v*.61)-(z||0)*height*.013*(.75+.25*v),scale:.64+.36*v};
    }
    function path(points,fill,stroke,lineWidth) {
      if(!points.length)return;ctx.beginPath();points.forEach(function(p,i){var a=project(p[0],p[1],p[2]);if(i)ctx.lineTo(a.x,a.y);else ctx.moveTo(a.x,a.y);});
      if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth||1;ctx.stroke();}
    }
    function roundedRect(x,y,w,h,r,fill,stroke) {
      r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
      if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
    }
    function worldCircle(x,y,r,stroke) {var pts=[];for(var i=0;i<=40;i++){var a=i/40*Math.PI*2;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}path(pts,null,stroke,Math.max(.75,width/900));}
    function goal(back) {
      var x=back?0:100,out=back?-3.5:103.5,y1=26,y2=38,z=6.5;
      path([[x,y1,0],[out,y1,0],[out,y1,z],[x,y1,z]],'#a3d5d622','#bad6d77a',1);
      path([[x,y1,z],[out,y1,z],[out,y2,z],[x,y2,z]],'#a3d5d618','#bad6d77a',1);
      path([[out,y1,0],[out,y2,0],[out,y2,z],[out,y1,z]],'#c8e5e612','#c5dddc8a',1);
      for(var i=1;i<7;i++){var y=mix(y1,y2,i/7);path([[out,y,0],[out,y,z],[x,y,z]],null,'#b8dcde40',.6);}
      for(var j=1;j<5;j++){var zz=z*j/5;path([[out,y1,zz],[out,y2,zz]],null,'#b8dcde40',.6);}
      path([[x,y1,0],[x,y1,z],[x,y2,z],[x,y2,0]],null,'#f1fcff',Math.max(1.5,width/350));
    }
    function background(t) {
      var grad=ctx.createLinearGradient(0,0,0,height);grad.addColorStop(0,'#071323');grad.addColorStop(.43,'#1a3440');grad.addColorStop(1,'#0c2735');ctx.fillStyle=grad;ctx.fillRect(0,0,width,height);
      ctx.fillStyle='#142337';ctx.fillRect(0,height*.07,width,height*.18);
      for(var row=0;row<4;row++)for(var col=0;col<62;col++){
        ctx.fillStyle=['#395b70','#c8d7d0','#27404f','#b8b475','#648c9c'][(row*7+col*3)%5];
        var xx=col/61*width,yy=height*(.08+row*.034);ctx.fillRect(xx,yy,Math.max(1.5,width*.0035),Math.max(1.5,height*.007));
      }
      ctx.globalAlpha=.14;ctx.fillStyle='#b8f4ff';ctx.beginPath();ctx.moveTo(width*.1,0);ctx.lineTo(width*.5,height*.78);ctx.lineTo(width*.34,height*.83);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(width*.89,0);ctx.lineTo(width*.69,height*.82);ctx.lineTo(width*.42,height*.8);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      path([[-3,-4],[103,-4],[103,68],[-3,68]],'#126151');
      for(var i=0;i<10;i++)path([[i*10,0],[(i+1)*10,0],[(i+1)*10,64],[i*10,64]],i%2?'#267344':'#2d7c4a');
      var line='#d6ecce9c';
      path([[0,0],[100,0],[100,64],[0,64],[0,0]],null,line,Math.max(1,width/650));path([[50,0],[50,64]],null,line,1);
      worldCircle(50,32,9.1,line);worldCircle(50,32,.22,'#f2f5d9');
      path([[0,12],[16.5,12],[16.5,52],[0,52]],null,line,1);path([[100,12],[83.5,12],[83.5,52],[100,52]],null,line,1);
      path([[0,23],[5.5,23],[5.5,41],[0,41]],null,line,1);path([[100,23],[94.5,23],[94.5,41],[100,41]],null,line,1);
      worldCircle(11,32,.25,line);worldCircle(89,32,.25,line);
      goal(true);goal(false);
      var p1=project(4,-3),p2=project(96,-3);roundedRect(p1.x,p1.y-height*.03,p2.x-p1.x,height*.035,2,'#132b40');
      ctx.font='700 '+Math.max(7,width*.014)+'px sans-serif';ctx.textAlign='center';ctx.fillStyle='#d4ed8b';ctx.fillText('TOUCHLINE  ·  LIVE YOUR FOOTBALL STORY',width*.5,p1.y-height*.005);
      if(o.training){for(var k=0;k<4;k++){var pp=project(44+k*11,k%2?49:18);ctx.fillStyle='#ff9c4c';ctx.beginPath();ctx.moveTo(pp.x,pp.y-6);ctx.lineTo(pp.x-4,pp.y+2);ctx.lineTo(pp.x+4,pp.y+2);ctx.closePath();ctx.fill();}}
      var v=ctx.createRadialGradient(width*.5,height*.5,width*.1,width*.5,height*.5,width*.7);v.addColorStop(0,'#02162300');v.addColorStop(1,'#02162377');ctx.fillStyle=v;ctx.fillRect(0,0,width,height);
    }
    function limb(x,y,x2,y2,color,thick) {ctx.strokeStyle=color;ctx.lineWidth=thick;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
    function player(a,t) {
      var p=project(a.p.x,a.p.y,0),size=height*.087*p.scale*(a.side==='own'?o.height/178:1),body=size*.39,head=size*.115;
      var palette={own:['#64e7fa','#173b61'],ally:['#73cddd','#163956'],rival:['#ffcf69','#674123'],keeper:['#c7a4ff','#533878'],referee:['#f5f5dc','#172633']}[a.side];
      var kick=a.pose==='kick',tackle=a.pose==='tackle',dive=a.pose==='dive',step=a.run?Math.sin(t*DURATION/1000*14+a.id*1.7):0;
      var swing=step*size*.22,thick=clamp(size*.09,1.8,4),wide=clamp(o.weight/72,.8,1.3);
      ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#071e2466';ctx.beginPath();ctx.ellipse(0,2,size*.35,size*.10,0,0,Math.PI*2);ctx.fill();
      if(a.side==='own'){ctx.strokeStyle='#d5f590';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,2,size*.45,size*.17,0,0,Math.PI*2);ctx.stroke();}
      ctx.translate(0,-Math.abs(step)*size*.026);
      if(dive){ctx.rotate(-.85);ctx.translate(-size*.14,size*.10);}
      if(tackle)ctx.rotate(.34);
      limb(-size*.105,-size*.30,-size*.12+(kick?size*.33:swing*.62),-2,palette[1],thick*1.4);
      limb(size*.105,-size*.30,size*.12-swing*.62,-2,palette[1],thick*1.4);
      limb(-size*.12+(kick?size*.33:swing*.62),-2,-size*.05+(kick?size*.33:swing*.62),0,'#e8f7e8',thick*.8);
      limb(size*.12-swing*.62,-2,size*.18-swing*.62,0,'#d9e8db',thick*.8);
      limb(-size*.15,-size*.64,-size*.27-swing*.45,-size*.40+(dive?-size*.2:0),'#d8ab86',thick);
      limb(size*.15,-size*.64,size*.27+swing*.45,-size*(a.pose==='card'?.99:dive?.88:.40),'#d8ab86',thick);
      if(dive){ctx.fillStyle='#efffd2';ctx.beginPath();ctx.arc(-size*.27-swing*.45,-size*.60,thick*1.15,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(size*.27+swing*.45,-size*.88,thick*1.15,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=palette[0];ctx.beginPath();ctx.moveTo(-size*.17*wide,-size*.72);ctx.lineTo(size*.17*wide,-size*.72);ctx.lineTo(size*.135*wide,-size*.34);ctx.lineTo(-size*.135*wide,-size*.34);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffffff9c';ctx.fillRect(-size*.025,-size*.65,size*.05,size*.22);ctx.fillStyle=palette[1];ctx.fillRect(-size*.15*wide,-size*.36,size*.30*wide,size*.10);
      ctx.fillStyle='#d6a982';ctx.beginPath();ctx.arc(0,-size*.85,head,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2d2526';ctx.beginPath();ctx.arc(0,-size*.88,head,Math.PI,Math.PI*2);ctx.fill();
      if(a.pose==='card'&&o.card){ctx.fillStyle=o.card==='red'?'#ff4e66':'#ffe04d';ctx.fillRect(size*.18,-size*1.2,size*.16,size*.25);}
      ctx.restore();
      if(a.name){var font=clamp(width*.018,8,12);ctx.font='700 '+font+'px "Segoe UI","Microsoft YaHei",sans-serif';var label=short(a.name,9),labelWidth=Math.min(width*.28,ctx.measureText(label).width+10),labelY=p.y-size*1.18;
        roundedRect(p.x-labelWidth/2,labelY-font,labelWidth,font+6,3,a.side==='own'?'#d6f58fea':'#102234dd');ctx.fillStyle=a.side==='own'?'#123329':'#e6f2f4';ctx.textAlign='center';ctx.fillText(label,p.x,labelY+1);}
    }
    function football(ball, t) {
      var p=project(ball.x,ball.y,ball.z),ground=project(ball.x,ball.y,0),r=clamp(height*.013,3,6);
      ctx.fillStyle='#071b2880';ctx.beginPath();ctx.ellipse(ground.x,ground.y+2,r*1.1,r*.4,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#e9f6d45a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-14,p.y+4);ctx.lineTo(p.x-6,p.y+1);ctx.stroke();
      ctx.fillStyle='#f9fff0';ctx.strokeStyle='#112939';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(t*22);ctx.fillStyle='#233348';ctx.beginPath();for(var j=0;j<5;j++){var angle=j*Math.PI*2/5;var xx=Math.cos(angle)*r*.48,yy=Math.sin(angle)*r*.48;if(j)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);}ctx.closePath();ctx.fill();ctx.restore();
    }
    function draw() {
      if(destroyed)return;var frame=sample(o,progress);background(progress);
      // A short trajectory shows the true ball motion; it is never a simulated goal prediction.
      if(progress>.46&&progress<.82){ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle='#e1fbb366';ctx.lineWidth=1.1;ctx.beginPath();for(var s=0;s<12;s++){var pt=sample(o,Math.max(.46,progress-.18)+s*.18/11).ball;var pp=project(pt.x,pt.y,pt.z);if(s)ctx.lineTo(pp.x,pp.y);else ctx.moveTo(pp.x,pp.y);}ctx.stroke();ctx.restore();}
      frame.actors.sort(function(a,b){return a.p.y-b.p.y;}).forEach(function(a){player(a,progress);});football(frame.ball,progress);
      if(progress>=.78&&(o.scored||o.conceded)){ctx.fillStyle=o.scored?'#d8f886':'#ffb2aa';ctx.textAlign='center';ctx.font='italic 900 '+Math.max(15,width*.04)+'px sans-serif';ctx.shadowColor='#071b28';ctx.shadowBlur=8;ctx.fillText(o.scored?'GOAL':'GOAL AGAINST',width*.5,height*.37);ctx.shadowBlur=0;}
      scoreNode.textContent=frame.score[0]+' : '+frame.score[1];cueNode.textContent=frame.cue;seekNode.value=String(Math.round(progress*1000));timeNode.textContent=(progress*DURATION/1000).toFixed(1)+' / 4.2 秒';renderedFrames++;
    }
    function resize() {
      if(destroyed)return;var bounds=stage.getBoundingClientRect();width=Math.max(250,Math.round(bounds.width||640));height=Math.round(width<470?width*.66:width*.51);
      ratio=Math.min(global.devicePixelRatio||1,1.75);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.style.width='100%';canvas.style.height=height+'px';ctx.setTransform(ratio,0,0,ratio,0,0);draw();
    }
    function tick(now) {
      raf=0;if(destroyed||!playing)return;
      if(!host.isConnected){api.destroy();return;}
      if(document.hidden){pause();return;}
      if(!last)last=now;
      var delta=Math.min(90,now-last);last=now;clock+=delta*speed;progress=clamp(clock/DURATION,0,1);
      if(now-drawAt>=32||progress>=1){draw();drawAt=now;}
      if(progress>=1){playing=false;playButton.textContent='播放';playButton.setAttribute('aria-label','播放回放');return;}
      raf=global.requestAnimationFrame(tick);
    }
    function play() {if(destroyed||document.hidden)return;if(progress>=1){progress=0;clock=0;}playing=true;last=0;playButton.textContent='暂停';playButton.setAttribute('aria-label','暂停回放');if(!raf)raf=global.requestAnimationFrame(tick);}
    function pause() {playing=false;last=0;if(raf)global.cancelAnimationFrame(raf);raf=0;playButton.textContent='播放';playButton.setAttribute('aria-label','播放回放');}
    function seek(value) {if(destroyed)return;progress=clamp(value,0,1);clock=progress*DURATION;last=0;draw();}
    function restart() {if(destroyed)return;seek(0);play();}
    function onClick(event) {var target=event.target.closest('[data-replay]');if(!target||!host.contains(target))return;var action=target.getAttribute('data-replay');if(action==='play'){if(playing)pause();else play();}if(action==='restart')restart();if(action==='camera'){camera=camera==='broadcast'?'top':'broadcast';target.textContent=camera==='broadcast'?'切换俯视':'切换转播';host.querySelector('.v42-replay-camera-label').textContent=camera==='broadcast'?'转播镜头':'俯视镜头';draw();}}
    function onInput(event) {if(event.target===seekNode)seek(Number(seekNode.value)/1000);if(event.target.hasAttribute('data-replay-speed'))speed=clamp(event.target.value,.5,2);}
    function visibility() {if(document.hidden)pause();}
    function onMotionChange() {if(motionMode()!=='full')pause();}
    var api={play:play,pause:pause,restart:restart,seek:seek,destroy:function(){if(destroyed)return;pause();destroyed=true;if(resizeObserver)resizeObserver.disconnect();if(removeObserver)removeObserver.disconnect();if(modeObserver)modeObserver.disconnect();global.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);host.removeEventListener('click',onClick);host.removeEventListener('input',onInput);host.removeEventListener('change',onInput);host.remove();if(active===api)active=null;},snapshot:function(){var frame=sample(o,progress);return {progress:progress,seconds:progress*4.2,playing:playing,speed:speed,camera:camera,kind:o.kind,actionKind:o.actionKind,ball:{x:frame.ball.x,y:frame.ball.y,z:frame.ball.z},shootingPlayer:o.kind==='goal'&&o.actionKind==='pass'?(o.together?o.playerName:'接应队友'):o.kind==='concede'?o.playerName:o.ownName,score:frame.score.slice(),scored:frame.goalVisible,conceded:frame.concedeVisible,cue:frame.cue,destroyed:destroyed,frames:renderedFrames,pendingFrame:!!raf,motion:motionMode()};}};
    active=api;host.addEventListener('click',onClick);host.addEventListener('input',onInput);host.addEventListener('change',onInput);document.addEventListener('visibilitychange',visibility);
    if(global.ResizeObserver){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);}else global.addEventListener('resize',resize,{passive:true});
    if(global.MutationObserver){removeObserver=new MutationObserver(function(){if(!host.isConnected)api.destroy();});removeObserver.observe(document.body,{childList:true,subtree:true});modeObserver=new MutationObserver(onMotionChange);modeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-v41-motion']});}
    resize();if(motionMode()==='full')play();return api;
  }
  global.CareerReplay=Object.freeze({mount:mount,html:html,version:'4.2',duration:DURATION});
})(window);
