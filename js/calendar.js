// Firebase Configuration (same as main app)
const firebaseConfig = {
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
let callsRef = null;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    callsRef = db.ref('calls');
} catch (error) {
    console.log('Firebase not configured. Running in local mode.');
}

// DOM Elements
const totalCallsEl = document.getElementById('total-calls');
const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const milestoneProgressEl = document.getElementById('milestone-progress');
const milestones = document.querySelectorAll('.milestone');

// State
let currentDate = new Date();
let calls = {}; // Object with date strings as keys: { "2024-12-15": true, ... }
let totalCalls = 0;

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize
function init() {
    setupFirebaseListeners();
    renderCalendar();
    setupEventListeners();
    syncCallsFromCallStatus();
}

// Setup Firebase listeners
function setupFirebaseListeners() {
    if (!callsRef) return;
    
    // Listen to calls
    callsRef.on('value', (snapshot) => {
        calls = snapshot.val() || {};
        updateCallCount();
        renderCalendar();
        updateMilestones();
    });
}

// Sync calls from call-status (when both are ready to call rn)
function syncCallsFromCallStatus() {
    if (!db) return;
    
    const callStatusRef = db.ref('call-status');
    callStatusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        const today = getTodayString();
        
        // Record call if both are ready to call rn (and haven't recorded today yet)
        if (data.partner1?.readyToCallRn && data.partner2?.readyToCallRn) {
            if (!calls[today]) {
                if (callsRef) {
                    callsRef.child(today).set(true);
                }
            }
        }
    });
}

// Get today's date string
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Update call count
function updateCallCount() {
    totalCalls = Object.keys(calls).length;
    totalCallsEl.textContent = totalCalls;
}

// Update milestones
function updateMilestones() {
    const maxMilestone = 25; // Highest milestone
    const progressPercent = Math.min((totalCalls / maxMilestone) * 100, 100);
    
    milestoneProgressEl.style.width = `${progressPercent}%`;
    
    milestones.forEach(milestone => {
        const target = parseInt(milestone.dataset.target);
        if (totalCalls >= target) {
            milestone.classList.add('achieved');
        } else {
            milestone.classList.remove('achieved');
        }
    });
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthYearEl.textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    let html = '';
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="cal-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const called = calls[dateStr] || false;
        
        const isToday = today.getFullYear() === year && 
                        today.getMonth() === month && 
                        today.getDate() === day;
        
        let classes = 'cal-day';
        if (isToday) classes += ' today';
        if (called) classes += ' both-ready';
        
        html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
    }
    
    calendarDaysEl.innerHTML = html;
}

// Setup event listeners
function setupEventListeners() {
    // Calendar navigation
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

// Initialize on load
init();

console.log(`
💕 Our Love Journey 💕
======================
Track your calls together!
Calls are recorded automatically when both are ready.
`);

