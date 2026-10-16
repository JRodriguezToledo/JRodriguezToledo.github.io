(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: one orchestrated entrance ---------- */
  var h1 = document.getElementById('name');
  var text = h1.textContent;
  h1.setAttribute('aria-label', text);
  h1.textContent = '';
  var chars = [];
  text.split(' ').forEach(function (word, wi, words) {
    var w = document.createElement('span');
    w.style.whiteSpace = 'nowrap';
    w.setAttribute('aria-hidden', 'true');
    word.split('').forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'ch'; s.textContent = c; w.appendChild(s); chars.push(s);
    });
    h1.appendChild(w);
    if (wi < words.length - 1) h1.appendChild(document.createTextNode(' '));
  });

  var rest = ['.where', '.lede', '.hint', '.nav'];
  var started = false;
  function intro() {
    if (started) return; started = true;
    if (reduced || !window.gsap) {
      chars.forEach(function (c) { c.style.opacity = 1; });
      rest.forEach(function (q) { var e = document.querySelector(q); if (e) e.style.opacity = 1; });
      if (window.fluid) window.fluid.pass();
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.add(function () { window.fluid && window.fluid.pass(); }, 0.15)
      .fromTo(chars, { opacity: 0, yPercent: 60, rotate: 3 }, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.035 }, 0.25)
      .fromTo('.where', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .fromTo('.lede', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .fromTo(['.nav', '.hint'], { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.5);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(intro, 80); });
  else intro();
  setTimeout(intro, 2500);
  // A gentle wake every so often while the hero is on screen, to show the sky is alive; click and drag stirs it
  if (!reduced) setInterval(function () { if (window.scrollY < window.innerHeight * 0.6 && window.fluid) window.fluid.pass(); }, 15000);

  /* ---------- Click a project figure to enlarge it ---------- */
  var lb = document.getElementById('lb');
  if (lb && lb.showModal) {
    var lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button.fig');
      if (b) {
        lbImg.src = b.getAttribute('data-full'); lbImg.alt = b.querySelector('img').alt; lbCap.textContent = b.getAttribute('data-cap') || '';
        lb.showModal(); return;
      }
      if (e.target === lb || e.target.id === 'lbClose' || e.target === lbImg) lb.close();
    });
  }

  /* ---------- Coursework animations: play while visible ---------- */
  var vids = document.querySelectorAll('.anims video');
  if (vids.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      vids.forEach(function (v) { v.controls = true; });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { var p = en.target.play(); if (p && p.catch) p.catch(function () {}); } else en.target.pause(); });
      }, { threshold: 0.4 });
      vids.forEach(function (v) { io.observe(v); });
    }
  }

})();
