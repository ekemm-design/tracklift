// TrackLift – Active Workout Mode
var WorkoutPage = (function () {

  var _state = null;   // current workout state
  var _timer = null;   // rest timer interval
  var _sessionTimer = null; // elapsed time interval

  function start(planId, dayIndex) {
    var plan = PlansDB.getById(planId);
    if (!plan) return;
    var day = plan.days[dayIndex];
    if (!day) return;

    // Build session state
    _state = {
      id: Store.uid(),
      planId: planId,
      planName: plan.name,
      dayIndex: dayIndex,
      dayName: day.name,
      date: Store.todayStr(),
      startTime: Date.now(),
      duration: 0,
      exercises: day.exercises.map(function(ex, exIdx) {
        var e = ExercisesDB.getById(ex.exerciseId);
        // Pre-fill last known weights
        var lastLogs = Store.getLogsByExercise(ex.exerciseId);
        var lastSets = lastLogs.length ? (lastLogs[lastLogs.length-1].sets || []) : [];
        return {
          exerciseId: ex.exerciseId,
          name: e ? e.name : ex.exerciseId,
          primary: e ? e.primary : 'core',
          targetSets: ex.sets,
          targetReps: ex.reps,
          restSeconds: ex.restSeconds || 90,
          sets: Array.from({length: ex.sets}, function(_, i) {
            var prev = lastSets[i] || {};
            return { weight: prev.weight || '', reps: prev.reps || '', completed: false };
          }),
        };
      }),
      currentExIdx: 0,
      restActive: false,
      restRemaining: 0,
      restTotal: 90,
      elapsedSeconds: 0,
    };

    Store.saveActiveWorkout(_state);
    renderWorkout();
    document.getElementById('workout-overlay').classList.add('active');

    // Session timer
    _sessionTimer = setInterval(function() {
      _state.elapsedSeconds = Math.round((Date.now() - _state.startTime) / 1000);
      var el = document.getElementById('wo-elapsed');
      if (el) el.textContent = Utils.fmtDuration(_state.elapsedSeconds);
    }, 1000);
  }

  function renderWorkout() {
    if (!_state) return;
    var ex = _state.exercises[_state.currentExIdx];
    var exerciseObj = ExercisesDB.getById(ex.exerciseId);
    var totalSets = _state.exercises.reduce(function(a,e){ return a + e.sets.length; }, 0);
    var completedSets = _state.exercises.reduce(function(a,e){ return a + e.sets.filter(function(s){ return s.completed; }).length; }, 0);
    var progress = totalSets ? completedSets / totalSets : 0;

    var html = '<div style="max-width:640px;margin:0 auto;padding:16px 16px 120px;">';

    // ── Top bar ───────────────────────────────────────────────
    html += '<div class="flex items-center justify-between mb-4">';
    html += '<div>';
    html += '<div class="text-xs font-semibold" style="color:#64748b;">AKTIVES TRAINING</div>';
    html += '<div class="font-bold text-lg">' + _state.dayName + '</div>';
    html += '</div>';
    html += '<div class="flex items-center gap-3">';
    html += '<div class="text-center"><div class="text-xl font-bold" style="color:#a78bfa;" id="wo-elapsed">' + Utils.fmtDuration(_state.elapsedSeconds) + '</div><div class="text-xs" style="color:#64748b;">Dauer</div></div>';
    html += '<button onclick="WorkoutPage.confirmFinish()" class="btn-secondary text-sm py-1.5 px-3">Beenden</button>';
    html += '</div></div>';

    // Progress bar
    html += '<div class="progress-bar-wrap mb-5"><div class="progress-bar" style="width:' + Math.round(progress*100) + '%;"></div></div>';
    html += '<div class="text-xs text-center mb-5" style="color:#64748b;">' + completedSets + ' / ' + totalSets + ' Sätze abgeschlossen (' + Math.round(progress*100) + '%)</div>';

    // ── Rest timer (shown above exercise when active) ──────────
    if (_state.restActive && _state.restRemaining > 0) {
      html += '<div class="card p-5 text-center mb-4" style="border-color:#7c3aed;">';
      html += '<div class="text-xs font-semibold mb-3" style="color:#a78bfa;">PAUSE</div>';
      html += '<div class="timer-circle mx-auto mb-3">';
      html += '<div class="text-4xl font-bold" id="rest-display">' + Utils.fmtSeconds(_state.restRemaining) + '</div>';
      html += '<div class="text-xs mt-1" style="color:#64748b;">verbleibend</div>';
      html += '</div>';
      var pct = Math.round((_state.restRemaining / _state.restTotal) * 100);
      html += '<div class="progress-bar-wrap mt-3"><div class="progress-bar" id="rest-bar" style="width:' + pct + '%;background:linear-gradient(90deg,#10b981,#059669);"></div></div>';
      html += '<div class="flex gap-3 mt-4 justify-center">';
      html += '<button class="btn-secondary py-2 px-4 text-sm" onclick="WorkoutPage.skipRest()">Überspringen</button>';
      html += '<button class="btn-secondary py-2 px-4 text-sm" onclick="WorkoutPage.addRestTime(30)">+30s</button>';
      html += '</div></div>';
    }

    // ── Exercise navigation ───────────────────────────────────
    html += '<div class="flex items-center gap-2 mb-3">';
    html += '<button class="btn-secondary py-1.5 px-3 text-sm" onclick="WorkoutPage.prevEx()" ' + (_state.currentExIdx === 0 ? 'disabled style="opacity:0.4;"' : '') + '>←</button>';
    html += '<div class="flex-1 text-center text-sm" style="color:#64748b;">Übung ' + (_state.currentExIdx+1) + ' / ' + _state.exercises.length + '</div>';
    html += '<button class="btn-secondary py-1.5 px-3 text-sm" onclick="WorkoutPage.nextEx()" ' + (_state.currentExIdx === _state.exercises.length-1 ? 'disabled style="opacity:0.4;"' : '') + '>→</button>';
    html += '</div>';

    // ── Current exercise card ─────────────────────────────────
    html += '<div class="card overflow-hidden mb-4">';
    html += '<div class="flex gap-4 p-4 items-start">';
    html += ExercisesDB.renderThumbnail(ex.primary, 'w-20 h-16 rounded-lg flex-shrink-0');
    html += '<div class="flex-1 min-w-0">';
    html += '<div class="font-bold text-lg leading-tight">' + ex.name + '</div>';
    html += '<div class="flex items-center gap-2 mt-1 flex-wrap">';
    html += ExercisesDB.renderBadge(ex.primary);
    html += '<span class="text-sm" style="color:#64748b;">Ziel: ' + ex.targetSets + '×' + ex.targetReps + '</span>';
    html += '</div>';
    if (exerciseObj && exerciseObj.desc) {
      html += '<div class="text-xs mt-2" style="color:#4a4a6a;">' + exerciseObj.desc + '</div>';
    }
    html += '</div></div>';

    // Set header
    html += '<div class="px-4 pb-2">';
    html += '<div class="workout-set-row text-xs font-semibold mb-2" style="color:#64748b;">';
    html += '<div>SATZ</div><div class="text-center">KG</div><div class="text-center">WDH.</div><div></div>';
    html += '</div>';
    html += '<div class="space-y-2" id="sets-container">';
    ex.sets.forEach(function(set, setIdx) {
      html += renderSetRow(setIdx, set, ex.restSeconds);
    });
    html += '</div>';
    html += '<button class="btn-secondary text-xs py-1.5 w-full mt-2" onclick="WorkoutPage.addSet()">+ Satz hinzufügen</button>';

    // Last performance
    var lastData = Store.getLogsByExercise(ex.exerciseId);
    if (lastData.length) {
      var last = lastData[lastData.length-1];
      var bestSet = last.sets.filter(function(s){ return s.completed; }).sort(function(a,b){ return b.weight - a.weight; })[0];
      if (bestSet) {
        html += '<div class="mt-3 p-2 rounded-lg text-xs" style="background:#1e1e2e;">';
        html += '<span style="color:#64748b;">Letztes Mal (' + Utils.fmtDate(last.date) + '):</span> ';
        html += '<span class="font-semibold" style="color:#a78bfa;">' + bestSet.weight + ' kg × ' + bestSet.reps + '</span>';
        html += '</div>';
      }
    }

    html += '</div></div>';

    // ── Exercise list overview ─────────────────────────────────
    html += '<div class="card p-3">';
    html += '<div class="text-xs font-semibold mb-2" style="color:#64748b;">ALLE ÜBUNGEN</div>';
    html += '<div class="space-y-1">';
    _state.exercises.forEach(function(e2, i) {
      var completed2 = e2.sets.filter(function(s){ return s.completed; }).length;
      var isAll = completed2 === e2.sets.length && e2.sets.length > 0;
      var isCurrent = i === _state.currentExIdx;
      var style = isCurrent ? 'background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.3);' : '';
      html += '<div class="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer" style="' + style + '" onclick="WorkoutPage.goToEx(' + i + ')">';
      html += ExercisesDB.renderThumbnail(e2.primary, 'w-7 h-7 rounded');
      html += '<div class="flex-1 min-w-0"><div class="text-sm truncate' + (isCurrent ? ' font-bold' : '') + '">' + e2.name + '</div></div>';
      html += '<div class="text-xs font-semibold" style="color:' + (isAll ? '#10b981' : (completed2 > 0 ? '#fbbf24' : '#64748b')) + ';">' + completed2 + '/' + e2.sets.length + '</div>';
      if (isAll) html += '<span style="color:#10b981;">✓</span>';
      html += '</div>';
    });
    html += '</div></div>';

    html += '</div>';
    document.getElementById('workout-content').innerHTML = html;
  }

  function renderSetRow(setIdx, set, restSeconds) {
    var done = set.completed;
    return '<div class="workout-set-row py-1" id="set-row-' + setIdx + '">' +
      '<div class="text-center font-bold text-sm ' + (done ? 'text-green-400' : '') + '">' + (setIdx+1) + '</div>' +
      '<input type="number" step="0.5" min="0" class="input-field text-sm text-center py-1.5 px-2" ' +
        'id="set-weight-' + setIdx + '" value="' + (set.weight||'') + '" ' +
        'oninput="WorkoutPage.updateSet(' + setIdx + ')" placeholder="kg" ' +
        (done ? 'style="border-color:#10b981;opacity:0.7;"' : '') + ' />' +
      '<input type="number" step="1" min="0" class="input-field text-sm text-center py-1.5 px-2" ' +
        'id="set-reps-' + setIdx + '" value="' + (set.reps||'') + '" ' +
        'oninput="WorkoutPage.updateSet(' + setIdx + ')" placeholder="Wdh" ' +
        (done ? 'style="border-color:#10b981;opacity:0.7;"' : '') + ' />' +
      '<button class="rounded-lg text-sm font-bold flex items-center justify-center transition-all ' +
        (done ? 'complete-btn done' : 'complete-btn btn-primary') + '" ' +
        'style="width:40px;height:36px;" ' +
        'onclick="WorkoutPage.toggleSet(' + setIdx + ',' + restSeconds + ')">' +
        (done ? '✓' : '○') +
      '</button>' +
    '</div>';
  }

  function updateSet(setIdx) {
    if (!_state) return;
    var ex = _state.exercises[_state.currentExIdx];
    var w = parseFloat(document.getElementById('set-weight-' + setIdx).value) || 0;
    var r = parseInt(document.getElementById('set-reps-' + setIdx).value) || 0;
    ex.sets[setIdx].weight = w;
    ex.sets[setIdx].reps = r;
    Store.saveActiveWorkout(_state);
  }

  function toggleSet(setIdx, restSeconds) {
    if (!_state) return;
    var ex = _state.exercises[_state.currentExIdx];
    updateSet(setIdx);
    var set = ex.sets[setIdx];
    set.completed = !set.completed;

    if (set.completed) {
      // Start rest timer
      startRestTimer(restSeconds || ex.restSeconds || 90);
      // Check if all sets done → auto-move to next exercise
      var allDone = ex.sets.every(function(s){ return s.completed; });
      if (allDone && _state.currentExIdx < _state.exercises.length - 1) {
        setTimeout(function() {
          _state.currentExIdx++;
          renderWorkout();
        }, 800);
      } else {
        renderWorkout();
      }
    } else {
      set.completed = false;
      renderWorkout();
    }
    Store.saveActiveWorkout(_state);
  }

  function addSet() {
    if (!_state) return;
    var ex = _state.exercises[_state.currentExIdx];
    var last = ex.sets[ex.sets.length - 1] || {};
    ex.sets.push({ weight: last.weight || '', reps: last.reps || '', completed: false });
    renderWorkout();
    Store.saveActiveWorkout(_state);
  }

  function startRestTimer(seconds) {
    if (_timer) clearInterval(_timer);
    _state.restActive = true;
    _state.restRemaining = seconds;
    _state.restTotal = seconds;
    renderWorkout();

    _timer = setInterval(function() {
      if (!_state || !_state.restActive) { clearInterval(_timer); return; }
      _state.restRemaining--;

      // Update display without full re-render
      var disp = document.getElementById('rest-display');
      var bar = document.getElementById('rest-bar');
      if (disp) disp.textContent = Utils.fmtSeconds(_state.restRemaining);
      if (bar) bar.style.width = Math.round((_state.restRemaining / _state.restTotal) * 100) + '%';

      if (_state.restRemaining <= 0) {
        clearInterval(_timer);
        _state.restActive = false;
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        renderWorkout();
      }
    }, 1000);
  }

  function skipRest() {
    if (_timer) clearInterval(_timer);
    if (_state) { _state.restActive = false; _state.restRemaining = 0; }
    renderWorkout();
  }

  function addRestTime(s) {
    if (_state) _state.restRemaining += s;
  }

  function prevEx() {
    if (!_state || _state.currentExIdx <= 0) return;
    _state.currentExIdx--;
    renderWorkout();
  }

  function nextEx() {
    if (!_state || _state.currentExIdx >= _state.exercises.length - 1) return;
    _state.currentExIdx++;
    renderWorkout();
  }

  function goToEx(idx) {
    if (!_state) return;
    _state.currentExIdx = idx;
    renderWorkout();
  }

  function confirmFinish() {
    var completedCount = _state.exercises.reduce(function(a,e){ return a + e.sets.filter(function(s){ return s.completed; }).length; }, 0);
    var html = '<div class="p-6">';
    html += '<h2 class="text-xl font-bold mb-2">Training beenden?</h2>';
    html += '<p class="mb-4" style="color:#94a3b8;">' + completedCount + ' Sätze abgeschlossen · ' + Utils.fmtDuration(_state.elapsedSeconds) + '</p>';
    html += '<div class="flex gap-3">';
    html += '<button class="btn-secondary flex-1 py-2.5" onclick="App.modal.close()">Weiter</button>';
    html += '<button class="btn-primary flex-1 py-2.5" onclick="App.modal.close();WorkoutPage.finish()">Speichern & Beenden</button>';
    html += '</div></div>';
    App.modal.open(html);
  }

  function finish() {
    if (!_state) return;
    if (_timer) clearInterval(_timer);
    if (_sessionTimer) clearInterval(_sessionTimer);

    _state.duration = _state.elapsedSeconds;
    Store.saveWorkoutLog(_state);
    Store.clearActiveWorkout();

    Utils.confetti();
    Utils.toast('Training gespeichert! 💪');

    // Close overlay
    document.getElementById('workout-overlay').classList.remove('active');
    setTimeout(function() {
      document.getElementById('workout-content').innerHTML = '';
      _state = null;
      App.updateSidebarStreak();
      App.router.go('dashboard');
    }, 400);
  }

  function discard() {
    if (_timer) clearInterval(_timer);
    if (_sessionTimer) clearInterval(_sessionTimer);
    Store.clearActiveWorkout();
    document.getElementById('workout-overlay').classList.remove('active');
    setTimeout(function() {
      document.getElementById('workout-content').innerHTML = '';
      _state = null;
    }, 400);
  }

  // Resume workout from storage if crashed
  function resume() {
    var saved = Store.getActiveWorkout();
    if (!saved) return false;
    _state = saved;
    _state.startTime = Date.now() - (_state.elapsedSeconds || 0) * 1000;
    renderWorkout();
    document.getElementById('workout-overlay').classList.add('active');
    _sessionTimer = setInterval(function() {
      _state.elapsedSeconds = Math.round((Date.now() - _state.startTime) / 1000);
      var el = document.getElementById('wo-elapsed');
      if (el) el.textContent = Utils.fmtDuration(_state.elapsedSeconds);
    }, 1000);
    return true;
  }

  return { start, finish, discard, resume, confirmFinish, toggleSet, updateSet, addSet, skipRest, addRestTime, prevEx, nextEx, goToEx };
})();
