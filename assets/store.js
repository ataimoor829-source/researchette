/* Researchette data layer — DEMO MODE.
   Everything is kept in this browser's localStorage so the portals can be tried without a server.
   Passwords are stored in plain text here, so this must be swapped for a real backend (e.g. Supabase)
   before real students use it. The public API below is what the pages call; keep it when swapping. */
window.Store = (function () {
  var KEY = 'rt-demo-v1', SESSION = 'rt-session';
  var mem = null, memSession = null;
  /* application form goals → programme ids (see curriculum.js) */
  var GOALS = { 'Original article': 'original', 'Synopsis': 'synopsis', 'Thesis': 'thesis', 'Meta-analysis': 'meta', 'Systematic review / meta-analysis': 'meta', 'Case report': 'case', 'Letter to the editor': 'letter' };

  function ago(days, hours) { return new Date(Date.now() - ((days || 0) * 24 + (hours || 0)) * 3600e3).toISOString(); }
  function now() { return new Date().toISOString(); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 9); }
  function tempPassword() {
    var a = 'abcdefghjkmnpqrstuvwxyz', out = '', r = new Uint32Array(8);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach(function (_, i) { r[i] = Math.random() * 1e9; });
    for (var i = 0; i < 4; i++) out += a[r[i] % a.length];
    return 'rt-' + out + '-' + (1000 + (r[4] % 9000));
  }
  function stepCount(track) { var C = window.CURRICULUM; return C && C.track ? C.track(track).steps.length : 10; }
  function trackIds() { var C = window.CURRICULUM; return C && C.tracks ? C.tracks.map(function (t) { return t.id; }) : ['original']; }

  function seed() {
    var users = [
      { id: 'u1', role: 'admin', name: 'Zain Ramzan', email: 'zain@researchette.pk', password: 'admin1234', title: 'Founder & lead mentor', joined: ago(120) },
      { id: 'u2', role: 'admin', name: 'Sobia', email: 'sobia@researchette.pk', password: 'admin1234', title: 'Senior mentor', joined: ago(90) },
      { id: 'u8', role: 'admin', name: 'Taimoor Ali', email: 'taimoor@researchette.pk', password: 'admin1234', title: 'Mentor', joined: ago(0) },
      { id: 'u3', role: 'member', name: 'Ayesha Khan', email: 'ayesha@demo.pk', password: 'demo1234', phone: '', college: 'King Edward Medical University', level: 'MBBS (3rd–5th year)', topic: 'Exam anxiety among MBBS students', tracks: ['original', 'case'], activeTrack: 'original', mentorId: 'u1', joined: ago(9) },
      { id: 'u4', role: 'member', name: 'Hamza Ali', email: 'hamza@demo.pk', password: 'demo1234', phone: '', college: 'Allama Iqbal Medical College', level: 'MBBS (3rd–5th year)', topic: 'Hand hygiene compliance among house officers', tracks: ['original'], activeTrack: 'original', mentorId: 'u1', joined: ago(21) },
      { id: 'u5', role: 'member', name: 'Fatima Noor', email: 'fatima@demo.pk', password: 'demo1234', phone: '', college: 'Services Institute of Medical Sciences', level: 'House officer / graduate doctor', topic: 'Sleep quality and academic performance', tracks: ['original'], activeTrack: 'original', mentorId: 'u2', joined: ago(34) },
      { id: 'u6', role: 'member', name: 'Bilal Ahmed', email: 'bilal@demo.pk', password: 'demo1234', phone: '', college: 'Nishtar Medical University', level: 'MBBS (1st–2nd year)', topic: 'Screen time and eye strain in medical students', tracks: ['original', 'letter'], activeTrack: 'original', mentorId: 'u2', joined: ago(2) },
      { id: 'u7', role: 'member', name: 'Mahnoor Tariq', email: 'mahnoor@demo.pk', password: 'demo1234', phone: '', college: 'Rawalpindi Medical University', level: 'Postgraduate trainee (FCPS / MS / MD)', topic: 'Vitamin D deficiency in pregnant women', tracks: ['original'], activeTrack: 'original', mentorId: 'u1', joined: ago(60) }
    ];
    var subs = [];
    function approved(user, upTo, startDay, reviewer) {
      for (var s = 1; s <= upTo; s++) {
        var d = startDay - s * 2;
        subs.push({ id: uid('s'), userId: user, track: 'original', step: s, text: 'Draft for step ' + s + ' on the approved study topic.', status: 'approved', feedback: 'Good work. Approved.', reviewerId: reviewer, createdAt: ago(d + 1), reviewedAt: ago(d) });
      }
    }
    subs.push({ id: 's-ay1', userId: 'u3', track: 'original', step: 1, status: 'approved', reviewerId: 'u1', createdAt: ago(7), reviewedAt: ago(6),
      text: 'What is the prevalence of anxiety, measured with GAD-7, among 3rd year MBBS students at King Edward Medical University during professional exams?\nP: 3rd year MBBS students at KEMU\nI: professional exam period\nC: not applicable\nO: anxiety (GAD-7 score of 10 or more)\nFeasible because my whole class can be surveyed in two weeks.',
      feedback: 'Clear PICO and a measurable outcome. On to the search!' });
    subs.push({ id: 's-ay2', userId: 'u3', track: 'original', step: 2, status: 'revision', reviewerId: 'u2', createdAt: ago(2), reviewedAt: ago(1),
      text: 'anxiety AND medical students AND exams\n1,240 results\n1. Prevalence of anxiety among medical students: a meta-analysis\n2. Exam stress in Pakistani medical students\n3. GAD-7 validation in university students',
      feedback: 'Good start. Add the MeSH terms "Anxiety"[Mesh] and "Students, Medical"[Mesh], and group synonyms with OR inside brackets. Re-run the search and paste the new result count.' });
    approved('u4', 3, 20, 'u1');
    subs.push({ id: 's-ha4', userId: 'u4', track: 'original', step: 4, status: 'review', createdAt: ago(1, 3),
      text: 'Rationale: Hospital-acquired infections remain common in Pakistani tertiary hospitals, and hand hygiene is the simplest way to prevent them. Local studies on compliance among house officers are few and mostly self-reported. Direct observation will give a more accurate picture and help infection control teams target training.\n\nObjective: To determine the compliance rate with WHO hand hygiene moments among house officers at Mayo Hospital, Lahore.\n\nOperational definition: Compliance = hand rub or hand wash performed at an observed WHO moment, expressed as actions / opportunities × 100.' });
    approved('u5', 6, 32, 'u2');
    subs.push({ id: 's-fa7', userId: 'u5', track: 'original', step: 7, status: 'review', createdAt: ago(0, 3),
      text: 'Data will be entered and analysed in SPSS v26. Age and PSQI score will be reported as mean ± SD after checking normality with the Shapiro-Wilk test. Sleep quality (good: PSQI ≤ 5, poor: > 5) and grade category will be reported as frequency and percentage. The association between sleep quality and academic performance will be tested with the chi-square test. p ≤ 0.05 will be considered significant.' });
    subs.push({ id: 's-bi1', userId: 'u6', track: 'original', step: 1, status: 'review', createdAt: ago(3, 2),
      text: 'Does using phones for long cause eye problems in students?\nP: students\nI: phone use\nC: less phone use\nO: eye problems\nFeasible because everyone uses phones.' });
    approved('u7', 9, 58, 'u1');

    var apps = [
      { id: 'a1', name: 'Usman Shah', email: 'usman@demo.pk', phone: '0300 1234567', college: 'Dow University of Health Sciences', level: 'MBBS (3rd–5th year)', experience: 'None yet', goals: ['Original article', 'Case report'], why: 'I want a publication before house job, but I have never written one and do not know where to start.', createdAt: ago(2), status: 'new', paid: false },
      { id: 'a2', name: 'Zara Iqbal', email: 'zara@demo.pk', phone: '0321 7654321', college: 'Lahore Medical & Dental College', level: 'BDS', experience: 'Helped on a project', goals: ['Case report'], why: 'We saw an unusual case in our OPD and my supervisor suggested writing it up.', createdAt: ago(1), status: 'new', paid: true },
      { id: 'a3', name: 'Hira Saleem', email: 'hira@demo.pk', phone: '', college: 'Khyber Medical University', level: 'Postgraduate trainee (FCPS / MS / MD)', experience: '1–2 publications', goals: ['Synopsis', 'Thesis'], why: 'I need to submit my FCPS synopsis this year and want someone to check it properly.', createdAt: ago(0, 5), status: 'new', paid: false }
    ];
    return { users: users, submissions: subs, applications: apps };
  }

  /* Bring older demo data in this browser up to date (new mentors, programmes, mentor links). */
  function migrate(s) {
    var changed = false;
    seed().users.forEach(function (a) {
      if (a.role === 'admin' && !s.users.some(function (u) { return u.email === a.email; })) { s.users.push(a); changed = true; }
    });
    s.users.forEach(function (u) {
      if (u.role !== 'member') return;
      if (!u.tracks || !u.tracks.length) { u.tracks = ['original']; changed = true; }
      if (!u.activeTrack || u.tracks.indexOf(u.activeTrack) < 0) { u.activeTrack = u.tracks[0]; changed = true; }
      if (u.mentorId === undefined) { u.mentorId = null; changed = true; }
    });
    s.submissions.forEach(function (x) { if (!x.track) { x.track = 'original'; changed = true; } });
    return changed;
  }
  function db() {
    if (mem) return mem;
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.users) { mem = s; if (migrate(s)) save(); return mem; } } catch (e) {}
    mem = seed(); save(); return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  function getSession() { try { return localStorage.getItem(SESSION); } catch (e) { return memSession; } }
  function setSession(v) { memSession = v; try { v ? localStorage.setItem(SESSION, v) : localStorage.removeItem(SESSION); } catch (e) {} }
  function pub(u) { if (!u) return null; var c = Object.assign({}, u); delete c.password; if (c.tracks) c.tracks = c.tracks.slice(); return c; }
  function user(id) { return db().users.filter(function (u) { return u.id === id; })[0]; }
  function member(id) { var u = user(id); return u && u.role === 'member' ? u : null; }
  function byEmail(email) { var e = String(email || '').trim().toLowerCase(); return db().users.filter(function (u) { return u.email.toLowerCase() === e; })[0]; }
  function wait(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 120); }); }
  function fail(msg) { return new Promise(function (_, j) { setTimeout(function () { j(new Error(msg)); }, 200); }); }
  function withReviewer(s) { return Object.assign({}, s, { reviewer: s.reviewerId ? pub(user(s.reviewerId)) : null }); }
  function newest(a, b) { return a.createdAt < b.createdAt ? 1 : -1; }

  function subsFor(userId, track) { return db().submissions.filter(function (s) { return s.userId === userId && (!track || s.track === track); }); }
  function latest(userId, track, step) { return subsFor(userId, track).filter(function (s) { return s.step === step; }).sort(newest)[0] || null; }
  /* Per-step state in one programme: approved | review | revision | current | locked. */
  function states(userId, track) {
    var out = [], open = true, n = stepCount(track);
    for (var i = 1; i <= n; i++) {
      var l = latest(userId, track, i), st;
      if (l && l.status === 'approved') st = 'approved';
      else if (open) { st = l ? l.status : 'current'; open = false; }
      else st = 'locked';
      out.push({ step: i, status: st, submission: l ? withReviewer(l) : null });
    }
    return out;
  }
  function progress(u) {
    var p = {};
    u.tracks.forEach(function (t) {
      var s = states(u.id, t);
      p[t] = { done: s.filter(function (x) { return x.status === 'approved'; }).length, total: s.length, current: s.filter(function (x) { return x.status !== 'approved'; })[0] || null };
    });
    return p;
  }
  function summary(u) {
    var p = progress(u), a = p[u.activeTrack] || { done: 0, total: stepCount(u.activeTrack), current: null };
    var last = subsFor(u.id).sort(newest)[0], m = u.mentorId ? user(u.mentorId) : null;
    return Object.assign(pub(u), { progress: p, done: a.done, total: a.total, current: a.current, mentor: m ? pub(m) : null, lastActive: last ? last.createdAt : u.joined });
  }
  function validTracks(list) {
    var ok = trackIds(), out = [];
    (list || []).forEach(function (t) { if (ok.indexOf(t) > -1 && out.indexOf(t) < 0) out.push(t); });
    return out;
  }
  function createMember(data, mentorId) {
    var pw = data.password || tempPassword(), tracks = validTracks(data.tracks);
    if (!tracks.length) tracks = ['original'];
    var u = { id: uid('u'), role: 'member', name: data.name.trim(), email: data.email.trim(), phone: (data.phone || '').trim(), password: pw,
      college: (data.college || '').trim(), level: data.level || '', topic: '', tracks: tracks, activeTrack: tracks[0], mentorId: mentorId || null, joined: now() };
    db().users.push(u);
    return { user: pub(u), password: pw };
  }

  return {
    demo: true,

    signIn: function (email, password) {
      var u = byEmail(email);
      if (!u || u.password !== password) return fail('That email and password don’t match. Check them and try again.');
      if (u.active === false) return fail('This account is paused. Contact your mentor.');
      setSession(u.id); return wait(pub(u));
    },
    signOut: function () { setSession(null); return wait(true); },
    me: function () { return wait(pub(user(getSession()))); },

    /* member */
    stepStates: function (userId, track) { return wait(states(userId, track)); },
    progress: function (userId) { var u = member(userId); return wait(u ? progress(u) : {}); },
    setActiveTrack: function (userId, track) {
      var u = member(userId); if (!u || trackIds().indexOf(track) < 0) return fail('That programme isn’t available.');
      if (u.tracks.indexOf(track) < 0) u.tracks.push(track);
      u.activeTrack = track; save(); return wait(pub(u));
    },
    submissions: function (userId) { return wait(subsFor(userId).sort(newest).map(withReviewer)); },
    submit: function (userId, track, step, text) {
      var st = states(userId, track)[step - 1];
      if (!st || (st.status !== 'current' && st.status !== 'revision')) return fail('This step can’t be submitted right now.');
      var s = { id: uid('s'), userId: userId, track: track, step: step, text: text, status: 'review', createdAt: now() };
      db().submissions.push(s); save(); return wait(s);
    },

    /* admin */
    stats: function (adminId) {
      var d = db(), week = ago(7);
      var pending = d.submissions.filter(function (s) { return s.status === 'review'; });
      return wait({
        pending: pending.length,
        pendingMine: pending.filter(function (s) { var m = user(s.userId); return m && m.mentorId === adminId; }).length,
        members: d.users.filter(function (u) { return u.role === 'member' && u.active !== false; }).length,
        myMembers: d.users.filter(function (u) { return u.role === 'member' && u.mentorId === adminId; }).length,
        applications: d.applications.filter(function (a) { return a.status === 'new'; }).length,
        approvedWeek: d.submissions.filter(function (s) { return s.status === 'approved' && s.reviewedAt > week; }).length
      });
    },
    mentors: function () { return wait(db().users.filter(function (u) { return u.role === 'admin'; }).map(pub)); },
    queue: function () {
      return wait(db().submissions.filter(function (s) { return s.status === 'review'; })
        .sort(function (a, b) { return a.createdAt > b.createdAt ? 1 : -1; })
        .map(function (s) { return Object.assign({}, s, { member: pub(user(s.userId)) }); })
        .filter(function (s) { return s.member; }));
    },
    submission: function (id) {
      var s = db().submissions.filter(function (x) { return x.id === id; })[0];
      if (!s || !user(s.userId)) return wait(null);
      var history = subsFor(s.userId, s.track).filter(function (x) { return x.step === s.step && x.id !== s.id; }).sort(newest).map(withReviewer);
      return wait(Object.assign({}, s, { member: pub(user(s.userId)), history: history }));
    },
    review: function (id, decision, feedback, reviewerId) {
      var s = db().submissions.filter(function (x) { return x.id === id; })[0];
      if (!s || s.status !== 'review') return fail('This submission has already been reviewed.');
      s.status = decision === 'approved' ? 'approved' : 'revision';
      s.feedback = feedback; s.reviewerId = reviewerId; s.reviewedAt = now();
      save(); return wait(s);
    },
    members: function () {
      return wait(db().users.filter(function (u) { return u.role === 'member'; }).map(summary).sort(function (a, b) { return a.lastActive < b.lastActive ? 1 : -1; }));
    },
    member: function (id) {
      var u = member(id); if (!u) return wait(null);
      var all = {}; u.tracks.forEach(function (t) { all[t] = states(id, t); });
      return wait(Object.assign(summary(u), { states: all }));
    },
    addMember: function (data, mentorId) {
      if (!data || !String(data.name || '').trim()) return fail('Enter the member’s name.');
      if (!/.+@.+\..+/.test(String(data.email || ''))) return fail('Enter a valid email address.');
      if (byEmail(data.email)) return fail('An account with this email already exists.');
      var res = createMember(data, mentorId); save(); return wait(res);
    },
    removeMember: function (id) {
      var d = db(), u = member(id); if (!u) return fail('Member not found.');
      d.users = d.users.filter(function (x) { return x.id !== id; });
      d.submissions = d.submissions.filter(function (x) { return x.userId !== id; });
      d.applications.forEach(function (a) { if (a.userId === id) a.userId = null; });
      if (getSession() === id) setSession(null);
      save(); return wait(true);
    },
    resetPassword: function (id) {
      var u = member(id); if (!u) return fail('Member not found.');
      u.password = tempPassword(); save(); return wait({ user: pub(u), password: u.password });
    },
    setPassword: function (id, pw) {
      var u = member(id); if (!u) return fail('Member not found.');
      if (String(pw).length < 8) return fail('Use at least 8 characters.');
      u.password = String(pw); save(); return wait({ user: pub(u), password: u.password });
    },
    assignMentor: function (id, mentorId) {
      var u = member(id); if (!u) return fail('Member not found.');
      if (mentorId && !(user(mentorId) || {}).role) return fail('Mentor not found.');
      u.mentorId = mentorId || null; save(); return wait(pub(u));
    },
    setTracks: function (id, tracks) {
      var u = member(id); if (!u) return fail('Member not found.');
      var t = validTracks(tracks); if (!t.length) return fail('Keep at least one programme.');
      u.tracks = t; if (t.indexOf(u.activeTrack) < 0) u.activeTrack = t[0];
      save(); return wait(pub(u));
    },
    applications: function () { return wait(db().applications.slice().sort(newest)); },
    addApplication: function (data) {
      var a = Object.assign({ id: uid('a'), createdAt: now(), status: 'new', paid: false }, data);
      db().applications.push(a); save(); return wait(a);
    },
    setPaid: function (id, paid) {
      var a = db().applications.filter(function (x) { return x.id === id; })[0];
      if (a) { a.paid = !!paid; save(); } return wait(a);
    },
    decline: function (id) {
      var a = db().applications.filter(function (x) { return x.id === id; })[0];
      if (a) { a.status = 'declined'; save(); } return wait(a);
    },
    approveApplication: function (id, mentorId) {
      var a = db().applications.filter(function (x) { return x.id === id; })[0];
      if (!a || a.status !== 'new') return fail('This application has already been handled.');
      if (byEmail(a.email)) return fail('An account with this email already exists.');
      var tracks = (a.goals || []).map(function (g) { return GOALS[g]; }).filter(Boolean);
      var res = createMember({ name: a.name, email: a.email, phone: a.phone, college: a.college, level: a.level, tracks: tracks }, mentorId);
      a.status = 'approved'; a.userId = res.user.id; save();
      return wait(res);
    },
    setPhone: function (userId, phone) {
      var u = user(userId); if (!u) return fail('Member not found.');
      u.phone = String(phone || '').trim(); save(); return wait(pub(u));
    },
    changePassword: function (userId, current, next) {
      var u = user(userId);
      if (!u || u.password !== current) return fail('Your current password isn’t right.');
      if (String(next).length < 8) return fail('Use at least 8 characters for the new password.');
      if (next === current) return fail('Choose a password that’s different from the current one.');
      u.password = next; save(); return wait(true);
    },
    reset: function () { mem = seed(); save(); setSession(null); return wait(true); }
  };
})();
