// TrackLift – localStorage state management
var Store = (function () {
  var KEYS = {
    customExercises: 'tl_custom_exercises',
    customPlans: 'tl_custom_plans',
    activePlanId: 'tl_active_plan',
    workoutLogs: 'tl_workout_logs',
    bodyMetrics: 'tl_body_metrics',
    settings: 'tl_settings',
    activeWorkout: 'tl_active_workout',
  };

  function get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  }
  function set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.warn('Storage error', e); }
  }

  // ── Custom Exercises ──────────────────────────────────────
  function getCustomExercises() { return get(KEYS.customExercises) || []; }
  function saveCustomExercise(ex) {
    var list = getCustomExercises();
    var idx = list.findIndex(function(e){ return e.id === ex.id; });
    if (idx >= 0) list[idx] = ex; else list.push(ex);
    set(KEYS.customExercises, list);
  }
  function deleteCustomExercise(id) {
    set(KEYS.customExercises, getCustomExercises().filter(function(e){ return e.id !== id; }));
  }

  // ── Custom Plans ──────────────────────────────────────────
  function getCustomPlans() { return get(KEYS.customPlans) || []; }
  function saveCustomPlan(plan) {
    var list = getCustomPlans();
    var idx = list.findIndex(function(p){ return p.id === plan.id; });
    if (idx >= 0) list[idx] = plan; else list.push(plan);
    set(KEYS.customPlans, list);
  }
  function deleteCustomPlan(id) {
    set(KEYS.customPlans, getCustomPlans().filter(function(p){ return p.id !== id; }));
  }

  // ── Active Plan ───────────────────────────────────────────
  function getActivePlanId() { return get(KEYS.activePlanId); }
  function setActivePlanId(id) { set(KEYS.activePlanId, id); }

  // ── Workout Logs ──────────────────────────────────────────
  function getWorkoutLogs() { return get(KEYS.workoutLogs) || []; }
  function saveWorkoutLog(log) {
    var list = getWorkoutLogs();
    var idx = list.findIndex(function(l){ return l.id === log.id; });
    if (idx >= 0) list[idx] = log; else list.push(log);
    set(KEYS.workoutLogs, list);
    return log;
  }
  function deleteWorkoutLog(id) {
    set(KEYS.workoutLogs, getWorkoutLogs().filter(function(l){ return l.id !== id; }));
  }
  function getLogsByExercise(exerciseId) {
    return getWorkoutLogs().flatMap(function(log) {
      return (log.exercises || [])
        .filter(function(ex){ return ex.exerciseId === exerciseId; })
        .map(function(ex){ return { date: log.date, sets: ex.sets, logId: log.id }; });
    }).sort(function(a, b){ return a.date.localeCompare(b.date); });
  }

  // ── Body Metrics ──────────────────────────────────────────
  function getBodyMetrics() { return get(KEYS.bodyMetrics) || []; }
  function saveBodyMetric(metric) {
    var list = getBodyMetrics();
    var idx = list.findIndex(function(m){ return m.id === metric.id; });
    if (idx >= 0) list[idx] = metric; else list.push(metric);
    set(KEYS.bodyMetrics, list);
  }
  function deleteBodyMetric(id) {
    set(KEYS.bodyMetrics, getBodyMetrics().filter(function(m){ return m.id !== id; }));
  }

  // ── Settings ──────────────────────────────────────────────
  function getSettings() {
    return Object.assign({ weightUnit: 'kg', defaultRest: 90, theme: 'dark' }, get(KEYS.settings) || {});
  }
  function saveSetting(key, val) {
    var s = getSettings(); s[key] = val; set(KEYS.settings, s);
  }

  // ── Active Workout (in-progress session) ──────────────────
  function getActiveWorkout() { return get(KEYS.activeWorkout); }
  function saveActiveWorkout(data) { set(KEYS.activeWorkout, data); }
  function clearActiveWorkout() { localStorage.removeItem(KEYS.activeWorkout); }

  // ── Helpers ───────────────────────────────────────────────
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // Workout streak calculation
  function getStreak() {
    var logs = getWorkoutLogs().map(function(l){ return l.date; }).sort();
    if (!logs.length) return 0;
    var unique = [...new Set(logs)];
    var streak = 0;
    var today = new Date(); today.setHours(0,0,0,0);
    var cursor = new Date(today);
    // allow today or yesterday as "start" of streak
    var lastDate = new Date(unique[unique.length - 1]);
    var diff = Math.round((today - lastDate) / 86400000);
    if (diff > 1) return 0;
    for (var i = unique.length - 1; i >= 0; i--) {
      var d = new Date(unique[i]);
      var expected = new Date(cursor); expected.setDate(cursor.getDate() - (streak === 0 ? diff : 1));
      if (Math.round((expected - d) / 86400000) === 0) {
        streak++;
        cursor = d;
      } else break;
    }
    return streak;
  }

  // Volume stats
  function getWeeklyVolume() {
    var logs = getWorkoutLogs();
    var weeks = {};
    logs.forEach(function(log) {
      var d = new Date(log.date);
      // Get Monday of that week
      var day = d.getDay();
      var mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7));
      var wk = mon.toISOString().slice(0, 10);
      var vol = 0;
      (log.exercises || []).forEach(function(ex) {
        (ex.sets || []).forEach(function(s) {
          if (s.completed) vol += (s.weight || 0) * (s.reps || 0);
        });
      });
      weeks[wk] = (weeks[wk] || 0) + vol;
    });
    return weeks;
  }

  function getTotalVolume() {
    var logs = getWorkoutLogs();
    var total = 0;
    logs.forEach(function(log) {
      (log.exercises || []).forEach(function(ex) {
        (ex.sets || []).forEach(function(s) {
          if (s.completed) total += (s.weight || 0) * (s.reps || 0);
        });
      });
    });
    return total;
  }

  // Personal records: { exerciseId -> { weight, reps, date, volume } }
  function getPersonalRecords() {
    var logs = getWorkoutLogs();
    var prs = {};
    logs.forEach(function(log) {
      (log.exercises || []).forEach(function(ex) {
        (ex.sets || []).forEach(function(s) {
          if (!s.completed || !s.weight) return;
          var cur = prs[ex.exerciseId];
          if (!cur || s.weight > cur.weight || (s.weight === cur.weight && s.reps > cur.reps)) {
            prs[ex.exerciseId] = { weight: s.weight, reps: s.reps, date: log.date };
          }
        });
      });
    });
    return prs;
  }

  // ── Export / Import ───────────────────────────────────────
  function exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      customExercises: getCustomExercises(),
      customPlans: getCustomPlans(),
      activePlanId: getActivePlanId(),
      workoutLogs: getWorkoutLogs(),
      bodyMetrics: getBodyMetrics(),
      settings: getSettings(),
    };
  }

  function importData(data, mode) {
    // mode: 'merge' (default) or 'replace'
    if (!data || data.version !== 1) throw new Error('Ungültiges Backup-Format');

    if (mode === 'replace') {
      set(KEYS.customExercises, data.customExercises || []);
      set(KEYS.customPlans, data.customPlans || []);
      set(KEYS.activePlanId, data.activePlanId || null);
      set(KEYS.workoutLogs, data.workoutLogs || []);
      set(KEYS.bodyMetrics, data.bodyMetrics || []);
      set(KEYS.settings, data.settings || {});
      return;
    }

    // Merge: deduplicate by id
    function mergeById(existing, incoming) {
      var map = {};
      existing.forEach(function(x) { map[x.id] = x; });
      incoming.forEach(function(x) { map[x.id] = x; }); // incoming wins on conflict
      return Object.values(map);
    }

    set(KEYS.customExercises, mergeById(getCustomExercises(), data.customExercises || []));
    set(KEYS.customPlans, mergeById(getCustomPlans(), data.customPlans || []));
    set(KEYS.workoutLogs, mergeById(getWorkoutLogs(), data.workoutLogs || []));
    set(KEYS.bodyMetrics, mergeById(getBodyMetrics(), data.bodyMetrics || []));
    if (data.activePlanId) set(KEYS.activePlanId, data.activePlanId);
  }

  return {
    uid, todayStr,
    getCustomExercises, saveCustomExercise, deleteCustomExercise,
    getCustomPlans, saveCustomPlan, deleteCustomPlan,
    getActivePlanId, setActivePlanId,
    getWorkoutLogs, saveWorkoutLog, deleteWorkoutLog, getLogsByExercise,
    getBodyMetrics, saveBodyMetric, deleteBodyMetric,
    getSettings, saveSetting,
    getActiveWorkout, saveActiveWorkout, clearActiveWorkout,
    getStreak, getWeeklyVolume, getTotalVolume, getPersonalRecords,
    exportData, importData,
  };
})();
