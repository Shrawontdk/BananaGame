# Banana GP

Angular 20 standalone, zoneless, SSR-enabled math racing game. Bootstrap 5 and Firebase email/password authentication remain in place.

## Run locally

`npm install`, then `npm start`. The existing dev proxy sends `/api/api.php` to the Banana API. Solve a challenge for +10 points; a wrong answer costs 5 points, with a floor of zero. Each puzzle accepts one submission. Sign out preserves points; only Reset score clears them. Best score, lifetime attempt counts, and collapsible challenge history survive a score reset.

## Firebase setup

Deploy the checked-in `firestore.rules` to your existing Firebase project before using live timing. The included `firebase.json` references these rules. For example, with Firebase CLI configured: `firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`. No rules have been deployed by this change.

- `scores/{uid}` remains owner-only, including email and history.
- `leaderboard/{uid}` is readable by authenticated users and contains only `displayName`, `score`, `highScore`, and `updatedAt`. Writes are owner-only and must match the private score in the same transaction. Display names use the email prefix; emails are never copied into the public collection.
- Login transactionally upserts the user's entry, preserving saved points and existing tie priority. Existing users appear when they next sign in; the browser cannot enumerate other users' private scores to migrate them.
- Scoring transactions update both documents atomically and retry concurrent updates. As in the original app, puzzle validation is client-side; these rules enforce privacy and document consistency, not server-side anti-cheat.

## Race behavior and query limits

The browser listens to `leaderboard` ordered by score descending, limited to 20. It also listens to the signed-in driver's public document so their car remains visible outside the field. Listeners and the count timer stop on logout or service destruction; SSR starts neither.

The displayed field is sorted client-side by score, earlier `updatedAt`, then uid. Five full-size cars lead fifteen smaller back markers. Geometry follows rank, not score distance. Stable uid keys preserve DOM elements during overtakes; transforms animate between slots. Reduced-motion preferences suppress transitions and boost effects. A focusable horizontal scroller supports narrow screens, and a visually hidden ordered list provides the race order.

The overflow chip uses a count aggregation, refreshed on field snapshots and every 30 seconds. Exact positions outside the top 20 are unavailable with the requested limited query, so that driver's highlighted car is labeled ?outside the displayed top 20?. When a score tie crosses the query boundary, Firestore selects the 20 documents first and the client breaks ties within that returned field; no composite index is required. Resolving global ties at that boundary requires a different query/index strategy.

The Banana API integration still uses the development proxy. A production host must route `/api` to the same Banana endpoint; the existing Express SSR server does not provide that proxy.

## Validation

- `npx ng build` ? production browser/server bundles and prerendering.
- `npx ng test --watch=false --browsers=ChromeHeadless` ? ranking, ties, back-pack/current-user positions, overtakes preserving car elements, narrow-screen scrolling, one answer per puzzle, score floors, failed writes, logout persistence, SSR guards, login, and API integration.

Live multi-account Firebase behavior and deployed rules need verification against your Firebase environment. Tests use mocks and do not create accounts or mutate live data.
