/* Researchette programmes. Each programme (track) has phases and numbered steps.
   Every step has a short lesson, a weak/strong example and a task the member submits for mentor review.
   Written for complete beginners: short sentences, plain words, every new term explained the first
   time it appears, and one simple running example (skipping breakfast) through the whole original-article
   roadmap. The original-article roadmap is the core programme; the others follow the same shape. */
var ORIGINAL = {
  phases: [
    { id: 1, name: 'Plan', blurb: 'Choose a small, clear topic and get permission to start.' },
    { id: 2, name: 'Collect & analyse', blurb: 'Collect your answers and find out what they say.' },
    { id: 3, name: 'Write & publish', blurb: 'Write it up and send it to a journal.' }
  ],
  steps: [
    {
      n: 1, phase: 1, title: 'Research topic', summary: 'Choose it, then check it with PICO and FINER', minutes: 20,
      lesson: [
        { h: 'Start with something you noticed', p: 'Look around you: in class, in the hostel, on the wards. Anything that made you curious is a good start. For example: “A lot of my classmates skip breakfast.”' },
        { h: 'Make it small', p: 'A first study should be small: one group of people, one place and one thing to count. Small topics get finished and published. Big ones get stuck.' },
        { h: 'Break it into PICO', p: 'Write who you will study (P), what you are looking at (I), who you compare them with (C, often not needed) and what you will count (O). If you can fill in P and O, you have a topic.' },
        { h: 'Check it with FINER', p: 'FINER is five questions to ask about your topic. You want a “yes” to all five. If any answer is “no”, change the topic a little and ask again. The cards above explain each letter.' },
        { h: 'Write it as one sentence', p: 'Put it together in one simple sentence, for example: “How many MBBS students at our college skip breakfast?”' }
      ],
      example: {
        weak: 'Food habits of students.',
        strong: 'How many MBBS students at our medical college skip breakfast on most days?',
        why: 'It says who (MBBS students), where (our college) and exactly what you will count (skipping breakfast on most days). The weak topic is too big and doesn’t say what you will count.'
      },
      task: { prompt: 'Write your research topic in one simple sentence. Under it, write its P, I, C and O (write “not needed” if a part doesn’t apply). Then write one short line for each FINER letter to show your topic passes.', minWords: 40 }
    },
    {
      n: 2, phase: 1, title: 'Literature search', summary: 'Find what others already found, on PubMed', minutes: 30,
      lesson: [
        { h: 'Pick 2 or 3 key words', p: 'Take the main ideas from your topic. Topic: “skipping breakfast in MBBS students”. Key words: breakfast, and medical students. Don’t type a whole sentence.' },
        { h: 'Add words that mean the same', p: 'Different authors use different words. For each key word, write one or two more: breakfast or “morning meal”; “medical students” or “MBBS students”. Put words that belong together in “quotation marks”.' },
        { h: 'Join them with OR and AND', p: 'OR joins words that mean the same thing. AND joins two different ideas. Put each group in brackets, like this: (breakfast OR "morning meal") AND ("medical students" OR "MBBS students").' },
        { h: 'Search, then filter', p: 'Open pubmed.ncbi.nlm.nih.gov, paste your search and press Search. On the left, tick “5 years” so the papers are recent. Thousands of results? Add another AND word. Almost none? Add more OR words.' },
        { h: 'Read, then save', p: 'Read the titles first. For the ones that match, read the abstract (the short summary at the top of each paper). Save the useful ones in Zotero, a free app, or write down their titles and links.' }
      ],
      example: {
        weak: 'do medical students skip breakfast and why',
        strong: '(breakfast OR "morning meal") AND ("medical students" OR "MBBS students")',
        why: 'It uses key words instead of a sentence. OR joins the words that mean the same, and AND joins the two ideas, so PubMed only shows papers about both breakfast and medical students.'
      },
      task: { prompt: 'Do your first PubMed search. Write the exact search you typed, the filters you ticked, how many results you got, and the titles of 3 papers that are close to your topic.', minWords: 30 }
    },
    {
      n: 3, phase: 1, title: 'Study design', summary: 'Pick the right type of study', minutes: 25,
      lesson: [
        { h: 'Do you want to count, or to find a cause?', p: 'To count how common something is (“How many students skip breakfast?”), use a cross-sectional study. To find a cause, use a case-control or cohort study. To test a treatment, use a trial.' },
        { h: 'Pick one you can finish', p: 'Most students do a cross-sectional study, or look back at old hospital records. Both are quick and cheap, and journals publish them.' },
        { h: 'Say where and when', p: 'The setting is the place, like “our medical college”. The duration is the time, like “March to May 2026”.' },
        { h: 'Say who can take part', p: 'Inclusion criteria are who is allowed in, like “MBBS students of all years who agree to take part”. Exclusion criteria are who you leave out, and why, like “students who were fasting that week”.' }
      ],
      example: {
        weak: 'We will do a survey.',
        strong: 'A cross-sectional study at our medical college from March to May 2026. Included: MBBS students of all years who agree to take part. Excluded: students who were fasting during the study week.',
        why: 'It names the type of study, the place, the time and exactly who can and can’t take part.'
      },
      task: { prompt: 'Name your study design and say in 2–3 sentences why it suits your topic. Then write your setting, duration, and who is included and excluded.', minWords: 50 }
    },
    {
      n: 4, phase: 1, title: 'Synopsis and ethics', summary: 'Your plan on paper, and permission to start', minutes: 40,
      lesson: [
        { h: 'Write your plan (the synopsis)', p: 'A synopsis is your study plan on paper: title, introduction, why the study is needed, aims, definitions, method, timeline and references. Your college gives you a format to follow.' },
        { h: 'Say why it is needed (the rationale)', p: 'In 3–4 sentences say what is already known, what is missing here, and how your results could help.' },
        { h: 'Define what you will count', p: 'An operational definition says exactly how you decide “yes” or “no” for each thing you count, so everyone measures it the same way. For example: skipping breakfast = eating nothing before 10 am on 4 or more of the last 7 days.' },
        { h: 'Get permission before you start', p: 'Send your synopsis to your college ethics committee (called the ERC or IRB). Only start collecting answers after they approve it in writing. Each person must agree to take part (this is called informed consent).' }
      ],
      example: {
        weak: 'This topic is very important and needs research.',
        strong: 'We could not find any recent study on breakfast habits of medical students in our city. Knowing how many students skip breakfast can help our college plan canteen timings and health talks.',
        why: 'It shows exactly what is missing and how the results will be used.'
      },
      task: { prompt: 'Write your rationale (3–4 sentences), your aim or aims, and an operational definition for the main thing you will count.', minWords: 60 }
    },
    {
      n: 5, phase: 2, title: 'Sample size', summary: 'How many people you need', minutes: 25,
      lesson: [
        { h: 'Why the number matters', p: 'Ask too few people and your answer might just be luck. Ask too many and you waste months. Reviewers always check how you got your number, so never just pick 100.' },
        { h: 'Find your starting number', p: 'Look in the papers from your literature search for a similar study. Note the percentage it found, for example “40% of students skipped breakfast”. This is your expected percentage.' },
        { h: 'Let a calculator do the maths', p: 'Open OpenEpi (free, at openepi.com), choose Sample Size, then Proportion, and type your expected percentage. It gives you the number. Add about 10% extra for people who won’t reply.' },
        { h: 'Choose how you will pick people', p: 'Random sampling means everyone has an equal chance, like a lottery. It is the strongest. Convenience sampling means asking whoever is easy to reach. It is common but weaker, so say why you used it.' }
      ],
      example: {
        weak: 'We will take 100 students.',
        strong: 'An earlier study found 40% of medical students skipped breakfast (ref). With 95% confidence and a 5% margin of error, we need 369 students. Adding 10% for non-response gives 406. We will pick students randomly from each year’s list.',
        why: 'Every number has a source, so a reviewer can check the calculation.'
      },
      task: { prompt: 'Show your sample size: the expected percentage you used and where it came from, the result, and the number after adding 10%. Then name how you will pick people, with one line on why.', minWords: 40 }
    },
    {
      n: 6, phase: 2, title: 'Proforma and data', summary: 'Your questionnaire and your data sheet', minutes: 30,
      lesson: [
        { h: 'Keep it short', p: 'A proforma is the form or questionnaire each person fills. Start with basic details (age, gender, year), then your main questions. Every question should help answer your topic. If it doesn’t, remove it.' },
        { h: 'Ask clear, simple questions', p: 'Ask about facts people can remember: “In the last 7 days, on how many days did you eat breakfast?” is better than “Do you eat breakfast?” For things like sleep or stress, use a ready-made tested questionnaire. Your mentor will help you choose one.' },
        { h: 'Test it first', p: 'Give it to 5–10 people before the real study. Change any question they found confusing. This is called a pilot test.' },
        { h: 'Enter answers in a sheet', p: 'Use Excel or Google Sheets: one row for each person and one column for each question. Use numbers instead of words (1 = male, 2 = female), and keep a list of what each number means (a codebook).' }
      ],
      example: {
        weak: 'Do you eat breakfast? Yes / No',
        strong: 'In the last 7 days, on how many days did you eat something before 10 am? 0 1 2 3 4 5 6 7',
        why: 'It asks about a clear time period and gives a number you can count, so you can decide “skips breakfast” the same way for everyone.'
      },
      task: { prompt: 'List the sections and questions in your proforma, mention any ready-made questionnaire you will use (with its reference), and describe in 3–4 sentences how you will collect the answers.', minWords: 50 }
    },
    {
      n: 7, phase: 2, title: 'Statistical analysis', summary: 'Turning answers into results', minutes: 35,
      lesson: [
        { h: 'First, describe', p: 'Count and give percentages for groups, like “164 of 400 students (41%) skip breakfast”. For numbers like age, give the average (mean) and how spread out they are (standard deviation, SD).' },
        { h: 'Then, compare with the right test', p: 'A test tells you if a difference between groups is real or just luck. Use the chart above to pick one. Example: to compare skipping breakfast between 1st and 5th years, use the chi-square test.' },
        { h: 'Understand the p-value', p: 'The p-value is the chance that the difference happened by luck alone. If p is less than 0.05 (5 in 100), we call the difference “significant”, which means it is probably real.' },
        { h: 'Use free or college software', p: 'SPSS (often on college computers) or free tools like Jamovi run the tests for you. You only need to choose the right test and read the result.' }
      ],
      example: {
        weak: 'Data will be analysed using SPSS.',
        strong: 'Data will be analysed in SPSS. Age will be shown as mean ± SD. Skipping breakfast will be shown as number and percentage. We will compare skipping breakfast between years of study with the chi-square test, taking p < 0.05 as significant.',
        why: 'It says the software, how each answer will be shown, and which test answers the aim.'
      },
      task: { prompt: 'Write your analysis plan: the software, how you will show each main answer (numbers and percentages, or mean ± SD), and which test you will use for each comparison.', minWords: 40 }
    },
    {
      n: 8, phase: 3, title: 'Writing your paper', summary: 'The four parts: IMRaD', minutes: 45,
      lesson: [
        { h: 'Introduction: why?', p: 'Start with the big problem, narrow down to what is missing, and end with your aim in one sentence.' },
        { h: 'Methods: how?', p: 'Say what you did, step by step, so someone else could do exactly the same study.' },
        { h: 'Results: what did you find?', p: 'Give the numbers only, in sentences and tables, with the total each time (like “164 of 400”). Don’t explain the results here.' },
        { h: 'Discussion: what does it mean?', p: 'Say your main finding first, compare it with other studies, explain any differences, say what the weak points of your study were, and finish with a short conclusion.' }
      ],
      example: {
        weak: 'Many students skipped breakfast because they wake up late.',
        strong: 'Of 400 students, 164 (41%) skipped breakfast on most days.',
        why: 'Results give numbers with the total and no opinions. The reason (“because they wake up late”) belongs in the discussion.'
      },
      task: { prompt: 'Write the first paragraph of your Discussion. Say your main finding, then compare it with at least two published studies.', minWords: 80 }
    },
    {
      n: 9, phase: 3, title: 'Referencing', summary: 'Giving credit with Vancouver style and Zotero', minutes: 20,
      lesson: [
        { h: 'Number your sources in order', p: 'Every time you use someone else’s finding, add a number, like [1]. The first source you mention is 1, the next new one is 2, and so on. This is called Vancouver style.' },
        { h: 'Write each reference the same way', p: 'At the end, list them in number order: authors, title, journal, then year;volume(issue):pages. The picture above shows each part.' },
        { h: 'Let Zotero do it for you', p: 'Zotero is a free app that saves papers with one click and writes the reference list in Word for you. Never type references by hand.' },
        { h: 'Use your own words', p: 'Don’t copy sentences from papers. Write the idea in your own words and add the number. Journals check copying with software, and HEC generally accepts a similarity score up to 19%.' }
      ],
      example: {
        weak: 'Watson and Crick (1953), DNA paper, Nature journal.',
        strong: 'Watson JD, Crick FH. Molecular structure of nucleic acids; a structure for deoxyribose nucleic acid. Nature. 1953;171(4356):737-8.',
        why: 'It has every author, the full title, the short journal name, and the year, volume, issue and pages in the right order.'
      },
      task: { prompt: 'Write 5 references from your study in Vancouver style, and one sentence from your introduction with the correct citation numbers.', minWords: 40 }
    },
    {
      n: 10, phase: 3, title: 'Journal submission', summary: 'Choosing a journal and sending your paper', minutes: 30,
      lesson: [
        { h: 'Choose the right journal', p: 'Pick one that publishes your kind of topic and is listed in PubMed, Scopus or the HEC list. Check the fees. Avoid fake (“predatory”) journals that email you promising quick publishing for money.' },
        { h: 'Follow its rules exactly', p: 'Every journal has “author guidelines”: word limits, headings and reference style. Many papers are rejected in the first week just for not following them.' },
        { h: 'Write a short cover letter', p: 'A few lines to the editor: your title, why it suits their journal, and that the work is original, not sent anywhere else, and approved by all authors.' },
        { h: 'Reply to reviewers politely', p: 'Experts (reviewers) will send comments. Answer each one, one by one, politely, and show where you changed the paper. This is normal and not a rejection.' }
      ],
      example: {
        weak: 'Please publish my article.',
        strong: 'Dear Editor, we submit our original article, “Breakfast skipping among MBBS students at a medical college in Lahore”, for your journal. It gives new local data that will interest your readers in medical education. The work is original, not under review elsewhere, and approved by all authors.',
        why: 'It tells the editor what the paper is, why it fits their journal, and includes the statements editors need.'
      },
      task: { prompt: 'Name two journals you would send your paper to and why they fit, then write your cover letter in 150–200 words.', minWords: 100 }
    }
  ]
};

(function () {
  function L(h, p) { return { h: h, p: p }; }
  function S(n, phase, title, summary, minutes, lesson, weak, strong, why, prompt, minWords) {
    return { n: n, phase: phase, title: title, summary: summary, minutes: minutes, lesson: lesson,
      example: { weak: weak, strong: strong, why: why }, task: { prompt: prompt, minWords: minWords } };
  }

  var CASE = {
    phases: [{ id: 1, name: 'Prepare', blurb: 'Pick the right patient and get their permission.' }, { id: 2, name: 'Write', blurb: 'Write the story the way journals expect.' }],
    steps: [
      S(1, 1, 'Choose a case', 'What makes a patient worth writing about', 20, [
        L('Look for something new', 'Journals want cases that teach doctors something: a rare disease, a common disease that looked unusual, a new way to diagnose or treat, or an unexpected side effect of a medicine.'),
        L('Check how many exist already', 'Search PubMed for your disease plus “case report”. If very few similar cases exist, or yours has something different, it is a good choice.'),
        L('Find your one lesson', 'Finish this sentence: “Doctors should learn from this case that…”. If you can’t finish it, the case isn’t ready yet.')
      ], 'A patient with typhoid fever.',
        'Typhoid fever that looked like gallbladder inflammation (acalculous cholecystitis) in a 19-year-old man, an uncommon presentation that delayed the diagnosis.',
        'It names the disease, the unusual part and why doctors should care.',
        'Describe your case in 3–4 sentences, write its one lesson, and say how many similar cases you found on PubMed.', 50),
      S(2, 1, 'Consent and privacy', 'The patient’s permission', 15, [
        L('Get written permission', 'The patient (or a parent or guardian) must sign a form agreeing to the case, and any pictures, being published.'),
        L('Hide who the patient is', 'Remove names, initials, hospital numbers, exact dates and addresses. Crop or cover faces and tattoos in pictures.'),
        L('Check your hospital’s rules', 'Some hospitals also want their ethics committee to know. Journals will ask you for a consent statement.')
      ], 'Consent was taken.',
        'Written informed consent was obtained from the patient for publication of this case report and the accompanying images. A copy is available to the editor on request.',
        'It says what the patient agreed to and that proof is available.',
        'Write your consent statement and list every detail you will remove so the patient can’t be recognised.', 30),
      S(3, 2, 'The patient’s story', 'What happened, in order', 30, [
        L('About the patient', 'Age, sex, and only the history that matters: the main complaint, past illnesses, medicines and family history related to this case.'),
        L('What you found', 'The important findings on examination, including important normal ones, in the order you found them.'),
        L('Make a timeline', 'A small table with the day, what happened, what was found and what was done. It makes the story easy to follow.')
      ], 'The patient came with fever, was given treatment and got better.',
        'A 19-year-old man came with 10 days of fever and 2 days of pain under the right ribs. Murphy’s sign was positive, and ultrasound showed a swollen, thick-walled gallbladder without stones.',
        'It is specific, in order, and includes the findings that point to the diagnosis.',
        'Write the patient information and clinical findings, and a timeline table with at least 5 events.', 120),
      S(4, 2, 'Diagnosis, treatment and outcome', 'How you worked it out, and what happened', 30, [
        L('How you reached the diagnosis', 'List the tests you did, the other diseases you thought of (the differential diagnosis) and why you ruled each one out.'),
        L('The treatment', 'Every medicine with its dose, how it was given and for how long, plus any procedures or changes of plan.'),
        L('What happened after', 'How the patient did, how you checked it (a follow-up visit or test), and any side effects.')
      ], 'Blood tests confirmed the diagnosis.',
        'Blood culture grew Salmonella Typhi sensitive to ceftriaxone; hepatitis A and E tests were negative. He received IV ceftriaxone 2 g daily for 14 days. His pain settled by day 5, and a repeat ultrasound at 4 weeks was normal.',
        'The reader can see exactly how the diagnosis was made and what the treatment achieved.',
        'Write how you reached the diagnosis (with the other diseases you considered), the treatment, and the follow-up and outcome.', 100),
      S(5, 2, 'Introduction and discussion', 'Why the case matters', 35, [
        L('A short introduction', 'One paragraph: what the disease is and why this case is worth reading.'),
        L('The discussion', 'Compare your case with other published cases, explain why this might have happened, and mention what your report could not show.'),
        L('Learning points', 'End with 2–3 short, practical lessons for doctors.')
      ], 'This is a very rare case.',
        'Gallbladder inflammation without stones happens in only a small number of typhoid cases (ref). Like the cases reported by earlier authors (refs), our patient’s pain began in the second week of fever, which suggests…',
        'It proves “rare” with a reference and links the case to other reports.',
        'Write the introduction (about 100 words) and the discussion with at least 3 references, ending with 2–3 learning points.', 150),
      S(6, 2, 'Title, abstract and submission', 'Getting it to a journal', 25, [
        L('A clear title', 'Include the words “case report” and the main disease or unusual feature.'),
        L('A short abstract', 'A 150–250 word summary in three parts: introduction, case presentation and conclusion, plus 3–5 keywords.'),
        L('Pick a journal', 'Choose one that publishes case reports in your subject, check its fees and follow its author guidelines exactly.')
      ], 'An interesting case',
        'Typhoid Fever Presenting as Acute Acalculous Cholecystitis: A Case Report',
        'Editors, and anyone searching online, can tell at once what the paper is about.',
        'Write your title, abstract and keywords, and name the journal you plan to send it to.', 120)
    ]
  };

  var LETTER = {
    phases: [{ id: 1, name: 'Prepare', blurb: 'Find an article and a point worth making.' }, { id: 2, name: 'Write & submit', blurb: 'A short, polite, well-referenced letter.' }],
    steps: [
      S(1, 1, 'Pick an article', 'Something worth replying to', 20, [
        L('Choose a recent article', 'A letter to the editor replies to an article the journal published recently, usually in the last few months.'),
        L('Find something useful to add', 'A weak point in the study, another way to explain the result, newer evidence or local data. A letter that only says “great article” won’t be published.'),
        L('Read the journal’s rules', 'Check how many words, references and authors the journal allows for letters.')
      ], 'I liked this article about students.',
        'Khan et al. asked students if they “usually” skip breakfast, but didn’t define “usually”; asking about the last 7 days would make the results easier to compare with other studies.',
        'It names the article and makes one specific, useful point.',
        'Give the full reference of the article, the journal’s limits for letters, and the 1–2 points you will make.', 40),
      S(2, 1, 'Build your argument', 'One point per paragraph', 25, [
        L('One idea per paragraph', 'Keep each paragraph to one point, so the editor can follow it quickly.'),
        L('Back it up', 'Support every point with a reference or with numbers.'),
        L('Stay polite', 'Be helpful, not rude: suggest how the problem could be fixed.')
      ], 'The authors made a big mistake.',
        'All participants came from one hostel, so the results may not apply to students who live at home; including day scholars (3) could address this.',
        'It is polite, specific and supported by a reference.',
        'Write your main argument paragraph or paragraphs, with references.', 80),
      S(3, 2, 'Write the letter', 'The full draft', 30, [
        L('The shape', '“Dear Editor”, an opening line naming the article, your points, and one closing sentence.'),
        L('Keep it short', 'Usually 300–600 words and 5–10 references. Cut anything that doesn’t support your point.'),
        L('References', 'Use Vancouver style. The article you are replying to is usually reference 1.')
      ], 'Hello, I am a medical student and I want to say…',
        'Dear Editor, We read with interest the article by Khan et al. (1) on breakfast habits of medical students…',
        'It follows the standard opening that editors expect.',
        'Write your full letter within the journal’s limits.', 200),
      S(4, 2, 'Submit', 'The details editors check', 15, [
        L('Author details', 'Names, where each author works or studies, an email for the main (corresponding) author, and ORCID IDs if you have them.'),
        L('Two short statements', 'A conflict of interest statement and a funding statement, even if the answer to both is “none”.'),
        L('Choose “Letter” when you submit', 'On the journal’s website choose “Letter to the Editor” as the article type, and reply quickly to any emails from the editor.')
      ], 'Sent without the statements.',
        'Conflicts of interest: none declared. Funding: none.',
        'Missing statements are a common reason for delays.',
        'Paste your final letter with its title, author line, conflict of interest and funding statements, and the journal you are sending it to.', 150)
    ]
  };

  var SYNOPSIS = {
    phases: [{ id: 1, name: 'Foundations', blurb: 'Topic, background and definitions.' }, { id: 2, name: 'Methods & submission', blurb: 'How the study will run, and getting it approved.' }],
    steps: [
      S(1, 1, 'Title, topic and objectives', 'The core of your synopsis', 25, [
        L('A complete title', 'Your title should say what you will measure, in whom, where, and the type of study.'),
        L('A clear research topic', 'Use PICO (who, what, compared with whom, what you will count) so the topic is clear and can be answered.'),
        L('SMART objectives', 'An objective is what you will find out. Make it Specific, Measurable, Achievable, Relevant and Time-bound. One main objective is usually enough.')
      ], 'Study of diabetes.',
        'Frequency of Diabetic Foot Neuropathy among Type 2 Diabetics Presenting to the Medical OPD of Mayo Hospital, Lahore: A Cross-Sectional Study',
        'It tells the reviewer exactly what, who, where and how.',
        'Write your synopsis title, your research topic and your objectives.', 40),
      S(2, 1, 'Introduction and rationale', 'Why the study is needed', 35, [
        L('From big to small', 'Start with the problem in the world, then in Pakistan, then in your hospital or college.'),
        L('Use recent numbers', 'Give the latest figures, local and international, each with a reference.'),
        L('Say what is missing', 'End with the rationale: what we don’t know here yet, and how your results will be used.')
      ], 'Diabetes is a very common disease all over the world.',
        'Pakistan has one of the highest rates of diabetes in the world (ref), yet there is little local data on foot neuropathy in OPD patients. Knowing how common it is will help plan routine foot checks.',
        'It is specific, referenced and ends with a clear gap.',
        'Write your introduction and rationale.', 150),
      S(3, 1, 'Operational definitions', 'Saying exactly how you will measure', 20, [
        L('Define everything you will count', 'For each thing you measure, say exactly how you will measure it and what counts as “yes”.'),
        L('Hypothesis only if you compare', 'If your study compares groups, write a hypothesis (what you expect to find). If it only counts how common something is, you don’t need one.'),
        L('Match your proforma', 'Use the same tests and cut-offs here as on your questionnaire or data form.')
      ], 'Neuropathy: damage to nerves.',
        'Diabetic foot neuropathy: the patient cannot feel a 10 g monofilament at one or more of 10 test points on either foot.',
        'Anyone could use it and get the same answer.',
        'Write operational definitions for everything you will measure, and a hypothesis if your study compares groups.', 50),
      S(4, 2, 'Methodology', 'Design, sample and who can take part', 35, [
        L('Design, place and time', 'Name the type of study, the exact place, and how long it will run, counted from the date of approval.'),
        L('How many, and how you pick them', 'Show your sample size calculation, where your starting number came from, and how you will choose people.'),
        L('Who is in and who is out', 'Clear inclusion and exclusion criteria that anyone could check.')
      ], 'Patients will be taken from OPD.',
        'All type 2 diabetics aged 30–70 years with diabetes for more than 5 years who come to the medical OPD of Mayo Hospital, Lahore, will be included one after another (consecutive sampling) for 6 months after approval.',
        'It is specific enough for someone else to repeat.',
        'Write your methodology, up to and including who is included and excluded.', 120),
      S(5, 2, 'Data collection and analysis', 'Step by step, and the statistics', 30, [
        L('Step by step', 'From approval and consent, to examining or asking each person, to filling the form and storing the data safely.'),
        L('The analysis plan', 'The software, how each result will be shown, which groups you will split the results by (like age or gender), and which test you will use.'),
        L('Attach your forms', 'Your questionnaire (proforma) and consent form go at the end, in the annexes.')
      ], 'Data will be analysed on SPSS.',
        'Data will be analysed in SPSS. Age and years of diabetes will be shown as mean ± SD, and neuropathy as number and percentage. Results will be split by age, gender and sugar control (HbA1c), and compared with the chi-square test (p < 0.05 significant).',
        'It answers every question a reviewer will ask about the analysis.',
        'Write your data collection steps and your data analysis plan.', 100),
      S(6, 2, 'References, timeline and submission', 'Finish and send it', 20, [
        L('References', 'Usually 10–20 recent references, in Vancouver style.'),
        L('A timeline', 'A simple month-by-month plan from approval to the final write-up.'),
        L('Submit it', 'Follow your university or CPSP format exactly and attach the proforma and consent form.')
      ], 'Time: 6 months.',
        'Month 1: approval and pilot test. Months 2–5: data collection. Month 6: analysis and write-up.',
        'Reviewers can see the plan is realistic.',
        'Write your timeline, list your references, and list the annexes you will attach.', 80)
    ]
  };

  var THESIS = {
    phases: [{ id: 1, name: 'Plan & early chapters', blurb: 'The outline, introduction and literature review.' }, { id: 2, name: 'Results & finishing', blurb: 'Methods, results, discussion and final checks.' }],
    steps: [
      S(1, 1, 'Plan your chapters', 'An outline before you write', 20, [
        L('The usual chapters', 'Introduction, literature review, methodology, results, and discussion with conclusion.'),
        L('Your university’s rules', 'Check margins, font, spacing, reference style and word limits before you start.'),
        L('Outline first', 'Write every heading with a target number of words. One big task becomes many small ones.')
      ], 'I will just start writing from the introduction.',
        'Chapter 1 Introduction (2,000 words): background, the problem, why it matters, objectives, operational definitions…',
        'A detailed outline makes writing much faster.',
        'Write your chapter outline with headings and word targets, and list your university’s format rules.', 60),
      S(2, 1, 'Introduction chapter', 'From background to objectives', 35, [
        L('Build on your synopsis', 'Use your approved synopsis as the base, add more background and update the references.'),
        L('The problem and why it matters', 'Say clearly what the problem is, and why solving it matters here.'),
        L('Same objectives', 'Keep the objectives and definitions exactly as they were approved in your synopsis.')
      ], 'This thesis is about neuropathy.',
        'Although diabetes is very common in Pakistan, foot neuropathy is often found only after ulcers appear. We need data from OPD patients to catch it earlier…',
        'It describes a specific, local problem.',
        'Write the problem statement and the “why it matters” section of your introduction.', 150),
      S(3, 1, 'Literature review', 'Group the studies, don’t list them', 45, [
        L('Group by theme', 'Put studies together by topic (how common it is, risk factors, tests used), instead of one paragraph per paper.'),
        L('Compare them', 'Show where studies agree, where they disagree, and why they might differ.'),
        L('Finish with the gap', 'Each theme should lead to what is still unknown, which is what your study adds.')
      ], 'Ali (2019) did a study. Khan (2020) also did a study.',
        'Studies report that 22% to 48% of diabetics have neuropathy (refs); the higher figures come from big hospitals using nerve tests, while simple screening tests give lower numbers (refs).',
        'It combines several studies into one clear idea.',
        'Write one themed section of your literature review (at least 300 words) with at least 5 references.', 250),
      S(4, 2, 'Methodology chapter', 'What you actually did', 30, [
        L('Write in the past tense', 'Describe what you did, not what you will do.'),
        L('Say what changed', 'Honestly say anything that changed from your synopsis, and why.'),
        L('Ethics and statistics', 'Include the ethics approval number and your full analysis plan.')
      ], 'Patients will be enrolled one after another.',
        'After approval from the ethics committee (ref. no. …), 196 patients were enrolled one after another from March to August 2026.',
        'It records what happened, with proof.',
        'Write your methodology chapter in the past tense, including anything that changed from your synopsis.', 200),
      S(5, 2, 'Results', 'Tables and plain facts', 35, [
        L('Start with who took part', 'How many people were checked, included and analysed, and a table of their basic details (age, gender and so on).'),
        L('One objective at a time', 'Tables and charts for each objective. The text points out the most important numbers.'),
        L('No opinions', 'Keep explanations for the discussion. Table titles go above tables, chart titles below charts.')
      ], 'Most patients had neuropathy, which shows poor control.',
        'Of 196 patients, 71 (36.2%) had neuropathy. It was more common in those with HbA1c above 8% (48.1% vs 24.0%, p = 0.001).',
        'Facts with totals; the explanation is left for later.',
        'Describe your basic-details table and the results for your first objective.', 120),
      S(6, 2, 'Discussion and final checks', 'Finish strong', 40, [
        L('Discuss', 'Main finding first, compare with other studies, explain differences, then weak points and recommendations.'),
        L('Conclude', 'Answer each objective directly, in a few sentences.'),
        L('Final checks', 'Plagiarism report (HEC generally accepts up to 19%), formatting, abstract, acknowledgements and binding rules.')
      ], 'In conclusion, neuropathy is a big problem.',
        'Foot neuropathy was found in about one in three type 2 diabetics in our OPD, and was more common in those with poor sugar control.',
        'It answers the objective with the actual finding.',
        'Write your conclusion, recommendations and one paragraph on the weak points (limitations) of your study.', 150)
    ]
  };

  var META = {
    phases: [{ id: 1, name: 'Plan & search', blurb: 'Topic, plan, search and choosing studies.' }, { id: 2, name: 'Analyse & write', blurb: 'Collect the numbers, check quality, combine and report.' }],
    steps: [
      S(1, 1, 'Topic and plan', 'PICO and which studies count', 30, [
        L('Write your topic with PICO', 'Who (P), what treatment or exposure (I), compared with what (C), what result (O), plus which types of study you will include.'),
        L('Decide the rules first', 'Write which studies you will include and exclude before you start searching, so you can’t be accused of picking favourites.'),
        L('Register your plan', 'Register your plan (protocol) on PROSPERO, a free website, before you start choosing studies. Many journals now expect this.')
      ], 'Is vitamin D good?',
        'In pregnant women (P), does taking vitamin D (I), compared with a dummy tablet or nothing (C), reduce pre-eclampsia (O)? Only randomised trials included.',
        'Every part of the topic can be searched for and judged.',
        'Write your PICO topic, your rules for including and excluding studies, and your main and extra outcomes.', 60),
      S(2, 1, 'Search strategy', 'Find every study', 35, [
        L('Search at least three databases', 'For example PubMed, Cochrane Library and Scopus, plus trial registries.'),
        L('Official terms plus normal words', 'Combine MeSH terms (PubMed’s official words) with normal words and synonyms. Try not to limit by language.'),
        L('Write everything down', 'For each database save the date, the exact search and the number of results.')
      ], 'vitamin D pregnancy',
        '("Vitamin D"[Mesh] OR cholecalciferol[tiab] OR "vitamin D"[tiab]) AND ("Pregnancy"[Mesh] OR pregnan*[tiab]) AND ("Pre-Eclampsia"[Mesh] OR preeclampsia[tiab]) AND randomized controlled trial[pt]',
        'It is complete, someone else could repeat it, and it only finds trials.',
        'Paste your full PubMed search, list the other databases, and give the number of results from each.', 50),
      S(3, 1, 'Screening', 'Choosing the studies, in two rounds', 30, [
        L('Remove duplicates', 'The same paper often appears in several databases. Rayyan or Zotero remove the copies for you.'),
        L('Two people, separately', 'Two people read the titles and abstracts, then the full papers, each on their own. Where they disagree, they discuss it.'),
        L('Write down why', 'Note why each full paper was left out. These numbers fill your PRISMA flow diagram.')
      ], 'I picked the relevant papers.',
        '1,248 found; 312 duplicates removed; 936 screened; 41 full papers read; 12 trials included (29 left out: 14 wrong outcome, 9 not randomised, 6 wrong population).',
        'Anyone can see exactly how the studies were chosen.',
        'Give your numbers at each stage and the main reasons for leaving papers out.', 50),
      S(4, 2, 'Data extraction', 'Copying the numbers into one sheet', 30, [
        L('Make the sheet', 'Columns for author, year, country, type of study, number of people, the treatment, the comparison, and the result numbers.'),
        L('Test it', 'Try it on 2–3 studies and fix any unclear columns.'),
        L('Two people again', 'Two people fill it in separately and compare.')
      ], 'I copied the results from each paper.',
        'Study | Country | People (I/C) | Dose | Pre-eclampsia cases I/C → Ali 2021 | Pakistan | 120/118 | 4,000 IU daily | 6/14',
        'Organised numbers are exactly what you need to combine the studies.',
        'List the columns of your sheet and fill it in for 2 studies.', 60),
      S(5, 2, 'Risk of bias', 'How trustworthy is each study?', 30, [
        L('Pick the right tool', 'RoB 2 for randomised trials; ROBINS-I or Newcastle–Ottawa for other studies.'),
        L('Judge each part', 'Each tool asks about different parts of a study. Give a judgement and a reason for each part, not only an overall score.'),
        L('Rate the overall evidence', 'Use GRADE to say how sure you are about each result: high, moderate, low or very low.')
      ], 'All studies were good quality.',
        'Ali 2021: some concerns about how people were randomised (the paper doesn’t say how the groups were kept secret); low risk in the other parts.',
        'Each judgement has a reason.',
        'Name the tool you will use and give judgements, with reasons, for 2 of your studies.', 60),
      S(6, 2, 'Combine the results', 'Forest plots', 40, [
        L('Choose the measure', 'For yes/no results use a risk ratio (RR) or odds ratio (OR). For numbers use the mean difference.'),
        L('Check how much studies disagree', 'I² tells you how different the studies’ results are: about 25% low, 50% moderate, 75% high. If they differ a lot, use a random-effects model.'),
        L('Check the result holds', 'Repeat the analysis without the weakest studies (sensitivity analysis). With 10 or more studies, also draw a funnel plot.')
      ], 'The meta-analysis showed vitamin D works.',
        'Vitamin D reduced pre-eclampsia (RR 0.62, 95% CI 0.45–0.85; 12 trials, 2,410 women; I² = 38%, random effects).',
        'It gives the size of the effect, how precise it is, how much evidence there is and how much studies disagreed.',
        'Describe your combined analysis: the measure, the model, the result (or your plan), I², and what your forest plot shows.', 80),
      S(7, 2, 'Write with PRISMA 2020', 'Report it fully', 40, [
        L('Follow the checklist', 'PRISMA 2020 is a list of 27 things your paper must report. Write the page number for each one before you submit.'),
        L('The flow diagram', 'Show how many papers were found, screened, left out (with reasons) and included.'),
        L('A balanced discussion', 'Summarise the evidence, how sure you are, the weak points of the studies and of your review, and what it means for patients.')
      ], 'We did a meta-analysis and found good results.',
        'Background, objectives, methods (databases, dates, rules, risk of bias, how results were combined), results (studies, people, combined results), limitations and conclusion, in about 250 words.',
        'It follows PRISMA for Abstracts, which editors check first.',
        'Write your abstract (about 250 words) following PRISMA for Abstracts.', 150)
    ]
  };

  window.CURRICULUM = {
    tracks: [
      { id: 'original', name: 'Original article', short: 'Original article', blurb: 'Plan, run and write your own study, from topic to journal.', phases: ORIGINAL.phases, steps: ORIGINAL.steps },
      { id: 'case', name: 'Case report', short: 'Case report', blurb: 'Turn an interesting patient into a publication.', phases: CASE.phases, steps: CASE.steps },
      { id: 'letter', name: 'Letter to the editor', short: 'Letter', blurb: 'A short, polite reply to a published article.', phases: LETTER.phases, steps: LETTER.steps },
      { id: 'synopsis', name: 'Synopsis', short: 'Synopsis', blurb: 'A study plan your ethics committee or CPSP will approve.', phases: SYNOPSIS.phases, steps: SYNOPSIS.steps },
      { id: 'thesis', name: 'Thesis', short: 'Thesis', blurb: 'Chapter by chapter, for MPhil, MS, MD and FCPS.', phases: THESIS.phases, steps: THESIS.steps },
      { id: 'meta', name: 'Systematic review & meta-analysis', short: 'Meta-analysis', blurb: 'Find, choose, check and combine published studies.', phases: META.phases, steps: META.steps }
    ]
  };
  window.CURRICULUM.track = function (id) {
    return window.CURRICULUM.tracks.filter(function (t) { return t.id === id; })[0] || window.CURRICULUM.tracks[0];
  };
})();

/* ---------- Extra guidance: plain-language intros, pictures, common mistakes, checklists and templates ----------
   Keyed by "programme:step". Picture types (drawn by portal.js):
   table {head, rows} · flow {steps} · choose {items: [if, then, note]} · pyramid {levels, strongest first}
   formula {expr, legend, worked} · letters {items: [letter, word, question, good, bad]} (PICO, FINER, SMART)
   funnel {levels: [label, text, width%?]} · venn {items: [{op, a, b, note}]} (AND / OR / NOT)
   screen {url, query, filters, count, results, notes: [[spot, text]]} (a drawing of a website)
   sheet {cols, rows, note} (a spreadsheet) · forest {rows: [study, est, low, high, weight], pooled} */
(function () {
  var X = {};
  function add(key, o) { X[key] = o; }

  /* ===== Original article ===== */
  add('original:1', {
    intro: 'Your research topic is the one thing your study is about, written as one clear sentence. Everything else (your method, your questionnaire, your paper) grows from it. The best first topics are small and simple: something you can check in a few months, with people you can easily reach, like your classmates.',
    visuals: [
      { type: 'funnel', title: 'From a big idea to a small topic', levels: [
        ['Big idea', 'Food and health'],
        ['Narrower', 'Breakfast habits'],
        ['Who?', 'Breakfast habits of MBBS students'],
        ['Where?', 'MBBS students at our medical college'],
        ['Your topic', 'How many MBBS students at our college skip breakfast?']] },
      { type: 'letters', title: 'PICO: the four parts of a clear topic', items: [
        ['P', 'Population', 'Who will you study?', 'MBBS students at our college'],
        ['I', 'Intervention or exposure', 'What are you looking at in them?', 'Their breakfast habits'],
        ['C', 'Comparison', 'Compared with whom? Often not needed.', 'Not needed: we only want to know how many'],
        ['O', 'Outcome', 'What exactly will you count or measure?', 'Skipping breakfast on most days']] },
      { type: 'letters', title: 'FINER: five questions to check your topic', items: [
        ['F', 'Feasible', 'Can you really finish it, with the time, people and money you have?', 'Asking 400 classmates in 2 months', 'Following 5,000 patients for 10 years'],
        ['I', 'Interesting', 'Do you, and other people, want to know the answer?', 'Your college wants to know how many students skip breakfast', 'A question nobody would want to read about'],
        ['N', 'Novel', 'Is it new? It only has to be new for your place or group, not for the whole world.', 'Nobody has studied this at your college yet', 'Copying a study already done at your college last year'],
        ['E', 'Ethical', 'Is it safe and fair for the people taking part, and will you ask their permission?', 'An anonymous questionnaire that people agree to fill', 'Asking private questions with names written on the form'],
        ['R', 'Relevant', 'Will the answer be useful to students, doctors or patients?', 'It can help the college plan canteen timings', 'The answer wouldn’t change anything for anyone']] },
      { type: 'choose', title: 'If a FINER answer is “no”, fix it like this', items: [
        ['Not Feasible: too big or too slow', 'Make it smaller', 'Fewer people, one college, one year of students, a shorter time'],
        ['Not Interesting', 'Ask a senior or your mentor', '“Would you want to know this?” If not, pick another idea'],
        ['Not Novel: already done here', 'Change the group or place', 'A different year of students, another college or your city'],
        ['Not Ethical', 'Remove anything risky', 'Make it anonymous, ask permission, check with your supervisor'],
        ['Not Relevant', 'Think who it helps', 'If nobody would use the answer, choose another topic']] }],
    mistakes: ['Choosing a topic that is too big, like “the diet of students”.', 'Not saying what you will count or measure.', 'Putting two or three topics in one sentence.', 'Choosing people you can’t reach, like patients in another city.'],
    include: ['Your topic in one sentence', 'P, I, C and O written separately (write “not needed” if C doesn’t apply)', 'One short line for each FINER letter'],
    template: 'My research topic (one sentence):\n\nP: Who will I study?\nI: What am I looking at?\nC: Compared with whom? (write “not needed” if none)\nO: What will I count or measure?\n\nFINER check:\nF (Feasible):\nI (Interesting):\nN (Novel):\nE (Ethical):\nR (Relevant):'
  });
  add('original:2', {
    intro: 'Before you start, look at what other people have already found about your topic. This is called a literature search (“literature” just means published papers). It shows you what is already known, gives you ideas for your own study, and shows the gap your study will fill. You will use PubMed: a free website with millions of medical papers. Don’t worry if it looks confusing at first: follow the five steps and the picture below.',
    visuals: [
      { type: 'flow', title: 'Your first search in 5 steps', steps: [
        ['Write 2–3 key words', 'The main words of your topic. For “skipping breakfast in medical students”: breakfast, and medical students.'],
        ['Add other words that mean the same', 'Breakfast → “morning meal”. Medical students → “MBBS students”.'],
        ['Join them with OR and AND', 'OR between words that mean the same, AND between different ideas.'],
        ['Search on PubMed, then filter', 'Paste it at pubmed.ncbi.nlm.nih.gov, press Search, then tick “5 years”.'],
        ['Read and save', 'Read the titles, open the ones that match, and save them in Zotero.']] },
      { type: 'venn', title: 'What OR, AND and NOT do', items: [
        { op: 'OR', a: 'breakfast', b: 'morning meal', note: 'Papers with either word. You get more papers.' },
        { op: 'AND', a: 'breakfast', b: 'students', note: 'Only papers with both words. Fewer, but more useful.' },
        { op: 'NOT', a: 'breakfast', b: 'children', note: 'Leaves out papers with the second word. Use it rarely.' }] },
      { type: 'screen', title: 'What PubMed looks like (a drawing)', url: 'pubmed.ncbi.nlm.nih.gov', query: '(breakfast OR "morning meal") AND ("medical students" OR "MBBS students")',
        filters: [['5 years', true], ['Humans', true], ['Free full text', false]], count: 'Example: 38 results',
        results: ['Example: a study on breakfast habits of medical students', 'Example: skipping meals and exam results in students'],
        notes: [['box', 'Type or paste your search here.'], ['button', 'Press Search.'], ['filters', 'On the left, tick “5 years” (and “Humans”) to keep only recent studies on people.'],
          ['count', 'This is how many papers were found. Write this number down.'], ['result', 'Click a title to read the abstract. Use Save, or the Zotero button, to keep it.']] }],
    mistakes: ['Typing a whole sentence into the search box.', 'Forgetting the quotation marks around words that belong together, like "medical students".', 'Only reading titles, never the abstracts.', 'Not writing down what you typed and how many results you got.'],
    include: ['The exact search you typed', 'The filters you ticked', 'How many results you got', 'The titles of 3 papers close to your topic'],
    template: 'My key words:\n1.\n2.\n\nOther words that mean the same:\n\nMy search (exactly what I typed):\n\nFilters I ticked:\nNumber of results:\n\n3 papers close to my topic:\n1.\n2.\n3.'
  });
  add('original:3', {
    intro: 'The study design is the type of study you will do: your plan for finding the answer. Just as a doctor picks the right test for a patient, you pick the right design for your topic. For most first projects the answer is easy: a cross-sectional study. That means asking a group of people your questions once, at one point in time, like taking a photo.',
    visuals: [
      { type: 'choose', title: 'Which design should I use?', items: [
        ['I want to know how common something is', 'Cross-sectional', 'Like a photo: everyone asked once'],
        ['I saw one unusual patient', 'Case report'],
        ['The disease is rare and I want to find its causes', 'Case-control', 'Start with sick and healthy people, look back'],
        ['I want to follow people over time', 'Cohort', 'Like a video: follow people forward'],
        ['I want to test if a treatment works', 'Randomised controlled trial', 'Groups picked by chance, like a coin toss'],
        ['I want to combine studies that already exist', 'Systematic review & meta-analysis']] },
      { type: 'table', title: 'The main designs in simple words', head: ['Design', 'In simple words', 'Example', 'Time & cost'], rows: [
        ['Case report', 'The story of one unusual patient.', 'A rare presentation of dengue.', 'Very quick'],
        ['Cross-sectional', 'Ask a group once, at one time.', 'How many MBBS students skip breakfast?', 'Quick and cheap. Most student projects.'],
        ['Case-control', 'Compare people with and without a disease, and look back at their past.', 'Is smoking linked to mouth cancer?', 'Medium'],
        ['Cohort', 'Follow people forward in time and see who gets ill.', 'Do smokers get more heart disease over 10 years?', 'Slow and costly'],
        ['Randomised controlled trial (RCT)', 'Split people by chance: one group gets the treatment, the other doesn’t.', 'Does vitamin D prevent pre-eclampsia?', 'Slow, costly, strict rules'],
        ['Systematic review & meta-analysis', 'Collect all good studies on one topic and combine their results.', 'Overall, does vitamin D help in pregnancy?', 'Medium. No patients needed.']] },
      { type: 'pyramid', title: 'How strong is each design? (strongest at the top)', levels: ['Systematic reviews & meta-analyses', 'Randomised controlled trials', 'Cohort studies', 'Case-control studies', 'Cross-sectional studies', 'Case reports & case series', 'Expert opinion'] }],
    mistakes: ['Writing “survey” instead of naming the design.', 'Saying one thing causes another from a cross-sectional study. It can only show a link.', 'Choosing a trial without the time, money or approval for it.', 'Unclear rules about who can take part.'],
    include: ['The name of your design', 'Why it suits your topic (2–3 sentences)', 'Setting and duration', 'Who is included', 'Who is excluded'],
    template: 'Study design:\nWhy this design:\n\nSetting (where):\nDuration (when):\n\nIncluded:\n- \n\nExcluded:\n- '
  });
  add('original:4', {
    intro: 'A synopsis is your study plan on paper. Before you collect any answers, your college ethics committee (called the ERC or IRB) must read it and approve it. This protects the people in your study, and journals won’t publish a study without this approval.',
    visuals: [
      { type: 'table', title: 'What goes in a synopsis', head: ['Section', 'What to write', 'Length'], rows: [
        ['Title', 'What, who, where and the type of study', '1 line'],
        ['Introduction', 'What is known, in the world and here', '300–500 words'],
        ['Rationale', 'What is missing, and how your study helps', '3–4 lines'],
        ['Objectives (aims)', 'What exactly you will find out', '1–3 points'],
        ['Operational definitions', 'How you decide “yes” or “no” for each thing you count', '1–2 lines each'],
        ['Methodology', 'Design, place, time, number of people, who is in and out, how you collect and analyse', '1–2 pages'],
        ['References', 'The papers you used, in Vancouver style', '10–20']] },
      { type: 'table', title: 'Normal words vs operational definitions', head: ['Normal word', 'Operational definition (how you will measure it)'], rows: [
        ['Skipping breakfast', 'Eating nothing before 10 am on 4 or more of the last 7 days'],
        ['Short sleep', 'Sleeping less than 6 hours a night, on average, in the last week'],
        ['Obesity', 'BMI of 30 or more, measured by the researcher']] },
      { type: 'flow', title: 'Getting permission (ethics approval)', steps: [
        ['Write the synopsis', 'Use your college’s format.'], ['Your supervisor signs it', 'They check it first.'], ['Send it to the ERC or IRB', 'With your questionnaire and consent form.'],
        ['Get the approval letter', 'Keep its reference number safe.'], ['Start collecting answers', 'Only now, never before.']] }],
    mistakes: ['Collecting answers before approval.', 'No consent form.', 'Aims that don’t match the title.', 'Definitions that can’t be measured, like “students who eat badly”.'],
    include: ['Rationale (3–4 sentences)', 'Your aim or aims', 'An operational definition of the main thing you will count'],
    template: 'Rationale:\n\nAim(s):\n1.\n\nOperational definition of what I will count:'
  });
  add('original:5', {
    intro: 'Sample size is how many people you need so your answer can be trusted. Ask too few and your result could just be luck; ask too many and you waste time. You don’t guess it: you work it out from a similar earlier study, with a free calculator like OpenEpi. The formula below is what the calculator does for you.',
    visuals: [
      { type: 'flow', title: 'Using OpenEpi (the easy way)', steps: [
        ['Find a starting percentage', 'From a similar study, e.g. “40% of students skipped breakfast”.'],
        ['Open openepi.com', 'Click Sample Size, then Proportion.'],
        ['Type your numbers', 'Expected percentage: 40. Leave confidence at 95% and margin of error at 5%.'],
        ['Read the answer', 'Look at the number next to 95%.'],
        ['Add 10%', 'For people who won’t reply.']] },
      { type: 'formula', title: 'The formula behind it (for counting how common something is)', expr: 'n = Z² × p × (1 − p) ÷ d²', legend: [
        ['n', 'The number of people you need'], ['Z', 'Always 1.96 (it means 95% confidence)'], ['p', 'The percentage from the earlier study, as a decimal (40% = 0.40)'], ['d', 'How close you want to be, usually 0.05 (5%)']],
        worked: '1.96 × 1.96 × 0.40 × 0.60 ÷ (0.05 × 0.05) = 369 people. Add 10% for people who won’t reply: about 406.' },
      { type: 'table', title: 'Ways to pick people', head: ['Method', 'In simple words', 'When to use'], rows: [
        ['Simple random', 'Pick names from a full list by chance, like a lottery', 'You have a full list (e.g. the class list)'],
        ['Stratified random', 'Split into groups (e.g. by year), then pick by chance from each', 'Groups are quite different'],
        ['Systematic', 'Pick every 3rd or 5th person on the list', 'You have a list or a queue'],
        ['Consecutive', 'Everyone who comes during the study time', 'Hospital or OPD studies (very common)'],
        ['Convenience', 'Whoever is easiest to reach', 'Only if nothing else works; the weakest']] }],
    mistakes: ['Choosing a round number like 100 with no calculation.', 'Using a starting percentage from a very different group without saying so.', 'Forgetting to add extra for people who won’t reply.'],
    include: ['The starting percentage and where it came from (reference)', 'The number you got', 'The number after adding 10%', 'How you will pick people, and why'],
    template: 'Starting percentage (p): ___% from reference: ___\nConfidence: 95%   Margin of error: 5%\nNumber needed: ___\nAfter adding 10%: ___\n\nHow I will pick people:\nWhy:'
  });
  add('original:6', {
    intro: 'A proforma is the form or questionnaire each person fills in your study. A good one is short, clear and asks about facts people can remember. Afterwards you type all the answers into a spreadsheet so you can count them. The picture below shows what that sheet looks like.',
    visuals: [
      { type: 'flow', title: 'The parts of a simple proforma', steps: [
        ['Consent', 'A short line: the study’s purpose, that it is voluntary and anonymous, and a tick box to agree.'],
        ['Basic details', 'Age, gender, year of study. No names.'],
        ['Your main questions', 'E.g. “In the last 7 days, on how many days did you eat something before 10 am?”'],
        ['Other questions linked to your aims', 'E.g. hostel or home, usual waking time.']] },
      { type: 'sheet', title: 'Typing the answers into a spreadsheet', cols: ['ID', 'Age', 'Sex', 'Year', 'Ate', 'Skips'], rows: [
        ['1', '20', '2', '2', '1', '1'], ['2', '22', '1', '4', '6', '0'], ['3', '19', '2', '1', '3', '1'], ['4', '21', '1', '3', '7', '0']],
        note: 'One row for each person, one column for each question. Numbers instead of words: Sex 1 = male, 2 = female; Ate = days they ate breakfast in the last 7; Skips 1 = yes (3 or fewer days), 0 = no. Write these meanings in a codebook.' },
      { type: 'flow', title: 'From draft to data', steps: [
        ['Draft it', 'Basic details first, then your main questions.'], ['Check each question', 'Does it help answer your topic? If not, remove it.'], ['Pilot test', 'Try it on 5–10 people.'],
        ['Fix and finalise', 'Reword anything confusing.'], ['Collect and type in', 'One row per person, using your codebook.']] }],
    mistakes: ['Vague questions like “Do you eat healthy?”', 'A long form people won’t finish.', 'Typing the same answer in different ways (Male, M, male).', 'Writing names on the form.'],
    include: ['The sections and questions in your proforma', 'Any ready-made questionnaire, with its reference', 'How you will collect the answers (3–4 sentences)'],
    template: 'Proforma sections:\n1. Consent:\n2. Basic details:\n3. Main questions:\n4. Other questions:\n\nReady-made questionnaire and reference (if any):\n\nHow I will collect the answers:'
  });
  add('original:7', {
    intro: 'Statistics turns your spreadsheet into answers. First you describe: how many, what percentage, what average. Then, if you compare groups, a test tells you if the difference is real or just luck. You don’t need to be good at maths: the software does the calculating. You only need to pick the right test, and the chart below helps.',
    visuals: [
      { type: 'table', title: 'How to show each kind of answer', head: ['Kind of answer', 'Example', 'Show it as'], rows: [
        ['Groups (categories)', 'Gender, year, skips breakfast yes/no', 'Number and percentage: 164 (41%)'], ['Numbers', 'Age, hours of sleep', 'Average and spread: mean ± SD'], ['Numbers with a few very high or low values', 'Days in hospital', 'Middle value: median (IQR)']] },
      { type: 'choose', title: 'Which test should I use?', items: [
        ['Comparing two group answers (e.g. year of study and skipping breakfast)', 'Chi-square test'],
        ['Comparing a number between 2 groups (e.g. age of those who skip vs those who don’t)', 't-test', 'Mann-Whitney U if the numbers are uneven'],
        ['Comparing a number between 3 or more groups', 'ANOVA', 'Kruskal-Wallis if uneven'],
        ['Seeing if two numbers move together (e.g. sleep hours and breakfast days)', 'Correlation'],
        ['The same people, before and after', 'Paired t-test']] },
      { type: 'table', title: 'Reading a result: an example', head: ['Year of study', 'Skip breakfast', 'Don’t skip', 'p-value'], rows: [
        ['1st year', '30 of 80 (38%)', '50 of 80 (62%)', ''], ['5th year', '48 of 80 (60%)', '32 of 80 (40%)', 'p = 0.004']] }],
    mistakes: ['Using a t-test for groups like yes/no.', 'Giving only the p-value without the actual numbers.', 'Saying “significant” when p is more than 0.05.'],
    include: ['The software you will use', 'How each main answer will be shown', 'Which test answers each comparison', 'That p < 0.05 counts as significant'],
    template: 'Software:\n\nHow I will show my answers:\n- \n\nTests:\n- Comparison 1 → \n\nSignificant if: p < 0.05'
  });
  add('original:8', {
    intro: 'Almost every research paper has the same four parts, called IMRaD: Introduction, Methods, Results and Discussion. Each part answers one simple question: Why did you do it? How? What did you find? What does it mean? The shape is like an hourglass: wide at the start, narrow in the middle, wide again at the end.',
    visuals: [
      { type: 'funnel', title: 'The hourglass shape of a paper', levels: [
        ['Introduction', 'Why? From the big problem down to your aim', 100],
        ['Methods', 'How? Exactly what you did', 62],
        ['Results', 'What did you find? Numbers only', 62],
        ['Discussion', 'What does it mean? From your finding back out to the big picture', 100]] },
      { type: 'table', title: 'The four parts', head: ['Part', 'Answers', 'Write it in', 'Tip'], rows: [
        ['Introduction', 'Why?', 'Present tense for known facts', 'End with your aim'], ['Methods', 'How?', 'Past tense', 'Enough detail for someone to repeat it'],
        ['Results', 'What did you find?', 'Past tense', 'Numbers and tables only, no opinions'], ['Discussion', 'What does it mean?', 'Present and past', 'Compare, admit weak points, conclude']] }],
    mistakes: ['Explaining results inside the Results section.', 'Repeating every number from a table in the text.', 'No paragraph on the weak points (limitations) of your study.'],
    include: ['Your main finding in the first sentence', 'A comparison with at least two published studies', 'A possible reason for any difference'],
    template: 'My main finding:\n\nCompared with other studies:\n\nPossible reason for the difference:'
  });
  add('original:9', {
    intro: 'Referencing means giving credit to every paper you used. Most medical journals use Vancouver style: sources get numbers in the order you first mention them, and the full list goes at the end. A free app called Zotero writes the list for you, so you never have to type references by hand.',
    visuals: [
      { type: 'table', title: 'The parts of a Vancouver reference', head: ['Part', 'Example'], rows: [
        ['Authors (surname, then initials)', 'Watson JD, Crick FH.'], ['Title of the paper', 'Molecular structure of nucleic acids; a structure for deoxyribose nucleic acid.'],
        ['Journal (short name)', 'Nature.'], ['Year;Volume(Issue):Pages', '1953;171(4356):737-8.']] },
      { type: 'flow', title: 'Set up Zotero once', steps: [
        ['Install Zotero', 'From zotero.org, plus its browser button.'], ['Save papers', 'On any PubMed page, click the Zotero button.'], ['Open Word', 'Zotero adds its own tab to Word.'],
        ['Add a citation', 'Click Add/Edit Citation and choose the Vancouver style.'], ['Add the list', 'Click Add Bibliography. It updates itself.']] }],
    mistakes: ['Copying references with mistakes from Google Scholar.', 'Mixing two styles in one paper.', 'Citing papers you haven’t read.', 'Copying sentences instead of using your own words.'],
    include: ['5 references in Vancouver style', 'One sentence with the correct citation numbers'],
    template: 'References:\n1.\n2.\n3.\n4.\n5.\n\nExample sentence with citation numbers:'
  });
  add('original:10', {
    intro: 'Submitting means choosing the right journal and following its rules exactly. Editors reject many papers within days just because they don’t fit the journal or ignore its format. After you submit, experts called reviewers read your paper and send comments. Getting comments is normal: it is part of getting published.',
    visuals: [
      { type: 'flow', title: 'From sending to published', steps: [
        ['Choose a journal', 'Right topic, listed in PubMed, Scopus or HEC, fees you can pay.'], ['Read the author guidelines', 'Word limits, headings, references.'], ['Format it and write a cover letter', 'Short and clear.'],
        ['Submit online', 'Upload your files and statements.'], ['Peer review', 'Experts read it. Usually weeks to months.'], ['Revise and reply', 'Answer every comment politely.'], ['Accepted', 'Your paper is published.']] },
      { type: 'table', title: 'Check before you choose', head: ['Check', 'Why it matters'], rows: [
        ['Topic (scope)', 'Does it publish your kind of study?'], ['Listed in PubMed, Scopus or HEC', 'Counts for your CV and applications'],
        ['Fees', 'Some journals charge to publish'], ['Review time', 'How long you will wait'],
        ['Warning signs', 'Spam emails, “guaranteed acceptance” or publishing in a few days mean a fake (predatory) journal']] }],
    mistakes: ['Sending the same paper to two journals at once (not allowed).', 'Ignoring word limits.', 'Arguing rudely with reviewers.'],
    include: ['Two journals and why they fit', 'A cover letter of 150–200 words'],
    template: 'Journal 1 and why:\nJournal 2 and why:\n\nCover letter:\nDear Editor,\n'
  });

  /* ===== Case report ===== */
  add('case:1', {
    intro: 'A case report tells the story of one patient whose illness teaches doctors something new. It is often the easiest first paper for a medical student: you don’t need hundreds of people, just one interesting patient with good records.',
    visuals: [{ type: 'choose', title: 'Is my case worth writing about?', items: [
      ['A rare disease', 'Yes'], ['A common disease that looked unusual', 'Yes'], ['A new or unexpected side effect of a medicine', 'Yes'],
      ['A new way of diagnosing or treating', 'Yes'], ['A typical case of a common disease', 'Usually no', 'Nothing new for doctors to learn']] },
      { type: 'flow', title: 'Checking it is new, on PubMed', steps: [
        ['Search', 'Type the disease plus "case report", e.g. typhoid AND cholecystitis AND "case report".'], ['Count', 'How many similar cases come up?'], ['Compare', 'Is anything about yours different: age, symptoms, treatment?'], ['Decide', 'Few similar reports, or something different about yours: a good case.']] }],
    mistakes: ['Choosing a textbook case with nothing new.', 'Not checking PubMed for similar reports.', 'Missing notes or test results.'],
    include: ['The case in 3–4 sentences', 'Its one lesson', 'How many similar cases you found on PubMed'],
    template: 'My case in brief:\n\nThe one lesson:\n\nSimilar cases on PubMed:'
  });
  add('case:2', {
    intro: 'The patient must agree in writing to their story being published, and nobody reading it should be able to tell who they are. Every journal asks about this.',
    visuals: [{ type: 'table', title: 'Remove or change these', head: ['Detail', 'Instead write'], rows: [
      ['Name or initials', '“A 19-year-old man”'], ['Hospital or MR number', 'Leave it out'], ['Exact dates', '“Day 1, Day 5”, or “in 2025”'], ['Face or tattoo in a picture', 'Crop it or cover it'], ['Village or street', '“from a rural area of Punjab”']] }],
    mistakes: ['Using the patient’s initials or hospital number.', 'Showing faces or tattoos in pictures.', 'Only asking permission out loud, not in writing.'],
    include: ['Your consent statement', 'A list of details you will remove'],
    template: 'Consent statement:\n\nDetails I will remove:\n- '
  });
  add('case:3', {
    intro: 'This is the heart of your report: what happened to the patient, in order. Write it like a clear story from the ward, following the CARE checklist that journals use (a list of what every case report should include).',
    visuals: [{ type: 'table', title: 'Example timeline table', head: ['Day', 'What happened', 'What was found', 'What was done'], rows: [
      ['Day 0', 'Came to emergency', 'Fever 10 days, pain under right ribs', 'Admitted, blood tests sent'], ['Day 1', 'Ultrasound', 'Thick-walled gallbladder, no stones', 'Surgeons asked to see him'],
      ['Day 2', 'Blood culture result', 'Salmonella Typhi', 'IV ceftriaxone started'], ['Day 5', 'Ward review', 'Pain settled', 'Antibiotics continued'], ['Week 4', 'Follow-up', 'Normal ultrasound', 'Discharged from clinic']] }],
    mistakes: ['Adding history that has nothing to do with the case.', 'Events out of order.', 'Leaving out important normal findings.'],
    include: ['Patient information', 'What you found on examination', 'A timeline table with at least 5 events'],
    template: 'Patient information:\n\nWhat we found:\n\nTimeline:\nDay | What happened | What was found | What was done\n'
  });
  add('case:4', {
    intro: 'Explain how you worked out the diagnosis, what treatment you gave, and how the patient did afterwards. Include the other diseases you thought of along the way. Readers learn most from how you thought.',
    visuals: [{ type: 'flow', title: 'How the diagnosis was reached', steps: [
      ['Symptoms and signs', 'Fever, pain under the right ribs, positive Murphy’s sign.'], ['What it could be', 'Gallstones, hepatitis, typhoid, liver abscess.'], ['Tests', 'Ultrasound, blood culture, hepatitis tests.'], ['What was ruled out', 'No stones; hepatitis tests negative.'], ['Final diagnosis', 'Typhoid fever causing gallbladder inflammation.']] }],
    mistakes: ['No list of other possible diseases (differential diagnosis).', 'Medicines without doses or how long they were given.', 'No follow-up information.'],
    include: ['Tests and the other diseases you considered', 'Treatment with doses and duration', 'Follow-up and outcome'],
    template: 'How we reached the diagnosis (and what else we considered):\n\nTreatment:\n\nFollow-up and outcome:'
  });
  add('case:5', {
    intro: 'The introduction tells readers why the case matters. The discussion connects your case to what other doctors have reported, and ends with clear lessons.',
    visuals: [{ type: 'flow', title: 'What goes in the discussion', steps: [
      ['What is known', 'How often this happens, with references.'], ['Other reported cases', 'How yours is similar or different.'], ['Why it happened', 'The likely explanation.'], ['Limits', 'What your report can’t show.'], ['Lessons', '2–3 short take-home points.']] }],
    mistakes: ['A long introduction that repeats textbook facts.', 'Saying “very rare” without a reference.', 'No lessons at the end.'],
    include: ['Introduction (about 100 words)', 'Discussion with at least 3 references', '2–3 learning points'],
    template: 'Introduction:\n\nDiscussion:\n\nLearning points:\n1.\n2.'
  });
  add('case:6', {
    intro: 'The title and abstract are what editors and readers see first, so make them clear and specific. Then pick a journal that publishes case reports and follow its rules exactly.',
    visuals: [{ type: 'table', title: 'A case report abstract', head: ['Part', 'What to write'], rows: [
      ['Introduction', 'Why this case matters (1–2 sentences)'], ['Case presentation', 'The patient, key findings, diagnosis, treatment, outcome'], ['Conclusion', 'The main lesson'], ['Keywords', '3–5 words people would search for']] }],
    mistakes: ['A vague title without the words “case report”.', 'An abstract over the word limit.', 'Submitting without checking the fees.'],
    include: ['Title', 'Abstract', 'Keywords', 'Target journal'],
    template: 'Title:\n\nAbstract\nIntroduction:\nCase presentation:\nConclusion:\n\nKeywords:\n\nTarget journal:'
  });

  /* ===== Letter to the editor ===== */
  add('letter:1', {
    intro: 'A letter to the editor is a short reply to an article a journal published recently. You add one useful point: a weak spot in the study, another way to explain the result, or local data. Letters are short, quick to write and a great first publication.',
    visuals: [{ type: 'flow', title: 'Finding an article to reply to', steps: [
      ['Pick a journal you read', 'Ideally one that publishes letters.'], ['Look at recent issues', 'Articles from the last 2–3 months.'], ['Read one carefully', 'Especially the methods and limitations.'], ['Note one or two points', 'Something missing, unclear or different in your setting.'], ['Check the letter rules', 'Words, references, authors.']] }],
    mistakes: ['Choosing an article that is years old.', 'Only praising the article.', 'Not reading the journal’s rules for letters.'],
    include: ['The full reference of the article', 'The journal’s limits for letters', 'The 1–2 points you will make'],
    template: 'Article reference:\n\nJournal limits (words, references, authors):\n\nMy points:\n1.\n2.'
  });
  add('letter:2', {
    intro: 'Your argument is the heart of the letter. Make each point clearly, support it with evidence and stay polite. Editors publish letters that add something helpful, not attacks.',
    visuals: [{ type: 'table', title: 'Rude vs helpful', head: ['Instead of', 'Write'], rows: [
      ['“The authors made a big mistake.”', '“One point may limit these findings…”'], ['“This study is useless.”', '“It would help readers to know…”'], ['“Everyone knows that…”', '“Earlier studies have shown… (2)”']] }],
    mistakes: ['Several points squeezed into one paragraph.', 'Claims without references.', 'A rude tone.'],
    include: ['One paragraph for each point', 'At least one reference for each point'],
    template: 'Point 1:\n\nPoint 2:'
  });
  add('letter:3', {
    intro: 'Now put it all together into one short, complete letter that fits the journal’s limits.',
    visuals: [{ type: 'flow', title: 'The shape of a letter', steps: [
      ['Dear Editor,', 'The usual opening.'], ['Opening line', '“We read with interest the article by… (1)”'], ['Your points', 'One short paragraph each.'], ['Closing sentence', 'A helpful suggestion.'], ['References', '5–10, in Vancouver style.']] }],
    mistakes: ['Going over the word limit.', 'Forgetting to make the original article reference 1.'],
    include: ['The complete letter', 'References'],
    template: 'Dear Editor,\n\nWe read with interest the article by ___ (1) ...\n\n\nReferences\n1.'
  });
  add('letter:4', {
    intro: 'Before sending, add the details every journal asks for. Missing statements are one of the most common reasons for delays.',
    mistakes: ['No conflict of interest statement.', 'Choosing the wrong article type on the website.'],
    include: ['Title and author line', 'Conflict of interest statement', 'Funding statement', 'The journal you are sending it to'],
    template: 'Title:\nAuthors and where they work or study:\n\n[Letter]\n\nConflicts of interest: None declared.\nFunding: None.\n\nJournal:'
  });

  /* ===== Synopsis ===== */
  add('synopsis:1', {
    intro: 'A synopsis is the plan of your study, which your ethics committee or CPSP must approve before you start. It begins with three things: a clear title, one clear research topic, and objectives that say exactly what you will find out. Get these right and the rest becomes much easier.',
    visuals: [
      { type: 'table', title: 'Building a title, piece by piece', head: ['Part', 'Example'], rows: [
        ['What you measure', 'Frequency of diabetic foot neuropathy'], ['In whom', 'among type 2 diabetics'], ['Where', 'presenting to the medical OPD of Mayo Hospital, Lahore'], ['Type of study', ': a cross-sectional study']] },
      { type: 'letters', title: 'SMART objectives', items: [
        ['S', 'Specific', 'Exactly what, in whom?', 'Foot neuropathy in type 2 diabetics'], ['M', 'Measurable', 'Can you count it?', 'Using a 10 g monofilament test'],
        ['A', 'Achievable', 'Can you do it with what you have?', 'In the OPD you already work in'], ['R', 'Relevant', 'Does it matter here?', 'Helps plan foot checks'], ['T', 'Time-bound', 'By when?', 'Within 6 months of approval']] }],
    mistakes: ['A title without the place or the type of study.', 'Objectives that don’t match the title.', 'Too many objectives.'],
    include: ['Title', 'Research topic', 'Objective or objectives'],
    template: 'Title:\n\nResearch topic:\n\nObjective(s):\n1.'
  });
  add('synopsis:2', {
    intro: 'The introduction explains the problem and why your study is needed. Start with the big picture and narrow down to your own hospital or college, using up-to-date numbers.',
    visuals: [{ type: 'funnel', title: 'From the world to your hospital', levels: [
      ['The world', 'How big is the problem worldwide?'], ['Pakistan', 'Local numbers'], ['Your hospital or college', 'What we don’t know here yet'], ['Rationale', 'How your results will be used']] }],
    mistakes: ['Old numbers.', 'No local data.', 'A rationale that only says “this is important”.'],
    include: ['Introduction with references', 'Rationale (3–4 sentences)'],
    template: 'Introduction:\n\nRationale:'
  });
  add('synopsis:3', {
    intro: 'Operational definitions say exactly how you will measure each thing, so anyone repeating your study measures it the same way.',
    visuals: [{ type: 'table', title: 'Dictionary meaning vs operational definition', head: ['Dictionary meaning', 'Operational definition'], rows: [
      ['Neuropathy: damage to nerves', 'Can’t feel a 10 g monofilament at 1 or more of 10 points on either foot'], ['Poor sugar control', 'HbA1c above 8% in the last 3 months'], ['Obesity: too much body fat', 'BMI of 30 or more, measured by the researcher']] }],
    mistakes: ['Dictionary meanings instead of measurable ones.', 'No cut-off values.', 'A hypothesis for a study that only counts.'],
    include: ['A definition for each thing you will measure', 'A hypothesis, only if your study compares groups'],
    template: 'Operational definitions:\n- \n\nHypothesis (only if comparing groups):\nH0 (no difference):\nH1 (a difference):'
  });
  add('synopsis:4', {
    intro: 'Methodology is the recipe of your study: what type of study, where, for how long, how many people and who can take part.',
    visuals: [{ type: 'flow', title: 'Methodology checklist', steps: [['Type of study', 'Name it.'], ['Setting', 'The exact place.'], ['Duration', 'Counted from approval.'], ['Sample size', 'With the calculation and its reference.'], ['How you pick people', 'Named, with a reason.'], ['Who is in and who is out', 'Clear, checkable rules.']] }],
    mistakes: ['A sample size with no calculation.', 'A duration that starts before approval.'],
    include: ['Design, setting, duration', 'Sample size calculation', 'How you will pick people', 'Inclusion and exclusion criteria'],
    template: 'Type of study:\nSetting:\nDuration:\nSample size:\nHow I will pick people:\nIncluded:\nExcluded:'
  });
  add('synopsis:5', {
    intro: 'Describe, step by step, how you will collect the data and exactly how you will analyse it. Reviewers check this part carefully.',
    visuals: [{ type: 'flow', title: 'Data collection, step by step', steps: [['Approval', 'From the ethics committee.'], ['Consent', 'Each person agrees in writing.'], ['Examine or ask', 'Using the proforma.'], ['Record', 'On the form, then in the spreadsheet.'], ['Store safely', 'No names; password-protected file.']] }],
    mistakes: ['No mention of consent.', 'A one-line analysis plan.', 'Not splitting results by things that could change them, like age or gender.'],
    include: ['Data collection steps', 'Data analysis plan'],
    template: 'Data collection steps:\n\nData analysis plan:'
  });
  add('synopsis:6', {
    intro: 'Finish with your references, a realistic timeline and the forms you must attach, then submit it in your institution’s format.',
    visuals: [{ type: 'table', title: 'A simple timeline', head: ['Month', 'Work'], rows: [['1', 'Approval and pilot test'], ['2–5', 'Data collection'], ['6', 'Analysis and write-up']] }],
    mistakes: ['Old or missing references.', 'An unrealistic timeline.', 'Forgetting to attach the consent form.'],
    include: ['Timeline', 'Reference list', 'List of annexes'],
    template: 'Timeline:\nMonth 1:\n\nReferences:\n1.\n\nAnnexes:\n- Proforma\n- Consent form'
  });

  /* ===== Thesis ===== */
  add('thesis:1', {
    intro: 'A thesis is a long document, so plan it before you write. An outline with headings and word targets turns one big task into many small, easy ones.',
    visuals: [{ type: 'table', title: 'The usual thesis chapters', head: ['Chapter', 'Contains', 'Rough length'], rows: [
      ['1. Introduction', 'Background, the problem, why it matters, objectives, definitions', '2,000 words'], ['2. Literature review', 'What is known, grouped by theme', '4,000–6,000 words'],
      ['3. Methodology', 'What you did and how', '2,000 words'], ['4. Results', 'Tables, charts and key numbers', '2,000 words'], ['5. Discussion & conclusion', 'What it means, comparison, weak points, recommendations', '3,000 words']] }],
    mistakes: ['Starting without checking the university’s format.', 'Writing chapters in random order.'],
    include: ['Chapter outline with headings', 'Word targets', 'Your university’s format rules'],
    template: 'Chapter 1:\n- \nChapter 2:\n- \n\nFormat rules:'
  });
  add('thesis:2', {
    intro: 'Your introduction chapter grows out of your synopsis: explain the problem, why solving it matters, and exactly what you set out to do.',
    mistakes: ['Copying the synopsis word for word.', 'Changing the objectives from the approved synopsis.'],
    include: ['The problem', 'Why it matters'],
    template: 'The problem:\n\nWhy it matters:'
  });
  add('thesis:3', {
    intro: 'The literature review shows what is already known. Group the studies by theme and compare them, instead of summarising one paper after another. A literature matrix (a table of all your papers, like the one below) makes this much easier.',
    visuals: [{ type: 'sheet', title: 'A literature matrix: fill it before you write', cols: ['Author, year', 'Place', 'People', 'Main finding', 'Weak point'], rows: [['Ali 2021', 'Lahore', '300', '32% had it', 'One hospital'], ['Khan 2019', 'Karachi', '520', '48% had it', 'Self-reported']], note: 'One row per paper. Reading down a column shows you the themes: where studies agree and where they differ.' }],
    mistakes: ['One paragraph per paper.', 'No comparison between studies.', 'Not ending with the gap.'],
    include: ['One themed section of at least 300 words', 'At least 5 references'],
    template: 'Theme:\n\n'
  });
  add('thesis:4', {
    intro: 'The methodology chapter records what you actually did, in the past tense, including anything that changed from your plan.',
    mistakes: ['Writing in the future tense.', 'Hiding changes from the synopsis.', 'No ethics approval number.'],
    include: ['Methodology in the past tense', 'Anything that changed, and why', 'Ethics approval reference'],
    template: 'Methodology:\n\nWhat changed from the synopsis:\n\nEthics approval reference:'
  });
  add('thesis:5', {
    intro: 'Results show what you found, clearly and without opinions. Tables and charts hold the detail; the text points out what matters most.',
    visuals: [{ type: 'table', title: 'Example: a basic-details table (Table 1)', head: ['Characteristic', 'n = 196'], rows: [['Age, mean ± SD', '52.4 ± 9.1 years'], ['Women', '104 (53.1%)'], ['Diabetes for more than 10 years', '81 (41.3%)'], ['HbA1c above 8%', '106 (54.1%)']] }],
    mistakes: ['Opinions in the results.', 'Percentages without the total.', 'Table titles below tables.'],
    include: ['A description of your basic-details table', 'Results for your first objective'],
    template: 'Basic details of the people in the study:\n\nObjective 1 results:'
  });
  add('thesis:6', {
    intro: 'The discussion explains what your results mean, the conclusion answers your objectives, and the final checks make sure your thesis is accepted without delays.',
    visuals: [{ type: 'flow', title: 'Final checks before you submit', steps: [['Plagiarism report', 'Within your university’s limit (HEC generally 19%).'], ['Format', 'Margins, font, spacing, page numbers.'], ['Abstract and acknowledgements', 'Written and checked.'], ['Supervisor sign-off', 'Every chapter.'], ['Binding and copies', 'As your university asks.']] }],
    mistakes: ['A conclusion that doesn’t answer the objectives.', 'No weak points (limitations).', 'Skipping the plagiarism check.'],
    include: ['Conclusion', 'Recommendations', 'One limitations paragraph'],
    template: 'Conclusion:\n\nRecommendations:\n\nLimitations:'
  });

  /* ===== Meta-analysis ===== */
  add('meta:1', {
    intro: 'A systematic review collects every good study on one topic. A meta-analysis then combines their numbers into one stronger answer. It is at the top of the evidence pyramid, and you can do it without seeing any patients: all you need is a computer and published papers.',
    visuals: [
      { type: 'letters', title: 'PICO for a review', items: [
        ['P', 'Population', 'Who were the people in the studies?', 'Pregnant women'], ['I', 'Intervention', 'What treatment did they get?', 'Vitamin D tablets'],
        ['C', 'Comparison', 'Compared with what?', 'A dummy tablet (placebo) or nothing'], ['O', 'Outcome', 'What result are you looking for?', 'Pre-eclampsia']] },
      { type: 'pyramid', title: 'Where a meta-analysis sits', levels: ['Systematic reviews & meta-analyses', 'Randomised controlled trials', 'Cohort studies', 'Case-control studies', 'Cross-sectional studies', 'Case reports'] }],
    mistakes: ['A topic that is too broad.', 'Deciding the rules after seeing the results.', 'Not registering on PROSPERO.'],
    include: ['PICO topic', 'Rules for including and excluding studies', 'Main and extra outcomes'],
    template: 'P:\nI:\nC:\nO:\nTypes of study included:\n\nIncluded if:\nExcluded if:\n\nMain outcome:\nExtra outcomes:'
  });
  add('meta:2', {
    intro: 'Your search must find every relevant study, so search several databases and write down exactly what you did. Someone else should be able to repeat it and find the same papers.',
    visuals: [{ type: 'venn', title: 'Joining the three ideas with AND', items: [
      { op: 'OR', a: 'vitamin D', b: 'cholecalciferol', note: 'Same thing, different words: more papers.' },
      { op: 'AND', a: 'vitamin D', b: 'pregnancy', note: 'Only papers about both.' },
      { op: 'AND', a: 'pregnancy', b: 'pre-eclampsia', note: 'Add the outcome with another AND.' }] }],
    mistakes: ['Searching only PubMed.', 'Limiting to English without a reason.', 'Not recording the search date.'],
    include: ['Full PubMed search', 'Other databases', 'Number of results from each'],
    template: 'PubMed search:\n\nOther databases:\n\nResults: PubMed ___, ___ ___, ___ ___\nSearch date:'
  });
  add('meta:3', {
    intro: 'Screening means deciding which studies to include. Two people do it separately, so personal opinions don’t decide: first by reading titles and abstracts, then by reading the full papers.',
    visuals: [{ type: 'funnel', title: 'The PRISMA flow: from many papers to a few', levels: [
      ['Found', '1,248 papers from all databases'], ['Duplicates removed', '936 left'], ['Titles and abstracts read', '41 look relevant'], ['Full papers read', '29 left out, with reasons'], ['Included', '12 trials']] }],
    mistakes: ['Screening alone.', 'Not writing down why papers were left out.'],
    include: ['Numbers at each stage', 'Main reasons for leaving full papers out'],
    template: 'Papers found:\nDuplicates removed:\nScreened:\nFull papers read:\nIncluded:\n\nReasons for leaving out:'
  });
  add('meta:4', {
    intro: 'Data extraction means copying the key details and numbers from each included study into one sheet, carefully and in the same way every time.',
    visuals: [{ type: 'sheet', title: 'An extraction sheet', cols: ['Study', 'Country', 'People (I/C)', 'Dose', 'Cases I', 'Cases C'], rows: [['Ali 2021', 'Pakistan', '120/118', '4,000 IU daily', '6', '14'], ['Study 2', '…', '…', '…', '…', '…']], note: 'Example data. One row per study; the “cases” columns are what you combine in the next steps.' }],
    mistakes: ['Copying from abstracts only.', 'Not testing the sheet first.', 'One person doing it alone.'],
    include: ['The columns of your sheet', 'The data from 2 studies'],
    template: 'Columns:\n\nStudy 1:\nStudy 2:'
  });
  add('meta:5', {
    intro: 'Not every study can be trusted equally. Risk of bias tools help you judge each study fairly, one part at a time: how people were chosen, whether they knew their group, and whether anyone dropped out.',
    visuals: [{ type: 'table', title: 'Which tool?', head: ['Type of study', 'Tool'], rows: [['Randomised trials', 'RoB 2'], ['Non-randomised treatment studies', 'ROBINS-I'], ['Cohort and case-control', 'Newcastle–Ottawa Scale'], ['How sure you are overall', 'GRADE']] }],
    mistakes: ['One overall score without reasons.', 'The wrong tool for the type of study.'],
    include: ['The tool you will use', 'Judgements for 2 studies, with reasons'],
    template: 'Tool:\n\nStudy 1:\nStudy 2:'
  });
  add('meta:6', {
    intro: 'Combining (pooling) the studies gives one overall answer, shown in a picture called a forest plot. Each line is one study; the diamond at the bottom is the combined answer. If the diamond is on the left of the middle line, the treatment helped.',
    visuals: [
      { type: 'forest', title: 'How to read a forest plot', measure: 'Risk ratio', min: 0.2, max: 5, rows: [
        ['Study A', 0.43, 0.17, 1.08, 2], ['Study B', 0.70, 0.40, 1.22, 3], ['Study C', 0.55, 0.30, 1.01, 3], ['Study D', 0.80, 0.45, 1.42, 2], ['Study E', 0.58, 0.33, 1.02, 3]],
        pooled: [0.62, 0.45, 0.85], pooledLabel: 'All studies', left: '← Vitamin D better', right: 'No vitamin D better →',
        note: 'Example data. Square = one study’s result (bigger square = more people). Line = its range (95% CI). Middle dashed line = no difference. Diamond = all studies combined: here it doesn’t touch the middle line, so the effect is significant.' },
      { type: 'table', title: 'Reading I² (how much studies disagree)', head: ['I²', 'Meaning'], rows: [['About 25%', 'Low: the studies mostly agree'], ['About 50%', 'Moderate'], ['About 75% or more', 'High: look for the reason why']] }],
    mistakes: ['Using a fixed-effect model when the studies differ a lot.', 'Ignoring a high I².', 'A funnel plot with fewer than 10 studies.'],
    include: ['The measure', 'The model', 'The combined result or your plan', 'I² and what the forest plot shows'],
    template: 'Measure:\nModel:\nCombined result:\nI²:\nWhat it means:'
  });
  add('meta:7', {
    intro: 'Report your review using PRISMA 2020, a checklist that helps editors and readers trust and repeat your work. Start with a clear abstract: it is the part most people read.',
    mistakes: ['Skipping checklist items.', 'An abstract without numbers.', 'Claiming more than weak evidence can show.'],
    include: ['An abstract of about 250 words following PRISMA for Abstracts'],
    template: 'Background:\nObjectives:\nMethods:\nResults:\nConclusions:'
  });

  window.CURRICULUM.tracks.forEach(function (t) {
    t.steps.forEach(function (s) { var e = X[t.id + ':' + s.n]; if (e) Object.assign(s, e); });
  });
})();
