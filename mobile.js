(function(){
'use strict';
let ready=false,registration=null,updating=false,statusText='正在准备离线内容，请保持联网',lastFocus=null;
const onPhone=()=>matchMedia('(max-width:680px)').matches,installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const escape=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(){
 const page=document.querySelector('.page'),hub=window.__careerQA?.ui().page==='hub';if(!page||!hub||!onPhone())return;
 let box=document.getElementById('mobile-install-panel');if(!box){box=document.createElement('section');box.id='mobile-install-panel';box.className='mobile-install-panel';box.innerHTML='<div><strong></strong><small></small></div><button class="textbtn" data-mobile-help>使用说明 ↗</button><div class="mobile-save-actions"><button class="btn outline small" data-action="import">导入存档</button><button class="btn outline small" data-action="export">备份存档</button></div>';page.querySelector('.heading')?.after(box);}
 box.querySelector('strong').textContent=installed()?'已从主屏幕打开':'把足球人生，放进 iPhone 主屏幕';
 box.querySelector('small').innerHTML='<i class="mobile-install-dot '+(ready?'ready':'')+'"></i>'+escape(statusText);
}
function status(text){statusText=text;mount();const label=document.querySelector('[data-mobile-status]');if(label)label.textContent=text;}
function closeHelp(){document.getElementById('mobile-help-overlay')?.remove();lastFocus?.focus();}
function openHelp(){
 if(document.getElementById('mobile-help-overlay'))return;lastFocus=document.activeElement;
 const el=document.createElement('div');el.id='mobile-help-overlay';el.className='mobile-help-overlay';el.innerHTML=`<section class="mobile-help-dialog" role="dialog" aria-modal="true" aria-labelledby="mobile-help-title" tabindex="-1"><div class="mobile-help-head"><div><div class="eyebrow">TOUCHLINE · ON YOUR IPHONE</div><h2 id="mobile-help-title">让足球人生，随身继续。</h2></div><button class="mobile-help-close" data-mobile-close aria-label="关闭手机使用说明">×</button></div><p>在 Safari 中打开游戏网址即可游玩，无需运行电脑。首次进入请等待离线内容准备完成。</p><div class="mobile-help-steps"><div class="mobile-help-step"><b>1</b><div><strong>在 Safari 打开游戏网址</strong><small>若从聊天软件进入，请选择“在 Safari 中打开”，获得完整的存档和分享功能。</small></div></div><div class="mobile-help-step"><b>2</b><div><strong>点“分享” → “添加到主屏幕”</strong><small>如果出现“作为网页 App 打开”，开启后点“添加”。以后从主屏幕图标进入游戏。</small></div></div><div class="mobile-help-step"><b>3</b><div><strong>导入已有生涯，或创建自己的球员</strong><small>原电脑版导出 JSON 存档，用文件或聊天传到手机，在生涯中心“导入存档”。</small></div></div></div><div class="mobile-help-status"><strong>连接与离线状态</strong><br><span data-mobile-status>${escape(statusText)}</span></div><p>进度自动保存在当前设备。换设备前请“备份存档”，在系统分享菜单中选“存储到文件”。安装到主屏幕后，建议导入同一份备份再继续。</p><div class="actions"><button class="btn" data-mobile-close>回到我的足球人生 →</button>${registration?.waiting?'<button class="btn outline" data-mobile-update>更新到新版</button>':''}</div></section>`;
 document.body.appendChild(el);el.querySelector('.mobile-help-dialog').focus();
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-mobile-help],[data-mobile-close],[data-mobile-update]');if(!button)return;if(button.hasAttribute('data-mobile-help'))openHelp();else if(button.hasAttribute('data-mobile-close'))closeHelp();else if(registration?.waiting){updating=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}});
document.addEventListener('keydown',e=>{const dialog=document.querySelector('.mobile-help-dialog');if(!dialog)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeHelp();}else if(e.key==='Tab'){const all=[...dialog.querySelectorAll('button,a[href]')],first=all[0],last=all.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}},true);
new MutationObserver(mount).observe(document.getElementById('app'),{childList:true});mount();
if('serviceWorker' in navigator&&window.isSecureContext){
 navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='OFFLINE_STATUS'){ready=!!e.data.ready;status(ready?'已准备离线游玩 · 存档保存在本机':'离线内容尚未准备完成，请保持联网');}});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating)location.reload();else navigator.serviceWorker.controller?.postMessage({type:'GET_STATUS'});});
 window.addEventListener('load',async()=>{try{registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});const active=await navigator.serviceWorker.ready;active.active?.postMessage({type:'GET_STATUS'});if(registration.waiting)status('新版已准备好，请在使用说明中更新');registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)status('新版已准备好，请在使用说明中更新');});});}catch{status('离线准备未完成；联网时仍可正常游玩');}});
}else status(location.protocol==='file:'?'请通过 Safari 的游戏网址打开':'当前可联网游玩；离线功能需要 HTTPS 网址');
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')navigator.serviceWorker?.controller?.postMessage({type:'GET_STATUS'});});
window.__mobileQA={status:()=>({ready,text:statusText,installed:installed()}),openHelp};
})();
