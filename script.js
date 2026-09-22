(() => {
  'use strict';
  const menu = document.querySelector('.js-menu');
  const nav = document.querySelector('.js-nav');
  if (menu && nav) {
    const close = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open);
    });
    document.addEventListener('click', ev => { if (!ev.target.closest('.js-navwrap')) close(); });
    nav.addEventListener('click', close);
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') close(); });
  }
  const form = document.querySelector('#finder');
  if (form) {
    form.hidden = false;
    const list = document.querySelector('#records');
    const rows = [...list.querySelectorAll('[data-record]')];
    const search = form.querySelector('#q');
    const fa = form.querySelector('#fa');
    const fb = form.querySelector('#fb');
    const order = form.querySelector('#sort');
    const norm = v => v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const results = document.querySelector('#results');
    const noun = results ? (results.dataset.noun || 'records') : 'records';
    function update() {
      const terms = norm(search.value.trim()).split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(row => {
        const text = norm(row.dataset.search || '');
        let ok = terms.every(t => text.includes(t));
        if (ok && fa && fa.value) ok = row.dataset.fa === fa.value;
        if (ok && fb && fb.value) ok = row.dataset.fb === fb.value;
        row.hidden = !ok; if (ok) count++;
      });
      if (order) {
        [...rows].sort((a,b) => order.value === 'oldest'
          ? (+a.dataset.year||0)-(+b.dataset.year||0)
          : (+b.dataset.year||0)-(+a.dataset.year||0)).forEach(r => list.append(r));
      }
      if (results) results.textContent = count + ' ' + (count === 1 ? noun.replace(/s$/,'') : noun);
      const nr = document.querySelector('#no-results'); if (nr) nr.hidden = count > 0;
    }
    form.addEventListener('submit', ev => ev.preventDefault());
    form.addEventListener('input', update); form.addEventListener('change', update);
    form.addEventListener('reset', () => requestAnimationFrame(update));
    update();
  }
  const viewer = document.querySelector('#viewer');
  if (viewer) {
    const large = viewer.querySelector('#vphoto');
    const cap = viewer.querySelector('#vcap');
    const num = viewer.querySelector('#vnum');
    let current = 0, seq = [], back;
    const show = i => {
      current = (i + seq.length) % seq.length;
      const it = seq[current];
      large.src = it.getAttribute('href'); large.alt = it.dataset.caption || '';
      if (cap) cap.textContent = it.dataset.caption || '';
      if (num) num.textContent = (current+1) + ' / ' + seq.length + ' · Edik Natanov Collection';
    };
    document.querySelectorAll('[data-photo]').forEach(link => link.addEventListener('click', ev => {
      if (!viewer.showModal || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault(); back = link;
      seq = [...document.querySelectorAll('[data-photo]')].filter(x => !x.closest('[hidden]'));
      show(seq.indexOf(link)); viewer.showModal(); document.body.style.overflow = 'hidden';
    }));
    viewer.querySelector('#vclose').addEventListener('click', () => viewer.close());
    viewer.querySelector('#vprev').addEventListener('click', () => show(current-1));
    viewer.querySelector('#vnext').addEventListener('click', () => show(current+1));
    viewer.addEventListener('close', () => { document.body.style.overflow=''; back && back.focus(); });
    viewer.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowRight'){ ev.preventDefault(); show(current+1); }
      if (ev.key === 'ArrowLeft'){ ev.preventDefault(); show(current-1); }
    });
  }
})();