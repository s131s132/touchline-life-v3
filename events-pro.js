(function(g){
const events=[];
// Every option has a cost, a positive outcome and an adverse outcome; the engine
// calculates the actual probability from the current player and context.
function event(id,age,title,text,items,context='any',category='成长'){events.push({id,min:age[0],max:age[1],title,text,context,category,choices:items.map(v=>({label:v[0],check:v[1],base:v[2],good:v[3],bad:v[4],success:v[5],failure:v[6],cost:v[7]||{},follow:v[8]||null}))});}
event('street',[7,10],'水泥地上的第一次过人','放学后，年长的孩子邀请你参加街头对抗。你能碰到球的机会不多，但每一次触球都让你兴奋。',[
 ['主动挑战年长的对手','technique',.62,{technique:2,confidence:5},{confidence:-5,health:-2},'你完成了一次漂亮的摆脱，开始敢于拿球。','身体和经验的差距让你吃了苦头，也有些失落。'],
 ['先和同龄伙伴练基础','composure',.8,{technique:1.4,friendship:4},{motivation:-3},'稳定触球让基本功慢慢扎实。','重复练习让你走神，今天进步有限。'],
 ['请家长陪着一起练','family',.76,{family:5,motivation:4},{family:-2,confidence:-2},'家人的陪伴给了你继续坚持的勇气。','家长临时加班没能到场，你有些失望。']]);
event('homework',[7,12],'训练和作业，挤在同一个傍晚','老师提醒你作业开始落下，而社区教练又增加了一次训练。你需要学会安排时间。',[
 ['先完成作业，再去练球','discipline',.78,{education:5,composure:1},{fatigue:5,motivation:-2},'你找到了节奏，学习和训练都没有落下。','时间比想象中紧张，你疲惫地赶到了球场。'],
 ['把今晚全部留给足球','technique',.65,{technique:2,coach:3},{education:-5,family:-3},'全神贯注的练习得到了教练的表扬。','第二天的课堂小测让你和家长都感到了压力。'],
 ['和老师协商新的安排','composure',.7,{education:4,family:3},{education:-2,confidence:-2},'老师同意帮你制定学习计划。','沟通没有达到预期，你仍需要自己补上课程。']]);
event('boots',[7,11],'那双价格不菲的球鞋','你看上了一双新的球鞋。家里的预算有限，父母希望你认真想想真正需要的是什么。',[
 ['攒钱买适合自己的鞋','discipline',.8,{motivation:5,discipline:2},{cash:-60,motivation:-2},'你穿上了自己攒钱买来的球鞋，更加珍惜每一次训练。','选到的款式并不合脚，只能重新调整。',{cash:-90}],
 ['保养旧鞋，把钱留给训练','composure',.78,{family:4,technique:1},{motivation:-3},'父母看到了你的认真，愿意陪你继续踢下去。','旧鞋的磨损比想象中严重，影响了练习。'],
 ['参加社区的装备互助活动','friendship',.7,{friendship:5,cash:50},{confidence:-3},'一位学长把合适的装备送给了你。','这次没有找到合适的尺寸，但你认识了新的伙伴。']]);
event('coachparent',[7,11],'场边传来两种声音','家长不停提示你传球，教练却希望你自己判断。你在球场上变得犹豫。',[
 ['赛后和家长聊聊感受','composure',.74,{family:5,confidence:4},{family:-3,confidence:-2},'家长答应少一点指挥，多一点支持。','双方暂时没有理解彼此，气氛有些紧张。'],
 ['把注意力只放在教练身上','discipline',.75,{coach:5,positioning:1},{family:-3,motivation:-2},'你的判断更加清晰，教练认可了你的执行。','家长觉得自己的付出没有得到回应。'],
 ['在训练中大胆做自己的决定','vision',.56,{vision:2,confidence:5},{coach:-4,confidence:-4},'一次独立判断让你看见了自己的可能。','你选错了时机，教练要求你重新理解战术。']]);
event('firstloss',[7,12],'比分牌第一次让你想哭','一场大比分失利后，有队友互相埋怨。你也开始怀疑自己是不是适合踢球。',[
 ['和队友一起复盘失误','composure',.76,{composure:2,friendship:5},{confidence:-3},'你们找到可以改进的地方，也重新团结起来。','复盘变成了争论，大家需要更多时间冷静。'],
 ['下次用表现证明自己','motivation',.65,{motivation:7,finishing:1.5},{fatigue:6,confidence:-4},'额外练习帮你找回了信心。','过度想证明自己，让你在训练中更加急躁。'],
 ['找家人聊聊这份难过','family',.82,{family:4,motivation:5},{confidence:-2},'你知道了，输球不会改变家人对你的支持。','这次谈话没能立刻解开心结。']]);
event('leftfoot',[8,14],'只靠惯用脚，够不够？','教练发现你总是把球调整到惯用脚，常常因此错过出球时机。',[
 ['每天专门练习非惯用脚','discipline',.72,{weakFoot:6,technique:1},{fatigue:4,confidence:-2},'你开始能够在两侧处理球，选择多了起来。','进步比预想更慢，你需要更多耐心。'],
 ['继续强化最擅长的技术','technique',.78,{technique:2,finishing:1},{vision:-1},'你的招牌动作变得更有威胁。','对手已经能预判你的惯用脚路线。'],
 ['在小场比赛里强制换脚','confidence',.56,{weakFoot:9,vision:1},{confidence:-5,coach:-2},'实战压力让你跨过了最难的一步。','连续的失误让你短暂失去信心。']]);
event('summer',[8,13],'暑期训练营的邀请','一家足球学校邀请你参加付费训练营。课程听起来很吸引人，但投入并不一定换来机会。',[
 ['参加，争取适应更高水平','adaptability',.66,{technique:2,scouting:6},{motivation:-4,fatigue:5},'你遇到了更强的对手，也得到了一份球探观察记录。','训练强度和环境让你难以适应。',{cash:-180}],
 ['留在熟悉的社区继续练习','discipline',.8,{technique:1.5,family:3},{scouting:-2},'稳定的节奏让你继续向前。','这一段时间缺少足够强的对手来刺激进步。'],
 ['争取奖学金或免费名额','education',.55,{scouting:8,education:2},{confidence:-3},'你的学习和训练记录打动了营地负责人。','名额竞争激烈，这次你没有入选。']]);
event('academychoice',[10,14],'离家更远的那座青训基地','你去参观了俱乐部青训基地。设施、课程和比赛很吸引人，但寄宿生活也是全新的挑战。',[
 ['主动体验寄宿和集体训练','adaptability',.65,{adaptability:5,scouting:5,coach:3},{family:-5,motivation:-4},'你喜欢上了训练基地的节奏，球探也记住了你。','离家的不安让你几晚没有睡好。'],
 ['先选择通勤训练，保留学业','discipline',.76,{education:4,family:3},{fatigue:5},'家校和训练的安排逐渐稳定。','往返通勤占用了太多休息时间。'],
 ['和家长详细比较培养方案','education',.78,{education:3,scouting:3,composure:1},{motivation:-2},'你更清楚自己需要怎样的成长环境。','信息太多，你暂时变得更加犹豫。']]);
event('homesick',[10,17],'宿舍熄灯后，你想家了','新的队友和作息还不熟悉。你盯着手机，想起家里的晚饭和熟悉的街道。',[
 ['给家里打电话，认真谈谈','family',.8,{family:5,motivation:5},{confidence:-2},'家人的声音让你安定下来。','电话里越聊越想家，今晚有些难熬。'],
 ['邀请室友一起做恢复训练','friendship',.68,{friendship:6,adaptability:3},{fatigue:4,confidence:-2},'你交到了第一个真正的朋友。','对方没能回应你的热情，关系还需要时间。'],
 ['自己消化，把情绪带到训练','composure',.57,{composure:2,coach:4},{motivation:-7,confidence:-4},'你用专注把情绪变成了训练动力。','压抑的情绪开始影响你的发挥。']], 'club','适应');
event('schoolfinal',[11,17],'升学考试撞上了邀请赛','学校希望你参加模拟考试，教练则把你写进了外地邀请赛名单。没有一种安排能让所有人满意。',[
 ['优先参加考试，赛后补练','education',.8,{education:7,family:4},{coach:-5},'好成绩让你的未来多了一条路。','教练对你的缺席感到失望。'],
 ['参加邀请赛，争取证明自己','confidence',.61,{scouting:8,confidence:5},{education:-6,family:-3},'你的表现得到了更多球队的关注。','没有获得足够出场时间，课程也落下了。'],
 ['和双方协商分段参加','composure',.63,{education:4,coach:3},{fatigue:8,education:-3},'认真沟通让你获得了折中的安排。','紧凑的行程让两边的准备都不充分。']]);
event('growth',[11,17],'突然长高以后，球感变陌生了','最近几周，你总觉得步幅和触球距离对不上。教练说，适应变化也属于成长的一部分。',[
 ['降低强度，重新练习协调','discipline',.82,{coordination:6,health:4},{confidence:-2},'你逐渐找回了身体和球的节奏。','适应仍然需要时间，短期状态没有明显起色。'],
 ['增加灵敏与平衡练习','stamina',.67,{coordination:8,acceleration:1},{fatigue:7,health:-4},'专项练习让你重新控制住了动作。','新增负荷让身体更加疲惫。'],
 ['继续原有高强度训练','strength',.47,{strength:2,coach:4},{health:-8,coordination:-4},'你扛住了变化，教练看到了你的韧性。','动作不协调让你出现了小伤和信心波动。']]);
event('selection',[12,18],'精英梯队的最后一个名额','同位置的竞争者近期表现出色。选拔名单公布前，只剩下几次合练。',[
 ['突出自己的长处','technique',.64,{coach:8,scouting:6},{coach:-5,confidence:-5},'你用鲜明的特点打动了选拔教练。','教练更看重另一种类型，这次你没有占到优势。'],
 ['执行战术，争取教练信任','discipline',.78,{coach:6,positioning:1},{confidence:-3},'你的可靠程度为自己赢得了加分。','过于谨慎让你没有展现足够的个人特点。'],
 ['帮助对手，一起提升','friendship',.72,{friendship:7,composure:1,coach:3},{scouting:-2},'你在竞争中表现出的气度赢得了认可。','团队关系改善了，但位置竞争依旧残酷。']], 'club','选拔');
event('position',[12,20],'教练建议你尝试新的角色','球队战术改变了。教练认为你可能在新的职责中发挥优势，你却还舍不得熟悉的踢法。',[
 ['学习新的跑位与职责','vision',.68,{versatility:8,coach:5,positioning:1},{form:-5,confidence:-3},'你的多面性让你更容易进入比赛名单。','新职责让你暂时失去了节奏。'],
 ['请求保留原有踢法','composure',.59,{technique:2,confidence:4},{coach:-7},'教练接受了你的解释，并给你一次展示的机会。','教练认为你不愿为战术做出调整。'],
 ['加练，争取两种角色都能踢','stamina',.58,{versatility:10,coach:4},{fatigue:9,health:-4},'额外练习让你具备了更多战术价值。','训练负荷过大，影响了接下来的比赛。']], 'club','战术');
event('familybudget',[12,17],'家里的开支开始吃紧','通勤、装备和训练费用持续增加。家人没有要求你放弃，但你看到了他们的压力。',[
 ['向俱乐部申请资助','scouting',.61,{cash:300,family:5},{confidence:-3},'你的训练态度和表现赢得了一笔资助。','资助名额有限，申请没有获批。'],
 ['减少额外课程，专注基础','discipline',.8,{family:5,cash:100},{scouting:-3},'更节制的安排减轻了家里的压力。','缺少额外对抗机会，曝光度有所下降。'],
 ['用成绩争取学校体育支持','education',.64,{education:4,cash:250},{education:-2,fatigue:5},'学习和足球表现帮你争取到了支持。','准备材料和训练挤占了休息。']]);
event('youthdeal',[15,17],'第一份青年培养协议','俱乐部愿意继续培养你，但训练安排、补贴和升入一线队的路径都需要认真了解。',[
 ['和监护人、经纪顾问一起审阅','education',.8,{knowledge:7,coach:3},{motivation:-2},'你学会了区分培养承诺和实际出场机会。','谈判过程比预想更长，等待让你焦虑。'],
 ['先专注梯队表现，再谈条件','discipline',.74,{coach:6,technique:1},{knowledge:-3},'稳定的表现增加了你后续谈判的底气。','你错过了及时表达自己需求的机会。'],
 ['向一线队学长请教','friendship',.7,{knowledge:5,network:5},{confidence:-3},'前辈的经验帮你避开了一些盲点。','不同人的建议互相矛盾，你更加犹豫。']], 'club','合同');
event('releasefear',[15,19],'赛季评估前的忐忑','几位同龄球员没有拿到下一阶段的培养名额。你开始担心自己也会被留在名单之外。',[
 ['主动询问可执行的提升目标','composure',.75,{coach:7,motivation:4},{confidence:-4},'明确的反馈让你知道了该往哪里努力。','反馈比你预想更严厉，你一时难以消化。'],
 ['悄悄联系其他培养机会','network',.59,{network:9,scouting:4},{coach:-6},'你为自己准备了一条备用道路。','消息传回球队，教练对你的专注度有所保留。'],
 ['把时间全部投入加练','discipline',.62,{technique:2,coach:5},{fatigue:9,health:-4},'你的训练态度在评估中得到了肯定。','身体没有完全恢复，发挥反而受到影响。']], 'club','选拔');
event('agentpromise',[16,23],'一位经纪人承诺带你去豪门','他展示了联系人名单，也催促你尽快付一笔服务费用。机会听起来很好，但没有任何书面保证。',[
 ['核查资质和过往案例','knowledge',.8,{knowledge:6,network:3},{motivation:-3},'你识别了不切实际的承诺，避免了额外损失。','调查花了时间，却仍没有得到明确答案。'],
 ['要求透明条款，按成果付费','composure',.65,{network:8,scouting:5},{network:-3,cash:-150},'对方接受了更清晰的合作条件。','对方撤回邀请，你也付出了一些沟通成本。'],
 ['相信承诺，提前投入费用','confidence',.34,{network:14,scouting:10},{cash:-700,confidence:-7},'一次冒险换来了新的试训联系人。','承诺没有兑现，损失只能由自己承担。',{cash:-200}]],'any','经纪');
event('firstteam',[16,21],'第一次和一线队合练','训练速度比梯队快得多。你既想证明自己，又担心一次失误就失去下一次机会。',[
 ['简单处理，先适应节奏','positioning',.77,{coach:6,adaptability:4},{confidence:-3},'你完成了战术要求，得到了继续合练的机会。','过于谨慎让你没有展示足够的主动性。'],
 ['大胆完成高难度处理','technique',.53,{scouting:8,coach:7},{coach:-6,confidence:-5},'一次出色的处理让一线队教练记住了你。','节奏差距暴露出来，你连续丢失球权。'],
 ['主动请教同位置前辈','friendship',.73,{network:5,positioning:1.5},{confidence:-2},'前辈愿意在训练后带你复盘。','对方没有太多时间，你还得先靠自己适应。']], 'club','突破');
event('u19captain',[16,20],'青年队长，还是一线队替补','教练认为你在青年队可以承担更多责任，但一线队替补席也有诱惑。',[
 ['在青年队学习带领队友','composure',.77,{leadership:7,coach:4,confidence:4},{scouting:-2},'带队经历让你的比赛理解更成熟。','青年比赛的对抗已经难以充分刺激成长。'],
 ['争取一线队的零星机会','confidence',.53,{scouting:7,coach:6},{form:-7,confidence:-4},'你抓住了有限的机会，走近了一线队。','长时间等待出场让状态有些生疏。'],
 ['和教练制定两级比赛计划','knowledge',.66,{coach:6,leadership:3},{fatigue:7},'更合理的分配帮助你保持比赛节奏。','频繁切换让准备和恢复都变得困难。']], 'club','突破');
event('loanidea',[18,24],'留下等机会，还是出去踢比赛','经纪团队提醒你，训练设施再好，也替代不了真实比赛。你的球队还有一位成名球星占据同一位置。',[
 ['明确提出愿意外租锻炼','composure',.76,{loanSupport:12,network:4},{coach:-4},'球队愿意积极为你寻找合适的租借目的地。','教练担心你缺乏争取队内位置的决心。'],
 ['留队竞争，争取打动主帅','discipline',.61,{coach:7,confidence:4},{form:-6,motivation:-4},'训练表现让你离比赛名单更近了一步。','等待的时间比预期更长，信心受到影响。'],
 ['要求只接受保证主力的安排','knowledge',.56,{loanSupport:8,knowledge:3},{network:-4},'清晰的目标帮经纪人缩小了选择范围。','条件过于严格，愿意接洽的球队减少了。']], 'club','租借');
event('loanadapt',[17,29],'租借球队不是想象中的样子','新的队友、训练方式和球场环境都很陌生。租借协议给了你舞台，却没有保证每一分钟。',[
 ['主动融入更衣室','friendship',.73,{adaptability:5,coach:5,friendship:5},{confidence:-3},'你逐渐得到队友支持，更容易接到关键传球。','关系尚未建立，场上配合仍显生疏。'],
 ['和两家俱乐部一起定期复盘','knowledge',.76,{coach:6,loanSupport:5},{motivation:-2},'明确反馈让你更清楚回归母队前要做到什么。','多方意见不完全一致，压力有所增加。'],
 ['直接用表现争取主力','confidence',.58,{form:8,scouting:5},{coach:-5,confidence:-4},'你在有限的时间里抓住了机会。','过于急切的表现让主教练更倾向于其他人。']], 'loan','租借');
event('bench',[18,33],'连续三场坐在替补席','教练没有详细解释选择。媒体开始猜测你的前景，你必须决定怎么回应。',[
 ['私下和教练沟通','composure',.77,{coach:7,knowledge:3},{coach:-3,confidence:-2},'你得到了具体的改进要求，关系也更透明了。','对话没有解决核心分歧，你需要继续等待。'],
 ['通过训练改变竞争结果','discipline',.68,{form:6,coach:5},{fatigue:8,health:-3},'你的训练表现让教练重新考虑了名单。','额外负荷没有立刻换来出场，身体却更加疲惫。'],
 ['公开表达对出场时间的不满','confidence',.32,{network:7,scouting:4},{coach:-12,reputation:-4},'讨论让其他球队关注到了你的处境。','更衣室对此产生意见，信任明显下降。']], 'club','竞争');
event('negotiate',[18,34],'合同桌上的取舍','提高周薪、更长合同、更好角色和较低解约金，俱乐部不愿同时全部答应。你需要想清楚优先级。',[
 ['优先争取出场规划','knowledge',.75,{coach:4,knowledge:5},{network:-2},'你更清楚对方准备如何使用你。','口头规划仍有不确定性，你无法立即得到答案。'],
 ['让经纪人争取更好的待遇','network',.63,{network:5,reputation:3},{coach:-4,cash:-250},'市场比较让谈判更有依据。','强硬的姿态让球队对续约有所犹豫。'],
 ['保留灵活性，不急于决定','composure',.61,{knowledge:4,confidence:3},{motivation:-4},'等待带来了更多可比较的机会。','等待也增加了短期的不确定性。']], 'club','合同');
event('ankle',[14,38],'轻微疼痛和重要比赛','训练后，脚踝出现不适。恢复计划会减少训练时间，比赛名单却很快就要确定。',[
 ['接受降负荷与恢复安排','discipline',.83,{health:7,fatigue:-9},{form:-3},'不适逐渐减轻，你保住了后续的训练连续性。','疼痛没有很快消失，状态仍受影响。'],
 ['在评估后参加有限训练','composure',.68,{coach:3,health:3},{health:-5,fatigue:6},'你平稳完成了有限训练，没有打乱恢复。','训练中的负荷比预期更大，恢复被延后。'],
 ['隐瞒不适，继续满负荷训练','strength',.3,{coach:5,confidence:3},{injuryWeeks:6,health:-12},'你暂时扛住了训练，但仍需要后续观察。','身体没有承受住负荷，伤停打断了比赛节奏。']], 'any','身体');
event('rehab',[16,39],'恢复室里的漫长几周','伤停期间，你看着队友一场场比赛。重返球场的渴望，也可能让你急于求成。',[
 ['严格按阶段恢复','discipline',.84,{health:8,injuryWeeks:-3,composure:1},{motivation:-3},'恢复推进得很稳定，你逐渐接近合练。','恢复速度比预想慢，耐心受到考验。'],
 ['借休息时间复盘比赛录像','vision',.76,{vision:1.8,education:3},{motivation:-3},'你从新的角度理解了场上的空间。','无法上场的焦虑让你难以集中注意力。'],
 ['提前参加队内对抗','confidence',.28,{form:6,coach:4},{injuryWeeks:5,health:-10},'你暂时适应了对抗，仍需要谨慎观察。','旧伤出现反复，回归时间进一步延后。']], 'injured','伤病');
event('media',[18,35],'采访里的一个尖锐问题','记者问你是否对现状失望。你的回答可能被放到标题里，而队友和教练也会看到。',[
 ['坦诚但尊重球队','composure',.78,{reputation:4,coach:3},{confidence:-2},'清晰克制的回答获得了理解。','报道依然截取了部分语句，让你有些无奈。'],
 ['把话题转回下一场比赛','discipline',.83,{coach:3,composure:1},{reputation:-1},'球队认可了你专注比赛的态度。','外界觉得回答缺乏内容，曝光度没有增加。'],
 ['鲜明表达个人诉求','confidence',.41,{reputation:8,network:4},{coach:-9,reputation:-5},'球迷支持你的表达，也有球队开始接洽。','言论引发争议，关系需要时间修复。']], 'any','媒体');
event('abroad',[18,33],'异国生活里的小事','球场之外，语言、住处和生活习惯都需要重新适应。你意识到转会不是换一件球衣那么简单。',[
 ['系统学习当地语言','education',.8,{adaptability:7,education:4},{fatigue:4},'你开始能和队友直接交流，生活也更从容。','安排过满，语言课暂时变成了额外负担。'],
 ['主动参加队友聚会','friendship',.7,{friendship:7,adaptability:4},{cash:-300,health:-2},'你在更衣室之外也建立了联系。','几次晚归打乱了恢复节奏。',{cash:-100}],
 ['维持熟悉的生活圈','family',.68,{family:4,motivation:3},{adaptability:-5},'熟悉的人和习惯让你稳住了情绪。','你和新环境之间仍然有些距离。']], 'foreign','适应');
event('national',[18,34],'国家队教练正在看台上','名单即将公布，你知道这一场的表现可能影响第一次征召，也可能影响下一次机会。',[
 ['按平常节奏执行战术','composure',.76,{nationalRep:7,coach:3},{confidence:-3},'稳定的表现得到了观察员的积极评价。','表现平稳，但缺少能够改变评价的亮点。'],
 ['主动承担关键进攻责任','confidence',.52,{nationalRep:12,reputation:5},{nationalRep:-4,form:-4},'你在关键时刻站了出来。','急于表现让处理球变得仓促。'],
 ['用防守和跑动服务全队','stamina',.72,{nationalRep:7,coach:4},{fatigue:6},'你不显眼的贡献被专业团队记录下来。','高强度跑动带来了明显疲劳。']], 'club','国家队');
event('love',[18,30],'关系需要你真正花时间','有人愿意陪你经历比赛和等待，但你频繁的出行和紧张的赛程也在消耗这份关系。',[
 ['认真安排固定的陪伴时间','family',.79,{family:8,motivation:5},{fatigue:4},'稳定的陪伴让你们更理解彼此。','计划仍被临时安排打乱，需要再次沟通。'],
 ['坦诚说明职业压力','composure',.74,{family:6,confidence:3},{family:-4},'表达真实感受让关系更稳固。','对方仍然觉得自己的需求没有被理解。'],
 ['暂时把全部精力留给足球','discipline',.61,{form:6,coach:3},{family:-9,motivation:-4},'专注带来了状态提升，但你也记得要重新安排生活。','关系中的距离逐渐变大。']], 'any','生活');
event('captain',[24,36],'主教练把袖标放到了你面前','除了自己的表现，你现在还要面对更衣室的分歧、年轻队友的情绪和外界的压力。',[
 ['主动承担沟通与责任','leadership',.72,{leadership:7,coach:7,friendship:4},{confidence:-4,fatigue:4},'你在几次艰难的交流中赢得了信任。','协调关系比想象更复杂，你承受了额外压力。'],
 ['用训练态度带动全队','discipline',.79,{leadership:4,coach:5},{fatigue:5},'以身作则让你的话更有分量。','额外责任压缩了恢复时间。'],
 ['把部分责任交给副队长','composure',.68,{friendship:6,leadership:3},{coach:-3},'分工让球队领导层更加稳定。','教练希望你能够更加主动。']], 'club','领导');
event('transfernoise',[22,32],'转会传闻盖过了比赛本身','媒体把你的名字和另一家俱乐部联系起来。家人、球迷和队友都在等待你表态。',[
 ['让经纪人私下处理接洽','knowledge',.77,{network:6,coach:3},{reputation:-2},'你把注意力留给比赛，同时保留了谈判空间。','信息不够透明，外界依旧充满猜测。'],
 ['公开表示愿意迎接挑战','confidence',.45,{network:10,reputation:4},{coach:-10,friendship:-4},'潜在买家对你的态度做出了积极回应。','现有球队认为你已不再全心投入。'],
 ['强调对当前球队的承诺','loyalty',.8,{coach:6,friendship:5},{network:-4},'更衣室的氛围稳定下来。','部分潜在机会因此暂时退后。']], 'club','转会');
event('sponsor',[21,35],'一份商业合作占用了休赛日','合作报酬不错，但拍摄、旅行和社交都要占用恢复时间。',[
 ['接受合作，严格安排恢复','discipline',.68,{cash:3500,reputation:5},{fatigue:8,health:-3},'合作顺利完成，财务和曝光都得到提升。','行程拖延，恢复被明显打乱。'],
 ['只接受低负荷的本地合作','knowledge',.78,{cash:1400,reputation:2},{cash:-150},'适度的合作没有明显影响训练。','最终沟通未能达成一致，付出了前期成本。'],
 ['把时间留给身体和家庭','family',.84,{health:4,family:5},{reputation:-2},'充分休息让你重新找回动力。','你错过了这一轮商业曝光。']], 'any','商业');
event('wages',[23,34],'新援的薪水引起了讨论','更衣室里有人比较待遇。你知道，合同和贡献并不总是被所有人以同一种方式看待。',[
 ['私下和经纪人评估市场','knowledge',.77,{knowledge:5,network:4},{motivation:-3},'更多信息帮你制定了合理的谈判预期。','市场反馈没有达到你的期待。'],
 ['在续约时争取更好的条件','composure',.66,{network:6,confidence:3},{coach:-4},'清晰的诉求让对话更加具体。','球队对成本的担忧让谈判变得更谨慎。'],
 ['先维护更衣室的稳定','leadership',.75,{friendship:6,coach:4},{motivation:-3},'你的态度得到了队友认可。','你仍然需要处理自己心中的落差。']], 'club','合同');
event('biggame',[21,34],'决战前夜的失眠','重要比赛近在眼前。你反复想象成功，也反复回想曾经的失误。',[
 ['和团队一起制定清晰计划','vision',.79,{form:6,composure:1},{confidence:-2},'具体的职责让焦虑减少，你更清楚要做什么。','准备仍然没能完全缓解紧张。'],
 ['靠个人仪式找回信心','confidence',.65,{confidence:8,form:4},{motivation:-4},'熟悉的节奏让你重新相信自己。','仪式没有带来预期的安定感。'],
 ['加练最后几组射门或扑救','stamina',.49,{finishing:1,reflexes:1,confidence:5},{fatigue:8,health:-3},'练习的手感给了你额外信心。','身体负荷让第二天的状态受到影响。']], 'club','比赛');
event('newcoach',[19,35],'更衣室迎来新的主教练','新的训练方式、新的战术和新的竞争秩序。过去积累的地位，并不一定能直接带到今天。',[
 ['主动理解新体系','vision',.74,{coach:8,versatility:5},{form:-4},'你更快找到自己在新体系里的职责。','理解和执行之间还存在差距。'],
 ['强调已有经验和贡献','confidence',.49,{coach:6,leadership:3},{coach:-8},'新教练愿意参考你的经验。','对方认为你过于依赖过去的地位。'],
 ['在训练中重新竞争','discipline',.77,{coach:6,form:4},{fatigue:5},'可靠的执行力为你争取到了信任。','训练负荷增加，恢复需要重新安排。']], 'club','战术');
event('veteran',[30,39],'身体开始要求不同的安排','你仍然能读懂比赛，但连续高强度奔跑后的恢复已经变慢。过去有效的方式，需要重新评估。',[
 ['减少无效跑动，强化阅读','vision',.82,{vision:1.5,composure:1,health:4},{pace:-.7},'经验帮助你在更合适的位置发挥作用。','调整过程中，速度下降变得更加明显。'],
 ['增加个人体能储备','stamina',.5,{stamina:1.5,strength:1},{fatigue:9,health:-5},'专项准备暂时延缓了体能下滑。','恢复跟不上额外训练，状态出现反复。'],
 ['和教练协商轮换角色','knowledge',.78,{health:6,coach:4},{confidence:-4},'合理的轮换让你保持更稳定的状态。','出场减少，让你一时难以接受。']], 'club','老将');
event('mentor',[28,39],'年轻队友问起你的第一场比赛','他站在你面前的样子，和许多年前的你很像。你可以成为他的参照，也可以继续专注自己的位置。',[
 ['认真陪他复盘训练','leadership',.79,{leadership:5,friendship:6,knowledge:3},{fatigue:3},'你在帮助别人时，也重新理解了自己的经验。','额外安排挤占了一部分个人恢复时间。'],
 ['带他一起参加专项训练','discipline',.73,{friendship:5,coach:4},{fatigue:5},'共同练习让你们的配合更有默契。','强度和节奏需要重新协调。'],
 ['坦诚分享职业路上的失误','composure',.83,{education:4,friendship:5},{confidence:-2},'你的坦诚让他更信任你。','谈到过去的遗憾，你也需要时间重新整理情绪。']], 'club','传承');
event('coaching',[29,39],'第一次坐进教练课程的教室','你已经踢了很多年球，但把经验变成可教给别人的东西，是另一种挑战。',[
 ['系统完成教练课程','education',.78,{education:8,coaching:8},{fatigue:5},'你开始建立更清晰的教学和战术框架。','课程和赛程叠加，精力有些吃紧。',{cash:-400}],
 ['先从带青年球员开始','leadership',.72,{coaching:6,friendship:5},{motivation:-2},'实践让你发现自己也享受指导别人。','教学的耐心和方法还需要打磨。'],
 ['先把最后几个赛季踢好','discipline',.72,{form:5,coach:3},{coaching:-2},'你重新把注意力放回当下的比赛。','退役后的准备被推迟了。']], 'any','退役准备');
event('farewell',[34,39],'球迷唱起了你的名字','有人开始讨论你的最后一个赛季。你还能坚持，但你也在想，希望怎样结束球员时代。',[
 ['和家人共同规划告别','family',.83,{family:8,motivation:5},{confidence:-3},'你更清楚自己想把时间留给什么。','告别的话题让你暂时有些低落。'],
 ['争取下一份合适的短约','knowledge',.68,{network:7,confidence:4},{coach:-3},'新的对话让你看到了继续比赛的可能。','市场对年龄更加谨慎，反馈不如从前。'],
 ['把最后的能量留给球队','loyalty',.76,{coach:6,friendship:6},{fatigue:6},'你的付出让球队更加珍惜你的存在。','精神上的投入不能完全抵消身体的疲惫。']], 'club','告别');
event('campus',[16,39],'足球之外，也有人生的选择题','一门课程、一个新的职业方向，或者一支周末球队。你发现足球之外的世界同样需要认真选择。',[
 ['报名继续教育课程','education',.8,{education:7,knowledge:4},{fatigue:5},'新的知识让你为未来多做了一份准备。','学习和训练的切换让精力更加分散。',{cash:-120}],
 ['组织一次社区足球活动','friendship',.76,{family:5,leadership:4},{cash:-100,motivation:-2},'你看到热爱也能以另一种方式影响别人。','组织工作比预想更费力。'],
 ['专注当前工作和生活节奏','discipline',.8,{cash:500,family:4},{motivation:-3},'稳定的节奏带来了踏实的收获。','按部就班的日子让你偶尔想念更大的挑战。']], 'any','人生');
event('keepercross',[12,39],'传中球落向六码区','门将教练要求你更主动地控制禁区。出击时机和沟通都比看起来困难。',[
 ['强化判断和接球技术','handling',.75,{handling:1.7,coach:4},{confidence:-3},'你的接球选择更加稳定。','对落点的判断仍需要更多练习。'],
 ['主动指挥防线站位','leadership',.69,{leadership:4,positioning:1.3},{friendship:-3},'沟通让你和后卫之间更有默契。','表达方式让部分队友感到压力。'],
 ['大胆扩大出击范围','reflexes',.51,{reflexes:1.8,confidence:5},{coach:-4,confidence:-4},'一次果断出击赢得了教练认可。','冒失的出击留下了空门。']], 'keeper','门将');
event('finances',[20,38],'收入增加以后，该怎样安排未来','新的收入也带来新的消费和投资机会。经纪人提醒你，球员的职业生涯并不无限长。',[
 ['建立储备，谨慎分散安排','knowledge',.83,{cash:700,knowledge:3},{cash:-200},'克制的安排让你多留下一份储备。','小额支出仍然超出了原有计划。'],
 ['投入熟人的创业项目','network',.36,{cash:5000,network:4},{cash:-3500,motivation:-3},'项目取得初步进展，带来了额外回报。','项目进展不顺，你承担了相应损失。'],
 ['改善家人的居住和生活','family',.79,{family:9,motivation:5},{family:-2,cash:-300},'家人的生活改善让你觉得这些年很值得。','支出增加后，家庭对未来安排仍有分歧。',{cash:-1200}]], 'any','财务');
event('nutrition',[10,26],'训练负荷变了，饮食也需要调整','体能教练在例行回顾中发现，你的体重和训练状态最近波动较大。',[
 ['按训练安排规律饮食与休息','discipline',.82,{health:5,fatigue:-5,coordination:2},{motivation:-2},'更稳定的作息让你恢复得更从容。','短期变化不明显，你需要更多耐心。'],
 ['把目标放在力量与对抗','strength',.66,{strength:1.5,bodyMass:.6},{fatigue:5,pace:-.6},'增加的身体储备改善了部分对抗。','体重增加后，你还没完全适应动作节奏。'],
 ['优先保持灵敏与触球感觉','acceleration',.68,{acceleration:1.3,coordination:3},{strength:-.6,confidence:-2},'轻快的动作帮助你找回比赛手感。','身体对抗的短板仍然存在。']], 'any','身体');
event('smallside',[7,10],'你一直是队里最小的孩子','五人制比赛里，身体强壮的伙伴总能抢先碰到球。教练问你，想怎样找到自己的办法。',[
 ['提前观察，接球前先移动','vision',.74,{vision:2,positioning:1.3},{confidence:-3,form:-2},'提前一步的观察，让你避开了正面的碰撞。','你想得太多，接球时反而失去了节奏。'],
 ['和搭档练连续的一脚传球','passing',.78,{passing:1.8,friendship:4},{motivation:-3,passing:-.3},'你们慢慢有了默契，小个子也能控制比赛。','两个人的节奏始终对不上，今天有些沮丧。'],
 ['勇敢参与每一次对抗','composure',.57,{strength:1.5,confidence:5},{health:-4,fatigue:5},'你学会了用更好的姿态保护球。','冲得太急让你摔倒，需要休息和调整。']]);
event('schoolteam',[8,12],'校队和周末训练撞期了','学校希望你参加区级比赛，周末训练营却安排了一次重要测评。两位教练都希望你出现。',[
 ['向两边说明情况，商量轮换安排','composure',.74,{knowledge:3,coach:4,education:2},{coach:-3,fatigue:5},'双方找到了一套兼顾的安排，你也学会提前沟通。','时间仍然挤在一起，来回奔波让你十分疲惫。'],
 ['选择校队，和同学并肩比赛','friendship',.8,{friendship:6,leadership:2},{scouting:-3,confidence:-2},'你承担了更多责任，也交到了真正的朋友。','训练营错过了你的表现，下一次机会要再等待。'],
 ['优先参加青训测评','technique',.62,{scouting:5,technique:1.2},{friendship:-5,coach:-2},'你的表现进入了球探的笔记。','测评并不顺利，校队队友也对你的缺席感到失落。']]);
event('transport',[9,14],'每天两小时的训练通勤','加入球队以后，路程开始挤占睡眠和学习。家人愿意支持你，但新的安排需要大家一起承担。',[
 ['和家人制定轮流接送的计划','family',.78,{family:5,fatigue:-5},{family:-4,education:-2},'清晰的分工让生活重新有了秩序。','家人的工作临时变化，原有安排很难坚持。'],
 ['尝试更靠近训练场的住宿安排','adaptability',.6,{adaptability:5,discipline:3},{motivation:-5,family:-3},'你渐渐学会了独立，也有了更稳定的训练节奏。','离家的不习惯让你很长时间都提不起精神。'],
 ['先减少额外加练，守住休息','composure',.8,{health:5,education:3},{scouting:-2,motivation:-2},'足够的休息让你重新带着热情来到球场。','看见别人继续进步，你开始怀疑自己的安排。']], 'club','青训');
event('leftfoot_specialist',[10,16],'教练要求你练习不习惯的那只脚','队友已经开始参与更复杂的战术，而你需要从简单触球重新练起。这可能影响短期表现。',[
 ['接受暂时的笨拙，系统补足弱项','discipline',.77,{weakFoot:8,versatility:3},{confidence:-4,form:-3},'重复练习慢慢变成了比赛里多出来的一种选择。','你还不能自然使用新动作，短期表现下降了。'],
 ['只在额外训练中练习','technique',.7,{weakFoot:5,technique:1},{fatigue:6,motivation:-2},'你稳住了比赛表现，也逐步补上了短板。','额外负荷超过了预期，你开始感到疲倦。'],
 ['先用擅长的方式争取位置','confidence',.65,{form:4,coach:3},{versatility:-3,coach:-3},'熟悉的动作帮助你稳定了本阶段表现。','对手发现了你的习惯，封堵变得更加容易。']], 'club','技术');
event('reservefriends',[12,17],'好朋友没有进入下一期名单','你留下了，最好的朋友却被淘汰。他说可能再也不踢球了，而你也第一次认真意识到竞争的残酷。',[
 ['陪他寻找其他球队和校园机会','friendship',.78,{friendship:7,family:2,leadership:2},{motivation:-4,fatigue:3},'他找到了新的方向，你也明白了职业道路之外仍有足球。','你很想帮助他，却暂时无力改变结果。'],
 ['把焦虑变成更有规律的训练','discipline',.69,{discipline:3,technique:1.2},{fatigue:7,confidence:-3},'稳定的安排让你找回了能够控制的事情。','越想证明自己，你在比赛里越是紧张。'],
 ['主动找教练聊聊评估标准','composure',.76,{knowledge:5,coach:3},{coach:-2,confidence:-3},'你得到了一些具体反馈，开始用更长的眼光看成长。','教练给出的解释很有限，不确定感依然存在。']], 'club','关系');
event('assessment',[13,17],'评估报告：潜力与短板同时存在','季度报告肯定了你的技术，却指出比赛阅读和对抗仍然不足。你可以怎样回应这份评价？',[
 ['和教练一起制定三个月改进计划','discipline',.8,{vision:1.5,coach:5,knowledge:2},{confidence:-3,fatigue:4},'具体目标让训练有了方向，教练看到了你的改变。','改进速度没有达到期望，你需要继续耐心坚持。'],
 ['用一场出色的比赛证明自己','confidence',.56,{scouting:6,form:5},{form:-5,coach:-3},'一次勇敢的表现改变了部分评价。','你过度追求表现，忽略了球队整体安排。'],
 ['寻求另一位教练的第二意见','network',.65,{knowledge:5,versatility:3},{coach:-4,confidence:-2},'不同的视角让你看到了另一种适合自己的职责。','相互矛盾的意见让你更加迷茫。']], 'club','评估');
event('captainpressure',[15,22],'队长袖标，和必须说出口的话','更衣室因为上场机会出现争执。作为被信任的年轻球员，你必须决定是否站出来。',[
 ['分别听取意见，再请教练一起沟通','leadership',.75,{leadership:6,friendship:5,coach:3},{friendship:-4,confidence:-3},'大家终于把真实顾虑说了出来。','你的好意被误解，矛盾暂时没有缓解。'],
 ['在训练中带头，把精力拉回球场','discipline',.78,{leadership:3,form:4},{fatigue:6,friendship:-2},'大家跟着你重新专注于能做到的事。','表面上恢复了训练，不满却仍然存在。'],
 ['明确支持竞争上场的队友','friendship',.52,{friendship:7,leadership:3},{coach:-7,friendship:-3},'队友觉得你愿意为他们承担压力。','你被认为在选边站，更衣室关系进一步复杂。']], 'club','更衣室');
event('registration',[16,21],'报名名单的最后一个名额','一线队名单即将提交。教练给你两种可能：留队训练等待杯赛，或者寻找能稳定比赛的环境。',[
 ['留队学习，接受暂时没有位置','composure',.69,{vision:1.6,coach:5},{motivation:-6,form:-3},'高水平日常训练让你学到了新的比赛细节。','长时间没有正式比赛，你的状态开始受影响。'],
 ['明确提出需要比赛的发展计划','knowledge',.76,{loanSupport:15,knowledge:4},{coach:-5,confidence:-2},'教练同意评估租借，下一步仍需你选择目的地并协商。','教练认为你不够耐心，沟通需要重新建立。'],
 ['争取预备队领袖角色','leadership',.8,{leadership:4,confidence:4},{scouting:-4,motivation:-2},'稳定的职责让你在比赛中积累了信心。','你担心自己离一线队越来越远。']], 'club','职业突破');
event('language',[18,32],'战术讲完，你还在翻译第一句话','来到海外之后，你发现日常交流和场上指令都比预想的困难。队友愿意帮忙，但你需要建立自己的办法。',[
 ['每周安排语言课，记下战术词汇','discipline',.8,{adaptability:8,knowledge:4,education:2},{fatigue:5,motivation:-2},'你开始能直接回应教练，场上的犹豫明显减少。','学习进度不如预期，额外课程也让你疲惫。',{cash:-180}],
 ['主动参加队友的日常活动','friendship',.74,{friendship:7,adaptability:5},{cash:-120,fatigue:4},'真实的交流让陌生的城市慢慢变得亲切。','文化差异带来了一次尴尬误会。'],
 ['优先用录像和手势理解战术','vision',.68,{vision:1.8,coach:3},{adaptability:-3,coach:-3},'你靠提前研究找到了理解比赛的方法。','临场指令一变，你仍然很难立即反应。']], 'foreign','海外');
event('salarydelay',[19,36],'薪资晚到了，队友开始担心','俱乐部解释资金暂时周转困难，希望球员保持专注。更衣室里已经出现了不同意见。',[
 ['经正式渠道集体沟通，保留记录','knowledge',.79,{knowledge:6,friendship:4},{motivation:-4,coach:-2},'沟通获得了明确回应，你们争取到了更清晰的安排。','问题仍未解决，等待让大家感到不安。'],
 ['继续完成训练，同时准备备选球队','network',.7,{network:5,scouting:3},{coach:-5,loyalty:-3},'你在履行职责的同时，为未来保留了选择。','外界把你的准备误读成了急于离队。'],
 ['公开表达自己的不满','reputation',.43,{reputation:4,leadership:4},{coach:-9,reputation:-4},'外部关注推动了问题被认真讨论。','争议扩大了，你承受了额外压力。']], 'club','财务');
event('rotationpromise',[18,34],'承诺的轮换，迟迟没有兑现','签约时谈好的机会并没有出现。新教练使用另一种体系，而你的合同还很长。',[
 ['整理表现数据，约谈角色与目标','knowledge',.77,{coach:5,confidence:4,knowledge:3},{coach:-4,motivation:-4},'你们明确了可以争取的比赛和改进方向。','教练没有作出具体承诺，等待仍要继续。'],
 ['申请通过租借争取真正的分钟数','adaptability',.74,{loanSupport:18,network:3},{coach:-5,confidence:-3},'教练愿意把外租作为一种发展选择。','球队认为阵容仍需要你，外租暂时缺乏支持。'],
 ['增加专项训练，争取体系中的新职责','versatility',.65,{versatility:6,vision:1.3},{fatigue:7,form:-3},'你适应了新的细节，开始被纳入更多演练。','改变比预想艰难，过多任务影响了稳定性。']], 'club','合同');
event('derby',[18,35],'德比周，城市里的每句话都有回声','球迷希望看到你的斗志，教练却提醒大家保持纪律。一次采访可能让这种情绪继续升温。',[
 ['尊重对手，把承诺留给球场','composure',.82,{composure:1.5,reputation:3},{confidence:-2,reputation:-1},'冷静的表达得到了一部分球迷的认可。','有人觉得你的回应不够有激情。'],
 ['用积极的言辞回应球迷期待','confidence',.59,{motivation:7,reputation:5},{reputation:-5,form:-3},'城市的热情成为了你的动力。','话语被放大，比赛前你承受了更多压力。'],
 ['请队长一起参与社区球迷活动','leadership',.75,{friendship:4,reputation:4},{fatigue:4,motivation:-2},'真实的相处让你更理解这座城市。','活动占用了休息时间，你需要重新调整。']], 'club','球迷');
event('tacticalfit',[20,33],'新教练带来了完全不同的体系','球队从控制球权转向快速压迫。你过去最擅长的踢法，需要重新找到位置。',[
 ['系统研究录像，学习无球细节','vision',.78,{vision:2,positioning:1.2,coach:4},{fatigue:5,confidence:-3},'你理解了体系中的触发点，训练表现开始改善。','理解和执行之间仍然有距离。'],
 ['和体能团队安排渐进适应','discipline',.79,{stamina:1.8,health:3},{fatigue:7,form:-3},'有节奏的准备让你更能承担新职责。','身体暂时没有跟上强度，状态出现了波动。'],
 ['与经纪人评估更适合的球队','network',.63,{network:6,knowledge:3},{loyalty:-5,coach:-4},'你看到了可以认真比较的发展环境。','消息传回俱乐部，双方关系变得紧张。']], 'club','战术');
event('comebackfear',[21,35],'复出前，你开始害怕同一个动作','身体检测已经接近要求，但每次加速或变向，你都会想起受伤的那一下。',[
 ['和团队完成分级对抗与心理准备','composure',.81,{confidence:7,health:4,fatigue:-4},{motivation:-4,form:-2},'逐步完成动作让你重新相信自己的身体。','恢复信心需要更长时间，你还不能完全放开。'],
 ['用正式比赛尽快找回感觉','confidence',.5,{confidence:8,form:6},{injuryWeeks:4,health:-5},'比赛节奏帮助你跨过了心理上的一道门槛。','急于证明自己增加了负荷，回归被推迟。'],
 ['先承担较少风险的战术职责','vision',.76,{vision:1.5,coach:3},{form:-3,confidence:-2},'新的职责让你逐步融回球队。','你一时难以接受角色变化，动作仍不够自然。']], 'injured','伤病');
event('nationalchoice',[20,32],'国家队集训，和疲惫的俱乐部赛程','国家队开始观察你，但密集赛程已经让身体吃紧。这是重要机会，也需要诚实评估状态。',[
 ['向双方团队说明负荷，协调安排','knowledge',.79,{nationalRep:6,health:3},{nationalRep:-3,motivation:-2},'专业的沟通得到理解，你仍留在观察名单里。','名额竞争激烈，对方选择了状态更完整的人。'],
 ['带着全部热情争取集训表现','motivation',.6,{nationalRep:10,reputation:4},{fatigue:12,health:-4},'你的态度和表现给观察团队留下印象。','额外负荷使你的表现低于平时。'],
 ['优先稳定俱乐部表现，等待下一次','composure',.77,{form:5,health:4},{nationalRep:-5,confidence:-2},'稳定的基础为你保留了长期竞争力。','错过这次窗口，你仍感到遗憾。']], 'club','国家队');
event('agentconflict',[20,35],'经纪人的建议，真的适合你吗','经纪人更看好薪资更高的目的地，你却担心教练体系和上场空间。最终签字的人是你。',[
 ['要求一份完整的角色与发展比较','knowledge',.82,{knowledge:6,confidence:3},{network:-2,motivation:-2},'你看清了收入之外的代价，能更有把握地决定。','对方给出的信息依然不够完整。'],
 ['亲自和潜在教练沟通再判断','composure',.73,{network:4,coach:2},{confidence:-3,reputation:-2},'直接交流让你理解了球队真正需要什么。','沟通中的一些话被错误地转述了。'],
 ['接受更高收益，准备承担竞争','confidence',.57,{motivation:6,network:3},{motivation:-6,knowledge:-2},'你接受了自己的选择，开始更认真地做准备。','没有明确计划的承诺让你逐渐感到不安。']], 'any','经纪');
event('parenthood',[25,35],'成为家长以后，时间有了新的重量','家庭迎来了新的成员。客场、训练和休息仍然按原来的节奏进行，你需要重新安排自己的精力。',[
 ['和家人一起建立可持续的分工','family',.82,{family:9,motivation:5},{fatigue:6,family:-3},'家人的理解让你在不同身份之间找到平衡。','计划赶不上变化，大家都需要更多休息。'],
 ['向球队沟通必要的家庭时间','composure',.74,{family:7,coach:2},{coach:-4,form:-2},'俱乐部理解了你的需要，安排变得更清楚。','密集赛程让调整很困难，你有些失落。'],
 ['先坚持比赛任务，再补上陪伴','discipline',.61,{coach:4,form:3},{family:-8,fatigue:6},'重要比赛告一段落后，你兑现了陪伴的承诺。','缺席的时刻难以补回，关系需要认真修复。']], 'any','家庭');
event('insurance',[24,36],'医疗检查之后的一次长期规划','一次例行检查让你开始思考：如果身体无法继续踢球，家人和未来生活该怎样安排？',[
 ['梳理合同保障与个人储备','knowledge',.83,{knowledge:6,confidence:3},{cash:-250,motivation:-2},'具体计划让未来不再完全依赖下一场比赛。','整理过程发现了额外成本，需要重新安排预算。',{cash:-300}],
 ['把更多时间留给学习和职业准备','education',.77,{education:6,coaching:3},{fatigue:5,form:-2},'新的知识让你看见了球场之外的路。','同时处理太多事，短期里有些顾此失彼。'],
 ['继续专注表现，争取更长保障','discipline',.63,{form:4,motivation:5},{knowledge:-2,confidence:-3},'稳定表现让你更有底气讨论未来。','你发现成绩并不能替代一份明确的计划。']], 'any','生涯规划');
event('wagecut',[30,38],'续约之前，球队提出降薪与角色调整','俱乐部希望留下你的经验，但需要你接受更短保障和更多替补时间。别处也许有机会，却需要重新开始。',[
 ['讨论出场目标，接受职责逐步变化','leadership',.8,{coach:5,loyalty:6},{motivation:-5,confidence:-3},'你在新角色中找到价值；真正的条款仍需在合同页谈判。','你比想象中更难接受离开首发名单。'],
 ['请经纪人认真寻找其他环境','network',.68,{network:6,scouting:3},{loyalty:-5,coach:-3},'你得到了值得继续接洽的方向。','外界的兴趣没有预想中强，关系却变得紧张。'],
 ['争取边踢边学的传帮带安排','knowledge',.76,{coaching:7,leadership:4},{form:-3,fatigue:3},'你发现指导年轻人也能带来满足。','兼顾两种职责比想象中更消耗精力。']], 'club','老将');
event('veterantraining',[31,38],'经验还在，身体却需要更多恢复','过去可以轻松完成的连续训练，现在开始影响第二天的比赛感觉。你需要重新定义努力。',[
 ['调整强度，把质量留在关键训练','discipline',.83,{health:5,fatigue:-7,vision:1},{coach:-2,confidence:-2},'你把精力留在最需要自己的时候。','减少训练让你产生不安，还需要和教练建立共识。'],
 ['用战术站位减少无效奔跑','positioning',.78,{positioning:2,stamina:.7},{form:-3,coach:-2},'经验帮助你更早抵达正确的位置。','新的对手逼迫你不断加速，原有准备不够。'],
 ['保持年轻时的强度证明自己','motivation',.47,{strength:1.2,coach:4},{fatigue:12,health:-6},'短期的出色表现证明你仍有竞争力。','积累的负荷让你不得不暂时放慢脚步。']], 'club','身体');
event('localhero',[32,39],'故乡球队发来了一条消息','他们希望你考虑在职业生涯后期回到熟悉的城市。收入和平台也许不同，生活却可能更靠近家人。',[
 ['先了解球队计划，再决定是否申请','knowledge',.8,{knowledge:4,network:4},{confidence:-2,motivation:-2},'清晰的了解让这个选项变得可以认真比较。','熟悉的名字背后，实际条件并不如想象。'],
 ['和家人讨论回家的意义','family',.83,{family:8,motivation:4},{family:-3,confidence:-2},'你们找到了一些共同期待，下一步仍由你选择球队。','家人的生活已经有了自己的节奏，回去也需要协调。'],
 ['继续挑战当前最高水平','confidence',.59,{motivation:6,reputation:3},{fatigue:7,family:-4},'挑战让你仍然期待每一个清晨。','身体与家庭的需要让坚持变得更复杂。']], 'any','选择');
// These scenes follow a concrete signing or a previous event, rather than
// entering the random pool. A later choice can change the earlier trajectory.
event('academyarrival',[9,17],'签字之后，第一次走进青训基地','你已经选择了俱乐部。新的队友、日程和评估标准摆在眼前，现在需要真正适应这里。',[
 ['先了解规则，主动认识队友','adaptability',.79,{friendship:6,coach:4,adaptability:4},{confidence:-4,motivation:-3},'你慢慢融入了训练节奏，有了愿意一起加练的伙伴。','陌生环境仍让你紧张，下一次训练还需要继续尝试。'],
 ['额外加练，争取第一周就被记住','technique',.6,{scouting:5,coach:4},{fatigue:9,health:-3},'你的投入被看见，教练记住了你的名字。','急于表现让你没有留足恢复时间。'],
 ['和家人约定固定的沟通时间','family',.82,{family:6,motivation:4},{friendship:-2,confidence:-2},'熟悉的支持让你敢于面对新的竞争。','你太想回家，短期还难以投入新集体。']], 'story','签约后');
event('firstprofessional',[18,25],'第一份职业合同后的那个晚上','合同已经生效，但职业球员的日常才刚开始。周薪、奖金和俱乐部的要求，都成为了具体的责任。',[
 ['仔细读完条款，安排收支和训练','knowledge',.82,{knowledge:8,discipline:3},{motivation:-2,confidence:-2},'你开始理解职业生涯需要长期经营。','需要处理的事情太多，仍有不少细节没看懂。'],
 ['请家人吃饭，感谢一路的支持','family',.83,{family:8,motivation:5},{cash:-200,fatigue:3},'一家人终于可以为共同走过的路开心一次。','庆祝花销超过了安排，之后需要收紧预算。',{cash:-120}],
 ['把目标放在争取第一场首发','confidence',.63,{coach:4,form:5},{fatigue:8,confidence:-3},'具体目标让你迅速投入了训练。','急切的心情让你在训练中有些失常。']], 'story','职业起点');
event('loanarrival',[18,39],'外租第一天，没人认识过去的你','母队的履历不能替你赢得位置。租借球队需要立即能上场的人，你还需要重新理解战术和队友。',[
 ['尽快和教练确认职责与考核目标','knowledge',.8,{coach:7,adaptability:5},{coach:-3,confidence:-3},'清楚的职责让你的每次训练更有方向。','教练的要求和你的理解仍存在距离。'],
 ['主动融入更衣室，从配合建立信任','friendship',.78,{friendship:8,adaptability:5},{motivation:-3,confidence:-3},'你和新队友建立了第一层信任。','大家的习惯很不同，你暂时还找不到话题。'],
 ['用强度和表现立即争取首发','form',.58,{form:6,coach:5},{fatigue:10,health:-3},'一次出色的对抗让你获得了更多关注。','旅途和加练叠在一起，身体还没完全适应。']], 'story','租借');
event('clubarrival',[18,39],'转会完成之后，重新赢得信任','新球衣已经穿上，但真正适应一支球队需要更多时间。教练、球迷和队友都有各自的期待。',[
 ['把第一阶段目标放在战术磨合','vision',.8,{vision:1.6,coach:6,adaptability:4},{form:-3,confidence:-2},'你更快理解了自己的职责。','一些细节仍旧不熟悉，临场表现还不稳定。'],
 ['主动承担压力，向首发位置发起挑战','confidence',.58,{reputation:4,coach:5},{fatigue:7,reputation:-3},'你的态度和表现让大家看到了新的可能。','过高期待让每一次失误都显得刺眼。'],
 ['先安顿生活，再建立稳定节奏','discipline',.83,{health:4,fatigue:-5,family:3},{coach:-2,motivation:-2},'稳定的生活帮助你慢慢进入状态。','适应速度没有满足外界的期待。']], 'story','转会');
event('growthworry',[12,16],'身体突然长高，熟悉的动作却变了','最近你总感觉步点和触球距离不对。体能教练提醒，这可能是一段需要重新适应身体的时期。',[
 ['降低额外负荷，重新练习动作控制','discipline',.82,{coordination:6,health:4},{confidence:-3,motivation:-2},'动作逐渐稳定，你开始更耐心地看待发育。','短期表现还没有改善，等待仍然让你焦虑。',{}, {success:'growthreturn',failure:'growthreturn'}],
 ['照常训练，用更多重复适应','stamina',.61,{coordination:4,technique:1},{fatigue:9,health:-4},'练习帮助你找回了部分触球感觉。','身体不适开始影响训练，需要认真重新安排。',{}, {success:'growthreturn',failure:'growthreview'}],
 ['先请团队评估，再一起安排计划','knowledge',.78,{knowledge:4,coordination:4},{cash:-100,confidence:-2},'评估让目标更具体，你知道了先做什么。','你仍然不太理解报告，需要继续沟通。',{}, {success:'growthreturn',failure:'growthreturn'}]], 'any','发育');
events.at(-1).once=true;
event('growthreview',[12,17],'上次的身体不适，还没有完全过去','你曾选择维持训练强度，但身体的反馈需要更认真地对待。现在可以重新安排，不必被之前的决定困住。',[
 ['和教练一起重设负荷与恢复安排','composure',.84,{health:7,fatigue:-9,coordination:3},{motivation:-4,form:-2},'及时调整让你重新回到能够稳定训练的节奏。','改善需要时间，这一阶段还不能急于求成。'],
 ['保留技术训练，减少额外对抗','technique',.76,{technique:1.3,health:4},{fatigue:5,confidence:-2},'你保住了触球感觉，也留出了适应空间。','你仍然容易在对抗中失去动作节奏。'],
 ['主动和家人讨论暂时的学习计划','family',.81,{family:5,education:4,health:3},{motivation:-5},'被理解的感觉让你不再独自承担焦虑。','看到队友继续比赛，你心里仍有些着急。']], 'story','发育后续');
event('growthreturn',[12,17],'几个月后，重新看自己的身体','此前的适应阶段已经过去一段时间。教练和你一起看训练录像，讨论下一阶段怎样使用新的身体条件。',[
 ['巩固协调性，不急于改变全部踢法','coordination',.83,{coordination:6,confidence:4},{form:-2,motivation:-2},'你找到了更自然的动作节奏。','有些习惯仍需要继续练习。'],
 ['增加合理对抗，学习利用新优势','strength',.67,{strength:1.6,confidence:5},{fatigue:6,coordination:-2},'你开始学会保护球，也更敢参与对抗。','动作还不熟悉，部分回合处理得比较笨拙。'],
 ['和教练重新评估位置适应','vision',.76,{versatility:7,vision:1.3},{confidence:-3,coach:-2},'你发现了新的可能，之后可以在成长页尝试调整位置。','新的建议太多，你还需要找到最适合自己的方向。']], 'story','发育后续');
event('latebalance',[28,39],'足球之外，也有需要认真经营的日常','朋友、家人和未来工作都在变化。你不必只用球场上的位置，来衡量这一段人生。',[
 ['和家人一起讨论下一阶段的生活','family',.83,{family:7,motivation:4},{family:-3,confidence:-2},'共同的计划让你对未来有了新的期待。','彼此的期待仍有差异，需要继续沟通。'],
 ['学习新技能，为下一段职业做准备','education',.78,{education:5,knowledge:4},{fatigue:5,motivation:-2},'学习带来了可以继续尝试的方向。','新领域比想象中困难，你还需要更多时间。'],
 ['组织周末足球，把经验留给社区','leadership',.75,{leadership:4,friendship:5,coaching:3},{cash:-120,fatigue:4},'足球让你和一群人重新连接在一起。','组织中的琐碎事务超出了最初的计划。']], 'any','生活');
g.CAREER_EVENTS=events;
})(typeof window!=='undefined'?window:globalThis);
