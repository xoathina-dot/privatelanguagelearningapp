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
        id: 'u1', title: 'Πρώτα βήματα', sub: 'First steps', level: 'A1',
        lessons: [
          { id: 'u1l1', title: 'Χαιρετισμοί', sub: 'Greetings', xp: 10,
            quiz: [
              { prompt: 'Γεια σου', translation: 'Hello', answer: 'Hallo', options: ['Hallo', 'Tschüss', 'Bitte'] },
              { prompt: 'Καλημέρα', translation: 'Good morning', answer: 'Guten Morgen', options: ['Guten Morgen', 'Gute Nacht', 'Guten Tag'] },
              { prompt: 'Αντίο', translation: 'Goodbye', answer: 'Tschüss', options: ['Tschüss', 'Danke', 'Ja'] },
            ] },
          { id: 'u1l2', title: 'Ναι, όχι, ευχαριστώ', sub: 'Yes, no, thank you', xp: 10,
            quiz: [
              { prompt: 'Ναι', translation: 'Yes', answer: 'Ja', options: ['Ja', 'Nein', 'Bitte'] },
              { prompt: 'Όχι', translation: 'No', answer: 'Nein', options: ['Nein', 'Ja', 'Danke'] },
              { prompt: 'Ευχαριστώ πολύ', translation: 'Thank you very much', answer: 'Danke schön', options: ['Danke schön', 'Bitte schön', 'Entschuldigung'] },
            ] },
          { id: 'u1l3', title: 'Πώς είσαι;', sub: 'How are you', xp: 10,
            quiz: [
              { prompt: 'Πώς είσαι;', translation: 'How are you?', answer: 'Wie geht es dir?', options: ['Wie geht es dir?', 'Wie heißt du?', 'Wo bist du?'] },
              { prompt: 'Καλά, ευχαριστώ', translation: 'Good, thanks', answer: 'Gut, danke', options: ['Gut, danke', 'Bitte schön', 'Auf Wiedersehen'] },
            ] },
        ],
      },
      {
        id: 'u2', title: 'Παρουσιάζομαι', sub: 'Introducing myself', level: 'A1',
        lessons: [
          { id: 'u2l1', title: 'Πώς σε λένε;', sub: "What's your name", xp: 10,
            quiz: [
              { prompt: 'Με λένε', translation: 'My name is', answer: 'Ich heiße', options: ['Ich heiße', 'Du bist', 'Wir sind'] },
              { prompt: 'Πώς σε λένε;', translation: 'What is your name?', answer: 'Wie heißt du?', options: ['Wie heißt du?', 'Wie geht es dir?', 'Woher kommst du?'] },
              { prompt: 'Χαίρω πολύ', translation: 'Nice to meet you', answer: 'Freut mich', options: ['Freut mich', 'Tschüss', 'Bitte'] },
            ] },
          { id: 'u2l2', title: 'Από πού είσαι;', sub: 'Where are you from', xp: 15,
            quiz: [
              { prompt: 'Από πού είσαι;', translation: 'Where are you from?', answer: 'Woher kommst du?', options: ['Woher kommst du?', 'Wie geht es dir?', 'Wo wohnst du?'] },
              { prompt: 'Είμαι από την Ελλάδα', translation: 'I am from Greece', answer: 'Ich komme aus Griechenland', options: ['Ich komme aus Griechenland', 'Ich wohne in Deutschland', 'Ich bin Grieche'] },
              { prompt: 'Είμαι από τη Γερμανία', translation: "I'm from Germany", answer: 'Ich komme aus Deutschland', options: ['Ich komme aus Deutschland', 'Ich bin Deutscher', 'Ich wohne in Griechenland'] },
            ] },
          { id: 'u2l3', title: 'Δουλειά & ηλικία', sub: 'Job & age', xp: 15,
            quiz: [
              { prompt: 'Πόσο χρονών είσαι;', translation: 'How old are you?', answer: 'Wie alt bist du?', options: ['Wie alt bist du?', 'Wie heißt du?', 'Wo wohnst du?'] },
              { prompt: 'Είμαι είκοσι επτά χρονών', translation: 'I am 27 years old', answer: 'Ich bin 27 Jahre alt', options: ['Ich bin 27 Jahre alt', 'Ich habe 27 Jahre', 'Ich bin 27 Jahren'] },
              { prompt: 'Τι δουλειά κάνεις;', translation: 'What do you do for a living?', answer: 'Was machst du beruflich?', options: ['Was machst du beruflich?', 'Wo arbeitest du?', 'Wer bist du?'] },
            ] },
        ],
      },
      {
        id: 'u3', title: 'Αριθμοί & ώρα', sub: 'Numbers & time', level: 'A1',
        lessons: [
          { id: 'u3l1', title: 'Αριθμοί 0-10', sub: 'Numbers 0-10', xp: 10,
            quiz: [
              { prompt: 'ένα, δύο, τρία', translation: 'one, two, three', answer: 'eins, zwei, drei', options: ['eins, zwei, drei', 'eins, zwei, vier', 'zwei, drei, vier'] },
              { prompt: 'Πόσα;', translation: 'How many?', answer: 'Wie viele?', options: ['Wie viele?', 'Wie viel?', 'Wie alt?'] },
              { prompt: 'δέκα', translation: 'ten', answer: 'zehn', options: ['zehn', 'neun', 'acht'] },
            ] },
          { id: 'u3l2', title: 'Τι ώρα είναι;', sub: 'What time is it', xp: 15,
            quiz: [
              { prompt: 'Τι ώρα είναι;', translation: 'What time is it?', answer: 'Wie spät ist es?', options: ['Wie spät ist es?', 'Wie viel Uhr kommst du?', 'Was ist die Zeit?'] },
              { prompt: 'Είναι τρεις η ώρα', translation: "It's three o'clock", answer: 'Es ist drei Uhr', options: ['Es ist drei Uhr', 'Es sind drei Uhr', 'Es ist um drei'] },
              { prompt: 'σήμερα / αύριο', translation: 'today / tomorrow', answer: 'heute / morgen', options: ['heute / morgen', 'gestern / heute', 'morgen / gestern'] },
            ] },
          { id: 'u3l3', title: 'Ημέρες της εβδομάδας', sub: 'Days of the week', xp: 15,
            quiz: [
              { prompt: 'Δευτέρα', translation: 'Monday', answer: 'Montag', options: ['Montag', 'Dienstag', 'Sonntag'] },
              { prompt: 'Σαββατοκύριακο', translation: 'Weekend', answer: 'Wochenende', options: ['Wochenende', 'Woche', 'Wochentag'] },
              { prompt: 'Ποια μέρα είναι σήμερα;', translation: 'What day is it today?', answer: 'Welcher Tag ist heute?', options: ['Welcher Tag ist heute?', 'Wie spät ist heute?', 'Wann ist heute?'] },
            ] },
        ],
      },
      {
        id: 'u4', title: 'Άρθρα & ουσιαστικά', sub: 'Articles & nouns', level: 'A1',
        lessons: [
          { id: 'u4l1', title: 'Αρσενικό: ο', sub: 'Der', xp: 15,
            quiz: [
              { prompt: 'ο πατέρας', translation: 'the father', answer: 'der Vater', options: ['der Vater', 'die Vater', 'das Vater'] },
              { prompt: 'ο καφές', translation: 'the coffee', answer: 'der Kaffee', options: ['der Kaffee', 'die Kaffee', 'das Kaffee'] },
            ] },
          { id: 'u4l2', title: 'Θηλυκό: η', sub: 'Die', xp: 15,
            quiz: [
              { prompt: 'η γυναίκα', translation: 'the woman', answer: 'die Frau', options: ['der Frau', 'die Frau', 'das Frau'] },
              { prompt: 'η μητέρα', translation: 'the mother', answer: 'die Mutter', options: ['die Mutter', 'der Mutter', 'das Mutter'] },
              { prompt: 'η πόρτα', translation: 'the door', answer: 'die Tür', options: ['die Tür', 'der Tür', 'das Tür'] },
            ] },
          { id: 'u4l3', title: 'Ουδέτερο: το', sub: 'Das', xp: 15,
            quiz: [
              { prompt: 'το κορίτσι', translation: 'the girl', answer: 'das Mädchen', options: ['der Mädchen', 'die Mädchen', 'das Mädchen'] },
              { prompt: 'το παιδί', translation: 'the child', answer: 'das Kind', options: ['das Kind', 'der Kind', 'die Kind'] },
              { prompt: 'το σπίτι', translation: 'the house', answer: 'das Haus', options: ['das Haus', 'der Haus', 'die Haus'] },
            ] },
          { id: 'u4l4', title: 'Πληθυντικός', sub: 'Plural', xp: 20,
            quiz: [
              { prompt: 'οι άντρες (πληθυντικός)', translation: 'the men (plural)', answer: 'die Männer', options: ['die Männer', 'die Manns', 'der Männer'] },
              { prompt: 'τα παιδιά (πληθυντικός)', translation: 'the children (plural)', answer: 'die Kinder', options: ['die Kinder', 'die Kinds', 'das Kinder'] },
            ] },
        ],
      },
      {
        id: 'u5', title: 'Οικογένεια & σχέση', sub: 'Family & relationship', level: 'A1',
        lessons: [
          { id: 'u5l1', title: 'Η οικογένειά μου', sub: 'My family', xp: 15,
            quiz: [
              { prompt: 'η μαμά', translation: 'mom', answer: 'die Mama', options: ['die Mama', 'der Mama', 'das Mama'] },
              { prompt: 'ο αδερφός', translation: 'brother', answer: 'der Bruder', options: ['der Bruder', 'die Bruder', 'das Bruder'] },
              { prompt: 'η αδερφή', translation: 'sister', answer: 'die Schwester', options: ['die Schwester', 'der Schwester', 'das Schwester'] },
            ] },
          { id: 'u5l2', title: 'Λόγια αγάπης', sub: 'Words of love', xp: 15,
            quiz: [
              { prompt: 'Σ\' αγαπώ', translation: 'I love you', answer: 'Ich liebe dich', options: ['Ich liebe dich', 'Ich mag dich', 'Ich brauche dich'] },
              { prompt: 'Μου λείπεις', translation: 'I miss you', answer: 'Ich vermisse dich', options: ['Ich vermisse dich', 'Ich mag dich', 'Ich brauche dich'] },
              { prompt: 'αγάπη μου', translation: 'my love / darling', answer: 'mein Schatz', options: ['mein Schatz', 'meine Familie', 'mein Freund'] },
            ] },
          { id: 'u5l3', title: 'Η καθημερινότητά μας', sub: 'Our everyday life', xp: 15,
            quiz: [
              { prompt: 'Πώς ήταν η μέρα σου;', translation: 'How was your day?', answer: 'Wie war dein Tag?', options: ['Wie war dein Tag?', 'Was machst du heute?', 'Wie geht es dir?'] },
              { prompt: 'Τι κάνουμε το σαββατοκύριακο;', translation: 'What are we doing this weekend?', answer: 'Was machen wir am Wochenende?', options: ['Was machen wir am Wochenende?', 'Wann kommst du nach Hause?', 'Wo warst du heute?'] },
            ] },
        ],
      },
      {
        id: 'u6', title: 'Ρήματα & σειρά λέξεων', sub: 'Verbs & word order', level: 'A1',
        lessons: [
          { id: 'u6l1', title: 'Sein & haben', sub: 'To be & to have', xp: 15,
            quiz: [
              { prompt: 'Είμαι', translation: 'I am', answer: 'Ich bin', options: ['Ich bin', 'Ich habe', 'Du bist'] },
              { prompt: 'Έχω', translation: 'I have', answer: 'Ich habe', options: ['Ich habe', 'Ich bin', 'Du hast'] },
              { prompt: 'Έχεις χρόνο;', translation: 'Do you have time?', answer: 'Hast du Zeit?', options: ['Hast du Zeit?', 'Bist du Zeit?', 'Ist du Zeit?'] },
            ] },
          { id: 'u6l2', title: 'Κανονικά ρήματα', sub: 'Regular verbs', xp: 15,
            quiz: [
              { prompt: 'Μαθαίνω γερμανικά', translation: 'I am learning German', answer: 'Ich lerne Deutsch', options: ['Ich lerne Deutsch', 'Ich lernst Deutsch', 'Ich lernen Deutsch'] },
              { prompt: 'Μένεις στη Γερμανία;', translation: 'Do you live in Germany?', answer: 'Wohnst du in Deutschland?', options: ['Wohnst du in Deutschland?', 'Wohnt du in Deutschland?', 'Wohnen du in Deutschland?'] },
              { prompt: 'Παίζουμε', translation: 'We play', answer: 'Wir spielen', options: ['Wir spielen', 'Wir spielt', 'Wir spiele'] },
            ] },
          { id: 'u6l3', title: 'Σειρά λέξεων', sub: 'Word order', xp: 20,
            quiz: [
              { prompt: 'Σήμερα μαθαίνω γερμανικά', translation: 'Today I am learning German', answer: 'Heute lerne ich Deutsch', options: ['Heute lerne ich Deutsch', 'Heute ich lerne Deutsch', 'Ich heute lerne Deutsch'] },
              { prompt: 'Αύριο πάμε στο σπίτι', translation: 'Tomorrow we are going home', answer: 'Morgen gehen wir nach Hause', options: ['Morgen gehen wir nach Hause', 'Morgen wir gehen nach Hause', 'Wir morgen gehen nach Hause'] },
            ] },
          { id: 'u6l4', title: 'Ερωτηματικές λέξεις', sub: 'Question words', xp: 15,
            quiz: [
              { prompt: 'Ποιος;', translation: 'Who?', answer: 'Wer?', options: ['Wer?', 'Was?', 'Wo?'] },
              { prompt: 'Πού;', translation: 'Where?', answer: 'Wo?', options: ['Wo?', 'Wer?', 'Wann?'] },
              { prompt: 'Πότε;', translation: 'When?', answer: 'Wann?', options: ['Wann?', 'Warum?', 'Wie?'] },
            ] },
        ],
      },
      {
        id: 'u7', title: 'Στο καφέ & εστιατόριο', sub: 'At the café & restaurant', level: 'A1',
        lessons: [
          { id: 'u7l1', title: 'Παραγγελία', sub: 'Ordering', xp: 15,
            quiz: [
              { prompt: 'Έναν καφέ, παρακαλώ', translation: 'One coffee, please', answer: 'Einen Kaffee, bitte', options: ['Einen Kaffee, bitte', 'Ein Wasser, danke', 'Die Rechnung, bitte'] },
              { prompt: 'Τι θα θέλατε;', translation: 'What would you like?', answer: 'Was möchten Sie?', options: ['Was möchten Sie?', 'Wo ist die Toilette?', 'Wie viel kostet das?'] },
            ] },
          { id: 'u7l2', title: 'Πληρωμή', sub: 'Paying', xp: 15,
            quiz: [
              { prompt: 'Τον λογαριασμό, παρακαλώ', translation: 'The bill, please', answer: 'Die Rechnung, bitte', options: ['Die Rechnung, bitte', 'Das Menü, bitte', 'Den Löffel, bitte'] },
              { prompt: 'Πόσο κάνει;', translation: 'How much is it?', answer: 'Wie viel kostet das?', options: ['Wie viel kostet das?', 'Wo ist das?', 'Was ist das?'] },
            ] },
          { id: 'u7l3', title: 'Προτιμήσεις φαγητού', sub: 'Food preferences', xp: 15,
            quiz: [
              { prompt: 'Θα ήθελα', translation: 'I would like', answer: 'Ich möchte', options: ['Ich möchte', 'Ich mag', 'Ich habe'] },
              { prompt: 'Δεν τρώω κρέας', translation: "I don't eat meat", answer: 'Ich esse kein Fleisch', options: ['Ich esse kein Fleisch', 'Ich esse nicht Fleisch', 'Ich habe kein Fleisch'] },
            ] },
        ],
      },
      {
        id: 'u8', title: 'Στους δρόμους της Γερμανίας', sub: 'Getting around Germany', level: 'A2',
        lessons: [
          { id: 'u8l1', title: 'Μέσα μεταφοράς', sub: 'Transportation', xp: 15,
            quiz: [
              { prompt: 'το τρένο', translation: 'the train', answer: 'der Zug', options: ['der Zug', 'die Zug', 'das Zug'] },
              { prompt: 'Ένα εισιτήριο, παρακαλώ', translation: 'One ticket, please', answer: 'Eine Fahrkarte, bitte', options: ['Eine Fahrkarte, bitte', 'Ein Ticket, danke', 'Der Bahnhof, bitte'] },
            ] },
          { id: 'u8l2', title: 'Ρωτώντας για κατεύθυνση', sub: 'Asking for directions', xp: 15,
            quiz: [
              { prompt: 'Πού είναι ο σταθμός;', translation: 'Where is the station?', answer: 'Wo ist der Bahnhof?', options: ['Wo ist der Bahnhof?', 'Wo ist die Toilette?', 'Wann fährt der Zug?'] },
              { prompt: 'Ευθεία και μετά αριστερά', translation: 'Straight ahead and then left', answer: 'Geradeaus und dann links', options: ['Geradeaus und dann links', 'Links und dann rechts', 'Geradeaus und dann rechts'] },
            ] },
          { id: 'u8l3', title: 'Στο σούπερ μάρκετ', sub: 'At the supermarket', xp: 15,
            quiz: [
              { prompt: 'Πού είναι το ψωμί;', translation: 'Where is the bread?', answer: 'Wo ist das Brot?', options: ['Wo ist das Brot?', 'Wo ist die Milch?', 'Was kostet das Brot?'] },
              { prompt: 'Μόνο αυτό, ευχαριστώ', translation: 'Just this, thanks', answer: 'Nur das, danke', options: ['Nur das, danke', 'Wie viel kostet das?', 'Ich möchte mehr'] },
            ] },
        ],
      },
      {
        id: 'u9', title: 'Σπίτι & καθημερινότητα', sub: 'Home & daily routine', level: 'A2',
        lessons: [
          { id: 'u9l1', title: 'Το σπίτι', sub: 'The apartment', xp: 15,
            quiz: [
              { prompt: 'η κουζίνα', translation: 'the kitchen', answer: 'die Küche', options: ['die Küche', 'der Küche', 'das Küche'] },
              { prompt: 'το δωμάτιο', translation: 'the room', answer: 'das Zimmer', options: ['das Zimmer', 'der Zimmer', 'die Zimmer'] },
            ] },
          { id: 'u9l2', title: 'Η καθημερινή μου ρουτίνα', sub: 'My daily routine', xp: 15,
            quiz: [
              { prompt: 'Ξυπνάω στις εφτά', translation: 'I wake up at seven', answer: 'Ich stehe um sieben auf', options: ['Ich stehe um sieben auf', 'Ich stehe auf um sieben', 'Ich aufstehe um sieben'] },
              { prompt: 'Πάω για ύπνο νωρίς', translation: 'I go to sleep early', answer: 'Ich gehe früh schlafen', options: ['Ich gehe früh schlafen', 'Ich schlafe früh gehen', 'Ich früh gehe schlafen'] },
            ] },
          { id: 'u9l3', title: 'Σχέδια για το σαββατοκύριακο', sub: 'Weekend plans', xp: 15,
            quiz: [
              { prompt: 'Τι κάνεις αυτό το σαββατοκύριακο;', translation: 'What are you doing this weekend?', answer: 'Was machst du dieses Wochenende?', options: ['Was machst du dieses Wochenende?', 'Was hast du dieses Wochenende?', 'Wo bist du dieses Wochenende?'] },
              { prompt: 'Θέλω να σε δω', translation: 'I want to see you', answer: 'Ich möchte dich sehen', options: ['Ich möchte dich sehen', 'Ich möchte dich schauen', 'Ich will du sehen'] },
            ] },
        ],
      },
      {
        id: 'u10', title: 'Γραφειοκρατία & έκτακτες καταστάσεις', sub: 'Bureaucracy & emergencies', level: 'A2',
        lessons: [
          { id: 'u10l1', title: 'Στο Bürgeramt', sub: 'At the registration office', xp: 20,
            quiz: [
              { prompt: 'Έχω ένα ραντεβού', translation: 'I have an appointment', answer: 'Ich habe einen Termin', options: ['Ich habe einen Termin', 'Ich bin ein Termin', 'Ich mache einen Termin'] },
              { prompt: 'Χρειάζομαι τα έγγραφά μου', translation: 'I need my documents', answer: 'Ich brauche meine Unterlagen', options: ['Ich brauche meine Unterlagen', 'Ich habe meine Unterlagen', 'Ich möchte meine Unterlagen'] },
            ] },
          { id: 'u10l2', title: 'Στον γιατρό', sub: 'At the doctor', xp: 20,
            quiz: [
              { prompt: 'Πονάει εδώ', translation: 'It hurts here', answer: 'Es tut hier weh', options: ['Es tut hier weh', 'Es ist hier weh', 'Ich tue hier weh'] },
              { prompt: 'Χρειάζομαι γιατρό', translation: 'I need a doctor', answer: 'Ich brauche einen Arzt', options: ['Ich brauche einen Arzt', 'Ich bin ein Arzt', 'Ich habe einen Arzt'] },
            ] },
          { id: 'u10l3', title: 'Έκτακτη ανάγκη', sub: 'Emergency', xp: 20,
            quiz: [
              { prompt: 'Βοήθεια!', translation: 'Help!', answer: 'Hilfe!', options: ['Hilfe!', 'Achtung!', 'Vorsicht!'] },
              { prompt: 'Καλέστε ασθενοφόρο!', translation: 'Call an ambulance!', answer: 'Rufen Sie einen Krankenwagen!', options: ['Rufen Sie einen Krankenwagen!', 'Rufen Sie die Polizei!', 'Rufen Sie ein Taxi!'] },
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
      { id: 'de8', target: 'die Mutter', native: 'η μητέρα', note: 'mother', cat: 'Family' },
      { id: 'de9', target: 'der Vater', native: 'ο πατέρας', note: 'father', cat: 'Family' },
      { id: 'de10', target: 'der Bruder', native: 'ο αδερφός', note: 'brother', cat: 'Family' },
      { id: 'de11', target: 'die Schwester', native: 'η αδερφή', note: 'sister', cat: 'Family' },
      { id: 'de12', target: 'Ich liebe dich', native: 'Σ\' αγαπώ', note: 'I love you', cat: 'Phrases' },
      { id: 'de13', target: 'Du fehlst mir', native: 'Μου λείπεις (εναλλακτικά)', note: 'I miss you (alt. phrasing)', cat: 'Phrases' },
      { id: 'de14', target: 'der Bahnhof', native: 'ο σταθμός', note: 'train station', cat: 'Life' },
      { id: 'de15', target: 'die Fahrkarte', native: 'το εισιτήριο', note: 'ticket', cat: 'Life' },
      { id: 'de16', target: 'der Termin', native: 'το ραντεβού (επίσημο)', note: 'official appointment', cat: 'Life' },
      { id: 'de17', target: 'die Unterlagen', native: 'τα έγγραφα', note: 'documents', cat: 'Life' },
      { id: 'de18', target: 'Hilfe!', native: 'Βοήθεια!', note: 'Help!', cat: 'Life' },
      { id: 'de19', target: 'der Arzt', native: 'ο γιατρός', note: 'doctor', cat: 'Life' },
      { id: 'de20', target: 'die Wohnung', native: 'το διαμέρισμα', note: 'apartment', cat: 'Everyday' },
      { id: 'de21', target: 'das Wochenende', native: 'το σαββατοκύριακο', note: 'weekend', cat: 'Everyday' },
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

const COMPANION_CHIPS = [
  'Was lernt er/sie gerade?',
  'Wie kann ich ihn/sie motivieren?',
  'Erkläre mir kurz seine/ihre aktuelle Lektion',
];

// Quick-reply chips shown to the companion in the Messages tab, so they can
// send a supportive message with one tap instead of typing. Keyed by the
// companion's own native language, since they write in their own language.
const MESSAGE_QUICK_REPLIES = {
  de: ['Gut gemacht! 💪', 'Ich bin stolz auf dich!', 'Weiter so!', 'Du schaffst das!', 'Bin so gespannt auf morgen 😊'],
  el: ['Μπράβο σου! 💪', 'Είμαι περήφανος/η για σένα!', 'Συνέχισε έτσι!', 'Τα καταφέρνεις!', 'Ανυπομονώ για αύριο 😊'],
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

module.exports = { COURSES, getCourse, getAllLessonsFlat, findLesson, COMPANION_CHIPS, MESSAGE_QUICK_REPLIES };