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

---
Task ID: 3
Agent: Main Agent
Task: Fix Produkt-Tab Redirect + Add Product Sorting (Drag & Drop)

Work Log:
- Diagnosed Issue 1: After creating/editing/saving a product, `window.location.reload()` was called but the page jumped to the default 'live' tab instead of staying on 'produkte'
- Fix: Added `sessionStorage.setItem('dl_admin_active_tab', 'produkte')` before every `window.location.reload()` in product-related functions (submitEditProduct, quickCreateProduct, deleteProduct, bulkToggleAvailability, bulkDeleteProducts)
- Converted toggle (availability switch) from form POST to fetch-based call (`toggleProductAvailability()`) — no more page navigation
- Converted delete from form POST to fetch-based call (`deleteProduct()`) with JSON Accept header
- Added new JS functions: `toggleProductAvailability()` and `deleteProduct()` with proper error handling and checkbox revert on failure
- Diagnosed Issue 2: Product sorting (drag & drop) infrastructure existed but was not wired up — no `.product-sortable-list` class on product containers, no `.drag-handle` elements, no `data-product-id` on sortable items
- Fix: Added `class="product-sortable-list"` to product table `<tbody>` and product card-view wrapper
- Added `data-product-id="{{ p.id }}"` to each `<tr>` and product card `<div>`
- Added drag handle column (drag_indicator icon) to both desktop table and mobile card views
- Added CSS for drag handle opacity transitions (subtle by default, visible on hover)
- Backend changes: `/admin/product-toggle/` now returns JSON `{"success": true, "is_available": ...}` instead of redirect. `/admin/produkt-loeschen/` returns JSON for fetch requests (checks Accept header)
- The SortableJS initialization (already present in code at window.load) now picks up `.product-sortable-list` elements automatically

Stage Summary:
- Produkte tab now persists after all product CRUD operations
- Toggle/delete converted from form-POST to fetch, no more full-page redirects
- Drag & drop sorting of products now functional (desktop table + mobile cards)
- Files changed: templates/admin.html, main.py
- Pushed to origin/main as commit 427976c
