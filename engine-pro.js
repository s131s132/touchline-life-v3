(function(g){
'use strict';
const D=g.FOOTBALL_DATA,EVENTS=g.CAREER_EVENTS.concat(g.CAREER_EVENT_EXPANSION||[],g.CAREER_INTERNATIONAL_EVENTS||[]);
const clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x)),round=(n,p=0)=>Math.round(n*10**p)/10**p;
const attrs={technique:'控球技术',finishing:'射门终结',passing:'传球',vision:'比赛阅读',pace:'速度',acceleration:'启动爆发',strength:'力量对抗',stamina:'耐力',tackling:'防守',positioning:'站位',handling:'门将接球',reflexes:'扑救反应',composure:'心理素质'};
const positions={ST:'中锋',LW:'边锋',AM:'前腰',CM:'中场',DM:'后腰',CB:'中后卫',FB:'边后卫',GK:'门将'};
const training={balanced:{name:'综合基础',keys:Object.keys(attrs),load:1},technique:{name:'控球与双足',keys:['technique','passing'],load:1},finishing:{name:'终结与无球',keys:['finishing','positioning'],load:1},playmaker:{name:'组织与比赛阅读',keys:['passing','vision','composure'],load:.9},speed:{name:'速度与启动',keys:['pace','acceleration'],load:1.25},strength:{name:'力量与对抗',keys:['strength','stamina'],load:1.3},defense:{name:'防守与站位',keys:['tackling','positioning','strength'],load:1.1},keeper:{name:'门将专项',keys:['handling','reflexes','positioning'],load:1.1},recovery:{name:'恢复与低负荷',keys:['composure','vision'],load:.25}};
const phases=[{name:'夏季准备',month:'7–9 月',short:'夏窗',window:true},{name:'秋季竞争',month:'10–12 月',short:'上半程',window:false},{name:'冬季调整',month:'1–3 月',short:'冬窗',window:true},{name:'赛季收官',month:'4–6 月',short:'赛季评估',window:false}];
const roles={star:'核心球员',starter:'主力球员',rotation:'轮换球员',prospect:'发展球员',youth:'青训梯队'};
const clubs=new Map(D.clubs.map(c=>[c.id,c]));
function hash(str){let h=2166136261;for(const c of String(str)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function rand(s){s.seed^=s.seed<<13;s.seed^=s.seed>>>17;s.seed^=s.seed<<5;return(s.seed>>>0)/4294967296;}
function normal(s){return Math.sqrt(-2*Math.log(Math.max(1e-8,rand(s))))*Math.cos(2*Math.PI*rand(s));}
function choose(s,list){return list[Math.floor(rand(s)*list.length)];}
function date(s){return `${s.year}/${s.year+1} · ${phases[s.quarter].month}`;}
function getClub(id){const c=clubs.get(typeof id==='object'?id?.id:id);if(!c)return null;const h=hash(c.id),power=c.source==='of'?37+h%28:c.power;const academies={tm610:96,tm294:94,tm720:93,tm16:94,tm409:94,tm430:94,tm131:93,tm215:92,tm418:94,tm281:92};return{...c,power,academy:academies[c.id]||clamp(power-4+(h%18),38,96),facility:clamp(power+5-(h%12),35,98),pressure:clamp(power+3,35,96),style:['控球组织','高位逼抢','快速反击','稳固防守','边路进攻'][h%5],budget:round(10**(3.8+power/30)),playing:clamp(95-power*.6,25,80)};}
function activeClub(s){return getClub(s.loan?.clubId||s.clubId);}
function stage(s){if(s.retired)return{key:'retired',n:'退役人生',min:40,max:40,desc:'球员生涯落幕，热爱以另一种方式继续。'};const ranges=[['child','童年启蒙',7,10,'培养兴趣、基本动作、校园足球与家庭支持。'],['foundation','基础青训',11,13,'选择培养环境，在学校、家庭与青训之间分配时间。'],['elite','精英梯队',14,15,'应对发育、位置竞争与精英队筛选。'],['scholar','青年合同',16,17,'审视青年培养协议，争取一线队的第一道门。'],['breakthrough','职业突破',18,21,'第一份职业合同、替补竞争、租借与国家青年队。'],['prime','职业成熟',22,29,'转会、续约、核心地位与国家队的重要阶段。'],['veteran','老将转型',30,34,'管理恢复与角色变化，开始为下一段职业做准备。'],['farewell','告别与传承',35,39,'决定如何结束球员生涯，以及把经验留给谁。']];const r=ranges.find(x=>s.age>=x[2]&&s.age<=x[3])||ranges.at(-1);return{key:r[0],n:r[1],min:r[2],max:r[3],desc:r[4]};}
function rating(s){const w={ST:{finishing:.32,technique:.2,positioning:.15,pace:.1,strength:.1,composure:.13},LW:{pace:.22,acceleration:.15,technique:.25,passing:.15,finishing:.13,vision:.1},AM:{passing:.25,vision:.25,technique:.25,finishing:.15,composure:.1},CM:{passing:.28,vision:.25,technique:.2,stamina:.15,composure:.12},DM:{tackling:.26,positioning:.22,passing:.2,strength:.15,vision:.17},CB:{tackling:.3,positioning:.25,strength:.23,pace:.1,composure:.12},FB:{pace:.23,stamina:.23,tackling:.2,passing:.18,positioning:.16},GK:{handling:.3,reflexes:.33,positioning:.2,composure:.12,passing:.05}}[s.pos];return round(Object.entries(w).reduce((n,[k,v])=>n+s.attrs[k]*v,0));}
function valuation(s){if(s.age<15)return 0;const r=rating(s),ageFactor=s.age<22?1.6:s.age<28?1.3:s.age<31?1:s.age<34?.6:.22;return round(Math.max(1000,Math.pow(Math.max(5,r-32),4.2)*.9*ageFactor*(1+s.reputation/200)),0);}
function note(s,title,text,type='life',extra={}){s.log.unshift({id:s.nextId++,step:s.step,age:s.age,quarter:s.quarter,year:s.year,title,text,type,...extra});if(s.log.length>1500)s.log.length=1500;}
function legacyStart(c={}){const seed=(c.seed||((Date.now()^Math.floor(Math.random()*1e9))>>>0))||417853;const s={v:2,name:(c.name||'林星野').trim().slice(0,18),nation:c.nation||'China',pos:positions[c.pos]?c.pos:'CM',foot:c.foot||'right',familyType:c.family||'ordinary',difficulty:c.difficulty||'normal',talent:c.talent||'technical',seed,age:7,year:2026,quarter:0,step:0,nextId:1,route:'football',retired:false,ending:null,attrs:{technique:28,finishing:24,passing:28,vision:25,pace:31,acceleration:30,strength:21,stamina:27,tackling:23,positioning:24,handling:20,reflexes:25,composure:29},coach:45,health:96,fatigue:15,form:64,confidence:65,motivation:80,family:82,education:35,discipline:65,friendship:50,adaptability:45,leadership:30,loyalty:60,knowledge:20,network:12,scouting:8,reputation:0,nationalRep:0,coaching:0,weakFoot:30,coordination:70,versatility:25,loanSupport:35,cash:c.family==='wealthy'?5000:c.family==='humble'?180:1200,totalEarnings:0,clubId:null,contract:null,loan:null,agent:null,offers:[],applications:[],training:'balanced',intensity:'normal',life:'balanced',nutrition:'balanced',body:null,injury:null,storyQueue:[],history:[],growth:[],log:[],achievements:[],leagues:{},pending:null,lastResult:null,stats:{apps:0,goals:0,assists:0,cleanSheets:0,youthApps:0,caps:0,nationalGoals:0},season:{apps:0,goals:0,assists:0,youthApps:0,cleanSheets:0,minutes:0,matchRating:0,salary:0},bestRating:0,careerMoves:[],rolePromise:null};
if(s.talent==='technical'){s.attrs.technique+=7;s.attrs.passing+=4;}if(s.talent==='athlete'){s.attrs.pace+=7;s.attrs.strength+=5;}if(s.talent==='reader'){s.attrs.vision+=8;s.attrs.composure+=4;}if(s.talent==='keeper'){s.attrs.reflexes+=9;s.attrs.handling+=6;}if(s.familyType==='sport'){s.discipline+=8;s.knowledge+=10;}if(s.foot==='both')s.weakFoot=65;const h=clamp(Number(c.height)||122,108,145),w=clamp(Number(c.weight)||24,17,45),father=clamp(Number(c.fatherHeight)||178,155,210),mother=clamp(Number(c.motherHeight)||165,145,195);s.body={h,w,initialH:h,initialW:w,father,mother,adultH:clamp((father+mother+13)/2+normal(s)*4.2,Math.max(158,h+35),211),maturity:c.maturity||'normal',lastH:0,lastW:0};s.growth.push({step:0,age:7,h,w});note(s,'第一双球鞋，第一段人生','从七岁出发。你将自己选择青训、身体管理、合同和球场之外的生活。');return s;}
function apply(s,eff){for(const [k,v]of Object.entries(eff||{})){if(k in attrs)s.attrs[k]=clamp(s.attrs[k]+v,1,99);else if(k==='cash')s.cash=Math.max(0,round(s.cash+v));else if(k==='injuryWeeks'){if(v>0){s.injury={name:'训练与负荷伤病',weeks:Math.max(v,s.injury?.weeks||0),initial:Math.max(v,s.injury?.weeks||0)};}else if(s.injury){s.injury.weeks=Math.max(0,s.injury.weeks+v);if(!s.injury.weeks)s.injury=null;}}else if(k==='bodyMass')s.body.w=clamp(s.body.w+v,17,145);else if(typeof s[k]==='number')s[k]=clamp(s[k]+v);}}
function contextOK(s,e){return e.context==='any'||e.context==='club'&&!!s.clubId||e.context==='loan'&&!!s.loan||e.context==='injured'&&!!s.injury||e.context==='keeper'&&s.pos==='GK'||e.context==='foreign'&&!!activeClub(s)&&activeClub(s).country!==s.nation;}
function eventProbabilityV3(s,c){const value=c.check in attrs?s.attrs[c.check]:s[c.check]??50;const maturity=s.age<14?.07:0;const dif=s.difficulty==='relaxed'?.055:s.difficulty==='hard'?-.06:0;return round(clamp(c.base+(value-55)/260+(s.motivation-60)/700-(s.fatigue-30)/800+dif+maturity,.14,.9),2);}
function prepareV3(s){if(s.retired||s.pending)return false;let pool=EVENTS.filter(e=>s.age>=e.min&&s.age<=e.max&&contextOK(s,e)&&(!e.once||!s.log.some(x=>x.eventId===e.id)));if(s.route!=='football')pool=pool.filter(e=>['homework','schoolfinal','familybudget','campus','love','finances','coaching','nutrition','parenthood','insurance','localhero','latebalance'].includes(e.id));const recent=new Set(s.log.filter(x=>x.type==='event').slice(0,5).map(x=>x.eventId)),queue=[];s.storyQueue=s.storyQueue||[];while(s.storyQueue.length&&queue.length<2){const id=s.storyQueue.shift(),e=EVENTS.find(e=>e.id===id);if(e&&s.age>=e.min&&s.age<=e.max&&!queue.includes(id))queue.push(id);}let fresh=pool.filter(e=>!recent.has(e.id)&&!queue.includes(e.id));if(fresh.length<2-queue.length)fresh=pool.filter(e=>!queue.includes(e.id));while(queue.length<2&&fresh.length){const e=choose(s,fresh);queue.push(e.id);fresh=fresh.filter(x=>x.id!==e.id);}if(!queue.length)return false;s.pending={kind:'event',queue,index:0,outcome:null};return true;}
function currentEventV3(s){return EVENTS.find(e=>e.id===s.pending?.queue?.[s.pending.index]);}
function chooseEventV3(s,index){const p=s.pending;if(p?.kind!=='event'||p.outcome)return null;const e=currentEvent(s),c=e?.choices[index];if(!c)return null;const chance=eventProbability(s,c),roll=rand(s),success=roll<chance;apply(s,c.cost);apply(s,success?c.good:c.bad);const follow=c.follow?.[success?'success':'failure'];if(follow&&EVENTS.some(e=>e.id===follow)){s.storyQueue=s.storyQueue||[];if(!s.storyQueue.includes(follow))s.storyQueue.push(follow);}p.outcome={title:e.title,eventId:e.id,choice:c.label,chance,roll:round(roll,4),success,text:success?c.success:c.failure,effects:success?c.good:c.bad,cost:c.cost};note(s,e.title,p.outcome.text,'event',{eventId:e.id,choice:c.label,success,chance});return p.outcome;}
function nextV3(s){const p=s.pending;if(!p)return null;if(p.kind==='event'&&p.outcome){p.index++;p.outcome=null;if(p.index<p.queue.length)return 'event';if(s.route==='football'&&!s.injury){setupMatch(s);return 'match';}return finish(s);}if(p.kind==='match'&&p.outcome){p.round++;p.outcome=null;if(p.round<3)return 'match';return finish(s);}return null;}
function leagueKey(s){const c=activeClub(s);if(!c)return null;const legacy=s.year+':'+c.country+':'+(s.age<18?'youth':'pro');if(s.leagues[legacy]?.teams.some(t=>t.id===c.id))return legacy;return s.year+':'+c.country+':'+(c.current&&c.country==='China'?c.league+':':'')+(s.age<18?'youth':'pro');}
function calendar(teams){const ids=teams.map(t=>t.id);if(ids.length%2)ids.push(null);const schedule=[],n=ids.length;for(let r=0;r<n-1;r++){const matches=[];for(let i=0;i<n/2;i++)if(ids[i]&&ids[n-1-i])matches.push(r%2?[ids[i],ids[n-1-i]]:[ids[n-1-i],ids[i]]);schedule.push(matches);ids.splice(1,0,ids.pop());}return [...schedule,...schedule.map(ms=>ms.map(([a,b])=>[b,a]))];}
function poisson(s,lambda){const l=Math.exp(-lambda);let k=0,p=1;do{k++;p*=rand(s);}while(p>l&&k<10);return k-1;}
function recordFixture(l,a,b,ga,gb){const h=l.teams.find(t=>t.id===a),v=l.teams.find(t=>t.id===b);h.p++;v.p++;h.gf+=ga;h.ga+=gb;v.gf+=gb;v.ga+=ga;if(ga>gb){h.w++;v.l++;h.pts+=3;}else if(ga<gb){v.w++;h.l++;v.pts+=3;}else{h.d++;v.d++;h.pts++;v.pts++;}}
function ensureLeague(s){const c=activeClub(s);if(!c)return null;const key=leagueKey(s);let l=s.leagues[key];if(l&&l.teams.some(t=>t.id===c.id))return l;let candidates=D.clubs.filter(x=>x.country===c.country&&x.id!==c.id&&(c.current&&c.country==='China'?x.current&&x.league===c.league:x.source==='tm'||c.source==='of'&&x.historical)).map(x=>getClub(x.id)).sort((a,b)=>Math.abs(a.power-c.power)-Math.abs(b.power-c.power)).slice(0,19);let ids=[c,...candidates];if(ids.length<2)return null;if(ids.length%2)ids.pop();if(!ids.some(x=>x.id===c.id))ids.unshift(c);l={key,year:s.year,youth:s.age<18,teams:ids.map(x=>({id:x.id,power:x.power,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0})),round:0,schedule:calendar(ids),results:[]};s.leagues[key]=l;const prior=Math.floor(l.schedule.length*s.quarter/4);while(l.round<prior)simulateRound(s,l,null);return l;}
function simulateRoundV3(s,l,highlight){for(const [a,b]of l.schedule[l.round]){const ca=getClub(a),cb=getClub(b);let ga,gb;if(highlight&&((highlight.home===a&&highlight.away===b)||(highlight.home===b&&highlight.away===a))){[ga,gb]=highlight.home===a?highlight.score:[...highlight.score].reverse();}else{ga=poisson(s,clamp(1.35+(ca.power-cb.power)/40,.3,3.2));gb=poisson(s,clamp(1.05+(cb.power-ca.power)/40,.25,3));}recordFixture(l,a,b,ga,gb);l.results.push({a,b,ga,gb,round:l.round});}l.round++;}
function setupMatchV3(s){const club=activeClub(s),league=ensureLeague(s);let rival=null,home=club?.id,away=null;if(league){const round=league.schedule[Math.min(league.round,league.schedule.length-1)];const pair=round.find(pair=>pair.includes(club.id));if(pair){[home,away]=pair;rival=getClub(pair.find(id=>id!==club.id));}}s.pending={kind:'match',round:0,score:[0,0],home,away,rivalId:rival?.id||null,opponent:rival?(rival.cn||rival.n):s.age<16?'北岸青年队':'城市联队',boost:0,plays:[],outcome:null,clubId:club?.id||null,ownHome:home===club?.id};}
const fieldPlays=[{title:'18′ · 接球后的第一判断',text:'防线还没有完全落位。你需要在有限的空间里，选择最合适的处理方式。',options:[{n:'持球突破制造威胁',key:'technique',base:.58,risk:'高收益，丢球可能被反击',attack:1.2},{n:'传给跑出空位的队友',key:'passing',base:.75,risk:'稳定配合，可能创造队友进球',attack:.9},{n:'无球前插攻击身后',key:'acceleration',base:.62,risk:'考验速度与协调，消耗较高',attack:1,load:2}]},{title:'57′ · 比赛正在倾斜',text:'对手开始连续压迫。球队既需要稳定，也需要能够改变节奏的一次行动。',options:[{n:'放慢节奏，重新组织',key:'vision',base:.79,risk:'控制风险，进球收益较低',attack:.55},{n:'积极压迫，争夺球权',key:'tackling',base:.65,risk:'夺回球权，也可能失位',attack:.8,load:3},{n:'突然提速发动反击',key:'pace',base:.57,risk:'更高威胁，同时承担更多失误风险',attack:1.3,load:2}]},{title:'86′ · 关键回合',text:'比赛进入最后阶段。体能与压力都在累积，一次处理可能决定整个赛季的记忆。',options:[{n:'果断射门完成终结',key:'finishing',base:.55,risk:'直接争取进球，依赖终结能力',attack:1.5},{n:'送出决定性的传球',key:'passing',base:.69,risk:'寻找最佳机会，队友也需要完成终结',attack:1.1},{n:'优先保护球权和站位',key:'composure',base:.83,risk:'减少失误，更偏重球队稳定',attack:.35}]}];
const keeperPlays=[{title:'18′ · 单刀逼近',text:'前锋突破了防线，你必须立即选择自己的应对。',options:[{n:'出击封堵角度',key:'reflexes',base:.64,risk:'扩大封堵面积，也可能被过掉',attack:0},{n:'保持站位等待射门',key:'positioning',base:.72,risk:'依赖判断和反应',attack:0},{n:'提前指挥后卫回追',key:'leadership',base:.68,risk:'沟通有效时可以减少射门威胁',attack:0}]},{title:'57′ · 后场出球',text:'对手压到禁区附近。球队希望从你这里开始组织。',options:[{n:'短传找到中场',key:'passing',base:.71,risk:'出球成功创造组织优势，失败可能直接失球',attack:.7},{n:'长传寻找前场支点',key:'technique',base:.59,risk:'更有反击威胁，丢失球权概率较高',attack:1.1},{n:'稳妥解围，保护球门',key:'composure',base:.83,risk:'风险较低，主动进攻收益较少',attack:.25}]},{title:'86′ · 最后一记射门',text:'看台突然安静下来。射门已经飞向球门，训练中的每一次准备都在这一刻发挥作用。',options:[{n:'相信反应，完成扑救',key:'reflexes',base:.66,risk:'直接扑救，考验反应能力',attack:0},{n:'提前判断落点',key:'positioning',base:.72,risk:'站位正确可以降低扑救难度',attack:0},{n:'稳稳接住，避免二次进攻',key:'handling',base:.62,risk:'成功时收益更大，脱手也会增加危险',attack:0}]}];
const defensePlays=[
 {title:'18′ · 对手开始冲击你的防区',text:'持球人正在接近，身后的队友还没有完全落位。你必须决定什么时候离开自己的位置。',options:[{n:'保持距离，等待协防形成',key:'positioning',base:.79,risk:'更稳妥，但可能让对手继续推进',attack:.35},{n:'提前上抢切断进攻',key:'tackling',base:.61,risk:'成功可以反击，失误会暴露身后',attack:1.1,load:2},{n:'指挥队友封锁传球线路',key:'leadership',base:.71,risk:'依赖沟通和判断，未必直接夺回球权',attack:.6}]},
 {title:'57′ · 断球之后，如何发起下一次进攻',text:'你获得了球权，队友正在转换位置。稳妥出球和直接打击身后都在你的视野里。',options:[{n:'短传找到中场，再向前推进',key:'passing',base:.79,risk:'保持控球，进攻速度较慢',attack:.6},{n:'持球向前吸引对手',key:'technique',base:.59,risk:'可以打开局面，丢球也可能很危险',attack:1.1,load:2},{n:'长传寻找对手防线身后',key:'vision',base:.65,risk:'有直接威胁，也容易丢失球权',attack:1.2}]},
 {title:'86′ · 最后阶段的防线选择',text:'对手投入更多人手，禁区里不断有人跑动。你必须在压力下处理这一回合。',options:[{n:'专注站位，保护最危险的区域',key:'positioning',base:.81,risk:'稳固防守，反击机会较少',attack:.2},{n:'抢先出脚破坏关键传球',key:'tackling',base:.64,risk:'断球可能改变比赛，失位也会增加危险',attack:.75},{n:'控住球，寻找摆脱后的反击',key:'composure',base:.67,risk:'需要冷静，成功可以缓解持续压力',attack:1.05}]}];
const attackingVariants=[
 {title:'18′ · 边路出现了一次二打一',text:'队友套边，对手正在收缩。现在的处理会决定能否把局部优势变成机会。',options:[{n:'送出提前量传球',key:'passing',base:.76,risk:'让队友进入空间，考验配合',attack:1},{n:'内切后自己制造威胁',key:'technique',base:.6,risk:'威胁更直接，也更容易被围抢',attack:1.3,load:2},{n:'回传再转移到另一侧',key:'vision',base:.81,risk:'保持组织，直接收益较小',attack:.5}]},
 {title:'57′ · 密集防守前的耐心',text:'对手退回了禁区附近，向前的空间越来越小。球队需要一次准确的决定。',options:[{n:'用连续短传调动防线',key:'passing',base:.78,risk:'比较稳妥，需要持续耐心',attack:.7},{n:'突然插入中卫之间',key:'positioning',base:.64,risk:'能制造近门机会，也可能失去球权',attack:1.2,load:2},{n:'尝试一脚出其不意的射门',key:'finishing',base:.51,risk:'收益更直接，成功难度更高',attack:1.5}]},
 {title:'86′ · 一次反击，几种可能',text:'你在开阔区域拿到了球，身边的队友正在冲刺。压力来自逐渐逼近的回防球员。',options:[{n:'把球交给位置更好的队友',key:'vision',base:.75,risk:'依赖判断和队友的终结',attack:1.1},{n:'继续加速，直接冲击球门',key:'pace',base:.57,risk:'威胁很大，同时考验剩余体能',attack:1.4,load:3},{n:'减速护球，等待第二波接应',key:'composure',base:.83,risk:'减少失误，机会可能慢慢消失',attack:.4}]}];
function matchOptionsV3(s){const p=s.pending;if(p?.kind!=='match')return null;const bank=s.pos==='GK'?keeperPlays:['CB','DM','FB'].includes(s.pos)?defensePlays:(s.step%2?attackingVariants:fieldPlays),v=bank[p.round],rival=getClub(p.rivalId),bmi=s.body.w/(s.body.h/100)**2,target=clamp(16+(s.age-7)*.48,16,23),massPenalty=Math.min(.045,Math.abs(bmi-target)*.004),reachBonus=s.pos==='GK'?clamp((s.body.h-(s.age<18?125+(s.age-7)*5.5:185))/650,-.035,.035):s.pos==='CB'||s.pos==='ST'?clamp((s.body.h-(s.age<18?122+(s.age-7)*5:180))/1500,-.02,.02):0;return{...v,options:v.options.map(o=>({...o,chance:round(clamp(o.base+((o.key in attrs?s.attrs[o.key]:s[o.key])-50)/190+(s.form-60)/450-(s.fatigue-20)/650+(s.coordination-70)/500+reachBonus-massPenalty+(s.weakFoot-30)/2500+(rating(s)-(rival?.power||40))/350+(s.difficulty==='relaxed'?.05:s.difficulty==='hard'?-.06:0),.15,.9),2)}))};}
function playV3(s,index){const p=s.pending;if(p?.kind!=='match'||p.outcome)return null;const o=matchOptions(s).options[index];if(!o)return null;const roll=rand(s),success=roll<o.chance;let scored=0,conceded=0;if(success){p.boost++;if(s.pos!=='GK'||p.round===1){scored=rand(s)<o.attack*.65?1:0;p.score[0]+=scored;}}else{conceded=rand(s)<(s.pos==='GK'?.75:.42)?1:0;p.score[1]+=conceded;}if(o.load)apply(s,{fatigue:o.load});p.outcome={success,chance:o.chance,roll:round(roll,4),title:success?'这次判断奏效了':'这次处理没有成功',text:success?(scored?'你们把这次机会转化为了进球。':s.pos==='GK'?'你化解了危险，保持球门安全。':'球队获得了更好的局面。'):(conceded?'对手抓住失误完成了进球。':'对手化解了这次处理，你需要重新集中。'),choice:o.n};p.plays.push(p.outcome);return p.outcome;}
function applyTrainingV3(s){const t=training[s.training],club=activeClub(s);const youth=s.age<12?.65:s.age<16?.96:s.age<19?.85:s.age<23?.57:s.age<28?.3:s.age<31?.09:s.age<35?-.08:-.27;const mult=(s.intensity==='high'?1.3:s.intensity==='low'?.7:1)*(s.difficulty==='relaxed'?1.13:s.difficulty==='hard'?.88:1)*(1+(club?club.academy-50:0)/220)*(1-(s.injury?.weeks||0)/30)*(s.route==='football'?1:.4);const life=s.life==='study'?.78:s.life==='discipline'?1.12:1;for(const k in attrs){const factor=t.keys.includes(k)?(s.training==='balanced'?1:1.65):.32;let gain=(youth+normal(s)*.13)*mult*life*factor;if(s.training==='recovery')gain*=.2;if(s.age>=31&&['pace','acceleration','stamina'].includes(k))gain-=.12+(s.age-31)*.035;if(['vision','composure','positioning'].includes(k)&&s.age>=28)gain+=.11;s.attrs[k]=clamp(s.attrs[k]+gain,1,99);}if(s.training==='technique')s.weakFoot=clamp(s.weakFoot+.6);let load=(s.intensity==='high'?14:s.intensity==='low'?2:7)*t.load;apply(s,{fatigue:load-6,health:s.training==='recovery'?5:1});if(s.training==='recovery')apply(s,{fatigue:-17});if(s.life==='study')apply(s,{education:2.7,knowledge:1});else if(s.life==='family')apply(s,{family:3,motivation:3,fatigue:-2});else if(s.life==='discipline')apply(s,{discipline:.7,motivation:-1});else if(s.life==='social')apply(s,{friendship:3,network:1,cash:-Math.min(400,s.cash*.015)});else apply(s,{education:1,family:.6});}
const curve=[.68,.71,.74,.77,.805,.845,.89,.93,.96,.979,.989,.996,1];
function bodyGrowth(s){const b=s.body,oldH=b.h,oldW=b.w,age=s.age+s.quarter/4;const shift=b.maturity==='early'?.6:b.maturity==='late'?-.7:0;const f=a=>{const x=clamp(a-7+shift,0,12),i=Math.floor(x);return i>=12?1:curve[i]+(curve[i+1]-curve[i])*(x-i);};if(age<20&&b.h<b.adultH){const share=(f(age+.25)-f(age))/Math.max(.005,1-f(age));const gain=clamp((b.adultH-b.h)*share*(.8+rand(s)*.4),0,3.2);b.h=round(Math.min(b.adultH,b.h+gain),1);}const bmi=clamp(16+(age-7)*.48,16,s.pos==='CB'||s.pos==='GK'?23.3:22.3);const target=bmi*(b.h/100)**2+(s.training==='strength'?1.2:0);const diet=s.nutrition==='strength'?.22:s.nutrition==='agility'?-.17:0;const dw=clamp((target-b.w)*.18+normal(s)*.38+diet,-1.2,2);b.w=round(clamp(b.w+dw,17,145),1);b.lastH=round(b.h-oldH,1);b.lastW=round(b.w-oldW,1);if(b.lastH>1.6)apply(s,{coordination:-3,fatigue:2});else apply(s,{coordination:1});s.growth.push({step:s.step+1,age:round(age+.25,2),h:b.h,w:b.w});}
function injuryChanceV3(s){const load=s.intensity==='high'?.035:s.intensity==='low'?-.02:0;return clamp(.04+load+(s.fatigue-30)/1200+(80-s.health)/1300+(70-s.coordination)/1600+(s.body.lastH>1.6?.015:0)+(s.age>31?(s.age-31)/1000:0),.012,.24)*(s.training==='recovery'?.25:1)*(s.difficulty==='hard'?1.2:1);}
function finishQuarter(s){if(s.retired)return null;const match=s.pending?.kind==='match'?JSON.parse(JSON.stringify(s.pending)):null;applyTraining(s);bodyGrowth(s);let injuryNew=null;if(s.injury){s.injury.weeks=Math.max(0,s.injury.weeks-8-(s.training==='recovery'?3:0));if(!s.injury.weeks){s.injury=null;note(s,'回到完整训练','你完成了这一阶段的恢复，可以重新参加常规训练。','health');}}else if(s.route==='football'&&rand(s)<injuryChance(s)){const weeks=2+Math.floor(rand(s)*9);s.injury={name:choose(s,['肌肉拉伤','踝关节扭伤','膝部不适','内收肌不适']),weeks,initial:weeks};injuryNew={...s.injury};apply(s,{health:-5-weeks/2,form:-3});note(s,'伤病报告',`${s.injury.name}，预计影响 ${weeks} 周。恢复计划将降低风险，但无法保证固定回归日期。`,'injury');}
const club=activeClub(s),l=ensureLeague(s),r=rating(s),previous=s.history.at(-1)?.rating||r;let teamGames=s.age<12?5:s.age<16?7:9,fixtures=[];if(l){const target=Math.floor(l.schedule.length*(s.quarter+1)/4),before=l.results.length;while(l.round<target){let hi=null;if(match&&l.round===Math.floor(l.schedule.length*s.quarter/4)){const pair=l.schedule[l.round].find(x=>x.includes(club.id));if(pair){const score=match.ownHome?match.score:[...match.score].reverse();hi={home:pair[0],away:pair[1],score};}}simulateRound(s,l,hi);}fixtures=l.results.slice(before).filter(x=>x.a===club.id||x.b===club.id);teamGames=fixtures.length;}
const role=s.loan?.role||s.contract?.role||'youth',promised=squadTier(s)==='academy'?(s.contract?.youthRole==='rotation'?.58:.88):{star:.96,starter:.85,rotation:.6,prospect:.34,youth:.85}[role];const tier=squadTier(s),competition=club?clamp(.7+(r-(club.power-(tier==='academy'?25:tier==='reserves'?10:0)))/75,.18,1):.8;const available=s.injury?Math.max(0,1-s.injury.weeks/13):1;let apps=s.route==='football'?Math.round(teamGames*clamp(promised*.65+competition*.35+(s.coach-50)/400,.12,.98)*available):0;if(s.age<16&&!club)apps=Math.round(teamGames*.9*available);const professional=competitionContext(s).professional&&!!s.contract;const effective=apps*(.65+(match?match.boost/(match.roundTotal||3):0)*.55);const attacking=['ST','LW','AM'].includes(s.pos);const goals=s.pos==='GK'?0:poisson(s,effective*(s.pos==='ST'?.36:s.pos==='LW'?.23:s.pos==='AM'?.18:['CB','DM','FB'].includes(s.pos)?.045:.11)*r/75);const assists=s.pos==='GK'?Number(apps>0&&rand(s)<.07):poisson(s,effective*(['CM','AM','LW'].includes(s.pos)?.22:.09)*s.attrs.passing/70);const cleanSheets=s.pos==='GK'?Math.floor(apps*(.2+r/300)*(match?.boost||1)/2):0;const matchRating=round(clamp(5.8+(r-(club?.power||45))/80+(match?.boost||1)*.32+(goals+assists)*.12+normal(s)*.2,4.8,9.4),1);if(professional){s.stats.apps+=apps;s.stats.goals+=goals;s.stats.assists+=assists;s.stats.cleanSheets+=cleanSheets;s.season.apps+=apps;s.season.goals+=goals;s.season.assists+=assists;s.season.cleanSheets+=cleanSheets;}else{s.stats.youthApps+=apps;s.season.youthApps+=apps;if(squadTier(s)==='school'||squadTier(s)==='community')s.stats.schoolApps+=apps;if(squadTier(s)==='reserves')s.stats.reserveApps+=apps;}s.season.minutes+=apps*({star:83,starter:79,rotation:51,prospect:32,youth:73}[role]);s.season.matchRating+=matchRating/4;apply(s,{form:(matchRating-6.7)*5,coach:apps?clamp((matchRating-6.7)*3,-3,4):s.age>=18?-2:0,scouting:apps?Math.max(0,(matchRating-6.2)*2):0});
let salary=0,bonuses=0,tax=0;if(s.contract){salary=s.contract.wage*13;bonuses=professional?apps*s.contract.appBonus+goals*s.contract.goalBonus:0;const agentRate=s.agent?.fee||0;tax=round((salary+bonuses)*.25);const agentFee=round((salary+bonuses)*agentRate/100);const net=round(salary+bonuses-tax-agentFee);s.cash+=net;s.totalEarnings+=salary+bonuses;s.season.salary+=salary+bonuses;}if(s.route!=='football'&&s.age>=18){salary=round(1800+s.education*28+s.knowledge*18);s.cash+=salary;s.totalEarnings+=salary;}let expenses=s.age<18?Math.min(s.cash,70):Math.min(s.cash,round(350+salary*.06));s.cash=round(Math.max(0,s.cash-expenses));
if(professional&&apps)apply(s,{reputation:Math.max(0,(matchRating-6.5)*1.8)});const result={tier:squadTier(s),competition:competitionContext(s).name,suffix:competitionContext(s).suffix,minutes:apps*({star:83,starter:79,rotation:51,prospect:32,youth:73}[role]),step:s.step,year:s.year,quarter:s.quarter,age:s.age,stage:stage(s).n,clubId:club?.id||null,club:club?.cn||club?.n||(s.route==='football'?'校园与自由球员':'校园与社区'),rating:r,ratingChange:round(r-previous,1),apps,goals,assists,cleanSheets,professional,salary,bonuses,tax,expenses,matchRating,height:s.body.h,weight:s.body.w,dh:s.body.lastH,dw:s.body.lastW,injury:injuryNew,match,fixtures,seasonEnd:s.quarter===3};if(club)result.club=competitionContext(s).team;else result.club=s.route==='football'?'校园与自由球员':'校园与社区';
s.history.push(result);s.bestRating=Math.max(s.bestRating,r);if(s.quarter===3){if(l){const table=[...l.teams].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));if(table[0]?.id===club?.id){const title=competitionContext(s).name+'冠军';s.achievements.push({age:s.age,year:s.year,title,clubId:club.id});note(s,'赛季的冠军时刻',`${club.cn||club.n} 赢得了${title}。`,'honor');apply(s,{reputation:5,confidence:5});}}if(professional&&s.season.matchRating>=7.5&&s.season.apps>=16){s.achievements.push({age:s.age,year:s.year,title:'球队赛季最佳球员',clubId:club?.id});}if(s.age<18&&s.clubId&&s.coach<20&&rand(s)<.38){note(s,'青训评估未获留用','俱乐部决定不继续本阶段培养。你可以寻找新的青训环境，也可以选择学业路线。','release');s.clubId=null;s.contract=null;s.loan=null;}s.season={apps:0,goals:0,assists:0,youthApps:0,cleanSheets:0,minutes:0,matchRating:0,salary:0};}
s.step++;s.quarter=s.step%4;s.age=7+Math.floor(s.step/4);s.year=(s.originYear||2026)+Math.floor(s.step/4);s.pending=null;s.lastResult=result;s.offers=s.offers.filter(o=>o.expires>=s.step&&o.status==='active');if(s.loan&&s.step>=s.loan.end){note(s,'租借结束，返回母队',`你完成了在 ${getClub(s.loan.clubId)?.cn||getClub(s.loan.clubId)?.n} 的租借。`,'loan');s.careerMoves.push({step:s.step,age:s.age,kind:'return',from:s.loan.clubId,to:s.clubId});s.loan=null;s.coach=clamp(s.coach-8);}
if(s.contract&&s.step>=s.contract.end){note(s,'合同到期，成为自由球员','双方没有在到期前签下新协议。你可以免费接洽新的俱乐部。','contract');s.contract=null;s.clubId=null;s.loan=null;s.squad=s.age<18?'school':'community';}if(s.age>=40)retire(s,'rest');return result;}
function marketOpenV41(s){return phases[s.quarter].window||!s.contract||s.age<18;}
function eligibleV41(s,c,kind){if(s.retired||s.pending)return'请先完成当前阶段，年初再处理球队事务。';if(s.route!=='football')return'需要先在生涯规划中选择职业足球路线。';if(s.age<9)return'9 岁起可以申请俱乐部基础青训；当前可进行校园与社区足球。';if(kind==='academy'&&s.age>=18)return'成年球员请申请一线队试训。';if(s.age<18&&c.country!==s.nation&&!(s.nation==='China'&&c.country==='China'))return'本模拟中未成年球员只开放本国青训，成年后可前往海外。';if(kind==='loan'&&(!s.contract||s.contract.kind!=='pro'||s.loan))return'租借需要有效职业合同，且当前没有进行中的租借。';if(kind==='loan'&&s.contract.end-s.step<2)return'母队合同剩余不足六个月，请先评估续约。';if(s.loan&&kind!=='loan')return'租借期间请先返回母队，或与俱乐部协商买断。';if(!marketOpen(s))return'当前转会窗口关闭，可在夏季或冬季处理注册。';if(c.id===s.clubId||c.id===s.loan?.clubId)return'你已经效力于这家俱乐部。';return null;}
function trialProbabilityV3(s,c,kind='trial'){c=getClub(c.id||c);const gap=rating(s)-(c.power-(s.age<14?27:s.age<18?20:10));let p=.55+gap/80+s.scouting/700+(s.agent?.quality||0)/500+(kind==='loan'?s.loanSupport/800:0)-(s.injury?.weeks||0)/70;return round(clamp(p,.08,.9),2);}
function offerTerms(s,c,kind){const youth=s.age<18;const wage=youth?round(15+Math.max(0,rating(s)-30)*c.power/65):round(Math.max(160,Math.pow(Math.max(10,rating(s)-26),2.75)*(c.power/75)**1.8/40));const role=youth?'youth':rating(s)>=c.power+1?'star':rating(s)>=c.power-8?'starter':rating(s)>=c.power-17?'rotation':'prospect';const years=youth?2:s.age>=33?1:s.age>=29?2:3;return{wage,years,role,signingBonus:round(wage*(youth?2:8)),appBonus:youth?0:round(wage*.12),goalBonus:youth?0:round(wage*.17),release:round(Math.max(20000,valuation(s)*1.8)),buyout:kind==='loan'?round(valuation(s)*1.2):0,duration:kind==='loan'?4:0,salaryShare:kind==='loan'?60:100};}
function applyClubV41(s,id,kind='trial'){const c=getClub(id);if(!c)return{ok:false,message:'俱乐部不存在。'};if(s.age<18&&kind==='trial')kind='academy';const err=eligible(s,c,kind);if(err)return{ok:false,message:err};if(s.applications.some(a=>a.id===id&&a.step===s.step&&a.kind===kind))return{ok:false,message:'这个阶段已联系过该俱乐部，请等待下个阶段。'};if(s.applications.filter(a=>a.step===s.step).length>=4)return{ok:false,message:'每阶段最多联系四家俱乐部，避免无限重复试训。'};let chance=trialProbability(s,c,kind);let roll=rand(s);const ok=roll<chance;s.applications.push({id,kind,step:s.step,chance,success:ok});if(!ok){note(s,kind==='loan'?'租借接洽未达成':'这次选拔未通过',`${c.cn||c.n} 暂未提供机会。参考成功概率 ${round(chance*100)}%。`,'application',{success:false});apply(s,{confidence:-2});return{ok:false,chance,rolled:true,message:`${c.cn||c.n} 这次没有发出邀请。可以继续提升，或比较其他培养环境。`};}
if(kind!=='loan'&&s.contract?.kind==='pro'){const fee=valuation(s),willing=clamp(.5+(s.coach<35?.2:0)+(s.contract.end-s.step<=4?.2:0)+(s.transferListed?.2:0)-(s.contract.role==='star'?.2:0),.15,.88);if(rand(s)>willing&&fee<s.contract.release){note(s,'母队拒绝转会接洽',`${c.cn||c.n} 表达了兴趣，但母队不愿在这个阶段放行。`,'transfer');return{ok:false,chance:willing,rolled:true,message:'新球队有兴趣，但母队拒绝放行。可以申请挂牌、等待合同末期，或在解约金范围内继续谈判。'};}}
if(kind==='loan'&&rand(s)>clamp(.65+s.loanSupport/400-(s.contract.role==='star'?.35:0),.2,.9)){note(s,'母队暂不同意外租','俱乐部希望你继续留队竞争，租借安排暂时没有获得批准。','loan');return{ok:false,rolled:true,message:'租借目的地愿意接洽，但母队暂不同意外租。'};}
const terms=offerTerms(s,c,kind);if(kind==='loan'){terms.wage=s.contract.wage;terms.appBonus=s.contract.appBonus;terms.goalBonus=s.contract.goalBonus;terms.release=s.contract.release;terms.signingBonus=0;terms.duration=s.contract.end-s.step>=4?4:2;}const offer={id:'offer'+s.nextId++,clubId:id,kind:s.age<18?'academy':kind,created:s.step,expires:s.step,status:'active',chance,transferFee:kind!=='loan'&&s.contract?.kind==='pro'?Math.min(s.contract.release,valuation(s)):0,terms,base:JSON.parse(JSON.stringify(terms)),attempts:0};s.offers.unshift(offer);note(s,'一份可以认真比较的邀请',`${c.cn||c.n} 发来了${kind==='loan'?'租借意向':s.age<18?'青训培养邀请':'职业合同意向'}。你可以审阅条款，接受或提出反报价。`,'offer');return{ok:true,chance,offer,message:'已收到正式意向，请到「合同与经纪」查看、谈判和签约。'};}
function negotiationChanceV3(s,o,t){const wageRatio=t.wage/Math.max(1,o.base.wage);const roleRank={youth:0,prospect:1,rotation:2,starter:3,star:4};return round(clamp(.82-(wageRatio-1)*.65-Math.max(0,(roleRank[t.role]||0)-(roleRank[o.base.role]||0))*.14-Math.max(0,t.years-o.base.years)*.05-Math.max(0,1-t.release/Math.max(1,o.base.release))*.12+(s.agent?.quality||0)/650+s.knowledge/850-(o.kind==='loan'?Math.max(0,t.salaryShare-o.base.salaryShare)/300+Math.max(0,t.duration-o.base.duration)*.035:0),.12,.9),2);}
function negotiate(s,id,proposal,confirm=false){const o=s.offers.find(x=>x.id===id&&x.status==='active');if(!o||o.expires<s.step)return{ok:false,message:'意向已过期。'};if(s.pending)return{ok:false,message:'完成当前阶段后再处理谈判。'};const t={...o.terms,wage:round(clamp(Number(proposal.wage)||o.terms.wage,0,o.base.wage*3)),years:clamp(round(Number(proposal.years)||o.terms.years),1,s.age<18?2:5),role:roles[proposal.role]?proposal.role:o.terms.role,release:round(clamp(Number(proposal.release)||o.terms.release,o.base.release*.35,o.base.release*3)),duration:[2,4].includes(Number(proposal.duration))?Number(proposal.duration):o.terms.duration,salaryShare:clamp(Number(proposal.salaryShare)||o.terms.salaryShare,10,100)};if(o.kind==='loan'){t.duration=Math.min(t.duration,s.contract.end-s.step>=4?4:2);t.release=s.contract.release;t.wage=s.contract.wage;t.role=proposal.role==='youth'?'rotation':t.role;t.years=o.terms.years;}const chance=negotiationChance(s,o,t);if(!confirm)return{ok:true,preview:true,chance,terms:t};if(o.attempts>=2)return{ok:false,message:'本意向最多两次反报价，可接受现有条款或放弃。'};o.attempts++;if(o.kind!=='academy'&&o.kind!=='promotion')t.squad=t.role==='prospect'?'reserves':'first';if(rand(s)<chance){o.terms=t;note(s,'反报价获得接受',`${getClub(o.clubId)?.cn||getClub(o.clubId)?.n} 同意调整条款。`,'contract');return{ok:true,chance,message:'俱乐部接受了反报价，新条款已写入意向。'};}note(s,'反报价未获接受','对方保留原有条款，没有接受这次调整。','contract');return{ok:false,chance,message:'对方没有接受反报价，原意向仍然有效。'};}
function signV3(s,id){const o=s.offers.find(x=>x.id===id&&x.status==='active');if(!o||o.expires<s.step||s.pending||s.retired)return{ok:false,message:'意向已过期或当前不可办理。'};const c=getClub(o.clubId),t=o.terms,from=s.clubId,transferFee=s.contract?.kind==='pro'&&o.kind!=='renewal'?(o.transferFee??valuation(s)):0,firstPro=!s.careerMoves.some(m=>['free','transfer','renewal'].includes(m.kind));if(o.kind==='loan'){if(!s.contract||s.loan)return{ok:false,message:'当前已不符合租借条件。'};s.loan={squad:t.squad||'first',clubId:c.id,start:s.step,end:Math.min(s.step+t.duration,s.contract.end),role:t.role,salaryShare:t.salaryShare,buyout:t.buyout,parentId:s.clubId};s.careerMoves.push({step:s.step,age:s.age,kind:'loan',from:s.clubId,to:c.id});note(s,'租借协议已生效',`${c.cn||c.n}，租期 ${s.loan.end-s.step} 个季度。母队合同保持有效；租借球队承担 ${t.salaryShare}% 薪资。`,'loan');}else{s.loan=null;s.clubId=c.id;s.squad=t.squad||(s.age<18?'academy':t.role==='prospect'?'reserves':'first');s.contract={squad:s.squad,youthRole:t.youthRole||'starter',clubId:c.id,kind:s.age<18?'academy':'pro',start:s.step,end:s.step+t.years*4,wage:t.wage,role:t.role,signingBonus:t.signingBonus,appBonus:t.appBonus,goalBonus:t.goalBonus,release:t.release,promisedRole:t.role};const agentFee=round(t.signingBonus*(s.agent?.fee||0)/100);s.cash+=t.signingBonus-agentFee;s.careerMoves.push({step:s.step,age:s.age,kind:o.kind==='promotion'?'promotion':o.kind==='renewal'?'renewal':s.age<18?'academy':from?'transfer':'free',from,to:c.id,fee:from?transferFee:0});note(s,o.kind==='renewal'?'完成续约':s.age<18?'加入新的青训梯队':'正式签下职业合同',`${c.cn||c.n} · ${t.years} 年 · 周薪 €${t.wage} · ${roles[t.role]}。`,'contract');}s.coach=clamp(45+(rating(s)-c.power)/2,30,70);s.adaptability=clamp(s.adaptability-(c.country!==s.nation?8:2));o.status='signed';s.offers=s.offers.filter(x=>x.id===id);s.transferListed=false;if(o.kind==='renewal')s.lastRenewal=s.step;if(o.kind!=='promotion'&&(o.kind!=='renewal'||firstPro&&s.age>=18)){s.storyQueue=s.storyQueue||[];const scene=o.kind==='loan'?'loanarrival':s.age<18?'academyarrival':firstPro?'firstprofessional':'clubarrival';if(!s.storyQueue.includes(scene))s.storyQueue.push(scene);}return{ok:true,message:o.kind==='loan'?'租借生效，回归日期已记录。':'合同签署完成。'};}
function renewalV41(s){if(!s.clubId||!s.contract||s.loan||s.pending||s.retired)return{ok:false,message:'需要有效合同且当前不在租借或阶段事件中。'};if(s.offers.some(o=>o.kind==='renewal'&&o.created===s.step))return{ok:false,message:'本阶段已经发起续约，请查看现有意向。'};if(s.renewalAttempt===s.step)return{ok:false,message:'本阶段已沟通过续约，请下阶段再评估。'};if(Number.isInteger(s.lastRenewal)&&s.step-s.lastRenewal<4)return{ok:false,message:'新续约生效未满一年，俱乐部暂不重谈。'};s.renewalAttempt=s.step;const c=getClub(s.clubId),chance=clamp(.7+(rating(s)-c.power)/100+(s.coach-50)/250,.1,.9);if(rand(s)>chance){note(s,'续约谈判暂缓','俱乐部希望继续观察表现，暂未发出新的条款。','contract');return{ok:false,message:'俱乐部暂不准备续约，可在后续阶段再沟通。'};}const terms=offerTerms(s,c,'renewal');s.offers.unshift({id:'offer'+s.nextId++,clubId:c.id,kind:'renewal',created:s.step,expires:s.step,status:'active',chance,terms,base:JSON.parse(JSON.stringify(terms)),attempts:0});return{ok:true,message:'续约意向已生成，请审阅条款。'};}
function transferRequest(s){if(!s.contract||s.loan||s.pending)return{ok:false,message:'当前无法提出转会请求。'};if(s.transferListed)return{ok:false,message:'已经提出过转会请求。'};if(s.transferAttempt===s.step)return{ok:false,message:'本阶段已经提出过转会诉求。'};s.transferAttempt=s.step;const p=clamp(.55+(s.coach<45?.2:0)+(s.contract.end-s.step<=4?.15:0),.15,.9);if(rand(s)<p){s.transferListed=true;apply(s,{coach:-4});note(s,'俱乐部同意听取转会报价','母队愿意评估合理报价，最终放行仍取决于谈判。','transfer');return{ok:true,message:'已获准听取转会报价，母队放行概率提高。'};}apply(s,{coach:-6});return{ok:false,message:'球队暂不同意挂牌，关系受到一些影响。'};}
function recall(s){if(!s.loan||s.pending)return{ok:false,message:'当前没有可以协商的租借。'};if(s.recallAttempt===s.step)return{ok:false,message:'本阶段已协商过提前回归。'};s.recallAttempt=s.step;const chance=clamp(.5+(s.coach<40?.2:0)+s.knowledge/500,.25,.85);if(rand(s)<chance){const from=s.loan.clubId;s.loan=null;s.coach=45;s.careerMoves.push({step:s.step,age:s.age,kind:'recall',from,to:s.clubId});note(s,'提前结束租借','三方达成一致，你提前回到了母队。','loan');return{ok:true,message:'提前回归已达成一致。'};}return{ok:false,message:'三方没有达成一致，需要继续履行当前租借。'};}
function buyout(s){if(!s.loan?.buyout||s.pending)return{ok:false,message:'当前没有可执行的买断条款。'};const c=getClub(s.loan.clubId),chance=clamp(.52+(rating(s)-c.power)/100+(s.coach-45)/250,.18,.88);if(s.buyoutAttempt===s.step)return{ok:false,message:'本阶段已协商过买断。'};s.buyoutAttempt=s.step;if(rand(s)>chance)return{ok:false,message:'租借球队暂不愿支付约定买断费用。'};const fee=s.loan.buyout,from=s.clubId,terms=offerTerms(s,c,'transfer');s.offers.unshift({id:'offer'+s.nextId++,clubId:c.id,kind:'buyout',created:s.step,expires:s.step,status:'active',transferFee:fee,terms,base:JSON.parse(JSON.stringify(terms)),attempts:0});note(s,'买断费用达成一致',`两家俱乐部就 €${fee} 买断费用达成一致，个人合同仍需你审阅签署。`,'loan');s.buyoutFrom=from;return{ok:true,message:'买断个人合同已进入意向列表。'};}
function hireAgent(s,tier){if(s.age<16||s.retired||s.pending)return{ok:false,message:'16 岁起可在阶段开始时聘请经纪团队。'};const options={local:{name:'本地成长顾问',quality:32,fee:3,cost:150},professional:{name:'职业经纪团队',quality:64,fee:6,cost:1500},elite:{name:'国际经纪团队',quality:88,fee:9,cost:7000}};const a=options[tier];if(!a)return{ok:false,message:'未知经纪团队。'};if(s.cash<a.cost)return{ok:false,message:'个人储蓄不足以支付签约服务费用。'};if(s.agent?.name===a.name)return{ok:false,message:'已与该团队合作。'};s.cash-=a.cost;s.agent={...a,tier};note(s,'经纪合作建立',`${a.name} · 收入佣金 ${a.fee}% · 服务费 €${a.cost}。`,'agent');return{ok:true,message:'经纪团队已签约，试训接洽和谈判能力获得加成。'};}
function route(s,value){if(s.pending||s.retired||s.age<16||!['football','study','community'].includes(value))return{ok:false,message:'16 岁起可以在阶段开始时调整人生路线。'};if(value!=='football'&&s.contract)return{ok:false,message:'请先履行完合同或协商解约，再离开职业路线。'};s.route=value;note(s,'重新选择生活重心',value==='football'?'你重新以职业足球为目标。':value==='study'?'你选择学业、工作与校园足球。':'你选择家庭与社区足球。','route');return{ok:true,message:'人生重心已调整。'};}
function release(s){if(!s.contract||s.pending||s.loan)return{ok:false,message:'当前不符合协商解约条件。'};if(s.releaseAttempt===s.step)return{ok:false,message:'本阶段已提出过协商解约。'};s.releaseAttempt=s.step;const p=clamp(.55+(s.coach<40?.2:0)+(s.contract.end-s.step<5?.15:0),.2,.9);if(rand(s)>p){apply(s,{coach:-4});return{ok:false,message:'球队暂不同意协商解约。'};}note(s,'双方协商解除合同','你成为自由球员，未来的选择重新打开。','contract');s.clubId=null;s.contract=null;s.squad=s.age<18?'school':'community';s.transferListed=false;return{ok:true,message:'协商解约完成。'};}
function changePosition(s,pos){if(!positions[pos]||s.pending||s.retired)return{ok:false,message:'当前无法调整位置。'};if(s.pos===pos)return{ok:false,message:'这已经是你的当前场上位置。'};const chance=clamp(.55+s.versatility/230+(s.age<18?.1:0),.3,.85);if(s.positionAttempt===s.step)return{ok:false,message:'每阶段只进行一次位置适应尝试。'};s.positionAttempt=s.step;if(rand(s)<chance){s.pos=pos;apply(s,{form:-4,versatility:4});note(s,'完成位置调整',`新的主位置：${positions[pos]}。短期状态需要重新适应。`,'tactics');return{ok:true,message:'位置调整成功，综合能力按新职责重新评估。'};}apply(s,{confidence:-3});return{ok:false,message:'这次适应没有成功，需要更多专项准备。'};}
function retireV3(s,path='rest'){if(s.retired)return{ok:false,message:'这段生涯已经封存。'};if(s.pending)return{ok:false,message:'请先完成当前阶段。'};const check={coach:[s.coaching>=35&&s.education>=55,'教练路线需要执教准备 ≥35、学业 ≥55。'],academy:[s.cash>=60000&&s.coaching>=20,'创办青训需要 €60,000 储蓄、执教准备 ≥20。'],media:[s.reputation>=25||s.education>=70,'评论员需要声望 ≥25 或学业 ≥70。'],rest:[true,'']};if(s.age<18)return{ok:false,message:'18 岁起可以主动结束球员生涯。'};if(!check[path]?.[0])return{ok:false,message:check[path]?.[1]||'未知退役路线。'};if(path==='academy')s.cash-=60000;s.retired=true;s.pending=null;const job={coach:'足球教练',academy:'青训创办人',media:'足球评论员',rest:s.education>70?'体育教育与生活':'回归生活与家庭'}[path];const ending=s.route==='study'?'另一种成功的答案':s.stats.apps>550&&s.reputation>65?'一个时代的球员':s.careerMoves.filter(x=>x.kind==='transfer').length>=4?'行走世界的足球旅人':s.achievements.length>=5?'那些闪亮的冠军年代':s.careerMoves.some(x=>x.kind==='loan')&&s.stats.apps>250?'从外租到站稳脚跟':s.clubId&&s.history.filter(x=>x.clubId===s.clubId).length>=36?'一座城，一段漫长的忠诚':s.stats.caps>=40?'身披国旗的追梦人':s.family>=85?'把热爱安放在生活里':s.stats.apps>=150?'每一分钟，都曾认真踢过':'足球，始终是人生的一部分';s.ending={title:ending,job,path,age:s.age,step:s.step};note(s,'终场哨响，另一段人生开始',`${ending}。下一站：${job}。`,'retirement');return{ok:true,message:'球员生涯已完整记录。'};}
function migrate(old){if(!old||old.v!==1)return null;const s=start({name:old.name,nation:old.nation,pos:positions[old.pos]?old.pos:'CM',difficulty:old.difficulty});s.age=clamp(old.age,7,40);s.step=(s.age-7)*4;s.quarter=0;s.year=2026+s.age-7;s.attrs.technique=old.attrs.tech;s.attrs.finishing=old.attrs.shoot;s.attrs.passing=old.attrs.pass;s.attrs.vision=old.attrs.mental;s.attrs.pace=old.attrs.pace;s.attrs.acceleration=old.attrs.pace;s.attrs.strength=old.attrs.stamina;s.attrs.stamina=old.attrs.stamina;s.attrs.tackling=old.attrs.defend;s.attrs.positioning=old.attrs.mental;s.attrs.reflexes=old.attrs.keep;s.attrs.handling=old.attrs.keep;s.attrs.composure=old.attrs.mental;s.cash=old.cash;s.totalEarnings=old.totalEarnings||0;s.route=['football','study','community'].includes(old.route)?old.route:'football';s.familyType=old.family||'ordinary';s.family=old.relation;s.education=old.education;s.reputation=old.fame;s.health=old.health;s.motivation=old.happy;s.body.h=round(s.body.h+(Math.min(s.age,20)-7)*4.2,1);s.body.h=Math.min(s.body.h,s.body.adultH);s.body.w=round((s.age<18?19:22)*(s.body.h/100)**2,1);s.growth=[{step:s.step,age:s.age,h:s.body.h,w:s.body.w}];if(old.club&&getClub(old.club.id)){s.clubId=old.club.id;const terms=offerTerms(s,getClub(s.clubId),'trial');s.contract={clubId:s.clubId,kind:s.age<18?'academy':'pro',start:s.step,end:s.step+8,...terms};}s.stats.apps=old.apps;s.stats.goals=old.goals;s.stats.assists=old.assists;s.stats.caps=old.caps;s.stats.nationalGoals=old.nationalGoals;s.bestRating=old.best||rating(s);note(s,'从旧版生涯继续前进','已迁移姓名、年龄、能力、球队与累计成绩。新版从当前年龄的夏季开始，合同与身体档案按新规则初始化。','migration');if(old.retired){s.retired=true;s.ending={title:old.ending||'一段完整的足球人生',job:old.job||'享受生活',path:'rest',age:s.age,step:s.step};}return s;}
function legacyValidate(x){const finite=(v,a=0,b=1e15)=>Number.isFinite(v)&&v>=a&&v<=b;const text=(v,n=500)=>typeof v==='string'&&v.length<=n;if(!x||x.v!==2||!text(x.name,18)||!Number.isInteger(x.step)||x.step<0||x.step>132||x.age!==7+Math.floor(x.step/4)||x.quarter!==x.step%4||x.year!==(x.originYear||2026)+Math.floor(x.step/4)||!Number.isInteger(x.seed)||!x.seed||!positions[x.pos]||!training[x.training]||!['normal','high','low'].includes(x.intensity)||!['football','study','community'].includes(x.route)||!Object.keys(attrs).every(k=>finite(x.attrs?.[k],1,99)))return false;if(!['coach','health','fatigue','form','confidence','motivation','family','education','discipline','friendship','adaptability','leadership','loyalty','knowledge','network','scouting','reputation','nationalRep','coaching','weakFoot','coordination','versatility','loanSupport'].every(k=>finite(x[k],0,100)))return false;if(!['balanced','study','discipline','family','social'].includes(x.life)||!['balanced','strength','agility'].includes(x.nutrition)||!['right','left','both'].includes(x.foot)||!['relaxed','normal','hard'].includes(x.difficulty)||typeof x.retired!=='boolean'||!text(x.nation,100)||!['early','normal','late'].includes(x.body?.maturity)||!finite(x.body?.lastH,0,20)||!finite(x.body?.lastW,-20,20))return false;if(x.storyQueue&&(!Array.isArray(x.storyQueue)||x.storyQueue.length>30||!x.storyQueue.every(id=>EVENTS.some(e=>e.id===id))))return false;if(!finite(x.cash)||!finite(x.totalEarnings)||!finite(x.nextId,1)||!finite(x.body?.h,105,215)||!finite(x.body?.w,15,150)||!finite(x.body?.adultH,150,215))return false;if(!x.stats||!['apps','goals','assists','cleanSheets','youthApps','caps','nationalGoals'].every(k=>finite(x.stats[k]))||!x.season||!['apps','goals','assists','youthApps','cleanSheets','minutes','matchRating','salary'].every(k=>finite(x.season[k]))||!finite(x.bestRating,0,99))return false;if(!Array.isArray(x.growth)||!x.growth.every(v=>finite(v.step,0,132)&&finite(v.age,7,40)&&finite(v.h,105,215)&&finite(v.w,15,150)))return false;if(x.injury&&(!text(x.injury.name,100)||!finite(x.injury.weeks,0,100)||!finite(x.injury.initial,0,100)))return false;if(!['history','growth','log','achievements','offers','applications','careerMoves'].every(k=>Array.isArray(x[k])&&x[k].length<2000))return false;if(!x.log.every(v=>text(v.title,250)&&text(v.text,1500)&&finite(v.age,7,40)&&finite(v.step,0,132)))return false;if(!x.history.every(v=>finite(v.step,0,132)&&finite(v.age,7,40)&&finite(v.rating,1,99)))return false;if(x.clubId&&!clubs.has(x.clubId))return false;if(x.history.some(h=>!['year','quarter','apps','goals','assists','cleanSheets','salary','bonuses','tax','expenses','matchRating','height','weight','dh','dw'].every(k=>finite(h[k],['dw','dh'].includes(k)?-20:0))||typeof h.professional!=='boolean'||!text(h.club,250)||!Array.isArray(h.fixtures)||h.fixtures.some(f=>!clubs.has(f.a)||!clubs.has(f.b)||!['ga','gb','round'].every(k=>finite(f[k],0,100)))))return false;if(x.achievements.some(a=>!text(a.title,250)||!finite(a.year,x.originYear||2026,(x.originYear||2026)+33)||!finite(a.age,7,40)))return false;if(x.careerMoves.some(m=>!finite(m.age,7,40)||!text(m.kind,30)||!clubs.has(m.to)))return false;if(!x.leagues||typeof x.leagues!=='object'||Array.isArray(x.leagues)||Object.values(x.leagues).some(l=>!Array.isArray(l.teams)||l.teams.length>24||l.teams.some(t=>!clubs.has(t.id)||!['power','p','w','d','l','gf','ga','pts'].every(k=>finite(t[k],0,10000)))||!Array.isArray(l.schedule)||!Array.isArray(l.results)||!finite(l.round,0,l.schedule.length)))return false;if(x.contract&&(!['academy','pro'].includes(x.contract.kind)||x.contract.clubId!==x.clubId||!['start','appBonus','goalBonus','release','signingBonus'].every(k=>finite(x.contract[k]))||!clubs.has(x.contract.clubId)||!finite(x.contract.end,0,160)||!finite(x.contract.wage)||!roles[x.contract.role]))return false;if(x.loan&&(!x.contract||!['start','salaryShare','buyout'].every(k=>finite(x.loan[k]))||!clubs.has(x.loan.clubId)||!finite(x.loan.end,0,160)||!roles[x.loan.role]))return false;if(x.offers.some(o=>!/^offer\d+$/.test(o.id)||!['academy','trial','loan','renewal','buyout','promotion'].includes(o.kind)||!['active','signed','declined','expired'].includes(o.status)||!['created','expires','attempts'].every(k=>finite(o[k]))||!['appBonus','goalBonus','signingBonus','release','buyout','duration','salaryShare'].every(k=>finite(o.terms?.[k]))||!o.base||!finite(o.base.wage)||!clubs.has(o.clubId)||!finite(o.terms?.wage)||!finite(o.terms?.years,1,5)||!roles[o.terms?.role]))return false;if(x.pending){const p=x.pending;if(p.kind==='event'){if(!Array.isArray(p.queue)||!p.queue.every(id=>EVENTS.some(e=>e.id===id))||!Number.isInteger(p.index)||p.index<0||p.index>=p.queue.length)return false;}else if(p.kind==='match'){if(!Number.isInteger(p.round)||p.round<0||p.round>=3||!Array.isArray(p.score)||p.score.length!==2||!p.score.every(v=>finite(v,0,20)))return false;}else return false;}return true;}
/* V3 career flow: quarter accounting, curated decisions and separate squad tiers. */
function upgradeV3(s){
 if(!s||s.v!==2)return s;
 s.edition=3;s.pace=['highlights','quarterly'].includes(s.pace)?s.pace:'highlights';s.focus=['growth','minutes','income','platform','home'].includes(s.focus)?s.focus:'growth';
 s.turns=s.turns||0;s.eventMemory=s.eventMemory||{};s.sceneMemory=s.sceneMemory||[];s.invitationMemory=s.invitationMemory||[];s.stats.schoolApps=s.stats.schoolApps||0;s.stats.reserveApps=s.stats.reserveApps||0;s.stats.youthCaps=s.stats.youthCaps||0;s.stats.youthNationalGoals=s.stats.youthNationalGoals||0;
 if(!['school','community','academy','reserves','first'].includes(s.squad)){s.squad=!s.clubId?(s.age<18?'school':'community'):s.contract?.kind==='academy'?'academy':s.contract?.role==='prospect'?'reserves':'first';}
 if(s.pending&&!s.pending.flowVersion)s.pending.legacy=true;
 return s;
}
function startV3(c={}){const s=upgrade(legacyStart(c));s.pace=c.pace==='quarterly'?'quarterly':'highlights';s.focus=['growth','minutes','income','platform','home'].includes(c.focus)?c.focus:'growth';return s;}
function squadTier(s){if(!activeClub(s))return s.age<18&&s.route!=='community'?'school':'community';if(s.loan)return s.loan.squad||'first';if(s.contract?.kind==='academy')return s.squad==='first'&&s.age>=16?'first':'academy';return s.squad==='reserves'||s.contract?.role==='prospect'&&s.squad!=='first'?'reserves':'first';}
function competitionContext(s){
 const tier=squadTier(s),club=activeClub(s),u=s.age<=9?'U10':s.age<=11?'U12':s.age<=13?'U14':s.age<=15?'U16':'U18';
 const info={school:{label:s.age<12?'校园与启蒙足球':'校园年龄组赛事',suffix:s.age<12?'校园队':'校队',name:'校园足球邀请赛',professional:false},community:{label:'社区与业余足球',suffix:'社区队',name:'城市业余联赛',professional:false},academy:{label:u+' 青训梯队',suffix:u,name:u+' 青训发展联赛',professional:false},reserves:{label:'预备队 / U21',suffix:'预备队',name:'预备队发展联赛',professional:false},first:{label:'职业一线队',suffix:'',name:(club?.league==='CL1'?'中甲':club?.league==='CSL'?'中超':club?.country==='England'?'国内职业':'国内模拟')+'联赛',professional:true}}[tier];
 return{tier,...info,ageGroup:tier==='academy'?u:null,team:club?(club.cn||club.n)+(info.suffix?' '+info.suffix:''):tier==='school'?'你的校园队':'你的社区队'};
}
function arcSpan(s){
 if(s.pace==='quarterly')return 1;const base=s.age<14?4:s.age<24?2:s.age<35?4:2;
 const boundary=[11,14,16,18,22,30,35,40].find(age=>age>s.age),untilStage=boundary?(boundary-7)*4-s.step:132-s.step;
 let span=Math.min(base,4-s.quarter,untilStage,132-s.step);
 if(s.contract&&s.contract.end>s.step)span=Math.min(span,s.contract.end-s.step);
 if(s.loan&&s.loan.end>s.step)span=Math.min(span,s.loan.end-s.step);
 if(s.injury)span=Math.min(span,2);return Math.max(1,span);
}
function arcLabel(s){const count=s.currentArc?.span||arcSpan(s);return count===4?'这一年':count===3?'这九个月':count===2?'这半年':'这一季';}
function contextOK(s,e){
 const tier=squadTier(s);if(e.squads&&!e.squads.includes(tier))return false;
 if(e.context==='school')return tier==='school';if(e.context==='community')return tier==='community'||tier==='school';if(e.context==='academy')return tier==='academy';if(e.context==='reserves')return tier==='reserves';if(e.context==='first')return tier==='first';if(e.context==='free')return !s.clubId&&s.age>=16;
 return e.context==='any'||e.context==='club'&&!!s.clubId||e.context==='loan'&&!!s.loan||e.context==='injured'&&!!s.injury||e.context==='keeper'&&s.pos==='GK'||e.context==='foreign'&&!!activeClub(s)&&activeClub(s).country!==s.nation;
}
function prepareV3(s){
 upgrade(s);if(s.retired||s.pending)return false;
 const arrival=new Set(['academyarrival','loanarrival','firstprofessional','clubarrival']);
 let pool=EVENTS.filter(e=>!e.id.startsWith('v4_int_')&&s.age>=e.min&&s.age<=e.max&&contextOK(s,e));
 if(s.route!=='football')pool=pool.filter(e=>e.context==='school'||e.context==='community'||e.family&&['education','family','retirement','relationships','work','learning','future','finance','media','mentoring','identity'].includes(e.family)||['homework','schoolfinal','familybudget','campus','love','finances','coaching','nutrition','parenthood','insurance','localhero','latebalance'].includes(e.id));
 const recent=s.log.filter(x=>x.type==='event').slice(0,2),used=new Set(s.log.filter(x=>x.type==='event').map(x=>x.eventId));
 let event=null;while(s.storyQueue.length&&!event){const id=s.storyQueue.shift(),e=pool.find(e=>e.id===id);if(e&&!used.has(id))event=e;}
 if(!event){let fresh=pool.filter(e=>!used.has(e.id)&&!recent.some(r=>r.family&&r.family===e.family));if(!fresh.length)fresh=pool.filter(e=>!used.has(e.id));if(!fresh.length)fresh=pool.filter(e=>!e.once&&!arrival.has(e.id)).sort((a,b)=>(s.eventMemory[a.id]?.last??-999)-(s.eventMemory[b.id]?.last??-999)).slice(0,Math.max(1,Math.floor(pool.length/3)));if(!fresh.length)return false;const expanded=fresh.filter(e=>e.id.startsWith('v3_'));event=choose(s,expanded.length&&rand(s)<.85?expanded:fresh);}
 s.currentArc={start:s.step,span:arcSpan(s),tier:squadTier(s),rating:rating(s),height:s.body.h,weight:s.body.w};
 s.pending={kind:'event',queue:[event.id],index:0,outcome:null,flowVersion:3};return true;
}
function chooseEventV3(s,index){
 const p=s.pending;if(p?.kind!=='event'||p.outcome)return null;const e=currentEvent(s),c=e?.choices[index];if(!c||c.cost?.cash<0&&s.cash<-c.cost.cash)return null;
 const chance=eventProbability(s,c),roll=rand(s),success=roll<chance;apply(s,c.cost);apply(s,success?c.good:c.bad);
 const follow=c.follow?.[success?'success':'failure'];if(follow&&EVENTS.some(e=>e.id===follow)&&!s.storyQueue.includes(follow))s.storyQueue.push(follow);
 p.outcome={title:e.title,eventId:e.id,choice:c.label,chance,roll:round(roll,4),success,text:success?c.success:c.failure,effects:success?c.good:c.bad,cost:c.cost};
 s.eventMemory[e.id]={count:(s.eventMemory[e.id]?.count||0)+1,last:s.step};note(s,e.title,p.outcome.text,'event',{eventId:e.id,family:e.family||null,choice:c.label,success,chance});return p.outcome;
}
function nextV3(s){
 const p=s.pending;if(!p)return null;
 if(p.kind==='event'&&p.outcome){p.index++;p.outcome=null;if(p.index<p.queue.length)return 'event';
  if(s.route==='football'&&!s.injury&&rand(s)<(s.pace==='quarterly'?.48:.76)){setupMatch(s);return 'match';}return finish(s);
 }
 if(p.kind==='match'&&p.outcome){p.round++;p.outcome=null;if(p.round<(p.roundTotal||3))return 'match';return finish(s);}return null;
}
function leagueKey(s){const c=activeClub(s);if(!c)return null;const ctx=competitionContext(s);return s.year+':'+c.country+':'+(c.current?c.league+':':'')+ctx.tier+':'+(ctx.ageGroup||'open');}
function ensureLeague(s){
 const c=activeClub(s);if(!c)return null;const key=leagueKey(s);let l=s.leagues[key];if(l&&l.teams.some(t=>t.id===c.id))return l;
 const ctx=competitionContext(s),all=D.clubs.filter(x=>x.country===c.country&&x.id!==c.id&&(c.current&&c.country==='China'?x.current&&x.league===c.league:x.source==='tm'||c.source==='of'&&x.historical));
 const limit=ctx.tier==='first'?(c.country==='China'&&c.current?15:19):11;
 const candidates=all.map(x=>getClub(x.id)).sort((a,b)=>Math.abs(a.power-c.power)-Math.abs(b.power-c.power)).slice(0,limit);let ids=[c,...candidates];if(ids.length<2)return null;if(ids.length%2)ids.pop();
 const scale=ctx.tier==='academy'?Math.max(.35,.35+(s.age-7)*.035):ctx.tier==='reserves'?.82:1;
 l={key,year:s.year,youth:ctx.tier!=='first',tier:ctx.tier,suffix:ctx.suffix,label:ctx.name,teams:ids.map(x=>({id:x.id,power:round(x.power*scale),p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0})),round:0,schedule:calendar(ids),results:[]};s.leagues[key]=l;
 const prior=Math.floor(l.schedule.length*s.quarter/4);while(l.round<prior)simulateRound(s,l,null);return l;
}
function setupMatchV3(s){
 const ctx=competitionContext(s),club=activeClub(s),league=ensureLeague(s);let rival=null,home=club?.id||null,away=null;
 if(league){const round=league.schedule[Math.min(league.round,league.schedule.length-1)],pair=round?.find(pair=>pair.includes(club.id));if(pair){[home,away]=pair;rival=getClub(pair.find(id=>id!==club.id));}}
 const role=s.loan?.role||s.contract?.role,substitute=ctx.tier==='first'&&['rotation','prospect'].includes(role),situation=substitute?'substitute':choose(s,['opening','level','behind','ahead','pressure']);
 let pool=(g.CAREER_MATCH_SCENES||[]).filter(x=>x.levels.includes(ctx.tier)&&x.positions.includes(s.pos));
 let recent=new Set(s.sceneMemory.slice(-8)),fresh=pool.filter(x=>!recent.has(x.id));if(fresh.length<2)fresh=pool;
 const fitting=fresh.filter(x=>x.situation===situation);let first=choose(s,fitting.length?fitting:fresh);const selected=[first];const remaining=fresh.filter(x=>x.id!==first.id);
 if(remaining.length&&!substitute&&rand(s)<.4)selected.push(choose(s,remaining));
 const score=situation==='behind'?[0,1]:situation==='ahead'?[1,0]:situation==='substitute'?choose(s,[[0,1],[1,1],[1,0]]):[0,0];
 const opponent=rival?(rival.cn||rival.n)+(ctx.suffix?' '+ctx.suffix:''):choose(s,ctx.tier==='school'?['东河小学同龄队','北岸校园联队','市少年足球队','南桥学校年龄组']:['城北社区队','海湾业余联队','工人体育社团']);
 s.pending={kind:'match',flowVersion:3,round:0,roundTotal:selected.length,sceneIds:selected.map(x=>x.id),situation,score,home,away,rivalId:rival?.id||null,opponent,boost:0,plays:[],outcome:null,clubId:club?.id||null,ownHome:!club||home===club.id,tier:ctx.tier,competition:ctx.name,teamName:ctx.team,minute:substitute?65+Math.floor(rand(s)*16):10+Math.floor(rand(s)*65)};
 s.sceneMemory.push(...s.pending.sceneIds);if(s.sceneMemory.length>40)s.sceneMemory=s.sceneMemory.slice(-40);
}
function matchOptionsV3(s){
 const p=s.pending;if(p?.kind!=='match')return null;
 let scene=p.sceneIds&&(g.CAREER_MATCH_SCENES||[]).find(x=>x.id===p.sceneIds[p.round]);
 if(!scene){const bank=s.pos==='GK'?keeperPlays:['CB','DM','FB'].includes(s.pos)?defensePlays:fieldPlays;scene=bank[p.round%3];}
 const rival=getClub(p.rivalId),ctx=competitionContext(s),relative=ctx.tier==='academy'?rating(s)-(rival?.power||50)+28:ctx.tier==='reserves'?rating(s)-(rival?.power||55)+9:rating(s)-(rival?.power||rating(s));
 return{...scene,title:p.sceneIds?(p.minute+p.round*14)+'′ · '+scene.title:scene.title,options:scene.options.map(o=>({...o,chance:round(clamp(o.base+((s.attrs[o.key]??s[o.key]??50)-50)/230+(s.form-60)/500-(s.fatigue-20)/700+(s.coordination-70)/650+relative/420+(s.difficulty==='relaxed'?.045:s.difficulty==='hard'?-.05:0),.15,.9),2)}))};
}
function playV3(s,index){
 const p=s.pending;if(p?.kind!=='match'||p.outcome)return null;const o=matchOptions(s)?.options[index];if(!o)return null;
 const chance=o.chance,roll=rand(s),success=roll<chance;let scored=0,conceded=0;
 if(success){p.boost++;if(s.pos!=='GK'&&(o.attack||0)>0&&rand(s)<(o.attack||0)*.43){scored=1;p.score[0]++;}}
 else if(rand(s)<clamp(.18+(typeof o.risk==='number'?o.risk*.8:.12)+(s.pos==='GK'?.22:0)-(o.defend||0)*.1,.12,.64)){conceded=1;p.score[1]++;}
 if(o.load)apply(s,{fatigue:o.load});apply(s,success?{coach:.8,confidence:.8}:{confidence:-.6});
 p.outcome={success,chance,roll:round(roll,4),title:success?'你的处理创造了价值':'这个回合没有按预想发展',text:(success?o.goodText:o.badText)||(success?'你完成了自己的职责，球队局面有所改善。':'对手作出了更好的应对，你需要重新调整。'),choice:o.n,scored,conceded};
 if(scored)p.outcome.text+=' 随后球队完成了进球。';if(conceded)p.outcome.text+=' 对手把握住机会得分。';p.plays.push(p.outcome);return p.outcome;
}
function autoMatch(s){
 const p=s.pending;if(p?.kind!=='match'||p.outcome)return{ok:false,message:'当前没有待处理的比赛回合。'};
 const count=p.roundTotal||3;while(p.round<count){const options=matchOptions(s).options;let best=0;for(let i=1;i<options.length;i++)if(options[i].chance>options[best].chance)best=i;play(s,best);p.round++;p.outcome=null;}
 p.automatic=true;return{ok:true,result:finish(s),message:'教练已按较稳妥的判断处理余下回合，结果已保存。'};
}
function finishV3(s){
 if(s.retired||!s.pending||s._finishing)return null;s._finishing=true;upgrade(s);
 const arc=s.currentArc||{start:s.step,span:1,rating:rating(s),height:s.body.h,weight:s.body.w},planned=Math.min(arc.span,132-s.step),parts=[];
 try{for(let i=0;i<planned&&!s.retired;i++){if(i>0)s.pending=null;const part=finishQuarter(s);if(!part)break;parts.push(part);if(part.injury||!s.clubId&&part.clubId||s.loan?.end===s.step||s.currentArc?.tier!==squadTier(s))break;}}
 finally{s._finishing=false;}
 if(!parts.length)return null;const last=parts.at(-1),sum=k=>parts.reduce((n,x)=>n+(x[k]||0),0);
 const result={...last,span:parts.length,fromStep:arc.start,toStep:s.step,startAge:7+arc.start/4,endAge:7+s.step/4,ratingChange:round(last.rating-arc.rating,1),dh:round(s.body.h-arc.height,1),dw:round(s.body.w-arc.weight,1),apps:sum('apps'),goals:sum('goals'),assists:sum('assists'),salary:sum('salary'),bonuses:sum('bonuses'),tax:sum('tax'),expenses:sum('expenses'),minutes:sum('minutes'),fixtures:parts.flatMap(x=>x.fixtures||[]),match:parts.find(x=>x.match)?.match||null,seasonEnd:parts.some(x=>x.seasonEnd),injury:parts.find(x=>x.injury)?.injury||null,matchRating:round(parts.reduce((n,x)=>n+x.matchRating,0)/parts.length,1)};
 s.currentArc=null;s.turns++;s.pending=null;s.lastResult=result;
 if(!s.retired){const offers=scoutInvitations(s);const promotion=promotionInvitation(s);result.newOffers=offers.length+(promotion?1:0);}else result.newOffers=0;
 note(s,'人生新一页',`${result.span===4?'这一年':result.span===3?'这九个月':result.span===2?'这半年':'这一季'}完成：${result.apps} 场${result.professional?'一线队':'成长赛事'}出场，综合能力 ${last.rating}。`,'chapter');
 return result;
}
function offerTerms(s,c,kind){
 const youth=s.age<18,r=rating(s),role=youth?'youth':r>=c.power+2?'star':r>=c.power-5?'starter':r>=c.power-12?'rotation':'prospect';
 const wage=youth?(s.age<12?0:round(20+Math.max(0,r-30)*c.power/80)):round(Math.max(160,Math.pow(Math.max(10,r-26),2.75)*Math.pow(c.power/75,1.8)/40));
 const squad=youth?'academy':role==='prospect'?'reserves':'first';
 return{wage,years:youth?Math.min(2,Math.max(1,18-s.age)):s.age>=33?1:s.age>=29?2:3,role,squad,youthRole:r>=c.power-22?'starter':'rotation',signingBonus:round(wage*(youth?1:8)),appBonus:youth?0:round(wage*.12),goalBonus:youth?0:round(wage*.17),release:round(Math.max(20000,valuation(s)*1.8)),buyout:kind==='loan'?round(valuation(s)*1.2):0,duration:kind==='loan'?4:0,salaryShare:kind==='loan'?60:100};
}
function offerAnalysis(s,o){
 const c=getClub(o.clubId),t=o.terms,tier=t.squad||(s.age<18?'academy':t.role==='prospect'?'reserves':'first'),r=rating(s),role=tier==='academy'?(t.youthRole==='starter'?'梯队主力培养':'梯队轮换培养'):roles[t.role],tierName=tier==='academy'?(s.age<=9?'U10':s.age<=11?'U12':s.age<=13?'U14':s.age<=15?'U16':'U18')+' 梯队':tier==='reserves'?'预备队 / U21':'一线队';
 const trust=.65,competition=clamp(.7+(r-(c.power-(tier==='academy'?25:tier==='reserves'?10:0)))/75,.18,1),roleRate=tier==='academy'?(t.youthRole==='starter'?.88:.58):{star:.96,starter:.85,rotation:.6,prospect:.34,youth:.85}[t.role],minutes=round(clamp((roleRate*.65+competition*.35)*100,15,95)),development=round(clamp((c.academy*.55+c.facility*.25+minutes*.2)-(tier==='reserves'&&s.age>23?15:0),15,96));
 const income=clamp(Math.log10(Math.max(1,t.wage))*22,0,100),platform=c.power,home=c.country===s.nation?95:42,firstChance=tier==='first'?minutes:tier==='academy'?s.age<16?0:clamp((r-c.power+28)*1.2,5,32):clamp((r-c.power+18)*1.8,8,48);
 const weights={growth:[.55,.28,.04,.09,.04],minutes:[.18,.62,.06,.08,.06],income:[.12,.15,.58,.1,.05],platform:[.17,.14,.09,.56,.04],home:[.17,.18,.08,.12,.45]}[s.focus||'growth'],score=round([development,minutes,income,platform,home].reduce((v,x,i)=>v+x*weights[i],0));
 const pros=[],cons=[];if(c.academy>=68)pros.push('训练与培养资源较强');if(minutes>=70)pros.push('预计有较稳定的同级比赛机会');if(c.country===s.nation)pros.push('本国环境，适应与家庭成本较低');if(t.wage>=(s.contract?.wage||0)*1.3&&t.wage>0)pros.push('收入保障高于当前协议');if(c.power>=72)pros.push('更高水平的平台和曝光');if(tier==='reserves')cons.push('签的是职业合同，初期仍以预备队比赛为主');if(minutes<65)cons.push('竞争较强，角色可能低于期待');if(c.country!==s.nation)cons.push('需要承担语言、生活和战术适应');if(s.age>=30&&t.years>2)cons.push('长期保障更好，但未来转身空间较小');if(!pros.length)pros.push('球队职责和出场路径较清晰');if(!cons.length)cons.push('平台与设施并非同级顶尖');
 const plan=tier==='academy'?'先完成 '+tierName+' 培养与同龄赛事，成年或获晋升邀请后再评估一线队。':tier==='reserves'?'先争取预备队稳定出场；表现与能力达标后会出现一线队晋升邀请，也可考虑外租。':s.age<24?'以承诺角色进入一线队，优先争取持续比赛；赛季后再评估续约或升级平台。':'按照承诺角色参与一线队，结合恢复、稳定收入与下一步生涯规划。';
 const advice=tier==='reserves'&&s.age>24?'发展窗口偏窄，建议优先比较能稳定出场的一线队。':minutes>=73&&development>=62?'培养与比赛机会较均衡，适合稳步推进生涯。':c.power>=72&&minutes<65?'平台更高但竞争更强；愿意接受替补和等待，再考虑这条路线。':s.focus==='income'&&income>=60?'符合收入优先的目标，但仍需留意实际比赛机会。':'根据你的成长目标取舍，别只看球队名气或最高薪资。';
 return{score,role,tier,tierName,minutes,minutesLow:Math.max(10,minutes-12),minutesHigh:Math.min(96,minutes+9),development,firstChance:round(firstChance),pros,cons,plan,advice,competition:round(100-competition*70),wageLabel:s.age<12?'无职业工资 · 提供培养支持':s.age<18?'培养津贴':'税前周薪'};
}
function scoutInvitationsV3(s,force=false){
 upgrade(s);if(s.pending||s.retired||s.route!=='football'||s.age<9||s.loan||!marketOpen(s))return[];
 if(s.lastScoutStep===s.step)return[];
 const active=s.offers.filter(o=>o.status==='active'&&o.expires>=s.step);if(active.length>=2)return[];
 const need=!s.contract||s.contract.end-s.step<=4||s.transferListed||s.contract.role==='prospect'&&s.coach<55;
 if(!force&&!need&&(s.quarter!==0||rand(s)>.28))return[];s.lastScoutStep=s.step;
 const all=D.clubs.filter(c=>c.id!==s.clubId&&!c.historical&&(s.age>=18?c.source==='tm'||c.current:c.country===s.nation)).map(c=>getClub(c.id));if(!all.length)return[];
 const r=rating(s),target=s.age<18?r+20:r+4,recent=new Set(s.invitationMemory.filter(x=>s.step-x.step<12).map(x=>x.clubId)),available=all.filter(c=>!recent.has(c.id)&&!active.some(o=>o.clubId===c.id)),pool=available.length>=3?available:all;
 const domestic=pool.filter(c=>c.country===s.nation),local=domestic.length>=3?domestic:pool;
 const sortPick=(items,score)=>items.map(c=>({c,value:score(c)+rand(s)*7})).sort((a,b)=>b.value-a.value).map(x=>x.c);
 const stability=sortPick(local,c=>80-Math.abs(c.power-target+8)*2+c.playing*.1),development=sortPick(local,c=>c.academy-Math.abs(c.power-target)*.65),ambition=sortPick(s.age<18?local:pool,c=>75-Math.abs(c.power-target-12)*2+c.power*.12);
 const chosen=[];for(const list of [stability,development,ambition]){const c=list.find(c=>!chosen.some(x=>x.id===c.id));if(c)chosen.push(c);}const offers=[];
 for(let i=0;i<chosen.length;i++){
  const c=chosen[i];let kind=s.age<18?'academy':'trial';let terms=offerTerms(s,c,kind);
  if(s.contract?.kind==='pro'&&s.contract.end-s.step>4&&!s.transferListed){if(s.age<25&&c.power<=getClub(s.clubId).power+4){kind='loan';terms=offerTerms(s,c,kind);terms.wage=s.contract.wage;terms.release=s.contract.release;terms.role=rating(s)>=c.power-9?'starter':'rotation';terms.squad='first';}else if(rand(s)>.45)continue;}
  const offer={id:'offer'+s.nextId++,clubId:c.id,kind,created:s.step,expires:s.step+Math.max(1,arcSpan(s)-1),status:'active',source:'scout',archetype:['minutes','development','platform'][i],reason:i===0?'球探认为你的特点能匹配球队的比赛需求。':i===1?'培养部门看中了你的发展潜力，希望提供成长计划。':'球队希望补充你的场上特点，愿意提供更高层次的竞争环境。',terms,base:JSON.parse(JSON.stringify(terms)),attempts:0,transferFee:s.contract&&kind!=='loan'?valuation(s):0,releaseAgreed:true};
  s.offers.push(offer);offers.push(offer);s.invitationMemory.push({clubId:c.id,step:s.step});
 }
 if(s.clubId&&s.contract&&s.contract.end-s.step<=4&&!active.some(o=>o.kind==='renewal')){const c=getClub(s.clubId),terms=offerTerms(s,c,'renewal');terms.wage=Math.max(terms.wage,round(s.contract.wage*1.06));const own={id:'offer'+s.nextId++,clubId:c.id,kind:'renewal',source:'club',reason:'现俱乐部希望与你讨论下一阶段的培养或职业计划。',created:s.step,expires:s.step+Math.max(1,arcSpan(s)-1),status:'active',terms,base:JSON.parse(JSON.stringify(terms)),attempts:0};s.offers.push(own);offers.push(own);}
 const ctx=competitionContext(s),c=activeClub(s);if(c&&['academy','reserves'].includes(ctx.tier)&&s.age>=16&&s.coach>=58&&r>=c.power-15&&!s.offers.some(o=>o.kind==='promotion'&&o.status==='active')){const terms=offerTerms(s,c,'promotion');terms.squad='first';terms.role=r>=c.power-7?'rotation':'prospect';terms.wage=Math.max(s.contract.wage,terms.wage);const o={id:'offer'+s.nextId++,clubId:c.id,kind:'promotion',source:'coach',reason:'教练组邀请你升入一线队培养名单；这不代表立即成为主力。',created:s.step,expires:s.step+Math.max(1,arcSpan(s)-1),status:'active',terms,base:JSON.parse(JSON.stringify(terms)),attempts:0};s.offers.push(o);offers.push(o);}
 if(offers.length)note(s,'俱乐部主动来信',`${offers.length} 份不同发展方向的邀请已到达。比较培养、薪资、梯队和角色后再决定，不需要立刻签约。`,'offer');return offers;
}
function declineOffer(s,id){const o=s.offers.find(o=>o.id===id&&o.status==='active');if(!o||s.pending)return{ok:false,message:'当前无法处理这份邀请。'};o.status='declined';note(s,'婉拒一份邀请',`你没有接受 ${getClub(o.clubId)?.cn||getClub(o.clubId)?.n} 的当前方案。`,'offer');return{ok:true,message:'已婉拒这份邀请，之后仍可能出现其他机会。'};}
function promotionInvitationV41(s){
 const c=activeClub(s),ctx=competitionContext(s);if(!c||!s.contract||s.loan||s.pending||s.age<16||!['academy','reserves'].includes(ctx.tier)||s.coach<58||rating(s)<c.power-15||s.offers.some(o=>o.kind==='promotion'&&o.status==='active'))return null;
 const terms=offerTerms(s,c,'promotion');terms.squad='first';terms.role=rating(s)>=c.power-7?'rotation':'prospect';terms.wage=Math.max(s.contract.wage,terms.wage);
 const o={id:'offer'+s.nextId++,clubId:c.id,kind:'promotion',source:'coach',reason:'教练组邀请你加入一线队培养名单，这需要你主动接受；也可以继续在原层级积累。',created:s.step,expires:s.step+Math.max(1,arcSpan(s)-1),status:'active',terms,base:JSON.parse(JSON.stringify(terms)),attempts:0};s.offers.push(o);note(s,'晋升机会来自教练组','一线队希望给你新的机会，请比较出场和竞争压力后再决定。','offer');return o;
}
function validateV3(x){if(!legacyValidate(x))return false;if(x.pace&&!['highlights','quarterly'].includes(x.pace))return false;if(x.squad&&!['school','community','academy','reserves','first'].includes(x.squad))return false;if(x.currentArc&&(!Number.isInteger(x.currentArc.span)||x.currentArc.span<1||x.currentArc.span>4||x.currentArc.start!==x.step))return false;if(x.pending?.sceneIds&&(!Array.isArray(x.pending.sceneIds)||x.pending.sceneIds.length<1||x.pending.sceneIds.length>2||!x.pending.sceneIds.every(id=>(g.CAREER_MATCH_SCENES||[]).some(m=>m.id===id))))return false;return true;}

/* V4: achievements, family succession, national windows and player-specific duels. */
const SHENZHEN_ID='cfl8h7ubdanybaf9yo7su5w327mc';
const TACTICS={balanced:{n:'攻守平衡',desc:'保持原有机会与负荷',chance:0,attack:1,load:0},press:{n:'主动压迫',desc:'抢先出手，额外消耗体力且更容易吃牌',chance:.025,attack:1.14,load:3},counter:{n:'快速反击',desc:'成功时更有威胁，处理难度稍高',chance:-.025,attack:1.4,load:2},protect:{n:'保护局面',desc:'优先成功率，降低直接进攻收益',chance:.055,attack:.65,load:0}};
function upgradeV40(s){
 upgradeV3(s);if(!s||s.v!==2)return s;s.edition=4;s.originYear=s.originYear||2026;
 s.badges=Array.isArray(s.badges)?s.badges:[];s.peakAttrs=s.peakAttrs||{...s.attrs};
 s.duels=s.duels||{played:0,won:0,players:[],practice:0,lastPracticeStep:-1};s.duels.players=s.duels.players||[];s.duels.practiceMemory=s.duels.practiceMemory||[];
 s.worldHonors=s.worldHonors||{goldenBalls:[],worldKing:false};s.cards=s.cards||{yellow:0,red:0};
 s.dynasty=s.dynasty||{generation:1,ancestors:[],child:null};s.dynasty.ancestors=s.dynasty.ancestors||[];
 s.international=s.international||{lastCheckStep:-1,callup:null,results:[],wins:0,trophies:[],captaincies:0};
 s.international.results=s.international.results||[];s.international.trophies=s.international.trophies||[];
 const first=s.careerMoves.find(m=>m.kind==='academy');if(!s.firstAcademyId&&first)s.firstAcademyId=first.to;
 if(!s.secret&&s.firstAcademyId===SHENZHEN_ID)s.secret={active:true,id:'shenzhen-king',triggerAge:first?.age||s.age};
 s.recoveryReturns=s.recoveryReturns||0;return s;
}
function start(c={}){const s=startV3(c);upgrade(s);s.originYear=Number.isInteger(c.originYear)?clamp(c.originYear,1900,5000):2026;s.year=s.originYear;return s;}
function secretBoost(s){
 if(!s.secret?.active||s.route!=='football')return;
 const floor=clamp(40+(s.age-7)*4,42,s.age>=22?99:96);
 for(const k of Object.keys(attrs))s.attrs[k]=Math.max(s.attrs[k],floor);
 apply(s,{health:Math.max(0,98-s.health),fatigue:-Math.max(0,s.fatigue-25),coach:Math.max(0,88-s.coach),confidence:Math.max(0,90-s.confidence),scouting:4,network:2});
 if(s.injury&&s.injury.weeks>1)s.injury.weeks=1;
}
function applyTraining(s){applyTrainingV3(s);secretBoost(s);for(const k of Object.keys(attrs))s.peakAttrs[k]=Math.max(s.peakAttrs[k]||1,s.attrs[k]);}
function injuryChance(s){return s.secret?.active?.0005:injuryChanceV3(s);}
function eventProbability(s,c){return s.secret?.active?Math.max(.97,eventProbabilityV3(s,c)):eventProbabilityV3(s,c);}
function trialProbabilityV41(s,c,kind='trial'){const base=trialProbabilityV3(s,c,kind),bonus=(s.heritage?.networkBonus||0)/500;return s.secret?.active?.995:round(clamp(base+bonus,.08,.96),2);}
function negotiationChance(s,o,t){return s.secret?.active?Math.max(.97,negotiationChanceV3(s,o,t)):negotiationChanceV3(s,o,t);}
function signV41(s,id){
 upgrade(s);const o=s.offers.find(x=>x.id===id),wasFirst=s.firstAcademyId,result=signV3(s,id);if(!result.ok)return result;
 if(!wasFirst&&o?.terms.squad==='academy'){s.firstAcademyId=o.clubId;
  if(o.clubId===SHENZHEN_ID){s.secret={active:true,id:'shenzhen-king',triggerAge:s.age};secretBoost(s);note(s,'隐藏路线解锁 · 鹏城球王','第一支青训队选择深圳青年人，你获得王者培养轨迹：成长更快、伤病更少，成年后更易得到豪门邀约。','destiny');result.message+=' 隐藏路线「鹏城球王」已开启。';}
 }
 if(s.heritage&&o?.clubId===s.heritage.parentClubId)note(s,'熟悉的队徽，新的名字','家族履历帮助你被看见，球场上的位置仍要由你争取。','family');
 checkAchievements(s);return result;
}
function addInvitation(s,c,kind,reason,source='scout'){
 if(!c||s.offers.some(o=>o.clubId===c.id&&o.status==='active'&&o.expires>=s.step)||c.id===s.clubId)return null;
 const terms=offerTerms(s,c,kind),o={id:'offer'+s.nextId++,clubId:c.id,kind,source,reason,created:s.step,expires:s.step+Math.max(1,arcSpan(s)-1),status:'active',terms,base:JSON.parse(JSON.stringify(terms)),attempts:0,releaseAgreed:true,transferFee:s.contract?.kind==='pro'?valuation(s):0};
 s.offers.push(o);return o;
}
function scoutInvitationsV41(s,force=false){
 upgrade(s);const offers=scoutInvitationsV3(s,force);if(s.pending||s.retired||s.route!=='football'||s.loan||s.age<9||!marketOpen(s))return offers;
 if(!s.firstAcademyId&&s.nation==='China'&&s.age<18&&(!Number.isFinite(s.lastShenzhenInvite)||s.step-s.lastShenzhenInvite>=8)){
  const o=addInvitation(s,getClub(SHENZHEN_ID),'academy','深圳青年人的青训观察员邀请你来参加同龄梯队培养，比较其他方案后再决定。');if(o){offers.push(o);s.lastShenzhenInvite=s.step;}
 }
 if(s.heritage&&s.age<18&&!s.firstAcademyId&&(!Number.isFinite(s.lastFamilyInvite)||s.step-s.lastFamilyInvite>=12)){
  const c=getClub(s.heritage.parentClubId);if(c?.country===s.nation){const o=addInvitation(s,c,'academy','培养部门熟悉你父辈的履历，为你提供优先观察和一份独立的青训计划。','family');if(o){offers.push(o);s.lastFamilyInvite=s.step;}}
 }
 if(s.secret?.active&&s.age>=18&&(!s.contract||s.contract.end-s.step<=4||force)&&s.lastRoyalInvite!==s.step){
  for(const id of ['tm418','tm281','tm131']){const o=addInvitation(s,getClub(id),'trial','鹏城球王计划的全球球探推荐：提供一线队核心培养，并保留你选择下一站的权力。','destiny');if(o)offers.push(o);}s.lastRoyalInvite=s.step;
 }
 return offers;
}
function simulateRound(s,l,highlight){
 if(s.secret?.active&&s.clubId){const c=activeClub(s),pair=l.schedule[l.round]?.find(x=>x.includes(c?.id));if(pair){const own=2+Math.floor(rand(s)*3),away=rand(s)<.2?1:0;highlight={home:pair[0],away:pair[1],score:pair[0]===c.id?[own,away]:[away,own]};}}
 return simulateRoundV3(s,l,highlight);
}
function currentEvent(s){return currentEventV3(s);}
function prepare(s){
 upgrade(s);if(s.retired||s.pending)return false;
 const call=s.international.callup;if(call?.status==='pending')answerCallup(s,s.injury?'rest':'accept');
 const result=prepareV3(s);if(result&&call?.status==='accepted'){
  const eligible=(g.CAREER_INTERNATIONAL_EVENTS||[]).filter(e=>s.age>=e.min&&s.age<=e.max&&!s.eventMemory[e.id]);
  if(eligible.length){const e=choose(s,eligible);s.pending.queue=[e.id];s.pending.internationalEvent=true;}
 }
 return result;
}
function chooseEvent(s,index){const outcome=chooseEventV3(s,index);if(outcome)checkAchievements(s);return outcome;}
function next(s){
 const p=s.pending;if(!p)return null;
 if(p.kind==='event'&&p.outcome&&p.index===p.queue.length-1&&s.international.callup?.status==='accepted'&&!s.injury){setupInternationalMatch(s);return 'match';}
 if(p.kind==='match'&&p.outcome&&p.sentOff)return finish(s);
 return nextV3(s);
}
function playerClubId(p){return typeof p?.[4]==='string'?p[4]:'tm'+p?.[4];}
function normalizedPlayer(t){return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
const playerRecords=new Map(D.players.map(p=>[normalizedPlayer(p[1]),p]));
const legendRecords=new Map();
function legendPlayer(scene){const key=scene.playerKey;if(legendRecords.has(key))return legendRecords.get(key);const names=[scene.playerEnglish,...(scene.playerAliases||[])].map(normalizedPlayer),fixedId=scene.playerId||({alisson:105470}[key]);const p=(fixedId?D.players.find(x=>x[0]===fixedId):null)||names.map(n=>playerRecords.get(n)).find(Boolean)||D.players.find(p=>names.some(n=>n&&normalizedPlayer(p[1])===n));legendRecords.set(key,p||null);return p;}
function legendCatalogV40(){
 const list=[],seen=new Set();for(const scene of g.CAREER_LEGEND_SCENES||[]){if(seen.has(scene.playerKey))continue;seen.add(scene.playerKey);const p=legendPlayer(scene);list.push({key:scene.playerKey,name:scene.playerName,english:scene.playerEnglish,nation:scene.playerNation,playerId:p?.[0]||null,clubId:p?playerClubId(p):null,scenes:(g.CAREER_LEGEND_SCENES||[]).filter(x=>x.playerKey===scene.playerKey).length});}return list;
}
function attachLegendScenes(s,p,pool){
 const fitting=pool.filter(x=>x.roles.includes(s.pos)),recent=new Set(s.sceneMemory.slice(-12));let fresh=fitting.filter(x=>!recent.has(x.id));if(!fresh.length)fresh=fitting;if(!fresh.length)return false;
 const scene=choose(s,fresh);p.legendSceneIds=[scene.id];const other=fresh.filter(x=>x.id!==scene.id);if(other.length&&rand(s)<.35)p.legendSceneIds.push(choose(s,other).id);
 p.roundTotal=p.legendSceneIds.length;delete p.sceneIds;p.playerDuel=true;p.tactic=s.tactic||'balanced';p.cards={yellow:0,red:0};
 s.sceneMemory.push(...p.legendSceneIds);return true;
}
function setupMatchV40(s){
 setupMatchV3(s);const p=s.pending;if(p?.tier!=='first')return;
 const pool=(g.CAREER_LEGEND_SCENES||[]).filter(x=>{const player=legendPlayer(x);return player&&playerClubId(player)===p.rivalId;});
 attachLegendScenes(s,p,pool);
}
function matchOptionsV40(s){
 const p=s.pending;if(p?.kind!=='match')return null;
 const scene=p.legendSceneIds&&(g.CAREER_LEGEND_SCENES||[]).find(x=>x.id===p.legendSceneIds[p.round]);let result;
 if(scene){const player=legendPlayer(scene),relative=(rating(s)-(p.international?78:(getClub(p.rivalId)?.power||75)))/400;
  result={...scene,playerId:player?.[0]||null,title:(p.minute+p.round*14)+'′ · '+scene.title,options:scene.options.map(o=>({...o,chance:round(clamp(o.base+((s.attrs[o.key]??s[o.key]??50)-55)/230+(s.form-65)/600-(s.fatigue-25)/700+relative,.12,.91),2)}))};
 }else result=matchOptionsV3(s);
 const tactic=TACTICS[p.tactic||s.tactic]||TACTICS.balanced;
 return{...result,options:result.options.map(o=>({...o,originalAttack:o.attack||0,attack:(o.attack||0)*tactic.attack,risk:typeof o.risk==='number'?o.risk:.18,riskText:o.riskText||(typeof o.risk==='string'?o.risk:'需要结合局面判断'),chance:s.secret?.active?.985:round(clamp(o.chance+tactic.chance,.1,.95),2)}))};
}
function setTactic(s,key){if(!TACTICS[key]||s.pending?.kind!=='match'||s.pending.outcome)return{ok:false,message:'当前无法改变这次处理。'};s.pending.tactic=key;s.tactic=key;return{ok:true,message:TACTICS[key].n+'已生效，选项概率与收益已更新。'};}
function playV40(s,index){
 const p=s.pending;if(p?.kind!=='match'||p.outcome)return null;const options=matchOptions(s),option=options.options[index];if(!option)return null;
 const result=playV3(s,index);if(!result)return null;const tactic=TACTICS[p.tactic||s.tactic]||TACTICS.balanced;if(tactic.load)apply(s,{fatigue:tactic.load});
 if(options.playerKey&&options.relation!=='teammate'&&options.relation!=='training'){s.duels.played++;result.playerName=options.playerName;result.playerKey=options.playerKey;if(result.success){s.duels.won++;if(!s.duels.players.includes(options.playerKey))s.duels.players.push(options.playerKey);}}
 const foul=option.foul||option.tacticalFoul||(!result.success&&(p.tactic==='press'||option.cardRisk)&&rand(s)<.16);
 if(foul){
  p.cards=p.cards||{yellow:0,red:0};
  if(rand(s)<(option.red||0)){p.cards.red=1;p.sentOff=true;s.cards.red++;p.score[1]++;result.text+=' 这次犯规被判定为严重犯规，裁判直接出示红牌，对手利用人数优势再入一球。';}
  else if(rand(s)<(option.yellow??(option.foul||option.tacticalFoul?.82:.45))){p.cards.yellow++;s.cards.yellow++;result.text+=' 裁判出示黄牌；战术犯规会留下纪律代价。';if(p.cards.yellow>=2){p.cards.red=1;p.sentOff=true;s.cards.red++;p.score[1]++;result.text+=' 两黄变一红，你被罚下，对手利用人数优势再入一球。';}}
 }
 if(!result.success&&(option.injuryRisk||option.load>=4)&&rand(s)<(s.secret?.active?.0005:.025)){s.injury={name:'比赛中的轻微肌肉拉伤',weeks:2,initial:2};result.text+=' 队医发现轻微拉伤，下一回合需要控制负荷。';}
 checkAchievements(s);return result;
}
function callupChance(s){const threshold=['China','Japan','South Korea','Korea, South'].includes(s.nation)?52:62;return s.age<15||squadTier(s)!=='first'||s.injury?0:round(clamp(.3+(rating(s)-threshold)/80+s.nationalRep/250+(s.form-65)/300,.08,.91),2);}
function nationalCalendar(s){
 return[{month:'9 月',q:0,kind:'国际比赛日',desc:'国家队报到、预选赛或热身赛'},{month:'10–11 月',q:1,kind:'国际比赛日',desc:'连续客场、轮换与俱乐部沟通'},{month:'3 月',q:2,kind:'国际比赛日',desc:'预选赛争位与集训考察'},{month:'6 月',q:3,kind:'夏季国家队窗口',desc:'大赛、决赛或国际热身'}].map(x=>({...x,year:s.year+(x.q>=2?1:0),current:x.q===s.quarter}));
}
function updateCallup(s){
 const N=s.international;if(s.retired||N.callup&&['pending','accepted'].includes(N.callup.status)||N.lastCheckStep===s.step)return;
 N.lastCheckStep=s.step;const probability=callupChance(s);if(!probability||rand(s)>(s.secret?.active?.995:probability))return;
 const youth=s.age<18?'U17':s.age<20?'U20':s.age<23&&rating(s)<74?'U23':'senior',targetQuarter=Math.min(3,s.quarter+arcSpan(s)-1),window=nationalCalendar(s)[targetQuarter];
 const pool=targetQuarter===3?['Brazil','France','Netherlands','Norway','Argentina','Spain','England']:choose(s,[['Japan','South Korea','Saudi Arabia','Iran','Australia'],['Brazil','Netherlands','France','Norway','England','Portugal']]);
 const asian=['China','Japan','South Korea','Korea, South','Saudi Arabia','Iran','Australia','Qatar'].includes(s.nation),african=['Egypt','Morocco','Senegal','Nigeria','Ghana','Cameroon','South Africa','Algeria','Tunisia'].includes(s.nation);
 const opponent=choose(s,pool.filter(x=>x!==s.nation)),worldCup=targetQuarter===3&&window.year%4===2&&youth==='senior',continental=targetQuarter===3&&!worldCup&&youth==='senior'&&(african?window.year%2===1:window.year%4===(asian?3:0));
 N.callup={id:'national-'+s.step,status:'pending',level:youth,step:s.step,year:window.year,month:window.month,opponent,competition:youth!=='senior'?youth+' 国际邀请赛':worldCup?'世界杯 · 模拟赛制':continental?'洲际锦标赛 · 模拟赛制':'国家队预选赛 / 热身赛',tournament:worldCup?'world':continental?'continental':null,probability,matches:worldCup||continental?3:2};
 note(s,'国家队征召信已到达',`${D.countries[s.nation]||s.nation}${youth==='senior'?'国家队':youth+' 队'}邀请你参加${N.callup.month}窗口。你可以应召、沟通时间、申请轮休或婉拒。`,'national');
}
function answerCallup(s,mode){
 upgrade(s);const c=s.international.callup;if(s.pending||s.retired||c?.status!=='pending')return{ok:false,message:'目前没有待回复的国家队征召。'};
 if(!['accept','managed','rest','decline'].includes(mode))return{ok:false,message:'请选择有效的回应。'};
 if(['accept','managed'].includes(mode)&&s.injury)return{ok:false,message:'当前有伤，先与国家队申请轮休，恢复后再争取下一次征召。'};
 c.response=mode;
 if(mode==='accept'||mode==='managed'){c.status='accepted';if(mode==='managed'){c.matches=Math.max(1,c.matches-1);c.managed=true;}apply(s,{nationalRep:mode==='accept'?2:1,fatigue:mode==='accept'?4:1});}
 else{c.status=mode==='rest'?'rested':'declined';apply(s,mode==='rest'?{fatigue:-9,health:3,nationalRep:s.injury?0:-1}:{family:4,nationalRep:-4});}
 const message={accept:'你已应召。下一次推进会进入国家队事件与比赛高光。',managed:'已与教练沟通限制出场，本窗口负荷降低，同时减少一场比赛。',rest:'已申请轮休。本窗口优先恢复，未来仍可再次被征召。',decline:'已婉拒这次征召，国家队评价会受到影响。'}[mode];note(s,'回复国家队',message,'national');checkAchievements(s);return{ok:true,message};
}
function setupInternationalMatchV40(s){
 const c=s.international.callup,ctx=competitionContext(s),isSenior=c.level==='senior';
 s.pending={kind:'match',flowVersion:4,international:true,round:0,roundTotal:1,sceneIds:[],score:[0,0],home:null,away:null,rivalId:null,opponent:(D.countries[c.opponent]||c.opponent)+(isSenior?'国家队':' '+c.level),boost:0,plays:[],outcome:null,clubId:null,ownHome:true,tier:'international',competition:c.competition,teamName:(D.countries[s.nation]||s.nation)+(isSenior?'国家队':' '+c.level),minute:20+Math.floor(rand(s)*35),tactic:s.tactic||'balanced',cards:{yellow:0,red:0}};
 const pool=isSenior?(g.CAREER_LEGEND_SCENES||[]).filter(x=>x.playerNation===c.opponent&&x.relation!=='teammate'&&x.relation!=='training'):[];
 if(!attachLegendScenes(s,s.pending,pool)){
  const choices=(g.CAREER_MATCH_SCENES||[]).filter(x=>x.levels.includes('first')&&x.positions.includes(s.pos));const first=choose(s,choices);s.pending.sceneIds=[first.id];s.pending.roundTotal=1;
 }
}
function settleInternational(s,p){
 const c=s.international.callup,N=s.international,rows=[],senior=c.level==='senior';let wonAll=true;
 for(let i=0;i<c.matches;i++){
  const our=(i===0?p.score[0]:0)+poisson(s,clamp(.65+rating(s)/100+(i===0?p.boost*.25:0),.4,3.3)),their=(i===0?p.score[1]:0)+poisson(s,s.secret?.active?.15:1.2);
  const ga=s.secret?.active?Math.max(our,their+1):our,gb=their,winner=ga>gb;wonAll=wonAll&&winner;
  const goals=s.pos==='GK'?0:Math.min(ga,poisson(s,ga*(s.pos==='ST'?.45:['LW','AM'].includes(s.pos)?.27:.1)));
  if(senior){s.stats.caps++;s.stats.nationalGoals+=goals;}else{s.stats.youthCaps++;s.stats.youthNationalGoals+=goals;}
  if(winner)N.wins++;
  rows.push({id:c.id+'-'+i,year:c.year,month:c.month,nation:s.nation,opponent:c.opponent,competition:c.competition,level:c.level,score:[ga,gb],goals,won:winner,round:c.tournament?['八强赛','半决赛','决赛'][i]:'国际比赛日 '+(i+1),captain:s.leadership>=80});
 }
 if(s.leadership>=80)N.captaincies+=rows.length;
 if(c.tournament&&wonAll){const title=c.tournament==='world'?'模拟世界杯冠军':'模拟洲际锦标赛冠军';N.trophies.push({title,year:c.year,kind:c.tournament});s.achievements.push({title,year:c.year,age:s.age});note(s,'身披国旗捧起奖杯',title+'，来自这个存档的模拟国家队赛事。','honor');}
 N.results.push(...rows);if(N.results.length>600)N.results=N.results.slice(-600);c.status='completed';apply(s,{nationalRep:rows.filter(x=>x.won).length*2,reputation:rows.length,fatigue:c.managed?2:6});
 note(s,'国家队窗口结束',`${rows.length} 场${senior?'成年':'青年'}国家队比赛，${rows.filter(x=>x.won).length} 胜。国家队统计与俱乐部出场分别记录。`,'national');return rows;
}
function worldHonors(s){
 const ended=s.lastResult?.seasonEnd,year=(s.lastResult?.year||s.year);if(!ended||s.age<18||s.worldHonors.goldenBalls.some(x=>x.year===year))return;
 const apps=s.history.filter(x=>x.year===year&&x.professional).reduce((n,x)=>n+x.apps,0),eligible=apps>=12&&rating(s)>=(s.secret?.active?87:91);
 if(eligible){s.worldHonors.goldenBalls.push({year,age:s.age,rating:rating(s)});s.achievements.push({title:'世界年度最佳球员 · 模拟金球奖',year,age:s.age});note(s,'世界年度最佳球员',`${s.name}凭借整个赛季的表现赢得模拟金球奖。`,'honor');}
 if(s.worldHonors.goldenBalls.length>=3&&s.bestRating>=95&&!s.worldHonors.worldKing){s.worldHonors.worldKing=true;note(s,'世界球王 · 时代的名字','三个世界年度最佳球员奖与巅峰能力共同确立了你的传奇地位。','honor');}
}
function finishV41(s){
 upgrade(s);if(!s.pending||s.retired)return null;let internationalRows=null;
 if(s.pending.international){internationalRows=settleInternational(s,s.pending);s.pending={kind:'event',queue:[EVENTS[0].id],index:0,outcome:{success:true},flowVersion:4};}
 const hadInjury=!!s.injury,result=finishV3(s);if(!result)return result;
 if(hadInjury&&!s.injury)s.recoveryReturns++;
 if(s.dynasty.child)s.dynasty.child.age=Math.max(0,Math.floor((s.step-s.dynasty.child.bornStep)/4));
 if(internationalRows){result.internationalSummary=internationalRows;s.lastResult=result;}
 worldHonors(s);if(!s.retired)updateCallup(s);result.newBadges=checkAchievements(s);return result;
}
function retire(s,path='rest'){const result=retireV3(s,path);if(result.ok){upgrade(s);checkAchievements(s);}return result;}
const MENTORING={technical:{name:'陪练基本功',chance:.83,cost:0,desc:'提高技术与传球；过多纠正可能挫伤热情'},athletic:{name:'户外运动与协调',chance:.77,cost:40,desc:'提高运动天赋；强度过高可能带来疲惫'},education:{name:'一起看球与学习',chance:.9,cost:0,desc:'提高阅读比赛和学业；直接身体成长较慢'},freedom:{name:'尊重兴趣，自由踢球',chance:.88,cost:0,desc:'提高快乐与自主性；专项进步幅度较小'},contacts:{name:'介绍青训教练',chance:.72,cost:180,desc:'提高人脉和试训优势；期待过高会增加压力'}};
function createChild(s,c={}){
 upgrade(s);if(s.pending||s.age<22)return{ok:false,message:'22 岁起可以建立自己的家庭传承，请先完成当前抉择。'};if(s.dynasty.child)return{ok:false,message:'这个存档已经有一位正在培养的下一代。'};
 const childName=String(c.name||s.name.slice(0,1)+'星澈').trim().slice(0,18);if(!childName)return{ok:false,message:'请为孩子起一个名字。'};
 const inherited={};for(const k of Object.keys(attrs))inherited[k]=round(clamp((s.peakAttrs[k]||s.attrs[k])*(.1+rand(s)*.08),2,18),1);
 s.dynasty.child={id:'child'+s.nextId++,name:childName,age:0,bornStep:s.step,bornYear:s.year,pos:positions[c.pos]?c.pos:s.pos,foot:['right','left','both'].includes(c.foot)?c.foot:s.foot,gifts:inherited,potential:round(clamp(40+Math.max(s.bestRating,rating(s))*.42+normal(s)*5,45,96)),happiness:78,education:42,networkBonus:round(clamp(s.network*.18+s.reputation*.22,3,35)),mentored:0,lastMentorStep:-1,style:'freedom'};
 note(s,'下一代的第一声哨响',`${childName}来到了你的人生里。你可以陪伴、训练、介绍教练，也可以尊重孩子自己的选择。`,'family');checkAchievements(s);return{ok:true,message:'家庭传承已开启。每个人生回合可以选择一次培养方式。'};
}
function mentorChild(s,key){
 upgrade(s);const c=s.dynasty.child,m=MENTORING[key];if(!c||!m||s.pending)return{ok:false,message:'请先建立下一代档案，并完成当前抉择。'};if(c.lastMentorStep===s.step)return{ok:false,message:'这个回合已经陪伴培养过，请继续人生后再来。'};if(s.cash<m.cost)return{ok:false,message:'目前的储蓄不足以承担这项安排。'};
 const chance=clamp(m.chance+(s.family-70)/600-(100-c.happiness)/800,.35,.97),success=rand(s)<chance;s.cash-=m.cost;c.lastMentorStep=s.step;c.mentored++;c.style=key;
 if(success){if(key==='technical'){c.gifts.technique=clamp(c.gifts.technique+1,0,25);c.gifts.passing=clamp(c.gifts.passing+.7,0,25);}if(key==='athletic'){c.gifts.pace=clamp(c.gifts.pace+.8,0,25);c.gifts.acceleration=clamp(c.gifts.acceleration+.8,0,25);}if(key==='education'){c.gifts.vision=clamp(c.gifts.vision+.8,0,25);c.education=clamp(c.education+4);}if(key==='freedom'){c.happiness=clamp(c.happiness+6);c.gifts.composure=clamp(c.gifts.composure+.6,0,25);}if(key==='contacts')c.networkBonus=clamp(c.networkBonus+4,0,55);c.potential=clamp(c.potential+.4,0,98);}
 else{c.happiness=clamp(c.happiness-4);if(key==='contacts')c.networkBonus=clamp(c.networkBonus+1,0,55);}
 apply(s,{family:success?2:-1});const message=success?'孩子从这次陪伴中收获了成长，培养结果已保留。':'这次安排没有达到预期，孩子需要一点空间和耐心。';note(s,'培养下一代 · '+m.name,message,'family');checkAchievements(s);return{ok:true,success,chance,message};
}
function nextGeneration(s){
 upgrade(s);const child=s.dynasty.child;if(!s.retired||s.pending)return{ok:false,message:'请在本代球员退役后，正式接棒下一代。'};if(!child)return{ok:false,message:'先在传承页面建立并培养孩子，再开启下一代。'};if(s.dynasty.generation>=12)return{ok:false,message:'这个家族已记录十二代传奇，请导出家族档案后开启新存档。'};
 const previous={name:s.name,nation:s.nation,pos:s.pos,year:s.year,rating:s.bestRating,apps:s.stats.apps,goals:s.stats.goals,assists:s.stats.assists,caps:s.stats.caps,clubId:s.clubId||s.careerMoves.at(-1)?.to||null,goldenBalls:s.worldHonors.goldenBalls.length,worldKing:s.worldHonors.worldKing,badges:s.badges.map(x=>x.id),ending:s.ending?.title,generation:s.dynasty.generation};
 const originYear=child.bornYear+7,next=start({name:child.name,nation:s.nation,pos:child.pos,foot:child.foot,family:'sport',talent:s.talent,seed:Math.floor(rand(s)*4294967295)||417853,originYear,fatherHeight:s.body.adultH,motherHeight:166,pace:s.pace});next.timelineMode='childhood-replay';
 for(const k of Object.keys(attrs))next.attrs[k]=round(clamp(next.attrs[k]+child.gifts[k]*(.65+child.happiness/280),1,57),1);
 next.education=clamp(35+child.education*.12);next.family=clamp(65+child.happiness*.22);next.network=clamp(12+child.networkBonus*.6);next.scouting=clamp(8+child.networkBonus*.25);next.cash=round(clamp(s.cash*.015,1200,25000));
 next.dynasty={generation:s.dynasty.generation+1,ancestors:s.dynasty.ancestors.concat(previous),child:null};next.heritage={parentName:s.name,parentClubId:previous.clubId,networkBonus:child.networkBonus,potential:child.potential,inheritance:{...child.gifts}};next.peakAttrs={...next.attrs};next.bestRating=rating(next);
 note(next,'接过父辈的球衣',`故事回到${originYear}年，${child.name}七岁时的球场。你继承了一部分足球天赋与家族人脉，新的成绩仍由这一代自己的选择决定。`,'family');checkAchievements(next);return{ok:true,state:next,message:'下一代已经接棒，从七岁时回溯开始。上一代记录已保存在家族荣誉墙。'};
}
function practiceSceneV40(s,key){const pool=(g.CAREER_LEGEND_SCENES||[]).filter(x=>x.playerKey===key&&x.roles.includes(s.pos)),all=pool.length?pool:(g.CAREER_LEGEND_SCENES||[]).filter(x=>x.playerKey===key),fresh=all.filter(x=>!s.duels.practiceMemory.includes(x.id)),choices=fresh.length?fresh:all;return choices[s.step%Math.max(1,choices.length)];}
function practiceLegendV40(s,key,index){
 upgrade(s);if(s.pending||s.retired)return{ok:false,message:'请先完成当前比赛；退役后可把经验交给下一代。'};if(s.duels.lastPracticeStep===s.step)return{ok:false,message:'本回合已经完成球星研究，继续人生后再训练。'};
 const scene=practiceScene(s,key),option=scene?.options[index];if(!option)return{ok:false,message:'没有找到这个训练选项。'};
 const chance=s.secret?.active?.985:round(clamp(option.base+((s.attrs[option.key]??s[option.key]??50)-50)/250,.15,.94),2),roll=rand(s),success=roll<chance;s.duels.lastPracticeStep=s.step;s.duels.practice++;apply(s,success?{knowledge:2,confidence:1,fatigue:2}:{knowledge:1,fatigue:3});if(success&&option.key in attrs)s.attrs[option.key]=clamp(s.attrs[option.key]+.3,1,99);
 s.duels.practiceMemory.push(scene.id);if(s.duels.practiceMemory.length>100)s.duels.practiceMemory.shift();const text=success?option.goodText:option.badText;note(s,'球星录像室 · '+scene.playerName,text,'training');checkAchievements(s);return{ok:true,success,chance,roll,text,choice:option.n,playerName:scene.playerName,scene};
}
const ACHIEVEMENTS=[
 ['first_choice','自己的第一步','成长','完成一次人生抉择',1,s=>Object.keys(s.eventMemory).length,'bronze'],
 ['academy','第一件青训球衣','成长','加盟一支同龄青训梯队',1,s=>Number(!!s.firstAcademyId),'bronze'],
 ['body','长大的球衣','成长','比七岁时长高 20 厘米',20,s=>Math.max(0,s.body.h-s.body.initialH),'silver'],
 ['potential','可造之材','成长','综合能力达到 65',65,s=>Math.max(s.bestRating,rating(s)),'silver'],
 ['first_team','职业首秀','职业','完成一次一线队正式出场',1,s=>s.stats.apps,'bronze'],
 ['centurion','百场职业路','职业','累计 100 场一线队出场',100,s=>s.stats.apps,'silver'],
 ['iron','绿茵常青树','职业','累计 500 场一线队出场',500,s=>s.stats.apps,'gold'],
 ['scorer','禁区里的答案','职业','累计 50 个一线队进球',50,s=>s.stats.goals,'silver'],
 ['golden_boot','进球机器','职业','累计 250 个一线队进球',250,s=>s.stats.goals,'gold'],
 ['creator','机会的建筑师','职业','累计 100 次一线队助攻',100,s=>s.stats.assists,'gold'],
 ['keeper','最后一道城墙','职业','门将累计 50 场零封',50,s=>s.pos==='GK'?s.stats.cleanSheets:0,'gold'],
 ['loan','外租的春天','职业','经历租借，并累计 50 场职业出场',50,s=>s.careerMoves.some(x=>x.kind==='loan')?s.stats.apps:0,'silver'],
 ['traveller','足球没有边界','职业','效力过三个不同国家的俱乐部',3,s=>new Set(s.careerMoves.map(x=>getClub(x.to)?.country).filter(Boolean)).size,'gold'],
 ['loyal','一座城的名字','职业','在同一家俱乐部记录 24 个季度',24,s=>Math.max(0,...Object.values(s.history.reduce((a,x)=>(x.clubId&&(a[x.clubId]=(a[x.clubId]||0)+1),a),{}))),'gold'],
 ['million','照顾好未来','人生','累计税前收入达到 100 万欧元',1000000,s=>s.totalEarnings,'silver'],
 ['scholar','球场之外的答案','人生','学业达到 85',85,s=>s.education,'silver'],
 ['comeback','伤愈之后','人生','完整康复一次伤病',1,s=>s.recoveryReturns,'bronze'],
 ['flag','第一次身披国旗','国家队','参加一场成年国家队比赛',1,s=>s.stats.caps,'silver'],
 ['youth_flag','未来之星','国家队','参加 5 场青年国家队比赛',5,s=>s.stats.youthCaps,'silver'],
 ['nation_50','国家队的五十次心跳','国家队','累计 50 场成年国家队出场',50,s=>s.stats.caps,'gold'],
 ['national_goals','为国破门','国家队','累计 15 个成年国家队进球',15,s=>s.stats.nationalGoals,'gold'],
 ['captain','队长袖标','国家队','以队长身份完成一次国家队比赛',1,s=>s.international.captaincies,'gold'],
 ['continental','洲际之巅','国家队','赢得一次模拟洲际锦标赛',1,s=>s.international.trophies.filter(x=>x.kind==='continental').length,'gold'],
 ['world_cup','把世界带回家','国家队','赢得一次模拟世界杯',1,s=>s.international.trophies.filter(x=>x.kind==='world').length,'legend'],
 ['duel','与巨星正面对话','对决','在真实对手情境中成功一次',1,s=>s.duels.won,'silver'],
 ['giant','巨星克星','对决','成功应对 5 位不同的真实球星',5,s=>s.duels.players.length,'gold'],
 ['study_tape','录像室里的加练','对决','在 5 个不同回合完成球星录像训练',5,s=>(s.duels.practiceTurns?.length??s.duels.practice),'silver'],
 ['parent','足球家庭','传承','建立自己的孩子档案',1,s=>Number(!!s.dynasty.child),'bronze'],
 ['mentor','最好的第一任教练','传承','陪伴培养孩子 8 次',8,s=>s.dynasty.child?.mentored||0,'gold'],
 ['torch','接过那件球衣','传承','正式开启第二代人生',2,s=>s.dynasty.generation,'gold'],
 ['heir','天赋也需要努力','传承','继承家族天赋后综合能力达到 85',85,s=>s.heritage?Math.max(s.bestRating,rating(s)):0,'legend'],
 ['family_3','三代绿茵','传承','把家族故事延续到第三代',3,s=>s.dynasty.generation,'legend'],
 ['golden_ball','世界年度最佳','传奇','赢得一次模拟金球奖',1,s=>s.worldHonors.goldenBalls.length,'legend'],
 ['king','世界球王','传奇','三次模拟金球奖，巅峰能力至少 95',1,s=>Number(s.worldHonors.worldKing),'legend'],
 ['shenzhen','鹏城的秘密','隐藏','第一支青训队选择深圳青年人',1,s=>Number(!!s.secret?.active),'legend']
];
function achievementStatus(s){return ACHIEVEMENTS.map(([id,title,category,condition,target,value,tier])=>{const progress=Math.max(0,round(value(s),1)),unlocked=s.badges.find(x=>x.id===id);return{id,title,category,condition,target,progress,ratio:clamp(progress/target,0,1),tier,unlocked:!!unlocked,record:unlocked||null};});}
function checkAchievements(s){
 const fresh=[];for(const a of achievementStatus(s)){if(a.unlocked||a.progress<a.target)continue;const record={id:a.id,title:a.title,age:s.age,year:s.year,step:s.step,generation:s.dynasty.generation};s.badges.push(record);fresh.push(a.title);note(s,'成就解锁 · '+a.title,a.condition,'achievement');}return fresh;
}
function validateV40(x){
 try{
  if(!validateV3(x))return false;if(!Number.isInteger(x.originYear)||x.originYear<1900||x.originYear>5000||x.year!==x.originYear+Math.floor(x.step/4))return false;
  if(!Array.isArray(x.badges)||x.badges.length>ACHIEVEMENTS.length||new Set(x.badges.map(a=>a.id)).size!==x.badges.length||x.badges.some(a=>!ACHIEVEMENTS.some(d=>d[0]===a.id)))return false;
  if(!x.dynasty||!Number.isInteger(x.dynasty.generation)||x.dynasty.generation<1||x.dynasty.generation>12||!Array.isArray(x.dynasty.ancestors)||x.dynasty.ancestors.length!==x.dynasty.generation-1)return false;
  const c=x.dynasty.child;if(c&&(typeof c.name!=='string'||!c.name.trim()||c.name.length>18||!positions[c.pos]||!['left','right','both'].includes(c.foot)||!Number.isInteger(c.bornYear)||c.bornYear!==x.originYear+Math.floor(c.bornStep/4)||!Number.isInteger(c.age)||c.age!==Math.floor((x.step-c.bornStep)/4)||!Number.isInteger(c.bornStep)||c.bornStep<0||c.bornStep>x.step||!Object.keys(attrs).every(k=>Number.isFinite(c.gifts?.[k])&&c.gifts[k]>=0&&c.gifts[k]<=25)||![c.happiness,c.education,c.potential,c.networkBonus].every(v=>Number.isFinite(v)&&v>=0&&v<=100)))return false;
  if(!x.international||!Array.isArray(x.international.results)||x.international.results.length>600||x.international.results.some(r=>!Array.isArray(r.score)||r.score.length!==2||r.score.some(n=>!Number.isInteger(n)||n<0||n>20)))return false;
  if(x.pending?.legendSceneIds&&(!Array.isArray(x.pending.legendSceneIds)||x.pending.legendSceneIds.length<1||x.pending.legendSceneIds.length>2||!x.pending.legendSceneIds.every(id=>(g.CAREER_LEGEND_SCENES||[]).some(m=>m.id===id))))return false;
  return true;
 }catch{return false;}
}

/* 4.1 interaction directory: curated players plus every real record in the database. */
const interactionRows=new Map(D.players.map(p=>[String(p[0]),p]));
const featuredInteractions=g.CAREER_INTERACTION_PROFILES||[],featuredById=new Map(featuredInteractions.map(p=>[String(p.playerId),p])),featuredByKey=new Map(featuredInteractions.map(p=>[p.key,p]));
const generatedProfiles=new Map(),interactionScenes=new Map((g.CAREER_LEGEND_SCENES||[]).map(scene=>[scene.id,scene])),rostersByClub=new Map();
for(const row of D.players){const id=playerClubId(row);if(!rostersByClub.has(id))rostersByClub.set(id,[]);rostersByClub.get(id).push(row);}
function interactionPosition(row){
 const p=String(row[5]||'').toLowerCase();if(/goalkeeper|门将/.test(p))return'GK';if(/centre.back|center.back|中后卫/.test(p))return'CB';if(/left.back|right.back|wing.back|边后卫/.test(p))return'FB';if(/defensive midfield|后腰/.test(p))return'DM';if(/attacking midfield|前腰/.test(p))return'AM';if(/left winger|right winger|winger|边锋/.test(p))return'LW';if(/forward|striker|中锋/.test(p))return'ST';if(/central midfield|中场/.test(p))return'CM';const h=hash(row[0]);return/defender/.test(p)?['CB','FB'][h%2]:/attacker/.test(p)?['ST','LW'][h%2]:['CM','DM','AM'][h%3];
}
function interactionPlayer(value){
 if(value&&typeof value==='object')value=value.key||value.playerId||value.id;const key=String(value??'');if(featuredByKey.has(key))return featuredByKey.get(key);const id=key.startsWith('db_')?key.slice(3):key;if(featuredById.has(id))return featuredById.get(id);if(generatedProfiles.has(id))return generatedProfiles.get(id);const row=interactionRows.get(id);if(!row)return null;
 const position=interactionPosition(row),clubId=playerClubId(row),club=clubs.get(clubId),themes={ST:['禁区跑位','观察防线身后的空当，再突然改变启动方向'],LW:['边路变速','先沿边线拉开宽度，再利用变速寻找内切空间'],AM:['肋部创造','在两条防线之间接球，观察身后跑动后送出最后一传'],CM:['节奏控制','侧身接球观察两侧，把球转移到压迫较弱的一边'],DM:['中路保护','在中卫身前控制接球路线，断球后迅速寻找安全出口'],CB:['禁区保护','先控制与球门的距离，再根据触球方向决定卡位或上抢'],FB:['边路攻守','结合边锋的站位选择套边，同时留意身后的回防通道'],GK:['门前判断','先调整站位和脚步，再根据来球轨迹决定接球或封挡']}[position];
 const profile={key:'db_'+id,playerId:row[0],name:row[1],english:row[1],nation:row[2],clubId,position,domestic:club?.country==='China',styleTitle:themes[0],signature:themes[1],theme:themes[0],generated:true};generatedProfiles.set(id,profile);return profile;
}
function ensurePlayerScenes(profile){
 profile=interactionPlayer(profile);if(!profile)return[];const first='v41_'+profile.key+'_opponent';if(!interactionScenes.has(first)){const scenes=g.makePlayerInteractionScenes(profile);for(const scene of scenes){if(interactionScenes.has(scene.id))continue;interactionScenes.set(scene.id,scene);g.CAREER_LEGEND_SCENES.push(scene);}}
 return(g.CAREER_LEGEND_SCENES||[]).filter(scene=>scene.playerKey===profile.key);
}
function interactionCounts(){return{featured:featuredInteractions.length,domestic:featuredInteractions.filter(p=>p.domestic).length,international:featuredInteractions.filter(p=>!p.domestic).length,allPlayers:D.players.length,featuredScenes:57+featuredInteractions.length*6};}
function legendCatalog(){return featuredInteractions.map(p=>({key:p.key,name:p.name,english:p.english,nation:p.nation,playerId:p.playerId,clubId:p.clubId,position:p.position,domestic:p.domestic,scenes:ensurePlayerScenes(p).length}));}
function listInteractions(settings={}){
 const scope=settings.scope==='all'?'all':'featured',region=['domestic','international'].includes(settings.region)?settings.region:'all',position=positions[settings.position]?settings.position:'all',query=String(settings.query||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),pageSize=clamp(Number(settings.pageSize)||20,8,24),matches=[];
 const sources=scope==='all'?D.players:featuredInteractions;
 for(const item of sources){const featured=scope==='all'?featuredById.get(String(item[0])):item,id=featured?.playerId??item[0],clubId=featured?.clubId||playerClubId(item),club=clubs.get(clubId),domestic=featured?.domestic??club?.country==='China',pos=featured?.position||interactionPosition(item);
  if(region==='domestic'&&!domestic||region==='international'&&domestic||position!=='all'&&position!==pos)continue;
  if(query){const text=[featured?.name||item[1],featured?.english||item[1],featured?.styleTitle||'',featured?.theme||'',club?.cn||'',club?.n||'',D.countries[featured?.nation||item[2]]||featured?.nation||item[2]].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(!text.includes(query))continue;}
  matches.push(id);
 }
 const pages=Math.max(1,Math.ceil(matches.length/pageSize)),page=clamp(Math.floor(Number(settings.page)||0),0,pages-1);
 return{items:matches.slice(page*pageSize,(page+1)*pageSize).map(interactionPlayer),total:matches.length,page,pages,pageSize,scope,...interactionCounts()};
}
function upgradeV41(s){upgradeV40(s);if(!s||s.v!==2)return s;s.release='4.1';s.relationships=s.relationships||{};
 if(!Array.isArray(s.duels.practiceTurns))s.duels.practiceTurns=[...new Set(s.log.filter(x=>x.type==='training'&&(/球星录像室|球员互动/.test(x.title))).map(x=>x.step))];
 if(s.pending?.interactionPlayerIds&&Array.isArray(s.pending.interactionPlayerIds)&&s.pending.interactionPlayerIds.length<=2)for(const id of s.pending.interactionPlayerIds)ensurePlayerScenes(id);
 return s;
}
function interactionUsage(s){const turn=s.duels.turnInteractions;return{limit:3,used:turn?.step===s.step?[...turn.used]:s.duels.lastPracticeStep===s.step?['duel']:[],step:s.step};}
function interactionScene(s,value,kind='duel'){
 const profile=interactionPlayer(value);if(!profile)return null;const all=ensurePlayerScenes(profile),relation=kind==='team'?'teammate':kind==='learn'?'training':'opponent',pool=all.filter(x=>(x.relation||'opponent')===relation&&x.roles.includes(s.pos));const seen=new Set(s.duels.practiceMemory||[]),fresh=pool.filter(x=>!seen.has(x.id)),choices=fresh.length?fresh:pool;return choices[(s.step+hash(profile.key))%Math.max(1,choices.length)]||null;
}
function availableInteractionKinds(s,value){return['duel','team','learn'].filter(kind=>!!interactionScene(s,value,kind));}
function practiceScene(s,key){return interactionScene(s,key,'duel')||interactionScene(s,key,'learn')||interactionScene(s,key,'team');}
function bondWith(s,profile,success,relation,live=true){const id=String(profile.playerId),previous=s.relationships[id]||{trust:40,understanding:15,interactions:0};s.relationships[id]={trust:round(clamp(previous.trust+(live?(success?(relation==='teammate'?4:relation==='training'?2:1):-.8):0)),1),understanding:round(clamp(previous.understanding+(success?3:1)),1),interactions:previous.interactions+1,lastStep:s.step};return s.relationships[id];}
function practiceLegendV41(s,key,index,sceneId){
 upgrade(s);if(s.pending||s.retired)return{ok:false,message:'请先完成当前回合。退役后可以让下一代继续这些互动。'};const profile=interactionPlayer(key);if(!profile)return{ok:false,message:'没有找到这位资料库球员。'};
 const all=ensurePlayerScenes(profile),scene=sceneId?all.find(x=>x.id===sceneId&&x.roles.includes(s.pos)):practiceScene(s,profile),option=scene?.options[index];if(!option)return{ok:false,message:'这个情境不适合你当前的位置，请选择其他互动类型。'};
 const kind=scene.relation==='teammate'?'team':scene.relation==='training'?'learn':'duel',usage=interactionUsage(s);if(usage.used.includes(kind)||usage.used.length>=usage.limit)return{ok:false,message:'本回合已完成这类互动。可以选择另一类，或继续人生后再来。'};
 const bond=s.relationships[String(profile.playerId)],chance=s.secret?.active?.985:round(clamp(option.base+((s.attrs[option.key]??s[option.key]??50)-50)/250+(scene.relation==='teammate'?(bond?.understanding||0)/2500:0),.15,.94),2),roll=rand(s),success=roll<chance;
 s.duels.turnInteractions={step:s.step,used:usage.used.concat(kind)};s.duels.lastPracticeStep=s.step;s.duels.practice++;if(!s.duels.practiceTurns.includes(s.step))s.duels.practiceTurns.push(s.step);
 const live=squadTier(s)==='first'&&activeClub(s)?.id===profile.clubId;
 apply(s,success?{knowledge:kind==='learn'?3:2,confidence:1,fatigue:Math.max(1,option.load||2),friendship:live?(kind==='team'?1.5:.5):0}:{knowledge:1,fatigue:Math.max(2,option.load||3)});if(success&&option.key in attrs)s.attrs[option.key]=round(clamp(s.attrs[option.key]+(kind==='learn'?.4:.25),1,99),2);
 const relationship=bondWith(s,profile,success,scene.relation||'opponent',live);s.duels.practiceMemory.push(scene.id);if(s.duels.practiceMemory.length>160)s.duels.practiceMemory.shift();
 const text=success?option.goodText:option.badText;note(s,'球员互动 · '+profile.name,text,'training');const newBadges=checkAchievements(s);return{ok:true,success,chance,roll,text,choice:option.n,playerName:profile.name,profile,scene,kind,relationship,newBadges};
}
function registerPendingPlayers(s){const p=s.pending;if(p?.legendSceneIds)p.interactionPlayerIds=[...new Set(p.legendSceneIds.map(id=>interactionScenes.get(id)?.playerId).filter(x=>x!==undefined))];}
function setupMatch(s){
 setupMatchV3(s);const p=s.pending;if(p?.tier!=='first')return;let pool=[];
 for(const [id,relation]of [[p.rivalId,'opponent'],[p.clubId,'teammate']]){
  if(!id)continue;const curated=featuredInteractions.filter(x=>x.clubId===id),roster=(rostersByClub.get(id)||[]).filter(row=>!featuredById.has(String(row[0]))).sort((a,b)=>(b[8]||b[6]||0)-(a[8]||a[6]||0)).slice(0,2),profiles=curated.concat(roster.map(row=>interactionPlayer(row[0])));
  for(const profile of profiles)pool.push(...ensurePlayerScenes(profile).filter(scene=>(scene.relation||'opponent')===relation));
 }
 attachLegendScenes(s,p,pool);registerPendingPlayers(s);
}
function setupInternationalMatch(s){setupInternationalMatchV40(s);const p=s.pending,c=s.international.callup;if(c.level!=='senior'){registerPendingPlayers(s);return;}if(!p?.playerDuel){const national=D.players.filter(row=>row[2]===c.opponent).sort((a,b)=>(b[8]||b[6]||0)-(a[8]||a[6]||0)).slice(0,3),pool=national.flatMap(row=>ensurePlayerScenes(row[0]).filter(x=>(x.relation||'opponent')==='opponent'));attachLegendScenes(s,p,pool);}registerPendingPlayers(s);}
function matchOptions(s){const result=matchOptionsV40(s);if(!result)return null;if(result.relation==='teammate'){const bonus=(s.relationships?.[String(result.playerId)]?.understanding||0)/2500;return{...result,chemistryBonus:round(bonus,3),options:result.options.map(o=>({...o,chance:round(clamp(o.chance+bonus,.1,s.secret?.active?.985:.95),2)}))};}return result;}
function play(s,index){const scene=s.pending?.kind==='match'?matchOptions(s):null,result=playV40(s,index);if(result&&scene?.playerKey){const profile=interactionPlayer(scene.playerKey);if(profile)bondWith(s,profile,result.success,scene.relation||'opponent');}return result;}
function validateV41(s){
 try{if(s.pending?.interactionPlayerIds){if(!Array.isArray(s.pending.interactionPlayerIds)||s.pending.interactionPlayerIds.length>2||s.pending.interactionPlayerIds.some(id=>!interactionRows.has(String(id))))return false;for(const id of s.pending.interactionPlayerIds)ensurePlayerScenes(id);}
 if(!validateV40(s))return false;const bonds=s.relationships||{};if(typeof bonds!=='object'||Array.isArray(bonds)||Object.keys(bonds).length>1200||Object.entries(bonds).some(([id,b])=>!interactionRows.has(id)||![b.trust,b.understanding].every(v=>Number.isFinite(v)&&v>=0&&v<=100)||!Number.isInteger(b.interactions)||b.interactions<0))return false;
 const turn=s.duels.turnInteractions;if(turn&&(!Number.isInteger(turn.step)||turn.step<0||turn.step>s.step||!Array.isArray(turn.used)||turn.used.length>3||new Set(turn.used).size!==turn.used.length||turn.used.some(x=>!['duel','team','learn'].includes(x))))return false;return true;
 }catch{return false;}
}

/* 4.2: stable careers, registration windows, worldwide contacts and fictional player recruitment. */
function registrationKey(s){return s.year+':'+s.quarter;}
function externalMoves(s){return s.careerMoves.filter(m=>['academy','free','transfer','loan','buyout'].includes(m.kind));}
function upgrade(s){
 upgradeV41(s);if(!s||s.v!==2)return s;s.release='4.2';
 if(!s.transferControl){const last=externalMoves(s).at(-1);s.transferControl={lastBatchStep:-100,lastBatchKey:'',lastRegistrationStep:last?.step??-100,lastRegistrationKey:last?((s.originYear||2026)+Math.floor(last.step/4))+':'+last.step%4:'',lastRenewalOfferStep:-100};}
 s.clubContacts=s.clubContacts||[];s.recruitment=s.recruitment||{lastCheckStep:-1,lastInviteStep:-100,leads:[]};return s;
}
function marketOpen(s){return s.quarter===0||s.quarter===2;}
function registrationStatus(s,id,kind='trial'){
 const c=getClub(id),internal=['renewal','promotion'].includes(kind)&&c?.id===s.clubId;
 if(!c)return{allowed:false,title:'球队不存在',reason:'请重新选择球队。'};
 if(s.retired||s.pending)return{allowed:false,title:'先完成当前阶段',reason:'完成比赛或人生抉择后，再处理球队事务。'};
 if(s.route!=='football'||s.age<9)return{allowed:false,title:'当前发展阶段',reason:'选择职业足球路线，并从九岁起评估俱乐部青训。'};
 if(internal)return{allowed:true,internal:true,title:kind==='promotion'?'队内晋升':'本队续约',reason:'队内名单调整与续约可以在注册期之外沟通。'};
 if(s.age<18&&c.country!==s.nation)return{allowed:false,overseasYouth:true,title:'海外青训观察',reason:'可以联系海外青训与短期体验；本作未成年不直接跨国注册，成年后再评估加盟。'};
 const ctrl=s.transferControl,last=ctrl?.lastRegistrationStep??externalMoves(s).at(-1)?.step??-100;
 if(ctrl?.lastRegistrationKey===registrationKey(s))return{allowed:false,title:'本窗口已完成注册',reason:'本窗口已经更换过球队，先履行新计划，避免连续签约。'};
 if(s.loan&&kind!=='buyout')return{allowed:false,title:'正在履行租借',reason:'租借期间先履行协议，或协商回归、买断。'};
 const free=!s.contract;
 if(!free&&!marketOpen(s))return{allowed:false,title:'注册窗口关闭',reason:'现在可联系、考察或听取推荐，正式转会和租借等下一个夏季或冬季注册期。'};
 const minimum=s.age<18?4:kind==='loan'?2:s.transferListed||s.coach<35?2:4;
 if(!free&&kind!=='buyout'&&s.step-last<minimum)return{allowed:false,title:'留队稳定期',reason:kind==='loan'?'新加盟后先适应至少半年，再评估外租。':'新加盟后先稳定效力一年；挂牌或困难处境可在半年后评估。',wait:minimum-(s.step-last)};
 return{allowed:true,free,title:free?(s.age<18?'首次青训 / 自由身份':'自由球员通道'):s.quarter===0?'夏季注册期':'冬季注册期',reason:free?'自由身份可接洽新计划；本作对自由球员注册作简化处理。':'本作按季度简化夏、冬两个注册期，各国真实起止日期不同。'};
}
function eligible(s,c,kind){
 if(s.retired||s.pending)return'请先完成当前阶段。';if(s.route!=='football')return'请先选择职业足球路线。';if(s.age<9)return'9 岁起可以联系俱乐部青训。';
 if(kind==='academy'&&s.age>=18)return'成年球员请联系职业球队。';if(c.id===s.clubId||c.id===s.loan?.clubId)return'你已经效力于这家球队。';
 if(kind==='loan'&&(!s.contract||s.contract.kind!=='pro'||s.loan))return'租借需要有效职业合同，且没有正在进行的租借。';if(kind==='loan'&&s.contract.end-s.step<2)return'母队合同不足半年，请先评估续约。';if(s.loan)return'租借期间请先履行协议或协商回归。';return null;
}
function contactSummary(s){return s.clubContacts.slice().reverse().slice(0,8);}
function trialProbability(s,c,kind='trial'){const base=trialProbabilityV41(s,c,kind);if(s.secret?.active)return base;const referral=s.recruitment?.leads.some(l=>l.clubId===c.id&&!l.followed&&s.step-l.created<=6&&l.response?.success&&['agent','role'].includes(l.response.choice));const observed=s.clubContacts?.some(x=>x.clubId===c.id&&x.success&&s.step-x.step<=8);return round(clamp(base+(referral?.07:0)+(observed?.02:0),.08,.96),2);}
function applyClub(s,id,kind='trial'){
 upgrade(s);const c=getClub(id);if(!c)return{ok:false,message:'没有找到这家俱乐部。'};if(s.age<18&&kind==='trial')kind='academy';const error=eligible(s,c,kind);if(error)return{ok:false,message:error};
 const status=registrationStatus(s,id,kind);
 if(status.allowed){const result=applyClubV41(s,id,kind);if(result.ok&&result.offer){result.offer.source='contact';const lead=s.recruitment.leads.find(l=>l.clubId===id&&l.response?.success&&!l.followed&&s.step-l.created<=6);if(lead){result.offer.recruiterId=lead.playerId;result.offer.reason=lead.playerName+'的推荐带来了正式沟通；最终合同仍由俱乐部决定。';lead.followed=true;}s.clubContacts.filter(x=>x.clubId===id).forEach(x=>x.followed=true);}return result;}
 if(s.applications.some(a=>a.id===id&&a.step===s.step&&a.kind===kind))return{ok:false,message:'本阶段已经联系过这家球队，结果已记录。'};
 if(s.applications.filter(a=>a.step===s.step).length>=4)return{ok:false,message:'每季度最多联系四家球队，请先比较已获得的信息。'};
 const chance=trialProbability(s,c,kind),roll=rand(s),success=roll<chance,type=status.overseasYouth?'youth-observation':'future-interest';
 s.applications.push({id,kind,step:s.step,chance,success});const record={clubId:id,kind,type,step:s.step,chance,roll,success,followed:false};s.clubContacts.push(record);if(s.clubContacts.length>40)s.clubContacts.shift();
 if(success)apply(s,{network:.5});const text=status.overseasYouth?(success?'海外青训愿意持续观察你，可以讨论短期体验；这不是跨国注册或职业合同。':'海外青训暂未安排观察，先积累同龄赛事表现。'):(success?'球队愿意持续考察，已记录下个可注册阶段的接洽意向。当前合同和球队保持不变。':'球队暂未推进考察，继续提升表现再评估下一次联系。');
 note(s,'联系 '+(c.cn||c.n),text,'application',{success,chance});return{ok:success,rolled:true,contact:true,record,chance,message:text};
}
function makeOpportunity(s,c,kind,reason,source='scout'){
 if(!c||s.offers.some(o=>o.clubId===c.id&&o.status==='active'&&o.expires>=s.step))return null;
 const t=offerTerms(s,c,kind);if(kind==='loan'){t.wage=s.contract.wage;t.appBonus=s.contract.appBonus;t.goalBonus=s.contract.goalBonus;t.release=s.contract.release;t.signingBonus=0;t.duration=s.contract.end-s.step>=4?4:2;t.squad='first';t.role=rating(s)>=c.power-8?'starter':'rotation';}
 if(kind==='renewal')t.wage=Math.max(s.contract.wage,t.wage);
 const o={id:'offer'+s.nextId++,clubId:c.id,kind,source,reason,created:s.step,expires:s.step+(kind==='renewal'?1:0),status:'active',terms:t,base:JSON.parse(JSON.stringify(t)),attempts:0,releaseAgreed:true,transferFee:s.contract?.kind==='pro'&&!['loan','renewal'].includes(kind)?valuation(s):0};
 s.offers.push(o);s.invitationMemory.push({clubId:c.id,step:s.step});return o;
}
function scoutInvitations(s,force=false){
 upgrade(s);if(s.pending||s.retired||s.route!=='football'||s.age<9||s.loan)return[];const ctrl=s.transferControl,offers=[];
 const remaining=s.contract?s.contract.end-s.step:0,active=s.offers.filter(o=>o.status==='active'&&o.expires>=s.step);
 if(s.contract&&remaining<=2&&s.step-s.contract.start>=4&&s.step-ctrl.lastRenewalOfferStep>=2&&!active.some(o=>o.kind==='renewal')){const own=makeOpportunity(s,getClub(s.clubId),'renewal','合同进入最后半年，现俱乐部希望讨论下一份计划。','club');if(own){offers.push(own);ctrl.lastRenewalOfferStep=s.step;}}
 if(!marketOpen(s)&&s.contract)return offers;
 const batchKey=marketOpen(s)?registrationKey(s):'free:'+Math.floor(s.step/2);
 if(ctrl.lastBatchKey===batchKey||s.step-ctrl.lastBatchStep<2||active.filter(o=>o.clubId!==s.clubId).length>=2)return offers;
 const need=!s.contract||remaining<=2||s.transferListed||s.age>=18&&s.contract.role==='prospect'&&s.coach<45;
 if(!need)return offers;
 const kind=s.age<18?'academy':s.contract&&remaining>2&&!s.transferListed?'loan':'trial';
 if(s.contract&&!registrationStatus(s,s.clubId,kind).allowed)return offers;
 ctrl.lastBatchStep=s.step;ctrl.lastBatchKey=batchKey;s.lastScoutStep=s.step;
 const r=rating(s),target=s.age<18?r+20:r+3,recent=new Set(s.invitationMemory.filter(x=>s.step-x.step<8).map(x=>x.clubId));
 let pool=D.clubs.filter(c=>c.id!==s.clubId&&!c.historical&&(s.age<18?c.country===s.nation:c.source==='tm'||c.current)).map(c=>getClub(c.id));
 const fresh=pool.filter(c=>!recent.has(c.id));if(fresh.length>=3)pool=fresh;
 const domestic=pool.filter(c=>c.country===s.nation),local=domestic.length>=2?domestic:pool,chosen=[];
 for(const [index,items]of [local,local,s.age<18?local:pool].entries()){const sorted=items.map(c=>({c,score:index===0?85-Math.abs(c.power-target+8)*2+c.playing*.08:index===1?c.academy-Math.abs(c.power-target)*.8:85-Math.abs(c.power-target-10)*2+c.power*.1})).sort((a,b)=>b.score-a.score).slice(0,60).map(x=>({...x,score:x.score+rand(s)*6})).sort((a,b)=>b.score-a.score);const c=sorted.find(x=>!chosen.some(y=>y.id===x.c.id))?.c;if(c)chosen.push(c);}
 if(!s.firstAcademyId&&s.nation==='China'&&s.age<18&&!chosen.some(c=>c.id===SHENZHEN_ID))chosen.push(getClub(SHENZHEN_ID));
 if(s.heritage&&!s.firstAcademyId&&s.age<18){const c=getClub(s.heritage.parentClubId);if(c?.country===s.nation&&!chosen.some(x=>x.id===c.id))chosen.push(c);}
 if(s.secret?.active&&s.age>=18){chosen.splice(0,chosen.length,...['tm418','tm281','tm131'].filter(id=>id!==s.clubId).map(getClub));}
 for(const [i,c]of chosen.entries()){const o=makeOpportunity(s,c,kind,['球探在阶段评估后提出稳定比赛的方案。','培养部门在注册期提供成长计划。','球队愿在本次注册期讨论更高平台的机会。'][Math.min(i,2)],s.secret?.active?'destiny':'scout');if(o)offers.push(o);}
 if(offers.length)note(s,'注册期 · 阶段性来信',`${offers.length} 份方案等待比较。保持现合同、继续留队也是完整的发展选择。`,'offer');return offers;
}
function sign(s,id){
 upgrade(s);const o=s.offers.find(x=>x.id===id&&x.status==='active');if(!o||o.expires<s.step)return{ok:false,message:'意向已失效，请重新联系。'};
 const c=getClub(o.clubId),status=registrationStatus(s,o.clubId,o.kind);if(!status.allowed)return{ok:false,message:status.title+'：'+status.reason};
 if(o.kind==='academy'&&s.age>=18)return{ok:false,message:'成年后请重新评估职业合同，不再签少年青训协议。'};
 if(o.kind==='renewal'&&(o.clubId!==s.clubId||!s.contract))return{ok:false,message:'原合同已变化，无法继续这份续约。'};
 if(o.kind==='promotion'){
  if(o.clubId!==s.clubId||!s.contract||s.loan||s.age<16||squadTier(s)==='first')return{ok:false,message:'当前不符合本队晋升条件。'};
  s.squad='first';s.contract.squad='first';s.contract.role=o.terms.role;s.contract.promisedRole=o.terms.role;s.coach=clamp(s.coach+3);o.status='signed';s.offers=s.offers.filter(x=>x.status!=='active'||x.kind!=='promotion');s.careerMoves.push({step:s.step,age:s.age,kind:'promotion',from:s.clubId,to:s.clubId});note(s,'升入本队一线队','教练组调整了你的训练与比赛名单，原合同期限及薪资继续履行，不重复支付签字费。','contract');checkAchievements(s);return{ok:true,message:'一线队晋升已确认，原合同继续履行。'};
 }
 if(c.id===s.clubId&&o.kind!=='renewal')return{ok:false,message:'你已经效力于这支球队，请使用续约或晋升渠道。'};
 if(o.kind==='renewal'&&(s.contract.end-s.step>4||s.step-s.contract.start<4))return{ok:false,message:'合同仍稳定履行，通常进入最后一年再谈续约。'};
 if(o.kind==='loan'&&(!s.contract||s.contract.kind!=='pro'||s.loan||s.contract.end-s.step<2))return{ok:false,message:'当前不符合租借条件。'};
 const result=signV41(s,id);if(result.ok&&!['renewal','promotion'].includes(o.kind)){s.transferControl.lastRegistrationStep=s.step;s.transferControl.lastRegistrationKey=registrationKey(s);s.clubContacts.forEach(x=>{if(x.clubId===c.id)x.followed=true;});}return result;
}
function renewal(s){upgrade(s);if(s.contract&&(s.contract.end-s.step>4||s.step-s.contract.start<4))return{ok:false,message:'先稳定履行现有合同，进入最后一年再评估续约。'};return renewalV41(s);}
function promotionInvitation(s){const o=promotionInvitationV41(s);if(o){o.terms.wage=s.contract.wage;o.terms.signingBonus=0;o.base=JSON.parse(JSON.stringify(o.terms));}return o;}
function practiceLegend(s,key,index,sceneId){const result=practiceLegendV41(s,key,index,sceneId);if(result.ok)s.duels.lastInteraction={step:s.step,playerId:result.profile.playerId,playerKey:result.profile.key,kind:result.kind,sceneId:result.scene.id,index,success:result.success,chance:result.chance,roll:result.roll,choice:result.choice};return result;}
function recruitmentChoices(s,lead){
 const base=clamp(.67+s.reputation/800+(s.relationships?.[String(lead.playerId)]?.understanding||0)/1000,.55,.9);
 return[{id:'agent',n:'愿意了解，让经纪团队接洽',chance:round(base,2),good:'推荐进入球队考察名单，可在合适窗口联系俱乐部，合同仍需正式谈判。',bad:'球员愿意推荐，但俱乐部暂时没有对应名额。'},
 {id:'role',n:'先问角色、薪资与发展计划',chance:round(clamp(base+.1,.1,.95),2),good:'对方介绍了可能的队内角色，建议你比较出场空间后再决定。',bad:'对方无法代表管理层承诺薪资与主力位置，信息仍不明确。'},
 {id:'later',n:'先完成本赛季，之后再聊',chance:.88,good:'对方尊重你的职业态度，愿意为未来保持联系。',bad:'球队下阶段可能调整引援方向，这次联系暂时冷却。'},
 {id:'decline',n:'婉拒招募，专注现在的球队',chance:.94,good:'你表达了尊重，也向本队明确了留队态度。',bad:'对方有些失望，近期不会再推动这次推荐。'}];
}
function updateRecruitment(s,result=s.lastResult){
 upgrade(s);const R=s.recruitment;if(R.lastCheckStep===s.step||s.pending||s.retired||s.age<18||s.route!=='football'||squadTier(s)!=='first')return null;R.lastCheckStep=s.step;
 if(!result?.professional||result.apps<3||s.injury||s.step-R.lastInviteStep<4||R.leads.some(l=>l.status==='new'&&s.step<=l.expires))return null;
 const r=rating(s),good=result.matchRating>=7.2||s.form>=78&&r>=65||s.secret?.active;if(!good||r<55)return null;
 const probability=s.secret?.active?.95:clamp(.3+(result.matchRating-7)*.16+s.reputation/400,.24,.8);if(rand(s)>=probability)return null;
 const used=new Set(R.leads.filter(l=>s.step-l.created<12).map(l=>l.clubId)),known=g.CAREER_INTERACTION_PROFILES||[];
 let pool=known.filter(p=>p.clubId!==s.clubId&&p.clubId!==s.loan?.clubId&&!used.has(p.clubId)).filter(p=>{const c=getClub(p.clubId);return c&&!c.historical&&c.power>=r-20&&c.power<=r+18;});
 if(!pool.length)return null;
 const abroad=pool.filter(p=>getClub(p.clubId).country!==s.nation);if(abroad.length&&rand(s)<.65)pool=abroad;
 const profile=choose(s,pool),club=getClub(profile.clubId),t=offerTerms(s,club,'trial'),a=offerAnalysis(s,{clubId:club.id,terms:t});
 const lead={id:'recruit'+s.nextId++,clubId:club.id,playerId:profile.playerId,playerName:profile.name,created:s.step,expires:s.step+4,status:'new',followed:false,reason:result.matchRating>=7.2?'你的阶段比赛评分 '+result.matchRating+' 引起了注意':'你的持续状态与一线队表现引起了注意',plan:{wage:t.wage,role:a.role,tierName:a.tierName,minutes:a.minutes,development:a.development,advice:a.advice},response:null};
 R.leads.push(lead);if(R.leads.length>20)R.leads.shift();R.lastInviteStep=s.step;note(s,'球员主动招募 · '+profile.name,`${profile.name}希望与你在${club.cn||club.n}成为队友。球员的推荐是游戏情节，不等同于俱乐部报价。`,'recruitment');return lead;
}
function answerRecruitment(s,id,choice){
 upgrade(s);const lead=s.recruitment.leads.find(l=>l.id===id);if(!lead||lead.status!=='new'||s.step>lead.expires||s.pending||s.retired)return{ok:false,message:'这次招募已处理或已过期，请先完成当前阶段。'};
 const option=recruitmentChoices(s,lead).find(c=>c.id===choice);if(!option)return{ok:false,message:'请选择一种回复。'};const roll=rand(s),success=roll<option.chance;lead.status=choice==='decline'?'declined':choice==='later'?'deferred':'answered';lead.response={choice,chance:option.chance,roll,success,text:success?option.good:option.bad,step:s.step};
 if(choice==='decline'&&success)apply(s,{loyalty:2,coach:1});else if(success)apply(s,{network:1,knowledge:choice==='role'?1:0});
 const profile=interactionPlayer(lead.playerId);if(profile)bondWith(s,profile,success,'training');note(s,'回复 '+lead.playerName,lead.response.text,'recruitment');return{ok:true,lead,success,message:lead.response.text};
}
function finish(s){const result=finishV41(s);if(result){const lead=updateRecruitment(s,result);result.newRecruitment=lead?.id||null;}return result;}
function validate(s){
 try{if(!validateV41(s))return false;const T=s.transferControl;if(!T||!['lastBatchStep','lastRegistrationStep','lastRenewalOfferStep'].every(k=>Number.isInteger(T[k])&&T[k]>=-100&&T[k]<=s.step)||!['lastBatchKey','lastRegistrationKey'].every(k=>typeof T[k]==='string'&&T[k].length<=40))return false;
 if(!Array.isArray(s.clubContacts)||s.clubContacts.length>40||s.clubContacts.some(x=>!clubs.has(x.clubId)||!['academy','trial','loan'].includes(x.kind)||!['youth-observation','future-interest'].includes(x.type)||!Number.isInteger(x.step)||x.step<0||x.step>s.step||!Number.isFinite(x.chance)||x.chance<0||x.chance>1||!Number.isFinite(x.roll)||x.roll<0||x.roll>1||typeof x.success!=='boolean'||typeof x.followed!=='boolean'))return false;
 const R=s.recruitment;if(!R||!Number.isInteger(R.lastCheckStep)||R.lastCheckStep< -1||R.lastCheckStep>s.step||!Number.isInteger(R.lastInviteStep)||R.lastInviteStep< -100||R.lastInviteStep>s.step||!Array.isArray(R.leads)||R.leads.length>20)return false;
 for(const l of R.leads){const p=interactionPlayer(l.playerId);if(!p||p.clubId!==l.clubId||!clubs.has(l.clubId)||typeof l.id!=='string'||!/^recruit\d+$/.test(l.id)||typeof l.playerName!=='string'||l.playerName.length>100||!['new','answered','deferred','declined'].includes(l.status)||!Number.isInteger(l.created)||l.created<0||l.created>s.step||!Number.isInteger(l.expires)||l.expires!==l.created+4||typeof l.followed!=='boolean'||!l.plan||!Number.isFinite(l.plan.wage)||l.plan.wage<0)return false;if(l.response&&(!['agent','role','later','decline'].includes(l.response.choice)||typeof l.response.success!=='boolean'||![l.response.chance,l.response.roll].every(v=>Number.isFinite(v)&&v>=0&&v<=1)||typeof l.response.text!=='string'||l.response.text.length>500))return false;}
 return true;}catch{return false;}
}

g.ProEngine={registrationStatus,registrationKey,contactSummary,recruitmentChoices,updateRecruitment,answerRecruitment,promotionInvitation,interactionPlayer,interactionPosition,ensurePlayerScenes,interactionCounts,listInteractions,interactionScene,availableInteractionKinds,interactionUsage,TACTICS,MENTORING,SHENZHEN_ID,setupMatch,setupInternationalMatch,achievementStatus,checkAchievements,createChild,mentorChild,nextGeneration,answerCallup,nationalCalendar,callupChance,updateCallup,practiceScene,practiceLegend,legendCatalog,setTactic,worldHonors,start,migrate,validate,upgrade,squadTier,competitionContext,arcSpan,arcLabel,offerAnalysis,scoutInvitations,declineOffer,autoMatch,attrs,positions,training,phases,roles,stage,rating,valuation,getClub,activeClub,date,rand,normal,clamp,round,events:EVENTS,prepare,currentEvent,eventProbability,chooseEvent,next,matchOptions,play,finish,ensureLeague,leagueKey,trialProbability,applyClub,negotiate,negotiationChance,sign,renewal,transferRequest,recall,buyout,hireAgent,route,release,changePosition,retire,injuryChance,marketOpen};
})(typeof window!=='undefined'?window:globalThis);
