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
