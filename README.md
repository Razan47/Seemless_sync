# Seamless Sync

A web application that facilitates seamless, real-time sharing of text and images between a user's devices.

## Setup Instructions

This project is separated into a `frontend` and a `server` (backend).

### Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`.

### Frontend Setup

1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. By default, Vite runs on `http://localhost:5173`. Open this URL in your browser. 
   *(Note: Vite proxy is pre-configured to point to `localhost:3001` for the API and WebSocket connections)*

## Features
- **Zero Friction:** Create or join a session using a simple 6-character code.
- **Real-time Sync:** Send text messages and share images instantly across devices via Socket.IO.
- **Aesthetic UI:** A responsive, clean interface with a glassmorphism touch.
- **Dark Mode:** Easily toggle between Light and Dark themes.
- **QR Code:** Instantly join sessions from your mobile device by scanning the built-in QR Code.
- **Quick Actions:** One-click copy for texts and download for images.
