// Firebase Configuration
// You'll need to replace this with your own Firebase config
// Go to: https://console.firebase.google.com/
// 1. Create a new project (or use existing)
// 2. Add a web app
// 3. Copy your config here
// 4. Enable Realtime Database (in test mode for simplicity)

const firebaseConfig = {
    // REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
    apiKey: "AIzaSyDVJCeWLDQ7EmcHwbnQ2o7_wuFdAedBGaQ",
    authDomain: "callreadyapp.firebaseapp.com",
    databaseURL: "https://callreadyapp-default-rtdb.firebaseio.com",
    projectId: "callreadyapp",
    storageBucket: "callreadyapp.firebasestorage.app",
    messagingSenderId: "999847583592",
    appId: "1:999847583592:web:6b1fea99fff58275df40dd"
};

// Initialize Firebase
let db = null;
let statusRef = null;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    statusRef = db.ref('call-status');
} catch (error) {
    console.log('Firebase not configured yet. Running in local mode.');
}

// State
const state = {
    partner1: { ready: false, name: 'Arthur' },
    partner2: { ready: false, name: 'Bernice' }
};

// DOM Elements
const partner1Btn = document.getElementById('partner1-btn');
const partner2Btn = document.getElementById('partner2-btn');
const partner1Status = document.getElementById('partner1-status');
const partner2Status = document.getElementById('partner2-status');
const celebration = document.getElementById('celebration');
const connectionPulse = document.getElementById('connection-pulse');

// Set fixed names in localStorage for messages page
localStorage.setItem('partner1-name', 'Arthur');
localStorage.setItem('partner2-name', 'Bernice');

// Update UI based on state
function updateUI() {
    // Partner 1
    if (state.partner1.ready) {
        partner1Btn.classList.add('ready');
        partner1Status.textContent = 'ready to call! 💕';
        partner1Status.classList.add('ready');
    } else {
        partner1Btn.classList.remove('ready');
        partner1Status.textContent = 'not ready yet';
        partner1Status.classList.remove('ready');
    }
    
    // Partner 2
    if (state.partner2.ready) {
        partner2Btn.classList.add('ready');
        partner2Status.textContent = 'ready to call! 💕';
        partner2Status.classList.add('ready');
    } else {
        partner2Btn.classList.remove('ready');
        partner2Status.textContent = 'not ready yet';
        partner2Status.classList.remove('ready');
    }
    
    // Connection pulse when both ready
    if (state.partner1.ready && state.partner2.ready) {
        connectionPulse.classList.add('active');
        celebration.classList.add('active');
    } else if (state.partner1.ready || state.partner2.ready) {
        connectionPulse.classList.add('active');
        celebration.classList.remove('active');
    } else {
        connectionPulse.classList.remove('active');
        celebration.classList.remove('active');
    }
}

// Toggle ready state
function toggleReady(partner) {
    state[partner].ready = !state[partner].ready;
    updateUI();
    
    // Sync to Firebase if configured
    if (statusRef) {
        statusRef.child(partner).set({
            ready: state[partner].ready,
            timestamp: Date.now()
        });
    }
}

// Listen for Firebase updates
function setupFirebaseListeners() {
    if (!statusRef) return;
    
    statusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (data.partner1) {
                state.partner1.ready = data.partner1.ready || false;
            }
            if (data.partner2) {
                state.partner2.ready = data.partner2.ready || false;
            }
            updateUI();
        }
    });
}

// Event Listeners
partner1Btn.addEventListener('click', () => toggleReady('partner1'));
partner2Btn.addEventListener('click', () => toggleReady('partner2'));

// Close celebration when clicked
celebration.addEventListener('click', () => {
    celebration.classList.remove('active');
});

// Get the current reset period ID (changes at 4 PM UTC daily)
function getResetPeriodId() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcDate = now.getUTCDate();
    const utcMonth = now.getUTCMonth();
    const utcYear = now.getUTCFullYear();
    
    // If before 4 PM UTC, we're in the previous day's period
    if (utcHours < 16) {
        // Use yesterday's date for the period ID
        const yesterday = new Date(Date.UTC(utcYear, utcMonth, utcDate - 1));
        return `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;
    }
    // After 4 PM UTC, use today's date
    return `${utcYear}-${utcMonth}-${utcDate}`;
}

// Reset at 4 PM UTC daily
function checkDailyReset() {
    const currentPeriod = getResetPeriodId();
    const lastReset = localStorage.getItem('lastResetPeriod');
    
    if (lastReset !== currentPeriod) {
        // New period, reset states
        if (statusRef) {
            statusRef.set({
                partner1: { ready: false, timestamp: Date.now() },
                partner2: { ready: false, timestamp: Date.now() }
            });
        }
        state.partner1.ready = false;
        state.partner2.ready = false;
        localStorage.setItem('lastResetPeriod', currentPeriod);
        updateUI();
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

// Initialize
setTodayDate();
setupFirebaseListeners();
checkDailyReset();
updateUI();

// Add some magic - floating hearts animation
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
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        to {
            transform: translateY(-100vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create floating hearts when celebrating
setInterval(createFloatingHeart, 500);

console.log(`
💕 Love Call Ready 💕
=====================
To enable real-time sync between devices:
1. Go to https://console.firebase.google.com/
2. Create a new project
3. Add a web app and copy the config
4. Replace the firebaseConfig in app.js
5. Enable Realtime Database in test mode

Without Firebase, the app works locally only.
`);



