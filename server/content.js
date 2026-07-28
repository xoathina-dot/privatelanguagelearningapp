// Static curriculum content, seeded once. Not user-specific.
// Two learning directions: "de" (learning German, native Greek) and "el" (learning Greek, native German).

const COURSES = {
  de: {
    label: 'Γερμανικά',
    labelNative: 'German',
    tutorChips: [
      'Εξήγησε μου τα άρθρα der/die/das',
      'Θέλω να εξασκηθώ σε έναν διάλογο',
      'Ποια είναι η σειρά λέξεων στα γερμανικά;',
    ],
    units: [
      {
        id: 'greetings', title: 'Χαιρετισμοί', sub: 'Greetings', level: 'A1',
        lessons: [
          { id: 'g1', title: 'Γεια σου', sub: 'Hello & goodbye', xp: 10,
            quiz: [
              { prompt: 'Γεια σου', translation: 'Hello', answer: 'Hallo', options: ['Hallo', 'Tschüss', 'Bitte'] },
              { prompt: 'Αντίο', translation: 'Goodbye', answer: 'Tschüss', options: ['Danke', 'Tschüss', 'Ja'] },
            ] },
          { id: 'g2', title: 'Πώς είσαι;', sub: 'How are you', xp: 10,
            quiz: [
              { prompt: 'Πώς είσαι;', translation: 'How are you?', answer: 'Wie geht es dir?', options: ['Wie geht es dir?', 'Wie heißt du?', 'Wo bist du?'] },
              { prompt: 'Καλά, ευχαριστώ', translation: 'Good, thanks', answer: 'Gut, danke', options: ['Gut, danke', 'Bitte schön', 'Auf Wiedersehen'] },
            ] },
          { id: 'g3', title: 'Παρουσιάσεις', sub: 'Introductions', xp: 15,
            quiz: [
              { prompt: 'Με λένε...', translation: 'My name is...', answer: 'Ich heiße', options: ['Ich heiße', 'Du bist', 'Wir sind'] },
              { prompt: 'Χαίρω πολύ', translation: 'Nice to meet you', answer: 'Freut mich', options: ['Freut mich', 'Tschüss', 'Bitte'] },
              { prompt: 'Από πού είσαι;', translation: 'Where are you from?', answer: 'Woher kommst du?', options: ['Wie geht es dir?', 'Woher kommst du?', 'Wo wohnst du?'] },
              { prompt: 'Είμαι από την Ελλάδα', translation: 'I am from Greece', answer: 'Ich komme aus Griechenland', options: ['Ich komme aus Griechenland', 'Ich wohne in Deutschland', 'Ich bin Grieche'] },
            ] },
          { id: 'g4', title: 'Ευγένεια', sub: 'Politeness', xp: 15,
            quiz: [
              { prompt: 'Παρακαλώ', translation: 'Please', answer: 'Bitte', options: ['Bitte', 'Danke', 'Entschuldigung'] },
              { prompt: 'Συγγνώμη', translation: 'Excuse me / sorry', answer: 'Entschuldigung', options: ['Entschuldigung', 'Bitte', 'Gerne'] },
            ] },
        ],
      },
      {
        id: 'cafe', title: 'Στο καφέ', sub: 'At the café', level: 'A1',
        lessons: [
          { id: 'c1', title: 'Παραγγελία', sub: 'Ordering', xp: 15,
            quiz: [
              { prompt: 'Έναν καφέ, παρακαλώ', translation: 'One coffee, please', answer: 'Einen Kaffee, bitte', options: ['Einen Kaffee, bitte', 'Ein Wasser, danke', 'Die Rechnung, bitte'] },
              { prompt: 'Τι θα θέλατε;', translation: 'What would you like?', answer: 'Was möchten Sie?', options: ['Was möchten Sie?', 'Wo ist die Toilette?', 'Wie viel kostet das?'] },
            ] },
          { id: 'c2', title: 'Πληρωμή', sub: 'Paying', xp: 15,
            quiz: [
              { prompt: 'Τον λογαριασμό, παρακαλώ', translation: 'The bill, please', answer: 'Die Rechnung, bitte', options: ['Die Rechnung, bitte', 'Das Menü, bitte', 'Den Löffel, bitte'] },
              { prompt: 'Πόσο κάνει;', translation: 'How much is it?', answer: 'Wie viel kostet das?', options: ['Wie viel kostet das?', 'Wo ist das?', 'Was ist das?'] },
            ] },
        ],
      },
      {
        id: 'articles', title: 'Άρθρα', sub: 'Der, die, das', level: 'A1',
        lessons: [
          { id: 'a1', title: 'Αρσενικό', sub: 'Der', xp: 15,
            quiz: [
              { prompt: 'ο άντρας', translation: 'the man', answer: 'der Mann', options: ['der Mann', 'die Mann', 'das Mann'] },
              { prompt: 'ο καφές', translation: 'the coffee', answer: 'der Kaffee', options: ['der Kaffee', 'die Kaffee', 'das Kaffee'] },
            ] },
          { id: 'a2', title: 'Θηλυκό & ουδέτερο', sub: 'Die & das', xp: 15,
            quiz: [
              { prompt: 'η γυναίκα', translation: 'the woman', answer: 'die Frau', options: ['der Frau', 'die Frau', 'das Frau'] },
              { prompt: 'το κορίτσι', translation: 'the girl', answer: 'das Mädchen', options: ['der Mädchen', 'die Mädchen', 'das Mädchen'] },
            ] },
        ],
      },
      {
        id: 'verbs', title: 'Ρήματα', sub: 'Present tense verbs', level: 'A1',
        lessons: [
          { id: 'v1', title: 'Sein & haben', sub: 'To be & to have', xp: 15,
            quiz: [
              { prompt: 'Είμαι', translation: 'I am', answer: 'Ich bin', options: ['Ich bin', 'Ich habe', 'Ich bist'] },
              { prompt: 'Έχω', translation: 'I have', answer: 'Ich habe', options: ['Ich habe', 'Ich bin', 'Du hast'] },
            ] },
          { id: 'v2', title: 'Σειρά λέξεων', sub: 'Word order', xp: 20,
            quiz: [
              { prompt: 'Σήμερα μαθαίνω γερμανικά', translation: 'Today I am learning German', answer: 'Heute lerne ich Deutsch', options: ['Heute lerne ich Deutsch', 'Heute ich lerne Deutsch', 'Ich heute lerne Deutsch'] },
            ] },
        ],
      },
    ],
    vocab: [
      { id: 'de1', target: 'die Liebe', native: 'η αγάπη', note: 'love', cat: 'Personal' },
      { id: 'de2', target: 'der Schatz', native: 'αγάπη μου / θησαυρός', note: 'darling / treasure', cat: 'Personal' },
      { id: 'de3', target: 'Ich vermisse dich', native: 'Μου λείπεις', note: 'I miss you', cat: 'Phrases' },
      { id: 'de4', target: 'das Frühstück', native: 'το πρωινό', note: 'breakfast', cat: 'Everyday' },
      { id: 'de5', target: 'Wie war dein Tag?', native: 'Πώς ήταν η μέρα σου;', note: 'how was your day', cat: 'Phrases' },
      { id: 'de6', target: 'die Verabredung', native: 'το ραντεβού', note: 'date / appointment', cat: 'Everyday' },
      { id: 'de7', target: 'Gute Nacht', native: 'Καληνύχτα', note: 'good night', cat: 'Everyday' },
    ],
  },
  el: {
    label: 'Ελληνικά',
    labelNative: 'Greek',
    tutorChips: [
      'Erkläre mir die griechischen Artikel',
      'Ich möchte einen Dialog üben',
      'Wie ist die Wortstellung im Griechischen?',
    ],
    units: [
      {
        id: 'greetings', title: 'Begrüßungen', sub: 'Χαιρετισμοί', level: 'A1',
        lessons: [
          { id: 'g1', title: 'Hallo', sub: 'Γεια & αντίο', xp: 10,
            quiz: [
              { prompt: 'Hallo', translation: 'Γεια σου', answer: 'Γεια σου', options: ['Γεια σου', 'Αντίο', 'Παρακαλώ'] },
              { prompt: 'Tschüss', translation: 'Αντίο', answer: 'Αντίο', options: ['Ευχαριστώ', 'Αντίο', 'Ναι'] },
            ] },
          { id: 'g2', title: 'Wie geht es dir?', sub: 'Πώς είσαι', xp: 10,
            quiz: [
              { prompt: 'Wie geht es dir?', translation: 'Πώς είσαι;', answer: 'Πώς είσαι;', options: ['Πώς είσαι;', 'Πώς σε λένε;', 'Πού είσαι;'] },
              { prompt: 'Gut, danke', translation: 'Καλά, ευχαριστώ', answer: 'Καλά, ευχαριστώ', options: ['Καλά, ευχαριστώ', 'Παρακαλώ', 'Αντίο'] },
            ] },
          { id: 'g3', title: 'Vorstellung', sub: 'Παρουσιάσεις', xp: 15,
            quiz: [
              { prompt: 'Ich heiße...', translation: 'Με λένε...', answer: 'Με λένε', options: ['Με λένε', 'Είσαι', 'Είμαστε'] },
              { prompt: 'Freut mich', translation: 'Χαίρω πολύ', answer: 'Χαίρω πολύ', options: ['Χαίρω πολύ', 'Αντίο', 'Παρακαλώ'] },
              { prompt: 'Woher kommst du?', translation: 'Από πού είσαι;', answer: 'Από πού είσαι;', options: ['Πώς είσαι;', 'Από πού είσαι;', 'Πού μένεις;'] },
              { prompt: 'Ich komme aus Deutschland', translation: 'Είμαι από τη Γερμανία', answer: 'Είμαι από τη Γερμανία', options: ['Είμαι από τη Γερμανία', 'Μένω στην Ελλάδα', 'Είμαι Γερμανός'] },
            ] },
          { id: 'g4', title: 'Höflichkeit', sub: 'Ευγένεια', xp: 15,
            quiz: [
              { prompt: 'Bitte', translation: 'Παρακαλώ', answer: 'Παρακαλώ', options: ['Παρακαλώ', 'Ευχαριστώ', 'Συγγνώμη'] },
              { prompt: 'Entschuldigung', translation: 'Συγγνώμη', answer: 'Συγγνώμη', options: ['Συγγνώμη', 'Παρακαλώ', 'Ευχαρίστως'] },
            ] },
        ],
      },
      {
        id: 'cafe', title: 'Im Café', sub: 'Στο καφέ', level: 'A1',
        lessons: [
          { id: 'c1', title: 'Bestellen', sub: 'Παραγγελία', xp: 15,
            quiz: [
              { prompt: 'Einen Kaffee, bitte', translation: 'Έναν καφέ, παρακαλώ', answer: 'Έναν καφέ, παρακαλώ', options: ['Έναν καφέ, παρακαλώ', 'Ένα νερό, ευχαριστώ', 'Τον λογαριασμό, παρακαλώ'] },
              { prompt: 'Was möchten Sie?', translation: 'Τι θα θέλατε;', answer: 'Τι θα θέλατε;', options: ['Τι θα θέλατε;', 'Πού είναι η τουαλέτα;', 'Πόσο κάνει;'] },
            ] },
          { id: 'c2', title: 'Bezahlen', sub: 'Πληρωμή', xp: 15,
            quiz: [
              { prompt: 'Die Rechnung, bitte', translation: 'Τον λογαριασμό, παρακαλώ', answer: 'Τον λογαριασμό, παρακαλώ', options: ['Τον λογαριασμό, παρακαλώ', 'Το μενού, παρακαλώ', 'Το κουτάλι, παρακαλώ'] },
              { prompt: 'Wie viel kostet das?', translation: 'Πόσο κάνει;', answer: 'Πόσο κάνει;', options: ['Πόσο κάνει;', 'Πού είναι;', 'Τι είναι αυτό;'] },
            ] },
        ],
      },
      {
        id: 'articles', title: 'Artikel', sub: 'Ο, η, το', level: 'A1',
        lessons: [
          { id: 'a1', title: 'Männlich', sub: 'Ο', xp: 15,
            quiz: [
              { prompt: 'der Mann', translation: 'the man', answer: 'ο άντρας', options: ['ο άντρας', 'η άντρας', 'το άντρας'] },
              { prompt: 'der Kaffee', translation: 'the coffee', answer: 'ο καφές', options: ['ο καφές', 'η καφές', 'το καφές'] },
            ] },
          { id: 'a2', title: 'Weiblich & sächlich', sub: 'Η & το', xp: 15,
            quiz: [
              { prompt: 'die Frau', translation: 'the woman', answer: 'η γυναίκα', options: ['ο γυναίκα', 'η γυναίκα', 'το γυναίκα'] },
              { prompt: 'das Mädchen', translation: 'the girl', answer: 'το κορίτσι', options: ['ο κορίτσι', 'η κορίτσι', 'το κορίτσι'] },
            ] },
        ],
      },
      {
        id: 'verbs', title: 'Verben', sub: 'Ρήματα ενεστώτα', level: 'A1',
        lessons: [
          { id: 'v1', title: 'Sein & haben', sub: 'Είμαι & έχω', xp: 15,
            quiz: [
              { prompt: 'Ich bin', translation: 'I am', answer: 'Είμαι', options: ['Είμαι', 'Έχω', 'Είσαι'] },
              { prompt: 'Ich habe', translation: 'I have', answer: 'Έχω', options: ['Έχω', 'Είμαι', 'Έχεις'] },
            ] },
          { id: 'v2', title: 'Wortstellung', sub: 'Σειρά λέξεων', xp: 20,
            quiz: [
              { prompt: 'Heute lerne ich Deutsch', translation: 'Today I am learning German', answer: 'Σήμερα μαθαίνω γερμανικά', options: ['Σήμερα μαθαίνω γερμανικά', 'Μαθαίνω σήμερα γερμανικά', 'Γερμανικά σήμερα μαθαίνω'] },
            ] },
        ],
      },
    ],
    vocab: [
      { id: 'el1', target: 'η αγάπη', native: 'die Liebe', note: 'love', cat: 'Personal' },
      { id: 'el2', target: 'αγάπη μου', native: 'der Schatz', note: 'darling / treasure', cat: 'Personal' },
      { id: 'el3', target: 'Μου λείπεις', native: 'Ich vermisse dich', note: 'I miss you', cat: 'Phrases' },
      { id: 'el4', target: 'το πρωινό', native: 'das Frühstück', note: 'breakfast', cat: 'Everyday' },
      { id: 'el5', target: 'Πώς ήταν η μέρα σου;', native: 'Wie war dein Tag?', note: 'how was your day', cat: 'Phrases' },
      { id: 'el6', target: 'το ραντεβού', native: 'die Verabredung', note: 'date / appointment', cat: 'Everyday' },
      { id: 'el7', target: 'Καληνύχτα', native: 'Gute Nacht', note: 'good night', cat: 'Everyday' },
    ],
  },
};

function getCourse(targetLang) {
  return COURSES[targetLang] || COURSES.de;
}

function getAllLessonsFlat(targetLang) {
  const course = getCourse(targetLang);
  const flat = [];
  course.units.forEach((unit, unitIdx) => {
    unit.lessons.forEach((lesson, lessonIdx) => {
      flat.push({ ...lesson, unitId: unit.id, order: flat.length });
    });
  });
  return flat;
}

function findLesson(targetLang, lessonId) {
  const course = getCourse(targetLang);
  for (const unit of course.units) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
}

module.exports = { COURSES, getCourse, getAllLessonsFlat, findLesson };
