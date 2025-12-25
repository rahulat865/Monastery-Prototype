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
  
  // Convert to base64 for localStorage storage (demo version)
  const reader = new FileReader();
  reader.onload = function(e) {
    const imageData = e.target.result;
    const preservationImages = JSON.parse(localStorage.getItem('preservationImages') || '[]');
    const newImage = {
      id: Date.now().toString(),
      imageData: imageData,
      imageType: imageType,
      location: location,
      structureComponent: structureComponent,
      filename: file.name,
      uploadedAt: new Date().toISOString()
    };
    preservationImages.push(newImage);
    localStorage.setItem('preservationImages', JSON.stringify(preservationImages));
    alert('Image uploaded successfully!');
    loadPreservationData();
    document.getElementById('uploadImageForm').reset();
  };
  reader.readAsDataURL(file);
}

async function fetchImagesByType(type) {
  // localStorage-based demo version
  try {
    const allImages = JSON.parse(localStorage.getItem('preservationImages') || '[]');
    return allImages.filter(img => img.imageType === type);
  } catch (e) { console.error(e); return []; }
}

function makeOption(val, text) { const o = document.createElement('option'); o.value = val; o.textContent = text; return o; }

async function loadPreservationData() {
  // populate baseline/current selects
  const baseline = await fetchImagesByType('baseline');
  const current = await fetchImagesByType('current');
  const sb = document.getElementById('selectBaseline');
  const sc = document.getElementById('selectCurrent');
  if (sb) { sb.innerHTML = '<option value="">Select baseline image...</option>'; }
  if (sc) { sc.innerHTML = '<option value="">Select current image...</option>'; }
  baseline.forEach(img => {
    if (sb) sb.appendChild(makeOption(img.id, `${img.location} • ${img.structureComponent} • ${img.filename || 'Image'}`));
  });
  current.forEach(img => {
    if (sc) sc.appendChild(makeOption(img.id, `${img.location} • ${img.structureComponent} • ${img.filename || 'Image'}`));
  });

  // Load stored images for display
  const allImages = JSON.parse(localStorage.getItem('preservationImages') || '[]');
  const imagesList = document.getElementById('preservationImagesList');
  if (imagesList) {
    imagesList.innerHTML = '';
    if (allImages.length === 0) {
      imagesList.innerHTML = '<p style="color: #666; padding: 20px;">No preservation images uploaded yet.</p>';
    } else {
      allImages.forEach(img => {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
          <img src="${img.imageData}" alt="${img.location}">
          <div class="card-content">
            <h4>${img.location}</h4>
            <div class="meta">${img.structureComponent} • ${img.imageType}</div>
            <p>Uploaded: ${new Date(img.uploadedAt).toLocaleDateString()}</p>
            <div class="actions">
              <button class="btn-delete" onclick="deletePreservationImage('${img.id}')">Delete</button>
            </div>
          </div>
        `;
        imagesList.appendChild(card);
      });
    }
  }

  // load latest comparisons from localStorage
  try {
    const comparisons = JSON.parse(localStorage.getItem('preservationComparisons') || '[]');
    const list = document.getElementById('comparisonsList');
    if (list) {
      list.innerHTML = '';
      if (comparisons.length === 0) {
        list.innerHTML = '<p style="color: #666; padding: 20px;">No comparisons yet. Upload baseline and current images to compare.</p>';
      } else {
        comparisons.forEach(c => {
          const d = document.createElement('div');
          d.style.borderBottom = '1px solid #eee'; d.style.padding = '8px 6px';
          const date = new Date(c.comparisonDate || c.createdAt || Date.now()).toLocaleString();
          d.innerHTML = `<strong>${c.location || ''} • ${c.structureComponent || ''}</strong><div style="font-size:0.9rem;color:#555">${date}</div><div>Severity: ${c.severityLevel || 'N/A'} • SSIM: ${c.ssimScore || 'N/A'}</div><div style="margin-top:6px"><button class="btn btn-primary" onclick='showComparison("${c.id}")'>View</button></div>`;
          list.appendChild(d);
        });
      }
    }
  } catch (e) { console.error(e); }
}

function deletePreservationImage(id) {
  if (!confirm('Are you sure you want to delete this image?')) return;
  const images = JSON.parse(localStorage.getItem('preservationImages') || '[]');
  const filtered = images.filter(img => img.id !== id);
  localStorage.setItem('preservationImages', JSON.stringify(filtered));
  loadPreservationData();
  alert('Image deleted.');
}

async function showComparison(id) {
  try {
    const comparisons = JSON.parse(localStorage.getItem('preservationComparisons') || '[]');
    const c = comparisons.find(comp => comp.id === id);
    if (!c) { alert('Comparison not found'); return; }
    
    const el = document.getElementById('comparisonResult');
    if (el) {
      el.style.display = 'block';
      el.innerHTML = `<h4>Comparison Result</h4>
        <div><strong>Location:</strong> ${c.location || ''}</div>
        <div><strong>Component:</strong> ${c.structureComponent || ''}</div>
        <div><strong>Severity:</strong> ${c.severityLevel || 'N/A'}</div>
        <div><strong>SSIM Score:</strong> ${c.ssimScore || 'N/A'}</div>
        <div><strong>Change Detected:</strong> ${c.changeDetected ? 'Yes' : 'No'}</div>
        <div style="margin-top:15px">
          <strong>Baseline Image:</strong><br>
          <img src="${c.baselineImageData}" style="max-width: 300px; margin-top: 10px; border: 1px solid #ddd;">
        </div>
        <div style="margin-top:15px">
          <strong>Current Image:</strong><br>
          <img src="${c.currentImageData}" style="max-width: 300px; margin-top: 10px; border: 1px solid #ddd;">
        </div>
        <pre style="white-space:pre-wrap;margin-top:15px;background:#f8f9fa;padding:10px;border-radius:4px">${c.analysis || 'Analysis data not available'}</pre>`;
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
    // Get images from localStorage
    const allImages = JSON.parse(localStorage.getItem('preservationImages') || '[]');
    const baselineImg = allImages.find(img => img.id === baselineId);
    const currentImg = allImages.find(img => img.id === currentId);
    
    if (!baselineImg || !currentImg) {
      alert('Images not found');
      return;
    }
    
    // Simple comparison (demo version - calculates basic similarity)
    // In production, this would use image processing libraries
    const comparison = {
      id: Date.now().toString(),
      baselineId: baselineId,
      currentId: currentId,
      baselineImageData: baselineImg.imageData,
      currentImageData: currentImg.imageData,
      location: location || baselineImg.location,
      structureComponent: structureComponent || baselineImg.structureComponent,
      ssimScore: (0.85 + Math.random() * 0.1).toFixed(3), // Demo score
      severityLevel: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
      changeDetected: Math.random() > 0.5,
      analysis: 'Demo comparison: Visual inspection shows structural integrity maintained. Regular monitoring recommended.',
      comparisonDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Save comparison
    const comparisons = JSON.parse(localStorage.getItem('preservationComparisons') || '[]');
    comparisons.unshift(comparison);
    localStorage.setItem('preservationComparisons', JSON.stringify(comparisons));
    
    alert('Comparison completed successfully!');
    showComparison(comparison.id);
    loadPreservationData();
  } catch (err) { 
    console.error(err); 
    alert('Compare error: ' + err.message); 
  }
}

// Make functions globally available
window.showTab = showTab;
window.deleteExperience = deleteExperience;
window.deletePhoto = deletePhoto;
window.deleteVideo = deleteVideo;
window.deleteFeedback = deleteFeedback;
window.logout = logout;
window.showComparison = showComparison;
window.deletePreservationImage = deletePreservationImage;
