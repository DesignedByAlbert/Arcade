const $=s=>document.querySelector(s);

/* ---------- data (from albert.fig) ---------- */
const TOOLS={Figma:["figma","#6a1bf0"],Photoshop:["Ps","#1e9bf0"],Illustrator:["Ai","#ff8a00"],Jira:["Ji","#2684ff"],Unreal:["Ur","#22c3ee"],Miro:["Mi","#e8b800"],"C#":["C#","#7b3cf5"]};
const ACH=[
 {name:"Game BCN",years:"2022–23",photo:"assets/event.webp",logo:"assets/logo-gamebcn.webp",text:"Entré en la incubadora de Game BCN y llevé OxySpace de un prototipo en papel a un vertical slice jugable.",skills:[["c","Diseño de juego"],["e","Pitching"],["t","Prototipado rápido"]]},
 {name:"F2P Campus",photo:"assets/event.webp",years:"2023–24",logo:"assets/logo-f2p.webp",text:"Aprendí diseño free-to-play, live ops y monetización, y rehicimos nuestro core loop pensando en la retención.",skills:[["c","Diseño de core loop"],["e","Live ops"],["t","Analítica"]]},
 {name:"GameTech Lithuania",photo:"assets/event.webp",years:"2024–25",logo:"assets/logo-gametech.webp",text:"Seleccionados en la GameTech Accelerator de Startup Lithuania para escalar el producto y conocer inversores.",skills:[["c","Visión de producto"],["e","Pitch a inversores"],["t","Escalabilidad"]]}
];
const PHOTOS=[
 ["foto-graduado","¡graduado!"],["foto-selfie","yo, sin Figma"],["foto-santiago","llegada a Santiago"],["foto-gamebcn","demo day · GameBCN"],
 ["foto-desierto","dunas y buggy"],["foto-graduado-2","con la banda"],["foto-palmera","un paseo"],["foto-luces","luces rojas"],
 ["foto-obradoiro","el Obradoiro"],["foto-dunas","mar de dunas"],["foto-equipo","el equipo, a tope"],["foto-duelo","DUELO! en la jam"],
 ["foto-retrato","versión seria"],["foto-lapiz","yo, a lápiz"],["foto-pixel","yo, en pixel"],["foto-avatar","mi avatar"]
];

/* ---------- helpers ---------- */
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);return"#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function mascot(label){
  const [kind,color]=TOOLS[label];const dark=shade(color,-.45),light=shade(color,.55),legs=shade(color,-.15);
  const face=kind==="figma"
    ?`<g fill="${shade(color,.75)}"><path d="M22 11h8v12h-8a6 6 0 0 1 0-12z"/><path d="M30 11h6a6 6 0 0 1 0 12h-6z"/><path d="M22 23h8v12h-8a6 6 0 0 1 0-12z"/><circle cx="36" cy="29" r="6"/><path d="M22 35h8v6a6 6 0 1 1-8-6z"/></g>`
    :`<rect x="14" y="10" width="36" height="32" rx="5" fill="${light}" stroke="${dark}" stroke-width="2"/><text x="32" y="33" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="19" fill="${dark}">${kind}</text>`;
  return `<div class="mascot"><svg viewBox="0 0 64 80" aria-hidden="true"><rect x="6" y="2" width="52" height="48" rx="12" fill="${color}" stroke="${dark}" stroke-width="3"/><rect x="9" y="5" width="46" height="6" rx="3" fill="#fff" opacity=".18"/>${face}<g fill="${legs}" stroke="${dark}" stroke-width="2"><path d="M20 50h7v10h-4v4h-9v-6h6z"/><path d="M37 50h7v8h6v6h-9v-4h-4z"/><path d="M14 64h13v6H11v-3z"/><path d="M37 64h13v3l3 3H37z"/></g></svg><span class="nm">${label}</span></div>`;
}
const TROPHY=(()=>{const g=["..YYYYYYYY..","YYYYYYYYYYYY","Y.YYYYYYYY.Y","Y.YYYWYYYY.Y",".YYYYWYYYYY.","..YYYYYYYY..","...YYYYYY...","....YYYY....",".....YY.....","....YYYY....","...BBBBBB...","...BBBBBB..."];let r="";g.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==".")r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${c==="Y"?"#ffd23f":c==="W"?"#fff7b2":"#8b5a2b"}"/>`}));return`<svg viewBox="0 0 12 12" aria-hidden="true">${r}</svg>`})();
let toastT;function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2400)}

/* ---------- arcade data (DesignedByAlbert, en español) ---------- */
const PROJECTS=[{"name": "OxySpace", "title": "OXYSPACE", "art": "assets/Oxy512x512.png", "k": "#19a3ec", "k2": "#0b6fa6", "draft": true, "pitch": {"en": "A competitive 3v3 mobile MOBA where you build your base between fights.", "es": "Un MOBA móvil competitivo 3v3 en el que construyes tu base entre combates.", "ca": "Un MOBA mòbil competitiu 3v3 on construeixes la teva base entre combats."}, "facts": [["role", {"en": "Game & UX/UI designer", "es": "Diseñador de juego y UX/UI", "ca": "Dissenyador de joc i UX/UI"}], ["platform", "Android"], ["year", "2023"], ["team", {"en": "Small indie team", "es": "Pequeño equipo indie", "ca": "Petit equip indie"}]], "shots": [["assets/shot-oxy.webp", "Lobby"], ["assets/Oxy512x512.png", {"en": "Robot key art", "es": "Arte del robot", "ca": "Art del robot"}]], "play": "https://play.google.com/store", "brief": {"problem": {"en": "Mobile MOBAs are fun but overwhelming: too many buttons, long matches and menus that hide the action. We wanted short, readable fights that still feel deep.", "es": "Los MOBA móviles son divertidos pero abruman: demasiados botones, partidas largas y menús que esconden la acción. Queríamos combates cortos y fáciles de leer que siguieran teniendo profundidad.", "ca": "Els MOBA mòbils són divertits però aclaparen: massa botons, partides llargues i menús que amaguen l'acció. Volíem combats curts i fàcils de llegir que continuessin tenint profunditat."}, "goal": {"en": "Design a lobby and battle flow a new player understands in seconds, played with one thumb, in matches under five minutes.", "es": "Diseñar un lobby y un flujo de combate que un jugador nuevo entienda en segundos, que se juegue con un pulgar y con partidas de menos de cinco minutos.", "ca": "Dissenyar un lobby i un flux de combat que un jugador nou entengui en segons, que es jugui amb un polze i amb partides de menys de cinc minuts."}}, "decisions": [{"img": "assets/shot-oxy.webp", "screen": "Lobby", "title": {"en": "The robot is the hero of the lobby", "es": "El robot es el protagonista del lobby", "ca": "El robot és el protagonista del lobby"}, "decision": {"en": "I placed the player's robot in the centre and pushed every menu to the edges of the screen.", "es": "Coloqué el robot del jugador en el centro y llevé todos los menús a los bordes de la pantalla.", "ca": "Vaig col·locar el robot del jugador al centre i vaig portar tots els menús a les vores de la pantalla."}, "why": [{"en": "Players open the game to see and upgrade their robot, so it deserves the most space.", "es": "Los jugadores abren el juego para ver y mejorar su robot, así que merece el mayor espacio.", "ca": "Els jugadors obren el joc per veure i millorar el seu robot, així que mereix el màxim espai."}, {"en": "Menus on the edges keep the centre clean and stay within thumb reach.", "es": "Los menús en los bordes dejan el centro limpio y quedan al alcance del pulgar.", "ca": "Els menús a les vores deixen el centre net i queden a l'abast del polze."}, {"en": "The BATTLE button is the biggest and brightest element, bottom right, where the thumb rests.", "es": "El botón BATTLE es el elemento más grande y brillante, abajo a la derecha, donde descansa el pulgar.", "ca": "El botó BATTLE és l'element més gran i brillant, a baix a la dreta, on descansa el polze."}]}, {"img": "assets/Oxy512x512.png", "screen": {"en": "Characters", "es": "Personajes", "ca": "Personatges"}, "title": {"en": "Chunky pixel robots with clear silhouettes", "es": "Robots pixel robustos con siluetas claras", "ca": "Robots pixel robustos amb siluetes clares"}, "decision": {"en": "Every robot class has a unique outline and one dominant colour.", "es": "Cada clase de robot tiene un contorno único y un color dominante.", "ca": "Cada classe de robot té un contorn únic i un color dominant."}, "why": [{"en": "On a small phone screen, players need to recognise an enemy in a fraction of a second.", "es": "En una pantalla de móvil pequeña, el jugador necesita reconocer a un enemigo en una fracción de segundo.", "ca": "En una pantalla de mòbil petita, el jugador necessita reconèixer un enemic en una fracció de segon."}, {"en": "Pixel art keeps the style consistent and cheap to produce for a small team.", "es": "El pixel art mantiene el estilo coherente y es barato de producir para un equipo pequeño.", "ca": "El pixel art manté l'estil coherent i és barat de produir per a un equip petit."}, {"en": "Colour coding links each robot to its role (tank, damage, support).", "es": "El código de colores conecta cada robot con su rol (tanque, daño, apoyo).", "ca": "El codi de colors connecta cada robot amb el seu rol (tanc, dany, suport)."}]}], "learned": [{"en": "Test the lobby with new players early: the first 10 seconds decide if they stay.", "es": "Prueba el lobby pronto con jugadores nuevos: los primeros 10 segundos deciden si se quedan.", "ca": "Prova el lobby aviat amb jugadors nous: els primers 10 segons decideixen si es queden."}, {"en": "One clear main action per screen beats five equal buttons.", "es": "Una acción principal clara por pantalla funciona mejor que cinco botones iguales.", "ca": "Una acció principal clara per pantalla funciona millor que cinc botons iguals."}, {"en": "Readable silhouettes matter more than detail on mobile.", "es": "En móvil, las siluetas legibles importan más que el detalle.", "ca": "Al mòbil, les siluetes llegibles importen més que el detall."}]}, {"name": "Santi A GO", "title": "SANTI A GO", "art": "assets/cart-santi.webp", "k": "#e0219e", "k2": "#9b0f6c", "draft": true, "pitch": {"en": "A motivational companion app for pilgrims walking the Camino de Santiago.", "es": "Una app motivacional que acompaña a los peregrinos que hacen el Camino de Santiago.", "ca": "Una app motivacional que acompanya els pelegrins que fan el Camí de Sant Jaume."}, "facts": [["role", {"en": "Product & UX/UI designer", "es": "Diseñador de producto y UX/UI", "ca": "Dissenyador de producte i UX/UI"}], ["platform", "iOS"], ["year", "2025"], ["team", {"en": "Small team", "es": "Equipo pequeño", "ca": "Equip petit"}]], "shots": [["assets/shot-santi.webp", {"en": "Pilgrim screen", "es": "Pantalla del peregrino", "ca": "Pantalla del pelegrí"}], ["assets/cart-santi.webp", {"en": "Pilgrim avatar", "es": "Avatar del peregrino", "ca": "Avatar del pelegrí"}]], "brief": {"problem": {"en": "Walking the Camino is long and tiring. Pilgrims lose motivation on the hard days and forget to enjoy the small wins.", "es": "Hacer el Camino es largo y cansado. Los peregrinos pierden la motivación en los días duros y se olvidan de disfrutar las pequeñas victorias.", "ca": "Fer el Camí és llarg i cansat. Els pelegrins perden la motivació els dies durs i s'obliden de gaudir de les petites victòries."}, "goal": {"en": "Turn each stage of the Camino into a game-like journey that rewards progress and keeps pilgrims moving.", "es": "Convertir cada etapa del Camino en un viaje con aire de juego que premie el progreso y mantenga a los peregrinos en marcha.", "ca": "Convertir cada etapa del Camí en un viatge amb aire de joc que premiï el progrés i mantingui els pelegrins en marxa."}}, "decisions": [{"img": "assets/shot-santi.webp", "screen": {"en": "Home", "es": "Inicio", "ca": "Inici"}, "title": {"en": "A pilgrim avatar that walks with you", "es": "Un peregrino que camina contigo", "ca": "Un pelegrí que camina amb tu"}, "decision": {"en": "The home screen shows the user's pilgrim, standing on the current stage, with one big GO button.", "es": "La pantalla de inicio muestra al peregrino del usuario sobre la etapa actual, con un gran botón GO.", "ca": "La pantalla d'inici mostra el pelegrí de l'usuari sobre l'etapa actual, amb un gran botó GO."}, "why": [{"en": "An avatar makes progress personal: it is your pilgrim getting closer to Santiago.", "es": "Un avatar hace el progreso personal: es tu peregrino el que se acerca a Santiago.", "ca": "Un avatar fa el progrés personal: és el teu pelegrí qui s'acosta a Santiago."}, {"en": "One big GO button means starting a stage takes one tap, even with tired hands.", "es": "Un gran botón GO hace que empezar una etapa sea un solo toque, incluso con las manos cansadas.", "ca": "Un gran botó GO fa que començar una etapa sigui un sol toc, fins i tot amb les mans cansades."}, {"en": "Stats and rewards sit at the top and bottom so the pilgrim stays the focus.", "es": "Las stats y recompensas van arriba y abajo para que el peregrino siga siendo el foco.", "ca": "Les stats i recompenses van a dalt i a baix perquè el pelegrí continuï sent el focus."}]}, {"img": "assets/cart-santi.webp", "screen": "Avatar", "title": {"en": "Warm, hand-crafted pixel style", "es": "Estilo pixel cálido y artesanal", "ca": "Estil pixel càlid i artesanal"}, "decision": {"en": "I used a warm forest palette and a pixel-art pilgrim instead of a realistic map UI.", "es": "Usé una paleta cálida de bosque y un peregrino en pixel art en lugar de una interfaz de mapa realista.", "ca": "Vaig fer servir una paleta càlida de bosc i un pelegrí en pixel art en lloc d'una interfície de mapa realista."}, "why": [{"en": "It feels like an adventure, not a fitness tracker.", "es": "Se siente como una aventura, no como una app de fitness.", "ca": "Es percep com una aventura, no com una app de fitness."}, {"en": "The style is friendly for all ages, which matches who walks the Camino.", "es": "El estilo es amable para todas las edades, como la gente que hace el Camino.", "ca": "L'estil és amable per a totes les edats, com la gent que fa el Camí."}, {"en": "Pixel art works well at small sizes and loads fast on mobile data.", "es": "El pixel art funciona bien en tamaños pequeños y carga rápido con datos móviles.", "ca": "El pixel art funciona bé en mides petites i carrega ràpid amb dades mòbils."}]}], "learned": [{"en": "Motivation comes from small, frequent rewards, not one big goal.", "es": "La motivación viene de recompensas pequeñas y frecuentes, no de un gran objetivo.", "ca": "La motivació ve de recompenses petites i freqüents, no d'un gran objectiu."}, {"en": "Design for real conditions: sunlight, sweat and one free hand.", "es": "Diseña para las condiciones reales: sol, sudor y una sola mano libre.", "ca": "Dissenya per a les condicions reals: sol, suor i una sola mà lliure."}, {"en": "A character people care about is the best retention feature.", "es": "Un personaje que importa es la mejor función de retención.", "ca": "Un personatge que importa és la millor funció de retenció."}]}, {"name": "DUELO!", "title": "DUELO!", "art": "assets/cart-duelo.webp", "k": "#f2c318", "k2": "#a8820a", "draft": true, "pitch": {"en": "A fast quick-draw western duel game for two players on one phone.", "es": "Un juego de duelos del oeste a toda velocidad para dos jugadores en un mismo móvil.", "ca": "Un joc de duels de l'oest a tota velocitat per a dos jugadors en un mateix mòbil."}, "facts": [["role", {"en": "Game designer", "es": "Diseñador de juego", "ca": "Dissenyador de joc"}], ["platform", {"en": "Mobile", "es": "Móvil", "ca": "Mòbil"}], ["year", "2024"], ["team", {"en": "Game jam team", "es": "Equipo de game jam", "ca": "Equip de game jam"}]], "shots": [["assets/duelo-key.webp", {"en": "Key art", "es": "Arte principal", "ca": "Art principal"}]], "brief": {"problem": {"en": "Local multiplayer on one phone is rare, and most party games need long rules explanations.", "es": "El multijugador local en un solo móvil es raro, y la mayoría de juegos de grupo necesitan explicar muchas reglas.", "ca": "El multijugador local en un sol mòbil és poc habitual, i la majoria de jocs de grup necessiten explicar moltes regles."}, "goal": {"en": "Make a duel anyone understands in three seconds: wait for the signal, then tap faster than your friend.", "es": "Hacer un duelo que cualquiera entienda en tres segundos: espera la señal y toca más rápido que tu amigo.", "ca": "Fer un duel que qualsevol entengui en tres segons: espera el senyal i toca més ràpid que el teu amic."}}, "decisions": [{"img": "assets/duelo-key.webp", "screen": {"en": "Face-off", "es": "Cara a cara", "ca": "Cara a cara"}, "title": {"en": "Two cowboys, back to back", "es": "Dos vaqueros, espalda con espalda", "ca": "Dos vaquers, esquena contra esquena"}, "decision": {"en": "The key art and the start screen show both players back to back, ready to turn and shoot.", "es": "El arte principal y la pantalla de inicio muestran a los dos jugadores espalda con espalda, listos para girarse y disparar.", "ca": "L'art principal i la pantalla d'inici mostren els dos jugadors esquena contra esquena, a punt per girar-se i disparar."}, "why": [{"en": "The pose explains the game before any text: it is a duel, it is about timing.", "es": "La pose explica el juego antes que cualquier texto: es un duelo, va de timing.", "ca": "La pose explica el joc abans que cap text: és un duel, va de timing."}, {"en": "Warm desert colours set the western mood instantly.", "es": "Los colores cálidos del desierto marcan el ambiente del oeste al instante.", "ca": "Els colors càlids del desert marquen l'ambient de l'oest a l'instant."}, {"en": "Each half of the screen belongs to one player, so it is clear where to tap.", "es": "Cada mitad de la pantalla es de un jugador, así que está claro dónde tocar.", "ca": "Cada meitat de la pantalla és d'un jugador, així que queda clar on tocar."}]}], "learned": [{"en": "If the art explains the rules, the tutorial can be one sentence.", "es": "Si el arte explica las reglas, el tutorial cabe en una frase.", "ca": "Si l'art explica les regles, el tutorial cap en una frase."}, {"en": "Tension comes from waiting, not from more mechanics.", "es": "La tensión nace de la espera, no de añadir mecánicas.", "ca": "La tensió neix de l'espera, no d'afegir mecàniques."}, {"en": "Playtest with friends who never play games.", "es": "Prueba con amigos que nunca juegan.", "ca": "Prova-ho amb amics que mai juguen."}]}];
const TOOLSBY={"OxySpace":["Figma","Photoshop","Illustrator","Unreal","Jira","Miro"],"Santi A GO":["Figma","Illustrator","Photoshop","Miro","Jira"],"DUELO!":["Figma","Photoshop","Illustrator","C#"]};
const L=v=>typeof v==="string"?v:(v.es||v.en);
const TX={"fact.role":"MI ROL","fact.platform":"PLATAFORMA","fact.year":"AÑO","fact.team":"EQUIPO","cs.label":"MAKING OF","cs.close":"CERRAR ✕","cs.problem":"El problema","cs.goal":"El objetivo","cs.screens":"Pantallas y decisiones","cs.screen":"PANTALLA","cs.decision":"LA DECISIÓN","cs.why":"POR QUÉ","cs.learned":"Qué aprendí","cs.prev":"ANTERIOR","cs.next":"SIGUIENTE","draft":"BORRADOR"};
const t=k=>TX[k]||k;

/* --- Stars --- */
function sprinkle(el,n){let h="";for(let i=0;i<n;i++){const s=Math.random()<.2?5:3;h+=`<i style="left:${(Math.random()*100).toFixed(2)}%;top:${(Math.random()*78).toFixed(2)}%;width:${s}px;height:${s}px;animation-delay:${(Math.random()*3).toFixed(2)}s"></i>`}el.innerHTML=h}
sprinkle($("#stars"),70);

/* --- Arcade console --- */
let proj=0;
// one looping video per game. Drop the file in assets/ and set its path here.
const VIDEOS={"OxySpace":"","Santi A GO":"","DUELO!":""};
function showVideo(p){
  const v=$("#vid"),src=VIDEOS[p.name],poster=p.shots[0][0];
  $("#vidPoster").src=poster;$("#vidPoster").alt=p.name;
  $("#conCap").textContent=p.name.toUpperCase()+" · GAMEPLAY";
  if(src){v.hidden=false;$("#vidPoster").hidden=true;$("#vidSoon").hidden=true;v.poster=poster;if(v.getAttribute("src")!==src){v.src=src;v.play?.().catch(()=>{})}}
  else{v.hidden=true;v.removeAttribute("src");$("#vidPoster").hidden=false;$("#vidSoon").hidden=false}
}

const carts=$("#carts");
PROJECTS.forEach((p,i)=>{const b=document.createElement("button");b.className="cart";b.style.setProperty("--k",p.k);b.style.setProperty("--k2",p.k2);b.setAttribute("aria-label",p.name);b.innerHTML=`<span class="lbl">${p.name}</span><img src="${p.art}" alt="" class="pix">`;b.onclick=()=>setProject(i);carts.appendChild(b)});
function setProject(i){
  proj=i;const p=PROJECTS[i];
  [...carts.children].forEach((c,j)=>{c.classList.toggle("on",j===i);c.setAttribute("aria-pressed",j===i)});
  showVideo(p);
  $("#projectSlot").innerHTML=`<div class="insert project"><div class="info">
      <h3>${p.title}</h3>
      <p class="pitch">${L(p.pitch)}</p>
      <dl class="facts">${p.facts.map(([k,v])=>`<div><dt>${t("fact."+k)}</dt><dd>${L(v)}</dd></div>`).join("")}</dl>
      <div class="toolbox"><span class="lab">HERRAMIENTAS</span><div class="team" data-proj="${p.name}" role="list" aria-label="Herramientas, se pueden reordenar">${(TOOLSBY[p.name]||[]).map(t=>mascot(t).replace('<div class="mascot"',`<div class="mascot" role="listitem" tabindex="0" data-tool="${t}" aria-label="${t}. Usa las flechas para moverla"`)).join("")}</div></div>
    </div></div>`;
  $("#ctaRow").innerHTML=`<button class="open-case" id="openCase">MAKING OF ▸</button>${p.play?`<a class="gplay" href="${p.play}" target="_blank" rel="noopener"><img src="assets/gplay.webp" alt="Disponible en Google Play"></a>`:""}`;
  $("#openCase").onclick=()=>openCase(i);
}
setProject(0);

/* --- Making of overlay --- */
const cs=$("#cs");let csReturn=null;
const PINS={"OxySpace":[{pins:[[50,48],[10,20],[86,82]],nt:"zona del pulgar",n:"abajo a la derecha. ahí vive BATTLE."},{pins:[[30,50],[52,34],[74,60]],nt:"0,5 segundos",n:"lo que tarda un jugador en leer al enemigo."}],
 "DUELO!":[{pins:[[50,44],[50,12],[50,76]],nt:"la pose = las reglas",n:"si el arte lo explica, el tutorial cabe en una frase."}],
 "Santi A GO":[{pins:[[50,46],[50,84],[50,12]],nt:"un solo toque",n:"incluso con las manos cansadas."},{pins:[[50,40],[28,66],[72,70]],nt:"aventura > fitness",n:"la paleta cuenta la historia antes que el texto."}]};
let csIndex=0;
function openCase(i,keepFocus){
  csIndex=i;const p=PROJECTS[i],N=PROJECTS.length,nxt=(i+1)%N;
  if(!keepFocus)csReturn=document.activeElement;
  const tools=(TOOLSBY[p.name]||[]);
  const levels=p.decisions.length+3; // intro, problem, screens..., learned
  cs.innerHTML=`<div class="cs-bar mk-bar">
      <div class="mk-left"><button class="cs-x mk-back" id="csClose" type="button">◀ ARCADE</button>
        <span class="mk-crumb">ARCADE / <b>${p.title}</b> · MAKING OF</span>
        <span class="mk-xp" aria-label="Progreso de lectura"><i id="mkXp"></i></span><span class="mk-xpn" id="mkXpN">XP 0%</span></div>
      <div class="mk-tabs" role="tablist" aria-label="Proyectos">${PROJECTS.map((q,j)=>`<button type="button" role="tab" aria-selected="${j===i}" class="mk-tab" data-j="${j}" style="--k:${q.k};--k2:${q.k2}"><img src="${q.art}" alt="" class="pix">${q.name}</button>`).join("")}</div>
    </div>
    <div class="cs-in mk">
      <header class="mk-hero">
        <p class="mk-lv">◆ MAKING OF · DECISIONES DE DISEÑO</p>
        <div class="mk-hero-row"><div class="mk-hero-txt">
          <h2 id="csTitle">${p.title}</h2>
          <p class="mk-pitch">${L(p.pitch)}</p>
          <div class="mk-chips">${p.facts.map(([k,v])=>`<span class="mk-chip"><small>${t("fact."+k)}</small>${L(v)}</span>`).join("")}</div>
        </div><img class="mk-art pix" src="${p.art}" alt=""></div>
        <div class="mk-tools"><span class="mk-lab">HERRAMIENTAS · EN ORDEN DE USO</span><div class="team">${tools.map(mascot).join("")}</div></div>
      </header>

      <section class="mk-level"><p class="mk-num">NIVEL 01 — PROBLEMA → OBJETIVO</p>
        <p class="mk-sub">Antes de dibujar nada: qué falla y para quién.</p>
        <div class="mk-brief">
          <div class="mk-card bad"><span class="mk-tag">EL PROBLEMA</span><p>${L(p.brief.problem)}</p></div>
          <span class="mk-arrow" aria-hidden="true">▶</span>
          <div class="mk-card goal"><span class="mk-tag">EL OBJETIVO</span><p>${L(p.brief.goal)}</p></div>
        </div>
      </section>

      ${p.decisions.map((d,j)=>{const pn=(PINS[p.name]||[])[j]||{pins:[],nt:"",n:""};return `<section class="mk-level"><p class="mk-num">NIVEL 0${j+2} — PANTALLA · ${L(d.screen).toUpperCase()}</p>
        <div class="mk-dec" data-dec="${j}">
          <div class="mk-shot"><div class="mk-screen"><img src="${d.img}" alt="${p.name} · ${L(d.screen)}" loading="lazy">
            ${pn.pins.map(([x,y],k)=>`<button type="button" class="mk-pin" data-k="${k}" style="left:${x}%;top:${y}%" aria-label="Punto ${k+1}">${k+1}</button>`).join("")}
            <span class="tv-cap">CAPTURA · ${L(d.screen).toUpperCase()}</span></div>
            ${pn.nt?`<div class="mk-note"><b>N.B. ${pn.nt}</b><span>${pn.n}</span></div>`:""}</div>
          <div class="mk-txt"><h3>${L(d.title)}</h3><p class="mk-decision">${L(d.decision)}</p>
            <span class="mk-lab">POR QUÉ</span>
            <ol class="mk-why">${d.why.map((w,k)=>`<li data-k="${k}"><b>${k+1}</b><span>${L(w)}</span></li>`).join("")}</ol></div>
        </div></section>`}).join("")}

      <section class="mk-level"><p class="mk-num">NIVEL 0${p.decisions.length+2} — APRENDIZAJES</p>
        <p class="mk-sub">Lo que me llevo al siguiente proyecto.</p>
        <div class="mk-learn">${p.learned.map((l,k)=>`<div class="mk-loot"><small>BOTÍN 0${k+1} · +${(k+1)*100} XP</small><p>${L(l)}</p></div>`).join("")}</div>
      </section>

      <nav class="mk-foot" aria-label="Making of">
        <button class="cs-step" id="csBack" type="button"><span class="ar">◀</span><span><small>VOLVER</small>AL ARCADE</span></button>
        <span class="cs-count">${i+1} / ${N}</span>
        <button class="cs-step nx" id="csNext" type="button"><span><small>SIGUIENTE</small>${PROJECTS[nxt].title}</span><span class="ar">▶</span></button>
      </nav>
    </div>`;
  cs.hidden=false;cs.scrollTop=0;document.body.style.overflow="hidden";
  $("#csClose").onclick=closeCase;$("#csBack").onclick=closeCase;
  $("#csNext").onclick=()=>{setProject(nxt);openCase(nxt,true)};
  cs.querySelectorAll(".mk-tab").forEach(b=>b.onclick=()=>{const j=+b.dataset.j;if(j!==i){setProject(j);openCase(j,true)}});
  // pins and reasons light up together
  cs.querySelectorAll(".mk-dec").forEach(dec=>{
    const hl=k=>{dec.querySelectorAll(".mk-pin,.mk-why li").forEach(e=>e.classList.toggle("on",k!=null&&e.dataset.k==k))};
    dec.querySelectorAll(".mk-pin,.mk-why li").forEach(e=>{e.addEventListener("mouseenter",()=>hl(e.dataset.k));e.addEventListener("mouseleave",()=>hl(null));e.addEventListener("focus",()=>hl(e.dataset.k));e.addEventListener("blur",()=>hl(null));if(e.tagName==="BUTTON")e.addEventListener("click",()=>hl(e.dataset.k))});
  });
  updXp();
  if(!keepFocus)$("#csClose").focus();
}
function updXp(){const m=cs.scrollHeight-cs.clientHeight;const v=m>0?Math.round(cs.scrollTop/m*100):100;const b=$("#mkXp");if(!b)return;b.style.width=v+"%";$("#mkXpN").textContent=v>=100?"XP 100% · ¡NIVEL COMPLETADO!":"XP "+v+"%"}
cs.addEventListener("scroll",updXp,{passive:true});
function closeCase(){cs.hidden=true;document.body.style.overflow="";csReturn?.focus?.()}
addEventListener("keydown",e=>{if(e.key==="Escape"&&!cs.hidden)closeCase()});

/* --- Comet --- */
function cometSVG(){const role="#d958ee";const px=[],put=(x,y,c,o=1)=>px.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${c}" opacity="${o}"/>`);const hx=28,hy=10;
  for(let i=0;i<27;i++){const x=hx-i,y=hy-Math.floor(i/3);const c=i<3?"#ffffff":i<7?"#fff7b2":i<12?"#ffd84a":role,o=i<12?1:Math.max(.25,1-(i-12)/16);put(x,y,c,o);if(i>1&&i<10)put(x,y+1,i<6?"#ffd84a":role,.85);if(i>3&&i<8)put(x,y-1,role,.6)}
  [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dx,dy])=>put(hx+dx,hy+dy,"#ffffff"));
  [[2,0],[0,2],[-2,0],[0,-2]].forEach(([dx,dy])=>put(hx+dx,hy+dy,"#fff7b2",.9));
  [[20,10],[15,9],[9,4],[23,6],[5,3]].forEach(([x,y])=>put(x,y,"#fff7b2",.7));
  return `<svg viewBox="0 0 31 13" aria-hidden="true">${px.join("")}</svg>`}
const heroEl=$("#hero");
function launchComet(){
  if(document.hidden)return schedule();
  const W=heroEl.clientWidth,H=heroEl.clientHeight,fromLeft=Math.random()<.5;
  const x0=fromLeft?-140:W+20,y0=10+Math.random()*H*0.12,x1=fromLeft?W+20:-140,y1=y0+Math.abs(x1-x0)/3;
  const c=document.createElement("button");c.className="comet"+(fromLeft?"":" rtl");c.setAttribute("aria-label","Atrapa el cometa");c.innerHTML=cometSVG();c.style.left=x0+"px";c.style.top=y0+"px";heroEl.appendChild(c);
  const anim=c.animate([{left:x0+"px",top:y0+"px"},{left:x1+"px",top:y1+"px"}],{duration:9000+Math.random()*3000,easing:"linear",fill:"forwards"});
  anim.onfinish=()=>{c.remove();schedule()};
  c.onclick=()=>{const r=heroEl.getBoundingClientRect(),b=c.getBoundingClientRect();const px=b.left+b.width/2-r.left,py=b.top+b.height/2-r.top;anim.cancel();c.remove();burst(px,py);
    const msg=document.createElement("div");msg.className="gotcha";msg.setAttribute("role","status");msg.innerHTML="¡Te pillé! Acabo de <b>captar tu atención</b>… quizá se me da bien esto.<br><span class=\"digit\">DÍGITO 1 DE 4: "+foundDigit(0)+"</span>";
    msg.style.left=Math.min(Math.max(px,160),W-160)+"px";msg.style.top=Math.max(py,90)+"px";heroEl.appendChild(msg);
    setTimeout(()=>{msg.animate([{opacity:1},{opacity:0}],{duration:400,fill:"forwards"}).onfinish=()=>msg.remove()},4200);schedule()};
}
function burst(x,y){for(let i=0;i<14;i++){const s=document.createElement("i");s.className="spark";s.style.left=x+"px";s.style.top=y+"px";heroEl.appendChild(s);const a=Math.random()*Math.PI*2,d=30+Math.random()*50;s.animate([{transform:"translate(0,0)",opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px)`,opacity:0}],{duration:600+Math.random()*300,easing:"ease-out",fill:"forwards"}).onfinish=()=>s.remove()}}
let cometTimer;function schedule(first){clearTimeout(cometTimer);cometTimer=setTimeout(launchComet,first?4000:12000+Math.random()*14000)}
if(!matchMedia("(prefers-reduced-motion: reduce)").matches)schedule(true);

/* ---------- achievements ---------- */
$("#achGrid").innerHTML=ACH.map(a=>`<article class="ach"><div class="node">${TROPHY}</div><div class="ach-card"><span class="unlock">LOGRO DESBLOQUEADO</span><h3>${a.name}</h3><div class="yr">${a.years}</div><div class="logo"><img src="${a.logo}" alt="Logo de ${a.name}"></div><p>${a.text}</p><div class="sk">Skills aprendidas:</div><div class="tags">${a.skills.map(([k,s])=>`<span class="tag ${k}">${s}</span>`).join("")}</div>${a.photo?`<div class="shot"><img src="${a.photo}" alt="Albert y su equipo en un evento de videojuegos" loading="lazy"></div>`:`<div class="shot nosig" role="img" aria-label="Foto de ${a.name} pendiente"><span>SIN SEÑAL</span><small>foto de ${a.name} pendiente</small></div>`}</div></article>`).join("");

/* ---------- Fuera del lienzo: hobbies, dissolve bands, random mural ---------- */
const QUESTS=[
 {t:"Hacer el Camino",f:["foto-santiago","foto-obradoiro"]},
 {t:"Perderme por el desierto",f:["foto-desierto","foto-dunas"]},
 {t:"Graduarme por fin",f:["foto-graduado","foto-graduado-2"]},
 {t:"Vivir el mundo gamer",f:["foto-gamebcn","foto-luces","foto-equipo","foto-duelo"]},
 {t:"Desconectar sin Figma",f:["foto-selfie","foto-palmera"]},
 {t:"Dibujarme de mil formas",f:["foto-retrato","foto-lapiz","foto-pixel","foto-avatar"]}
];
const QOF={};QUESTS.forEach((q,i)=>q.f.forEach(f=>QOF[f]=i));
const sorted={};   // photo file -> quest index, once it has been dropped in the right place
let selected=null;
const REDUCE=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* pixel band: the game's plum breaks into blocks and the paper shows through */
function band(cv,dir){
  const cell=14, game="#251c3f", game2="#2c2149", acc=["#d958ee","#ffe500","#19a3ec","#6a1bf0"];
  let cells=[],W=0,H=0;
  function build(){
    const r=cv.getBoundingClientRect();W=Math.ceil(r.width/cell);H=Math.ceil(r.height/cell);
    cv.width=W*cell;cv.height=H*cell;cells=[];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const d=dir>0?y/(H-1):1-y/(H-1);            // 0 = fully game, 1 = fully paper
      const keep=Math.random()>Math.pow(d,.75);
      const c=Math.random()<.06?acc[(Math.random()*4)|0]:(Math.random()<.5?game:game2);
      cells.push({x,y,c,keep,t:Math.random()*.85+d*.15});
    }
  }
  function draw(p){ // p: 0 start (solid game) → 1 final dithered band
    const g=cv.getContext("2d");g.clearRect(0,0,cv.width,cv.height);
    cells.forEach(k=>{ if(k.keep||k.t>p){ g.fillStyle=k.c; g.fillRect(k.x*cell,k.y*cell,cell,cell);} });
  }
  build();draw(1);
  let played=false;
  function play(){ if(played||REDUCE)return;played=true;const t0=performance.now(),D=1400;
    (function f(now){const p=Math.min(1,(now-t0)/D);draw(Math.floor(p*12)/12);if(p<1)requestAnimationFrame(f)})(t0); }
  addEventListener("resize",()=>{build();draw(1)});
  return {play,reset:()=>{played=false;draw(0)}};
}
const bTop=band($("#dTop"),1), bBot=band($("#dBot"),-1);

/* the photos: dropped on the table at random, each depixelates when it lands */
const muralEl=$("#mural");
let zTop=10, muralW=0, solved=false, PW=150, PH=200, QW=200, QH=150;
const strings=document.createElementNS("http://www.w3.org/2000/svg","svg");strings.setAttribute("class","strings");strings.setAttribute("aria-hidden","true");
const ov=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const R0=(a,b)=>a+Math.random()*Math.max(0,b-a);

/* ---- the finished case: index card in the middle, quests around it, each quest with its two photos pinned on */
function montage(W){
  const narrow=W<700, P={quests:[],photos:{}};
  const rot=()=>((Math.random()<.5?-1:1)*(2+Math.random()*7)).toFixed(1);
  if(!narrow){
    // case card in the centre, six post-its on a ring, each quest's photos fanned outward like evidence
    const n=QUESTS.length,H=Math.max(1300,Math.round(W*1.02)),cx=W/2,cy=H/2,rx=W*.2,ry=H*.2;
    P.H=H;P.center={x:cx-125,y:cy-70};
    QUESTS.forEach((q,i)=>{
      const a=-Math.PI/2+(i+.5)*2*Math.PI/n,qx=cx+rx*Math.cos(a),qy=cy+ry*Math.sin(a);
      P.quests[i]={x:clamp(qx-QW/2,8,W-QW-8),y:clamp(qy-QH/2,8,H-QH-8)};
      const dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx,m=q.f.length;
      q.f.forEach((f,k)=>{
        // 2 photos: a pair fanned outward. 4 photos: a 2x2 cluster, the second row further out
        const row=m>2?(k/2)|0:0, t=(k%2)*2-1;
        const out=QW*.42+PW*.55+row*PH*.9, side=t*PW*(m>2?.56:.62);
        const ox=qx+dx*out+px*side, oy=qy+dy*(QH*.5+PH*.42+row*PH*.85)+py*side*.85;
        P.photos[f]={x:clamp(ox-PW/2,6,W-PW-6),y:clamp(oy-PH/2,6,H-PH-6),r:rot()};
      });
    });
  }else{
    // phone: case card on top, then each quest with its photos in a loose two-column pile
    let y=10;P.center={x:W/2-120,y};y+=190;
    QUESTS.forEach((q,i)=>{
      const rows=Math.ceil(q.f.length/2);
      q.f.forEach((f,k)=>{const col=k%2,row=(k/2)|0;P.photos[f]={x:col?W-PW-6:6,y:y+row*(PH*.92)+(col?18:0),r:rot()}});
      y+=rows*(PH*.92)+PH*.15;
      P.quests[i]={x:clamp(W/2-QW/2+(i%2?16:-16),6,W-QW-6),y:y-QH*.55};
      y+=QH*.65+40;
    });
    P.H=y+60;
  }
  return P;
}
/* a photo dropped in the right quest gets pinned next to it, mid-game */
function pinSpot(qi,k){
  const c=muralEl.querySelector(`.qcard[data-q="${qi}"]`),W=muralEl.clientWidth,H=muralEl.clientHeight;
  let x=k?c.offsetLeft+c.offsetWidth-14:c.offsetLeft-PW+14,y=c.offsetTop-20+(k?28:0);
  if(x<4||x>W-PW-4){x=c.offsetLeft+(k?c.offsetWidth-PW*.55:-PW*.45);y=c.offsetTop+c.offsetHeight-16}   // no room at the side: hang it below
  return {x:clamp(x,4,W-PW-4),y:clamp(y,4,H-PH-4),r:((k?1:-1)*(4+Math.random()*5)).toFixed(1)};
}
function drawStrings(){
  const W=muralEl.clientWidth,H=muralEl.clientHeight;strings.setAttribute("viewBox",`0 0 ${W} ${H}`);strings.style.width=W+"px";strings.style.height=H+"px";
  const pin=el=>({x:el.offsetLeft+el.offsetWidth/2,y:el.offsetTop+10});
  const lines=[],pins=[];
  const rope=(a,b)=>{const d=Math.hypot(b.x-a.x,b.y-a.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2+Math.min(60,d*.12);
    lines.push(`<path d="M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}" pathLength="1"/>`)};
  muralEl.querySelectorAll(".pola.pinned").forEach(ph=>{const c=muralEl.querySelector(`.qcard[data-q="${ph.dataset.q}"]`);if(!c)return;const a=pin(ph),b=pin(c);rope(a,b);pins.push(a,b)});
  const center=muralEl.querySelector(".case-card");
  if(center){const cc=pin(center);pins.push(cc);const qs=[...muralEl.querySelectorAll(".qcard")].sort((a,b)=>a.dataset.q-b.dataset.q);
    if(muralEl.clientWidth<700){   // phone: one cable down the middle gap, bottom of each card to the top of the next, never over the text
      const bot=el=>({x:el.offsetLeft+el.offsetWidth/2,y:el.offsetTop+el.offsetHeight-8});
      let prev=bot(center);pins.push(prev);
      qs.forEach(c=>{const t=pin(c);lines.push(`<path d="M${prev.x.toFixed(1)} ${prev.y.toFixed(1)} C${(prev.x+26).toFixed(1)} ${(prev.y+(t.y-prev.y)*.4).toFixed(1)} ${(t.x-26).toFixed(1)} ${(prev.y+(t.y-prev.y)*.6).toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}"/>`);pins.push(t);prev=bot(c);pins.push(prev)});
      pins.pop();
    }
    else qs.forEach(c=>{const b=pin(c);rope(cc,b);pins.push(b)})}
  strings.innerHTML=`<g class="ropes">${lines.join("")}</g><g class="pins">${pins.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="6"/><circle class="hl" cx="${(p.x-2).toFixed(1)}" cy="${(p.y-2).toFixed(1)}" r="2"/>`).join("")}</g>`;
}
function animateStrings(ms){const t0=performance.now();(function f(t){drawStrings();if(t-t0<ms)requestAnimationFrame(f)})(t0)}

function photoEl(i){
  const [f,c]=PHOTOS[i],b=document.createElement("button");b.type="button";
  b.className="pola";b.dataset.c=c;b.dataset.f=f;
  b.setAttribute("aria-label",c+". Llévala a su misión.");
  b.style.setProperty("--w",PW+"px");b.style.setProperty("--rot",(Math.random()*24-12).toFixed(1)+"deg");b.style.setProperty("--tape-rot",(Math.random()*16-8).toFixed(1)+"deg");
  b.innerHTML=`<span class="ph"><img src="assets/${f}.webp" alt="${c}"><canvas></canvas></span><span class="cap">${c}</span>`;
  return b;
}
const POSTIT=["#ffe36e","#ff9fcb","#c7b3ff","#ffbf73","#9fe3c1"];
function questEl(i){
  const q=QUESTS[i],b=document.createElement("button");b.type="button";
  b.className="qcard";b.dataset.q=i;b.style.zIndex=1500;b.style.setProperty("--pc",POSTIT[i%POSTIT.length]);b.style.setProperty("--w",QW+"px");b.style.setProperty("--rot",(Math.random()*6-3).toFixed(1)+"deg");
  b.innerHTML=`<span class="qtop"><b>SIDE QUEST 0${i+1}</b><em class="qcount">0/${q.f.length}</em></span><span class="qtxt">${q.t}</span><span class="qtray">${q.f.map(()=>`<span class="slot"></span>`).join("")}</span>`;
  b.addEventListener("click",()=>{if(solved)return;if(selected)tryDrop(selected,b);else toast("Arrastra aquí las fotos de «"+q.t+"»")});
  return b;
}
function pinPhoto(b,qi,pos){
  b.classList.add("pinned");b.classList.remove("und","sel");b.dataset.q=qi;b.querySelector(".cap").textContent=b.dataset.c;b.querySelector("img").alt=b.dataset.c;
  b.setAttribute("aria-label",b.dataset.c+" · "+QUESTS[qi].t);b.style.left=pos.x+"px";b.style.top=pos.y+"px";b.style.setProperty("--rot",pos.r+"deg");b.style.zIndex=8;
}
function layMural(){
  const W=muralEl.clientWidth; if(!W||W===muralW)return; muralW=W;
  const narrow=W<700;
  PW=Math.round(Math.min(178,Math.max(124,W*(narrow?.4:.118))));PH=Math.round(PW*452/480+PW*.06+44);
  QW=Math.round(Math.min(220,Math.max(168,W*(narrow?.56:.15))));QH=140;
  QUESTS.forEach((q,i)=>q.f.forEach(f=>sorted[f]=i));solved=true;
  buildMontage(false);
}
function primePix(b){const img=b.querySelector("img"),cv=b.querySelector("canvas");if(!cv)return;const first=()=>pixelate(img,cv,28);if(img.complete&&img.naturalWidth)first();else img.addEventListener("load",first,{once:true})}
function caseCard(){const c=document.createElement("div");c.className="case-card";c.innerHTML=`<small>EXPEDIENTE 04 · CASO RESUELTO</small><b>Albert, fuera del lienzo</b><span>${QUESTS.length} misiones · ${PHOTOS.length} pruebas</span>`;return c}
/* build (or animate into) the finished corkboard */
function buildMontage(animate){
  const W=muralEl.clientWidth,P=montage(W);
  muralEl.classList.add("solved");muralEl.style.height=P.H+"px";
  if(!animate){
    muralEl.innerHTML="";
    const notes=W<700?[]:[["¿y fuera del trabajo?",-6],["todo conectado",5]];
    notes.forEach(([txt,r],i)=>{const e=document.createElement("span");e.className="note";e.textContent=txt;e.style.setProperty("--rot",r+"deg");
      const spots=[[.03,.02],[.62,.40]];e.style.left=(spots[i][0]*W)+"px";e.style.top=(spots[i][1]*P.H)+"px";muralEl.appendChild(e)});
    const cc=caseCard();cc.style.left=P.center.x+"px";cc.style.top=P.center.y+"px";muralEl.appendChild(cc);
    QUESTS.forEach((q,i)=>{const c=questEl(i);c.style.left=P.quests[i].x+"px";c.style.top=P.quests[i].y+"px";muralEl.appendChild(c);renderTray(i)});
    PHOTOS.forEach(([f],i)=>{const b=photoEl(i);muralEl.appendChild(b);pinPhoto(b,sorted[f],P.photos[f]);b.querySelector("canvas")?.remove()});
    muralEl.appendChild(strings);drawStrings();
    const st=document.createElement("span");st.className="stamp";st.textContent="CASO RESUELTO";muralEl.appendChild(st);
    return;
  }
  muralEl.querySelectorAll(".note").forEach(n=>n.animate([{opacity:1},{opacity:0}],{duration:300,fill:"forwards"}));
  const cc=caseCard();cc.style.left=P.center.x+"px";cc.style.top=P.center.y+"px";cc.classList.add("drop");muralEl.appendChild(cc);
  muralEl.querySelectorAll(".qcard,.pola").forEach(el=>el.classList.add("glide"));
  QUESTS.forEach((q,i)=>{const c=muralEl.querySelector(`.qcard[data-q="${i}"]`);c.style.left=P.quests[i].x+"px";c.style.top=P.quests[i].y+"px"});
  muralEl.querySelectorAll(".pola").forEach(b=>{const p=P.photos[b.dataset.f];b.style.left=p.x+"px";b.style.top=p.y+"px";b.style.setProperty("--rot",p.r+"deg")});
  animateStrings(1300);
  setTimeout(()=>{muralEl.querySelectorAll(".glide").forEach(el=>el.classList.remove("glide"));const st=document.createElement("span");st.className="stamp in";st.textContent="CASO RESUELTO";muralEl.appendChild(st);drawStrings()},1250);
}
function renderTray(qi){
  const q=QUESTS[qi],card=muralEl.querySelector(`.qcard[data-q="${qi}"]`);if(!card)return;
  const got=q.f.filter(f=>sorted[f]===qi);
  card.querySelectorAll(".slot").forEach((sl,k)=>{sl.classList.toggle("full",k<got.length)});
  card.querySelector(".qcount").textContent=got.length+"/"+q.f.length;
  const done=got.length===q.f.length;card.classList.toggle("done",done);
  card.setAttribute("aria-label",`Misión ${qi+1}: ${q.t}. ${got.length} de ${q.f.length} fotos${done?", completada":""}.`);
}
function pixelate(img,cv,step){
  const w=cv.clientWidth||img.clientWidth, h=cv.clientHeight||img.clientHeight; if(!w)return;
  cv.width=w;cv.height=h;const g=cv.getContext("2d");g.imageSmoothingEnabled=false;
  const sw=Math.max(1,Math.round(w/step)), sh=Math.max(1,Math.round(h/step));
  // object-fit:cover crop
  const ir=img.naturalWidth/img.naturalHeight, cr=w/h; let sx=0,sy=0,sWd=img.naturalWidth,sHt=img.naturalHeight;
  if(ir>cr){sWd=img.naturalHeight*cr;sx=(img.naturalWidth-sWd)/2}else{sHt=img.naturalWidth/cr;sy=(img.naturalHeight-sHt)/2}
  const tmp=pixelate.tmp||(pixelate.tmp=document.createElement("canvas"));tmp.width=sw;tmp.height=sh;
  const tg=tmp.getContext("2d");tg.imageSmoothingEnabled=true;tg.drawImage(img,sx,sy,sWd,sHt,0,0,sw,sh);
  g.drawImage(tmp,0,0,sw,sh,0,0,w,h);
}
function depix(b,delay){
  const img=b.querySelector("img"),cv=b.querySelector("canvas");if(!cv)return;
  if(REDUCE){cv.remove();return}
  const steps=[28,18,12,8,5,3];let k=0;
  setTimeout(function tick(){ if(!img.naturalWidth){img.addEventListener("load",()=>depix(b,0),{once:true});return}
    if(k<steps.length){pixelate(img,cv,steps[k++]);setTimeout(tick,95)}else{cv.animate([{opacity:1},{opacity:0}],{duration:200}).onfinish=()=>cv.remove()} },delay);
}
let landed=false;
function land(now){landed=true;[...muralEl.querySelectorAll(".pola:not(.pinned)")].sort(()=>Math.random()-.5).forEach((b,i)=>depix(b,now?0:i*140))}

/* drag the prints onto their quest; a tap reveals the undeveloped ones */
function questAt(x,y){return [...muralEl.querySelectorAll(".qcard")].find(q=>{const r=q.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom})}
function dragify(b){
  let sx,sy,ox,oy,moved=false,id=null,over=null;
  b.addEventListener("pointerdown",e=>{if(b.classList.contains("pinned"))return;id=e.pointerId;b.setPointerCapture(id);sx=e.clientX;sy=e.clientY;ox=b.offsetLeft;oy=b.offsetTop;b.dataset.ox=ox;b.dataset.oy=oy;moved=false;b.style.zIndex=1000+(++zTop)});
  b.addEventListener("pointermove",e=>{if(id!==e.pointerId)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(!moved&&Math.hypot(dx,dy)<5)return;moved=true;b.classList.add("drag");
    b.style.left=clamp(ox+dx,0,muralEl.clientWidth-b.offsetWidth)+"px";b.style.top=clamp(oy+dy,0,muralEl.clientHeight-b.offsetHeight)+"px";
    const q=questAt(e.clientX,e.clientY);if(q!==over){over?.classList.remove("hover");over=q;q?.classList.add("hover")}});
  const up=e=>{if(id!==e.pointerId)return;id=null;b.classList.remove("drag");over?.classList.remove("hover");b.style.zIndex=20+(zTop%50);
    if(moved){b.dataset.dragged="1";const q=over;over=null;if(q)tryDrop(b,q);else b.style.setProperty("--rot",(Math.random()*16-8).toFixed(1)+"deg")}};
  b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);
  b.addEventListener("click",()=>{if(b.classList.contains("pinned"))return;if(b.dataset.dragged){delete b.dataset.dragged;return}
    if(selected===b){b.classList.remove("sel");selected=null;return}
    selected?.classList.remove("sel");selected=b;b.classList.add("sel");b.dataset.ox=b.offsetLeft;b.dataset.oy=b.offsetTop;toast("Ahora toca su misión")});
}
function tryDrop(b,card){
  const qi=+card.dataset.q,f=b.dataset.f,q=QUESTS[qi];
  b.classList.remove("sel");if(selected===b)selected=null;
  if(QOF[f]===qi){
    const k=q.f.filter(x=>sorted[x]===qi).length;sorted[f]=qi;
    b.classList.add("glide");pinPhoto(b,qi,pinSpot(qi,k));renderTray(qi);animateStrings(700);
    setTimeout(()=>b.classList.remove("glide"),700);
    card.animate([{transform:"rotate(var(--rot)) scale(1.08)"},{transform:"rotate(var(--rot)) scale(1)"}],{duration:300,easing:"cubic-bezier(.3,1.6,.5,1)"});
    const n=Object.keys(sorted).length,all=PHOTOS.length;
    if(card.classList.contains("done"))toast(n===all?"¡CASO RESUELTO!":"MISIÓN COMPLETADA: "+q.t.toUpperCase()+" · +200 XP");else toast("+100 XP · "+b.dataset.c);
    $("#muralTip").textContent=n===all?"Caso resuelto. Así se ve fuera del lienzo.":"Pruebas colocadas: "+n+"/"+all+". Arrastra cada foto a su misión.";
    if(n===all){solved=true;setTimeout(()=>{buildMontage(true);if(!REDUCE)celebrate()},750)}
  }else{
    toast("Esa foto no va en «"+q.t+"»");
    card.animate([{transform:"rotate(var(--rot)) translateX(0)"},{transform:"rotate(var(--rot)) translateX(-6px)"},{transform:"rotate(var(--rot)) translateX(6px)"},{transform:"rotate(var(--rot)) translateX(0)"}],{duration:260});
    b.classList.add("glide");b.style.left=b.dataset.ox+"px";b.style.top=b.dataset.oy+"px";setTimeout(()=>b.classList.remove("glide"),450);
  }
}
function celebrate(){
  const r=muralEl.getBoundingClientRect();
  for(let k=0;k<60;k++){const sp=document.createElement("i");sp.className="px-spark";const col=["#c8102e","#ffe500","#d958ee","#19a3ec"][k%4];sp.style.background=col;sp.style.left=(r.left+Math.random()*r.width)+"px";sp.style.top=Math.max(0,r.top)+"px";document.body.appendChild(sp);
    sp.animate([{transform:"translate(-50%,0)",opacity:1},{transform:`translate(-50%,${300+Math.random()*400}px) rotate(${Math.random()*360}deg)`,opacity:0}],{duration:1200+Math.random()*900,easing:"cubic-bezier(.3,0,.6,1)"}).onfinish=()=>sp.remove()}
}
layMural();

addEventListener("resize",()=>{clearTimeout(layMural.t);layMural.t=setTimeout(layMural,200)});

/* ---------- the messy sheet behind "fuera del lienzo": stains, scribbles, crossed-out ideas ---------- */
function paintPaper(){
  const cv=$("#paperBg"),sec=$("#f04"),W=sec.clientWidth,H=sec.clientHeight;if(!W||!H)return;
  const dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;const g=cv.getContext("2d");g.scale(dpr,dpr);
  const R=(a,b)=>a+Math.random()*(b-a);
  // keep the mess inside the mural area, away from the title and the pixel bands
  const Y0=muralEl.offsetTop+10,Y1=Math.max(Y0+100,muralEl.offsetTop+muralEl.offsetHeight-10);
  const RY=()=>R(Y0,Y1);
  g.fillStyle="#ebe6db";g.fillRect(0,0,W,H);
  // grain
  for(let i=0;i<W*H/90;i++){g.fillStyle=Math.random()<.5?"rgba(90,70,40,.05)":"rgba(255,255,255,.18)";g.fillRect(R(0,W),R(0,H),R(1,2.4),R(1,2.4))}
  // ruled lines + margin like a notebook page
  g.strokeStyle="rgba(80,120,190,.16)";g.lineWidth=1;for(let y=60;y<H;y+=34){g.beginPath();g.moveTo(0,y+R(-1,1));g.lineTo(W,y+R(-1,1));g.stroke()}
  g.strokeStyle="rgba(200,40,60,.18)";g.beginPath();g.moveTo(Math.min(90,W*.08),0);g.lineTo(Math.min(90,W*.08)+R(-4,4),H);g.stroke();
  // creases
  for(let i=0;i<3;i++){const x1=R(0,W),y1=R(0,H*.2),x2=x1+R(-W*.4,W*.4),y2=H-R(0,H*.2);
    g.strokeStyle="rgba(255,255,255,.55)";g.lineWidth=2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
    g.strokeStyle="rgba(90,70,40,.12)";g.lineWidth=1;g.beginPath();g.moveTo(x1+2,y1);g.lineTo(x2+2,y2);g.stroke()}
  const ink=["rgba(45,45,55,.55)","rgba(29,42,107,.55)","rgba(45,45,55,.4)"];
  // scribbles
  for(let i=0;i<Math.max(6,W/160);i++){g.strokeStyle=ink[i%3];g.lineWidth=R(1,1.8);g.beginPath();let x=R(0,W),y=RY();g.moveTo(x,y);
    const loops=R(8,22),w=R(30,90),h=R(8,24);for(let k=0;k<loops;k++){x+=w/loops*R(.6,1.6);g.quadraticCurveTo(x-R(0,14),y+(k%2?h:-h),x,y+R(-3,3))}g.stroke()}
  // crossed-out ideas
  const words=["idea final","¿pixel?","logo v3","no","boceto 2","tipografía??","revisar","Figma → jugar","FINAL_final","ok!!","otra vez","menos es más","¿y si…?","lunes"];
  g.textBaseline="middle";
  for(let i=0;i<Math.max(8,W/120);i++){const t=words[(Math.random()*words.length)|0],x=R(20,W-140),y=RY(),sz=R(20,32),rot=R(-.18,.18);
    g.save();g.translate(x,y);g.rotate(rot);g.font=`600 ${sz}px Caveat, "Segoe Print", cursive`;g.fillStyle=ink[i%3];g.fillText(t,0,0);const tw=g.measureText(t).width;
    g.strokeStyle=Math.random()<.35?"rgba(200,16,46,.55)":ink[(i+1)%3];g.lineWidth=R(1.6,2.6);g.beginPath();
    if(Math.random()<.5){g.moveTo(-4,R(-2,2));g.lineTo(tw+4,R(-3,3))}else{let xx=-4;g.moveTo(xx,0);while(xx<tw+4){xx+=R(5,9);g.lineTo(xx,R(-sz*.35,sz*.35))}}
    g.stroke();g.restore()}
  // doodles: circles, arrows, stars, hash
  for(let i=0;i<Math.max(8,W/140);i++){const x=R(10,W-10),y=RY(),k=1+i%3;g.strokeStyle=ink[i%3];g.lineWidth=1.6;g.beginPath();
    if(k===0){g.ellipse(x,y,R(18,40),R(10,22),R(0,3),0,6.6)}
    else if(k===1){const l=R(40,80),a=R(0,6.3);g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a+.6)*l*.5,y+Math.sin(a+.6)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);const ex=x+Math.cos(a)*l,ey=y+Math.sin(a)*l;g.moveTo(ex,ey);g.lineTo(ex-Math.cos(a-.5)*10,ey-Math.sin(a-.5)*10);g.moveTo(ex,ey);g.lineTo(ex-Math.cos(a+.5)*10,ey-Math.sin(a+.5)*10)}
    else if(k===2){for(let j=0;j<5;j++){const a=j*2*2*Math.PI/5-Math.PI/2,r=R(10,16);j?g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r):g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath()}
    else{for(let j=0;j<2;j++){g.moveTo(x-12,y-5+j*10);g.lineTo(x+12,y-7+j*10);g.moveTo(x-5+j*10,y-12);g.lineTo(x-7+j*10,y+12)}}
    g.stroke()}
}
let paperW=0;
function repaper(){const W=$("#f04").clientWidth;if(W===paperW&&repaper.done)return;paperW=W;repaper.done=true;paintPaper()}
(document.fonts&&document.fonts.load?document.fonts.load("600 24px Caveat").catch(()=>{}):Promise.resolve()).then(()=>{repaper.done=false;paintPaper()});
addEventListener("resize",()=>{clearTimeout(repaper.t);repaper.t=setTimeout(()=>{repaper.done=false;paintPaper()},300)});
new ResizeObserver(()=>{clearTimeout(repaper.r);repaper.r=setTimeout(paintPaper,150)}).observe(muralEl);

const io2=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;
  if(e.target.id==="dTop")bTop.play();else if(e.target.id==="dBot")bBot.play();else if(!landed)land()}),{threshold:.2});
[$("#dTop"),$("#dBot"),muralEl].forEach(el=>io2.observe(el));


/* ---------- safe easter egg: 4 digits hidden around the site ---------- */
const SAFE_CODE="7391";
const CLUE_TX=["Mira arriba: algo cruza el cielo nocturno.","Pulsa el título del arcade.","Inserta todos los cartuchos del arcade.","Escanea el código de barras de abajo del todo."];
let found=[false,false,false,false];
try{found=JSON.parse(localStorage.getItem("albert-digits"))||found}catch(e){}
function foundDigit(n){if(!found[n]){found[n]=true;try{localStorage.setItem("albert-digits",JSON.stringify(found))}catch(e){}}return SAFE_CODE[n]}
$("#arcade .title h2").style.cursor="pointer";
$("#arcade .title h2").onclick=()=>toast("DÍGITO 2 DE 4: "+foundDigit(1));
const seenCarts=new Set();
[...carts.children].forEach((c,i)=>c.addEventListener("click",()=>{seenCarts.add(i);if(seenCarts.size===PROJECTS.length&&!seenCarts.told){seenCarts.told=true;setTimeout(()=>toast("¡TODOS LOS CARTUCHOS CARGADOS! DÍGITO SECRETO 3: "+foundDigit(2)),500)}}));
seenCarts.add(0);
$("#barcode").onclick=()=>{const b=$("#barcode");if(b.classList.contains("scan"))return;b.classList.add("scan");
  setTimeout(()=>{b.classList.remove("scan");$("#barNum").textContent="#4 = "+foundDigit(3);toast("¡BEEP! DÍGITO SECRETO 4: "+SAFE_CODE[3]);setTimeout(()=>$("#barNum").textContent="2026",4000)},1850)};
const egg=$("#egg"),eggBox=$("#eggBox");let eggReturn=null;
function eggLocked(){
  eggBox.classList.remove("secret");
  eggBox.innerHTML=`<button class="egg-x" id="eggX" aria-label="Cerrar">X</button>
    <h3>¡¡UPSSS!!<br>Introduce el código</h3>
    <div class="slots" id="slots">${[0,1,2,3].map(i=>found[i]?`<input id="d${i}" class="got" value="${SAFE_CODE[i]}" readonly aria-label="Dígito ${i+1}: encontrado">`:`<input id="d${i}" inputmode="numeric" maxlength="1" placeholder="?" aria-label="Dígito ${i+1}" autocomplete="off">`).join("")}</div>
    <p class="egg-msg" id="eggMsg" aria-live="polite"></p>
    <ul class="clues">${CLUE_TX.map((c,i)=>`<li class="${found[i]?"ok":""}"><b>${found[i]?`#${i+1} = ${SAFE_CODE[i]}`:`DÍGITO #${i+1}`}</b><span>${c}</span></li>`).join("")}</ul>`;
  $("#eggX").onclick=closeEgg;
  const ins=[...eggBox.querySelectorAll(".slots input")],open=ins.filter(x=>!x.readOnly);
  open.forEach((inp,k)=>{
    inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\D/g,"").slice(-1);if(inp.value&&k<open.length-1)open[k+1].focus();if(ins.every(x=>x.value))tryCode(ins)});
    inp.addEventListener("keydown",e=>{if(e.key==="Backspace"&&!inp.value&&k>0){open[k-1].focus();open[k-1].value=""}});
  });
  if(open.length)open[0].focus();else{$("#eggX").focus();setTimeout(()=>tryCode(ins),700)}
}
function tryCode(ins){
  if(ins.map(x=>x.value).join("")===SAFE_CODE){eggOpen();return}
  const sl=$("#slots");sl.classList.remove("bad");void sl.offsetWidth;sl.classList.add("bad");
  $("#eggMsg").textContent="CÓDIGO INCORRECTO. ¡SIGUE EXPLORANDO!";
  setTimeout(()=>{const o=ins.filter(x=>!x.readOnly);o.forEach(x=>x.value="");o[0]?.focus()},450);
}
function pix(rows,colors){let r="";rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(colors[c])r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[c]}"/>`}));return`<svg viewBox="0 0 ${rows[0].length} ${rows.length}" aria-hidden="true">${r}</svg>`}
const ICON_PADEL=pix(["..XXXXXX..",".XXOXXOXX.","XXXXXXXXXX","XOXXOXXOXX","XXXXXXXXXX","XXOXXOXXOX","XXXXXXXXXX",".XXOXXOXX.","..XXXXXX..","....HH....","....HH....","....HH....","....KK...."],{X:"#19a3ec",O:"#0b4f7a",H:"#f2f2f2",K:"#222"});
const ICON_SKI=pix(["......W.......",".....WWW......","....WWBWW.....","...WBBBBBW....","..BBBBBBBBB...",".BBBBBBBBBBB..","BBBBBBBBBBBBB.","..............","R...........R.",".RRRRRRRRRRRR.","..............","Y...........Y.",".YYYYYYYYYYYY."],{W:"#ffffff",B:"#8b78e6",R:"#ff4d6d",Y:"#ffd23f"});
function eggOpen(){
  eggBox.classList.add("secret");
  eggBox.innerHTML=`<button class="egg-x" id="eggX" aria-label="Cerrar">X</button>
    <h3>ACCESO CONCEDIDO</h3>
    <p class="sub">NIVEL SECRETO · JUGADOR 1, FUERA DE SERVICIO</p>
    <p class="lead">Has encontrado mi yo real. Esto es lo que hago cuando no estoy diseñando.</p>
    <div class="quests">
      <div class="quest">${ICON_PADEL}<small>MISIÓN SECUNDARIA</small><b>PÁDEL</b><p>Casi todas las semanas me encontrarás en una pista de pádel. Decisiones rápidas y reinicios rápidos: así es como me gusta iterar.</p></div>
      <div class="quest">${ICON_SKI}<small>NIVEL DE INVIERNO</small><b>ESQUÍ</b><p>Cuando llega la nieve cambio la pista de pádel por las de esquí. Leer la montaña y elegir una línea: diseño de niveles en la vida real.</p></div>
      <div class="quest"><div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><small>BANDA SONORA</small><b>RAP · LATINA · POP</b><p>Siempre suena algo mientras trabajo. El buen diseño también tiene ritmo.</p></div>
    </div>
    <div class="outro"><p>Has abierto una caja fuerte escondida en un portfolio. Está claro que te importan los detalles. A mí también.</p>
      <button class="send" id="eggTalk" type="button" style="align-self:auto;margin:0">HABLEMOS ▸</button></div>`;
  $("#eggX").onclick=closeEgg;$("#eggX").focus();
  $("#eggTalk").onclick=()=>{closeEgg();$("#f05").scrollIntoView({behavior:"smooth"});setTimeout(()=>$("#f-name").focus({preventScroll:true}),600)};
}
function openEgg(){eggReturn=document.activeElement;egg.hidden=false;document.body.style.overflow="hidden";eggLocked()}
function closeEgg(){egg.hidden=true;eggBox.classList.remove("secret");document.body.style.overflow="";eggReturn?.focus?.()}
$("#vaultBtn").onclick=openEgg;
egg.addEventListener("click",e=>{if(e.target===egg)closeEgg()});
addEventListener("keydown",e=>{if(e.key==="Escape"&&!egg.hidden)closeEgg()});
/* comet hands out digit 1 */
const _launch=launchComet;

/* ---------- contact form ---------- */
const fMsg=$("#f-msg");fMsg.addEventListener("input",()=>$("#count").textContent=`${fMsg.value.length}/600`);
function checkForm(f){
  const errs={name:f.name.value.trim()?"":"Escribe tu nombre.",
    mail:/^\S+@\S+\.\S+$/.test(f.email.value.trim())?"":"Escribe un email válido, por ejemplo tu@email.com.",
    msg:f.message.value.trim().length>=10?"":"El mensaje necesita al menos 10 caracteres.",
    phone:!f.phone.value.trim()||/^[+()\d\s-]{6,20}$/.test(f.phone.value.trim())?"":"Revisa el teléfono: solo números, espacios y +."};
  [["name","f-name","e-name"],["mail","f-mail","e-mail"],["phone","f-phone","e-phone"],["msg","f-msg","e-msg"]].forEach(([k,inp,er])=>{$("#"+er).textContent=errs[k];$("#"+inp).classList.toggle("bad",!!errs[k])});
  return !errs.name&&!errs.mail&&!errs.msg&&!errs.phone;
}
const WEB3FORMS_KEY="daf37279-d077-4b65-a52e-267211ec3688";
$("#form").addEventListener("submit",async e=>{
  e.preventDefault();const f=e.target;
  if(!checkForm(f)){f.querySelector(".bad")?.focus();return}
  const name=f.name.value.trim(),topic=f.topic.value,subject=`${topic} — mensaje de ${name}`;
  const btn=f.querySelector(".send");btn.disabled=true;btn.querySelector("span").textContent="ENVIANDO…";
  let sent=false;
  try{
    const res=await fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({access_key:WEB3FORMS_KEY,botcheck:f.botcheck.checked,subject,topic,name,email:f.email.value.trim(),from_name:name,replyto:f.email.value.trim(),phone:f.phone.value.trim(),message:f.message.value.trim()})});
    sent=!!(await res.json()).success;
  }catch(err){sent=false}
  const safe=name.replace(/[<>&]/g,"");
  if(sent){
    $("#formBox").innerHTML=`<div class="done" role="status"><h3>¡MENSAJE ENVIADO!</h3><p>Gracias, ${safe}. Te responderé en cuanto lo lea.</p></div>`;
  }else{
    // the message could not be sent from here: give the visitor everything to send it by hand
    const body=`${f.message.value.trim()}\n\n— ${name}${f.phone.value.trim()?" · "+f.phone.value.trim():""} · ${f.email.value.trim()}`;
    const mail="designedbyalbertgalindo@gmail.com";
    $("#formBox").innerHTML=`<div class="done" role="status"><h3>CASI LISTO</h3>
      <p>No se ha podido enviar desde aquí. Copia el mensaje y mándalo a <b>${mail}</b>.</p>
      <div class="row"><button class="send" id="copyMsg" type="button">COPIAR MENSAJE</button>
      <a class="send ghost" href="mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">ABRIR MI CORREO</a></div></div>`;
    $("#copyMsg").onclick=()=>{try{navigator.clipboard.writeText(`Para: ${mail}\nAsunto: ${subject}\n\n${body}`).then(()=>toast("Mensaje copiado"),()=>toast(mail))}catch(err){toast(mail)}};
  }
});

/* ---------- CV viewer: builds the CV in pixel mode ---------- */
const cvv=$("#cvv"),cvImg=$("#cvImg"),cvCanvas=$("#cvCanvas"),cvPaper=$("#cvPaper");let cvReturn=null,cvRun=0;
function cvDraw(step,rowsShown){
  const w=cvPaper.clientWidth,h=cvPaper.clientHeight;if(!w||!cvImg.naturalWidth)return;
  if(cvCanvas.width!==w)cvCanvas.width=w;if(cvCanvas.height!==h)cvCanvas.height=h;
  const g=cvCanvas.getContext("2d");g.imageSmoothingEnabled=false;
  const sw=Math.max(1,Math.round(w/step)),sh=Math.max(1,Math.round(h/step));
  const tmp=cvDraw.t||(cvDraw.t=document.createElement("canvas"));tmp.width=sw;tmp.height=sh;
  const tg=tmp.getContext("2d");tg.imageSmoothingEnabled=true;tg.drawImage(cvImg,0,0,sw,sh);
  g.fillStyle="#0e0a1c";g.fillRect(0,0,w,h);
  const rows=rowsShown==null?sh:rowsShown;
  for(let r=0;r<Math.min(rows,sh);r++){
    // the last visible row fills in from left to right, like a loading scan
    const part=r===Math.floor(rows)-1&&rowsShown!=null?(rows%1||1):1;
    const cols=Math.ceil(sw*part);
    g.drawImage(tmp,0,r,cols,1,0,r*h/sh,cols*w/sw,h/sh+1);
  }
}
function cvProgress(p){$("#cvBar").style.width=Math.round(p*100)+"%";$("#cvState").textContent=p<1?"CARGANDO CV… "+Math.round(p*100)+"%":"CV LISTO · ALBERT GALINDO MORTÉS"}
function buildCV(){
  const run=++cvRun;cvPaper.classList.remove("ready");cvCanvas.style.opacity=1;
  if(REDUCE){cvPaper.classList.add("ready");cvProgress(1);return}
  const start=()=>{
    const big=26,rowsTotal=Math.round(cvPaper.clientHeight/big),D1=1300,t0=performance.now();
    (function scan(now){if(run!==cvRun)return;const p=Math.min(1,(now-t0)/D1);cvDraw(big,p*rowsTotal);cvProgress(p*.7);
      if(p<1)requestAnimationFrame(scan);else refine(0)})(t0);
    const steps=[18,12,8,5,3,2];
    function refine(k){if(run!==cvRun)return;if(k<steps.length){cvDraw(steps[k]);cvProgress(.7+.3*(k+1)/steps.length);setTimeout(()=>refine(k+1),110)}
      else{cvPaper.classList.add("ready");cvCanvas.animate([{opacity:1},{opacity:0}],{duration:250,fill:"forwards"});cvProgress(1)}}
  };
  if(cvImg.complete&&cvImg.naturalWidth)requestAnimationFrame(start);else cvImg.addEventListener("load",start,{once:true});
}
function openCV(){cvReturn=document.activeElement;cvv.hidden=false;document.body.style.overflow="hidden";cvv.scrollTop=0;$("#cvClose").focus();buildCV()}
function closeCV(){cvRun++;cvv.hidden=true;document.body.style.overflow="";cvReturn?.focus?.()}
$("#openCV").onclick=openCV;$("#heroCV").onclick=e=>{e.preventDefault();openCV()};$("#cvClose").onclick=closeCV;
addEventListener("keydown",e=>{if(e.key==="Escape"&&!cvv.hidden)closeCV()});

/* ---------- contact ---------- */
$("#copy").onclick=()=>{const m=$("#mail").textContent,btn=$("#copy");
  const ok=()=>{btn.textContent="COPIADO ✓";btn.classList.add("ok");toast("Email copiado");setTimeout(()=>{btn.textContent="COPIAR";btn.classList.remove("ok")},2200)};
  const fb=()=>{const r=document.createRange();r.selectNodeContents($("#mail"));const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Email seleccionado: cópialo con Ctrl+C")};
  try{navigator.clipboard.writeText(m).then(ok,fb)}catch(e){fb()}};
function tick(){try{$("#clock").textContent=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Madrid"})}catch(e){}}
tick();setInterval(tick,30000);

/* ---------- world map: a blurred live preview of the page with the levels on top ---------- */
const WM=$("#wm"),wmMini=$("#wmMini"),wmInner=$("#wmInner"),wmClone=$("#wmClone"),wmRect=$("#wmRect"),wmPath=$("#wmPath");
const LEVELS_NAV=[["hero","INICIO"],["arcade","ARCADE"],["f03","LOGROS"],["f04","MI VIDA"],["f05","CONTACTO"]];
let wmScale=1,wmOff=0,wmDocH=1,wmBuilt=0,wmLevel=-1;
function wmBuild(){
  // snapshot of the page (no scripts, no ids, canvases copied) used only as a blurred picture
  const frag=document.createDocumentFragment();
  [...document.body.children].forEach(el=>{
    if(el===WM||el.id==="wmToggle"||el.tagName==="SCRIPT"||el.matches(".cs,.cvv,.egg,.toast,.px-pet,.px-pet-toggle,.px-spark,.mg-float,.stress-flash"))return;
    if(getComputedStyle(el).position==="fixed")return;
    const c=el.cloneNode(true);
    const srcC=[...el.querySelectorAll("canvas")],dstC=[...c.querySelectorAll("canvas")];
    dstC.forEach((d,k)=>{const o=srcC[k];if(!o||!o.width)return;d.width=o.width;d.height=o.height;try{d.getContext("2d").drawImage(o,0,0)}catch(e){}});
    c.querySelectorAll("[id]").forEach(n=>n.removeAttribute("id"));c.removeAttribute("id");
    c.querySelectorAll("video,iframe,script").forEach(n=>n.remove());
    c.querySelectorAll("button,a,input,textarea").forEach(n=>n.setAttribute("tabindex","-1"));
    frag.appendChild(c);
  });
  wmClone.innerHTML="";wmClone.appendChild(frag);wmBuilt=performance.now();wmMeasure();
}
function wmMeasure(){
  const W=document.documentElement.clientWidth;wmDocH=document.documentElement.scrollHeight;
  wmClone.style.width=W+"px";wmClone.style.height=wmDocH+"px";
  wmScale=wmMini.clientWidth/W;wmInner.style.width=W+"px";
  wmRect.style.height=innerHeight+"px";
  // level markers on the real section positions
  const pts=LEVELS_NAV.map(([id,name],i)=>{const el=document.getElementById(id);return {id,name,i,y:(el.offsetTop+Math.min(el.offsetHeight,innerHeight)*.35)}});
  wmPath.innerHTML=`<svg aria-hidden="true"></svg>`+pts.map(p=>`<button type="button" class="wm-node" data-id="${p.id}" data-y="${p.y}" aria-label="Nivel ${p.i+1}: ${p.name}"><i>${p.i+1}</i>${p.name}</button>`).join("");
  wmPath.querySelectorAll(".wm-node").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();document.getElementById(b.dataset.id).scrollIntoView({behavior:"smooth"});WM.classList.remove("open")}));
  wmUpdate(true);
}
function wmUpdate(force){
  const boxH=wmMini.clientHeight,sh=wmDocH*wmScale,y=scrollY;
  wmOff=sh>boxH?Math.max(0,Math.min(sh-boxH,(y+innerHeight/2)*wmScale-boxH/2)):0;
  wmInner.style.transform=`translate(0,${-wmOff}px) scale(${wmScale})`;
  wmRect.style.top=y+"px";
  // nodes + dotted path in box coordinates
  const nodes=[...wmPath.querySelectorAll(".wm-node")],ys=nodes.map(n=>+n.dataset.y*wmScale-wmOff);
  nodes.forEach((n,i)=>{n.style.top=ys[i]+"px";n.style.left=(i%2?62:38)+"%"});
  const W=wmMini.clientWidth,xs=nodes.map((n,i)=>W*(i%2?.62:.38));
  const svg=wmPath.querySelector("svg");if(svg)svg.innerHTML=ys.length>1?`<path d="${ys.map((yy,i)=>(i?"L":"M")+xs[i].toFixed(1)+" "+yy.toFixed(1)).join(" ")}" fill="none" stroke="#ffe500" stroke-width="2" stroke-dasharray="3 4"/>`:"";
  // current level = last section whose top has passed the middle of the screen
  let cur=0;LEVELS_NAV.forEach(([id],i)=>{if(document.getElementById(id).getBoundingClientRect().top<innerHeight*.5)cur=i});
  nodes.forEach((n,i)=>{n.classList.toggle("on",i===cur);n.classList.toggle("done",i<cur)});
  if(cur!==wmLevel||force){wmLevel=cur;$("#wmLvl").textContent="NIVEL "+(cur+1);$("#wmName").textContent=LEVELS_NAV[cur][1]}
  
}
wmMini.addEventListener("click",e=>{const r=wmMini.getBoundingClientRect();const realY=(e.clientY-r.top+wmOff)/wmScale;scrollTo({top:Math.max(0,realY-innerHeight/2),behavior:"smooth"})});
let wmT=0,wmHide=0;
let wmShowT=0;
addEventListener("scroll",()=>{if(!wmT)wmT=requestAnimationFrame(()=>{wmT=0;wmUpdate()});
  // show while scrolling, hide a while after it stops
  WM.classList.add("show");
  clearTimeout(wmHide);wmHide=setTimeout(()=>{clearTimeout(wmShowT);wmShowT=0;if(!WM.matches(":hover"))WM.classList.remove("show")},1800)},{passive:true});
addEventListener("resize",()=>{clearTimeout(wmBuild.t);wmBuild.t=setTimeout(()=>{if(innerWidth>760)wmBuild()},400)});
$("#wmToggle").onclick=()=>{const o=WM.classList.toggle("open");$("#wmToggle").setAttribute("aria-expanded",o);if(o){if(performance.now()-wmBuilt>4000)wmBuild();else wmUpdate(true)}};
WM.addEventListener("mouseenter",()=>{clearTimeout(wmHide);if(performance.now()-wmBuilt>6000)wmBuild()});
WM.addEventListener("mouseleave",()=>{clearTimeout(wmHide);wmHide=setTimeout(()=>WM.classList.remove("show"),1200)});
if(matchMedia("(min-width:761px)").matches)setTimeout(wmBuild,1500);
