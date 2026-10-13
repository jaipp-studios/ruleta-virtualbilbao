/* ============ CONFIGURACIÓN DEL LOCAL ============ */
const CONFIG = {
  nombre: "Virtual Bilbao",
  // LOGO: pon aquí la ruta del archivo ("logo.png"), una URL o el base64.
  // Si lo dejas vacío, sale la inicial del nombre en un cuadrado verde.
  logo: "assets/img/logo-virtualbilbao.png",
  // Pega aquí el enlace de reseñas de Google del cliente:
  urlGoogle: "https://search.google.com/local/writereview?placeid=ChIJgfmDRi5QTg0Rkl5TmyHcCt4",
  diasValidez: 30
};

const PREMIOS = [
  { l:["10%","en 025reaction"], emoji:"🎯", titulo:"10% en 025reaction",       texto:"Un descuento redondo por dos minutos de tu tiempo. Buen negocio.", codigo:true,  cod:"DTO10", peso:20, color:"#ff2cb0", tinta:"#FFFDF7" },
  { l:["Bebida","gratis"],      emoji:"🥤", titulo:"Una bebida gratis",        texto:"Para después de la actividad, que se suda. Invita la casa.",    codigo:false, peso:15, color:"#ff842c", tinta:"#FFFDF7" },
  { l:["Otra","tirada"],        emoji:"🔁", titulo:"¡Otra tirada!",            texto:"La ruleta no se aclara. Prueba otra vez.",  codigo:false, peso:20, color:"#FFFDF7", tinta:"#12211C", repetir:true },
  { l:["2x1","entre semana"],   emoji:"🎟️", titulo:"2x1 entre semana",         texto:"Vienes con alguien y solo pagas una. El premio gordo de la ruleta.", codigo:true, cod:"2X1", peso:5, color:"#2c3dff", tinta:"#FFFDF7", nota:"Válido de lunes a viernes." },
  { l:["20%","próxima visita"], emoji:"🔥", titulo:"20% en tu próxima visita", texto:"Un buen descuento para que vuelvas. Te estamos esperando.", codigo:true, cod:"DTO20", peso:10, color:"#2cb0ff", tinta:"#FFFDF7" },
  { l:["Nada","de nada"],       emoji:"🫠", titulo:"Nada de nada",             texto:"Cero premios. Pero tu reseña sigue siendo preciosa y eso no nos lo quita nadie.", codigo:false, peso:20, color:"#000000", tinta:"#FFFDF7" }
];

// URL del despliegue del Apps Script (ver instrucciones aparte)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzfPjPp-WPToGUrLPC-Of45xa7GoxpkO5RDtmsuoHmGm1Aqzety17FVHbqr4eyCNza-Tg/exec";

// Envía cada tirada (fecha, premio, código) a la Sheet. No se muestra nada al cliente.
function registrar(premio, cod){
  fetch(SHEET_URL, {
    method:"POST",
    mode:"no-cors",
    headers:{"Content-Type":"text/plain"},
    body: JSON.stringify({ fecha:new Date().toISOString(), premio, codigo:cod })
  });
}

/* ============ MONTAJE ============ */
const $ = s => document.querySelector(s);
document.title = "Deja tu reseña · " + CONFIG.nombre;
$("#nombreLocal").textContent = CONFIG.nombre;
if(CONFIG.logo){
  const img=$("#logo");
  img.src=CONFIG.logo; img.alt=CONFIG.nombre; img.hidden=false;
  img.onerror=()=>{ img.hidden=true; $("#inicial").style.display="grid"; };
  $("#inicial").style.display="none";
}
$("#inicial").textContent = CONFIG.nombre.replace(/^(el|la|los|las|bar|club|centro)\s+/i,"").charAt(0).toUpperCase();

function ir(id){
  document.querySelectorAll(".paso").forEach(p=>p.classList.remove("on"));
  $(id).classList.add("on");
  window.scrollTo({top:0,behavior:"smooth"});
}

/* --- reseña --- */
$("#btnGoogle").onclick = () => {
  window.open(CONFIG.urlGoogle,"_blank","noopener");
  $("#btnYaEsta").focus();
};
$("#btnYaEsta").onclick = () => ir("#p4");

/* --- ruleta --- */
const N = PREMIOS.length, PASO = 360/N, R = 196, C = 200;
const NS = "http://www.w3.org/2000/svg";
const giro = $("#giro");

const pol = (ang,r) => {
  const a=(ang-90)*Math.PI/180;
  return [C+r*Math.cos(a), C+r*Math.sin(a)];
};
PREMIOS.forEach((pr,i)=>{
  const ini=i*PASO, fin=ini+PASO;
  const [x1,y1]=pol(ini,R), [x2,y2]=pol(fin,R);
  const path=document.createElementNS(NS,"path");
  path.setAttribute("d",`M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`);
  path.setAttribute("fill",pr.color);
  path.setAttribute("stroke","rgba(255,253,247,.5)");
  path.setAttribute("stroke-width","1.5");
  giro.appendChild(path);

  const g=document.createElementNS(NS,"g");
  g.setAttribute("transform",`rotate(${ini+PASO/2} ${C} ${C})`);
  pr.l.forEach((linea,k)=>{
    const t=document.createElementNS(NS,"text");
    t.setAttribute("x",C);
    t.setAttribute("y",52+k*19);
    t.setAttribute("text-anchor","middle");
    t.setAttribute("fill",pr.tinta);
    t.setAttribute("font-family","Bricolage Grotesque, sans-serif");
    t.setAttribute("font-weight", k===0?"800":"600");
    t.setAttribute("font-size", k===0 ? (linea.length>9?"16":"18") : (linea.length>12?"11":"12.5"));
    t.textContent=linea;
    g.appendChild(t);
  });
  const e=document.createElementNS(NS,"text");
  e.setAttribute("x",C); e.setAttribute("y",PREMIOS[i].l.length>1?113:95);
  e.setAttribute("text-anchor","middle"); e.setAttribute("font-size","19");
  e.setAttribute("font-family",'"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif');
  e.textContent=pr.emoji;
  g.appendChild(e);
  giro.appendChild(g);
});

const total = PREMIOS.reduce((s,p)=>s+p.peso,0);
function sortear(){
  let r=Math.random()*total;
  for(let i=0;i<N;i++){ r-=PREMIOS[i].peso; if(r<=0) return i; }
  return N-1;
}

let angulo=0, girando=false;
$("#btnGirar").onclick = () => {
  if(girando) return;
  girando=true;
  const btn=$("#btnGirar");
  btn.disabled=true; btn.textContent="Girando...";
  const i=sortear();
  const jitter=(Math.random()-.5)*(PASO-10);
  // resto (mod 360) que angulo debe tener para que el sector i quede bajo la aguja
  const restoDeseado = ((-(i*PASO + PASO/2) - jitter) % 360 + 360) % 360;
  // resto actual de la rueda, para avanzar siempre hacia delante desde ahí
  const restoActual = ((angulo % 360) + 360) % 360;
  const avance = ((restoDeseado - restoActual) % 360 + 360) % 360;
  angulo += avance + 360*5;
  giro.style.transform=`rotate(${angulo}deg)`;
  setTimeout(()=>{ girando=false; btn.disabled=false; btn.textContent="Girar la ruleta"; mostrar(i); }, 5600);
};

/* --- premio --- */
function codigo(pref){
  const s="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c=""; for(let i=0;i<4;i++) c+=s[Math.floor(Math.random()*s.length)];
  return (pref||"025")+"-"+c;
}
function mostrar(i){
  const pr=PREMIOS[i];
  $("#pEmoji").textContent=pr.emoji;
  $("#pTitulo").textContent=pr.titulo;
  $("#pTexto").textContent=pr.texto;
  $("#pNota").textContent=pr.nota||"";
  $("#btnOtra").style.display = pr.repetir ? "block" : "none";
  $("#btnCopiar").textContent = "Copiar";

  let cod="";
  if(pr.codigo){
    const f=new Date(Date.now()+CONFIG.diasValidez*864e5);
    cod=codigo(pr.cod);
    $("#pCodigo").style.display="flex";
    $("#pCod").innerHTML = cod+'<small>Enséñaselo en recepción</small>';
    $("#pCaduca").textContent = "Válido hasta el "+f.toLocaleDateString("es-ES",{day:"numeric",month:"long"})+".";
    confeti();
  }else{
    $("#pCodigo").style.display="none";
    if(pr.regalo){
      $("#pCaduca").textContent = "Recógelo en recepción antes de salir.";
      confeti();
    }else{
      $("#pCaduca").textContent = pr.repetir ? "" : "Vuelve otro día y lo intentas de nuevo.";
    }
  }
  registrar(pr.titulo, cod);
  ir("#p5");
}
$("#btnOtra").onclick = () => { $("#subRuleta").textContent="Segunda oportunidad. Esta va en serio."; ir("#p4"); };
$("#btnCopiar").onclick = e => {
  navigator.clipboard?.writeText($("#pCod").childNodes[0].nodeValue.trim());
  e.target.textContent="Copiado";
  setTimeout(()=>e.target.textContent="Copiar",1800);
};

function confeti(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const caja=$("#conf"), cols=["#1D9E75","#F2B544","#14634A","#FFFDF7"];
  for(let i=0;i<40;i++){
    const p=document.createElement("i");
    p.style.left=Math.random()*100+"vw";
    p.style.top="-20px";
    p.style.background=cols[i%cols.length];
    p.style.animationDelay=(Math.random()*.6)+"s";
    p.style.transform=`rotate(${Math.random()*360}deg)`;
    caja.appendChild(p);
    setTimeout(()=>p.remove(),3600);
  }
}
