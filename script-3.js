(function(){
  'use strict';
  const nav = document.getElementById('nav');
  if(!nav) return;

  const pages = Array.from(document.querySelectorAll('.page[id^="page-"]'));
  const pageByKey = new Map(pages.map(p => [p.id.slice(5), p]));
  const moduleGroups = [];
  const moduleByPage = new Map();
  const moduleToggleSet = new Set();

  // Build module definitions from the existing sidebar structure.
  Array.from(nav.children).forEach(el => {
    if(!el.classList || !el.classList.contains('nav-item')) return;
    const sub = el.nextElementSibling;
    if(!sub || !sub.classList || !sub.classList.contains('subnav')) return;
    el.classList.add('module-toggle');
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('aria-expanded','false');
    sub.classList.remove('open');
    const pageKeys = Array.from(sub.querySelectorAll('.nav-item[data-page]'))
      .map(x => x.getAttribute('data-page'))
      .filter((x,i,a) => x && pageByKey.has(x) && a.indexOf(x) === i);
    const group = {toggle:el, subnav:sub, name:cleanName(el.textContent), pages:pageKeys};
    moduleGroups.push(group);
    moduleToggleSet.add(el);
    pageKeys.forEach(k => moduleByPage.set(k, group));
  });

  function cleanName(value){
    return String(value || '')
      .replace(/^\s*Section\s+\d+\s*[—–-]\s*/i,'')
      .replace(/^\s*\d+\s*[.)]\s*/,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  // Remove list numbering from module/submodule names only.
  nav.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if(!moduleToggleSet.has(item)) item.textContent = cleanName(item.textContent);
  });
  nav.querySelectorAll('.sub-label').forEach(label => {
    if(/^\s*(?:the\s+)?seven\s+sections?\s*$/i.test(label.textContent) || /^\s*seven\s+section\s*$/i.test(label.textContent)){
      label.textContent = 'Section';
    }
  });

  // Remove matching numbering from detail-page titles without touching real names such as 14-Day / 28-Day Cycle.
  pages.forEach(page => {
    const h1 = page.querySelector('h1.page-title');
    if(!h1) return;
    const key = page.id.slice(5);
    const linked = nav.querySelector('.subnav .nav-item[data-page="' + CSS.escape(key) + '"]');
    if(linked){
      const linkedName = cleanName(linked.textContent);
      const original = h1.textContent.trim();
      if(/^Section\s+\d+\s*[—–-]/i.test(original)) h1.textContent = linkedName;
      else if(/^\d+\s*[.)]\s*/.test(original)) h1.textContent = original.replace(/^\s*\d+\s*[.)]\s*/, '');
    }
  });

  function closeAllModules(){
    moduleGroups.forEach(g => {
      g.subnav.classList.remove('open');
      g.toggle.classList.remove('expanded');
      g.toggle.setAttribute('aria-expanded','false');
    });
  }

  function openModule(group){
    if(!group) return;
    closeAllModules();
    group.subnav.classList.add('open');
    group.toggle.classList.add('expanded');
    group.toggle.setAttribute('aria-expanded','true');
  }

  function syncModuleForPage(key){
    moduleGroups.forEach(g => g.toggle.classList.remove('module-active'));
    const group = moduleByPage.get(key);
    if(group){
      openModule(group);
      group.toggle.classList.add('module-active');
    }
  }

  // Wrap existing showPage so subgroup navigation, Next, and in-page links keep the current module visible.
  if(typeof window.showPage === 'function'){
    const originalShowPage = window.showPage;
    window.showPage = function(target){
      originalShowPage(target);
      syncModuleForPage(target);
    };
    try { showPage = window.showPage; } catch(e) {}
  }

  // Module headings are static: click only expands/collapses subgroups, never opens a detail page.
  function toggleModuleHeading(toggle){
    const group = moduleGroups.find(g => g.toggle === toggle);
    if(!group) return;
    const isOpen = group.subnav.classList.contains('open');
    if(isOpen){
      group.subnav.classList.remove('open');
      group.toggle.classList.remove('expanded');
      group.toggle.setAttribute('aria-expanded','false');
    } else {
      openModule(group);
    }
  }

  nav.addEventListener('click', function(e){
    const toggle = e.target.closest('.module-toggle');
    if(!toggle) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleModuleHeading(toggle);
  }, true);
  nav.addEventListener('keydown', function(e){
    const toggle = e.target.closest('.module-toggle');
    if(!toggle || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    toggleModuleHeading(toggle);
  }, true);

  // Build a single page sequence from sidebar order; duplicate module-heading data-page values are skipped.
  const sequence = [];
  nav.querySelectorAll('.nav-item[data-page]').forEach(item => {
    if(moduleToggleSet.has(item)) return;
    const key = item.getAttribute('data-page');
    if(key && pageByKey.has(key) && !sequence.includes(key)) sequence.push(key);
  });

  function labelForPage(key){
    const item = nav.querySelector('.subnav .nav-item[data-page="' + CSS.escape(key) + '"]') ||
                 nav.querySelector('.nav-item[data-page="' + CSS.escape(key) + '"]');
    if(item) return cleanName(item.textContent);
    const page = pageByKey.get(key), h = page && page.querySelector('h1.page-title');
    return h ? cleanName(h.textContent) : key;
  }

  function makeNavButton(kind, key){
    const b = document.createElement('button');
    b.type = 'button';
    b.className = kind;
    b.setAttribute('data-goto', key);
    const small = document.createElement('small');
    small.textContent = kind === 'prev' ? '← Previous' : 'Next →';
    b.appendChild(small);
    b.appendChild(document.createTextNode(labelForPage(key)));
    return b;
  }

  function downloadModule(group){
    if(!group || !group.pages.length) return;
    const content = group.pages.map(key => {
      const source = pageByKey.get(key);
      if(!source) return '';
      const clone = source.cloneNode(true);
      clone.classList.add('active');
      clone.querySelectorAll('.pager,.module-download,.shot-hint').forEach(x => x.remove());
      clone.querySelectorAll('[hidden]').forEach(x => x.removeAttribute('hidden'));
      return clone.outerHTML;
    }).join('\n<hr class="page-break"/>\n');
    const doc = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + escapeHtml(group.name) +
      '</title></head><body><h1>' +
      escapeHtml(group.name) + ' — Complete Module</h1>' + content + '</body></html>';
    const blob = new Blob(['\ufeff', doc], {type:'application/msword'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFileName(group.name) + '.doc';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function safeFileName(s){
    return String(s).replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim() || 'FidentraOS Module';
  }

  // Standard pager on every navigable page. Last page of each module also gets complete-module Word download.
  sequence.forEach((key, idx) => {
    const page = pageByKey.get(key);
    if(!page) return;
    page.querySelectorAll(':scope > .pager').forEach(p => p.remove());
    const pager = document.createElement('div');
    pager.className = 'pager generated-pager';
    if(idx > 0) pager.appendChild(makeNavButton('prev', sequence[idx-1]));
    const group = moduleByPage.get(key);
    if(group && group.pages[group.pages.length - 1] === key){
      const dl = document.createElement('button');
      dl.type = 'button';
      dl.className = 'module-download';
      const small = document.createElement('small');
      small.textContent = 'Complete Module';
      dl.appendChild(small);
      dl.appendChild(document.createTextNode('Download as Word'));
      dl.addEventListener('click', () => downloadModule(group));
      pager.appendChild(dl);
    }
    if(idx < sequence.length - 1) pager.appendChild(makeNavButton('next', sequence[idx+1]));
    page.appendChild(pager);
  });

  // Keep subgroups hidden on first load unless a module detail page was directly activated before this script.
  const active = document.querySelector('.page.active[id^="page-"]');
  const activeKey = active ? active.id.slice(5) : '';
  if(moduleByPage.has(activeKey)) syncModuleForPage(activeKey); else closeAllModules();
})();
