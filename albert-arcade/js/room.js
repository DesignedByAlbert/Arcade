/* ================= SECRET ROOM: a retro gamer bedroom with three playable machines ================= */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const room = $("#room"), rv = $("#roomView"), rc = $("#roomCv"), rg = rc.getContext("2d");
  const play = $("#play"), devEl = $("#dev");
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONT = '"Press Start 2P", ui-monospace, monospace';
  const IMG = (src) => { const i = new Image(); i.src = src; return i; };
  const ALB = IMG("assets/pixel-albert.webp");
  const POSTERS = [IMG("assets/cart-duelo.webp"), IMG("assets/cart-oxy.webp"), IMG("assets/cart-santi.webp")];
  const store = { get(k) { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const R = (a, b) => a + Math.random() * (b - a);

  /* the character sprite, resized with crisp edges and an optional palette (the Game Boy's four greens) */
  const spriteCache = {};
  function sprite(h, pal) {
    const key = h + (pal ? pal.join() : "");
    if (spriteCache[key]) return spriteCache[key];
    if (!ALB.complete || !ALB.naturalWidth) return null;
    const w = Math.max(1, Math.round(ALB.naturalWidth * h / ALB.naturalHeight));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"); g.imageSmoothingEnabled = true; g.drawImage(ALB, 0, 0, w, h);
    try {
      const d = g.getImageData(0, 0, w, h), p = d.data;
      const rgb = pal && pal.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)));
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3] < 110) { p[i + 3] = 0; continue; }
        p[i + 3] = 255;
        if (rgb) {
          const l = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255;
          const c2 = rgb[Math.min(3, Math.floor(l * 4.2))];
          p[i] = c2[0]; p[i + 1] = c2[1]; p[i + 2] = c2[2];
        }
      }
      g.putImageData(d, 0, 0);
    } catch (e) { /* image can't be read back: keep it as drawn */ }
    return (spriteCache[key] = c);
  }
  function txt(g, s, x, y, col, size = 8, align = "left") {
    g.font = `${size}px ${FONT}`; g.textAlign = align; g.textBaseline = "top";
    g.fillStyle = "#000"; g.fillText(s, x + 1, y + 1);
    g.fillStyle = col; g.fillText(s, x, y);
  }
  function bitmap(g, rows, x, y, col, s = 1) {
    g.fillStyle = col;
    for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) if (rows[r][c] === "#") g.fillRect(x + c * s, y + r * s, s, s);
  }

  /* ---------------- input: keyboard + on-screen pads ---------------- */
  const K = { left: false, right: false, up: false, down: false, a: false }, PREV = { ...K };
  const tap = (k) => K[k] && !PREV[k];
  function keyName(e) {
    switch (e.key) {
      case "ArrowLeft": case "a": case "A": return "left";
      case "ArrowRight": case "d": case "D": return "right";
      case "ArrowUp": case "w": case "W": return "up";
      case "ArrowDown": case "s": case "S": return "down";
      case " ": case "z": case "Z": case "x": case "X": case "Enter": return "a";
    }
    return null;
  }
  addEventListener("keydown", (e) => {
    if (room.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); play.hidden ? closeRoom() : closeGame(); return; }
    if (play.hidden) return;
    const k = keyName(e); if (!k) return;
    e.preventDefault(); K[k] = true;
  });
  addEventListener("keyup", (e) => { const k = keyName(e); if (k) K[k] = false; });
  addEventListener("blur", () => Object.keys(K).forEach((k) => K[k] = false));
  function wirePad() {
    devEl.querySelectorAll(".pbtn").forEach((b) => {
      const k = b.dataset.k;
      const on = (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); K[k] = true; b.classList.add("down"); };
      const off = () => { K[k] = false; b.classList.remove("down"); };
      b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("lostpointercapture", off);
      b.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  }

  /* ================= GAME 1 · GAME BOY · ALBERT RUN ================= */
  const GBP = ["#0f380f", "#306230", "#8bac0f", "#9bbc0f"];
  const runner = {
    name: "ALBERT RUN", w: 160, h: 144, hiKey: "albert-room-run",
    keys: "ESPACIO / ↑ saltar · ↓ agacharse",
    reset() {
      this.s = { mode: "ready", t: 0, speed: 72, dist: 0, y: 0, vy: 0, duck: false, obs: [], gap: 90,
        clouds: [[30, 22], [110, 36], [170, 18]], pebbles: Array.from({ length: 14 }, () => [R(0, 160), R(126, 140)]), hi: store.get(this.hiKey) };
    },
    update(dt) {
      const s = this.s; s.t += dt;
      if (s.mode !== "run") { if (tap("a") || tap("up")) { if (s.mode === "over") this.reset(); this.s.mode = "run"; } return; }
      s.speed = Math.min(175, s.speed + dt * 2.6); s.dist += s.speed * dt;
      const ground = s.y <= 0;
      s.duck = K.down && ground;
      if (ground && (K.a || K.up)) s.vy = 232;
      s.vy -= (K.down && !ground ? 1900 : 700) * dt; s.y += s.vy * dt;
      if (s.y <= 0) { s.y = 0; s.vy = 0; }
      const dx = s.speed * dt;
      s.clouds.forEach((c) => { c[0] -= dx * .2; if (c[0] < -30) { c[0] = 170 + R(0, 40); c[1] = R(14, 50); } });
      s.pebbles.forEach((p) => { p[0] -= dx; if (p[0] < -2) { p[0] = 162; p[1] = R(126, 140); } });
      s.obs.forEach((o) => { o.x -= dx * (o.bird ? 1.12 : 1); });
      s.obs = s.obs.filter((o) => o.x > -24);
      const lastX = s.obs.length ? s.obs[s.obs.length - 1].x : -999;
      if (160 - lastX > s.gap) {
        const score = s.dist / 5, r = Math.random();
        if (score > 160 && r < .3) s.obs.push({ x: 164, bird: true, w: 14, h: 8, y: [4, 24, 24][(Math.random() * 3) | 0] });
        else s.obs.push([{ x: 164, w: 8, h: 13, y: 0, k: 0 }, { x: 164, w: 10, h: 19, y: 0, k: 1 }, { x: 164, w: 18, h: 13, y: 0, k: 2 }][r < .45 ? 0 : r < .75 ? 1 : 2]);
        s.gap = R(78, 140) + s.speed * .35;
      }
      const pw = s.duck ? 14 : 9, ph = s.duck ? 20 : 31;
      const P = { x: 22, y: 122 - s.y - ph, w: pw, h: ph };
      for (const o of s.obs) {
        const O = { x: o.x + 2, y: 122 - o.y - o.h + 2, w: o.w - 4, h: o.h - 3 };
        if (P.x < O.x + O.w && P.x + P.w > O.x && P.y < O.y + O.h && P.y + P.h > O.y) {
          s.mode = "over"; const sc = Math.floor(s.dist / 5);
          if (sc > s.hi) { s.hi = sc; store.set(this.hiKey, sc); }
        }
      }
    },
    draw(g) {
      const s = this.s, P = GBP;
      g.fillStyle = P[3]; g.fillRect(0, 0, 160, 144);
      s.clouds.forEach(([x, y]) => { g.fillStyle = P[2]; g.fillRect(x, y, 22, 4); g.fillRect(x + 5, y - 3, 11, 3); });
      g.fillStyle = P[0]; g.fillRect(0, 122, 160, 1);
      g.fillStyle = P[1]; s.pebbles.forEach(([x, y]) => g.fillRect(Math.round(x), Math.round(y), 2, 1));
      s.obs.forEach((o) => {
        const x = Math.round(o.x), base = 122 - o.y;
        if (o.bird) {
          const up = Math.floor(s.t * 6) % 2;
          g.fillStyle = P[0]; g.fillRect(x + 2, base - 5, 10, 3); g.fillRect(x, base - 4, 3, 1); g.fillRect(x + 11, base - 6, 3, 2);
          g.fillRect(x + 5, up ? base - 9 : base - 2, 4, 4);
        } else {
          g.fillStyle = P[0];
          const bug = (bx, h) => { g.fillRect(bx + 2, base - h, 4, h); g.fillRect(bx, base - h + 4, 2, 4); g.fillRect(bx + 6, base - h + 2, 2, 4); g.fillStyle = P[1]; g.fillRect(bx + 3, base - h + 1, 1, h - 2); g.fillStyle = P[0]; };
          if (o.k === 2) { bug(x, 13); bug(x + 9, 11); } else bug(x, o.h);
        }
      });
      const spr = sprite(31, GBP), py = 122 - Math.round(s.y);
      if (spr) {
        const bob = s.mode === "run" && s.y === 0 && !s.duck ? Math.floor(s.t * 10) % 2 : 0;
        if (s.duck) g.drawImage(spr, 20, py - 20, 15, 20); else g.drawImage(spr, 22, py - 31 - bob, spr.width, 31);
      } else { g.fillStyle = P[0]; g.fillRect(22, py - 31, 9, 31); }
      const sc = String(Math.floor(s.dist / 5)).padStart(5, "0");
      g.font = `8px ${FONT}`; g.textBaseline = "top"; g.textAlign = "right"; g.fillStyle = P[1]; g.fillText("HI " + String(s.hi).padStart(5, "0"), 112, 6); g.fillStyle = P[0]; g.fillText(sc, 156, 6);
      if (s.mode !== "run") {
        g.fillStyle = P[3]; g.fillRect(14, 46, 132, 44); g.fillStyle = P[0]; g.fillRect(14, 46, 132, 2); g.fillRect(14, 88, 132, 2);
        g.textAlign = "center"; g.fillStyle = P[0]; g.font = `8px ${FONT}`;
        g.fillText(s.mode === "over" ? "GAME OVER" : "ALBERT RUN", 80, 56);
        if (Math.floor(s.t * 2) % 2 === 0) { g.fillStyle = P[1]; g.fillText(s.mode === "over" ? "A: OTRA VEZ" : "PULSA A", 80, 72); }
      }
    },
    frame() {
      return `<div class="bezel"><small>DOT MATRIX WITH STEREO SOUND</small><div class="dev-screen"><canvas id="gameCv"></canvas></div></div>
        <div class="brand">Albert Boy</div>
        <div class="pad"><div class="dpad"><button class="pbtn" data-k="up" aria-label="Arriba">▲</button><button class="pbtn" data-k="left" aria-label="Izquierda">◀</button><button class="pbtn" data-k="right" aria-label="Derecha">▶</button><button class="pbtn" data-k="down" aria-label="Agacharse">▼</button></div>
        <div class="ab"><button class="pbtn" data-k="down" aria-label="B, agacharse">B</button><button class="pbtn" data-k="a" aria-label="A, saltar">A</button></div></div>`;
    }
  };

  /* ================= GAME 2 · PC · SPACE INVADERS ================= */
  const SQ = [["...##...", "..####..", ".######.", "##.##.##", "########", "..#..#..", ".#.##.#.", "#.#..#.#"], ["...##...", "..####..", ".######.", "##.##.##", "########", ".#.##.#.", "#......#", ".#....#."]];
  const CR = [["..#.....#..", "...#...#...", "..#######..", ".##.###.##.", "###########", "#.#######.#", "#.#.....#.#", "...##.##..."], ["..#.....#..", "#..#...#..#", "#.#######.#", "###.###.###", "###########", ".#########.", "..#.....#..", ".#.......#."]];
  const OC = [["....####....", ".##########.", "############", "###..##..###", "############", "...##..##...", "..##.##.##..", "##........##"], ["....####....", ".##########.", "############", "###..##..###", "############", "..###..###..", ".##..##..##.", "..##....##.."]];
  const SHIP = ["......#......", ".....###.....", ".....###.....", ".###########.", "#############", "#############", "#############", "#############"];
  const UFO = [".....######.....", "...##########...", "..############..", ".##.##.##.##.##.", "################", "..###..##..###..", "...#........#..."];
  const BUNK = ["....##############....", "...################...", "..##################..", ".####################.", "######################", "######################", "######################", "######################", "######################", "#######........#######", "######..........######", "#####............#####"];
  const IG = "#4cff7a", ID = "#1f7a3a";
  const invaders = {
    name: "SPACE INVADERS", w: 224, h: 208, hiKey: "albert-room-inv",
    keys: "← → mover · ESPACIO disparar",
    reset() {
      this.s = { mode: "ready", t: 0, score: 0, lives: 3, wave: 1, hi: store.get(this.hiKey) };
      this.newWave();
    },
    newWave() {
      const s = this.s, top = Math.min(56, 36 + (s.wave - 1) * 6);
      s.al = [];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) s.al.push({ r, c, x: 26 + c * 22, y: top + r * 16, alive: true, kind: r === 0 ? 0 : r < 3 ? 1 : 2 });
      s.dir = 1; s.stepT = 0; s.frame = 0; s.px = 104; s.pb = null; s.eb = []; s.ebT = 1; s.dead = 0; s.ufo = null; s.ufoT = R(12, 20); s.boom = [];
      s.bunk = [0, 1, 2, 3].map((i) => ({ x: 22 + i * 50, y: 160, px: BUNK.map((row) => [...row].map((ch) => ch === "#")) }));
    },
    hitBunker(b, x, y, r) {
      for (const k of this.s.bunk) {
        const lx = Math.floor(x - k.x), ly = Math.floor(y - k.y);
        if (lx < 0 || ly < 0 || ly >= k.px.length || lx >= k.px[0].length) continue;
        if (!k.px[ly][lx]) continue;
        for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (k.px[ly + yy] && k.px[ly + yy][lx + xx] !== undefined && Math.random() < .8) k.px[ly + yy][lx + xx] = false;
        return true;
      }
      return false;
    },
    update(dt) {
      const s = this.s; s.t += dt;
      if (s.mode !== "play") { if (tap("a") || tap("up")) { if (s.mode === "over") this.reset(); this.s.mode = "play"; } return; }
      s.boom = s.boom.filter((b) => (b.t -= dt) > 0);
      if (s.dead > 0) { s.dead -= dt; if (s.dead <= 0) { if (s.lives <= 0) { s.mode = "over"; if (s.score > s.hi) { s.hi = s.score; store.set(this.hiKey, s.score); } } else { s.px = 104; s.eb = []; } } return; }
      if (K.left) s.px -= 95 * dt; if (K.right) s.px += 95 * dt; s.px = Math.max(8, Math.min(203, s.px));
      if ((tap("a") || tap("up")) && !s.pb) s.pb = { x: s.px + 6, y: 186 };
      if (s.pb) { s.pb.y -= 260 * dt; if (s.pb.y < 14) s.pb = null; else if (this.hitBunker(s.pb, s.pb.x, s.pb.y, 1)) s.pb = null; }
      const alive = s.al.filter((a) => a.alive);
      if (!alive.length) { s.wave++; this.newWave(); return; }
      s.stepT -= dt;
      if (s.stepT <= 0) {
        s.stepT = .03 + .55 * alive.length / 40; s.frame ^= 1;
        const minX = Math.min(...alive.map((a) => a.x)), maxX = Math.max(...alive.map((a) => a.x + 12));
        if ((s.dir > 0 && maxX + 4 > 220) || (s.dir < 0 && minX - 4 < 4)) { s.dir *= -1; alive.forEach((a) => a.y += 6); }
        else alive.forEach((a) => a.x += 4 * s.dir);
        alive.forEach((a) => { if (a.y + 8 >= 160) s.bunk.forEach((k) => { for (let yy = 0; yy < k.px.length; yy++) if (k.y + yy < a.y + 8) for (let xx = 0; xx < k.px[0].length; xx++) if (k.x + xx >= a.x && k.x + xx <= a.x + 12) k.px[yy][xx] = false; }); });
        if (alive.some((a) => a.y + 8 >= 186)) { s.lives = 0; s.dead = 1; s.boom.push({ x: s.px, y: 186, t: 1 }); return; }
      }
      if (s.pb) for (const a of alive) {
        const w = a.kind === 0 ? 8 : a.kind === 1 ? 11 : 12, ox = (12 - w) / 2;
        if (s.pb.x >= a.x + ox && s.pb.x <= a.x + ox + w && s.pb.y >= a.y && s.pb.y <= a.y + 8) {
          a.alive = false; s.pb = null; s.score += [30, 20, 10][a.kind]; s.boom.push({ x: a.x, y: a.y, t: .25 }); break;
        }
      }
      s.ebT -= dt;
      if (s.ebT <= 0 && s.eb.length < 3) {
        s.ebT = R(.45, 1.1) / Math.min(2, 1 + s.wave * .15);
        const cols = {}; alive.forEach((a) => { if (!cols[a.c] || cols[a.c].y < a.y) cols[a.c] = a; });
        const shooters = Object.values(cols), a = shooters[(Math.random() * shooters.length) | 0];
        if (a) s.eb.push({ x: a.x + 6, y: a.y + 9 });
      }
      s.eb.forEach((b) => b.y += 95 * dt);
      s.eb = s.eb.filter((b) => {
        if (b.y > 200) return false;
        if (this.hitBunker(b, b.x, b.y + 3, 1)) return false;
        if (b.x >= s.px && b.x <= s.px + 13 && b.y + 4 >= 186 && b.y <= 194) { s.lives--; s.dead = 1.2; s.boom.push({ x: s.px, y: 186, t: 1.1 }); return false; }
        if (s.pb && Math.abs(s.pb.x - b.x) < 3 && Math.abs(s.pb.y - b.y) < 5) { s.pb = null; return false; }
        return true;
      });
      s.ufoT -= dt;
      if (!s.ufo && s.ufoT <= 0) { const l = Math.random() < .5; s.ufo = { x: l ? -16 : 224, v: l ? 46 : -46 }; s.ufoT = R(15, 26); }
      if (s.ufo) {
        s.ufo.x += s.ufo.v * dt; if (s.ufo.x < -20 || s.ufo.x > 230) s.ufo = null;
        else if (s.pb && s.pb.y < 30 && s.pb.y > 20 && s.pb.x > s.ufo.x && s.pb.x < s.ufo.x + 16) { const pts = [50, 100, 150, 300][(Math.random() * 4) | 0]; s.score += pts; s.boom.push({ x: s.ufo.x, y: 22, t: .8, pts }); s.ufo = null; s.pb = null; }
      }
    },
    draw(g) {
      const s = this.s;
      g.fillStyle = "#020a03"; g.fillRect(0, 0, 224, 208);
      g.font = `8px ${FONT}`; g.textBaseline = "top";
      g.textAlign = "left"; g.fillStyle = IG; g.fillText("PUNTOS " + String(s.score).padStart(4, "0"), 6, 4);
      g.textAlign = "right"; g.fillText("HI " + String(s.hi).padStart(4, "0"), 218, 4);
      s.bunk.forEach((k) => { g.fillStyle = IG; k.px.forEach((row, y) => row.forEach((on, x) => { if (on) g.fillRect(k.x + x, k.y + y, 1, 1); })); });
      s.al.forEach((a) => { if (!a.alive) return; const bm = [SQ, CR, OC][a.kind][s.frame]; bitmap(g, bm, a.x + (12 - bm[0].length) / 2, a.y, a.kind === 0 ? "#b6ffcb" : IG); });
      if (s.ufo) bitmap(g, UFO, Math.round(s.ufo.x), 22, "#ff4d6d");
      if (!(s.dead > 0 && Math.floor(s.t * 10) % 2)) bitmap(g, SHIP, Math.round(s.px), 186, IG);
      if (s.pb) { g.fillStyle = "#fff"; g.fillRect(Math.round(s.pb.x), Math.round(s.pb.y), 1, 4); }
      g.fillStyle = "#e9ffe9"; s.eb.forEach((b) => { const zig = Math.floor(b.y / 3) % 2; g.fillRect(Math.round(b.x) + zig, Math.round(b.y), 1, 2); g.fillRect(Math.round(b.x) + 1 - zig, Math.round(b.y) + 2, 1, 2); });
      s.boom.forEach((b) => { g.fillStyle = "#fff"; for (let i = 0; i < 9; i++) g.fillRect(b.x + 6 + Math.cos(i * .7) * (6 - b.t * 4), b.y + 4 + Math.sin(i * .7) * (5 - b.t * 3), 1, 1); if (b.pts) { g.textAlign = "center"; g.fillStyle = "#ff4d6d"; g.fillText(String(b.pts), b.x + 8, b.y); } });
      g.fillStyle = ID; g.fillRect(0, 198, 224, 1);
      for (let i = 0; i < Math.max(0, s.lives - 1); i++) bitmap(g, SHIP, 30 + i * 16, 200, IG, .75);
      g.textAlign = "left"; g.fillStyle = IG; g.fillText(String(Math.max(0, s.lives)), 8, 200);
      if (s.mode !== "play") {
        g.fillStyle = "rgba(2,10,3,.85)"; g.fillRect(20, 70, 184, 66);
        g.textAlign = "center"; g.fillStyle = IG; g.fillText(s.mode === "over" ? "GAME OVER" : "SPACE INVADERS", 112, 82);
        g.fillStyle = "#b6ffcb"; g.fillText("= 30  = 20  = 10", 120, 100);
        bitmap(g, SQ[0], 42, 99, "#b6ffcb"); bitmap(g, CR[0], 84, 99, IG); bitmap(g, OC[0], 128, 99, IG);
        if (Math.floor(s.t * 2) % 2 === 0) { g.fillStyle = IG; g.fillText(s.mode === "over" ? "ESPACIO: OTRA VEZ" : "PULSA ESPACIO", 112, 118); }
      }
    },
    frame() {
      return `<div class="monitor"><div class="dev-screen"><canvas id="gameCv"></canvas></div><div class="badge"><span>ALBERT-PC 486</span><i></i></div></div>
        <div class="pad"><button class="pbtn key" data-k="left" aria-label="Izquierda">◀</button><button class="pbtn key wide" data-k="a" aria-label="Disparar">FUEGO</button><button class="pbtn key" data-k="right" aria-label="Derecha">▶</button></div>`;
    }
  };

  /* ================= GAME 3 · CONSOLE · PLATFORMER ================= */
  const T = 16, LW = 128, LH = 9;
  function buildLevel() {
    const m = Array.from({ length: LH }, () => Array(LW).fill("."));
    const set = (x, y, c) => { if (x >= 0 && x < LW && y >= 0 && y < LH) m[y][x] = c; };
    const row = (x0, x1, y, c) => { for (let x = x0; x <= x1; x++) set(x, y, c); };
    const pits = [[24, 26], [52, 54], [78, 80], [98, 99]];
    for (let x = 0; x < LW; x++) if (!pits.some(([a, b]) => x >= a && x <= b)) { set(x, 7, "G"); set(x, 8, "D"); }
    row(8, 12, 4, "B"); set(9, 4, "?"); set(11, 4, "?");
    set(18, 4, "?");
    set(31, 6, "P"); set(31, 5, "P");
    set(36, 6, "P"); set(36, 5, "P"); set(36, 4, "P");
    row(40, 44, 3, "B"); row(40, 44, 2, "o");
    for (let i = 0; i < 4; i++) for (let h = 0; h <= i; h++) set(47 + i, 6 - h, "S");
    for (let i = 0; i < 4; i++) for (let h = 0; h < 4 - i; h++) set(55 + i, 6 - h, "S");
    row(62, 66, 4, "B"); set(64, 4, "?"); row(62, 66, 3, "o");
    row(70, 73, 5, "B"); row(70, 73, 4, "o");
    [[84, 5], [85, 4], [86, 3], [87, 3], [88, 4], [89, 5]].forEach(([x, y]) => set(x, y, "o"));
    set(93, 4, "?"); set(94, 4, "B"); set(95, 4, "?");
    for (let i = 0; i < 6; i++) for (let h = 0; h <= i; h++) set(104 + i, 6 - h, "S");
    row(110, 111, 1, "S"); for (let y = 1; y <= 6; y++) { set(110, y, "S"); set(111, y, "S"); }
    row(113, 117, 6, "."); set(119, 6, "F");
    return m;
  }
  const SOLID = "GDB?SPU";
  const plat = {
    name: "ALBERT BROS.", w: 256, h: 144, hiKey: "albert-room-plat",
    keys: "← → mover · ESPACIO / ↑ saltar",
    reset() {
      this.s = { mode: "ready", t: 0, lives: 3, coins: 0, score: 0, hi: store.get(this.hiKey), check: 2 };
      this.load();
    },
    load(keepCoins) {
      const s = this.s; s.map = buildLevel(); s.coinsLeft = [];
      s.map.forEach((r, y) => r.forEach((c, x) => { if (c === "o") { s.coinsLeft.push({ x: x * T + 4, y: y * T + 3, got: false }); r[x] = "."; } }));
      s.en = [14, 22, 33, 44, 61, 68, 72, 86, 90, 101, 115].map((tx) => ({ x: tx * T, y: 6 * T + 4, vx: -22, vy: 0, w: 12, h: 12, alive: true, sq: 0 }));
      s.pops = []; s.bumps = [];
      this.spawn();
    },
    spawn() { const s = this.s; s.p = { x: s.check * T, y: 5 * T, vx: 0, vy: 0, w: 9, h: 26, face: 1, ground: false }; s.cam = Math.max(0, s.p.x - 110); s.hurt = 0; s.win = 0; },
    tile(x, y) { const s = this.s, tx = Math.floor(x / T), ty = Math.floor(y / T); if (ty < 0 || tx < 0 || tx >= LW) return tx < 0 ? "G" : "."; if (ty >= LH) return "."; return s.map[ty][tx]; },
    solid(x, y) { return SOLID.includes(this.tile(x, y)); },
    moveBody(b, dt, onHead) {
      b.x += b.vx * dt;
      if (b.vx > 0 && (this.solid(b.x + b.w, b.y + 1) || this.solid(b.x + b.w, b.y + b.h - 1) || this.solid(b.x + b.w, b.y + b.h / 2))) { b.x = Math.floor((b.x + b.w) / T) * T - b.w - .01; b.vx = b.turn ? -b.vx : 0; }
      if (b.vx < 0 && (this.solid(b.x, b.y + 1) || this.solid(b.x, b.y + b.h - 1) || this.solid(b.x, b.y + b.h / 2))) { b.x = Math.floor(b.x / T + 1) * T + .01; b.vx = b.turn ? -b.vx : 0; }
      b.vy = Math.min(420, b.vy + 1000 * dt); b.y += b.vy * dt; b.ground = false;
      if (b.vy > 0 && (this.solid(b.x + 1, b.y + b.h) || this.solid(b.x + b.w - 1, b.y + b.h))) { b.y = Math.floor((b.y + b.h) / T) * T - b.h; b.vy = 0; b.ground = true; }
      if (b.vy < 0 && (this.solid(b.x + 1, b.y) || this.solid(b.x + b.w - 1, b.y))) {
        const hx = this.solid(b.x + b.w / 2, b.y) ? b.x + b.w / 2 : this.solid(b.x + 1, b.y) ? b.x + 1 : b.x + b.w - 1;
        b.y = Math.floor(b.y / T + 1) * T; b.vy = 0; if (onHead) onHead(Math.floor(hx / T), Math.floor((b.y - 1) / T));
      }
    },
    hurt() { const s = this.s; s.lives--; s.hurt = 1.2; s.p.vy = -260; s.p.vx = 0; },
    update(dt) {
      const s = this.s; s.t += dt;
      s.pops = s.pops.filter((p) => (p.t -= dt) > 0); s.bumps = s.bumps.filter((b) => (b.t -= dt) > 0);
      if (s.mode !== "play") { if (tap("a") || tap("up")) { if (s.mode === "over" || s.mode === "win") this.reset(); this.s.mode = "play"; } return; }
      const p = s.p;
      if (s.hurt > 0) { s.hurt -= dt; p.vy += 900 * dt; p.y += p.vy * dt; if (s.hurt <= 0) { if (s.lives <= 0) this.end("over"); else this.spawn(); } return; }
      if (s.win > 0) { s.win -= dt; p.vx = 40; this.moveBody(p, dt); if (s.win <= 0) this.end("win"); return; }
      const acc = p.ground ? 620 : 420;
      if (K.left) { p.vx = Math.max(-104, p.vx - acc * dt); p.face = -1; }
      else if (K.right) { p.vx = Math.min(104, p.vx + acc * dt); p.face = 1; }
      else { const f = (p.ground ? 760 : 200) * dt; p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f; }
      if ((tap("a") || tap("up")) && p.ground) p.vy = -342;
      if (!(K.a || K.up) && p.vy < -130) p.vy = -130;
      this.moveBody(p, dt, (tx, ty) => {
        const c = s.map[ty] && s.map[ty][tx];
        if (c === "?") { s.map[ty][tx] = "U"; s.coins++; s.score += 100; s.pops.push({ x: tx * T + 4, y: ty * T - 14, t: .5 }); }
        if (c === "B" || c === "?" || c === "U") { s.bumps.push({ tx, ty, t: .15 }); s.en.forEach((e) => { if (e.alive && Math.abs(e.x - tx * T) < 14 && Math.abs(e.y + e.h - ty * T) < 4) { e.alive = false; e.sq = .4; s.score += 100; } }); }
      });
      if (p.x < s.cam) p.x = s.cam;
      if (p.x / T > 60 && s.check < 60) s.check = 60;
      s.cam += (Math.max(0, Math.min(LW * T - 256, p.x - 110)) - s.cam) * Math.min(1, dt * 8);
      s.coinsLeft.forEach((c) => { if (!c.got && p.x < c.x + 8 && p.x + p.w > c.x && p.y < c.y + 10 && p.y + p.h > c.y) { c.got = true; s.coins++; s.score += 50; } });
      s.en.forEach((e) => {
        if (!e.alive) { e.sq -= dt; return; }
        if (e.x - s.cam > 300) return;
        e.turn = true; this.moveBody(e, dt);
        if (e.ground) { const ahead = e.vx > 0 ? e.x + e.w + 1 : e.x - 1; if (!this.solid(ahead, e.y + e.h + 2)) e.vx = -e.vx; }
        if (e.y > 160) e.alive = false;
        if (p.x < e.x + e.w && p.x + p.w > e.x && p.y < e.y + e.h && p.y + p.h > e.y) {
          if (p.vy > 30 && p.y + p.h - e.y < 9) { e.alive = false; e.sq = .5; p.vy = -230; s.score += 200; }
          else this.hurt();
        }
      });
      if (p.y > 170) this.hurt();
      if (p.x / T >= 119 && !s.win) { s.win = 1.6; s.score += 1000; }
    },
    end(mode) { const s = this.s; s.mode = mode; if (s.score > s.hi) { s.hi = s.score; store.set(this.hiKey, s.score); } },
    draw(g) {
      const s = this.s, cam = Math.round(s.cam);
      const sky = g.createLinearGradient(0, 0, 0, 144); sky.addColorStop(0, "#0b0b36"); sky.addColorStop(1, "#3a2c66"); g.fillStyle = sky; g.fillRect(0, 0, 256, 144);
      for (let i = 0; i < 40; i++) { const x = ((i * 53 - cam * .1) % 280 + 280) % 280 - 10, y = (i * 37) % 70; g.fillStyle = (i + Math.floor(s.t * 2)) % 7 ? "#8b78e6" : "#fff7b2"; g.fillRect(x, y, 1, 1); }
      g.fillStyle = "#fff3a0"; g.beginPath(); g.arc(210 - cam * .05, 26, 10, 0, 7); g.fill(); g.fillStyle = "#0b0b36"; g.beginPath(); g.arc(205 - cam * .05, 23, 9, 0, 7); g.fill();
      g.fillStyle = "#2a2050"; for (let i = -1; i < 8; i++) { const x = i * 60 - (cam * .3) % 60; g.beginPath(); g.moveTo(x, 112); g.lineTo(x + 30, 70 + (i % 3) * 8); g.lineTo(x + 60, 112); g.fill(); }
      g.fillStyle = "#221a40"; for (let i = -1; i < 12; i++) { const x = i * 28 - (cam * .55) % 28, h = 18 + ((i * 7 + Math.floor(cam * .55 / 28)) % 5) * 7; g.fillRect(x, 112 - h, 22, h); }
      const x0 = Math.floor(cam / T), x1 = x0 + 17;
      for (let ty = 0; ty < LH; ty++) for (let tx = x0; tx <= x1 && tx < LW; tx++) {
        const c = s.map[ty][tx]; if (c === ".") continue;
        const bump = s.bumps.find((b) => b.tx === tx && b.ty === ty), dy = bump ? -Math.sin(bump.t / .15 * Math.PI) * 4 : 0;
        const x = tx * T - cam, y = ty * T + dy;
        if (c === "G") { g.fillStyle = "#4a3c7b"; g.fillRect(x, y, T, T); g.fillStyle = "#9a8be0"; g.fillRect(x, y, T, 3); g.fillStyle = "#3b2f6b"; g.fillRect(x + 3, y + 7, 2, 2); g.fillRect(x + 10, y + 11, 2, 2); }
        else if (c === "D") { g.fillStyle = "#3b2f6b"; g.fillRect(x, y, T, T); g.fillStyle = "#2c2149"; g.fillRect(x + 6, y + 4, 2, 2); }
        else if (c === "B") { g.fillStyle = "#f2711c"; g.fillRect(x, y, T, T); g.fillStyle = "#a8450a"; g.fillRect(x, y + 7, T, 1); g.fillRect(x, y + 15, T, 1); g.fillRect(x + 7, y, 1, 7); g.fillRect(x + 3, y + 8, 1, 7); g.fillRect(x + 11, y + 8, 1, 7); g.fillStyle = "#ffa463"; g.fillRect(x, y, T, 1); }
        else if (c === "?") { g.fillStyle = Math.floor(s.t * 3) % 3 ? "#ffe500" : "#ffd23f"; g.fillRect(x, y, T, T); g.fillStyle = "#000"; g.fillRect(x, y + 15, T, 1); g.fillRect(x + 15, y, 1, T); g.fillStyle = "#a8450a"; bitmap(g, [".###.", "#...#", "...#.", "..#..", ".....", "..#.."], x + 5, y + 4, "#a8450a"); }
        else if (c === "U") { g.fillStyle = "#6d5a3a"; g.fillRect(x, y, T, T); g.fillStyle = "#4a3c2a"; g.fillRect(x + 2, y + 2, 2, 2); g.fillRect(x + 12, y + 2, 2, 2); g.fillRect(x + 2, y + 12, 2, 2); g.fillRect(x + 12, y + 12, 2, 2); }
        else if (c === "S") { g.fillStyle = "#6a5acd"; g.fillRect(x, y, T, T); g.fillStyle = "#9a8be0"; g.fillRect(x, y, T, 2); g.fillRect(x, y, 2, T); g.fillStyle = "#3b2f6b"; g.fillRect(x, y + 14, T, 2); g.fillRect(x + 14, y, 2, T); }
        else if (c === "P") { g.fillStyle = "#19a3ec"; g.fillRect(x + 1, y, 14, T); g.fillStyle = "#7fd3ff"; g.fillRect(x + 3, y, 3, T); g.fillStyle = "#0b6fa6"; g.fillRect(x + 12, y, 3, T); if (this.tile(tx * T, (ty - 1) * T) !== "P") { g.fillStyle = "#19a3ec"; g.fillRect(x - 1, y, 18, 5); g.fillStyle = "#000"; g.fillRect(x - 1, y + 5, 18, 1); } }
        else if (c === "F") {
          g.fillStyle = "#e9e6ff"; g.fillRect(x + 7, y - 5 * T + 4, 2, 5 * T + 12); g.fillStyle = "#ffe500"; g.fillRect(x + 5, y - 5 * T, 6, 5);
          const fy = s.win > 0 ? y - 5 * T + 6 + (1.6 - s.win) / 1.6 * 60 : y - 5 * T + 6;
          g.fillStyle = "#d958ee"; g.beginPath(); g.moveTo(x + 7, fy); g.lineTo(x - 9, fy + 6); g.lineTo(x + 7, fy + 12); g.fill();
          g.fillStyle = "#2c2149"; g.fillRect(x + 32, y - 2 * T + 4, 44, 2 * T + 12); g.fillRect(x + 28, y - 3 * T, 52, 6);
          for (let i = 0; i < 5; i++) g.fillRect(x + 28 + i * 11, y - 3 * T - 6, 7, 6);
          g.fillStyle = "#ffe500"; g.fillRect(x + 48, y - T + 2, 12, 14);
        }
      }
      s.coinsLeft.forEach((c) => { if (c.got) return; const x = c.x - cam; if (x < -10 || x > 260) return; const w = Math.max(1, Math.round(Math.abs(Math.cos(s.t * 4 + c.x)) * 8)); g.fillStyle = "#000"; g.fillRect(x + 4 - w / 2 - 1, c.y - 1, w + 2, 12); g.fillStyle = "#ffe500"; g.fillRect(x + 4 - w / 2, c.y, w, 10); g.fillStyle = "#fff7b2"; g.fillRect(x + 4 - w / 2, c.y + 1, Math.max(1, w / 3), 3); });
      s.pops.forEach((p) => { const k = p.t / .5; g.fillStyle = "#ffe500"; g.fillRect(p.x - cam + 2, p.y - (1 - k) * 18, 6, 10); });
      s.en.forEach((e) => {
        const x = Math.round(e.x - cam); if (x < -20 || x > 270) return;
        if (!e.alive) { if (e.sq > 0) { g.fillStyle = "#9a2fb8"; g.fillRect(x, e.y + e.h - 4, e.w, 4); } return; }
        const f = Math.floor(s.t * 6) % 2, y = Math.round(e.y);
        g.fillStyle = "#d958ee"; g.fillRect(x + 1, y, e.w - 2, e.h - 3); g.fillRect(x, y + 3, e.w, e.h - 6);
        g.fillStyle = "#9a2fb8"; g.fillRect(x + (f ? 0 : 2), y + e.h - 3, 4, 3); g.fillRect(x + (f ? 8 : 6), y + e.h - 3, 4, 3);
        g.fillStyle = "#fff"; const ex = e.vx < 0 ? 1 : 4; g.fillRect(x + ex, y + 3, 3, 3); g.fillRect(x + ex + 4, y + 3, 3, 3);
        g.fillStyle = "#000"; g.fillRect(x + ex + (e.vx < 0 ? 0 : 1), y + 4, 2, 2); g.fillRect(x + ex + 4 + (e.vx < 0 ? 0 : 1), y + 4, 2, 2);
      });
      const p = s.p, spr = sprite(26);
      if (!(s.hurt > 0 && Math.floor(s.t * 12) % 2)) {
        const x = Math.round(p.x - cam), bob = p.ground && Math.abs(p.vx) > 10 ? Math.floor(s.t * 12) % 2 : 0, y = Math.round(p.y) - bob;
        if (spr) { g.save(); if (p.face < 0) { g.translate(x + p.w, y); g.scale(-1, 1); g.drawImage(spr, 0, 0, p.w, 26); } else g.drawImage(spr, x, y, p.w, 26); g.restore(); }
        else { g.fillStyle = "#fff"; g.fillRect(x, y, p.w, p.h); }
      }
      g.fillStyle = "rgba(11,7,22,.55)"; g.fillRect(0, 0, 256, 15);
      g.font = `8px ${FONT}`; g.textBaseline = "top"; g.textAlign = "left";
      g.fillStyle = "#ffe500"; g.fillText("◉" + String(s.coins).padStart(2, "0"), 6, 4);
      g.fillStyle = "#fff"; g.fillText("VIDAS " + Math.max(0, s.lives), 56, 4);
      g.textAlign = "right"; g.fillText(String(s.score).padStart(6, "0"), 250, 4);
      if (s.mode !== "play") {
        g.fillStyle = "rgba(11,7,22,.82)"; g.fillRect(36, 40, 184, 64); g.fillStyle = "#ffe500"; g.fillRect(36, 40, 184, 2); g.fillRect(36, 102, 184, 2);
        g.textAlign = "center"; txt(g, s.mode === "win" ? "¡NIVEL COMPLETADO!" : s.mode === "over" ? "GAME OVER" : "ALBERT BROS.", 128, 52, "#ffe500", 8, "center");
        txt(g, s.mode === "ready" ? "Llega a la bandera" : "PUNTOS " + s.score + "  HI " + s.hi, 128, 68, "#d8ccfb", 8, "center");
        if (Math.floor(s.t * 2) % 2 === 0) txt(g, s.mode === "ready" ? "PULSA SALTAR" : "SALTAR: OTRA VEZ", 128, 84, "#fff", 8, "center");
      }
    },
    frame() {
      return `<div class="tvset"><div class="dev-screen"><canvas id="gameCv"></canvas></div><div class="tvfoot"><span>ALBERT·VISION</span><span>CH 3<i></i><i></i></span></div></div>
        <div class="pad"><div class="arrows"><button class="pbtn" data-k="left" aria-label="Izquierda">◀</button><button class="pbtn" data-k="right" aria-label="Derecha">▶</button></div><button class="pbtn jump" data-k="a" aria-label="Saltar">SALTA</button></div>`;
    }
  };

  /* ---------------- game host ---------------- */
  const GAMES = { gb: runner, pc: invaders, tv: plat };
  let cur = null, gcv = null, gctx = null, graf = 0, glast = 0;
  function openGame(dev) {
    cur = GAMES[dev]; if (!cur) return;
    devEl.dataset.dev = dev; devEl.innerHTML = cur.frame();
    $("#playName").textContent = cur.name; $("#devKeys").textContent = "Teclado: " + cur.keys + " · ESC volver";
    gcv = $("#gameCv"); gcv.width = cur.w; gcv.height = cur.h; gctx = gcv.getContext("2d"); gctx.imageSmoothingEnabled = false;
    gcv.addEventListener("pointerdown", (e) => { e.preventDefault(); K.a = true; setTimeout(() => K.a = false, 120); });
    wirePad(); cur.reset(); play.hidden = false;
    Object.keys(K).forEach((k) => K[k] = PREV[k] = false);
    glast = performance.now(); cancelAnimationFrame(graf); graf = requestAnimationFrame(gloop);
    $("#playBack").focus();
  }
  function gloop(now) {
    const dt = Math.min(.05, (now - glast) / 1000); glast = now;
    cur.update(dt); cur.draw(gctx); Object.assign(PREV, K);
    graf = requestAnimationFrame(gloop);
  }
  function closeGame() { cancelAnimationFrame(graf); play.hidden = true; devEl.innerHTML = ""; cur = null; startRoom(); rv.querySelector(".hot")?.focus(); }
  $("#playBack").onclick = closeGame;

  /* ---------------- the room ---------------- */
  let rraf = 0, hover = null;
  const lights = ["#d958ee", "#ffe500", "#19a3ec", "#f2711c", "#4cff7a"];
  function drawRoom(t) {
    const g = rg; g.imageSmoothingEnabled = false;
    // wall + stripes + baseboard
    g.fillStyle = "#2c2149"; g.fillRect(0, 0, 320, 122);
    g.fillStyle = "#30244f"; for (let x = 0; x < 320; x += 16) g.fillRect(x, 0, 8, 122);
    g.fillStyle = "#1c1533"; g.fillRect(0, 116, 320, 6);
    // floor planks
    g.fillStyle = "#5a3b2a"; g.fillRect(0, 122, 320, 58);
    g.fillStyle = "#4a2f22"; for (let y = 130; y < 180; y += 9) g.fillRect(0, y, 320, 1);
    for (let y = 122, k = 0; y < 180; y += 9, k++) for (let x = (k % 2) * 30; x < 320; x += 60) g.fillRect(x, y, 1, 8);
    // rug
    for (let y = -12; y <= 12; y++) { const w = Math.round(78 * Math.sqrt(1 - (y / 13) ** 2)); g.fillStyle = Math.abs(y) > 9 || Math.abs(y) < 1 ? "#d958ee" : "#6a1bf0"; g.fillRect(160 - w, 160 + y, w * 2, 1); }
    // window with night city
    g.fillStyle = "#1c1533"; g.fillRect(126, 14, 68, 54);
    g.fillStyle = "#0b0b36"; g.fillRect(130, 18, 60, 46);
    for (let i = 0; i < 18; i++) { if ((i + Math.floor(t * 2)) % 6) { g.fillStyle = "#fff7b2"; g.fillRect(132 + (i * 23) % 56, 20 + (i * 13) % 22, 1, 1); } }
    g.fillStyle = "#fff3a0"; g.beginPath(); g.arc(178, 28, 6, 0, 7); g.fill(); g.fillStyle = "#0b0b36"; g.beginPath(); g.arc(175, 26, 5, 0, 7); g.fill();
    g.fillStyle = "#16124a"; [[130, 48, 10, 16], [141, 42, 8, 22], [150, 50, 12, 14], [163, 38, 9, 26], [173, 46, 8, 18], [182, 52, 8, 12]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
    g.fillStyle = "#ffe500"; [[143, 46], [166, 42], [166, 50], [152, 54], [175, 50]].forEach(([x, y], i) => { if ((i + Math.floor(t)) % 4) g.fillRect(x, y, 1, 1); });
    g.fillStyle = "#1c1533"; g.fillRect(159, 18, 2, 46); g.fillRect(130, 40, 60, 2);
    g.fillStyle = "#d958ee"; g.fillRect(120, 12, 10, 60); g.fillRect(190, 12, 10, 60); g.fillStyle = "#9a2fb8"; for (let y = 14; y < 72; y += 6) { g.fillRect(122, y, 1, 4); g.fillRect(196, y, 1, 4); }
    g.fillStyle = "#8a5a3b"; g.fillRect(118, 10, 84, 3);
    // string lights
    for (let i = 0; i < 27; i++) { const x = 4 + i * 12, y = 6 + Math.round(Math.sin(i / 26 * Math.PI) * 4); g.fillStyle = "#1c1533"; g.fillRect(x, y - 1, 12, 1); const on = (i + Math.floor(t * 3)) % 3 !== 0; g.fillStyle = on ? lights[i % 5] : "#3b3a77"; g.fillRect(x + 5, y, 3, 3); if (on) { g.globalAlpha = .25; g.fillRect(x + 3, y - 2, 7, 7); g.globalAlpha = 1; } }
    // posters (the three games, as cartridge art)
    [[58, 16], [92, 20], [282, 22]].forEach(([x, y], i) => { g.fillStyle = "#000"; g.fillRect(x - 2, y - 2, 30, 30); const im = POSTERS[i]; if (im.complete && im.naturalWidth) g.drawImage(im, x, y, 26, 26); g.fillStyle = "#e9e6ff"; g.fillRect(x + 11, y - 3, 4, 2); });
    // shelf with cartridges and a trophy
    g.fillStyle = "#8a5a3b"; g.fillRect(212, 56, 56, 3); g.fillStyle = "#5a3b2a"; g.fillRect(214, 59, 3, 5); g.fillRect(263, 59, 3, 5);
    ["#19a3ec", "#e0219e", "#f2c318", "#3fae4a", "#6a1bf0"].forEach((c, i) => { g.fillStyle = c; g.fillRect(216 + i * 7, 44, 6, 12); g.fillStyle = "#000"; g.fillRect(216 + i * 7, 44, 6, 1); });
    g.fillStyle = "#ffd23f"; g.fillRect(254, 46, 8, 5); g.fillRect(256, 51, 4, 3); g.fillRect(255, 54, 6, 2);
    // door (the way out) with an EXIT sign
    g.fillStyle = "#1c1533"; g.fillRect(5, 36, 46, 86); g.fillStyle = "#3b2f6b"; g.fillRect(5, 36, 46, 2);
    g.fillStyle = "#6d4a35"; g.fillRect(9, 39, 38, 83); g.fillStyle = "#5a3b2a"; g.fillRect(13, 43, 30, 26); g.fillRect(13, 74, 30, 42);
    g.fillStyle = "#7d5840"; g.fillRect(14, 44, 28, 1); g.fillRect(14, 75, 28, 1); g.fillStyle = "#4a2f22"; g.fillRect(9, 39, 1, 83);
    g.fillStyle = "#ffd23f"; g.fillRect(41, 84, 3, 3); g.fillStyle = "#b8860b"; g.fillRect(41, 87, 3, 1);
    g.fillStyle = `rgba(255,229,0,${.35 + Math.sin(t * 2) * .12})`; g.fillRect(9, 121, 38, 1);
    g.fillStyle = "#0b3d1a"; g.fillRect(15, 27, 26, 8); g.fillStyle = Math.floor(t * 1.3) % 6 ? "#4cff7a" : "#1f7a3a";
    bitmap(g, ["###.#.#.###.###", "#...#.#..#...#.", "##...#...#...#.", "#...#.#..#...#.", "###.#.#.###..#."], 21, 28.5, g.fillStyle);
    // desk + PC
    g.save(); g.translate(44, 0);
    g.fillStyle = "#8a5a3b"; g.fillRect(10, 104, 108, 5); g.fillStyle = "#a8714a"; g.fillRect(10, 104, 108, 1);
    g.fillStyle = "#5a3b2a"; g.fillRect(14, 109, 4, 44); g.fillRect(110, 109, 4, 44); g.fillRect(14, 109, 30, 14);
    g.fillStyle = "#c9c0a8"; g.fillRect(90, 116, 16, 34); g.fillStyle = "#9d9580"; g.fillRect(92, 120, 12, 2); g.fillStyle = Math.floor(t * 2) % 2 ? "#4cff7a" : "#1f7a3a"; g.fillRect(96, 144, 2, 2);
    g.fillStyle = "#d8d0b8"; g.fillRect(28, 62, 58, 42); g.fillStyle = "#b8ae94"; g.fillRect(28, 100, 58, 4); g.fillRect(82, 62, 4, 42);
    g.fillStyle = "#020a03"; g.fillRect(33, 66, 48, 32);
    // tiny invaders on the PC screen
    const step = Math.floor(t * 2) % 8, ox = step < 4 ? step : 8 - step;
    g.fillStyle = "#4cff7a"; for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const x = 37 + ox + c * 7, y = 69 + r * 5 + (Math.floor(t * 2) % 2); g.fillRect(x, y, 4, 2); g.fillRect(x + (Math.floor(t * 2) % 2 ? 0 : 1), y + 2, 1, 1); g.fillRect(x + 3 - (Math.floor(t * 2) % 2 ? 0 : 1), y + 2, 1, 1); }
    g.fillRect(55 + Math.round(Math.sin(t * 1.5) * 16), 94, 5, 2);
    g.fillStyle = "rgba(76,255,122,.08)"; g.fillRect(33, 66, 48, 32);
    g.fillStyle = "#b8ae94"; g.fillRect(50, 104, 14, 1); g.fillStyle = "#cfc7ad"; g.fillRect(32, 102, 46, 3); g.fillStyle = "#9d9580"; for (let x = 34; x < 76; x += 4) g.fillRect(x, 103, 2, 1);
    g.fillStyle = "#e9e6ff"; g.fillRect(84, 102, 5, 3);
    // mug + plant
    g.fillStyle = "#e5252a"; g.fillRect(100, 98, 6, 6); g.fillRect(106, 100, 2, 2);
    g.fillStyle = "#8a5a3b"; g.fillRect(12, 97, 9, 7); g.fillStyle = "#3fae4a"; [[13, 89], [16, 86], [11, 92], [18, 91]].forEach(([x, y]) => g.fillRect(x, y, 3, 8));
    g.restore();
    // TV cabinet + console + TV
    g.fillStyle = "#3b2f6b"; g.fillRect(206, 122, 98, 36); g.fillStyle = "#2a2050"; g.fillRect(212, 128, 86, 24); g.fillStyle = "#4b3d80"; g.fillRect(206, 122, 98, 2);
    g.fillStyle = "#c9c9cc"; g.fillRect(232, 136, 40, 12); g.fillStyle = "#9d9da3"; g.fillRect(232, 146, 40, 2); g.fillStyle = "#e5252a"; g.fillRect(236, 140, 2, 2); g.fillStyle = "#2b2d35"; g.fillRect(246, 138, 18, 3);
    g.fillStyle = "#2b2d35"; g.beginPath(); g.moveTo(266, 148); g.quadraticCurveTo(268, 166, 252, 164); g.lineWidth = 1; g.strokeStyle = "#2b2d35"; g.stroke();
    g.fillStyle = "#c9c9cc"; g.fillRect(238, 162, 18, 7); g.fillStyle = "#2b2d35"; g.fillRect(241, 164, 4, 1); g.fillRect(242, 163, 1, 3); g.fillStyle = "#e5252a"; g.fillRect(250, 164, 2, 2);
    g.fillStyle = "#1b1430"; g.fillRect(214, 70, 82, 52); g.fillStyle = "#3b3a77"; g.fillRect(214, 70, 82, 2); g.fillStyle = "#000"; g.fillRect(244, 64, 1, 6); g.fillRect(230, 58, 14, 1); g.fillRect(244, 58, 14, 1);
    // tiny platformer on the TV
    const sg = g.createLinearGradient(0, 76, 0, 114); sg.addColorStop(0, "#0b0b36"); sg.addColorStop(1, "#3a2c66"); g.fillStyle = sg; g.fillRect(220, 76, 70, 40);
    const scroll = Math.floor(t * 14) % 16;
    g.fillStyle = "#9a8be0"; g.fillRect(220, 108, 70, 2); g.fillStyle = "#4a3c7b"; g.fillRect(220, 110, 70, 6);
    g.fillStyle = "#f2711c"; for (let i = 0; i < 6; i++) { const x = 220 + i * 16 - scroll + 8; if (x > 218 && x < 286 && i % 2) g.fillRect(x, 92, 8, 5); }
    g.fillStyle = "#ffe500"; if (Math.floor(t * 4) % 2) g.fillRect(262 - scroll % 8, 86, 2, 3);
    const jy = Math.round(Math.abs(Math.sin(t * 3)) * 9); g.fillStyle = "#e9e6ff"; g.fillRect(236, 100 - jy, 3, 8); g.fillStyle = "#6a1bf0"; g.fillRect(236, 104 - jy, 3, 2);
    g.fillStyle = "#d958ee"; g.fillRect(270 - (Math.floor(t * 10) % 30), 104, 5, 4);
    g.fillStyle = "rgba(255,255,255,.06)"; g.fillRect(220, 76, 70, 40);
    // beanbag + Game Boy
    g.fillStyle = "#9a2fb8"; g.beginPath(); g.ellipse(176, 160, 26, 14, 0, 0, 7); g.fill(); g.fillStyle = "#d958ee"; g.beginPath(); g.ellipse(174, 156, 22, 12, 0, 0, 7); g.fill(); g.fillStyle = "#ffb3f5"; g.fillRect(162, 148, 8, 2);
    const glow = .35 + Math.sin(t * 4) * .2; g.fillStyle = `rgba(255,229,0,${glow})`; g.fillRect(162, 140, 16, 24);
    g.fillStyle = "#c9c9cc"; g.fillRect(164, 142, 12, 19); g.fillStyle = "#5d5f6b"; g.fillRect(165, 143, 10, 8); g.fillStyle = "#8bac0f"; g.fillRect(166, 144, 8, 6); g.fillStyle = "#0f380f"; g.fillRect(168, 146, 2, 3);
    g.fillStyle = "#2b2d35"; g.fillRect(166, 154, 3, 1); g.fillRect(167, 153, 1, 3); g.fillStyle = "#a3195b"; g.fillRect(172, 153, 2, 2); g.fillRect(170, 155, 2, 2);
    // lamp + glow
    g.fillStyle = "#1c1533"; g.fillRect(308, 70, 2, 88); g.fillRect(302, 156, 14, 2); g.fillStyle = "#ffd23f"; g.fillRect(300, 58, 18, 12);
    const lg = g.createRadialGradient(309, 70, 2, 309, 70, 70); lg.addColorStop(0, "rgba(255,210,63,.32)"); lg.addColorStop(1, "rgba(255,210,63,0)"); g.fillStyle = lg; g.fillRect(230, 0, 90, 150);
    // hover outline (pixel corners)
    const H = { pc: [68, 60, 66, 50], tv: [210, 68, 90, 78], gb: [155, 137, 30, 32], door: [3, 25, 50, 98] }[hover];
    if (H) { const [x, y, w, h] = H, a = Math.floor(t * 4) % 2 ? "#ffe500" : "#fff7b2"; g.fillStyle = a; [[x, y], [x + w - 6, y], [x, y + h - 2], [x + w - 6, y + h - 2]].forEach(([px, py]) => g.fillRect(px, py, 6, 2)); [[x, y], [x + w - 2, y], [x, y + h - 6], [x + w - 2, y + h - 6]].forEach(([px, py]) => g.fillRect(px, py, 2, 6)); }
  }
  /* the room carries on past the edges of the scene: same wall, floor and lights, plus a bookcase and a bed on wide screens */
  const bgc = document.createElement("canvas"); bgc.className = "room-bg"; bgc.setAttribute("aria-hidden", "true");
  rv.parentElement.insertBefore(bgc, rv);
  const bg = bgc.getContext("2d"); let BG = null;
  function drawBg(t) {
    if (!BG) return;
    const g = bg, { ox, oy, cw, ch } = BG; g.imageSmoothingEnabled = false;
    g.save(); g.translate(ox, oy);
    const L = -ox, Rr = cw - ox, Tp = -oy, Bt = ch - oy;
    g.fillStyle = "#2c2149"; g.fillRect(L, Tp, Rr - L, 122 - Tp);
    g.fillStyle = "#30244f"; for (let x = Math.floor(L / 16) * 16; x < Rr; x += 16) g.fillRect(x, Tp, 8, 122 - Tp);
    g.fillStyle = "#241a40"; g.fillRect(L, Tp, Rr - L, Math.max(0, -Tp)); g.fillStyle = "#1c1533"; if (Tp < 0) g.fillRect(L, -3, Rr - L, 3);
    g.fillStyle = "#1c1533"; g.fillRect(L, 116, Rr - L, 6);
    g.fillStyle = "#5a3b2a"; g.fillRect(L, 122, Rr - L, Bt - 122);
    g.fillStyle = "#4a2f22"; for (let y = 130; y < Bt; y += 9) g.fillRect(L, y, Rr - L, 1);
    for (let y = 122, k = 0; y < Bt; y += 9, k++) for (let x = Math.floor(L / 60) * 60 + (k % 2) * 30; x < Rr; x += 60) g.fillRect(x, y, 1, 8);
    for (let i = Math.floor(L / 12) - 1; i < Math.ceil(Rr / 12) + 1; i++) {
      if (i >= 0 && i < 27) continue;
      const x = 4 + i * 12, y = 6 + Math.round(Math.sin(i / 26 * Math.PI) * 4 * (i < 0 ? -.3 : -.3)) ;
      g.fillStyle = "#1c1533"; g.fillRect(x, 5, 12, 1);
      const on = ((i % 3) + 3 + Math.floor(t * 3)) % 3 !== 0; g.fillStyle = on ? lights[((i % 5) + 5) % 5] : "#3b3a77"; g.fillRect(x + 5, 6, 3, 3);
      if (on) { g.globalAlpha = .25; g.fillRect(x + 3, 4, 7, 7); g.globalAlpha = 1; }
    }
    if (L < -40) { // bookcase on the left
      const x = -78; g.fillStyle = "#5a3b2a"; g.fillRect(x, 30, 46, 92); g.fillStyle = "#3b2618"; g.fillRect(x + 3, 33, 40, 86);
      const cols = ["#19a3ec", "#e0219e", "#f2c318", "#3fae4a", "#6a1bf0", "#f2711c", "#e9e6ff"];
      [36, 58, 80, 102].forEach((sy, r) => { g.fillStyle = "#5a3b2a"; g.fillRect(x + 3, sy + 17, 40, 3); for (let k = 0; k < 8; k++) { const h = 12 + ((k * 7 + r * 3) % 5); g.fillStyle = cols[(k + r * 2) % cols.length]; g.fillRect(x + 5 + k * 4.6, sy + 17 - h, 4, h); } });
      g.fillStyle = "#ffd23f"; g.fillRect(x + 30, 72, 6, 6);
    }
    if (Rr > 360) { // bed on the right
      const x = 330; g.fillStyle = "#5a3b2a"; g.fillRect(x, 96, 6, 60); g.fillStyle = "#3b2f6b"; g.fillRect(x + 6, 120, 90, 26); g.fillStyle = "#6a1bf0"; g.fillRect(x + 6, 112, 90, 14); g.fillStyle = "#e9e6ff"; g.fillRect(x + 10, 106, 22, 8);
      g.fillStyle = "#d958ee"; for (let k = 0; k < 90; k += 10) g.fillRect(x + 6 + k, 118, 5, 2);
      g.fillStyle = "#000"; g.fillRect(x + 30, 30, 34, 44); g.fillStyle = "#16124a"; g.fillRect(x + 32, 32, 30, 40); g.fillStyle = "#ffe500"; bitmap(g, ["#.#.###", "#.#.#.#", "###.#.#", "#.#.###"], x + 40, 46, "#ffe500", 2);
    }
    // the lamp's light spills past the scene, with the same gradient the room uses
    const lg = g.createRadialGradient(309, 70, 2, 309, 70, 70); lg.addColorStop(0, "rgba(255,210,63,.32)"); lg.addColorStop(1, "rgba(255,210,63,0)"); g.fillStyle = lg; g.fillRect(320, 0, 70, 150);
    g.restore();
  }
  function rloop(now) { drawBg(now / 1000); drawRoom(now / 1000); rraf = requestAnimationFrame(rloop); }
  function startRoom() { cancelAnimationFrame(rraf); if (REDUCE) { drawBg(0); drawRoom(0); } else rraf = requestAnimationFrame(rloop); }

  rv.querySelectorAll(".hot").forEach((b) => {
    const d = b.dataset.dev;
    b.addEventListener("mouseenter", () => { hover = d; if (REDUCE) drawRoom(0); });
    b.addEventListener("mouseleave", () => { hover = null; if (REDUCE) drawRoom(0); });
    b.addEventListener("focus", () => { hover = d; }); b.addEventListener("blur", () => { hover = null; });
    b.addEventListener("click", () => {
      if (d === "door") { closeRoom(); return; }
      cancelAnimationFrame(rraf); openGame(d);
    });
  });

  /* ---------------- open / close ---------------- */
  let lastFocus = null;
  function openRoom() {
    lastFocus = document.activeElement;
    room.hidden = false; fitRoom(); room.classList.remove("on"); void room.offsetWidth; room.classList.add("on");
    document.body.style.overflow = "hidden"; play.hidden = true; startRoom();
    const hint = rv.querySelector('.hot[data-dev="gb"]'); hint.classList.add("hint"); setTimeout(() => hint.classList.remove("hint"), 2200);
    rv.querySelector('.hot[data-dev="door"]').focus({ preventScroll: true });
  }
  function closeRoom() { location.href = "index.html#f05"; return; cancelAnimationFrame(rraf); cancelAnimationFrame(graf); room.hidden = true; play.hidden = true; document.body.style.overflow = ""; lastFocus?.focus?.(); }
  function fitRoom() {
    // whole screen, nothing cropped: landscape fits the scene and extends wall and floor; portrait fills the height and pans sideways
    const W = innerWidth, H = innerHeight, ar = W / H, stage = room.querySelector(".room-stage"), portrait = ar < 1;
    let w, h;
    if (portrait) { h = H; w = H * 16 / 9; } else if (ar > 16 / 9) { h = H; w = H * 16 / 9; } else { w = W; h = W * 9 / 16; }
    const left = portrait ? 0 : (W - w) / 2, top = portrait ? 0 : (H - h) / 2;
    rv.style.width = w + "px"; rv.style.height = h + "px"; rv.style.left = left + "px"; rv.style.top = top + "px";
    stage.style.overflowX = portrait ? "auto" : "hidden"; stage.style.overflowY = "hidden";
    room.classList.toggle("portrait", portrait);
    const hz = top + h * 122 / 180;
    room.style.background = `linear-gradient(180deg,#2c2149 0,#2c2149 ${hz}px,#5a3b2a ${hz}px,#5a3b2a 100%)`;
    if (portrait) stage.scrollLeft = w * .53 - W / 2;
    const sc = w / 320, cw = Math.ceil(W / sc), ch = Math.ceil(H / sc);
    bgc.hidden = portrait; bgc.width = cw; bgc.height = ch; BG = portrait ? null : { ox: left / sc, oy: top / sc, cw, ch };
    drawBg(performance.now() / 1000);
  }
  addEventListener("resize", () => { if (!room.hidden) fitRoom(); });
  const startIt = () => openRoom();
  if (document.readyState === "complete") startIt(); else addEventListener("load", startIt);
})();
