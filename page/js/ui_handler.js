/* ===========================================
   UI Handler - Update Interface
   =========================================== */

// Update UI based on state
function updateUI() {
    // Partner 1
    updatePartnerUI('partner1', partner1WantsTodayBtn, partner1ReadyRnBtn, partner1Status);
    
    // Partner 2
    updatePartnerUI('partner2', partner2WantsTodayBtn, partner2ReadyRnBtn, partner2Status);
    
    // Connection pulse when both ready to call rn
    if (state.partner1.readyToCallRn && state.partner2.readyToCallRn) {
        connectionPulse.classList.add('active');
        celebration.classList.add('active');
    } else if (state.partner1.readyToCallRn || state.partner2.readyToCallRn) {
        connectionPulse.classList.add('active');
        celebration.classList.remove('active');
    } else {
        connectionPulse.classList.remove('active');
        celebration.classList.remove('active');
    }
}

// Helper function to update individual partner UI
function updatePartnerUI(partner, wantsTodayBtn, readyRnBtn, statusEl) {
    const partnerState = state[partner];
    const sectionEl = partner === 'partner1' ? partner1Section : partner2Section;
    
    // Update "wants to call today" button
    if (partnerState.wantsToCallToday) {
        wantsTodayBtn.classList.add('active');
    } else {
        wantsTodayBtn.classList.remove('active');
    }
    
    // Update "ready to call rn" button
    if (partnerState.readyToCallRn) {
        readyRnBtn.classList.add('active');
        statusEl.textContent = 'ready to call rn! 💕';
        statusEl.classList.add('ready');
    } else {
        readyRnBtn.classList.remove('active');
        if (partnerState.wantsToCallToday) {
            statusEl.textContent = 'wants to call today';
            statusEl.classList.remove('ready');
        } else {
            statusEl.textContent = 'not ready yet';
            statusEl.classList.remove('ready');
        }
    }
    
    // Update background based on state
    sectionEl.classList.remove('wants-today', 'ready-rn');
    if (partnerState.readyToCallRn) {
        sectionEl.classList.add('ready-rn');
    } else if (partnerState.wantsToCallToday) {
        sectionEl.classList.add('wants-today');
    }
    
    // Enable/disable "ready to call rn" button based on "wants to call today"
    if (partnerState.wantsToCallToday) {
        readyRnBtn.disabled = false;
    } else {
        readyRnBtn.disabled = true;
        // If wantsToCallToday is false, also reset readyToCallRn
        if (partnerState.readyToCallRn) {
            partnerState.readyToCallRn = false;
        }
    }
}

// Set today's date display
function setTodayDate() {
    const todayDateEl = document.getElementById('today-date');
    if (todayDateEl) {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = today.toLocaleDateString('en-US', options);
        todayDateEl.textContent = formattedDate;
    }
}
