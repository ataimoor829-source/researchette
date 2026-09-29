# Researchette

Medical research mentorship: daily tasks, step-by-step lessons and mentor feedback, from research question to journal submission.

## What's here

- `index.html`: the landing page (light/dark, liquid-glass style, scroll animations). The membership form saves applications into the portal.
- `mentors.html`: each mentor's details and personal message. Opened from the “Read message” button under each mentor on the landing page.
- `reviews.html`: the student reviews page, linked from the top bar and the Mentors section. Add real reviews to the `REVIEWS` list at the bottom of the file; until then it shows a “first reviews are on their way” message. Students can send a review through the form, which opens WhatsApp with it filled in.
- `portal.html`: one page that holds the login screen, the member portal and the mentor (admin) portal.
- `assets/curriculum.js`: the programmes (original article, case report, letter to the editor, synopsis, thesis, meta-analysis). Each has its own steps, with a lesson, a weak/strong example and a task. Edit this file to change the course content.
- `assets/store.js`: the data layer (logins, members, applications, submissions, reviews).
- `assets/portal.js`, `assets/portal.css`: the portal screens and styles.
- `assets/liquid.css`, `assets/fx.js`: the shared liquid-glass layer and motion (smooth eased scrolling, pointer spotlight, card tilt, magnetic buttons, reveals) used by every page.
- `manifest.webmanifest`, `sw.js`, `assets/icons/`: make the portal installable as a phone app. On Android the portal shows an Install button; on iPhone it explains Share → Add to Home Screen.

There is no build step. Open `index.html` in a browser, or host the folder on GitHub Pages, Netlify or Cloudflare Pages.

## How it works

**Member portal**
- **Today:** the current step, split into Learn, Example and Task. The member writes the task (with a minimum word count, and drafts are saved automatically) and submits it.
- **Roadmap:** all 10 steps with their status: approved, in review, needs changes, to do or locked. A step unlocks when the one before it is approved.
- **Feedback:** every submission and the mentor's comments.

**Programmes:** members pick a programme from Today or Roadmap and can switch any time; progress in each is kept. Mentors can add or remove programmes for any member.

**Mentor portal**
- **Overview:** waiting reviews, active members, new applications and approvals this week.
- **Reviews:** the queue, oldest first. Submissions older than 48 hours are flagged. Open one, write feedback, then approve it (unlocking the next step) or request changes.
- **Members:** add a member (creates a login), search, filter to your own students, assign a mentor, choose programmes, reset or set a password, WhatsApp them, or remove them.
- **Applications:** applications from the website. Mark payment as received, then approve to create a login. The temporary password and a ready-to-send welcome message are shown once.

## Demo mode (current)

`assets/store.js` keeps all data in the browser's localStorage, so everything can be tried without a server. Demo logins:

| Role | Email | Password |
|---|---|---|
| Mentor | zain@researchette.pk | admin1234 |
| Mentor | sobia@researchette.pk | admin1234 |
| Mentor | taimoor@researchette.pk | admin1234 |
| Member | ayesha@demo.pk | demo1234 |

Anyone can change their password from the account menu (tap your initials, top right). Mentors can also reset the demo data there.

**Before real students use it,** replace `store.js` with a real backend such as Supabase. Demo mode stores passwords in plain text and keeps data in one browser only. The functions in `store.js` (`signIn`, `stepStates`, `submit`, `queue`, `review`, `approveApplication` and the rest) are the interface the pages use, so only that file needs to change.
