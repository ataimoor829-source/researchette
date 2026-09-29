/* Researchette programmes. Each programme (track) has phases and numbered steps.
   Every step has a short lesson, a weak/strong example and a task the member submits for mentor review.
   The original-article roadmap is the core programme; the others follow the same shape. */
var ORIGINAL = {
  phases: [
    { id: 1, name: 'Plan', blurb: 'Shape a clear question and get approval to start.' },
    { id: 2, name: 'Collect & analyse', blurb: 'Gather clean data and make sense of it.' },
    { id: 3, name: 'Write & publish', blurb: 'Turn your results into a paper journals accept.' }
  ],
  steps: [
    {
      n: 1, phase: 1, title: 'Research question', summary: 'PICO and FINER', minutes: 20,
      lesson: [
        { h: 'Start from a real doubt', p: 'Good questions come from what you notice on the wards, in class or in the news. Write down anything that surprised you or that nobody could answer.' },
        { h: 'Shape it with PICO', p: 'Population, Intervention or exposure, Comparison, Outcome. For a descriptive study, such as a prevalence study, the Population and Outcome are enough.' },
        { h: 'Test it with FINER', p: 'Is it Feasible within a few months, Interesting, Novel, Ethical and Relevant? If it fails on feasibility, narrow it.' },
        { h: 'Keep it narrow', p: 'One population, one setting and one main outcome. A small, sharp question gets published faster than a big, vague one.' }
      ],
      example: {
        weak: 'Is stress bad for medical students?',
        strong: 'What is the prevalence of anxiety, measured with GAD-7, among MBBS students at a public medical college in Lahore during professional exams?',
        why: 'It names the population, the setting, the outcome and the tool used to measure it.'
      },
      task: { prompt: 'Write your research question in one sentence. Then label its P, I, C and O (write “not applicable” where needed), and add one line on why it is feasible for you.', minWords: 30 }
    },
    {
      n: 2, phase: 1, title: 'Literature search', summary: 'PubMed and MeSH terms', minutes: 30,
      lesson: [
        { h: 'Turn PICO into keywords', p: 'Take each part of your question and list 2–3 synonyms for it. These become the building blocks of your search.' },
        { h: 'Use MeSH terms', p: 'Look up the official Medical Subject Heading for each concept in the MeSH database. Combine it with free-text words tagged [tiab] so new papers are not missed.' },
        { h: 'Combine with Boolean operators', p: 'Use OR between synonyms and AND between concepts. Put each concept in brackets.' },
        { h: 'Filter and save', p: 'Limit to the last 5–10 years and to humans. Use “Similar articles” and “Cited by” on strong papers, and save everything in Zotero.' }
      ],
      example: {
        weak: 'anxiety medical students',
        strong: '("Anxiety"[Mesh] OR anxiety[tiab]) AND ("Students, Medical"[Mesh] OR "medical students"[tiab]) AND exam*[tiab]',
        why: 'It combines controlled vocabulary with free text and groups synonyms, so the results are both complete and relevant.'
      },
      task: { prompt: 'Paste your final PubMed search string, the number of results it returned, and the titles of 3 relevant papers you found.', minWords: 30 }
    },
    {
      n: 3, phase: 1, title: 'Study design', summary: 'Choosing the right one', minutes: 25,
      lesson: [
        { h: 'Describe or compare?', p: 'To describe how common something is, use a cross-sectional study. To test an association, use a case-control or cohort study. To test a treatment, use a randomised controlled trial.' },
        { h: 'Know the level of evidence', p: 'From highest to lowest: systematic reviews, RCTs, cohort, case-control, cross-sectional, then case reports.' },
        { h: 'Match it to your resources', p: 'Most student projects are cross-sectional studies or retrospective record reviews. They are quick, cheap and publishable.' },
        { h: 'Define who is in and out', p: 'State your setting, study duration, and inclusion and exclusion criteria clearly.' }
      ],
      example: {
        weak: 'We will do a survey.',
        strong: 'A descriptive cross-sectional study at a public medical college in Lahore from March to May 2026, including consenting 2nd–5th year MBBS students and excluding those with a diagnosed psychiatric illness.',
        why: 'It names the design, the setting, the duration and exactly who can take part.'
      },
      task: { prompt: 'Name your study design and justify it in 2–3 sentences. Then write your setting, duration, and inclusion and exclusion criteria.', minWords: 50 }
    },
    {
      n: 4, phase: 1, title: 'Synopsis and ethics', summary: 'ERC approval and consent', minutes: 40,
      lesson: [
        { h: 'Know the sections', p: 'Title, introduction, rationale, objectives, operational definitions, methodology, timeline and references.' },
        { h: 'Write a sharp rationale', p: 'In 3–4 sentences, say what is known, what is missing locally, and how your study will help.' },
        { h: 'Define every variable', p: 'An operational definition says exactly how you will measure something, for example “anxiety: GAD-7 score of 10 or more”.' },
        { h: 'Get ethical approval first', p: 'Submit to your ERC or IRB before collecting any data. Plan informed consent, confidentiality and the right to withdraw.' }
      ],
      example: {
        weak: 'This topic is very important and needs research.',
        strong: 'Local data on exam-related anxiety among Pakistani medical students are limited and mostly from before 2020. Current estimates can help colleges plan counselling services during exam periods.',
        why: 'It shows a specific gap and a practical use for the results.'
      },
      task: { prompt: 'Write your rationale (3–4 sentences), your objective or objectives, and an operational definition for your main outcome.', minWords: 60 }
    },
    {
      n: 5, phase: 2, title: 'Sample size', summary: 'OpenEpi and sampling', minutes: 25,
      lesson: [
        { h: 'Why it matters', p: 'Too small and you miss real effects. Too large and you waste months. Reviewers always check how you got your number.' },
        { h: 'The prevalence formula', p: 'n = Z² × p(1 − p) / d². Take the expected prevalence p from a previous study, use Z = 1.96 for 95% confidence, and a margin of error d, usually 5%.' },
        { h: 'Use a calculator', p: 'OpenEpi or the WHO sample size calculator do this for you. Add about 10% for non-response.' },
        { h: 'Choose a sampling technique', p: 'Probability methods (simple random, stratified) are stronger. Non-probability methods (consecutive, convenience) are common but must be justified.' }
      ],
      example: {
        weak: 'We will take 100 students.',
        strong: 'Using OpenEpi with an expected prevalence of 35% (ref), 95% confidence and a 5% margin of error, n = 350. Adding 10% for non-response gives 385. Stratified random sampling by year of study.',
        why: 'Every number has a source, so a reviewer can repeat the calculation.'
      },
      task: { prompt: 'Show your sample size calculation (the values you used, their source and the result), and name your sampling technique with a one-line justification.', minWords: 40 }
    },
    {
      n: 6, phase: 2, title: 'Proforma and data', summary: 'Questionnaires that work', minutes: 30,
      lesson: [
        { h: 'Use validated tools', p: 'Wherever possible use an established scale, such as GAD-7, PHQ-9 or PSQI, and cite the original paper.' },
        { h: 'Keep the proforma short', p: 'Demographics, exposure variables, then the outcome tool. Every question should serve an objective.' },
        { h: 'Pilot it', p: 'Test it on 5–10% of your sample first and fix anything that confuses people.' },
        { h: 'Plan data entry', p: 'One row per participant, one column per variable, numeric codes for categories, and a codebook that explains them.' }
      ],
      example: {
        weak: 'Do you feel stressed? Yes / No',
        strong: 'GAD-7: 7 items scored 0–3, total 0–21; a score of 10 or more indicates moderate to severe anxiety (Spitzer et al., 2006).',
        why: 'A validated tool gives comparable, defensible results.'
      },
      task: { prompt: 'List the sections and variables in your proforma, name any validated tool you will use (with its citation), and describe your data collection procedure in 3–4 sentences.', minWords: 50 }
    },
    {
      n: 7, phase: 2, title: 'Statistical analysis', summary: 'SPSS, tests and p-values', minutes: 35,
      lesson: [
        { h: 'Describe your data', p: 'Mean ± SD for normally distributed numbers, median (IQR) for skewed numbers, and frequency (%) for categories.' },
        { h: 'Pick the right test', p: 'Chi-square for two categorical variables, independent t-test for a number across two groups, ANOVA for more than two groups, and correlation for two numbers.' },
        { h: 'Read p-values properly', p: 'p < 0.05 is usually called significant, but also report effect sizes and 95% confidence intervals.' },
        { h: 'Set up SPSS', p: 'Import your sheet, label variables and values, and check for missing data before running any test.' }
      ],
      example: {
        weak: 'Data will be analysed using SPSS.',
        strong: 'Data will be analysed in SPSS v26. Age will be reported as mean ± SD and anxiety (GAD-7 ≥ 10) as frequency and percentage. The association between year of study and anxiety will be tested with the chi-square test, with p ≤ 0.05 taken as significant.',
        why: 'It names the software, how each variable is summarised and which test answers the objective.'
      },
      task: { prompt: 'Write your data analysis plan: the software, how each variable will be described, and which test answers each objective.', minWords: 40 }
    },
    {
      n: 8, phase: 3, title: 'Writing in IMRaD', summary: 'With journal-ready tables', minutes: 45,
      lesson: [
        { h: 'Introduction', p: 'Move from the broad problem to the specific gap, and end with your objective.' },
        { h: 'Methods', p: 'Give enough detail that someone else could repeat your study exactly.' },
        { h: 'Results', p: 'Report facts only, in text and tables, with numbers and denominators. Save interpretation for later.' },
        { h: 'Discussion', p: 'State your main finding first, compare it with published studies, then give limitations and a clear conclusion.' }
      ],
      example: {
        weak: 'Results showed many students were anxious, which is because of exams.',
        strong: 'Of 385 participants, 142 (36.9%) had moderate to severe anxiety (GAD-7 ≥ 10).',
        why: 'It gives numbers with denominators and leaves the explanation for the discussion.'
      },
      task: { prompt: 'Write the first paragraph of your Discussion. State your main finding and compare it with at least two published studies.', minWords: 80 }
    },
    {
      n: 9, phase: 3, title: 'Referencing', summary: 'Vancouver with Zotero', minutes: 20,
      lesson: [
        { h: 'Number in order of citation', p: 'In Vancouver style, sources are numbered in the order they first appear, shown as [1] or a superscript.' },
        { h: 'Follow the format', p: 'Author AA, Author BB. Title of article. Abbreviated Journal. Year;Volume(Issue):pages.' },
        { h: 'Let software do it', p: 'Use Zotero or Mendeley with the Vancouver style. Never type reference lists by hand.' },
        { h: 'Avoid plagiarism', p: 'Paraphrase and cite. Keep your similarity index within the journal’s limit; HEC generally accepts up to 19%.' }
      ],
      example: {
        weak: 'Spitzer, R. (2006) A brief measure for assessing generalized anxiety disorder, Archives of Internal Medicine.',
        strong: 'Spitzer RL, Kroenke K, Williams JB, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-7.',
        why: 'All authors, the abbreviated journal name, and the year, volume, issue and pages are in the right order.'
      },
      task: { prompt: 'Format 5 references from your study in Vancouver style, and show one sentence from your introduction with correct in-text citation numbers.', minWords: 40 }
    },
    {
      n: 10, phase: 3, title: 'Journal submission', summary: 'Cover letter and reviewers', minutes: 30,
      lesson: [
        { h: 'Choose the right journal', p: 'Check that your topic fits its scope, that it is HEC-recognised or indexed in PubMed or Scopus, and look at fees and review times. Avoid predatory journals.' },
        { h: 'Follow the author guidelines', p: 'Word limits, abstract format, reference style and file types. Most desk rejections happen here.' },
        { h: 'Write a short cover letter', p: 'Give your title, why it suits the journal, and confirm it is original, not under review elsewhere and approved by all authors.' },
        { h: 'Answer reviewers well', p: 'Reply point by point and politely, and show exactly where each change was made.' }
      ],
      example: {
        weak: 'Please publish my article.',
        strong: 'We submit our original article for consideration in your journal. This cross-sectional study of 385 MBBS students reports current local data on exam-related anxiety, relevant to your readers in medical education. The work is original, not under review elsewhere, and approved by all authors.',
        why: 'It tells the editor what the paper is, why it fits, and confirms the required declarations.'
      },
      task: { prompt: 'Name two journals you would target and why they fit, then write your cover letter in 150–200 words.', minWords: 100 }
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
    phases: [{ id: 1, name: 'Prepare', blurb: 'Pick the right case and get consent.' }, { id: 2, name: 'Write', blurb: 'Write it up the way journals expect.' }],
    steps: [
      S(1, 1, 'Choose a reportable case', 'What makes a case publishable', 20, [
        L('Know what journals want', 'A rare disease, an unusual presentation of a common disease, a new diagnostic or treatment insight, or an unexpected drug reaction.'),
        L('Check that it is new', 'Search PubMed for “[condition] case report” and see how many similar cases exist. Fewer reports and a clear new angle make it stronger.'),
        L('Find your teaching point', 'Say in one sentence what a doctor should learn from your case. If you can’t, the case isn’t ready yet.')
      ], 'A patient with typhoid fever.',
        'Typhoid fever presenting as acute acalculous cholecystitis in a 19-year-old man, an uncommon complication that delayed diagnosis.',
        'It names the condition, the unusual feature and why it matters clinically.',
        'Describe your case in 3–4 sentences, state its one teaching point, and say how many similar cases you found on PubMed.', 50),
      S(2, 1, 'Consent and ethics', 'Permission and privacy', 15, [
        L('Get written consent', 'Take written informed consent for publication from the patient, or a guardian, including consent for any images.'),
        L('Remove identifiers', 'No names, initials, dates of birth, hospital numbers, exact dates or faces. Crop or mask images.'),
        L('Check local rules', 'Some institutions ask for ERC approval or notification even for case reports. Journals will ask for a consent statement.')
      ], 'Consent was taken.',
        'Written informed consent was obtained from the patient for publication of this case report and accompanying images. A copy is available to the editor on request.',
        'It states what was consented to and that proof is available.',
        'Write your consent statement and list every identifier you will remove from the case details and images.', 30),
      S(3, 2, 'Case presentation and timeline', 'Following the CARE guidelines', 30, [
        L('Patient information', 'Age, sex and the relevant history only: symptoms, past illnesses, medicines and family history that matter to the case.'),
        L('Clinical findings', 'Give the important positive and negative findings on examination, in the order you found them.'),
        L('Make a timeline', 'A table with day or date, event, findings and intervention makes the story easy to follow.')
      ], 'The patient came with fever, was given treatment and got better.',
        'A 19-year-old man presented with 10 days of fever and 2 days of right upper quadrant pain. Murphy’s sign was positive, and ultrasound showed a distended, thick-walled gallbladder without stones.',
        'It is specific, chronological and includes the findings that point to the diagnosis.',
        'Write the case presentation (patient information and clinical findings) and a timeline table with at least 5 events.', 120),
      S(4, 2, 'Diagnosis, treatment and outcome', 'What was done and what happened', 30, [
        L('Diagnostic assessment', 'List the tests, the differential diagnoses you considered and why each was ruled out.'),
        L('Treatment', 'Give drugs with doses, routes and durations, and any procedures or changes in plan.'),
        L('Follow-up and outcome', 'Say how the patient did, how you confirmed it, and any side effects.')
      ], 'Blood tests confirmed the diagnosis.',
        'Blood culture grew Salmonella Typhi sensitive to ceftriaxone; hepatitis A and E serology was negative. He received IV ceftriaxone 2 g daily for 14 days. Pain settled by day 5, and a repeat ultrasound at 4 weeks was normal.',
        'The reader can see exactly how the diagnosis was made and what treatment achieved.',
        'Write the diagnostic assessment (with differentials), treatment, and follow-up and outcome sections.', 100),
      S(5, 2, 'Introduction and discussion', 'Put the case in context', 35, [
        L('Short introduction', 'One paragraph: what the condition is and why this case is worth reading.'),
        L('Discussion', 'Compare your case with published ones, explain the likely mechanism, and mention strengths and limitations.'),
        L('Learning points', 'End with 2–3 short, practical take-home messages.')
      ], 'This is a very rare case.',
        'Acalculous cholecystitis complicates a small minority of typhoid cases (ref). As in the cases reported by earlier authors (refs), our patient’s pain began in the second week of fever, which suggests…',
        'It supports “rare” with evidence and links the case to the literature.',
        'Write the introduction (about 100 words) and the discussion with at least 3 references, ending with 2–3 learning points.', 150),
      S(6, 2, 'Title, abstract and submission', 'Get it out of the door', 25, [
        L('A clear title', 'Include the words “case report” and the key diagnosis or feature.'),
        L('Structured abstract', 'Introduction, case presentation and conclusion in about 150–250 words, plus 3–5 MeSH keywords.'),
        L('Pick a journal', 'Choose one that publishes case reports in your field, check its fees and format, and follow its author guidelines exactly.')
      ], 'An interesting case',
        'Typhoid Fever Presenting as Acute Acalculous Cholecystitis: A Case Report',
        'Editors and search engines can tell at once what the paper is about.',
        'Write your title, abstract and keywords, and name the journal you plan to submit to.', 120)
    ]
  };

  var LETTER = {
    phases: [{ id: 1, name: 'Prepare', blurb: 'Pick an article and a point worth making.' }, { id: 2, name: 'Write & submit', blurb: 'A short, sharp, well-referenced letter.' }],
    steps: [
      S(1, 1, 'Pick an article', 'Something worth responding to', 20, [
        L('Choose a recent article', 'Most journals only accept letters about articles they published in the last few months.'),
        L('Find something to add', 'A limitation, another explanation, newer evidence or local data. A letter that only praises won’t be published.'),
        L('Read the rules', 'Check the journal’s word, reference and author limits for letters.')
      ], 'I liked this article about anxiety in students.',
        'Khan et al. report a 36% anxiety prevalence but used an unvalidated questionnaire; results measured with GAD-7 would allow comparison with other studies.',
        'It names the article and a specific, useful point.',
        'Give the full citation of the article, the journal’s limits for letters, and the 1–2 points you will make.', 40),
      S(2, 1, 'Build your argument', 'One point per paragraph', 25, [
        L('One idea per paragraph', 'Keep each paragraph to a single point so the editor can follow it quickly.'),
        L('Back it up', 'Support every claim with a reference or data.'),
        L('Stay respectful', 'Be constructive: suggest how the problem could be addressed.')
      ], 'The authors made a big mistake.',
        'The sample was recruited from a single hostel, which may limit how far the findings apply to day scholars; a multi-centre design (3) could address this.',
        'It is polite, specific and supported.',
        'Write your main argument paragraph or paragraphs, with references.', 80),
      S(3, 2, 'Write the letter', 'Full draft within the limit', 30, [
        L('Structure', 'Salutation, an opening line citing the article, your points, and a short closing sentence.'),
        L('Keep it short', 'Usually 300–600 words and 5–10 references. Cut anything that doesn’t support your point.'),
        L('Vancouver references', 'The article you are responding to is usually reference 1.')
      ], 'Hello, I am a medical student and I want to say…',
        'Dear Editor, We read with interest the article by Khan et al. (1) on anxiety among medical students…',
        'It follows the standard format editors expect.',
        'Write your full letter within the journal’s limits.', 200),
      S(4, 2, 'Submit', 'Details editors check', 15, [
        L('Author details', 'Names, affiliations, a corresponding author email and ORCID IDs if available.'),
        L('Declarations', 'A conflict of interest statement and funding statement, even if there are none.'),
        L('Submit as a letter', 'Choose “Letter to the Editor” as the article type and reply quickly to any editor queries.')
      ], 'Submitted without declarations.',
        'Conflicts of interest: none declared. Funding: none.',
        'Missing declarations are a common reason for delays.',
        'Paste your final letter with its title, author line, conflict of interest and funding statements, and the journal you are submitting to.', 150)
    ]
  };

  var SYNOPSIS = {
    phases: [{ id: 1, name: 'Foundations', blurb: 'Question, background and definitions.' }, { id: 2, name: 'Methods & submission', blurb: 'How the study will run, and getting it approved.' }],
    steps: [
      S(1, 1, 'Title, question and objectives', 'The core of the synopsis', 25, [
        L('A complete title', 'Include the variable, population, setting and study design.'),
        L('A focused question', 'Use PICO so the question is clear and answerable.'),
        L('SMART objectives', 'Specific, measurable, achievable, relevant and time-bound. One primary objective is usually enough.')
      ], 'Study of diabetes.',
        'Frequency of Diabetic Peripheral Neuropathy among Type 2 Diabetics Presenting to the Medical OPD of Mayo Hospital, Lahore: A Cross-Sectional Study',
        'It tells the reviewer exactly what, who, where and how.',
        'Write your synopsis title, research question and objectives.', 40),
      S(2, 1, 'Introduction and rationale', 'Why the study is needed', 35, [
        L('Funnel down', 'Start with the problem globally, then in Pakistan, then in your setting.'),
        L('Use recent numbers', 'Quote the latest local and international figures with references.'),
        L('A sharp rationale', 'Say what is missing and how your results will be used.')
      ], 'Diabetes is a very common disease all over the world.',
        'Pakistan has one of the highest diabetes prevalences worldwide (ref), yet local data on neuropathy screening in OPD patients are limited. Knowing its frequency will help plan routine foot examinations.',
        'It is specific, referenced and ends with a clear gap.',
        'Write your introduction and rationale.', 150),
      S(3, 1, 'Operational definitions', 'Measurable variables', 20, [
        L('Define every variable', 'Say exactly how each variable will be measured and what counts as positive.'),
        L('Hypothesis if analytical', 'Comparative studies need null and alternative hypotheses; descriptive studies don’t.'),
        L('Match your tools', 'Definitions should use the same tools and cut-offs as your proforma.')
      ], 'Neuropathy: damage to nerves.',
        'Diabetic peripheral neuropathy: a Michigan Neuropathy Screening Instrument examination score of 2.5 or more.',
        'Anyone could apply it and get the same answer.',
        'Write operational definitions for all your main variables, and your hypothesis if your study needs one.', 50),
      S(4, 2, 'Methodology', 'Design, sample and criteria', 35, [
        L('Design, setting and duration', 'Name the design, the exact setting, and a duration counted from approval.'),
        L('Sample size and sampling', 'Show the calculation, the values used and their reference, and the sampling technique.'),
        L('Inclusion and exclusion', 'Clear, checkable criteria that match your objective.')
      ], 'Patients will be taken from OPD.',
        'Non-probability consecutive sampling of type 2 diabetics aged 30–70 years with disease duration over 5 years presenting to the medical OPD, Mayo Hospital, Lahore, for 6 months after approval.',
        'It is specific enough to repeat.',
        'Write your methodology up to and including the inclusion and exclusion criteria.', 120),
      S(5, 2, 'Data collection and analysis', 'Procedure and statistics', 30, [
        L('Step-by-step procedure', 'From approval and consent to examination, recording on the proforma and storing data.'),
        L('Analysis plan', 'Software, how each variable will be described, stratification for effect modifiers, and the post-stratification test.'),
        L('Attach the proforma', 'Your proforma and consent form go in the annexes.')
      ], 'Data will be analysed on SPSS.',
        'Data will be analysed in SPSS v26. Age and duration of diabetes will be presented as mean ± SD, and neuropathy as frequency and percentage. Data will be stratified for age, gender and HbA1c, with chi-square applied after stratification (p ≤ 0.05 significant).',
        'It answers every question a reviewer will ask about the analysis.',
        'Write your data collection procedure and data analysis plan.', 100),
      S(6, 2, 'References, timeline and submission', 'Finish and submit', 20, [
        L('References', 'Usually 10–20 recent references in Vancouver style.'),
        L('Work plan', 'A simple timeline or Gantt chart from approval to thesis submission.'),
        L('Submit', 'Follow your university or CPSP format exactly and attach the proforma and consent form.')
      ], 'Time: 6 months.',
        'Month 1: approval and piloting. Months 2–5: data collection. Month 6: analysis and write-up.',
        'Reviewers can see the plan is realistic.',
        'Write your timeline, list your references, and list the annexes you will attach.', 80)
    ]
  };

  var THESIS = {
    phases: [{ id: 1, name: 'Plan & early chapters', blurb: 'Structure, introduction and literature.' }, { id: 2, name: 'Results & finishing', blurb: 'Methods, results, discussion and final checks.' }],
    steps: [
      S(1, 1, 'Plan your chapters', 'Outline and format', 20, [
        L('Standard structure', 'Introduction, literature review, methodology, results, and discussion with conclusion.'),
        L('Your university’s format', 'Check margins, fonts, spacing, citation style and word limits before you start.'),
        L('Outline first', 'Write every heading with a target word count. It makes the writing much faster.')
      ], 'I will start writing from the introduction.',
        'Chapter 1 Introduction (2,000 words): background, problem statement, significance, objectives, operational definitions…',
        'A detailed outline turns a big task into small ones.',
        'Write your chapter outline with headings and word targets, and list your university’s format requirements.', 60),
      S(2, 1, 'Introduction chapter', 'Background to objectives', 35, [
        L('Build on the synopsis', 'Expand the background and update the literature to the present.'),
        L('Problem and significance', 'State the problem clearly and why solving it matters locally.'),
        L('Objectives and definitions', 'Keep them identical to your approved synopsis.')
      ], 'This thesis is about neuropathy.',
        'Despite high diabetes prevalence in Pakistan, neuropathy is often detected only after ulcers develop. Early detection data from OPD settings are needed to…',
        'It frames a specific, local problem.',
        'Write the problem statement and significance section of your introduction.', 150),
      S(3, 1, 'Literature review', 'Synthesise, don’t summarise', 45, [
        L('Organise by theme', 'Group studies by topic (prevalence, risk factors, tools), not one paragraph per paper.'),
        L('Compare and contrast', 'Show where studies agree, where they differ and why.'),
        L('End with the gap', 'Every theme should lead towards what your study adds.')
      ], 'Ali (2019) did a study. Khan (2020) also did a study.',
        'Reported prevalence ranges from 22% to 48% (refs); higher figures come from tertiary centres using nerve conduction studies, while screening instruments give lower estimates (refs).',
        'It synthesises several sources into one insight.',
        'Write one themed section of your literature review (at least 300 words) with at least 5 references.', 250),
      S(4, 2, 'Methodology chapter', 'What you actually did', 30, [
        L('Past tense', 'Describe what was done, not what will be done.'),
        L('Report deviations', 'Say honestly what changed from the synopsis and why.'),
        L('Ethics and statistics', 'Include the approval reference number and the full analysis plan.')
      ], 'Patients will be enrolled consecutively.',
        'After approval from the institutional review board (ref. no. …), 196 patients were enrolled consecutively from March to August 2026.',
        'It records what happened, with evidence.',
        'Write your methodology chapter in the past tense, including any deviations from the synopsis.', 200),
      S(5, 2, 'Results', 'Tables and plain facts', 35, [
        L('Participants first', 'How many were screened, enrolled and analysed, and a baseline characteristics table.'),
        L('One objective at a time', 'Tables and figures for each objective; text highlights the key numbers.'),
        L('No interpretation', 'Save the meaning for the discussion. Table titles go above tables, figure titles below figures.')
      ], 'Most patients had neuropathy, which shows poor control.',
        'Of 196 patients, 71 (36.2%) had neuropathy. It was more frequent in those with HbA1c above 8% (48.1% vs 24.0%, p = 0.001).',
        'Facts with denominators; interpretation is left for later.',
        'Describe your baseline table and the results for your first objective in text.', 120),
      S(6, 2, 'Discussion and final checks', 'Finish strong', 40, [
        L('Discuss', 'Main finding first, compare with literature, explain differences, then limitations and recommendations.'),
        L('Conclude', 'Answer each objective directly in a short conclusion.'),
        L('Final checks', 'Plagiarism report (HEC generally accepts up to 19%), formatting, abstract, acknowledgements and binding requirements.')
      ], 'In conclusion, neuropathy is a big problem.',
        'Diabetic peripheral neuropathy was present in about one in three type 2 diabetics in our OPD, and was associated with poor glycaemic control.',
        'It answers the objective with the actual finding.',
        'Write your conclusion, recommendations and one limitations paragraph.', 150)
    ]
  };

  var META = {
    phases: [{ id: 1, name: 'Protocol & search', blurb: 'Question, registration, search and screening.' }, { id: 2, name: 'Analysis & writing', blurb: 'Extract, assess, pool and report.' }],
    steps: [
      S(1, 1, 'Question and protocol', 'PICO and eligibility', 30, [
        L('Frame the question', 'Population, intervention or exposure, comparison, outcomes, and the study designs you will include.'),
        L('Eligibility criteria', 'Decide inclusion and exclusion rules before searching.'),
        L('Register on PROSPERO', 'Register the protocol before screening starts. Journals increasingly require it.')
      ], 'Is vitamin D good?',
        'In pregnant women (P), does vitamin D supplementation (I), compared with placebo or no supplement (C), reduce pre-eclampsia (O)? Include RCTs only.',
        'Every part of the question can be searched and judged.',
        'Write your PICO question, eligibility criteria and planned primary and secondary outcomes.', 60),
      S(2, 1, 'Search strategy', 'Find every relevant study', 35, [
        L('At least three databases', 'For example PubMed, Cochrane CENTRAL and Embase or Scopus, plus trial registries.'),
        L('MeSH plus free text', 'Combine controlled terms and synonyms; avoid language limits where possible.'),
        L('Record everything', 'Save the date, full search string and number of results for each database.')
      ], 'vitamin D pregnancy',
        '("Vitamin D"[Mesh] OR cholecalciferol[tiab] OR "vitamin D"[tiab]) AND ("Pregnancy"[Mesh] OR pregnan*[tiab]) AND ("Pre-Eclampsia"[Mesh] OR preeclampsia[tiab]) AND randomized controlled trial[pt]',
        'It is complete, reproducible and specific to trials.',
        'Paste your full PubMed search string, list the other databases, and give the number of results from each.', 50),
      S(3, 1, 'Screening', 'Two reviewers, two stages', 30, [
        L('Remove duplicates', 'Use Rayyan, EndNote or Zotero to de-duplicate records.'),
        L('Two independent reviewers', 'Screen titles and abstracts, then full texts, and resolve disagreements by discussion.'),
        L('Record reasons', 'Note why each full text was excluded. These numbers fill your PRISMA flow diagram.')
      ], 'I selected the relevant papers.',
        '1,248 records identified; 312 duplicates removed; 936 screened; 41 full texts assessed; 12 trials included (29 excluded: 14 wrong outcome, 9 not randomised, 6 wrong population).',
        'The selection is transparent and reproducible.',
        'Report your screening numbers at each stage and the main reasons for exclusion.', 50),
      S(4, 2, 'Data extraction', 'A pilot-tested sheet', 30, [
        L('Design the sheet', 'Author, year, country, design, sample size, intervention, comparator, and outcome data (events/totals or mean/SD).'),
        L('Pilot it', 'Test on 2–3 studies and fix unclear fields.'),
        L('Two extractors', 'Two people extract independently and compare.')
      ], 'I copied the results from each paper.',
        'Study | Country | n (I/C) | Dose | Pre-eclampsia events I/C → Ali 2021 | Pakistan | 120/118 | 4,000 IU daily | 6/14',
        'Structured extraction gives the exact numbers you need to pool.',
        'List the columns in your extraction sheet and show the data extracted from 2 studies.', 60),
      S(5, 2, 'Risk of bias', 'Judge study quality', 30, [
        L('Pick the right tool', 'RoB 2 for randomised trials; ROBINS-I or Newcastle–Ottawa for observational studies.'),
        L('Judge each domain', 'Give a judgement with a reason for each domain, not just an overall score.'),
        L('Certainty of evidence', 'Summarise certainty for each outcome with GRADE.')
      ], 'All studies were good quality.',
        'Ali 2021: some concerns in the randomisation process (allocation concealment not reported); low risk in the other domains.',
        'Each judgement has a stated reason.',
        'Name the tool you will use and give risk-of-bias judgements, with reasons, for 2 included studies.', 60),
      S(6, 2, 'Pool the results', 'Forest plots and heterogeneity', 40, [
        L('Effect measure', 'Risk ratio or odds ratio for yes/no outcomes; mean difference or standardised mean difference for numbers.'),
        L('Model and heterogeneity', 'Use a random-effects model when studies differ; interpret I² (about 25% low, 50% moderate, 75% high).'),
        L('Check robustness', 'Sensitivity and subgroup analyses, and a funnel plot if you have 10 or more studies.')
      ], 'The meta-analysis showed vitamin D works.',
        'Vitamin D reduced pre-eclampsia (RR 0.62, 95% CI 0.45–0.85; 12 trials, 2,410 women; I² = 38%, random effects).',
        'It gives the effect size, precision, amount of evidence and heterogeneity.',
        'Describe your pooled analysis: effect measure, model, the pooled result or plan, I², and what the forest plot shows.', 80),
      S(7, 2, 'Write with PRISMA 2020', 'Report it fully', 40, [
        L('Follow the checklist', 'PRISMA 2020 has 27 items. Fill in the page number for each before you submit.'),
        L('Flow diagram', 'Show records identified, screened, excluded (with reasons) and included.'),
        L('Balanced discussion', 'Summarise the evidence, its certainty, limitations of the studies and of your review, and implications.')
      ], 'We did a meta-analysis and found good results.',
        'Background, objectives, methods (databases, dates, eligibility, risk of bias, synthesis), results (studies, participants, pooled estimates), limitations and conclusion, in about 250 words.',
        'It follows PRISMA for Abstracts, which editors check first.',
        'Write your abstract (about 250 words) following PRISMA for Abstracts.', 150)
    ]
  };

  window.CURRICULUM = {
    tracks: [
      { id: 'original', name: 'Original article', short: 'Original article', blurb: 'Plan, run and write your own study, from question to journal.', phases: ORIGINAL.phases, steps: ORIGINAL.steps },
      { id: 'case', name: 'Case report', short: 'Case report', blurb: 'Turn an interesting patient into a publication.', phases: CASE.phases, steps: CASE.steps },
      { id: 'letter', name: 'Letter to the editor', short: 'Letter', blurb: 'A short, sharp response to a published article.', phases: LETTER.phases, steps: LETTER.steps },
      { id: 'synopsis', name: 'Synopsis', short: 'Synopsis', blurb: 'A research proposal your ERC or CPSP will approve.', phases: SYNOPSIS.phases, steps: SYNOPSIS.steps },
      { id: 'thesis', name: 'Thesis', short: 'Thesis', blurb: 'Chapter by chapter, for MPhil, MS, MD and FCPS.', phases: THESIS.phases, steps: THESIS.steps },
      { id: 'meta', name: 'Systematic review & meta-analysis', short: 'Meta-analysis', blurb: 'Search, screen, assess bias and pool results.', phases: META.phases, steps: META.steps }
    ]
  };
  window.CURRICULUM.track = function (id) {
    return window.CURRICULUM.tracks.filter(function (t) { return t.id === id; })[0] || window.CURRICULUM.tracks[0];
  };
})();
