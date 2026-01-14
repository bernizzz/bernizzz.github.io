/* ===========================================
   Firebase Configuration & Initialization
   =========================================== */

// Firebase Configuration
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
let statusRef = null;
let callsRef = null;
let firebaseInitialized = false;

try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        statusRef = db.ref('call-status');
        callsRef = db.ref('calls');
        firebaseInitialized = true;
        console.log('✅ Firebase initialized successfully');
        
        // Test Firebase connection
        statusRef.once('value', (snapshot) => {
            console.log('✅ Firebase connection test successful. Current data:', snapshot.val());
        }).catch((error) => {
            console.error('❌ Firebase connection test failed:', error);
        });
    } else {
        console.warn('⚠️ Firebase SDK not loaded. Check if Firebase scripts are included in HTML.');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.log('Running in local mode (data will not persist).');
}
