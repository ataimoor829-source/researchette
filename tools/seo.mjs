/* Builds the public, search-friendly "Learn research" pages and the sitemap.
   Run from the repo root after changing public/assets/writing.js or adding a page:
     node tools/seo.mjs
   It writes public/learn/index.html, one page per writing guide in public/learn/, and public/sitemap.xml.
   The pages reuse the look (head, nav, footer) of public/guides.html, so they match the rest of the site. */
import fs from 'fs';
import vm from 'vm';

const SITE = 'https://researchette.com';
const today = new Date().toISOString().slice(0, 10);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* the guide content shared with the portal */
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync('public/assets/writing.js', 'utf8'), ctx);
const W = ctx.window.RT_WRITING;

/* page slug, the title people search for, and its meta description */
const PAGES = {
  words: ['research-terms-explained', 'Research terms explained in plain English', 'Research words explained simply for beginners and medical students: research question, objective, variable, sample size, p-value, bias, ethics approval, peer review and more.'],
  order: ['structure-of-a-research-paper', 'Structure of a research paper (IMRaD) and word count', 'The parts of a research paper in order (IMRaD), which part to write first, and the ideal, minimum and maximum word count for each part.'],
  title: ['how-to-write-a-research-title', 'How to write a research paper title', 'How to write a clear research title: what, who, where and study type, with examples, a template and the ideal length (12–15 words).'],
  abstract: ['how-to-write-an-abstract', 'How to write an abstract for a research paper', 'How to write a structured abstract (Objective, Methods, Results, Conclusion) step by step, with a template, an example and the word limit (about 250 words).'],
  intro: ['how-to-write-an-introduction', 'How to write the introduction of a research paper', 'How to write a research introduction in 4 paragraphs: the problem, what is known, the gap and your aim. Sentence starters, an example, a template and word count.'],
  objectives: ['how-to-write-research-objectives', 'How to write research objectives', 'How to write research objectives with action words (to determine, to assess, to compare), with examples of weak and strong objectives and a template.'],
  methods: ['how-to-write-methodology', 'How to write the methodology of a research paper', 'How to write the methods section: study design, ethics, sample size, sampling, inclusion and exclusion, data collection and analysis, with a template and example.'],
  results: ['how-to-write-results', 'How to write the results section of a research paper', 'How to write the results section: participants, the main finding, other findings and tables, with sentence starters, an example and the ideal length.'],
  discussion: ['how-to-write-discussion', 'How to write the discussion of a research paper', 'How to write a research discussion: your main finding, comparison with other studies, explanation and meaning, with sentence starters, an example and a template.'],
  limitations: ['how-to-write-limitations', 'How to write the limitations of a study', 'How to write study limitations honestly: say the limit, what it means and how to fix it, with examples, a template and the ideal length.'],
  conclusion: ['how-to-write-a-conclusion', 'How to write the conclusion of a research paper', 'How to write a research conclusion in 2–4 sentences: answer the objective and recommend a next step, with a weak and strong example.'],
  references: ['vancouver-referencing', 'Vancouver referencing for medical research papers', 'How to cite and list references in Vancouver style: numbering, format, examples and free reference managers (Zotero, Mendeley).']
};

/* look and feel from guides.html: everything up to <main>, and the contact/footer section at the end */
const tpl = fs.readFileSync('public/guides.html', 'utf8');
const absolute = (h) => h.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/|data:)([^"]+)"/g, (m, a, p) => a + '="/' + p.replace(/^index\.html/, '').replace(/\.html(?=$|#)/, '') + '"');
const headStart = tpl.slice(0, tpl.indexOf('<title>'));
const headEnd = tpl.slice(tpl.indexOf('<link rel="icon"'), tpl.indexOf('<main class="wrap">'));
const endSection = tpl.slice(tpl.indexOf('<section class="end">'), tpl.indexOf('</main>'));
const scripts = tpl.slice(tpl.indexOf('</main>') + 7);

const extraCss = `<style>
.learn-body { display: grid; gap: 22px; }
.learn-body h2 { font-size: 1.3rem; margin: 6px 0 0; }
.learn-body .card { padding: clamp(18px, 3vw, 28px); display: grid; gap: 14px; }
.learn-body ol.steps { margin: 0; padding: 0; list-style: none; counter-reset: s; display: grid; gap: 12px; }
.learn-body ol.steps li { counter-increment: s; display: grid; grid-template-columns: 32px 1fr; gap: 12px; }
.learn-body ol.steps li::before { content: counter(s); width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; background: var(--pen-soft); color: var(--pen); font: 700 .85rem var(--f-display); }
.learn-body ol.steps b { display: block; }
.learn-body ol.steps p { margin: 2px 0 0; color: var(--muted); }
.wl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; }
.wl div { padding: 12px 8px; border-radius: 14px; border: 1px solid var(--line); }
.wl span { display: block; font-size: .78rem; color: var(--muted); font-weight: 600; }
.wl b { font: 800 1.2rem var(--f-display); }
.wl .ideal { background: var(--teal-soft); border-color: transparent; color: var(--teal); }
.wl .ideal span { color: var(--teal); }
.ex { border-radius: 16px; padding: 14px 16px; }
.ex.weak { background: var(--red-soft, rgba(221,68,96,.1)); }
.ex.strong { background: var(--teal-soft); }
.ex small { display: block; font: 700 .72rem var(--f-mono, monospace); letter-spacing: .08em; text-transform: uppercase; margin-bottom: 4px; }
.ex.weak small { color: var(--redpen); } .ex.strong small { color: var(--teal); }
.ex.weak p { text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--redpen) 40%, transparent); }
pre.tpl { white-space: pre-wrap; margin: 0; padding: 16px 18px; border-radius: 16px; background: var(--glass-strong); font: .95rem/1.65 var(--f-body); overflow-wrap: anywhere; }
ul.plain { margin: 0; padding-left: 1.2em; display: grid; gap: 6px; }
ul.miss { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
ul.miss li { display: grid; grid-template-columns: 20px 1fr; gap: 8px; }
ul.miss li::before { content: "✕"; color: var(--redpen); font-weight: 700; }
table.budget { width: 100%; border-collapse: collapse; font-size: .95rem; }
table.budget th, table.budget td { padding: 10px 8px; border-top: 1px solid var(--line); text-align: center; }
table.budget th:first-child, table.budget td:first-child { text-align: left; }
table.budget thead th { border-top: 0; color: var(--pen); font-size: .82rem; }
dl.gloss { margin: 0; display: grid; }
dl.gloss div { padding: 12px 0; border-top: 1px solid var(--line); }
dl.gloss div:first-child { border-top: 0; }
dl.gloss dt { font-weight: 700; color: var(--pen); }
dl.gloss dd { margin: 2px 0 0; }
.pager { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; }
.cta-box { display: grid; gap: 10px; padding: clamp(20px, 3vw, 30px); border-radius: 24px; color: #fff; background: linear-gradient(140deg, #4B5CF0, #2A38B8 60%, #0F6F66); }
.cta-box h2 { color: #fff; margin: 0; }
.cta-box p { margin: 0; opacity: .9; }
.cta-box .btn { justify-self: start; background: #fff; color: #2A38B8; }
.crumbs { font-size: .88rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 6px; }
.crumbs a { color: inherit; }
.hub { display: grid; gap: 10px; }
@media (min-width: 720px) { .hub { grid-template-columns: 1fr 1fr; } }
.hub a { display: grid; gap: 4px; padding: 16px 18px; border-radius: 18px; text-decoration: none; color: inherit; }
.hub a b { color: var(--ink); }
.hub a span { color: var(--muted); font-size: .92rem; }
.hub a small { color: var(--teal); font-weight: 600; }
ul.locked { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
ul.locked li { display: grid; grid-template-columns: 22px 1fr; gap: 10px; align-items: start; }
ul.locked li::before { content: ""; width: 22px; height: 22px; margin-top: 1px; border-radius: 7px; background: var(--pen-soft) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233448D8' stroke-width='2.4' stroke-linecap='round'%3E%3Crect x='5' y='11' width='14' height='10' rx='2'/%3E%3Cpath d='M8 11V8a4 4 0 0 1 8 0v3'/%3E%3C/svg%3E") center / 13px no-repeat; }
.lock-tag { justify-self: start; font: 700 .72rem var(--f-mono, monospace); letter-spacing: .08em; text-transform: uppercase; padding: .35em .8em; border-radius: 99px; background: rgba(255,255,255,.18); }
.cta-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; }
.cta-login { color: #fff; opacity: .9; font-weight: 600; }
</style>`;

function page({ path, title, description, h1, eyebrow, body, jsonld }) {
  const url = SITE + path;
  return absolute(headStart) +
    `<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Researchette">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}/assets/og.jpg">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
` + absolute(headEnd).replace('</head>', extraCss + '\n</head>') +
    `<main class="wrap">
  <section class="hero">
    <span class="eyebrow">${esc(eyebrow)}</span>
    <h1>${esc(h1)}</h1>
  </section>
  <div class="learn-body">
${body}
  </div>
` + absolute(endSection) + '</main>' + absolute(scripts);
}

const crumbs = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: x[0], item: SITE + x[1] })) });
const org = { '@type': 'EducationalOrganization', name: 'Researchette', url: SITE + '/' };
const cta_unused = (what) => `    <section class="cta-box"><h2>Want a mentor to check your ${esc(what)}?</h2><p>Researchette mentors guide medical students through their own study, step by step, and give feedback on every draft until it is ready to submit.</p><a class="btn" href="/#join">Apply for mentorship →</a></section>`;

/* one page per guide */
const order = W.map((w) => w.id).filter((id) => PAGES[id]);
const urls = [];
order.forEach((id, i) => {
  const w = W.find((x) => x.id === id), [slug, title, description] = PAGES[id];
  const prev = order[i - 1], next = order[i + 1];
  /* a preview only: what the lesson covers, never the lesson itself (the full lessons are for members, in the portal) */
  const covers = w.terms ? [w.terms.length + ' research words explained in plain English', 'An everyday example for each word', 'When you will meet each word in your own study']
    : [
      w.pattern ? (w.intro ? 'Every part of a paper, in order, and which part to write first' : 'The pattern to follow, step by step (' + w.pattern.length + ' steps)') : '',
      w.budget ? 'The ideal, minimum and maximum word count for every part' : w.words ? 'The ideal, minimum and maximum ' + (w.words.unit === 'references' ? 'number of references' : 'word count') : '',
      w.starters && !w.intro ? 'Ready-made sentence starters' : '',
      w.example ? 'A weak and a strong example, side by side' : '',
      w.template && !w.intro ? 'A fill-in template you can copy' : '',
      w.mistakes ? 'The ' + w.mistakes.length + ' most common mistakes, and how to avoid them' : ''
    ].filter(Boolean);
  const body = [
    `    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/learn/">Learn research</a> › <span>${esc(w.title)}</span></nav>`,
    `    <section class="glass card"><p class="lede" style="margin:0">${esc(w.what)}</p></section>`,
    `    <section class="glass card"><h2>What this lesson covers</h2><ul class="locked">${covers.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>`,
    `    <section class="cta-box"><span class="lock-tag">Members only</span><h2>The full lesson is in the Researchette programme</h2><p>Members get every lesson inside their portal, step by step, with a mentor who checks their ${esc(w.terms ? 'work' : w.intro ? 'paper' : w.title.toLowerCase())} and gives feedback until it is ready to submit.</p><div class="cta-row"><a class="btn" href="/#join">Apply to join →</a><a class="cta-login" href="/portal">Already a member? Log in</a></div></section>`,
    `    <nav class="pager" aria-label="More lessons">${prev ? `<a class="btn btn-glass" href="/learn/${PAGES[prev][0]}">← ${esc(W.find((x) => x.id === prev).title)}</a>` : '<a class="btn btn-glass" href="/learn/">← All lessons</a>'}${next ? `<a class="btn btn-primary" href="/learn/${PAGES[next][0]}">Next: ${esc(W.find((x) => x.id === next).title)} →</a>` : '<a class="btn btn-primary" href="/learn/">All lessons →</a>'}</nav>`
  ].join('\n');
  const path = '/learn/' + slug;
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: title, description, url: SITE + path, inLanguage: 'en', dateModified: today, author: { '@type': 'Person', name: 'Zain Ramzan' }, publisher: org, isAccessibleForFree: false, educationalLevel: 'Beginner', about: 'Medical research writing' },
    crumbs([['Home', '/'], ['Learn research', '/learn/'], [w.title, path]])
  ] };
  fs.mkdirSync('public/learn', { recursive: true });
  fs.writeFileSync('public/learn/' + slug + '.html', page({ path, title: title + ' · Researchette', description, h1: title, eyebrow: 'Lesson preview', body, jsonld }));
  urls.push([path, '0.8']);
});

/* the hub: how to learn research, step by step */
const G = (id) => '/guides#' + id;
const path = [
  ['Learn the words', 'Research has its own vocabulary. Ten minutes with the basics makes every lesson easier.', [['Research terms explained', '/learn/research-terms-explained']]],
  ['Find a gap and choose a topic', 'Pick a small, local question that nobody has answered yet, and check it with PICO and FINER.', [['How to find a research gap', G('gap')], ['PICO and FINER', G('pico')]]],
  ['Search the literature', 'Learn to search PubMed and read papers quickly, so you know what is already known.', [['Searching PubMed', G('pubmed')], ['Reading a paper', G('read')]]],
  ['Plan your study and get ethics approval', 'Write your plan (the synopsis), choose the study design and get approval before collecting any data.', [['Ethics approval', G('ethics')], ['How to write the methodology', '/learn/how-to-write-methodology']]],
  ['Collect and analyse your data', 'Use a simple form, enter the data in Excel or SPSS, and run the right test.', [['Statistics made simple', G('stats')]]],
  ['Write the paper, one part at a time', 'Title, abstract, introduction, methods, results, discussion and conclusion, each with its own pattern and word count.', [['Structure of a research paper', '/learn/structure-of-a-research-paper'], ['How to write the introduction', '/learn/how-to-write-an-introduction']]],
  ['Reference, submit and reply to reviewers', 'Cite in Vancouver style, avoid predatory journals and answer reviewers politely.', [['Vancouver referencing', '/learn/vancouver-referencing'], ['Avoiding predatory journals', G('predatory')], ['Replying to reviewers', G('reviewers')]]]
];
const faqs = [
  ['How can I learn research as a complete beginner?', 'Start with the basic words, then do one small study yourself from start to finish: choose a simple question, read what is already known, plan the study, get ethics approval, collect and analyse the data, and write it up part by part. Doing one real project with feedback teaches far more than lectures alone.'],
  ['How long does it take to learn research?', 'You can learn the basics in a few weeks. Doing your first small study, from topic to submission, usually takes a few months at 30–60 minutes a day.'],
  ['Can medical students do research in first or second year?', 'Yes. Cross-sectional surveys, case reports and letters to the editor are good first projects, and they need no special equipment.'],
  ['What is research mentorship?', 'A mentor who has published research guides you through your own study, reviews each draft and tells you exactly what to fix, so you learn by doing.'],
  ['How do I get the full lessons?', 'The full lessons are part of the Researchette programme. Apply to join, and once your place is confirmed you get every lesson in your portal, with a mentor who reviews each step of your own study.']
];
const hubBody = [
  `    <section class="glass card"><p class="lede" style="margin:0">A step-by-step path for medical and health students who want to learn research from zero: the 7 steps from your first idea to a published paper, and the lessons that teach you to write every part of it.</p></section>`,
  `    <section class="glass card"><h2>How to learn research in 7 steps</h2><ol class="steps">${path.map((p) => `<li><div><b>${esc(p[0])}</b><p>${esc(p[1])} ${p[2].map((l) => `<a href="${l[1]}">${esc(l[0])}</a>`).join(' · ')}</p></div></li>`).join('')}</ol></section>`,
  `    <section class="stack" style="display:grid;gap:12px"><h2>How to write each part of a research paper</h2><p class="muted" style="margin:0">Full lessons are for members. Tap one to see what it covers.</p><div class="hub">${order.map((id) => { const w = W.find((x) => x.id === id); return `<a class="glass" href="/learn/${PAGES[id][0]}"><b>${esc(PAGES[id][1])}</b><span>${esc(w.short)}</span><small>Members only</small></a>`; }).join('')}</div></section>`,
  `    <section class="glass card"><h2>Free research guides</h2><p class="muted" style="margin:0">18 short guides on PubMed, reading papers, statistics, plagiarism, authorship, case reports, letters and meta-analyses. <a href="/guides">See all research guides →</a></p></section>`,
  `    <section class="glass card"><h2>Questions about learning research</h2>${faqs.map((f) => `<div><b>${esc(f[0])}</b><p class="muted" style="margin:4px 0 0">${esc(f[1])}</p></div>`).join('')}</section>`,
  `    <section class="cta-box"><h2>Learn research faster with a mentor</h2><p>Do your own study with a Researchette mentor: daily steps in your portal, and feedback on every draft from topic to journal submission.</p><a class="btn" href="/#join">Apply for mentorship →</a></section>`
].join('\n');
fs.writeFileSync('public/learn/index.html', page({
  path: '/learn/', title: 'Learn research step by step: a course for beginners · Researchette',
  description: 'How to learn research from zero: a step-by-step path for medical students, with mentor-led lessons on writing the title, abstract, introduction, methods, results, discussion and references.',
  h1: 'Learn research, step by step', eyebrow: 'Research course', body: hubBody,
  jsonld: { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Course', name: 'Learn research, step by step', description: 'A mentor-led beginner course on how to do and write medical research, from finding a research gap to submitting to a journal.', provider: org, url: SITE + '/learn/', inLanguage: 'en', isAccessibleForFree: false, educationalLevel: 'Beginner',
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online', courseWorkload: 'P3M' } },
    { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) },
    crumbs([['Home', '/'], ['Learn research', '/learn/']])
  ] }
}));

/* sitemap */
const sitemap = [['/', '1.0'], ['/learn/', '0.9'], ...urls, ['/guides', '0.8'], ['/mentors', '0.7'], ['/research', '0.7'], ['/reviews', '0.6'], ['/privacy', '0.2'], ['/terms', '0.2']];
fs.writeFileSync('public/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemap.map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n') + '\n</urlset>\n');
console.log('wrote', urls.length + 1, 'learn pages and sitemap.xml with', sitemap.length, 'urls');
