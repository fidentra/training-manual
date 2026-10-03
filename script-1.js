const navItems = document.querySelectorAll('.nav-item[data-page]');
  const pages = document.querySelectorAll('.page');

  function showPage(target){
    const page = document.getElementById('page-' + target);
    if(!page) return;
    navItems.forEach(n => n.classList.remove('active'));
    // activate all nav items pointing to this page (sidebar + subnav)
    document.querySelectorAll('.nav-item[data-page="'+target+'"]').forEach(n => n.classList.add('active'));
    pages.forEach(p => p.classList.remove('active'));
    page.classList.add('active');
    window.scrollTo(0,0);
    const cur = document.querySelector('.subnav .nav-item.active');
    if(cur) cur.scrollIntoView({block:'nearest'});
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => showPage(item.getAttribute('data-page')));
  });

  // in-page links, flow-diagram steps and previous/next buttons
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]');
    if(g){ e.preventDefault(); showPage(g.getAttribute('data-goto')); }
  });


  // ---------- Job Order topic search ----------
  (function(){
    const q = document.getElementById('jo-topic-search');
    const grid = document.getElementById('jo-topic-grid');
    const count = document.getElementById('jo-topic-count');
    if(!q || !grid) return;
    const cards = Array.from(grid.querySelectorAll('.jo-topic-card'));
    function apply(){
      const term = q.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const hay = (card.textContent + ' ' + (card.dataset.keywords || '')).toLowerCase();
        const ok = !term || hay.includes(term);
        card.hidden = !ok;
        if(ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? ' topic' : ' topics');
    }
    q.addEventListener('input', apply);
  })();

  // ---------- screenshot viewer ----------
  (function(){
    const box = document.getElementById('lightbox');
    const img = box.querySelector('.lb-stage img');
    const stage = box.querySelector('.lb-stage');
    const cap = box.querySelector('.lb-caption');
    const count = box.querySelector('.lb-count');
    const bPrev = box.querySelector('.lb-prev');
    const bNext = box.querySelector('.lb-next');
    const bSize = box.querySelector('.lb-size');
    const bClose = box.querySelector('.lb-close');
    let list = [], idx = 0, opener = null;

    const LEVELS = [0, 1.5, 2];            // 0 = fit to screen
    let level = 0;
    function setZoom(l){
      level = l;
      const z = LEVELS[l];
      if(z === 0){
        img.style.width = ''; img.style.maxWidth = ''; img.style.maxHeight = '';
        bSize.textContent = 'Zoom: Fit';
      } else {
        img.style.maxWidth = 'none'; img.style.maxHeight = 'none';
        img.style.width = Math.round(img.naturalWidth * z) + 'px';
        bSize.textContent = 'Zoom: ' + Math.round(z * 100) + '%';
      }
    }
    function cycleZoom(){ setZoom((level + 1) % LEVELS.length); }
    function show(i){
      idx = i;
      const el = list[i];
      img.src = el.src;
      img.alt = el.alt;
      cap.textContent = el.closest('figure').querySelector('figcaption').textContent;
      count.textContent = list.length > 1 ? (i + 1) + ' / ' + list.length : '';
      bPrev.disabled = i === 0;
      bNext.disabled = i === list.length - 1;
      bPrev.style.display = bNext.style.display = list.length > 1 ? '' : 'none';
      setZoom(0);
      stage.scrollTo(0, 0);
    }
    function open(el){
      const page = el.closest('.page');
      list = Array.from(page.querySelectorAll('figure.zoomable img'));
      opener = el;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      show(list.indexOf(el));
      bClose.focus();
    }
    function close(){
      box.hidden = true;
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if(opener) opener.focus({preventScroll:true});
    }

    document.addEventListener('click', e => {
      const el = e.target.closest('figure.zoomable img');
      if(el) open(el);
    });
    document.addEventListener('keydown', e => {
      if(box.hidden){
        const el = e.target.closest && e.target.closest('figure.zoomable img');
        if(el && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); open(el); }
        return;
      }
      if(e.key === 'Escape') close();
      else if(e.key === 'ArrowLeft' && idx > 0) show(idx - 1);
      else if(e.key === 'ArrowRight' && idx < list.length - 1) show(idx + 1);
    });
    bClose.addEventListener('click', close);
    bPrev.addEventListener('click', () => idx > 0 && show(idx - 1));
    bNext.addEventListener('click', () => idx < list.length - 1 && show(idx + 1));
    bSize.addEventListener('click', cycleZoom);
    img.addEventListener('click', cycleZoom);
    stage.addEventListener('click', e => { if(e.target === stage) close(); });
  })();
