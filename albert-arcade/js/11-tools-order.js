/* ---------- drag the tool mascots to reorder them ---------- */
(()=>{
  const slot=document.getElementById("projectSlot");if(!slot)return;
  const save=(team)=>{const k=team.dataset.proj;if(typeof TOOLSBY!=="undefined"&&k)TOOLSBY[k]=[...team.children].map(m=>m.dataset.tool)};
  // FLIP: animate the others sliding into their new spots
  function flip(team,fn){const els=[...team.children],first=new Map(els.map(e=>[e,e.getBoundingClientRect()]));fn();
    els.forEach(e=>{if(e.classList.contains("dragging"))return;const a=first.get(e),b=e.getBoundingClientRect(),dx=a.left-b.left,dy=a.top-b.top;if(dx||dy)e.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:"none"}],{duration:220,easing:"cubic-bezier(.3,1.2,.5,1)"})})}
  let drag=null;
  slot.addEventListener("pointerdown",e=>{
    const m=e.target.closest(".toolbox .team .mascot");if(!m||e.button>0)return;
    e.preventDefault();m.setPointerCapture(e.pointerId);
    drag={m,team:m.parentElement,id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false};
  });
  slot.addEventListener("pointermove",e=>{
    if(!drag||e.pointerId!==drag.id)return;const {m,team}=drag;
    const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!drag.moved&&Math.hypot(dx,dy)<4)return;
    if(!drag.moved){drag.moved=true;m.classList.add("dragging")}
    // where would it go: before the first sibling whose centre is past the pointer
    const others=[...team.children].filter(x=>x!==m);
    let before=null;for(const o of others){const r=o.getBoundingClientRect();const sameRow=e.clientY<r.bottom&&e.clientY>r.top-20||Math.abs(e.clientY-(r.top+r.height/2))<r.height;if(sameRow&&e.clientX<r.left+r.width/2||e.clientY<r.top-10){before=o;break}}
    if((before&&m.nextElementSibling!==before)||(!before&&team.lastElementChild!==m)){
      const old=m.getBoundingClientRect();flip(team,()=>team.insertBefore(m,before));const now=m.getBoundingClientRect();drag.sx+=now.left-old.left;drag.sy+=now.top-old.top;
    }
    m.style.transform=`translate(${e.clientX-drag.sx}px,${e.clientY-drag.sy}px)`;
  });
  const end=e=>{if(!drag||e.pointerId!==drag.id)return;const {m,team}=drag;m.classList.remove("dragging");
    if(drag.moved){m.animate([{transform:m.style.transform},{transform:"none"}],{duration:180,easing:"ease-out"});save(team)}m.style.transform="";drag=null};
  slot.addEventListener("pointerup",end);slot.addEventListener("pointercancel",end);
  // keyboard: arrows move the focused tool
  slot.addEventListener("keydown",e=>{
    const m=e.target.closest(".toolbox .team .mascot");if(!m)return;const team=m.parentElement;
    if(e.key==="ArrowLeft"&&m.previousElementSibling){e.preventDefault();flip(team,()=>team.insertBefore(m,m.previousElementSibling));m.focus();save(team)}
    if(e.key==="ArrowRight"&&m.nextElementSibling){e.preventDefault();flip(team,()=>team.insertBefore(m.nextElementSibling,m));m.focus();save(team)}
  });
})();
