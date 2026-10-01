/* Writing basics: how to write each part of a research paper, in simple words.
   Every part has: what it is, the pattern to follow, sentence starters, a fill-in template, a weak and a
   strong example, and common mistakes. One running example is used throughout (breakfast and MBBS
   students) so each part is easy to compare with the others. Numbers in the examples are made up. */
window.RT_WRITING = [
  {
    id: 'words', intro: true, title: 'Research words in plain English', short: 'The ABC of research, if you are brand new', length: '5 min read',
    what: 'Research has its own words, and they can make simple ideas sound hard. Here is what each one really means. Come back to this page whenever a word in a lesson confuses you.',
    terms: [
      ['Research question', 'The one question your study answers. Example: “How many MBBS students skip breakfast?”'],
      ['Objective', 'The same question written as a goal: “To determine the frequency of breakfast skipping among MBBS students.”'],
      ['Variable', 'Anything you measure that can change from person to person: age, gender, hours of sleep, skipping breakfast (yes/no).'],
      ['Study design', 'The type of study. The easiest for students is cross-sectional: you ask a group of people once, at one point in time.'],
      ['Population', 'Everyone your question is about. Example: all MBBS students at your college.'],
      ['Sample and sample size', 'The people you actually ask, and how many of them. You work out the number with a formula or a free calculator.'],
      ['Sampling', 'How you choose who to ask. Random means everyone has an equal chance, like drawing names from a hat.'],
      ['Inclusion and exclusion', 'The rules for who can join (included) and who can’t (excluded), and why.'],
      ['Questionnaire / proforma', 'The form you use to collect answers. A proforma is a simple data form, often filled by you, not the participant.'],
      ['Operational definition', 'Exactly how you decide “yes” or “no” for a variable, so everyone counts it the same way.'],
      ['Ethics approval (ERC / IRB)', 'Permission from your college’s ethics committee before you collect any data. Journals reject studies without it.'],
      ['Informed consent', 'Each person agrees to take part after you explain the study. Usually a short signed form.'],
      ['Synopsis', 'Your study plan on paper, written before you start. You submit it to get ethics approval.'],
      ['Data and SPSS', 'Data are the answers you collected. SPSS (or Excel) is the software you use to count and test them.'],
      ['Frequency and percentage', 'How many people had something, and what share of the total. Example: 110 of 250 students (44%).'],
      ['Mean ± SD', 'The average, and how spread out the values are. Example: age 21.3 ± 1.8 years.'],
      ['p-value', 'How likely a difference is due to chance. Below 0.05 usually means “significant”, so probably a real difference.'],
      ['Chi-square test', 'A common test to see if two yes/no things are linked, like short sleep and skipping breakfast.'],
      ['Bias', 'Anything that pushes your results away from the truth. Example: people saying what sounds good instead of what is true.'],
      ['Manuscript', 'Your finished paper, ready to send to a journal.'],
      ['IMRaD', 'The usual order of a paper: Introduction, Methods, Results and Discussion.'],
      ['Citation and reference', 'A citation is the small number in your text, like (3). The reference is the full detail of that paper in the list at the end.'],
      ['Vancouver style', 'The way most medical journals want references written: numbered in the order you first use them.'],
      ['Journal and peer review', 'A journal publishes research. Peer review means experts read your paper and suggest changes before it is accepted.'],
      ['Plagiarism', 'Copying someone else’s words or ideas without credit. Always write in your own words and cite the source. Journals check with software.']
    ]
  },
  {
    id: 'order', intro: true, words: { min: 2000, ideal: '2500–3000', max: 3500, unit: 'words', note: 'For the main text, from Introduction to Conclusion. The abstract, tables and references are counted separately. Always check your target journal’s own limit.' },
    title: 'The shape of a paper', short: 'Which parts come first, and why', length: 'Read this first',
    what: 'Almost every research paper uses the same order, called IMRaD: Introduction, Methods, Results and Discussion. The title and abstract sit on top; the conclusion and references come at the end. Once you know the order, you always know what goes where.',
    pattern: [
      { h: 'Title and abstract', p: 'The shop window. Most people read only these, so they must tell the whole story in a few lines.' },
      { h: 'Introduction: why?', p: 'What is known, what is missing, and what you set out to find.' },
      { h: 'Methods: how?', p: 'Exactly what you did, so someone else could repeat it.' },
      { h: 'Results: what did you find?', p: 'Only the numbers and facts. No opinions yet.' },
      { h: 'Discussion: what does it mean?', p: 'Explain the results, compare with other studies, admit the limits.' },
      { h: 'Conclusion and references', p: 'The take-home message in 2 or 3 lines, then the list of papers you used.' }
    ],
    starters: ['Write Methods first: it is the easiest, because you already know what you did.', 'Then Results, then Discussion, then Introduction.', 'Write the Abstract and Title last, once everything else is done.'],
    template: 'Title (12–15 words)\nAbstract (about 250 words: Objective · Methods · Results · Conclusion) + 3–6 keywords\n1. Introduction (350–450 words)\n2. Objectives (1–2 sentences)\n3. Methods (500–700 words)\n4. Results (400–600 words + 2–4 tables)\n5. Discussion (700–1000 words, ending with Limitations)\n6. Conclusion (50–80 words)\nReferences (15–30)\n\nMain text total: about 2500–3000 words.',
    budget: true,
    mistakes: ['Writing the abstract first, then having to rewrite it.', 'Putting results inside the Methods, or opinions inside the Results.', 'Mixing the order because a friend’s paper looked different. Check your target journal’s instructions.']
  },
  {
    id: 'title', words: { min: 8, ideal: '12–15', max: 20, unit: 'words', note: 'Some journals also limit it to about 150 characters. Never more than 2 lines.' },
    title: 'Title', short: 'Say what, who, where and the study type', length: '10–20 words',
    what: 'The title tells a reader in one line what you studied, in whom, where, and what kind of study it was. A good title is specific and plain, not clever.',
    pattern: [
      { h: 'The topic', p: 'What you measured. Example: breakfast skipping.' },
      { h: 'The people', p: 'Who you studied. Example: MBBS students.' },
      { h: 'The place', p: 'Where. Example: a medical college in Lahore.' },
      { h: 'The study type', p: 'Usually after a colon. Example: a cross-sectional study.' }
    ],
    starters: ['Frequency of … among … at …: a cross-sectional study', 'Association between … and … in …', 'Knowledge, attitude and practice of … among …'],
    template: '[What you measured] among [who] at [where]: a [study type]',
    example: {
      weak: 'Breakfast: a big problem?',
      strong: 'Frequency of breakfast skipping and its link with short sleep among MBBS students in Lahore: a cross-sectional study'
    },
    mistakes: ['Questions or jokes as titles.', 'Abbreviations nobody knows.', 'Leaving out the study type or the place.']
  },
  {
    id: 'abstract', words: { min: 150, ideal: 250, max: 300, unit: 'words', note: 'Most Pakistani journals (JPMA, JCPSP, PJMS) ask for 250 words, split into Objective, Methods, Results, Conclusion. Add 3–6 keywords below it.' },
    title: 'Abstract', short: 'The whole paper in one short paragraph', length: '200–300 words',
    what: 'The abstract is a mini version of the whole paper. Most readers (and editors) read only this, so each part of your study gets one or two sentences. Most journals want it split into headings.',
    pattern: [
      { h: 'Background (1–2 lines)', p: 'Why the topic matters and what is missing.' },
      { h: 'Objective (1 line)', p: 'What you wanted to find, the same words as your objective.' },
      { h: 'Methods (2–3 lines)', p: 'Study type, place, time, who, how many, how you collected and analysed data.' },
      { h: 'Results (3–4 lines)', p: 'The main numbers, with percentages and p-values.' },
      { h: 'Conclusion (1–2 lines)', p: 'What it means, and what should happen next.' }
    ],
    starters: ['Background: … is common among … but little is known about …', 'Objective: To determine …', 'Methods: A cross-sectional study was conducted at … from … to … on … students selected by …', 'Results: Of the … participants, …% …', 'Conclusion: … was common among … Awareness sessions on … are recommended.'],
    template: 'Background: [why it matters + what is missing].\nObjective: To [determine / assess / compare] [what] among [who].\nMethods: A [study type] was conducted at [place] from [month year] to [month year]. [Number] [participants] were selected by [sampling]. Data were collected using [tool] and analysed in [SPSS version]; [test] was used, with p < 0.05 as significant.\nResults: Of [n] participants, [x]% [main finding]. [Second finding with p-value].\nConclusion: [one-line meaning]. [one-line recommendation].',
    example: {
      weak: 'We did a study on breakfast in students and found many skip it, which is bad. More research is needed.',
      strong: 'Objective: To determine the frequency of breakfast skipping among MBBS students. Methods: A cross-sectional study was conducted at a medical college in Lahore from March to May 2025 on 250 students selected by stratified random sampling. Results: Of 250 students, 44% skipped breakfast on most days; skipping was more common in those sleeping under 6 hours (58% vs 31%, p < 0.001). Conclusion: Nearly half the students skipped breakfast. Better sleep habits may help.'
    },
    mistakes: ['Results with no numbers.', 'New information that is not in the paper.', 'References or abbreviations in the abstract.', 'Going over the word limit.']
  },
  {
    id: 'intro', words: { min: 250, ideal: '350–450', max: 600, unit: 'words', note: 'About 3–4 paragraphs. If yours is over 600, cut the textbook background first.' },
    title: 'Introduction', short: 'Wide to narrow: known, missing, your aim', length: '300–500 words · 3–4 paragraphs',
    what: 'The introduction answers “why did you do this study?”. It works like a funnel: start wide with the big problem, narrow down to what is missing, and end with your aim.',
    pattern: [
      { h: 'Paragraph 1: the big problem', p: 'What the topic is and why it matters, with a number from the world or Pakistan. Example: how common it is, and what harm it causes.' },
      { h: 'Paragraph 2: what is already known', p: 'What other studies found, with references. Group them: “Studies in India and Saudi Arabia found …”.' },
      { h: 'Paragraph 3: the gap', p: 'What nobody has studied yet. Maybe no study in your city, in your group of people, or recent enough. This is the most important paragraph.' },
      { h: 'Paragraph 4: your aim', p: 'One or two lines: “This study was therefore designed to …”, and why it will help.' }
    ],
    starters: ['… is a major public health problem, affecting …% of … worldwide (1).', 'Previous studies from … reported that … (2, 3).', 'However, little is known about … in Pakistan.', 'To our knowledge, no study has assessed … among …', 'This study was therefore conducted to determine …'],
    template: '[Topic] is [why it matters], affecting [number] worldwide (ref).\n\nStudies from [countries] found that [main findings] (refs). [One more line on causes or effects] (ref).\n\nHowever, [what is missing: no study in this place / group / recent years]. [Why that matters].\n\nThis study was therefore designed to [aim]. The results may help [who] to [what].',
    example: {
      weak: 'Breakfast is the most important meal of the day. Everyone knows this. Students are busy. So we did this study.',
      strong: 'Breakfast skipping is common among young adults and is linked with poor concentration and weight gain (1, 2). Studies from Saudi Arabia and India found that 30–50% of medical students skip breakfast, often because of early classes and late nights (3, 4). However, there is little recent data from Pakistan, and no study has looked at the role of sleep among MBBS students in Lahore. This study was therefore designed to find how many students skip breakfast and whether short sleep is linked with it.'
    },
    mistakes: ['Starting with a textbook definition that goes on for a page.', 'No gap, so the reader cannot see why the study was needed.', 'Sentences with no reference.', 'Putting your results in the introduction.']
  },
  {
    id: 'objectives', words: { min: 15, ideal: '20–40', max: 60, unit: 'words', note: '1 main objective, plus 1–2 extra if you need them. One sentence each.' },
    title: 'Objectives', short: 'Exactly what you will find out', length: '1–3 lines',
    what: 'An objective is one sentence saying exactly what you will measure, in whom. It starts with an action word, and every objective must be answered in your results.',
    pattern: [
      { h: 'Start with an action word', p: 'To determine, to assess, to compare, to find the association between.' },
      { h: 'Say what you measure', p: 'Breakfast skipping, not “eating habits”.' },
      { h: 'Say who', p: 'MBBS students of a medical college in Lahore.' },
      { h: 'One idea per objective', p: 'If you have two ideas, write two objectives: a main one and a second one.' }
    ],
    starters: ['To determine the frequency of … among …', 'To assess the level of knowledge of … among …', 'To compare … between … and …', 'To find the association of … with …'],
    template: 'Primary: To determine the [frequency / level] of [what] among [who] at [where].\nSecondary: To find the association of [what] with [factor].',
    example: {
      weak: 'To study breakfast in students and see what happens.',
      strong: 'Primary: To determine the frequency of breakfast skipping among MBBS students of a medical college in Lahore.\nSecondary: To find the association of breakfast skipping with hours of sleep.'
    },
    mistakes: ['Vague words: “to study”, “to know about”, “to see”.', 'Objectives you never answer in the results.', 'Too many objectives. One main and one or two extra are enough.']
  },
  {
    id: 'methods', words: { min: 350, ideal: '500–700', max: 900, unit: 'words', note: 'Use short headings. It is fine to be a bit longer here, because details make your study repeatable.' },
    title: 'Methodology', short: 'Who, where, when, how, so anyone could repeat it', length: '400–700 words · short headings',
    what: 'The methods say exactly what you did, in the past tense, so another person could repeat your study. Use short headings so it is easy to follow. Write it like a recipe.',
    pattern: [
      { h: 'Study design, place and time', p: '“A cross-sectional study was conducted at … from … to …”.' },
      { h: 'Ethics', p: 'Who approved it (your ethics committee and reference number) and that everyone gave informed consent.' },
      { h: 'Sample size', p: 'How many people, and how you worked it out (formula or calculator, with the numbers you used).' },
      { h: 'Sampling', p: 'How you picked people: random, stratified, consecutive, convenience.' },
      { h: 'Who could join (inclusion and exclusion)', p: 'Who was included, and who was left out and why.' },
      { h: 'Data collection', p: 'The tool (questionnaire, proforma), where it came from, and how it was filled.' },
      { h: 'Operational definitions', p: 'What exactly counted as a “yes”. Example: skipping breakfast = eating nothing before 10 am on 4 or more of the last 7 days.' },
      { h: 'Data analysis', p: 'Software and version, which tests for which variables, and p < 0.05 as significant.' }
    ],
    starters: ['A cross-sectional study was conducted at … from … to …', 'Ethical approval was obtained from … (Ref no. …). Written informed consent was taken from all participants.', 'The sample size of … was calculated using … with …% confidence level, …% margin of error and an expected frequency of …% (ref).', 'Students of all years who … were included. Those who … were excluded.', 'Data were entered and analysed in SPSS version … . Chi-square test was used to compare … . A p-value < 0.05 was taken as significant.'],
    template: 'Study design and setting: A [design] was conducted at [place] from [date] to [date].\nEthics: Approval was obtained from [committee] (Ref no. [ ]). Written informed consent was taken.\nSample size: [n], calculated using [formula / calculator] with [confidence]%, [margin]% and expected frequency [p]% (ref).\nSampling: [technique].\nInclusion: [ ]. Exclusion: [ ].\nData collection: [tool], [where it came from / pilot tested on n people].\nOperational definitions: [variable] = [exactly how you decided yes or no].\nAnalysis: SPSS [version]. Numbers as frequency and percentage; [mean ± SD]. [Test] for [comparison]. p < 0.05 significant.',
    example: {
      weak: 'We gave forms to students in our college and then checked the answers on SPSS.',
      strong: 'A cross-sectional study was conducted at a medical college in Lahore from March to May 2025 after approval from the institutional ethics committee (Ref 123/ERC). A sample of 250 was calculated with a 95% confidence level, 6% margin of error and expected frequency of 40%. Students were selected by stratified random sampling from all five years. A pre-tested questionnaire recorded breakfast habits and hours of sleep. Breakfast skipping was defined as eating nothing before 10 am on 4 or more of the last 7 days. Data were analysed in SPSS 26; the chi-square test was used, with p < 0.05 as significant.'
    },
    mistakes: ['No ethics approval or consent.', 'No sample size calculation.', 'Not defining what counts as a “yes”.', 'Writing results here.', 'Writing in the future tense (that is for the synopsis only).']
  },
  {
    id: 'results', words: { min: 250, ideal: '400–600', max: 800, unit: 'words', note: 'Plus 2–4 tables or figures. Tables are not counted in the word limit by most journals.' },
    title: 'Results', short: 'Only facts and numbers, in order', length: '300–600 words · plus tables',
    what: 'The results report what you found: numbers only, no opinions or reasons. Go in the same order as your objectives, and let tables carry the details.',
    pattern: [
      { h: 'Who took part', p: 'How many joined (and response rate), then age, gender and year in one or two lines or a table.' },
      { h: 'Main finding', p: 'The answer to your main objective, with a number and percentage.' },
      { h: 'Other findings', p: 'Answers to the other objectives, with p-values.' },
      { h: 'Tables and figures', p: 'Number each (Table 1, Figure 1). In the text, mention only the most important numbers; do not repeat the whole table.' }
    ],
    starters: ['A total of … students took part (response rate …%). The mean age was … ± … years.', 'Of the … participants, … (…%) …', '… was significantly more common among … (…% vs …%, p = …).', 'No significant association was found between … and … (p = …).'],
    template: 'A total of [n] [participants] took part ([response rate]%). The mean age was [mean ± SD] years; [x]% were [female/male].\n[Main finding]: [n] ([x]%) [result] (Table 1).\n[Second finding]: [result] was more common among [group] ([a]% vs [b]%, p = [ ]) (Table 2).',
    example: {
      weak: 'Many students skipped breakfast which shows they are careless about health, especially the ones who sleep late.',
      strong: 'A total of 250 students took part (response rate 100%); mean age was 21.3 ± 1.8 years and 62% were female. Breakfast skipping was reported by 110 students (44%). It was more common among students sleeping under 6 hours than those sleeping 6 hours or more (58% vs 31%, p < 0.001) (Table 2).'
    },
    mistakes: ['Explaining or giving opinions (save that for the discussion).', 'Percentages with no numbers, or numbers with no percentages.', 'Repeating every number from the table in the text.', 'Leaving out results that did not go your way.']
  },
  {
    id: 'discussion', words: { min: 500, ideal: '700–1000', max: 1200, unit: 'words', note: 'The longest part of the paper. Limitations usually sit at its end.' },
    title: 'Discussion', short: 'What the results mean, compared with others', length: '500–900 words · 4–6 paragraphs',
    what: 'The discussion explains what your results mean. It is the opposite shape of the introduction: start with your own main finding, then compare it with other studies, explain the differences, and end with what it means in real life.',
    pattern: [
      { h: 'Paragraph 1: your main finding', p: 'Say the key result again in one or two lines, without all the numbers.' },
      { h: 'Paragraphs 2–3: compare with others', p: 'Which studies found the same (and why), and which found something different (and why: different place, age, tool or year).' },
      { h: 'Paragraph 4: explain it', p: 'Give a sensible reason for your result. Example: early classes, late-night studying.' },
      { h: 'Paragraph 5: what it means', p: 'Why it matters for students, colleges or doctors.' },
      { h: 'Then: strengths and limitations', p: 'One short paragraph on what was good about your study and what was weak (see Limitations).' }
    ],
    starters: ['This study found that …', 'This is similar to a study from … which reported … (ref).', 'In contrast, … found a lower rate of …%, possibly because …', 'A likely reason is that …', 'These findings suggest that …'],
    template: 'This study found that [main finding in plain words].\n\nThis is similar to [author/country] (ref), who reported [x]%. [Reason it matches].\n\nIn contrast, [author/country] found [y]% (ref). This may be because [difference in place / age / tool / time].\n\nA possible reason for [finding] is [explanation].\n\nThese findings suggest that [who] should [what].',
    example: {
      weak: 'Our results are very important and prove that students must eat breakfast. Other studies also said this.',
      strong: 'This study found that almost half of MBBS students skipped breakfast, and this was more common in those who slept less. A similar rate (46%) was reported among medical students in Riyadh (5). A study from Karachi found a lower rate of 29% (6), possibly because it included first-year students only, who have lighter schedules. Late-night studying may lead to waking up late and missing breakfast. Colleges could consider awareness sessions on sleep and meals, especially before exams.'
    },
    mistakes: ['Only repeating the results with more numbers.', 'Saying your study “proves” something. Use “suggests” or “shows a link”.', 'Comparing with no references.', 'Ignoring studies that disagree with you.']
  },
  {
    id: 'limitations', words: { min: 50, ideal: '80–120', max: 150, unit: 'words', note: 'One short paragraph, at the end of the discussion.' },
    title: 'Limitations', short: 'Honest about what could be better', length: '3–6 lines',
    what: 'Every study has limits. Saying them honestly makes reviewers trust you more, not less. For each limit, say what it means and how a future study could fix it.',
    pattern: [
      { h: 'Say the limit', p: 'Example: one college only; self-reported answers; a cross-sectional design.' },
      { h: 'Say what it means', p: 'Example: results may not apply to all students; people may remember wrongly; we cannot say one thing causes the other.' },
      { h: 'Say what could fix it', p: 'Example: future studies in several cities, or following students over time.' },
      { h: 'Add a strength', p: 'One line on what was good: a random sample, a tested questionnaire, a good response rate.' }
    ],
    starters: ['This study has some limitations.', 'First, it was done in a single college, so the results may not apply to …', 'Second, the data were self-reported, which may cause recall bias.', 'Being cross-sectional, it cannot show cause and effect.', 'Future multi-centre studies are recommended.'],
    template: 'This study has some limitations. It was conducted at [single place], so the results may not apply to [wider group]. Data were [self-reported], which may cause [recall / social desirability] bias. The [cross-sectional] design cannot show cause and effect. Future [multi-centre / longitudinal] studies are recommended. Strengths include [random sampling / validated tool / high response rate].',
    example: {
      weak: 'There were no limitations in our study.',
      strong: 'This study was done in one college, so the results may not apply to all medical students in Pakistan. Breakfast habits were self-reported and may be affected by recall bias. As a cross-sectional study, it cannot show that short sleep causes breakfast skipping. Studies across several cities that follow students over time are recommended. Strengths include random sampling and a pre-tested questionnaire.'
    },
    mistakes: ['Writing “no limitations”.', 'A long list that makes the study sound useless. Pick the 2–4 real ones.', 'Listing limits without saying what they mean.']
  },
  {
    id: 'conclusion', words: { min: 30, ideal: '50–80', max: 100, unit: 'words', note: '2–4 sentences. No numbers, no references.' },
    title: 'Conclusion', short: 'The take-home message', length: '2–4 lines',
    what: 'The conclusion is the answer to your objective, plus what should happen next. It must match your results. No new numbers, no references and nothing you did not study.',
    pattern: [
      { h: 'Answer the objective', p: 'In one line, in plain words.' },
      { h: 'Add the second finding', p: 'If you had a second objective, one line for it.' },
      { h: 'Recommend', p: 'One practical next step for colleges, doctors or future research.' }
    ],
    starters: ['… was found to be common among …', '… was significantly associated with …', 'Awareness programmes / further studies on … are recommended.'],
    template: '[Main finding] was [common / high / low] among [who]. It was [associated with factor]. [Who] should [practical step], and further [type] studies are recommended.',
    example: {
      weak: 'In conclusion, breakfast is very important for everyone and all people should eat it every day to stay healthy and happy.',
      strong: 'Breakfast skipping was common among MBBS students and was linked with short sleep. Colleges should promote healthy sleep and meal habits, and multi-centre studies are recommended.'
    },
    mistakes: ['Claims your results don’t support.', 'Repeating the discussion.', 'New numbers or references.']
  },
  {
    id: 'references', words: { min: 10, ideal: '15–30', max: 40, unit: 'references', note: 'Check your journal: many allow up to 30 for an original article. Most should be from the last 5–10 years.' },
    title: 'References', short: 'Give credit, in Vancouver style', length: '15–30 references',
    what: 'References show where each fact came from. Most medical journals use Vancouver style: number each source in the order you first use it, like (1), and list them at the end in that order.',
    pattern: [
      { h: 'Number as you go', p: 'The first paper you mention is (1), the next new one is (2), and so on. Reuse the same number if you cite it again.' },
      { h: 'Use recent papers', p: 'Mostly from the last 5–10 years, from PubMed or Google Scholar.' },
      { h: 'Follow the format', p: 'Authors (up to 6, then et al.). Title. Journal. Year;Volume(Issue):Pages.' },
      { h: 'Use a reference manager', p: 'Zotero or Mendeley (free) will number and format them for you.' }
    ],
    starters: ['Khan A, Ali S, Raza M. Title of the article. J Pak Med Assoc. 2023;73(4):812-6.', 'Cite in the text like this: … is common (1, 2).'],
    template: '[Surname Initials], [Surname Initials], [Surname Initials]. [Title of article]. [Journal short name]. [Year];[Volume]([Issue]):[pages].',
    mistakes: ['Citing Wikipedia or websites for medical facts.', 'Numbers in the text that do not match the list.', 'Copying references from another paper without reading them.']
  }
];

/* which guides belong to each step of a programme (shown as "How to write it" inside the step's lesson) */
window.RT_WRITING_STEPS = {
  original: { 1: ['words', 'order', 'objectives'], 2: ['intro', 'references'], 3: ['methods'], 4: ['title', 'intro', 'objectives', 'methods'], 5: ['methods'], 6: ['methods'],
    7: ['results'], 8: ['order', 'title', 'abstract', 'intro', 'objectives', 'methods', 'results', 'discussion', 'limitations', 'conclusion'], 9: ['references'], 10: ['title', 'abstract'] }
};
