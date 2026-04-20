// TrackLift – Shared utilities
var Utils = (function () {

  function fmtDate(dateStr) {
    if (!dateStr) return '–';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtDateShort(dateStr) {
    if (!dateStr) return '–';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }

  function fmtWeight(kg) {
    var s = Store.getSettings();
    if (s.weightUnit === 'lbs') return (kg * 2.2046).toFixed(1) + ' lbs';
    return kg + ' kg';
  }

  function fmtSeconds(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function fmtDuration(seconds) {
    var h = Math.floor(seconds / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return h + 'h ' + m + 'min';
    return m + 'min';
  }

  function calcOneRepMax(weight, reps) {
    if (!weight || !reps || reps <= 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  }

  function calcVolume(sets) {
    return sets.reduce(function(acc, s) {
      if (s.completed) return acc + (s.weight || 0) * (s.reps || 0);
      return acc;
    }, 0);
  }

  // Returns last N unique dates with workout logs
  function getRecentDates(n) {
    var dates = Store.getWorkoutLogs().map(function(l){ return l.date; });
    var unique = [...new Set(dates)].sort().reverse();
    return unique.slice(0, n);
  }

  // Format volume: 12345 -> "12.345 kg"
  function fmtVolume(v) {
    return v.toLocaleString('de-DE') + ' kg';
  }

  // Confetti simple burst
  function confetti(container) {
    var colors = ['#7c3aed','#a78bfa','#10b981','#fbbf24','#ef4444','#60a5fa'];
    for (var i = 0; i < 30; i++) {
      (function(i) {
        setTimeout(function() {
          var el = document.createElement('div');
          el.style.cssText = [
            'position:fixed', 'pointer-events:none', 'z-index:9999',
            'width:8px', 'height:8px', 'border-radius:50%',
            'background:' + colors[Math.floor(Math.random() * colors.length)],
            'left:' + (30 + Math.random() * 40) + '%',
            'top:' + (20 + Math.random() * 30) + '%',
            'transition:all 1.2s ease',
            'opacity:1',
          ].join(';');
          document.body.appendChild(el);
          requestAnimationFrame(function() {
            el.style.transform = 'translate(' + ((Math.random()-0.5)*200) + 'px, ' + (100+Math.random()*200) + 'px) rotate(' + (Math.random()*720) + 'deg)';
            el.style.opacity = '0';
          });
          setTimeout(function(){ el.remove(); }, 1400);
        }, i * 40);
      })(i);
    }
  }

  // Simple toast notification
  function toast(msg, type) {
    type = type || 'success';
    var colors = { success: '#10b981', error: '#ef4444', info: '#7c3aed' };
    var el = document.createElement('div');
    el.style.cssText = [
      'position:fixed', 'bottom:80px', 'left:50%', 'transform:translateX(-50%) translateY(20px)',
      'background:' + (colors[type] || colors.success),
      'color:white', 'padding:10px 20px', 'border-radius:8px',
      'font-size:14px', 'font-weight:600', 'z-index:9999',
      'box-shadow:0 4px 20px rgba(0,0,0,0.4)',
      'transition:all 0.3s ease', 'opacity:0', 'pointer-events:none',
    ].join(';');
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function() {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(function(){ el.remove(); }, 300);
    }, 2500);
  }

  // Trend arrow: compare two numbers
  function trendArrow(current, previous) {
    if (!previous || previous === 0) return '<span class="trend-neutral">–</span>';
    if (current > previous) return '<span class="trend-up">▲ +' + ((current-previous)/previous*100).toFixed(1) + '%</span>';
    if (current < previous) return '<span class="trend-down">▼ ' + ((current-previous)/previous*100).toFixed(1) + '%</span>';
    return '<span class="trend-neutral">= 0%</span>';
  }

  // Get last N weeks of volume data
  function getWeeklyVolumeArray(n) {
    var data = Store.getWeeklyVolume();
    var result = [];
    var today = new Date();
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(today.getDate() - i * 7);
      var day = d.getDay();
      var mon = new Date(d); mon.setDate(d.getDate() - ((day + 6) % 7));
      var wk = mon.toISOString().slice(0, 10);
      result.push({ week: wk, label: fmtDateShort(wk), volume: data[wk] || 0 });
    }
    return result;
  }

  return {
    fmtDate, fmtDateShort, fmtWeight, fmtSeconds, fmtDuration,
    calcOneRepMax, calcVolume, fmtVolume,
    getRecentDates, confetti, toast, trendArrow, getWeeklyVolumeArray,
  };
})();

// Global modal helper
window.App = window.App || {};
App.modal = {
  open: function(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-backdrop').classList.add('active');
  },
  close: function() {
    document.getElementById('modal-backdrop').classList.remove('active');
    document.getElementById('modal-content').innerHTML = '';
  }
};
