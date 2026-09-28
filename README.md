# Researchette

Medical research mentorship: daily tasks, step-by-step lessons and mentor feedback, from research question to journal submission.

## What's here

- `index.html`: the landing page (light/dark, liquid-glass style, scroll animations). The membership form saves applications into the portal.
- `portal.html`: one page that holds the login screen, the member portal and the mentor (admin) portal.
- `assets/curriculum.js`: the 10-step roadmap in 3 phases, with a lesson, a weak/strong example and a task for each step. Edit this file to change the course content.
- `assets/store.js`: the data layer (logins, members, applications, submissions, reviews).
- `assets/portal.js`, `assets/portal.css`: the portal screens and styles.

There is no build step. Open `index.html` in a browser, or host the folder on GitHub Pages, Netlify or Cloudflare Pages.

## How it works

**Member portal**
- **Today:** the current step, split into Learn, Example and Task. The member writes the task (with a minimum word count, and drafts are saved automatically) and submits it.
- **Roadmap:** all 10 steps with their status: approved, in review, needs changes, to do or locked. A step unlocks when the one before it is approved.
- **Feedback:** every submission and the mentor's comments.

**Mentor portal**
- **Overview:** waiting reviews, active members, new applications and approvals this week.
- **Reviews:** the queue, oldest first. Submissions older than 48 hours are flagged. Open one, write feedback, then approve it (unlocking the next step) or request changes.
- **Members:** search, progress for each member, and every step's submission.
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
