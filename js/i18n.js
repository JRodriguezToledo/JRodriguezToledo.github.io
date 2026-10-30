/* EN / ES switch. English is the page's own text; Spanish comes from window.I18N_ES. */
(function () {
  'use strict';
  var D = window.I18N_ES; if (!D) return;
  var SKIP = { SCRIPT: 1, STYLE: 1, PRE: 1, TITLE: 1, NOSCRIPT: 1 };
  var nodes = [];   // { node, en, lead, trail }
  var attrs = [];   // { el, name, en }
  var enTitle = document.title, enDesc = (document.querySelector('meta[name="description"]') || {}).content;

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  (function collect() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (SKIP[n.parentNode.nodeName]) continue;
      var t = norm(n.nodeValue); if (!t) continue;
      var m = n.nodeValue.match(/^(\s*)[\s\S]*?(\s*)$/);
      nodes.push({ node: n, en: t, lead: m[1], trail: m[2] });
    }
    document.querySelectorAll('[alt],[data-cap],[aria-label]').forEach(function (el) {
      ['alt', 'data-cap', 'aria-label'].forEach(function (a) { if (el.hasAttribute(a)) attrs.push({ el: el, name: a, en: el.getAttribute(a) }); });
    });
  })();

  function apply(lang) {
    var es = lang === 'es';
    nodes.forEach(function (o) {
      var t = es && D.texts[o.en] ? D.texts[o.en] : o.en;
      o.node.nodeValue = o.lead + t + o.trail;
    });
    attrs.forEach(function (o) { o.el.setAttribute(o.name, es && D.texts[o.en] ? D.texts[o.en] : o.en); });
    document.documentElement.lang = es ? 'es' : 'en';
    document.title = es ? D.meta.title : enTitle;
    var md = document.querySelector('meta[name="description"]'); if (md) md.content = es ? D.meta.description : enDesc;
    var b = document.getElementById('langBtn');
    if (b) { b.textContent = es ? 'EN' : 'ES'; b.setAttribute('aria-label', es ? 'Switch to English' : 'Cambiar a español'); b.setAttribute('lang', es ? 'en' : 'es'); }
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  var saved = null; try { saved = localStorage.getItem('lang'); } catch (e) {}
  var browserEs = /^es\b/i.test((navigator.languages && navigator.languages[0]) || navigator.language || '');
  var lang = saved || (browserEs ? 'es' : 'en');
  if (lang === 'es') apply('es');
  var btn = document.getElementById('langBtn');
  if (btn) btn.addEventListener('click', function () { lang = lang === 'es' ? 'en' : 'es'; apply(lang); });
  if (btn && lang === 'en') btn.setAttribute('lang', 'es');
})();
