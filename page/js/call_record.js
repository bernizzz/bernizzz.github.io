/* ===========================================
   Call Record - Today We Called Button
   =========================================== */

// Get today's date string
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Record call for today
function recordCall() {
    if (!callRecordBtn) return;
    
    const today = getTodayString();
    
    // Always show sparkles immediately for visual feedback
    createSparkles();
    
    // Change button to red immediately for visual feedback
    callRecordBtn.classList.add('recorded');
    
    // Check if already recorded today
    if (callsRef) {
        callsRef.child(today).once('value', (snapshot) => {
            if (snapshot.exists()) {
                console.log('Call already recorded for today');
                return;
            }
            
            // Record the call
            callsRef.child(today).set(true).then(() => {
                console.log('Call recorded for', today);
            }).catch((error) => {
                console.error('Error recording call:', error);
                callRecordBtn.classList.remove('recorded');
            });
        });
    } else {
        console.log('Firebase not available - running in local mode');
    }
}

// Create sparkling particles animation
function createSparkles() {
    const rect = callRecordBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.textContent = '✨';
        
        const angle = (i / 15) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        sparkle.style.left = `${centerX}px`;
        sparkle.style.top = `${centerY}px`;
        sparkle.style.setProperty('--sparkle-x', `${x}px`);
        sparkle.style.setProperty('--sparkle-y', `${y}px`);
        sparkle.style.animationDelay = `${i * 0.03}s`;
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 2000);
    }
}

// Check if call was already recorded today
function checkCallRecordedToday() {
    const today = getTodayString();
    
    if (callsRef) {
        callsRef.child(today).once('value', (snapshot) => {
            if (snapshot.exists()) {
                callRecordBtn.classList.add('recorded');
            } else {
                callRecordBtn.classList.remove('recorded');
            }
        });
    }
}

// Event listener for call record button
if (callRecordBtn) {
    callRecordBtn.addEventListener('click', recordCall);
} else {
    console.error('Call record button not found!');
}
