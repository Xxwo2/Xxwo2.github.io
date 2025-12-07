# Firebase Cloud Functions Setup Guide

This guide will help you set up Firebase Cloud Functions to automatically fetch YouTube transcripts for the Japanese Learning app.

## Prerequisites

- Node.js 18 or higher
- npm (Node Package Manager)
- A Google account
- Firebase CLI

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a project"
3. Enter project name (e.g., "japanese-learning-app")
4. Follow the setup wizard
5. Note your **Project ID**

## Step 3: Configure Firebase

1. **Login to Firebase:**
   ```bash
   firebase login
   ```

2. **Copy the template configuration:**
   ```bash
   cp .firebaserc.template .firebaserc
   ```

3. **Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual Project ID**

## Step 4: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

## Step 5: Test Locally (Optional)

```bash
# Start the Firebase emulators
firebase emulators:start

# Test the function locally at:
# http://localhost:5001/YOUR_PROJECT_ID/us-central1/getTranscript?videoId=_znBmC-oZ1M&lang=ja
```

## Step 6: Deploy to Firebase

```bash
firebase deploy --only functions
```

After deployment, you'll see output like:
```
✔  functions[getTranscript(us-central1)] Successful create operation.
Function URL (getTranscript(us-central1)): https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/getTranscript
```

## Step 7: Update the Web App

1. Copy your Function URL from the deployment output
2. Open `japanese-learning.html`
3. Find the `loadYouTubeTranscript()` function
4. Replace the placeholder API URL with your actual Function URL

Change this:
```javascript
const apiUrl = 'YOUR_FIREBASE_FUNCTION_URL'; // Replace this
```

To:
```javascript
const apiUrl = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/getTranscript';
```

## Step 8: Test the Integration

1. Visit your app: `https://xxwo2.github.io/japanese-learning.html`
2. Paste a YouTube URL (e.g., `https://youtu.be/_znBmC-oZ1M`)
3. Click "Load Transcript"
4. The transcript should load automatically! ✨

## API Usage

### Get Transcript

**Endpoint:** `GET /getTranscript`

**Parameters:**
- `videoId` (required): YouTube video ID
- `lang` (optional): Language code (default: 'ja')

**Example:**
```bash
curl "https://YOUR_FUNCTION_URL/getTranscript?videoId=_znBmC-oZ1M&lang=ja"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "_znBmC-oZ1M",
    "language": "ja",
    "entries": [
      {
        "text": "こんにちは",
        "offset": 0,
        "duration": 1500
      }
    ],
    "fullText": "こんにちは 今日は..."
  }
}
```

### Get Available Languages

**Endpoint:** `GET /getTranscriptLanguages`

**Parameters:**
- `videoId` (required): YouTube video ID

**Example:**
```bash
curl "https://YOUR_FUNCTION_URL/getTranscriptLanguages?videoId=_znBmC-oZ1M"
```

## Cost Estimate

### Firebase Free Tier (Spark Plan)

- **2 million function invocations/month** - FREE
- **400,000 GB-seconds compute time/month** - FREE
- **5 GB network egress/month** - FREE

For typical usage (100-1000 users/month), you'll stay within the free tier.

### Paid Tier (Blaze Plan - Pay as you go)

Only needed if you exceed free tier limits:
- Invocations: $0.40 per million
- Compute time: $0.0000025 per GB-second
- Network egress: $0.12 per GB

**Example:** 10,000 users/month = ~$0.50-$2.00/month

## Troubleshooting

### Error: "Transcript is disabled for this video"
- The video owner has disabled transcripts
- Try a different video

### Error: "No ja transcript found"
- The video doesn't have Japanese subtitles
- Try `lang=en` or check available languages

### Error: "Video unavailable"
- The video ID is incorrect
- The video is private or deleted

### Function deployment fails
- Make sure you're logged in: `firebase login`
- Check your project ID in `.firebaserc`
- Ensure Node.js 18+ is installed

### CORS errors in browser
- The function includes CORS headers automatically
- Check that the function URL is correct in the app

## Monitoring

View function logs:
```bash
firebase functions:log
```

Or in the [Firebase Console](https://console.firebase.google.com/) → Functions → Logs

## Security

The current implementation is open to anyone. To add authentication:

1. **Enable Firebase Authentication** in your project
2. **Update the function** to check for authenticated users
3. **Add authentication** to your web app

Example with auth:
```javascript
exports.getTranscript = functions.https.onRequest(async (req, res) => {
    // Verify Firebase Auth token
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }
    // ... rest of function
});
```

## Next Steps

Once deployed:
1. ✅ Automatic transcript fetching works
2. ✅ No more manual copy-paste needed
3. ✅ Support for multiple languages
4. ✅ Fast and reliable

Enjoy your Japanese Learning app! 🇯🇵✨
