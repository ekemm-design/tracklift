// TrackLift – Preset training plans
var PlansDB = (function () {

  var PRESET_PLANS = [
    {
      id: 'ppl',
      name: 'Push Pull Legs (PPL)',
      description: '6-Tage-Split. Push (Brust/Schultern/Trizeps), Pull (Rücken/Bizeps), Legs (Beine). Optimal für Fortgeschrittene.',
      frequency: '6x / Woche',
      level: 'Fortgeschritten',
      isPreset: true,
      days: [
        {
          name: 'Push A – Brust & Trizeps',
          focus: 'Brust · Schultern · Trizeps',
          exercises: [
            { exerciseId: 'bench-press',      sets: 4, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'incline-bench',     sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'db-ohp',           sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'lateral-raise',    sets: 4, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'tricep-pushdown',  sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'skull-crusher',    sets: 3, reps: '10–12', restSeconds: 60  },
          ]
        },
        {
          name: 'Pull A – Rücken & Bizeps',
          focus: 'Rücken · Bizeps',
          exercises: [
            { exerciseId: 'pullup',          sets: 4, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'barbell-row',     sets: 4, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'lat-pulldown',    sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'cable-row',       sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'face-pull',       sets: 3, reps: '15–20', restSeconds: 60  },
            { exerciseId: 'barbell-curl',    sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'hammer-curl',     sets: 3, reps: '12–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Legs A – Quadrizeps-Fokus',
          focus: 'Beine · Gesäß · Core',
          exercises: [
            { exerciseId: 'squat',          sets: 4, reps: '6–10',  restSeconds: 150 },
            { exerciseId: 'leg-press',      sets: 3, reps: '10–15', restSeconds: 90  },
            { exerciseId: 'leg-extension',  sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'rdl',            sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'leg-curl',       sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'calf-raise',     sets: 4, reps: '15–20', restSeconds: 45  },
          ]
        },
        {
          name: 'Push B – Schulter-Fokus',
          focus: 'Schultern · Brust · Trizeps',
          exercises: [
            { exerciseId: 'ohp',                sets: 4, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'incline-db-bench',   sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'arnold-press',       sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'lateral-raise',      sets: 4, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'cable-fly',          sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'overhead-tricep-ext',sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'dips-tricep',        sets: 3, reps: '10–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Pull B – Rücken-Fokus',
          focus: 'Rücken · Bizeps · Hintere Schulter',
          exercises: [
            { exerciseId: 'deadlift',          sets: 3, reps: '4–6',   restSeconds: 180 },
            { exerciseId: 'chinup',            sets: 3, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'db-row',            sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'cable-row',         sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'rear-delt-fly',     sets: 3, reps: '15–20', restSeconds: 60  },
            { exerciseId: 'preacher-curl',     sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'ez-bar-curl',       sets: 3, reps: '12–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Legs B – Posterior Chain',
          focus: 'Ischiocrurale · Gesäß · Waden',
          exercises: [
            { exerciseId: 'rdl',               sets: 4, reps: '8–10',  restSeconds: 120 },
            { exerciseId: 'bulgarian-split',   sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'hip-thrust',        sets: 3, reps: '10–15', restSeconds: 90  },
            { exerciseId: 'leg-curl',          sets: 4, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'lunges',            sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'calf-raise',        sets: 5, reps: '15–20', restSeconds: 45  },
          ]
        },
      ]
    },

    {
      id: 'arnold',
      name: 'Arnold Split',
      description: 'Der Split des legendären Arnold Schwarzenegger. 6 Tage, jeweils Brust+Rücken, Schultern+Arme, Beine.',
      frequency: '6x / Woche',
      level: 'Fortgeschritten',
      isPreset: true,
      days: [
        {
          name: 'Brust & Rücken A',
          focus: 'Brust · Rücken',
          exercises: [
            { exerciseId: 'bench-press',   sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'barbell-row',   sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'incline-bench', sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'pullup',        sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'db-fly',        sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'cable-row',     sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'cable-fly',     sets: 3, reps: '12–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Schultern & Arme A',
          focus: 'Schultern · Bizeps · Trizeps',
          exercises: [
            { exerciseId: 'ohp',               sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'barbell-curl',      sets: 4, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'skull-crusher',     sets: 4, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'lateral-raise',     sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'db-curl',           sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'tricep-pushdown',   sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'rear-delt-fly',     sets: 3, reps: '15–20', restSeconds: 60  },
          ]
        },
        {
          name: 'Beine A',
          focus: 'Beine · Gesäß · Waden · Core',
          exercises: [
            { exerciseId: 'squat',         sets: 5, reps: '6–10',  restSeconds: 150 },
            { exerciseId: 'rdl',           sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'leg-press',     sets: 3, reps: '12–15', restSeconds: 90  },
            { exerciseId: 'leg-curl',      sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'leg-extension', sets: 3, reps: '15–20', restSeconds: 60  },
            { exerciseId: 'calf-raise',    sets: 5, reps: '15–25', restSeconds: 45  },
            { exerciseId: 'plank',         sets: 3, reps: '60s',   restSeconds: 45  },
          ]
        },
        {
          name: 'Brust & Rücken B',
          focus: 'Brust · Rücken (Variation)',
          exercises: [
            { exerciseId: 'incline-db-bench', sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'lat-pulldown',     sets: 4, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'db-bench',         sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'db-row',           sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'dips-chest',       sets: 3, reps: '10–15', restSeconds: 60  },
            { exerciseId: 'face-pull',        sets: 3, reps: '15–20', restSeconds: 60  },
          ]
        },
        {
          name: 'Schultern & Arme B',
          focus: 'Schultern · Bizeps · Trizeps (Variation)',
          exercises: [
            { exerciseId: 'arnold-press',        sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'hammer-curl',         sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'dips-tricep',         sets: 3, reps: '10–15', restSeconds: 60  },
            { exerciseId: 'cable-lateral-raise', sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'concentration-curl',  sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'overhead-tricep-ext', sets: 3, reps: '12–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Beine B',
          focus: 'Beine · Gesäß (Variation)',
          exercises: [
            { exerciseId: 'front-squat',     sets: 4, reps: '6–10',  restSeconds: 150 },
            { exerciseId: 'hip-thrust',      sets: 4, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'bulgarian-split', sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'leg-curl',        sets: 4, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'step-up',         sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'seated-calf-raise',sets: 5, reps: '15–20', restSeconds: 45 },
          ]
        },
      ]
    },

    {
      id: 'okuk',
      name: 'OK / UK Split',
      description: 'Oberkörper-Unterkörper-Split. 4 Tage pro Woche, ideal für Intermediate. Jede Muskelgruppe 2x pro Woche.',
      frequency: '4x / Woche',
      level: 'Intermediate',
      isPreset: true,
      days: [
        {
          name: 'Oberkörper A – Drücken',
          focus: 'Brust · Schultern · Trizeps',
          exercises: [
            { exerciseId: 'bench-press',    sets: 4, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'ohp',            sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'incline-bench',  sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'lateral-raise',  sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'skull-crusher',  sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'tricep-pushdown',sets: 3, reps: '12–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Unterkörper A – Kniebeuge-Fokus',
          focus: 'Quadrizeps · Gesäß · Core',
          exercises: [
            { exerciseId: 'squat',          sets: 4, reps: '6–10',  restSeconds: 150 },
            { exerciseId: 'leg-press',      sets: 3, reps: '10–15', restSeconds: 90  },
            { exerciseId: 'rdl',            sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'leg-extension',  sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'leg-curl',       sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'calf-raise',     sets: 4, reps: '15–20', restSeconds: 45  },
          ]
        },
        {
          name: 'Oberkörper B – Ziehen',
          focus: 'Rücken · Bizeps · Hintere Schulter',
          exercises: [
            { exerciseId: 'pullup',        sets: 4, reps: '6–10',  restSeconds: 120 },
            { exerciseId: 'barbell-row',   sets: 4, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'lat-pulldown',  sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'face-pull',     sets: 3, reps: '15–20', restSeconds: 60  },
            { exerciseId: 'barbell-curl',  sets: 3, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'hammer-curl',   sets: 3, reps: '12–15', restSeconds: 60  },
          ]
        },
        {
          name: 'Unterkörper B – Posterior Chain',
          focus: 'Ischiocrurale · Gesäß · Waden',
          exercises: [
            { exerciseId: 'deadlift',        sets: 3, reps: '4–6',   restSeconds: 180 },
            { exerciseId: 'hip-thrust',      sets: 4, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'bulgarian-split', sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'leg-curl',        sets: 4, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'goblet-squat',    sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'calf-raise',      sets: 4, reps: '15–20', restSeconds: 45  },
          ]
        },
      ]
    },

    {
      id: 'fullbody',
      name: 'Ganzkörper (3x / Woche)',
      description: '3-Tage-Ganzkörpertraining für Einsteiger und Intermediate. Montag, Mittwoch, Freitag.',
      frequency: '3x / Woche',
      level: 'Einsteiger / Intermediate',
      isPreset: true,
      days: [
        {
          name: 'Ganzkörper A',
          focus: 'Alle Muskelgruppen',
          exercises: [
            { exerciseId: 'squat',          sets: 3, reps: '8–12',  restSeconds: 120 },
            { exerciseId: 'bench-press',    sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'barbell-row',    sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'ohp',            sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'barbell-curl',   sets: 2, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'tricep-pushdown',sets: 2, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'plank',          sets: 3, reps: '30–60s',restSeconds: 45  },
          ]
        },
        {
          name: 'Ganzkörper B',
          focus: 'Alle Muskelgruppen (Variation)',
          exercises: [
            { exerciseId: 'deadlift',       sets: 3, reps: '5–8',   restSeconds: 150 },
            { exerciseId: 'incline-bench',  sets: 3, reps: '8–12',  restSeconds: 90  },
            { exerciseId: 'pullup',         sets: 3, reps: '6–10',  restSeconds: 90  },
            { exerciseId: 'arnold-press',   sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'hammer-curl',    sets: 2, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'skull-crusher',  sets: 2, reps: '10–12', restSeconds: 60  },
            { exerciseId: 'calf-raise',     sets: 3, reps: '15–20', restSeconds: 45  },
          ]
        },
        {
          name: 'Ganzkörper C',
          focus: 'Alle Muskelgruppen (Variation 2)',
          exercises: [
            { exerciseId: 'leg-press',      sets: 3, reps: '10–15', restSeconds: 90  },
            { exerciseId: 'db-bench',       sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'lat-pulldown',   sets: 3, reps: '10–12', restSeconds: 90  },
            { exerciseId: 'lateral-raise',  sets: 3, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'cable-curl',     sets: 2, reps: '12–15', restSeconds: 60  },
            { exerciseId: 'dips-tricep',    sets: 2, reps: '10–15', restSeconds: 60  },
            { exerciseId: 'russian-twist',  sets: 3, reps: '20',    restSeconds: 45  },
          ]
        },
      ]
    },
    {
      id: 'elias',
      name: 'Elias',
      description: '5-Tage-Split: Brust+Rücken, Schultern+Arme, Beine – jede Gruppe 2× pro Woche. 90 Sek. Pause.',
      frequency: '5x / Woche',
      level: 'Intermediate',
      isPreset: true,
      days: [
        {
          name: 'Tag 1 – Brust & Rücken',
          focus: 'Brust · Rücken',
          exercises: [
            { exerciseId: 'incline-db-bench',  sets: 3, reps: '8–12',  restSeconds: 90 },
            { exerciseId: 'db-bench',          sets: 2, reps: '8–12',  restSeconds: 90 },
            { exerciseId: 'seated-cable-row',  sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'cable-row-wide',    sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'lat-pulldown',      sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'pec-deck',          sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'rear-delt-fly',     sets: 3, reps: '15–20', restSeconds: 90 },
          ]
        },
        {
          name: 'Tag 2 – Schultern & Arme',
          focus: 'Schultern · Bizeps · Trizeps',
          exercises: [
            { exerciseId: 'db-ohp',               sets: 3, reps: '8–12',  restSeconds: 90 },
            { exerciseId: 'cable-lateral-raise',  sets: 4, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'lateral-raise',        sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'bayesian-curl',        sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'preacher-curl',        sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'hammer-curl',          sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'overhead-tricep-ext',  sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'tricep-pushdown',      sets: 3, reps: '12–15', restSeconds: 90 },
          ]
        },
        {
          name: 'Tag 3 – Beine',
          focus: 'Quadrizeps · Ischiocrurale · Waden',
          exercises: [
            { exerciseId: 'squat',         sets: 4, reps: '6–10',  restSeconds: 90 },
            { exerciseId: 'leg-press',     sets: 3, reps: '10–15', restSeconds: 90 },
            { exerciseId: 'leg-extension', sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'leg-curl',      sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'calf-press',    sets: 4, reps: '15–20', restSeconds: 90 },
          ]
        },
        {
          name: 'Tag 4 – Brust & Rücken',
          focus: 'Brust · Rücken',
          exercises: [
            { exerciseId: 'incline-db-bench',  sets: 3, reps: '8–12',  restSeconds: 90 },
            { exerciseId: 'db-bench',          sets: 2, reps: '8–12',  restSeconds: 90 },
            { exerciseId: 'seated-cable-row',  sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'cable-row-wide',    sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'lat-pulldown',      sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'pec-deck',          sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'rear-delt-fly',     sets: 3, reps: '15–20', restSeconds: 90 },
          ]
        },
        {
          name: 'Tag 5 – Schultern & Arme',
          focus: 'Schultern · Bizeps · Trizeps',
          exercises: [
            { exerciseId: 'db-ohp',               sets: 3, reps: '8–12',  restSeconds: 90 },
            { exerciseId: 'cable-lateral-raise',  sets: 4, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'lateral-raise',        sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'bayesian-curl',        sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'preacher-curl',        sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'hammer-curl',          sets: 3, reps: '12–15', restSeconds: 90 },
            { exerciseId: 'overhead-tricep-ext',  sets: 3, reps: '10–12', restSeconds: 90 },
            { exerciseId: 'tricep-pushdown',      sets: 3, reps: '12–15', restSeconds: 90 },
          ]
        },
      ]
    },
  ];

  function getAll() {
    var custom = Store.getCustomPlans();
    // Custom plans override presets with same ID
    var customIds = custom.map(function(p){ return p.id; });
    var presets = PRESET_PLANS.filter(function(p){ return !customIds.includes(p.id); });
    return presets.concat(custom);
  }

  function getById(id) {
    // Custom plans take precedence over presets
    var custom = Store.getCustomPlans().find(function(p){ return p.id === id; });
    if (custom) return custom;
    return PRESET_PLANS.find(function(p){ return p.id === id; });
  }

  function getLevelBadge(level) {
    var map = {
      'Einsteiger': 'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)',
      'Einsteiger / Intermediate': 'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)',
      'Intermediate': 'background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)',
      'Fortgeschritten': 'background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)',
    };
    var style = map[level] || map['Intermediate'];
    return '<span class="badge" style="' + style + '">' + level + '</span>';
  }

  return { PRESET_PLANS, getAll, getById, getLevelBadge };
})();
