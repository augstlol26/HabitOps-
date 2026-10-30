// HabitOps - Central Reactive State Store, XP & Rank Engine (Unlimited Levels, Titles to Lvl 100)

// Unlimited level progression with limited prestige title ladder capping at Level 100 Apex Grandmaster
const RANK_LADDER = [
  { level: 1,   title: "Initiate Recruit",   phase: "Phase 01", badge: "RECRUIT",     perk: "Base Tactical HUD Unlocked" },
  { level: 5,   title: "Field Scout",        phase: "Phase 01", badge: "SCOUT",       perk: "+5% Crit Strike Chance" },
  { level: 10,  title: "Tactical Operative", phase: "Phase 02", badge: "OPERATIVE",   perk: "+5% Base XP Yield" },
  { level: 20,  title: "Shadow Striker",     phase: "Phase 02", badge: "STRIKER",     perk: "+10% Boss Combat Damage" },
  { level: 35,  title: "Vanguard Enforcer",  phase: "Phase 03", badge: "VANGUARD",    perk: "+10% Streak Momentum" },
  { level: 50,  title: "Phantom Commander",  phase: "Phase 04", badge: "COMMANDER",   perk: "+15% Crit Strike Damage" },
  { level: 70,  title: "Iron Sentinel",      phase: "Phase 05", badge: "SENTINEL",    perk: "2x Iron Will Streak Shield" },
  { level: 85,  title: "Cyber Marshall",     phase: "Phase 06", badge: "MARSHALL",    perk: "+20% All Active Multipliers" },
  { level: 100, title: "Apex Grandmaster",   phase: "PINNACLE", badge: "APEX MASTER", perk: "Supreme Apex Grandmaster Prestige Aura" }
];

// Controlled Difficulty Tiers
const DIFFICULTY_TIERS = {
  recon:    { id: "recon",    label: "Light Recon",       xp: 25,  critChance: 0.18, baseDmg: 8,  desc: "Quick <10m habit" },
  standard: { id: "standard", label: "Standard Protocol", xp: 45,  critChance: 0.25, baseDmg: 14, desc: "Core 15–30m routine" },
  heavy:    { id: "heavy",    label: "Heavy Assault",     xp: 70,  critChance: 0.32, baseDmg: 22, desc: "Intense 45–60m session" },
  elite:    { id: "elite",    label: "Elite Endurance",   xp: 100, critChance: 0.42, baseDmg: 30, desc: "High-difficulty 60m+ deep block" }
};

// Rich Suggested Routines Catalog
const ROUTINE_CATALOG = [
  { id: "hydrate",     category: "morning",     title: "Electrolyte Hydration",   subtext: "500ml water upon waking",          group: "morning",   time: "07:00", duration: "5m",  difficulty: "recon",    icon: "water_drop" },
  { id: "sunlight",    category: "morning",     title: "Morning Sunlight Walk",   subtext: "Circadian optic reset outdoors",   group: "morning",   time: "07:20", duration: "15m", difficulty: "standard", icon: "wb_sunny" },
  { id: "cold_shower", category: "cold",        title: "Cold Exposure Protocol",  subtext: "Unflinching vagal nerve reset",    group: "morning",   time: "07:40", duration: "5m",  difficulty: "standard", icon: "ac_unit" },
  { id: "breathing",   category: "mindfulness", title: "Tactical Box Breathing",  subtext: "4-4-4-4 autonomic calibration",    group: "morning",   time: "07:50", duration: "10m", difficulty: "recon",    icon: "self_improvement" },
  { id: "journal_am",  category: "journaling",  title: "Morning Mission Briefing",subtext: "Top 3 priorities locked in",       group: "morning",   time: "08:10", duration: "10m", difficulty: "recon",    icon: "edit_note" },
  { id: "deepwork",    category: "deepwork",    title: "Deep Work Sprint",        subtext: "Zero-distraction cognitive block", group: "afternoon", time: "10:00", duration: "60m", difficulty: "elite",    icon: "terminal" },
  { id: "skill_drill", category: "creative",    title: "Skill & Craft Mastery",   subtext: "Deliberate practice / coding",     group: "afternoon", time: "14:00", duration: "45m", difficulty: "heavy",    icon: "code" },
  { id: "mobility",    category: "mobility",    title: "Posture & Mobility Flow", subtext: "Thoracic & hip decompression",     group: "afternoon", time: "15:30", duration: "15m", difficulty: "standard", icon: "accessibility_new" },
  { id: "clean_fuel",  category: "nutrition",   title: "Clean Fuel / Zero Sugar", subtext: "Whole-food metabolic discipline",  group: "afternoon", time: "13:00", duration: "15m", difficulty: "standard", icon: "restaurant" },
  { id: "workout",     category: "physical",    title: "Deep Workout / Gym",      subtext: "Hypertrophy & functional output",  group: "afternoon", time: "17:30", duration: "45m", difficulty: "heavy",    icon: "fitness_center", isPriorityTarget: true },
  { id: "read",        category: "reading",     title: "Read 15 Pages",           subtext: "Non-fiction / mental expansion",   group: "evening",   time: "20:30", duration: "25m", difficulty: "standard", icon: "menu_book" },
  { id: "detox",       category: "detox",       title: "No Doomscrolling",        subtext: "Zero algorithmic feeds after 8PM", group: "evening",   time: "20:00", duration: "60m", difficulty: "heavy",    icon: "phonelink_off" },
  { id: "sunset",      category: "evening",     title: "Digital Sunset",          subtext: "Screens off · Blue light lock",    group: "evening",   time: "22:00", duration: "30m", difficulty: "standard", icon: "nightlight" }
];

// Boss Roster for progressive unlocks
const BOSS_ROSTER = [
  { name: "The Procrastination Titan", desc: "Thrives in the gap between intention and execution.", maxHp: 100, bonusXp: 200 },
  { name: "The Feed Phantom",          desc: "Spawned from infinite scroll. Drains focus reserves.", maxHp: 120, bonusXp: 250 },
  { name: "The Inertia Behemoth",      desc: "Grows heavier every hour you remain static.", maxHp: 140, bonusXp: 300 },
  { name: "The Scatter Mind",          desc: "Fragments attention across a dozen unfinished tabs.", maxHp: 160, bonusXp: 350 },
  { name: "The Void Entity",           desc: "Whispers that today's effort doesn't matter.", maxHp: 200, bonusXp: 450 }
];

function getTodayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMaxXpForLevel(level) {
  const lvl = Math.max(1, level);
  return Math.round(120 + (lvl - 1) * 35);
}

function getRankForLevel(level) {
  let current = RANK_LADDER[0];
  for (const r of RANK_LADDER) {
    if (level >= r.level) current = r;
  }
  return current;
}

function getNextRankMilestone(level) {
  for (const r of RANK_LADDER) {
    if (r.level > level) return r;
  }
  return {
    level: 100,
    title: "Apex Grandmaster",
    phase: "PINNACLE",
    badge: "APEX MASTER",
    perk: "Pinnacle Prestige Achieved · Unlimited Levels Active",
    isMax: true
  };
}

const DEFAULT_STATE = {
  version: 2,
  lastActiveDate: getTodayDateString(),
  tutorialCompleted: false,
  onboardingCompleted: false,
  onboardingData: {
    struggles: [],
    customStruggle: "",
    targets: ["morning", "deepwork", "physical", "evening"],
    intensity: "operative",
    callsign: "Operative"
  },
  user: {
    name: "Operative",
    avatar: "",
    friendCode: "OPS-" + Math.floor(1000 + Math.random() * 9000),
    rank: "Initiate Recruit",
    division: "Guild Valkyrie #1",
    protocolPhase: "Phase 01",
    level: 1,
    currentXp: 0,
    maxXp: 120,
    totalXpEarned: 0,
    streak: 0,
    personalBest: 0,
    accuracy: 100,
    questsCleared: 0,
    bossesSlain: 0,
    xpMultiplier: 1.2,
    dailyCombo: 0,
    empShields: 1,
    soundEnabled: true,
    theme: "cyan",
    darkMode: false,
    reminderTime: "07:30",
    notificationsEnabled: true,
    dailyClearClaimedDate: ""
  },
  boss: {
    name: "The Procrastination Titan",
    desc: "Thrives in the gap between intention and execution.",
    tier: 1,
    maxHp: 100,
    currentHp: 100,
    isSlain: false,
    bonusXp: 200
  },
  trophyClaimed: false,
  quests: [
    {
      id: "hydrate",
      title: "Electrolyte Hydration",
      subtext: "500ml water upon waking",
      time: "07:00",
      duration: "5m",
      difficulty: "recon",
      group: "morning",
      xp: 25,
      completed: false,
      isPriorityTarget: false,
      icon: "water_drop"
    },
    {
      id: "breathing",
      title: "Tactical Box Breathing",
      subtext: "4-4-4-4 autonomic calibration",
      time: "07:30",
      duration: "10m",
      difficulty: "recon",
      group: "morning",
      xp: 25,
      completed: false,
      isPriorityTarget: false,
      icon: "self_improvement"
    },
    {
      id: "workout",
      title: "Deep Workout / Gym",
      subtext: "Upper hypertrophy & functional output",
      time: "17:30",
      duration: "45m",
      difficulty: "heavy",
      group: "afternoon",
      xp: 70,
      completed: false,
      isPriorityTarget: true,
      icon: "fitness_center"
    },
    {
      id: "deepwork",
      title: "Deep Work Sprint",
      subtext: "Zero-distraction cognitive block",
      time: "10:00",
      duration: "60m",
      difficulty: "elite",
      group: "afternoon",
      xp: 100,
      completed: false,
      isPriorityTarget: false,
      icon: "terminal"
    },
    {
      id: "read",
      title: "Read 15 Pages",
      subtext: "Non-fiction / mental expansion",
      time: "20:30",
      duration: "25m",
      difficulty: "standard",
      group: "evening",
      xp: 45,
      completed: false,
      isPriorityTarget: false,
      icon: "menu_book"
    },
    {
      id: "sunset",
      title: "Digital Sunset",
      subtext: "Screens off · Blue light lock",
      time: "22:00",
      duration: "30m",
      difficulty: "standard",
      group: "evening",
      xp: 45,
      completed: false,
      isPriorityTarget: false,
      icon: "nightlight"
    }
  ],
  plannedCalendar: {},
  completionHistory: {},
  feedbackLog: [],
  workoutProtocol: {
    cadence: "Mon, Wed, Fri, Sat @ 17:30",
    target: "45 mins — Upper Hypertrophy / Functional Power",
    cue: "Leave gym shoes & water bottle by desk station at 17:00",
    tier: "Tier 1 / Initiate Striker",
    tierXp: 0,
    tierMaxXp: 500,
    totalSessions: 0,
    timeInvested: 0,
    todayLogged: false,
    ledger: [
      {
        id: "today",
        date: "Today's Session",
        duration: "45m",
        title: "Awaiting Execution Encounter",
        xp: "+70 XP",
        status: "Pending",
        details: {
          "Target Duration": "45 mins",
          "Target Zone": "Hypertrophy & Core",
          "Warmup": "Dynamic Mobility Prehab",
          "Priority Bonus": "Guaranteed Crit Strike"
        }
      }
    ]
  },
  review: {
    weekRange: "Current Tactical Cycle",
    weekNumber: "Cycle 01",
    rate: 0,
    streakFraction: "0/7",
    xpGained: 0,
    peakDay: "Today",
    lowestDay: "—",
    journalText: "",
    ratings: {
      energy: 4,
      discipline: 4,
      recovery: 4
    },
    blueprintCommitted: false
  },
  trophies: [
    {
      id: "first_blood",
      title: "First Strike Executed",
      status: "LOCKED",
      date: "Complete 1st Protocol",
      reward: "+50 XP",
      desc: "Execute your very first daily habit protocol in the tactical arena.",
      icon: "bolt",
      iconColor: "#00687a",
      iconBg: "#acedff",
      isUnlocked: false,
      isBoss: false,
      progress: 0,
      targetVal: 1
    },
    {
      id: "titan_slayer",
      title: "Boss Entity Slayer",
      status: "LOCKED",
      date: "Slay 1st Boss (0/1)",
      reward: "+200 XP",
      desc: "Deplete a weekly Boss Entity's HP bar to 0% through relentless daily protocol execution.",
      icon: "skull",
      iconColor: "#8c5000",
      iconBg: "#ffdcbf",
      isUnlocked: false,
      isBoss: true,
      progress: 0,
      targetVal: 1
    },
    {
      id: "dawn_patrol",
      title: "Dawn Patrol",
      status: "LOCKED",
      date: "0 / 10 Morning Quests",
      reward: "+150 XP",
      desc: "Complete 10 morning protocols. Demonstrates circadian synchronization and early-day dominance.",
      icon: "alarm_on",
      iconColor: "#00687a",
      iconBg: "#e2e7ff",
      isUnlocked: false,
      isBoss: false,
      progress: 0,
      targetVal: 10
    },
    {
      id: "centurion",
      title: "Centurion of Habit",
      status: "LOCKED",
      date: "0 / 50 Quests Cleared",
      reward: "+400 XP",
      desc: "Log 50 successful routine completions across all disciplines.",
      icon: "workspace_premium",
      iconColor: "#00687a",
      iconBg: "#acedff",
      isUnlocked: false,
      isBoss: false,
      progress: 0,
      targetVal: 50
    },
    {
      id: "iron_fortress",
      title: "Iron Fortress",
      status: "LOCKED",
      date: "0 / 7 Day Streak",
      reward: "+300 XP",
      desc: "Maintain an unbroken 7-day execution streak across your active protocols.",
      icon: "castle",
      iconColor: "#6d797d",
      iconBg: "#dae2fd",
      isUnlocked: false,
      isBoss: false,
      progress: 0,
      targetVal: 7
    }
  ],
  guild: [
    { id: "g_user", rank: 1, name: "Operative", title: "Initiate Recruit", level: 1, streak: "0d Streak", xp: 0, isUser: true, boostedToday: false, role: "Squad Leader" },
    { id: "g_elena", rank: 2, name: "Elena Vance", title: "Field Scout", level: 5, streak: "4d Streak", xp: 540, isUser: false, boostedToday: false, role: "Recon Specialist" },
    { id: "g_marcus", rank: 3, name: "Marcus Cole", title: "Initiate Recruit", level: 3, streak: "2d Streak", xp: 290, isUser: false, boostedToday: false, role: "Vanguard Support" }
  ]
};

class Store {
  constructor() {
    this.STORAGE_KEY = 'habitops_state_v2';
    this.LEGACY_KEY = 'habitops_state_v1';
    this.RANK_LADDER = RANK_LADDER;
    this.DIFFICULTY_TIERS = DIFFICULTY_TIERS;
    this.ROUTINE_CATALOG = ROUTINE_CATALOG;
    this.LEVEL_CAP = Infinity; // Unlimited level progression with title milestones up to Level 100
    this.subscribers = [];
    this.state = this.load();
    this.checkDayRollover();
    this.recalculateRanksAndTrophies();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return this.mergeWithDefaults(parsed);
      }
      // Check v1 legacy key, but strip fake hardcoded lvl 14 demo values
      const legacyRaw = localStorage.getItem(this.LEGACY_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
        if (legacy.onboardingCompleted) {
          fresh.onboardingCompleted = true;
          fresh.onboardingData = { ...fresh.onboardingData, ...(legacy.onboardingData || {}) };
          fresh.user.name = legacy.user?.name || legacy.onboardingData?.callsign || "Operative";
        }
        return fresh;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  mergeWithDefaults(parsed) {
    const base = JSON.parse(JSON.stringify(DEFAULT_STATE));
    return {
      ...base,
      ...parsed,
      user: { ...base.user, ...(parsed.user || {}) },
      boss: { ...base.boss, ...(parsed.boss || {}) },
      onboardingData: { ...base.onboardingData, ...(parsed.onboardingData || {}) },
      workoutProtocol: { ...base.workoutProtocol, ...(parsed.workoutProtocol || {}) },
      review: { ...base.review, ...(parsed.review || {}) },
      plannedCalendar: parsed.plannedCalendar || {},
      completionHistory: parsed.completionHistory || {},
      feedbackLog: parsed.feedbackLog || [],
      quests: Array.isArray(parsed.quests) && parsed.quests.length > 0 ? parsed.quests : base.quests,
      trophies: Array.isArray(parsed.trophies) && parsed.trophies.length > 0 ? parsed.trophies : base.trophies,
      guild: Array.isArray(parsed.guild) && parsed.guild.length > 0 ? parsed.guild : base.guild
    };
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state);
  }

  notify() {
    this.subscribers.forEach(cb => {
      try { cb(this.state); } catch (e) { console.error(e); }
    });
  }

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LEGACY_KEY);
    localStorage.removeItem('habitcraft_state_v1');
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }

  completeTutorial() {
    this.state.tutorialCompleted = true;
    this.save();
  }

  // Check if a new calendar day started; reset daily completions, apply boss recovery on days away & inject scheduled calendar tasks
  checkDayRollover() {
    const today = getTodayDateString();
    if (this.state.lastActiveDate !== today) {
      const prevDate = this.state.lastActiveDate;
      const completedYesterday = this.state.quests.filter(q => q.completed).length;

      // Calculate days missed
      let daysMissed = 1;
      try {
        const diffMs = new Date(today) - new Date(prevDate);
        daysMissed = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      } catch (e) {
        daysMissed = 1;
      }

      // Update streak based on yesterday's activity
      if (daysMissed === 1 && completedYesterday > 0) {
        this.state.user.streak += 1;
        if (this.state.user.streak > this.state.user.personalBest) {
          this.state.user.personalBest = this.state.user.streak;
        }
      } else if (daysMissed > 1 || (daysMissed === 1 && completedYesterday === 0 && this.state.user.streak > 0)) {
        const rawMissedDays = daysMissed > 1 ? (daysMissed - 1) : 1;
        const availableShields = typeof this.state.user.empShields === 'number' ? this.state.user.empShields : 1;
        const shieldsUsed = Math.min(availableShields, rawMissedDays);
        const unshieldedDays = rawMissedDays - shieldsUsed;

        if (shieldsUsed > 0) {
          this.state.user.empShields = availableShields - shieldsUsed;
          this.state.empShieldNotice = {
            shieldsUsed,
            remainingShields: this.state.user.empShields,
            fullyProtected: unshieldedDays === 0
          };
        }

        if (unshieldedDays > 0) {
          // User was away for more days than EMP shields could absorb! Reset streak
          this.state.user.streak = 0;

          // Boss recovers health by 15% per unshielded missed day
          const healHp = Math.round(this.state.boss.maxHp * 0.15 * unshieldedDays);
          const prevHp = this.state.boss.currentHp;
          this.state.boss.currentHp = Math.min(this.state.boss.maxHp, this.state.boss.currentHp + healHp);

          // If already at full health, boss enrages and slightly gains more max health (+10%)
          let enrageGain = 0;
          if (prevHp >= this.state.boss.maxHp) {
            enrageGain = Math.round(this.state.boss.maxHp * 0.10);
            this.state.boss.maxHp += enrageGain;
            this.state.boss.currentHp = this.state.boss.maxHp;
            this.state.boss.isEnraged = true;
          }

          this.state.bossRecoveryNotice = {
            daysMissed: unshieldedDays + 1,
            healHp,
            enrageGain,
            shieldsUsed,
            isEnraged: !!this.state.boss.isEnraged
          };
        }
      }

      // Reset quests for the new day
      this.state.quests = this.state.quests.filter(q => !q.oneOffDate || q.oneOffDate === today);
      this.state.quests.forEach(q => { q.completed = false; });
      this.state.user.dailyCombo = 0;

      // Inject any planned quests from plannedCalendar[today]
      const plannedForToday = this.state.plannedCalendar[today] || [];
      plannedForToday.forEach(pq => {
        if (!this.state.quests.some(q => q.id === pq.id)) {
          this.state.quests.push({ ...pq, completed: false, oneOffDate: today });
        }
      });

      // Rotate Priority Target to a random quest
      this.assignDailyPriorityTarget();

      // Reset daily guild boost flags
      this.state.guild.forEach(m => { m.boostedToday = false; });

      this.state.lastActiveDate = today;
      this.save();
    }
  }

  assignDailyPriorityTarget() {
    if (!this.state.quests.length) return;
    this.state.quests.forEach(q => { q.isPriorityTarget = false; });
    const idx = Math.floor(Math.random() * this.state.quests.length);
    this.state.quests[idx].isPriorityTarget = true;
  }

  // Calculate active XP multiplier breakdown
  getMultiplierBreakdown() {
    const u = this.state.user;
    const intensityMult = u.xpMultiplier || 1.2;
    const streakBonus = Math.min(0.5, (u.streak || 0) * 0.03); // +3% per streak day up to +50%
    const comboBonus = Math.min(0.35, (u.dailyCombo || 0) * 0.05); // +5% per completed task today up to +35%
    const rankPerkBonus = u.level >= 100 ? 0.20 : (u.level >= 10 ? 0.05 : 0);

    // Prime window check (morning before 10am or evening after 8pm)
    const hr = new Date().getHours();
    const primeBonus = (hr >= 5 && hr < 10) || (hr >= 20 && hr <= 23) ? 0.10 : 0;

    const totalMultiplier = +(intensityMult + streakBonus + comboBonus + rankPerkBonus + primeBonus).toFixed(2);
    return {
      intensityMult,
      streakBonus: +streakBonus.toFixed(2),
      comboBonus: +comboBonus.toFixed(2),
      rankPerkBonus,
      primeBonus,
      totalMultiplier,
      totalBeforeCrit: totalMultiplier,
      comboMult: +(1 + comboBonus).toFixed(2)
    };
  }

  // Grant XP & handle multi-level-ups (Unlimited levels)
  addXp(amount) {
    const cleanAmount = Math.max(0, Math.round(amount));
    const prevLevel = this.state.user.level;
    this.state.user.currentXp += cleanAmount;
    this.state.user.totalXpEarned = (this.state.user.totalXpEarned || 0) + cleanAmount;

    let leveledUp = false;
    let empAwarded = 0;
    while (this.state.user.currentXp >= this.state.user.maxXp) {
      this.state.user.currentXp -= this.state.user.maxXp;
      this.state.user.level += 1;
      this.state.user.maxXp = getMaxXpForLevel(this.state.user.level);
      leveledUp = true;
      if (this.state.user.level % 10 === 0) {
        this.state.user.empShields = (typeof this.state.user.empShields === 'number' ? this.state.user.empShields : 1) + 1;
        empAwarded += 1;
      }
    }

    const rankInfo = getRankForLevel(this.state.user.level);
    const prevRankInfo = getRankForLevel(prevLevel);
    const newTitleUnlocked = rankInfo.title !== prevRankInfo.title;

    this.state.user.rank = rankInfo.title;
    this.state.user.rankTitle = rankInfo.title;
    this.state.user.protocolPhase = rankInfo.phase;

    this.recalculateRanksAndTrophies();
    this.save();

    return {
      leveledUp,
      prevLevel,
      newLevel: this.state.user.level,
      newTitleUnlocked,
      empAwarded,
      rankTitle: rankInfo.title,
      rankBadge: rankInfo.badge,
      rankPerk: rankInfo.perk
    };
  }

  subtractXp(amount) {
    const cleanAmount = Math.max(0, Math.round(amount));
    this.state.user.currentXp = Math.max(0, this.state.user.currentXp - cleanAmount);
    this.state.user.totalXpEarned = Math.max(0, (this.state.user.totalXpEarned || 0) - cleanAmount);
    this.recalculateRanksAndTrophies();
    this.save();
  }

  recalculateRanksAndTrophies() {
    const u = this.state.user;
    const rankInfo = getRankForLevel(u.level);
    u.rank = rankInfo.title;
    u.protocolPhase = rankInfo.phase;
    u.maxXp = getMaxXpForLevel(u.level);

    // Sync user in guild & sort by XP descending
    const userInGuild = this.state.guild.find(m => m.isUser);
    if (userInGuild) {
      userInGuild.name = u.name || "Operative";
      userInGuild.title = u.rank;
      userInGuild.level = u.level;
      userInGuild.streak = `${u.streak}d Streak`;
      userInGuild.xp = u.totalXpEarned || u.currentXp;
    }
    this.state.guild.sort((a, b) => b.xp - a.xp);
    this.state.guild.forEach((m, idx) => { m.rank = idx + 1; });

    // Record today's completion history for the calendar & weekly review
    const today = getTodayDateString();
    const totalQ = this.state.quests.length || 1;
    const clearedQ = this.state.quests.filter(q => q.completed).length;
    this.state.completionHistory[today] = {
      cleared: clearedQ,
      total: totalQ,
      pct: Math.round((clearedQ / totalQ) * 100),
      xp: this.state.user.totalXpEarned || 0
    };

    // Update accuracy percentage based on history
    const days = Object.values(this.state.completionHistory);
    if (days.length > 0) {
      const avgPct = Math.round(days.reduce((s, d) => s + d.pct, 0) / days.length);
      this.state.user.accuracy = Math.max(10, avgPct);
    }

    // Update Weekly Review metrics dynamically
    this.state.review.rate = Math.round((clearedQ / totalQ) * 100);
    const activeDaysCount = days.filter(d => d.cleared > 0).length;
    this.state.review.streakFraction = `${Math.min(7, activeDaysCount)}/7`;
    this.state.review.xpGained = this.state.user.totalXpEarned || 0;

    // Evaluate Trophies dynamically
    this.state.trophies.forEach(t => {
      if (t.id === 'first_blood') {
        t.progress = Math.min(100, u.questsCleared >= 1 ? 100 : 0);
        if (u.questsCleared >= 1 && !t.isUnlocked) {
          t.isUnlocked = true;
          t.status = "UNLOCKED";
          t.date = "Unlocked · Active";
        }
      } else if (t.id === 'titan_slayer') {
        t.progress = Math.min(100, u.bossesSlain >= 1 ? 100 : Math.round((100 - this.state.boss.currentHp)));
        if (u.bossesSlain >= 1 && !t.isUnlocked) {
          t.isUnlocked = true;
          t.status = "UNLOCKED";
          t.date = `${u.bossesSlain} Boss(es) Slain`;
        } else if (!t.isUnlocked) {
          t.date = `Boss HP: ${100 - this.state.boss.currentHp}% Dealt`;
        }
      } else if (t.id === 'dawn_patrol') {
        const morningCleared = u.morningCleared || 0;
        t.progress = Math.min(100, Math.round((morningCleared / 10) * 100));
        if (morningCleared >= 10 && !t.isUnlocked) {
          t.isUnlocked = true;
          t.status = "UNLOCKED";
          t.date = "10/10 Morning Protocols";
        } else if (!t.isUnlocked) {
          t.date = `${morningCleared} / 10 Morning Quests`;
        }
      } else if (t.id === 'centurion') {
        t.progress = Math.min(100, Math.round((u.questsCleared / 50) * 100));
        if (u.questsCleared >= 50 && !t.isUnlocked) {
          t.isUnlocked = true;
          t.status = "UNLOCKED";
          t.date = `${u.questsCleared} Quests Cleared`;
        } else if (!t.isUnlocked) {
          t.date = `${u.questsCleared} / 50 Quests`;
        }
      } else if (t.id === 'iron_fortress') {
        t.progress = Math.min(100, Math.round((u.streak / 7) * 100));
        if (u.streak >= 7 && !t.isUnlocked) {
          t.isUnlocked = true;
          t.status = "UNLOCKED";
          t.date = `${u.streak}d Unbroken Streak`;
        } else if (!t.isUnlocked) {
          t.date = `${u.streak} / 7 Day Streak`;
        }
      }
    });
  }

  toggleQuest(questId) {
    const quest = this.state.quests.find(q => q.id === questId);
    if (!quest) return null;

    const willBeCompleted = !quest.completed;
    quest.completed = willBeCompleted;

    const tierInfo = DIFFICULTY_TIERS[quest.difficulty] || DIFFICULTY_TIERS.standard;
    let earnedXp = quest.xp || tierInfo.xp;
    let isCritical = false;
    let bossDamage = tierInfo.baseDmg;
    let levelResult = null;
    let bossResult = null;

    if (willBeCompleted) {
      // If first completion of the day and streak is 0, kick off Day 1 streak!
      const completedTodayCount = this.state.quests.filter(q => q.completed).length;
      if (completedTodayCount === 1 && this.state.user.streak === 0) {
        this.state.user.streak = 1;
        this.state.user.personalBest = Math.max(1, this.state.user.personalBest);
      }

      // Calculate multipliers & Critical Boss Strike chance
      const mult = this.getMultiplierBreakdown();
      const critChance = quest.isPriorityTarget ? 1.0 : Math.min(0.65, tierInfo.critChance + (this.state.user.streak * 0.01));
      isCritical = Math.random() < critChance;

      const critMult = isCritical ? 1.5 : 1.0;
      earnedXp = Math.round(quest.xp * mult.totalMultiplier * critMult);
      quest.lastEarnedXp = earnedXp;

      bossDamage = isCritical ? Math.round(tierInfo.baseDmg * 2.2) : tierInfo.baseDmg;
      quest.lastBossDamage = bossDamage;

      this.state.user.dailyCombo = (this.state.user.dailyCombo || 0) + 1;
      this.state.user.questsCleared += 1;
      if (quest.group === 'morning') {
        this.state.user.morningCleared = (this.state.user.morningCleared || 0) + 1;
      }

      levelResult = this.addXp(earnedXp);
      bossResult = this.damageBoss(bossDamage);

      // Sync workout protocol if it's workout quest
      if (questId === 'workout' || quest.icon === 'fitness_center') {
        this.state.workoutProtocol.todayLogged = true;
        this.state.workoutProtocol.totalSessions += 1;
        this.state.workoutProtocol.timeInvested = +(this.state.workoutProtocol.timeInvested + 0.75).toFixed(2);
        this.state.workoutProtocol.tierXp = Math.min(this.state.workoutProtocol.tierMaxXp, this.state.workoutProtocol.tierXp + earnedXp);
        const todayLedger = this.state.workoutProtocol.ledger.find(l => l.id === 'today');
        if (todayLedger) {
          todayLedger.status = 'Completed';
          todayLedger.title = `Executed (${quest.duration || '45m'} • +${earnedXp} XP)`;
          todayLedger.xp = `+${earnedXp} XP`;
        }
      }
    } else {
      const revertXp = quest.lastEarnedXp || quest.xp;
      const revertDmg = quest.lastBossDamage || tierInfo.baseDmg;
      this.subtractXp(revertXp);
      this.state.user.questsCleared = Math.max(0, this.state.user.questsCleared - 1);
      this.state.user.dailyCombo = Math.max(0, (this.state.user.dailyCombo || 1) - 1);
      this.state.boss.currentHp = Math.min(this.state.boss.maxHp, this.state.boss.currentHp + revertDmg);

      if (questId === 'workout' || quest.icon === 'fitness_center') {
        this.state.workoutProtocol.todayLogged = false;
        this.state.workoutProtocol.totalSessions = Math.max(0, this.state.workoutProtocol.totalSessions - 1);
        this.state.workoutProtocol.timeInvested = Math.max(0, +(this.state.workoutProtocol.timeInvested - 0.75).toFixed(2));
        this.state.workoutProtocol.tierXp = Math.max(0, this.state.workoutProtocol.tierXp - revertXp);
        const todayLedger = this.state.workoutProtocol.ledger.find(l => l.id === 'today');
        if (todayLedger) {
          todayLedger.status = 'Pending';
          todayLedger.title = 'Awaiting Execution Encounter';
        }
      }
    }

    const allCompleted = this.state.quests.length > 0 && this.state.quests.every(q => q.completed);

    this.recalculateRanksAndTrophies();
    this.save();

    return {
      quest,
      isCompleted: willBeCompleted,
      earnedXp,
      isCritical,
      wasCrit: isCritical,
      bossDamage,
      bossSlainNow: bossResult?.wasSlain || false,
      revertedXp: willBeCompleted ? 0 : (quest.lastEarnedXp || tierInfo.xp),
      totalMultiplier: willBeCompleted && mult ? mult.totalMultiplier : 1.0,
      allCompleted,
      levelResult,
      bossResult
    };
  }

  damageBoss(damageAmount) {
    const prev = this.state.boss.currentHp;
    this.state.boss.currentHp = Math.max(0, this.state.boss.currentHp - damageAmount);
    const wasSlain = prev > 0 && this.state.boss.currentHp === 0;
    if (wasSlain) {
      this.state.boss.isSlain = true;
      this.state.user.bossesSlain += 1;
      this.addXp(this.state.boss.bonusXp || 200);
    }
    this.save();
    return {
      currentHp: this.state.boss.currentHp,
      maxHp: this.state.boss.maxHp,
      wasSlain
    };
  }

  // Spawn Next Tier Boss when current boss is slain
  spawnNextBoss() {
    const nextTier = (this.state.boss.tier || 1) + 1;
    const template = BOSS_ROSTER[(nextTier - 1) % BOSS_ROSTER.length];
    const scaledHp = Math.round(template.maxHp * (1 + (nextTier - 1) * 0.15));
    const scaledBounty = Math.round(template.bonusXp * (1 + (nextTier - 1) * 0.2));

    this.state.boss = {
      name: `${template.name} Mk.${nextTier}`,
      desc: template.desc,
      tier: nextTier,
      maxHp: scaledHp,
      currentHp: scaledHp,
      isSlain: false,
      bonusXp: scaledBounty
    };
    this.save();
    return this.state.boss;
  }

  // Add Custom Habit with controlled difficulty tiers & separate time/duration fields
  addCustomHabit(habitData) {
    const tier = DIFFICULTY_TIERS[habitData.difficulty] || DIFFICULTY_TIERS.standard;
    const timeStr = habitData.time || "09:00";
    const durStr = habitData.duration || "15m";
    const descPart = habitData.subtext ? `${habitData.subtext} · ` : "";
    const formattedSubtext = `${descPart}${durStr} @ ${timeStr}`;

    const newId = 'habit_' + Date.now();
    const habit = {
      id: newId,
      title: habitData.title,
      subtext: formattedSubtext,
      time: timeStr,
      duration: durStr,
      difficulty: tier.id,
      group: habitData.group || "afternoon",
      xp: tier.xp,
      completed: false,
      isPriorityTarget: false,
      icon: habitData.icon || "bolt"
    };

    if (habitData.scheduledDate && habitData.scheduledDate !== getTodayDateString()) {
      // Save to future date in plannedCalendar
      if (!this.state.plannedCalendar[habitData.scheduledDate]) {
        this.state.plannedCalendar[habitData.scheduledDate] = [];
      }
      this.state.plannedCalendar[habitData.scheduledDate].push(habit);
    } else {
      this.state.quests.push(habit);
    }

    this.save();
    return habit;
  }

  deleteHabit(habitId) {
    this.state.quests = this.state.quests.filter(q => q.id !== habitId);
    this.save();
  }

  // Plan habit for a specific future date on the Calendar
  scheduleHabitForDate(dateStr, habitTemplate) {
    if (!this.state.plannedCalendar[dateStr]) {
      this.state.plannedCalendar[dateStr] = [];
    }
    const tier = DIFFICULTY_TIERS[habitTemplate.difficulty] || DIFFICULTY_TIERS.standard;
    const item = {
      id: 'plan_' + Date.now() + '_' + Math.floor(Math.random() * 100),
      title: habitTemplate.title,
      subtext: `${habitTemplate.subtext || 'Scheduled Protocol'} · ${habitTemplate.duration || '20m'} @ ${habitTemplate.time || '09:00'}`,
      time: habitTemplate.time || '09:00',
      duration: habitTemplate.duration || '20m',
      difficulty: tier.id,
      group: habitTemplate.group || 'morning',
      xp: tier.xp,
      icon: habitTemplate.icon || 'event_available',
      scheduledDate: dateStr
    };
    this.state.plannedCalendar[dateStr].push(item);

    // If scheduled for today, also push to active quests
    if (dateStr === getTodayDateString()) {
      this.state.quests.push({ ...item, completed: false });
    }
    this.save();
    return item;
  }

  removeScheduledHabit(dateStr, itemId) {
    if (this.state.plannedCalendar[dateStr]) {
      this.state.plannedCalendar[dateStr] = this.state.plannedCalendar[dateStr].filter(i => i.id !== itemId);
      this.save();
    }
  }

  getTomorrowQuestsPreview() {
    const tom = getTomorrowDateString();
    const planned = this.state.plannedCalendar[tom] || [];
    const recurring = this.state.quests.filter(q => !q.oneOffDate).map(q => ({
      ...q,
      isRecurring: true
    }));
    return [...planned, ...recurring];
  }

  // Profile Avatar Upload
  setAvatar(dataUrl) {
    this.state.user.avatar = dataUrl;
    this.save();
  }

  // Theme & Dark Mode
  setTheme(themeName, darkMode = this.state.user.darkMode) {
    this.state.user.theme = themeName;
    this.state.user.darkMode = !!darkMode;
    this.save();
  }

  // Guild Friends System
  addGuildFriend(name, role = "Tactical Ally", friendCode = "") {
    const newFriend = {
      id: 'g_' + Date.now(),
      rank: this.state.guild.length + 1,
      name: name.trim(),
      title: "Field Scout",
      level: Math.max(1, this.state.user.level + Math.floor(Math.random() * 3) - 1),
      streak: "1d Streak",
      xp: Math.max(50, (this.state.user.totalXpEarned || 100) + Math.floor(Math.random() * 200) - 80),
      isUser: false,
      boostedToday: false,
      role: role || "Tactical Ally",
      code: friendCode || ("OPS-" + Math.floor(1000 + Math.random() * 9000))
    };
    this.state.guild.push(newFriend);
    this.recalculateRanksAndTrophies();
    this.save();
    return newFriend;
  }

  boostGuildFriend(friendId) {
    const friend = this.state.guild.find(m => m.id === friendId && !m.isUser);
    if (!friend || friend.boostedToday) return null;
    friend.boostedToday = true;
    friend.xp += 15;
    const lvlRes = this.addXp(15);
    this.save();
    return { friend, bonusXp: 15, levelResult: lvlRes };
  }

  removeGuildFriend(friendId) {
    this.state.guild = this.state.guild.filter(m => m.id !== friendId || m.isUser);
    this.recalculateRanksAndTrophies();
    this.save();
  }

  // Feedback submission
  addFeedback(entry) {
    const item = {
      id: 'fb_' + Date.now(),
      date: new Date().toLocaleDateString(),
      category: entry.category || 'Feature Idea',
      rating: entry.rating || 5,
      message: entry.message || ''
    };
    this.state.feedbackLog.unshift(item);
    this.addXp(20); // Reward +20 XP for contributing operative feedback
    this.save();
    return item;
  }

  updateWorkoutProtocol(cadence, target, cue) {
    this.state.workoutProtocol.cadence = cadence;
    this.state.workoutProtocol.target = target;
    this.state.workoutProtocol.cue = cue;
    this.save();
  }

  saveReflection(text, ratings) {
    this.state.review.journalText = text;
    if (ratings) {
      this.state.review.ratings = { ...this.state.review.ratings, ...ratings };
    }
    this.save();
  }

  commitBlueprint() {
    this.state.review.blueprintCommitted = true;
    this.save();
  }

  claimTrophyChest() {
    if (this.state.trophyClaimed) return false;
    this.state.trophyClaimed = true;
    this.addXp(100);
    this.save();
    return true;
  }

  // Onboarding with Custom Threat Assessment & Customized Starting Routines
  completeOnboarding(data) {
    this.state.onboardingCompleted = true;
    this.state.onboardingData = {
      callsign:       data.callsign       || 'Operative',
      struggles:      data.struggles      || [],
      customStruggle: data.customStruggle || '',
      targets:        data.targets        || [],
      intensity:      data.intensity      || 'operative'
    };

    // Genuine Level 1 start
    this.state.user.name = data.callsign || 'Operative';
    this.state.user.level = 1;
    this.state.user.currentXp = 0;
    this.state.user.maxXp = getMaxXpForLevel(1);
    this.state.user.totalXpEarned = 0;
    this.state.user.streak = 0;
    this.state.user.questsCleared = 0;
    this.state.user.bossesSlain = 0;

    // XP multiplier based on intensity
    const multiplierMap = { recruit: 1.0, operative: 1.2, striker: 1.5 };
    this.state.user.xpMultiplier = multiplierMap[data.intensity] || 1.2;

    // Personalise boss name from struggles or custom struggle
    const bossMap = {
      doomscrolling:  { name: 'The Feed Phantom',      desc: 'Spawned from infinite scroll. Feeds on your attention.' },
      procrastination:{ name: 'The Delay Daemon',       desc: 'Thrives in the gap between intention and action.' },
      poor_sleep:     { name: 'The Sleep Saboteur',     desc: 'Drains your energy before the day begins.' },
      inconsistency:  { name: 'The Streak Slayer',      desc: 'Breaks your momentum every time you build it.' },
      low_motivation: { name: 'The Void Entity',        desc: 'Makes everything feel pointless and far away.' },
      focus:          { name: 'The Scatter Mind',       desc: 'Fragments your concentration into a thousand pieces.' },
      stress:         { name: 'The Overwhelm Titan',    desc: 'Multiplies every problem until you freeze.' },
      sedentary:      { name: 'The Inertia Behemoth',   desc: 'Gets heavier the longer you stay still.' }
    };

    if (data.customStruggle && data.customStruggle.trim()) {
      const cleanCustom = data.customStruggle.trim();
      this.state.boss.name = `The ${cleanCustom} Titan`;
      this.state.boss.desc = `Custom adversary born from ${cleanCustom}. Defeated by daily discipline.`;
    } else {
      const primaryStruggle = (data.struggles || []).find(s => s !== 'other');
      const bossEntry = bossMap[primaryStruggle] || { name: 'The Procrastination Titan', desc: 'Master of delay, enemy of all discipline.' };
      this.state.boss.name = bossEntry.name;
      this.state.boss.desc = bossEntry.desc;
    }

    this.state.boss.maxHp = 100;
    this.state.boss.currentHp = 100;
    this.state.boss.isSlain = false;

    // Build personalized quests from selected targets in ROUTINE_CATALOG
    if (Array.isArray(data.targets) && data.targets.length > 0) {
      const matched = ROUTINE_CATALOG.filter(r => data.targets.includes(r.category));
      if (matched.length >= 3) {
        this.state.quests = matched.map((r, i) => {
          const tier = DIFFICULTY_TIERS[r.difficulty] || DIFFICULTY_TIERS.standard;
          return {
            id: r.id,
            title: r.title,
            subtext: `${r.subtext} · ${r.duration} @ ${r.time}`,
            time: r.time,
            duration: r.duration,
            difficulty: r.difficulty,
            group: r.group,
            xp: tier.xp,
            completed: false,
            isPriorityTarget: i === 0,
            icon: r.icon
          };
        });
      }
    }

    // Include Custom Routine if configured during onboarding
    if (data.customRoutine && data.customRoutine.title && data.customRoutine.title.trim()) {
      const cr = data.customRoutine;
      const tier = DIFFICULTY_TIERS[cr.difficulty || 'standard'] || DIFFICULTY_TIERS.standard;
      const customId = 'custom_ob_' + Date.now();
      this.state.quests.push({
        id: customId,
        title: cr.title.trim(),
        subtext: `${cr.subtext || 'Custom Personal Protocol'} · ${cr.duration || '20m'} @ ${cr.time || '08:00'}`,
        time: cr.time || '08:00',
        duration: cr.duration || '20m',
        difficulty: tier.id,
        group: cr.group || 'morning',
        xp: tier.xp,
        completed: false,
        isPriorityTarget: false,
        icon: cr.icon || 'star'
      });
    }

    this.assignDailyPriorityTarget();
    this.recalculateRanksAndTrophies();
    this.save();
    return this.state;
  }
}

// Global window exposure
window.RANK_LADDER = RANK_LADDER;
window.DIFFICULTY_TIERS = DIFFICULTY_TIERS;
window.ROUTINE_CATALOG = ROUTINE_CATALOG;
window.BOSS_ROSTER = BOSS_ROSTER;
window.getMaxXpForLevel = getMaxXpForLevel;
window.getRankForLevel = getRankForLevel;
window.getNextRankMilestone = getNextRankMilestone;

window.store = new Store();
