/* ---------- retro boot: the hero itself is rebuilt in pixels (same grid, sky, stars, moon, city and name, in the same place), then the real page takes over ---------- */
(()=>{
  const boot=document.getElementById("boot"),cv=document.getElementById("bootCv"),g=cv.getContext("2d");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){boot.remove();return}
  try{history.scrollRestoration="manual"}catch(e){}
  scrollTo(0,0);document.documentElement.style.overflow="hidden";
  let W=innerWidth,H=innerHeight,t0=performance.now(),raf=0,done=false,leaving=0,order=null,cleared=0,scene=null,real=0,pageLoaded=document.readyState==="complete",fontOk=false;
  addEventListener("load",()=>pageLoaded=true);
  const GRID=72,LINE="rgba(118,104,230,.28)";
  function size(){const dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);g.imageSmoothingEnabled=false}
  // read the real hero once the page and its pixel font exist
  function measure(){
    const hero=document.getElementById("hero");if(!hero)return null;
    const hr=hero.getBoundingClientRect(),S={hero:hr,name:[],stars:[],moon:null,sky:null,ground:null,skyImg:null};
    document.querySelectorAll("#hero .hero-new .name .a, #hero .hero-new .name .g").forEach(el=>{
      const cs=getComputedStyle(el),fs=parseFloat(cs.fontSize),r=el.getBoundingClientRect(),txt=el.textContent.trim();
      const sh=(cs.textShadow.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px/)||[0,3,3]).slice(1).map(Number);
      const lh=parseFloat(cs.lineHeight)||fs*1.02;
      // glyph pixel grid: the pixel font is drawn on an 8x8 grid per em
      // each character's exact box from the live text, then its 8x8 glyph pixels sampled on its own grid
      const ps=fs/8,o=document.createElement("canvas"),q=o.getContext("2d");o.width=Math.ceil(fs*1.2);o.height=Math.ceil(fs*1.2);
      const cells=[],walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node,ci=0,total=txt.length;
      while((node=walker.nextNode())){for(let k=0;k<node.textContent.length;k++){const ch=node.textContent[k];if(!ch.trim())continue;
        const rg=document.createRange();rg.setStart(node,k);rg.setEnd(node,k+1);const cr=rg.getBoundingClientRect();
        q.clearRect(0,0,o.width,o.height);q.font=`${fs}px "Press Start 2P"`;q.textBaseline="top";q.fillStyle="#fff";q.fillText(ch,0,0);
        const d=q.getImageData(0,0,o.width,o.height).data,cx=cr.left,cy=cr.top+(cr.height-fs)/2;
        for(let j=0;j<8;j++)for(let i=0;i<8;i++){const sx=Math.floor((i+.5)*ps),sy=Math.floor((j+.5)*ps);if(d[(sy*o.width+sx)*4+3]>127)cells.push({x:cx+i*ps,y:cy+j*ps,born:.2+Math.random()*.55+ci/total*.2})}
        ci++}}
      const top=0;
      S.name.push({ps,cells,col:cs.color,sh})
    });
    document.querySelectorAll("#hero #stars i").forEach(el=>{const r=el.getBoundingClientRect();if(r.width)S.stars.push({x:r.left,y:r.top,w:r.width,born:Math.random()*.6})});
    const m=hero.querySelector(".moon");if(m)S.moon=m.getBoundingClientRect();
    const sk=hero.querySelector(".skyline");if(sk){S.sky=sk.getBoundingClientRect();const img=new Image();img.src="assets/skyline.png";S.skyImg=img}
    const gr=hero.querySelector(".ground");if(gr)S.ground=gr.getBoundingClientRect();
    return S;
  }
  function ready(){if(scene)return;const S=measure();if(S&&S.name.length&&S.name[0].cells.length)scene=S}
  const fontP=document.fonts&&document.fonts.load?document.fonts.load('16px "Press Start 2P"'):Promise.resolve();
  fontP.then(()=>{fontOk=true},()=>{fontOk=true});
  const tryReady=()=>{if(fontOk&&document.getElementById("hero")&&document.querySelectorAll("#hero #stars i").length)ready();if(!scene)setTimeout(tryReady,60)};
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",tryReady):tryReady();
  function realProgress(){if(pageLoaded)return 1;const imgs=[...document.images].filter(i=>i.loading!=="lazy"),n=imgs.length;const ok=n?imgs.filter(i=>i.complete).length/n:0;return Math.min(.95,ok*.75+(fontOk?.2:0))}
  const MSG=["INSERTANDO CARTUCHO…","DIBUJANDO EL GRID…","ENCENDIENDO ESTRELLAS…","COLOCANDO PÍXELES…","¡LISTO!"];
  const step=(v,n)=>Math.floor(v*n)/n;
  function draw(t,shown){
    const hr=scene?scene.hero:{top:0,height:H};
    // sky gradient exactly like .hero
    const sg=g.createLinearGradient(0,hr.top,0,hr.top+hr.height);sg.addColorStop(0,"#05061f");sg.addColorStop(.45,"#0b0b36");sg.addColorStop(1,"#16124a");g.fillStyle=sg;g.fillRect(0,0,W,H);
    // grid, drawn outward from the centre in steps
    const gp=step(Math.min(1,t/.8),8);g.fillStyle=LINE;
    for(let x=0;x<=W;x+=GRID){const d=Math.abs(x-W/2)/(W/2);if(d<=gp)g.fillRect(x,0,1,H*Math.min(1,(gp-d)*3+.001))}
    for(let y=hr.top%GRID;y<=H;y+=GRID){const d=Math.abs(y-H/2)/(H/2);if(d<=gp){const len=W*Math.min(1,(gp-d)*3);g.fillRect(0,y,len,1)}}
    if(!scene)return;
    // stars pop in
    scene.stars.forEach(s=>{if(shown>s.born*.8){g.fillStyle="#fff7b2";g.fillRect(Math.round(s.x),Math.round(s.y),s.w,s.w)}});
    // moon fades up in steps
    if(scene.moon){const k=step(Math.min(1,Math.max(0,(shown-.2)/.4)),5);if(k>0){const m=scene.moon,cx=m.left+m.width/2,cy=m.top+m.height/2,R=m.width/2;g.globalAlpha=k;
      g.fillStyle="#6c6a57";g.beginPath();g.arc(cx,cy,R*.62,0,7);g.fill();g.fillStyle="#d9cf86";g.beginPath();g.arc(cx,cy,R*.48,0,7);g.fill();g.fillStyle="#fff3a0";g.beginPath();g.arc(cx,cy,R*.34,0,7);g.fill();g.globalAlpha=1}}
    // ground and city rise from the bottom in 6px steps
    if(scene.ground){const gr=scene.ground,k=step(Math.min(1,Math.max(0,(shown-.1)/.35)),6);g.fillStyle="#2f2550";g.fillRect(0,gr.bottom-gr.height*k,W,gr.height*k);if(k>=1){g.fillStyle="#4a3c7b";g.fillRect(0,gr.top,W,6)}}
    if(scene.sky&&scene.skyImg.complete&&scene.skyImg.naturalWidth){const sk=scene.sky,k=Math.min(1,Math.max(0,(shown-.25)/.45)),h=sk.height,iw=scene.skyImg.naturalWidth*h/scene.skyImg.naturalHeight,vis=Math.round(h*k/6)*6;
      if(vis>0){g.save();g.beginPath();g.rect(0,sk.bottom-vis,W,vis);g.clip();g.globalAlpha=.95;for(let x=0;x<W;x+=iw)g.drawImage(scene.skyImg,Math.round(x),sk.top,Math.ceil(iw),h);g.restore();g.globalAlpha=1}}
    // the name, pixel by pixel, on the font's own pixel grid
    scene.name.forEach(n=>{
      n.cells.forEach(c=>{if(shown>=c.born){g.fillStyle="#000";g.fillRect(c.x+n.sh[0],c.y+n.sh[1],n.ps,n.ps)}});
      n.cells.forEach(c=>{if(shown>=c.born){const k=Math.min(1,(shown-c.born)*10),s=n.ps*k;g.fillStyle=n.col;g.fillRect(c.x+(n.ps-s)/2,c.y+(n.ps-s)/2,s,s)}});
    });
  }
  function frame(now){
    const t=(now-t0)/1000,timeP=Math.min(1,t/2.6);real=Math.max(real,realProgress());let p=t>4.5?1:Math.min(timeP,real);if(!scene&&t<4.5)p=Math.min(p,.3);
    const shown=done?1:p;
    document.getElementById("bootFill").style.width=(Math.floor(shown*20)/20*100)+"%";
    document.getElementById("bootPct").textContent=Math.floor(shown*100)+"%";
    document.getElementById("bootMsg").textContent=MSG[shown>=1?4:Math.min(3,Math.floor(shown*4))];
    if(!leaving){g.clearRect(0,0,W,H);draw(t,shown);if(!done&&p>=1){done=true;boot.classList.add("ready");setTimeout(leave,700)}}
    else{
      // the real hero is underneath and identical: clear the picture in grid-aligned blocks
      const el=(now-leaving)/650,n=Math.floor(order.length*Math.min(1,el));
      for(;cleared<n;cleared++){const c=order[cleared];g.clearRect(c.x,c.y,c.s+1,c.s+1)}
      if(el>=1){finish();return}
    }
    raf=requestAnimationFrame(frame);
  }
  function leave(){
    if(leaving)return;leaving=performance.now();boot.classList.add("out");
    const s=24,list=[];for(let y=0;y<H;y+=s)for(let x=0;x<W;x+=s)list.push({x,y,s,k:Math.hypot(x-W/2,(y-H/2)*1.4)/Math.hypot(W/2,H*.7)+Math.random()*.3});
    order=list.sort((a,b)=>a.k-b.k);cleared=0;document.documentElement.style.overflow="";
  }
  function finish(){cancelAnimationFrame(raf);boot.remove();document.documentElement.style.overflow="";setTimeout(()=>dispatchEvent(new Event("resize")),60)}
  document.getElementById("bootSkip").onclick=()=>{done=true;leave()};
  addEventListener("keydown",function k(e){if(!boot.isConnected){removeEventListener("keydown",k);return}if(e.key==="Enter"||e.key===" "||e.key==="Escape"){e.preventDefault();done=true;leave()}});
  addEventListener("resize",()=>{if(!leaving){size();scene=null;tryReady()}});
  size();raf=requestAnimationFrame(frame);
})();
