const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const LANG_NAMES = { de: 'German', el: 'Greek' };

async function callClaude({ system, messages, maxTokens = 400 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('missing_api_key'), { code: 'missing_api_key' });
  }
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const textBlock = (data.content || []).find(b => b.type === 'text');
  return textBlock ? textBlock.text.trim() : '';
}

async function translateText(text, toLang) {
  const toLangName = LANG_NAMES[toLang] || toLang;
  const system = `You translate short personal chat messages into ${toLangName}. ` +
    `Reply with ONLY the translation, no quotes, no explanation, no preamble.`;
  return callClaude({
    system,
    messages: [{ role: 'user', content: text }],
    maxTokens: 200,
  });
}

async function checkGrammar(text, targetLang) {
  const targetLangName = LANG_NAMES[targetLang] || targetLang;
  const system = `You are a friendly ${targetLangName} language tutor. The user (a learner) wrote a short message ` +
    `in ${targetLangName}. Check it for grammar and word-order mistakes. ` +
    `If it is already correct, reply with exactly: "Perfekt! ✓" (in German) if targetLang is German, or "Τέλεια! ✓" if Greek. ` +
    `Otherwise, reply with ONLY the corrected sentence in ${targetLangName}, nothing else — no explanation, no quotes.`;
  return callClaude({
    system,
    messages: [{ role: 'user', content: text }],
    maxTokens: 150,
  });
}

async function tutorReply(history, targetLang, nativeLang) {
  const targetLangName = LANG_NAMES[targetLang] || targetLang;
  const nativeLangName = LANG_NAMES[nativeLang] || nativeLang;
  const system = `You are a warm, encouraging ${targetLangName} language tutor. The student's native language is ` +
    `${nativeLangName} and they are learning ${targetLangName} at an A1-A2 level. ` +
    `Answer their grammar/vocabulary questions clearly and briefly (2-5 sentences). ` +
    `Use simple ${targetLangName} examples and, when helpful, a short ${nativeLangName} translation in parentheses. ` +
    `Keep replies short and conversational, suitable for a mobile chat bubble.`;
  const messages = history.map(m => ({
    role: m.from_role === 'ai' ? 'assistant' : 'user',
    content: m.text,
  }));
  return callClaude({ system, messages, maxTokens: 350 });
}

async function companionCoachReply(history, partnerName, partnerTargetLang, currentLessonInfo) {
  const targetLangName = LANG_NAMES[partnerTargetLang] || partnerTargetLang;
  const lessonLine = currentLessonInfo
    ? `${partnerName} is currently working on the lesson "${currentLessonInfo.lesson.title}" ` +
      `(unit: "${currentLessonInfo.unit.title}", level ${currentLessonInfo.unit.level}).`
    : `${partnerName} has completed all currently available lessons.`;
  const system = `You are a warm, practical coach helping the user support their partner, ${partnerName}, ` +
    `who is learning ${targetLangName} (A1-A2 level). The user themselves is NOT learning the language — ` +
    `their goal is to understand what their partner is working on and how to encourage them effectively. ` +
    `${lessonLine} ` +
    `Give short, concrete, empathetic answers (2-5 sentences): tips on motivation and patience, plain-language ` +
    `explanations of grammar/vocabulary points so the user can understand and help without needing to be fluent ` +
    `themselves, and ideas for small encouraging gestures. Keep it conversational, suitable for a mobile chat bubble.`;
  const messages = history.map(m => ({
    role: m.from_role === 'ai' ? 'assistant' : 'user',
    content: m.text,
  }));
  return callClaude({ system, messages, maxTokens: 350 });
}

module.exports = { translateText, checkGrammar, tutorReply, companionCoachReply, LANG_NAMES };
