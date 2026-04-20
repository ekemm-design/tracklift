// TrackLift – Exercise browser page
var ExercisesPage = (function () {

  var _filter = { muscle: 'all', equipment: 'all', category: 'all', search: '' };

  function render() {
    var html = '<div class="slide-in space-y-4">';
    html += '<div class="flex items-center justify-between">';
    html += '<h1 class="text-2xl font-bold">Übungen</h1>';
    html += '<button class="btn-primary text-sm" onclick="ExercisesPage.showAddModal()">+ Eigene Übung</button>';
    html += '</div>';

    // Search + filters
    html += '<div class="space-y-2">';
    html += '<input class="input-field" placeholder="🔍 Übung suchen..." id="ex-search" oninput="ExercisesPage.applyFilter()" value="' + _filter.search + '" />';
    html += '<div class="flex gap-2 overflow-x-auto pb-1">';
    // Muscle filter
    var muscles = ['all','chest','back','shoulders','arms','legs','core'];
    var muscleLabels = { all:'Alle', chest:'Brust', back:'Rücken', shoulders:'Schultern', arms:'Arme', legs:'Beine', core:'Core' };
    muscles.forEach(function(m) {
      var active = _filter.muscle === m;
      html += '<button class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all" ' +
        'style="' + (active ? 'background:#7c3aed;color:white;' : 'background:#1e1e2e;color:#94a3b8;border:1px solid #2a2a3e;') + '" ' +
        'onclick="ExercisesPage.setFilter(\'muscle\',\'' + m + '\')">' + muscleLabels[m] + '</button>';
    });
    html += '</div>';
    html += '<div class="flex gap-2 overflow-x-auto pb-1">';
    var cats = ['all','compound','isolation'];
    var catLabels = { all:'Alle', compound:'Grundübung', isolation:'Isolation' };
    cats.forEach(function(c) {
      var active = _filter.category === c;
      html += '<button class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium" ' +
        'style="' + (active ? 'background:#7c3aed;color:white;' : 'background:#1e1e2e;color:#94a3b8;border:1px solid #2a2a3e;') + '" ' +
        'onclick="ExercisesPage.setFilter(\'category\',\'' + c + '\')">' + catLabels[c] + '</button>';
    });
    var equips = ['all','Langhantel','Kurzhantel','Kabel','Maschine','Körpergewicht'];
    equips.forEach(function(e) {
      var active = _filter.equipment === e;
      html += '<button class="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium" ' +
        'style="' + (active ? 'background:#7c3aed;color:white;' : 'background:#1e1e2e;color:#94a3b8;border:1px solid #2a2a3e;') + '" ' +
        'onclick="ExercisesPage.setFilter(\'equipment\',\'' + e + '\')">' + (e === 'all' ? 'Alle Equipment' : e) + '</button>';
    });
    html += '</div></div>';

    // Exercise grid
    var all = ExercisesDB.getAll();
    var filtered = all.filter(function(e) {
      if (_filter.muscle !== 'all' && e.primary !== _filter.muscle) return false;
      if (_filter.equipment !== 'all' && e.equipment !== _filter.equipment) return false;
      if (_filter.category !== 'all' && e.category !== _filter.category) return false;
      if (_filter.search && !e.name.toLowerCase().includes(_filter.search.toLowerCase())) return false;
      return true;
    });

    html += '<div class="text-xs" style="color:#64748b;">' + filtered.length + ' Übungen</div>';

    if (!filtered.length) {
      html += '<div class="card p-8 text-center"><div class="text-3xl mb-2">🔍</div><div style="color:#64748b;">Keine Übungen gefunden</div></div>';
    } else {
      html += '<div class="grid grid-cols-2 md:grid-cols-3 gap-3">';
      filtered.forEach(function(e) {
        var isCustom = !ExercisesDB.EXERCISES.find(function(b){ return b.id === e.id; });
        html += '<div class="card overflow-hidden cursor-pointer hover:border-purple-600 transition-all" onclick="ExercisesPage.viewExercise(\'' + e.id + '\')">';
        html += ExercisesDB.renderThumbnail(e.primary, 'w-full h-24');
        html += '<div class="p-2.5">';
        html += '<div class="font-semibold text-sm leading-tight">' + e.name + '</div>';
        html += '<div class="flex items-center gap-1.5 mt-1.5 flex-wrap">';
        html += ExercisesDB.renderBadge(e.primary);
        if (isCustom) html += '<span class="badge" style="background:rgba(124,58,237,0.1);color:#a78bfa;border:1px solid rgba(124,58,237,0.2);font-size:10px;">Eigene</span>';
        html += '</div>';
        html += '<div class="text-xs mt-1" style="color:#64748b;">' + ExercisesDB.getEquipmentIcon(e.equipment) + ' ' + e.equipment + '</div>';
        html += '</div></div>';
      });
      html += '</div>';
    }

    html += '</div>';
    document.getElementById('main-content').innerHTML = html;
  }

  function setFilter(key, val) {
    _filter[key] = val;
    render();
  }

  function applyFilter() {
    var el = document.getElementById('ex-search');
    if (el) _filter.search = el.value;
    // Re-render grid only
    render();
  }

  function viewExercise(id) {
    var e = ExercisesDB.getById(id);
    if (!e) return;
    var logs = Store.getLogsByExercise(id);
    var prs = Store.getPersonalRecords();
    var pr = prs[id];
    var isCustom = !ExercisesDB.EXERCISES.find(function(b){ return b.id === id; });

    var html = '<div class="slide-in space-y-4">';
    html += '<div class="flex items-center gap-3">';
    html += '<button class="btn-secondary text-sm py-1.5 px-3" onclick="ExercisesPage.render()">← Zurück</button>';
    html += '<h1 class="text-xl font-bold flex-1 truncate">' + e.name + '</h1>';
    if (isCustom) html += '<button class="btn-danger text-sm py-1.5 px-3" onclick="ExercisesPage.deleteCustom(\'' + id + '\')">Löschen</button>';
    html += '</div>';

    // Exercise image + info
    html += '<div class="card overflow-hidden">';
    html += ExercisesDB.renderThumbnail(e.primary, 'w-full h-40');
    html += '<div class="p-4">';
    html += '<div class="flex flex-wrap gap-2 mb-3">';
    html += ExercisesDB.renderBadge(e.primary);
    html += '<span class="badge" style="background:#1e1e2e;color:#94a3b8;border:1px solid #2a2a3e;">' + (e.category === 'compound' ? 'Grundübung' : 'Isolation') + '</span>';
    html += '<span class="badge" style="background:#1e1e2e;color:#94a3b8;border:1px solid #2a2a3e;">' + ExercisesDB.getEquipmentIcon(e.equipment) + ' ' + e.equipment + '</span>';
    html += '</div>';
    if (e.desc) html += '<p class="text-sm" style="color:#94a3b8;">' + e.desc + '</p>';
    html += '</div></div>';

    // PR card
    if (pr) {
      var orm = Utils.calcOneRepMax(pr.weight, pr.reps);
      html += '<div class="card p-4" style="border-color:#fbbf24;">';
      html += '<div class="text-xs font-semibold mb-2" style="color:#fbbf24;">🏆 PERSONAL RECORD</div>';
      html += '<div class="flex items-center justify-between">';
      html += '<div><div class="text-2xl font-bold">' + pr.weight + ' kg × ' + pr.reps + '</div>';
      html += '<div class="text-sm mt-0.5" style="color:#64748b;">' + Utils.fmtDate(pr.date) + '</div></div>';
      html += '<div class="text-right"><div class="font-bold text-lg" style="color:#fbbf24;">1RM ≈ ' + orm + ' kg</div>';
      html += '<div class="text-xs" style="color:#64748b;">Epley-Formel</div></div>';
      html += '</div></div>';
    }

    // Progress chart
    if (logs.length >= 2) {
      html += '<div class="card p-4">';
      html += '<div class="font-semibold mb-3">Stärkeentwicklung</div>';
      html += '<canvas id="ex-progress-chart" height="140"></canvas>';
      html += '</div>';
    }

    // Log history
    if (logs.length) {
      html += '<div class="card p-4">';
      html += '<div class="text-xs font-semibold mb-3" style="color:#64748b;">TRAININGSHISTORIE</div>';
      html += '<div class="space-y-2">';
      var recent = logs.slice(-8).reverse();
      recent.forEach(function(entry) {
        var vol = Utils.calcVolume(entry.sets);
        var bestSet = entry.sets.filter(function(s){ return s.completed; }).sort(function(a,b){ return (b.weight||0)-(a.weight||0); })[0];
        html += '<div class="card2 p-3">';
        html += '<div class="flex items-center justify-between mb-2">';
        html += '<div class="text-sm font-medium">' + Utils.fmtDate(entry.date) + '</div>';
        html += '<div class="text-sm font-semibold" style="color:#a78bfa;">' + Utils.fmtVolume(vol) + '</div>';
        html += '</div>';
        html += '<div class="flex flex-wrap gap-1">';
        entry.sets.forEach(function(s, i) {
          if (!s.completed) return;
          html += '<span class="text-xs px-2 py-0.5 rounded" style="background:#1e1e2e;color:#94a3b8;">' + s.weight + 'kg×' + s.reps + '</span>';
        });
        html += '</div></div>';
      });
      html += '</div></div>';
    } else {
      html += '<div class="card p-6 text-center"><div class="text-3xl mb-2">📊</div><div style="color:#64748b;">Noch keine Trainingshistorie für diese Übung</div></div>';
    }

    html += '</div>';
    document.getElementById('main-content').innerHTML = html;

    // Render progress chart
    if (logs.length >= 2) {
      setTimeout(function() {
        renderExChart(logs);
      }, 100);
    }
  }

  function renderExChart(logs) {
    var canvas = document.getElementById('ex-progress-chart');
    if (!canvas) return;
    if (window._exChart) { try { window._exChart.destroy(); } catch(e){} }

    var recent = logs.slice(-12);
    var labels = recent.map(function(l){ return Utils.fmtDateShort(l.date); });
    var maxWeights = recent.map(function(l) {
      var sets = l.sets.filter(function(s){ return s.completed && s.weight; });
      if (!sets.length) return 0;
      return Math.max.apply(null, sets.map(function(s){ return s.weight; }));
    });
    var volumes = recent.map(function(l){ return Utils.calcVolume(l.sets); });

    window._exChart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Max. Gewicht (kg)',
            data: maxWeights,
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124,58,237,0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#a78bfa',
            tension: 0.3,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Volumen (kg)',
            data: volumes,
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
            tension: 0.3,
            borderDash: [4,3],
            yAxisID: 'y2',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: {
          x: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } } },
          y: { grid: { color: '#1e1e2e' }, ticks: { color: '#64748b', font: { size: 11 } }, position: 'left' },
          y2: { grid: { display: false }, ticks: { color: '#10b981', font: { size: 10 } }, position: 'right' },
        }
      }
    });
  }

  function showAddModal() {
    var muscles = Object.entries(ExercisesDB.MUSCLE_CONFIG);
    var html = '<div class="p-5">';
    html += '<div class="flex items-center justify-between mb-4">';
    html += '<h2 class="text-xl font-bold">Eigene Übung</h2>';
    html += '<button onclick="App.modal.close()" style="color:#64748b;font-size:20px;">✕</button>';
    html += '</div>';
    html += '<div class="space-y-3">';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Name</label>';
    html += '<input id="cex-name" class="input-field mt-1" placeholder="Übungsname" /></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Muskelgruppe</label>';
    html += '<select id="cex-muscle" class="input-field mt-1">';
    muscles.forEach(function(m){ html += '<option value="' + m[0] + '">' + m[1].label + '</option>'; });
    html += '</select></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Equipment</label>';
    html += '<select id="cex-equip" class="input-field mt-1"><option>Langhantel</option><option>Kurzhantel</option><option>Kabel</option><option>Maschine</option><option>Körpergewicht</option><option>Sonstiges</option></select></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Typ</label>';
    html += '<select id="cex-cat" class="input-field mt-1"><option value="compound">Grundübung</option><option value="isolation">Isolation</option></select></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Beschreibung (optional)</label>';
    html += '<textarea id="cex-desc" class="input-field mt-1" rows="2" placeholder="Ausführungsbeschreibung..."></textarea></div>';
    html += '<div class="flex gap-3">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.modal.close()">Abbrechen</button>';
    html += '<button class="btn-primary flex-1 py-2.5" onclick="ExercisesPage.saveCustom()">Speichern</button>';
    html += '</div></div></div>';
    App.modal.open(html);
  }

  function saveCustom() {
    var name = (document.getElementById('cex-name')||{}).value || '';
    if (!name.trim()) { Utils.toast('Name erforderlich', 'error'); return; }
    var ex = {
      id: 'custom_' + Store.uid(),
      name: name.trim(),
      primary: (document.getElementById('cex-muscle')||{}).value || 'core',
      equipment: (document.getElementById('cex-equip')||{}).value || 'Sonstiges',
      category: (document.getElementById('cex-cat')||{}).value || 'compound',
      desc: (document.getElementById('cex-desc')||{}).value || '',
      secondary: [],
    };
    Store.saveCustomExercise(ex);
    App.modal.close();
    Utils.toast('Übung gespeichert!');
    render();
  }

  function deleteCustom(id) {
    if (!confirm('Übung wirklich löschen?')) return;
    Store.deleteCustomExercise(id);
    Utils.toast('Übung gelöscht');
    render();
  }

  return { render, setFilter, applyFilter, viewExercise, showAddModal, saveCustom, deleteCustom };
})();
