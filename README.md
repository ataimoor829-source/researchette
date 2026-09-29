# Researchette

Medical research mentorship: daily tasks, step-by-step lessons and mentor feedback, from research question to journal submission.

## What's here

- `public/`: the website Cloudflare serves.
  - `index.html`: the landing page. The membership form sends applications straight to the mentor portal.
  - `mentors.html`: each mentor's details and message, opened from “Read message” on the landing page.
  - `privacy.html`, `terms.html`: privacy policy and terms and conditions, linked from every footer and the portal login.
  - `reviews.html`: student reviews. Add real reviews to the `REVIEWS` list at the bottom of the file.
  - `portal.html`: login, member portal and mentor portal.
  - `assets/curriculum.js`: the programmes and all lesson content. Edit this to change the course.
  - `assets/store.js`: talks to the API. `assets/portal.js`, `portal.css`: portal screens.
  - `assets/liquid.css`, `assets/fx.js`: shared glass look and pointer effects.
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

**Member portal**
- **Today:** the current step, split into Learn (plain-language intro, charts, step-by-step points, common mistakes), Example and Task (what to include, an optional template to start from, drafts save automatically).
- **Roadmap:** all 10 steps with their status: approved, in review, needs changes, to do or locked. A step unlocks when the one before it is approved.
- **Feedback:** every submission and the mentor's comments.

**Programmes:** members pick a programme from Today or Roadmap and can switch any time; progress in each is kept. Mentors can add or remove programmes for any member.

**Mentor portal**
- **Overview:** waiting reviews, active members, new applications and approvals this week.
- **Reviews:** the queue, oldest first. Submissions older than 48 hours are flagged. Open one, write feedback, then approve it (unlocking the next step) or request changes.
- **Members:** add a member (creates a login), search, filter to your own students, assign a mentor, choose programmes, reset or set a password, WhatsApp them, or remove them.
- **WhatsApp the student:** after you approve or send back a task, a ready-made message opens so you can tell the student on WhatsApp (you can edit it first). Reviewed tasks also have a “Notify on WhatsApp” button. When you change a member’s mentor or programmes, their page offers to send them an update.
- **Applications:** applications from the website. Mark payment as received, then approve to create a login. The temporary password and a ready-to-send welcome message are shown once.

## AI connector (MCP)

The website is also an MCP server, so a mentor can connect Claude, Gemini, ChatGPT or any app that supports custom MCP connectors, and manage Researchette by chatting.

- **Connector address:** `https://<your-site>/mcp` (shown in the portal under account menu → Connected apps).
- **Sign-in:** OAuth 2.1 with automatic app registration and PKCE. When you add the connector, the app opens a Researchette page: log in with a mentor account and tap Allow. Member accounts can't connect.
- **Tools (act as the mentor who approved):** overview, recent activity, programmes, mentors; applications (list, mark paid, approve, decline); review queue, submission, review; members (list, view, add, remove, reset or set password, assign mentor, set programmes, set WhatsApp number).
- **Notifications:** connectors can't push messages, so ask your AI app to check `get_recent_activity` on a schedule (for example “every hour, tell me about new applications and submissions”). It returns `checkedAt` to pass as `since` next time.
- **Activity log:** everything members and mentors do, including actions through the connector, is recorded (details encrypted).
- **Security:** access tokens last 1 hour and refresh for up to 90 days (refresh tokens rotate). Disconnect an app in Connected apps; changing your password disconnects every app. Only connect apps you trust: they can see and change student data.

Code: `worker/connector.js`. Its tables are created automatically on first use.

## Accounts and security

- Mentor accounts live in the database. Mentors create member logins from the portal (approve an application, or Members → Add member).
- Passwords are hashed (PBKDF2-SHA256, 100,000 rounds) and never stored in plain text. Logins use a secure, HttpOnly session cookie that lasts 30 days.
- Anyone can change their own password from the account menu (tap your initials, top right). Mentors can reset or set a member's password from the member page.
- Phone numbers and application answers are encrypted in the database with AES-256-GCM. The key is the `DATA_KEY` secret (Cloudflare → Workers & Pages → researchette → Settings → Variables and Secrets → add a **Secret** named `DATA_KEY`). It is a random 32-byte value in base64; make one with `openssl rand -base64 32`. Without it the site still works but stores those fields as plain text; once it's added, existing plain values are encrypted on the next mentor visit. Keep a safe copy of the key: if it's lost or changed, encrypted phone numbers and answers can't be read.
- No API keys or secrets are kept in this repository. Secrets belong in Cloudflare (or in a local `.dev.vars` file, which git ignores).
- Every page is sent with security headers (`public/_headers`): a content security policy, HTTPS only, and no embedding in other sites.
