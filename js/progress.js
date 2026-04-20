// TrackLift – Progress & statistics page
var ProgressPage = (function () {

  var _tab = 'volume';
  var _chartInstances = {};

  function render() {
    var logs = Store.getWorkoutLogs();
    var html = '<div class="slide-in space-y-5">';
    html += '<h1 class="text-2xl font-bold">Fortschritt</h1>';

    // Tabs
    html += '<div class="flex gap-1 p-1 rounded-lg" style="background:#161622;">';
    ['volume','strength','frequency','records'].forEach(function(t) {
      var labels = { volume:'Volumen', strength:'Stärke', frequency:'Häufigkeit', records:'Records' };
      html += '<button class="tab-btn flex-1 ' + (_tab === t ? 'active' : '') + '" onclick="ProgressPage.setTab(\'' + t + '\')">' + labels[t] + '</button>';
    });
    html += '</div>';

    if (!logs.length) {
      html += '<div class="card p-10 text-center"><div class="text-4xl mb-3">📊</div>';
      html += '<div class="font-semibold">Noch keine Daten</div>';
      html += '<div class="text-sm mt-1" style="color:#64748b;">Starte dein erstes Training um Statistiken zu sehen</div></div>';
      html += '</div>';
      document.getElementById('main-content').innerHTML = html;
      return;
    }

    if (_tab === 'volume') html += renderVolumeTab(logs);
    else if (_tab === 'strength') html += renderStrengthTab(logs);
    else if (_tab === 'frequency') html += renderFrequencyTab(logs);
    else if (_tab === 'records') html += renderRecordsTab(logs);

    html += '</div>';
    document.getElementById('main-content').innerHTML = html;

    setTimeout(function() {
      if (_tab === 'volume') initVolumeCharts(logs);
      else if (_tab === 'strength') initStrengthChart(logs);
      else if (_tab === 'frequency') initFrequencyChart(logs);
    }, 50);
  }

  function setTab(tab) {
    _tab = tab;
    // Destroy old charts
    Object.values(_chartInstances).forEach(function(c){ try { c.destroy(); } catch(e){} });
    _chartInstances = {};
    render();
  }

  // ── Volume Tab ────────────────────────────────────────────
  function renderVolumeTab(logs) {
    var weekData = Utils.getWeeklyVolumeArray(12);
    var totalVol = Store.getTotalVolume();
    var thisWeek = weekData[weekData.length-1].volume;
    var lastWeek = weekData[weekData.length-2].volume;

    var html = '';
    html += '<div class="grid grid-cols-3 gap-3">';
    html += miniStat('Gesamt', Utils.fmtVolume(totalVol), '#7c3aed');
    html += miniStat('Diese Woche', Utils.fmtVolume(thisWeek), '#10b981');
    html += miniStat('Letzte Woche', Utils.fmtVolume(lastWeek), '#64748b');
    html += '</div>';

    html += '<div class="card p-4">';
    html += '<div class="flex items-center justify-between mb-3">';
    html += '<div class="font-semibold">Wöchentliches Volumen (12 Wochen)</div>';
    html += Utils.trendArrow(thisWeek, lastWeek);
    html += '</div>';
    html += '<canvas id="chart-weekly-vol" height="160"></canvas>';
    html += '</div>';

    // Volume by muscle group
    var byMuscle = {};
    logs.forEach(function(log) {
      (log.exercises||[]).forEach(function(ex) {
        var e = ExercisesDB.getById(ex.exerciseId);
        if (!e) return;
        var vol = Utils.calcVolume(ex.sets||[]);
        byMuscle[e.primary] = (byMuscle[e.primary]||0) + vol;
      });
    });
    var muscleEntries = Object.entries(byMuscle).sort(function(a,b){ return b[1]-a[1]; });
    var totalMuscleVol = muscleEntries.reduce(function(a,e){ return a+e[1]; }, 0);

    if (muscleEntries.length) {
      html += '<div class="card p-4">';
      html += '<div class="font-semibold mb-3">Volumen nach Muskelgruppe</div>';
      muscleEntries.forEach(function(entry) {
        var cfg = ExercisesDB.getMuscleConfig(entry[0]);
        var pct = totalMuscleVol ? Math.round(entry[1]/totalMuscleVol*100) : 0;
        html += '<div class="mb-2">';
        html += '<div class="flex justify-between text-sm mb-1">';
        html += '<span class="' + cfg.cls + ' badge">' + cfg.label + '</span>';
        html += '<span style="color:#64748b;">' + pct + '% · ' + Utils.fmtVolume(entry[1]) + '</span>';
        html += '</div>';
        html += '<div class="progress-bar-wrap"><div class="progress-bar" style="width:' + pct + '%;background:' + cfg.color + ';opacity:0.8;"></div></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    return html;
  }

  function initVolumeCharts(logs) {
    var weekData = Utils.getWeeklyVolumeArray(12);
    var canvas = document.getElementById('chart-weekly-vol');
    if (!canvas) return;
    _chartInstances['vol'] = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: weekData.map(function(w){ return w.label; }),
        datasets: [{
          data: weekData.map(function(w){ return w.volume; }),
          backgroundColor: weekData.map(function(w,i){ return i === weekData.length-1 ? 'rgba(124,58,237,0.85)' : 'rgba(124,58,237,0.4)'; }),
          borderRadius: 6,
        }]
      },
      options: chartDefaults({ y: { callback: function(v){ return v>=1000?(v/1000).toFixed(0)+'k':v; } } })
    });
  }

  // ── Strength Tab ──────────────────────────────────────────
  function renderStrengthTab(logs) {
    // Find exercises with enough data
    var exMap = {};
    logs.forEach(function(log) {
      (log.exercises||[]).forEach(function(ex) {
        if (!exMap[ex.exerciseId]) exMap[ex.exerciseId] = [];
        var best = (ex.sets||[]).filter(function(s){ return s.completed && s.weight; }).sort(function(a,b){ return b.weight-a.weight; })[0];
        if (best) exMap[ex.exerciseId].push({ date: log.date, weight: best.weight, reps: best.reps, orm: Utils.calcOneRepMax(best.weight, best.reps) });
      });
    });

    var qualified = Object.entries(exMap).filter(function(e){ return e[1].length >= 2; }).sort(function(a,b){ return b[1].length-a[1].length; });

    var html = '<div class="space-y-4">';
    if (!qualified.length) {
      html += '<div class="card p-6 text-center" style="color:#64748b;">Mindestens 2 Einträge pro Übung für Stärkeverlauf benötigt</div>';
      html += '</div>';
      return html;
    }

    // Exercise selector
    var firstId = qualified[0][0];
    html += '<div class="card p-4">';
    html += '<div class="font-semibold mb-2">Übung auswählen</div>';
    html += '<select class="input-field" id="strength-ex-select" onchange="ProgressPage.updateStrengthChart()">';
    qualified.forEach(function(entry) {
      var e = ExercisesDB.getById(entry[0]);
      if (!e) return;
      html += '<option value="' + entry[0] + '">' + e.name + ' (' + entry[1].length + ' Einträge)</option>';
    });
    html += '</select>';
    html += '<canvas id="chart-strength" height="160" class="mt-4"></canvas>';
    html += '</div>';

    // Progressive overload indicator
    qualified.slice(0, 5).forEach(function(entry) {
      var e = ExercisesDB.getById(entry[0]);
      if (!e) return;
      var data = entry[1].sort(function(a,b){ return a.date.localeCompare(b.date); });
      var first = data[0], last = data[data.length-1];
      var diff = last.weight - first.weight;
      var diffPct = first.weight ? ((diff/first.weight)*100).toFixed(1) : 0;
      html += '<div class="card p-3 flex items-center gap-3">';
      html += ExercisesDB.renderThumbnail(e.primary, 'w-10 h-10 rounded flex-shrink-0');
      html += '<div class="flex-1 min-w-0"><div class="font-medium text-sm truncate">' + e.name + '</div>';
      html += '<div class="text-xs" style="color:#64748b;">' + data.length + ' Trainings · ' + Utils.fmtDate(first.date) + ' → ' + Utils.fmtDate(last.date) + '</div></div>';
      html += '<div class="text-right flex-shrink-0">';
      html += '<div class="font-bold">' + last.weight + ' kg</div>';
      html += '<div class="text-sm ' + (diff >= 0 ? 'trend-up' : 'trend-down') + '">' + (diff >= 0 ? '+' : '') + diff.toFixed(1) + ' kg (' + (diff >= 0 ? '+' : '') + diffPct + '%)</div>';
      html += '</div></div>';
    });

    html += '</div>';
    return html;
  }

  function initStrengthChart(logs) {
    var sel = document.getElementById('strength-ex-select');
    if (!sel) return;
    updateStrengthChart();
  }

  function updateStrengthChart() {
    var sel = document.getElementById('strength-ex-select');
    if (!sel) return;
    var exId = sel.value;
    var logData = Store.getLogsByExercise(exId);
    var data = logData.map(function(l) {
      var best = l.sets.filter(function(s){ return s.completed && s.weight; }).sort(function(a,b){ return b.weight-a.weight; })[0];
      if (!best) return null;
      return { date: l.date, weight: best.weight, orm: Utils.calcOneRepMax(best.weight, best.reps) };
    }).filter(Boolean);

    var canvas = document.getElementById('chart-strength');
    if (!canvas) return;
    if (_chartInstances['strength']) { try { _chartInstances['strength'].destroy(); } catch(e){} }

    _chartInstances['strength'] = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.map(function(d){ return Utils.fmtDateShort(d.date); }),
        datasets: [
          { label: 'Max. Gewicht', data: data.map(function(d){ return d.weight; }), borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.1)', borderWidth: 2, pointBackgroundColor: '#a78bfa', tension: 0.3, fill: true },
          { label: '1RM Schätzung', data: data.map(function(d){ return d.orm; }), borderColor: '#fbbf24', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5,3], pointBackgroundColor: '#fbbf24', tension: 0.3 }
        ]
      },
      options: chartDefaults({})
    });
  }

  // ── Frequency Tab ─────────────────────────────────────────
  function renderFrequencyTab(logs) {
    var totalWorkouts = logs.length;
    var streak = Store.getStreak();
    // Days per week average
    var sortedDates = logs.map(function(l){ return l.date; }).sort();
    var uniqueDates = [...new Set(sortedDates)];
    var weeks = {};
    uniqueDates.forEach(function(d) {
      var dt = new Date(d); var day = dt.getDay();
      var mon = new Date(dt); mon.setDate(dt.getDate() - ((day+6)%7));
      var wk = mon.toISOString().slice(0,10);
      weeks[wk] = (weeks[wk]||0) + 1;
    });
    var wkValues = Object.values(weeks);
    var avgPerWeek = wkValues.length ? (wkValues.reduce(function(a,b){ return a+b; },0)/wkValues.length).toFixed(1) : 0;

    var html = '';
    html += '<div class="grid grid-cols-3 gap-3">';
    html += miniStat('Trainings', totalWorkouts.toString(), '#7c3aed');
    html += miniStat('Ø / Woche', avgPerWeek, '#10b981');
    html += miniStat('Serie', streak + ' 🔥', '#fbbf24');
    html += '</div>';

    html += '<div class="card p-4">';
    html += '<div class="font-semibold mb-3">Trainings pro Woche (12 Wochen)</div>';
    html += '<canvas id="chart-freq" height="140"></canvas>';
    html += '</div>';

    // Heatmap - last 10 weeks (7 days each)
    html += '<div class="card p-4">';
    html += '<div class="font-semibold mb-3">Aktivität (10 Wochen)</div>';
    html += renderHeatmap(uniqueDates);
    html += '</div>';

    return html;
  }

  function renderHeatmap(dates) {
    var dateSet = new Set(dates);
    var html = '<div class="overflow-x-auto">';
    html += '<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:3px;min-width:240px;">';
    var today = new Date();
    for (var w = 9; w >= 0; w--) {
      for (var d = 0; d < 7; d++) {
        var dt = new Date(today);
        dt.setDate(today.getDate() - (w*7 + (6-d)));
        var str = dt.toISOString().slice(0,10);
        var hasLog = dateSet.has(str);
        html += '<div style="width:100%;aspect-ratio:1;border-radius:2px;background:' + (hasLog ? '#7c3aed' : '#1e1e2e') + ';opacity:' + (hasLog ? '0.9' : '0.5') + ';" title="' + str + '"></div>';
      }
    }
    html += '</div></div>';
    return html;
  }

  function initFrequencyChart(logs) {
    var weekCounts = {};
    var weekData = Utils.getWeeklyVolumeArray(12);
    var allLogs = Store.getWorkoutLogs();
    var uniqueDates = [...new Set(allLogs.map(function(l){ return l.date; }))];
    uniqueDates.forEach(function(d) {
      var dt = new Date(d); var day = dt.getDay();
      var mon = new Date(dt); mon.setDate(dt.getDate() - ((day+6)%7));
      var wk = mon.toISOString().slice(0,10);
      weekCounts[wk] = (weekCounts[wk]||0)+1;
    });

    var canvas = document.getElementById('chart-freq');
    if (!canvas) return;
    _chartInstances['freq'] = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: weekData.map(function(w){ return w.label; }),
        datasets: [{
          data: weekData.map(function(w){ return weekCounts[w.week]||0; }),
          backgroundColor: 'rgba(16,185,129,0.6)',
          borderRadius: 5,
        }]
      },
      options: chartDefaults({ y: { max: 7, stepSize: 1 } })
    });
  }

  // ── Records Tab ───────────────────────────────────────────
  function renderRecordsTab(logs) {
    var prs = Store.getPersonalRecords();
    var entries = Object.entries(prs).map(function(e) {
      var ex = ExercisesDB.getById(e[0]);
      return { ex: ex, pr: e[1], orm: Utils.calcOneRepMax(e[1].weight, e[1].reps) };
    }).filter(function(e){ return e.ex; }).sort(function(a,b){ return b.orm - a.orm; });

    if (!entries.length) {
      return '<div class="card p-8 text-center" style="color:#64748b;">Noch keine Personal Records – starte dein Training!</div>';
    }

    var html = '<div class="space-y-2">';
    entries.forEach(function(entry, i) {
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
      html += '<div class="card p-3 flex items-center gap-3">';
      html += '<div class="text-xl w-8 text-center flex-shrink-0">' + (medal || (i+1)) + '</div>';
      html += ExercisesDB.renderThumbnail(entry.ex.primary, 'w-12 h-10 rounded flex-shrink-0');
      html += '<div class="flex-1 min-w-0">';
      html += '<div class="font-semibold text-sm truncate">' + entry.ex.name + '</div>';
      html += '<div class="text-xs" style="color:#64748b;">' + Utils.fmtDate(entry.pr.date) + '</div>';
      html += '</div>';
      html += '<div class="text-right flex-shrink-0">';
      html += '<div class="font-bold">' + entry.pr.weight + ' kg × ' + entry.pr.reps + '</div>';
      html += '<div class="text-sm" style="color:#fbbf24;">1RM ≈ ' + entry.orm + ' kg</div>';
      html += '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function miniStat(label, value, color) {
    return '<div class="card p-3">' +
      '<div class="text-xs" style="color:#64748b;">' + label + '</div>' +
      '<div class="font-bold text-lg mt-0.5" style="color:' + color + ';">' + value + '</div>' +
    '</div>';
  }

  function chartDefaults(extra) {
    return {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } },
        y: Object.assign({ grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } }, beginAtZero: true }, extra.y || {}),
        ...(extra.y2 ? { y2: extra.y2 } : {}),
      }
    };
  }

  return { render, setTab, updateStrengthChart };
})();
