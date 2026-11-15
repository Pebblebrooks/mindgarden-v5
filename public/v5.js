/* V5: games visible on first load, a labelled menu, a language picker, centred card help and category chips. */
(function(){
'use strict';
const T=(a,b)=>window.MindGardenLocale.pair(a,b),$=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function closeMenu(){const menu=$('navMenu'),more=$('navMore');if(menu&&!menu.classList.contains('hidden')){menu.classList.add('hidden');more?.setAttribute('aria-expanded','false');more?.setAttribute('aria-label',T('Open menu','打开菜单'))}}
function restoreFocus(opener){const target=opener?.isConnected&&opener.offsetParent?opener:$('navMore');target?.focus({preventScroll:true})}

/* Language is chosen from a list; nothing changes until an option is selected. */
function language(){
 const opener=document.activeElement?.closest?.('#navMenu')?$('navMore'):document.activeElement,current=save.lang==='zh'?'zh':'en';
 closeMenu();
 window.MindGardenMenuHistory?.enter('language',()=>language());
 const option=(code,label,note,lang)=>'<button type="button" class="btn v5-language-option" data-v5-lang="'+code+'" lang="'+lang+'" aria-pressed="'+(current===code)+'"><strong>'+label+'</strong>'+(current===code?'<small>'+note+'</small>':'')+'</button>';
 /* The heading goes through the normal bilingual text path; only the two language names are fixed. */
 overlay('<section id="v5Language" class="v5-dialog"><h2>'+T('Language','语言')+'</h2><div class="v5-language-options" translate="no">'+option('en','English','Current language','en')+option('zh','中文','当前语言','zh-Hans')+'</div><div class="row"><button type="button" class="btn" id="v5LanguageDone">'+T('Keep this language','保持当前语言')+'</button></div></section>');
 const finish=()=>{closeOv();restoreFocus(opener)};
 $('v5LanguageDone').onclick=finish;
 $('v5Language').querySelectorAll('[data-v5-lang]').forEach(b=>b.onclick=()=>{const change=b.dataset.v5Lang!==current;finish();if(change){window.MindGardenLanguage.toggle();restoreFocus(opener)}});
 $('v5Language').querySelector('[aria-pressed="true"]')?.focus();
}

/* Home-card help opens as a centred dialog, so it can never be clipped by the screen edge. */
function cardHelp(trigger){
 const choice=trigger.closest('.welcome-choice'),action=choice?.querySelector('.welcome-feature'),title=action?.querySelector('strong')?.textContent.trim()||trigger.getAttribute('aria-label')||'';
 const text=trigger.dataset.info||trigger.parentElement.querySelector('.mg-help-text')?.textContent||'';
 if(!text)return false;
 window.MindGardenInfo?.hide();
 window.MindGardenMenuHistory?.enter('card-help',()=>cardHelp(trigger));
 /* The shared popup header supplies the single Close (x) control and Escape. */
 overlay('<section id="v5CardHelp" class="v5-dialog"><h2>'+esc(title)+'</h2><p>'+esc(text)+'</p>'+(action?'<div class="row"><button type="button" class="btn main" id="v5CardHelpGo">'+esc(title)+'</button></div>':'')+'</section>');
 const go=$('v5CardHelpGo');if(go){go.onclick=()=>{closeOv();action.click()};go.focus()}
 return true;
}
document.addEventListener('click',event=>{const trigger=event.target.closest?.('#welcomeDashboard .mg-help-trigger, #welcomeDashboard .mg-info-button');if(trigger&&cardHelp(trigger)){event.preventDefault();event.stopPropagation()}},true);

/* Today's Games: Begin starts the activity with the chosen level, without a second settings screen. */
function beginFromSetup(){
 const box=$('box');if(!box||$('ov').classList.contains('hidden'))return;
 const start=$('personalPairStart')||(box.querySelector('.personal-setup')?[...box.querySelectorAll('.btn.main')].find(b=>!b.hidden&&!b.disabled&&!b.closest('.personal-setup')):null);
 start?.click();
}

/* All Games: categories as visible buttons. The original select stays in the page as the source of truth. */
function chips(){
 const select=$('gameCategory');if(!select||select.dataset.v5Chips)return;select.dataset.v5Chips='1';
 const label=select.closest('label'),row=document.createElement('div');row.className='v5-category-chips';row.setAttribute('role','group');row.setAttribute('aria-label',T('Category','类别'));
 for(const item of select.options){const b=document.createElement('button');b.type='button';b.className='btn v5-chip';b.dataset.v5Category=item.value;b.textContent=item.textContent;b.setAttribute('aria-pressed',String(item.selected));
  b.onclick=()=>{if(select.value!==item.value){select.value=item.value;select.dispatchEvent(new Event('change',{bubbles:true}))}for(const other of row.children)other.setAttribute('aria-pressed',String(other===b));queueMicrotask(()=>document.querySelector('.v5-chip[data-v5-category="'+item.value+'"]')?.focus({preventScroll:true}))};row.append(b)}
 label.hidden=true;label.after(row);
}

/* My Games: removal is a separate, deliberate mode. Scores are always kept. */
function removeMode(){
 const panel=$('box')?.querySelector('.personal-simple'),picker=$('personalPicker');if(!panel||!picker||$('v5RemoveMode'))return;
 const b=document.createElement('button');b.type='button';b.id='v5RemoveMode';b.className='btn';b.setAttribute('aria-pressed','false');b.textContent=T('Remove games','移除游戏');
 b.onclick=()=>{const on=panel.classList.toggle('v5-removing');b.setAttribute('aria-pressed',String(on));b.textContent=on?T('Finish removing','完成移除'):T('Remove games','移除游戏')};
 picker.after(b);
}

/* Controls that left the phone toolbar stay one step away in the menu. */
function menuItems(){
 const menu=$('navMenu');if(!menu)return;
 const account=$('navAccount'),player=menu.querySelector('[data-menu-group="player"]');
 if(account&&player){let b=$('v5MenuAccount');if(!b){b=document.createElement('button');b.type='button';b.id='v5MenuAccount';b.onclick=()=>{closeMenu();$('navAccount')?.click()};player.append(b)}const text=account.textContent.trim();if(b.textContent!==text)b.textContent=text}
 const motion=$('homeAnimationToggle'),garden=$('gardenViewControls');
 if(motion&&garden){let b=$('v5MenuMotion');if(!b){b=document.createElement('button');b.type='button';b.id='v5MenuMotion';b.onclick=()=>{$('homeAnimationToggle')?.click();queueMicrotask(menuItems)};garden.append(b)}const text=motion.getAttribute('aria-label')||T('Garden animation','花园动画');if(b.textContent!==text)b.textContent=text}
}

let queued=false;
function refresh(){queued=false;chips();removeMode();menuItems()}
function schedule(){if(queued)return;queued=true;queueMicrotask(refresh)}
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
window.addEventListener('gardenLanguageChange',schedule);
window.MindGardenV5={language,beginFromSetup,cardHelp};
refresh();
})();
