# Product Specification: Correspondence Chess Tracker PWA

## Overview
An offline-first Progressive Web App (PWA) designed exclusively for tracking asynchronous correspondence chess games (played via mail, text, or in person). The app requires no networking or communication features—its sole purpose is to serve as a persistent, local digital chessboard with a game history.

## 1. Core Requirements
*   **Offline Functionality:** Must function entirely without an internet connection using Service Workers to cache assets.
*   **Move Validation:** Enforce legal chess moves, including castling, en passant, and pawn promotion.
*   **State Persistence:** Save game states locally across browser sessions to ensure long-running correspondence games are never lost.
*   **Game History:** Maintain a readable record of all moves played in a specific game to match against received letters or texts.
*   **No Networking:** Strip all multiplayer, chatting, or cloud-syncing features to ensure the app remains a pure, lightweight local tracker.

## 2. Technical Stack
*   **Framework:** React (via Vite) for lightweight component rendering.
*   **Chess Logic:** `chess.js` for move validation, FEN (Forsyth-Edwards Notation) parsing/generation, and PGN (Portable Game Notation) tracking.
*   **Board UI:** `react-chessboard` for the drag-and-drop interactive interface and coordinate rendering.
*   **Storage:** `localStorage` (or `IndexedDB` via a wrapper like `localforage` for robust long-term storage of multiple games).
*   **PWA Integration:** `vite-plugin-pwa` to auto-generate the web manifest and service worker.

## 3. Data Architecture
Each tracked game requires a lightweight JSON object stored in the browser's local storage:
*   `id`: Unique identifier (UUID or timestamp).
*   `title`: User-defined name (e.g., "Dad vs. Jasper - Summer 2026").
*   `fen`: The current board state string.
*   `pgn`: The complete move history.
*   `orientation`: Which side of the board is at the bottom (white or black).
*   `lastUpdated`: ISO timestamp to sort active games.

## 4. User Interface Layout
### Game Dashboard
*   A landing screen listing all active correspondence games sorted by `lastUpdated`.
*   A prominent button to initialize a "New Game."

### Active Board View
*   **Center:** The interactive 8x8 chessboard.
*   **Controls:** 
    *   "Undo Move" (to correct input errors).
    *   "Flip Board" (to view from the opponent's perspective).
    *   "Copy PGN" (to export the game).
*   **Side Panel:** A scrollable move notation list displaying the algebraic history (e.g., 1. e4 e5 2. Nf3 Nc6).

## 5. Notation Assistance
*   **Coordinate Labels:** Display files (a–h) and ranks (1–8) along the edges of the board to help map physical squares to the digital tracker (utilizing `react-chessboard`'s `showBoardNotation` prop).
*   **Algebraic Notation Legend:** A toggleable modal or static reference card defining standard piece abbreviations: K (King), Q (Queen), R (Rook), B (Bishop), N (Knight). Pawns are designated by destination square. Also define modifiers: x (capture), + (check), # (checkmate), 0-0 (Kingside castle), 0-0-0 (Queenside castle).
*   **Move History Highlighting:** Visually separate the piece letter from the coordinate in the move list (e.g., bolding the leading character: **N**f3 or **B**xc4) for easier transcription.

## 6. Manual Notation Input
*   **Input Interface:** A text input box paired with a "Submit" button (and bound to the 'Enter' key) for rapid transcription from a physical letter or text.
*   **Engine Integration:** Pass the input string into the `chess.move()` method from `chess.js` to natively parse and validate Standard Algebraic Notation (SAN). 
*   **State Updates:** On success, update the board's internal state, render the new FEN, and append the notation to the PGN log.
*   **Error Handling:** Catch rejected moves (illegal, typo, or ambiguous notation like `Nd2` when `Nbd2` is required) and display a brief inline validation error ("Invalid or ambiguous notation"). Do not update the board state on error.
*   **Transcription UX:** Automatically strip leading/trailing whitespace before evaluating the move. Upon successful execution, immediately clear the input box and retain focus on the text field to allow seamless, continuous data entry.