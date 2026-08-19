// Static curriculum content, seeded once. Not user-specific.
// Two learning directions: "de" (learning German, native Greek) and "el" (learning Greek, native German).

const db = require('./db');

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
            intro: 'Στα γερμανικά ο χαιρετισμός αλλάζει ανάλογα με την ώρα της ημέρας. Το "Hallo" είναι ανεπίσημο και ταιριάζει πάντα — αλλά το "Guten Morgen/Tag/Abend" δείχνει ότι πρόσεξες την ώρα, κάτι που εκτιμάται ιδιαίτερα στη Γερμανία.',
            quiz: [
              { prompt: 'Γεια σου', answer: 'Hallo', options: ['Hallo', 'Tschüss', 'Bitte'],
                explanation: 'Το "Hallo" είναι ο πιο ανεπίσημος χαιρετισμός και χρησιμοποιείται οποιαδήποτε ώρα της ημέρας, σε φίλους ή γνωστούς.' },
              { prompt: 'Καλημέρα', answer: 'Guten Morgen', options: ['Guten Morgen', 'Gute Nacht', 'Guten Tag'],
                explanation: 'Το "Guten Morgen" λέγεται μόνο το πρωί, περίπου μέχρι τις 10-11. Μετά χρησιμοποιείται το "Guten Tag".' },
              { prompt: 'Αντίο', answer: 'Tschüss', options: ['Tschüss', 'Danke', 'Ja'],
                explanation: 'Το "Tschüss" είναι το ανεπίσημο αντίο. Στα επίσημα περιβάλλοντα (δουλειά, γραφεία) λέμε "Auf Wiedersehen".' },
            ] },
          { id: 'u1l2', title: 'Ναι, όχι, ευχαριστώ', sub: 'Yes, no, thank you', xp: 10,
            intro: 'Οι βασικές λέξεις-κλειδιά κάθε συζήτησης. Πρόσεξε: το "bitte" έχει δύο σημασίες — "παρακαλώ" όταν ζητάς κάτι, και "παρακαλώ/τίποτα" όταν απαντάς σε ευχαριστίες.',
            quiz: [
              { prompt: 'Ναι', answer: 'Ja', options: ['Ja', 'Nein', 'Bitte'],
                explanation: 'Απλή καταφατική απάντηση — προφέρεται "για".' },
              { prompt: 'Όχι', answer: 'Nein', options: ['Nein', 'Ja', 'Danke'],
                explanation: 'Το "Nein" ξεκινά με τον ίδιο ήχο "n" όπως και το ελληνικό "όχι" — εύκολο να το θυμηθείς έτσι.' },
              { prompt: 'Ευχαριστώ πολύ', answer: 'Danke schön', options: ['Danke schön', 'Bitte schön', 'Entschuldigung'],
                explanation: 'Το "schön" εδώ δεν σημαίνει "όμορφο" — απλώς ενισχύει το "danke", σαν να λέμε "ευχαριστώ πάρα πολύ".' },
            ] },
          { id: 'u1l3', title: 'Πώς είσαι;', sub: 'How are you', xp: 10,
            intro: 'Η ερώτηση "Wie geht es dir?" είναι κυριολεκτικά "Πώς πάει σε εσένα;" — το "es" (αυτό) είναι το υποκείμενο, το "dir" σημαίνει "σε εσένα" (δοτική πτώση), όχι "εσύ".',
            quiz: [
              { prompt: 'Πώς είσαι;', answer: 'Wie geht es dir?', options: ['Wie geht es dir?', 'Wie heißt du?', 'Wo bist du?'],
                explanation: 'Κυριολεκτικά "Πώς πάει σε εσένα;" — δεν μεταφράζεται λέξη προς λέξη το ελληνικό "είσαι". Ανεπίσημη σύντομη εκδοχή: "Wie geht\'s?".' },
              { prompt: 'Καλά, ευχαριστώ', answer: 'Gut, danke', options: ['Gut, danke', 'Bitte schön', 'Auf Wiedersehen'],
                explanation: 'Η τυπική απάντηση. Μπορείς να προσθέσεις "und dir?" (και εσύ;) για να ανταποδώσεις την ερώτηση.' },
            ] },
        ],
      },
      {
        id: 'u2', title: 'Παρουσιάζομαι', sub: 'Introducing myself', level: 'A1',
        lessons: [
          { id: 'u2l1', title: 'Πώς σε λένε;', sub: "What's your name", xp: 10,
            intro: 'Το ρήμα "heißen" (λέγομαι/ονομάζομαι) είναι από τα πρώτα ρήματα που μαθαίνει κανείς. Στο α\' ενικό γίνεται "ich heiße", στο β\' ενικό "du heißt".',
            quiz: [
              { prompt: 'Με λένε', answer: 'Ich heiße', options: ['Ich heiße', 'Du bist', 'Wir sind'],
                explanation: '"Heißen" = λέγομαι. "Ich heiße [όνομα]" είναι ο πιο φυσικός τρόπος να συστηθείς.' },
              { prompt: 'Πώς σε λένε;', answer: 'Wie heißt du?', options: ['Wie heißt du?', 'Wie geht es dir?', 'Woher kommst du?'],
                explanation: 'Στο β\' ενικό πρόσωπο το "heißen" παίρνει κατάληξη "-t": du heißt (όχι "heißst").' },
              { prompt: 'Χαίρω πολύ', answer: 'Freut mich', options: ['Freut mich', 'Tschüss', 'Bitte'],
                explanation: 'Κυριολεκτικά "με χαροποιεί" — σύντομη εκδοχή του πλήρους "Es freut mich, dich kennenzulernen".' },
            ] },
          { id: 'u2l2', title: 'Από πού είσαι;', sub: 'Where are you from', xp: 15,
            intro: 'Η πρόθεση "aus" (από) συνοδεύει χώρες χωρίς άρθρο στις περισσότερες περιπτώσεις: "aus Griechenland", "aus Deutschland" — χωρίς "der/die/das" μπροστά.',
            quiz: [
              { prompt: 'Από πού είσαι;', answer: 'Woher kommst du?', options: ['Woher kommst du?', 'Wie geht es dir?', 'Wo wohnst du?'],
                explanation: '"Woher" = από πού (κίνηση/προέλευση), διαφορετικό από το "wo" = πού (θέση). "Woher kommst du?" ρωτά για καταγωγή.' },
              { prompt: 'Είμαι από την Ελλάδα', answer: 'Ich komme aus Griechenland', options: ['Ich komme aus Griechenland', 'Ich wohne in Deutschland', 'Ich bin Grieche'],
                explanation: 'Οι περισσότερες χώρες δεν παίρνουν άρθρο μετά το "aus": "aus Griechenland", όχι "aus dem Griechenland".' },
              { prompt: 'Είμαι από τη Γερμανία', answer: 'Ich komme aus Deutschland', options: ['Ich komme aus Deutschland', 'Ich bin Deutscher', 'Ich wohne in Griechenland'],
                explanation: 'Ίδιο μοτίβο: "komme aus" + χώρα χωρίς άρθρο. Το "bin Deutscher" περιγράφει εθνικότητα, όχι καταγωγή.' },
            ] },
          { id: 'u2l3', title: 'Δουλειά & ηλικία', sub: 'Job & age', xp: 15,
            intro: 'Προσοχή: στα γερμανικά η ηλικία εκφράζεται με το ρήμα "sein" (είμαι), όχι με "haben" (έχω) όπως σε άλλες γλώσσες — "Ich bin 27 Jahre alt", κυριολεκτικά "είμαι 27 χρόνια γέρος/γερή".',
            quiz: [
              { prompt: 'Πόσο χρονών είσαι;', answer: 'Wie alt bist du?', options: ['Wie alt bist du?', 'Wie heißt du?', 'Wo wohnst du?'],
                explanation: '"Alt" = ηλικιωμένος/παλιός, αλλά εδώ απλώς ρωτά την ηλικία. Χρησιμοποιεί το ρήμα "sein" (bist), όχι "haben".' },
              { prompt: 'Είμαι είκοσι επτά χρονών', answer: 'Ich bin 27 Jahre alt', options: ['Ich bin 27 Jahre alt', 'Ich habe 27 Jahre', 'Ich bin 27 Jahren'],
                explanation: 'Η σωστή δομή είναι "Ich bin [αριθμός] Jahre alt" — με "sein", ποτέ "haben". Το "Jahre" μένει πάντα στον πληθυντικό.' },
              { prompt: 'Τι δουλειά κάνεις;', answer: 'Was machst du beruflich?', options: ['Was machst du beruflich?', 'Wo arbeitest du?', 'Wer bist du?'],
                explanation: '"Beruflich" = επαγγελματικά. Κυριολεκτικά "Τι κάνεις επαγγελματικά;" — πιο φυσικό από ερώτηση με "arbeiten" (δουλεύω).' },
            ] },
        ],
      },
      {
        id: 'u3', title: 'Αριθμοί & ώρα', sub: 'Numbers & time', level: 'A1',
        lessons: [
          { id: 'u3l1', title: 'Αριθμοί 0-10', sub: 'Numbers 0-10', xp: 10,
            intro: 'Οι γερμανικοί αριθμοί μέχρι το 10 δεν ακολουθούν πρότυπο — απλά τους αποστηθίζουμε. Από το 13 και πάνω, οι δεκάδες προηγούνται των μονάδων (π.χ. "einundzwanzig" = ένα-και-είκοσι = 21).',
            quiz: [
              { prompt: 'ένα, δύο, τρία', answer: 'eins, zwei, drei', options: ['eins, zwei, drei', 'eins, zwei, vier', 'zwei, drei, vier'],
                explanation: 'Η βασική σειρά 1-2-3. Πρόσεξε: όταν το "eins" χρησιμοποιείται μπροστά από ουσιαστικό (π.χ. "ein Kaffee"), χάνει το "s".' },
              { prompt: 'Πόσα;', answer: 'Wie viele?', options: ['Wie viele?', 'Wie viel?', 'Wie alt?'],
                explanation: '"Wie viele" (με -e) ρωτά για μετρήσιμα πράγματα στον πληθυντικό. Το "Wie viel" (χωρίς -e) χρησιμοποιείται για ποσότητα/τιμή (π.χ. "Wie viel kostet das?").' },
              { prompt: 'δέκα', answer: 'zehn', options: ['zehn', 'neun', 'acht'],
                explanation: '"Zehn" = δέκα. Πρόσεξε ότι το "z" στα γερμανικά προφέρεται "τς", όχι "ζ".' },
            ] },
          { id: 'u3l2', title: 'Τι ώρα είναι;', sub: 'What time is it', xp: 15,
            intro: 'Η ώρα ξεκινά πάντα με απρόσωπο "Es ist" (κυριολεκτικά "αυτό είναι"), ακολουθούμενο από τον αριθμό και τη λέξη "Uhr" (ώρα/ρολόι).',
            quiz: [
              { prompt: 'Τι ώρα είναι;', answer: 'Wie spät ist es?', options: ['Wie spät ist es?', 'Wie viel Uhr kommst du?', 'Was ist die Zeit?'],
                explanation: 'Κυριολεκτικά "Πόσο αργά είναι;" — παράξενο αλλά έτσι ρωτάμε την ώρα στα γερμανικά. Εναλλακτικά: "Wie viel Uhr ist es?".' },
              { prompt: 'Είναι τρεις η ώρα', answer: 'Es ist drei Uhr', options: ['Es ist drei Uhr', 'Es sind drei Uhr', 'Es ist um drei'],
                explanation: 'Το ρήμα μένει πάντα ενικό ("ist"), ακόμα κι αν ο αριθμός είναι μεγαλύτερος του ενός — δεν λέμε ποτέ "es sind".' },
              { prompt: 'σήμερα / αύριο', answer: 'heute / morgen', options: ['heute / morgen', 'gestern / heute', 'morgen / gestern'],
                explanation: 'Πρόσεξε: το "morgen" σημαίνει και "αύριο" και "πρωί" ανάλογα με τα συμφραζόμενα — "morgen früh" = αύριο το πρωί.' },
            ] },
          { id: 'u3l3', title: 'Ημέρες της εβδομάδας', sub: 'Days of the week', xp: 15,
            intro: 'Όλα τα ουσιαστικά στα γερμανικά γράφονται με κεφαλαίο πρώτο γράμμα — και οι μέρες της εβδομάδας δεν αποτελούν εξαίρεση: Montag, Dienstag, κ.ο.κ.',
            quiz: [
              { prompt: 'Δευτέρα', answer: 'Montag', options: ['Montag', 'Dienstag', 'Sonntag'],
                explanation: '"Montag" = Δευτέρα, από το "Mond" (φεγγάρι) + "Tag" (ημέρα) — "μέρα του φεγγαριού", ίδια λογική με τα ελληνικά.' },
              { prompt: 'Σαββατοκύριακο', answer: 'Wochenende', options: ['Wochenende', 'Woche', 'Wochentag'],
                explanation: '"Woche" (εβδομάδα) + "Ende" (τέλος) = "τέλος της εβδομάδας". Το "Wochentag" σημαίνει καθημερινή (όχι σαββατοκύριακο).' },
              { prompt: 'Ποια μέρα είναι σήμερα;', answer: 'Welcher Tag ist heute?', options: ['Welcher Tag ist heute?', 'Wie spät ist heute?', 'Wann ist heute?'],
                explanation: '"Welcher" (ποιος/ποια/ποιο) συμφωνεί σε γένος με το ουσιαστικό — "der Tag" είναι αρσενικό, άρα "welcher Tag".' },
            ] },
        ],
      },
      {
        id: 'u4', title: 'Άρθρα & ουσιαστικά', sub: 'Articles & nouns', level: 'A1',
        lessons: [
          { id: 'u4l1', title: 'Αρσενικό: ο', sub: 'Der', xp: 15,
            intro: 'Τα γερμανικά ουσιαστικά έχουν 3 γένη: αρσενικό (der), θηλυκό (die), ουδέτερο (das). Δυστυχώς δεν υπάρχει πάντα λογικός κανόνας — το καλύτερο είναι να μαθαίνεις κάθε ουσιαστικό ΜΑΖΙ με το άρθρο του, σαν να ήταν μία λέξη.',
            quiz: [
              { prompt: 'ο πατέρας', answer: 'der Vater', options: ['der Vater', 'die Vater', 'das Vater'],
                explanation: 'Τα μέλη της οικογένειας που είναι φυσικά αρσενικά (πατέρας, αδερφός, γιος) παίρνουν σχεδόν πάντα "der".' },
              { prompt: 'ο καφές', answer: 'der Kaffee', options: ['der Kaffee', 'die Kaffee', 'das Kaffee'],
                explanation: 'Εδώ δεν υπάρχει "φυσικός" λόγος — απλώς μαθαίνεται: "der Kaffee". Καλό κόλπο: φαντάσου το ποτήρι με μπλε χρώμα (το χρώμα που πολλοί συνδέουν νοερά με το "der").' },
            ] },
          { id: 'u4l2', title: 'Θηλυκό: η', sub: 'Die', xp: 15,
            intro: 'Χρήσιμος κανόνας: λέξεις που τελειώνουν σε -e, -in, -ung, -heit, -keit ή -schaft είναι σχεδόν πάντα θηλυκές (die). Δεν είναι απόλυτος κανόνας, αλλά βοηθάει σε πολλές περιπτώσεις.',
            quiz: [
              { prompt: 'η γυναίκα', answer: 'die Frau', options: ['der Frau', 'die Frau', 'das Frau'],
                explanation: 'Φυσικά θηλυκό ουσιαστικό — παίρνει "die". Επίσης τελειώνει σε -au, μοτίβο συχνό στα θηλυκά.' },
              { prompt: 'η μητέρα', answer: 'die Mutter', options: ['die Mutter', 'der Mutter', 'das Mutter'],
                explanation: 'Όπως το "der Vater", έτσι και το "die Mutter" είναι φυσικά θηλυκό μέλος της οικογένειας.' },
              { prompt: 'η πόρτα', answer: 'die Tür', options: ['die Tür', 'der Tür', 'das Tür'],
                explanation: 'Καμία "φυσική" λογική εδώ — απλώς απομνημόνευση: "die Tür".' },
            ] },
          { id: 'u4l3', title: 'Ουδέτερο: το', sub: 'Das', xp: 15,
            intro: 'Πολύ χρήσιμος κανόνας χωρίς εξαιρέσεις: κάθε λέξη που τελειώνει σε -chen ή -lein (υποκοριστικά) είναι ΠΑΝΤΑ ουδέτερη (das) — άσχετα με το αρχικό γένος της λέξης. Γι\' αυτό "das Mädchen" (το κορίτσι) είναι ουδέτερο, όχι θηλυκό!',
            quiz: [
              { prompt: 'το κορίτσι', answer: 'das Mädchen', options: ['der Mädchen', 'die Mädchen', 'das Mädchen'],
                explanation: 'Κλασικό "παγιδευτικό" παράδειγμα: αν και σημαίνει "κορίτσι", παίρνει "das" επειδή τελειώνει σε -chen (υποκοριστικό). Ο κανόνας -chen/-lein = das δεν έχει εξαιρέσεις!' },
              { prompt: 'το παιδί', answer: 'das Kind', options: ['das Kind', 'der Kind', 'die Kind'],
                explanation: 'Ουδέτερο γιατί αναφέρεται σε παιδί γενικά (ανεξαρτήτως φύλου) — μαθαίνεται ως "das Kind".' },
              { prompt: 'το σπίτι', answer: 'das Haus', options: ['das Haus', 'der Haus', 'die Haus'],
                explanation: 'Χωρίς ιδιαίτερο κανόνα εδώ — "das Haus" απλά απομνημονεύεται.' },
            ] },
          { id: 'u4l4', title: 'Πληθυντικός', sub: 'Plural', xp: 20,
            intro: 'Καλά νέα: στον πληθυντικό ΟΛΑ τα ουσιαστικά παίρνουν το ίδιο άρθρο, "die" — ανεξάρτητα από το γένος τους στον ενικό. Το ίδιο το ουσιαστικό όμως αλλάζει μορφή με διάφορους τρόπους (όχι πάντα με -s όπως στα αγγλικά).',
            quiz: [
              { prompt: 'οι άντρες (πληθυντικός)', answer: 'die Männer', options: ['die Männer', 'die Manns', 'der Männer'],
                explanation: 'Ο ενικός είναι "der Mann", ο πληθυντικός "die Männer" — παίρνει Umlaut (ä) και κατάληξη -er, όχι -s.' },
              { prompt: 'τα παιδιά (πληθυντικός)', answer: 'die Kinder', options: ['die Kinder', 'die Kinds', 'das Kinder'],
                explanation: 'Ο ενικός "das Kind" γίνεται "die Kinder" στον πληθυντικό — άλλαξε άρθρο σε "die" και πήρε κατάληξη -er.' },
            ] },
        ],
      },
      {
        id: 'u5', title: 'Οικογένεια & σχέση', sub: 'Family & relationship', level: 'A1',
        lessons: [
          { id: 'u5l1', title: 'Η οικογένειά μου', sub: 'My family', xp: 15,
            intro: 'Τα μέλη της οικογένειας ακολουθούν συνήθως το "φυσικό" γένος τους: άνδρας-συγγενής παίρνει "der", γυναίκα-συγγενής παίρνει "die". Εξαίρεση: "das Mädchen" (κορίτσι) λόγω της κατάληξης -chen.',
            quiz: [
              { prompt: 'η μαμά', answer: 'die Mama', options: ['die Mama', 'der Mama', 'das Mama'],
                explanation: 'Ανεπίσημη, στοργική λέξη για τη μητέρα — παρόμοια με το ελληνικό "μαμά". Παίρνει "die" ως φυσικά θηλυκή.' },
              { prompt: 'ο αδερφός', answer: 'der Bruder', options: ['der Bruder', 'die Bruder', 'das Bruder'],
                explanation: 'Φυσικά αρσενικό μέλος της οικογένειας, άρα "der Bruder". Ο πληθυντικός είναι "die Brüder" (με Umlaut).' },
              { prompt: 'η αδερφή', answer: 'die Schwester', options: ['die Schwester', 'der Schwester', 'das Schwester'],
                explanation: 'Φυσικά θηλυκό μέλος της οικογένειας — "die Schwester". Πληθυντικός: "die Schwestern".' },
            ] },
          { id: 'u5l2', title: 'Λόγια αγάπης', sub: 'Words of love', xp: 15,
            intro: 'Το ρήμα "lieben" (αγαπώ) συζυγιέται κανονικά: ich liebe, du liebst. Το "vermissen" (μου λείπεις) λειτουργεί όπως στα ελληνικά — το υποκείμενο είναι αυτός που λείπει σε κάποιον, εδώ όμως εσύ είσαι το υποκείμενο που νιώθει την έλλειψη.',
            quiz: [
              { prompt: 'Σ\' αγαπώ', answer: 'Ich liebe dich', options: ['Ich liebe dich', 'Ich mag dich', 'Ich brauche dich'],
                explanation: '"Lieben" = αγαπώ (ρομαντικά/βαθιά). Το "mögen" (mag) είναι πιο ήπιο, σαν "μου αρέσεις".' },
              { prompt: 'Μου λείπεις', answer: 'Ich vermisse dich', options: ['Ich vermisse dich', 'Ich mag dich', 'Ich brauche dich'],
                explanation: 'Στα γερμανικά ΕΣΥ είσαι το υποκείμενο: "Ich vermisse dich" = κυριολεκτικά "Εγώ λείπω εσένα" — αντίστροφη λογική από το ελληνικό "μου λείπεις".' },
              { prompt: 'αγάπη μου', answer: 'mein Schatz', options: ['mein Schatz', 'meine Familie', 'mein Freund'],
                explanation: '"Schatz" σημαίνει κυριολεκτικά "θησαυρός" και είναι αρσενικό ουσιαστικό, γι\' αυτό "mein" (όχι "meine") — χρησιμοποιείται και για άνδρα και για γυναίκα σύντροφο.' },
            ] },
          { id: 'u5l3', title: 'Η καθημερινότητά μας', sub: 'Our everyday life', xp: 15,
            intro: 'Το "Wie war dein Tag?" χρησιμοποιεί παρελθοντικό χρόνο (war = ήταν, από το "sein"). Το "Was machen wir?" χρησιμοποιεί ενεστώτα του "machen" στο α\' πληθυντικό (wir machen).',
            quiz: [
              { prompt: 'Πώς ήταν η μέρα σου;', answer: 'Wie war dein Tag?', options: ['Wie war dein Tag?', 'Was machst du heute?', 'Wie geht es dir?'],
                explanation: '"War" είναι ο παρελθοντικός τύπος (Präteritum) του "sein" (είμαι) — "ήταν". Χρησιμοποιείται συχνά προφορικά αντί για perfect tense.' },
              { prompt: 'Τι κάνουμε το σαββατοκύριακο;', answer: 'Was machen wir am Wochenende?', options: ['Was machen wir am Wochenende?', 'Wann kommst du nach Hause?', 'Wo warst du heute?'],
                explanation: 'Η πρόθεση "am" (στο) χρησιμοποιείται με ημέρες/χρονικά διαστήματα: "am Wochenende" = το σαββατοκύριακο.' },
            ] },
        ],
      },
      {
        id: 'u6', title: 'Ρήματα & σειρά λέξεων', sub: 'Verbs & word order', level: 'A1',
        lessons: [
          { id: 'u6l1', title: 'Sein & haben', sub: 'To be & to have', xp: 15,
            intro: 'Τα ρήματα "sein" (είμαι) και "haben" (έχω) είναι ανώμαλα και πρέπει να τα αποστηθίσεις: ich bin/habe, du bist/hast, er/sie ist/hat. Είναι τα δύο πιο συχνά ρήματα στη γλώσσα.',
            quiz: [
              { prompt: 'Είμαι', answer: 'Ich bin', options: ['Ich bin', 'Ich habe', 'Du bist'],
                explanation: '"Sein" στο α\' ενικό γίνεται "ich bin" — εντελώς ανώμαλος τύπος, δεν θυμίζει το απαρέμφατο "sein".' },
              { prompt: 'Έχω', answer: 'Ich habe', options: ['Ich habe', 'Ich bin', 'Du hast'],
                explanation: '"Haben" στο α\' ενικό γίνεται "ich habe" — πιο κοντά στο απαρέμφατο σε σχέση με το "sein".' },
              { prompt: 'Έχεις χρόνο;', answer: 'Hast du Zeit?', options: ['Hast du Zeit?', 'Bist du Zeit?', 'Ist du Zeit?'],
                explanation: 'Σε ερωτήσεις χωρίς ερωτηματική λέξη, το ρήμα πάει πρώτο: "Hast du...?" όχι "Du hast...?". Το "Zeit" (χρόνος) παίρνει το ρήμα "haben", όχι "sein".' },
            ] },
          { id: 'u6l2', title: 'Κανονικά ρήματα', sub: 'Regular verbs', xp: 15,
            intro: 'Τα κανονικά ρήματα παίρνουν σταθερές καταλήξεις: ich -e, du -st, er/sie -t, wir -en. Π.χ. "lernen" (μαθαίνω): ich lerne, du lernst, wir lernen.',
            quiz: [
              { prompt: 'Μαθαίνω γερμανικά', answer: 'Ich lerne Deutsch', options: ['Ich lerne Deutsch', 'Ich lernst Deutsch', 'Ich lernen Deutsch'],
                explanation: 'Α\' ενικό πρόσωπο παίρνει κατάληξη -e: "ich lerne". Το -st είναι για το "du", το -en για το "wir".' },
              { prompt: 'Μένεις στη Γερμανία;', answer: 'Wohnst du in Deutschland?', options: ['Wohnst du in Deutschland?', 'Wohnt du in Deutschland?', 'Wohnen du in Deutschland?'],
                explanation: 'Β\' ενικό πρόσωπο παίρνει κατάληξη -st: "du wohnst". Σε ερώτηση, το ρήμα πάει πρώτο: "Wohnst du...?".' },
              { prompt: 'Παίζουμε', answer: 'Wir spielen', options: ['Wir spielen', 'Wir spielt', 'Wir spiele'],
                explanation: 'Α\' πληθυντικό παίρνει κατάληξη -en, ίδια με το απαρέμφατο: "wir spielen" (spielen = παίζω/παίζουμε ως βασικός τύπος).' },
            ] },
          { id: 'u6l3', title: 'Σειρά λέξεων', sub: 'Word order', xp: 20,
            intro: 'Χρυσός κανόνας στα γερμανικά: το ρήμα είναι ΠΑΝΤΑ η δεύτερη θέση της πρότασης (κανόνας "V2"). Αν η πρόταση ξεκινά με κάτι άλλο εκτός από το υποκείμενο (π.χ. "Heute" = σήμερα), το ρήμα ΠΑΡΑΜΕΝΕΙ δεύτερο και το υποκείμενο πάει τρίτο.',
            quiz: [
              { prompt: 'Σήμερα μαθαίνω γερμανικά', answer: 'Heute lerne ich Deutsch', options: ['Heute lerne ich Deutsch', 'Heute ich lerne Deutsch', 'Ich heute lerne Deutsch'],
                explanation: 'Το "Heute" πιάνει την 1η θέση, άρα το ρήμα "lerne" πρέπει να μείνει 2ο και το "ich" πάει 3ο — αντίστροφη σειρά απ\' ό,τι θα περίμενε κανείς.' },
              { prompt: 'Αύριο πάμε στο σπίτι', answer: 'Morgen gehen wir nach Hause', options: ['Morgen gehen wir nach Hause', 'Morgen wir gehen nach Hause', 'Wir morgen gehen nach Hause'],
                explanation: 'Ίδιος κανόνας V2: "Morgen" 1η θέση → "gehen" (ρήμα) 2η θέση → "wir" 3η θέση. Το "nach Hause" σημαίνει "προς το σπίτι" (κίνηση).' },
            ] },
          { id: 'u6l4', title: 'Ερωτηματικές λέξεις', sub: 'Question words', xp: 15,
            intro: 'Οι βασικές ερωτηματικές λέξεις: wer (ποιος), was (τι), wo (πού), wann (πότε), warum (γιατί), wie (πώς). Όλες ξεκινούν με "w-", όπως τα αγγλικά "wh-".',
            quiz: [
              { prompt: 'Ποιος;', answer: 'Wer?', options: ['Wer?', 'Was?', 'Wo?'],
                explanation: '"Wer" ρωτά για πρόσωπο (ποιος/ποια), ενώ "was" ρωτά για πράγμα (τι).' },
              { prompt: 'Πού;', answer: 'Wo?', options: ['Wo?', 'Wer?', 'Wann?'],
                explanation: '"Wo" ρωτά για θέση/τοποθεσία (πού βρίσκεται κάτι), διαφορετικό από το "woher" (από πού).' },
              { prompt: 'Πότε;', answer: 'Wann?', options: ['Wann?', 'Warum?', 'Wie?'],
                explanation: '"Wann" = πότε (χρόνος). Μην το μπερδεύεις με το "warum" = γιατί (αιτία).' },
            ] },
        ],
      },
      {
        id: 'u7', title: 'Στο καφέ & εστιατόριο', sub: 'At the café & restaurant', level: 'A1',
        lessons: [
          { id: 'u7l1', title: 'Παραγγελία', sub: 'Ordering', xp: 15,
            intro: 'Όταν παραγγέλνεις κάτι, το ουσιαστικό μπαίνει σε αιτιατική πτώση (Akkusativ). Γι\' αυτό λέμε "einen Kaffee" (όχι "ein Kaffee") — το αρσενικό άρθρο "ein" γίνεται "einen" στην αιτιατική.',
            quiz: [
              { prompt: 'Έναν καφέ, παρακαλώ', answer: 'Einen Kaffee, bitte', options: ['Einen Kaffee, bitte', 'Ein Wasser, danke', 'Die Rechnung, bitte'],
                explanation: 'Το "der Kaffee" είναι αρσενικό, οπότε στην αιτιατική (ό,τι παραγγέλνεις/ζητάς) το άρθρο "ein" γίνεται "einen".' },
              { prompt: 'Τι θα θέλατε;', answer: 'Was möchten Sie?', options: ['Was möchten Sie?', 'Wo ist die Toilette?', 'Wie viel kostet das?'],
                explanation: 'Το "Sie" με κεφαλαίο είναι ο επίσημος τύπος του "εσείς" — χρησιμοποιείται από σερβιτόρους/υπαλλήλους προς πελάτες.' },
            ] },
          { id: 'u7l2', title: 'Πληρωμή', sub: 'Paying', xp: 15,
            intro: 'Το "die Rechnung" (ο λογαριασμός) είναι θηλυκό ουσιαστικό. Στη φράση "Wie viel kostet das?" το "das" (αυτό) αναφέρεται γενικά σε κάτι, χωρίς να χρειάζεται συγκεκριμένο γένος.',
            quiz: [
              { prompt: 'Τον λογαριασμό, παρακαλώ', answer: 'Die Rechnung, bitte', options: ['Die Rechnung, bitte', 'Das Menü, bitte', 'Den Löffel, bitte'],
                explanation: '"Die Rechnung" = ο λογαριασμός, θηλυκό ουσιαστικό. Σε σύντομες φράσεις σαν αυτή δεν χρειάζεται αλλαγή πτώσης.' },
              { prompt: 'Πόσο κάνει;', answer: 'Wie viel kostet das?', options: ['Wie viel kostet das?', 'Wo ist das?', 'Was ist das?'],
                explanation: '"Kosten" = κοστίζω. "Wie viel kostet das?" είναι η πιο φυσική ερώτηση για τιμή, αντίστοιχη του "wie viel" (πόσο) που είδαμε στο u3.' },
            ] },
          { id: 'u7l3', title: 'Προτιμήσεις φαγητού', sub: 'Food preferences', xp: 15,
            intro: 'Στην άρνηση, τα γερμανικά χρησιμοποιούν "kein" (καθόλου/κανένα) αντί για "nicht" όταν αρνούμαστε ένα ουσιαστικό: "Ich esse kein Fleisch" (δεν τρώω [καθόλου] κρέας), όχι "Ich esse nicht Fleisch".',
            quiz: [
              { prompt: 'Θα ήθελα', answer: 'Ich möchte', options: ['Ich möchte', 'Ich mag', 'Ich habe'],
                explanation: '"Möchte" (θα ήθελα) είναι πιο ευγενικό από το "will" (θέλω) — ιδανικό για παραγγελίες. Το "mag" σημαίνει "μου αρέσει".' },
              { prompt: 'Δεν τρώω κρέας', answer: 'Ich esse kein Fleisch', options: ['Ich esse kein Fleisch', 'Ich esse nicht Fleisch', 'Ich habe kein Fleisch'],
                explanation: 'Όταν αρνούμαστε ένα ουσιαστικό (όχι ρήμα ή επίθετο), χρησιμοποιούμε "kein/keine/keinen" αντί για "nicht". Το "Fleisch" είναι ουδέτερο, άρα "kein" (χωρίς κατάληξη).' },
            ] },
        ],
      },
      {
        id: 'u8', title: 'Στους δρόμους της Γερμανίας', sub: 'Getting around Germany', level: 'A2',
        lessons: [
          { id: 'u8l1', title: 'Μέσα μεταφοράς', sub: 'Transportation', xp: 15,
            intro: 'Το "der Zug" (τρένο) είναι αρσενικό. Όταν ζητάς εισιτήριο, χρησιμοποιείς πάλι αιτιατική: "eine Fahrkarte" (το "eine" εδώ δεν αλλάζει γιατί το "die Fahrkarte" είναι θηλυκό, και τα θηλυκά άρθρα δεν αλλάζουν στην αιτιατική).',
            quiz: [
              { prompt: 'το τρένο', answer: 'der Zug', options: ['der Zug', 'die Zug', 'das Zug'],
                explanation: '"Der Zug" = το τρένο, αρσενικό ουσιαστικό. Πληθυντικός: "die Züge".' },
              { prompt: 'Ένα εισιτήριο, παρακαλώ', answer: 'Eine Fahrkarte, bitte', options: ['Eine Fahrkarte, bitte', 'Ein Ticket, danke', 'Der Bahnhof, bitte'],
                explanation: '"Die Fahrkarte" είναι θηλυκό, οπότε στην αιτιατική παραμένει "eine" (τα θηλυκά αόριστα άρθρα δεν αλλάζουν μορφή στην αιτιατική, σε αντίθεση με τα αρσενικά).' },
            ] },
          { id: 'u8l2', title: 'Ρωτώντας για κατεύθυνση', sub: 'Asking for directions', xp: 15,
            intro: 'Βασικές λέξεις κατεύθυνσης: "geradeaus" (ευθεία), "links" (αριστερά), "rechts" (δεξιά). Συνδυάζονται συχνά με "und dann" (και μετά).',
            quiz: [
              { prompt: 'Πού είναι ο σταθμός;', answer: 'Wo ist der Bahnhof?', options: ['Wo ist der Bahnhof?', 'Wo ist die Toilette?', 'Wann fährt der Zug?'],
                explanation: '"Der Bahnhof" (ο σταθμός) είναι αρσενικό. Χρησιμοποιούμε "wo" (πού) γιατί ρωτάμε για θέση, όχι κίνηση.' },
              { prompt: 'Ευθεία και μετά αριστερά', answer: 'Geradeaus und dann links', options: ['Geradeaus und dann links', 'Links und dann rechts', 'Geradeaus und dann rechts'],
                explanation: 'Οι κατευθυντικές λέξεις "links" (αριστερά) και "rechts" (δεξιά) δεν κλίνονται — μένουν πάντα ίδιες.' },
            ] },
          { id: 'u8l3', title: 'Στο σούπερ μάρκετ', sub: 'At the supermarket', xp: 15,
            intro: 'Το "das Brot" (ψωμί) είναι ουδέτερο. Η φράση "Nur das, danke" (μόνο αυτό, ευχαριστώ) χρησιμοποιεί το γενικό "das" αντί για συγκεκριμένο άρθρο — πρακτικό όταν δείχνεις κάτι.',
            quiz: [
              { prompt: 'Πού είναι το ψωμί;', answer: 'Wo ist das Brot?', options: ['Wo ist das Brot?', 'Wo ist die Milch?', 'Was kostet das Brot?'],
                explanation: '"Das Brot" = το ψωμί, ουδέτερο. Ξανά το ερωτηματικό "wo" για θέση μέσα στο κατάστημα.' },
              { prompt: 'Μόνο αυτό, ευχαριστώ', answer: 'Nur das, danke', options: ['Nur das, danke', 'Wie viel kostet das?', 'Ich möchte mehr'],
                explanation: '"Nur" = μόνο. Πολύ χρήσιμη φράση στο ταμείο όταν ο υπάλληλος ρωτά αν θέλεις κι άλλο.' },
            ] },
        ],
      },
      {
        id: 'u9', title: 'Σπίτι & καθημερινότητα', sub: 'Home & daily routine', level: 'A2',
        lessons: [
          { id: 'u9l1', title: 'Το σπίτι', sub: 'The apartment', xp: 15,
            intro: 'Τα δωμάτια του σπιτιού έχουν διάφορα γένη — δεν υπάρχει κανόνας, μαθαίνονται ένα-ένα: die Küche (κουζίνα), das Zimmer (δωμάτιο), das Bad (μπάνιο), das Wohnzimmer (σαλόνι).',
            quiz: [
              { prompt: 'η κουζίνα', answer: 'die Küche', options: ['die Küche', 'der Küche', 'das Küche'],
                explanation: '"Die Küche" — θηλυκό, όπως πολλές λέξεις που τελειώνουν σε -e.' },
              { prompt: 'το δωμάτιο', answer: 'das Zimmer', options: ['das Zimmer', 'der Zimmer', 'die Zimmer'],
                explanation: '"Das Zimmer" — γενικό δωμάτιο, ουδέτερο. Συχνά συνδυάζεται: "das Schlafzimmer" (υπνοδωμάτιο), "das Wohnzimmer" (σαλόνι).' },
            ] },
          { id: 'u9l2', title: 'Η καθημερινή μου ρουτίνα', sub: 'My daily routine', xp: 15,
            intro: 'Πολλά γερμανικά ρήματα είναι "διαχωριζόμενα" (trennbare Verben): το πρόθεμα αποκόβεται και πάει στο τέλος της πρότασης. Το "aufstehen" (σηκώνομαι) γίνεται "ich stehe... auf" — το "auf" πάει τελευταίο!',
            quiz: [
              { prompt: 'Ξυπνάω στις εφτά', answer: 'Ich stehe um sieben auf', options: ['Ich stehe um sieben auf', 'Ich stehe auf um sieben', 'Ich aufstehe um sieben'],
                explanation: 'Διαχωριζόμενο ρήμα: "aufstehen" → "ich stehe... auf". Το "auf" αποκόβεται από το ρήμα και πάει στο τέλος της πρότασης, ό,τι κι αν μεσολαβεί.' },
              { prompt: 'Πάω για ύπνο νωρίς', answer: 'Ich gehe früh schlafen', options: ['Ich gehe früh schlafen', 'Ich schlafe früh gehen', 'Ich früh gehe schlafen'],
                explanation: 'Δομή "gehen" + απαρέμφατο στο τέλος: "ich gehe schlafen" (πάω να κοιμηθώ). Το επίρρημα "früh" (νωρίς) μπαίνει ανάμεσα.' },
            ] },
          { id: 'u9l3', title: 'Σχέδια για το σαββατοκύριακο', sub: 'Weekend plans', xp: 15,
            intro: 'Η ρηματική δομή "möchte" + απαρέμφατο στέλνει πάντα το απαρέμφατο στο τέλος της πρότασης: "Ich möchte dich sehen" (θέλω να σε δω) — το "sehen" (βλέπω) πάει τελευταίο.',
            quiz: [
              { prompt: 'Τι κάνεις αυτό το σαββατοκύριακο;', answer: 'Was machst du dieses Wochenende?', options: ['Was machst du dieses Wochenende?', 'Was hast du dieses Wochenende?', 'Wo bist du dieses Wochenende?'],
                explanation: '"Dieses" = αυτό (δεικτική αντωνυμία), συμφωνεί με το ουδέτερο "das Wochenende".' },
              { prompt: 'Θέλω να σε δω', answer: 'Ich möchte dich sehen', options: ['Ich möchte dich sehen', 'Ich möchte dich schauen', 'Ich will du sehen'],
                explanation: '"Möchte" + απαρέμφατο στο τέλος: "möchte... sehen". Το "dich" (εσένα, αιτιατική) μπαίνει ανάμεσα στα δύο ρήματα.' },
            ] },
        ],
      },
      {
        id: 'u10', title: 'Γραφειοκρατία & έκτακτες καταστάσεις', sub: 'Bureaucracy & emergencies', level: 'A2',
        lessons: [
          { id: 'u10l1', title: 'Στο Bürgeramt', sub: 'At the registration office', xp: 20,
            intro: 'Το "der Termin" (ραντεβού/προθεσμία) είναι αρσενικό, άρα στην αιτιατική γίνεται "einen Termin". Το ρήμα "brauchen" (χρειάζομαι) παίρνει πάντα αντικείμενο σε αιτιατική.',
            quiz: [
              { prompt: 'Έχω ένα ραντεβού', answer: 'Ich habe einen Termin', options: ['Ich habe einen Termin', 'Ich bin ein Termin', 'Ich mache einen Termin'],
                explanation: '"Der Termin" αρσενικό → αιτιατική "einen Termin". Το ρήμα είναι "haben" (έχω), όχι "sein" (είμαι) — προσοχή στην 2η επιλογή!' },
              { prompt: 'Χρειάζομαι τα έγγραφά μου', answer: 'Ich brauche meine Unterlagen', options: ['Ich brauche meine Unterlagen', 'Ich habe meine Unterlagen', 'Ich möchte meine Unterlagen'],
                explanation: '"Die Unterlagen" (τα έγγραφα) χρησιμοποιείται συνήθως στον πληθυντικό. "Brauchen" = χρειάζομαι, πιο συγκεκριμένο από "haben" (έχω) ή "möchte" (θα ήθελα).' },
            ] },
          { id: 'u10l2', title: 'Στον γιατρό', sub: 'At the doctor', xp: 20,
            intro: 'Η έκφραση πόνου στα γερμανικά είναι απρόσωπη: "Es tut weh" (πονάει), κυριολεκτικά "αυτό κάνει κακό". Αν θες να πεις ΠΟΥ πονάει, προσθέτεις "hier" (εδώ) ή το μέρος του σώματος σε δοτική.',
            quiz: [
              { prompt: 'Πονάει εδώ', answer: 'Es tut hier weh', options: ['Es tut hier weh', 'Es ist hier weh', 'Ich tue hier weh'],
                explanation: 'Απρόσωπη έκφραση: "es tut weh" (πονάει). Το ρήμα είναι "tun" (κάνω), όχι "sein" (είμαι) — "Es tut weh", ποτέ "Es ist weh".' },
              { prompt: 'Χρειάζομαι γιατρό', answer: 'Ich brauche einen Arzt', options: ['Ich brauche einen Arzt', 'Ich bin ein Arzt', 'Ich habe einen Arzt'],
                explanation: '"Der Arzt" αρσενικό → αιτιατική "einen Arzt" μετά το "brauchen". Πρόσεξε τη διαφορά με "Ich bin ein Arzt" (Είμαι γιατρός) — τελείως διαφορετικό νόημα!' },
            ] },
          { id: 'u10l3', title: 'Έκτακτη ανάγκη', sub: 'Emergency', xp: 20,
            intro: 'Σε επείγουσες καταστάσεις χρησιμοποιείται η προστακτική με "Sie" (επίσημο εσείς): "Rufen Sie..." (καλέστε...). Το ρήμα πάει πρώτο στην πρόταση, όπως στις ερωτήσεις.',
            quiz: [
              { prompt: 'Βοήθεια!', answer: 'Hilfe!', options: ['Hilfe!', 'Achtung!', 'Vorsicht!'],
                explanation: '"Hilfe!" = Βοήθεια! Μην το μπερδεύεις με "Achtung!" (Προσοχή!) ή "Vorsicht!" (Πρόσεχε!) — διαφορετικές προειδοποιήσεις.' },
              { prompt: 'Καλέστε ασθενοφόρο!', answer: 'Rufen Sie einen Krankenwagen!', options: ['Rufen Sie einen Krankenwagen!', 'Rufen Sie die Polizei!', 'Rufen Sie ein Taxi!'],
                explanation: 'Προστακτική επίσημου τύπου: "Rufen Sie..." (Καλέστε...). "Der Krankenwagen" = ασθενοφόρο, κυριολεκτικά "αμάξι για αρρώστους", αρσενικό → "einen".' },
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

// User-imported units (via the JSON paste import) live in the DB rather than
// in this static file, and get appended after the built-in units.
function loadCustomUnits(targetLang) {
  const rows = db.prepare('SELECT unit_json FROM custom_units WHERE target_lang = ? ORDER BY id ASC').all(targetLang);
  return rows.map(r => JSON.parse(r.unit_json));
}

function getCourse(targetLang) {
  const base = COURSES[targetLang] || COURSES.de;
  const customUnits = loadCustomUnits(targetLang);
  if (!customUnits.length) return base;
  return { ...base, units: [...base.units, ...customUnits] };
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