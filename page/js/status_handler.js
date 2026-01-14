/* ===========================================
   Status Handler - Toggle States
   =========================================== */

// Toggle state based on action
function toggleState(partner, action) {
    if (action === 'wantsToday') {
        state[partner].wantsToCallToday = !state[partner].wantsToCallToday;
        // If unchecking "wants to call today", also uncheck "ready to call rn"
        if (!state[partner].wantsToCallToday) {
            state[partner].readyToCallRn = false;
        }
    } else if (action === 'readyRn') {
        state[partner].readyToCallRn = !state[partner].readyToCallRn;
    }
    
    // Update UI immediately for better UX
    updateUI();
    
    // Sync to Firebase if configured
    if (statusRef && firebaseInitialized) {
        const updateData = {
            wantsToCallToday: state[partner].wantsToCallToday,
            readyToCallRn: state[partner].readyToCallRn,
            timestamp: Date.now()
        };
        
        console.log(`💾 Attempting to save to Firebase for ${partner}:`, updateData);
        
        statusRef.child(partner).update(updateData).then(() => {
            console.log(`✅ Button state saved successfully for ${partner}:`, updateData);
        }).catch((error) => {
            console.error(`❌ Error saving button state for ${partner}:`, error);
            console.error('Error details:', {
                code: error.code,
                message: error.message
            });
            
            if (error.code === 'PERMISSION_DENIED') {
                alert('⚠️ Permission denied! Please check Firebase database rules. See console for details.');
            }
        });
    } else {
        console.warn(`⚠️ Firebase not available. State changed locally for ${partner} but not saved.`);
        console.log('Current state:', state[partner]);
    }
}

// Event Listeners for status buttons
partner1WantsTodayBtn.addEventListener('click', () => toggleState('partner1', 'wantsToday'));
partner1ReadyRnBtn.addEventListener('click', () => toggleState('partner1', 'readyRn'));
partner2WantsTodayBtn.addEventListener('click', () => toggleState('partner2', 'wantsToday'));
partner2ReadyRnBtn.addEventListener('click', () => toggleState('partner2', 'readyRn'));

// Close celebration when clicked
celebration.addEventListener('click', () => {
    celebration.classList.remove('active');
});
