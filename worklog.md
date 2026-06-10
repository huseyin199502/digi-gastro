# Worklog: digi-gastro Konfiguration Tab Restructure

## Date: 2026-03-05

## Summary
Restructured the Konfiguration tab in admin.html with accordion-style collapsible sections, added dynamic custom sections with +/- buttons to the Landingpage Editor, removed annoying icons from menu.html landing page headers, made offer images full width, rendered custom sections in menu.html, and updated the backend (main.py) for custom_sections support.

## Changes Made

### 1. admin.html - Accordion Restructure (Lines 977-1371)
- Replaced the flat grid layout (`grid-cols-2`) with vertical accordion sections
- **Section 1: Restaurant Profil** - Contains branding form (logo, address, socials, theme)
- **Section 2: Einstellungen** - New section extracted from Profil: Shisha-Bar toggle, Kartenzahlung toggle
- **Section 3: Happy Hour** - Happy Hour config with days, times, discount
- **Section 4: Landingpage bearbeiten** - DEFAULT OPEN, contains all landing page editor fields
- **Section 5: QR-Codes** - QR code print link
- **Section 6: Tische verwalten** - Table creator form
- Each accordion has a clickable header with chevron icon that rotates on open/close
- Only Section 4 (Landingpage) is open by default; rest are closed

### 2. admin.html - Dynamic Custom Sections (Lines 1266-1307, JS Lines 4561-4611)
- Added "Eigene Sektionen" area below existing landing page fields
- Each custom section has: Titel input, Inhalt textarea, Bild hochladen file input, and red ✕ remove button
- Green "+" button ("Sektion hinzufügen") adds new section blocks dynamically
- Red remove button deletes section from DOM
- `collectCustomSections()` serializes all sections into JSON hidden input before form submission
- Tracks `_has_new_image` flag per section for backend image matching
- Existing custom sections from DB are pre-rendered with Jinja2 template loop
- File inputs use `name="custom_section_images"` for batch upload

### 3. admin.html - Removed Icons from Section Headers (Lines 1192, 1213, 1246)
- Removed `<span class="material-symbols-outlined">local_offer</span>` from Angebotsfotos header
- Removed `<span class="material-symbols-outlined">slideshow</span>` from Diashow header
- Removed `<span class="material-symbols-outlined">collections</span>` from Bildergalerie header

### 4. menu.html - Removed Icons from Landing Page Section Headers (Lines 259-361)
- Removed icon spans from: Angebotsfotos, Galerie, Öffnungszeiten, Angebote & Specials, Was wir bieten, Aktuelles & Events
- Changed headers from `flex items-center gap-2` to simple text display

### 5. menu.html - Offer Images Full Width (Lines 264-270)
- Removed `aspect-[16/9]` from slider container (no more fixed aspect ratio cropping)
- Removed `h-full` from slider div and slide items
- Changed `object-cover` to `object-contain` on offer images so they display fully without cropping

### 6. menu.html - Custom Sections Rendering (Lines 363-374)
- Added Alpine.js template that loops through `restaurantLandingPage.custom_sections`
- Each section renders with: title (h3), optional full-width image (object-contain), and text content
- Sections only show when they have content or an image

### 7. main.py - Backend Custom Sections Support (Lines 4587-4746)
- Added `custom_sections_json: Optional[str] = Form(None)` parameter
- Added `custom_section_images: List[UploadFile] = File(None)` parameter
- Added `import json as json_module` for JSON parsing
- Parses custom_sections_json into a list of dicts with title, content, image fields
- Matches uploaded images to sections using `_has_new_image` flag for correct association
- Custom section images saved to `/uploads/landing/` with `{slug}_csec_` prefix
- Cleans up custom sections structure before saving (removes internal flags)
- Stores `custom_sections` array in landing_page JSON

## Technical Notes
- Accordion uses simple `hidden` class toggle with `rotate-180` on chevron for visual feedback
- Custom sections JavaScript is pure vanilla JS (no framework dependency)
- Backend image matching uses `_has_new_image` flag in JSON to correctly associate uploaded files with their corresponding sections
- The `collectCustomSections()` function runs on form submit to serialize dynamic data

---
Task ID: 1
Agent: Main Agent
Task: WebSocket Authentication, Race Condition Fix, Admin Dashboard Redesign

Work Log:
- Added `import asyncio` to main.py
- Created `_validate_ws_cookies()` function that checks 5 types of session cookies (admin session, legacy session, POS token, KDS session, guest session)
- Modified `websocket_endpoint` to accept+close with 4401 code for unauthorized connections
- Created `_tenant_locks` dict and `_get_tenant_lock()` function for per-tenant async locking
- Created `tenant_lock` decorator that acquires the per-tenant asyncio.Lock for endpoints
- Applied `@tenant_lock` to 19 critical read-modify-write endpoints (create_order, service_ruf, bezahlen, teilzahlung, merge_tables, stornieren, service_erledigt, pay_item, pay_items_bulk, transfer_item, cancel_item, cancel_items_bulk, transfer_order, set_item_status, api_call_service, serve_order_items, admin_split_pay, admin_transfer, add_manual_order_item)
- Updated menu.html guest WebSocket `onclose` handler to stop reconnecting on 4401 code
- Updated admin.html WebSocket `onclose` handler to redirect to login on 4401 code
- Redesigned admin dashboard with professional styling:
  - Added ~500 lines of new CSS (stat-card, section-card, form-field, btn-primary, cat-chip, staff-avatar, etc.)
  - Redesigned sidebar with nav group labels, gradient active states, hover effects
  - Redesigned header with sticky positioning, backdrop blur, custom live-badge
  - Redesigned finance tab with stat cards (icons, values, sub-text), enhanced table
  - Redesigned menu tab with section-card pattern, cleaner category chips, form-field system
  - Redesigned personal tab with staff avatars, section-card pattern
  - Redesigned configuration sub-tabs with Material Icons, gradient active states
  - Preserved Sitzplan tab and table tiles as-is (per user request)
  - Preserved all modal popups and JavaScript logic as-is

Stage Summary:
- WebSocket Authentication: ✅ IMPLEMENTED - unauthorized connections rejected with 4401 code
- Race Condition Protection: ✅ IMPLEMENTED - per-tenant async locks on 19 critical endpoints
- Admin Dashboard Redesign: ✅ IMPLEMENTED - professional styling across all tabs except Sitzplan
- Cookie flags: ✅ Previously fixed (httponly, samesite, secure)
- All 3 original security issues now fixed
