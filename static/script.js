document.addEventListener('DOMContentLoaded', function () {
  const chatHistory = document.getElementById('chat-history');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const imageInput = document.getElementById('image-input');

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
      chatHistory.scrollTo({
        top: chatHistory.scrollHeight,
        behavior: 'smooth'
      });
      

      setTimeout(() => {
        bubble.innerHTML = '';
        bubble.appendChild(avatar);
        const text = document.createElement('span');
        bubble.appendChild(text);

        typewriterEffect(text, content);
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

  function typewriterEffect(el, text) {
    let i = 0;
    const speed = 15;

    const cursor = document.createElement('span');
    cursor.className = 'blinking-cursor';
    cursor.textContent = '|';
    el.appendChild(cursor);

    function type() {
      if (i < text.length) {
        const span = document.createElement('span');
        span.textContent = text.charAt(i);
        span.style.opacity = 0;
        span.style.transition = 'opacity 0.2s ease-in';
        el.insertBefore(span, cursor);

        void span.offsetWidth; // trigger reflow
        span.style.opacity = 1;

        i++;
        setTimeout(type, speed);
      } else {
        cursor.remove();
      }
    }

    type();
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
