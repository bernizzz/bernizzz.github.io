# 🔥 Firebase Debugging Guide

If your button states and messages aren't persisting after page refresh, follow these steps to diagnose and fix the issue.

## Step 1: Check Browser Console

1. Open your website in a browser
2. Press `F12` (or right-click → Inspect) to open Developer Tools
3. Go to the **Console** tab
4. Look for these messages:

### ✅ Good Signs:
- `✅ Firebase initialized successfully`
- `✅ Firebase connection test successful`
- `✅ Button state saved successfully for partner1/partner2`

### ❌ Bad Signs:
- `❌ Firebase initialization error`
- `❌ Firebase connection test failed`
- `❌ Error saving button state: PERMISSION_DENIED`
- `⚠️ Firebase SDK not loaded`

## Step 2: Check Firebase Database Rules

The most common issue is **database rules blocking writes**. Here's how to fix it:

### Go to Firebase Console:
1. Visit: https://console.firebase.google.com/
2. Select your project: **callreadyapp**
3. Click **Realtime Database** in the left menu
4. Click the **Rules** tab

### Current Rules (Check if they look like this):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**OR** if you see rules like this (which blocks writes):

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### Fix the Rules:

1. **For Testing/Development** (less secure, but works immediately):
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   - Click **Publish**
   - ⚠️ **Warning**: This allows anyone to read/write. Only use for personal projects!

2. **For Production** (more secure):
   ```json
   {
     "rules": {
       "call-status": {
         ".read": true,
         ".write": true,
         "$partner": {
           ".read": true,
           ".write": true
         }
       },
       "calls": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   - Click **Publish**

## Step 3: Verify Firebase Data Structure

1. In Firebase Console, go to **Realtime Database** → **Data** tab
2. You should see a structure like this:

```
call-status
  ├── partner1
  │   ├── wantsToCallToday: true/false
  │   ├── readyToCallRn: true/false
  │   ├── sentMessage: "your message"
  │   ├── cantCallReason: "reason"
  │   └── timestamp: 1234567890
  └── partner2
      ├── wantsToCallToday: true/false
      ├── readyToCallRn: true/false
      ├── sentMessage: "your message"
      ├── cantCallReason: "reason"
      └── timestamp: 1234567890
```

3. **Test**: Click a button on your website, then refresh the Firebase console. You should see the data update immediately.

## Step 4: Check Network Tab

1. In Browser DevTools, go to **Network** tab
2. Filter by **WS** (WebSocket) or **fetch**
3. Look for requests to `firebaseio.com`
4. Check if they're successful (green) or failing (red)

## Step 5: Common Issues & Solutions

### Issue 1: "PERMISSION_DENIED" Error
**Solution**: Fix database rules (see Step 2)

### Issue 2: Firebase SDK Not Loading
**Solution**: Check `index.html` - make sure these lines are present:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>
```

### Issue 3: Data Saves But Doesn't Load on Refresh
**Solution**: 
1. Check browser console for listener errors
2. Verify the listener is set up (you should see "✅ Firebase connection test successful")
3. Check if `checkDailyReset()` is clearing the data

### Issue 4: Works Locally But Not on GitHub Pages
**Solution**: 
- Firebase should work on GitHub Pages
- Check browser console for CORS errors
- Verify Firebase config is correct

## Step 6: Test the Fix

1. Open your website
2. Click "wants to call today" button
3. Check browser console - should see: `✅ Button state saved successfully`
4. Check Firebase Console - data should appear
5. **Refresh the page** - button should still be active
6. If it works, you're done! 🎉

## Still Not Working?

1. **Copy all console errors** and check what they say
2. **Check Firebase Console** → Realtime Database → Data tab to see if data is actually being saved
3. **Try in a different browser** to rule out browser-specific issues
4. **Check if you're using the correct Firebase project** - verify the database URL matches

## Quick Test Script

Open browser console and paste this to test Firebase:

```javascript
// Test if Firebase is working
if (typeof firebase !== 'undefined' && statusRef) {
    console.log('Testing Firebase write...');
    statusRef.child('test').set({ test: 'working', time: Date.now() })
        .then(() => {
            console.log('✅ Write test: SUCCESS');
            return statusRef.child('test').once('value');
        })
        .then((snapshot) => {
            console.log('✅ Read test: SUCCESS', snapshot.val());
            statusRef.child('test').remove();
        })
        .catch((error) => {
            console.error('❌ Firebase test FAILED:', error);
        });
} else {
    console.error('❌ Firebase not initialized');
}
```

If this test fails, the issue is with Firebase setup, not the code.
