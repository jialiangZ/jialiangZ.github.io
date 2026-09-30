/* Self-hosted visitor map: interactive 3D globe on canvas (no external dependencies).
 * Land: Natural Earth 110m via assets/js/world-110m.json (public domain).
 * Stats: your Cloudflare Worker, with the repo snapshot as fallback.
 */
(function () {
  "use strict";

  var WORKER_URL = "https://visitor-map.1690608011qq.workers.dev";
  var WORLD_URL = "assets/js/world-110m.json";

  var CENTROIDS = {"FJ":[-17.8,178],"TZ":[-6.3,34.8],"EH":[24.3,-12.9],"CA":[56.8,-98.3],"US":[37.2,-95.8],"KZ":[48,66.9],"UZ":[41.4,64.5],"PG":[-6.6,145.9],"ID":[0.1,114],"AR":[-37.1,-63.5],"CL":[-35.7,-71.3],"CD":[-4,21.7],"SO":[5.2,46.1],"KE":[0.4,37.9],"SD":[15.1,30.2],"TD":[15.4,18.7],"HT":[19,-73],"DO":[18.7,-70.1],"RU":[61.5,99],"BS":[24.5,-78],"FK":[-51.7,-59.5],"NO":[64.6,18.1],"GL":[71.8,-42.8],"TF":[-49.2,69.6],"TL":[-8.8,126.2],"ZA":[-28.5,24.6],"LS":[-29.6,28.2],"MX":[23.6,-102],"UY":[-32.5,-55.8],"BR":[-14.3,-54.4],"BO":[-16.3,-63.5],"PE":[-9.2,-75],"CO":[4.1,-72.9],"PA":[8.4,-80.1],"CR":[9.7,-84.2],"NI":[12.9,-85.4],"HN":[14.5,-86.3],"SV":[13.8,-88.9],"GT":[15.8,-90.2],"BZ":[17.2,-88.7],"VE":[6.4,-66.5],"GY":[4.8,-59],"SR":[3.9,-56],"FR":[46.7,1.8],"EC":[-1.8,-78.1],"PR":[18.2,-66.4],"JM":[18.1,-77.3],"CU":[21.5,-79.6],"ZW":[-18.9,29.1],"BW":[-22.2,24.7],"NA":[-23,18.4],"SN":[14.5,-14.5],"ML":[17.5,-3.9],"MR":[21,-11],"BJ":[9.2,2.3],"NE":[17.6,8.1],"NG":[9.1,8.6],"CM":[7.3,12.2],"TG":[8.5,0.9],"GH":[7.9,-1.1],"CI":[7.4,-5.6],"GN":[9.9,-11.5],"GW":[11.8,-15.2],"LR":[6.4,-9.5],"SL":[8.4,-11.7],"BF":[12.4,-1.6],"CF":[6.7,20.9],"CG":[-0.7,14.8],"GA":[-0.8,11.6],"GQ":[1.6,10.3],"ZM":[-13.1,27.7],"MW":[-13,34.2],"MZ":[-18.5,35.5],"SZ":[-26.5,31.4],"AO":[-11.9,17.9],"BI":[-3.4,29.9],"IL":[31.4,35.1],"LB":[33.9,35.9],"MG":[-18.8,46.9],"PS":[31.9,35.2],"GM":[13.5,-15.3],"TN":[33.8,9.5],"DZ":[28.1,1.7],"JO":[31.3,37.1],"AE":[24.3,54],"QA":[25.3,51.2],"KW":[29.3,47.5],"IQ":[33.2,43.7],"OM":[20.8,55.9],"VU":[-15.2,166.9],"KH":[12.5,105],"TH":[13.1,101.5],"LA":[18.2,103.8],"MM":[19.1,96.7],"VN":[16,105.8],"KP":[40.3,127.5],"KR":[36.5,127.8],"MN":[46.8,103.8],"IN":[21.7,82.8],"BD":[23.6,90.4],"BT":[27.5,90.5],"NP":[28.4,84.1],"PK":[30.4,69.4],"AF":[33.9,67.8],"TJ":[38.8,71.2],"KG":[41.3,74.9],"TM":[39,59.5],"IR":[32.4,53.7],"SY":[34.8,39],"AM":[40,45],"SE":[62.2,17.5],"BY":[53.7,27.9],"UA":[48.8,31.1],"PL":[51.9,19.1],"AT":[47.7,13.2],"HU":[47.2,19.5],"MD":[47,28.3],"RO":[46,24.9],"LT":[55.1,23.8],"LV":[56.8,24.6],"EE":[58.5,25.7],"DE":[51.1,10.5],"BG":[42.7,25.5],"GR":[39.1,23.4],"TR":[38.9,35.5],"AL":[41.2,20.2],"HR":[44.5,16.5],"CH":[46.8,8.2],"LU":[49.8,6],"BE":[50.5,4.3],"NL":[52.2,5.2],"PT":[39.6,-8],"ES":[39.8,-3.2],"IE":[53.4,-8],"NC":[-21.3,165.6],"SB":[-7.9,159.1],"NZ":[-43.6,170.4],"AU":[-24.9,133.5],"LK":[7.9,80.7],"CN":[36.9,104.4],"TW":[23.6,121],"IT":[42.5,12.6],"DK":[56.3,9.5],"GB":[54.3,-2.2],"IS":[65,-19],"AZ":[40.1,47.7],"GE":[42.3,43.3],"PH":[15.5,122],"MY":[3.9,114.4],"BN":[4.7,114.8],"SI":[46.2,15.1],"FI":[65,26.1],"SK":[48.7,19.7],"CZ":[49.8,15.5],"ER":[15.2,39.7],"JP":[36.2,135.7],"PY":[-23.4,-58.5],"YE":[15.8,47.9],"SA":[24.3,45.1],"AQ":[-74.4,0],"CY":[35.3,33.7],"MA":[28.6,-9.1],"EG":[26.8,30.8],"LY":[26.4,17.2],"ET":[9.2,40.4],"DJ":[11.8,42.5],"UG":[1.4,32.3],"RW":[-2,29.9],"BA":[43.9,17.7],"MK":[41.6,21.7],"RS":[44.2,20.9],"ME":[42.7,19.4],"XK":[42.6,20.9],"TT":[10.4,-61.4],"SS":[7.9,29.6]};
  var COUNTRY_NAMES = {"AF":"Afghanistan","AO":"Angola","AL":"Albania","AE":"United Arab Emirates","AR":"Argentina","AM":"Armenia","AQ":"Antarctica","TF":"French Southern Territories","AU":"Australia","AT":"Austria","AZ":"Azerbaijan","BI":"Burundi","BE":"Belgium","BJ":"Benin","BF":"Burkina Faso","BD":"Bangladesh","BG":"Bulgaria","BS":"Bahamas","BA":"Bosnia and Herzegovina","BY":"Belarus","BZ":"Belize","BO":"Bolivia","BR":"Brazil","BN":"Brunei","BT":"Bhutan","BW":"Botswana","CF":"Central African Republic","CA":"Canada","CH":"Switzerland","CL":"Chile","CN":"China","CI":"Côte d'Ivoire","CM":"Cameroon","CD":"DR Congo","CG":"Congo","CO":"Colombia","CR":"Costa Rica","CU":"Cuba","CY":"Cyprus","CZ":"Czechia","DE":"Germany","DJ":"Djibouti","DK":"Denmark","DO":"Dominican Republic","DZ":"Algeria","EC":"Ecuador","EG":"Egypt","ER":"Eritrea","ES":"Spain","EE":"Estonia","ET":"Ethiopia","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands","FR":"France","GA":"Gabon","GB":"United Kingdom","GE":"Georgia","GH":"Ghana","GN":"Guinea","GM":"Gambia","GW":"Guinea-Bissau","GQ":"Equatorial Guinea","GR":"Greece","GL":"Greenland","GT":"Guatemala","GY":"Guyana","HN":"Honduras","HR":"Croatia","HT":"Haiti","HU":"Hungary","ID":"Indonesia","IN":"India","IE":"Ireland","IR":"Iran","IQ":"Iraq","IS":"Iceland","IL":"Israel","IT":"Italy","JM":"Jamaica","JO":"Jordan","JP":"Japan","KZ":"Kazakhstan","KE":"Kenya","KG":"Kyrgyzstan","KH":"Cambodia","KR":"South Korea","XK":"Kosovo","KW":"Kuwait","LA":"Laos","LB":"Lebanon","LR":"Liberia","LY":"Libya","LK":"Sri Lanka","LS":"Lesotho","LT":"Lithuania","LU":"Luxembourg","LV":"Latvia","MA":"Morocco","MD":"Moldova","MG":"Madagascar","MX":"Mexico","MK":"North Macedonia","ML":"Mali","MM":"Myanmar","ME":"Montenegro","MN":"Mongolia","MZ":"Mozambique","MR":"Mauritania","MW":"Malawi","MY":"Malaysia","NA":"Namibia","NC":"New Caledonia","NE":"Niger","NG":"Nigeria","NI":"Nicaragua","NL":"Netherlands","NO":"Norway","NP":"Nepal","NZ":"New Zealand","OM":"Oman","PK":"Pakistan","PA":"Panama","PE":"Peru","PH":"Philippines","PG":"Papua New Guinea","PL":"Poland","PR":"Puerto Rico","KP":"North Korea","PT":"Portugal","PY":"Paraguay","PS":"Palestine","QA":"Qatar","RO":"Romania","RU":"Russia","RW":"Rwanda","EH":"Western Sahara","SA":"Saudi Arabia","SD":"Sudan","SS":"South Sudan","SN":"Senegal","SB":"Solomon Islands","SL":"Sierra Leone","SV":"El Salvador","SO":"Somalia","RS":"Serbia","SR":"Suriname","SK":"Slovakia","SI":"Slovenia","SE":"Sweden","SZ":"Eswatini","SY":"Syria","TD":"Chad","TG":"Togo","TH":"Thailand","TJ":"Tajikistan","TM":"Turkmenistan","TL":"Timor-Leste","TT":"Trinidad and Tobago","TN":"Tunisia","TR":"Turkey","TW":"Taiwan","TZ":"Tanzania","UG":"Uganda","UA":"Ukraine","UY":"Uruguay","US":"United States","UZ":"Uzbekistan","VE":"Venezuela","VN":"Vietnam","VU":"Vanuatu","YE":"Yemen","ZA":"South Africa","ZM":"Zambia","ZW":"Zimbabwe"};

  var canvas, ctx, wrap, tipEl, counterEl, hintEl;
  var W = 0, H = 0, DPR = 1;

  var rings = [];   // country outer rings: [ [ [lon, lat], ... ], ... ]
  var dots = [];    // { lat, lon, count, label, isCity, phase, sx, sy, sc }
  var maxCount = 1;

  var rot = { lon: 100, lat: 22 }; // initial view faces East Asia
  var zoom = 1, zoomT = 1;
  var dragging = false, lastX = 0, lastY = 0, vLon = 0, vLat = 0;
  var pointers = new Map(), prevPinch = 0;
  var hover = -1, lastTip = "";
  var lastInteract = 0, hintHidden = false;
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var active = true, rafOn = false;

  var D2R = Math.PI / 180;
  var TAU = Math.PI * 2;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function radius() { return Math.min(W, H) / 2 * 0.92 * zoom; }

  // Orthographic projection; null when the point is on the far side.
  function project(lon, lat) {
    var l = (lon + rot.lon) * D2R, p = lat * D2R, p0 = rot.lat * D2R;
    var cp = Math.cos(p), sp = Math.sin(p), c0 = Math.cos(p0), s0 = Math.sin(p0);
    var cosc = s0 * sp + c0 * cp * Math.cos(l);
    if (cosc <= 0.012) return null;
    return {
      x: W / 2 + cp * Math.sin(l) * radius(),
      y: H / 2 - (c0 * sp - s0 * cp * Math.cos(l)) * radius(),
      c: cosc
    };
  }

  function resize() {
    if (!wrap) return;
    var w = wrap.getBoundingClientRect().width;
    if (!w) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(w * DPR));
    H = W;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = w + "px";
    canvas.style.height = w + "px";
  }

  function decodeWorld(topo) {
    if (!topo || !topo.objects || !topo.objects.countries) return [];
    var tr = topo.transform || { scale: [1, 1], translate: [0, 0] };
    var arcs = topo.arcs.map(function (arc) {
      var x = 0, y = 0;
      return arc.map(function (pt) {
        x += pt[0]; y += pt[1];
        return [x * tr.scale[0] + tr.translate[0], y * tr.scale[1] + tr.translate[1]];
      });
    });
    function ring(idxs) {
      var pts = [];
      for (var i = 0; i < idxs.length; i++) {
        var a = idxs[i] < 0 ? arcs[~idxs[i]].slice().reverse() : arcs[idxs[i]];
        for (var j = pts.length ? 1 : 0; j < a.length; j++) pts.push(a[j]);
      }
      return pts;
    }
    var out = [];
    topo.objects.countries.geometries.forEach(function (g) {
      var polys = g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : [];
      polys.forEach(function (poly) {
        var r = ring(poly[0]); // outer ring; holes are overpainted by their own country
        if (r.length > 3) out.push(r);
      });
    });
    return out;
  }

  function buildDots(stats) {
    dots = [];
    var counts = stats.counts || {};
    var cities = stats.cities || [];
    var citySum = {};
    for (var i = 0; i < cities.length; i++) {
      var c = cities[i];
      citySum[c.country] = (citySum[c.country] || 0) + c.count;
      dots.push({
        lat: c.lat, lon: c.lon, count: c.count, isCity: true, phase: i * 1.7,
        label: (c.city && c.city !== "Unknown" ? c.city + ", " : "") + (COUNTRY_NAMES[c.country] || c.country)
      });
    }
    for (var cc in counts) {
      var rem = counts[cc] - (citySum[cc] || 0);
      var p = CENTROIDS[cc];
      if (rem > 0 && p) {
        dots.push({
          lat: p[0], lon: p[1], count: rem, isCity: false, phase: dots.length * 1.3,
          label: (COUNTRY_NAMES[cc] || cc) + " (other areas)"
        });
      }
    }
    maxCount = 1;
    for (var j = 0; j < dots.length; j++) if (dots[j].count > maxCount) maxCount = dots[j].count;
  }

  // ---- rendering ----

  function tracePath(pts) {
    var started = false, any = false;
    ctx.beginPath();
    for (var i = 0; i < pts.length; i++) {
      var q = project(pts[i][0], pts[i][1]);
      if (q) {
        if (started) ctx.lineTo(q.x, q.y);
        else { ctx.moveTo(q.x, q.y); started = true; }
        any = true;
      } else {
        started = false;
      }
    }
    return any;
  }

  function drawGraticule() {
    ctx.strokeStyle = "rgba(9, 105, 218, 0.08)";
    ctx.lineWidth = 1;
    for (var lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      var st = false;
      for (var lat = -80; lat <= 80; lat += 5) {
        var q = project(lon, lat);
        if (q) { if (st) ctx.lineTo(q.x, q.y); else { ctx.moveTo(q.x, q.y); st = true; } }
        else st = false;
      }
      ctx.stroke();
    }
    for (var la = -60; la <= 60; la += 30) {
      ctx.beginPath();
      var s2 = false;
      for (var lo = -180; lo <= 180; lo += 5) {
        var q2 = project(lo, la);
        if (q2) { if (s2) ctx.lineTo(q2.x, q2.y); else { ctx.moveTo(q2.x, q2.y); s2 = true; } }
        else s2 = false;
      }
      ctx.stroke();
    }
  }

  function dotRadius(d, q) {
    var base = (2.2 + 9 * Math.sqrt(d.count / maxCount)) * (0.45 + 0.55 * q.c);
    if (!reduced) base *= 1 + 0.06 * Math.sin(performance.now() / 650 + d.phase);
    return base;
  }

  function drawDots() {
    var now = performance.now();
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var q = project(d.lon, d.lat);
      d.sx = q ? q.x : -1;
      d.sy = q ? q.y : -1;
      if (!q) continue;
      var t = d.count / maxCount;
      var base = (2.2 + 9 * Math.sqrt(t)) * (0.45 + 0.55 * q.c);
      if (!reduced) base *= 1 + 0.06 * Math.sin(now / 650 + d.phase);
      var core = d.isCity ? (t > 0.45 ? "#f76707" : "#fd9e4a") : "#93a9c9";
      var g = ctx.createRadialGradient(q.x - base * 0.3, q.y - base * 0.3, base * 0.1, q.x, q.y, base);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, core);
      g.addColorStop(1, d.isCity ? "rgba(233, 90, 12, 0.85)" : "rgba(125, 150, 190, 0.8)");
      ctx.save();
      ctx.shadowColor = d.isCity ? "rgba(253, 158, 74, 0.85)" : "rgba(147, 169, 201, 0.7)";
      ctx.shadowBlur = base * 1.6;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(q.x, q.y, base, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, R = radius();

    // atmosphere glow behind the sphere
    var atm = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.26);
    atm.addColorStop(0, "rgba(87, 148, 247, 0.25)");
    atm.addColorStop(1, "rgba(87, 148, 247, 0)");
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.26, 0, TAU); ctx.fill();

    // ocean with soft top-left lighting
    var oc = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, R * 0.08, cx, cy, R * 1.02);
    oc.addColorStop(0, "#f5faff");
    oc.addColorStop(0.55, "#dfeafc");
    oc.addColorStop(1, "#bfd6f2");
    ctx.fillStyle = oc;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();

    drawGraticule();

    // landmasses
    ctx.fillStyle = "#ccd7e7";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    for (var i = 0; i < rings.length; i++) {
      if (tracePath(rings[i])) { ctx.fill(); ctx.stroke(); }
    }

    // rim
    ctx.strokeStyle = "rgba(9, 105, 218, 0.30)";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

    drawDots();

    if (hover >= 0 && dots[hover] && dots[hover].sx >= 0) {
      var d = dots[hover];
      var q = { x: d.sx, y: d.sy, c: 0.5 };
      var base = (2.2 + 9 * Math.sqrt(d.count / maxCount)) * 0.9;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 1.6;
      ctx.shadowColor = "rgba(247, 103, 7, 0.9)";
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(d.sx, d.sy, base + 3.5, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 0;
      updateTip(d);
    } else {
      hideTip();
    }
  }

  // ---- animation loop ----

  function step() {
    zoom += (zoomT - zoom) * 0.12;
    if (Math.abs(zoomT - zoom) < 0.001) zoom = zoomT;
    if (!dragging) {
      rot.lon += vLon; rot.lat += vLat;
      vLon *= 0.95; vLat *= 0.95;
      if (Math.abs(vLon) < 0.005) vLon = 0;
      if (Math.abs(vLat) < 0.005) vLat = 0;
      if (!reduced && hover < 0 && performance.now() - lastInteract > 3000) rot.lon += 0.05;
    }
    rot.lat = clamp(rot.lat, -85, 85);
    if (rot.lon > 360) rot.lon -= 360;
    if (rot.lon < -360) rot.lon += 360;
  }

  function frame() {
    if (rafOn) requestAnimationFrame(frame);
    if (!active || document.hidden) return;
    step();
    draw();
  }

  // ---- interaction ----

  function hideHint() {
    if (hintHidden || !hintEl) return;
    hintHidden = true;
    hintEl.style.opacity = "0";
  }

  function updateTip(d) {
    if (!tipEl) return;
    var txt = d.label + " \u00b7 " + d.count + " view" + (d.count === 1 ? "" : "s");
    var x = d.sx / DPR, y = d.sy / DPR;
    var w = wrap.clientWidth;
    var lx = clamp(x, 70, w - 70);
    tipEl.style.left = lx + "px";
    tipEl.style.top = y + "px";
    if (txt !== lastTip) { tipEl.textContent = txt; lastTip = txt; }
    tipEl.style.opacity = "1";
  }

  function hideTip() {
    if (tipEl && lastTip !== "") { tipEl.style.opacity = "0"; lastTip = ""; }
  }

  function updateHover(e) {
    if (dragging || pointers.size > 0) { hover = -1; return; }
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var best = -1, bestD = (16 * DPR) * (16 * DPR);
    for (var i = 0; i < dots.length; i++) {
      if (dots[i].sx < 0) continue;
      var dx = dots[i].sx - mx, dy = dots[i].sy - my;
      var dd = dx * dx + dy * dy;
      if (dd < bestD) { bestD = dd; best = i; }
    }
    hover = best;
    canvas.style.cursor = best >= 0 ? "pointer" : "grab";
  }

  function onPointerDown(e) {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastInteract = performance.now();
    hideHint();
    if (pointers.size === 1) {
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      vLon = vLat = 0;
      hover = -1;
      canvas.style.cursor = "grabbing";
    }
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lastInteract = performance.now();
    if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (prevPinch > 0) zoomT = clamp(zoomT * (dist / prevPinch), 0.8, 3.5);
      prevPinch = dist;
      dragging = false;
      return;
    }
    if (dragging) {
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      var k = 0.28 / zoom;
      rot.lon += dx * k;
      rot.lat += dy * k;
      vLon = dx * k * 0.4;
      vLat = dy * k * 0.4;
    } else {
      updateHover(e);
    }
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) prevPinch = 0;
    if (pointers.size === 0) {
      dragging = false;
      canvas.style.cursor = "grab";
    }
    lastInteract = performance.now();
  }

  function onWheel(e) {
    e.preventDefault();
    zoomT = clamp(zoomT * Math.exp(-e.deltaY * 0.0012), 0.8, 3.5);
    lastInteract = performance.now();
    hideHint();
  }

  function bindEvents() {
    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", function () { hover = -1; hideTip(); });
    canvas.addEventListener("wheel", onWheel, { passive: false });
    if (typeof ResizeObserver === "function") new ResizeObserver(resize).observe(wrap);
    else window.addEventListener("resize", resize);
    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(function (en) { active = en[0] && en[0].isIntersecting; }, { rootMargin: "80px" }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () { lastInteract = performance.now(); });
  }

  // ---- data ----

  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
  }

  function loadStats() {
    return fetchJSON(WORKER_URL + "/stats")
      .then(function (s) { return { s: s, live: true }; })
      .catch(function () {
        return fetchJSON("data/visitor-map.json").then(function (s) { return { s: s, live: false }; });
      });
  }

  function pingVisit() {
    var done = false;
    try { done = sessionStorage.getItem("visitor-map-pinged") === "1"; } catch (e) { /* private mode */ }
    if (done || navigator.webdriver) return Promise.resolve(null);
    try { sessionStorage.setItem("visitor-map-pinged", "1"); } catch (e) { /* ignore */ }

    var ref = "direct";
    try {
      if (document.referrer) {
        ref = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, "");
        if (ref === location.hostname.toLowerCase()) ref = "direct";
      }
    } catch (e) { /* ignore */ }

    var payload = JSON.stringify({ referrer: ref }); // text/plain body => simple request, no CORS preflight
    return fetch(WORKER_URL + "/visit", { method: "POST", mode: "cors", keepalive: true, body: payload })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () {
        try { navigator.sendBeacon(WORKER_URL + "/visit", payload); } catch (e2) { /* ignore */ }
        return null;
      });
  }

  function setCounter(stats, live) {
    if (!counterEl) return;
    var nCities = (stats.cities || []).length;
    var nCountries = Object.keys(stats.counts || {}).length;
    counterEl.textContent = (stats.total || 0).toLocaleString() + " page views \u00b7 " +
      nCities + " cities \u00b7 " + nCountries + " countries" + (live ? "" : " (cached)");
  }

  function init() {
    canvas = document.getElementById("visitor-map-globe");
    wrap = document.getElementById("visitor-map-box");
    tipEl = document.getElementById("visitor-map-tip");
    counterEl = document.getElementById("visitor-map-counter");
    hintEl = document.getElementById("visitor-map-hint");
    if (!canvas || !wrap || !canvas.getContext) { if (counterEl) counterEl.textContent = ""; return; }
    ctx = canvas.getContext("2d");
    resize();
    bindEvents();

    pingVisit().then(function () {
      Promise.all([
        fetchJSON(WORLD_URL).then(decodeWorld).catch(function () { return []; }),
        loadStats()
      ]).then(function (res) {
        rings = res[0] || [];
        buildDots(res[1].s);
        setCounter(res[1].s, res[1].live);
        rafOn = true;
        requestAnimationFrame(frame);
      }).catch(function () {
        if (counterEl) counterEl.textContent = "";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
