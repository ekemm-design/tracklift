// TrackLift – Body metrics page
var BodyPage = (function () {

  var MEASUREMENTS = [
    { key: 'chest',   label: 'Brust',    unit: 'cm', icon: '💪' },
    { key: 'waist',   label: 'Taille',   unit: 'cm', icon: '📏' },
    { key: 'hips',    label: 'Hüfte',    unit: 'cm', icon: '📐' },
    { key: 'arms',    label: 'Oberarm',  unit: 'cm', icon: '💪' },
    { key: 'forearms',label: 'Unterarm', unit: 'cm', icon: '💪' },
    { key: 'thighs',  label: 'Oberschenkel', unit: 'cm', icon: '🦵' },
    { key: 'calves',  label: 'Wade',     unit: 'cm', icon: '🦵' },
    { key: 'neck',    label: 'Nacken',   unit: 'cm', icon: '📏' },
    { key: 'shoulders',label: 'Schultern',unit: 'cm', icon: '🔵' },
  ];

  function render() {
    var metrics = Store.getBodyMetrics().sort(function(a,b){ return a.date.localeCompare(b.date); });
    var latest = metrics.length ? metrics[metrics.length-1] : null;
    var prev = metrics.length > 1 ? metrics[metrics.length-2] : null;

    var html = '<div class="slide-in space-y-5">';
    html += '<div class="flex items-center justify-between">';
    html += '<h1 class="text-2xl font-bold">Körper & Maße</h1>';
    html += '<button class="btn-primary text-sm" onclick="BodyPage.showAddModal()">+ Eintrag</button>';
    html += '</div>';

    // Current stats
    if (latest) {
      html += '<div class="card p-4">';
      html += '<div class="flex items-center justify-between mb-3">';
      html += '<div class="text-xs font-semibold" style="color:#64748b;">AKTUELL · ' + Utils.fmtDate(latest.date) + '</div>';
      html += '</div>';

      // Weight prominent display
      if (latest.weight) {
        html += '<div class="text-center mb-4">';
        html += '<div class="text-5xl font-bold" style="color:#a78bfa;">' + latest.weight;
        html += '<span class="text-2xl ml-1 font-normal" style="color:#64748b;">kg</span></div>';
        if (prev && prev.weight) {
          var diff = (latest.weight - prev.weight).toFixed(1);
          var diffColor = diff < 0 ? '#10b981' : diff > 0 ? '#f59e0b' : '#64748b';
          html += '<div class="text-sm mt-1" style="color:' + diffColor + ';">' + (diff > 0 ? '+' : '') + diff + ' kg seit letztem Eintrag</div>';
        }
        html += '</div>';
      }

      // Measurements grid
      var hasMeasurements = MEASUREMENTS.some(function(m){ return latest.measurements && latest.measurements[m.key]; });
      if (hasMeasurements) {
        html += '<div class="grid grid-cols-3 gap-2">';
        MEASUREMENTS.forEach(function(m) {
          var val = latest.measurements && latest.measurements[m.key];
          if (!val) return;
          var prevVal = prev && prev.measurements && prev.measurements[m.key];
          var diff2 = prevVal ? (val - prevVal).toFixed(1) : null;
          html += '<div class="card2 p-2.5 text-center">';
          html += '<div class="text-xs" style="color:#64748b;">' + m.label + '</div>';
          html += '<div class="font-bold text-sm mt-0.5">' + val + ' cm</div>';
          if (diff2 !== null) {
            var c = parseFloat(diff2) > 0 ? '#f59e0b' : parseFloat(diff2) < 0 ? '#10b981' : '#64748b';
            html += '<div class="text-xs" style="color:' + c + ';">' + (diff2 > 0 ? '+' : '') + diff2 + '</div>';
          }
          html += '</div>';
        });
        html += '</div>';
      }
      html += '</div>';
    }

    // Weight chart
    var weightData = metrics.filter(function(m){ return m.weight; });
    if (weightData.length >= 2) {
      html += '<div class="card p-4">';
      html += '<div class="font-semibold mb-3">Gewichtsverlauf</div>';
      html += '<canvas id="weight-chart" height="150"></canvas>';
      html += '</div>';
    }

    // Measurement chart
    if (metrics.length >= 2) {
      html += '<div class="card p-4">';
      html += '<div class="flex items-center justify-between mb-3">';
      html += '<div class="font-semibold">Maßentwicklung</div>';
      html += '</div>';
      html += '<select class="input-field text-sm mb-3" id="measure-select" onchange="BodyPage.updateMeasureChart()">';
      MEASUREMENTS.forEach(function(m) {
        var hasData = metrics.some(function(met){ return met.measurements && met.measurements[m.key]; });
        if (hasData) html += '<option value="' + m.key + '">' + m.label + '</option>';
      });
      html += '</select>';
      html += '<canvas id="measure-chart" height="130"></canvas>';
      html += '</div>';
    }

    // History list
    if (metrics.length) {
      html += '<div class="card p-4">';
      html += '<div class="text-xs font-semibold mb-3" style="color:#64748b;">VERLAUF</div>';
      html += '<div class="space-y-2">';
      [...metrics].reverse().slice(0, 15).forEach(function(m) {
        html += '<div class="card2 p-3">';
        html += '<div class="flex items-center justify-between mb-2">';
        html += '<div class="font-medium text-sm">' + Utils.fmtDate(m.date) + '</div>';
        if (m.weight) html += '<div class="font-bold" style="color:#a78bfa;">' + m.weight + ' kg</div>';
        html += '</div>';
        if (m.measurements) {
          html += '<div class="flex flex-wrap gap-1.5">';
          MEASUREMENTS.forEach(function(meas) {
            var val = m.measurements[meas.key];
            if (val) html += '<span class="text-xs px-2 py-0.5 rounded" style="background:#1e1e2e;color:#94a3b8;">' + meas.label + ': ' + val + ' cm</span>';
          });
          html += '</div>';
        }
        html += '<div class="flex justify-end mt-2">';
        html += '<button class="text-xs" style="color:#ef4444;" onclick="BodyPage.deleteMetric(\'' + m.id + '\')">Löschen</button>';
        html += '</div></div>';
      });
      html += '</div></div>';
    } else {
      html += '<div class="card p-8 text-center">';
      html += '<div class="text-4xl mb-3">⚖️</div>';
      html += '<div class="font-semibold mb-1">Noch keine Messungen</div>';
      html += '<div class="text-sm mb-4" style="color:#64748b;">Tracke dein Körpergewicht und deine Maße</div>';
      html += '<button class="btn-primary" onclick="BodyPage.showAddModal()">Ersten Eintrag hinzufügen</button>';
      html += '</div>';
    }

    html += '</div>';
    document.getElementById('main-content').innerHTML = html;

    setTimeout(function() {
      if (weightData.length >= 2) initWeightChart(metrics);
      if (metrics.length >= 2) updateMeasureChart();
    }, 50);
  }

  function initWeightChart(metrics) {
    var canvas = document.getElementById('weight-chart');
    if (!canvas) return;
    if (window._weightChart) { try { window._weightChart.destroy(); } catch(e){} }
    var data = metrics.filter(function(m){ return m.weight; });
    window._weightChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.map(function(m){ return Utils.fmtDateShort(m.date); }),
        datasets: [{
          label: 'Gewicht (kg)',
          data: data.map(function(m){ return m.weight; }),
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(124,58,237,0.1)',
          borderWidth: 2.5,
          pointBackgroundColor: '#a78bfa',
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } },
          y: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } }
        }
      }
    });
  }

  function updateMeasureChart() {
    var sel = document.getElementById('measure-select');
    if (!sel) return;
    var key = sel.value;
    var metrics = Store.getBodyMetrics().filter(function(m){ return m.measurements && m.measurements[key]; }).sort(function(a,b){ return a.date.localeCompare(b.date); });
    var canvas = document.getElementById('measure-chart');
    if (!canvas) return;
    if (window._measureChart) { try { window._measureChart.destroy(); } catch(e){} }
    var mConfig = MEASUREMENTS.find(function(m){ return m.key === key; }) || {};
    window._measureChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: metrics.map(function(m){ return Utils.fmtDateShort(m.date); }),
        datasets: [{
          label: (mConfig.label || key) + ' (cm)',
          data: metrics.map(function(m){ return m.measurements[key]; }),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } },
          y: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } }
        }
      }
    });
  }

  function showAddModal() {
    var html = '<div class="p-5">';
    html += '<div class="flex items-center justify-between mb-4">';
    html += '<h2 class="text-xl font-bold">Körpermaße eintragen</h2>';
    html += '<button onclick="App.modal.close()" style="color:#64748b;font-size:20px;">✕</button>';
    html += '</div>';
    html += '<div class="space-y-3">';

    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Datum</label>';
    html += '<input type="date" id="bm-date" class="input-field mt-1" value="' + Store.todayStr() + '" /></div>';

    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Körpergewicht (kg)</label>';
    html += '<input type="number" step="0.1" id="bm-weight" class="input-field mt-1" placeholder="z.B. 80.5" /></div>';

    html += '<div class="border-t pt-3" style="border-color:#2a2a3e;">';
    html += '<div class="text-sm font-medium mb-3" style="color:#94a3b8;">Maße in cm (optional)</div>';
    html += '<div class="grid grid-cols-2 gap-2">';
    MEASUREMENTS.forEach(function(m) {
      html += '<div><label class="text-xs" style="color:#64748b;">' + m.label + '</label>';
      html += '<input type="number" step="0.1" id="bm-' + m.key + '" class="input-field mt-0.5 text-sm py-1.5" placeholder="cm" /></div>';
    });
    html += '</div></div>';

    html += '<div class="flex gap-3 mt-2">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.modal.close()">Abbrechen</button>';
    html += '<button class="btn-primary flex-1 py-2.5" onclick="BodyPage.saveMetric()">Speichern</button>';
    html += '</div></div></div>';
    App.modal.open(html);
  }

  function saveMetric() {
    var date = (document.getElementById('bm-date')||{}).value || Store.todayStr();
    var weight = parseFloat((document.getElementById('bm-weight')||{}).value) || null;

    var measurements = {};
    MEASUREMENTS.forEach(function(m) {
      var val = parseFloat((document.getElementById('bm-' + m.key)||{}).value) || null;
      if (val) measurements[m.key] = val;
    });

    if (!weight && !Object.keys(measurements).length) {
      Utils.toast('Bitte mindestens einen Wert eingeben', 'error'); return;
    }

    Store.saveBodyMetric({ id: Store.uid(), date: date, weight: weight, measurements: measurements });
    App.modal.close();
    Utils.toast('Eintrag gespeichert!');
    render();
  }

  function deleteMetric(id) {
    if (!confirm('Eintrag wirklich löschen?')) return;
    Store.deleteBodyMetric(id);
    render();
  }

  return { render, showAddModal, saveMetric, deleteMetric, updateMeasureChart };
})();
