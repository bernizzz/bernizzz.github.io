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
let pointsRef = null;
let checkinsRef = null;
let activityLogRef = null;

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    db = firebase.database();
    pointsRef = db.ref('love-points');
    checkinsRef = db.ref('checkins');
    activityLogRef = db.ref('activity-log');
} catch (error) {
    console.log('Firebase not configured. Running in local mode.');
}

// DOM Elements
const arthurPointsEl = document.getElementById('arthur-points');
const bernicePointsEl = document.getElementById('bernice-points');
const combinedPointsEl = document.getElementById('combined-points');
const monthYearEl = document.getElementById('month-year');
const calendarDaysEl = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const activityLogEl = document.getElementById('activity-log');
const milestoneProgressEl = document.getElementById('milestone-progress');
const activityBtns = document.querySelectorAll('.activity-btn');
const milestones = document.querySelectorAll('.milestone');

// State
let currentDate = new Date();
let points = {
    arthur: 0,
    bernice: 0
};
let checkins = {};
let activityLog = [];

// Activity icons for log
const activityIcons = {
    workout: '💪',
    message: '💌',
    call: '📞',
    surprise: '🎁',
    selfcare: '🧘',
    checkin: '💕'
};

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
    syncCheckinsFromCallStatus();
}

// Setup Firebase listeners
function setupFirebaseListeners() {
    if (!pointsRef) return;
    
    // Listen to points changes
    pointsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            points.arthur = data.arthur || 0;
            points.bernice = data.bernice || 0;
            updatePointsDisplay();
        }
    });
    
    // Listen to checkins
    checkinsRef.on('value', (snapshot) => {
        checkins = snapshot.val() || {};
        renderCalendar();
    });
    
    // Listen to activity log
    activityLogRef.orderByChild('timestamp').limitToLast(20).on('value', (snapshot) => {
        activityLog = [];
        snapshot.forEach((child) => {
            activityLog.unshift({ id: child.key, ...child.val() });
        });
        renderActivityLog();
    });
}

// Sync checkins from call-status (heart button clicks)
function syncCheckinsFromCallStatus() {
    if (!db) return;
    
    const callStatusRef = db.ref('call-status');
    callStatusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        const today = getTodayString();
        const todayCheckins = checkins[today] || {};
        
        // Update checkins based on call status
        if (data.partner1?.ready && !todayCheckins.arthurTime) {
            checkinsRef.child(today).update({
                arthur: true,
                arthurTime: data.partner1.timestamp || Date.now()
            });
        }
        
        if (data.partner2?.ready && !todayCheckins.berniceTime) {
            checkinsRef.child(today).update({
                bernice: true,
                berniceTime: data.partner2.timestamp || Date.now()
            });
        }
        
        // Award bonus points if both ready today (first time)
        if (data.partner1?.ready && data.partner2?.ready) {
            const bothReadyKey = `both-ready-${today}`;
            if (!localStorage.getItem(bothReadyKey)) {
                localStorage.setItem(bothReadyKey, 'true');
                addPoints('arthur', 25, 'Both ready bonus!');
                addPoints('bernice', 25, 'Both ready bonus!');
            }
        }
    });
}

// Get today's date string
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Update points display
function updatePointsDisplay() {
    arthurPointsEl.textContent = points.arthur;
    bernicePointsEl.textContent = points.bernice;
    combinedPointsEl.textContent = points.arthur + points.bernice;
    
    updateMilestones();
}

// Update milestones
function updateMilestones() {
    const total = points.arthur + points.bernice;
    const maxMilestone = 1000;
    const progressPercent = Math.min((total / maxMilestone) * 100, 100);
    
    milestoneProgressEl.style.width = `${progressPercent}%`;
    
    milestones.forEach(milestone => {
        const target = parseInt(milestone.dataset.target);
        if (total >= target) {
            milestone.classList.add('achieved');
        } else {
            milestone.classList.remove('achieved');
        }
    });
}

// Add points
function addPoints(person, amount, activity) {
    points[person] += amount;
    
    if (pointsRef) {
        pointsRef.child(person).set(points[person]);
    }
    
    // Log activity
    logActivity(person, activity, amount);
    
    updatePointsDisplay();
}

// Log activity
function logActivity(person, activity, points) {
    const entry = {
        person,
        activity,
        points,
        timestamp: Date.now()
    };
    
    if (activityLogRef) {
        activityLogRef.push(entry);
    }
}

// Render activity log
function renderActivityLog() {
    if (activityLog.length === 0) {
        activityLogEl.innerHTML = '<div class="log-empty">No activities yet. Start earning points! 💕</div>';
        return;
    }
    
    activityLogEl.innerHTML = activityLog.slice(0, 15).map(item => {
        const icon = activityIcons[item.activity.toLowerCase().split(' ')[0]] || '✨';
        const time = formatTime(item.timestamp);
        const name = item.person.charAt(0).toUpperCase() + item.person.slice(1);
        
        return `
            <div class="log-item">
                <span class="log-icon">${icon}</span>
                <span class="log-text"><strong>${name}</strong> ${item.activity}</span>
                <span class="log-points">+${item.points}</span>
                <span class="log-time">${time}</span>
            </div>
        `;
    }).join('');
}

// Format time for log
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
        const dayCheckins = checkins[dateStr] || {};
        
        const isToday = today.getFullYear() === year && 
                        today.getMonth() === month && 
                        today.getDate() === day;
        
        const arthurReady = dayCheckins.arthur;
        const berniceReady = dayCheckins.bernice;
        const bothReady = arthurReady && berniceReady;
        
        let classes = 'cal-day';
        if (isToday) classes += ' today';
        if (bothReady) classes += ' both-ready';
        
        let dotsHtml = '';
        if (!bothReady && (arthurReady || berniceReady)) {
            dotsHtml = '<div class="checkin-dots">';
            if (arthurReady) dotsHtml += '<span class="checkin-dot arthur"></span>';
            if (berniceReady) dotsHtml += '<span class="checkin-dot bernice"></span>';
            dotsHtml += '</div>';
        }
        
        html += `<div class="${classes}" data-date="${dateStr}">${day}${dotsHtml}</div>`;
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
    
    // Activity buttons
    activityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const person = btn.dataset.person;
            const activity = btn.dataset.activity;
            const pointsAmount = parseInt(btn.dataset.points);
            
            // Visual feedback
            btn.classList.add('clicked');
            setTimeout(() => btn.classList.remove('clicked'), 300);
            
            // Create floating points animation
            createPointsPopup(btn, pointsAmount);
            
            // Add points
            const activityName = btn.querySelector('.activity-name').textContent;
            addPoints(person, pointsAmount, activityName);
        });
    });
}

// Create floating points popup animation
function createPointsPopup(element, points) {
    const rect = element.getBoundingClientRect();
    const popup = document.createElement('div');
    popup.className = 'points-popup';
    popup.textContent = `+${points}`;
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;
    document.body.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1500);
}

// Initialize on load
init();

console.log(`
💕 Our Love Journey 💕
======================
Track your check-ins and earn love points!
Activities sync between devices via Firebase.
`);

