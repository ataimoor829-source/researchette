/* Researchette: the "start here" basics and the quick checks inside each step.
   Loaded after curriculum.js. Written for someone who has never done research: short sentences,
   plain words, and one idea per card.

   window.RT_FOUNDATIONS   cards every newcomer sees once: what research is, the words, how the portal works
   window.RT_TRACK_START   a few cards per programme: what this kind of paper is and what you will make
   Each card: { h, p, points?: [[title, text]], visual?: (a picture, as in curriculum.js), check?, note? }
   check: { q, options: [..], answer: index of the right option, why }

   Each step also gets
   goal:  what the member will have finished by the end of the step
   check: one quick question, asked after the lesson */
(function () {
  var C = window.CURRICULUM;
  if (!C) return;

  window.RT_FOUNDATIONS = [
    { h: 'What is research?',
      p: 'Research is a careful, fair way of answering a question. Instead of guessing, you collect facts, count them and see what they say.',
      points: [['A question', 'How many students in my class skip breakfast?'], ['A fair way to check', 'Ask every student the same short questions.'], ['An answer you can trust', '41% of them skip breakfast on most days.']],
      check: { q: 'Which of these is a research question?', options: ['Breakfast is important.', 'How many MBBS students at our college skip breakfast?', 'Students should eat more fruit.'], answer: 1,
        why: 'It asks something you can check by collecting facts. The other two are opinions.' } },
    { h: 'Why do research as a student?',
      p: 'You don’t need to be a scientist. Research helps you think like a good doctor, and it opens doors.',
      points: [['It helps your CV', 'A published paper stands out on house job, job and postgraduate applications.'], ['You become a better doctor', 'You learn to read studies and judge which ones to trust.'], ['It can help patients', 'Your answer can change how something is done in your hospital or college.'], ['You can start now', 'Many students publish their first paper while still in medical school.']] },
    { h: 'What is a research paper?',
      p: 'A research paper is a short report of what you asked, what you did, what you found and what it means. Journals publish papers so other doctors can learn from them. Almost every paper has the same four parts.',
      visual: { type: 'funnel', title: 'The four parts of a paper (IMRaD)', levels: [
        ['Introduction', 'Why did you do it?', 100], ['Methods', 'How did you do it?', 62], ['Results', 'What did you find?', 62], ['Discussion', 'What does it mean?', 100]] },
      check: { q: 'In which part of a paper do you give the numbers you found?', options: ['Introduction', 'Methods', 'Results', 'Discussion'], answer: 2,
        why: 'Results is for what you found. The Discussion then explains what those numbers mean.' } },
    { h: 'From an idea to a published paper',
      p: 'Every study walks the same path. Here you walk it one small step at a time, and your mentor checks each step before the next one opens.',
      visual: { type: 'flow', title: 'The path of every study', steps: [
        ['Notice something', 'Something on the ward or in class that made you curious.'], ['Ask one clear question', 'Small enough to answer in a few months.'], ['Read what is known', 'A quick search for papers on your topic.'],
        ['Plan it and get permission', 'Your plan (synopsis) and approval from the ethics committee.'], ['Collect your data', 'The answers, records or measurements.'], ['Count and compare', 'Percentages, averages and simple tests.'],
        ['Write the paper', 'Introduction, Methods, Results, Discussion.'], ['Send it to a journal', 'Experts review it, you improve it, it gets published.']] } },
    { h: 'Words you will hear',
      p: 'Research has its own words. They are simpler than they sound. Tap each card to see what it means.',
      visual: { type: 'terms', title: 'Tap a word', items: [
        ['Population', 'The whole group you want to learn about.', 'All MBBS students in Pakistan'],
        ['Sample', 'The smaller group you actually ask.', '400 students at your college'],
        ['Variable', 'Anything you measure that can be different from person to person.', 'Age, hours of sleep, skipping breakfast'],
        ['Data', 'The answers or measurements you collect.', 'The filled questionnaires'],
        ['Ethics approval', 'Permission from a committee before you start, so the study is safe and fair.', 'A letter from your college’s ethics committee'],
        ['Journal', 'A magazine that publishes research papers.', 'Most are online'],
        ['Peer review', 'Experts read your paper before it is published and suggest changes.', 'Two reviewers send you comments'],
        ['Abstract', 'The short summary at the top of a paper, usually about 250 words.', 'What most people read first'],
        ['Reference', 'A note that shows where a fact came from.', 'The small (1) at the end of a sentence']] },
      check: { q: 'You want to learn about all MBBS students, but you ask 400 at your college. The 400 are your…', options: ['Population', 'Sample', 'Variable'], answer: 1,
        why: 'The sample is the group you actually ask. The population is the bigger group you want to learn about.' } },
    { h: 'How you will learn here',
      p: 'Each step takes about 20 to 40 minutes. You can stop at any time and carry on where you left off.',
      points: [['Learn', 'Short lessons in plain words, with pictures.'], ['Check', 'A quick question to make sure it clicked.'], ['Do', 'A small task: you write one part of your own project.'], ['Get feedback', 'Your mentor reads it, then approves it or tells you exactly what to change.']],
      note: 'You don’t need to be good at maths or English. Mistakes are fine: that’s what your mentor is for.' }
  ];

  var MAP = { map: true }; // a card that shows the programme's own steps
  window.RT_TRACK_START = {
    original: [
      { h: 'What is an original article?',
        p: 'An original article reports a study you did yourself. You ask people questions or check records, count the answers and write up what you found. It is the most common kind of research paper.',
        points: [['You collect new data', 'For example, a short questionnaire filled by 400 students.'], ['You count and compare', 'Percentages, averages and one or two simple tests.'], ['You write it up', 'Introduction, Methods, Results and Discussion.']] },
      { h: 'One example, all the way through',
        p: 'To keep things simple, every step uses the same small example study: “How many MBBS students at our college skip breakfast?” You do the same steps with your own topic.',
        note: 'Your topic can be anything small you can check in a few months. You will choose it in step 1.' },
      Object.assign({ h: 'Your 10 steps', p: 'Three phases. Each step unlocks when your mentor approves the one before it.' }, MAP),
      { h: 'What you will have at the end',
        p: 'A finished paper, ready to send to a journal, and a Researchette certificate anyone can check online. It usually takes a few months, mostly because getting approval and collecting answers take time.',
        check: { q: 'What makes a study an original article?', options: ['You collect and analyse your own data', 'You describe one unusual patient', 'You reply to someone else’s paper'], answer: 0,
          why: 'An original article is your own study with new data. One patient is a case report, and a reply is a letter to the editor.' } }
    ],
    case: [
      { h: 'What is a case report?',
        p: 'A case report tells the story of one patient whose illness teaches doctors something new: a rare disease, an unusual sign or an unexpected side effect. You don’t need hundreds of people, just one interesting patient and good notes.',
        points: [['One patient', 'No questionnaire and no sample size.'], ['Something new', 'Rare, unusual or surprising.'], ['One clear lesson', 'What should other doctors learn from it?']] },
      { h: 'The parts of a case report',
        p: 'Case reports are short, usually between 1,000 and 2,000 words. They follow a simple order.',
        visual: { type: 'flow', title: 'The parts, in order', steps: [['Title', 'Ends with “a case report”.'], ['Abstract', 'A short summary.'], ['Introduction', 'Why this case matters.'], ['Case presentation', 'What happened, in order.'], ['Discussion', 'How it compares with other reported cases.'], ['Learning points', '2 or 3 short lessons.']] } },
      Object.assign({ h: 'Your 6 steps', p: 'Each step unlocks when your mentor approves the one before it.' }, MAP),
      { h: 'Check your understanding',
        p: 'A good case teaches something other doctors don’t already know.',
        check: { q: 'Which patient is most worth a case report?', options: ['A typical case of typhoid fever', 'Typhoid fever that caused gallbladder inflammation without stones', 'A patient with a common cold'], answer: 1,
          why: 'It is an unusual presentation of a common disease, so other doctors can learn from it. Typical cases teach nothing new.' } }
    ],
    letter: [
      { h: 'What is a letter to the editor?',
        p: 'A letter to the editor is a short, polite reply to an article a journal published recently. You point out something useful: a weak spot, another explanation, or what you see in your own hospital.',
        points: [['Short', 'Usually 300 to 600 words.'], ['Quick', 'You can finish it in a week or two.'], ['Published with your name', 'And it can be found on PubMed if the journal is listed there.']] },
      { h: 'The shape of a letter',
        p: 'Every letter follows the same simple shape.',
        visual: { type: 'flow', title: 'From opening to references', steps: [['Dear Editor,', 'The usual opening.'], ['We read with interest…', 'Name the article you are replying to.'], ['Your point or points', 'One short paragraph each, with evidence.'], ['A helpful closing', 'A suggestion, not a complaint.'], ['References', 'The original article is reference 1.']] } },
      Object.assign({ h: 'Your 4 steps', p: 'Each step unlocks when your mentor approves the one before it.' }, MAP),
      { h: 'Check your understanding',
        p: 'Editors publish letters that add something helpful.',
        check: { q: 'What is the best tone for a letter to the editor?', options: ['Polite and helpful', 'Angry, so the mistake is clear', 'Only praise'], answer: 0,
          why: 'A polite letter that adds something useful gets published. Attacks get rejected, and praise alone adds nothing.' } }
    ],
    synopsis: [
      { h: 'What is a synopsis?',
        p: 'A synopsis is the plan of your study, written before you start. Your ethics committee, university or CPSP reads it and approves it. Postgraduate trainees write one before their thesis or dissertation.',
        points: [['A plan, not results', 'You write what you will do, in the future tense.'], ['It needs approval', 'You can’t collect any data until it is approved.'], ['It grows into your thesis', 'Much of it is reused later.']] },
      { h: 'The parts of a synopsis',
        p: 'Most institutions ask for the same parts, in this order.',
        visual: { type: 'flow', title: 'The parts, in order', steps: [['Title', 'What, who, where and the type of study.'], ['Introduction', 'What is known.'], ['Rationale', 'What is missing, and why your study helps.'], ['Objectives', 'What exactly you will find out.'], ['Operational definitions', 'How you will measure each thing.'], ['Methodology', 'Design, place, sample, who is in and out.'], ['References', 'The papers you used.']] } },
      Object.assign({ h: 'Your 6 steps', p: 'Each step unlocks when your mentor approves the one before it.' }, MAP),
      { h: 'Check your understanding',
        p: 'The synopsis always comes first.',
        check: { q: 'When do you write a synopsis?', options: ['Before collecting any data', 'After the results are ready', 'After the paper is published'], answer: 0,
          why: 'It is the plan that must be approved before you start. Collecting data before approval is not allowed.' } }
    ],
    thesis: [
      { h: 'What is a thesis?',
        p: 'A thesis (or dissertation) is the full written report of your postgraduate study, chapter by chapter, for your university or CPSP. It is much longer than a paper, but it is built from small parts.',
        points: [['Five chapters', 'Introduction, literature review, methodology, results, discussion.'], ['Built from your synopsis', 'Your approved plan becomes much of chapters 1 and 3.'], ['Checked closely', 'Format and plagiarism checks before you submit.']] },
      { h: 'The chapters, in order',
        p: 'You don’t write it in one go. Plan the outline first, then fill one chapter at a time.',
        visual: { type: 'flow', title: 'The usual chapters', steps: [['Introduction', 'The problem, why it matters, your objectives.'], ['Literature review', 'What is already known, grouped by theme.'], ['Methodology', 'What you did, in the past tense.'], ['Results', 'Tables and plain facts.'], ['Discussion and conclusion', 'What it means and what should change.']] } },
      Object.assign({ h: 'Your 6 steps', p: 'Each step unlocks when your mentor approves the one before it.' }, MAP),
      { h: 'Check your understanding',
        p: 'Each chapter has one job.',
        check: { q: 'Which chapter shows what is already known from other studies?', options: ['Methodology', 'Literature review', 'Results'], answer: 1,
          why: 'The literature review sums up and compares earlier studies, and ends with the gap your study fills.' } }
    ],
    meta: [
      { h: 'What is a systematic review?',
        p: 'A systematic review collects every good study on one question, in a careful way anyone could repeat. A meta-analysis then combines their numbers into one stronger answer. You don’t need patients: just a computer and published papers.',
        points: [['Every study', 'You search several databases, not just one.'], ['Fair choosing', 'Two people decide which studies count.'], ['One combined answer', 'Shown in a picture called a forest plot.']] },
      { h: 'Why it is so useful',
        p: 'Doctors trust reviews most, because they look at all the evidence together instead of one study.',
        visual: { type: 'pyramid', title: 'How strong is each type of study?', levels: ['Systematic reviews & meta-analyses', 'Randomised controlled trials', 'Cohort studies', 'Case-control studies', 'Cross-sectional studies', 'Case reports'] } },
      Object.assign({ h: 'Your 7 steps', p: 'Each step unlocks when your mentor approves the one before it.' }, MAP),
      { h: 'Check your understanding',
        p: 'One sentence to remember: a meta-analysis is a study of studies.',
        check: { q: 'What does a meta-analysis do?', options: ['Combines the numbers of many studies', 'Follows patients for many years', 'Describes one patient'], answer: 0,
          why: 'It pools the results of studies that already exist into one answer.' } }
    ]
  };

  /* a goal and one quick check for every step */
  var Q = {
    'original:1': ['Your research topic in one sentence, checked with PICO and FINER',
      'Which topic is small and clear enough for a first study?', ['The diet of students in Pakistan', 'How many MBBS students at our college skip breakfast?', 'Everything about student health'], 1,
      'It names one group, one place and one thing to count. The others are far too big.'],
    'original:2': ['Your first PubMed search and 3 papers close to your topic',
      'You want papers about breakfast and medical students. Which search is right?', ['breakfast medical students why', '(breakfast OR "morning meal") AND "medical students"', 'breakfast OR "medical students"'], 1,
      'OR joins words that mean the same thing. AND joins the two different ideas, so you only get papers about both.'],
    'original:3': ['Your study design, setting and who can take part',
      'You want to know how many students skip breakfast. Which design fits?', ['Randomised controlled trial', 'Cross-sectional study', 'Cohort study'], 1,
      'Counting how common something is, at one point in time, is exactly what a cross-sectional study does.'],
    'original:4': ['Your rationale, aims and an operational definition',
      'When can you start collecting answers?', ['As soon as the questionnaire is ready', 'After the ethics committee approves your synopsis', 'After a few friends have filled it in'], 1,
      'You need written approval first. Journals ask for the approval number before they publish.'],
    'original:5': ['The number of people you need, worked out properly',
      'The calculator says you need 369 people. What next?', ['Round it down to 300', 'Add about 10% for people who won’t reply', 'Use 100, it is easier'], 1,
      'Some people won’t answer, so you add about 10%: roughly 406 in total.'],
    'original:6': ['Your questionnaire (proforma) and how you will collect answers',
      'Which question is clearer?', ['Do you eat healthy?', 'In the last 7 days, on how many days did you eat something before 10 am?'], 1,
      'It asks about a fact people can remember and count. “Healthy” means different things to different people.'],
    'original:7': ['Your plan for showing and comparing your answers',
      'Your test gives p = 0.004. What does that usually mean?', ['The difference is probably real, not just luck', 'The study failed', 'Only 0.4% of people answered'], 0,
      'A p-value below 0.05 usually means the difference is unlikely to be due to chance alone.'],
    'original:8': ['The first paragraph of your Discussion',
      'In which part do you explain what your results mean?', ['Results', 'Discussion', 'Methods'], 1,
      'Results are only the numbers. The Discussion explains them and compares them with other studies.'],
    'original:9': ['5 references in Vancouver style',
      'In Vancouver style, how are your sources numbered?', ['Alphabetically, by author', 'In the order you first mention them', 'By year, newest first'], 1,
      'The first paper you cite is (1), the next new one is (2), and so on.'],
    'original:10': ['Two journals that fit and your cover letter',
      'A journal emails you: “Guaranteed acceptance in 3 days!” This is…', ['A great offer', 'A warning sign of a fake (predatory) journal', 'Normal for good journals'], 1,
      'Real journals send papers for peer review, which takes weeks. Guarantees and spam emails are warning signs.'],

    'case:1': ['Your case in brief and its one lesson',
      'Before writing, how do you check your case is new?', ['Ask a friend', 'Search PubMed for similar case reports', 'No need, every case is new'], 1,
      'A quick PubMed search shows how many similar cases exist and what is different about yours.'],
    'case:2': ['Your consent statement and the details you will hide',
      'Which detail is safe to keep in the report?', ['The patient’s initials', '“A 19-year-old man”', 'The hospital MR number'], 1,
      'Age and sex are fine. Initials and record numbers could identify the patient.'],
    'case:3': ['The patient’s story and a timeline table',
      'How should you write the events of the case?', ['In the order they happened', 'The most interesting part first', 'In any order'], 0,
      'Readers follow the case like a story, so keep it in time order. A timeline table helps.'],
    'case:4': ['How you reached the diagnosis, the treatment and the outcome',
      'What should you write about the medicines given?', ['Just their names', 'Names, doses and how long they were given', 'Nothing'], 1,
      'Other doctors need the full details to learn from the case or repeat the treatment.'],
    'case:5': ['Your introduction, discussion and learning points',
      'How should the discussion end?', ['With 2 or 3 short learning points', 'With the patient’s name', 'With a list of every test'], 0,
      'Learning points are the take-home message most readers remember.'],
    'case:6': ['Your title, abstract and target journal',
      'Which title is better?', ['An interesting case', 'Typhoid fever presenting as acalculous cholecystitis: a case report'], 1,
      'It says what the case is and that it is a case report, so the right readers can find it.'],

    'letter:1': ['The article you will reply to and your 1 or 2 points',
      'Which article is best to reply to?', ['One published 5 years ago', 'One published in the last few months', 'Any article at all'], 1,
      'Journals usually only accept letters about articles from their recent issues.'],
    'letter:2': ['Your argument, one point per paragraph',
      'Which sentence fits a letter to the editor?', ['“The authors made a big mistake.”', '“One point may limit these findings…”'], 1,
      'A polite, careful tone gets letters published.'],
    'letter:3': ['Your full letter within the word limit',
      'Which reference is number 1 in your letter?', ['The article you are replying to', 'Your favourite textbook', 'The newest paper you found'], 0,
      'You mention the original article first, so it becomes reference 1.'],
    'letter:4': ['Your letter, ready to submit',
      'What do journals almost always ask for?', ['A conflict of interest statement', 'Your exam marks', 'A photo of you'], 0,
      'Every journal asks if anything could affect your view. “None declared” is a normal answer.'],

    'synopsis:1': ['Your title, topic and SMART objectives',
      'What does the T in SMART stand for?', ['Typed', 'Time-bound', 'True'], 1,
      'A time-bound objective says by when it will be done.'],
    'synopsis:2': ['Your introduction and rationale',
      'Which way should your introduction narrow down?', ['From your hospital out to the world', 'From the world down to your hospital', 'It doesn’t matter'], 1,
      'Start with the big picture, then Pakistan, then your own setting and what is missing there.'],
    'synopsis:3': ['Clear definitions for everything you will measure',
      'Which one is an operational definition?', ['Neuropathy: damage to the nerves', 'Can’t feel a 10 g monofilament at 1 or more of 10 points on either foot'], 1,
      'It says exactly how you will measure it, so anyone repeating your study measures it the same way.'],
    'synopsis:4': ['Your methodology: design, sample and who can take part',
      'From when should your study duration be counted?', ['From the day of approval', 'From today', 'From last year'], 0,
      'You can’t start before approval, so the duration starts then.'],
    'synopsis:5': ['Your data collection steps and analysis plan',
      'What must happen before you examine or question anyone?', ['They give written consent', 'Nothing', 'You get their results'], 0,
      'Every person must agree in writing before taking part.'],
    'synopsis:6': ['Your timeline, references and annexes',
      'Which form must you attach to the synopsis?', ['The consent form', 'Your CV', 'A photo of the ward'], 0,
      'The committee checks the consent form along with your proforma.'],

    'thesis:1': ['Your chapter outline with word targets',
      'What should you check before you start writing?', ['Your university’s format rules', 'Other students’ marks', 'Nothing, just start'], 0,
      'Margins, fonts, headings and word limits differ between universities. Check them first to avoid rewriting.'],
    'thesis:2': ['The problem and why it matters',
      'Can you change the objectives from your approved synopsis?', ['Yes, freely', 'No, keep the same objectives'], 1,
      'The objectives were approved. Changing them can delay or block your thesis.'],
    'thesis:3': ['One themed section of your literature review',
      'What is the best way to write a literature review?', ['One paragraph for each paper', 'Group the studies by theme and compare them'], 1,
      'Grouping and comparing shows where studies agree, where they differ and what is missing.'],
    'thesis:4': ['Your methodology chapter, in the past tense',
      'Which tense do you use for the methodology chapter?', ['Future: “we will ask”', 'Past: “we asked”'], 1,
      'The synopsis was a plan. The thesis reports what you actually did.'],
    'thesis:5': ['Your basic-details table and first results',
      'What should NOT go in the results chapter?', ['Numbers and percentages', 'Your opinions about what they mean', 'Tables and charts'], 1,
      'Opinions and explanations belong in the discussion.'],
    'thesis:6': ['Your conclusion, recommendations and limitations',
      'What must your conclusion do?', ['Answer your objectives', 'Add new results', 'Thank everyone'], 0,
      'Each objective should get a clear answer in the conclusion.'],

    'meta:1': ['Your PICO topic and the rules for choosing studies',
      'When should you decide which studies to include?', ['Before you search', 'After you see the results'], 0,
      'Deciding first keeps the review fair. Changing the rules after seeing results is a form of bias.'],
    'meta:2': ['Your full search across several databases',
      'How many databases should you search?', ['Just PubMed', 'At least three'], 1,
      'No single database has every study, so a systematic review searches several.'],
    'meta:3': ['Your screening numbers and the reasons for leaving papers out',
      'Who should screen the papers?', ['One person alone', 'Two people, separately'], 1,
      'Two people working separately means one person’s opinion can’t decide alone.'],
    'meta:4': ['Your extraction sheet, filled in for 2 studies',
      'Where should you copy the numbers from?', ['The full paper', 'Only the abstract'], 0,
      'Abstracts leave out details and sometimes have errors. Always use the full paper.'],
    'meta:5': ['Risk of bias judgements for 2 studies',
      'Which tool is used for randomised trials?', ['RoB 2', 'Newcastle-Ottawa Scale', 'PRISMA'], 0,
      'RoB 2 is made for randomised trials. Newcastle-Ottawa is for cohort and case-control studies.'],
    'meta:6': ['Your combined result and what your forest plot shows',
      'In a forest plot, what does the diamond show?', ['All the studies combined', 'The biggest study', 'The weakest study'], 0,
      'Each square is one study. The diamond at the bottom is the combined answer.'],
    'meta:7': ['Your abstract, following PRISMA',
      'What is PRISMA 2020?', ['A checklist for reporting reviews', 'A statistics program', 'A journal'], 0,
      'It lists what a review must report, so editors and readers can trust and repeat it.']
  };
  C.tracks.forEach(function (t) {
    t.steps.forEach(function (s) {
      var q = Q[t.id + ':' + s.n]; if (!q) return;
      s.goal = q[0];
      s.check = { q: q[1], options: q[2], answer: q[3], why: q[4] };
    });
  });
})();
