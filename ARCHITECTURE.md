# Aura Pulse90 — System Architecture

## High-Level Architecture

Aura Pulse90 follows a behavioral wellness architecture focused on adaptive coaching, recovery-aware recommendations, and long-term consistency.

The platform combines:

- React + TypeScript frontend
- Firebase backend services
- Gemini AI coaching layer
- Behavioral tracking systems
- Recovery scoring engine
- Habit reinforcement mechanics
- Gamification-driven progression

Core behavioral flow:

User Input  
→ Behavioral Tracking  
→ Recovery Analysis  
→ AI Coaching Layer  
→ Adaptive Recommendations  
→ Progress Reinforcement  
→ Updated Behavioral Context

The architecture was intentionally optimized for:

- low-friction mobile usage
- fast product iteration
- AI-assisted personalization
- lightweight operational overhead

---

## Frontend Architecture

The frontend was built using React + TypeScript with a lightweight component-driven structure focused on mobile-first usability and fast iteration.

### Core Frontend Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Routing | React Router |
| Build Tool | Vite |
| State Logic | React Hooks + Context API |

### Frontend Design Priorities

- Low cognitive overload
- Fast dashboard rendering
- Minimal navigation depth
- Behavioral continuity
- Mobile-first interaction flows
- Lightweight component structure

---

## AI Coaching System

Coach Max is the AI guidance system powering personalized coaching and recovery-aware recommendations.

### AI Responsibilities

- Personalized motivational guidance
- Recovery-aware recommendations
- Emotional accountability
- Workout adaptation
- Wellness feedback generation

### AI Context Signals

The recommendation system adapts based on:

- Sleep quality
- Stress levels
- Workout consistency
- Recovery state
- Streak progression
- XP progression
- Daily wellness inputs
- User interaction patterns

### AI Stack

| Component | Technology |
|---|---|
| LLM Layer | Gemini API |
| Prompt Logic | Dynamic contextual prompting |
| Recommendation Engine | Rule-assisted AI adaptation |
| Coaching Flow | Conversational behavioral system |

---

## Firebase Integration

Firebase acts as the primary backend infrastructure layer.

### Firebase Services Used

| Service | Purpose |
|---|---|
| Firebase Auth | User authentication |
| Firestore | Behavioral and progress data |
| Firebase Hosting | Deployment and hosting |
| Firebase Functions | Server-side logic |

### Backend Responsibilities

- User persistence
- Authentication state
- Workout history storage
- AI interaction storage
- Progress synchronization
- Real-time behavioral context

---

## State Management

Aura Pulse90 uses lightweight React state management patterns instead of enterprise-scale global state tooling.

### State Categories

- User authentication state
- Workout progression state
- Recovery score state
- AI coaching context
- Gamification state
- Habit tracking state

### Design Decision

React Hooks + Context API were intentionally chosen over Redux to reduce unnecessary architectural complexity during MVP-stage execution.

This improved:

- development velocity
- maintainability
- debugging simplicity
- iteration speed

---

## Authentication Flow

Authentication is handled through Firebase Authentication.

### Supported Methods

- Google Authentication
- Email + Password Authentication

### Authentication Goals

- Fast onboarding
- Low signup friction
- Persistent behavioral history
- Cross-device continuity
- Personalized AI coaching

### Flow

User Login  
→ Firebase Authentication  
→ User Session Creation  
→ Behavioral Data Sync  
→ Personalized Dashboard Initialization

---

## Recovery & Recommendation Logic

Recovery scoring helps personalize workout intensity and coaching recommendations.

### Inputs Used

- Sleep quality
- Sleep duration
- Stress level
- Workout intensity
- Daily wellness signals

### Output Behaviors

The system dynamically adjusts:

- workout intensity
- coaching tone
- recovery guidance
- motivational reinforcement
- suggested wellness activities

### Design Philosophy

This reduced:

- burnout risk
- overtraining patterns
- motivation crashes
- inconsistent habit cycles

---

## Deployment Architecture

Aura Pulse90 is deployed as a Progressive Web App (PWA).

### Deployment Stack

| Layer | Platform |
|---|---|
| Frontend Hosting | Firebase Hosting |
| Domain Delivery | Web-based PWA |
| Build Pipeline | Vite |
| CI/CD | Firebase deployment workflow |

### PWA Benefits

- Android-first accessibility
- No App Store approval dependency
- Instant updates
- Lower distribution friction
- Faster iteration cycles

---

## Scalability Considerations

The architecture was designed for fast MVP execution while still allowing future scalability.

### Current Constraints

- Firebase usage scaling
- AI API cost growth
- Large behavioral data expansion
- Analytics instrumentation gaps

### Planned Scaling Improvements

- Advanced analytics instrumentation
- Vector-based memory systems
- Smarter recommendation orchestration
- Expanded AI personalization
- More granular behavioral segmentation

---

## Key Technical Decisions

| Decision | Why It Mattered |
|---|---|
| PWA over native app | Faster launch velocity and lower operational overhead |
| Firebase backend | Simplified infrastructure management |
| Gemini AI integration | Rapid AI-native coaching implementation |
| Tailwind + shadcn | Faster UI iteration and cleaner component system |
| Context API over Redux | Reduced MVP complexity |
| Recovery-first logic | Behavioral sustainability over intensity optimization |
| Behavioral gamification | Reinforced long-term consistency loops |
| AI-assisted development workflow | Enabled faster iteration and product experimentation |

---

Arunjyoti Kalita · Aura Pulse90 Architecture Documentation