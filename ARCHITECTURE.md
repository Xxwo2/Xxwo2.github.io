# Japanese Learning App - Architecture Design

## Executive Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Environment                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Japanese Learning SPA (Single Page)         │  │
│  │                                                         │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  Transcript │  │  Flashcards  │  │    Quiz     │  │  │
│  │  │   Section   │  │   Section    │  │   Section   │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │  │
│  │         │                 │                  │         │  │
│  │         └─────────────────┴──────────────────┘         │  │
│  │                          │                              │  │
│  │                 ┌────────▼────────┐                    │  │
│  │                 │   App State     │                    │  │
│  │                 │   Management    │                    │  │
│  │                 └────────┬────────┘                    │  │
│  │                          │                              │  │
│  │                 ┌────────▼────────┐                    │  │
│  │                 │  Firebase SDK   │                    │  │
│  │                 │   (Auth + DB)   │                    │  │
│  │                 └────────┬────────┘                    │  │
│  └──────────────────────────┼──────────────────────────────┘  │
└────────────────────────────┼───────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Firebase Cloud │
                    │  ┌────────────┐ │
                    │  │    Auth    │ │
                    │  │ (Anonymous)│ │
                    │  └────────────┘ │
                    │  ┌────────────┐ │
                    │  │ Firestore  │ │
                    │  │   (NoSQL)  │ │
                    │  └────────────┘ │
                    └─────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           Frontend (Client-Side)         │
├─────────────────────────────────────────┤
│ • HTML5 (Semantic Structure)            │
│ • CSS3 (Embedded Styles)                │
│   - Flexbox Layout                      │
│   - CSS Animations & Transitions        │
│   - Responsive Design (@media queries)  │
│ • Vanilla JavaScript (ES6+)             │
│   - DOM Manipulation                    │
│   - Event Handling                      │
│   - Async/Await for Firebase            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Backend (Firebase Services)       │
├─────────────────────────────────────────┤
│ • Firebase Authentication v9.22.0       │
│   - Anonymous Sign-In                   │
│ • Cloud Firestore v9.22.0               │
│   - NoSQL Document Database             │
│   - Real-time Sync (optional)           │
└─────────────────────────────────────────┘
```

## Component Architecture

### 1. Navigation System
```
┌─────────────────────────────────────────┐
│         Sticky Navigation Header         │
├─────────────────────────────────────────┤
│  [📖 Transcript] [🎴 Flashcards] [📝 Quiz] │
│  ✅ Connected | Best Score: 85%         │
└─────────────────────────────────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
              Section Visibility Toggle
              (CSS class 'active')
```

**Responsibilities:**
- Tab navigation between sections
- Display authentication status
- Show persistent best score
- Sticky positioning for mobile UX

### 2. Transcript Component

```
┌─────────────────────────────────────────────────┐
│              Tokenized Transcript                │
├─────────────────────────────────────────────────┤
│                                                  │
│  Sentence 1:                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │ ちゅうか │ │   は   │ │ にほん │ │  で   │  │
│  │中華まん│ │   は   │ │  日本  │ │  で   │  │
│  │chūkaman│ │   wa   │ │ nihon  │ │  de   │  │
│  └────────┘ └────────┘ └────────┘ └────────┘  │
│     word      particle    word      particle   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Data Structure:**
```javascript
transcriptData = [
  {
    sentence: [
      {
        kanji: "中華まん",
        furigana: "ちゅうかまん",
        romaji: "chūkaman",
        type: "word" | "particle"
      },
      // ... more tokens
    ]
  }
]
```

**Rendering Logic:**
```
For each sentence:
  Create sentence container
  For each token:
    Create token element
    Stack: Furigana → Kanji → Romaji
    If particle: Apply dark theme styling
    Append to sentence
```

### 3. Flashcard Component

```
┌─────────────────────────────────────────┐
│          Flashcard System                │
├─────────────────────────────────────────┤
│                                          │
│   ┌────────────────────────────────┐   │
│   │         FRONT SIDE             │   │
│   │                                 │   │
│   │        中華まん                 │   │
│   │   ちゅうかまん (chūkaman)        │   │
│   │                                 │   │
│   │      (Click to flip)            │   │
│   └────────────────────────────────┘   │
│              ⟲ Flip                    │
│   ┌────────────────────────────────┐   │
│   │         BACK SIDE              │   │
│   │                                 │   │
│   │  Chinese-style steamed bun     │   │
│   │                                 │   │
│   │  コンビニで中華まんを買いました │   │
│   │                                 │   │
│   └────────────────────────────────┘   │
│                                          │
│   [← Previous]    [Next →]              │
│        Card 1 of 6                      │
└─────────────────────────────────────────┘
```

**State Management:**
```javascript
State: {
  currentCardIndex: 0,
  isFlipped: boolean (CSS class)
}

Actions:
  - flipCard()      → Toggle flip state
  - nextCard()      → Increment index (circular)
  - previousCard()  → Decrement index (circular)
  - updateCard()    → Render current card data
```

**CSS 3D Transform:**
```css
Transform: rotateY(0deg)     → Front visible
Transform: rotateY(180deg)   → Back visible
Transition: 0.6s ease
Perspective: 1000px
```

### 4. Quiz Component

```
┌─────────────────────────────────────────────┐
│              Quiz System                     │
├─────────────────────────────────────────────┤
│                                              │
│  Question 1: What does 中華まん mean?       │
│  ┌────────────────────────────────────────┐ │
│  │ ○ Chinese-style steamed bun  [CORRECT]│ │
│  │ ○ Rice ball                            │ │
│  │ ○ Sandwich                             │ │
│  │ ○ Noodle soup                          │ │
│  └────────────────────────────────────────┘ │
│  ✅ Correct!                                │
│                                              │
│  [... more questions ...]                   │
│                                              │
│  [Submit Quiz]                              │
│                                              │
│  Your Score: 4/5 (80%)                      │
│  [Retake Quiz]                              │
└─────────────────────────────────────────────┘
```

**State Machine:**
```
┌──────────────┐
│ Initial State│
│  (Empty)     │
└──────┬───────┘
       │ initQuiz()
       ▼
┌──────────────┐
│  Questions   │◄────────┐
│   Rendered   │         │
└──────┬───────┘         │
       │ selectAnswer()  │
       ▼                 │
┌──────────────┐         │
│  Answering   │─────────┘
│   (Track)    │
└──────┬───────┘
       │ submitQuiz()
       ▼
┌──────────────┐
│   Graded     │
│ (Show Score) │
└──────┬───────┘
       │ retakeQuiz()
       ▼
┌──────────────┐
│ Reset State  │
└──────────────┘
```

**Quiz State:**
```javascript
State: {
  currentQuizAnswers: Array(5).fill(null),
  quizSubmitted: boolean,
  score: number (calculated on submit)
}

Flow:
1. User selects answers → Track in array
2. Submit → Validate all answered
3. Calculate score → Mark correct/incorrect
4. Save to Firebase → Update best score
5. Display results → Offer retake
```

## Data Flow Architecture

### User Interaction Flow
```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ 1. Page Load
       ▼
┌──────────────┐
│  Initialize  │
│  Firebase    │
└──────┬───────┘
       │
       │ 2. Anonymous Sign-In
       ▼
┌──────────────┐     3. Query Firestore
│   Get User   │────────────────────┐
│     UID      │                    │
└──────┬───────┘                    ▼
       │                  ┌─────────────────┐
       │                  │   userScores    │
       │                  │  Collection     │
       │                  │  {uid: {        │
       │                  │   bestScore: 85 │
       │                  │  }}             │
       │ 4. Display Score └─────────────────┘
       ▼                           │
┌──────────────┐                   │
│   Render     │                   │
│  Components  │                   │
└──────┬───────┘                   │
       │                           │
       │ 5. User Takes Quiz        │
       ▼                           │
┌──────────────┐                   │
│   Submit     │                   │
│   Score      │                   │
└──────┬───────┘                   │
       │                           │
       │ 6. Compare & Update       │
       └───────────────────────────┘
             (if new best)
```

### Firebase Integration Pattern

```
┌─────────────────────────────────────────────┐
│          Firebase Authentication             │
├─────────────────────────────────────────────┤
│                                              │
│  signInAnonymously()                        │
│         │                                    │
│         ▼                                    │
│  ┌────────────┐                             │
│  │ User Object│                             │
│  │   - uid    │ (Auto-generated)            │
│  │   - auth   │                             │
│  └────────────┘                             │
└─────────────────────────────────────────────┘
                │
                │ uid used as document key
                ▼
┌─────────────────────────────────────────────┐
│           Cloud Firestore                    │
├─────────────────────────────────────────────┤
│                                              │
│  Collection: userScores                     │
│  ├─ Document: {uid}                         │
│  │  ├─ bestScore: number                    │
│  │  └─ lastUpdated: timestamp               │
│  └─ ...other users                          │
│                                              │
└─────────────────────────────────────────────┘
```

**Data Model:**
```javascript
// Firestore Structure
userScores (collection)
  └── {userId} (document)
       ├── bestScore: number (0-100)
       └── lastUpdated: serverTimestamp()

// Operations
- loadBestScore()  → GET  /userScores/{uid}
- saveBestScore()  → SET  /userScores/{uid}
                     (only if score > current)
```

## State Management

### Global Application State
```javascript
// Authentication State
auth: FirebaseAuth | null
currentUser: User | null

// Flashcard State
currentCardIndex: number (0 to flashcards.length-1)
flashcards: Array<FlashcardData>

// Quiz State
quizQuestions: Array<QuizQuestion>
currentQuizAnswers: Array<number|null>
quizSubmitted: boolean

// UI State
activeSection: 'transcript' | 'flashcards' | 'quiz'
```

### State Persistence Strategy
```
┌─────────────────────────────────────┐
│      Persistent State               │
│  (Stored in Firestore)              │
├─────────────────────────────────────┤
│  • Best Quiz Score                  │
│  • Last Updated Timestamp           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Session State                  │
│  (Lost on page reload)              │
├─────────────────────────────────────┤
│  • Current flashcard index          │
│  • Quiz answers (in progress)       │
│  • Quiz submission status           │
│  • Active section                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Static Data                    │
│  (Hardcoded in JavaScript)          │
├─────────────────────────────────────┤
│  • Transcript data                  │
│  • Flashcard content                │
│  • Quiz questions                   │
└─────────────────────────────────────┘
```

## Performance Optimizations

### 1. Single Page Application (SPA)
- No server round-trips for navigation
- Instant section switching via CSS display toggle
- All resources loaded once at page load

### 2. CSS Animations
- Hardware-accelerated transforms (translate3d, rotateY)
- Smooth 60fps animations
- Minimal repaints/reflows

### 3. Lazy Firebase Initialization
```javascript
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  // Only initialize if configured
  firebase.initializeApp(firebaseConfig);
}
// App works without Firebase
```

### 4. Efficient Rendering
- Direct DOM manipulation (no framework overhead)
- Event delegation where applicable
- Minimal re-renders

### 5. Mobile Optimizations
```css
/* Viewport meta tag */
width=device-width, initial-scale=1.0

/* Touch-friendly targets */
min-height: 44px (iOS guideline)
padding: 0.8rem 1.5rem

/* Reduced animations on mobile */
@media (prefers-reduced-motion: reduce)
```

## Security Considerations

### 1. Firebase Rules (Recommended Setup)
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userScores/{userId} {
      // Users can only read/write their own scores
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

### 2. Client-Side Validation
- Quiz answers validated before submission
- Score calculation on client (read-only from user perspective)
- Firebase rules enforce server-side validation

### 3. Anonymous Authentication
- No PII collected
- Temporary user IDs
- Auto-cleanup after 30 days (Firebase default)

## Error Handling Strategy

```javascript
// Firebase Initialization
try {
  if (config valid) {
    initialize Firebase
  } else {
    show warning (app still works)
  }
} catch (error) {
  graceful degradation
  log to console
}

// Score Operations
async loadBestScore() {
  try {
    fetch from Firestore
  } catch (error) {
    display 'N/A'
    log error
  }
}

async saveBestScore() {
  try {
    save to Firestore
  } catch (error) {
    continue (score shown locally)
    log error
  }
}
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         GitHub Repository                │
│         (Xxwo2.github.io)               │
└──────────────┬──────────────────────────┘
               │
               │ git push
               ▼
┌─────────────────────────────────────────┐
│         GitHub Pages                     │
│  (Static File Hosting)                  │
├─────────────────────────────────────────┤
│  • Automatic deployment on push         │
│  • CDN distribution                      │
│  • HTTPS enabled                         │
│  • Custom domain support                │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│           End Users                      │
│  • Desktop browsers                     │
│  • Mobile browsers                       │
│  • Progressive Web App capable          │
└─────────────────────────────────────────┘
```

## File Structure

```
japanese-learning.html
│
├── <head>
│   ├── Meta tags (viewport, charset)
│   └── <style> (all CSS embedded)
│
└── <body>
    ├── Navigation Header (sticky)
    │   ├── Title
    │   ├── Tab buttons
    │   └── Score display
    │
    ├── Container
    │   ├── Transcript Section
    │   │   └── Dynamic token rendering
    │   │
    │   ├── Flashcards Section
    │   │   ├── 3D flip card
    │   │   └── Navigation controls
    │   │
    │   └── Quiz Section
    │       ├── Question list
    │       └── Submit/Retake buttons
    │
    └── <script>
        ├── Firebase SDK (CDN)
        ├── Configuration
        ├── Data (transcript, flashcards, quiz)
        ├── Firebase functions
        ├── Component render functions
        └── Event handlers
```

## Future Scalability Considerations

### Potential Enhancements

1. **Dynamic Content Loading**
   ```
   Current: Hardcoded data in JS
   Future:  Fetch from API/Firestore
            → Support multiple lessons
   ```

2. **User Progress Tracking**
   ```
   Current: Best quiz score only
   Future:  • Flashcard mastery levels
            • Completed lessons
            • Study streaks
   ```

3. **Offline Support**
   ```
   Add: Service Worker
        → Cache assets
        → Offline quiz taking
        → Sync scores when online
   ```

4. **Analytics Integration**
   ```
   Track: • Time spent per section
          • Common wrong answers
          • Completion rates
   ```

5. **Modular Architecture**
   ```
   Current: Single HTML file
   Future:  • Separate JS modules
            • Component library
            • Build system (webpack/vite)
   ```

## Summary

This architecture prioritizes:
- **Simplicity**: Single-file deployment, no build step
- **Performance**: Vanilla JS, CSS animations, SPA architecture
- **Mobile-first**: Responsive design, touch-friendly
- **Offline-capable**: Works without Firebase
- **Scalable**: Easy to extend with more content
- **Secure**: Client-side validation + Firebase rules
- **User-friendly**: Immediate feedback, persistent progress

The modular component design allows easy maintenance and future enhancements while maintaining the lightweight, distraction-free learning experience.
