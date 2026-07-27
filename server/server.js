const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "success", message: "Seamless Sync Backend is operational!" });
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadsDir));

const sessions = {};

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const sessionId = req.body.sessionId;
  const imageUrl = `/uploads/${req.file.filename}`;
  
  if (sessionId && sessions[sessionId]) {
    const message = {
      id: uuidv4(),
      type: 'image',
      content: imageUrl,
      timestamp: new Date().toISOString(),
      senderId: req.body.senderId || 'unknown'
    };
    sessions[sessionId].messages.push(message);
    io.to(sessionId).emit('receive-message', message);
  }

  res.json({ imageUrl, message: 'File uploaded successfully' });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    if (!sessions[sessionId]) {
      sessions[sessionId] = { messages: [] };
    }
    socket.emit('session-history', sessions[sessionId].messages);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  socket.on('send-message', (data, callback) => {
    const { sessionId, content, senderId } = data;
    if (sessions[sessionId]) {
      const message = {
        id: uuidv4(),
        type: 'text',
        content,
        timestamp: new Date().toISOString(),
        senderId
      };
      sessions[sessionId].messages.push(message);
      io.to(sessionId).emit('receive-message', message);
      if (typeof callback === 'function') {
        callback({ status: 'ok', message });
      }
    } else if (typeof callback === 'function') {
      callback({ status: 'error', error: 'Session not found' });
    }
  });

  socket.on('clear-session', (sessionId) => {
    if (sessions[sessionId]) {
      sessions[sessionId].messages = [];
      io.to(sessionId).emit('session-cleared');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
