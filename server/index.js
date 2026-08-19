require('dotenv').config();
require('./seed');

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { router: authRouter } = require('./routes/auth');
const { router: lessonsRouter } = require('./routes/lessons');
const { router: vocabRouter } = require('./routes/vocab');
const { router: messagesRouter } = require('./routes/messages');
const { router: tutorRouter } = require('./routes/tutor');
const { router: profileRouter } = require('./routes/profile');
const { router: contentImportRouter } = require('./routes/content-import');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, aiConfigured: !!process.env.ANTHROPIC_API_KEY });
});

app.use('/api/auth', authRouter);
app.use('/api/lessons', lessonsRouter);
app.use('/api/vocab', vocabRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/profile', profileRouter);
app.use('/api/content-import', contentImportRouter);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});