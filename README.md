# Stellar Ruse: Virtual Tabletop Prototype

A premium, web-based virtual tabletop for a strategic card game, built with a focus on fluid animations, tactile card manipulation, and secret-keeping mechanics.

## 🕹️ Core Features

### 1. Advanced Card Staging
- **Multi-Card Selection**: Stage multiple cards from your hand simultaneously with a golden glow highlight.
- **Double-Confirmation Flow**: Cards flip face-down in your hand before moving to the play area to ensure no "flashing" of hidden information.

### 2. Multi-Stack Tabletop
- **Independent Stacks**: Play cards in distinct groups (stacks) that can be moved independently across the tabletop.
- **Dynamic Physics**: Drag stacks to reposition them. Stacks "cluster" together (80% overlap) when picked up for a tactile feel and fan out (50% overlap) when dropped.
- **Out-of-Bounds Protection**: Stacks spring back to their original position if accidentally dropped outside the play area boundaries.

### 3. Tactile Interactions (Mobile-Friendly)
- **Tap-to-Peek**: Single-tap any face-down card you own to see a high-resolution, magnified preview in an overlay.
- **Action Menu**: While peeking, access context buttons to Reveal/Hide the stack, return a specific card to your hand, or return the whole stack.
- **Natural Return-to-Hand**: Physically drag a stack from the table down into your hand area to automatically return it to your deck.

### 4. Secret State Management
- **Opponent Fog-of-War**: View the number of cards in opponents' hands. Any cards played by opponents to the table appear face-down and remain un-peekable to the player.

---

## 🛠️ Tech Stack

- **Game Engine**: [boardgame.io](https://boardgame.io/)  
  *Manages the turn-based state machine, move validation, and game logic.*
- **Frontend Framework**: [React](https://reactjs.org/) (via Vite)  
  *Powers the component-based architecture and reactive UI.*
- **Animation & Physics**: [Framer Motion](https://www.framer.com/motion/)  
  *Handles complex layout transitions, drag interactions, and spring-based physics.*
- **Styling**: [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)  
  *A custom, premium design system featuring glassmorphism, depth-based z-indexing, and an interstellar dark-mode aesthetic.*

---

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```
