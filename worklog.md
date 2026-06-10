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
