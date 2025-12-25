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
// Wire preservation handlers after DOM ready
document.addEventListener('DOMContentLoaded', ()=>{
  const uploadForm = document.getElementById('uploadImageForm');
  if (uploadForm) uploadForm.addEventListener('submit', uploadImageFromForm);
  const refreshBtn = document.getElementById('refreshImagesBtn'); if (refreshBtn) refreshBtn.addEventListener('click', loadPreservationData);
  const runBtn = document.getElementById('runCompareBtn'); if (runBtn) runBtn.addEventListener('click', runComparison);
  // If a tab hash is present (e.g. #preservation), open that tab
  try{
    const h = window.location.hash;
    if(h){ const tab = h.replace('#',''); if(document.getElementById(tab)) showTab(tab); }
  }catch(e){/* ignore */}
  loadPreservationData();
});
// Listen for hash changes (when user clicks a link to the same page with a hash)
function openTabFromHash(){
  try{
    const h = window.location.hash;
    if(h){ const tab = h.replace('#',''); if(document.getElementById(tab)) showTab(tab); }
  }catch(e){/* ignore */}
}
window.addEventListener('hashchange', openTabFromHash);

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

// --- Preservation integration helpers ---
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function uploadImageFromForm(e) {
  e.preventDefault();
  const fileEl = document.getElementById('imageFile');
  const imageType = document.getElementById('imageType').value;
  const location = document.getElementById('locationInput').value.trim();
  const structureComponent = document.getElementById('componentInput').value.trim();
  if (!fileEl.files.length) { alert('Select a file'); return; }
  const file = fileEl.files[0];
  const fd = new FormData();
  fd.append('image', file);
  fd.append('imageType', imageType);
  fd.append('location', location);
  fd.append('structureComponent', structureComponent);

  try {
    const res = await fetch('/api/images/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Upload failed');
    alert('Image uploaded');
    loadPreservationData();
    document.getElementById('uploadImageForm').reset();
  } catch (err) {
    console.error(err);
    alert('Upload error: ' + err.message);
  }
}

async function fetchImagesByType(type) {
  try {
    const r = await fetch(`/api/images/type/${encodeURIComponent(type)}`);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Failed');
    return j.data || [];
  } catch (e) { console.error(e); return []; }
}

function makeOption(val, text) { const o = document.createElement('option'); o.value = val; o.textContent = text; return o; }

async function loadPreservationData() {
  // populate baseline/current selects
  const baseline = await fetchImagesByType('baseline');
  const current = await fetchImagesByType('current');
  const sb = document.getElementById('selectBaseline');
  const sc = document.getElementById('selectCurrent');
  sb.innerHTML = ''; sc.innerHTML = '';
  baseline.forEach(img => sb.appendChild(makeOption(img._id, `${img.location} • ${img.structureComponent} • ${img.filename}`)));
  current.forEach(img => sc.appendChild(makeOption(img._id, `${img.location} • ${img.structureComponent} • ${img.filename}`)));

  // load latest comparisons
  try {
    const r = await fetch('/api/comparisons');
    const j = await r.json();
    const list = document.getElementById('comparisonsList'); list.innerHTML = '';
    if (j && j.data) {
      j.data.forEach(c => {
        const d = document.createElement('div');
        d.style.borderBottom = '1px solid #eee'; d.style.padding = '8px 6px';
        const date = new Date(c.comparisonDate || c.createdAt || Date.now()).toLocaleString();
        d.innerHTML = `<strong>${c.location || ''} • ${c.structureComponent || ''}</strong><div style="font-size:0.9rem;color:#555">${date}</div><div>Severity: ${c.severityLevel} • SSIM: ${c.ssimScore}</div><div style="margin-top:6px"><button class="btn" onclick='showComparison("${c._id}")'>View</button></div>`;
        list.appendChild(d);
      });
    }
  } catch (e) { console.error(e); }
}

async function showComparison(id) {
  try {
    const r = await fetch(`/api/comparisons/${id}`);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Failed');
    const c = j.data;
    const el = document.getElementById('comparisonResult');
    el.style.display = 'block';
    el.innerHTML = `<h4>Comparison Result</h4>
      <div><strong>Location:</strong> ${c.location || ''}</div>
      <div><strong>Component:</strong> ${c.structureComponent || ''}</div>
      <div><strong>Severity:</strong> ${c.severityLevel}</div>
      <div><strong>SSIM:</strong> ${c.ssimScore}</div>
      <div><strong>Change Detected:</strong> ${c.analysis?.changeDetected}</div>
      <div style="margin-top:8px"><button id="downloadDiffBtn" class="btn">Download/Preview Diff Image</button></div>
      <pre style="white-space:pre-wrap;margin-top:8px">${c.analysis?.message || ''}\nRecommendations: ${c.analysis?.recommendations || ''}</pre>`;
    const diffMetaId = c.differenceImage?.metadataId || (c.differenceImage && c.differenceImage.metadataId);
    const btn = document.getElementById('downloadDiffBtn');
    if (!diffMetaId) { btn.style.display='none'; } else {
      btn.onclick = async ()=>{
        try{
          const resp = await fetch(`/api/images/${diffMetaId}`);
          if(!resp.ok) throw new Error('No image');
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const w = window.open('');
          if(w){ w.document.write(`<img src="${url}" style="max-width:100%">`); }
        }catch(err){ alert('Failed to fetch diff image'); console.error(err); }
      };
    }
  } catch (e) { console.error(e); alert('Failed to load comparison'); }
}

async function runComparison() {
  const baselineId = document.getElementById('selectBaseline').value;
  const currentId = document.getElementById('selectCurrent').value;
  const location = document.getElementById('compareLocation').value.trim();
  const structureComponent = document.getElementById('compareComponent').value.trim();
  if (!baselineId || !currentId) { alert('Select both baseline and current images'); return; }
  try {
    const res = await fetch('/api/comparisons/compare', {
      method: 'POST',
      headers: Object.assign({'Content-Type':'application/json'}, getAuthHeaders()),
      body: JSON.stringify({ baselineId, currentId, location, structureComponent })
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || j.message || 'Compare failed');
    alert('Comparison completed');
    showComparison(j.data._id);
    loadPreservationData();
  } catch (err) { console.error(err); alert('Compare error: ' + err.message); }
}

// Make functions globally available
window.showTab = showTab;
window.deleteExperience = deleteExperience;
window.deletePhoto = deletePhoto;
window.deleteVideo = deleteVideo;
window.deleteFeedback = deleteFeedback;
window.logout = logout;
