// TrackLift – Built-in exercise database
// Each exercise has consistent SVG visual representation by muscle group

var ExercisesDB = (function () {

  // Muscle group display config
  var MUSCLE_CONFIG = {
    chest:     { label: 'Brust',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   cls: 'muscle-chest',     icon: '💪', gradient: 'linear-gradient(135deg,#7f1d1d,#991b1b)' },
    back:      { label: 'Rücken',    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  cls: 'muscle-back',      icon: '🔵', gradient: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)' },
    shoulders: { label: 'Schultern', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', cls: 'muscle-shoulders', icon: '🟣', gradient: 'linear-gradient(135deg,#3b0764,#6d28d9)' },
    arms:      { label: 'Arme',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', cls: 'muscle-arms',      icon: '🟡', gradient: 'linear-gradient(135deg,#78350f,#d97706)' },
    legs:      { label: 'Beine',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  cls: 'muscle-legs',      icon: '🟢', gradient: 'linear-gradient(135deg,#14532d,#16a34a)' },
    core:      { label: 'Core',      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',  cls: 'muscle-core',      icon: '🔷', gradient: 'linear-gradient(135deg,#083344,#0e7490)' },
    cardio:    { label: 'Cardio',    color: '#f97316', bg: 'rgba(249,115,22,0.1)', cls: 'muscle-cardio',    icon: '🟠', gradient: 'linear-gradient(135deg,#7c2d12,#ea580c)' },
  };

  var EXERCISES = [
    // ── BRUST ────────────────────────────────────────────────────────
    { id: 'bench-press',         name: 'Bankdrücken',              nameEn: 'Bench Press',           primary: 'chest',     secondary: ['triceps','shoulders'], equipment: 'Langhantel',  category: 'compound', desc: 'Die Grundübung für die Brustmuskulatur. Flach auf der Bank, Griffweite schulterbreit.' },
    { id: 'incline-bench',       name: 'Schrägbankdrücken',        nameEn: 'Incline Bench Press',   primary: 'chest',     secondary: ['shoulders','triceps'], equipment: 'Langhantel',  category: 'compound', desc: 'Bankdrücken auf der Schrägbank (30–45°) für den oberen Brustbereich.' },
    { id: 'decline-bench',       name: 'Negativbankdrücken',       nameEn: 'Decline Bench Press',   primary: 'chest',     secondary: ['triceps'],             equipment: 'Langhantel',  category: 'compound', desc: 'Bankdrücken auf der Negativbank für den unteren Brustbereich.' },
    { id: 'db-bench',            name: 'KH-Bankdrücken',           nameEn: 'Dumbbell Bench Press',  primary: 'chest',     secondary: ['triceps','shoulders'], equipment: 'Kurzhantel',  category: 'compound', desc: 'Bankdrücken mit Kurzhanteln für größere Bewegungsfreiheit.' },
    { id: 'incline-db-bench',    name: 'Schrägbank KH-Drücken',    nameEn: 'Incline DB Press',      primary: 'chest',     secondary: ['shoulders'],           equipment: 'Kurzhantel',  category: 'compound', desc: 'Schrägbankdrücken mit Kurzhanteln, oberer Brustbereich.' },
    { id: 'db-fly',              name: 'Kurzhantel Fliegende',     nameEn: 'Dumbbell Fly',          primary: 'chest',     secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Isolationsübung für die Brust. Arme leicht angewinkelt, weite Bewegung.' },
    { id: 'cable-fly',           name: 'Kabel Fliegende',          nameEn: 'Cable Fly',             primary: 'chest',     secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Kabelfliegende für konstante Spannung über den gesamten Bewegungsablauf.' },
    { id: 'pushup',              name: 'Liegestütze',              nameEn: 'Push-Up',               primary: 'chest',     secondary: ['triceps','shoulders'], equipment: 'Körpergewicht', category: 'compound', desc: 'Klassische Körpergewichtsübung für Brust und Trizeps.' },
    { id: 'dips-chest',          name: 'Dips (Brust)',             nameEn: 'Chest Dips',            primary: 'chest',     secondary: ['triceps'],             equipment: 'Körpergewicht', category: 'compound', desc: 'Dips mit vorgebeugtem Oberkörper für mehr Brustbetonung.' },
    { id: 'pec-deck',            name: 'Pec Deck',                 nameEn: 'Pec Deck Machine',      primary: 'chest',     secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Maschinenübung zur Isolation der Brustmuskulatur.' },

    // ── RÜCKEN ───────────────────────────────────────────────────────
    { id: 'deadlift',            name: 'Kreuzheben',               nameEn: 'Deadlift',              primary: 'back',      secondary: ['legs','core'],         equipment: 'Langhantel',  category: 'compound', desc: 'König der Grundübungen. Trainiert den gesamten hinteren Körper.' },
    { id: 'pullup',              name: 'Klimmzüge',                nameEn: 'Pull-Up',               primary: 'back',      secondary: ['biceps'],              equipment: 'Körpergewicht', category: 'compound', desc: 'Klimmzüge mit Übergriff (Pronation). Breite des Griffes variiert den Fokus.' },
    { id: 'chinup',              name: 'Klimmzüge (Untergriff)',   nameEn: 'Chin-Up',               primary: 'back',      secondary: ['biceps'],              equipment: 'Körpergewicht', category: 'compound', desc: 'Klimmzüge mit Untergriff (Supination), stärkere Bizepsaktivierung.' },
    { id: 'lat-pulldown',        name: 'Latzug',                   nameEn: 'Lat Pulldown',          primary: 'back',      secondary: ['biceps'],              equipment: 'Kabel',       category: 'compound', desc: 'Latzug am Kabelzug, Alternative zu Klimmzügen.' },
    { id: 'barbell-row',         name: 'LH-Rudern',                nameEn: 'Barbell Row',           primary: 'back',      secondary: ['biceps','core'],       equipment: 'Langhantel',  category: 'compound', desc: 'Langhantelrudern vorgebeugt – massiver Rückenaufbau.' },
    { id: 'db-row',              name: 'KH-Rudern',                nameEn: 'Dumbbell Row',          primary: 'back',      secondary: ['biceps'],              equipment: 'Kurzhantel',  category: 'compound', desc: 'Einarmiges Kurzhantelrudern auf der Bank.' },
    { id: 'cable-row',           name: 'Seilzug-Rudern',           nameEn: 'Cable Row',             primary: 'back',      secondary: ['biceps'],              equipment: 'Kabel',       category: 'compound', desc: 'Rudern am unteren Kabelzug, gute Isolation und Kontraktion.' },
    { id: 't-bar-row',           name: 'T-Bar Rudern',             nameEn: 'T-Bar Row',             primary: 'back',      secondary: ['biceps'],              equipment: 'Langhantel',  category: 'compound', desc: 'T-Bar Rudern für mittleren Rücken und Rhomboideen.' },
    { id: 'face-pull',           name: 'Face Pull',                nameEn: 'Face Pull',             primary: 'back',      secondary: ['shoulders'],           equipment: 'Kabel',       category: 'isolation', desc: 'Face Pull am Kabel für hintere Schulter und Rotatorenmanschette.' },
    { id: 'hyperextension',      name: 'Hyperextension',           nameEn: 'Back Extension',        primary: 'back',      secondary: ['legs','core'],         equipment: 'Maschine',    category: 'isolation', desc: 'Rückenstrecker-Übung für den unteren Rücken (Erector spinae).' },
    { id: 'good-morning',        name: 'Good Morning',             nameEn: 'Good Morning',          primary: 'back',      secondary: ['legs'],                equipment: 'Langhantel',  category: 'compound', desc: 'Langhantel im Nacken, Oberkörper vorneigen – stärkt den unteren Rücken.' },
    { id: 'seated-cable-row',    name: 'Sitzrudern eng',           nameEn: 'Close-Grip Cable Row',  primary: 'back',      secondary: ['biceps'],              equipment: 'Kabel',       category: 'compound', desc: 'Seilzugrudern mit engem Griff für mittleren Rücken.' },

    // ── SCHULTERN ────────────────────────────────────────────────────
    { id: 'ohp',                 name: 'Schulterdrücken (LH)',      nameEn: 'Overhead Press',        primary: 'shoulders', secondary: ['triceps'],             equipment: 'Langhantel',  category: 'compound', desc: 'Overhead Press – Grundübung für die Schultern.' },
    { id: 'db-ohp',              name: 'Schulterdrücken (KH)',      nameEn: 'DB Shoulder Press',     primary: 'shoulders', secondary: ['triceps'],             equipment: 'Kurzhantel',  category: 'compound', desc: 'Schulterdrücken mit Kurzhanteln, sitzend oder stehend.' },
    { id: 'arnold-press',        name: 'Arnold Press',             nameEn: 'Arnold Press',          primary: 'shoulders', secondary: ['triceps'],             equipment: 'Kurzhantel',  category: 'compound', desc: 'Arnold Press – rotierendes Schulterdrücken, alle Schulterköpfe.' },
    { id: 'lateral-raise',       name: 'Seitliches Heben',         nameEn: 'Lateral Raise',         primary: 'shoulders', secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Seitliches Heben für den mittleren Deltakopf.' },
    { id: 'front-raise',         name: 'Vorgebeugtes Heben',       nameEn: 'Front Raise',           primary: 'shoulders', secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Frontales Heben für den vorderen Deltakopf.' },
    { id: 'rear-delt-fly',       name: 'Hintere Schulter Flieg.',  nameEn: 'Rear Delt Fly',         primary: 'shoulders', secondary: ['back'],                equipment: 'Kurzhantel',  category: 'isolation', desc: 'Vorgebeugte Fliegende für den hinteren Deltakopf.' },
    { id: 'upright-row',         name: 'Aufrechtes Rudern',        nameEn: 'Upright Row',           primary: 'shoulders', secondary: ['back'],                equipment: 'Langhantel',  category: 'compound', desc: 'Aufrechtes Rudern für Schultern und oberen Trapez.' },
    { id: 'cable-lateral-raise', name: 'Kabel Seitl. Heben',       nameEn: 'Cable Lateral Raise',   primary: 'shoulders', secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Seitliches Heben am Kabel für konstante Spannung.' },
    { id: 'machine-shoulder',    name: 'Schultermaschine',         nameEn: 'Machine Shoulder Press', primary: 'shoulders', secondary: [],                     equipment: 'Maschine',    category: 'compound', desc: 'Schulterdrücken an der Maschine, geführte Bewegung.' },

    // ── ARME – BIZEPS ────────────────────────────────────────────────
    { id: 'barbell-curl',        name: 'Langhantel Curl',          nameEn: 'Barbell Curl',          primary: 'arms',      secondary: [],                      equipment: 'Langhantel',  category: 'isolation', desc: 'Klassischer Bizepscurl mit Langhantel.' },
    { id: 'db-curl',             name: 'Kurzhantel Curl',          nameEn: 'Dumbbell Curl',         primary: 'arms',      secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Wechselnder Bizepscurl mit Kurzhanteln.' },
    { id: 'hammer-curl',         name: 'Hammer Curl',              nameEn: 'Hammer Curl',           primary: 'arms',      secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Hammer Curl für Brachialis und Bizeps.' },
    { id: 'preacher-curl',       name: 'Preacher Curl',            nameEn: 'Preacher Curl',         primary: 'arms',      secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Curl am Schrägpult für isolierten Bizeps.' },
    { id: 'cable-curl',          name: 'Kabel Curl',               nameEn: 'Cable Curl',            primary: 'arms',      secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Bizepscurl am Kabel, konstante Spannung.' },
    { id: 'concentration-curl',  name: 'Konzentrations Curl',      nameEn: 'Concentration Curl',    primary: 'arms',      secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Sitzender einarmiger Curl mit Ellbogen am Knie.' },
    { id: 'ez-bar-curl',         name: 'EZ-Stange Curl',           nameEn: 'EZ Bar Curl',           primary: 'arms',      secondary: [],                      equipment: 'Langhantel',  category: 'isolation', desc: 'Bizepscurl mit der EZ-Kurzhantelstange, gelenkschonend.' },

    // ── ARME – TRIZEPS ───────────────────────────────────────────────
    { id: 'tricep-pushdown',     name: 'Trizepsdrücken',           nameEn: 'Tricep Pushdown',       primary: 'arms',      secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Trizepsdrücken am Kabel mit geradem oder V-Griff.' },
    { id: 'skull-crusher',       name: 'Skull Crusher',            nameEn: 'Skull Crusher',         primary: 'arms',      secondary: [],                      equipment: 'Langhantel',  category: 'isolation', desc: 'Liegend, Langhantel zur Stirn senken. Klassischer Trizepskiller.' },
    { id: 'dips-tricep',         name: 'Dips (Trizeps)',           nameEn: 'Tricep Dips',           primary: 'arms',      secondary: ['chest'],               equipment: 'Körpergewicht', category: 'compound', desc: 'Dips mit aufrechtem Oberkörper für Trizepsfokus.' },
    { id: 'overhead-tricep-ext', name: 'Trizeps Over-Head Ext.',   nameEn: 'Overhead Tricep Ext.', primary: 'arms',       secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Überkopf-Trizepsstreckung, langer Trizepskopf.' },
    { id: 'close-grip-bench',    name: 'Enges Bankdrücken',        nameEn: 'Close Grip Bench',      primary: 'arms',      secondary: ['chest'],               equipment: 'Langhantel',  category: 'compound', desc: 'Bankdrücken mit engem Griff, Trizeps-Betonung.' },
    { id: 'tricep-kickback',     name: 'Trizeps Kickback',         nameEn: 'Tricep Kickback',       primary: 'arms',      secondary: [],                      equipment: 'Kurzhantel',  category: 'isolation', desc: 'Vorgebeugter Trizepskickback mit Kurzhantel.' },

    // ── BEINE ────────────────────────────────────────────────────────
    { id: 'squat',               name: 'Kniebeuge',                nameEn: 'Squat',                 primary: 'legs',      secondary: ['core','back'],         equipment: 'Langhantel',  category: 'compound', desc: 'Die König der Beinübungen. Rückenbeuge mit der Langhantel.' },
    { id: 'front-squat',         name: 'Frontkniebeuge',           nameEn: 'Front Squat',           primary: 'legs',      secondary: ['core'],                equipment: 'Langhantel',  category: 'compound', desc: 'Kniebeuge mit Langhantel vorne, stärker Quadrizeps.' },
    { id: 'leg-press',           name: 'Beinpresse',               nameEn: 'Leg Press',             primary: 'legs',      secondary: [],                      equipment: 'Maschine',    category: 'compound', desc: 'Beinpresse für Quadrizeps, Gesäß und Ischiocrurale.' },
    { id: 'rdl',                 name: 'Rumänisches Kreuzheben',   nameEn: 'Romanian Deadlift',     primary: 'legs',      secondary: ['back'],                equipment: 'Langhantel',  category: 'compound', desc: 'RDL für Ischiocrurale und Gesäß. Leichte Kniebeugung.' },
    { id: 'db-rdl',              name: 'KH Rum. Kreuzheben',       nameEn: 'DB Romanian Deadlift',  primary: 'legs',      secondary: ['back'],                equipment: 'Kurzhantel',  category: 'compound', desc: 'Rumänisches Kreuzheben mit Kurzhanteln.' },
    { id: 'leg-extension',       name: 'Beinstrecker',             nameEn: 'Leg Extension',         primary: 'legs',      secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Isolationsübung für den Quadrizeps an der Maschine.' },
    { id: 'leg-curl',            name: 'Beinbeuger',               nameEn: 'Leg Curl',              primary: 'legs',      secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Isolationsübung für die Ischiocrurale Muskulatur.' },
    { id: 'lunges',              name: 'Ausfallschritte',          nameEn: 'Lunges',                primary: 'legs',      secondary: ['core'],                equipment: 'Körpergewicht', category: 'compound', desc: 'Ausfallschritte für Quadrizeps und Gesäß.' },
    { id: 'bulgarian-split',     name: 'Bulg. Split Squat',        nameEn: 'Bulgarian Split Squat', primary: 'legs',      secondary: ['core'],                equipment: 'Kurzhantel',  category: 'compound', desc: 'Einbeinige Kniebeuge mit erhöhtem hinteren Fuß.' },
    { id: 'hip-thrust',          name: 'Hip Thrust',               nameEn: 'Hip Thrust',            primary: 'legs',      secondary: ['core'],                equipment: 'Langhantel',  category: 'compound', desc: 'Hip Thrust auf der Bank – isoliert den Gluteus maximus.' },
    { id: 'goblet-squat',        name: 'Goblet Squat',             nameEn: 'Goblet Squat',          primary: 'legs',      secondary: ['core'],                equipment: 'Kurzhantel',  category: 'compound', desc: 'Kniebeuge mit einer Kurzhantel vor der Brust.' },
    { id: 'calf-raise',          name: 'Wadenheben',               nameEn: 'Calf Raise',            primary: 'legs',      secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Wadenheben an der Maschine oder stehend für Gastrocnemius.' },
    { id: 'seated-calf-raise',   name: 'Sitzendes Wadenheben',     nameEn: 'Seated Calf Raise',     primary: 'legs',      secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Sitzendes Wadenheben für den Soleus.' },
    { id: 'sumo-deadlift',       name: 'Sumo Kreuzheben',          nameEn: 'Sumo Deadlift',         primary: 'legs',      secondary: ['back'],                equipment: 'Langhantel',  category: 'compound', desc: 'Breiter Stand, Innengriff – stärker Hüfte und Adduktoren.' },
    { id: 'hack-squat',          name: 'Hack Squat',               nameEn: 'Hack Squat',            primary: 'legs',      secondary: [],                      equipment: 'Maschine',    category: 'compound', desc: 'Kniebeuge an der Hack-Squat-Maschine.' },
    { id: 'step-up',             name: 'Aufsteigen (Step-Up)',      nameEn: 'Step-Up',               primary: 'legs',      secondary: ['core'],                equipment: 'Kurzhantel',  category: 'compound', desc: 'Auf einen Kasten aufsteigen mit Kurzhantel.' },
    { id: 'glute-kickback',      name: 'Gluteus Kickback',         nameEn: 'Glute Kickback',        primary: 'legs',      secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Kickback am Kabel für den Gluteus.' },

    // ── CORE ─────────────────────────────────────────────────────────
    { id: 'plank',               name: 'Plank',                    nameEn: 'Plank',                 primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Statische Körperspannung – der Klassiker für den Core.' },
    { id: 'crunches',            name: 'Crunches',                 nameEn: 'Crunches',              primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Bauchcrunchs für den oberen Bereich des Rectus abdominis.' },
    { id: 'situp',               name: 'Sit-Ups',                  nameEn: 'Sit-Ups',               primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Klassische Sit-Ups für den geraden Bauchmuskel.' },
    { id: 'russian-twist',       name: 'Russian Twist',            nameEn: 'Russian Twist',         primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Rotationsbewegung für die schräge Bauchmuskulatur.' },
    { id: 'leg-raise',           name: 'Beinheben',                nameEn: 'Leg Raise',             primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Liegendes Beinheben für den unteren Bauchbereich.' },
    { id: 'hanging-leg-raise',   name: 'Hängendes Beinheben',      nameEn: 'Hanging Leg Raise',     primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Am Klimmzugstange hängendes Beinheben – anspruchsvoll.' },
    { id: 'ab-wheel',            name: 'Ab Wheel',                 nameEn: 'Ab Wheel Rollout',      primary: 'core',      secondary: ['back','shoulders'],   equipment: 'Sonstiges',   category: 'isolation', desc: 'Rollout mit dem Bauchrad – intensive Core-Übung.' },
    { id: 'cable-crunch',        name: 'Kabel Crunch',             nameEn: 'Cable Crunch',          primary: 'core',      secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Crunches am Kabelzug für Widerstand über den gesamten Bereich.' },
    { id: 'mountain-climber',    name: 'Mountain Climber',         nameEn: 'Mountain Climber',      primary: 'core',      secondary: ['shoulders'],           equipment: 'Körpergewicht', category: 'isolation', desc: 'Dynamische Knie-zur-Brust-Bewegung in der Liegestützposition.' },
    { id: 'dead-bug',            name: 'Dead Bug',                 nameEn: 'Dead Bug',              primary: 'core',      secondary: [],                      equipment: 'Körpergewicht', category: 'isolation', desc: 'Gegenseitige Arm-Bein-Streckung in Rückenlage für Core-Stabilität.' },

    // ── ZUSATZ ───────────────────────────────────────────────────────
    { id: 'bayesian-curl',       name: 'Bayesian Curl',            nameEn: 'Bayesian Curl',         primary: 'arms',      secondary: [],                      equipment: 'Kabel',       category: 'isolation', desc: 'Kabelcurl mit dem Kabel hinter dem Körper (untere Rolle). Maximale Dehnung des Bizeps am Umkehrpunkt.' },
    { id: 'cable-row-wide',      name: 'Breites Kabel-Rudern',     nameEn: 'Wide-Grip Cable Row',   primary: 'back',      secondary: ['biceps'],              equipment: 'Kabel',       category: 'compound',  desc: 'Rudern am Kabelzug mit breitem Griff, stärkere Aktivierung des oberen Rückens und der Rhomboideen.' },
    { id: 'calf-press',          name: 'Wadendrücken',             nameEn: 'Calf Press (Leg Press)', primary: 'legs',     secondary: [],                      equipment: 'Maschine',    category: 'isolation', desc: 'Wadendrücken an der Beinpresse – Fersen auf der unteren Kante der Plattform.' },
  ];

  // SVG illustrations (consistent style, one per primary muscle group)
  var MUSCLE_SVG = {
    chest: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7f1d1d"/><stop offset="100%" style="stop-color:#dc2626"/></linearGradient></defs>
      <rect width="120" height="90" fill="#1a0808"/>
      <ellipse cx="40" cy="50" rx="26" ry="20" fill="url(#cg)" opacity="0.9"/>
      <ellipse cx="80" cy="50" rx="26" ry="20" fill="url(#cg)" opacity="0.9"/>
      <rect x="56" y="20" width="8" height="55" rx="4" fill="#2a0a0a"/>
      <path d="M30 32 L18 38 L15 55 L25 62 L40 60" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.6"/>
      <path d="M90 32 L102 38 L105 55 L95 62 L80 60" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.6"/>
      <text x="60" y="84" fill="#f87171" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">BRUST</text>
    </svg>`,
    back: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e3a5f"/><stop offset="100%" style="stop-color:#2563eb"/></linearGradient></defs>
      <rect width="120" height="90" fill="#080f1a"/>
      <rect x="40" y="15" width="40" height="50" rx="8" fill="url(#bg)" opacity="0.9"/>
      <rect x="55" y="15" width="10" height="50" fill="#0f1e33" opacity="0.6"/>
      <rect x="36" y="38" width="12" height="28" rx="4" fill="#1d4ed8" opacity="0.7"/>
      <rect x="72" y="38" width="12" height="28" rx="4" fill="#1d4ed8" opacity="0.7"/>
      <line x1="40" y1="25" x2="80" y2="25" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="40" y1="38" x2="80" y2="38" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <line x1="40" y1="51" x2="80" y2="51" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <text x="60" y="84" fill="#60a5fa" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">RÜCKEN</text>
    </svg>`,
    shoulders: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b0764"/><stop offset="100%" style="stop-color:#7c3aed"/></linearGradient></defs>
      <rect width="120" height="90" fill="#0d0818"/>
      <circle cx="30" cy="42" r="20" fill="url(#sg)" opacity="0.9"/>
      <circle cx="90" cy="42" r="20" fill="url(#sg)" opacity="0.9"/>
      <rect x="46" y="20" width="28" height="40" rx="6" fill="#1e1040" opacity="0.8"/>
      <circle cx="30" cy="42" r="12" fill="#6d28d9" opacity="0.5"/>
      <circle cx="90" cy="42" r="12" fill="#6d28d9" opacity="0.5"/>
      <text x="60" y="84" fill="#a78bfa" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">SCHULTERN</text>
    </svg>`,
    arms: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#78350f"/><stop offset="100%" style="stop-color:#d97706"/></linearGradient></defs>
      <rect width="120" height="90" fill="#110a00"/>
      <path d="M25 20 Q18 45 25 70 Q35 75 42 65 Q48 45 42 20 Z" fill="url(#ag)" opacity="0.9"/>
      <path d="M78 20 Q72 45 78 70 Q88 75 95 65 Q102 45 95 20 Z" fill="url(#ag)" opacity="0.9"/>
      <ellipse cx="33" cy="40" rx="10" ry="14" fill="#d97706" opacity="0.4"/>
      <ellipse cx="87" cy="40" rx="10" ry="14" fill="#d97706" opacity="0.4"/>
      <text x="60" y="84" fill="#fbbf24" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">ARME</text>
    </svg>`,
    legs: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#14532d"/><stop offset="100%" style="stop-color:#16a34a"/></linearGradient></defs>
      <rect width="120" height="90" fill="#020f06"/>
      <path d="M30 15 Q24 40 28 70 Q38 76 44 68 Q50 40 46 15 Z" fill="url(#lg)" opacity="0.9"/>
      <path d="M74 15 Q68 40 72 70 Q82 76 88 68 Q94 40 90 15 Z" fill="url(#lg)" opacity="0.9"/>
      <ellipse cx="38" cy="35" rx="10" ry="14" fill="#22c55e" opacity="0.35"/>
      <ellipse cx="82" cy="35" rx="10" ry="14" fill="#22c55e" opacity="0.35"/>
      <text x="60" y="84" fill="#4ade80" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">BEINE</text>
    </svg>`,
    core: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="cog" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#083344"/><stop offset="100%" style="stop-color:#0e7490"/></linearGradient></defs>
      <rect width="120" height="90" fill="#010d12"/>
      <rect x="38" y="14" width="44" height="55" rx="10" fill="url(#cog)" opacity="0.9"/>
      <rect x="57" y="14" width="6" height="55" fill="#041e28" opacity="0.5"/>
      <line x1="40" y1="28" x2="80" y2="28" stroke="#22d3ee" stroke-width="1" opacity="0.4"/>
      <line x1="40" y1="42" x2="80" y2="42" stroke="#22d3ee" stroke-width="1" opacity="0.4"/>
      <line x1="40" y1="56" x2="80" y2="56" stroke="#22d3ee" stroke-width="1" opacity="0.4"/>
      <text x="60" y="84" fill="#22d3ee" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">CORE</text>
    </svg>`,
    cardio: `<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="90" fill="#12060a"/>
      <path d="M60 60 L20 35 Q15 20 30 18 Q45 16 60 35 Q75 16 90 18 Q105 20 100 35 Z" fill="#dc2626" opacity="0.8"/>
      <text x="60" y="84" fill="#fb923c" font-size="9" text-anchor="middle" font-family="system-ui" font-weight="600">CARDIO</text>
    </svg>`,
  };

  function getAll() {
    var custom = Store.getCustomExercises();
    return EXERCISES.concat(custom);
  }

  function getById(id) {
    return getAll().find(function(e){ return e.id === id; });
  }

  function getMuscleConfig(muscleKey) {
    return MUSCLE_CONFIG[muscleKey] || MUSCLE_CONFIG.core;
  }

  function getMuscleLabel(muscleKey) {
    return (MUSCLE_CONFIG[muscleKey] || {}).label || muscleKey;
  }

  function getSVG(muscleKey) {
    return MUSCLE_SVG[muscleKey] || MUSCLE_SVG.core;
  }

  // Render exercise card thumbnail
  function renderThumbnail(primary, size) {
    size = size || 'w-full h-28';
    var svg = getSVG(primary);
    return '<div class="' + size + ' rounded-lg overflow-hidden flex-shrink-0" style="background:#0d0d14;">' + svg + '</div>';
  }

  function renderBadge(primary) {
    var cfg = getMuscleConfig(primary);
    return '<span class="badge ' + cfg.cls + '">' + cfg.label + '</span>';
  }

  function getEquipmentIcon(eq) {
    var icons = { 'Langhantel':'🏋️', 'Kurzhantel':'💪', 'Kabel':'🔗', 'Maschine':'⚙️', 'Körpergewicht':'🤸', 'Sonstiges':'🔧' };
    return icons[eq] || '🏋️';
  }

  return { EXERCISES, MUSCLE_CONFIG, getAll, getById, getMuscleConfig, getMuscleLabel, getSVG, renderThumbnail, renderBadge, getEquipmentIcon };
})();
