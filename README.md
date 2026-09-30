# Researchette

Medical research mentorship: daily tasks, step-by-step lessons and mentor feedback, from research question to journal submission.

## What's here

- `public/`: the website Cloudflare serves.
  - `index.html`: the landing page. The membership form (name, email and WhatsApp number required) sends applications straight to the mentor portal.
  - `mentors.html`: each mentor's details and message, opened from “Read message” on the landing page.
  - `privacy.html`, `terms.html`: privacy policy and terms and conditions, linked from every footer and the portal login.
  - `reviews.html`: student reviews. Add real reviews to the `REVIEWS` list at the bottom of the file.
  - `research.html`: students' published papers, loaded from the database. Owners add and remove them in the portal.
  - `portal.html`: login, member portal and mentor portal.
  - `assets/curriculum.js`: the programmes and all lesson content, written for complete beginners. Edit this to change the course. Lessons can include pictures drawn by `portal.js`: tables, flows, decision charts, the evidence pyramid, formulas, letter cards (PICO, FINER, SMART), funnels, AND/OR/NOT circles, a drawing of the PubMed screen, spreadsheets and a forest plot (the types are listed at the top of the extra-guidance section).
  - `assets/store.js`: talks to the API. `assets/portal.js`, `portal.css`: portal screens.
  - `assets/liquid.css`, `assets/fx.js`: shared glass look and pointer effects.
  - `assets/menu.js`: the phone menu (menu button in the top bar at 860px and below) on every public page.
  - `manifest.webmanifest`, `sw.js`, `assets/icons/`: make the portal installable as a phone app.
  - `_headers`: security headers for every page. `robots.txt` keeps the portal out of search results.
- `worker/index.js`: the API (Cloudflare Worker). Handles logins, applications, members, submissions and reviews.
- `worker/connector.js`: the MCP connector and its OAuth sign-in.
- `db/schema.sql`: the database tables (Cloudflare D1, database `researchette-db`).
- `wrangler.jsonc`: Cloudflare config. `/api/*` goes to the Worker; everything else is served from `public/`.

## Deploying

Cloudflare Workers Builds deploys automatically when `main` changes (`npx wrangler deploy`). The D1 database `researchette-db` is already created and bound as `DB`.

If you add steps to a programme in `curriculum.js`, update `TRACK_STEPS` in `worker/index.js` to match.

## How it works

**Welcome tour:** the first time anyone opens the portal, a short swipe-through tour explains how it works (students and mentors get different tours; it adapts to their permissions). It's remembered on the server, so it shows once per person, and anyone can replay it from the account menu → How Researchette works.

**Member portal**
- **Today:** the current step, split into Learn (plain-language intro, charts, step-by-step points, common mistakes), Example and Task (what to include, an optional template to start from, drafts save automatically).
- **Roadmap:** all 10 steps with their status: approved, in review, needs changes, to do or locked. A step unlocks when the one before it is approved.
- **Feedback:** every submission and the mentor's comments.
- **Chat:** message the mentors inside the portal. “Ask your mentor” on Today opens the chat with the current step attached. New replies appear within a few seconds, and the tab shows unread messages.

**Programmes:** members pick a programme from Today or Roadmap and can switch any time; progress in each is kept. Mentors can add or remove programmes for any member.

**Mentor portal**
- **Overview:** waiting reviews, active members, new applications and approvals this week.
- **Reviews:** the queue, oldest first. Submissions older than 48 hours are flagged. Open one, write feedback, then approve it (unlocking the next step) or request changes.
- **Members:** add a member (creates a login), search, filter to your own students, assign a mentor, choose programmes, reset or set a password, WhatsApp them, or remove them.
- **WhatsApp the student:** after you approve or send back a task, a ready-made message opens so you can tell the student on WhatsApp (you can edit it first). Reviewed tasks also have a “Notify on WhatsApp” button. When you change a member’s mentor or programmes, their page offers to send them an update.
- **Messages:** every member's chat, newest first, with unread counts. Any mentor can reply. Start a chat from a member's page (Chat). Mentors can still WhatsApp members; members use the chat.
- **Applications:** applications from the website. Mark payment as received, then approve to create a login. The temporary password and a ready-to-send welcome message are shown once.

## AI connector (MCP)

The website is also an MCP server, so a mentor can connect Claude, Gemini, ChatGPT or any app that supports custom MCP connectors, and manage Researchette by chatting.

- **Connector address:** `https://<your-site>/mcp` (shown in the portal under account menu → Connected apps).
- **Sign-in:** OAuth 2.1 with automatic app registration and PKCE. When you add the connector, the app opens a Researchette page: log in with a mentor account and tap Allow. Member accounts can't connect.
- **Tools (act as the mentor who approved):** overview, recent activity, programmes, mentors; applications (list, mark paid, approve, decline); review queue, submission, review; chats (list, read, reply); team and permissions (owners only: list, add, update, reset password, remove mentors; member access); members (list, view, add, remove, reset or set password, assign mentor, set programmes, set WhatsApp number).
- **Notifications:** connectors can't push messages, so ask your AI app to check `get_recent_activity` on a schedule (for example “every hour, tell me about new applications and submissions”). It returns `checkedAt` to pass as `since` next time.
- **Activity log:** everything members and mentors do, including actions through the connector, is recorded (details encrypted).
- **Security:** access tokens last 1 hour and refresh for up to 90 days (refresh tokens rotate). Disconnect an app in Connected apps; changing your password disconnects every app. Only connect apps you trust: they can see and change student data.

Code: `worker/connector.js`. Its tables are created automatically on first use.

## Editing lessons (owners)

Owners, and mentors with the **View lessons** or **Edit lessons** permission, open **Lessons** (Overview, or the account menu) to read any step exactly as students see it and edit its wording: title, short description, minutes, “In simple words”, the step-by-step points, common mistakes, the weak/strong example, task instructions, what to include and the template. Edits are saved in the database (`lesson_edits`) and layered over `public/assets/curriculum.js`, so students see them straight away and any step can be reset to the original. Charts and tables, and the order of steps, still come from `curriculum.js`.

## Results & publications (owners)

Owners open **Results & publications** from the portal Overview to add, edit or remove a student's paper: student name, research title, journal, and optionally the year, type and DOI or link (a bare DOI like `10.1234/abcd` becomes a doi.org link). Papers are saved in the database (`research`) and show on `research.html` straight away, newest year first; the landing page links there from the top bar and the bold band above Reviews. The connector has matching tools (`list_research`, `add_research`, `update_research`, `remove_research`).

## Owners, mentors and permissions

- **Owners** (Zain and Taimoor) see and do everything: every student, submission, chat and activity, including other mentors'. Only owners open **Team & permissions** (Overview, or the account menu), where they add, pause or remove mentors, reset mentors' passwords, make someone an owner, and switch each mentor's permissions on or off. There is always at least one owner.
- **Mentors** see only the students assigned to them. By default they can review their students' tasks, chat with them and edit their programmes and WhatsApp numbers. Owners can also let a mentor see all students, handle applications, add and remove students, reset students' passwords, or view or edit lessons, and can switch any of the defaults off.
- **Students**: owners can switch off a student's chat or their ability to choose their own programmes, or pause their account, from the student's page.
- **Chat routing:** a student's messages go to their assigned mentor. Students with no mentor go to the owners. Owners can read every conversation (Messages → Everyone).
- Only owners assign students to mentors. Removing a mentor leaves their students unassigned, so the owners pick them up.
- The AI connector acts with exactly the same access as the person who connected it.

## Accounts and security

- **Two-step verification for owners:** Zain and Taimoor enter a 6-digit code when they log in on a device that hasn't been verified in the last 30 days. The first login after this was added shows a QR code: scan it with the iPhone Camera and tap “Add Verification Code in Passwords” (any authenticator app works too), then enter the code. Eight one-time recovery codes are shown once, for a lost phone. Owners can reset each other's two-step verification from Team & permissions. Changing a password also forgets remembered devices. The AI connector's approval page asks owners for the code too. Code: `worker/totp.js` (RFC 6238) and the login routes in `worker/index.js`. The QR code is drawn by `public/assets/qrcode.js` (qrcode-generator, MIT).

- Mentor accounts live in the database. Mentors create member logins from the portal (approve an application, or Members → Add member).
- Passwords are hashed (PBKDF2-SHA256, 100,000 rounds) and never stored in plain text. Logins use a secure, HttpOnly session cookie that lasts 30 days.
- Anyone can change their own password from the account menu (tap your initials, top right). Mentors can reset or set a member's password from the member page.
- Phone numbers and application answers are encrypted in the database with AES-256-GCM. The key is the `DATA_KEY` secret (Cloudflare → Workers & Pages → researchette → Settings → Variables and Secrets → add a **Secret** named `DATA_KEY`). It is a random 32-byte value in base64; make one with `openssl rand -base64 32`. Without it the site still works but stores those fields as plain text; once it's added, existing plain values are encrypted on the next mentor visit. Keep a safe copy of the key: if it's lost or changed, encrypted phone numbers and answers can't be read.
- No API keys or secrets are kept in this repository. Secrets belong in Cloudflare (or in a local `.dev.vars` file, which git ignores).
- Every page is sent with security headers (`public/_headers`): a content security policy, HTTPS only, and no embedding in other sites.
