// TrackLift – Router & app initialization
window.App = window.App || {};

App.router = (function () {
  var _current = 'dashboard';

  var PAGES = {
    dashboard: function() { DashboardPage.render(); },
    plans:     function() { PlansPage.render(); },
    exercises: function() { ExercisesPage.render(); },
    progress:  function() { ProgressPage.render(); },
    body:      function() { BodyPage.render(); },
  };

  function go(page) {
    if (!PAGES[page]) page = 'dashboard';
    _current = page;

    // Update sidebar nav
    document.querySelectorAll('.nav-item[data-page]').forEach(function(el) {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // Update mobile nav
    document.querySelectorAll('.mobile-nav-btn[data-page]').forEach(function(el) {
      var isActive = el.dataset.page === page;
      el.style.color = isActive ? '#a78bfa' : '#64748b';
    });

    // Scroll to top
    window.scrollTo(0, 0);

    // Render page
    PAGES[page]();
  }

  function current() { return _current; }

  return { go, current };
})();

// ── Sync / Backup ─────────────────────────────────────────
App.sync = {
  showModal: function() {
    var data = Store.exportData();
    var logs = data.workoutLogs.length;
    var plans = data.customPlans.length;
    var metrics = data.bodyMetrics.length;
    var size = (JSON.stringify(data).length / 1024).toFixed(1);

    var html = '<div class="p-5">';
    html += '<div class="flex items-center justify-between mb-5">';
    html += '<h2 class="text-xl font-bold">Sync & Backup</h2>';
    html += '<button onclick="App.modal.close()" style="color:#64748b;font-size:20px;line-height:1;">✕</button>';
    html += '</div>';

    // Stats
    html += '<div class="card2 p-3 mb-5 flex gap-4 text-center">';
    html += '<div class="flex-1"><div class="text-xl font-bold" style="color:#a78bfa;">' + logs + '</div><div class="text-xs" style="color:#64748b;">Trainings</div></div>';
    html += '<div class="flex-1"><div class="text-xl font-bold" style="color:#10b981;">' + plans + '</div><div class="text-xs" style="color:#64748b;">Eigene Pläne</div></div>';
    html += '<div class="flex-1"><div class="text-xl font-bold" style="color:#fbbf24;">' + metrics + '</div><div class="text-xs" style="color:#64748b;">Körpereinträge</div></div>';
    html += '<div class="flex-1"><div class="text-xl font-bold" style="color:#64748b;">' + size + ' KB</div><div class="text-xs" style="color:#64748b;">Dateigröße</div></div>';
    html += '</div>';

    // Export
    html += '<div class="mb-4">';
    html += '<div class="font-semibold mb-1">📤 Exportieren</div>';
    html += '<p class="text-sm mb-3" style="color:#64748b;">Speichere alle Daten als JSON-Datei. Übertrage sie per AirDrop, iCloud Drive oder USB auf ein anderes Gerät.</p>';
    html += '<button class="btn-primary w-full py-2.5" onclick="App.sync.exportNow()">Backup herunterladen (.json)</button>';
    html += '</div>';

    // Import
    html += '<div class="border-t pt-4" style="border-color:#2a2a3e;">';
    html += '<div class="font-semibold mb-1">📥 Importieren</div>';
    html += '<p class="text-sm mb-3" style="color:#64748b;">Lade eine Backup-Datei von einem anderen Gerät. Du kannst <b>zusammenführen</b> (bestehende Daten bleiben) oder <b>ersetzen</b> (alles wird überschrieben).</p>';
    html += '<div class="flex gap-2">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.sync.triggerImport(\'merge\')">Zusammenführen</button>';
    html += '<button class="btn-danger flex-1 py-2.5" onclick="App.sync.triggerImport(\'replace\')">Ersetzen</button>';
    html += '</div></div>';

    // AirDrop tip
    html += '<div class="mt-4 p-3 rounded-lg text-xs" style="background:#0d0d14;color:#64748b;">';
    html += '💡 <b style="color:#94a3b8;">Schnellster Weg iPhone ↔ Mac:</b> Exportiere auf Gerät 1 → AirDrop die Datei zu Gerät 2 → Importieren. Fertig.';
    html += '</div>';
    html += '</div>';

    App.modal.open(html);
  },

  exportNow: function() {
    var data = Store.exportData();
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'tracklift-backup-' + date + '.json';
    a.click();
    URL.revokeObjectURL(url);
    Utils.toast('Backup heruntergeladen! ✓');
  },

  triggerImport: function(mode) {
    var input = document.getElementById('import-file-input');
    if (!input) return;
    input.dataset.mode = mode;
    input.click();
  },

  handleImport: function(event) {
    var file = event.target.files[0];
    if (!file) return;
    var mode = event.target.dataset.mode || 'merge';
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        Store.importData(data, mode);
        App.modal.close();
        App.updateSidebarStreak();
        App.router.go(App.router.current());
        Utils.toast(mode === 'replace' ? 'Daten ersetzt ✓' : 'Daten zusammengeführt ✓');
      } catch (err) {
        Utils.toast('Fehler: ' + err.message, 'error');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  },
};

// ── Spontanes Workout ─────────────────────────────────────
App.spontaneous = {
  ACTIVITIES: [
    { id: 'laufen',       name: 'Laufen',         icon: '🏃', color: '#10b981' },
    { id: 'sprinten',     name: 'Sprinten',        icon: '⚡', color: '#fbbf24' },
    { id: 'crossfit',     name: 'CrossFit',        icon: '🤸', color: '#ef4444' },
    { id: 'radfahren',    name: 'Radfahren',       icon: '🚴', color: '#3b82f6' },
    { id: 'schwimmen',    name: 'Schwimmen',       icon: '🏊', color: '#06b6d4' },
    { id: 'hiit',         name: 'HIIT',            icon: '🔥', color: '#f97316' },
    { id: 'boxen',        name: 'Boxen',           icon: '🥊', color: '#8b5cf6' },
    { id: 'yoga',         name: 'Yoga',            icon: '🧘', color: '#a78bfa' },
    { id: 'wandern',      name: 'Wandern',         icon: '🥾', color: '#22c55e' },
    { id: 'fussball',     name: 'Fußball',         icon: '⚽', color: '#16a34a' },
    { id: 'basketball',   name: 'Basketball',      icon: '🏀', color: '#ea580c' },
    { id: 'tennis',       name: 'Tennis',          icon: '🎾', color: '#65a30d' },
    { id: 'skifahren',    name: 'Skifahren',       icon: '⛷️',  color: '#60a5fa' },
    { id: 'kraftfrei',    name: 'Freies Krafttr.', icon: '💪', color: '#7c3aed' },
    { id: 'sonstiges',    name: 'Sonstiges',       icon: '🏅', color: '#64748b' },
  ],

  _selected: null,

  showModal: function() {
    var self = App.spontaneous;
    self._selected = null;
    var html = '<div class="p-5">';
    html += '<div class="flex items-center justify-between mb-4">';
    html += '<h2 class="text-xl font-bold">Spontanes Workout</h2>';
    html += '<button onclick="App.modal.close()" style="color:#64748b;font-size:20px;line-height:1;">✕</button>';
    html += '</div>';
    html += '<p class="text-sm mb-4" style="color:#64748b;">Wähle eine Aktivität – zählt für deine 🔥 Streak</p>';

    // Activity grid
    html += '<div class="grid grid-cols-3 gap-2 mb-4" id="activity-grid">';
    self.ACTIVITIES.forEach(function(a) {
      html += '<button id="act-' + a.id + '" onclick="App.spontaneous.select(\'' + a.id + '\')" ' +
        'class="card2 p-3 text-center rounded-xl transition-all" ' +
        'style="cursor:pointer;border:2px solid transparent;">' +
        '<div class="text-2xl mb-1">' + a.icon + '</div>' +
        '<div class="text-xs font-medium leading-tight">' + a.name + '</div>' +
        '</button>';
    });
    html += '</div>';

    // Duration + notes
    html += '<div class="space-y-3">';
    html += '<div class="grid grid-cols-2 gap-3">';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Dauer (min)</label>';
    html += '<input type="number" id="spon-duration" class="input-field mt-1" placeholder="z.B. 45" min="1" /></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Intensität</label>';
    html += '<select id="spon-intensity" class="input-field mt-1">';
    html += '<option value="1">😴 Locker</option>';
    html += '<option value="2">🚶 Moderat</option>';
    html += '<option value="3" selected>💪 Mittel</option>';
    html += '<option value="4">🔥 Hart</option>';
    html += '<option value="5">💀 Maximal</option>';
    html += '</select></div></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Notiz (optional)</label>';
    html += '<input id="spon-note" class="input-field mt-1" placeholder="z.B. 5km in 25min..." /></div>';
    html += '</div>';

    html += '<div class="flex gap-3 mt-4">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.modal.close()">Abbrechen</button>';
    html += '<button class="btn-primary flex-1 py-2.5" onclick="App.spontaneous.save()">Speichern ✓</button>';
    html += '</div></div>';
    App.modal.open(html);
  },

  select: function(id) {
    var self = App.spontaneous;
    self._selected = id;
    self.ACTIVITIES.forEach(function(a) {
      var btn = document.getElementById('act-' + a.id);
      if (!btn) return;
      if (a.id === id) {
        btn.style.borderColor = a.color;
        btn.style.background = a.color + '22';
      } else {
        btn.style.borderColor = 'transparent';
        btn.style.background = '';
      }
    });
  },

  save: function() {
    var self = App.spontaneous;
    if (!self._selected) { Utils.toast('Bitte eine Aktivität wählen', 'error'); return; }
    var act = self.ACTIVITIES.find(function(a){ return a.id === self._selected; });
    var duration = parseInt((document.getElementById('spon-duration')||{}).value) || 0;
    var intensity = parseInt((document.getElementById('spon-intensity')||{}).value) || 3;
    var note = (document.getElementById('spon-note')||{}).value || '';

    var log = {
      id: Store.uid(),
      date: Store.todayStr(),
      planId: 'spontaneous',
      dayName: act.icon + ' ' + act.name,
      duration: duration * 60,
      spontaneous: true,
      activityId: self._selected,
      intensity: intensity,
      note: note,
      exercises: [],
    };
    Store.saveWorkoutLog(log);
    App.modal.close();
    App.updateSidebarStreak();
    Utils.confetti();
    Utils.toast(act.icon + ' ' + act.name + ' gespeichert! Streak bleibt! 🔥');
    DashboardPage.render();
  },
};

App.updateSidebarStreak = function() {
  var streak = Store.getStreak();
  var el = document.getElementById('sidebar-streak-count');
  if (el) el.textContent = streak + ' 🔥';
  var mob = document.getElementById('mobile-streak-display');
  if (mob) mob.textContent = streak > 0 ? (streak + ' 🔥') : '';
};

// Initialize app
(function init() {
  // Update streak in sidebar
  App.updateSidebarStreak();

  // Check for in-progress workout to resume
  if (Store.getActiveWorkout()) {
    var resumed = WorkoutPage.resume();
    if (resumed) {
      // Still show dashboard behind the overlay
      App.router.go('dashboard');
      return;
    }
  }

  // Go to dashboard
  App.router.go('dashboard');
})();
