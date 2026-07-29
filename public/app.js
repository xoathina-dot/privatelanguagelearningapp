(function () {
  'use strict';

  const state = {
    user: null,
    partner: null,
    tab: 'home',
    lessons: null,
    lastPartnerMessage: null,
    vocab: [],
    vocabMeta: null,
    vocabFilter: 'all',
    messages: [],
    messageDraft: '',
    vocabAddOpen: false,
    contentImportType: 'lesson',
    contentImportJson: '',
    contentImportStatus: null,
    contentImportLoading: false,
    checkResult: null,
    checkLoading: false,
    tutorMessages: [],
    tutorChips: [],
    tutorDraft: '',
    tutorLoading: false,
    profile: null,
    quiz: null,
    aiConfigured: true,
  };

  const TAB_META = [
    { id: 'home', icon: '⌂', label: 'Αρχική' },
    { id: 'lessons', icon: '▤', label: 'Μαθήματα' },
    { id: 'tutor', icon: '✦', label: 'Δάσκαλος' },
    { id: 'messages', icon: '✉', label: 'Μηνύματα' },
    { id: 'vocab', icon: '☰', label: 'Λεξικό' },
  ];

  const HEADER_META = {
    home: ['Καλημέρα', 'Home'],
    lessons: ['Μαθήματα', 'Lessons'],
    tutor: ['Δάσκαλος AI', 'AI Tutor'],
    messages: ['Μηνύματα', 'Messages'],
    vocab: ['Λεξιλόγιο', 'Vocabulary'],
    profile: ['Προφίλ', 'Profile'],
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function api(path, options) {
    const opts = Object.assign({ credentials: 'include' }, options || {});
    if (opts.body && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    }
    const res = await fetch('/api' + path, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'request_failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  const root = document.getElementById('app-root');
  const loginScreen = document.getElementById('login-screen');

  // ---------- Boot ----------
  async function boot() {
    try {
      const health = await api('/health');
      state.aiConfigured = !!health.aiConfigured;
    } catch (e) { /* ignore */ }

    try {
      const me = await api('/auth/me');
      state.user = me.user;
      state.partner = me.partner;
      applyDarkMode();
      showApp();
      await goTab('home');
    } catch (e) {
      showLogin();
    }
  }

  function showLogin() {
    loginScreen.hidden = false;
    root.hidden = true;
  }

  function showApp() {
    loginScreen.hidden = true;
    root.hidden = false;
  }

  function applyDarkMode() {
    document.body.classList.toggle('dark', !!(state.user && state.user.darkMode));
  }

  // ---------- Login form ----------
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errBox = document.getElementById('login-error');
    errBox.hidden = true;
    try {
      const result = await api('/auth/login', { method: 'POST', body: { username, password } });
      state.user = result.user;
      applyDarkMode();
      const me = await api('/auth/me');
      state.partner = me.partner;
      showApp();
      await goTab('home');
    } catch (err) {
      errBox.textContent = 'Falscher Benutzername oder falsches Passwort.';
      errBox.hidden = false;
    }
  });

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    state.user = null;
    state.partner = null;
    document.body.classList.remove('dark');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
    showLogin();
  }

  // ---------- Navigation ----------
  async function goTab(tab) {
    state.tab = tab;
    render();
    try {
      if (tab === 'home') await loadHome();
      else if (tab === 'lessons') await loadLessons();
      else if (tab === 'tutor') await loadTutor();
      else if (tab === 'messages') await loadMessages();
      else if (tab === 'vocab') await loadVocab();
      else if (tab === 'profile') await loadProfile();
    } catch (e) {
      if (e.status === 401) { showLogin(); return; }
      console.error(e);
    }
    render();
  }

  async function toggleDarkMode() {
    const result = await api('/profile/toggle-dark', { method: 'POST' });
    state.user.darkMode = result.darkMode;
    applyDarkMode();
    render();
  }

  // ---------- Data loaders ----------
  async function loadHome() {
    const [lessons, msgs] = await Promise.all([
      api('/lessons'),
      api('/messages'),
    ]);
    state.lessons = lessons;
    const incoming = msgs.messages.filter(m => m.from === 'her');
    state.lastPartnerMessage = incoming.length ? incoming[incoming.length - 1] : null;
  }

  async function loadLessons() {
    state.lessons = await api('/lessons');
  }

  async function loadTutor() {
    const [msgs, chips] = await Promise.all([
      api('/tutor/messages'),
      api('/tutor/chips'),
    ]);
    state.tutorMessages = msgs.messages;
    state.tutorChips = chips.chips;
  }

  async function loadMessages() {
    const msgs = await api('/messages');
    state.messages = msgs.messages;
  }

  async function loadVocab() {
    const v = await api('/vocab');
    state.vocab = v.vocab;
    state.vocabMeta = { isCompanionView: v.isCompanionView, learnerDisplayName: v.learnerDisplayName, courseLabel: v.courseLabel };
  }

  async function loadProfile() {
    state.profile = await api('/profile');
  }

  // ---------- Actions ----------
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getLang() {
    const tl = state.user?.target_lang || 'de';
    return tl === 'de' ? 'de-DE' : 'el-GR';
  }

  function speakListening(text, lang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.88;
    window.speechSynthesis.speak(utt);
  }

  async function openLesson(lessonId) {
    try {
      const data = await api('/lessons/' + encodeURIComponent(lessonId) + '/quiz');
      const firstQ = data.quiz[0];
      state.quiz = {
        lessonId,
        unitTitle: data.unitTitle,
        lessonTitle: data.lessonTitle,
        xp: data.xp,
        isReview: !!data.isReview,
        questions: data.quiz,
        index: 0,
        selected: null,
        correctCount: 0,
        done: false,
        earnedXp: 0,
        animationPlayed: false,
        wordOrderAnswer: [],
        wordOrderBank: firstQ?.type === 'word-order' ? shuffle(firstQ.words) : [],
      };
      render();
      if (firstQ?.type === 'listening') speakListening(firstQ.prompt, getLang());
    } catch (e) { console.error(e); }
  }

  function closeQuiz() {
    state.quiz = null;
    render();
  }

  function selectAnswer(opt) {
    const q = state.quiz;
    if (!q || q.selected) return;
    const question = q.questions[q.index];
    q.selected = opt;
    if (opt === question.answer) q.correctCount += 1;
    render();
  }

  async function quizNext() {
    const q = state.quiz;
    if (!q) return;
    if (q.index + 1 >= q.questions.length) {
      try {
        const result = await api('/lessons/' + encodeURIComponent(q.lessonId) + '/complete', {
          method: 'POST',
          body: { correctCount: q.correctCount, totalCount: q.questions.length },
        });
        state.lessons = { units: result.units, streak: result.streak, xp: result.xp, level: result.level, dailyGoalPct: result.dailyGoalPct, dailyGoalLabel: result.dailyGoalLabel };
        q.done = true;
        q.animationPlayed = false;
        q.earnedXp = result.xpEarned || q.xp;
      } catch (e) { console.error(e); }
    } else {
      q.index += 1;
      q.selected = null;
      const nextQ = q.questions[q.index];
      if (nextQ?.type === 'word-order') {
        q.wordOrderAnswer = [];
        q.wordOrderBank = shuffle(nextQ.words);
      } else {
        q.wordOrderAnswer = [];
        q.wordOrderBank = [];
      }
    }
    render();
    // Auto-speak listening questions when advancing to them.
    const curQ = state.quiz?.questions[state.quiz?.index];
    if (!state.quiz?.done && curQ?.type === 'listening') speakListening(curQ.prompt, getLang());
  }

  async function toggleVocabFav(vocabId) {
    await api('/vocab/' + encodeURIComponent(vocabId) + '/toggle-favorite', { method: 'POST' });
    await loadVocab();
    render();
  }

  function setVocabFilter(f) {
    state.vocabFilter = f;
    render();
  }

  async function toggleMessageTranslation(msg, el) {
    if (msg._showTranslation) { msg._showTranslation = false; render(); return; }
    if (msg._translation) { msg._showTranslation = true; render(); return; }
    try {
      const result = await api('/messages/' + msg.id + '/translate', { method: 'POST' });
      msg._translation = result.translation;
      msg._showTranslation = true;
      render();
    } catch (e) {
      if (e.data && e.data.error === 'missing_api_key') {
        msg._translation = '(KI-Übersetzung nicht konfiguriert — ANTHROPIC_API_KEY fehlt)';
        msg._showTranslation = true;
        render();
      } else { console.error(e); }
    }
  }

  async function sendMessage() {
    const text = state.messageDraft.trim();
    if (!text) return;
    state.messageDraft = '';
    state.checkResult = null;
    try {
      const result = await api('/messages', { method: 'POST', body: { text } });
      state.messages.push(result.message);
      render();
    } catch (e) { console.error(e); }
  }

  async function checkMessageDraft() {
    const text = state.messageDraft.trim();
    if (!text) return;
    state.checkLoading = true;
    render();
    try {
      const result = await api('/messages/check', { method: 'POST', body: { text } });
      state.checkResult = result.correction;
    } catch (e) {
      state.checkResult = e.data && e.data.error === 'missing_api_key'
        ? 'KI-Korrektur nicht konfiguriert — ANTHROPIC_API_KEY fehlt.'
        : 'Korrektur momentan nicht verfügbar.';
    }
    state.checkLoading = false;
    render();
  }

  async function sendTutorText(text) {
    const t = (text || '').trim();
    if (!t) return;
    state.tutorDraft = '';
    state.tutorMessages.push({ id: 'tmp-' + Date.now(), from: 'me', text: t });
    state.tutorLoading = true;
    render();
    try {
      const result = await api('/tutor/messages', { method: 'POST', body: { text: t } });
      state.tutorMessages = result.messages;
    } catch (e) {
      if (e.data && e.data.error === 'missing_api_key') {
        state.tutorMessages.push({ id: 'err-' + Date.now(), from: 'ai', text: '(KI-Tutor nicht konfiguriert — ANTHROPIC_API_KEY fehlt.)' });
      } else {
        state.tutorMessages.push({ id: 'err-' + Date.now(), from: 'ai', text: 'Entschuldigung, da ist etwas schiefgelaufen.' });
      }
    }
    state.tutorLoading = false;
    render();
  }

  // ---------- Rendering ----------
  function render() {
    if (!state.user) return;
    const [title, sub] = HEADER_META[state.tab] || ['', ''];
    const headerTitle = state.tab === 'home' ? `Καλημέρα, ${escapeHtml(state.user.displayName)}` : title;

    root.innerHTML = `
      <div class="phone">
        <div class="header">
          <div>
            <div class="header-title">${headerTitle}</div>
            <div class="header-sub">${sub}</div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" data-action="toggle-dark">${state.user.darkMode ? '☀' : '☾'}</button>
            <button class="avatar-btn" data-action="go-profile">${escapeHtml(state.user.avatarInitial)}</button>
          </div>
        </div>
        <div class="content">
          ${renderTabContent()}
        </div>
        ${state.quiz ? renderQuiz() : ''}
        <div class="tabbar">
          ${TAB_META.map(t => `
            <button class="tab-btn ${state.tab === t.id ? 'active' : ''}" data-action="go-tab" data-tab="${t.id}">
              <div class="tab-icon">${t.icon}</div>
              <div class="tab-label">${t.label}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    attachHandlers();
  }

  function renderTabContent() {
    switch (state.tab) {
      case 'home': return renderHome();
      case 'lessons': return renderLessons();
      case 'tutor': return renderTutor();
      case 'messages': return renderMessages();
      case 'vocab': return renderVocab();
      case 'profile': return renderProfile();
      default: return '';
    }
  }

  function currentLessonInfo() {
    if (!state.lessons) return null;
    for (const unit of state.lessons.units) {
      const lesson = unit.lessons.find(l => l.state === 'current');
      if (lesson) return { unit, lesson };
    }
    return null;
  }

  function renderHome() {
    if (!state.lessons) return '';
    const l = state.lessons;
    const isCompanion = !!l.isCompanionView;
    const current = currentLessonInfo();

    if (isCompanion && !l.learnerDisplayName) {
      return `<div class="empty-state">Noch kein verbundener Partner-Account gefunden.</div>`;
    }

    return `
      ${isCompanion ? `<div class="section-row" style="margin-bottom:8px"><h6>Fortschritt von ${escapeHtml(l.learnerDisplayName)}</h6></div>` : ''}
      <div class="stat-grid">
        <div class="stat-card stat-streak"><div class="value"><span class="gg-flame">🔥</span> ${l.streak}</div><div class="label">Σερί<br>Streak</div></div>
        <div class="stat-card stat-xp"><div class="value">${l.xp}</div><div class="label">XP<br>Total</div></div>
        <div class="stat-card stat-level"><div class="value">${l.level}</div><div class="label">Επίπεδο<br>Level</div></div>
      </div>
      <div class="section-row">
        <h6>Σημερινός στόχος · Daily goal</h6>
        <span>${l.dailyGoalLabel}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${l.dailyGoalPct}%"></div></div>

      ${current ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${escapeHtml(current.lesson.title)}</div>
            <span class="pill-xp">+${current.lesson.xp} XP</span>
          </div>
          <div class="card-sub">${escapeHtml(current.unit.sub)} · Ενότητα: ${escapeHtml(current.unit.title)}</div>
          ${isCompanion
            ? `<button class="btn-cta" data-action="go-tab" data-tab="lessons">Δες την πρόοδό του/της →</button>`
            : `<button class="btn-cta" data-action="open-lesson" data-lesson="${current.lesson.id}">Ξεκίνα το μάθημα →</button>`}
        </div>
      ` : `
        <div class="card"><div class="card-sub">Όλα τα μαθήματα ολοκληρώθηκαν προς το παρόν 🎉</div></div>
      `}

      <div class="tip-card">
        <div class="tip-title">✦ Πρόταση AI · AI suggests</div>
        <div class="tip-text">${isCompanion
          ? 'Ρώτα τον Δάσκαλο AI πώς να τον/την υποστηρίξεις σήμερα.'
          : 'Ρώτα τον Δάσκαλο AI για ό,τι σε μπερδεύει σήμερα, ή εξασκήσου σε έναν διάλογο.'}</div>
      </div>

      ${state.lastPartnerMessage ? `
        <button class="note-card" data-action="go-tab" data-tab="messages">
          <div>
            <div class="note-text">«${escapeHtml(truncate(state.lastPartnerMessage.text, 80))}»</div>
            <div class="note-sub">Νέο μήνυμα · New message</div>
          </div>
        </button>
      ` : ''}
    `;
  }

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n - 1) + '…' : str;
  }

  function renderLessons() {
    if (!state.lessons) return '';
    const isCompanion = !!state.lessons.isCompanionView;
    if (isCompanion && !state.lessons.learnerDisplayName) {
      return `<div class="empty-state">Noch kein verbundener Partner-Account gefunden.</div>`;
    }
    const heading = isCompanion
      ? `<div class="section-row" style="margin-bottom:8px"><h6>Η πρόοδος του/της ${escapeHtml(state.lessons.learnerDisplayName)}</h6></div>`
      : '';
    return heading + state.lessons.units.map(unit => `
      <div class="unit-block ${unit.isReview ? 'unit-block-review' : ''}">
        <div class="unit-head">
          <div>
            <div class="unit-title">${unit.isReview ? '↺ ' : ''}${escapeHtml(unit.title)}</div>
            <div class="unit-sub">${escapeHtml(unit.sub)}</div>
          </div>
          <span class="unit-level ${unit.isReview ? 'unit-level-review' : ''}">${escapeHtml(unit.level)}</span>
        </div>
        <div class="lesson-list">
          ${unit.lessons.map(lesson => {
            const isReview = !!lesson.isReview;
            const dotContent = isReview
              ? (lesson.state === 'done' ? '✓' : '↺')
              : (lesson.state === 'done' ? '✓' : lesson.state === 'current' ? '▸' : '•');
            const dotClass = lesson.state === 'done'
              ? 'background:color-mix(in srgb, var(--color-accent) 18%, transparent);color:var(--color-accent-700)'
              : lesson.state === 'current'
                ? (isReview ? 'background:var(--c-lavender);color:#fff' : 'background:var(--color-accent);color:#fff')
                : 'background:color-mix(in srgb, var(--color-text) 8%, transparent);color:var(--c-muted)';
            const clickable = !isCompanion && (lesson.state === 'done' || lesson.state === 'current');
            return `
              <button class="lesson-row ${clickable ? 'active' : 'locked'}" ${clickable ? `data-action="open-lesson" data-lesson="${lesson.id}"` : 'disabled'}>
                <div class="lesson-dot" style="${dotClass}">${dotContent}</div>
                <div class="lesson-body">
                  <div class="lesson-title">${escapeHtml(lesson.title)}</div>
                  <div class="lesson-sub">${escapeHtml(lesson.sub)}</div>
                </div>
                ${isReview
                  ? `<span class="lesson-tag lesson-tag-review">↺ Wiederholung</span>`
                  : `<span class="lesson-tag">+${lesson.xp} XP</span>`}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderTutor() {
    const isCompanion = state.user.role === 'companion';
    return `
      <div class="chat-intro">
        <div class="primary">${isCompanion
          ? 'Ρώτα με πώς να τον/την υποστηρίξεις, ή τι μαθαίνει αυτή τη στιγμή.'
          : 'Ρώτα με για γραμματική, λεξιλόγιο ή εξάσκησε μια συζήτηση.'}</div>
      </div>
      <div class="chat-list">
        ${state.tutorMessages.map(m => `
          <div class="bubble-row ${m.from === 'me' ? 'me' : 'her'}">
            <div class="bubble" style="background:${m.from === 'me' ? 'var(--color-accent)' : 'color-mix(in srgb, var(--c-lavender) 14%, var(--c-surface))'};color:${m.from === 'me' ? '#fff' : 'var(--color-text)'}">${escapeHtml(m.text)}</div>
          </div>
        `).join('')}
        ${state.tutorLoading ? `<div class="bubble-row her"><div class="bubble" style="background:color-mix(in srgb, var(--c-lavender) 14%, var(--c-surface))">…</div></div>` : ''}
      </div>
      <div class="chip-row">
        ${state.tutorChips.map(c => `<button class="chip" data-action="tutor-chip" data-text="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
      </div>
      <div class="composer">
        <input class="input" id="tutor-input" placeholder="Γράψε στα ελληνικά ή γερμανικά…" value="${escapeHtml(state.tutorDraft)}" />
        <button class="btn-send" data-action="tutor-send">Στείλε</button>
      </div>
    `;
  }

  const COMPANION_CHIPS = [
    'Bravo, weiter so! 💪',
    'Ich bin stolz auf dich 🌟',
    'Lust auf eine kleine Deutsch-Runde heute Abend? 😊',
    'Du schaffst das! 🎉',
    'Wie war dein heutiges Üben? ✨',
  ];

  function renderMessages() {
    const isCompanion = state.user && state.user.role === 'companion';
    return `
      <div class="chat-list">
        ${state.messages.map(m => `
          <div class="bubble-row ${m.from === 'me' ? 'me' : 'her'}" style="flex-direction:column;align-items:${m.from === 'me' ? 'flex-end' : 'flex-start'}">
            <button class="bubble" data-action="translate-msg" data-id="${m.id}" style="background:${m.from === 'me' ? 'var(--c-coral)' : 'color-mix(in srgb, var(--c-coral) 12%, var(--c-surface))'};color:${m.from === 'me' ? '#fff' : 'var(--color-text)'}">${escapeHtml(m.text)}</button>
            ${m._showTranslation ? `<div class="bubble-translation">${escapeHtml(m._translation || '')}</div>` : ''}
            ${m.correction ? `<div class="bubble-correction">✓ ${escapeHtml(m.correction)}</div>` : ''}
          </div>
        `).join('')}
        ${!state.messages.length ? '<div class="empty-state">Noch keine Nachrichten. Schreib die erste!</div>' : ''}
      </div>
      ${state.checkResult ? `
        <div class="check-result">
          <div class="label">Διόρθωση AI · AI correction</div>
          <div class="text">${escapeHtml(state.checkResult)}</div>
        </div>
      ` : ''}
      ${isCompanion ? `
        <div class="chip-row" style="padding:6px 0 2px">
          ${COMPANION_CHIPS.map(c => `<button class="chip" data-action="msg-chip" data-text="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}
        </div>
      ` : ''}
      <div class="composer">
        <input class="input" id="message-input" placeholder="Γράψε ένα μήνυμα…" value="${escapeHtml(state.messageDraft)}" />
        <button class="btn-check" data-action="check-message">${state.checkLoading ? '…' : 'Έλεγχος'}</button>
        <button class="btn-send coral" data-action="send-message">Στείλε</button>
      </div>
    `;
  }

  function renderVocab() {
    const filters = [
      { id: 'all', label: 'Όλα' },
      { id: 'fav', label: 'Αγαπημένα' },
      { id: 'Δικά μας', label: 'Δικά μας' },
      { id: 'Personal', label: 'Προσωπικά' },
      { id: 'Family', label: 'Οικογένεια' },
      { id: 'Everyday', label: 'Καθημερινά' },
      { id: 'Phrases', label: 'Φράσεις' },
      { id: 'Life', label: 'Γερμανία' },
    ];
    const catColor = {
      Personal: 'var(--c-coral)', Everyday: 'var(--color-accent)',
      Phrases: 'var(--c-lavender)', Family: 'var(--c-mustard)',
      Life: 'var(--color-accent-700)', 'Δικά μας': 'var(--c-lavender)',
    };
    const list = state.vocab.filter(v => {
      if (state.vocabFilter === 'all') return true;
      if (state.vocabFilter === 'fav') return v.fav;
      return v.cat === state.vocabFilter;
    });
    return `
      <div class="section-row" style="margin-bottom:4px">
        ${state.vocabMeta && state.vocabMeta.isCompanionView && state.vocabMeta.learnerDisplayName
          ? `<h6>Λεξιλόγιο: ${escapeHtml(state.vocabMeta.learnerDisplayName)}</h6>`
          : '<h6>Λεξιλόγιο</h6>'}
        <button class="chip" style="padding:4px 12px;font-size:13px" data-action="vocab-add-open">+ Neu</button>
      </div>
      ${state.vocabAddOpen ? `
        <div class="card" style="margin-bottom:12px;padding:14px">
          <div style="display:flex;flex-direction:column;gap:8px">
            <input class="input" id="vocab-input-target" placeholder="Zielsprache-Wort (z.B. das Haus)" />
            <input class="input" id="vocab-input-native" placeholder="Übersetzung / Μετάφραση" />
            <input class="input" id="vocab-input-note" placeholder="Notiz (optional)" />
            <select class="input" id="vocab-input-cat">
              <option value="Δικά μας">Δικά μας (Standard)</option>
              <option value="Personal">Προσωπικά</option>
              <option value="Family">Οικογένεια</option>
              <option value="Everyday">Καθημερινά</option>
              <option value="Phrases">Φράσεις</option>
              <option value="Life">Γερμανία</option>
            </select>
            <div style="display:flex;gap:8px">
              <button class="btn-primary" style="flex:1;padding:10px 0" data-action="vocab-add-submit">Speichern</button>
              <button class="btn-cancel" data-action="vocab-add-cancel">✕</button>
            </div>
          </div>
        </div>
      ` : ''}
      <div class="chip-row">
        ${filters.map(f => `
          <button class="chip vocab-chip ${state.vocabFilter === f.id ? 'active' : ''}" data-action="vocab-filter" data-filter="${f.id}">${f.label}</button>
        `).join('')}
      </div>
      <div class="vocab-list">
        ${list.map(v => `
          <div class="vocab-row">
            <div class="vocab-bar" style="background:${catColor[v.cat] || 'var(--color-accent)'}"></div>
            <div class="vocab-body">
              <div class="vocab-target">${escapeHtml(v.target)}</div>
              <div class="vocab-native">${escapeHtml(v.native)}</div>
              <div class="vocab-note">${escapeHtml(v.note)}${v.isCustom && v.addedByName ? (v.note ? ' · ' : '') + '+ ' + escapeHtml(v.addedByName) : ''}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;align-items:center">
              <button class="star-btn" data-action="toggle-fav" data-id="${v.id}" style="background:${v.fav ? 'var(--c-mustard)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)'};color:${v.fav ? '#fff' : 'var(--c-muted)'}">★</button>
              ${v.isCustom ? `<button class="trash-btn" data-action="vocab-delete" data-id="${v.id.replace('custom_', '')}">✕</button>` : ''}
            </div>
          </div>
        `).join('')}
        ${!list.length ? '<div class="empty-state">Keine Einträge in diesem Filter.</div>' : ''}
      </div>
    `;
  }

  function renderProfile() {
    if (!state.profile) return '';
    const p = state.profile;
    const isCompanion = p.role === 'companion';
    return `
      <div class="profile-head">
        <div class="profile-avatar">${escapeHtml(p.avatarInitial)}</div>
        <div>
          <div class="profile-name">${escapeHtml(p.displayName)}</div>
          <div class="profile-sub">${isCompanion
            ? `Υποστηρίζει${p.partnerDisplayName ? ': ' + escapeHtml(p.partnerDisplayName) : ''}`
            : `Μαθαίνει ${escapeHtml(p.targetLangLabel || '')}`}</div>
        </div>
      </div>
      <div class="profile-stats">
        <div class="stat-card stat-streak"><div class="value">${p.streak}</div><div class="label">${isCompanion ? 'Σερί ημερών (δικό του/της)' : 'Σερί ημερών'}</div></div>
        <div class="stat-card stat-xp"><div class="value">${p.xp}</div><div class="label">${isCompanion ? 'Σύνολο XP (δικό του/της)' : 'Σύνολο XP'}</div></div>
      </div>
      <div class="profile-list">
        <div class="profile-row"><span>${isCompanion ? 'Ο/Η σύντροφός σου μαθαίνει' : 'Γλώσσα εκμάθησης'}</span><span class="value">${escapeHtml(p.targetLangLabel || '—')}</span></div>
        <div class="profile-row"><span>Επίπεδο</span><span class="value">${escapeHtml(p.levelProgressLabel)}</span></div>
        <div class="profile-row"><span>Συνδεδεμένη επαφή</span><span class="value">${escapeHtml(p.partnerDisplayName || '—')}</span></div>
        <div class="profile-row">
          <span>Ειδοποιήσεις</span>
          <button class="toggle ${p.notificationsEnabled ? 'on' : ''}" data-action="toggle-notifications"><span class="knob"></span></button>
        </div>
      </div>
      <div class="profile-section-label">Content hinzufügen</div>
      <div class="import-section">
        <div class="import-type-row">
          <label class="import-type-label ${state.contentImportType === 'lesson' ? 'selected' : ''}">
            <input type="radio" name="importtype" value="lesson" ${state.contentImportType === 'lesson' ? 'checked' : ''}> Lektion
          </label>
          <label class="import-type-label ${state.contentImportType === 'unit' ? 'selected' : ''}">
            <input type="radio" name="importtype" value="unit" ${state.contentImportType === 'unit' ? 'checked' : ''}> Neue Einheit
          </label>
        </div>
        <div class="import-hint">${state.contentImportType === 'lesson'
          ? '{ "unitId": "u5", "title": "…", "sub": "…", "xp": 15, "quiz": [{"prompt":"…","translation":"…","answer":"…","options":["…","…"]}] }'
          : '{ "title": "…", "sub": "…", "level": "A1", "lessons": [{"title":"…","sub":"…","xp":15,"quiz":[{"prompt":"…","translation":"…","answer":"…","options":["…","…"]}]}] }'
        }</div>
        <textarea class="input import-textarea" id="import-json" placeholder="JSON hier einfügen…" spellcheck="false">${escapeHtml(state.contentImportJson)}</textarea>
        ${state.contentImportStatus?.error ? `<div class="import-status import-error">${escapeHtml(state.contentImportStatus.error)}</div>` : ''}
        ${state.contentImportStatus?.ok ? `<div class="import-status import-ok">✓ Erfolgreich importiert!</div>` : ''}
        <button class="btn-primary" style="width:100%;margin-top:6px;padding:12px" data-action="content-import" ${state.contentImportLoading ? 'disabled' : ''}>${state.contentImportLoading ? '…' : 'Einfügen'}</button>
      </div>
      <button class="btn-export" data-action="export-progress">Fortschritt exportieren ↓</button>
      <button class="btn-logout" data-action="logout">Abmelden</button>
    `;
  }

  function renderQuiz() {
    const q = state.quiz;
    if (q.done) {
      return `
        <div class="quiz-overlay">
          <div class="quiz-result">
            <div id="confetti-wrap"></div>
            <div class="mascot-slot"><!-- MASCOT_PLACEHOLDER --></div>
            <div class="quiz-result-xp">+<span id="xp-count">0</span> XP</div>
            <div class="quiz-result-title">Μπράβο! 🎉</div>
            <div class="quiz-result-sub">Ολοκλήρωσες: ${escapeHtml(q.lessonTitle)} — ${q.correctCount}/${q.questions.length} σωστά</div>
            <button class="btn-cta" style="width:auto;padding:12px 22px" data-action="close-quiz">Συνέχεια</button>
          </div>
        </div>
      `;
    }
    const question = q.questions[q.index];
    const type = question.type || 'multiple-choice';
    const progressPct = Math.round(((q.index + (q.selected ? 1 : 0)) / q.questions.length) * 100);

    // Shared feedback block (used by all types once answered).
    const isCorrect = type === 'word-order'
      ? q.selected === '__correct__'
      : q.selected === question.answer;
    const feedbackBlock = q.selected ? `
      <div class="quiz-feedback">
        <div class="quiz-feedback-title" style="color:${isCorrect ? 'var(--color-accent)' : 'var(--color-text)'}">
          ${isCorrect ? '✓ Σωστά! Nice!' : (type === 'word-order'
            ? `△ Σχεδόν — ${escapeHtml(question.correctOrder.join(' '))}`
            : '△ Σχεδόν — δες τη σωστή απάντηση')}
        </div>
        <div class="quiz-feedback-sub">${escapeHtml(question.translation)}</div>
        <button class="btn-cta" data-action="quiz-next">${q.index + 1 >= q.questions.length ? 'Ολοκλήρωση' : 'Επόμενο'}</button>
      </div>
    ` : '';

    let questionBody = '';

    if (type === 'word-order') {
      questionBody = `
        <div class="quiz-instruction">Τοποθέτησε τις λέξεις στη σωστή σειρά / Ordne die Wörter</div>
        <div class="quiz-prompt">${escapeHtml(question.prompt)}</div>
        <div class="wo-answer-area ${q.selected ? (isCorrect ? 'wo-correct' : 'wo-wrong') : ''}">
          ${q.wordOrderAnswer.map((w, i) => `
            <button class="wo-tile wo-placed" data-action="wo-tap-answer" data-idx="${i}" ${q.selected ? 'disabled' : ''}>${escapeHtml(w)}</button>
          `).join('')}
          ${!q.wordOrderAnswer.length ? `<span class="wo-placeholder">Tippe die Wörter an…</span>` : ''}
        </div>
        <div class="wo-bank">
          ${q.wordOrderBank.map((w, i) => `
            <button class="wo-tile" data-action="wo-tap-bank" data-idx="${i}" ${q.selected ? 'disabled' : ''}>${escapeHtml(w)}</button>
          `).join('')}
        </div>
        ${!q.selected && q.wordOrderAnswer.length > 0 ? `
          <button class="btn-cta" data-action="wo-submit" style="margin-top:8px">Prüfen ✓</button>
        ` : ''}
        ${feedbackBlock}
      `;
    } else if (type === 'listening') {
      questionBody = `
        <div class="quiz-instruction">Άκουσε και επίλεξε / Höre zu und wähle</div>
        <div class="quiz-listen-wrap">
          <button class="btn-listen" data-action="listen-replay">🔊 Ξανάκουσε / Nochmal</button>
        </div>
        <div class="quiz-options">
          ${question.options.map(opt => {
            let cls = '';
            if (q.selected) {
              if (opt === question.answer) cls = 'correct';
              else if (opt === q.selected) cls = 'wrong';
            }
            return `<button class="quiz-option ${cls}" data-action="quiz-answer" data-opt="${escapeHtml(opt)}" ${q.selected ? 'disabled' : ''}>${escapeHtml(opt)}</button>`;
          }).join('')}
        </div>
        ${feedbackBlock}
      `;
    } else {
      // Default: multiple-choice
      questionBody = `
        <div class="quiz-instruction">Μετάφρασε στα γερμανικά / Übersetze</div>
        <div class="quiz-prompt">${escapeHtml(question.prompt)}</div>
        <div class="quiz-options">
          ${question.options.map(opt => {
            let cls = '';
            if (q.selected) {
              if (opt === question.answer) cls = 'correct';
              else if (opt === q.selected) cls = 'wrong';
            }
            return `<button class="quiz-option ${cls}" data-action="quiz-answer" data-opt="${escapeHtml(opt)}" ${q.selected ? 'disabled' : ''}>${escapeHtml(opt)}</button>`;
          }).join('')}
        </div>
        ${feedbackBlock}
      `;
    }

    return `
      <div class="quiz-overlay">
        <div class="quiz-head">
          <button class="quiz-close" data-action="close-quiz">×</button>
          <div class="quiz-progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
          <div class="quiz-step-label">${q.index + 1}/${q.questions.length}</div>
        </div>
        <div class="quiz-body">
          ${questionBody}
        </div>
      </div>
    `;
  }

  // ---------- Event delegation ----------
  function attachHandlers() {
    root.querySelectorAll('[data-action]').forEach(el => {
      const action = el.getAttribute('data-action');
      el.addEventListener('click', (e) => {
        e.preventDefault();
        handleAction(action, el);
      });
    });
    const tutorInput = document.getElementById('tutor-input');
    if (tutorInput) {
      tutorInput.addEventListener('input', (e) => { state.tutorDraft = e.target.value; });
      tutorInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendTutorText(state.tutorDraft); } });
      tutorInput.focus();
      tutorInput.setSelectionRange(tutorInput.value.length, tutorInput.value.length);
    }
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('input', (e) => { state.messageDraft = e.target.value; });
      messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
      messageInput.focus();
      messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
    }
    const vocabTarget = document.getElementById('vocab-input-target');
    if (vocabTarget) vocabTarget.focus();

    // Content import: radio buttons + textarea.
    root.querySelectorAll('input[name="importtype"]').forEach(r => {
      r.addEventListener('change', (e) => {
        state.contentImportType = e.target.value;
        state.contentImportJson = '';
        state.contentImportStatus = null;
        render();
      });
    });
    const importTA = document.getElementById('import-json');
    if (importTA) importTA.addEventListener('input', (e) => { state.contentImportJson = e.target.value; });

    // Block A: fire confetti + XP count-up exactly once when result screen appears.
    if (state.quiz?.done && !state.quiz.animationPlayed) {
      state.quiz.animationPlayed = true;
      runConfetti();
      runXpCountUp(state.quiz.earnedXp);
    }
  }

  function runConfetti() {
    const wrap = document.getElementById('confetti-wrap');
    if (!wrap) return;
    const colors = ['var(--color-accent)', 'var(--c-coral)', 'var(--c-lavender)', 'var(--c-mustard)', '#86efac', '#67e8f9'];
    for (let i = 0; i < 26; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = [
        `left:${Math.random() * 100}%`,
        `background:${colors[i % colors.length]}`,
        `width:${4 + Math.random() * 7}px`,
        `height:${4 + Math.random() * 7}px`,
        `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
        `animation-delay:${(Math.random() * 0.45).toFixed(2)}s`,
        `animation-duration:${(0.9 + Math.random() * 0.7).toFixed(2)}s`,
      ].join(';');
      wrap.appendChild(piece);
    }
  }

  function runXpCountUp(target) {
    if (!target) return;
    const el = document.getElementById('xp-count');
    if (!el) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, 38);
  }

  function handleAction(action, el) {
    switch (action) {
      case 'go-tab': return goTab(el.getAttribute('data-tab'));
      case 'go-profile': return goTab('profile');
      case 'toggle-dark': return toggleDarkMode();
      case 'open-lesson': return openLesson(el.getAttribute('data-lesson'));
      case 'close-quiz': return closeQuiz();
      case 'quiz-answer': return selectAnswer(el.getAttribute('data-opt'));
      case 'quiz-next': return quizNext();
      case 'wo-tap-bank': {
        const q = state.quiz; if (!q || q.selected) return;
        const idx = parseInt(el.getAttribute('data-idx'));
        const word = q.wordOrderBank[idx];
        q.wordOrderBank = q.wordOrderBank.filter((_, i) => i !== idx);
        q.wordOrderAnswer = [...q.wordOrderAnswer, word];
        render(); return;
      }
      case 'wo-tap-answer': {
        const q = state.quiz; if (!q || q.selected) return;
        const idx = parseInt(el.getAttribute('data-idx'));
        const word = q.wordOrderAnswer[idx];
        q.wordOrderAnswer = q.wordOrderAnswer.filter((_, i) => i !== idx);
        q.wordOrderBank = [...q.wordOrderBank, word];
        render(); return;
      }
      case 'wo-submit': {
        const q = state.quiz; if (!q || q.selected) return;
        const answer = q.wordOrderAnswer.join(' ');
        const correct = answer === q.questions[q.index].correctOrder.join(' ');
        q.selected = correct ? '__correct__' : '__wrong__';
        if (correct) q.correctCount++;
        render(); return;
      }
      case 'listen-replay': {
        const q = state.quiz;
        if (q) speakListening(q.questions[q.index].prompt, getLang());
        return;
      }
      case 'toggle-fav': return toggleVocabFav(el.getAttribute('data-id'));
      case 'vocab-filter': return setVocabFilter(el.getAttribute('data-filter'));
      case 'vocab-add-open': { state.vocabAddOpen = true; render(); return; }
      case 'vocab-add-cancel': { state.vocabAddOpen = false; render(); return; }
      case 'vocab-add-submit': return addCustomVocab();
      case 'vocab-delete': return deleteCustomVocab(el.getAttribute('data-id'));
      case 'translate-msg': {
        const id = Number(el.getAttribute('data-id'));
        const msg = state.messages.find(m => m.id === id);
        if (msg && msg.from !== 'me') toggleMessageTranslation(msg, el);
        return;
      }
      case 'send-message': return sendMessage();
      case 'check-message': return checkMessageDraft();
      case 'msg-chip': {
        state.messageDraft = el.getAttribute('data-text');
        render();
        const inp = document.getElementById('message-input');
        if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
        return;
      }
      case 'tutor-send': return sendTutorText(state.tutorDraft);
      case 'tutor-chip': return sendTutorText(el.getAttribute('data-text'));
      case 'toggle-notifications': return toggleNotifications();
      case 'content-import': return importContent();
      case 'export-progress': return exportProgress();
      case 'logout': return logout();
      default: return;
    }
  }

  async function toggleNotifications() {
    const result = await api('/profile/toggle-notifications', { method: 'POST' });
    state.profile.notificationsEnabled = result.notificationsEnabled;
    render();
  }

  async function addCustomVocab() {
    const target = (document.getElementById('vocab-input-target')?.value || '').trim();
    const native = (document.getElementById('vocab-input-native')?.value || '').trim();
    if (!target || !native) return;
    const note = (document.getElementById('vocab-input-note')?.value || '').trim();
    const cat = document.getElementById('vocab-input-cat')?.value || 'Δικά μας';
    try {
      await api('/vocab/custom', { method: 'POST', body: { targetText: target, nativeText: native, note, cat } });
      state.vocabAddOpen = false;
      await loadVocab();
      render();
    } catch (e) { console.error(e); }
  }

  async function deleteCustomVocab(id) {
    try {
      await api('/vocab/custom/' + encodeURIComponent(id), { method: 'DELETE' });
      await loadVocab();
      render();
    } catch (e) { console.error(e); }
  }

  async function importContent() {
    const json = (document.getElementById('import-json')?.value ?? state.contentImportJson).trim();
    if (!json) {
      state.contentImportStatus = { error: 'Bitte JSON einfügen.' };
      render(); return;
    }
    let data;
    try { data = JSON.parse(json); }
    catch (e) {
      state.contentImportStatus = { error: 'Ungültiges JSON: ' + e.message };
      render(); return;
    }
    state.contentImportLoading = true;
    state.contentImportStatus = null;
    render();
    try {
      await api('/content/import', { method: 'POST', body: { type: state.contentImportType, data } });
      state.contentImportStatus = { ok: true };
      state.contentImportJson = '';
      state.contentImportLoading = false;
      // Invalidate lessons cache so next tab-switch reloads the updated list.
      state.lessons = null;
      render();
    } catch (e) {
      state.contentImportStatus = { error: e.message };
      state.contentImportLoading = false;
      render();
    }
  }

  async function exportProgress() {
    try {
      const data = await api('/profile/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fortschritt-' + (state.user ? state.user.username : 'export') + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  boot();
})();