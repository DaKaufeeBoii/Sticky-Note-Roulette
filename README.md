# Sticky Note Roulette 🎰

Random thoughts → Miro → Qwen → unexpected connections → new ideas on your board.

A prototype that connects Miro's visual collaboration with Qwen's AI creativity. Add random sticky notes to a Miro board, press a button, and watch AI find impossible connections between unrelated ideas.

---

## Setup (5 minutes)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd sticky-note-roulette
npm install
```

### 2. Get Your API Keys

#### Miro Access Token:
1. Go to https://miro.com/app/settings/user-profile/apps
2. Create a new app
3. Generate an access token with these scopes:
   - `boards:read`
   - `boards:write`
4. Copy the token

#### Miro Board ID:
1. Open your Miro board
2. The board ID is in the URL: `https://miro.com/app/board/[THIS-IS-YOUR-BOARD-ID]/`

#### Qwen API Key:
1. Go to https://dashscope.console.aliyun.com/
2. Sign up or log in
3. Create an API key
4. Copy the key

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
MIRO_ACCESS_TOKEN=your_miro_access_token_here
MIRO_BOARD_ID=your_board_id_here
QWEN_API_KEY=your_qwen_api_key_here
QWEN_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
QWEN_MODEL=qwen-plus
PORT=3000
```

### 4. Add Sticky Notes to Your Miro Board

Add at least 2 sticky notes with random topics. For best results, use 6-8 unrelated ideas like:
- Pokémon
- Hyderabad
- Rain
- Coffee
- AI
- Cricket
- Traffic
- College

### 5. Run the App

```bash
npm start
```

Open http://localhost:3000

### 6. Click "Connect the Impossible"

Watch as AI finds surprising connections and creates new idea cards on your Miro board.

### 7. Click "Make It Weirder"

Push the ideas even further.

---

## How It Works

1. Reads sticky notes from your Miro board via the Miro REST API
2. Sends them to Qwen (`qwen-plus` model) with a creative ideation prompt
3. Qwen finds surprising connections and generates 3 ideas:
   - One practical
   - One unusual
   - One borderline ridiculous but still logically defensible
4. Ideas are written back to the board as visually distinct cards with connectors
5. "Make It Weirder" pushes the ideas further with amplified creativity

---

## Demo in 90 Seconds

1. Pre-populate a board with: Pokémon, Hyderabad, Rain, Coffee, AI, Cricket, Traffic, College
2. Run `npm start`
3. Open `http://localhost:3000`
4. Click "Connect the Impossible"
5. Watch ideas appear on the board
6. Click "Make It Weirder"
7. Show the board — it IS the output

---

## Project Structure

```
sticky-note-roulette/
├── package.json        # Dependencies
├── .env.example        # Environment template
├── server.js           # Express server with Miro + Qwen integration
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Dark, playful styling
│   └── app.js          # Frontend logic
└── README.md           # This file
```

---

## Tech Stack

- **Backend**: Node.js + Express
- **Miro Integration**: `@mirohq/miro-api` + REST API
- **AI**: Qwen (`qwen-plus`) via OpenAI-compatible API
- **Frontend**: Vanilla JS, no frameworks

---

## Troubleshooting

### No sticky notes found:
- Make sure you've added sticky notes to your Miro board
- Check that your `MIRO_BOARD_ID` is correct

### Miro API errors:
- Verify your `MIRO_ACCESS_TOKEN` has `boards:read` and `boards:write` scopes
- Check that the token hasn't expired

### Qwen API errors:
- Verify your `QWEN_API_KEY` is valid
- Check your Alibaba Cloud account has credits

### Ideas not appearing on board:
- Refresh your Miro board
- Check the server console for errors

---

## Extending the Prototype

Ideas for next steps:
- Add support for images/shapes, not just sticky notes
- Let users select which sticky notes to connect
- Add different AI "personalities" (practical, absurd, poetic)
- Generate visual diagrams, not just text cards
- Multi-board support
- Collaborative sessions with multiple users

---

## License

MIT — Do whatever you want with this.

*Built with Miro + Qwen + coffee ☕*
