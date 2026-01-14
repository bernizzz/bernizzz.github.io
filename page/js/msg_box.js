/* ===========================================
   Message Box Handler
   =========================================== */

// Update character count
function updateCharCount(partner) {
    const messageEl = partner === 'partner1' ? partner1Message : partner2Message;
    const charCountEl = partner === 'partner1' ? partner1CharCount : partner2CharCount;
    const sendBtn = partner === 'partner1' ? partner1SendBtn : partner2SendBtn;
    const length = messageEl.value.length;
    charCountEl.textContent = `${length}/200`;
    
    // Update state (draft message)
    state[partner].message = messageEl.value;
    
    // Enable/disable send button
    sendBtn.disabled = length === 0;
}

// Send message
function sendMessage(partner) {
    const messageEl = partner === 'partner1' ? partner1Message : partner2Message;
    const message = messageEl.value.trim();
    
    if (!message) return;
    
    // Update sent message in state
    state[partner].sentMessage = message;
    
    // Clear the input
    messageEl.value = '';
    updateCharCount(partner);
    
    // Save to Firebase
    if (statusRef && firebaseInitialized) {
        console.log(`💾 Attempting to save message for ${partner}:`, message);
        
        statusRef.child(partner).update({
            sentMessage: message,
            sentMessageTimestamp: Date.now()
        }).then(() => {
            console.log(`✅ Message saved successfully for ${partner}:`, message);
        }).catch((error) => {
            console.error(`❌ Error saving message for ${partner}:`, error);
            if (error.code === 'PERMISSION_DENIED') {
                alert('⚠️ Permission denied! Please check Firebase database rules.');
            }
        });
    } else {
        console.warn(`⚠️ Firebase not available. Message not saved for ${partner}.`);
    }
    
    // Update message display on partner's side immediately
    const otherPartner = partner === 'partner1' ? 'partner2' : 'partner1';
    updateMessageDisplay(otherPartner);
}

// Update message display in styled message box
function updateMessageDisplay(partner) {
    const otherPartner = partner === 'partner1' ? 'partner2' : 'partner1';
    const message = state[otherPartner].sentMessage;
    const receivedMessageEl = partner === 'partner1' ? partner1ReceivedMessage : partner2ReceivedMessage;
    const receivedTextEl = partner === 'partner1' ? partner1ReceivedText : partner2ReceivedText;
    
    if (message && message.trim()) {
        receivedTextEl.textContent = message;
        receivedMessageEl.style.display = 'block';
    } else {
        receivedMessageEl.style.display = 'none';
        receivedTextEl.textContent = '';
    }
}

// Load and display messages from the other partner
function updateMessages() {
    // Update character counts based on current state
    if (state.partner1.message !== undefined) {
        partner1CharCount.textContent = `${state.partner1.message.length}/200`;
    }
    if (state.partner2.message !== undefined) {
        partner2CharCount.textContent = `${state.partner2.message.length}/200`;
    }
    
    // Update message displays
    updateMessageDisplay('partner1');
    updateMessageDisplay('partner2');
}

// Event listeners for messages
partner1Message.addEventListener('input', () => updateCharCount('partner1'));
partner2Message.addEventListener('input', () => updateCharCount('partner2'));
partner1SendBtn.addEventListener('click', () => sendMessage('partner1'));
partner2SendBtn.addEventListener('click', () => sendMessage('partner2'));

// Allow Enter key to send (Shift+Enter for new line)
partner1Message.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage('partner1');
    }
});

partner2Message.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage('partner2');
    }
});
