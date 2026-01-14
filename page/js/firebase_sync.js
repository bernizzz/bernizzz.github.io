/* ===========================================
   Firebase Sync - Listeners & Data Sync
   =========================================== */

// Track if Firebase data has been loaded
let firebaseDataLoaded = false;

// Setup Firebase listeners
function setupFirebaseListeners() {
    if (!statusRef || !firebaseInitialized) {
        console.warn('⚠️ Firebase not available. Running in local mode only.');
        updateUI();
        updateMessages();
        updateCantCallReasons();
        return;
    }
    
    console.log('👂 Setting up Firebase listener...');
    
    // Listen to the entire call-status node
    statusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log('📥 Firebase data received:', data);
        
        if (data) {
            // Update partner1 state
            if (data.partner1) {
                if (data.partner1.wantsToCallToday !== undefined) {
                    state.partner1.wantsToCallToday = Boolean(data.partner1.wantsToCallToday);
                }
                if (data.partner1.readyToCallRn !== undefined) {
                    state.partner1.readyToCallRn = Boolean(data.partner1.readyToCallRn);
                }
                if (data.partner1.message !== undefined) {
                    state.partner1.message = data.partner1.message || '';
                }
                if (data.partner1.sentMessage !== undefined) {
                    state.partner1.sentMessage = data.partner1.sentMessage || '';
                }
                if (data.partner1.cantCallReason !== undefined) {
                    state.partner1.cantCallReason = data.partner1.cantCallReason || '';
                }
            }
            
            // Update partner2 state
            if (data.partner2) {
                if (data.partner2.wantsToCallToday !== undefined) {
                    state.partner2.wantsToCallToday = Boolean(data.partner2.wantsToCallToday);
                }
                if (data.partner2.readyToCallRn !== undefined) {
                    state.partner2.readyToCallRn = Boolean(data.partner2.readyToCallRn);
                }
                if (data.partner2.message !== undefined) {
                    state.partner2.message = data.partner2.message || '';
                }
                if (data.partner2.sentMessage !== undefined) {
                    state.partner2.sentMessage = data.partner2.sentMessage || '';
                }
                if (data.partner2.cantCallReason !== undefined) {
                    state.partner2.cantCallReason = data.partner2.cantCallReason || '';
                }
            }
            
            // Mark that Firebase data has been loaded
            if (!firebaseDataLoaded) {
                firebaseDataLoaded = true;
                checkDailyReset();
            }
            
            // Always update UI after loading data
            updateUI();
            updateMessages();
            updateCantCallReasons();
        } else {
            // No data in Firebase yet - initialize with defaults
            if (!firebaseDataLoaded) {
                firebaseDataLoaded = true;
                checkDailyReset();
            }
            updateUI();
            updateMessages();
            updateCantCallReasons();
        }
    });
}

// Get the current reset period ID (changes at 4 PM UTC daily)
function getResetPeriodId() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcDate = now.getUTCDate();
    const utcMonth = now.getUTCMonth();
    const utcYear = now.getUTCFullYear();
    
    // If before 4 PM UTC, we're in the previous day's period
    if (utcHours < 16) {
        const yesterday = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1));
        return `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;
    }
    return `${utcYear}-${utcMonth}-${utcDate}`;
}

// Reset at 4 PM UTC daily (only resets call status, not messages)
function checkDailyReset() {
    const currentPeriod = getResetPeriodId();
    const lastReset = localStorage.getItem('lastResetPeriod');
    
    if (lastReset !== currentPeriod) {
        // New period, reset only call status
        if (statusRef) {
            statusRef.child('partner1').update({
                wantsToCallToday: false,
                readyToCallRn: false,
                timestamp: Date.now()
            });
            statusRef.child('partner2').update({
                wantsToCallToday: false,
                readyToCallRn: false,
                timestamp: Date.now()
            });
        }
        state.partner1.wantsToCallToday = false;
        state.partner1.readyToCallRn = false;
        state.partner2.wantsToCallToday = false;
        state.partner2.readyToCallRn = false;
        localStorage.setItem('lastResetPeriod', currentPeriod);
        updateUI();
        updateCantCallReasons();
    }
}
