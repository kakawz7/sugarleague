(function(){
var L=window.LIGA||{times:[],jogos:[]},P=document.body.dataset.page;
var e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
var links=[["index.html","Liga","home"],["classificacao.html","Classificação","tabela"],["confrontos.html","Confrontos","jogos"]];
document.getElementById("nav").innerHTML='<a class="logo" href="index.html"><i></i>Sugar League</a><nav>'+links.map(l=>'<a href="'+l[0]+'"'+(l[2]==P?' aria-current="page"':'')+'>'+l[1]+'</a>').join("")+'</nav><a class="pill" href="classificacao.html">Ver tabela</a>';
// pontuação: 2x0 = 3 pts, 2x1 = 2 pts p/ vencedor; 1 pt p/ quem perde 2x1
function tabela(){var m={};L.times.forEach(t=>m[t]={t:t,j:0,v:0,d:0,sp:0,sc:0,p:0});
L.jogos.forEach(g=>{if(g.sa==null||g.sb==null)return;var a=m[g.a],b=m[g.b];if(!a||!b)return;
a.j++;b.j++;a.sp+=g.sa;a.sc+=g.sb;b.sp+=g.sb;b.sc+=g.sa;
var w=g.sa>g.sb?a:b,l=w===a?b:a,eq=Math.min(g.sa,g.sb)>0;w.v++;l.d++;w.p+=eq?2:3;l.p+=eq?1:0});
return Object.values(m).sort((x,y)=>y.p-x.p||(y.sp-y.sc)-(x.sp-x.sc)||y.v-x.v||x.t.localeCompare(y.t))}
var T=tabela(),pend=L.jogos.filter(g=>g.sa==null).sort((a,b)=>a.rodada-b.rodada),out=document.getElementById("out");
if(P=="home"){var lead=T[0]&&T[0].j?T[0]:null;
document.getElementById("cards").innerHTML=
'<div class="card"><small>Líder</small><span class="big">'+(lead?e(lead.t):'—')+'</span><span class="sub">'+(lead?lead.p+' pontos':'Aguardando a primeira partida')+'</span></div>'+
'<div class="card hi"><small>Top 5</small>'+(T.slice(0,5).map((r,i)=>'<div class="mini"><span>'+(i+1)+'</span><span>'+e(r.t)+'</span><b>'+r.p+'</b></div>').join("")||'Sem times')+'</div>'+
'<div class="card"><small>Próximos confrontos</small>'+(pend.slice(0,3).map(g=>'<div class="nx"><small>Rodada '+g.rodada+'</small><b>'+e(g.a)+' vs '+e(g.b)+'</b></div>').join("")||'<span class="sub">Nenhum confronto agendado.</span>')+'</div>'}
if(P=="tabela")out.innerHTML=T.length?'<div class="wrap"><table><thead><tr><th>#</th><th>Time</th><th>J</th><th>V</th><th>D</th><th>Sets</th><th>Pts</th></tr></thead><tbody>'+
T.map((r,i)=>'<tr'+(i==0&&r.j?' class="lead"':'')+'><td>'+(i+1)+'</td><td>'+e(r.t)+'</td><td>'+r.j+'</td><td>'+r.v+'</td><td>'+r.d+'</td><td>'+(r.sp-r.sc>0?'+':'')+(r.sp-r.sc)+'</td><td class="pts">'+r.p+'</td></tr>').join("")+'</tbody></table></div>':'<p class="vazio">Nenhum time cadastrado.</p>';
if(P=="jogos"){var rs=[...new Set(L.jogos.map(g=>g.rodada))].sort((a,b)=>a-b);
out.innerHTML=rs.map(r=>'<h2 class="rd">Rodada '+r+'</h2>'+L.jogos.filter(g=>g.rodada==r).map(g=>{var d=g.sa!=null;
return '<div class="g"><span'+(d&&g.sa>g.sb?' class="w"':'')+'>'+e(g.a)+'</span>'+(d?'<b>'+g.sa+' – '+g.sb+'</b>':'<em>vs</em>')+'<span'+(d&&g.sb>g.sa?' class="w"':'')+'>'+e(g.b)+'</span></div>'}).join("")).join("")||'<p class="vazio">Nenhum confronto cadastrado.</p>'}
// fundo interativo
var c=document.getElementById("bg");
if(c){var x=c.getContext("2d"),W,H,D,pts=[],m={x:-9999,y:-9999},rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
function size(){var r=c.getBoundingClientRect();D=Math.min(devicePixelRatio||1,2);W=c.width=r.width*D;H=c.height=r.height*D;
var n=Math.min(130,Math.round(r.width*r.height/9000));pts=[];for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,z:.3+Math.random()*.7,vx:(Math.random()-.5)*.35*D,vy:(Math.random()-.5)*.35*D})}
addEventListener("resize",size);size();
addEventListener("pointermove",ev=>{var r=c.getBoundingClientRect();m.x=(ev.clientX-r.left)*D;m.y=(ev.clientY-r.top)*D});
function draw(){x.clearRect(0,0,W,H);var R=120*D,K=170*D,px=m.x>0?(m.x/W-.5)*-26*D:0;
pts.forEach(p=>{p.x+=p.vx*p.z;p.y+=p.vy*p.z;if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
var dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy);if(d<K&&d>1){p.x+=dx/d*(K-d)*.02;p.y+=dy/d*(K-d)*.02}});
for(var i=0;i<pts.length;i++){var a=pts[i],ax=a.x+px*a.z;
for(var j=i+1;j<pts.length;j++){var b=pts[j],bx=b.x+px*b.z,d=Math.hypot(ax-bx,a.y-b.y);
if(d<R){x.strokeStyle="rgba(255,255,255,"+(1-d/R)*.26+")";x.beginPath();x.moveTo(ax,a.y);x.lineTo(bx,b.y);x.stroke()}}
var dm=Math.hypot(ax-m.x,a.y-m.y);if(dm<K){x.strokeStyle="rgba(253,145,204,"+(1-dm/K)*.5+")";x.beginPath();x.moveTo(ax,a.y);x.lineTo(m.x,m.y);x.stroke()}
x.fillStyle="rgba(255,255,255,"+(.3+.55*a.z)+")";x.beginPath();x.arc(ax,a.y,(.8+1.8*a.z)*D,0,6.3);x.fill()}
if(!rm)requestAnimationFrame(draw)}
draw()}
})();
