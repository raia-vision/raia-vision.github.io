(function () {
  var P = window.PROJECTS || [];
  var work = document.getElementById("work"), chips = document.getElementById("chips");
  var flat = [];                                   // every clip in page order, for prev/next

  P.forEach(function (p) {
    var sec = document.createElement("article");
    sec.className = "proj rv"; sec.id = p.id; sec.style.setProperty("--c", p.accent);
    sec.innerHTML = '<div class="proj-head"><h2><i></i>' + p.name + '</h2><div class="proj-meta"><b>' + p.tag + '</b>' + p.text + '</div></div><div class="grid"></div>';
    var grid = sec.querySelector(".grid");
    p.clips.forEach(function (c) {
      var idx = flat.length; flat.push({ p: p, c: c });
      var b = document.createElement("button");
      b.className = "card " + c.kind; b.style.setProperty("--c", p.accent);
      b.setAttribute("aria-label", "Play " + p.name + " - " + c.title);
      b.innerHTML = '<img loading="lazy" decoding="async" src="posters/' + c.slug + '.jpg" alt="' + p.name + ' - ' + c.title + '">' +
        '<span class="p"><svg viewBox="0 0 24 24"><path d="M6 4v16l14-8z" fill="#fff"/></svg></span><span class="t">' + c.title + '</span>';
      b.addEventListener("click", function () { open(idx); });
      grid.appendChild(b);
    });
    work.appendChild(sec);
    var li = document.createElement("li"), a = document.createElement("a");
    a.href = "#" + p.id; a.textContent = p.name; a.style.setProperty("--c", p.accent);
    li.appendChild(a); chips.appendChild(li);
  });

  // showreel
  var reel = document.getElementById("reel"), box = document.getElementById("showreel"), rp = document.getElementById("reelPlay");
  rp.addEventListener("click", function () { reel.controls = true; box.classList.add("playing"); reel.play(); });
  reel.addEventListener("ended", function () { box.classList.remove("playing"); reel.controls = false; });

  // lightbox
  var lb = document.getElementById("lightbox"), lv = document.getElementById("lbVideo"), cap = document.getElementById("lbCap"), cur = 0;
  function show(i) {
    cur = (i + flat.length) % flat.length;
    var it = flat[cur], h = it.c.kind === "h";
    lv.pause(); lv.src = "media/" + it.c.slug + ".mp4"; lv.poster = "posters/" + it.c.slug + ".jpg";
    lv.style.aspectRatio = h ? "16/9" : "9/16";
    lv.style.height = h ? "auto" : "min(100%, 78dvh)";
    lv.style.width = h ? "min(100%, 1200px)" : "auto";
    cap.textContent = it.p.name + " / " + it.c.title + "   (" + (cur + 1) + " of " + flat.length + ")";
    lv.play().catch(function () {});
  }
  function open(i) { if (!lb.open) lb.showModal(); show(i); }
  function close() { lv.pause(); lv.removeAttribute("src"); lv.load(); if (lb.open) lb.close(); }
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { show(cur - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.open) return;
    if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
  });

  // about: live CCTV clock + typewriter text
  var clock = document.getElementById("clock");
  function tick() {
    var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; };
    clock.textContent = p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear() + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }
  tick(); setInterval(tick, 1000);

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var typed = false;
  function startTyping() {
    if (typed) return; typed = true;
    var nodes = Array.prototype.slice.call(document.querySelectorAll(".about .type"));
    var jobs = nodes.map(function (n) { var v = n.querySelector(".vis"); return { n: n, v: v, text: n.querySelector(".sr").textContent, ms: +n.getAttribute("data-speed") || 12 }; });
    if (reduced) { jobs.forEach(function (j) { j.v.textContent = j.text; }); return; }
    var k = 0;
    (function next() {
      if (k >= jobs.length) return;
      var j = jobs[k++], i = 0; j.n.classList.add("typing");
      var t0 = Date.now();
      (function step() {
        i = Math.min(j.text.length, Math.floor((Date.now() - t0) / j.ms) + 1); j.v.textContent = j.text.slice(0, i);
        if (i < j.text.length) setTimeout(step, 16); else { j.n.classList.remove("typing"); next(); }
      })();
    })();
  }
  // reserve the final height so the layout does not jump while typing
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
    if (typed) return;
    document.querySelectorAll(".about .type").forEach(function (n) {
      var v = n.querySelector(".vis"); v.textContent = n.querySelector(".sr").textContent;
      n.style.minHeight = n.offsetHeight + "px"; v.textContent = "";
    });
  });
  window.addEventListener("resize", function () { if (typed) document.querySelectorAll(".about .type").forEach(function (n) { n.style.minHeight = ""; }); });

  // scroll reveal
  var els = document.querySelectorAll(".rv, .contact, .about");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); if (x.target.id === "about") startTyping(); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { e.classList.add("rv"); io.observe(e); });
  } else { els.forEach(function (e) { e.classList.add("in"); }); startTyping(); }
})();
