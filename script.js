const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('side-menu');
const closeSide = document.getElementById('close-side');

hamburger.addEventListener('click', () => {
  sideMenu.style.right = '0';  // slide in
});

closeSide.addEventListener('click', () => {
  sideMenu.style.right = '-100%'; // slide out
});





// Monastery database with Wikipedia links
const monasteries = [
  { 
    name: "Rumtek Monastery", 
    location: "Gangtok, East Sikkim", 
    sect: "Kagyu", 
    founded: "16th century (rebuilt in 1960s)", 
    history: "Seat of the Karmapa Lama, also known as Dharma Chakra Centre. Largest monastery in Sikkim.", 
    wiki: "https://en.wikipedia.org/wiki/Rumtek_Monastery" 
  },
  { 
    name: "Pemayangtse Monastery", 
    location: "Pelling, West Sikkim", 
    sect: "Nyingma", 
    founded: "1705", 
    history: "One of the oldest monasteries, famous for its wooden structure Zangdok Palri.", 
    wiki: "https://en.wikipedia.org/wiki/Pemayangtse_Monastery" 
  },
  { 
    name: "Tashiding Monastery", 
    location: "Near Yuksom, West Sikkim", 
    sect: "Nyingma", 
    founded: "1641", 
    history: "Considered the holiest monastery in Sikkim, built by Ngadak Sempa Chempo.", 
    wiki: "https://en.wikipedia.org/wiki/Tashiding_Monastery" 
  },
  { 
    name: "Phodong Monastery", 
    location: "North Sikkim", 
    sect: "Kagyu", 
    founded: "1740", 
    history: "Known for its frescoes and annual festivals.", 
    wiki: "https://en.wikipedia.org/wiki/Phodong_Monastery" 
  },
  { 
    name: "Enchey Monastery", 
    location: "Gangtok, East Sikkim", 
    sect: "Nyingma", 
    founded: "1909", 
    history: "Associated with Lama Drupthob Karpo, a tantric master.", 
    wiki: "https://en.wikipedia.org/wiki/Enchey_Monastery" 
  },
  { 
    name: "Ralong Monastery", 
    location: "South Sikkim", 
    sect: "Kagyu", 
    founded: "18th century", 
    history: "Famous for the Kagyed Dance Festival and new monastery built in 1995.", 
    wiki: "https://en.wikipedia.org/wiki/Ralong_Monastery" 
  },
  { 
    name: "Lachung Monastery", 
    location: "Lachung, North Sikkim", 
    sect: "Nyingma", 
    founded: "1880", 
    history: "Built amidst beautiful mountains, known for mask dance festival.", 
    wiki: "https://en.wikipedia.org/wiki/Lachung_Monastery" 
  },
  { 
    name: "Lachen Monastery", 
    location: "Lachen, North Sikkim", 
    sect: "Nyingma", 
    founded: "1858", 
    history: "Known as Ngodrub Choling, it serves as spiritual center for Lachenpas.", 
    wiki: "https://en.wikipedia.org/wiki/Lachen_Monastery" 
  },
  { 
    name: "Dubdi Monastery (Yuksom Monastery)", 
    location: "Yuksom, West Sikkim", 
    sect: "Nyingma", 
    founded: "1701", 
    history: "First monastery established after Buddhism came to Sikkim.", 
    wiki: "https://en.wikipedia.org/wiki/Dubdi_Monastery" 
  },
  { 
    name: "Kartok Monastery", 
    location: "Yuksom, West Sikkim", 
    sect: "Nyingma", 
    founded: "17th century", 
    history: "Important monastery located near Kathok Lake.", 
    wiki: "https://en.wikipedia.org/wiki/Katok_Monastery" 
  },
  { 
    name: "Zong Dog Palri Fo-Brang Gompa", 
    location: "Kalimpong (near Sikkim, often associated with Buddhist circuit)", 
    sect: "Nyingma", 
    founded: "1976", 
    history: "Inaugurated by Dalai Lama, holds 108 volumes of Kangyur.", 
    wiki: "https://en.wikipedia.org/wiki/Zang_Dhok_Palri_Phari_Monastery" 
  },
  { 
    name: "Sanga Choeling Monastery", 
    location: "Pelling, West Sikkim", 
    sect: "Nyingma", 
    founded: "1697", 
    history: "One of the oldest monasteries in Sikkim, founded by Lama Lhatsun Chempo.", 
    wiki: "https://en.wikipedia.org/wiki/Sanga_Choling_Monastery" 
  },
  { 
    name: "Lingdum Monastery (Ranka Monastery)", 
    location: "Ranka, near Gangtok", 
    sect: "Kagyu", 
    founded: "1998", 
    history: "Known for its impressive Tibetan architecture and peaceful setting.", 
    wiki: "https://en.wikipedia.org/wiki/Lingdum_Monastery" 
  },
  { 
    name: "Bongtang Monastery", 
    location: "Near Gangtok, East Sikkim", 
    sect: "Nyingma", 
    founded: "20th century", 
    history: "A smaller monastery known for its calm environment.", 
    wiki: "https://en.wikipedia.org/wiki/Sikkim" 
  },
  { 
    name: "Phensang Monastery", 
    location: "North Sikkim", 
    sect: "Nyingma", 
    founded: "1721", 
    history: "Hosts annual festival before Losoong. Originally built by Lama Jigme Pawo.", 
    wiki: "https://en.wikipedia.org/wiki/Phensang_Monastery" 
  }
];

// DOM elements
const chatToggle = document.getElementById("chat-toggle");
const chatbox = document.getElementById("chatbox");
const closeBtn = document.getElementById("close-btn");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const modeMonasteryBtn = document.getElementById('mode-monastery');
const modeAiBtn = document.getElementById('mode-ai');
const aiTools = document.getElementById('ai-tools');
const aiFile = document.getElementById('ai-file');
const aiPreview = document.getElementById('ai-preview');
let selectedImageFile = null;

let currentMode = 'monastery'; // 'monastery' | 'ai'

// Toggle open/close
chatToggle.addEventListener("click", () => {
  chatbox.style.display = "flex";
  chatToggle.style.display = "none";
});

closeBtn.addEventListener("click", () => {
  chatbox.style.display = "none";
  chatToggle.style.display = "block";
  speechSynthesis.cancel(); // Stop voice
});

// Send message on button or Enter
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Main sendMessage function
async function sendMessage() {
  const text = userInput.value.trim();
  const hasImage = !!selectedImageFile;
  if (!text && !hasImage) return;

  appendMessage("user", text || (hasImage ? '🖼️ Image uploaded for analysis' : ''));

  const query = text.toLowerCase();
  let reply = "❌ Sorry, I don’t have details on that monastery.";
  let wiki = null;
  let handledLocally = false;

  if (currentMode === 'ai') {
    // If an image is selected, analyze image with structured prompt
    if (hasImage) {
      const structuredPrompt = `Look at this image and:\n          1. Identify the place or object (name if possible).\n          2. Provide its location (city, country).\n          3. Give a short history (when it was built, by whom).\n          4. List any important cultural or religious events related to it.\n          5. Explain its overall significance.`;
      const prompt = text ? `${text}\n\n${structuredPrompt}` : structuredPrompt;
      // Immediately clear UI selection before sending
      const fileToSend = selectedImageFile;
      selectedImageFile = null;
      aiFile.value = '';
      aiPreview.style.display = 'none';
      aiTools.style.display = 'none';
      await sendImageToGemini(prompt, fileToSend);
    } else {
      // Text-only to Gemini
      await sendToGemini(text);
    }
    userInput.value = "";
    return;
  }

  // Handle greetings
  const greetings = ["hi", "hello", "hey", "good morning", "good evening", "good night"];
  if (greetings.some(g => query.includes(g))) {
    reply = "🙏 Namaste! How may I help you today? You can ask me about Sikkim monasteries.";
    handledLocally = true;
  } 
  // Handle count of monasteries
  else if (query.includes("all monastery")||query.includes("how many monasteries")||query.includes("how many monasteries") || query.includes("number of monasteries")||query.includes("how many monastery")||query.includes("number of monastery")) {
    reply = `📊 There are ${monasteries.length} famous monasteries in Sikkim:\n\n` + 
      monasteries.map(m => `- ${m.name}`).join("\n");
    handledLocally = true;
  }
  // Handle list request
  else if (query.includes("list") || query.includes("all monasteries")) {
    reply = "📜 Here are the monasteries I know about:\n" + 
      monasteries.map(m => `- ${m.name} (${m.location})`).join("\n");
    handledLocally = true;
  }
  // Search by name or location
  else {
    const found = monasteries.find(m => 
      m.name.toLowerCase().includes(query) || 
      m.location.toLowerCase().includes(query)
    );

    if (found) {
      reply = `${found.name}\n📍 Location: ${found.location}\n🕉 Sect: ${found.sect}\n📅 Founded: ${found.founded}\n📖 History: ${found.history}`;
      wiki = found.wiki;
      handledLocally = true;
    }
  }

  if (handledLocally) {
    setTimeout(() => {
      appendMessage("bot", reply, wiki);
      if (wiki) speak(reply); // Speak only monastery details
    }, 300);
  } else {
    // Fallback to Gemini for general questions
    await sendToGemini(text);
  }

  userInput.value = "";
}

// ===== Mode switching =====
modeMonasteryBtn.addEventListener('click', ()=>{
  currentMode = 'monastery';
  modeMonasteryBtn.classList.add('active');
  modeAiBtn.classList.remove('active');
  aiTools.style.display = 'none';
});
modeAiBtn.addEventListener('click', ()=>{
  currentMode = 'ai';
  modeAiBtn.classList.add('active');
  modeMonasteryBtn.classList.remove('active');
  aiTools.style.display = 'block';
});

// ===== File preview =====
aiFile.addEventListener('change', (e)=>{
  const file = e.target.files?.[0];
  if(!file) { selectedImageFile = null; aiPreview.style.display='none'; return; }
  selectedImageFile = file;
  const reader = new FileReader();
  reader.onload = ev => { aiPreview.src = ev.target.result; aiPreview.style.display = 'block'; };
  reader.readAsDataURL(file);
});

// (Analyze button removed) Image analysis is triggered via Send in AI mode when an image is selected

// ===== Helpers =====
async function sendToGemini(text){
  const loader = showLoader();
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDQtm6xkzCSy1B5JwIJISQ2F5wN25JwRX4',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
      }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    let botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No response from AI.';
    botReply = formatAiText(botReply);
    removeLoader(loader);
    appendMessage("bot", botReply);
  } catch (err) {
    console.error(err);
    removeLoader(loader);
    appendMessage("bot", "❌ Something went wrong while contacting AI.");
  }
}

async function sendImageToGemini(prompt, file){
  const loader = showLoader();
  const base64 = await resizeImage(file);
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBP_sYkJVnholXFxCRD-PklQkeXrtYy46w',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      contents:[{ parts:[ { text: prompt }, { inlineData:{ data: base64.split(',')[1], mimeType: file.type } } ] }]
    })
  });
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No response from AI.';
  text = formatAiText(text);
  removeLoader(loader);
  appendMessage('bot', text);
}

function formatAiText(raw){
  if(!raw) return raw;

  // Normalize line endings and split
  const lines = raw.replace(/\r\n?/g,'\n').split('\n').map(l=>l.trim()).filter(Boolean);

  const capture = {
    nameOrObject: '',
    location: '',
    history: '',
    events: '',
    significance: '',
    others: []
  };

  const labelPatterns = [
    { key:'nameOrObject', patterns:[/^(?:[-*]\s*)?\*\*?\s*place\s+or\s+object\s*:?\*\*?\s*/i, /^(?:[-*]\s*)?\*\*?\s*name\s*:?\*\*?\s*/i, /^\s*place\s+or\s+object\s*:\s*/i, /^\s*name\s*:\s*/i] },
    { key:'location', patterns:[/^(?:[-*]\s*)?\*\*?\s*location\s*:?\*\*?\s*/i] },
    { key:'history', patterns:[/^(?:[-*]\s*)?\*\*?\s*history\s*:?\*\*?\s*/i, /^(?:[-*]\s*)?\*\*?\s*short\s+history\s*:?\*\*?\s*/i] },
    { key:'events', patterns:[/^(?:[-*]\s*)?\*\*?\s*(?:events|cultural\s+events|religious\s+events)\s*:?\*\*?\s*/i] },
    { key:'significance', patterns:[/^(?:[-*]\s*)?\*\*?\s*significance\s*:?\*\*?\s*/i, /^(?:[-*]\s*)?\*\*?\s*overall\s+significance\s*:?\*\*?\s*/i] }
  ];

  function assignByLabel(line){
    for(const {key, patterns} of labelPatterns){
      for(const p of patterns){
        if(p.test(line)){
          const value = line.replace(p, '').trim();
          if(!capture[key]) capture[key] = value;
          return true;
        }
      }
    }
    return false;
  }

  // First pass: extract labeled lines
  for(const line of lines){
    if(assignByLabel(line)) continue;
    capture.others.push(line);
  }

  // Build normalized output
  const out = [];
  if(capture.nameOrObject) out.push(capture.nameOrObject);
  if(capture.location) out.push(`Location - ${capture.location}`);
  if(capture.history) out.push(`History - ${capture.history}`);
  if(capture.events) out.push(`Events - ${capture.events}`);
  if(capture.significance) out.push(`Significance - ${capture.significance}`);

  // If nothing parsed, fallback to raw with minimal tweaks
  if(out.length === 0){
    let fallback = raw
      .replace(/\*\*Location:\*\*/g, 'Location -')
      .replace(/\bLocation:\s*/gi, 'Location - ')
      .replace(/^[-*]\s*\*\*Place or Object:\*\*\s*/gmi, '')
      .replace(/^\s*\*\*Place or Object:\*\*\s*/gmi, '')
      .replace(/^\s*Place or Object:\s*/gmi, '')
      // convert leading bullets to dash
      .replace(/^(\s*)[\*•]\s+/gmi, '$1- ')
      // remove remaining asterisks (bold markers etc.)
      .replace(/\*/g, '');
    return fallback;
  }

  // Append any remaining other lines that were not captured, excluding duplicates
  const existing = new Set(out.map(s=>s.toLowerCase()));
  for(const line of capture.others){
    const norm = line.toLowerCase();
    if(!existing.has(norm)) out.push(line);
  }

  // Normalize bullets: convert any leading * to - and strip remaining *
  const normalized = out.map(line => line
    .replace(/^(\s*)[\*•]\s+/, '$1- ')
    .replace(/\*/g, '')
  );

  return normalized.join('\n');
}

function resizeImage(file, maxWidth = 600, maxHeight = 600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL(file.type, 0.8));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Append message
function appendMessage(sender, text, wiki = null) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = text;

  if (wiki && sender === "bot") {
    const link = document.createElement("a");
    link.href = wiki;
    link.target = "_blank";
    link.className = "wiki-link";
    link.innerText = "🔗 Read more on Wikipedia";
    div.appendChild(document.createElement("br"));
    div.appendChild(link);
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Loader helpers
function showLoader(){
  const div = document.createElement('div');
  div.className = 'message bot loading';
  div.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}
function removeLoader(loader){ if(loader && loader.parentNode){ loader.parentNode.removeChild(loader); } }

// Text-to-Speech
function speak(text) {
  speechSynthesis.cancel(); 
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN"; 
  speechSynthesis.speak(utterance);
}


// map section
let map;
const monasteriesmap = [
  { 
    name: "Rumtek Monastery", lat: 27.305827, lng: 88.53637,
    img: "./img/RumtekMonastery.jpeg",
    details: "The largest monastery in Sikkim, seat of the Karmapa Lama."
  },
  { 
    name: "Pemayangtse Monastery", lat: 27.305, lng: 88.252,
    img: "./img/PemayangtseMonastery.jpeg",
    details: "One of the oldest monasteries, founded in 1705, near Pelling."
  },
  { 
    name: "Tashiding Monastery", lat: 27.3089, lng: 88.2979,
    img: "./img/TashidingMonastery.jpeg",
    details: "Considered the holiest monastery in Sikkim, built in 1641."
  },
  { 
    name: "Enchey Monastery", lat: 27.3359, lng:  88.6192,
    img: "./img/EncheyMonastery.jpeg",
    details: "Located near Gangtok, famous for its religious festivals."
  },
  { 
    name: "Phodong Monastery", lat:  27.416786, lng: 88.582944,
    img: "./img/PhodongMonastery.jpg",
    details: "Built in the 18th century, known for annual mask dance festivals."
  },
  { 
    name: "Ralong Monastery", lat: 27.325734, lng: 27.325734,
    img: "./img/RalongMonastery.jpeg",
    details: "A Kagyu sect monastery, known for its grand architecture."
  },
  { 
    name: "Labrang Monastery", lat: 27.418881, lng: 88.581438,
    img: "./img/LabrangMonastery.jpg",
    details: "Small but historic monastery near Phodong."
  },
  { 
    name: "Dubdi Monastery", lat: 27.366206, lng: 88.230086,
    img: "./img/DubdiMonastery.jpeg",
    details: "Built in 1701, the oldest monastery in Sikkim, near Yuksom."
  },
  { 
    name: "Kartok Monastery", lat: 27.33, lng: 88.62,
    img: "./img/KartokMonastery.jpg",
    details: "Situated at Yuksom, dedicated to Kartok Lama."
  },
  //
  { 
    name: "Rinchenpong Monastery", lat:  27.2345, lng: 88.2721,
    img: "./img/rinchenpongmonastery.jpg",
    details: "Known for its beautiful sunset views over Kanchenjunga."
  },
  { 
    name: "Zong Dog Palri Fo-Brang Monastery", lat: 16.7000, lng:74.2333,
    img: "./img/ZangDhokPalriPhodang.jpg",
    details: "Also known as 'Palace Monastery', located near Pemayangtse."
  },
  { 
    name: "Sanga Choeling Monastery", lat: 27.29, lng: 88.23,
    img: "./img/SangaChoelingMonastery.jpg",
    details: "Founded in 1697, accessible by a steep trek from Pelling."
  },
  {
   name: "Bongtang Monastery","lat": 27.3690385,"lng": 88.6132007,
   img: "./img/BongtangMonastery.jpg",
   details: "Also known as Gonjang Monastery, it was established in 1981. It follows the Nyingma school of Tibetan Buddhism and is located near Tashi Viewpoint in Gangtok."
  },
  { 
    name: "Lingdum (Ranka) Monastery", lat: 27.3347, lng: 88.6416,
    img: "./img/Lingdum(Ranka)Monastery.jpg",
    details: "A relatively new but very large monastery near Gangtok."
  },
  { 
    name: "Gonjang Monastery", lat: 27.36908, lng: 88.613314,
    img: "./img/GonjangMonastery.jpeg",
    details: "Located near Tashi View Point, built in 1981."
  }
];function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 27.5, lng: 88.5 },
    zoom: 8
  });

  monasteriesmap.forEach((monastery) => {
    const marker = new google.maps.Marker({
      position: { lat: monastery.lat, lng: monastery.lng },
      map: map,
      title: monastery.name
    });

    marker.addListener("click", () => {
      showMonasteryDetails(monastery);
      map.setCenter({ lat: monastery.lat, lng: monastery.lng });
      map.setZoom(11);
    });
  });

  setupSidebar();

  // Default: Show Rumtek Monastery
  const defaultMonastery = monasteriesmap.find(m => m.name === "Rumtek Monastery");
  if (defaultMonastery) {
    showMonasteryDetails(defaultMonastery);
    map.setCenter({ lat: defaultMonastery.lat, lng: defaultMonastery.lng });
    map.setZoom(11);
  }
}

// ===== Setup Sidebar List =====
function setupSidebar() {
  const list = document.getElementById("monastery-list");
  if (!list) return;

  monasteriesmap.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = m.name;
    li.style.cursor = "pointer";
    li.style.padding = "5px 0";

    li.addEventListener("click", () => {
      map.setCenter({ lat: m.lat, lng: m.lng });
      map.setZoom(11);
      showMonasteryDetails(m);
    });

    list.appendChild(li);
  });
}

// ===== Show Monastery Details =====
function showMonasteryDetails(monastery) {
  const container = document.getElementById("monastery-details");
  if (!container) return;

  // Update Image
  const img = container.querySelector("img");
  if (img) img.src = monastery.img || "images/default.jpg";

  // Update Name/Title
  const title = container.querySelector("h4");
  if (title) title.innerText = monastery.name;

  // Update Description
  const desc = container.querySelector(".monastery-desc");
  if (desc) desc.innerText = monastery.details;
}

// ===== Authentication: login/logout handling (localStorage-based for demo) =====
// For hackathon demo - uses localStorage instead of backend API
// Version: 2.0 - No backend required

console.log('Authentication module loaded (localStorage-based)');

// Initialize demo users if not exists
function initializeDemoUsers() {
  if (!localStorage.getItem('demo_users')) {
    const demoUsers = [
      { email: 'admin@monastery.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
      { email: 'user@monastery.com', password: 'user123', name: 'Demo User', role: 'Student' }
    ];
    localStorage.setItem('demo_users', JSON.stringify(demoUsers));
    console.log('Demo users initialized');
  }
}

async function loginRequest(email, password) {
  try {
    console.log('Login attempt for:', email);
    // Initialize demo users
    initializeDemoUsers();
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      alert('Invalid email or password. Try:\nAdmin: admin@monastery.com / admin123\nUser: user@monastery.com / user123');
      return null;
    }
    
    // Create token (simple demo token)
    const token = btoa(JSON.stringify({ email: user.email, role: user.role, timestamp: Date.now() }));
    
    // Store token and user
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ email: user.email, name: user.name, role: user.role }));
    
    console.log('Login successful for:', user.email);
    return { token, user: { email: user.email, name: user.name, role: user.role } };
  } catch (err) {
    console.error('Login error', err);
    alert('Login failed: ' + err.message);
    return null;
  }
}

function handleLoginResponse(data) {
  if (!data) return;
  const role = data.user?.role || '';
  if (role.toLowerCase() === 'admin') {
    window.location.href = 'admin-dashboard.html';
    return;
  }
  // default to user dashboard
  window.location.href = 'user-dashboard.html';
}

// Attach handlers if forms exist on the page
const adminForm = document.getElementById('admin-login-form');
if (adminForm) {
  adminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    if (!email || !password) { alert('Enter email and password'); return; }
    const data = await loginRequest(email, password);
    handleLoginResponse(data);
  });
}

const userForm = document.getElementById('user-login-form');
if (userForm) {
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    if (!email || !password) { alert('Enter email and password'); return; }
    const data = await loginRequest(email, password);
    handleLoginResponse(data);
  });
}

// ===== Signup handling (localStorage-based for demo) =====
async function signupRequest(name, email, password, role='Student'){
  try{
    // Initialize demo users
    initializeDemoUsers();
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('demo_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      alert('User with this email already exists. Please login instead.');
      return null;
    }
    
    // Add new user
    const newUser = { email, password, name, role };
    users.push(newUser);
    localStorage.setItem('demo_users', JSON.stringify(users));
    
    alert('Account created successfully! You will be logged in now.');
    return { user: newUser };
  }catch(err){
    console.error('Signup error', err);
    alert('Signup failed. Please try again.');
    return null;
  }
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    if (!name || !email || !password) { alert('Fill all fields'); return; }
    const created = await signupRequest(name, email, password, role);
    if (created) {
      // After successful signup, auto-login
      const data = await loginRequest(email, password);
      handleLoginResponse(data);
    }
  });
}

// Logout button (on admin panel in login.html or on dashboards if added)
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // clear cookie by redirecting to login (server may set httpOnly cookie)
    window.location.href = 'login.html';
  });
}

// On dashboard pages you can use localStorage.getItem('user') to check role and token


