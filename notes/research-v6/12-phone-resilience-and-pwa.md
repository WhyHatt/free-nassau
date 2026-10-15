# 12. Phone resilience: saves, storage, offline, safe areas

## Sources
- WebKit blog, "Full Third-Party Cookie Blocking and More" (John Wilander, Mar 24, 2020): https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- OpenPWA, eviction and best-effort storage (search result): https://openpwa.net/reference/storage/eviction/
- WebKit Bugzilla 232302 (storage deleted on a Home Screen web app using minimal-ui): https://bugs.webkit.org/show_bug.cgi?id=232302
- MDN, Progressive web apps: Caching; Service worker API; StorageManager.persist(): https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching , https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers , https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
- Can I use, navigator.vibrate: https://caniuse.com/mdn-api_navigator_vibrate
- Game Accessibility Guidelines (autosave; save settings; gameplay thumbnails with saves): https://gameaccessibilityguidelines.com/full-list/

## What they say
- WebKit (verbatim idea): Safari deletes all of a website's script-writable storage (IndexedDB, LocalStorage, SessionStorage, service worker registrations and caches) "after seven days of Safari use without user interaction on the site". Web apps added to the Home Screen "have their own counter of days of use... We do not expect the first-party in such a web application to have its website data deleted." One bug report shows deletion with display:minimal-ui, so use display "standalone".
- MDN: precache essential assets in the service worker's install event, serve cache-first with network fallback; call navigator.storage.persist() from the page to ask the browser not to evict storage under pressure (users can still clear it).
- navigator.vibrate is not available in iOS Safari.

## Takeaways for Free Nassau
1. Add manifest.webmanifest (display standalone, theme and background colours, icons incl. maskable) and sw.js precaching the code and art used in play; cache-first with versioned cache name; an "Update ready" toast.
2. Ask for persistent storage after the first win or run; show a "Add to Home Screen to keep your Nassau safe" tip on iOS when not standalone.
3. Save-code export/import of meta + run (base64 text) and a one-tap "Copy save" so Ren can back up.
4. Autosave at every beat (already), plus on visibilitychange/pagehide; a "Resume voyage" card on the title shows act, row, ship, and time away (gameplay thumbnail).
5. Self-host the fonts (IM Fell English, Pirata One) with font-display swap, so offline works. Keep safe-area insets.
6. Interruptions: pause music and FX loops on hidden; don't advance animations while hidden.
