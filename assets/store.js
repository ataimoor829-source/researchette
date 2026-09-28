/* Researchette data layer — DEMO MODE.
   Everything is kept in this browser's localStorage so the portals can be tried without a server.
   Passwords are stored in plain text here, so this must be swapped for a real backend (e.g. Supabase)
   before real students use it. The public API below is what the pages call; keep it when swapping. */
window.Store = (function () {
  var KEY = 'rt-demo-v1', SESSION = 'rt-session', STEPS = 10;
  var mem = null, memSession = null;

  function ago(days, hours) { return new Date(Date.now() - ((days || 0) * 24 + (hours || 0)) * 3600e3).toISOString(); }
  function uid(p) { return p + Math.random().toString(36).slice(2, 9); }
  function tempPassword() {
    var a = 'abcdefghjkmnpqrstuvwxyz', out = '', r = new Uint32Array(8);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach(function (_, i) { r[i] = Math.random() * 1e9; });
    for (var i = 0; i < 4; i++) out += a[r[i] % a.length];
    return 'rt-' + out + '-' + (1000 + (r[4] % 9000));
  }

  function seed() {
    var users = [
      { id: 'u1', role: 'admin', name: 'Zain Ramzan', email: 'zain@researchette.pk', password: 'admin1234', title: 'Founder & lead mentor', joined: ago(120) },
      { id: 'u2', role: 'admin', name: 'Sobia', email: 'sobia@researchette.pk', password: 'admin1234', title: 'Senior mentor', joined: ago(90) },
      { id: 'u3', role: 'member', name: 'Ayesha Khan', email: 'ayesha@demo.pk', password: 'demo1234', college: 'King Edward Medical University', level: 'MBBS (3rd–5th year)', topic: 'Exam anxiety among MBBS students', joined: ago(9) },
      { id: 'u4', role: 'member', name: 'Hamza Ali', email: 'hamza@demo.pk', password: 'demo1234', college: 'Allama Iqbal Medical College', level: 'MBBS (3rd–5th year)', topic: 'Hand hygiene compliance among house officers', joined: ago(21) },
      { id: 'u5', role: 'member', name: 'Fatima Noor', email: 'fatima@demo.pk', password: 'demo1234', college: 'Services Institute of Medical Sciences', level: 'House officer / graduate doctor', topic: 'Sleep quality and academic performance', joined: ago(34) },
      { id: 'u6', role: 'member', name: 'Bilal Ahmed', email: 'bilal@demo.pk', password: 'demo1234', college: 'Nishtar Medical University', level: 'MBBS (1st–2nd year)', topic: 'Screen time and eye strain in medical students', joined: ago(2) },
      { id: 'u7', role: 'member', name: 'Mahnoor Tariq', email: 'mahnoor@demo.pk', password: 'demo1234', college: 'Rawalpindi Medical University', level: 'Postgraduate trainee (FCPS / MS / MD)', topic: 'Vitamin D deficiency in pregnant women', joined: ago(60) }
    ];
    var subs = [];
    function approved(user, upTo, startDay, reviewer) {
      for (var s = 1; s <= upTo; s++) {
        var d = startDay - s * 2;
        subs.push({ id: uid('s'), userId: user, step: s, text: 'Draft for step ' + s + ' on the approved study topic.', status: 'approved', feedback: 'Good work. Approved.', reviewerId: reviewer, createdAt: ago(d + 1), reviewedAt: ago(d) });
      }
    }
    subs.push({ id: 's-ay1', userId: 'u3', step: 1, status: 'approved', reviewerId: 'u1', createdAt: ago(7), reviewedAt: ago(6),
      text: 'What is the prevalence of anxiety, measured with GAD-7, among 3rd year MBBS students at King Edward Medical University during professional exams?\nP: 3rd year MBBS students at KEMU\nI: professional exam period\nC: not applicable\nO: anxiety (GAD-7 score of 10 or more)\nFeasible because my whole class can be surveyed in two weeks.',
      feedback: 'Clear PICO and a measurable outcome. On to the search!' });
    subs.push({ id: 's-ay2', userId: 'u3', step: 2, status: 'revision', reviewerId: 'u2', createdAt: ago(2), reviewedAt: ago(1),
      text: 'anxiety AND medical students AND exams\n1,240 results\n1. Prevalence of anxiety among medical students: a meta-analysis\n2. Exam stress in Pakistani medical students\n3. GAD-7 validation in university students',
      feedback: 'Good start. Add the MeSH terms "Anxiety"[Mesh] and "Students, Medical"[Mesh], and group synonyms with OR inside brackets. Re-run the search and paste the new result count.' });
    approved('u4', 3, 20, 'u1');
    subs.push({ id: 's-ha4', userId: 'u4', step: 4, status: 'review', createdAt: ago(1, 3),
      text: 'Rationale: Hospital-acquired infections remain common in Pakistani tertiary hospitals, and hand hygiene is the simplest way to prevent them. Local studies on compliance among house officers are few and mostly self-reported. Direct observation will give a more accurate picture and help infection control teams target training.\n\nObjective: To determine the compliance rate with WHO hand hygiene moments among house officers at Mayo Hospital, Lahore.\n\nOperational definition: Compliance = hand rub or hand wash performed at an observed WHO moment, expressed as actions / opportunities × 100.' });
    approved('u5', 6, 32, 'u2');
    subs.push({ id: 's-fa7', userId: 'u5', step: 7, status: 'review', createdAt: ago(0, 3),
      text: 'Data will be entered and analysed in SPSS v26. Age and PSQI score will be reported as mean ± SD after checking normality with the Shapiro-Wilk test. Sleep quality (good: PSQI ≤ 5, poor: > 5) and grade category will be reported as frequency and percentage. The association between sleep quality and academic performance will be tested with the chi-square test. p ≤ 0.05 will be considered significant.' });
    subs.push({ id: 's-bi1', userId: 'u6', step: 1, status: 'review', createdAt: ago(3, 2),
      text: 'Does using phones for long cause eye problems in students?\nP: students\nI: phone use\nC: less phone use\nO: eye problems\nFeasible because everyone uses phones.' });
    approved('u7', 9, 58, 'u1');

    var apps = [
      { id: 'a1', name: 'Usman Shah', email: 'usman@demo.pk', phone: '0300 1234567', college: 'Dow University of Health Sciences', level: 'MBBS (3rd–5th year)', experience: 'None yet', goals: ['Original article', 'Case report'], why: 'I want a publication before house job, but I have never written one and do not know where to start.', createdAt: ago(2), status: 'new', paid: false },
      { id: 'a2', name: 'Zara Iqbal', email: 'zara@demo.pk', phone: '0321 7654321', college: 'Lahore Medical & Dental College', level: 'BDS', experience: 'Helped on a project', goals: ['Case report'], why: 'We saw an unusual case in our OPD and my supervisor suggested writing it up.', createdAt: ago(1), status: 'new', paid: true },
      { id: 'a3', name: 'Hira Saleem', email: 'hira@demo.pk', phone: '', college: 'Khyber Medical University', level: 'Postgraduate trainee (FCPS / MS / MD)', experience: '1–2 publications', goals: ['Synopsis', 'Thesis'], why: 'I need to submit my FCPS synopsis this year and want someone to check it properly.', createdAt: ago(0, 5), status: 'new', paid: false }
    ];
    return { users: users, submissions: subs, applications: apps };
  }

  function db() {
    if (mem) return mem;
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.users) return (mem = s); } catch (e) {}
    mem = seed(); save(); return mem;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }
  function getSession() { try { return localStorage.getItem(SESSION); } catch (e) { return memSession; } }
  function setSession(v) { memSession = v; try { v ? localStorage.setItem(SESSION, v) : localStorage.removeItem(SESSION); } catch (e) {} }
  function pub(u) { if (!u) return null; var c = Object.assign({}, u); delete c.password; return c; }
  function user(id) { return db().users.filter(function (u) { return u.id === id; })[0]; }
  function wait(v) { return new Promise(function (r) { setTimeout(function () { r(v); }, 120); }); }
  function fail(msg) { return new Promise(function (_, j) { setTimeout(function () { j(new Error(msg)); }, 200); }); }

  function subsFor(userId) { return db().submissions.filter(function (s) { return s.userId === userId; }); }
  function latest(userId, step) {
    return subsFor(userId).filter(function (s) { return s.step === step; })
      .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; })[0] || null;
  }
  /* Per-step state: approved | review | revision | current | locked. */
  function states(userId) {
    var out = [], open = true;
    for (var n = 1; n <= STEPS; n++) {
      var l = latest(userId, n), st;
      if (l && l.status === 'approved') st = 'approved';
      else if (open) { st = l ? l.status : 'current'; open = false; }
      else st = 'locked';
      out.push({ step: n, status: st, submission: l });
    }
    return out;
  }
  function summary(u) {
    var s = states(u.id), done = s.filter(function (x) { return x.status === 'approved'; }).length;
    var cur = s.filter(function (x) { return x.status !== 'approved'; })[0] || null;
    var last = subsFor(u.id).sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; })[0];
    return Object.assign(pub(u), { done: done, current: cur, lastActive: last ? last.createdAt : u.joined });
  }

  return {
    demo: true,

    signIn: function (email, password) {
      var u = db().users.filter(function (x) { return x.email.toLowerCase() === String(email).trim().toLowerCase(); })[0];
      if (!u || u.password !== password) return fail('That email and password don’t match. Check them and try again.');
      if (u.active === false) return fail('This account is paused. Contact your mentor.');
      setSession(u.id); return wait(pub(u));
    },
    signOut: function () { setSession(null); return wait(true); },
    me: function () { return wait(pub(user(getSession()))); },

    /* member */
    stepStates: function (userId) {
      return wait(states(userId).map(function (x) {
        if (!x.submission) return x;
        var s = Object.assign({}, x.submission, { reviewer: x.submission.reviewerId ? pub(user(x.submission.reviewerId)) : null });
        return Object.assign({}, x, { submission: s });
      }));
    },
    submissions: function (userId) {
      return wait(subsFor(userId).slice().sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; }).map(function (s) {
        return Object.assign({}, s, { reviewer: s.reviewerId ? pub(user(s.reviewerId)) : null });
      }));
    },
    submit: function (userId, step, text) {
      var st = states(userId)[step - 1];
      if (!st || (st.status !== 'current' && st.status !== 'revision')) return fail('This step can’t be submitted right now.');
      var s = { id: uid('s'), userId: userId, step: step, text: text, status: 'review', createdAt: new Date().toISOString() };
      db().submissions.push(s); save(); return wait(s);
    },

    /* admin */
    stats: function () {
      var d = db(), week = ago(7);
      return wait({
        pending: d.submissions.filter(function (s) { return s.status === 'review'; }).length,
        members: d.users.filter(function (u) { return u.role === 'member' && u.active !== false; }).length,
        applications: d.applications.filter(function (a) { return a.status === 'new'; }).length,
        approvedWeek: d.submissions.filter(function (s) { return s.status === 'approved' && s.reviewedAt > week; }).length
      });
    },
    queue: function () {
      return wait(db().submissions.filter(function (s) { return s.status === 'review'; })
        .sort(function (a, b) { return a.createdAt > b.createdAt ? 1 : -1; })
        .map(function (s) { return Object.assign({}, s, { member: pub(user(s.userId)) }); }));
    },
    submission: function (id) {
      var s = db().submissions.filter(function (x) { return x.id === id; })[0];
      if (!s) return wait(null);
      var history = subsFor(s.userId).filter(function (x) { return x.step === s.step && x.id !== s.id; })
        .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; })
        .map(function (x) { return Object.assign({}, x, { reviewer: x.reviewerId ? pub(user(x.reviewerId)) : null }); });
      return wait(Object.assign({}, s, { member: pub(user(s.userId)), history: history }));
    },
    review: function (id, decision, feedback, reviewerId) {
      var s = db().submissions.filter(function (x) { return x.id === id; })[0];
      if (!s || s.status !== 'review') return fail('This submission has already been reviewed.');
      s.status = decision === 'approved' ? 'approved' : 'revision';
      s.feedback = feedback; s.reviewerId = reviewerId; s.reviewedAt = new Date().toISOString();
      save(); return wait(s);
    },
    members: function () {
      return wait(db().users.filter(function (u) { return u.role === 'member'; }).map(summary)
        .sort(function (a, b) { return a.lastActive < b.lastActive ? 1 : -1; }));
    },
    member: function (id) {
      var u = user(id); if (!u || u.role !== 'member') return wait(null);
      return wait(Object.assign(summary(u), { states: states(id) }));
    },
    applications: function () {
      return wait(db().applications.slice().sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; }));
    },
    addApplication: function (data) {
      var a = Object.assign({ id: uid('a'), createdAt: new Date().toISOString(), status: 'new', paid: false }, data);
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
    approveApplication: function (id) {
      var d = db(), a = d.applications.filter(function (x) { return x.id === id; })[0];
      if (!a || a.status !== 'new') return fail('This application has already been handled.');
      if (d.users.some(function (u) { return u.email.toLowerCase() === a.email.toLowerCase(); })) return fail('An account with this email already exists.');
      var pw = tempPassword();
      var u = { id: uid('u'), role: 'member', name: a.name, email: a.email, password: pw, college: a.college, level: a.level, topic: '', joined: new Date().toISOString() };
      d.users.push(u); a.status = 'approved'; a.userId = u.id; save();
      return wait({ user: pub(u), password: pw });
    },
    reset: function () { mem = seed(); save(); setSession(null); return wait(true); }
  };
})();
