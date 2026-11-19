import { Chess } from 'chess.js';
import './style.css';
var note="";
var KEY="correspondence_chess_games",GL={k:"\u265A",q:"\u265B",r:"\u265C",b:"\u265D",n:"\u265E",p:"\u265F"};
var games=[],cur=null,chess=null,sel=null,flipped=false,showLegend=false,confirmDel=null,creating=false,newSide="w",viewPly=null;
function load(){try{games=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){games=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(games))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function glyph(p){return '<span class="pc '+p.color+'">'+GL[p.type]+'\uFE0E</span>'}
function fmt(d){return new Date(d).toLocaleDateString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}
function san(s){var m=s.match(/^([KQRBN])(.*)$/);return m?'<b>'+m[1]+'</b>'+esc(m[2]):esc(s)}
function mini(fen){var c=new Chess(fen==="start"?undefined:fen),h="";
 for(var r=0;r<8;r++)for(var f=0;f<8;f++){var p=c.get("abcdefgh"[f]+(8-r));
  h+='<i style="background:var(--'+((r+f)%2?"dk":"lt")+')">'+(p?'<span class="pc '+p.color+'" style="cursor:default">'+GL[p.type]+'\uFE0E</span>':"")+'</i>'}
 return '<div class="mini">'+h+'</div>'}
function home(){cur=null;chess=null;
 var h='<header><div><div class="eyebrow">Played by post · kept offline</div><h1>Correspondence <em>Chess</em></h1></div><div class="hbtns"><button class="btn ghost sm" onclick="exportMd()">Export .md</button><button class="btn ghost sm" id="cmd" onclick="copyMd()">Copy .md</button><button class="btn ghost sm" onclick="document.getElementById(\'imp\').click()">Import</button><button class="btn" onclick="toggleNew()">+ New game</button><input type="file" id="imp" class="hide" accept=".md,.markdown,.txt,text/markdown,text/plain" onchange="pickFile(this)"></div></header>'+(note?'<div class="card note">'+esc(note)+'</div>':"")+'';
 if(creating)h+='<form class="card newform" onsubmit="return create(event)"><div class="row"><input type="text" id="nt" placeholder="Title — e.g. Dad vs. Jasper, Summer 2026" autofocus><button class="btn">Begin</button><button type="button" class="btn ghost" onclick="cancelNew()">Cancel</button></div><div class="row"><span class="meta">I am playing</span><div class="seg"><button type="button" class="'+(newSide==="w"?"on":"")+'" onclick="setSide(\'w\')">White</button><button type="button" class="'+(newSide==="b"?"on":"")+'" onclick="setSide(\'b\')">Black</button></div></div></form>';
 if(!games.length&&!creating)h+='<div class="empty"><b>\u265E\uFE0E</b><div style="font-size:20px;color:var(--ink)">No games in the post</div><div>Start a game, then enter each letter’s move as it arrives.</div></div>';
 else{h+='<div class="grid">';games.slice().sort(function(a,b){return b.lastUpdated<a.lastUpdated?-1:1}).forEach(function(g){
  var c=new Chess();if(g.pgn)c.load_pgn(g.pgn);var n=c.history().length,t=c.turn()==="w"?"White":"Black";
  h+='<div class="card game" onclick="open_(\''+g.id+'\')">'+mini(c.fen())+'<div><h3>'+esc(g.title)+'</h3><div class="meta"><span class="tag">You: '+(mySide(g)==="black"?"Black":"White")+'</span><span class="tag">'+n+' ply</span><span class="tag">'+(c.game_over()?"finished":t+" to move")+'</span><br>'+(n?'Last move '+fmt(g.lastUpdated):'No moves yet')+'</div></div>'+
  '<button class="btn ghost sm del '+(confirmDel===g.id?"danger":"")+'" onclick="event.stopPropagation();del(\''+g.id+'\')">'+(confirmDel===g.id?"Confirm delete":"Delete")+'</button></div>'});h+='</div>'}
 document.getElementById("app").innerHTML='<div class="wrap" style="padding:0">'+h+'</div>';note=""}
function create(e){e.preventDefault();var t=document.getElementById("nt").value.trim();if(!t)return false;
 var g={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:t,pgn:"",side:newSide==="w"?"white":"black",orientation:newSide==="w"?"white":"black",lastUpdated:new Date().toISOString()};
 games.push(g);save();creating=false;open_(g.id);return false}
function del(id){if(confirmDel===id){games=games.filter(function(g){return g.id!==id});confirmDel=null;save()}else confirmDel=id;home()}
function open_(id){cur=games.filter(function(g){return g.id===id})[0];chess=new Chess();if(cur.pgn)chess.load_pgn(cur.pgn);
 flipped=cur.orientation==="black";sel=null;viewPly=null;game()}
function mySide(g){return g.side||g.orientation||"white"}
function moveCount(p){var c=new Chess();if(p)c.load_pgn(p);return c.history().length}
function persist(moved){cur.pgn=chess.pgn();if(moved)cur.lastUpdated=new Date().toISOString();cur.orientation=flipped?"black":"white";save()}
function game(){
 var h='<div class="top"><div style="display:flex;gap:12px;align-items:center"><button class="btn ghost sm" onclick="home()">← All games</button><h2 id="ti">'+esc(cur.title)+' <button class="link" title="Rename game" onclick="editTitle()">✎</button></h2></div><button class="btn ghost sm" title="Change which side you play" onclick="toggleSide()">You play '+(mySide(cur)==="black"?"Black":"White")+' ⇄</button></div><div class="play"><div><div class="frame"><div class="board" id="bd"></div></div><div class="status" id="st"></div><div class="tools"><button class="btn ghost sm" onclick="undo()">↶ Undo move</button><button class="btn ghost sm" onclick="flip()">⇅ Flip board</button><button class="btn ghost sm" id="cp" onclick="copyPgn()">Copy PGN</button></div></div>'+
 '<div class="side"><div class="card panel"><h4>Enter a move from a letter</h4><form class="entry" onsubmit="return submitMove(event)"><input type="text" id="mi" placeholder="e.g. Nf3, exd5, O-O" autocomplete="off" autocapitalize="off" spellcheck="false" oninput="clearErr()"><button class="btn">Submit</button></form><div class="err" id="er" role="alert"></div></div>'+
 '<div class="card panel"><div style="display:flex;justify-content:space-between"><h4>Game log</h4><button class="link" onclick="toggleLegend()">Notation guide</button></div><div class="log" id="lg"></div><div id="lgd"></div></div></div></div><div id="pm"></div>';
 document.getElementById("app").innerHTML=h;draw();document.getElementById("mi").focus()}
function draw(){
 var bd=document.getElementById("bd");if(!bd)return;
 var last=chess.history({verbose:true}).slice(-1)[0],moves=sel?chess.moves({square:sel,verbose:true}):[],mv={};
 moves.forEach(function(m){mv[m.to]=m});
 var chkSq=null;if(chess.in_check()){var t=chess.turn();for(var r=1;r<=8;r++)for(var f=0;f<8;f++){var q="abcdefgh"[f]+r,p=chess.get(q);if(p&&p.type==="k"&&p.color===t)chkSq=q}}
 var h="";
 for(var i=0;i<8;i++)for(var j=0;j<8;j++){
  var rank=flipped?i+1:8-i,file=flipped?7-j:j,sq="abcdefgh"[file]+rank,p=chess.get(sq),dark=(file+rank)%2===0;
  var cls="sq"+(dark?" d":"")+(last&&(last.from===sq||last.to===sq)?" last":"")+(sel===sq?" sel":"")+(mv[sq]?(p||mv[sq].flags.indexOf("e")>-1?" cap":" mv"):"")+(chkSq===sq?" chk":"");
  h+='<div class="'+cls+'" data-sq="'+sq+'" onclick="clickSq(\''+sq+'\')" ondragover="event.preventDefault()" ondrop="dropSq(event,\''+sq+'\')">'+
   (j===0?'<span class="co r">'+rank+'</span>':'')+(i===7?'<span class="co f">'+"abcdefgh"[file]+'</span>':'')+
   (p?'<span draggable="true" ondragstart="dragSq(event,\''+sq+'\')">'+glyph(p)+'</span>':'')+'</div>'}
 bd.innerHTML=h;
 var st=document.getElementById("st"),t=chess.turn(),nm=t==="w"?"White":"Black",s;
 if(chess.in_checkmate())s="Checkmate — "+(t==="w"?"Black":"White")+" wins";
 else if(chess.in_stalemate())s="Stalemate — a draw";else if(chess.in_draw())s="Drawn game";
 else s=nm+" to move"+(chess.in_check()?" — check":"")+" · "+((t==="w")===(mySide(cur)==="white")?"your move":"awaiting their letter");
 st.innerHTML='<span class="dot '+t+'"></span><span>'+s+'</span>';
 var hist=chess.history(),lg="";
 for(var k=0;k<hist.length;k+=2)lg+='<div class="n">'+(k/2+1)+'.</div><div class="m'+(k===hist.length-1?" cur":"")+'">'+san(hist[k])+'</div><div class="m'+(k+1===hist.length-1?" cur":"")+'">'+(hist[k+1]?san(hist[k+1]):"")+'</div>';
 var L=document.getElementById("lg");L.innerHTML=lg||"";
 if(!hist.length)L.innerHTML='<div class="hint" style="grid-column:1/-1">No moves yet — the first letter is still in the post.</div>';
 L.scrollTop=L.scrollHeight;
 document.getElementById("lgd").innerHTML=showLegend?'<div class="legend"><span><b>K</b>King</span><span><b>x</b>Capture</span><span><b>Q</b>Queen</span><span><b>+</b>Check</span><span><b>R</b>Rook</span><span><b>#</b>Checkmate</span><span><b>B</b>Bishop</span><span><b>O-O</b>Castle short</span><span><b>N</b>Knight</span><span><b>O-O-O</b>Castle long</span><span style="grid-column:1/-1;color:var(--mute);font-style:italic">Pawns are named by destination square alone.</span></div>':""}
function play(m){var r=chess.move(m);if(r){sel=null;persist(true);draw();return true}return false}
function tryMove(from,to){var ms=chess.moves({square:from,verbose:true}).filter(function(m){return m.to===to});
 if(!ms.length){sel=null;draw();return}
 if(ms[0].promotion){var pm=document.getElementById("pm"),c=chess.turn();
  pm.innerHTML='<div class="promo"><div>'+["q","r","b","n"].map(function(x){return '<button onclick="promote(\''+from+'\',\''+to+'\',\''+x+'\')"><span class="pc '+c+'" style="font-size:44px;cursor:pointer">'+GL[x]+'\uFE0E</span></button>'}).join("")+'</div></div>';return}
 play({from:from,to:to})}
function promote(f,t,p){document.getElementById("pm").innerHTML="";play({from:f,to:t,promotion:p})}
function clickSq(sq){var p=chess.get(sq);
 if(sel&&sel!==sq){var ok=chess.moves({square:sel,verbose:true}).some(function(m){return m.to===sq});if(ok){tryMove(sel,sq);return}}
 sel=(p&&p.color===chess.turn()&&sel!==sq)?sq:null;draw()}
function dragSq(e,sq){var p=chess.get(sq);if(!p||p.color!==chess.turn()){e.preventDefault();return}e.dataTransfer.setData("text/plain",sq);sel=sq}
function dropSq(e,sq){e.preventDefault();var f=e.dataTransfer.getData("text/plain");if(f&&f!==sq)tryMove(f,sq)}
function submitMove(e){e.preventDefault();var i=document.getElementById("mi"),v=i.value.trim().replace(/0/g,"O").replace(/^([a-h][1-8])\s*[-x]?\s*([a-h][1-8])$/,"$1$2");
 if(!v)return false;
 var ok=false;try{ok=!!chess.move(v)}catch(x){}
 if(!ok){var m=chess.moves({verbose:true}).filter(function(z){return z.from+z.to===v.toLowerCase()});if(m.length===1)ok=!!chess.move(m[0])}
 if(ok){sel=null;persist(true);draw();i.value="";document.getElementById("er").textContent=""}
 else document.getElementById("er").textContent="Invalid or ambiguous notation — check the letter, or add a file/rank (e.g. Nbd2).";
 i.focus();return false}
function undo(){if(chess.undo()){persist(false);sel=null;draw()}document.getElementById("mi").focus()}
function fullPgn(g){var c=new Chess();if(g.pgn)c.load_pgn(g.pgn);var s=mySide(g);
 c.header("Event",g.title.replace(/"/g,"'").replace(/[\r\n]+/g," "),"White",s==="white"?"Me":"Opponent","Black",s==="black"?"Me":"Opponent");return c.pgn()}
function copyText(t,b,label){
 function ok(){if(b){b.textContent="Copied ✓";setTimeout(function(){b.textContent=label},1500)}}
 function fb(){var a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy");ok()}catch(e){}a.remove()}
 try{navigator.clipboard.writeText(t).then(ok,fb)}catch(e){fb()}}
function copyPgn(){copyText(fullPgn(cur),document.getElementById("cp"),"Copy PGN")}
function toMarkdown(){
 var o="# Correspondence Chess Backup\n\nExported: "+new Date().toISOString()+"  \nGames: "+games.length+"\n\n";
 games.forEach(function(g){var c=new Chess();if(g.pgn)c.load_pgn(g.pgn);var n=c.history().length;
  var st=c.in_checkmate()?"Checkmate":c.in_draw()?"Draw":(c.turn()==="w"?"White":"Black")+" to move";
  o+="---\n\n## "+g.title.replace(/[\r\n]+/g," ")+"\n\n- ID: "+g.id+"\n- Playing as: "+(mySide(g)==="black"?"Black":"White")+"\n- Board view: "+(g.orientation==="black"?"black":"white")+"\n- Last move: "+(n?g.lastUpdated:"none")+"\n- Moves: "+n+" ply\n- Status: "+st+"\n- FEN: "+c.fen()+"\n\n```pgn\n"+fullPgn(g)+"\n```\n\n"});
 return o}
function exportMd(){var b=new Blob([toMarkdown()],{type:"text/markdown"}),a=document.createElement("a");
 a.href=URL.createObjectURL(b);a.download="correspondence-chess-backup-"+new Date().toISOString().slice(0,10)+".md";
 document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1500);note="Exported "+games.length+" game"+(games.length===1?"":"s")+" to a Markdown file.";home()}
function copyMd(){copyText(toMarkdown(),document.getElementById("cmd"),"Copy .md")}
function parseMd(t){var out=[];
 t.split(/^## /m).slice(1).forEach(function(b){
  var title=b.split("\n")[0].trim();if(!title)return;
  function f(k){var m=b.match(new RegExp("^- "+k+": (.*)$","m"));return m?m[1].trim():""}
  var pm=b.match(/```pgn\r?\n([\s\S]*?)```/),pgn=pm?pm[1].replace(/^\[.*\]\s*$/gm,"").trim():"",c=new Chess();
  if(pgn){if(!c.load_pgn(pgn))return;pgn=c.pgn()}
  var d=new Date(f("Last move"));
  out.push({id:f("ID")||Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:title,pgn:pgn,
   side:f("Playing as").toLowerCase()==="black"?"black":"white",orientation:f("Board view").toLowerCase()==="black"?"black":"white",
   lastUpdated:isNaN(d)?new Date().toISOString():d.toISOString()})});
 return out}
function importMd(t){var inc=parseMd(t);if(!inc.length){note="No games found in that file.";home();return}
 var a=0,u=0,s=0;
 inc.forEach(function(g){var ex=games.filter(function(x){return x.id===g.id})[0];
  if(!ex){games.push(g);a++}
  else{var x=moveCount(ex.pgn),y=moveCount(g.pgn);if(y>x||(y===x&&g.lastUpdated>ex.lastUpdated)){Object.assign(ex,g);u++}else s++}});
 save();note="Restored "+a+" new, updated "+u+", skipped "+s+" already up to date.";home()}
function pickFile(el){var f=el.files&&el.files[0];if(!f)return;
 var r=new FileReader();r.onload=function(){importMd(String(r.result))};r.onerror=function(){note="Couldn’t read that file.";home()};r.readAsText(f);el.value=""}
function editTitle(){var h=document.getElementById("ti");
 h.innerHTML='<input type="text" id="tin" value="'+esc(cur.title)+'" maxlength="80" onkeydown="if(event.key===\'Enter\')this.blur();if(event.key===\'Escape\'){this.dataset.x=1;this.blur()}" onblur="saveTitle(this)">';
 var i=document.getElementById("tin");i.focus();i.select()}
function saveTitle(i){var v=i.value.trim();if(!i.dataset.x&&v&&v!==cur.title){cur.title=v;save()}game()}
function toggleSide(){cur.side=mySide(cur)==="white"?"black":"white";flipped=cur.side==="black";cur.orientation=cur.side;save();game()}

function toggleNew(){creating=!creating;home()}
function cancelNew(){creating=false;home()}
function setSide(s){newSide=s;home()}
function flip(){flipped=!flipped;persist();draw()}
function toggleLegend(){showLegend=!showLegend;draw()}
function clearErr(){document.getElementById("er").textContent=""}
load();home();
if("serviceWorker" in navigator){import("virtual:pwa-register").then(function(m){m.registerSW({immediate:true})})}
Object.assign(window,{editTitle,saveTitle,toggleSide,exportMd,copyMd,pickFile,home,create,del,open_,game,draw,clickSq,dragSq,dropSq,submitMove,undo,copyPgn,promote,toggleNew,cancelNew,setSide,flip,toggleLegend,clearErr});
