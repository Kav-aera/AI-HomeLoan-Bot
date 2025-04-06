document.addEventListener('DOMContentLoaded', function () {
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const imageInput = document.getElementById('image-input');
  
    function markdownToHTML(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')                 // Italic
        .replace(/__(.*?)__/g, '<strong>$1</strong>')           // Bold (alt)
        .replace(/`(.*?)`/g, '<code>$1</code>');                // Inline code
    }
  
    function addMessage(content, isUser) {
      const wrapper = document.createElement('div');
      wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`;
  
      const bubble = document.createElement('div');
      bubble.className = `rounded-xl px-4 py-2 max-w-[70%] whitespace-pre-line shadow-md 
                          ${isUser ? 'bg-blue-600 text-white flex' : 'bg-gray-700 text-white flex'} animate-slide-in`;
  
      const avatar = document.createElement('img');
      avatar.src = isUser
        ? 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        : 'https://cdn-icons-png.flaticon.com/512/4712/4712100.png';
      avatar.alt = 'icon';
      avatar.className = 'w-6 h-6 rounded-full mr-2';
  
      if (!isUser) {
        bubble.innerHTML = `<span class="typing-indicator"><span class="dots"><span>.</span><span>.</span><span>.</span></span></span>`;
        wrapper.appendChild(bubble);
        chatHistory.appendChild(wrapper);
        chatHistory.scrollTop = chatHistory.scrollHeight;
  
        setTimeout(() => {
          bubble.innerHTML = '';
          bubble.appendChild(avatar);
          const text = document.createElement('span');
          bubble.appendChild(text);
  
          typewriterEffectHTML(text, markdownToHTML(content));
          chatHistory.scrollTop = chatHistory.scrollHeight;
        }, 600);
      } else {
        bubble.appendChild(avatar);
        bubble.appendChild(document.createTextNode(content));
        wrapper.appendChild(bubble);
        chatHistory.appendChild(wrapper);
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    }
  
    function typewriterEffectHTML(el, htmlText) {
      const temp = document.createElement('div');
      temp.innerHTML = htmlText;
      const nodes = Array.from(temp.childNodes);
      let i = 0;
  
      const cursor = document.createElement('span');
      cursor.className = 'blinking-cursor';
      cursor.textContent = '|';
      el.appendChild(cursor);
  
      function typeNode() {
        if (i < nodes.length) {
          const node = nodes[i];
          const cloned = node.cloneNode(true);
          el.insertBefore(cloned, cursor);
          i++;
          setTimeout(typeNode, 20);
        } else {
          cursor.remove();
        }
      }
  
      typeNode();
    }
  
    async function sendMessage() {
      const message = userInput.value.trim();
      if (!message) return;
  
      addMessage(message, true);
      userInput.value = '';
  
      try {
        const response = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
  
        const data = await response.json();
        addMessage(data.response || data.error, false);
      } catch (error) {
        addMessage('NETWORK ERROR: Unable to reach server.', false);
      }
    }
  
    async function uploadImage(file) {
      if (!file) return;
  
      addMessage('🖼️ Uploading image...', true);
  
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const response = await fetch('/upload-image', {
          method: 'POST',
          body: formData
        });
  
        const data = await response.json();
        addMessage(data.response || data.error || 'No response from server.', false);
      } catch (error) {
        addMessage('❌ IMAGE ERROR: Unable to upload.', false);
      }
  
      imageInput.value = ''; // Reset
    }
  
    function newChat() {
      chatHistory.innerHTML = '';
      addMessage("Welcome! I'm your AI assistant for checking home loan eligibility. Ask me anything related to home loans.", false);
      userInput.focus();
    }
  
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    newChatBtn.addEventListener('click', newChat);
    imageInput.addEventListener('change', () => {
      const file = imageInput.files[0];
      if (file) uploadImage(file);
    });
  
    newChat(); // Intro message
  });
  