const character=document.getElementById("character");
const messages=document.getElementById("messages");
const input=document.getElementById("input");
const composer=document.getElementById("composer");
const thought=document.getElementById("thought");
const voiceToggle=document.getElementById("voiceToggle");
const mic=document.getElementById("mic");

let voiceEnabled=true;
let speaking=false;
let state={mood:78,energy:64,trust:52,curiosity:86};

const replies=[
  "Хм... Я тебя слушаю. Только не думай, что мне интересно. Р-р-р...",
  "О-о-о... вот это уже интересно. Рассказывай. Я никуда не уйду.",
  "Я бы ответил серьёзно, но у меня сегодня настроение быть маленьким пушистым хаосом. Р-р-р.",
  "Ты опять пришёл ко мне? Хорошо. Мне... нравится, когда ты приходишь.",
  "М-м-м. Я запомню это. И да, не удивляйся, если потом припомню тебе это.",
  "Р-р-р... *довольно щурится* Ещё поговори со мной."
];

const actionReplies={
  pet:"Ммм... вот так. Не останавливайся. Р-р-р-р... ещё чуть-чуть.",
  play:"Играть?! Наконец-то! Только предупреждаю: я жульничаю. 😈",
  gift:"Мне подарок? Открой. Если там носки — я тебя осуждаю.",
  talk:"Я здесь. Давай поговорим. Только честно, ладно?"
};

function scrollChat(){messages.scrollTop=messages.scrollHeight}

function addMessage(text,who="fuggler"){
  const wrap=document.createElement("div");
  wrap.className=`msg ${who==="user"?"user-msg":"fuggler-msg"}`;
  if(who==="fuggler"){
    wrap.innerHTML=`<div class="msg-avatar">F</div><div><p>${escapeHtml(text)}</p><small>сейчас</small></div>`;
  }else{
    wrap.innerHTML=`<p>${escapeHtml(text)}</p><small>сейчас ✓</small>`;
  }
  messages.appendChild(wrap);
  scrollChat();
}

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function animateMood(type){
  character.classList.remove("talk","happy","angry","sleep","pet","play","listen","blink");
  void character.offsetWidth;
  character.classList.add(type);
  setTimeout(()=>character.classList.remove(type),1600);
}

function chooseVoice(){
  const voices=speechSynthesis.getVoices();
  const ru=voices.filter(v=>v.lang && v.lang.toLowerCase().startsWith("ru"));
  return ru.find(v=>/Google|Yandex|Microsoft|Milena|Irina|Pavel|Dmitri/i.test(v.name)) || ru[0] || voices[0];
}

function speak(text){
  if(!voiceEnabled || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text.replace(/р-р-р|ррр/gi,"р-р-р"));
  u.lang="ru-RU";
  const v=chooseVoice();
  if(v) u.voice=v;
  u.rate=.93;
  u.pitch=.96;
  u.volume=1;
  speaking=true;
  animateMood("talk");
  const mouth=document.querySelector(".mouth");
  const timer=setInterval(()=>{
    if(!speaking){clearInterval(timer);return}
    mouth.style.height=(18+Math.random()*22)+"%";
  },110);
  u.onend=()=>{speaking=false;clearInterval(timer);mouth.style.height="";animateMood("happy")};
  u.onerror=()=>{speaking=false;clearInterval(timer);mouth.style.height=""};
  speechSynthesis.speak(u);
}

speechSynthesis?.addEventListener?.("voiceschanged",()=>{});

function answer(text){
  const lower=text.toLowerCase();
  let r=replies[Math.floor(Math.random()*replies.length)];
  if(lower.includes("как дела")||lower.includes("как ты")) r="Дела? Я жив. Сижу, смотрю на тебя и делаю вид, что совсем не ждал. Р-р-р...";
  if(lower.includes("скучал")) r="Может быть. Совсем чуть-чуть. Ладно... да. Скучал.";
  if(lower.includes("мил")) r="Я знаю. Но продолжай, мне нравится это слышать. Р-р-р.";
  if(lower.includes("люблю")) r="Ой. Не говори такие вещи, а то я сейчас стану слишком довольным.";
  if(lower.includes("секрет")) r="Секрет? Подойди ближе... Я никому не скажу. Наверное.";
  if(lower.includes("злой")) r="Я не злой. Я просто очень выразительный. И немного голодный.";
  addMessage(r);
  state.trust=Math.min(100,state.trust+1);
  state.energy=Math.max(0,state.energy-1);
  speak(r);
}

composer.addEventListener("submit",e=>{
  e.preventDefault();
  const text=input.value.trim();
  if(!text)return;
  addMessage(text,"user");
  input.value="";
  animateMood("listen");
  setTimeout(()=>answer(text),550);
});

document.querySelectorAll(".quick button").forEach(b=>b.addEventListener("click",()=>{
  input.value=b.textContent;
  composer.requestSubmit();
}));

document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
  const type=b.dataset.action;
  animateMood(type==="pet"?"pet":type==="play"?"play":"happy");
  const text=actionReplies[type];
  addMessage(text);
  speak(text);
}));

voiceToggle.addEventListener("click",()=>{
  voiceEnabled=!voiceEnabled;
  voiceToggle.textContent=voiceEnabled?"🔊":"🔇";
  if(!voiceEnabled)speechSynthesis.cancel();
});

mic.addEventListener("click",()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    addMessage("На этом браузере голосовой ввод не поддерживается. Можно писать текстом.");
    return;
  }
  const rec=new SR();
  rec.lang="ru-RU";
  rec.interimResults=false;
  rec.onstart=()=>{animateMood("listen");mic.textContent="⏺"};
  rec.onend=()=>{mic.textContent="🎙"};
  rec.onresult=e=>{input.value=e.results[0][0].transcript;composer.requestSubmit()};
  rec.start();
});

document.getElementById("renameBtn").addEventListener("click",()=>{
  const name=prompt("Как назвать Фугглера?",localStorage.fugglerName||"Fuggler");
  if(name){localStorage.fugglerName=name;document.querySelector(".profile-mini b").textContent=name;document.querySelector(".chat-head b").childNodes[0].textContent=name+" ";}
});

setInterval(()=>{
  if(speaking)return;
  const idle=[
    "Мне скучно... Потерпи меня, а?",
    "Р-р-р... я всё ещё здесь.",
    "Ты там? Я вообще-то заметил.",
    "Хочу внимания. Это официальное заявление.",
    "Интересно, что ты сейчас делаешь..."
  ];
  const t=idle[Math.floor(Math.random()*idle.length)];
  thought.innerHTML=t;
  animateMood(Math.random()>.5?"happy":"blink");
},12000);

setInterval(()=>{
  if(document.hidden||speaking)return;
  animateMood("blink");
},4200);

if(localStorage.fugglerName){
  document.querySelector(".profile-mini b").textContent=localStorage.fugglerName;
  document.querySelector(".chat-head b").childNodes[0].textContent=localStorage.fugglerName+" ";
}
scrollChat();
