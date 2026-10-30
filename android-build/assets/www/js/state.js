// HabitCraft - Central Reactive State Store & Persistence
const DEFAULT_STATE = {
  user: {
    name: "Alex Vance",
    rank: "Shadow Striker",
    division: "Guild Valkyrie #3",
    protocolPhase: "Phase 04",
    level: 14,
    currentXp: 3420,
    maxXp: 4000,
    streak: 18,
    personalBest: 24,
    accuracy: 94,
    questsCleared: 124,
    bossesSlain: 8,
    soundEnabled: true
  },
  onboardingCompleted: false,
  onboardingData: {
    struggles: ["doomscrolling", "inconsistent_starts"],
    targets: ["morning", "deepwork", "physical", "evening"],
    intensity: "striker",
    callsign: "Alex Vance"
  },
  boss: {
    name: "Procrastination Titan",
    maxHp: 100,
    currentHp: 15,
    isSlain: false,
    bonusXp: 150
  },
  trophyClaimed: false,
  quests: [
    {
      id: "hydrate",
      title: "Hydrate (500ml)",
      subtext: "Awaken system · 07:15 AM",
      group: "morning",
      xp: 25,
      completed: true,
      icon: "check"
    },
    {
      id: "breathing",
      title: "Mindful Breathing (10m)",
      subtext: "Core calibration · 07:30 AM",
      group: "morning",
      xp: 35,
      completed: true,
      icon: "check"
    },
    {
      id: "workout",
      title: "Deep Workout / Gym",
      subtext: "Upper hypertrophy · 45 mins",
      group: "afternoon",
      xp: 80,
      completed: false,
      isBoss: true,
      icon: "fitness_center"
    },
    {
      id: "deepwork",
      title: "Deep Work Sprint",
      subtext: "System architecture · 30 / 60m",
      group: "afternoon",
      xp: 50,
      completed: false,
      progress: 50,
      icon: "timer"
    },
    {
      id: "read",
      title: "Read 15 Pages",
      subtext: "Atomic Habits · Chapter 4",
      group: "evening",
      xp: 30,
      completed: false,
      icon: "menu_book"
    },
    {
      id: "sunset",
      title: "Digital Sunset (10 PM)",
      subtext: "Screens off · Blue light isolation",
      group: "evening",
      xp: 20,
      completed: false,
      icon: "nightlight"
    }
  ],
  workoutProtocol: {
    cadence: "Mon, Wed, Fri, Sat @ 17:30",
    target: "45 mins — Upper Hypertrophy / Functional Power",
    cue: "Leave gym shoes & water bottle by desk station at 17:00",
    tier: "Tier 3 / Veteran Striker",
    tierXp: 380,
    tierMaxXp: 500,
    totalSessions: 54,
    timeInvested: 42.5,
    todayLogged: false,
    ledger: [
      {
        id: "today",
        date: "Oct 18 (Today)",
        duration: "45m",
        title: "Awaiting Execution Encounter",
        xp: "+80 XP",
        status: "Pending",
        details: {
          "Target Duration": "45 mins",
          "Target Zone": "Hypertrophy Zone 3",
          "Warmup": "Dynamic Shoulder Prehab",
          "Multipliers": "Boss Surge (+1.2x)"
        }
      },
      {
        id: "oct16",
        date: "Oct 16",
        duration: "48m",
        title: "Heavy Back & Core • RPE 8",
        xp: "+80 XP",
        status: "Completed",
        details: {
          "Deadlift": "4 sets × 6 reps @ 140kg",
          "Lat Pulldown": "3 sets × 10 reps @ 75kg",
          "Ab Wheel": "4 sets × 15 reps",
          "Rest Cadence": "120s strict"
        }
      },
      {
        id: "oct14",
        date: "Oct 14",
        duration: "45m",
        title: "Shoulder Press & Pulls • RPE 7.5",
        xp: "+80 XP",
        status: "Completed",
        details: {
          "OHP": "4 sets × 8 reps @ 55kg",
          "Face Pulls": "3 sets × 15 reps @ 25kg",
          "Dips": "3 sets × BW+15kg",
          "Peak HR": "154 bpm"
        }
      },
      {
        id: "oct12",
        date: "Oct 12",
        duration: "52m",
        title: "Leg Power & Intervals • RPE 9",
        xp: "+80 XP",
        status: "Completed",
        details: {
          "Back Squat": "5 sets × 5 reps @ 125kg",
          "Bulgarian Splits": "3 sets × 10/leg",
          "Assault Bike": "5 sprints (20s on / 40s off)",
          "Recovery": "8m cool-down stretch"
        }
      }
    ]
  },
  review: {
    weekRange: "Oct 14 – Oct 20 Review",
    weekNumber: "Week 42",
    rate: 88,
    streakFraction: "6/7",
    xpGained: 420,
    peakDay: "Tuesday",
    lowestDay: "Saturday",
    journalText: "Setting phone in another room at 10 PM eliminated late-night doomscrolling and made morning deep work effortless.",
    ratings: {
      energy: 4,
      discipline: 5,
      recovery: 4
    },
    blueprintCommitted: false,
    distribution: [
      { day: "Monday", letter: "M", cleared: 6, total: 6, pct: 100, extra: "Full Output" },
      { day: "Tuesday", letter: "T", cleared: 6, total: 6, pct: 100, extra: "Apex Focus", isPeak: true },
      { day: "Wednesday", letter: "W", cleared: 6, total: 6, pct: 100, extra: "Consistent" },
      { day: "Thursday", letter: "T", cleared: 5, total: 6, pct: 83, extra: "Target Hit" },
      { day: "Friday", letter: "F", cleared: 6, total: 6, pct: 100, extra: "Sprint Final" },
      { day: "Saturday", letter: "S", cleared: 4, total: 6, pct: 66, extra: "Rest Phase", isLowest: true },
      { day: "Sunday", letter: "S", cleared: 5, total: 6, pct: 83, extra: "Weekly Reset" }
    ],
    pillars: [
      { title: "Morning Protocol", icon: "wb_sunny", hitPct: 100, daysHit: "7/7 Days", desc: "Hydration, Mindful Breathing, Cold Shower", color: "primary-container" },
      { title: "Deep Work / Focus", icon: "terminal", hitPct: 85, daysHit: "6/7 Days", desc: "4.5 hours aggregate focus blocks logged", color: "primary-container" },
      { title: "Evening Wind Down", icon: "nights_stay", hitPct: 71, daysHit: "5/7 Days", desc: "Digital Sunset threshold slipped 2 nights", color: "secondary-container" }
    ]
  },
  trophies: [
    {
      id: "titan_slayer",
      title: "Procrastination Titan Slayer",
      status: "UNLOCKED",
      date: "Oct 18, 2024",
      reward: "+350 XP",
      desc: "Crushed 7-day high-difficulty backlog without a single deferral or postponement. Maintained hyper-focus through heavy cognitive loads.",
      icon: "skull",
      iconColor: "#8c5000",
      iconBg: "#ffdcbf",
      isUnlocked: true,
      isBoss: true
    },
    {
      id: "centurion",
      title: "Centurion of Habit",
      status: "UNLOCKED",
      date: "Sep 29, 2024",
      reward: "+500 XP",
      desc: "Logged over 100 successful routine completions across all disciplines including deep work, cold showers, and hydration protocols.",
      icon: "workspace_premium",
      iconColor: "#00687a",
      iconBg: "#acedff",
      isUnlocked: true,
      isBoss: false
    },
    {
      id: "dawn_patrol",
      title: "Dawn Patrol",
      status: "UNLOCKED",
      date: "Nov 02, 2024",
      reward: "+200 XP",
      desc: "Checked off 20 morning protocols before 08:00 AM sharp. Demonstrates uncompromising circadian synchronization and self-mastery.",
      icon: "alarm_on",
      iconColor: "#00687a",
      iconBg: "#e2e7ff",
      isUnlocked: true,
      isBoss: false
    },
    {
      id: "iron_fortress",
      title: "Iron Fortress",
      status: "LOCKED",
      date: "18 / 30 Days (60%)",
      reward: "+750 XP",
      desc: "Maintain an unbroken 30-day streak on all core protocols simultaneously without triggering the Iron Will freeze buffer.",
      icon: "castle",
      iconColor: "#6d797d",
      iconBg: "#dae2fd",
      isUnlocked: false,
      isBoss: false,
      progress: 60
    },
    {
      id: "night_owl",
      title: "Night Owl Silent",
      status: "LOCKED",
      date: "9 / 14 Days (64%)",
      reward: "+450 XP",
      desc: "Zero digital screen time recorded past 22:00 for 14 consecutive evenings. Reclaims deep restorative REM sleep quality.",
      icon: "dark_mode",
      iconColor: "#6d797d",
      iconBg: "#dae2fd",
      isUnlocked: false,
      isBoss: false,
      progress: 64
    }
  ],
  guild: [
    { rank: 1, name: "Elena Vance-Reyes", title: "Grand Sentinel", streak: "24d Streak", xp: 4120, isUser: false },
    { rank: 2, name: "Marcus Cole", title: "Iron Vanguard", streak: "19d Streak", xp: 3890, isUser: false },
    { rank: 3, name: "Alex Vance", title: "Shadow Striker", streak: "18d Streak", xp: 3420, isUser: true }
  ]
};

class Store {
  constructor() {
    this.STORAGE_KEY = 'habitcraft_state_v1';
    this.state = this.load();
    this.subscribers = [];
  }

  load() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
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
    this.subscribers.forEach(cb => cb(this.state));
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }

  // Update XP & Level calculations
  addXp(amount) {
    this.state.user.currentXp += amount;
    if (this.state.user.currentXp >= this.state.user.maxXp) {
      this.state.user.level += 1;
      this.state.user.currentXp = this.state.user.currentXp - this.state.user.maxXp;
      this.state.user.maxXp = Math.round(this.state.user.maxXp * 1.25);
    }
    // Update user rank in guild list
    const userInGuild = this.state.guild.find(m => m.isUser);
    if (userInGuild) {
      userInGuild.xp = this.state.user.currentXp;
    }
    this.save();
  }

  subtractXp(amount) {
    this.state.user.currentXp = Math.max(0, this.state.user.currentXp - amount);
    const userInGuild = this.state.guild.find(m => m.isUser);
    if (userInGuild) {
      userInGuild.xp = this.state.user.currentXp;
    }
    this.save();
  }

  toggleQuest(questId) {
    const quest = this.state.quests.find(q => q.id === questId);
    if (!quest) return null;

    const willBeCompleted = !quest.completed;
    quest.completed = willBeCompleted;

    if (willBeCompleted) {
      this.addXp(quest.xp);
      this.state.user.questsCleared += 1;
      if (quest.isBoss && this.state.boss.currentHp > 0) {
        this.damageBoss(15);
      } else if (this.state.boss.currentHp > 0) {
        this.damageBoss(5);
      }

      // Sync workout protocol if it's the workout quest
      if (questId === 'workout') {
        this.state.workoutProtocol.todayLogged = true;
        this.state.workoutProtocol.totalSessions += 1;
        this.state.workoutProtocol.timeInvested += 0.8;
        this.state.workoutProtocol.tierXp = Math.min(this.state.workoutProtocol.tierMaxXp, this.state.workoutProtocol.tierXp + 80);
        const todayLedger = this.state.workoutProtocol.ledger.find(l => l.id === 'today');
        if (todayLedger) {
          todayLedger.status = 'Completed';
          todayLedger.title = 'Executed on schedule (45m • RPE 8.5)';
        }
      }
    } else {
      this.subtractXp(quest.xp);
      this.state.user.questsCleared = Math.max(0, this.state.user.questsCleared - 1);

      if (questId === 'workout') {
        this.state.workoutProtocol.todayLogged = false;
        this.state.workoutProtocol.totalSessions = Math.max(0, this.state.workoutProtocol.totalSessions - 1);
        this.state.workoutProtocol.timeInvested = Math.max(0, this.state.workoutProtocol.timeInvested - 0.8);
        this.state.workoutProtocol.tierXp = Math.max(0, this.state.workoutProtocol.tierXp - 80);
        const todayLedger = this.state.workoutProtocol.ledger.find(l => l.id === 'today');
        if (todayLedger) {
          todayLedger.status = 'Pending';
          todayLedger.title = 'Awaiting Execution Encounter';
        }
      }
    }

    this.save();
    return { quest, isCompleted: willBeCompleted };
  }

  damageBoss(percent) {
    const prev = this.state.boss.currentHp;
    this.state.boss.currentHp = Math.max(0, this.state.boss.currentHp - percent);
    if (prev > 0 && this.state.boss.currentHp === 0) {
      this.state.boss.isSlain = true;
      this.state.user.bossesSlain += 1;
      this.addXp(this.state.boss.bonusXp);
    }
    this.save();
    return {
      currentHp: this.state.boss.currentHp,
      wasSlain: prev > 0 && this.state.boss.currentHp === 0
    };
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

  addCustomHabit(habitData) {
    const newId = 'habit_' + Date.now();
    const habit = {
      id: newId,
      title: habitData.title,
      subtext: habitData.subtext || "Custom protocol",
      group: habitData.group || "afternoon",
      xp: parseInt(habitData.xp, 10) || 40,
      completed: false,
      isBoss: !!habitData.isBoss,
      icon: habitData.icon || "bolt"
    };
    this.state.quests.push(habit);
    this.save();
    return habit;
  }

  deleteHabit(habitId) {
    this.state.quests = this.state.quests.filter(q => q.id !== habitId);
    this.save();
  }

  // ─── Onboarding ─────────────────────────────────────────────────────────────
  completeOnboarding(data) {
    // data: { callsign, struggles[], targets[], intensity }
    this.state.onboardingCompleted = true;
    this.state.onboardingData = {
      callsign:  data.callsign  || 'Operative',
      struggles: data.struggles || [],
      targets:   data.targets   || [],
      intensity: data.intensity || 'operative'
    };

    // Apply callsign
    this.state.user.name = data.callsign || 'Operative';

    // XP multiplier based on intensity
    const multiplierMap = { recruit: 0.8, operative: 1.0, striker: 1.5 };
    const mult = multiplierMap[data.intensity] || 1.0;
    this.state.user.xpMultiplier = mult;

    // Personalise boss name from struggles
    const bossMap = {
      doomscrolling:  { name: 'The Feed Phantom',      icon: 'smartphone' },
      procrastination:{ name: 'The Delay Daemon',       icon: 'hourglass_empty' },
      poor_sleep:     { name: 'The Sleep Saboteur',     icon: 'bedtime' },
      inconsistency:  { name: 'The Streak Slayer',      icon: 'sync_problem' },
      low_motivation: { name: 'The Void Entity',        icon: 'battery_1_bar' },
      focus:          { name: 'The Scatter Mind',       icon: 'psychology' },
      stress:         { name: 'The Overwhelm Titan',    icon: 'mood_bad' },
      sedentary:      { name: 'The Inertia Behemoth',   icon: 'chair' }
    };
    const primaryStruggle = (data.struggles || [])[0];
    const bossEntry = bossMap[primaryStruggle] || { name: 'The Resistance', icon: 'skull' };
    this.state.boss.name = bossEntry.name;
    this.state.boss.currentHp = this.state.boss.maxHp; // reset HP for new player

    this.save();
    this.notify();
    return this.state;
  }
}

window.store = new Store();

