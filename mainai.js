document.addEventListener('DOMContentLoaded', () => {

  // ===== Main Chatbot Elements =====
  const chatBox = document.getElementById('chatbox');
  const chatToggleBtn = document.getElementById('chat-toggle');
  const chatCloseBtn = document.getElementById('close-btn');

  // ===== AI Chatbot Elements =====
  const aiTriggerBtn = document.getElementById('aiTriggerBtn');
  const aiPopupContainer = document.getElementById('aiPopupContainer');
  const aiCloseBtn = document.getElementById('aiCloseBtn');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const aiMessageInput = document.getElementById('aiMessageInput');
  const aiEmojiBtn = document.getElementById('aiEmojiBtn');
  const aiEmojiPicker = document.querySelector('.ai-emoji-picker');
  const aiBoxBtn = document.querySelector('.ai-box'); // AI Assistant button
  let emojiVisible = false;

  // ===== Main Chat Toggle =====
  chatToggleBtn.addEventListener('click', () => {
    chatBox.style.display = 'flex';
  });

  chatCloseBtn.addEventListener('click', () => {
    chatBox.style.display = 'none';
  });

  // ===== AI Trigger Popup =====
  aiTriggerBtn.addEventListener('click', () => {
    aiPopupContainer.style.display = 'flex';
    aiTriggerBtn.style.display = 'none';
  });

 let wasChatOpen = false;

aiBoxBtn.addEventListener('click', () => {
  wasChatOpen = chatBox.style.display === 'flex'; // remember if Namaste chat was open
  chatBox.style.display = 'none';                 // hide Namaste chat
  aiPopupContainer.style.display = 'flex';        // show AI popup
  aiTriggerBtn.style.display = 'none';            // hide AI trigger button
});

aiCloseBtn.addEventListener('click', () => {
  aiPopupContainer.style.display = 'none';        // hide AI popup
  aiTriggerBtn.style.display = 'flex';            // show AI trigger button

  if (wasChatOpen) {                              // restore Namaste chat if it was open before
    chatBox.style.display = 'flex';
  }
});

  // ===== Append AI Messages =====
  function appendMessage(content, sender='user', isHTML=false) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('ai-message', sender);
    const msgContent = document.createElement('div');
    msgContent.classList.add('ai-message-content');

    if(isHTML) msgContent.innerHTML = content;
    else msgContent.textContent = content;

    msgDiv.appendChild(msgContent);

    if (sender === 'bot') {
      const botIcon = document.createElement('span');
      botIcon.textContent = '🤖';  // emoji bot
      botIcon.classList.add('ai-message-icon');
      msgDiv.prepend(botIcon);
    }


    aiChatWindow.appendChild(msgDiv);
    aiChatWindow.scrollTop = aiChatWindow.scrollHeight;
    return msgDiv;
  }

  // ===== Typing Indicator =====
  function showTyping(){
    const typingDiv = appendMessage('', 'bot', true);
    typingDiv.classList.add('typing-indicator');
    typingDiv.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    return typingDiv;
  }

  function removeTyping(typingDiv){ if(typingDiv) typingDiv.remove(); }

  // ===== Send AI Message =====
  async function handleSend(){
    const message = aiMessageInput.value.trim();
    if(!message) return;
    appendMessage(message, 'user');
    aiMessageInput.value = '';

    const typing = showTyping();

    try{
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBP_sYkJVnholXFxCRD-PklQkeXrtYy46w',
        {
          method: 'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({contents:[{parts:[{text: message}]}]})
        }
      );

      if(!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      removeTyping(typing);

      if(data?.candidates?.length){
        let botReply = data.candidates[0].content.parts[0].text;
        appendMessage(botReply.replace(/\n/g,'<br>'),'bot', true);
      } else appendMessage('⚠️ No response from AI','bot');

    } catch(err){
      removeTyping(typing);
      appendMessage('❌ Something went wrong.','bot');
      console.error(err);
    }
  }

  // ===== Enter key send =====
  aiMessageInput.addEventListener('keydown', e=>{
    if(e.key==='Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend();
    }
  });

  // ===== Emoji Picker =====
  aiEmojiBtn.addEventListener('click', e=>{
    e.stopPropagation();
    emojiVisible = !emojiVisible;
    aiEmojiPicker.style.display = emojiVisible ? 'block':'none';
  });

  document.addEventListener('click', e=>{
    if(!aiEmojiPicker.contains(e.target) && e.target !== aiEmojiBtn){
      aiEmojiPicker.style.display='none';
      emojiVisible=false;
    }
  });

  aiEmojiPicker.addEventListener('emoji-click', e=>{
    aiMessageInput.value += e.detail.unicode;
  });

});
