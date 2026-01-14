/* ===========================================
   App Initialization
   =========================================== */

// Initialize the application
function initApp() {
    setTodayDate();
    setupFirebaseListeners();
    updateUI();
    updateMessages();
    updateCantCallReasons();
    checkCallRecordedToday();
    
    // Initialize send buttons
    updateCharCount('partner1');
    updateCharCount('partner2');
}

// Fallback: if Firebase doesn't load within 2 seconds, still check reset
setTimeout(() => {
    if (!firebaseDataLoaded) {
        firebaseDataLoaded = true;
        checkDailyReset();
        updateUI();
        updateMessages();
        updateCantCallReasons();
    }
}, 2000);

// Update messages on window resize
window.addEventListener('resize', () => {
    setTimeout(updateMessages, 100);
});

// Floating hearts animation
function createFloatingHeart() {
    if (!celebration.classList.contains('active')) return;
    
    const heart = document.createElement('div');
    heart.innerHTML = '💕';
    heart.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 20 + 15}px;
        left: ${Math.random() * 100}vw;
        bottom: -50px;
        pointer-events: none;
        z-index: 99;
        animation: float-up ${Math.random() * 3 + 4}s ease-out forwards;
    `;
    
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 7000);
}

// Add float-up animation
const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes float-up {
        to {
            transform: translateY(-100vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(floatStyle);

// Create floating hearts when celebrating
setInterval(createFloatingHeart, 500);

// Run initialization
initApp();

// Console welcome message
console.log(`
💕 Love Call Ready 💕
=====================
To enable real-time sync between devices:
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Add a web app and copy the config
4. Replace the firebaseConfig in firebase_config.js
5. Enable Realtime Database in test mode

Without Firebase, the app works locally only.
`);
