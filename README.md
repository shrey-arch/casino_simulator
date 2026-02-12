# 🎰 Casino Royale - Web Application

A premium, offline-capable casino experience built entirely with modern Vanilla JavaScript and CSS3. 
Designed with a "Mobile-First" luxury aesthetic, **Casino Royale** brings the thrill of Vegas to the browser without any frameworks or dependencies.

![Casino Royale Lobby](assets/screenshots/lobby.png)
*(Note: Add your screenshots to an `assets/screenshots` folder)*

## ✨ Features

### 🎮 The Game Suite
Five fully interactive casino games, each with unique mechanics and visual polish:
-   **🎰 "Golden Reel" Slots**: A realistic 3-reel slot machine with motion-blur animations, weighted RNG, and a luxury paytable.
-   **♠️ Blackjack**: Evaluation logic for Hit/Stand, dealer AI (stands on 17), and a premium felt table UI.
-   **🎡 Roulette**: A visual European Roulette wheel with a betting board, chip selection, and win/loss animations.
-   **♣️ Poker (Jacks or Better)**: Video poker style gameplay with Hold mechanics and winning hand evaluation.
-   **🎲 Hi-Lo Dice**: A fast-paced arcade dice game for quick betting action.

### 💰 Core Systems
-   **Virtual Currency**: A robust banking system that persists your balance using `localStorage`. You never lose your winnings!
-   **Bankruptcy Protection**: Run out of cash? The house offers a "Complimentary Loan" to keep the fun going.
-   **RNG Engine**: A custom Random Number Generator ensures fair play across all games.

### 🎨 Design & UX
-   **Luxury Theme**: A Deep Black & Gold color palette inspired by high-end casinos.
-   **Responsive Layout**: Works seamlessly on desktop and mobile devices.
-   **Sound FX**: Integrated sound manager for satisfying clicks, spins, and win effects.
-   **SPA Architecture**: Single-Page Application design for instant game switching without reloads.

## 🛠️ Technology Stack

-   **Frontend**: HTML5, CSS3 (Variables, Flexbox, Grid, Animations)
-   **Logic**: JavaScript (ES6+ Modules, Classes, Async/Await)
-   **State Management**: Custom Publisher/Subscriber pattern
-   **Build Tooling**: None! Pure, browser-native code.

## 🚀 Getting Started

### Prerequisites
-   A modern web browser (Chrome, Firefox, Safari, Edge).
-   A local web server (Recommended for ES6 Module support).

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/shrey-arch/casino_simulator
    ```
2.  **Navigate to the project**:
    ```bash
    cd casino-royale
    ```
3.  **Launch**:
    -   If using VS Code, install the "Live Server" extension and click "Go Live".
    -   Or using Python: `python -m http.server`
    -   Or simply open `index.html` (Note: Some browsers restrict ES6 modules on `file://` protocol).

## 📂 Project Structure

```
/
├── index.html          # Main entry point
├── style.css           # Global luxury theme styles
├── js/
│   ├── main.js         # Application bootstrapper
│   ├── core/           # Engine logic
│   │   ├── currency.js # Balance management
│   │   ├── rng.js      # Random number generation
│   │   └── sound.js    # Audio system
│   ├── games/          # Individual game modules
│   │   ├── slots.js
│   │   ├── blackjack.js
│   │   ├── roulette.js
│   │   ├── poker.js
│   │   └── dice.js
│   └── ui/             # UI Components
│       ├── lobbyUI.js  # Main menu
│       └── loanUI.js   # Bankruptcy modal
└── assets/             # Images and Sound files
```

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

---
Built with ❤️ and ☕ by shrey
