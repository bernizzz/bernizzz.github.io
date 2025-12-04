# 💕 Ready to Call?

A beautiful website for long-distance couples to signal when they're ready to call each other.

## Features

- Two heart buttons - one for each partner
- Real-time sync so you can see when your partner is ready
- Beautiful romantic dark theme with stars
- Celebration animation when both are ready
- Automatically resets each day
- Names saved locally

### 💌 Love Notes Page (NEW!)

- Leave sweet messages for each other
- Daily prompts to inspire what to write
- View previous notes in the history section
- Real-time sync between devices
- Notes automatically archive each day

## Quick Start

1. Open `index.html` in your browser
2. Enter your names
3. Click your heart when you're ready to call!

## Setting Up Real-Time Sync (So you can both see each other's status)

For the magic to work across devices, you need to set up Firebase (it's free!):

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it something like "our-call-ready"
4. You can disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Add a Web App

1. In your project, click the web icon `</>` to add an app
2. Name it "call-ready-web"
3. Don't check Firebase Hosting (we'll use a simpler option)
4. Click "Register app"
5. You'll see a config object - copy it!

### Step 3: Set Up Realtime Database

1. In the left menu, click "Realtime Database"
2. Click "Create Database"
3. Choose your location (any is fine)
4. Select "Start in test mode" (important for this to work easily)
5. Click "Enable"

### Step 4: Add Your Config

Open `app.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Free Hosting Options

### Option 1: GitHub Pages (Recommended)

1. Create a GitHub repository
2. Upload these files
3. Go to Settings → Pages → Deploy from main branch
4. Share the URL with your partner!

### Option 2: Netlify Drop

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop this folder
3. Get your free URL instantly!

### Option 3: Vercel

1. Go to [Vercel](https://vercel.com)
2. Import from GitHub or drag files
3. Deploy with one click

## Customization

- Change the colors in `styles.css` (look for `:root` variables)
- Modify the celebration message in `index.html`
- Update the subtitle text to something personal

## Made with 💕

For all the long-distance lovers out there. Distance means so little when someone means so much.



