# LudoMaster 3D 🎲

A **AAA-quality 3D Ludo game** built with React, Three.js, and modern web technologies. Runs completely in the browser — no backend required.

## ✨ Features

- **3D Board** — Wood-textured premium Ludo board with custom colored entry cells, safety star decals, and white direction arrows
- **3D Background** — Twinkling cosmic starfield with 1100 procedurally generated stars
- **3D Tokens** — Animated tokens with glow, selection sparkles, bounce movement, and particle trails
- **3D Dice** — Physics-style rolling dice with procedural face textures and camera glow
- **Standard Rules** — Fixed 52-cell circular path wrapping clockwise and home corner column entries
- **Slow Motion Animations** — Extended jump and rolling animations for tactile feedback and smooth play
- **Smart AI** — AI opponent with capture priority, token protection, and home push logic
- **Post-processing** — Bloom, Vignette, and optional Chromatic Aberration
- **Web Audio** — Procedurally generated sounds (no external audio files)
- **Particles** — Sparkle systems, confetti, and token trails
- **Responsive UI** — Glassmorphism HUD, victory/pause modals, player panels

## 🎮 Game Modes

| Mode | Description |
|------|-------------|
| 2 Players | Head-to-head duel |
| 3 Players | Triangle showdown |
| 4 Players | Classic full game |
| vs AI | 1 human + up to 3 AI opponents |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### Install & Run

```bash
# Clone or extract the project
cd ludo-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🗂️ Project Structure

```
src/
├── assets/                 # (reserved for future textures/models)
├── components/
│   ├── Board/
│   │   └── LudoBoard.jsx   # 3D board with procedural textures
│   ├── Camera/
│   │   └── GameCamera.jsx  # Orbit controls + cinematic mode
│   ├── Dice/
│   │   └── Dice3D.jsx      # 3D dice with face textures
│   ├── Effects/
│   │   └── PostProcessing.jsx  # Bloom, Vignette, AO
│   ├── Lighting/
│   │   └── SceneLighting.jsx   # Full lighting rig
│   ├── Particles/
│   │   ├── ConfettiSystem.jsx  # Victory confetti
│   │   └── SparkleSystem.jsx   # Token sparkles
│   ├── Token/
│   │   ├── Token3D.jsx         # Animated 3D token
│   │   └── TokenTrail.jsx      # Movement particle trail
│   └── UI/
│       ├── DiceRollButton.jsx  # HUD dice button
│       ├── FPSCounter.jsx      # Performance overlay
│       ├── GlassCard.jsx       # Glassmorphism card
│       ├── GradientButton.jsx  # Animated gradient button
│       ├── LoadingScreen.jsx   # Animated loader
│       ├── PauseModal.jsx      # Pause menu
│       ├── PlayerPanel.jsx     # Player status widget
│       └── VictoryModal.jsx    # Win screen
├── game/
│   ├── GamePage.jsx       # Game page wrapper
│   ├── GameScene.jsx      # R3F Canvas + 3D world
│   └── GameUI.jsx         # 2D HUD overlay
├── hooks/
│   ├── useAudio.js        # Audio hook
│   ├── useCamera.js       # Camera control hook
│   ├── useDice.js         # Dice animation hook
│   └── useGameEngine.js   # Game side-effects hook
├── pages/
│   ├── AboutPage.jsx      # Rules, controls, credits
│   ├── HomePage.jsx       # Animated home with 3D bg
│   ├── LobbyPage.jsx      # Player setup
│   ├── NotFoundPage.jsx   # 404 page
│   └── SettingsPage.jsx   # All settings
├── store/
│   ├── gameStore.js       # Game state (Zustand)
│   ├── settingsStore.js   # Settings (persisted)
│   └── uiStore.js         # UI state
├── styles/
│   └── globals.css        # Tailwind + custom CSS
├── utils/
│   ├── aiLogic.js         # AI decision engine
│   ├── audioManager.js    # Web Audio API manager
│   ├── helpers.js         # General utilities
│   ├── ludoConstants.js   # Board paths, colors, rules
│   └── ludoLogic.js       # Core game logic
├── App.jsx                # Router + AnimatePresence
└── main.jsx               # Entry point
```

## ⚙️ Settings

| Setting | Options |
|---------|---------|
| Music | On/Off + Volume |
| Sound FX | On/Off + Volume |
| Graphics Quality | Low / Medium / High / Ultra |
| Shadows | On/Off |
| Bloom | On/Off |
| Particles | On/Off |
| FPS Counter | On/Off |
| Camera Speed | 0.2x – 2x |
| Auto Camera | On/Off |
| Animation Speed | 0.5x – 1.5x |

## 🎮 Controls

| Action | Control |
|--------|---------|
| Roll dice | Click dice button |
| Move token | Click highlighted token |
| Rotate camera | Mouse drag |
| Zoom | Scroll wheel |
| Pan | Right click + drag |
| Pause | Escape key |

## 🤖 AI Strategy

The AI scores each possible move:
- **+50** — Capturing an opponent token
- **+100** — Finishing a token at home center  
- **+30** — Entering a new token (on 6)
- **+25** — Reaching safe home column
- **+15** — Landing on a safe star square
- **-20** — Moving into danger (opponent nearby)
- **+0.3×steps** — Progress reward
- **10% randomness** — Keeps AI unpredictable

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Three.js | 3D graphics engine |
| @react-three/fiber | React renderer for Three.js |
| @react-three/drei | R3F helpers (OrbitControls, Stars, etc.) |
| @react-three/postprocessing | Bloom, Vignette effects |
| Zustand | State management |
| GSAP | Smooth animations |
| Framer Motion | UI transitions |
| Tailwind CSS | Utility-first styling |
| Web Audio API | Procedural sound generation |

## 📄 License

MIT License — Free to use, modify, and distribute.

---

Made with ❤️ by **Vitthal Khavatagoppa**



