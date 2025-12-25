// Admin dashboard Firebase integration removed.
// This file now provides simple localStorage-powered admin helpers.

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const el = document.getElementById(tabName); if(el) el.classList.add('active');
}

function setupEventForm(){
  const form = document.getElementById('eventForm'); if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    if(!title||!date){ alert('Title and date required'); return; }
    const events = JSON.parse(localStorage.getItem('events')||'[]');
    events.unshift({ title, description, date, imageUrl: null });
    localStorage.setItem('events', JSON.stringify(events));
    form.reset(); alert('Event saved locally');
    showTab('experiences');
  });
}

function renderCounts(){
  const experiences = JSON.parse(localStorage.getItem('userExperiences')||'[]');
  const photos = JSON.parse(localStorage.getItem('userPhotos')||'[]');
  const videos = JSON.parse(localStorage.getItem('userVideos')||'[]');
  const feedback = JSON.parse(localStorage.getItem('userFeedback')||'[]');
  const te = document.getElementById('totalExperiences'); if(te) te.textContent = experiences.length;
  const tp = document.getElementById('totalPhotos'); if(tp) tp.textContent = photos.length;
  const tv = document.getElementById('totalVideos'); if(tv) tv.textContent = videos.length;
  const tf = document.getElementById('totalFeedback'); if(tf) tf.textContent = feedback.length;
}

function loadAllContent(){
  renderCounts();
  const expContainer = document.getElementById('allExperiencesList'); if(expContainer){ expContainer.innerHTML = ''; const exps=JSON.parse(localStorage.getItem('userExperiences')||'[]'); exps.forEach(d=>{ const card=document.createElement('div'); card.className='content-card'; card.innerHTML=`<div class="card-content"><h4>${d.title}</h4><p>${d.description}</p></div>`; expContainer.appendChild(card); }); }
}

document.addEventListener('DOMContentLoaded', ()=>{ setupEventForm(); loadAllContent(); });

// Create admin photo card
function createAdminPhotoCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <img src="${data.imageData}" alt="${data.title}">
    <div class="card-content">
      <div class="user-info">
        <strong>User:</strong> ${data.userEmail}<br>
        <strong>Date:</strong> ${date}
      </div>
      <h4>${data.title}</h4>
      <div class="meta">${data.monastery}</div>
      <p>${data.description}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deletePhoto('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Create admin video card
function createAdminVideoCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <video controls>
      <source src="${data.videoData}" type="${data.fileType}">
    </video>
    <div class="card-content">
      <div class="user-info">
        <strong>User:</strong> ${data.userEmail}<br>
        <strong>Date:</strong> ${date}
      </div>
      <h4>${data.title}</h4>
      <div class="meta">${data.monastery}</div>
      <p>${data.description}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deleteVideo('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Create admin feedback card
function createAdminFeedbackCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <div class="card-content">
      <div class="user-info">
        <strong>User:</strong> ${data.userEmail}<br>
        <strong>Date:</strong> ${date}
      </div>
      <h4>${data.subject}</h4>
      <div class="meta">${data.type} • ${stars}</div>
      <p>${data.message}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deleteFeedback('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Delete functions
function deleteFromLocalArray(storageKey, idKey, id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  try {
    const arr = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const filtered = arr.filter(item => (item[idKey] || item.id) !== id);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    loadAllContent();
    alert('Deleted.');
  } catch (e) { console.error(e); alert('Failed to delete.'); }
}

function deleteExperience(id) { deleteFromLocalArray('userExperiences', 'id', id); }
function deletePhoto(id) { deleteFromLocalArray('userPhotos', 'id', id); }
function deleteVideo(id) { deleteFromLocalArray('userVideos', 'id', id); }
function deleteFeedback(id) { deleteFromLocalArray('userFeedback', 'id', id); }

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Make functions globally available
window.showTab = showTab;
window.deleteExperience = deleteExperience;
window.deletePhoto = deletePhoto;
window.deleteVideo = deleteVideo;
window.deleteFeedback = deleteFeedback;
window.logout = logout;
