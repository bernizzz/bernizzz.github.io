/* ===========================================
   Can't Call Handler
   =========================================== */

// Show can't call reason input
function showCantCallReason(partner) {
    const container = partner === 'partner1' ? partner1CantCallContainer : partner2CantCallContainer;
    const reasonInput = partner === 'partner1' ? partner1CantCallReason : partner2CantCallReason;
    const btn = partner === 'partner1' ? partner1CantCallBtn : partner2CantCallBtn;
    
    container.style.display = 'block';
    reasonInput.focus();
    btn.classList.add('active');
}

// Hide can't call reason input
function hideCantCallReason(partner) {
    const container = partner === 'partner1' ? partner1CantCallContainer : partner2CantCallContainer;
    const reasonInput = partner === 'partner1' ? partner1CantCallReason : partner2CantCallReason;
    const btn = partner === 'partner1' ? partner1CantCallBtn : partner2CantCallBtn;
    
    container.style.display = 'none';
    reasonInput.value = '';
    btn.classList.remove('active');
}

// Submit can't call reason
function submitCantCallReason(partner) {
    const reasonInput = partner === 'partner1' ? partner1CantCallReason : partner2CantCallReason;
    const reason = reasonInput.value.trim();
    
    if (!reason) {
        alert('Please explain why you can\'t call today.');
        return;
    }
    
    // Update state
    state[partner].cantCallReason = reason;
    
    // Save to Firebase
    if (statusRef) {
        statusRef.child(partner).update({
            cantCallReason: reason,
            timestamp: Date.now()
        }).then(() => {
            console.log(`Can't call reason saved for ${partner}:`, reason);
        }).catch((error) => {
            console.error('Error saving cant call reason:', error);
        });
    }
    
    // Hide the input container
    hideCantCallReason(partner);
    
    // Update UI to show the reason on the other partner's side
    updateCantCallReasons();
}

// Update displayed can't call reasons
function updateCantCallReasons() {
    // Show partner2's reason on partner1's side
    if (state.partner2.cantCallReason) {
        partner1ReceivedCantCall.style.display = 'block';
        partner1ReceivedCantCallText.textContent = state.partner2.cantCallReason;
    } else {
        partner1ReceivedCantCall.style.display = 'none';
    }
    
    // Show partner1's reason on partner2's side
    if (state.partner1.cantCallReason) {
        partner2ReceivedCantCall.style.display = 'block';
        partner2ReceivedCantCallText.textContent = state.partner1.cantCallReason;
    } else {
        partner2ReceivedCantCall.style.display = 'none';
    }
}

// Event listeners for can't call buttons
partner1CantCallBtn.addEventListener('click', () => showCantCallReason('partner1'));
partner2CantCallBtn.addEventListener('click', () => showCantCallReason('partner2'));

// Submit and cancel handlers
partner1CantCallSubmit.addEventListener('click', () => submitCantCallReason('partner1'));
partner2CantCallSubmit.addEventListener('click', () => submitCantCallReason('partner2'));
partner1CantCallCancel.addEventListener('click', () => hideCantCallReason('partner1'));
partner2CantCallCancel.addEventListener('click', () => hideCantCallReason('partner2'));
