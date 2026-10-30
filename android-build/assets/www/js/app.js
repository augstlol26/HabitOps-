// HabitCraft - Main Application Orchestrator & View Controller
document.addEventListener('DOMContentLoaded', () => {
  // ── Onboarding gate ──────────────────────────────────────────────
  if (!window.store.state.onboardingCompleted) {
    initOnboarding();
    return; // Don't init main app until onboarding done
  }

  // Initialize Routing
  bootMainApp();
});

// ==========================================
// VIEW ROUTER & NAVIGATION
// ==========================================
let currentView = 'today';
let previousView = 'today';

function navigateTo(viewId) {
  if (viewId === currentView) return;
  window.audioEngine.playTap();

  previousView = currentView;
  currentView = viewId;

  // Hide all panels
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active-view');
  });

  // Show target panel
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active-view');
  }

  // Update Bottom Nav active state
  document.querySelectorAll('nav[data-nav-container] a').forEach(link => {
    const linkPath = link.getAttribute('data-path');
    const isActive = linkPath === viewId || 
                    (viewId === 'habit-details' && linkPath === 'today') ||
                    (viewId === 'habits-lab' && linkPath === 'habits-lab') ||
                    (viewId === 'weekly-review' && linkPath === 'weekly-review') ||
                    (viewId === 'trophy-vault' && linkPath === 'trophy-vault');
                    
    if (isActive) {
      link.classList.remove('text-on-surface-variant');
      link.classList.add('text-primary-container', 'font-bold');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('text-primary-container', 'font-bold');
      link.classList.add('text-on-surface-variant');
      link.removeAttribute('aria-current');
    }
  });

  // Update Drawer active state
  document.querySelectorAll('#side-drawer nav a').forEach(link => {
    const linkPath = link.getAttribute('data-path');
    if (linkPath === viewId) {
      link.classList.add('bg-surface-container-high', 'text-primary', 'font-bold', 'border-l-4', 'border-l-primary-container');
    } else {
      link.classList.remove('bg-surface-container-high', 'text-primary', 'font-bold', 'border-l-4', 'border-l-primary-container');
    }
  });

  // Close drawer if open
  closeDrawer();

  // Window scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger animations specific to view
  if (viewId === 'weekly-review') {
    triggerWeeklyAnimations();
  } else if (viewId === 'trophy-vault') {
    triggerProfileAnimations();
  }
}

function initNavigation() {
  // Bottom Nav click bindings
  document.querySelectorAll('nav[data-nav-container] a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      if (path) navigateTo(path);
    });
  });

  // Drawer nav bindings
  document.querySelectorAll('#side-drawer nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      if (path) navigateTo(path);
    });
  });
}

// ==========================================
// DRAWER & HEADER CONTROLS
// ==========================================
function openDrawer() {
  window.audioEngine.playTap();
  const drawer = document.getElementById('side-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('-translate-x-full');
    drawer.classList.add('translate-x-0');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    document.body.style.overflow = 'hidden';
  }
}

function closeDrawer() {
  const drawer = document.getElementById('side-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('-translate-x-full');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }
}

function toggleSound() {
  window.audioEngine.toggle();
}

function updateAudioUI(isOn) {
  // Master SFX Toggle in Header
  const sfxBtn = document.getElementById('sfx-toggle-btn');
  const sfxIcon = document.getElementById('sfx-icon');
  const sfxLabel = document.getElementById('sfx-label');
  const sfxBars = document.getElementById('sfx-wave-bars');

  // Drawer Audio
  const drawerIcon = document.getElementById('drawer-sound-icon');
  const drawerStatus = document.getElementById('drawer-sound-status');
  const drawerBtnText = document.getElementById('drawer-sound-btn-text');

  if (isOn) {
    if (sfxIcon) sfxIcon.textContent = 'volume_up';
    if (sfxLabel) sfxLabel.textContent = 'SFX ON';
    if (sfxBars) sfxBars.classList.remove('opacity-20');
    if (sfxBtn) sfxBtn.classList.remove('opacity-60');

    if (drawerIcon) drawerIcon.textContent = 'volume_up';
    if (drawerStatus) drawerStatus.textContent = 'WebAudio Synthesizer Active';
    if (drawerBtnText) drawerBtnText.textContent = 'Mute';
  } else {
    if (sfxIcon) sfxIcon.textContent = 'volume_off';
    if (sfxLabel) sfxLabel.textContent = 'SFX MUTED';
    if (sfxBars) sfxBars.classList.add('opacity-20');
    if (sfxBtn) sfxBtn.classList.add('opacity-60');

    if (drawerIcon) drawerIcon.textContent = 'volume_off';
    if (drawerStatus) drawerStatus.textContent = 'Muted';
    if (drawerBtnText) drawerBtnText.textContent = 'Unmute';
  }
}

function initAppHeaderAndDrawer() {
  const drawerBtn = document.getElementById('drawer-toggle-btn');
  if (drawerBtn) {
    drawerBtn.addEventListener('click', openDrawer);
  }
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeDrawer);
  }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
let toastTimer = null;
function showToast(message, subtitle = "") {
  const toast = document.getElementById('action-toast');
  const msgEl = document.getElementById('toast-message');
  const subEl = document.getElementById('toast-sub');
  if (!toast) return;

  if (msgEl) msgEl.textContent = message;
  if (subEl) {
    if (subtitle) {
      subEl.textContent = subtitle;
      subEl.classList.remove('hidden');
    } else {
      subEl.classList.add('hidden');
    }
  }

  toast.classList.remove('opacity-0', 'pointer-events-none');
  toast.classList.add('opacity-100');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0', 'pointer-events-none');
  }, 3200);
}

// ==========================================
// FLOATING XP PARTICLES
// ==========================================
function spawnFloatingParticle(targetEl, text) {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const particle = document.createElement('div');
  particle.className = 'xp-float-particle bg-inverse-surface text-primary-fixed border border-primary-container px-2 py-0.5 font-label-sm text-label-sm font-bold shadow-md';
  particle.textContent = text;
  particle.style.left = Math.max(16, (rect.right - 100)) + 'px';
  particle.style.top = (rect.top + window.scrollY - 8) + 'px';
  document.body.appendChild(particle);
  setTimeout(() => {
    particle.remove();
  }, 1000);
}

function spawnFloatingBadges(targetContainer, text1 = "+80 XP EARNED", text2 = "CRITICAL STRIKE!") {
  const container = targetContainer || document.getElementById('float-container');
  if (!container) return;

  const floatEl = document.createElement('div');
  floatEl.className = 'flex flex-col items-center gap-1 floating-toast-anim';
  floatEl.innerHTML = `
    <span class="bg-primary-container text-on-surface text-sm font-bold px-3 py-1 uppercase tracking-widest shadow-xl border-2 border-on-surface">
      ${text1}
    </span>
    <span class="bg-secondary text-on-secondary text-xs font-bold px-2 py-0.5 uppercase tracking-wider shadow-lg">
      ${text2}
    </span>
  `;
  container.appendChild(floatEl);
  setTimeout(() => {
    floatEl.remove();
  }, 1400);
}

// ==========================================
// NUMBER COUNTER ROLLUP ANIMATION
// ==========================================
function animateCounter(element, start, end, duration, formatFn) {
  if (!element) return;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.round(start + (end - start) * easedProgress);

    element.textContent = formatFn ? formatFn(currentVal) : currentVal;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatFn ? formatFn(end) : end;
    }
  }

  requestAnimationFrame(update);
}

// ==========================================
// VIEW 1: TODAY'S QUESTS
// ==========================================
function initTodayView() {
  renderQuestList();
}

function renderQuestList() {
  const state = window.store.state;
  const morningContainer = document.getElementById('morning-quests-list');
  const afternoonContainer = document.getElementById('afternoon-quests-list');
  const eveningContainer = document.getElementById('evening-quests-list');

  if (!morningContainer || !afternoonContainer || !eveningContainer) return;

  morningContainer.innerHTML = '';
  afternoonContainer.innerHTML = '';
  eveningContainer.innerHTML = '';

  state.quests.forEach(quest => {
    const card = createQuestElement(quest);
    if (quest.group === 'morning') {
      morningContainer.appendChild(card);
    } else if (quest.group === 'evening') {
      eveningContainer.appendChild(card);
    } else {
      afternoonContainer.appendChild(card);
    }
  });
}

function createQuestElement(quest) {
  const div = document.createElement('div');
  div.id = `quest-card-${quest.id}`;
  div.setAttribute('data-quest-id', quest.id);

  if (quest.id === 'workout') {
    // Deep Workout Special Boss Card
    div.className = "relative bg-surface-container-low p-3.5 flex flex-col space-y-3 border border-surface-container transition-all";
    div.innerHTML = `
      <div class="flex items-start justify-between cursor-pointer" onclick="handleQuestCardClick('${quest.id}')">
        <div class="flex items-start gap-3">
          <div class="checkbox-box w-6 h-6 ${quest.completed ? 'bg-primary-container check-pop-anim' : 'bg-surface-container-lowest'} flex items-center justify-center mt-0.5 transition-all border border-outline-variant/30">
            <span class="material-symbols-outlined text-[16px] ${quest.completed ? 'text-on-primary-container font-bold' : 'text-outline'}">${quest.completed ? 'check' : 'fitness_center'}</span>
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span class="task-title font-headline-sm text-headline-sm text-on-surface ${quest.completed ? 'is-completed' : ''}">${quest.title}</span>
              <span class="bg-secondary-container text-on-secondary px-1.5 py-0.2 font-label-sm text-label-sm uppercase">Boss Hit</span>
            </div>
            <span class="font-body-sm text-body-sm text-outline">${quest.subtext}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-label-sm text-label-sm text-secondary font-bold">+${quest.xp} XP</span>
          <button class="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Inspect Full Protocol" onclick="event.stopPropagation(); openHabitDetails('${quest.id}');">
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex-1 h-10 ${quest.completed ? 'bg-primary-container text-on-primary-container' : 'bg-inverse-surface text-on-secondary hover:bg-primary'} transition-all duration-200 flex items-center justify-center gap-2 uppercase font-label-md text-label-md tracking-wider active:scale-[0.99] tactile-btn" onclick="handleQuestCardClick('${quest.id}')">
          <span class="material-symbols-outlined text-[16px]">${quest.completed ? 'done_all' : 'swords'}</span>
          <span>${quest.completed ? 'Strike Executed (+80 XP)' : 'Check In Strike'}</span>
        </button>
        <button class="h-10 px-3 bg-surface-container-lowest border border-outline-variant/30 text-on-surface hover:bg-surface-container font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1 tactile-btn" onclick="openHabitDetails('${quest.id}')">
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>Details</span>
        </button>
      </div>
    `;
    return div;
  }

  // Regular Quest Card
  div.className = "relative bg-surface-container-low p-3.5 flex items-center justify-between cursor-pointer select-none border border-transparent hover:border-surface-container-high transition-all tactile-btn";
  div.onclick = () => handleQuestCardClick(quest.id);

  div.innerHTML = `
    <div class="flex items-center gap-3 min-w-0">
      <div class="checkbox-box w-6 h-6 ${quest.completed ? 'bg-primary-container check-pop-anim' : 'bg-surface-container-lowest'} flex items-center justify-center transition-all border border-outline-variant/30 shrink-0">
        <span class="material-symbols-outlined text-[18px] ${quest.completed ? 'text-on-primary-container font-bold' : 'text-transparent'}">check</span>
      </div>
      <div class="flex flex-col min-w-0">
        <span class="task-title font-headline-sm text-headline-sm text-on-surface truncate ${quest.completed ? 'is-completed' : ''}">${quest.title}</span>
        <span class="font-body-sm text-body-sm text-outline truncate">${quest.subtext}</span>
      </div>
    </div>
    <div class="flex items-center gap-2 shrink-0 pl-2">
      <div class="bg-surface-container-lowest px-2 py-0.5 border border-outline-variant/20">
        <span class="font-label-sm text-label-sm ${quest.completed ? 'text-primary font-bold' : 'text-outline'}">+${quest.xp} XP</span>
      </div>
    </div>
  `;
  return div;
}

function handleQuestCardClick(questId) {
  const result = window.store.toggleQuest(questId);
  if (!result) return;

  const card = document.getElementById(`quest-card-${questId}`);

  if (result.isCompleted) {
    if (result.quest.isBoss) {
      window.audioEngine.playBossHit(window.store.state.boss.isSlain);
      triggerBossSlashAnimation(15);
      triggerScreenShake();
      spawnFloatingBadges(null, `+${result.quest.xp} XP EARNED`, "BOSS HIT CONFIRMED!");
    } else {
      window.audioEngine.playChime();
      spawnFloatingParticle(card, `+${result.quest.xp} XP`);
      if (window.store.state.boss.currentHp > 0) {
        triggerBossSlashAnimation(5);
      }
    }
  } else {
    window.audioEngine.playMechanicalThud();
  }

  renderQuestList();
}

function triggerBossSlashAnimation(damagePercent) {
  const bossCard = document.getElementById('boss-card');
  const slashLayer = document.getElementById('boss-slash-layer');
  const soundRipple = document.getElementById('boss-sound-ripple');
  const impactTag = document.getElementById('boss-impact-tag');

  if (slashLayer) {
    slashLayer.className = 'slash-flash-active';
  }
  if (bossCard) {
    bossCard.classList.remove('boss-damaged');
    void bossCard.offsetWidth;
    bossCard.classList.add('boss-damaged');
  }
  if (soundRipple) {
    soundRipple.classList.remove('sound-ripple-active');
    void soundRipple.offsetWidth;
    soundRipple.classList.add('sound-ripple-active');
  }
  if (impactTag) {
    impactTag.classList.remove('opacity-0');
    impactTag.classList.add('opacity-100');
    setTimeout(() => {
      impactTag.classList.remove('opacity-100');
      impactTag.classList.add('opacity-0');
    }, 1000);
  }

  setTimeout(() => {
    if (slashLayer) slashLayer.className = '';
    if (bossCard) bossCard.classList.remove('boss-damaged');
  }, 600);
}

function triggerScreenShake() {
  const body = document.body;
  body.classList.remove('screen-shake');
  void body.offsetWidth;
  body.classList.add('screen-shake');
  setTimeout(() => {
    body.classList.remove('screen-shake');
  }, 400);
}

function handleClaimTrophy() {
  const success = window.store.claimTrophyChest();
  if (!success) {
    showToast("Chest already claimed today!", "Streak Bonus Active");
    return;
  }

  window.audioEngine.playTrophyFanfare();
  showToast("Streak Champion Badge Claimed!", "+100 XP Yielded");

  const banner = document.getElementById('trophy-banner');
  if (banner) {
    spawnFloatingBadges(null, "+100 XP CLAIMED", "CHEST UNLOCKED!");
  }
}

// ==========================================
// VIEW 2: HABIT QUEST DETAILS
// ==========================================
function initHabitDetailView() {
  // Bind telemetry toggles
  document.querySelectorAll('[data-telemetry-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-telemetry-toggle');
      toggleTelemetry(targetId);
    });
  });
}

function openHabitDetails(habitId = 'workout') {
  navigateTo('habit-details');
}

function executeStrikeCheckIn() {
  const workoutQuest = window.store.state.quests.find(q => q.id === 'workout');
  if (!workoutQuest) return;

  if (workoutQuest.completed) {
    showToast("Strike already executed today", "Use Revert if needed");
    return;
  }

  // Trigger action
  handleQuestCardClick('workout');
  showToast("Strike Confirmed! +80 XP Credited", "Current Streak: 19");
}

function revertStrikeCheckIn() {
  const workoutQuest = window.store.state.quests.find(q => q.id === 'workout');
  if (!workoutQuest || !workoutQuest.completed) return;

  handleQuestCardClick('workout');
  showToast("Strike Rollback Confirmed", "Current Streak: 18");
}

function toggleTelemetry(telemetryId) {
  window.audioEngine.playTap();
  const el = document.getElementById(telemetryId);
  const arrow = document.getElementById(`arrow-${telemetryId}`);
  if (!el) return;

  if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  } else {
    el.classList.add('hidden');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }
}

// ==========================================
// VIEW 3: WEEKLY REVIEW & REFLECTION
// ==========================================
function initWeeklyReviewView() {
  // Reflection Save
  const saveBtn = document.getElementById('save-reflection-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveFieldReflection);
  }

  // Rating meters
  document.querySelectorAll('[data-rating-group]').forEach(meter => {
    meter.querySelectorAll('span[data-star-idx]').forEach(star => {
      star.addEventListener('click', (e) => {
        const group = meter.getAttribute('data-rating-group');
        const idx = parseInt(star.getAttribute('data-star-idx'), 10);
        setRatingMeter(group, idx + 1);
      });
    });
  });
}

function selectBar(element) {
  window.audioEngine.playTap();
  const day = element.getAttribute('data-day') || '';
  const stats = element.getAttribute('data-stats') || '';
  const extra = element.getAttribute('data-extra') || '';

  const tooltipDay = document.getElementById('tooltip-day');
  const tooltipText = document.getElementById('tooltip-text');
  const tooltipExtra = document.getElementById('tooltip-extra');

  if (tooltipDay) tooltipDay.textContent = day;
  if (tooltipText) tooltipText.textContent = stats;
  if (tooltipExtra) tooltipExtra.textContent = extra;

  document.querySelectorAll('.chart-bar').forEach(b => b.classList.remove('ring-2', 'ring-primary'));
  const currentBar = element.querySelector('.chart-bar');
  if (currentBar) {
    currentBar.classList.add('ring-2', 'ring-primary');
  }
}

function setRatingMeter(group, score) {
  window.audioEngine.playTap();
  const state = window.store.state;
  state.review.ratings[group] = score;
  window.store.save();
  updateRatingsUI();
}

function updateRatingsUI() {
  const ratings = window.store.state.review.ratings;
  ['energy', 'discipline', 'recovery'].forEach(key => {
    const meter = document.querySelector(`[data-rating-group="${key}"]`);
    const valLabel = document.getElementById(`rating-val-${key}`);
    const score = ratings[key] || 4;

    if (valLabel) valLabel.textContent = `${score} / 5`;

    if (meter) {
      meter.querySelectorAll('span[data-star-idx]').forEach((star, idx) => {
        if (idx < score) {
          star.className = "w-2.5 h-2.5 bg-primary-container inline-block cursor-pointer";
        } else {
          star.className = "w-2.5 h-2.5 bg-surface-container-highest inline-block cursor-pointer";
        }
      });
    }
  });
}

function saveFieldReflection() {
  window.audioEngine.playTap();
  const input = document.getElementById('reflection-input');
  if (!input) return;

  window.store.saveReflection(input.value);
  const btn = document.getElementById('save-reflection-btn');
  if (btn) {
    const prev = btn.textContent;
    btn.textContent = 'Saved ✓';
    btn.classList.add('text-primary');
    setTimeout(() => {
      btn.textContent = prev;
    }, 1800);
  }
  showToast("Field Reflection Saved", "Archived to Protocol Ledger");
}

function commitWeeklyBlueprint() {
  window.audioEngine.playTrophyFanfare();
  window.store.commitBlueprint();

  const btn = document.getElementById('commit-btn');
  if (!btn) return;

  btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span><span>Week 43 Blueprint Locked & Loaded</span>';
  btn.classList.add('bg-primary-container', 'text-on-primary-container');
  showToast("Week 43 Target Locked", "Upcoming: Distraction Drake (LVL 15)");

  setTimeout(() => {
    btn.classList.remove('bg-primary-container', 'text-on-primary-container');
    btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">verified</span><span>Commit to Week 43 Blueprint</span>';
  }, 3500);
}

function triggerWeeklyAnimations() {
  const duration = 1000;

  // Rate rollup
  const rateEl = document.getElementById('stat-rate');
  if (rateEl) animateCounter(rateEl, 0, window.store.state.review.rate, duration, v => v + '%');

  // Streak rollup
  const streakEl = document.getElementById('stat-streak-review');
  if (streakEl) streakEl.textContent = window.store.state.review.streakFraction;

  // Gains rollup
  const gainsEl = document.getElementById('stat-gains');
  if (gainsEl) animateCounter(gainsEl, 0, window.store.state.review.xpGained, duration, v => '+' + v);

  // Bars sweep
  const bars = document.querySelectorAll('.chart-bar');
  bars.forEach((bar, index) => {
    const targetHeight = bar.getAttribute('data-target-height') || '0%';
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.height = targetHeight;
    }, 100 + index * 70);
  });

  // Matrix bars
  const matrixCounters = document.querySelectorAll('.matrix-counter');
  matrixCounters.forEach(counter => {
    const targetVal = parseInt(counter.getAttribute('data-target') || '0', 10);
    animateCounter(counter, 0, targetVal, duration, v => v + '% Hit');
  });

  const matrixBars = document.querySelectorAll('.matrix-bar');
  matrixBars.forEach((bar, index) => {
    const targetWidth = bar.getAttribute('data-width') || '0%';
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 200 + index * 90);
  });
}

// ==========================================
// VIEW 4: HABITS LAB
// ==========================================
function initHabitsLabView() {
  renderHabitsLabGrid();

  // Filter tabs
  document.querySelectorAll('[data-lab-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      window.audioEngine.playTap();
      document.querySelectorAll('[data-lab-filter]').forEach(b => {
        b.classList.remove('bg-inverse-surface', 'text-on-secondary');
        b.classList.add('bg-surface-container-high', 'text-on-surface-variant');
      });
      btn.classList.add('bg-inverse-surface', 'text-on-secondary');
      btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant');

      const filter = btn.getAttribute('data-lab-filter');
      renderHabitsLabGrid(filter);
    });
  });
}

function renderHabitsLabGrid(filter = 'all') {
  const container = document.getElementById('habits-lab-grid');
  if (!container) return;

  const quests = window.store.state.quests;
  const filtered = filter === 'all' ? quests : quests.filter(q => q.group === filter);

  container.innerHTML = '';

  filtered.forEach(quest => {
    const card = document.createElement('div');
    card.className = "bg-surface-container-lowest p-space-md border border-outline-variant/30 flex flex-col justify-between shadow-sm relative";
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-space-sm">
          <div class="w-10 h-10 ${quest.isBoss ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'} flex items-center justify-center font-bold">
            <span class="material-symbols-outlined text-[20px]">${quest.icon || 'bolt'}</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm uppercase font-bold text-outline">${quest.group} Protocol</span>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">${quest.title}</h4>
          </div>
        </div>
        <span class="font-label-sm text-label-sm px-2 py-0.5 ${quest.isBoss ? 'bg-secondary-container text-on-secondary' : 'bg-surface-container-high text-on-surface'} font-bold uppercase tracking-wider">
          +${quest.xp} XP
        </span>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant mt-2">${quest.subtext}</p>
      <div class="flex items-center justify-between mt-3 pt-2 border-t border-surface-container text-xs">
        <span class="font-label-sm text-label-sm text-outline">${quest.completed ? 'Status: Active ✓' : 'Status: Ready'}</span>
        <div class="flex items-center gap-2">
          ${quest.id === 'workout' ? `
            <button class="text-primary font-bold uppercase hover:underline" onclick="openHabitDetails('${quest.id}')">View Details</button>
          ` : `
            <button class="text-secondary font-bold uppercase hover:underline" onclick="deleteCustomHabit('${quest.id}')">Remove</button>
          `}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function deleteCustomHabit(id) {
  window.audioEngine.playMechanicalThud();
  window.store.deleteHabit(id);
  renderHabitsLabGrid();
  renderQuestList();
  showToast("Habit Protocol Decommissioned");
}

// ==========================================
// VIEW 5: PROFILE & TROPHY VAULT
// ==========================================
function initProfileView() {
  // Live Countdown Timer for Morning Multiplier
  startBuffCountdown();
}

function startBuffCountdown() {
  const timerEl = document.getElementById('countdown-timer');
  if (!timerEl) return;

  let secondsRemaining = 4 * 3600 + 11 * 60 + 42; // 04:11:42

  setInterval(() => {
    secondsRemaining = Math.max(0, secondsRemaining - 1);
    const hrs = String(Math.floor(secondsRemaining / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsRemaining % 60).padStart(2, '0');
    timerEl.textContent = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

function triggerProfileAnimations() {
  const duration = 1100;
  const state = window.store.state;

  // Stat Counters Count-Up
  const streakEl = document.getElementById('stat-streak');
  if (streakEl) animateCounter(streakEl, 0, state.user.streak, duration, v => v + 'd');

  const accuracyEl = document.getElementById('stat-accuracy');
  if (accuracyEl) animateCounter(accuracyEl, 0, state.user.accuracy, duration, v => v + '%');

  const logsEl = document.getElementById('stat-logs');
  if (logsEl) animateCounter(logsEl, 0, state.user.questsCleared, duration, v => v);

  const bossesEl = document.getElementById('stat-bosses');
  if (bossesEl) animateCounter(bossesEl, 0, state.user.bossesSlain, duration, v => v);

  // Striped XP Bar
  const xpBar = document.getElementById('hero-xp-bar');
  const xpLabel = document.getElementById('xp-counter-label');
  if (xpBar) {
    const pct = Math.min(100, Math.round((state.user.currentXp / state.user.maxXp) * 100));
    xpBar.style.width = '0%';
    setTimeout(() => {
      xpBar.style.width = pct + '%';
    }, 150);

    if (xpLabel) {
      animateCounter(xpLabel, 0, state.user.currentXp, duration, v => {
        const p = Math.round((v / state.user.maxXp) * 100);
        return `${v} / ${state.user.maxXp} XP (${p}%)`;
      });
    }
  }

  // Locked Trophy Progress Bars
  setTimeout(() => {
    const p1 = document.getElementById('trophy-prog-1');
    const p2 = document.getElementById('trophy-prog-2');
    if (p1) p1.style.width = '60%';
    if (p2) p2.style.width = '64%';
  }, 200);
}

function toggleBuff(cardId, name, desc, status, isBoss = false) {
  const card = document.getElementById(cardId);
  const detail = document.getElementById(`${cardId}-detail`);
  if (!card || !detail) return;

  const isExpanded = !detail.classList.contains('hidden');

  // Collapse others
  ['buff-card-1', 'buff-card-2', 'buff-card-3'].forEach(id => {
    const c = document.getElementById(id);
    const d = document.getElementById(`${id}-detail`);
    if (c && d) {
      c.classList.remove('buff-selected');
      d.classList.add('hidden');
    }
  });

  if (!isExpanded) {
    if (isBoss) {
      window.audioEngine.playBossHorn();
    } else {
      window.audioEngine.playTap();
    }
    card.classList.add('buff-selected');
    detail.classList.remove('hidden');
    detail.classList.add('flex');
    showToast(`Buff Inspected: ${name}`, status);
  } else {
    window.audioEngine.playTap();
  }
}

function openTrophyCard(cardElement, trophyId) {
  const trophy = window.store.state.trophies.find(t => t.id === trophyId) || {
    id: trophyId,
    title: "Procrastination Titan Slayer",
    status: "UNLOCKED",
    date: "Oct 18, 2024",
    reward: "+350 XP",
    desc: "Crushed 7-day high-difficulty backlog without a single deferral.",
    icon: "skull",
    iconColor: "#8c5000",
    iconBg: "#ffdcbf",
    isUnlocked: true,
    isBoss: true
  };

  if (cardElement) {
    cardElement.classList.add('trophy-sound-flash');
    setTimeout(() => cardElement.classList.remove('trophy-sound-flash'), 1200);
  }

  if (trophy.isUnlocked) {
    if (trophy.isBoss) {
      window.activeModalAudioType = 'boss';
      window.audioEngine.playBossHorn();
    } else {
      window.activeModalAudioType = 'fanfare';
      window.audioEngine.playTrophyFanfare();
    }
  } else {
    window.activeModalAudioType = 'thud';
    window.audioEngine.playMechanicalThud();
  }

  openTrophyModal(trophy);
}

// ==========================================
// MODALS LOGIC
// ==========================================
function initModals() {
  // Protocol Modal Save
  const saveProtoBtn = document.getElementById('save-protocol-btn');
  if (saveProtoBtn) {
    saveProtoBtn.addEventListener('click', () => {
      window.audioEngine.playTap();
      const cad = document.getElementById('input-cadence').value;
      const tar = document.getElementById('input-target').value;
      const cue = document.getElementById('input-cue').value;
      window.store.updateWorkoutProtocol(cad, tar, cue);
      toggleProtocolModal(false);
      showToast("Protocol Parameters Updated", "Synchronized to Strike Engine");
    });
  }

  // Add Habit Modal Save
  const saveHabitBtn = document.getElementById('save-habit-btn');
  if (saveHabitBtn) {
    saveHabitBtn.addEventListener('click', () => {
      window.audioEngine.playTap();
      const title = document.getElementById('input-habit-title').value.trim();
      const group = document.getElementById('input-habit-group').value;
      const xp = document.getElementById('input-habit-xp').value;
      const subtext = document.getElementById('input-habit-subtext').value.trim();
      const isBoss = document.getElementById('input-habit-boss').checked;

      if (!title) {
        showToast("Please enter a protocol title");
        return;
      }

      window.store.addCustomHabit({ title, group, xp, subtext, isBoss });
      toggleAddHabitModal(false);
      renderHabitsLabGrid();
      renderQuestList();
      showToast("New Quest Protocol Commissioned", `+${xp} XP Active`);
    });
  }

  // Log Notes Modal Save
  const saveNoteBtn = document.getElementById('save-note-btn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      window.audioEngine.playTap();
      const note = document.getElementById('input-session-note').value.trim();
      toggleLogNoteModal(false);
      showToast("Session Telemetry Note Logged", "Oct 18 Encounter");
    });
  }
}

function toggleProtocolModal(show) {
  window.audioEngine.playTap();
  const modal = document.getElementById('protocol-modal');
  if (!modal) return;
  if (show) {
    const proto = window.store.state.workoutProtocol;
    document.getElementById('input-cadence').value = proto.cadence;
    document.getElementById('input-target').value = proto.target;
    document.getElementById('input-cue').value = proto.cue;
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function toggleLogNoteModal(show) {
  window.audioEngine.playTap();
  const modal = document.getElementById('note-modal');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function toggleAddHabitModal(show) {
  window.audioEngine.playTap();
  const modal = document.getElementById('add-habit-modal');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function openTrophyModal(trophy) {
  const modal = document.getElementById('trophy-modal');
  const box = document.getElementById('trophy-modal-box');
  const titleEl = document.getElementById('modal-title');
  const statusBadge = document.getElementById('modal-status-badge');
  const metricEl = document.getElementById('modal-metric');
  const rewardEl = document.getElementById('modal-reward');
  const descEl = document.getElementById('modal-desc');
  const iconEl = document.getElementById('modal-icon');
  const iconBgEl = document.getElementById('modal-icon-bg');
  const burstEl = document.getElementById('modal-burst');

  if (!modal) return;

  if (titleEl) titleEl.textContent = trophy.title;
  if (statusBadge) statusBadge.textContent = trophy.status;
  if (metricEl) metricEl.textContent = trophy.date;
  if (rewardEl) rewardEl.textContent = trophy.reward;
  if (descEl) descEl.textContent = trophy.desc;
  if (iconEl) iconEl.textContent = trophy.icon;
  if (iconBgEl) iconBgEl.style.backgroundColor = trophy.iconBg;
  if (iconEl) iconEl.style.color = trophy.iconColor;

  if (burstEl) {
    if (trophy.isUnlocked) {
      burstEl.classList.remove('hidden');
      burstEl.classList.add('flex');
    } else {
      burstEl.classList.add('hidden');
      burstEl.classList.remove('flex');
    }
  }

  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100');
  if (box) box.classList.remove('scale-95');
}

function closeTrophyModal() {
  const modal = document.getElementById('trophy-modal');
  const box = document.getElementById('trophy-modal-box');
  if (modal) {
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0', 'pointer-events-none');
  }
  if (box) box.classList.add('scale-95');
}

function replayModalAudio() {
  if (window.activeModalAudioType === 'boss') {
    window.audioEngine.playBossHorn();
    showToast('Boss Defeat Warhorn Replayed');
  } else if (window.activeModalAudioType === 'fanfare') {
    window.audioEngine.playTrophyFanfare();
    showToast('Trophy Fanfare Replayed');
  } else {
    window.audioEngine.playMechanicalThud();
  }
}

// ==========================================
// EXPORT DATA (CSV & JSON)
// ==========================================
function exportUserData(format = 'json') {
  window.audioEngine.playTap();
  const state = window.store.state;
  let dataStr = "";
  let filename = "";

  if (format === 'json') {
    dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    filename = `HabitCraft_Telemetry_${Date.now()}.json`;
  } else {
    // Generate CSV for quests
    let csv = "ID,Title,Group,XP,Completed,IsBoss\n";
    state.quests.forEach(q => {
      csv += `"${q.id}","${q.title}","${q.group}",${q.xp},${q.completed},${q.isBoss || false}\n`;
    });
    dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    filename = `HabitCraft_Quests_${Date.now()}.csv`;
  }

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Exported Telemetry Data (${format.toUpperCase()})`);
}

// ==========================================
// CENTRAL STATE SYNC ACROSS ALL SCREENS
// ==========================================
function syncAllViews(state) {
  // 1. Header user rank & level badges
  document.querySelectorAll('[data-bind-level]').forEach(el => {
    el.textContent = `LVL ${state.user.level}`;
  });

  // 2. XP Bars & Labels
  const heroXpLabel = document.getElementById('hero-xp-label');
  const heroXpBar = document.getElementById('hero-xp-bar-today');
  if (heroXpLabel) heroXpLabel.textContent = `${state.user.currentXp} / ${state.user.maxXp} XP`;
  if (heroXpBar) {
    const pct = Math.min(100, Math.round((state.user.currentXp / state.user.maxXp) * 100));
    heroXpBar.style.width = `${pct}%`;
  }

  // 3. Boss Encounter Status
  const bossNameEl = document.getElementById('today-boss-name');
  if (bossNameEl && state.boss.name) bossNameEl.textContent = state.boss.name;
  const bossHpBar = document.getElementById('boss-hp-bar');
  const bossSubtext = document.getElementById('boss-subtext');
  if (bossHpBar) bossHpBar.style.width = `${state.boss.currentHp}%`;
  if (bossSubtext) {
    if (state.boss.currentHp === 0) {
      bossSubtext.textContent = 'TITAN SLAIN! +150 Bonus XP Claimed';
      bossSubtext.className = 'font-body-sm text-body-sm text-primary-container font-bold truncate';
    } else {
      bossSubtext.textContent = `${state.boss.currentHp}% HP remaining — ${Math.ceil(state.boss.currentHp / 8)} habits to strike!`;
    }
  }

  // 3b. User Callsign Sync
  const callsign = state.user.name || state.onboardingData?.callsign;
  if (callsign) {
    document.querySelectorAll('[data-bind-username]').forEach(el => {
      el.textContent = callsign;
    });
  }

  // 4. Quick Stat Summary in Today
  const completedCount = state.quests.filter(q => q.completed).length;
  const summaryCount = document.getElementById('summary-quest-count');
  if (summaryCount) summaryCount.textContent = `${completedCount} / ${state.quests.length}`;

  const completedXp = state.quests.filter(q => q.completed).reduce((sum, q) => sum + q.xp, 0);
  const summaryXp = document.getElementById('summary-xp-gained');
  if (summaryXp) summaryXp.textContent = `+${completedXp} XP`;

  const morningCount = state.quests.filter(q => q.group === 'morning' && q.completed).length;
  const morningTotal = state.quests.filter(q => q.group === 'morning').length;
  const morningStatus = document.getElementById('morning-status-text');
  if (morningStatus) morningStatus.textContent = `${morningCount}/${morningTotal} Complete`;

  const eveningCount = state.quests.filter(q => q.group === 'evening' && q.completed).length;
  const eveningTotal = state.quests.filter(q => q.group === 'evening').length;
  const eveningStatus = document.getElementById('evening-status-text');
  if (eveningStatus) {
    eveningStatus.textContent = eveningCount === eveningTotal ? `${eveningCount}/${eveningTotal} Complete` : `${eveningCount}/${eveningTotal} Pending`;
  }

  // 5. Workout Protocol Sync in Habit Detail
  const proto = state.workoutProtocol;
  const workoutQuest = state.quests.find(q => q.id === 'workout');
  const isWorkoutDone = workoutQuest ? workoutQuest.completed : false;

  const protoCadence = document.getElementById('proto-cadence-val');
  const protoTarget = document.getElementById('proto-target-val');
  const protoCue = document.getElementById('proto-cue-val');
  if (protoCadence) protoCadence.textContent = proto.cadence;
  if (protoTarget) protoTarget.textContent = proto.target;
  if (protoCue) protoCue.textContent = proto.cue;

  const totalSessionsLabel = document.getElementById('total-sessions-label');
  const timeInvestedLabel = document.getElementById('time-invested-label');
  if (totalSessionsLabel) totalSessionsLabel.textContent = `${proto.totalSessions} Logged`;
  if (timeInvestedLabel) timeInvestedLabel.textContent = `${proto.timeInvested.toFixed(1)} hrs`;

  const tierProgressFill = document.getElementById('quest-progress-fill');
  const tierXpLabel = document.getElementById('xp-fraction-label');
  const tierXpLeft = document.getElementById('xp-left-label');
  if (tierProgressFill) {
    const tierPct = Math.min(100, Math.round((proto.tierXp / proto.tierMaxXp) * 100));
    tierProgressFill.style.width = `${tierPct}%`;
  }
  if (tierXpLabel) tierXpLabel.textContent = `${proto.tierXp} / ${proto.tierMaxXp} XP`;
  if (tierXpLeft) tierXpLeft.textContent = `${proto.tierMaxXp - proto.tierXp} XP Left`;

  // Workout Button state
  const checkinBtn = document.getElementById('checkin-btn');
  const checkinIcon = document.getElementById('checkin-icon');
  const checkinText = document.getElementById('checkin-text');
  const undoCont = document.getElementById('undo-container');
  const todayBox = document.getElementById('strike-box-today');
  const todayIcon = document.getElementById('strike-icon-today');
  const todayBadge = document.getElementById('badge-status-today');
  const todaySub = document.getElementById('strike-subtext-today');

  if (isWorkoutDone) {
    if (checkinBtn) checkinBtn.className = "w-full min-h-[52px] bg-primary-container text-on-surface flex items-center justify-center gap-space-sm transition-all uppercase tracking-wider font-label-lg text-label-lg shadow-sm border border-primary-container cursor-default";
    if (checkinIcon) checkinIcon.textContent = "done_all";
    if (checkinText) checkinText.textContent = "STRIKE LOGGED ✓";
    if (undoCont) undoCont.classList.remove('hidden');

    if (todayBox) todayBox.className = "w-6 h-6 bg-primary-container flex items-center justify-center text-on-surface shrink-0 border border-primary-container";
    if (todayIcon) todayIcon.textContent = "check";
    if (todayIcon) todayIcon.className = "material-symbols-outlined text-[16px] text-on-surface font-bold";
    if (todayBadge) {
      todayBadge.className = "bg-primary-container/30 text-primary font-label-sm text-label-sm px-1.5 py-0.2 uppercase font-bold";
      todayBadge.textContent = "COMPLETED";
    }
    if (todaySub) todaySub.textContent = "Executed on schedule (45m • RPE 8.5)";
  } else {
    if (checkinBtn) checkinBtn.className = "w-full min-h-[52px] bg-inverse-surface text-inverse-on-surface hover:bg-primary-container hover:text-on-surface active:scale-[0.98] flex items-center justify-center gap-space-sm transition-all uppercase tracking-wider font-label-lg text-label-lg shadow-md cursor-pointer border border-transparent";
    if (checkinIcon) checkinIcon.textContent = "bolt";
    if (checkinText) checkinText.textContent = "Check In Strike (+80 XP)";
    if (undoCont) undoCont.classList.add('hidden');

    if (todayBox) todayBox.className = "w-6 h-6 bg-surface-container-lowest flex items-center justify-center shrink-0 border border-outline-variant/40 hover:border-primary-container transition-colors";
    if (todayIcon) todayIcon.textContent = "hourglass_empty";
    if (todayIcon) todayIcon.className = "material-symbols-outlined text-[16px] text-on-surface-variant";
    if (todayBadge) {
      todayBadge.className = "bg-tertiary-container/30 text-tertiary font-label-sm text-label-sm px-1.5 py-0.2 uppercase font-bold";
      todayBadge.textContent = "Pending";
    }
    if (todaySub) todaySub.textContent = "Awaiting Execution Encounter";
  }

  // 6. Trophy Chest status in Today
  const trophyBtn = document.getElementById('trophy-claim-btn');
  const trophyLabel = document.getElementById('trophy-btn-label');
  const trophyIcon = document.getElementById('trophy-icon');
  const trophyDesc = document.getElementById('trophy-desc');
  if (state.trophyClaimed) {
    if (trophyBtn) {
      trophyBtn.className = 'h-8 px-3 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1 shadow-sm';
    }
    if (trophyLabel) trophyLabel.textContent = 'Unlocked';
    if (trophyIcon) {
      trophyIcon.textContent = 'workspace_premium';
      trophyIcon.className = 'material-symbols-outlined text-[22px] text-primary-container';
    }
    if (trophyDesc) trophyDesc.textContent = 'Streak Champion Badge Claimed (+100 XP)';
  }

  // 7. Ratings in review
  updateRatingsUI();
}

function triggerStaggeredLoadAnimations() {
  const heroXpBar = document.getElementById('hero-xp-bar-today');
  if (heroXpBar) {
    const pct = Math.min(100, Math.round((window.store.state.user.currentXp / window.store.state.user.maxXp) * 100));
    heroXpBar.style.width = `${pct}%`;
  }
}

// ============================================================
// BOOT MAIN APP (called after onboarding or on return visits)
// ============================================================
let mainAppBooted = false;

function bootMainApp() {
  if (!mainAppBooted) {
    mainAppBooted = true;
    initNavigation();
    initAppHeaderAndDrawer();
    initTodayView();
    initHabitDetailView();
    initWeeklyReviewView();
    initHabitsLabView();
    initProfileView();
    initModals();

    window.store.subscribe(syncAllViews);
    window.audioEngine.subscribe(updateAudioUI);
  } else {
    renderQuestList();
    renderHabitsLabGrid();
    syncAllViews(window.store.state);
  }

  // Sync callsign into all bound elements if available
  const callsign = window.store.state.user.name || window.store.state.onboardingData?.callsign;
  if (callsign) {
    document.querySelectorAll('[data-bind-username]').forEach(el => {
      el.textContent = callsign;
    });
  }

  setTimeout(() => { triggerStaggeredLoadAnimations(); }, 200);
}

// ============================================================
// ONBOARDING CONTROLLER
// ============================================================
const OB = {
  step: 1,
  totalSteps: 6,
  data: {
    callsign: '',
    struggles: [],
    targets: [],
    intensity: 'operative'
  }
};

function initOnboarding() {
  const el = document.getElementById('view-onboarding');
  if (!el) return;
  el.style.cssText = ''; // clear display:none!important
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.opacity = '1';

  // Hide header + nav while onboarding
  const header = document.querySelector('header');
  const nav = document.querySelector('nav.fixed');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';

  // Pre-select operative as default intensity
  const opTile = document.querySelector('.ob-intensity-tile[data-value="operative"]');
  if (opTile) opTile.classList.add('ob-selected');

  // Reset deploy button state in case re-opened
  const deployBtn = document.getElementById('ob-deploy-btn');
  if (deployBtn) {
    deployBtn.disabled = false;
    deployBtn.innerHTML = '<span class="material-symbols-outlined text-[22px]" style="font-variation-settings:\'FILL\' 1">rocket_launch</span> Deploy Protocol';
  }

  obShowStep(1);
}

function obShowStep(n) {
  OB.step = n;
  const steps = document.querySelectorAll('.ob-step');
  steps.forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('hidden', sn !== n);
    if (sn === n) s.classList.add('ob-step-enter');
  });
  // Update progress bar
  const bar = document.getElementById('ob-progress-bar');
  if (bar) bar.style.width = `${Math.round(((n - 1) / (OB.totalSteps - 1)) * 100)}%`;

  // Scroll onboarding view to top
  const ob = document.getElementById('view-onboarding');
  if (ob) ob.scrollTop = 0;
}

function obNext(fromStep) {
  try {
    window.audioEngine && window.audioEngine.playTap();
  } catch (e) {}

  if (fromStep === 1) {
    // From Welcome Note screen -> go to Step 2 (Callsign)
    obShowStep(2);
    setTimeout(() => {
      const nameInput = document.getElementById('ob-callsign');
      if (nameInput) nameInput.focus();
    }, 250);
    return;
  }
  if (fromStep === 2) {
    const nameInput = document.getElementById('ob-callsign');
    OB.data.callsign = nameInput ? nameInput.value.trim() : '';
    if (!OB.data.callsign) {
      if (nameInput) {
        nameInput.focus();
        nameInput.style.borderColor = '#ba1a1a';
      }
      return;
    }
    if (nameInput) nameInput.style.borderColor = '';
  }
  if (fromStep === 3 && OB.data.struggles.length === 0) {
    // Allow skip — just warn briefly
    const grid = document.getElementById('ob-struggles-grid');
    if (grid) { grid.style.outline = '2px solid #ba1a1a'; setTimeout(() => grid.style.outline = '', 1200); }
    // Don't block — allow continue
  }
  if (fromStep === 5) {
    // Render boss card before showing step 6
    obRenderBossCard();
  }
  obShowStep(fromStep + 1);
}

function obBack(fromStep) {
  try {
    window.audioEngine && window.audioEngine.playTap();
  } catch (e) {}
  if (fromStep <= 1) return;
  obShowStep(fromStep - 1);
}

function obToggleStruggle(btn) {
  const val = btn.dataset.value;
  if (btn.classList.contains('ob-selected')) {
    btn.classList.remove('ob-selected');
    OB.data.struggles = OB.data.struggles.filter(s => s !== val);
  } else {
    btn.classList.add('ob-selected');
    OB.data.struggles.push(val);
  }
  window.audioEngine && window.audioEngine.playTap();
}

function obToggleTarget(btn) {
  const val = btn.dataset.value;
  if (btn.classList.contains('ob-selected')) {
    btn.classList.remove('ob-selected');
    OB.data.targets = OB.data.targets.filter(t => t !== val);
  } else {
    btn.classList.add('ob-selected');
    OB.data.targets.push(val);
  }
  window.audioEngine && window.audioEngine.playTap();
}

function obSelectIntensity(btn, val) {
  document.querySelectorAll('.ob-intensity-tile').forEach(t => t.classList.remove('ob-selected'));
  btn.classList.add('ob-selected');
  OB.data.intensity = val;
  window.audioEngine && window.audioEngine.playTap();
}

function obRenderBossCard() {
  const bossMap = {
    doomscrolling:  { name: 'The Feed Phantom',     desc: 'Spawned from infinite scroll. Feeds on your attention.' },
    procrastination:{ name: 'The Delay Daemon',      desc: 'Thrives in the gap between intention and action.' },
    poor_sleep:     { name: 'The Sleep Saboteur',    desc: 'Drains your energy before the day begins.' },
    inconsistency:  { name: 'The Streak Slayer',     desc: 'Breaks your momentum every time you build it.' },
    low_motivation: { name: 'The Void Entity',       desc: 'Makes everything feel pointless and far away.' },
    focus:          { name: 'The Scatter Mind',      desc: 'Fragments your concentration into a thousand pieces.' },
    stress:         { name: 'The Overwhelm Titan',   desc: 'Multiplies every problem until you freeze.' },
    sedentary:      { name: 'The Inertia Behemoth',  desc: 'Gets heavier the longer you stay still.' }
  };

  const primaryStruggle = OB.data.struggles[0] || null;
  const bossEntry = primaryStruggle
    ? (bossMap[primaryStruggle] || { name: 'The Resistance', desc: 'An ancient enemy of progress.' })
    : { name: 'The Procrastination Titan', desc: 'Master of delay, enemy of all discipline.' };

  const nameEl = document.getElementById('ob-boss-name');
  const descEl = document.getElementById('ob-boss-desc');
  if (nameEl) nameEl.textContent = bossEntry.name;
  if (descEl) descEl.textContent = bossEntry.desc;

  // Intensity-flavoured summary
  const intensityLabel = { recruit: 'Recruit Mode — steady pace', operative: 'Operative Mode — standard load', striker: 'Striker Mode — maximum output, 1.5× XP' };
  const summaryEl = document.getElementById('ob-summary-text');
  const targetLabels = OB.data.targets.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ') || 'your chosen protocols';
  if (summaryEl) {
    summaryEl.textContent = `${intensityLabel[OB.data.intensity] || 'Standard load'}. Your quests will focus on: ${targetLabels}. Defeat ${bossEntry.name} before the week ends for bonus XP.`;
  }
}

function obDeploy() {
  const deployBtn = document.getElementById('ob-deploy-btn');
  if (deployBtn) {
    deployBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Deploying Protocol…</span>';
    deployBtn.disabled = true;
  }

  // Save to store safely
  try {
    window.store.completeOnboarding(OB.data);
  } catch (err) {
    console.warn('Store onboarding save warning:', err);
  }

  // Brief fanfare then reveal app (guarded so audio never blocks deploy)
  try {
    if (window.audioEngine) {
      if (typeof window.audioEngine.playTrophyFanfare === 'function') {
        window.audioEngine.playTrophyFanfare();
      } else if (typeof window.audioEngine.playFanfare === 'function') {
        window.audioEngine.playFanfare();
      }
    }
  } catch (err) {
    console.warn('Audio fanfare skipped:', err);
  }

  // Animate progress bar to 100%
  const bar = document.getElementById('ob-progress-bar');
  if (bar) bar.style.width = '100%';

  setTimeout(() => {
    const ob = document.getElementById('view-onboarding');
    if (ob) {
      ob.style.transition = 'opacity 0.35s ease-out';
      ob.style.opacity = '0';
      setTimeout(() => {
        ob.style.display = 'none';

        // Show header + nav
        const header = document.querySelector('header');
        const nav = document.querySelector('nav.fixed');
        if (header) header.style.display = '';
        if (nav) nav.style.display = '';

        try {
          bootMainApp();
          showToast(`Welcome, ${OB.data.callsign || 'Operative'}!`, 'All Tactical Protocols Online');
        } catch (bootErr) {
          console.error('Boot error:', bootErr);
        }
      }, 360);
    }
  }, 550);
}

function replayOnboardingFlow() {
  closeDrawer();
  initOnboarding();
}
