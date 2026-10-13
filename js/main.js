(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var vh = window.innerHeight;
  var animated = !reduce && hasIO;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  if (animated) root.classList.add('js');
  try { init(); } catch (err) {
    root.classList.remove('js');
    if (window.console) console.error(err);
  }

  function init() {

    var lenis = null;
    // only turn smooth scroll on if the page is long enough, short pages did weird things
    if (window.Lenis && !reduce && root.scrollHeight > vh + 160) {
      try { lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.85, smoothWheel: true }); } catch (e) { lenis = null; }
    }

    var nav = $('#nav');
    var menu = $('#navmenu'), menuBtn = $('#menubtn');

    var links = $$('.links a'), ind = $('.ind'), cur = $('.links a[aria-current="page"]');
    function place(a, instant) {
      if (!ind) return;
      if (!a) { ind.style.opacity = '0'; return; }
      if (instant) ind.style.transition = 'none';
      ind.style.opacity = '1';
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + a.offsetLeft + 'px)';
      if (instant) { void ind.offsetWidth; ind.style.transition = ''; }
    }
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { place(a); });
      a.addEventListener('focus', function () { place(a); });
    });
    var linksBox = $('.links');
    if (linksBox) {
      linksBox.addEventListener('mouseleave', function () { place(cur); });
      linksBox.addEventListener('focusout', function () { place(cur); });
    }
    place(cur, true);
    window.addEventListener('resize', function () { vh = window.innerHeight; place(cur, true); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(cur, true); });

    $$('a', menu).forEach(function (a, i) { a.style.setProperty('--i', i); });
    function setMenu(open) {
      if (!menu || !menuBtn) return;
      menu.classList.toggle('open', open);
      menuBtn.classList.toggle('on', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      root.classList.toggle('menu-open', open);
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    }
    if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    function scrollToY(y) {
      if (lenis) lenis.scrollTo(y, { duration: 1.8 });
      else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || e.defaultPrevented) return;
      var href = a.getAttribute('href');
      if (!href || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      if (href.charAt(0) === '#') {
        var id = href.slice(1);
        var t = id ? document.getElementById(id) : null;
        if (!t) return;
        e.preventDefault();
        setMenu(false);
        // 96 is about the nav height, bump it if the nav ever gets taller
        scrollToY(t.getBoundingClientRect().top + window.scrollY - 96);
        return;
      }
      // only our own .html links get the fade, mailto and external links just go like normal
      if (/^(mailto:|tel:|https?:)/i.test(href) || !/\.html($|[#?])/.test(href)) return;
      e.preventDefault();
      setMenu(false);
      if (reduce) { window.location.href = href; return; }
      root.classList.add('leaving');
      setTimeout(function () { window.location.href = href; }, 380);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leaving'); });

    $$('.stagger').forEach(function (c) {
      Array.prototype.forEach.call(c.children, function (ch, i) {
        ch.classList.add('rv');
        ch.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
      });
    });
    var rvs = $$('.rv');
    if (animated) {
      var rio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
      rvs.forEach(function (el) { rio.observe(el); });
    } else {
      rvs.forEach(function (el) { el.classList.add('in'); });
    }

    var counts = $$('.count');
    if (animated && counts.length) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          runCount(e.target);
        });
      }, { threshold: 0.4 });
      counts.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
    }
    function runCount(el) {
      var to = parseFloat(el.getAttribute('data-to')) || 0, t0 = null, dur = 1900;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min((ts - t0) / dur, 1);
        // ease out quart or something, copied it and it looked right
        el.textContent = k < 1 ? Math.round(to * (1 - Math.pow(1 - k, 4))) : to;
        if (k < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    var big = $('#big'), words = [];
    if (big && !reduce) {
      var parts = big.textContent.trim().split(/\s+/);
      big.textContent = '';
      parts.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'wd'; s.textContent = w;
        big.appendChild(s);
        if (i < parts.length - 1) big.appendChild(document.createTextNode(' '));
        words.push(s);
      });
      big.classList.add('split');
    }

    if (fine) {
      $$('.card').forEach(function (c) {
        c.addEventListener('pointermove', function (e) {
          var r = c.getBoundingClientRect();
          c.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
          c.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
        });
      });
    }

    var tls = $$('.tl');
    if (reduce) {
      tls.forEach(function (t) { t.style.setProperty('--tp', 1); $$('.tstep', t).forEach(function (s) { s.classList.add('on'); }); });
    }

    var items = $$('.svc-item'), sideLinks = $$('.svc-side a'), side = $('.svc-side'), svcMain = $('.svc-main');

    if (items.length && hasIO) {
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          sideLinks.forEach(function (a) {
            if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      items.forEach(function (i) { sio.observe(i); });
    }

    var heroIn = $('.hero-in');
    var cv = $('#grid');
    if (cv) heroGrid(cv);

    // email isnt written in the html anywhere on purpose, scrapers grab it. built here instead
    function realMail() { return ['cloverstudios.info', String.fromCharCode(64), 'gmail', '.', 'com'].join(''); }
    function fallbackCopy(txt) {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      return ok;
    }
    $$('.copy-mail').forEach(function (b) {
      var label = b.textContent;
      var flash = function (t) {
        b.textContent = t;
        setTimeout(function () { b.textContent = label; }, 1900);
      };
      b.addEventListener('click', function () {
        var txt = realMail();
        var done = function () { flash('Copied'); };
        var fail = function () { flash(fallbackCopy(txt) ? 'Copied' : 'Copy failed, type it out'); };
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fail);
          else fail();
        } catch (e) { fail(); }
      });
    });

    var lastMY = null;
    if (fine && nav) {
      window.addEventListener('pointermove', function (e) {
        if (lastMY !== null && (e.clientY < 90 || lastMY - e.clientY > 3)) nav.classList.remove('hide');
        lastMY = e.clientY;
      }, { passive: true });
      document.addEventListener('mouseleave', function () { lastMY = null; });
    }

    var lastY = window.scrollY, lastN = -1;
    function frame(t) {
      if (lenis) lenis.raf(t);
      var y = window.scrollY, dy = y - lastY;
      lastY = y;

      if (nav && !(menu && menu.classList.contains('open'))) {
        if (y > 260 && dy > 1.5) nav.classList.add('hide');
        else if (dy < -1.5 || y <= 260) nav.classList.remove('hide');
      }

      if (heroIn && y < vh * 1.2) {
        var k = clamp(y / (vh * 0.85), 0, 1);
        heroIn.style.transform = 'translate3d(0,' + (y * 0.14).toFixed(1) + 'px,0)';
        heroIn.style.opacity = (1 - k * 0.9).toFixed(3);
      }

      if (words.length) {
        var r = big.getBoundingClientRect();
        var mid = r.top + r.height * 0.5;
        var p = clamp((vh * 0.85 - mid) / (vh * 0.35), 0, 1);
        var n = Math.round(p * words.length);
        if (n !== lastN) {
          for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
          lastN = n;
        }
      }

      if (!reduce) {
        for (var q = 0; q < tls.length; q++) {
          var tl = tls[q];
          var rt = tl.getBoundingClientRect();
          var tp = clamp((vh * 0.8 - rt.top) / (rt.height + vh * 0.25), 0, 1);
          if (!tl._tp || Math.abs(tp - tl._tp) > 0.002) {
            tl._tp = tp;
            tl.style.setProperty('--tp', tp.toFixed(3));
            var st = tl.querySelectorAll('.tstep');
            for (var s = 0; s < st.length; s++) st[s].classList.toggle('on', tp > (s / st.length) * 0.9 + 0.04);
          }
        }
      }

      if (side && svcMain) {
        var rm = svcMain.getBoundingClientRect();
        side.style.setProperty('--sp', clamp((vh * 0.5 - rm.top) / rm.height, 0, 1).toFixed(3));
      }

      window.requestAnimationFrame(frame);
    }
    if (!reduce) frame(0);
  }

  function heroGrid(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var host = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var gap = 32, W = 0, H = 0, cols = 0, rows = 0;
    var mx = 0, my = 0, hasPtr = false, lastMove = 0;
    var running = false, inView = true;
    var raw =(getComputedStyle(root).getPropertyValue('--accent') || '#3fd68c').trim().replace('#', '');
    var n = parseInt(raw.length === 3 ? raw.replace(/./g, '$&$&') : raw, 16);
    var ar = (n >> 16) & 255, ag = (n >> 8) & 255, ab = n & 255;
    var br = 190, bg = 214, bb = 202;

    function resize() {
      var r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / gap) + 1; rows = Math.ceil(H / gap) + 1;
      if (!running) draw(0);
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var px = mx, py = my;
      if (!hasPtr || t - lastMove > 3500) {
        px = W * (0.5 + 0.32 * Math.cos(t * 0.00027));
        py = H * (0.5 + 0.28 * Math.sin(t * 0.00041));
      }
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var x = i * gap, y = j * gap;
          var dx = x - px, dy = y - py, d = Math.sqrt(dx * dx + dy * dy);
          var inf = d < 210 ? Math.pow(1 - d / 210, 2) : 0;
          var wave = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.008 - t * 0.0009);
          var a = 0.1 + wave * 0.1 + inf * 0.8;
          var rad = 1 + inf * 1.9;
          var ox = d > 0.1 ? (dx / d) * inf * 8 : 0;
          var oy = d > 0.1 ? (dy / d) * inf * 8 : 0;
          var m = inf;
          ctx.fillStyle = 'rgba(' + Math.round(br + (ar - br) * m) + ',' + Math.round(bg + (ag - bg) * m) + ',' + Math.round(bb + (ab - bb) * m) + ',' + a.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, rad, 0, 6.2832);
          ctx.fill();
        }
      }
    }
    function loop(t) {
      if (!running) return;
      draw(t);
      window.requestAnimationFrame(loop);
    }
    host.addEventListener('pointermove', function (e) {
      var r = host.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      hasPtr = true; lastMove = performance.now();
    }, { passive: true });
    window.addEventListener('resize', resize);
    resize();

    if (reduce) return;
    if (hasIO) {
      new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (inView && !running && !document.hidden) { running = true; window.requestAnimationFrame(loop); }
        else if (!inView) running = false;
      }).observe(host);
    } else {
      running = true; window.requestAnimationFrame(loop);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) running = false;
      else if (inView && !running) { running = true; window.requestAnimationFrame(loop); }
    });
  }
})();
