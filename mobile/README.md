# Sticky Note Roulette — Mobile (Expo Go) 🎰📱

A cross-platform React Native / Expo Go mobile client for **Sticky Note Roulette** (Miro × Qwen AI).

---

## Features

- **🎰 Slot Machine Roulette Engine**: Spin reel with live stage progression messages (*"Analyzing conceptual friction..."* $\to$ *"Consulting Qwen 3.8 Max..."* $\to$ *"Syncing to Miro board..."*).
- **📝 Real-time Miro Sticky Notes**: 2-column pastel note canvas with pushpin design, live search, multi-selection, and a **🎲 Random 4** quick picker.
- **✨ Synergistic Idea Cards**: Practical Anchor (#01), Creative Leap (#02), and Borderline Ridiculous (#03) cards with interactive **buildability meters**, source pills, and connection rationales.
- **🌀 "Make It Weirder" (Level 11 Creativity)**: Fiery vortex amplifier generating high-weirdness anomalies plotted at coordinate `x:2100` on your Miro board.
- **📳 Tactile Haptics**: Full physical haptic sensations on spin triggers, note selection, and idea generation.
- **🔒 Secure Credential Vault**: Miro Access Token and Qwen API Keys are stored encrypted using `expo-secure-store`.
- **⚡ In-App Board Switcher & Diagnostics**: Switch between accessible boards, paste board URLs directly, and run live server connectivity checks.

---

## Quick Start (Expo Go)

### 1. Start the Backend (if running locally)
In the project root directory:
```bash
npm start
```
By default, the server runs on port `3000`.

### 2. Start the Mobile App
From the `mobile/` directory:
```bash
cd mobile
npx expo start
```

### 3. Open on Your Phone
- **Same Wi-Fi network**: Scan the terminal QR code with your Camera (iOS) or the **Expo Go** app (Android).
- **Different Wi-Fi / Mobile Data**: Start with tunneling:
  ```bash
  npx expo start --tunnel
  ```

---

## Configuring Connection in Mobile App

1. Open the app in Expo Go.
2. Tap the **Settings** tab (gear icon at the bottom right).
3. Under **Mobile Backend API**:
   - If using **local machine**: enter `http://<YOUR-PC-LAN-IP>:3000` (e.g. `http://192.168.1.100:3000`).
   - If using **Vercel**: enter your deployment URL (e.g. `https://your-app.vercel.app`).
4. Tap **Test Server & Credentials** to verify real-time connectivity with both Miro and Qwen AI.
5. Tap **Save & Apply**.
