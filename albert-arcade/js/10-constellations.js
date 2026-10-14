/* ---------- constellations ---------- */
(()=>{
  const seen=new Set();
  document.querySelectorAll(".con").forEach(c=>{
    const path=c.querySelector(".con-lines path");const len=Math.ceil(path.getTotalLength());path.style.setProperty("--len",len);path.style.strokeDasharray=`${len} ${len}`;
    const on=()=>{c.classList.add("on");path.style.strokeDasharray=`${len} ${len}`;path.style.animation="none";void path.offsetWidth;path.style.animation="";
      setTimeout(()=>{if(c.classList.contains("on"))path.style.strokeDasharray="6 4"},1000);
      if(!seen.has(c.dataset.name)){seen.add(c.dataset.name);if(typeof toast==="function")toast(seen.size===2?"¡Has encontrado las dos constelaciones!":"Constelación descubierta: "+c.dataset.name)}};
    const off=()=>{c.classList.remove("on");path.style.strokeDasharray=`${len} ${len}`};
    const hit=c.querySelector(".con-hit");
    hit.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse")on()});
    hit.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse")off()});
    hit.addEventListener("pointerup",e=>{if(e.pointerType!=="mouse")c.classList.contains("on")?off():on()});
  });
})();
