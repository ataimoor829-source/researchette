/* Researchette core roadmap: 10 steps in 3 phases.
   Each step has a short lesson, a weak/strong example and a task the member submits for mentor review. */
window.CURRICULUM = {
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
