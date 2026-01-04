(() => {
   const widget = document.querySelector('.chat-widget');
   if (!widget) return;

   const toggle = widget.querySelector('.chat-toggle');
   const panel = widget.querySelector('.chat-panel');
   const closeButton = widget.querySelector('.chat-close');
   const form = widget.querySelector('.chat-form');
   const input = widget.querySelector('.chat-input');
   const sendButton = widget.querySelector('.chat-send');
   const messagesEl = widget.querySelector('.chat-messages');
   const statusEl = widget.querySelector('.chat-status');
   const hint = widget.querySelector('.chat-hint');

   const MAX_CONTEXT_MESSAGES = 10;
   const HINT_SCROLL_THRESHOLD = 12;
   const state = {
      messages: [],
      open: false,
      busy: false
   };
   let hintTimeout = null;
   let hintShown = false;

   const hideHint = () => {
      if (!hint) return;
      widget.classList.remove('show-hint');
      hint.setAttribute('aria-hidden', 'true');
      if (hintTimeout) {
         window.clearTimeout(hintTimeout);
         hintTimeout = null;
      }
   };

   const showHint = () => {
      if (!hint || hintShown || state.open) return;
      hintShown = true;
      widget.classList.add('show-hint');
      hint.setAttribute('aria-hidden', 'false');
      hintTimeout = window.setTimeout(hideHint, 6000);
   };

   const onFirstScroll = () => {
      if (window.scrollY < HINT_SCROLL_THRESHOLD) return;
      showHint();
      window.removeEventListener('scroll', onFirstScroll);
   };

   const setStatus = (text) => {
      statusEl.textContent = text || '';
   };

   const setBusy = (busy) => {
      state.busy = busy;
      input.disabled = busy;
      sendButton.disabled = busy;
      setStatus(busy ? 'Thinking...' : '');
   };

   const setOpen = (open) => {
      state.open = open;
      widget.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      if (open) {
         hideHint();
         window.removeEventListener('scroll', onFirstScroll);
         input.focus();
      }
   };

   const pushMessage = (role, content) => {
      state.messages.push({ role, content });
      if (state.messages.length > MAX_CONTEXT_MESSAGES) {
         state.messages = state.messages.slice(-MAX_CONTEXT_MESSAGES);
      }
   };

   const renderMessage = (role, content, extraClass) => {
      const wrapper = document.createElement('div');
      wrapper.className = `chat-message ${role === 'user' ? 'from-user' : 'from-assistant'}${extraClass ? ` ${extraClass}` : ''}`;

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.textContent = content;

      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return wrapper;
   };

   const addMessage = (role, content) => {
      pushMessage(role, content);
      renderMessage(role, content);
   };

   const addTyping = () => renderMessage('assistant', 'Typing...', 'is-typing');

   const greeting = "Hey, I'm Ark. Ask me about my work, projects, or experience.";
   addMessage('assistant', greeting);

   window.addEventListener('scroll', onFirstScroll, { passive: true });

   toggle.addEventListener('click', () => setOpen(!state.open));
   closeButton.addEventListener('click', () => setOpen(false));

   form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (state.busy) return;

      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      addMessage('user', text);
      setBusy(true);

      const typingEl = addTyping();

      try {
         const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               messages: state.messages
            })
         });

         if (!response.ok) {
            throw new Error('Request failed');
         }

         const data = await response.json();
         const reply = (data && data.reply) ? String(data.reply).trim() : '';

         typingEl.remove();
         addMessage('assistant', reply || 'I had trouble answering that. Try again in a moment.');
      } catch (error) {
         typingEl.remove();
         addMessage('assistant', 'I could not reach my assistant right now. Please try again soon.');
      } finally {
         setBusy(false);
      }
   });
})();
