// TrackLift – Dashboard page
var DashboardPage = (function () {

  function render() {
    var logs = Store.getWorkoutLogs();
    var streak = Store.getStreak();
    var totalVol = Store.getTotalVolume();
    var prs = Store.getPersonalRecords();
    var activePlanId = Store.getActivePlanId();
    var activePlan = activePlanId ? PlansDB.getById(activePlanId) : null;
    var weekData = Utils.getWeeklyVolumeArray(8);
    var lastLog = logs.length ? logs[logs.length - 1] : null;
    var totalWorkouts = logs.length;

    // Next workout suggestion
    var nextWorkout = null;
    var nextDayIdx = 0;
    if (activePlan) {
      if (lastLog && lastLog.planId === activePlan.id && typeof lastLog.dayIndex === 'number') {
        nextDayIdx = (lastLog.dayIndex + 1) % activePlan.days.length;
      }
      nextWorkout = activePlan.days[nextDayIdx];
    }

    // This week stats
    var today = new Date();
    var monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    var mondayStr = monday.toISOString().slice(0, 10);
    var thisWeekLogs = logs.filter(function(l){ return l.date >= mondayStr; });
    var thisWeekVol = thisWeekLogs.reduce(function(acc, log) {
      return acc + (log.exercises || []).reduce(function(a, ex) {
        return a + (ex.sets || []).reduce(function(b, s) {
          return b + (s.completed ? (s.weight||0)*(s.reps||0) : 0);
        }, 0);
      }, 0);
    }, 0);
    var lastWeekData = weekData[weekData.length - 2] || { volume: 0 };

    // Top PRs to show
    var prEntries = Object.entries(prs).slice(0, 4).map(function(entry) {
      var ex = ExercisesDB.getById(entry[0]);
      return { ex: ex, pr: entry[1] };
    }).filter(function(e){ return e.ex; });

    var html = '<div class="slide-in space-y-5">';

    // ── Header ────────────────────────────────────────────────
    html += '<div class="flex items-start justify-between">';
    html += '<div>';
    html += '<h1 class="text-2xl font-bold" style="color:#e2e8f0;">Guten ' + getGreeting() + '! 👋</h1>';
    html += '<p class="text-sm mt-0.5" style="color:#64748b;">' + Utils.fmtDate(Store.todayStr()) + '</p>';
    html += '</div>';
    if (streak > 0) {
      html += '<div class="card2 px-4 py-2 text-center">';
      html += '<div class="text-2xl font-bold" style="color:#fbbf24;">' + streak + ' 🔥</div>';
      html += '<div class="text-xs mt-0.5" style="color:#64748b;">Tage Serie</div>';
      html += '</div>';
    }
    html += '</div>';

    // ── Stats row ─────────────────────────────────────────────
    html += '<div class="grid grid-cols-3 gap-3">';
    html += statCard('Trainings', totalWorkouts.toString(), 'gesamt', '#7c3aed');
    html += statCard('Volumen', Utils.fmtVolume(thisWeekVol), 'diese Woche', '#10b981');
    html += statCard('PRs', Object.keys(prs).length.toString(), 'bestleistungen', '#f59e0b');
    html += '</div>';

    // ── Next workout card ─────────────────────────────────────
    if (activePlan && nextWorkout) {
      html += '<div class="card p-4">';
      html += '<div class="flex items-center justify-between mb-3">';
      html += '<div>';
      html += '<div class="text-xs font-medium mb-1" style="color:#64748b;">NÄCHSTES TRAINING</div>';
      html += '<div class="font-bold text-lg">' + nextWorkout.name + '</div>';
      html += '<div class="text-sm mt-0.5" style="color:#64748b;">' + (nextWorkout.focus || '') + '</div>';
      html += '</div>';
      html += '<button class="btn-primary px-5 py-2.5" onclick="WorkoutPage.start(\'' + activePlan.id + '\',' + nextDayIdx + ')">';
      html += '<span class="flex items-center gap-2">▶ Training starten</span></button>';
      html += '</div>';
      // Exercise list preview
      html += '<div class="grid grid-cols-2 gap-2 mt-2">';
      nextWorkout.exercises.slice(0, 4).forEach(function(ex) {
        var e = ExercisesDB.getById(ex.exerciseId);
        if (!e) return;
        html += '<div class="card2 px-3 py-2 flex items-center gap-2">';
        html += ExercisesDB.renderThumbnail(e.primary, 'w-8 h-8 rounded flex-shrink-0');
        html += '<div class="min-w-0"><div class="text-xs font-medium truncate">' + e.name + '</div>';
        html += '<div class="text-xs" style="color:#64748b;">' + ex.sets + '×' + ex.reps + '</div></div>';
        html += '</div>';
      });
      if (nextWorkout.exercises.length > 4) {
        html += '<div class="card2 px-3 py-2 flex items-center justify-center text-sm" style="color:#64748b;">+' + (nextWorkout.exercises.length - 4) + ' mehr</div>';
      }
      html += '</div></div>';
    } else {
      html += '<div class="card p-5 text-center">';
      html += '<div class="text-4xl mb-3">🏋️</div>';
      html += '<div class="font-semibold mb-1">Kein aktiver Trainingsplan</div>';
      html += '<div class="text-sm mb-4" style="color:#64748b;">Wähle einen Plan um dein nächstes Training zu sehen</div>';
      html += '<button class="btn-primary" onclick="App.router.go(\'plans\')">Plan auswählen</button>';
      html += '</div>';
    }

    // ── Weekly volume chart ───────────────────────────────────
    html += '<div class="card p-4">';
    html += '<div class="flex items-center justify-between mb-3">';
    html += '<div class="font-semibold">Wöchentliches Volumen</div>';
    html += Utils.trendArrow(thisWeekVol, lastWeekData.volume);
    html += '</div>';
    html += '<canvas id="weekly-vol-chart" height="120"></canvas>';
    html += '</div>';

    // ── Last workout ──────────────────────────────────────────
    if (lastLog) {
      html += '<div class="card p-4">';
      html += '<div class="text-xs font-medium mb-2" style="color:#64748b;">LETZTES TRAINING</div>';
      html += '<div class="flex items-center justify-between">';
      html += '<div>';
      html += '<div class="font-bold">' + (lastLog.dayName || 'Training') + '</div>';
      html += '<div class="text-sm mt-0.5" style="color:#64748b;">' + Utils.fmtDate(lastLog.date);
      if (lastLog.duration) html += ' · ' + Utils.fmtDuration(lastLog.duration);
      html += '</div></div>';
      var logVol = (lastLog.exercises||[]).reduce(function(a,ex){ return a+(ex.sets||[]).reduce(function(b,s){ return b+(s.completed?(s.weight||0)*(s.reps||0):0);},0);},0);
      html += '<div class="text-right">';
      html += '<div class="font-bold text-lg" style="color:#a78bfa;">' + Utils.fmtVolume(logVol) + '</div>';
      html += '<div class="text-xs" style="color:#64748b;">Volumen</div>';
      html += '</div></div>';
      // exercises summary
      html += '<div class="mt-3 flex flex-wrap gap-1.5">';
      (lastLog.exercises || []).forEach(function(ex) {
        var e = ExercisesDB.getById(ex.exerciseId);
        if (!e) return;
        var completed = (ex.sets||[]).filter(function(s){ return s.completed; }).length;
        html += '<div class="badge ' + ExercisesDB.getMuscleConfig(e.primary).cls + '">' + e.name + ' ' + completed + '×</div>';
      });
      html += '</div></div>';
    }

    // ── Personal Records ──────────────────────────────────────
    if (prEntries.length) {
      html += '<div class="card p-4">';
      html += '<div class="text-xs font-medium mb-3" style="color:#64748b;">PERSONAL RECORDS</div>';
      html += '<div class="space-y-2">';
      prEntries.forEach(function(entry) {
        var orm = Utils.calcOneRepMax(entry.pr.weight, entry.pr.reps);
        html += '<div class="flex items-center justify-between py-2 border-b" style="border-color:#1e1e2e;">';
        html += '<div class="flex items-center gap-3">';
        html += ExercisesDB.renderThumbnail(entry.ex.primary, 'w-8 h-8 rounded');
        html += '<div><div class="font-medium text-sm">' + entry.ex.name + '</div>';
        html += '<div class="text-xs" style="color:#64748b;">' + Utils.fmtDate(entry.pr.date) + '</div></div>';
        html += '</div>';
        html += '<div class="text-right">';
        html += '<div class="font-bold" style="color:#fbbf24;">' + entry.pr.weight + ' kg × ' + entry.pr.reps + '</div>';
        html += '<div class="text-xs" style="color:#64748b;">1RM ≈ ' + orm + ' kg</div>';
        html += '</div></div>';
      });
      html += '</div></div>';
    }

    html += '</div>'; // end slide-in

    document.getElementById('main-content').innerHTML = html;

    // Render chart
    renderWeeklyChart(weekData);
  }

  function statCard(title, value, sub, color) {
    return '<div class="card p-3">' +
      '<div class="text-xs font-medium mb-1" style="color:#64748b;">' + title.toUpperCase() + '</div>' +
      '<div class="text-2xl font-bold" style="color:' + color + ';">' + value + '</div>' +
      '<div class="text-xs mt-0.5" style="color:#4a4a6a;">' + sub + '</div>' +
      '</div>';
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Morgen';
    if (h < 17) return 'Mittag';
    return 'Abend';
  }

  function renderWeeklyChart(weekData) {
    var canvas = document.getElementById('weekly-vol-chart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    // Destroy existing chart
    if (window._dashChart) { try { window._dashChart.destroy(); } catch(e){} }
    window._dashChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weekData.map(function(w){ return w.label; }),
        datasets: [{
          data: weekData.map(function(w){ return w.volume; }),
          backgroundColor: weekData.map(function(w, i){
            return i === weekData.length - 1 ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.35)';
          }),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: function(c){ return Utils.fmtVolume(c.raw); } }
        }},
        scales: {
          x: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } },
          y: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 },
            callback: function(v){ return v >= 1000 ? (v/1000).toFixed(0)+'k' : v; }
          }, beginAtZero: true }
        }
      }
    });
  }

  return { render };
})();
