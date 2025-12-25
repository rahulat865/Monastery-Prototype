// Firebase-powered events removed.
// Lightweight localStorage fallback for events and public content.

function setupLoginPage(){
  // No-op: login is handled by central `script.js` using authentication-api
}

function setupEventsList(){
  const list = document.getElementById('events-list');
  if(!list) return;
  const items = JSON.parse(localStorage.getItem('events')||'[]');
  list.innerHTML = '';
  items.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      ${ev.imageUrl?`<img src="${ev.imageUrl}" alt="${ev.title}">`:''}
      <div class="content">
        <h4>${ev.title||''}</h4>
        <div class="meta">${ev.date||''}</div>
        <p>${ev.description||''}</p>
      </div>`;
    list.appendChild(card);
  });
}

function setupUserContent(){
  // Load from localStorage
  loadPublicExperiences();
  loadPublicPhotos();
  loadPublicVideos();
}

function loadPublicExperiences(){
  const container = document.getElementById('userExperiences');
  if(!container) return;
  const items = JSON.parse(localStorage.getItem('userExperiences')||'[]');
  container.innerHTML = '';
  items.slice(0,6).forEach(data=>{
    const card = document.createElement('div');
    card.className='user-content-card';
    card.innerHTML = `
      <div class="content-header"><h4>${data.title}</h4><span class="rating">${'★'.repeat(data.rating)}${'☆'.repeat(5-data.rating)}</span></div>
      <div class="content-meta">${data.monastery} • ${data.userEmail}</div>
      <p>${data.description}</p>`;
    container.appendChild(card);
  });
}

function loadPublicPhotos(){
  const container = document.getElementById('userPhotos');
  if(!container) return;
  const items = JSON.parse(localStorage.getItem('userPhotos')||'[]');
  container.innerHTML = '';
  items.slice(0,6).forEach(data=>{
    const card = document.createElement('div');
    card.className='user-content-card';
    card.innerHTML = `<img src="${data.imageData}" alt="${data.title}"><div class="content-info"><h4>${data.title}</h4><div class="content-meta">${data.monastery} • ${data.userEmail}</div><p>${data.description}</p></div>`;
    container.appendChild(card);
  });
}

function loadPublicVideos(){
  const container = document.getElementById('userVideos');
  if(!container) return;
  const items = JSON.parse(localStorage.getItem('userVideos')||'[]');
  container.innerHTML = '';
  items.slice(0,4).forEach(data=>{
    const card = document.createElement('div');
    card.className='user-content-card';
    card.innerHTML = `<video controls><source src="${data.videoData}" type="${data.fileType}"></video><div class="content-info"><h4>${data.title}</h4><div class="content-meta">${data.monastery} • ${data.userEmail}</div><p>${data.description}</p></div>`;
    container.appendChild(card);
  });
}

// Auto-run on pages where this module is included
document.addEventListener('DOMContentLoaded', () => {
  setupEventsList();
  setupUserContent();
});


