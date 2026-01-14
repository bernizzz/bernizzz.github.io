/* ===========================================
   State Management & DOM References
   =========================================== */

// Application State
const state = {
    partner1: { wantsToCallToday: false, readyToCallRn: false, name: 'Arthur', message: '', cantCallReason: '' },
    partner2: { wantsToCallToday: false, readyToCallRn: false, name: 'Bernice', message: '', cantCallReason: '' }
};

// DOM Elements - Partner 1
const partner1WantsTodayBtn = document.getElementById('partner1-wants-today-btn');
const partner1ReadyRnBtn = document.getElementById('partner1-ready-rn-btn');
const partner1Status = document.getElementById('partner1-status');
const partner1Section = document.getElementById('partner1-section');
const partner1Message = document.getElementById('partner1-message');
const partner1CharCount = document.getElementById('partner1-char-count');
const partner1ReceivedText = document.getElementById('partner1-received-text');
const partner1SendBtn = document.getElementById('partner1-send-btn');
const partner1ReceivedMessage = document.getElementById('partner1-received-message');
const partner1CantCallBtn = document.getElementById('partner1-cant-call-btn');
const partner1CantCallContainer = document.getElementById('partner1-cant-call-reason-container');
const partner1CantCallReason = document.getElementById('partner1-cant-call-reason');
const partner1CantCallSubmit = document.getElementById('partner1-cant-call-submit');
const partner1CantCallCancel = document.getElementById('partner1-cant-call-cancel');
const partner1ReceivedCantCall = document.getElementById('partner1-received-cant-call');
const partner1ReceivedCantCallText = document.getElementById('partner1-received-cant-call-text');

// DOM Elements - Partner 2
const partner2WantsTodayBtn = document.getElementById('partner2-wants-today-btn');
const partner2ReadyRnBtn = document.getElementById('partner2-ready-rn-btn');
const partner2Status = document.getElementById('partner2-status');
const partner2Section = document.getElementById('partner2-section');
const partner2Message = document.getElementById('partner2-message');
const partner2CharCount = document.getElementById('partner2-char-count');
const partner2ReceivedText = document.getElementById('partner2-received-text');
const partner2SendBtn = document.getElementById('partner2-send-btn');
const partner2ReceivedMessage = document.getElementById('partner2-received-message');
const partner2CantCallBtn = document.getElementById('partner2-cant-call-btn');
const partner2CantCallContainer = document.getElementById('partner2-cant-call-reason-container');
const partner2CantCallReason = document.getElementById('partner2-cant-call-reason');
const partner2CantCallSubmit = document.getElementById('partner2-cant-call-submit');
const partner2CantCallCancel = document.getElementById('partner2-cant-call-cancel');
const partner2ReceivedCantCall = document.getElementById('partner2-received-cant-call');
const partner2ReceivedCantCallText = document.getElementById('partner2-received-cant-call-text');

// Shared DOM Elements
const callRecordBtn = document.getElementById('call-record-btn');
const celebration = document.getElementById('celebration');
const connectionPulse = document.getElementById('connection-pulse');

// Set fixed names in localStorage
localStorage.setItem('partner1-name', 'Arthur');
localStorage.setItem('partner2-name', 'Bernice');
