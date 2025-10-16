// ===== CHAT WIDGET CONFIGURATION =====
const ChatWidget = {
  WS_URL: 'http://localhost:8080/alotra-website/ws/chat',
  API_URL: 'http://localhost:8080/alotra-website/api/chat',

  stompClient: null,
  roomId: null,
  userId: null,

  // ===== Init =====
  init() {
    this.userId = this.getUserId();
    this.setupEventListeners();
    this.loadChatData();
  },

  // Lấy userId
  getUserId() {
    const attr = document.body.getAttribute('data-user-id');
    if (attr && attr !== 'null') return parseInt(attr, 10);

    const stored = localStorage.getItem('userId');
    if (stored) return parseInt(stored, 10);

    return 1; // fallback
  },

  // ===== Event listeners =====
  setupEventListeners() {
    const floatingBtn   = document.getElementById('chatFloatingBtn');
    const closeBtn      = document.getElementById('closeChatBtn');
    const sendBtn       = document.getElementById('chatSendBtn');
    const messageInput  = document.getElementById('chatMessageInput');

    if (floatingBtn) floatingBtn.addEventListener('click', () => this.toggleModal());
    if (closeBtn)    closeBtn.addEventListener('click', () => this.toggleModal());

    if (sendBtn)     sendBtn.addEventListener('click', () => this.sendMessage());

    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
      });
      messageInput.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
      });
    }
  },

  // ===== Toggle modal (THÊM .is-open để né giỏ hàng) =====
  toggleModal() {
    const modal = document.getElementById('chatModal');
    if (!modal) return;

    const opening = !modal.classList.contains('active');
    modal.classList.toggle('active');

    if (opening) {
      modal.classList.add('is-open');           // <<< DỊCH SANG TRÁI
      this.connectWebSocket();
      this.scrollToBottom();
      setTimeout(()=>document.getElementById('chatMessageInput')?.focus(),0);
    } else {
      modal.classList.remove('is-open');
    }
  },

  // ===== Load data =====
  async loadChatData() {
    try {
      const res = await fetch(`${this.API_URL}/user/${this.userId}`);
      const data = await res.json();
      this.roomId = data.id;

      await this.loadChatHistory();
      this.connectWebSocket();

      // (tuỳ chọn) mở sẵn khi vào trang:
      // document.getElementById('chatModal')?.classList.add('active', 'is-open');

    } catch (error) {
      console.error('Error loading chat data:', error);
      this.showError('Lỗi kết nối');
    }
  },

  async loadChatHistory() {
    if (!this.roomId) return;
    try {
      const res = await fetch(`${this.API_URL}/rooms/${this.roomId}/messages`);
      const messages = await res.json();

      const container = document.getElementById('chatMessagesContainer');
      container.innerHTML = '';

      if (!messages.length) {
        container.innerHTML = '<div class="chat-loading"><p>👋 Chào bạn! Hãy bắt đầu cuộc trò chuyện</p></div>';
      } else {
        messages.forEach((m) => this.displayMessage(m));
      }
      this.scrollToBottom(true);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  },

  // ===== WebSocket =====
  connectWebSocket() {
    if (this.stompClient && this.stompClient.connected) return;
    if (!this.roomId) return;

    const socket = new SockJS(this.WS_URL);
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null;

    this.stompClient.connect({}, () => {
      console.log('Chat WebSocket Connected');

      this.stompClient.subscribe(`/topic/chat/room/${this.roomId}`, (message) => {
        const msg = JSON.parse(message.body);
        if (msg?.id) {
          this.displayMessage(msg);
          this.scrollToBottom();
        }
      });

      // nếu màn hình đang hiển thị loading, nạp lại
      const container = document.getElementById('chatMessagesContainer');
      if (container.innerHTML.includes('chat-loading')) this.loadChatHistory();
    }, () => {
      setTimeout(() => this.connectWebSocket(), 3000);
    });

    this.stompClient.reconnect_delay = 5000;
  },

  // ===== UI =====
  displayMessage(msg) {
    const container = document.getElementById('chatMessagesContainer');
    const isSent = parseInt(msg.senderId, 10) === parseInt(this.userId, 10);

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;

    const time = msg.timestamp
      ? new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      : '';

    messageDiv.innerHTML = `
      <div>
        <div class="chat-message-bubble">${this.escapeHtml(msg.content)}</div>
        <div class="chat-message-time">${time}</div>
      </div>
    `;
    container.appendChild(messageDiv);
  },

  sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const content = (input?.value || '').trim();
    if (!content || !this.roomId) return;

    const message = { roomId: this.roomId, senderId: this.userId, content, senderType: 'USER' };

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat/send', {}, JSON.stringify(message));
      input.value = '';
      input.style.height = 'auto';
      this.scrollToBottom(true);
    } else {
      this.showError('Chưa kết nối. Vui lòng thử lại.');
    }
  },

  // ===== Utils =====
  escapeHtml(text) { const div = document.createElement('div'); div.textContent = text ?? ''; return div.innerHTML; },

  scrollToBottom(force = false) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    const nearBottom = (container.scrollHeight - container.scrollTop - container.clientHeight) < 80;
    if (force || nearBottom) {
      requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
    }
  },

  showError(message) {
    const container = document.getElementById('chatMessagesContainer');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color:#d32f2f;padding:10px;text-align:center;font-size:12px;';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => ChatWidget.init());