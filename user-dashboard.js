// user-dashboard.js - simplified localStorage-powered dashboard (Firebase removed)

function getCurrentUser(){
  try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch(e){return null;}
}

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if(!user) { window.location.href='login.html'; return; }
  document.getElementById('userEmail').textContent = user.email || user.name || '';
  setupDashboard();
  const logoutBtn = document.getElementById('logoutBtn'); if(logoutBtn) logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('user'); localStorage.removeItem('token'); window.location.href='login.html'; });
  document.querySelectorAll('.tab-btn').forEach(btn=>btn.addEventListener('click', function(){ showTab(this.getAttribute('data-tab')); }));
});

function setupDashboard() {
  console.log('Setting up dashboard...');
  
  // Test if forms exist
  console.log('Experience form:', document.getElementById('experienceForm'));
  console.log('Photo form:', document.getElementById('photoForm'));
  console.log('Video form:', document.getElementById('videoForm'));
  console.log('Feedback form:', document.getElementById('feedbackForm'));
  
  // Setup form submissions
  setupExperienceForm();
  setupPhotoForm();
  setupVideoForm();
  setupFeedbackForm();
  
  // Load user content
  loadUserContent();
  console.log('Dashboard setup complete');
}

// Tab switching
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  
  // Add active class to the correct button
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    if (btn.onclick && btn.onclick.toString().includes(`'${tabName}'`)) {
      btn.classList.add('active');
    }
  });
}

// Experience Form
function setupExperienceForm() {
  const form = document.getElementById('experienceForm');
  console.log('Setting up experience form:', form);
  if (!form) {
    console.log('Experience form not found!');
    return;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('expTitle').value.trim();
    const monastery = document.getElementById('expMonastery').value;
    const description = document.getElementById('expDescription').value.trim();
    const rating = parseInt(document.getElementById('expRating').value || '0');
    const user = getCurrentUser();
    const arr = JSON.parse(localStorage.getItem('userExperiences')||'[]');
    arr.unshift({ title, monastery, description, rating, userEmail: user?.email||'guest', createdAt: Date.now() });
    localStorage.setItem('userExperiences', JSON.stringify(arr));
    form.reset(); alert('Experience saved locally'); loadUserContent();
  });
}

// Photo Form
function setupPhotoForm() {
  const form = document.getElementById('photoForm');
  console.log('Setting up photo form:', form);
  if (!form) {
    console.log('Photo form not found!');
    return;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Photo form submitted');
    
    const title = document.getElementById('photoTitle').value.trim();
    const monastery = document.getElementById('photoMonastery').value;
    const file = document.getElementById('photoFile').files[0];
    const description = document.getElementById('photoDescription').value.trim();
    
    console.log('Form data:', { title, monastery, file, description });
    
    if (!title || !monastery) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (!file) {
      alert('Please select a photo to upload.');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size must be less than 5MB.');
      return;
    }
    
    try {
      const base64 = await fileToBase64(file);
      const user = getCurrentUser();
      const arr = JSON.parse(localStorage.getItem('userPhotos')||'[]');
      arr.unshift({ title, monastery, description, imageData: base64, fileName: file.name, fileType: file.type, userEmail: user?.email||'guest', createdAt: Date.now() });
      localStorage.setItem('userPhotos', JSON.stringify(arr));
      form.reset(); alert('Photo saved locally'); loadUserContent();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again. Error: ' + error.message);
    }
  });
}

// Video Form
function setupVideoForm() {
  const form = document.getElementById('videoForm');
  console.log('Setting up video form:', form);
  if (!form) {
    console.log('Video form not found!');
    return;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Video form submitted');
    
    const title = document.getElementById('videoTitle').value.trim();
    const monastery = document.getElementById('videoMonastery').value;
    const file = document.getElementById('videoFile').files[0];
    const description = document.getElementById('videoDescription').value.trim();
    
    console.log('Video form data:', { title, monastery, file, description });
    
    if (!title || !monastery) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (!file) {
      alert('Please select a video to upload.');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Video size must be less than 10MB.');
      return;
    }
    
    try {
      const base64 = await fileToBase64(file);
      const user = getCurrentUser();
      const arr = JSON.parse(localStorage.getItem('userVideos')||'[]');
      arr.unshift({ title, monastery, description, videoData: base64, fileName: file.name, fileType: file.type, userEmail: user?.email||'guest', createdAt: Date.now() });
      localStorage.setItem('userVideos', JSON.stringify(arr));
      form.reset(); alert('Video saved locally'); loadUserContent();
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video. Please try again. Error: ' + error.message);
    }
  });
}

// Feedback Form
function setupFeedbackForm() {
  const form = document.getElementById('feedbackForm');
  console.log('Setting up feedback form:', form);
  if (!form) {
    console.log('Feedback form not found!');
    return;
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Feedback form submitted');
    
    const type = document.getElementById('feedbackType').value;
    const subject = document.getElementById('feedbackSubject').value.trim();
    const message = document.getElementById('feedbackMessage').value.trim();
    const rating = document.getElementById('feedbackRating').value;
    
    console.log('Feedback form data:', { type, subject, message, rating });
    
    if (!type || !subject || !message || !rating) {
      alert('Please fill in all required fields.');
      return;
    }
    
    try {
      await addDoc(collection(db, 'userFeedback'), {
        type,
        subject,
        message,
        rating: parseInt(rating),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp()
      });
      
      form.reset();
      alert('Feedback submitted successfully!');
      loadUserContent();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again. Error: ' + error.message);
    }
  });
}

// Load user content
function loadUserContent() {
  if (!currentUser) return;
  
  loadExperiences();
  loadPhotos();
  loadVideos();
  loadFeedback();
}

// Load experiences
function loadExperiences() {
  const q = query(
    collection(db, 'userExperiences'),
    where('userId', '==', currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  onSnapshot(q, (snapshot) => {
    const container = document.getElementById('experiencesList');
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = createExperienceCard(doc.id, data);
      container.appendChild(card);
    });
  });
}

// Load photos
function loadPhotos() {
  const q = query(
    collection(db, 'userPhotos'),
    where('userId', '==', currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  onSnapshot(q, (snapshot) => {
    const container = document.getElementById('photosList');
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = createPhotoCard(doc.id, data);
      container.appendChild(card);
    });
  });
}

// Load videos
function loadVideos() {
  const q = query(
    collection(db, 'userVideos'),
    where('userId', '==', currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  onSnapshot(q, (snapshot) => {
    const container = document.getElementById('videosList');
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = createVideoCard(doc.id, data);
      container.appendChild(card);
    });
  });
}

// Load feedback
function loadFeedback() {
  const q = query(
    collection(db, 'userFeedback'),
    where('userId', '==', currentUser.uid),
    orderBy('createdAt', 'desc')
  );
  
  onSnapshot(q, (snapshot) => {
    const container = document.getElementById('feedbackList');
    container.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const card = createFeedbackCard(doc.id, data);
      container.appendChild(card);
    });
  });
}

// Create experience card
function createExperienceCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <div class="card-content">
      <h4>${data.title}</h4>
      <div class="meta">${data.monastery} • ${stars} • ${date}</div>
      <p>${data.description}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deleteExperience('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Create photo card
function createPhotoCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <img src="${data.imageData}" alt="${data.title}">
    <div class="card-content">
      <h4>${data.title}</h4>
      <div class="meta">${data.monastery} • ${date}</div>
      <p>${data.description}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deletePhoto('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Create video card
function createVideoCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <video controls>
      <source src="${data.videoData}" type="${data.fileType}">
      Your browser does not support the video tag.
    </video>
    <div class="card-content">
      <h4>${data.title}</h4>
      <div class="meta">${data.monastery} • ${date}</div>
      <p>${data.description}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deleteVideo('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Create feedback card
function createFeedbackCard(id, data) {
  const card = document.createElement('div');
  card.className = 'content-card';
  
  const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
  const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown date';
  
  card.innerHTML = `
    <div class="card-content">
      <h4>${data.subject}</h4>
      <div class="meta">${data.type} • ${stars} • ${date}</div>
      <p>${data.message}</p>
      <div class="actions">
        <button class="btn-delete" onclick="deleteFeedback('${id}')">Delete</button>
      </div>
    </div>
  `;
  
  return card;
}

// Delete functions
async function deleteExperience(id) {
  if (confirm('Are you sure you want to delete this experience?')) {
    try {
      await deleteDoc(doc(db, 'userExperiences', id));
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience.');
    }
  }
}

async function deletePhoto(id) {
  if (confirm('Are you sure you want to delete this photo?')) {
    try {
      await deleteDoc(doc(db, 'userPhotos', id));
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo.');
    }
  }
}

async function deleteVideo(id) {
  if (confirm('Are you sure you want to delete this video?')) {
    try {
      await deleteDoc(doc(db, 'userVideos', id));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video.');
    }
  }
}

async function deleteFeedback(id) {
  if (confirm('Are you sure you want to delete this feedback?')) {
    try {
      await deleteDoc(doc(db, 'userFeedback', id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback.');
    }
  }
}

// Utility function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Logout function
async function logout() {
  console.log('Logout clicked');
  console.log('Current user:', currentUser);
  console.log('Auth object:', auth);
  
  try {
    await signOut(auth);
    console.log('Sign out successful, redirecting...');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error signing out:', error);
    alert('Failed to logout. Please try again. Error: ' + error.message);
  }
}

// Setup chatbot functionality
function setupChatbot() {
  const chatToggle = document.getElementById('chat-toggle');
  const chatBox = document.getElementById('chatbox');
  const closeBtn = document.getElementById('close-btn');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const modeMonastery = document.getElementById('mode-monastery');
  const modeAI = document.getElementById('mode-ai');
  const aiTools = document.getElementById('ai-tools');
  const aiFile = document.getElementById('ai-file');
  const aiPreview = document.getElementById('ai-preview');
  
  let currentMode = 'monastery';
  let selectedImageFile = null;
  
  if (chatToggle && chatBox) {
    // Toggle chatbox
    chatToggle.addEventListener('click', () => {
      chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Close chatbox
    closeBtn.addEventListener('click', () => {
      chatBox.style.display = 'none';
    });
    
    // Switch modes
    modeMonastery.addEventListener('click', () => {
      currentMode = 'monastery';
      modeMonastery.classList.add('active');
      modeAI.classList.remove('active');
      aiTools.style.display = 'none';
    });
    
    modeAI.addEventListener('click', () => {
      currentMode = 'ai';
      modeAI.classList.add('active');
      modeMonastery.classList.remove('active');
      aiTools.style.display = 'block';
    });
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // Handle image upload
    aiFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          aiPreview.src = e.target.result;
          aiPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Append message to chat
  function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Show loader
  function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'message bot loading';
    loader.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loader);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loader;
  }
  
  // Remove loader
  function removeLoader(loader) {
    if (loader) loader.remove();
  }
  
  // Format AI text
  function formatAiText(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
  
  // Send message to Gemini API
  async function sendToGemini(text) {
    const loader = showLoader();
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBP_sYkJVnholXFxCRD-PklQkeXrtYy46w',
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
  
  // Send image to Gemini API
  async function sendImageToGemini(prompt, file) {
    const loader = showLoader();
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBP_sYkJVnholXFxCRD-PklQkeXrtYy46w',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inlineData: { data: base64.split(',')[1], mimeType: file.type } }] }]
          })
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ No response from AI.';
      text = formatAiText(text);
      removeLoader(loader);
      appendMessage('bot', text);
    } catch (err) {
      console.error(err);
      removeLoader(loader);
      appendMessage('bot', '❌ Something went wrong while analyzing the image.');
    }
  }
  
  // Main sendMessage function
  async function sendMessage() {
    const text = userInput.value.trim();
    const hasImage = !!selectedImageFile;
    if (!text && !hasImage) return;
    
    appendMessage("user", text || (hasImage ? '🖼️ Image uploaded for analysis' : ''));
    
    if (currentMode === 'ai') {
      // If an image is selected, analyze image with structured prompt
      if (hasImage) {
        const structuredPrompt = `Look at this image and:\n
          1. Identify the place or object (name if possible).\n
          2. Provide its location (city, country).\n
          3. Give a short history (when it was built, by whom).\n
          4. List any important cultural or religious events related to it.\n
          5. Mention any interesting architectural features.`;
        
        const prompt = text ? `${text}\n\n${structuredPrompt}` : structuredPrompt;
        
        // Immediately clear UI selection before sending
        const fileToSend = selectedImageFile;
        selectedImageFile = null;
        aiFile.value = '';
        aiPreview.style.display = 'none';
        await sendImageToGemini(prompt, fileToSend);
      } else {
        // Text-only to Gemini
        await sendToGemini(text);
      }
      userInput.value = "";
      return;
    }
    
    // Handle monastery mode (you can implement this part if needed)
    userInput.value = "";
  }
}



// Make functions globally available
window.showTab = showTab;
window.deleteExperience = deleteExperience;
window.deletePhoto = deletePhoto;
window.deleteVideo = deleteVideo;
window.deleteFeedback = deleteFeedback;
window.logout = logout;

// Add logout button event listener
document.getElementById('logoutBtn').addEventListener('click', logout);
