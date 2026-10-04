require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MIRO_BASE_URL = 'https://api.miro.com/v2';

// Helper to extract Miro credentials dynamically from headers, query, or body (falling back to .env)
function getMiroCredentials(req) {
  const token = (
    req.headers['x-miro-token'] ||
    req.query.miroToken ||
    req.body?.miroToken ||
    process.env.MIRO_ACCESS_TOKEN ||
    ''
  ).trim();

  let boardId = (
    req.headers['x-miro-board-id'] ||
    req.query.boardId ||
    req.body?.boardId ||
    process.env.MIRO_BOARD_ID ||
    ''
  ).trim();

  // If user pasted a full Miro board URL, extract the ID
  // e.g. https://miro.com/app/board/uXjVEerKs70=/
  if (boardId) {
    const urlMatch = boardId.match(/board\/([a-zA-Z0-9_\-=]+)/);
    if (urlMatch) {
      boardId = urlMatch[1];
    }
    // Clean trailing slashes or quotes
    boardId = boardId.replace(/[\/'"]/g, '');
  }

  return { token, boardId };
}

// Helper to extract AI / Qwen credentials dynamically
function getQwenCredentials(req) {
  const apiKey = (
    req.headers['x-qwen-key'] ||
    req.body?.qwenApiKey ||
    process.env.QWEN_API_KEY ||
    ''
  ).trim();

  const apiUrl = (
    req.headers['x-qwen-url'] ||
    req.body?.qwenApiUrl ||
    process.env.QWEN_API_URL ||
    'https://api-inference.modelscope.ai/v1/chat/completions'
  ).trim();

  const model = (
    req.headers['x-qwen-model'] ||
    req.body?.qwenModel ||
    process.env.QWEN_MODEL ||
    'Qwen-Ambassador/Qwen3.8-Max'
  ).trim();

  return { apiKey, apiUrl, model };
}

// Check configuration status without exposing raw secrets
app.get('/api/config-status', (req, res) => {
  const miro = getMiroCredentials(req);
  const qwen = getQwenCredentials(req);

  res.json({
    hasMiroToken: Boolean(miro.token),
    defaultBoardId: miro.boardId || '',
    hasQwenKey: Boolean(qwen.apiKey),
    qwenApiUrl: qwen.apiUrl,
    qwenModel: qwen.model
  });
});

// List all boards accessible by the current Miro token
app.get('/api/boards', async (req, res) => {
  try {
    const { token } = getMiroCredentials(req);
    if (!token) {
      return res.status(400).json({ error: 'Missing Miro Access Token.' });
    }

    const response = await fetch(`${MIRO_BASE_URL}/boards?limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Failed to fetch boards from Miro (${response.status}): ${errText}`
      });
    }

    const data = await response.json();
    const boards = (data.data || []).map(b => ({
      id: b.id,
      name: b.name || 'Untitled Board',
      description: b.description || '',
      viewLink: b.viewLink || `https://miro.com/app/board/${b.id}/`
    }));

    res.json({ boards });
  } catch (error) {
    console.error('Error fetching Miro boards:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch Miro boards' });
  }
});

// Get sticky notes and board metadata
app.get('/api/sticky-notes', async (req, res) => {
  try {
    const { token, boardId } = getMiroCredentials(req);

    if (!token) {
      return res.status(400).json({
        error: 'Missing Miro Access Token. Please enter a token or configure .env.'
      });
    }

    if (!boardId) {
      return res.status(400).json({
        error: 'Missing Miro Board ID. Select a board or enter your Board ID / URL.'
      });
    }

    // Fetch board info and sticky notes concurrently
    const [boardRes, notesRes] = await Promise.all([
      fetch(`${MIRO_BASE_URL}/boards/${boardId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => null),
      fetch(`${MIRO_BASE_URL}/boards/${boardId}/items?type=sticky_note&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    if (!notesRes.ok) {
      const errText = await notesRes.text();
      console.error(`Miro API error (${notesRes.status}):`, errText);
      return res.status(notesRes.status).json({
        error: `Miro API error (${notesRes.status}): ${errText || notesRes.statusText}`
      });
    }

    let boardInfo = { id: boardId, name: 'Active Board', viewLink: `https://miro.com/app/board/${boardId}/` };
    if (boardRes && boardRes.ok) {
      const bData = await boardRes.json();
      boardInfo = {
        id: bData.id,
        name: bData.name || 'Untitled Board',
        description: bData.description || '',
        viewLink: bData.viewLink || `https://miro.com/app/board/${bData.id}/`
      };
    }

    const data = await notesRes.json();
    const stickyNotes = (data.data || []).map(note => ({
      id: note.id,
      text: note.data && note.data.content ? note.data.content.replace(/<[^>]*>/g, '').trim() : '',
      fillColor: note.style?.fillColor || '#fff9b1',
      position: note.position
    })).filter(note => note.text.length > 0);

    res.json({
      board: boardInfo,
      stickyNotes
    });
  } catch (error) {
    console.error('Error fetching sticky notes:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sticky notes from Miro' });
  }
});

// Create a new sticky note on the Miro board directly from the web app
app.post('/api/sticky-notes', async (req, res) => {
  try {
    const { token, boardId } = getMiroCredentials(req);
    const { text, fillColor = 'light_yellow' } = req.body;

    if (!token || !boardId) {
      return res.status(400).json({ error: 'Missing Miro token or board ID.' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Sticky note content cannot be empty.' });
    }

    const response = await fetch(`${MIRO_BASE_URL}/boards/${boardId}/sticky_notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          content: `<p>${text.trim()}</p>`,
          shape: 'square'
        },
        style: {
          fillColor
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Failed to create sticky note (${response.status}): ${errText}`
      });
    }

    const noteData = await response.json();
    res.json({
      id: noteData.id,
      text: text.trim(),
      fillColor: noteData.style?.fillColor || fillColor
    });
  } catch (error) {
    console.error('Error creating sticky note:', error);
    res.status(500).json({ error: error.message || 'Failed to create sticky note' });
  }
});

// Connect sticky notes using AI
app.post('/api/connect', async (req, res) => {
  try {
    const { notes } = req.body;
    const { apiKey, apiUrl, model } = getQwenCredentials(req);

    if (!apiKey) {
      return res.status(400).json({
        error: 'Missing AI API Key. Please provide your token in settings or .env.'
      });
    }

    if (!notes || notes.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 sticky notes to connect' });
    }

    const notesText = notes.map(n => n.text).join(', ');

    const prompt = `You are an expert creative ideation engine.

You will receive a collection of unrelated sticky notes from a Miro board.

Find surprising but genuinely useful connections between them.

Rules:
- Do not simply combine the words literally.
- Look for conceptual relationships.
- Prefer ideas that could actually be built.
- Each idea must use 2-4 source notes.
- Generate exactly 3 ideas.
- Make each idea substantially different.
- One idea should be practical.
- One should be unusual.
- One should be borderline ridiculous but still logically defensible.
- Avoid generic startup ideas.
- Explain why the selected notes connect.
- Return only valid JSON.

The sticky notes are: ${notesText}

Return this exact JSON structure:
{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "source_notes": ["string", "string"],
      "connection": "string",
      "buildability": 8
    }
  ]
}`;

    const qwenResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a creative ideation assistant. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        response_format: { type: 'json_object' }
      })
    });

    if (!qwenResponse.ok) {
      const errBody = await qwenResponse.json().catch(() => null);
      const errMsg = errBody?.error?.message || (await qwenResponse.text().catch(() => '')) || qwenResponse.statusText;
      console.error(`AI API error (${qwenResponse.status}):`, errMsg);
      return res.status(qwenResponse.status).json({
        error: `AI API error (${qwenResponse.status}): ${errMsg}`
      });
    }

    const qwenData = await qwenResponse.json();
    const content = qwenData.choices[0].message.content;

    let ideas;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        ideas = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    res.json(ideas);
  } catch (error) {
    console.error('Error connecting ideas:', error);
    res.status(500).json({ error: error.message || 'Failed to generate connections with AI' });
  }
});

// Create idea cards on Miro board with connectors
app.post('/api/create-ideas', async (req, res) => {
  try {
    const { token, boardId } = getMiroCredentials(req);
    const { ideas, sourceNotes } = req.body;

    if (!token || !boardId) {
      return res.status(400).json({ error: 'Missing Miro token or board ID.' });
    }

    const baseX = 1500;
    const baseY = 0;
    const spacing = 400;

    const createdIdeas = [];

    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i];

      const contentHtml = `<p><strong>${idea.title}</strong></p><p>${idea.description}</p><p><em>Inspired by: ${(idea.source_notes || []).join(', ')}</em></p><p>Why: ${idea.connection}</p><p>Buildability: ${idea.buildability}/10</p>`;

      const shapeResponse = await fetch(
        `${MIRO_BASE_URL}/boards/${boardId}/shapes`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              content: contentHtml,
              shape: 'round_rectangle'
            },
            style: {
              fillColor: '#1a1a2e',
              fontFamily: 'open_sans',
              fontSize: '14',
              textAlign: 'left',
              color: '#ffffff',
              borderColor: '#7c3aed',
              borderWidth: '2.0'
            },
            position: {
              x: baseX,
              y: baseY + (i * spacing)
            },
            geometry: {
              width: 400,
              height: 300
            }
          })
        }
      );

      if (!shapeResponse.ok) {
        const errText = await shapeResponse.text();
        console.error(`Failed to create shape on Miro (${shapeResponse.status}):`, errText);
        throw new Error(`Failed to create shape on Miro: ${errText || shapeResponse.statusText}`);
      }

      const shapeData = await shapeResponse.json();
      const shapeId = shapeData.id;

      // Draw connectors from matching source sticky notes to the idea shape
      for (const sourceText of (idea.source_notes || [])) {
        const matchingNote = (sourceNotes || []).find(n =>
          n.text.toLowerCase().trim() === sourceText.toLowerCase().trim() ||
          n.text.toLowerCase().includes(sourceText.toLowerCase()) ||
          sourceText.toLowerCase().includes(n.text.toLowerCase())
        );

        if (matchingNote && matchingNote.id) {
          try {
            await fetch(
              `${MIRO_BASE_URL}/boards/${boardId}/connectors`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  startItem: { id: matchingNote.id },
                  endItem: { id: shapeId },
                  style: {
                    strokeColor: '#7c3aed',
                    strokeWidth: '2.0'
                  }
                })
              }
            );
          } catch (connErr) {
            console.warn('Connector creation warning:', connErr.message);
          }
        }
      }

      createdIdeas.push({ ...idea, shapeId });
    }

    res.json({
      success: true,
      ideas: createdIdeas,
      boardUrl: `https://miro.com/app/board/${boardId}/`
    });
  } catch (error) {
    console.error('Error creating ideas on board:', error);
    res.status(500).json({ error: error.message || 'Failed to create ideas on Miro board' });
  }
});

// Make ideas weirder and post them to the board
app.post('/api/make-weirder', async (req, res) => {
  try {
    const { token, boardId } = getMiroCredentials(req);
    const { ideas, sourceNotes } = req.body;
    const { apiKey, apiUrl, model } = getQwenCredentials(req);

    if (!apiKey) {
      return res.status(400).json({ error: 'Missing AI API Key.' });
    }

    const ideasSummary = (ideas || []).map(i => `${i.title}: ${i.description}`).join('\n');

    const prompt = `You previously generated these creative ideas from sticky notes:

${ideasSummary}

Push each idea further. Make them weirder, more ambitious, more unexpected - but still logically defensible. Preserve the core connection but amplify the creativity to 11.

Return the same JSON structure with 3 evolved ideas:
{
  "ideas": [
    {
      "title": "string",
      "description": "string",
      "source_notes": ["string", "string"],
      "connection": "string",
      "buildability": 8
    }
  ]
}`;

    const qwenResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a creative ideation assistant. Push ideas to their creative limits. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1.0,
        response_format: { type: 'json_object' }
      })
    });

    if (!qwenResponse.ok) {
      const errBody = await qwenResponse.json().catch(() => null);
      const errMsg = errBody?.error?.message || (await qwenResponse.text().catch(() => '')) || qwenResponse.statusText;
      console.error(`AI API error (${qwenResponse.status}):`, errMsg);
      return res.status(qwenResponse.status).json({
        error: `AI API error (${qwenResponse.status}): ${errMsg}`
      });
    }

    const qwenData = await qwenResponse.json();
    const content = qwenData.choices[0].message.content;

    let weirderIdeas;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        weirderIdeas = JSON.parse(jsonMatch[0]);
      } else {
        weirderIdeas = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    const baseX = 2100;
    const baseY = 0;
    const spacing = 400;

    const createdIdeas = [];

    if (token && boardId && weirderIdeas.ideas) {
      for (let i = 0; i < weirderIdeas.ideas.length; i++) {
        const idea = weirderIdeas.ideas[i];

        const contentHtml = `<p><strong>🌀 ${idea.title}</strong></p><p>${idea.description}</p><p><em>Inspired by: ${(idea.source_notes || []).join(', ')}</em></p><p>Why: ${idea.connection}</p><p>Buildability: ${idea.buildability}/10</p>`;

        try {
          const shapeResponse = await fetch(
            `${MIRO_BASE_URL}/boards/${boardId}/shapes`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                data: {
                  content: contentHtml,
                  shape: 'round_rectangle'
                },
                style: {
                  fillColor: '#2e1a1a',
                  fontFamily: 'open_sans',
                  fontSize: '14',
                  textAlign: 'left',
                  color: '#ffffff',
                  borderColor: '#ff6b35',
                  borderWidth: '3.0'
                },
                position: {
                  x: baseX,
                  y: baseY + (i * spacing)
                },
                geometry: {
                  width: 400,
                  height: 300
                }
              })
            }
          );

          if (shapeResponse.ok) {
            const shapeData = await shapeResponse.json();
            createdIdeas.push({ ...idea, shapeId: shapeData.id });
          } else {
            createdIdeas.push(idea);
          }
        } catch (e) {
          createdIdeas.push(idea);
        }
      }
    }

    res.json({
      ideas: weirderIdeas.ideas,
      created: createdIdeas,
      boardUrl: boardId ? `https://miro.com/app/board/${boardId}/` : null
    });
  } catch (error) {
    console.error('Error making ideas weirder:', error);
    res.status(500).json({ error: error.message || 'Failed to amplify ideas with AI' });
  }
});

// Serve index.html for root and any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🎰 Sticky Note Roulette running on http://localhost:${PORT}`);
  });
}

module.exports = app;
