---
Task ID: 1
Agent: Main Agent
Task: Fix real-time cancellation + auto-close popup + Happy Hour time range

Work Log:
- Fixed `updateLiveTiles()` in admin.html: Orders that disappear from the live API (meaning they were cancelled/paid elsewhere) are now marked as 'bezahlt' in `allOrders` instead of staying with their old status
- Fixed `stornieren()`: Immediately sets order status to 'storniert' in local `allOrders` before API refresh, and auto-closes control modal if no active orders remain
- Fixed `bezahlenAlles()`: Immediately sets order status to 'bezahlt' in local `allOrders`, and auto-closes control modal if no active orders remain
- Fixed `bezahlenTeilrechnung()`: Auto-closes control modal if the last active order for the table was paid
- Fixed `submitControlSplitPayment()`: Auto-closes control modal if no more active orders remain after split payment
- Fixed `refreshControlModal()`: Auto-closes control modal when no active orders remain for the table (handles all cases)
- Added per-product time range (Uhrzeit) fields to Happy Hour admin UI: Start/End time inputs for each product
- Updated `toggleHHProductRow()` to show/hide the new time fields
- Updated `saveAllHHProducts()` to collect and send per-product start_time/end_time
- Updated backend `update_happy_hour_products()` in main.py to use per-product time ranges (falls back to global if not set per product)
- Updated Happy Hour description text to mention the new per-product time range feature

Stage Summary:
- Cancellation and payment now update tiles in real-time without manual page refresh
- Control modal auto-closes when all orders for a table are paid/cancelled
- Happy Hour now supports per-product time ranges (e.g. Cola Mo-So 17:00-18:00, Shisha Mo-So 20:00-22:00)
- All changes in: admin.html (frontend), main.py (backend)

---
Task ID: 2
Agent: Main Agent
Task: Fix admin panel broken - nothing clickable, tables not showing after Events System commit

Work Log:
- Diagnosed the root cause: duplicate `let allEvents = [];` declaration at line 6675, while `allEvents` was already declared at line 3462 with Jinja2 server data `{{ events_json | safe }}`
- In JavaScript, `let` does not allow redeclaration in the same scope — this caused a `SyntaxError` during script parsing that prevented the ENTIRE `<script>` block from executing
- This meant NO functions were defined (switchAdminTab, renderSitzplanTiles, openControlModal, etc.), explaining why nothing was clickable and no tables were displayed
- Removed the duplicate `let allEvents = [];` declaration (line 6675), keeping only the Jinja2-initialized one at line 3462
- Cleaned up the redundant DOMContentLoaded handler that tried to load events from non-existent DOM elements (`events-data-json`, `products-data-json`) — simplified it to just call `renderEventsList()`
- Verified the fix with Node.js `--check` syntax validation — no errors
- Synced the fixed file to `/tmp/my-project/templates/admin.html` for the running container

Stage Summary:
- Root cause: `let allEvents` declared twice in the same scope → SyntaxError → entire page broken
- Fix: Removed duplicate declaration, kept only the Jinja2-initialized one
- Also simplified redundant DOMContentLoaded handler
- File changed: templates/admin.html
