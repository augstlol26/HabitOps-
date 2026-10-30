// HabitOps v2.0 - Main Application Orchestrator & Tactical View Controller
document.addEventListener('DOMContentLoaded', () => {
  // Detect if running inside installed Android APK or standalone PWA
  detectStandaloneOrApkEnvironment();

  // Apply saved HUD Color Theme & Night Ops mode immediately
  applySavedThemeAndMode();

  // Onboarding gate
  if (!window.store.state.onboardingCompleted) {
    initOnboarding();
    return;
  }

  bootMainApp();
});

// ==========================================
// APK / STANDALONE ENVIRONMENT DETECTION
// ==========================================
function detectStandaloneOrApkEnvironment() {
  const ua = navigator.userAgent || '';
  const urlParams = new URLSearchParams(window.location.search);
  const isAndroidWebView = /wv|Android.*Version\/[0-9.]+/i.test(ua) || window.HABITOPS_NATIVE_APK === true;
  const isStandalonePwa = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isApkParam = urlParams.get('env') === 'apk';

  if (isAndroidWebView || isStandalonePwa || isApkParam) {
    document.body.classList.add('is-native-apk');
    document.querySelectorAll('.apk-download-only').forEach(el => {
      el.style.display = 'none';
    });
  }
}

// ==========================================
// VIEW ROUTER & NAVIGATION
// ==========================================
let currentView = 'today';
let previousView = 'today';

function navigateTo(viewId) {
  if (viewId === currentView) {
    closeDrawer();
    return;
  }
  window.audioEngine.playTap();

  previousView = currentView;
  currentView = viewId;

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active-view');
  });

  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active-view');
  }

  // Update Bottom Nav active state
  document.querySelectorAll('nav[data-nav-container] a').forEach(link => {
    const linkPath = link.getAttribute('data-path');
    const isActive =
      linkPath === viewId ||
      (viewId === 'habit-details' && linkPath === 'today');

    if (isActive) {
      link.classList.remove('text-on-surface-variant');
      link.classList.add('text-primary', 'font-bold');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('text-primary', 'font-bold');
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

  closeDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewId === 'weekly-review') {
    triggerWeeklyAnimations();
  } else if (viewId === 'trophy-vault') {
    renderProfileMultipliers();
    renderTrophiesVault();
    renderGuildLeaderboard();
    triggerProfileAnimations();
  } else if (viewId === 'habits-lab') {
    renderHabitsLabGrid();
    renderSuggestedRoutinesGrid();
  } else if (viewId === 'today') {
    renderQuestList();
    renderWeeklySequenceStrip();
  }
}

function initNavigation() {
  document.querySelectorAll('nav[data-nav-container] a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      if (path) navigateTo(path);
    });
  });

  document.querySelectorAll('#side-drawer nav a').forEach(link => {
    link.addEventListener('click', e => {
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
    backdrop.classList.remove('hidden');
    drawer.classList.remove('invisible', '-translate-x-full');
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
    setTimeout(() => {
      if (drawer.classList.contains('-translate-x-full')) {
        drawer.classList.add('invisible');
        backdrop.classList.add('hidden');
      }
    }, 300);
  }
}

function toggleSound() {
  window.audioEngine.toggle();
}

function updateAudioUI(isOn) {
  const sfxBtn = document.getElementById('sfx-toggle-btn');
  const sfxIcon = document.getElementById('sfx-icon');
  const sfxLabel = document.getElementById('sfx-label');
  const sfxBars = document.getElementById('sfx-wave-bars');

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
  if (drawerBtn) drawerBtn.addEventListener('click', openDrawer);
  const backdrop = document.getElementById('drawer-backdrop');
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
}

// ==========================================
// TOAST & ANIMATED NOTIFICATION REMINDERS
// ==========================================
let toastTimer = null;
function showToast(message, subtitle = '') {
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
  }, 3400);
}

let notifBannerTimer = null;
function triggerTacticalNotification(customText) {
  const banner = document.getElementById('tactical-notif-banner');
  const textEl = document.getElementById('notif-banner-body');
  if (!banner) return;

  window.audioEngine.playNotificationPing();

  const pendingCount = window.store.state.quests.filter(q => !q.completed).length;
  const msg =
    customText ||
    (pendingCount > 0
      ? `Operative ${window.store.state.user.name}: ${pendingCount} protocol(s) awaiting execution today. Strike now for Prime Window XP!`
      : `Sector Secured! All protocols cleared today. Inspect tomorrow's scheduled loadout.`);

  if (textEl) textEl.textContent = msg;
  banner.classList.remove('hidden');
  banner.classList.add('flex', 'notif-banner-active');

  // Also request native browser notification if granted
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('HabitOps Tactical Dispatch', { body: msg });
    } catch (e) {}
  }

  if (notifBannerTimer) clearTimeout(notifBannerTimer);
  notifBannerTimer = setTimeout(() => {
    dismissTacticalNotification();
  }, 6200);
}

function dismissTacticalNotification() {
  const banner = document.getElementById('tactical-notif-banner');
  if (banner) {
    banner.classList.remove('notif-banner-active', 'flex');
    banner.classList.add('hidden');
  }
}

function saveReminderTime(timeVal) {
  window.audioEngine.playTap();
  window.store.state.settings = window.store.state.settings || {};
  window.store.state.settings.reminderTime = timeVal;
  window.store.save();

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  showToast(`Daily Reminder Armed: ${timeVal}`, 'Animated HUD & System Alert Active');
}

function initReminderScheduler() {
  const savedTime = window.store.state.user?.reminderTime || '08:00';
  const input = document.getElementById('reminder-time-input');
  if (input) input.value = savedTime;

  // Run initial period check immediately on app boot
  checkPeriodMissedAlerts();

  // Check every 30 seconds for daily reminder and period-based incomplete task alerts
  setInterval(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentHm = `${hh}:${mm}`;
    const targetHm = window.store.state.user?.reminderTime || '08:00';
    const lastFiredKey = `habitops_notif_${now.toISOString().slice(0, 10)}_${currentHm}`;
    if (currentHm === targetHm && !sessionStorage.getItem(lastFiredKey)) {
      sessionStorage.setItem(lastFiredKey, '1');
      triggerTacticalNotification();
    }

    checkPeriodMissedAlerts();
  }, 30000);
}

// Period-based non-spam notification check (grouped by period rather than per-task spam)
function checkPeriodMissedAlerts() {
  const now = new Date();
  const currentHour = now.getHours();
  const todayKey = now.toISOString().slice(0, 10);
  const state = window.store?.state;
  if (!state || !state.quests || !state.quests.length) return;

  // 1. Morning period alert (Checked between 12:00 and 17:59)
  if (currentHour >= 12 && currentHour < 18) {
    const key = `habitops_period_alert_${todayKey}_morning`;
    if (!sessionStorage.getItem(key)) {
      const pendingMorning = state.quests.filter(q => q.group === 'morning' && !q.completed);
      if (pendingMorning.length > 0) {
        sessionStorage.setItem(key, '1');
        triggerTacticalNotification(
          `Tactical Notice: ${pendingMorning.length} Morning protocol(s) were not completed by allocated time (12:00). Strike now or reschedule in Calendar!`
        );
        return;
      }
    }
  }

  // 2. Afternoon period alert (Checked between 18:00 and 21:59)
  if (currentHour >= 18 && currentHour < 22) {
    const key = `habitops_period_alert_${todayKey}_afternoon`;
    if (!sessionStorage.getItem(key)) {
      const pendingAfternoon = state.quests.filter(q => q.group === 'afternoon' && !q.completed);
      if (pendingAfternoon.length > 0) {
        sessionStorage.setItem(key, '1');
        triggerTacticalNotification(
          `Tactical Notice: ${pendingAfternoon.length} Afternoon protocol(s) were not completed by allocated time (18:00). Strike now or plan for tomorrow!`
        );
        return;
      }
    }
  }

  // 3. Evening period alert (Checked between 22:00 and 23:59)
  if (currentHour >= 22) {
    const key = `habitops_period_alert_${todayKey}_evening`;
    if (!sessionStorage.getItem(key)) {
      const pendingEvening = state.quests.filter(q => q.group === 'evening' && !q.completed);
      if (pendingEvening.length > 0) {
        sessionStorage.setItem(key, '1');
        triggerTacticalNotification(
          `Sector Notice: ${pendingEvening.length} Evening protocol(s) incomplete before sleep cycle. Secure the sector to protect streak!`
        );
        return;
      }
    }
  }
}

// ==========================================
// FLOATING XP PARTICLES & COUNTER ROLLUP
// ==========================================
function spawnFloatingParticle(targetEl, text, isCrit = false) {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const particle = document.createElement('div');
  particle.className = `xp-float-particle px-3 py-1 font-mono text-xs font-black uppercase tracking-wider z-50 flex items-center gap-1.5 shadow-xl ${
    isCrit
      ? 'bg-[#1E0B14] text-[#FF0055] border-2 border-[#FF0055] shadow-[0_0_15px_rgba(255,0,85,0.6)]'
      : 'bg-[#0B1522] text-[#00F0FF] border-2 border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.5)]'
  }`;
  particle.innerHTML = `
    <span class="material-symbols-outlined text-[15px]">${isCrit ? 'local_fire_department' : 'bolt'}</span>
    <span>${text}</span>
  `;
  const targetCenterX = rect.left + rect.width / 2;
  particle.style.left = Math.max(16, targetCenterX - 65) + 'px';
  particle.style.top = rect.top + window.scrollY - 15 + 'px';
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 1100);
}

function spawnFloatingBadges(targetContainer, text1 = '+50 XP EARNED', text2 = 'CRITICAL STRIKE!') {
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
  setTimeout(() => floatEl.remove(), 1500);
}

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
// VIEW 1: TODAY'S QUESTS (SATISFYING DISAPPEAR + TOMORROW PREVIEW)
// ==========================================
function initTodayView() {
  renderWeeklySequenceStrip();
  renderQuestList();
}

function renderQuestList() {
  const state = window.store.state;
  const morningContainer = document.getElementById('morning-quests-list');
  const afternoonContainer = document.getElementById('afternoon-quests-list');
  const eveningContainer = document.getElementById('evening-quests-list');
  const completedSection = document.getElementById('completed-today-section');
  const completedList = document.getElementById('completed-today-list');
  const completedBadge = document.getElementById('completed-tray-label');
  const tomorrowSection = document.getElementById('tomorrow-preview-section');
  const tomorrowList = document.getElementById('tomorrow-quests-preview-list');

  if (!morningContainer || !afternoonContainer || !eveningContainer) return;

  morningContainer.innerHTML = '';
  afternoonContainer.innerHTML = '';
  eveningContainer.innerHTML = '';
  if (completedList) completedList.innerHTML = '';

  const activeQuests = state.quests.filter(q => !q.completed);
  const completedQuests = state.quests.filter(q => q.completed);

  // Render active quests into their time pillars
  ['morning', 'afternoon', 'evening'].forEach(group => {
    const container =
      group === 'morning'
        ? morningContainer
        : group === 'evening'
        ? eveningContainer
        : afternoonContainer;
    const groupActive = activeQuests.filter(q => q.group === group);

    if (groupActive.length === 0) {
      const emptyBanner = document.createElement('div');
      emptyBanner.className =
        'bg-surface-container-low/60 border border-dashed border-outline-variant/40 px-3 py-2.5 flex items-center justify-between text-xs text-on-surface-variant';
      emptyBanner.innerHTML = `
        <span class="font-label-sm uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px]">verified</span>
          <span>${group.toUpperCase()} SECTOR CLEAR</span>
        </span>
        <span class="font-body-sm text-[11px]">All protocols executed</span>
      `;
      container.appendChild(emptyBanner);
    } else {
      groupActive.forEach(quest => {
        container.appendChild(createQuestElement(quest));
      });
    }
  });

  // Render Completed Today Tray
  if (completedSection && completedList) {
    if (completedQuests.length > 0) {
      completedSection.classList.remove('hidden');
      completedSection.classList.add('flex');
      if (completedBadge) {
        completedBadge.textContent = `Cleared Today (${completedQuests.length}) — Tap to Inspect / Undo`;
      }
      completedQuests.forEach(quest => {
        completedList.appendChild(createCompletedQuestRow(quest));
      });
    } else {
      completedSection.classList.add('hidden');
      completedSection.classList.remove('flex');
    }
  }

  // Render Tomorrow's Set Preview automatically when ALL of today's quests are done!
  if (tomorrowSection && tomorrowList) {
    if (state.quests.length > 0 && activeQuests.length === 0) {
      tomorrowSection.classList.remove('hidden');
      tomorrowSection.classList.add('flex');
      tomorrowList.innerHTML = '';
      const tomorrowQuests = window.store.getTomorrowQuestsPreview();
      tomorrowQuests.forEach(tq => {
        const row = document.createElement('div');
        row.className =
          'bg-surface-container-low p-2.5 border border-outline-variant/30 flex items-center justify-between';
        row.innerHTML = `
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="material-symbols-outlined text-primary text-[18px]">${tq.icon || 'schedule'}</span>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="font-label-md text-label-md font-bold text-on-surface truncate">${tq.title}</span>
                ${
                  tq.isCustomScheduled
                    ? '<span class="px-1.5 py-0.2 bg-primary-container text-on-primary-container font-label-sm text-[11px] uppercase font-bold">Planned Ahead</span>'
                    : ''
                }
              </div>
              <span class="font-body-sm text-[11px] text-on-surface-variant truncate">${tq.execTime || '08:00'} · ${tq.duration || '30 mins'} · ${tq.group.toUpperCase()}</span>
            </div>
          </div>
          <span class="font-label-sm text-label-sm font-mono font-bold text-primary shrink-0">+${tq.xp} XP</span>
        `;
        tomorrowList.appendChild(row);
      });
    } else {
      tomorrowSection.classList.add('hidden');
      tomorrowSection.classList.remove('flex');
    }
  }
}

// 2-Second Hold-to-Clear Mission Interaction Engine
let missionHoldTimer = null;
let activeHoldQuestId = null;
let holdStartTime = 0;

function startMissionHold(event, questId) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  cancelMissionHold(event, questId, false);
  activeHoldQuestId = questId;
  holdStartTime = Date.now();

  const card = document.getElementById(`quest-card-${questId}`);
  if (card) {
    card.classList.add('charging-hold');
  }

  window.audioEngine.playWaterDrop();
  window.audioEngine.startChargeHum();
  if ('vibrate' in navigator) {
    try { navigator.vibrate(30); } catch (e) {}
  }

  missionHoldTimer = setTimeout(() => {
    completeMissionHold(questId);
  }, 2000);
}

function cancelMissionHold(event, questId, playFeedback = true) {
  if (missionHoldTimer) {
    clearTimeout(missionHoldTimer);
    missionHoldTimer = null;
  }
  window.audioEngine.stopChargeHum();

  const qId = questId || activeHoldQuestId;
  if (qId) {
    const card = document.getElementById(`quest-card-${qId}`);
    if (card) {
      card.classList.remove('charging-hold');
    }
  }

  const durationHeld = Date.now() - holdStartTime;
  if (playFeedback && durationHeld > 80 && durationHeld < 1950) {
    window.audioEngine.playMechanicalThud();
    showToast('Hold 2 Seconds to Execute Protocol', 'Long-press to confirm protocol strike');
  }
  activeHoldQuestId = null;
}

function spawnStrikeSlashParticles(targetEl) {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.5;
  const primaryColor = getComputedStyle(document.body).getPropertyValue('--theme-primary').trim() || '#00839a';
  const colors = [primaryColor, '#ffb300', '#ff2a55', '#ffffff'];

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'strike-particle';
    const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.35;
    const dist = 48 + Math.random() * 85;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.backgroundColor = colors[i % colors.length];
    p.style.transform = 'translate(0, 0) scale(1.2) rotate(45deg)';
    p.style.opacity = '1';
    document.body.appendChild(p);

    requestAnimationFrame(() => {
      p.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0.15) rotate(135deg)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 580);
  }
}

function triggerScreenJolt() {
  document.body.classList.remove('screen-jolt');
  void document.body.offsetWidth;
  document.body.classList.add('screen-jolt');
  setTimeout(() => document.body.classList.remove('screen-jolt'), 260);
}

function completeMissionHold(questId) {
  if (missionHoldTimer) {
    clearTimeout(missionHoldTimer);
    missionHoldTimer = null;
  }
  window.audioEngine.stopChargeHum();
  window.audioEngine.playPop();

  const card = document.getElementById(`quest-card-${questId}`);
  if (card) {
    card.classList.remove('charging-hold');
    spawnStrikeSlashParticles(card);
  }
  triggerScreenJolt();

  if ('vibrate' in navigator) {
    try { navigator.vibrate([60, 40, 80]); } catch (e) {}
  }

  activeHoldQuestId = null;
  handleQuestCardClick(questId);
}

function createQuestElement(quest) {
  const div = document.createElement('div');
  div.id = `quest-card-${quest.id}`;
  div.setAttribute('data-quest-id', quest.id);

  const tierInfo = window.DIFFICULTY_TIERS?.[quest.difficulty] || { label: 'Standard', critChance: 0.25 };
  const timeBadge = quest.time || quest.execTime || 'Flex';
  const durBadge = quest.duration || '30m';

  div.className = `relative bg-surface-container-low p-3.5 flex flex-col space-y-2 border border-outline-variant/30 hover:border-primary transition-all tactile-btn mission-hold-wrapper ${
    quest.isPriorityTarget ? 'border-l-4 border-l-secondary' : ''
  }`;

  // 2-Second Hold event binding (Desktop mouse + Mobile touch)
  div.onpointerdown = (e) => startMissionHold(e, quest.id);
  div.onpointerup = (e) => cancelMissionHold(e, quest.id);
  div.onpointerleave = (e) => cancelMissionHold(e, quest.id);
  div.onpointercancel = (e) => cancelMissionHold(e, quest.id);
  div.oncontextmenu = (e) => e.preventDefault();

  div.innerHTML = `
    <div class="flex items-start justify-between min-w-0">
      <div class="flex items-start gap-3 min-w-0">
        <div class="checkbox-box w-7 h-7 bg-surface-container-lowest flex items-center justify-center mt-0.5 transition-all border-2 ${
          quest.isPriorityTarget ? 'border-secondary' : 'border-outline-variant'
        } shrink-0 cursor-pointer hover:border-primary active:scale-90" onclick="event.stopPropagation(); handleQuestCardClick('${quest.id}');" title="Strike to execute protocol / Hold card to charge">
          <span class="material-symbols-outlined text-[17px] ${quest.isPriorityTarget ? 'text-secondary' : 'text-primary'}">${quest.icon || 'bolt'}</span>
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="task-title font-headline-sm text-headline-sm text-on-surface font-bold truncate">${quest.title}</span>
            ${quest.isPriorityTarget ? '<span class="bg-secondary text-on-secondary px-1.5 py-0.2 font-label-sm text-[11px] uppercase font-bold tracking-wider">Priority Boss Target</span>' : ''}
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant truncate">${quest.subtext}</span>
          <div class="flex items-center gap-2 mt-1 font-mono text-[11px] text-outline font-semibold">
            <span>⏰ ${timeBadge}</span>
            <span>·</span>
            <span>⏱ ${durBadge}</span>
            <span>·</span>
            <span class="${quest.isPriorityTarget ? 'text-secondary font-bold' : ''}">${Math.round((tierInfo.critChance || 0.25) * 100)}% Crit Chance</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1 shrink-0 pl-2">
        <div class="bg-surface-container-lowest px-2 py-0.5 border border-outline-variant/30 flex items-center gap-1">
          <span class="font-label-sm text-label-sm ${quest.isPriorityTarget ? 'text-secondary' : 'text-primary'} font-bold">+${quest.xp} XP</span>
        </div>
        <button class="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Inspect Full Protocol" onclick="event.stopPropagation(); openHabitDetails('${quest.id}');">
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
    <div class="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] font-mono text-outline">
      <span class="flex items-center gap-1 text-primary font-bold">
        <span class="material-symbols-outlined text-[14px]">touch_app</span>
        <span>HOLD 2S TO EXECUTE STRIKE</span>
      </span>
      <span class="uppercase tracking-wider font-semibold">${tierInfo.label.split(' ')[0]}</span>
    </div>
    <div class="mission-hold-bar" id="hold-bar-${quest.id}"></div>
  `;
  return div;
}

function createCompletedQuestRow(quest) {
  const row = document.createElement('div');
  row.className =
    'bg-surface-container-lowest px-3 py-2.5 border border-outline-variant/30 flex items-center justify-between opacity-90 hover:opacity-100 transition-opacity';
  const earnedXp = quest.lastEarnedXp || quest.xp;
  row.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0">
      <div class="w-6 h-6 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-[15px] font-bold">check</span>
      </div>
      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-label-md text-label-md text-on-surface line-through truncate font-bold opacity-80">${quest.title}</span>
          <span class="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase tracking-wider">✓ EXECUTED</span>
          ${
            quest.lastWasCrit
              ? '<span class="px-1 py-0.2 bg-secondary text-on-secondary font-label-sm text-[10px] uppercase font-bold">CRIT 1.5×</span>'
              : ''
          }
        </div>
        <span class="font-mono text-[11px] text-outline">${quest.group.toUpperCase()} · Earned <span class="text-emerald-400 font-bold">+${earnedXp} XP</span></span>
      </div>
    </div>
    <button class="px-2.5 py-1 text-[11px] font-mono uppercase font-bold text-outline hover:text-secondary border border-outline-variant/30 hover:border-secondary tactile-btn shrink-0" onclick="handleQuestCardClick('${quest.id}')" title="Undo protocol strike">Undo</button>
  `;
  return row;
}

function toggleCompletedTray() {
  window.audioEngine.playTap();
  const list = document.getElementById('completed-today-list');
  const arrow = document.getElementById('completed-tray-arrow');
  if (!list) return;
  list.classList.toggle('hidden');
  if (arrow) {
    arrow.style.transform = list.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
  }
}

function handleQuestCardClick(questId) {
  const card = document.getElementById(`quest-card-${questId}`);
  const result = window.store.toggleQuest(questId);
  if (!result) return;

  if (result.isCompleted) {
    // Play satisfying escalating combo SFX or Critical Strike SFX!
    const comboCount = window.store.state.user.completedTodayCount || 1;
    if (result.wasCrit || result.quest.isPriorityTarget) {
      window.audioEngine.playCriticalHit();
      window.audioEngine.playBossHit(result.bossSlainNow);
      triggerBossSlashAnimation(result.bossDamage);
      triggerScreenShake();
      if (card) {
        spawnFloatingParticle(card, `+${result.earnedXp} XP (${result.totalMultiplier}×)`, true);
      }
      spawnFloatingBadges(
        null,
        `+${result.earnedXp} XP (${result.totalMultiplier}×)`,
        result.wasCrit ? 'CRITICAL BOSS STRIKE (1.5×)!' : 'PRIORITY BOSS HIT!'
      );
    } else {
      window.audioEngine.playComboBlip(comboCount);
      window.audioEngine.playQuestVanish();
      if (card) {
        spawnFloatingParticle(card, `+${result.earnedXp} XP (${result.totalMultiplier}×)`, false);
      }
      if (window.store.state.boss.currentHp > 0) {
        triggerBossSlashAnimation(result.bossDamage);
      }
    }

    // Boss defeat celebration!
    if (result.bossSlainNow || window.store.state.boss.isSlain) {
      setTimeout(() => {
        openBossVictoryModal();
      }, 550);
    }

    // Level-up celebration!
    if (result.leveledUp) {
      setTimeout(() => {
        window.audioEngine.playLevelUp();
        spawnFloatingBadges(
          null,
          `RANK UP → LEVEL ${result.newLevel}!`,
          (window.store.state.user.rankTitle || 'Operative').toUpperCase()
        );
        showToast(
          `LEVEL UP! You reached Level ${result.newLevel}`,
          `Title: ${window.store.state.user.rankTitle || 'Operative'}`
        );
      }, 380);
    }

    // Animate card vanishing satisfyingly before re-rendering list
    if (card) {
      if (result.wasCrit) card.classList.add('crit-flash-anim');
      card.classList.add('quest-vanish-anim');
      setTimeout(() => {
        renderQuestList();
        renderWeeklySequenceStrip();
      }, 420);
      return;
    }
  } else {
    window.audioEngine.playMechanicalThud();
    showToast('Protocol Reverted to Active Stack', `-${result.revertedXp} XP adjusted`);
  }

  renderQuestList();
  renderWeeklySequenceStrip();
}

function triggerBossSlashAnimation(damageAmount) {
  const bossCard = document.getElementById('boss-card');
  const slashLayer = document.getElementById('boss-slash-layer');
  const soundRipple = document.getElementById('boss-sound-ripple');
  const impactTag = document.getElementById('boss-impact-tag');

  if (slashLayer) slashLayer.className = 'slash-flash-active';
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
    impactTag.textContent = `-${damageAmount || 35} HP STRIKE!`;
    impactTag.classList.remove('opacity-0');
    impactTag.classList.add('opacity-100');
    setTimeout(() => {
      impactTag.classList.remove('opacity-100');
      impactTag.classList.add('opacity-0');
    }, 1100);
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
  setTimeout(() => body.classList.remove('screen-shake'), 400);
}

function handleClaimTrophy() {
  const completedToday = window.store.state.quests.filter(q => q.completed).length;
  if (completedToday < 3 && !window.store.state.trophyClaimed) {
    window.audioEngine.playMechanicalThud();
    showToast(`Complete 3 protocols today to unlock Chest`, `Current progress: ${completedToday}/3 completed`);
    return;
  }

  const success = window.store.claimTrophyChest();
  if (!success) {
    showToast('Daily Supply Chest already claimed!', 'Resets tomorrow at 00:00');
    return;
  }

  window.audioEngine.playTrophyFanfare();
  showToast('Daily Supply Chest Unlocked!', '+100 Bonus XP Credited');
  spawnFloatingBadges(null, '+100 XP CLAIMED', 'SUPPLY CHEST UNLOCKED!');
}

function openBossVictoryModal() {
  window.audioEngine.playTrophyFanfare();
  const modal = document.getElementById('boss-victory-modal');
  const nameEl = document.getElementById('victory-boss-name');
  const descEl = document.getElementById('victory-boss-desc');
  const bountyEl = document.getElementById('victory-bounty-xp');
  const slainEl = document.getElementById('victory-slain-count');

  const boss = window.store.state.boss;
  if (nameEl) nameEl.textContent = `${boss.name} Vanquished!`;
  if (descEl) descEl.textContent = `Relentless daily protocol execution has shattered ${boss.name}'s HP to 0%.`;
  if (bountyEl) bountyEl.textContent = `+${boss.bonusXp || 200} XP`;
  if (slainEl) slainEl.textContent = `${window.store.state.user.bossesSlain}`;

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function closeBossVictoryAndDeployNext() {
  const modal = document.getElementById('boss-victory-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  handleSpawnNextBoss();
}

function handleSpawnNextBoss() {
  window.audioEngine.playBossHorn();
  window.store.spawnNextBoss();
  showToast('New Adversary Engaged!', `${window.store.state.boss.name} (${window.store.state.boss.maxHp} HP)`);
  renderHeaderStats();
}

// Boss Tactical Dossier & Combat Telemetry Modal
function openBossDossierModal() {
  if (window.audioEngine && typeof window.audioEngine.playTap === 'function') {
    window.audioEngine.playTap();
  }

  const modal = document.getElementById('boss-dossier-modal');
  if (!modal) return;

  const state = window.store.state;
  const boss = state.boss || {};
  const maxHp = boss.maxHp || 100;
  const currentHp = Math.max(0, Math.min(maxHp, boss.currentHp !== undefined ? boss.currentHp : maxHp));
  const damageTaken = Math.max(0, maxHp - currentHp);
  const hpPct = Math.round((currentHp / maxHp) * 100);
  const damagePct = Math.round((damageTaken / maxHp) * 100);
  const tier = boss.tier || 1;

  // Elements
  const nameEl = document.getElementById('dossier-boss-name');
  const tierBadgeEl = document.getElementById('dossier-boss-tier-badge');
  const statusBadgeEl = document.getElementById('dossier-boss-status-badge');
  const descEl = document.getElementById('dossier-boss-desc');
  const hpTextEl = document.getElementById('dossier-boss-hp-text');
  const hpBarEl = document.getElementById('dossier-boss-hp-bar');
  const damageTakenEl = document.getElementById('dossier-damage-taken');
  const damagePctEl = document.getElementById('dossier-damage-pct');
  const hpRemainingEl = document.getElementById('dossier-hp-remaining');
  const bountyXpEl = document.getElementById('dossier-bounty-xp');
  const spawnNextBtn = document.getElementById('dossier-spawn-next-btn');

  if (nameEl) nameEl.textContent = `${boss.name || 'The Adversary'} (Tier ${tier})`;
  if (tierBadgeEl) tierBadgeEl.textContent = `Tier ${tier} Adversary`;
  if (descEl) descEl.textContent = boss.desc || 'Thrives in the gap between intention and execution. Defeated by persistent daily discipline.';
  if (hpTextEl) hpTextEl.textContent = `${currentHp} / ${maxHp} HP (${hpPct}%)`;

  if (hpBarEl) {
    hpBarEl.style.width = `${hpPct}%`;
    if (currentHp === 0) {
      hpBarEl.className = 'h-full bg-outline transition-all duration-500 ease-out';
    } else if (hpPct <= 25) {
      hpBarEl.className = 'h-full bg-secondary animate-pulse transition-all duration-500 ease-out';
    } else {
      hpBarEl.className = 'h-full bg-secondary transition-all duration-500 ease-out';
    }
  }

  if (statusBadgeEl) {
    if (boss.isSlain || currentHp === 0) {
      statusBadgeEl.textContent = 'Vanquished';
      statusBadgeEl.className = 'px-1.5 py-0.5 bg-outline text-white font-label-sm text-[10px] uppercase font-bold';
    } else if (hpPct <= 25) {
      statusBadgeEl.textContent = 'Critical Weakness';
      statusBadgeEl.className = 'px-1.5 py-0.5 bg-secondary text-white font-label-sm text-[10px] uppercase font-bold animate-pulse';
    } else if (hpPct < 100) {
      statusBadgeEl.textContent = 'Active Engagement';
      statusBadgeEl.className = 'px-1.5 py-0.5 bg-secondary-container text-on-secondary font-label-sm text-[10px] uppercase font-bold';
    } else {
      statusBadgeEl.textContent = 'Full Combat Readiness';
      statusBadgeEl.className = 'px-1.5 py-0.5 bg-surface-container-high text-primary font-label-sm text-[10px] uppercase font-bold';
    }
  }

  if (damageTakenEl) damageTakenEl.textContent = `${damageTaken} HP`;
  if (damagePctEl) damagePctEl.textContent = `${damagePct}% Defeated`;
  if (hpRemainingEl) hpRemainingEl.textContent = `${currentHp} HP`;
  if (bountyXpEl) bountyXpEl.textContent = `+${boss.bonusXp || 200} XP`;

  if (spawnNextBtn) {
    if (boss.isSlain || currentHp === 0) {
      spawnNextBtn.classList.remove('hidden');
      spawnNextBtn.classList.add('flex');
    } else {
      spawnNextBtn.classList.add('hidden');
      spawnNextBtn.classList.remove('flex');
    }
  }

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function closeBossDossierModal() {
  if (window.audioEngine && typeof window.audioEngine.playTap === 'function') {
    window.audioEngine.playTap();
  }
  const modal = document.getElementById('boss-dossier-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

// ==========================================
// WEEKLY SEQUENCE STRIP & FULL INTERACTIVE CALENDAR
// ==========================================
let calendarCursorDate = new Date();
let selectedCalendarDateKey = new Date().toISOString().slice(0, 10);

function renderWeeklySequenceStrip() {
  const strip = document.getElementById('weekly-sequence-strip');
  if (!strip) return;

  strip.innerHTML = '';
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Show 7 days starting 2 days ago through 4 days ahead so user sees past + future planning
  const startOffset = -2;

  for (let i = startOffset; i <= startOffset + 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const isToday = key === todayKey;
    const histCount = (window.store.state.calendarHistory?.[key] || []).length;
    const plannedCount = (window.store.state.scheduledDates?.[key] || []).length;

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.onclick = () => openCalendarModal(key);

    if (isToday) {
      cell.className =
        'flex flex-col items-center py-2 bg-inverse-surface text-on-secondary border-b-2 border-primary-container tactile-btn';
    } else if (histCount > 0) {
      cell.className =
        'flex flex-col items-center py-2 bg-primary-container/20 border border-primary/30 text-on-surface tactile-btn';
    } else if (plannedCount > 0) {
      cell.className =
        'flex flex-col items-center py-2 bg-secondary-fixed/40 border border-secondary/40 text-on-surface tactile-btn';
    } else {
      cell.className =
        'flex flex-col items-center py-2 bg-surface-container-low hover:bg-surface-container-high text-on-surface tactile-btn';
    }

    cell.innerHTML = `
      <span class="font-label-sm text-[11px] ${isToday ? 'text-primary-fixed font-bold' : 'text-outline'} uppercase">${dayNames[d.getDay()]}</span>
      <span class="font-headline-sm text-sm font-bold my-0.5">${d.getDate()}</span>
      <span class="material-symbols-outlined text-[13px] ${
        isToday
          ? 'text-primary-container'
          : histCount > 0
          ? 'text-primary'
          : plannedCount > 0
          ? 'text-secondary'
          : 'text-outline/40'
      }">
        ${histCount > 0 ? 'check_circle' : plannedCount > 0 ? 'event_upcoming' : isToday ? 'radio_button_checked' : ' horizontal_rule'}
      </span>
    `;
    strip.appendChild(cell);
  }
}

function openCalendarModal(initialDateKey) {
  window.audioEngine.playTap();
  const modal = document.getElementById('calendar-modal');
  if (!modal) return;

  if (initialDateKey) {
    selectedCalendarDateKey = initialDateKey;
    const parts = initialDateKey.split('-').map(Number);
    calendarCursorDate = new Date(parts[0], parts[1] - 1, 1);
  } else {
    const now = new Date();
    selectedCalendarDateKey = now.toISOString().slice(0, 10);
    calendarCursorDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  modal.classList.remove('hidden');
  renderCalendarMonthGrid();
  renderSelectedCalendarDateDetails();
}

function closeCalendarModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('calendar-modal');
  if (modal) modal.classList.add('hidden');
}

function changeCalendarMonth(delta) {
  window.audioEngine.playTap();
  calendarCursorDate = new Date(
    calendarCursorDate.getFullYear(),
    calendarCursorDate.getMonth() + delta,
    1
  );
  renderCalendarMonthGrid();
}

function renderCalendarMonthGrid() {
  const grid = document.getElementById('calendar-days-grid');
  const monthLabel = document.getElementById('calendar-month-label');
  if (!grid) return;

  const year = calendarCursorDate.getFullYear();
  const month = calendarCursorDate.getMonth();

  if (monthLabel) {
    monthLabel.textContent = calendarCursorDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  grid.innerHTML = '';
  const firstDayOfMonth = new Date(year, month, 1);
  // Convert Sunday=0..Saturday=6 to Monday=0..Sunday=6
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < startWeekday; i++) {
    const blank = document.createElement('div');
    blank.className = 'h-10 bg-surface-container-low/30';
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;

    const isSelected = dateKey === selectedCalendarDateKey;
    const isToday = dateKey === todayKey;
    const completedLogs = window.store.state.calendarHistory?.[dateKey] || [];
    const scheduledLogs = window.store.state.scheduledDates?.[dateKey] || [];

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.onclick = () => {
      window.audioEngine.playTap();
      selectedCalendarDateKey = dateKey;
      renderCalendarMonthGrid();
      renderSelectedCalendarDateDetails();
    };

    btn.className = `h-11 flex flex-col items-center justify-between p-1 border transition-all tactile-btn ${
      isSelected
        ? 'bg-inverse-surface text-white border-2 border-primary-container font-bold'
        : isToday
        ? 'bg-primary-container/25 border-primary text-on-surface font-bold'
        : 'bg-surface-container-low border-outline-variant/20 text-on-surface hover:border-primary'
    }`;

    let indicatorHtml = '<span class="w-1.5 h-1.5 bg-transparent"></span>';
    if (completedLogs.length > 0 && scheduledLogs.length > 0) {
      indicatorHtml = `<div class="flex gap-0.5"><span class="w-1.5 h-1.5 bg-primary-container"></span><span class="w-1.5 h-1.5 bg-secondary"></span></div>`;
    } else if (completedLogs.length > 0) {
      indicatorHtml = `<span class="font-mono text-[11px] text-primary font-bold">✓${completedLogs.length}</span>`;
    } else if (scheduledLogs.length > 0) {
      indicatorHtml = `<span class="font-mono text-[11px] text-secondary font-bold">+${scheduledLogs.length}</span>`;
    }

    btn.innerHTML = `
      <span class="font-mono text-xs">${day}</span>
      ${indicatorHtml}
    `;
    grid.appendChild(btn);
  }
}

function renderSelectedCalendarDateDetails() {
  const labelEl = document.getElementById('calendar-selected-date-label');
  const detailsEl = document.getElementById('calendar-date-details');
  const quickChipsEl = document.getElementById('calendar-quick-plan-chips');
  if (!detailsEl) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  if (labelEl) {
    labelEl.textContent =
      selectedCalendarDateKey === todayKey
        ? `${selectedCalendarDateKey} (Today)`
        : selectedCalendarDateKey;
  }

  const completedLogs = window.store.state.calendarHistory?.[selectedCalendarDateKey] || [];
  const scheduledLogs = window.store.state.scheduledDates?.[selectedCalendarDateKey] || [];

  detailsEl.innerHTML = '';

  if (completedLogs.length === 0 && scheduledLogs.length === 0) {
    detailsEl.innerHTML = `
      <div class="text-xs text-on-surface-variant py-2">
        No protocols logged or custom-scheduled for <strong>${selectedCalendarDateKey}</strong> yet. Tap a routine below or click <strong>Schedule Custom Protocol</strong> to plan ahead!
      </div>
    `;
  } else {
    completedLogs.forEach(item => {
      const row = document.createElement('div');
      row.className =
        'bg-surface-container-lowest px-2.5 py-1.5 border-l-2 border-primary flex items-center justify-between text-xs';
      row.innerHTML = `
        <span class="font-semibold text-on-surface">✓ ${item.title}</span>
        <span class="font-mono text-primary font-bold">+${item.xp} XP</span>
      `;
      detailsEl.appendChild(row);
    });

    scheduledLogs.forEach(item => {
      const row = document.createElement('div');
      row.className =
        'bg-surface-container-lowest px-2.5 py-1.5 border-l-2 border-secondary flex items-center justify-between text-xs';
      row.innerHTML = `
        <div>
          <span class="font-bold text-on-surface">📅 ${item.title}</span>
          <span class="text-[11px] text-outline ml-1">(${item.execTime || '08:00'} · ${item.duration || '30 mins'})</span>
        </div>
        <button class="text-[11px] uppercase font-bold text-secondary hover:underline" onclick="removeScheduledDateHabit('${selectedCalendarDateKey}', '${item.id}')">Remove</button>
      `;
      detailsEl.appendChild(row);
    });
  }

  // Render 1-tap quick schedule chips
  if (quickChipsEl && window.ROUTINE_CATALOG) {
    quickChipsEl.innerHTML = '';
    window.ROUTINE_CATALOG.slice(0, 8).forEach(preset => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className =
        'px-2.5 py-1 bg-surface-container-lowest border border-outline-variant hover:border-primary text-[11px] font-label-sm font-bold text-on-surface shrink-0 tactile-btn flex items-center gap-1';
      chip.innerHTML = `<span>+ ${preset.title}</span>`;
      chip.onclick = () => {
        window.audioEngine.playChime();
        window.store.scheduleHabitForDate(selectedCalendarDateKey, preset);
        renderCalendarMonthGrid();
        renderSelectedCalendarDateDetails();
        renderWeeklySequenceStrip();
        renderQuestList();
        showToast(`Scheduled "${preset.title}"`, `Target Date: ${selectedCalendarDateKey}`);
      };
      quickChipsEl.appendChild(chip);
    });
  }
}

function removeScheduledDateHabit(dateKey, habitId) {
  window.audioEngine.playMechanicalThud();
  window.store.removeScheduledHabitForDate(dateKey, habitId);
  renderCalendarMonthGrid();
  renderSelectedCalendarDateDetails();
  renderWeeklySequenceStrip();
  renderQuestList();
}

function openScheduleForSelectedDate() {
  const targetDate = selectedCalendarDateKey || new Date().toISOString().slice(0, 10);
  closeCalendarModal();
  toggleAddHabitModal(true, targetDate);
}

// ==========================================
// VIEW 2: HABIT QUEST DETAILS
// ==========================================
function initHabitDetailView() {
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
  const workoutQuest = window.store.state.quests.find(q => q.id === 'workout') || window.store.state.quests[0];
  if (!workoutQuest) return;
  if (workoutQuest.completed) {
    showToast('Strike already executed today', 'Use Revert if needed');
    return;
  }
  handleQuestCardClick(workoutQuest.id);
}

function revertStrikeCheckIn() {
  const workoutQuest = window.store.state.quests.find(q => q.id === 'workout') || window.store.state.quests[0];
  if (!workoutQuest || !workoutQuest.completed) return;
  handleQuestCardClick(workoutQuest.id);
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
  const saveBtn = document.getElementById('save-reflection-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveFieldReflection);

  document.querySelectorAll('[data-rating-group]').forEach(meter => {
    meter.querySelectorAll('span[data-star-idx]').forEach(star => {
      star.addEventListener('click', () => {
        const group = meter.getAttribute('data-rating-group');
        const idx = parseInt(star.getAttribute('data-star-idx'), 10);
        setRatingMeter(group, idx + 1);
      });
    });
  });

  renderWeeklyCadenceBarChart();
}

function renderWeeklyCadenceBarChart() {
  const container = document.getElementById('weekly-bars-container');
  if (!container) return;

  const now = new Date();
  const currentDayOfWeek = now.getDay();
  const monday = new Date(now);
  const diffToMonday = (currentDayOfWeek === 0 ? -6 : 1) - currentDayOfWeek;
  monday.setDate(now.getDate() + diffToMonday);

  container.innerHTML = '';
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayStr = now.toISOString().slice(0, 10);
  const state = window.store.state;

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const isToday = dateStr === todayStr;
    const isFuture = d > now && !isToday;

    let cleared = 0;
    let total = state.quests.length || 6;
    let pct = 0;

    if (isToday) {
      cleared = state.quests.filter(q => q.completed).length;
      total = state.quests.length || 1;
      pct = Math.round((cleared / total) * 100);
    } else if (state.completionHistory && state.completionHistory[dateStr]) {
      const hist = state.completionHistory[dateStr];
      cleared = hist.cleared;
      total = hist.total || total;
      pct = hist.pct || 0;
    } else if (isFuture) {
      cleared = 0;
      pct = 0;
    }

    const col = document.createElement('div');
    col.className = `group flex flex-col items-center gap-1 flex-1 h-full justify-end cursor-pointer ${isToday ? 'scale-[1.02]' : ''}`;
    col.setAttribute('data-day', dayNames[i]);
    col.setAttribute('data-stats', isFuture ? 'Upcoming / Scheduled' : `${cleared}/${total} Protocols Cleared (${pct}%)`);
    col.setAttribute('data-extra', isToday ? 'Current Encounter' : isFuture ? 'Planned Phase' : pct >= 80 ? 'Optimal Cadence' : pct > 0 ? 'Partial Execution' : 'Downtime');
    col.onclick = function() { selectBar(this); };

    col.innerHTML = `
      <span class="font-label-sm text-[11px] ${isToday ? 'text-primary font-bold' : 'text-on-surface-variant font-semibold'}">${isFuture ? '—' : `${cleared}/${total}`}</span>
      <div class="w-full ${isToday ? 'bg-primary ring-2 ring-primary-container' : pct > 0 ? 'bg-primary-container' : 'bg-surface-container-high'} transition-all duration-700 ease-out origin-bottom group-hover:brightness-110 chart-bar" style="height: ${Math.max(8, pct)}%;"></div>
      <span class="font-label-sm text-label-sm uppercase ${isToday ? 'text-primary font-black underline' : 'text-on-surface font-semibold'} pt-1">${dayLabels[i]}</span>
    `;
    container.appendChild(col);
  }
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
  if (currentBar) currentBar.classList.add('ring-2', 'ring-primary');
}

function setRatingMeter(group, score) {
  window.audioEngine.playTap();
  window.store.state.review.ratings[group] = score;
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
        star.className =
          idx < score
            ? 'w-2.5 h-2.5 bg-primary-container inline-block cursor-pointer'
            : 'w-2.5 h-2.5 bg-surface-container-highest inline-block cursor-pointer';
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
    setTimeout(() => {
      btn.textContent = prev;
    }, 1800);
  }
  showToast('Field Reflection Saved', 'Archived to Protocol Ledger');
}

function commitWeeklyBlueprint() {
  window.audioEngine.playTrophyFanfare();
  window.store.commitBlueprint();
  const btn = document.getElementById('commit-btn');
  if (!btn) return;
  btn.innerHTML =
    '<span class="material-symbols-outlined text-[20px]">check</span><span>Blueprint Locked (+50 XP)</span>';
  btn.classList.add('bg-primary-container', 'text-on-primary-container');
  showToast('Weekly Blueprint Committed!', '+50 Bonus XP Credited');
}

function triggerWeeklyAnimations() {
  const duration = 900;
  const rateEl = document.getElementById('stat-rate');
  if (rateEl) animateCounter(rateEl, 0, window.store.state.review.rate, duration, v => v + '%');
  const streakEl = document.getElementById('stat-streak-review');
  if (streakEl) streakEl.textContent = window.store.state.review.streakFraction;
  const gainsEl = document.getElementById('stat-gains');
  if (gainsEl) animateCounter(gainsEl, 0, window.store.state.review.xpGained, duration, v => '+' + v);
  renderWeeklyCadenceBarChart();
}

// ==========================================
// VIEW 4: HABITS LAB & SUGGESTED ROUTINES ARMORY
// ==========================================
function initHabitsLabView() {
  renderHabitsLabGrid();
  renderSuggestedRoutinesGrid();

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

function toggleProtocolActionMenu(questId, event) {
  if (event) event.stopPropagation();
  window.audioEngine.playTap();
  const currentOpen = document.querySelector('.protocol-context-menu:not(.hidden)');
  const targetMenu = document.getElementById(`protocol-menu-${questId}`);
  
  if (currentOpen && currentOpen !== targetMenu) {
    currentOpen.classList.add('hidden');
  }
  if (targetMenu) {
    targetMenu.classList.toggle('hidden');
  }
}

function confirmDeleteHabit(id, title) {
  if (confirm(`Decommission Protocol: "${title}"?\nThis removes the protocol from your active combat stack.`)) {
    deleteCustomHabit(id);
  }
}

// Global click-outside listener to dismiss any open protocol action menu
document.addEventListener('click', (e) => {
  if (!e.target.closest('.protocol-menu-container')) {
    document.querySelectorAll('.protocol-context-menu').forEach(menu => menu.classList.add('hidden'));
  }
});

function renderHabitsLabGrid(filter = 'all') {
  const container = document.getElementById('habits-lab-grid');
  if (!container) return;

  const quests = window.store.state.quests;
  const filtered = filter === 'all' ? quests : quests.filter(q => q.group === filter);
  container.innerHTML = '';

  filtered.forEach(quest => {
    const tierInfo = window.DIFFICULTY_TIERS?.[quest.difficulty] || { label: 'Standard Protocol' };
    const card = document.createElement('div');
    card.className =
      'bg-surface-container-lowest p-space-md border border-outline-variant/30 flex flex-col justify-between shadow-xs relative transition-all hover:border-primary';
    
    // Distinct high-contrast badge for completion state
    const statusBadge = quest.completed
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>✓ EXECUTED TODAY</span>`
      : `<span class="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>ACTIVE IN STACK</span>`;

    card.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-space-sm min-w-0">
          <div class="w-10 h-10 ${
            quest.isPriorityTarget ? 'bg-secondary-fixed text-secondary' : 'bg-primary-fixed text-primary'
          } flex items-center justify-center font-bold border border-outline-variant/30 shrink-0">
            <span class="material-symbols-outlined text-[20px]">${quest.icon || 'bolt'}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-[10px] uppercase font-bold text-outline truncate">${quest.group} · ⏰ ${quest.execTime || '08:00'} (${quest.duration || '30 mins'})</span>
            </div>
            <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold truncate">${quest.title}</h4>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="font-mono text-[11px] px-2 py-0.5 ${
            quest.isPriorityTarget ? 'bg-secondary text-on-secondary font-black' : 'bg-surface-container-high text-primary font-bold'
          } uppercase tracking-wider">
            +${quest.xp} XP
          </span>
          <!-- Three-Dot Overflow Action Menu -->
          <div class="relative protocol-menu-container">
            <button class="w-7 h-7 flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30 transition-colors" onclick="toggleProtocolActionMenu('${quest.id}', event)" title="Protocol Actions">
              <span class="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
            <div id="protocol-menu-${quest.id}" class="protocol-context-menu hidden absolute right-0 top-8 w-44 bg-surface-container-lowest border border-outline-variant shadow-xl z-30 py-1 flex flex-col">
              <button class="px-3 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-high flex items-center gap-2 transition-colors" onclick="event.stopPropagation(); document.getElementById('protocol-menu-${quest.id}').classList.add('hidden'); openHabitDetails('${quest.id}');">
                <span class="material-symbols-outlined text-[15px] text-primary">visibility</span>
                <span>Inspect Protocol</span>
              </button>
              <button class="px-3 py-2 text-left text-xs font-semibold text-secondary hover:bg-secondary/10 flex items-center gap-2 border-t border-outline-variant/30 transition-colors" onclick="event.stopPropagation(); document.getElementById('protocol-menu-${quest.id}').classList.add('hidden'); confirmDeleteHabit('${quest.id}', '${quest.title.replace(/'/g, "\\'")}');">
                <span class="material-symbols-outlined text-[15px] text-secondary">delete</span>
                <span>Decommission</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p class="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-2">${quest.subtext}</p>
      <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-surface-container text-xs">
        <span class="font-mono text-[10px] text-outline uppercase font-semibold">${tierInfo.label}</span>
        ${statusBadge}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderSuggestedRoutinesGrid() {
  const grid = document.getElementById('suggested-routines-grid');
  if (!grid || !window.ROUTINE_CATALOG) return;

  grid.innerHTML = '';
  const activeTitles = new Set(window.store.state.quests.map(q => q.title.toLowerCase()));

  window.ROUTINE_CATALOG.forEach(item => {
    const alreadyAdded = activeTitles.has(item.title.toLowerCase());
    const tierInfo = window.DIFFICULTY_TIERS?.[item.difficulty] || { xp: 45, label: 'Standard' };

    const card = document.createElement('div');
    card.className =
      'bg-surface-container-lowest p-3 border border-outline-variant/30 flex items-center justify-between gap-2 shadow-xs';
    card.innerHTML = `
      <div class="flex items-start gap-2.5 min-w-0">
        <div class="w-9 h-9 bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-outline-variant/30">
          <span class="material-symbols-outlined text-[18px]">${item.icon || 'bolt'}</span>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-label-md text-label-md font-bold text-on-surface truncate">${item.title}</span>
          <span class="font-body-sm text-[11px] text-on-surface-variant truncate">${item.subtext}</span>
          <span class="font-mono text-[11px] text-primary font-bold mt-0.5 uppercase">${item.group} · ${item.execTime} · ${item.duration} · +${tierInfo.xp} XP</span>
        </div>
      </div>
      <button ${alreadyAdded ? 'disabled' : ''} class="px-2.5 py-1.5 ${
      alreadyAdded
        ? 'bg-surface-container-high text-outline cursor-default'
        : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-surface tactile-btn'
    } font-label-sm text-[11px] uppercase font-bold tracking-wider shrink-0" onclick="quickDeploySuggestedRoutine('${item.key}')">
        ${alreadyAdded ? 'In Stack ✓' : '+ Deploy'}
      </button>
    `;
    grid.appendChild(card);
  });
}

function quickDeploySuggestedRoutine(catalogKey) {
  const preset = (window.ROUTINE_CATALOG || []).find(r => r.key === catalogKey);
  if (!preset) return;
  window.audioEngine.playChime();
  window.store.addCustomHabit({
    title: preset.title,
    group: preset.group,
    difficulty: preset.difficulty,
    execTime: preset.execTime,
    duration: preset.duration,
    subtext: preset.subtext,
    icon: preset.icon
  });
  renderHabitsLabGrid();
  renderSuggestedRoutinesGrid();
  renderQuestList();
  showToast(`Deployed "${preset.title}"`, `+${window.DIFFICULTY_TIERS[preset.difficulty]?.xp || 45} Base XP`);
}

function deleteCustomHabit(id) {
  window.audioEngine.playMechanicalThud();
  window.store.deleteHabit(id);
  renderHabitsLabGrid();
  renderSuggestedRoutinesGrid();
  renderQuestList();
  showToast('Habit Protocol Decommissioned');
}

// ==========================================
// VIEW 5: PROFILE, AVATAR UPLOAD, MULTIPLIERS, TROPHIES & GUILD
// ==========================================
function initProfileView() {
  renderProfileMultipliers();
  renderTrophiesVault();
  renderGuildLeaderboard();

  const avatarInput = document.getElementById('avatar-upload-input');
  if (avatarInput) {
    avatarInput.addEventListener('change', handleAvatarUpload);
  }
  const backupInput = document.getElementById('backup-import-input');
  if (backupInput) {
    backupInput.addEventListener('change', handleImportBackupFile);
  }
}

function triggerAvatarUpload() {
  window.audioEngine.playTap();
  const input = document.getElementById('avatar-upload-input');
  if (input) input.click();
}

function handleAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 256;
      let w = img.width;
      let h = img.height;
      const minDim = Math.min(w, h);
      const sx = (w - minDim) / 2;
      const sy = (h - minDim) / 2;

      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
      window.store.setAvatar(dataUrl);
      window.audioEngine.playChime();
      showToast('Operative Avatar Updated!', 'Saved locally to your device profile');
      renderGuildLeaderboard();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderProfileMultipliers() {
  const grid = document.getElementById('profile-multipliers-grid');
  const totalBadge = document.getElementById('profile-total-mult-badge');
  if (!grid || !window.store.getMultiplierBreakdown) return;

  const bd = window.store.getMultiplierBreakdown();
  if (totalBadge) {
    totalBadge.textContent = `${bd.totalBeforeCrit.toFixed(2)}× Base · ${(bd.totalBeforeCrit * 1.5).toFixed(2)}× on Crit`;
  }

  const cards = [
    {
      icon: 'military_tech',
      title: `Intensity Rank (${(window.store.state.onboardingData?.intensity || 'operative').toUpperCase()})`,
      val: `${bd.intensityMult.toFixed(2)}×`,
      desc: 'Base difficulty multiplier set during protocol initiation'
    },
    {
      icon: 'local_fire_department',
      title: 'Streak Momentum Surge',
      val: `${bd.streakMult.toFixed(2)}×`,
      desc: `+4% XP per active streak day (Current: ${window.store.state.user.streak}d, max +60%)`
    },
    {
      icon: 'bolt',
      title: 'Daily Chain Combo',
      val: `${bd.comboMult.toFixed(2)}×`,
      desc: `+5% XP per protocol completed today (${window.store.state.user.completedTodayCount || 0} done today)`
    },
    {
      icon: 'schedule',
      title: 'Prime Window Execution',
      val: `${bd.primeWindowMult.toFixed(2)}×`,
      desc: bd.isPrimeWindow
        ? 'ACTIVE NOW! +15% XP for executing during morning/evening prime hours'
        : 'Triggers 05:00–09:59 & 17:00–21:59 (+15% XP)'
    },
    {
      icon: 'casino',
      title: 'RNG Critical Boss Strike',
      val: '1.50× XP',
      desc: '18%–42% chance on every check-in to deal 2× Boss Damage & 1.5× XP!'
    },
    {
      icon: 'shield',
      title: 'Iron Will Streak Shield',
      val: '1× Armed',
      desc: 'Automatically protects your streak if you use the 8-second Emergency Pause'
    }
  ];

  grid.innerHTML = '';
  cards.forEach(c => {
    const el = document.createElement('div');
    el.className =
      'bg-surface-container-lowest p-3 border border-outline-variant/25 flex items-start justify-between gap-2 shadow-xs';
    el.innerHTML = `
      <div class="flex items-start gap-2.5 min-w-0">
        <div class="w-9 h-9 bg-primary-container/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
          <span class="material-symbols-outlined text-[18px]">${c.icon}</span>
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-label-md text-label-md font-bold text-on-surface">${c.title}</span>
          <span class="font-body-sm text-[11px] text-on-surface-variant leading-snug">${c.desc}</span>
        </div>
      </div>
      <span class="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-xs font-bold shrink-0">${c.val}</span>
    `;
    grid.appendChild(el);
  });
}

function renderTrophiesVault() {
  const grid = document.getElementById('trophies-vault-grid');
  const countLabel = document.getElementById('trophies-unlocked-count');
  if (!grid) return;

  const trophies = window.store.state.trophies || [];
  const unlockedCount = trophies.filter(t => t.isUnlocked).length;
  if (countLabel) {
    countLabel.textContent = `${unlockedCount} Unlocked / ${trophies.length - unlockedCount} Locked`;
  }

  grid.innerHTML = '';
  const u = window.store.state.user;

  trophies.forEach(t => {
    let currentProg = 0;
    let targetProg = t.reqTarget || 1;
    if (t.id === 'first_blood' || t.id === 'centurion') currentProg = u.questsCleared;
    else if (t.id === 'titan_slayer') currentProg = u.bossesSlain;
    else if (t.id === 'streak_7' || t.id === 'iron_fortress') currentProg = u.streak;

    const pct = Math.min(100, Math.round((currentProg / targetProg) * 100));

    const card = document.createElement('div');
    card.className = `${
      t.isUnlocked ? 'bg-surface-container-lowest shimmer-active' : 'bg-surface-container-low opacity-90'
    } p-space-md flex flex-col justify-between shadow-sm relative border border-outline-variant/30 cursor-pointer tactile-btn hover:border-primary transition-all`;
    card.onclick = () => openTrophyCard(card, t.id);

    card.innerHTML = `
      ${t.isUnlocked ? '<div class="absolute top-0 left-0 w-1.5 h-full bg-primary-container"></div>' : ''}
      <div class="flex items-start justify-between gap-space-sm pl-1">
        <div class="w-11 h-11 flex items-center justify-center shrink-0 border border-outline-variant/30" style="background:${
          t.isUnlocked ? t.iconBg : '#dde2ee'
        }">
          <span class="material-symbols-outlined text-[24px]" style="color:${
            t.isUnlocked ? t.iconColor : '#6d797d'
          }">${t.icon}</span>
        </div>
        <span class="font-label-sm text-label-sm px-2 py-0.5 ${
          t.isUnlocked
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-surface-container-highest text-on-surface-variant'
        } uppercase font-bold tracking-wider">${t.status}</span>
      </div>
      <div class="mt-space-sm pl-1">
        <h4 class="font-label-lg text-label-lg text-on-surface font-bold">${t.title}</h4>
        <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">${t.desc}</p>
        <div class="mt-2.5">
          <div class="flex justify-between font-label-sm text-label-sm mb-1 text-on-surface-variant font-semibold">
            <span>${t.date}</span>
            <span class="font-bold text-primary">${t.reward}</span>
          </div>
          <div class="w-full h-1.5 bg-surface-container-highest overflow-hidden">
            <div class="h-full ${
              t.isUnlocked ? 'bg-primary-container' : 'bg-primary'
            } transition-all duration-700" style="width:${t.isUnlocked ? 100 : pct}%"></div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderGuildLeaderboard() {
  const listEl = document.getElementById('guild-leaderboard-list');
  const codeEl = document.getElementById('user-friend-code');
  const raidLabel = document.getElementById('guild-raid-progress-label');
  const raidBar = document.getElementById('guild-raid-bar');
  if (!listEl) return;

  const state = window.store.state;
  if (codeEl && state.user.friendCode) {
    codeEl.textContent = state.user.friendCode;
  }

  // Combine user + guildMembers and sort by XP descending
  const userEntry = {
    id: 'user_self',
    name: state.user.name || 'Operative',
    rankTitle: state.user.rankTitle || 'Initiate Recruit',
    level: state.user.level,
    streak: state.user.streak,
    xp: state.user.totalXpEarned || state.user.currentXp,
    isUser: true,
    avatar: state.user.avatarDataUrl
  };

  const members = [...(state.guildMembers || []), userEntry].sort((a, b) => b.xp - a.xp);
  const totalSquadXp = members.reduce((sum, m) => sum + (m.xp || 0), 0);
  const raidTarget = 2500;
  if (raidLabel) raidLabel.textContent = `${totalSquadXp.toLocaleString()} / ${raidTarget.toLocaleString()} XP`;
  if (raidBar) raidBar.style.width = `${Math.min(100, Math.round((totalSquadXp / raidTarget) * 100))}%`;

  const todayKey = new Date().toISOString().slice(0, 10);
  listEl.innerHTML = '';

  members.forEach((m, idx) => {
    const rankNum = idx + 1;
    const boostedToday = m.boostedDate === todayKey;
    const row = document.createElement('div');
    row.className = m.isUser
      ? 'flex items-center justify-between p-space-sm bg-surface-container-lowest relative shadow-sm border-2 border-primary-container'
      : 'flex items-center justify-between p-space-sm bg-surface-container-low border border-outline-variant/20';

    row.innerHTML = `
      <div class="flex items-center gap-space-sm min-w-0">
        <div class="w-7 h-7 ${
          rankNum === 1
            ? 'bg-tertiary-container text-on-tertiary'
            : m.isUser
            ? 'bg-primary-container text-on-primary-container'
            : 'bg-surface-container-high text-on-surface'
        } flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">#${rankNum}</div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-label-lg text-label-lg text-on-surface font-bold truncate">${m.name}</span>
            ${
              m.isUser
                ? '<span class="font-label-sm text-[11px] px-1.5 py-0.2 bg-primary-container text-on-primary-container font-bold uppercase">YOU</span>'
                : `<span class="font-label-sm text-[11px] px-1 py-0.2 bg-surface-container-highest text-on-surface-variant font-mono uppercase">LVL ${m.level || 1}</span>`
            }
          </div>
          <span class="font-body-sm text-body-sm text-on-surface-variant truncate">${m.rankTitle} · 🔥 ${m.streak}d Streak</span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0 pl-2">
        <span class="font-label-md text-label-md font-mono text-primary font-bold">${m.xp} XP</span>
        ${
          !m.isUser
            ? `<button ${boostedToday ? 'disabled' : ''} onclick="handleBoostFriend('${m.id}')" class="px-2 py-1 ${
                boostedToday
                  ? 'bg-surface-container-highest text-outline'
                  : 'bg-secondary text-on-secondary hover:opacity-90 tactile-btn'
              } font-label-sm text-[11px] uppercase font-bold">
                ${boostedToday ? 'Boosted ✓' : 'Boost (+15 XP)'}
              </button>`
            : ''
        }
      </div>
    `;
    listEl.appendChild(row);
  });
}

function handleBoostFriend(memberId) {
  const res = window.store.boostGuildFriend(memberId);
  if (!res || !res.ok) {
    showToast(res?.reason || 'Already boosted this squadmate today!');
    return;
  }
  window.audioEngine.playChime();
  renderGuildLeaderboard();
  showToast(`Tactical Boost Sent to ${res.member.name}!`, '+15 Squad XP earned for both of you');
}

function copyFriendCode() {
  window.audioEngine.playTap();
  const code = window.store.state.user.friendCode || 'HOPS-7741';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  showToast(`Invite Code Copied: ${code}`, 'Share with friends to link squads');
}

function openGuildFriendModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('guild-friend-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeGuildFriendModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('guild-friend-modal');
  if (modal) modal.classList.add('hidden');
}

function submitGuildFriend() {
  const nameInput = document.getElementById('input-friend-name');
  const roleInput = document.getElementById('input-friend-role');
  const name = nameInput ? nameInput.value.trim() : '';
  const role = roleInput ? roleInput.value : 'Operative Ally';

  if (!name) {
    showToast("Please enter your friend's Callsign");
    return;
  }

  window.audioEngine.playChime();
  window.store.addGuildFriend(name, role);
  if (nameInput) nameInput.value = '';
  closeGuildFriendModal();
  renderGuildLeaderboard();
  showToast(`${name} joined Valkyrie Squad!`, 'Tap Boost beside their name for +15 XP');
}

function triggerProfileAnimations() {
  const duration = 800;
  const state = window.store.state;

  const streakEl = document.getElementById('stat-streak');
  if (streakEl) animateCounter(streakEl, 0, state.user.streak, duration, v => v + 'd');

  const accuracyEl = document.getElementById('stat-accuracy');
  if (accuracyEl) animateCounter(accuracyEl, 0, state.user.accuracy, duration, v => v + '%');

  const logsEl = document.getElementById('stat-logs');
  if (logsEl) animateCounter(logsEl, 0, state.user.questsCleared, duration, v => v);

  const bossesEl = document.getElementById('stat-bosses');
  if (bossesEl) animateCounter(bossesEl, 0, state.user.bossesSlain, duration, v => v);
}

// ==========================================
// OPERATIVE RANK & STATUS DOSSIER MODAL
// ==========================================
function openRankRoadmapModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('rank-roadmap-modal');
  const list = document.getElementById('rank-roadmap-list');
  if (!modal || !list) return;

  const state = window.store.state;
  const ladder = window.store.RANK_LADDER || window.RANK_LADDER || [];
  const userLevel = state.user.level || 1;

  // 1. Populate Live Operative Status in Dossier
  const nameEl = document.getElementById('dossier-user-name');
  const badgeEl = document.getElementById('dossier-rank-badge');
  const lvlBadge = document.getElementById('dossier-level-badge');
  const xpLabel = document.getElementById('dossier-xp-label');
  const xpBar = document.getElementById('dossier-xp-bar');
  const nextTitleEl = document.getElementById('dossier-next-title-label');

  if (nameEl) nameEl.textContent = state.user.name || 'Operative';
  const currentRank = window.store.getRankForLevel ? window.store.getRankForLevel(userLevel) : { title: state.user.rank, badge: 'RECRUIT' };
  if (badgeEl) badgeEl.textContent = currentRank.badge || 'OPERATIVE';
  if (lvlBadge) lvlBadge.textContent = `LVL ${userLevel}`;
  if (xpLabel) xpLabel.textContent = `${state.user.currentXp} / ${state.user.maxXp} XP`;
  const pct = Math.min(100, Math.round((state.user.currentXp / state.user.maxXp) * 100));
  if (xpBar) xpBar.style.width = `${pct}%`;

  const nextMilestone = window.store.getNextRankMilestone ? window.store.getNextRankMilestone(userLevel) : null;
  if (nextTitleEl) {
    if (nextMilestone && !nextMilestone.isMax && nextMilestone.level > userLevel) {
      nextTitleEl.textContent = `Next Unlock: ${nextMilestone.title} (Lvl ${nextMilestone.level})`;
    } else {
      nextTitleEl.textContent = `Apex Grandmaster Achieved · Unlimited Levels Active!`;
    }
  }

  const empEl = document.getElementById('dossier-emp-shields');
  if (empEl) {
    empEl.textContent = String(typeof state.user.empShields === 'number' ? state.user.empShields : 1);
  }

  // 2. Populate Live Multipliers Breakdown
  const multGrid = document.getElementById('dossier-multipliers-grid');
  if (multGrid && window.store.getMultiplierBreakdown) {
    const bd = window.store.getMultiplierBreakdown();
    multGrid.innerHTML = `
      <div class="bg-surface-container-low p-2 border border-outline-variant/30 flex flex-col">
        <span class="text-outline text-[11px] uppercase font-bold">Intensity Rank</span>
        <span class="text-on-surface font-bold font-mono text-sm">${bd.intensityMult.toFixed(2)}× Yield</span>
      </div>
      <div class="bg-surface-container-low p-2 border border-outline-variant/30 flex flex-col">
        <span class="text-outline text-[11px] uppercase font-bold">Streak Momentum</span>
        <span class="text-secondary font-bold font-mono text-sm">+${Math.round(bd.streakBonus * 100)}% Boost</span>
      </div>
      <div class="bg-surface-container-low p-2 border border-outline-variant/30 flex flex-col">
        <span class="text-outline text-[11px] uppercase font-bold">Daily Combo Chain</span>
        <span class="text-primary font-bold font-mono text-sm">+${Math.round(bd.comboBonus * 100)}% Stack</span>
      </div>
      <div class="bg-surface-container-low p-2 border border-outline-variant/30 flex flex-col">
        <span class="text-outline text-[11px] uppercase font-bold">Total Active Multiplier</span>
        <span class="text-primary font-bold font-mono text-sm">${bd.totalMultiplier.toFixed(2)}× Total</span>
      </div>
    `;
  }

  // 3. Populate Milestone Ladder (Milestones through Level 100)
  list.innerHTML = '';
  ladder.forEach(tier => {
    const unlocked = userLevel >= tier.level;
    const isCurrent = currentRank.title === tier.title;
    const row = document.createElement('div');
    row.className = `p-2.5 border flex items-center justify-between ${
      isCurrent
        ? 'bg-primary-container/20 border-primary ring-1 ring-primary text-on-surface'
        : unlocked
        ? 'bg-surface-container-low border-outline-variant/40 text-on-surface'
        : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant opacity-75'
    }`;
    row.innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="w-14 h-8 ${
          isCurrent ? 'bg-primary text-on-primary ring-2 ring-primary-container' : unlocked ? 'bg-surface-container-highest text-primary font-bold' : 'bg-surface-container-highest text-outline'
        } font-mono text-xs font-bold flex items-center justify-center">
          LVL ${tier.level}
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="font-label-md text-label-md font-bold text-on-surface">${tier.title}</span>
            ${isCurrent ? '<span class="px-1.5 py-0.2 bg-primary text-on-primary font-label-sm text-[11px] uppercase font-bold">CURRENT</span>' : ''}
          </div>
          <span class="font-body-sm text-[11px] text-outline font-semibold">${tier.perk}</span>
        </div>
      </div>
      <span class="font-label-sm text-[11px] uppercase font-bold px-2 py-0.5 ${
        unlocked ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-outline'
      }">
        ${unlocked ? 'Unlocked ✓' : `Lvl ${tier.level}`}
      </span>
    `;
    list.appendChild(row);
  });

  // Unlimited Level Progression footer indicator
  const unlimitedCard = document.createElement('div');
  unlimitedCard.className = 'p-2.5 bg-surface-container-low border border-dashed border-primary/50 flex items-center justify-between text-xs text-on-surface';
  unlimitedCard.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-primary text-[18px]">all_inclusive</span>
      <div class="flex flex-col">
        <span class="font-bold text-primary uppercase text-[11px]">Unlimited Level Progression (Lvl 101+)</span>
        <span class="text-outline text-[11px]">Levels continue infinitely beyond Level 100 with scaling XP</span>
      </div>
    </div>
    <span class="font-mono font-bold text-primary">∞</span>
  `;
  list.appendChild(unlimitedCard);

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function closeRankRoadmapModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('rank-roadmap-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

// 1-Tap Sharable Operative Battle Card PNG Generator
function exportOperativeBattleCard() {
  window.audioEngine.playTrophyFanfare();
  const state = window.store.state;
  const u = state.user;
  const b = state.boss;
  const bd = window.store.getMultiplierBreakdown ? window.store.getMultiplierBreakdown() : { totalMultiplier: 1.2 };

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');

  // Stone Light Tactical Background
  ctx.fillStyle = '#F4F4F1';
  ctx.fillRect(0, 0, 1080, 1350);

  // Heavy outer carbon frame
  ctx.fillStyle = '#111315';
  ctx.fillRect(48, 48, 984, 1254);
  ctx.fillStyle = '#F4F4F1';
  ctx.fillRect(56, 56, 968, 1238);

  // Top Header Band
  ctx.fillStyle = '#111315';
  ctx.fillRect(56, 56, 968, 160);

  ctx.fillStyle = '#F4F4F1';
  ctx.font = '700 58px sans-serif';
  ctx.fillText('HABITOPS', 100, 152);

  ctx.fillStyle = '#D91E2A';
  ctx.fillRect(730, 96, 250, 78);
  ctx.fillStyle = '#F4F4F1';
  ctx.font = '700 32px sans-serif';
  ctx.fillText(`LVL ${u.level || 1}`, 795, 146);

  // Operative Callsign & Prestige Title
  ctx.fillStyle = '#4A4E54';
  ctx.font = '600 24px sans-serif';
  ctx.fillText('OPERATIVE DOSSIER RECORD', 100, 290);

  ctx.fillStyle = '#111315';
  ctx.font = '700 76px sans-serif';
  ctx.fillText((u.name || 'Operative').toUpperCase(), 100, 380);

  ctx.fillStyle = '#D91E2A';
  ctx.font = '700 34px sans-serif';
  ctx.fillText((u.rank || 'Initiate Recruit').toUpperCase(), 100, 435);

  // 4 Telemetry Blocks
  const stats = [
    { label: 'ACTIVE STREAK', val: `${u.streak || 0} DAYS` },
    { label: 'TOTAL XP EARNED', val: `${(u.totalXpEarned || u.currentXp || 0).toLocaleString()} XP` },
    { label: 'BOSSES VANQUISHED', val: `${u.bossesSlain || 0} SLAIN` },
    { label: 'EMP STREAK SHIELDS', val: `${typeof u.empShields === 'number' ? u.empShields : 1} ARMED` }
  ];

  stats.forEach((st, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 100 + col * 450;
    const y = 500 + row * 210;

    ctx.fillStyle = '#E7E8E3';
    ctx.fillRect(x, y, 430, 180);

    ctx.fillStyle = '#4A4E54';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(st.label, x + 32, y + 60);

    ctx.fillStyle = '#111315';
    ctx.font = '700 52px sans-serif';
    ctx.fillText(st.val, x + 32, y + 135);
  });

  // Active Adversary Encounter Bar
  ctx.fillStyle = '#111315';
  ctx.fillRect(100, 950, 880, 210);

  ctx.fillStyle = '#F4F4F1';
  ctx.font = '600 22px sans-serif';
  ctx.fillText(`CURRENT ADVERSARY · TIER ${b.tier || 1}`, 136, 1005);

  ctx.font = '700 40px sans-serif';
  ctx.fillText((b.name || 'The Procrastination Titan').toUpperCase(), 136, 1060);

  const hpPct = b.maxHp ? Math.max(0, Math.min(1, b.currentHp / b.maxHp)) : 1;
  ctx.fillStyle = '#2C3036';
  ctx.fillRect(136, 1090, 808, 36);
  ctx.fillStyle = '#D91E2A';
  ctx.fillRect(136, 1090, Math.round(808 * hpPct), 36);

  // Footer Stamp
  ctx.fillStyle = '#4A4E54';
  ctx.font = '600 22px sans-serif';
  ctx.fillText(`MULTIPLIER ${(bd.totalMultiplier || 1.2).toFixed(2)}X · 2.0S HOLD-TO-STRIKE VERIFIED`, 100, 1235);

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `HabitOps_BattleCard_${(u.name || 'Operative').replace(/\s+/g, '_')}_Lvl${u.level || 1}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  showToast('Operative Battle Card Exported (PNG)', 'Ready to share on Instagram, TikTok, or Discord');
}

// ==========================================
// COLOR THEMES & NIGHT OPS DARK MODE
// ==========================================
function applySavedThemeAndMode() {
  const theme = window.store.state.user?.theme || 'cyan';
  const darkOps = !!window.store.state.user?.darkMode;
  document.body.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark-ops', darkOps);
  updateThemeSelectorUI(theme, darkOps);
}

function selectTheme(themeName) {
  window.audioEngine.playTap();
  window.store.setTheme(themeName);
  document.body.setAttribute('data-theme', themeName);
  updateThemeSelectorUI(themeName, !!window.store.state.user?.darkMode);
  syncAllViews(window.store.state);
  showToast(`HUD Color Theme Applied: ${themeName.toUpperCase()}`, 'Global tactical styling active');
}

function toggleDarkMode() {
  window.audioEngine.playTap();
  const currentDark = !!window.store.state.user?.darkMode;
  const newDark = !currentDark;
  window.store.setTheme(window.store.state.user?.theme || 'cyan', newDark);
  document.body.classList.toggle('dark-ops', newDark);
  updateThemeSelectorUI(window.store.state.user?.theme || 'cyan', newDark);
  showToast(newDark ? 'Night Ops Mode Active' : 'Day Ops Mode Active', 'Visual contrast calibrated');
}

function updateThemeSelectorUI(themeName, darkOps) {
  document.querySelectorAll('[data-theme-btn]').forEach(btn => {
    const t = btn.getAttribute('data-theme-btn');
    if (t === themeName) {
      btn.classList.add('border-2', 'border-primary');
    } else {
      btn.classList.remove('border-2', 'border-primary');
    }
  });
  const label = document.getElementById('dark-mode-label');
  const icon = document.getElementById('dark-mode-icon');
  if (label) label.textContent = darkOps ? 'Day Ops' : 'Night Ops';
  if (icon) icon.textContent = darkOps ? 'light_mode' : 'dark_mode';

  const headerIcon = document.getElementById('header-darkops-icon');
  const headerLabel = document.getElementById('header-darkops-label');
  if (headerIcon) headerIcon.textContent = darkOps ? 'light_mode' : 'dark_mode';
  if (headerLabel) headerLabel.textContent = darkOps ? 'DAY' : 'NIGHT';
}

function toggleDarkOps() {
  toggleDarkMode();
}

// ==========================================
// 4-TAB INTERACTIVE FIELD BRIEFING TUTORIAL
// ==========================================
let currentTutorialStep = 0;
const TUTORIAL_STEPS = [
  {
    badge: 'TAB 1 OF 4 · TODAY (COMMAND DECK)',
    icon: 'swords',
    title: 'Hold 2s to Strike & Slay Bosses',
    desc: 'Hold any protocol for 2 seconds to strike and earn stacked XP without accidental slips. Completed habits vanish to the Cleared tray, deal combat damage to your weekly Boss, and unlock Tomorrow\'s Loadout!'
  },
  {
    badge: 'TAB 2 OF 4 · REVIEW (TACTICAL CADENCE)',
    icon: 'monitoring',
    title: 'Analyze Weekly Consistency',
    desc: 'Inspect your live 7-day consistency bar chart, track peak execution rhythms, rate your Energy and Discipline, and commit weekly field reflections for bonus XP.'
  },
  {
    badge: 'TAB 3 OF 4 · HABITS (PROTOCOL LAB)',
    icon: 'terminal',
    title: 'Commission & Plan Protocols',
    desc: 'Commission custom habits with exact duration and scheduled times, browse 1-tap suggested routines from the tactical catalog, or schedule habits in advance on the full Interactive Calendar.'
  },
  {
    badge: 'TAB 4 OF 4 · PROFILE (OPERATIVE DOSSIER)',
    icon: 'person',
    title: 'Rank Titles, Guild & Themes',
    desc: 'Level up indefinitely while unlocking 9 prestigious military titles up to Level 100 Apex Grandmaster. Cheer your squad in the Guild, claim trophy vault rewards, and customize your HUD color theme.'
  }
];

function startInteractiveTutorial() {
  window.audioEngine.playTap();
  closeDrawer();
  currentTutorialStep = 0;
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.style.display = 'flex';
  renderTutorialStep();
}

function renderTutorialStep() {
  const stepData = TUTORIAL_STEPS[currentTutorialStep];
  if (!stepData) return;

  const badgeEl = document.getElementById('tutorial-step-badge');
  const iconEl = document.getElementById('tutorial-step-icon');
  const titleEl = document.getElementById('tutorial-step-title');
  const descEl = document.getElementById('tutorial-step-desc');
  const nextBtn = document.getElementById('tutorial-next-btn');
  const dotsEl = document.getElementById('tutorial-dots');

  if (badgeEl) badgeEl.textContent = stepData.badge;
  if (iconEl) iconEl.textContent = stepData.icon;
  if (titleEl) titleEl.textContent = stepData.title;
  if (descEl) descEl.textContent = stepData.desc;
  if (nextBtn) {
    nextBtn.textContent = currentTutorialStep === TUTORIAL_STEPS.length - 1 ? 'Get Started →' : 'Next Tab →';
  }
  if (dotsEl) {
    dotsEl.innerHTML = TUTORIAL_STEPS.map(
      (_, i) =>
        `<span class="${i === currentTutorialStep ? 'w-6 bg-primary' : 'w-2 bg-surface-container-highest'} h-1.5 transition-all"></span>`
    ).join('');
  }
}

function nextTutorialStep() {
  window.audioEngine.playTap();
  if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
    currentTutorialStep++;
    renderTutorialStep();
  } else {
    closeTutorial();
  }
}

function closeTutorial() {
  window.audioEngine.playChime();
  window.store.completeTutorial();
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
  navigateTo('today');
}

// ==========================================
// FEEDBACK & COMMERCIAL LEGAL MODALS
// ==========================================
let currentFeedbackStars = 5;

function openFeedbackModal() {
  window.audioEngine.playTap();
  closeDrawer();
  const modal = document.getElementById('feedback-modal');
  if (!modal) return;
  selectFeedbackRating(5);
  renderFeedbackHistory();
  modal.classList.remove('hidden');
}

function closeFeedbackModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('feedback-modal');
  if (modal) modal.classList.add('hidden');
}

function selectFeedbackRating(stars) {
  currentFeedbackStars = stars;
  document.querySelectorAll('#feedback-rating-bar [data-star]').forEach(btn => {
    const s = parseInt(btn.getAttribute('data-star'), 10);
    if (s <= stars) {
      btn.className =
        'py-1.5 border-2 border-primary bg-primary-container text-on-primary-container font-bold tactile-btn';
    } else {
      btn.className = 'py-1.5 border border-outline-variant bg-surface-container-low font-bold text-outline tactile-btn';
    }
  });
}

function renderFeedbackHistory() {
  const list = document.getElementById('feedback-history-list');
  if (!list) return;
  const logs = window.store.state.feedbackLog || [];
  list.innerHTML = '';
  logs.slice(0, 5).forEach(entry => {
    const div = document.createElement('div');
    div.className = 'bg-surface-container-low p-2 border border-outline-variant/30 text-[11px]';
    div.innerHTML = `
      <div class="flex justify-between font-bold text-primary">
        <span>${entry.category} (${'★'.repeat(entry.rating)})</span>
        <span>${entry.date}</span>
      </div>
      <p class="text-on-surface mt-0.5">${entry.message}</p>
    `;
    list.appendChild(div);
  });
}

function submitFeedbackForm() {
  const catEl = document.getElementById('input-feedback-category');
  const txtEl = document.getElementById('input-feedback-text');
  const message = txtEl ? txtEl.value.trim() : '';
  if (!message) {
    showToast('Please enter your feedback note before transmitting');
    return;
  }
  window.audioEngine.playTrophyFanfare();
  window.store.addFeedback(currentFeedbackStars, catEl ? catEl.value : 'General', message);
  if (txtEl) txtEl.value = '';
  renderFeedbackHistory();
  closeFeedbackModal();
  showToast('Feedback Logged! +20 XP Credited', 'Thank you for helping improve HabitOps');
}

const DEFAULT_GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc-HabitOpsFeedback/viewform';

function openGoogleFeedbackForm() {
  window.audioEngine.playTrophyFanfare();
  window.store.addXp(20);
  showToast('Google Form Opened! +20 XP Credited', 'Thank you for transmitting feedback');
  const customUrl = localStorage.getItem('habitops_google_form_url') || DEFAULT_GOOGLE_FORM_URL;
  window.open(customUrl, '_blank');
}

function openLegalModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('legal-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeLegalModal() {
  window.audioEngine.playTap();
  const modal = document.getElementById('legal-modal');
  if (modal) modal.classList.add('hidden');
}

function confirmFactoryReset() {
  window.audioEngine.playMechanicalThud();
  if (
    window.confirm(
      'Reset HabitOps to a fresh Level 1 state? Tip: You can use "Backup JSON" first if you want to save a copy of your progress.'
    )
  ) {
    window.store.resetAllData();
    window.location.reload();
  }
}

// ==========================================
// MODALS LOGIC (CREATE PROTOCOL, TROPHY, NOTES)
// ==========================================
function initModals() {
  const saveProtoBtn = document.getElementById('save-protocol-btn');
  if (saveProtoBtn) {
    saveProtoBtn.addEventListener('click', () => {
      window.audioEngine.playTap();
      const cad = document.getElementById('input-cadence').value;
      const tar = document.getElementById('input-target').value;
      const cue = document.getElementById('input-cue').value;
      window.store.updateWorkoutProtocol(cad, tar, cue);
      toggleProtocolModal(false);
      showToast('Protocol Parameters Updated', 'Synchronized to Strike Engine');
    });
  }

  const saveHabitBtn = document.getElementById('save-habit-btn');
  if (saveHabitBtn) {
    saveHabitBtn.addEventListener('click', () => {
      window.audioEngine.playTap();
      const titleEl = document.getElementById('input-habit-title');
      const groupEl = document.getElementById('input-habit-group');
      const timeEl = document.getElementById('input-habit-time');
      const durEl = document.getElementById('input-habit-duration');
      const diffEl = document.getElementById('input-habit-difficulty');
      const dateEl = document.getElementById('input-habit-date');
      const subEl = document.getElementById('input-habit-subtext');

      const title = titleEl ? titleEl.value.trim() : '';
      if (!title) {
        showToast('Please enter a Protocol Name');
        return;
      }

      const group = groupEl ? groupEl.value : 'afternoon';
      const execTime = timeEl ? timeEl.value : '08:00';
      const duration = durEl ? durEl.value : '30 mins';
      const difficulty = diffEl ? diffEl.value : 'standard';
      const subtext = subEl ? subEl.value.trim() : '';
      const todayKey = new Date().toISOString().slice(0, 10);
      const targetDate = dateEl && dateEl.value ? dateEl.value : todayKey;

      if (targetDate > todayKey) {
        // Schedule for future date in Calendar!
        const scheduled = window.store.scheduleHabitForDate(targetDate, {
          title,
          group,
          difficulty,
          execTime,
          duration,
          subtext
        });
        toggleAddHabitModal(false);
        renderWeeklySequenceStrip();
        renderQuestList();
        showToast(`Protocol Scheduled for ${targetDate}`, `${title} (+${scheduled.xp} XP)`);
      } else {
        const added = window.store.addCustomHabit({
          title,
          group,
          difficulty,
          execTime,
          duration,
          subtext
        });
        toggleAddHabitModal(false);
        renderHabitsLabGrid();
        renderSuggestedRoutinesGrid();
        renderQuestList();
        showToast('New Protocol Commissioned!', `${added.title} (+${added.xp} Base XP)`);
      }

      if (titleEl) titleEl.value = '';
      if (subEl) subEl.value = '';
    });
  }

  const saveNoteBtn = document.getElementById('save-note-btn');
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
      window.audioEngine.playTap();
      toggleLogNoteModal(false);
      showToast('Session Telemetry Note Logged', 'Saved to Local Ledger');
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
  modal.classList.toggle('hidden', !show);
}

function toggleAddHabitModal(show, prefillDateKey) {
  window.audioEngine.playTap();
  const modal = document.getElementById('add-habit-modal');
  if (!modal) return;
  if (show) {
    const dateInput = document.getElementById('input-habit-date');
    if (dateInput) {
      dateInput.value = prefillDateKey || new Date().toISOString().slice(0, 10);
    }
    renderModalPresetChips();
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function renderModalPresetChips() {
  const container = document.getElementById('modal-preset-chips');
  if (!container || !window.ROUTINE_CATALOG) return;
  container.innerHTML = '';

  window.ROUTINE_CATALOG.forEach(item => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'px-2.5 py-1 bg-surface-container-low border border-outline-variant hover:border-primary text-[11px] font-label-sm font-bold text-on-surface shrink-0 tactile-btn';
    btn.textContent = `+ ${item.title}`;
    btn.onclick = () => {
      window.audioEngine.playTap();
      const titleEl = document.getElementById('input-habit-title');
      const groupEl = document.getElementById('input-habit-group');
      const timeEl = document.getElementById('input-habit-time');
      const durEl = document.getElementById('input-habit-duration');
      const diffEl = document.getElementById('input-habit-difficulty');
      const subEl = document.getElementById('input-habit-subtext');

      if (titleEl) titleEl.value = item.title;
      if (groupEl) groupEl.value = item.group;
      if (timeEl) timeEl.value = item.execTime || '08:00';
      if (durEl) durEl.value = item.duration || '30 mins';
      if (diffEl) diffEl.value = item.difficulty || 'standard';
      if (subEl) subEl.value = item.subtext || '';
    };
    container.appendChild(btn);
  });
}

function openTrophyCard(cardElement, trophyId) {
  const trophy = window.store.state.trophies.find(t => t.id === trophyId);
  if (!trophy) return;

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

function openTrophyModal(trophy) {
  const modal = document.getElementById('trophy-modal');
  const box = document.getElementById('trophy-modal-box');
  if (!modal) return;

  const titleEl = document.getElementById('modal-title');
  const statusBadge = document.getElementById('modal-status-badge');
  const metricEl = document.getElementById('modal-metric');
  const rewardEl = document.getElementById('modal-reward');
  const descEl = document.getElementById('modal-desc');
  const iconEl = document.getElementById('modal-icon');
  const iconBgEl = document.getElementById('modal-icon-bg');
  const burstEl = document.getElementById('modal-burst');

  if (titleEl) titleEl.textContent = trophy.title;
  if (statusBadge) statusBadge.textContent = trophy.status;
  if (metricEl) metricEl.textContent = trophy.date;
  if (rewardEl) rewardEl.textContent = trophy.reward;
  if (descEl) descEl.textContent = trophy.desc;
  if (iconEl) iconEl.textContent = trophy.icon;
  if (iconBgEl) iconBgEl.style.backgroundColor = trophy.iconBg;
  if (iconEl) iconEl.style.color = trophy.iconColor;

  if (burstEl) {
    burstEl.classList.toggle('hidden', !trophy.isUnlocked);
    burstEl.classList.toggle('flex', !!trophy.isUnlocked);
  }

  modal.classList.remove('hidden');
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
    setTimeout(() => {
      if (modal.classList.contains('opacity-0')) {
        modal.classList.add('hidden');
      }
    }, 200);
  }
  if (box) box.classList.add('scale-95');
}

function replayModalAudio() {
  if (window.activeModalAudioType === 'boss') {
    window.audioEngine.playBossHorn();
  } else if (window.activeModalAudioType === 'fanfare') {
    window.audioEngine.playTrophyFanfare();
  } else {
    window.audioEngine.playMechanicalThud();
  }
}

// ==========================================
// BACKUP EXPORT & RESTORE IMPORT (JSON & CSV)
// ==========================================
function exportUserData(format = 'json') {
  window.audioEngine.playTap();
  const state = window.store.state;
  let dataStr = '';
  let filename = '';

  if (format === 'json') {
    dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    filename = `HabitOps_Backup_Lvl${state.user.level}_${ new Date().toISOString().slice(0, 10) }.json`;
  } else {
    let csv = 'ID,Title,Pillar,Time,Duration,Difficulty,BaseXP,CompletedToday\n';
    state.quests.forEach(q => {
      csv += `"${q.id}","${q.title}","${q.group}","${q.execTime || '08:00'}","${q.duration || '30m'}","${q.difficulty || 'standard'}",${q.xp},${q.completed}\n`;
    });
    dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    filename = `HabitOps_Protocols_${new Date().toISOString().slice(0, 10)}.csv`;
  }

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(
    format === 'json' ? 'Full Device Backup Saved (JSON)' : 'Spreadsheet Exported (CSV)',
    format === 'json' ? 'Use "Restore Backup" to load on any device' : 'Ready for Excel / Google Sheets'
  );
}

function triggerImportBackup() {
  window.audioEngine.playTap();
  const input = document.getElementById('backup-import-input');
  if (input) input.click();
}

function handleImportBackupFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || !parsed.user || !Array.isArray(parsed.quests)) {
        showToast('Invalid Backup File', 'Please select a valid HabitOps JSON backup');
        return;
      }
      window.store.data = parsed;
      window.store.save();
      window.audioEngine.playTrophyFanfare();
      showToast('Backup Restored Successfully!', `Welcome back, ${parsed.user.name} (LVL ${parsed.user.level})`);
      renderQuestList();
      renderWeeklySequenceStrip();
      renderHabitsLabGrid();
      renderProfileMultipliers();
      renderTrophiesVault();
      renderGuildLeaderboard();
    } catch (err) {
      showToast('Restore Failed', 'Could not parse JSON backup file');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// CENTRAL STATE SYNC ACROSS ALL SCREENS
// ==========================================
function syncAllViews(state) {
  // 1. Level, Rank Title & Division Badges
  document.querySelectorAll('[data-bind-level]').forEach(el => {
    el.textContent = `LVL ${state.user.level}`;
  });
  document.querySelectorAll('[data-bind-rank]').forEach(el => {
    el.textContent = state.user.rankTitle || 'Initiate Recruit';
  });
  document.querySelectorAll('[data-bind-division]').forEach(el => {
    el.textContent = state.user.division || 'TIER I · INITIATE';
  });
  document.querySelectorAll('[data-bind-phase]').forEach(el => {
    const phaseNum = String(Math.floor((state.user.level - 1) / 20) + 1).padStart(2, '0');
    el.textContent = `Active Protocol: Phase ${phaseNum}`;
  });

  // 2. Callsign & Custom Avatar Sync
  const callsign = state.user.name || state.onboardingData?.callsign || 'Operative';
  document.querySelectorAll('[data-bind-username]').forEach(el => {
    el.textContent = callsign;
  });

  if (state.user.avatarDataUrl) {
    const headerImg = document.getElementById('header-avatar-img');
    const headerIcon = document.getElementById('header-avatar-icon');
    const profileImg = document.getElementById('profile-avatar-img');
    if (headerImg) {
      headerImg.src = state.user.avatarDataUrl;
      headerImg.classList.remove('hidden');
    }
    if (headerIcon) headerIcon.classList.add('hidden');
    if (profileImg) profileImg.src = state.user.avatarDataUrl;
  }

  document.querySelectorAll('[data-bind-streak]').forEach(el => {
    el.textContent = `${state.user.streak} Days Streak`;
  });
  document.querySelectorAll('[data-bind-streak-short]').forEach(el => {
    el.textContent = `${state.user.streak} Days`;
  });

  // 3. XP Bars & Next Title Milestone
  const pct = Math.min(100, Math.round((state.user.currentXp / state.user.maxXp) * 100));

  // Tactical Header Level & XP Progress HUD Widget
  const headerXpCounter = document.getElementById('header-xp-counter');
  const headerXpBar = document.getElementById('header-xp-bar');
  if (headerXpCounter) headerXpCounter.textContent = `${state.user.currentXp} / ${state.user.maxXp} XP`;
  if (headerXpBar) headerXpBar.style.width = `${pct}%`;
  const todayLvlTitle = document.getElementById('today-level-progress-title');
  if (todayLvlTitle) todayLvlTitle.textContent = `LVL ${state.user.level} PROGRESS`;
  const heroXpLabel = document.getElementById('hero-xp-label');
  const heroXpBarToday = document.getElementById('hero-xp-bar-today');
  if (heroXpLabel) heroXpLabel.textContent = `${state.user.currentXp} / ${state.user.maxXp} XP`;
  if (heroXpBarToday) heroXpBarToday.style.width = `${pct}%`;

  const drawerXpBar = document.getElementById('drawer-xp-bar');
  const drawerXpLabel = document.getElementById('drawer-xp-label');
  if (drawerXpBar) drawerXpBar.style.width = `${pct}%`;
  if (drawerXpLabel) drawerXpLabel.textContent = `${state.user.currentXp} / ${state.user.maxXp} XP`;

  const profileXpLabel = document.getElementById('xp-counter-label');
  const profileXpBar = document.getElementById('hero-xp-bar');
  if (profileXpLabel) {
    profileXpLabel.textContent = `${state.user.currentXp} / ${state.user.maxXp} XP (${pct}%)`;
  }
  if (profileXpBar) {
    profileXpBar.style.width = `${pct}%`;
  }

  const nextMilestoneLabel = document.getElementById('next-milestone-label');
  const nextMilestoneXp = document.getElementById('next-milestone-xp');
  if (nextMilestoneLabel && window.store.getNextRankMilestone) {
    const nextRank = window.store.getNextRankMilestone(state.user.level);
    nextMilestoneLabel.textContent = `Next Title: Lvl ${nextRank.level} ${nextRank.title}`;
  }
  if (nextMilestoneXp) {
    const xpRemaining = Math.max(0, state.user.maxXp - state.user.currentXp);
    nextMilestoneXp.textContent = `+${xpRemaining} XP to Lvl ${state.user.level + 1}`;
  }

  // 4. Live Multipliers Pill in Today Hero
  if (window.store.getMultiplierBreakdown) {
    const bd = window.store.getMultiplierBreakdown();
    const multBadge = document.getElementById('active-multiplier-pill');
    const comboPill = document.getElementById('active-combo-pill');
    if (multBadge) multBadge.textContent = `${(bd.totalMultiplier || bd.totalBeforeCrit || 1.2).toFixed(2)}× Active XP Yield`;
    if (comboPill) comboPill.textContent = `Daily Combo +${Math.round((bd.comboBonus || 0) * 100)}% · Crit Armed`;
  }

  // 5. Boss Encounter Status
  const bossNameEl = document.getElementById('today-boss-name');
  const bossHpBar = document.getElementById('boss-hp-bar');
  const bossSubtext = document.getElementById('boss-subtext');
  if (bossNameEl && state.boss.name) {
    bossNameEl.textContent = `${state.boss.name} (Tier ${state.boss.tier || 1})`;
  }
  const hpPct = state.boss.maxHp
    ? Math.max(0, Math.min(100, Math.round((state.boss.currentHp / state.boss.maxHp) * 100)))
    : 100;
  if (bossHpBar) {
    bossHpBar.style.width = `${hpPct}%`;
    const bossCard = bossHpBar.closest('.bg-surface-container-lowest') || bossHpBar.parentElement;
    if (bossCard) {
      const isCritLow = hpPct > 0 && hpPct <= 25;
      const wasCritLow = bossCard.classList.contains('boss-critical-pulse');
      bossCard.classList.toggle('boss-critical-pulse', isCritLow);
      if (isCritLow && !wasCritLow && window.audioEngine && typeof window.audioEngine.playHeartbeatPulse === 'function') {
        window.audioEngine.playHeartbeatPulse();
      }
    }
  }
  const isSlain = state.boss.isSlain || state.boss.currentHp <= 0;
  const spawnBtn = document.getElementById('spawn-next-boss-btn');
  if (spawnBtn) {
    if (isSlain) {
      spawnBtn.classList.remove('hidden');
      spawnBtn.classList.add('inline-flex');
    } else {
      spawnBtn.classList.add('hidden');
      spawnBtn.classList.remove('inline-flex');
    }
  }

  if (bossSubtext) {
    if (isSlain) {
      bossSubtext.textContent = `0 / ${state.boss.maxHp} HP — BOSS VANQUISHED! Tap for Next Tier.`;
    } else if (hpPct > 0 && hpPct <= 25) {
      bossSubtext.textContent = `CRITICAL HP (${state.boss.currentHp} / ${state.boss.maxHp} HP) — Finish the adversary!`;
    } else {
      bossSubtext.textContent = `${state.boss.currentHp} / ${state.boss.maxHp} HP — Strike protocols to deal combat damage!`;
    }
  }

  // 6. Quick Stat Summary in Today
  const completedCount = state.quests.filter(q => q.completed).length;
  const summaryCount = document.getElementById('summary-quest-count');
  if (summaryCount) summaryCount.textContent = `${completedCount} / ${state.quests.length}`;

  const completedXp = state.quests
    .filter(q => q.completed)
    .reduce((sum, q) => sum + (q.lastEarnedXp || q.xp), 0);
  const summaryXp = document.getElementById('summary-xp-gained');
  if (summaryXp) summaryXp.textContent = `+${completedXp} XP`;

  ['morning', 'afternoon', 'evening'].forEach(group => {
    const done = state.quests.filter(q => q.group === group && q.completed).length;
    const total = state.quests.filter(q => q.group === group).length;
    const el = document.getElementById(`${group}-status-text`);
    if (el) {
      el.textContent = done === total && total > 0 ? `${done}/${total} Secured ✓` : `${done}/${total} Complete`;
    }
  });

  // 6b. Daily Momentum & Completion Summary Widget
  const totalProtocols = state.quests.length;
  const doneProtocols = completedCount;
  const momentumPctVal = totalProtocols > 0 ? Math.round((doneProtocols / totalProtocols) * 100) : 0;

  const momentumRing = document.getElementById('momentum-progress-ring');
  const momentumPctText = document.getElementById('momentum-pct-text');
  const momentumCountText = document.getElementById('momentum-count-text');
  const momentumSubtext = document.getElementById('momentum-subtext');
  const momentumXpText = document.getElementById('momentum-xp-text');
  const momentumMultPill = document.getElementById('momentum-mult-pill');

  if (momentumPctText) momentumPctText.textContent = `${momentumPctVal}%`;
  if (momentumCountText) {
    momentumCountText.textContent = `${doneProtocols} of ${totalProtocols} Protocols Secured (${momentumPctVal}%)`;
  }
  if (momentumSubtext) {
    if (totalProtocols === 0) {
      momentumSubtext.textContent = 'Active combat stack offline · Commission protocols in Protocols Lab';
    } else if (doneProtocols === totalProtocols) {
      momentumSubtext.textContent = '100% Sector Clearance achieved · Daily operational objectives neutralized!';
    } else {
      const remaining = totalProtocols - doneProtocols;
      momentumSubtext.textContent = `${remaining} protocol${remaining > 1 ? 's' : ''} remaining · Strike targets to advance sector`;
    }
  }
  if (momentumXpText) momentumXpText.textContent = `+${completedXp} XP`;
  if (momentumRing) {
    const circumference = 106.8;
    const strokeOffset = Math.max(0, circumference - (momentumPctVal / 100) * circumference);
    momentumRing.style.strokeDashoffset = `${strokeOffset}`;
    if (momentumPctVal === 100) {
      momentumRing.classList.remove('stroke-primary');
      momentumRing.classList.add('stroke-emerald-400');
    } else {
      momentumRing.classList.remove('stroke-emerald-400');
      momentumRing.classList.add('stroke-primary');
    }
  }
  if (momentumMultPill && window.store.getMultiplierBreakdown) {
    const bd = window.store.getMultiplierBreakdown();
    momentumMultPill.textContent = `${(bd.totalMultiplier || bd.totalBeforeCrit || 1.2).toFixed(2)}× MULT`;
  }

  // 7. Profile Stat Counters
  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = `${state.user.streak}d`;
  const accuracyEl = document.getElementById('stat-accuracy');
  if (accuracyEl) accuracyEl.textContent = `${state.user.accuracy}%`;
  const logsEl = document.getElementById('stat-logs');
  if (logsEl) logsEl.textContent = `${state.user.questsCleared}`;
  const bossesEl = document.getElementById('stat-bosses');
  if (bossesEl) bossesEl.textContent = `${state.user.bossesSlain}`;

  // 8. Daily Supply Chest Status
  const trophyBtn = document.getElementById('trophy-claim-btn');
  const trophyLabel = document.getElementById('trophy-btn-label');
  const trophyDesc = document.getElementById('trophy-desc');
  if (state.trophyClaimed) {
    if (trophyBtn) {
      trophyBtn.className =
        'h-8 px-3 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider flex items-center gap-1 shadow-sm';
    }
    if (trophyLabel) trophyLabel.textContent = 'Claimed ✓';
    if (trophyDesc) trophyDesc.textContent = 'Supply Chest Unlocked (+100 XP)';
  } else {
    if (trophyLabel) trophyLabel.textContent = completedCount >= 3 ? 'Claim +100 XP' : `${completedCount}/3 Done`;
    if (trophyDesc) trophyDesc.textContent = 'Complete 3 protocols today to unlock (+100 XP)';
  }

  updateRatingsUI();
}

// ============================================================
// BOOT MAIN APP
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
    initReminderScheduler();

    window.store.subscribe(syncAllViews);
    window.audioEngine.subscribe(updateAudioUI);
  } else {
    renderQuestList();
    renderWeeklySequenceStrip();
    renderHabitsLabGrid();
    renderSuggestedRoutinesGrid();
    syncAllViews(window.store.state);
  }

  syncAllViews(window.store.state);

  // Check for EMP Streak Shield auto-deployment notice
  if (window.store.state.empShieldNotice) {
    const empNotice = window.store.state.empShieldNotice;
    setTimeout(() => {
      if (window.audioEngine && typeof window.audioEngine.playEmpShield === 'function') {
        window.audioEngine.playEmpShield();
      }
      triggerTacticalNotification(
        `Tactical EMP Shield Deployed! Absorbed ${empNotice.shieldsUsed} missed day(s) — Streak protected & Boss regeneration blocked (${empNotice.remainingShields} shield(s) left).`
      );
      delete window.store.state.empShieldNotice;
      window.store.save();
    }, 900);
  }

  // Check for Boss recovery notice if user was away for days
  if (window.store.state.bossRecoveryNotice) {
    const notice = window.store.state.bossRecoveryNotice;
    setTimeout(() => {
      triggerTacticalNotification(
        `Adversary Report: Boss recovered +${notice.healHp} HP during ${notice.daysMissed} day(s) away${notice.isEnraged ? ' and became ENRAGED with +10% Max HP!' : '!'}`
      );
      delete window.store.state.bossRecoveryNotice;
      window.store.save();
    }, 1200);
  }

  // Launch 4-tab interactive briefing if user just finished onboarding for the first time
  if (!window.store.state.tutorialCompleted) {
    setTimeout(() => {
      startInteractiveTutorial();
    }, 600);
  }
}

// ============================================================
// ONBOARDING CONTROLLER (WITH "OTHER" THREAT & 10 ROUTINES)
// ============================================================
const OB = {
  step: 1,
  totalSteps: 6,
  data: {
    callsign: '',
    struggles: [],
    customStruggle: '',
    targets: [],
    intensity: 'operative'
  }
};

function initOnboarding() {
  const el = document.getElementById('view-onboarding');
  if (!el) return;
  el.style.cssText = '';
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.opacity = '1';

  const header = document.querySelector('header');
  const nav = document.querySelector('nav.fixed');
  if (header) header.style.display = 'none';
  if (nav) nav.style.display = 'none';

  const opTile = document.querySelector('.ob-intensity-tile[data-value="operative"]');
  if (opTile) opTile.classList.add('ob-selected');

  const deployBtn = document.getElementById('ob-deploy-btn');
  if (deployBtn) {
    deployBtn.disabled = false;
    deployBtn.innerHTML =
      '<span class="material-symbols-outlined text-[22px]" style="font-variation-settings:\'FILL\' 1">rocket_launch</span> Deploy Protocol';
  }

  obShowStep(1);
}

function obShowStep(n) {
  OB.step = n;
  document.querySelectorAll('.ob-step').forEach(s => {
    const sn = parseInt(s.dataset.step, 10);
    s.classList.toggle('hidden', sn !== n);
    if (sn === n) s.classList.add('ob-step-enter');
  });
  const bar = document.getElementById('ob-progress-bar');
  if (bar) bar.style.width = `${Math.round(((n - 1) / (OB.totalSteps - 1)) * 100)}%`;

  const ob = document.getElementById('view-onboarding');
  if (ob) ob.scrollTop = 0;
}

function obNext(fromStep) {
  try {
    window.audioEngine && window.audioEngine.playTap();
  } catch (e) {}

  if (fromStep === 1) {
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
  if (fromStep === 3) {
    const customInput = document.getElementById('ob-custom-struggle');
    OB.data.customStruggle = customInput ? customInput.value.trim() : '';
  }
  if (fromStep === 5) {
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

  // Show/hide Custom Threat Input when "other" is toggled
  const customBox = document.getElementById('ob-custom-struggle-box');
  if (customBox) {
    if (OB.data.struggles.includes('other')) {
      customBox.classList.remove('hidden');
      customBox.classList.add('flex');
      const inp = document.getElementById('ob-custom-struggle');
      if (inp) setTimeout(() => inp.focus(), 100);
    } else {
      customBox.classList.add('hidden');
      customBox.classList.remove('flex');
    }
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

  // Toggle Custom Routine form when "custom" routine tile is selected
  if (val === 'custom') {
    const customForm = document.getElementById('ob-custom-routine-form');
    if (customForm) {
      if (btn.classList.contains('ob-selected')) {
        customForm.classList.remove('hidden');
        const customTitleInp = document.getElementById('ob-custom-title');
        if (customTitleInp) setTimeout(() => customTitleInp.focus(), 100);
      } else {
        customForm.classList.add('hidden');
      }
    }
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
    doomscrolling: { name: 'The Feed Phantom', desc: 'Spawned from infinite scroll. Feeds on your attention.' },
    procrastination: { name: 'The Delay Daemon', desc: 'Thrives in the gap between intention and action.' },
    poor_sleep: { name: 'The Sleep Saboteur', desc: 'Drains your energy before the day begins.' },
    inconsistency: { name: 'The Streak Slayer', desc: 'Breaks your momentum every time you build it.' },
    low_motivation: { name: 'The Void Entity', desc: 'Makes everything feel pointless and far away.' },
    focus: { name: 'The Scatter Mind', desc: 'Fragments your concentration into a thousand pieces.' },
    stress: { name: 'The Overwhelm Titan', desc: 'Multiplies every problem until you freeze.' },
    sedentary: { name: 'The Inertia Behemoth', desc: 'Gets heavier the longer you stay still.' }
  };

  let bossEntry;
  if (OB.data.customStruggle) {
    bossEntry = {
      name: `The ${OB.data.customStruggle} Titan`,
      desc: `Forged from your custom threat assessment (${OB.data.customStruggle}). Defeated by daily discipline.`
    };
  } else {
    const primaryStruggle = OB.data.struggles.find(s => s !== 'other') || null;
    bossEntry = primaryStruggle
      ? bossMap[primaryStruggle] || { name: 'The Resistance', desc: 'An ancient enemy of progress.' }
      : { name: 'The Procrastination Titan', desc: 'Master of delay, enemy of all discipline.' };
  }

  const nameEl = document.getElementById('ob-boss-name');
  const descEl = document.getElementById('ob-boss-desc');
  if (nameEl) nameEl.textContent = bossEntry.name;
  if (descEl) descEl.textContent = bossEntry.desc;

  const intensityLabel = {
    recruit: 'Recruit Mode (0.85× XP)',
    operative: 'Operative Mode (1.0× XP)',
    striker: 'Striker Mode (1.25× XP)'
  };
  const summaryEl = document.getElementById('ob-summary-text');
  if (summaryEl) {
    summaryEl.textContent = `Starting at Level 1 in ${
      intensityLabel[OB.data.intensity] || 'Operative Mode'
    }. Every completed protocol deals combat damage to ${bossEntry.name} and builds your streak to unlock Prestige Titles through Level 100!`;
  }
}

function obDeploy() {
  const deployBtn = document.getElementById('ob-deploy-btn');
  if (deployBtn) {
    deployBtn.innerHTML =
      '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>Deploying Protocol…</span>';
    deployBtn.disabled = true;
  }

  // Collect custom routine if configured in onboarding
  if (OB.data.targets.includes('custom')) {
    const customTitle = document.getElementById('ob-custom-title')?.value || '';
    const customTime = document.getElementById('ob-custom-time')?.value || '08:00';
    const customDuration = document.getElementById('ob-custom-duration')?.value || '20m';
    const customGroup = document.getElementById('ob-custom-group')?.value || 'morning';
    if (customTitle.trim()) {
      OB.data.customRoutine = {
        title: customTitle.trim(),
        time: customTime,
        duration: customDuration,
        group: customGroup,
        subtext: 'Custom Personal Protocol'
      };
    }
  }

  try {
    window.store.completeOnboarding(OB.data);
  } catch (err) {
    console.warn('Store onboarding save warning:', err);
  }

  try {
    if (window.audioEngine && typeof window.audioEngine.playTrophyFanfare === 'function') {
      window.audioEngine.playTrophyFanfare();
    }
  } catch (err) {}

  const bar = document.getElementById('ob-progress-bar');
  if (bar) bar.style.width = '100%';

  setTimeout(() => {
    const ob = document.getElementById('view-onboarding');
    if (ob) {
      ob.style.transition = 'opacity 0.35s ease-out';
      ob.style.opacity = '0';
      setTimeout(() => {
        ob.style.display = 'none';
        const header = document.querySelector('header');
        const nav = document.querySelector('nav.fixed');
        if (header) header.style.display = '';
        if (nav) nav.style.display = '';

        bootMainApp();
        showToast(`Welcome, ${OB.data.callsign || 'Operative'}!`, 'Starting at Level 1 · All Protocols Online');
      }, 360);
    }
  }, 450);
}

function replayOnboardingFlow() {
  closeDrawer();
  initOnboarding();
}

// Global Snappy Keyboard Dismissal (Escape Key)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    const modals = [
      { id: 'boss-dossier-modal', close: closeBossDossierModal },
      { id: 'add-habit-modal', close: () => toggleAddHabitModal(false) },
      { id: 'protocol-modal', close: () => toggleProtocolModal(false) },
      { id: 'note-modal', close: () => toggleLogNoteModal(false) },
      { id: 'calendar-modal', close: closeCalendarModal },
      { id: 'rank-roadmap-modal', close: closeRankRoadmapModal },
      { id: 'trophy-modal', close: closeTrophyModal },
      { id: 'feedback-modal', close: closeFeedbackModal },
      { id: 'guild-friend-modal', close: closeGuildFriendModal },
      { id: 'legal-modal', close: closeLegalModal },
      { id: 'boss-victory-modal', close: closeBossVictoryAndDeployNext }
    ];
    for (const m of modals) {
      const el = document.getElementById(m.id);
      if (el && !el.classList.contains('hidden') && el.style.display !== 'none') {
        m.close();
        break;
      }
    }
    closeDrawer();
  }
});
