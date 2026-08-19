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
    vocabAddOpen: false,
    vocabDraft: { target: '', native: '', note: '', cat: '' },
    vocabAddError: null,
    messages: [],
    quickReplies: [],
    messageDraft: '',
    checkResult: null,
    checkLoading: false,
    tutorMessages: [],
    tutorChips: [],
    tutorDraft: '',
    tutorLoading: false,
    profile: null,
    quiz: null,
    aiConfigured: true,
    ttsConfigured: true,
    contentImportOpen: false,
    contentImportLang: 'de',
    contentImportDraft: '',
    contentImportError: null,
    contentImportSuccess: null,
    contentImportLoading: false,
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
      state.ttsConfigured = !!health.ttsConfigured;
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
    state.quickReplies = msgs.quickReplies || [];
  }

  async function loadVocab() {
    const v = await api('/vocab');
    state.vocab = v.vocab;
    state.vocabMeta = { isCompanionView: v.isCompanionView, learnerDisplayName: v.learnerDisplayName, courseLabel: v.courseLabel, targetLang: v.targetLang };
  }

  async function loadProfile() {
    state.profile = await api('/profile');
  }

  // ---------- Actions ----------
  async function openLesson(lessonId) {
    try {
      const data = await api('/lessons/' + encodeURIComponent(lessonId) + '/quiz');
      state.quiz = {
        lessonId,
        unitTitle: data.unitTitle,
        lessonTitle: data.lessonTitle,
        xp: data.xp,
        intro: data.intro,
        showingIntro: !!data.intro,
        targetLang: data.targetLang,
        questions: data.quiz,
        index: 0,
        selected: null,
        correctCount: 0,
        done: false,
        earnedXp: 0,
      };
      render();
    } catch (e) { console.error(e); }
  }

  function startQuizFromIntro() {
    if (state.quiz) state.quiz.showingIntro = false;
    render();
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
        q.earnedXp = result.xpEarned || q.xp;
      } catch (e) { console.error(e); }
    } else {
      q.index += 1;
      q.selected = null;
    }
    render();
  }

  const audioCache = {};
  let currentAudio = null;

  async function speak(text, lang, btnEl) {
    if (!text || !lang) return;
    if (btnEl) btnEl.classList.add('speaking');
    try {
      const cacheKey = lang + '::' + text;
      let audioB64 = audioCache[cacheKey];
      if (!audioB64) {
        const result = await api('/tts?text=' + encodeURIComponent(text) + '&lang=' + encodeURIComponent(lang));
        audioB64 = result.audio;
        audioCache[cacheKey] = audioB64;
      }
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      currentAudio = new Audio('data:audio/mp3;base64,' + audioB64);
      currentAudio.play().catch(() => {});
      currentAudio.addEventListener('ended', () => { if (btnEl) btnEl.classList.remove('speaking'); });
    } catch (e) {
      console.error(e);
      if (e.data && e.data.error === 'missing_api_key') {
        state.ttsConfigured = false;
        render();
      }
    } finally {
      if (btnEl) btnEl.classList.remove('speaking');
    }
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

  function openAddVocab() {
    state.vocabAddOpen = true;
    state.vocabDraft = { target: '', native: '', note: '', cat: '' };
    state.vocabAddError = null;
    render();
  }

  function cancelAddVocab() {
    state.vocabAddOpen = false;
    state.vocabAddError = null;
    render();
  }

  async function submitVocab() {
    const { target, native, note, cat } = state.vocabDraft;
    if (!target.trim() || !native.trim() || !cat.trim()) {
      state.vocabAddError = 'Bitte Wort, Übersetzung und Kategorie ausfüllen.';
      render();
      return;
    }
    try {
      await api('/vocab', { method: 'POST', body: { target, native, note, cat } });
      state.vocabAddOpen = false;
      state.vocabAddError = null;
      await loadVocab();
      render();
    } catch (e) {
      state.vocabAddError = 'Konnte nicht gespeichert werden. Bitte nochmal versuchen.';
      render();
    }
  }

  async function deleteVocab(vocabId) {
    try {
      await api('/vocab/' + encodeURIComponent(vocabId), { method: 'DELETE' });
      await loadVocab();
      render();
    } catch (e) { console.error(e); }
  }

  function openContentImport() {
    state.contentImportOpen = true;
    state.contentImportError = null;
    state.contentImportSuccess = null;
    render();
  }

  function cancelContentImport() {
    state.contentImportOpen = false;
    state.contentImportError = null;
    state.contentImportSuccess = null;
    render();
  }

  const IMPORT_ERROR_MESSAGES = {
    invalid_target_lang: 'Ungültige Sprachauswahl.',
    invalid_unit: 'JSON braucht mindestens: id, title, lessons (nicht leer).',
    unit_id_collides_with_static: 'Diese unit-id gehört schon zu einer eingebauten Einheit. Bitte eine neue id wählen.',
    lesson_missing_id: 'Eine Lektion hat keine id.',
    lesson_missing_title: 'Eine Lektion hat keinen title.',
    lesson_missing_xp: 'Eine Lektion braucht xp (Zahl > 0).',
    lesson_missing_quiz: 'Eine Lektion braucht mindestens eine Quiz-Frage.',
    quiz_question_missing_fields: 'Eine Quiz-Frage braucht prompt und answer.',
    quiz_question_needs_options: 'Eine Quiz-Frage braucht mindestens 2 options.',
    quiz_answer_not_in_options: 'Die answer einer Quiz-Frage muss in ihren options vorkommen.',
    duplicate_lesson_id: 'Diese Lektions-id existiert schon (in einer anderen Einheit). Bitte eine neue id wählen.',
    invalid_json: 'Das ist kein gültiges JSON.',
  };

  async function submitContentImport() {
    let parsed;
    try {
      parsed = JSON.parse(state.contentImportDraft);
    } catch (e) {
      state.contentImportError = IMPORT_ERROR_MESSAGES.invalid_json;
      state.contentImportSuccess = null;
      render();
      return;
    }
    state.contentImportLoading = true;
    state.contentImportError = null;
    state.contentImportSuccess = null;
    render();
    try {
      const result = await api('/content-import', {
        method: 'POST',
        body: { targetLang: state.contentImportLang, unit: parsed },
      });
      state.contentImportLoading = false;
      state.contentImportSuccess = `${result.lessonsImported} Lektion(en) in „${result.unit.title}“ importiert.`;
      state.contentImportDraft = '';
      if (state.lessons) await loadLessons();
      render();
    } catch (e) {
      state.contentImportLoading = false;
      const code = e.data && e.data.error;
      let msg = IMPORT_ERROR_MESSAGES[code] || 'Import fehlgeschlagen. Bitte JSON prüfen.';
      if (e.data && e.data.lessonId) msg += ` (Lektion: ${e.data.lessonId})`;
      state.contentImportError = msg;
      render();
    }
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

  async function sendMessage(directText) {
    const text = (directText !== undefined ? directText : state.messageDraft).trim();
    if (!text) return;
    if (directText === undefined) state.messageDraft = '';
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
      <div class="unit-block">
        <div class="unit-head">
          <div>
            <div class="unit-title">${escapeHtml(unit.title)}</div>
            <div class="unit-sub">${escapeHtml(unit.sub)}</div>
          </div>
          <span class="unit-level">${escapeHtml(unit.level)}</span>
        </div>
        <div class="lesson-list">
          ${unit.lessons.map(lesson => {
            const dotContent = lesson.state === 'done' ? '✓' : lesson.state === 'current' ? '▸' : '•';
            const dotClass = lesson.state === 'done'
              ? 'background:color-mix(in srgb, var(--color-accent) 18%, transparent);color:var(--color-accent-700)'
              : lesson.state === 'current'
                ? 'background:var(--color-accent);color:#fff'
                : 'background:color-mix(in srgb, var(--color-text) 8%, transparent);color:var(--c-muted)';
            const clickable = !isCompanion && (lesson.state === 'done' || lesson.state === 'current');
            return `
              <button class="lesson-row ${clickable ? 'active' : 'locked'}" ${clickable ? `data-action="open-lesson" data-lesson="${lesson.id}"` : 'disabled'}>
                <div class="lesson-dot" style="${dotClass}">${dotContent}</div>
                <div class="lesson-body">
                  <div class="lesson-title">${escapeHtml(lesson.title)}</div>
                  <div class="lesson-sub">${escapeHtml(lesson.sub)}</div>
                </div>
                <span class="lesson-tag">+${lesson.xp} XP</span>
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

  function renderMessages() {
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
      ${state.quickReplies.length ? `
        <div class="chip-row">
          ${state.quickReplies.map(q => `
            <button class="chip vocab-chip" data-action="quick-reply" data-text="${escapeHtml(q)}">${escapeHtml(q)}</button>
          `).join('')}
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
    const baseFilters = [
      { id: 'all', label: 'Όλα' },
      { id: 'fav', label: 'Αγαπημένα' },
      { id: 'Personal', label: 'Προσωπικά' },
      { id: 'Family', label: 'Οικογένεια' },
      { id: 'Everyday', label: 'Καθημερινά' },
      { id: 'Phrases', label: 'Φράσεις' },
      { id: 'Life', label: 'Γερμανία' },
    ];
    const knownCatIds = new Set(baseFilters.map(f => f.id));
    // Custom vocab can carry any free-text category — surface those as extra
    // filter chips too, so newly added categories are actually browsable.
    const extraCats = [...new Set(state.vocab.map(v => v.cat).filter(c => c && !knownCatIds.has(c)))];
    const filters = [...baseFilters, ...extraCats.map(c => ({ id: c, label: c }))];
    const catColor = { Personal: 'var(--c-coral)', Everyday: 'var(--color-accent)', Phrases: 'var(--c-lavender)', Family: 'var(--c-mustard)', Life: 'var(--color-accent-700)' };
    const list = state.vocab.filter(v => {
      if (state.vocabFilter === 'all') return true;
      if (state.vocabFilter === 'fav') return v.fav;
      return v.cat === state.vocabFilter;
    });
    return `
      ${state.vocabMeta && state.vocabMeta.isCompanionView && state.vocabMeta.learnerDisplayName ? `
        <div class="section-row" style="margin-bottom:8px"><h6>Λεξιλόγιο: ${escapeHtml(state.vocabMeta.learnerDisplayName)}</h6></div>
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
              <div class="vocab-note">${escapeHtml(v.note)}</div>
            </div>
            ${state.ttsConfigured && state.vocabMeta && state.vocabMeta.targetLang ? `<button class="star-btn speaker-btn" data-action="speak-vocab" data-text="${escapeHtml(v.target)}" data-lang="${state.vocabMeta.targetLang}" style="background:color-mix(in srgb, var(--color-text) 6%, transparent);color:var(--c-muted)" title="Vorlesen">🔊</button>` : ''}
            <button class="star-btn" data-action="toggle-fav" data-id="${v.id}" style="background:${v.fav ? 'var(--c-mustard)' : 'color-mix(in srgb, var(--color-text) 6%, transparent)'};color:${v.fav ? '#fff' : 'var(--c-muted)'}">★</button>
            ${v.custom ? `<button class="star-btn" data-action="delete-vocab" data-id="${v.id}" style="background:color-mix(in srgb, var(--color-text) 6%, transparent);color:var(--c-muted)" title="Löschen">✕</button>` : ''}
          </div>
        `).join('')}
        ${!list.length ? '<div class="empty-state">Keine Einträge in diesem Filter.</div>' : ''}
      </div>

      <div class="vocab-add">
        ${state.vocabAddOpen ? `
          <div class="vocab-add-form">
            <input type="text" placeholder="Wort/Phrase (Zielsprache)" data-field="target" value="${escapeHtml(state.vocabDraft.target)}" />
            <input type="text" placeholder="Übersetzung" data-field="native" value="${escapeHtml(state.vocabDraft.native)}" />
            <input type="text" placeholder="Notiz (optional)" data-field="note" value="${escapeHtml(state.vocabDraft.note)}" />
            <input type="text" placeholder="Kategorie (z.B. Arbeit)" data-field="cat" value="${escapeHtml(state.vocabDraft.cat)}" />
            ${state.vocabAddError ? `<div class="vocab-add-error">${escapeHtml(state.vocabAddError)}</div>` : ''}
            <div class="vocab-add-actions">
              <button class="btn-cta" style="width:auto;padding:10px 18px" data-action="submit-vocab">Speichern</button>
              <button class="chip" data-action="cancel-add-vocab">Abbrechen</button>
            </div>
          </div>
        ` : `
          <button class="btn-cta" style="width:auto;padding:10px 18px" data-action="open-add-vocab">+ Vokabel hinzufügen</button>
        `}
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
      <button class="btn-logout" data-action="logout">Abmelden</button>

      <div class="content-import">
        ${state.contentImportOpen ? `
          <div class="vocab-add-form content-import-form">
            <div class="section-row" style="margin-bottom:0"><h6>Inhalte importieren (JSON)</h6></div>
            <select data-field="import-lang">
              <option value="de" ${state.contentImportLang === 'de' ? 'selected' : ''}>Deutsch-Kurs</option>
              <option value="el" ${state.contentImportLang === 'el' ? 'selected' : ''}>Griechisch-Kurs</option>
            </select>
            <textarea data-field="import-json" rows="8" placeholder='{"id":"new_unit","title":"...","lessons":[...]}'>${escapeHtml(state.contentImportDraft)}</textarea>
            ${state.contentImportError ? `<div class="vocab-add-error">${escapeHtml(state.contentImportError)}</div>` : ''}
            ${state.contentImportSuccess ? `<div class="content-import-success">${escapeHtml(state.contentImportSuccess)}</div>` : ''}
            <div class="vocab-add-actions">
              <button class="btn-cta" style="width:auto;padding:10px 18px" data-action="submit-content-import">${state.contentImportLoading ? '…' : 'Importieren'}</button>
              <button class="chip" data-action="cancel-content-import">Schließen</button>
            </div>
          </div>
        ` : `
          <button class="chip" data-action="open-content-import">+ Lektionen importieren (JSON)</button>
        `}
      </div>
    `;
  }

  function renderQuiz() {
    const q = state.quiz;
    if (q.done) {
      return `
        <div class="quiz-overlay">
          <div class="quiz-result">
            <div class="quiz-result-xp">+${q.earnedXp} XP</div>
            <div class="quiz-result-title">Μπράβο!</div>
            <div class="quiz-result-sub">Ολοκλήρωσες: ${escapeHtml(q.lessonTitle)} — ${q.correctCount}/${q.questions.length} σωστά</div>
            <button class="btn-cta" style="width:auto;padding:12px 22px" data-action="close-quiz">Συνέχεια</button>
          </div>
        </div>
      `;
    }
    if (q.showingIntro) {
      return `
        <div class="quiz-overlay">
          <div class="quiz-head">
            <button class="quiz-close" data-action="close-quiz">×</button>
          </div>
          <div class="quiz-intro-body">
            <div class="quiz-intro-unit">${escapeHtml(q.unitTitle)}</div>
            <div class="quiz-intro-title">${escapeHtml(q.lessonTitle)}</div>
            <div class="quiz-intro-text">${escapeHtml(q.intro || '')}</div>
            <button class="btn-cta" data-action="start-quiz-from-intro">Ξεκίνα →</button>
          </div>
        </div>
      `;
    }
    const question = q.questions[q.index];
    const progressPct = Math.round(((q.index + (q.selected ? 1 : 0)) / q.questions.length) * 100);
    const isCorrectSelected = q.selected === question.answer;
    return `
      <div class="quiz-overlay">
        <div class="quiz-head">
          <button class="quiz-close" data-action="close-quiz">×</button>
          <div class="quiz-progress-track"><div class="progress-fill" style="width:${progressPct}%"></div></div>
          <div class="quiz-step-label">${q.index + 1}/${q.questions.length}</div>
        </div>
        <div class="quiz-body">
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
          ${q.selected ? `
            <div class="quiz-feedback">
              <div class="quiz-feedback-title-row">
                <div class="quiz-feedback-title" style="color:${isCorrectSelected ? 'var(--color-accent)' : 'var(--color-text)'}">${isCorrectSelected ? '✓ Σωστά! Nice!' : '△ Σχεδόν — δες τη σωστή απάντηση'}</div>
                ${state.ttsConfigured && q.targetLang ? `<button class="speaker-btn speaker-btn-inline" data-action="speak-quiz-answer" data-text="${escapeHtml(question.answer)}" data-lang="${q.targetLang}" title="Vorlesen">🔊</button>` : ''}
              </div>
              ${question.explanation ? `<div class="quiz-feedback-explanation">${escapeHtml(question.explanation)}</div>` : ''}
              <button class="btn-cta" data-action="quiz-next">${q.index + 1 >= q.questions.length ? 'Ολοκλήρωση' : 'Επόμενο'}</button>
            </div>
          ` : ''}
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
    root.querySelectorAll('.vocab-add-form:not(.content-import-form) [data-field]').forEach(el => {
      el.addEventListener('input', (e) => { state.vocabDraft[el.getAttribute('data-field')] = e.target.value; });
    });
    const importLangSelect = root.querySelector('[data-field="import-lang"]');
    if (importLangSelect) {
      importLangSelect.addEventListener('change', (e) => { state.contentImportLang = e.target.value; });
    }
    const importJsonArea = root.querySelector('[data-field="import-json"]');
    if (importJsonArea) {
      importJsonArea.addEventListener('input', (e) => { state.contentImportDraft = e.target.value; });
    }
  }

  function handleAction(action, el) {
    switch (action) {
      case 'go-tab': return goTab(el.getAttribute('data-tab'));
      case 'go-profile': return goTab('profile');
      case 'toggle-dark': return toggleDarkMode();
      case 'open-lesson': return openLesson(el.getAttribute('data-lesson'));
      case 'start-quiz-from-intro': return startQuizFromIntro();
      case 'close-quiz': return closeQuiz();
      case 'quiz-answer': return selectAnswer(el.getAttribute('data-opt'));
      case 'quiz-next': return quizNext();
      case 'toggle-fav': return toggleVocabFav(el.getAttribute('data-id'));
      case 'speak-vocab': return speak(el.getAttribute('data-text'), el.getAttribute('data-lang'), el);
      case 'speak-quiz-answer': return speak(el.getAttribute('data-text'), el.getAttribute('data-lang'), el);
      case 'vocab-filter': return setVocabFilter(el.getAttribute('data-filter'));
      case 'open-add-vocab': return openAddVocab();
      case 'cancel-add-vocab': return cancelAddVocab();
      case 'submit-vocab': return submitVocab();
      case 'delete-vocab': return deleteVocab(el.getAttribute('data-id'));
      case 'open-content-import': return openContentImport();
      case 'cancel-content-import': return cancelContentImport();
      case 'submit-content-import': return submitContentImport();
      case 'translate-msg': {
        const id = Number(el.getAttribute('data-id'));
        const msg = state.messages.find(m => m.id === id);
        if (msg && msg.from !== 'me') toggleMessageTranslation(msg, el);
        return;
      }
      case 'send-message': return sendMessage();
      case 'quick-reply': return sendMessage(el.getAttribute('data-text'));
      case 'check-message': return checkMessageDraft();
      case 'tutor-send': return sendTutorText(state.tutorDraft);
      case 'tutor-chip': return sendTutorText(el.getAttribute('data-text'));
      case 'toggle-notifications': return toggleNotifications();
      case 'logout': return logout();
      default: return;
    }
  }

  async function toggleNotifications() {
    const result = await api('/profile/toggle-notifications', { method: 'POST' });
    state.profile.notificationsEnabled = result.notificationsEnabled;
    render();
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  boot();
})();