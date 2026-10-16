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

  /* ---------- Sector occupancy simulation (illustrative) ---------- */
  var canvas = document.getElementById('chart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var peakIn = document.getElementById('peak'), capIn = document.getElementById('cap');
  var peakOut = document.getElementById('peakOut'), capOut = document.getElementById('capOut');
  var readout = document.getElementById('readout');
  var HOURS = 48, DT = 0.1, RUNS = 30, MU = 3; // MU: each aircraft leaves at 3 per hour on average (about 20 minutes in the sector)
  var seed = 5721, runs = [];

  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function bump(h, m, s) { var d = (h - m) / s; return Math.exp(-0.5 * d * d); }
  function lambda(t, peak) { var h = t % 24; return peak * (0.12 + 0.88 * Math.min(1, 0.6 * bump(h, 9, 2.6) + 0.5 * bump(h, 18, 2.8))); }

  function simulate(peak, rand) {
    var steps = Math.round(HOURS / DT), out = new Uint8Array(steps + 1);
    var t = 0, n = Math.round(lambda(0, peak) / MU), k = 0;
    while (t < HOURS) {
      var rmax = peak + n * MU;
      var next = t - Math.log(1 - rand()) / rmax;
      while (k <= steps && k * DT <= next) { out[k++] = Math.min(255, n); }
      t = next; if (t >= HOURS) break;
      var u = rand() * rmax;
      if (u < lambda(t, peak)) n++;
      else if (u < lambda(t, peak) + n * MU) n--;
    }
    while (k <= steps) out[k++] = Math.min(255, n);
    return out;
  }

  function generate() {
    var peak = +peakIn.value, rand = rng(seed);
    runs = [];
    for (var i = 0; i < RUNS; i++) runs.push(simulate(peak, rand));
  }

  function draw() {
    var dpr = window.devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cap = +capIn.value, peak = +peakIn.value, steps = Math.round(HOURS / DT);
    var m = { l: 40, r: 12, t: 14, b: 30 };
    var maxY = Math.max(cap + 6, Math.ceil(peak / MU * 1.9));
    function X(i) { return m.l + (i / steps) * (w - m.l - m.r); }
    function Y(v) { return h - m.b - (v / maxY) * (h - m.t - m.b); }
    ctx.clearRect(0, 0, w, h);
    ctx.font = '12px "Public Sans", sans-serif'; ctx.fillStyle = '#9fc4e4'; ctx.strokeStyle = '#27435f'; ctx.lineWidth = 1;
    for (var hh = 0; hh <= HOURS; hh += 6) {
      var x = X(hh / DT); ctx.beginPath(); ctx.moveTo(x, m.t); ctx.lineTo(x, h - m.b); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText((hh % 24) + ':00', x, h - 10);
    }
    ctx.textAlign = 'right';
    var tick = maxY > 30 ? 10 : 5;
    for (var v = 0; v <= maxY; v += tick) { ctx.fillText(v, m.l - 8, Y(v) + 4); }
    // runs
    var over = 0, total = 0, busiest = 0, mean = new Float32Array(steps + 1);
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(120,175,225,0.28)';
    runs.forEach(function (r) {
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var yy = Y(r[i]); if (i === 0) ctx.moveTo(X(i), yy); else { ctx.lineTo(X(i), Y(r[i - 1])); ctx.lineTo(X(i), yy); }
        mean[i] += r[i] / runs.length; if (r[i] > cap) over++; total++; if (r[i] > busiest) busiest = r[i];
      }
      ctx.stroke();
    });
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (var j = 0; j <= steps; j++) { if (j === 0) ctx.moveTo(X(j), Y(mean[j])); else ctx.lineTo(X(j), Y(mean[j])); }
    ctx.stroke();
    ctx.strokeStyle = '#ff6a2b'; ctx.lineWidth = 2; ctx.setLineDash([7, 5]); ctx.beginPath();
    ctx.moveTo(m.l, Y(cap)); ctx.lineTo(w - m.r, Y(cap)); ctx.stroke(); ctx.setLineDash([]);
    var pct = (100 * over / total);
    readout.textContent = 'Above capacity ' + (pct < 10 ? pct.toFixed(1) : Math.round(pct)) + '% of the time. The busiest run reached ' + busiest + ' aircraft.';
    canvas.setAttribute('aria-label', 'Aircraft in the sector over two days for ' + RUNS + ' simulated runs with capacity ' + cap + '. ' + readout.textContent);
  }

  var timer;
  function update(regen) { peakOut.textContent = peakIn.value; capOut.textContent = capIn.value; if (regen) generate(); draw(); }
  peakIn.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { update(true); }, 40); });
  capIn.addEventListener('input', function () { update(false); });
  document.getElementById('again').addEventListener('click', function () { seed = Math.floor(Math.random() * 1e9); update(true); });
  window.addEventListener('resize', function () { clearTimeout(timer); timer = setTimeout(draw, 100); });
  update(true);
})();
