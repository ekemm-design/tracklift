// TrackLift – Training plans page
var PlansPage = (function () {

  function render() {
    var allPlans = PlansDB.getAll();
    var activePlanId = Store.getActivePlanId();

    var html = '<div class="slide-in space-y-5">';
    html += '<div class="flex items-center justify-between">';
    html += '<h1 class="text-2xl font-bold">Trainingspläne</h1>';
    html += '<button class="btn-primary text-sm" onclick="PlansPage.showCreateModal()">+ Neuer Plan</button>';
    html += '</div>';

    // Preset plans
    html += '<div>';
    html += '<div class="text-xs font-semibold mb-3" style="color:#64748b;">VORLAGEN</div>';
    html += '<div class="space-y-3">';
    PlansDB.PRESET_PLANS.forEach(function(plan) {
      html += renderPlanCard(plan, activePlanId);
    });
    html += '</div></div>';

    // Custom plans
    var custom = Store.getCustomPlans();
    if (custom.length) {
      html += '<div>';
      html += '<div class="text-xs font-semibold mb-3 mt-2" style="color:#64748b;">MEINE PLÄNE</div>';
      html += '<div class="space-y-3">';
      custom.forEach(function(plan) {
        html += renderPlanCard(plan, activePlanId);
      });
      html += '</div></div>';
    }

    html += '</div>';
    document.getElementById('main-content').innerHTML = html;
  }

  function renderPlanCard(plan, activePlanId) {
    var isActive = plan.id === activePlanId;
    var borderStyle = isActive ? 'border-color:#7c3aed;' : '';
    var html = '<div class="card p-4" style="' + borderStyle + 'cursor:pointer;" onclick="PlansPage.viewPlan(\'' + plan.id + '\')">';
    html += '<div class="flex items-start justify-between mb-2">';
    html += '<div class="flex-1 min-w-0">';
    html += '<div class="flex items-center gap-2 flex-wrap">';
    html += '<span class="font-bold text-base">' + plan.name + '</span>';
    if (isActive) html += '<span class="badge" style="background:rgba(124,58,237,0.2);color:#a78bfa;border:1px solid rgba(124,58,237,0.4);">✓ Aktiv</span>';
    html += '</div>';
    html += '<div class="flex items-center gap-2 mt-1 flex-wrap">';
    html += PlansDB.getLevelBadge(plan.level || 'Intermediate');
    html += '<span class="text-xs" style="color:#64748b;">📅 ' + (plan.frequency || '') + '</span>';
    html += '<span class="text-xs" style="color:#64748b;">· ' + plan.days.length + ' Tage</span>';
    html += '</div></div>';
    html += '<div class="flex gap-2 ml-3 flex-shrink-0" onclick="event.stopPropagation()">';
    if (!isActive) {
      html += '<button class="btn-secondary text-xs py-1.5 px-3" onclick="PlansPage.setActive(\'' + plan.id + '\')">Aktivieren</button>';
    }
    html += '<button class="btn-secondary text-xs py-1.5 px-3" onclick="PlansPage.showEditModal(\'' + plan.id + '\')">✏️</button>';
    if (!plan.isPreset) {
      html += '<button class="btn-danger text-xs py-1.5 px-3" onclick="PlansPage.deletePlan(\'' + plan.id + '\')">✕</button>';
    }
    html += '</div></div>';
    html += '<p class="text-sm mt-1" style="color:#64748b;">' + (plan.description || '') + '</p>';
    // Day chips
    html += '<div class="flex flex-wrap gap-1.5 mt-3">';
    plan.days.forEach(function(day) {
      html += '<span class="badge" style="background:#1e1e2e;color:#94a3b8;border:1px solid #2a2a3e;font-size:11px;">' + day.name + '</span>';
    });
    html += '</div></div>';
    return html;
  }

  function viewPlan(planId) {
    var plan = PlansDB.getById(planId);
    if (!plan) return;
    var activePlanId = Store.getActivePlanId();
    var isActive = plan.id === activePlanId;
    var logs = Store.getWorkoutLogs().filter(function(l){ return l.planId === planId; });

    var html = '<div class="slide-in space-y-5">';
    html += '<div class="flex items-center gap-3">';
    html += '<button class="btn-secondary text-sm py-1.5 px-3" onclick="PlansPage.render()">← Zurück</button>';
    html += '<h1 class="text-xl font-bold flex-1 truncate">' + plan.name + '</h1>';
    html += '<button class="btn-secondary text-sm py-1.5 px-3" onclick="PlansPage.showEditModal(\'' + plan.id + '\')">✏️</button>';
    if (!isActive) {
      html += '<button class="btn-primary text-sm" onclick="PlansPage.setActive(\'' + plan.id + '\');PlansPage.viewPlan(\'' + plan.id + '\')">Aktivieren</button>';
    } else {
      html += '<span class="badge" style="background:rgba(124,58,237,0.2);color:#a78bfa;border:1px solid rgba(124,58,237,0.4);">✓ Aktiv</span>';
    }
    html += '</div>';

    html += '<div class="card p-4">';
    html += '<div class="flex flex-wrap gap-4">';
    html += infoChip('Level', plan.level || '–');
    html += infoChip('Frequenz', plan.frequency || '–');
    html += infoChip('Trainingstage', plan.days.length + ' Tage');
    html += infoChip('Absolviert', logs.length + '×');
    html += '</div>';
    if (plan.description) html += '<p class="text-sm mt-3" style="color:#64748b;">' + plan.description + '</p>';
    html += '</div>';

    // Days
    plan.days.forEach(function(day, dayIdx) {
      html += '<div class="card">';
      html += '<div class="px-4 py-3 flex items-center justify-between border-b" style="border-color:#2a2a3e;">';
      html += '<div>';
      html += '<div class="font-bold">' + day.name + '</div>';
      if (day.focus) html += '<div class="text-xs mt-0.5" style="color:#64748b;">' + day.focus + '</div>';
      html += '</div>';
      html += '<button class="btn-primary text-sm py-1.5" onclick="WorkoutPage.start(\'' + plan.id + '\',' + dayIdx + ')">▶ Starten</button>';
      html += '</div>';
      html += '<div class="divide-y" style="border-color:#1e1e2e;">';
      day.exercises.forEach(function(ex) {
        var e = ExercisesDB.getById(ex.exerciseId);
        if (!e) return;
        html += '<div class="px-4 py-3 flex items-center gap-3">';
        html += ExercisesDB.renderThumbnail(e.primary, 'w-10 h-10 rounded flex-shrink-0');
        html += '<div class="flex-1 min-w-0">';
        html += '<div class="font-medium text-sm">' + e.name + '</div>';
        html += '<div class="text-xs mt-0.5 flex items-center gap-2" style="color:#64748b;">';
        html += ExercisesDB.renderBadge(e.primary);
        html += '<span>' + ExercisesDB.getEquipmentIcon(e.equipment) + ' ' + e.equipment + '</span>';
        html += '</div></div>';
        html += '<div class="text-right flex-shrink-0">';
        html += '<div class="font-bold text-sm">' + ex.sets + ' Sätze</div>';
        html += '<div class="text-xs" style="color:#64748b;">' + ex.reps + ' Wdh. · ' + ex.restSeconds + 's</div>';
        html += '</div></div>';
      });
      html += '</div></div>';
    });

    if (!plan.isPreset) {
      html += '<button class="btn-danger w-full py-2.5" onclick="PlansPage.deletePlan(\'' + plan.id + '\');PlansPage.render()">Plan löschen</button>';
    }

    html += '</div>';
    document.getElementById('main-content').innerHTML = html;
  }

  function infoChip(label, value) {
    return '<div><div class="text-xs" style="color:#64748b;">' + label + '</div><div class="font-semibold mt-0.5">' + value + '</div></div>';
  }

  function setActive(planId) {
    Store.setActivePlanId(planId);
    App.updateSidebarStreak();
    Utils.toast('Plan aktiviert!');
    render();
  }

  function deletePlan(planId) {
    if (!confirm('Plan wirklich löschen?')) return;
    Store.deleteCustomPlan(planId);
    if (Store.getActivePlanId() === planId) Store.setActivePlanId(null);
    render();
  }

  function showCreateModal() {
    var allEx = ExercisesDB.getAll();
    var html = '<div class="p-5">';
    html += '<div class="flex items-center justify-between mb-5">';
    html += '<h2 class="text-xl font-bold">Neuer Trainingsplan</h2>';
    html += '<button onclick="App.modal.close()" style="color:#64748b;font-size:20px;">✕</button>';
    html += '</div>';

    html += '<div class="space-y-4" id="plan-create-form">';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Planname</label>';
    html += '<input id="plan-name" class="input-field mt-1" placeholder="z.B. Mein PPL Plan" /></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Beschreibung</label>';
    html += '<input id="plan-desc" class="input-field mt-1" placeholder="Optional..." /></div>';
    html += '<div class="grid grid-cols-2 gap-3">';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Level</label>';
    html += '<select id="plan-level" class="input-field mt-1"><option>Einsteiger</option><option>Intermediate</option><option>Fortgeschritten</option></select></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Frequenz</label>';
    html += '<input id="plan-freq" class="input-field mt-1" placeholder="z.B. 4x / Woche" /></div>';
    html += '</div>';

    html += '<div>';
    html += '<div class="flex items-center justify-between mb-2">';
    html += '<label class="text-sm font-medium" style="color:#94a3b8;">Trainingstage</label>';
    html += '<button class="btn-secondary text-xs py-1 px-2" onclick="PlansPage.addDayToForm()">+ Tag</button>';
    html += '</div>';
    html += '<div id="plan-days-container" class="space-y-3">';
    html += buildDayFormHTML(0);
    html += '</div></div>';

    html += '<div class="flex gap-3 mt-2">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.modal.close()">Abbrechen</button>';
    html += '<button class="btn-primary flex-1 py-2.5" onclick="PlansPage.saveNewPlan()">Plan speichern</button>';
    html += '</div></div>';

    App.modal.open(html);
    window._planDayCount = 1;
  }

  function buildDayFormHTML(idx) {
    var allEx = ExercisesDB.getAll();
    var html = '<div class="card2 p-3" id="day-block-' + idx + '">';
    html += '<div class="flex items-center gap-2 mb-2">';
    html += '<input class="input-field text-sm py-1.5 flex-1" placeholder="Tag ' + (idx+1) + ' Name, z.B. Push A" id="day-name-' + idx + '" />';
    if (idx > 0) html += '<button class="btn-danger text-xs py-1.5 px-2" onclick="document.getElementById(\'day-block-' + idx + '\').remove()">✕</button>';
    html += '</div>';
    html += '<div id="day-ex-' + idx + '" class="space-y-1.5">';
    html += buildExRowHTML(idx, 0, allEx);
    html += '</div>';
    html += '<button class="btn-secondary text-xs py-1 px-2 mt-2 w-full" onclick="PlansPage.addExToDay(' + idx + ')">+ Übung</button>';
    html += '</div>';
    return html;
  }

  function buildExRowHTML(dayIdx, exIdx, allEx) {
    if (!allEx) allEx = ExercisesDB.getAll();
    var opts = allEx.map(function(e){ return '<option value="' + e.id + '">' + e.name + '</option>'; }).join('');
    return '<div class="flex gap-1.5 items-center" id="ex-row-' + dayIdx + '-' + exIdx + '">' +
      '<select class="input-field text-xs py-1.5 flex-1" id="ex-id-' + dayIdx + '-' + exIdx + '">' + opts + '</select>' +
      '<input class="input-field text-xs py-1.5 w-12 text-center" placeholder="4" id="ex-sets-' + dayIdx + '-' + exIdx + '" value="3" type="number" min="1" />' +
      '<input class="input-field text-xs py-1.5 w-20 text-center" placeholder="Wdh." id="ex-reps-' + dayIdx + '-' + exIdx + '" value="8-12" />' +
      '<input class="input-field text-xs py-1.5 w-14 text-center" placeholder="Pause" id="ex-rest-' + dayIdx + '-' + exIdx + '" value="90" type="number" />' +
      '</div>';
  }

  function addDayToForm() {
    var idx = window._planDayCount || 1;
    window._planDayCount = idx + 1;
    var container = document.getElementById('plan-days-container');
    if (!container) return;
    var div = document.createElement('div');
    div.innerHTML = buildDayFormHTML(idx);
    container.appendChild(div.firstChild);
    window['_dayExCount_' + idx] = 1;
  }

  function addExToDay(dayIdx) {
    var count = window['_dayExCount_' + dayIdx] || 1;
    window['_dayExCount_' + dayIdx] = count + 1;
    var container = document.getElementById('day-ex-' + dayIdx);
    if (!container) return;
    var div = document.createElement('div');
    div.innerHTML = buildExRowHTML(dayIdx, count);
    container.appendChild(div.firstChild);
  }

  function saveNewPlan() {
    var name = (document.getElementById('plan-name')||{}).value || '';
    if (!name.trim()) { Utils.toast('Bitte einen Plannamen eingeben', 'error'); return; }

    var days = [];
    var dayIdx = 0;
    while (document.getElementById('day-block-' + dayIdx)) {
      var dayName = (document.getElementById('day-name-' + dayIdx)||{}).value || ('Tag ' + (dayIdx+1));
      var exercises = [];
      var exIdx = 0;
      while (document.getElementById('ex-row-' + dayIdx + '-' + exIdx)) {
        var exId = (document.getElementById('ex-id-' + dayIdx + '-' + exIdx)||{}).value;
        var sets = parseInt((document.getElementById('ex-sets-' + dayIdx + '-' + exIdx)||{}).value) || 3;
        var reps = (document.getElementById('ex-reps-' + dayIdx + '-' + exIdx)||{}).value || '8-12';
        var rest = parseInt((document.getElementById('ex-rest-' + dayIdx + '-' + exIdx)||{}).value) || 90;
        if (exId) exercises.push({ exerciseId: exId, sets: sets, reps: reps, restSeconds: rest });
        exIdx++;
      }
      days.push({ name: dayName, exercises: exercises });
      dayIdx++;
    }

    if (!days.length || !days[0].exercises.length) { Utils.toast('Mindestens 1 Tag mit Übung benötigt', 'error'); return; }

    var existingId = document.getElementById('plan-create-form').dataset.editId;
    var plan = {
      id: existingId || Store.uid(),
      name: name.trim(),
      description: (document.getElementById('plan-desc')||{}).value || '',
      level: (document.getElementById('plan-level')||{}).value || 'Intermediate',
      frequency: (document.getElementById('plan-freq')||{}).value || '',
      isPreset: false,
      days: days,
    };
    Store.saveCustomPlan(plan);
    App.modal.close();
    Utils.toast(existingId ? 'Plan aktualisiert! ✓' : 'Plan gespeichert! 🎉');
    render();
  }

  function showEditModal(planId) {
    var plan = PlansDB.getById(planId);
    if (!plan) return;
    var allEx = ExercisesDB.getAll();

    var html = '<div class="p-5">';
    html += '<div class="flex items-center justify-between mb-5">';
    var isPreset = !!plan.isPreset;
    html += '<h2 class="text-xl font-bold">Plan bearbeiten' + (isPreset ? ' <span class="text-sm font-normal" style="color:#64748b;">(Kopie wird gespeichert)</span>' : '') + '</h2>';
    html += '<button onclick="App.modal.close()" style="color:#64748b;font-size:20px;">✕</button>';
    html += '</div>';

    html += '<div class="space-y-4" id="plan-create-form" data-edit-id="' + plan.id + '">';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Planname</label>';
    html += '<input id="plan-name" class="input-field mt-1" value="' + (plan.name || '') + '" /></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Beschreibung</label>';
    html += '<input id="plan-desc" class="input-field mt-1" value="' + (plan.description || '') + '" /></div>';
    html += '<div class="grid grid-cols-2 gap-3">';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Level</label>';
    html += '<select id="plan-level" class="input-field mt-1"><option' + (plan.level==='Einsteiger'?' selected':'') + '>Einsteiger</option><option' + (plan.level==='Intermediate'?' selected':'') + '>Intermediate</option><option' + (plan.level==='Fortgeschritten'?' selected':'') + '>Fortgeschritten</option></select></div>';
    html += '<div><label class="text-sm font-medium" style="color:#94a3b8;">Frequenz</label>';
    html += '<input id="plan-freq" class="input-field mt-1" value="' + (plan.frequency || '') + '" /></div>';
    html += '</div>';

    html += '<div>';
    html += '<div class="flex items-center justify-between mb-2">';
    html += '<label class="text-sm font-medium" style="color:#94a3b8;">Trainingstage</label>';
    html += '<button class="btn-secondary text-xs py-1 px-2" onclick="PlansPage.addDayToForm()">+ Tag</button>';
    html += '</div>';
    html += '<div id="plan-days-container" class="space-y-3">';

    plan.days.forEach(function(day, dayIdx) {
      html += '<div class="card2 p-3" id="day-block-' + dayIdx + '">';
      html += '<div class="flex items-center gap-2 mb-2">';
      html += '<input class="input-field text-sm py-1.5 flex-1" placeholder="Tag ' + (dayIdx+1) + ' Name" id="day-name-' + dayIdx + '" value="' + (day.name || '') + '" />';
      if (dayIdx > 0) html += '<button class="btn-danger text-xs py-1.5 px-2" onclick="document.getElementById(\'day-block-' + dayIdx + '\').remove()">✕</button>';
      html += '</div>';
      html += '<div id="day-ex-' + dayIdx + '" class="space-y-1.5">';
      day.exercises.forEach(function(ex, exIdx) {
        var opts = allEx.map(function(e){
          return '<option value="' + e.id + '"' + (e.id === ex.exerciseId ? ' selected' : '') + '>' + e.name + '</option>';
        }).join('');
        html += '<div class="flex gap-1.5 items-center" id="ex-row-' + dayIdx + '-' + exIdx + '">' +
          '<select class="input-field text-xs py-1.5 flex-1" id="ex-id-' + dayIdx + '-' + exIdx + '">' + opts + '</select>' +
          '<input class="input-field text-xs py-1.5 w-12 text-center" id="ex-sets-' + dayIdx + '-' + exIdx + '" value="' + ex.sets + '" type="number" min="1" />' +
          '<input class="input-field text-xs py-1.5 w-20 text-center" id="ex-reps-' + dayIdx + '-' + exIdx + '" value="' + ex.reps + '" />' +
          '<input class="input-field text-xs py-1.5 w-14 text-center" id="ex-rest-' + dayIdx + '-' + exIdx + '" value="' + ex.restSeconds + '" type="number" />' +
          '</div>';
      });
      html += '</div>';
      html += '<button class="btn-secondary text-xs py-1 px-2 mt-2 w-full" onclick="PlansPage.addExToDay(' + dayIdx + ')">+ Übung</button>';
      html += '</div>';
      window['_dayExCount_' + dayIdx] = day.exercises.length;
    });

    html += '</div></div>';
    html += '<div class="flex gap-3 mt-2">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.modal.close()">Abbrechen</button>';
    html += '<button class="btn-primary flex-1 py-2.5" onclick="PlansPage.saveNewPlan()">Speichern</button>';
    html += '</div></div>';

    window._planDayCount = plan.days.length;
    App.modal.open(html);
  }

  return { render, viewPlan, setActive, deletePlan, showCreateModal, showEditModal, addDayToForm, addExToDay, saveNewPlan };
})();
