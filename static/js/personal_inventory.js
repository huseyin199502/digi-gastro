/* ═══════════════════════════════════════════════════════════════════════════
 * digi-gastro — Personal Planung & Lagerverwaltung Frontend Logic
 * ═══════════════════════════════════════════════════════════════════════════
 * Diese Datei kapselt alle Frontend-Functions für die neuen Module:
 * 1. Schichtplan: Wochenansicht, Schicht-Modal, Urlaubsanträge
 * 2. Lagerverwaltung: Dashboard, Artikel, Lieferanten, Buchungen, Inventur
 */

// ═══════════════════════════════════════════════════════════════════════════
// SCHICHTPLAN — GLOBAL STATE
// ═══════════════════════════════════════════════════════════════════════════

let schichtplanCurrentDate = new Date();
let schichtplanStaff = [];
let schichtplanShifts = [];
let schichtplanTimeOff = [];

const ROLE_COLORS = {
    'chef': { bg: '#dc2626', text: '#fff', label: 'Chef' },
    'kellner': { bg: '#2563eb', text: '#fff', label: 'Kellner' },
    'zubereiter': { bg: '#16a34a', text: '#fff', label: 'Küche' },
    'bar': { bg: '#d97706', text: '#fff', label: 'Bar' },
    'shisha': { bg: '#9333ea', text: '#fff', label: 'Shisha' },
};

function getRoleColor(role) {
    return ROLE_COLORS[role] || { bg: '#6b7280', text: '#fff', label: role };
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay() || 7; // 0=Sunday → 7
    if (day !== 1) d.setHours(-24 * (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
}

function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
}

function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDE(date) {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHICHTPLAN — LOAD
// ═══════════════════════════════════════════════════════════════════════════

function loadSchichtplan() {
    const weekStart = getWeekStart(schichtplanCurrentDate);
    const weekEnd = getWeekEnd(schichtplanCurrentDate);

    document.getElementById('schichtplan-week-label').textContent =
        `KW ${getWeekNumber(weekStart)} · ${formatDateDE(weekStart)} – ${formatDateDE(weekEnd)}`;

    // Lade Staff, Shifts, TimeOff parallel
    Promise.all([
        fetch('/admin/api/personal/staff').then(r => r.json()),
        fetch(`/admin/api/personal/shifts?start_date=${formatDateISO(weekStart)}&end_date=${formatDateISO(weekEnd)}`).then(r => r.json()),
        fetch('/admin/api/personal/time-off').then(r => r.json()),
    ]).then(([staffData, shiftsData, timeOffData]) => {
        schichtplanStaff = staffData.staff || [];
        schichtplanShifts = shiftsData.shifts || [];
        schichtplanTimeOff = timeOffData.requests || [];
        renderSchichtplanGrid();
        renderTimeOffList();
        loadShiftStats();
    }).catch(err => {
        console.error('Schichtplan load error:', err);
        showToast('Fehler beim Laden des Schichtplans');
    });
}

function prevWeek() {
    schichtplanCurrentDate.setDate(schichtplanCurrentDate.getDate() - 7);
    loadSchichtplan();
}

function nextWeek() {
    schichtplanCurrentDate.setDate(schichtplanCurrentDate.getDate() + 7);
    loadSchichtplan();
}

function todayWeek() {
    schichtplanCurrentDate = new Date();
    loadSchichtplan();
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHICHTPLAN — RENDER WEEK GRID
// ═══════════════════════════════════════════════════════════════════════════

function renderSchichtplanGrid() {
    const grid = document.getElementById('schichtplan-grid');
    const weekStart = getWeekStart(schichtplanCurrentDate);

    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    let html = `
        <table class="w-full text-xs border-collapse">
            <thead>
                <tr>
                    <th class="border border-gray-200 dark:border-zinc-700 p-2 text-left bg-gray-50 dark:bg-zinc-900" style="min-width:120px;">Mitarbeiter</th>
    `;

    for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        const isToday = formatDateISO(d) === formatDateISO(new Date());
        html += `
            <th class="border border-gray-200 dark:border-zinc-700 p-2 text-center bg-gray-50 dark:bg-zinc-900 ${isToday ? 'text-green-600' : ''}">
                <div class="font-bold">${days[i]}</div>
                <div class="text-[10px] text-zinc-500">${d.getDate()}.${d.getMonth() + 1}.</div>
            </th>
        `;
    }
    html += '</tr></thead><tbody>';

    if (schichtplanStaff.length === 0) {
        html += `
            <tr>
                <td colspan="8" class="border border-gray-200 dark:border-zinc-700 p-8 text-center text-zinc-500">
                    Keine Mitarbeiter angelegt. Bitte zuerst unter "Personal & Account" Mitarbeiter anlegen.
                </td>
            </tr>
        `;
    } else {
        for (const staff of schichtplanStaff) {
            if (!staff.active) continue;
            const roleColor = getRoleColor(staff.role);
            html += `
                <tr>
                    <td class="border border-gray-200 dark:border-zinc-700 p-2 bg-white dark:bg-zinc-800">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full" style="background:${roleColor.bg}"></div>
                            <div>
                                <div class="font-bold">${escapeHtml(staff.name)}</div>
                                <div class="text-[10px] text-zinc-500">${roleColor.label}</div>
                            </div>
                        </div>
                    </td>
            `;

            for (let i = 0; i < 7; i++) {
                const d = new Date(weekStart);
                d.setDate(d.getDate() + i);
                const dateStr = formatDateISO(d);
                const dayShifts = schichtplanShifts.filter(s => s.staff_id === staff.id && s.shift_date === dateStr);

                html += `<td class="border border-gray-200 dark:border-zinc-700 p-1 align-top" style="min-height:60px;">`;
                for (const shift of dayShifts) {
                    const c = getRoleColor(shift.role);
                    html += `
                        <div onclick="openShiftModal(${shift.id})" class="cursor-pointer rounded-lg p-1.5 mb-1 text-[10px]" style="background:${c.bg};color:${c.text}">
                            <div class="font-bold">${shift.start_time}–${shift.end_time}</div>
                            ${shift.position_label ? `<div class="opacity-80">${escapeHtml(shift.position_label)}</div>` : ''}
                            <div class="opacity-80">${shift.duration_hours || 0}h${shift.break_minutes > 0 ? ` (-${shift.break_minutes}min Pause)` : ''}</div>
                        </div>
                    `;
                }
                html += `<button onclick="openShiftModal(null, ${staff.id}, '${dateStr}')" class="text-[10px] text-zinc-400 hover:text-green-600 w-full text-center">+ Schicht</button>`;
                html += `</td>`;
            }
            html += '</tr>';
        }
    }

    html += '</tbody></table>';
    grid.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHICHTPLAN — SHIFT MODAL
// ═══════════════════════════════════════════════════════════════════════════

function openShiftModal(shiftId, presetStaffId, presetDate) {
    const shift = shiftId ? schichtplanShifts.find(s => s.id === shiftId) : null;

    const staffOptions = schichtplanStaff.filter(s => s.active).map(s =>
        `<option value="${s.id}" ${shift && shift.staff_id === s.id ? 'selected' : (!shift && presetStaffId === s.id ? 'selected' : '')}>${escapeHtml(s.name)} (${getRoleColor(s.role).label})</option>`
    ).join('');

    const roles = Object.keys(ROLE_COLORS).map(r =>
        `<option value="${r}" ${shift && shift.role === r ? 'selected' : ''}>${ROLE_COLORS[r].label}</option>`
    ).join('');

    const today = new Date().toISOString().split('T')[0];
    const defaultDate = shift ? shift.shift_date : (presetDate || today);
    const defaultStart = shift ? shift.start_time : '17:00';
    const defaultEnd = shift ? shift.end_time : '23:00';
    const defaultBreak = shift ? shift.break_minutes : 30;
    const presetStaff = presetStaffId ? schichtplanStaff.find(s => s.id === presetStaffId) : null;
    const defaultRate = shift ? shift.hourly_rate : (presetStaff ? presetStaff.hourly_rate : 0);

    const modalHtml = `
        <div id="shift-modal-overlay" class="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onclick="if(event.target.id==='shift-modal-overlay')closeShiftModal()">
            <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div class="p-5 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                    <h3 class="font-extrabold text-base">${shift ? 'Schicht bearbeiten' : 'Neue Schicht'}</h3>
                    <button onclick="closeShiftModal()" class="text-zinc-400 hover:text-zinc-600">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="p-5 space-y-3">
                    <div>
                        <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Mitarbeiter</label>
                        <select id="shift-staff" class="form-field text-sm w-full">${staffOptions}</select>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Rolle</label>
                        <select id="shift-role" class="form-field text-sm w-full">${roles}</select>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Datum</label>
                        <input type="date" id="shift-date" value="${defaultDate}" class="form-field text-sm w-full">
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Start</label>
                            <input type="time" id="shift-start" value="${defaultStart}" class="form-field text-sm w-full">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Ende</label>
                            <input type="time" id="shift-end" value="${defaultEnd}" class="form-field text-sm w-full">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Pause (Min)</label>
                            <input type="number" id="shift-break" value="${defaultBreak}" min="0" max="300" class="form-field text-sm w-full">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Stundenlohn (€)</label>
                            <input type="number" id="shift-rate" value="${defaultRate}" min="0" step="0.01" class="form-field text-sm w-full">
                        </div>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Position (optional)</label>
                        <input type="text" id="shift-position" value="${shift ? escapeHtml(shift.position_label || '') : ''}" placeholder="z.B. Theke, Außen, Grill" class="form-field text-sm w-full">
                    </div>
                    <div id="shift-warnings" class="hidden p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-xs text-amber-700 dark:text-amber-300"></div>
                </div>
                <div class="p-5 border-t border-gray-200 dark:border-zinc-700 flex gap-2">
                    ${shift ? `<button onclick="deleteShift(${shift.id})" class="btn-secondary text-xs px-3 py-2 text-red-600">Löschen</button>` : ''}
                    <button onclick="closeShiftModal()" class="btn-secondary text-xs px-3 py-2 flex-1">Abbrechen</button>
                    <button onclick="saveShift(${shiftId || 'null'})" class="btn-primary text-xs px-3 py-2 flex-1">Speichern</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeShiftModal() {
    const m = document.getElementById('shift-modal-overlay');
    if (m) m.remove();
}

function saveShift(shiftId) {
    const payload = {
        staff_id: parseInt(document.getElementById('shift-staff').value),
        role: document.getElementById('shift-role').value,
        shift_date: document.getElementById('shift-date').value,
        start_time: document.getElementById('shift-start').value,
        end_time: document.getElementById('shift-end').value,
        break_minutes: parseInt(document.getElementById('shift-break').value) || 0,
        hourly_rate: parseFloat(document.getElementById('shift-rate').value) || 0,
        position_label: document.getElementById('shift-position').value || null,
    };

    const method = shiftId ? 'PUT' : 'POST';
    const url = shiftId ? `/admin/api/personal/shifts/${shiftId}` : '/admin/api/personal/shifts';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(data => {
        if (data.warnings && data.warnings.length > 0) {
            const wDiv = document.getElementById('shift-warnings');
            wDiv.classList.remove('hidden');
            wDiv.innerHTML = data.warnings.join('<br>');
        } else {
            closeShiftModal();
            loadSchichtplan();
            showToast(shiftId ? 'Schicht aktualisiert' : 'Schicht erstellt');
        }
    }).catch(err => {
        console.error('Save shift error:', err);
        showToast('Fehler beim Speichern');
    });
}

function deleteShift(shiftId) {
    if (!confirm('Schicht wirklich löschen?')) return;
    fetch(`/admin/api/personal/shifts/${shiftId}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(() => {
            closeShiftModal();
            loadSchichtplan();
            showToast('Schicht gelöscht');
        })
        .catch(err => {
            console.error('Delete shift error:', err);
            showToast('Fehler beim Löschen');
        });
}

function publishWeekAPI() {
    const weekStart = getWeekStart(schichtplanCurrentDate);
    const weekEnd = getWeekEnd(schichtplanCurrentDate);

    fetch('/admin/api/personal/shifts/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            start_date: formatDateISO(weekStart),
            end_date: formatDateISO(weekEnd),
        }),
    }).then(r => r.json()).then(data => {
        showToast(`${data.published_count} Schichten veröffentlicht`);
        loadSchichtplan();
    }).catch(err => {
        console.error('Publish error:', err);
        showToast('Fehler beim Veröffentlichen');
    });
}

function loadShiftStats() {
    const weekStart = getWeekStart(schichtplanCurrentDate);
    const weekEnd = getWeekEnd(schichtplanCurrentDate);

    fetch(`/admin/api/personal/shifts/stats?start_date=${formatDateISO(weekStart)}&end_date=${formatDateISO(weekEnd)}`)
        .then(r => r.json()).then(data => {
            document.getElementById('schichtstat-count').textContent = data.shift_count || 0;
            document.getElementById('schichtstat-hours').textContent = `${data.total_hours || 0} h`;
            document.getElementById('schichtstat-cost').textContent = `${(data.total_cost || 0).toFixed(2)} €`;
        });

    const pendingCount = schichtplanTimeOff.filter(r => r.status === 'pending').length;
    document.getElementById('schichtstat-timeoff').textContent = `${pendingCount} offen`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHICHTPLAN — TIME OFF
// ═══════════════════════════════════════════════════════════════════════════

function renderTimeOffList() {
    const list = document.getElementById('timeoff-list');
    if (schichtplanTimeOff.length === 0) {
        list.innerHTML = '<div class="text-xs text-zinc-500 text-center py-4">Keine Urlaubsanträge</div>';
        return;
    }

    const typeLabels = { vacation: 'Urlaub', sick: 'Krankheit', personal: 'Privat', unpaid: 'Unbeahlt' };
    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-green-100 text-green-700',
        denied: 'bg-red-100 text-red-700',
    };

    list.innerHTML = schichtplanTimeOff.map(r => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700">
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-sm">${escapeHtml(r.staff_name || 'Unbekannt')}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${statusColors[r.status] || ''}">${r.status}</span>
                    <span class="text-[10px] text-zinc-500">${typeLabels[r.request_type] || r.request_type}</span>
                </div>
                <div class="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    ${r.start_date} bis ${r.end_date}
                    ${r.reason ? ` · ${escapeHtml(r.reason)}` : ''}
                </div>
            </div>
            ${r.status === 'pending' ? `
                <div class="flex gap-1">
                    <button onclick="approveTimeOff(${r.id})" class="btn-primary text-[10px] px-2 py-1 bg-green-600">✓ Genehmigen</button>
                    <button onclick="denyTimeOff(${r.id})" class="btn-secondary text-[10px] px-2 py-1 text-red-600">✕ Ablehnen</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function approveTimeOff(id) {
    fetch(`/admin/api/personal/time-off/${id}/approve`, { method: 'POST' })
        .then(r => r.json())
        .then(() => { loadSchichtplan(); showToast('Antrag genehmigt'); })
        .catch(() => showToast('Fehler'));
}

function denyTimeOff(id) {
    fetch(`/admin/api/personal/time-off/${id}/deny`, { method: 'POST' })
        .then(r => r.json())
        .then(() => { loadSchichtplan(); showToast('Antrag abgelehnt'); })
        .catch(() => showToast('Fehler'));
}

// ═══════════════════════════════════════════════════════════════════════════
// LAGERVERWALTUNG — LOAD DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function loadLagerDashboard() {
    Promise.all([
        fetch('/admin/api/lager/dashboard').then(r => r.json()),
        fetch('/admin/api/lager/items').then(r => r.json()),
        fetch('/admin/api/lager/suppliers').then(r => r.json()),
        fetch('/admin/api/lager/counts').then(r => r.json()),
    ]).then(([dashboard, items, suppliers, counts]) => {
        // Stats
        document.getElementById('lagerstat-items').textContent = dashboard.total_items || 0;
        document.getElementById('lagerstat-value').textContent = `${(dashboard.total_value || 0).toFixed(2)} €`;
        document.getElementById('lagerstat-lowstock').textContent = dashboard.low_stock_count || 0;
        document.getElementById('lagerstat-recent').textContent = (dashboard.recent_transactions || []).length;

        // Low Stock
        const lowStockSection = document.getElementById('lager-lowstock-section');
        const lowStockList = document.getElementById('lager-lowstock-list');
        if (dashboard.low_stock_items && dashboard.low_stock_items.length > 0) {
            lowStockSection.style.display = '';
            lowStockList.innerHTML = dashboard.low_stock_items.map(i => `
                <div class="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                        <span class="font-bold text-sm">${escapeHtml(i.name)}</span>
                        <span class="text-xs text-red-600 ml-2">Bestand: ${i.current_stock} ${i.base_unit} (Min: ${i.min_stock})</span>
                    </div>
                    <button onclick="quickReorder(${i.id}, '${escapeHtml(i.name)}')" class="btn-primary text-[10px] px-2 py-1">
                        Nachbestellen (${i.reorder_qty} ${i.base_unit})
                    </button>
                </div>
            `).join('');
        } else {
            lowStockSection.style.display = 'none';
        }

        // Stock Items Table
        renderStockItems(items.items || []);

        // Populate txn-stock-item select
        const txnSelect = document.getElementById('txn-stock-item');
        txnSelect.innerHTML = '<option value="">Artikel wählen...</option>' +
            (items.items || []).map(i => `<option value="${i.id}">${escapeHtml(i.name)} (${i.current_stock} ${i.base_unit})</option>`).join('');

        // Suppliers
        renderSuppliers(suppliers.suppliers || []);

        // Counts
        renderStockCounts(counts.counts || []);
    }).catch(err => {
        console.error('Lager load error:', err);
        showToast('Fehler beim Laden der Lagerverwaltung');
    });
}

function loadStockItems() {
    const search = document.getElementById('lager-search').value;
    const url = search ? `/admin/api/lager/items?search=${encodeURIComponent(search)}` : '/admin/api/lager/items';
    fetch(url).then(r => r.json()).then(data => renderStockItems(data.items || []));
}

function renderStockItems(items) {
    const tbody = document.getElementById('lager-items-tbody');
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-zinc-500 dark:text-zinc-400 p-4">Keine Artikel angelegt</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(i => {
        // Low stock only when min_stock > 0 AND current <= min
        const isLow = i.min_stock > 0 && i.current_stock <= i.min_stock;
        return `
            <tr class="border-t border-gray-100 dark:border-zinc-700 ${isLow ? 'bg-red-50 dark:bg-red-900/20' : ''}">
                <td class="p-2 font-bold text-zinc-900 dark:text-zinc-100">${escapeHtml(i.name)}</td>
                <td class="p-2 ${isLow ? 'text-red-600 dark:text-red-400 font-bold' : 'text-zinc-900 dark:text-zinc-100'}">${i.current_stock}</td>
                <td class="p-2 text-zinc-600 dark:text-zinc-400">${i.min_stock}</td>
                <td class="p-2 text-zinc-600 dark:text-zinc-400">${i.base_unit}</td>
                <td class="p-2 text-zinc-900 dark:text-zinc-100">${(i.avg_cost || 0).toFixed(2)} €</td>
                <td class="p-2 text-zinc-900 dark:text-zinc-100">${(i.stock_value || 0).toFixed(2)} €</td>
                <td class="p-2 text-right">
                    <button onclick="editStockItem(${i.id})" class="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold">Bearbeiten</button>
                    <button onclick="deleteStockItem(${i.id}, '${escapeHtml(i.name)}')" class="text-[10px] text-red-600 dark:text-red-400 hover:underline font-bold ml-1">Löschen</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderSuppliers(suppliers) {
    const list = document.getElementById('lager-suppliers-list');
    if (suppliers.length === 0) {
        list.innerHTML = '<div class="text-zinc-500 dark:text-zinc-400 text-center py-4">Keine Lieferanten angelegt</div>';
        return;
    }
    list.innerHTML = suppliers.map(s => `
        <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg">
            <div>
                <div class="font-bold text-zinc-900 dark:text-zinc-100">${escapeHtml(s.name)}</div>
                <div class="text-[10px] text-zinc-600 dark:text-zinc-400">
                    ${s.phone ? `📞 ${escapeHtml(s.phone)}` : ''}
                    ${s.lead_time_days ? ` · ⏱ ${s.lead_time_days}T Lieferzeit` : ''}
                </div>
            </div>
            <div class="flex gap-1">
                <button onclick="editSupplier(${s.id})" class="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold">Bearb.</button>
                <button onclick="deleteSupplier(${s.id}, '${escapeHtml(s.name)}')" class="text-[10px] text-red-600 dark:text-red-400 hover:underline font-bold">Lösch.</button>
            </div>
        </div>
    `).join('');
}

function renderStockCounts(counts) {
    const list = document.getElementById('lager-counts-list');
    if (counts.length === 0) {
        list.innerHTML = '<div class="text-zinc-500 dark:text-zinc-400 text-center py-4">Keine Inventuren</div>';
        return;
    }
    const statusColors = {
        open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        counting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    list.innerHTML = counts.map(c => `
        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700">
            <div>
                <div class="font-bold text-sm text-zinc-900 dark:text-zinc-100">${escapeHtml(c.name)}</div>
                <div class="text-[10px] text-zinc-600 dark:text-zinc-400">
                    ${c.count_date}
                    <span class="ml-2 px-2 py-0.5 rounded-full ${statusColors[c.status] || ''}">${c.status}</span>
                </div>
            </div>
            <button onclick="openCountDetail(${c.id})" class="btn-secondary text-[10px] px-2 py-1">Öffnen</button>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// LAGERVERWALTUNG — ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

function createStockTransaction() {
    const stockItemId = parseInt(document.getElementById('txn-stock-item').value);
    if (!stockItemId) { showToast('Bitte Artikel wählen'); return; }

    const payload = {
        stock_item_id: stockItemId,
        type: document.getElementById('txn-type').value,
        quantity: parseFloat(document.getElementById('txn-qty').value) || 0,
        unit_cost: parseFloat(document.getElementById('txn-cost').value) || 0,
        reason: document.getElementById('txn-reason').value || null,
    };

    if (payload.quantity === 0) { showToast('Menge darf nicht 0 sein'); return; }

    fetch('/admin/api/lager/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(data => {
        if (data.success) {
            showToast(`Buchung gespeichert. Neuer Bestand: ${data.new_stock}`);
            document.getElementById('txn-qty').value = '';
            document.getElementById('txn-cost').value = '';
            document.getElementById('txn-reason').value = '';
            loadLagerDashboard();
        } else {
            showToast('Fehler beim Speichern');
        }
    }).catch(() => showToast('Fehler'));
}

function openStockItemModal(itemId) {
    // Remove existing modal first
    closeStockItemModal();
    
    // If editing, fetch item data first
    if (itemId) {
        fetch('/admin/api/lager/items')
            .then(r => r.json())
            .then(data => {
                const item = (data.items || []).find(i => i.id === itemId);
                if (item) {
                    _showStockItemModal(item);
                } else {
                    showToast('Artikel nicht gefunden');
                }
            })
            .catch(() => showToast('Fehler beim Laden'));
    } else {
        _showStockItemModal(null);
    }
}

function _showStockItemModal(item) {
    const isEdit = !!item;
    const modalHtml = `
        <div id="stockitem-modal-overlay" class="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onclick="if(event.target.id==='stockitem-modal-overlay')closeStockItemModal()">
            <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div class="p-5 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                    <h3 class="font-extrabold text-base text-zinc-900 dark:text-zinc-100">${isEdit ? 'Artikel bearbeiten' : 'Neuer Lagerartikel'}</h3>
                    <button onclick="closeStockItemModal()" class="text-zinc-400 dark:text-zinc-500"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-5 space-y-3">
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Name *</label><input type="text" id="si-name" value="${item ? escapeHtml(item.name) : ''}" class="form-field text-sm w-full" placeholder="z.B. Cola 0,5L"></div>
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">SKU (optional)</label><input type="text" id="si-sku" value="${item ? escapeHtml(item.sku || '') : ''}" class="form-field text-sm w-full"></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Mindestbestand</label><input type="number" id="si-min" value="${item ? item.min_stock : 0}" step="0.001" class="form-field text-sm w-full"></div>
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Maximalbestand</label><input type="number" id="si-max" value="${item ? item.max_stock : 0}" step="0.001" class="form-field text-sm w-full"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Lagereinheit</label><input type="text" id="si-baseunit" value="${item ? escapeHtml(item.base_unit || 'Stk') : 'Stk'}" class="form-field text-sm w-full"></div>
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Bestelleinheit</label><input type="text" id="si-purchaseunit" value="${item ? escapeHtml(item.purchase_unit || 'Kasten') : 'Kasten'}" class="form-field text-sm w-full"></div>
                    </div>
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Faktor (Bestell→Lager)</label><input type="number" id="si-factor" value="${item ? item.purchase_to_base_factor : 24}" step="0.0001" class="form-field text-sm w-full" placeholder="z.B. 24 (1 Kasten = 24 Stk)"></div>
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nachbestellmenge</label><input type="number" id="si-reorder" value="${item ? item.reorder_qty : 0}" step="0.001" class="form-field text-sm w-full"></div>
                </div>
                <div class="p-5 border-t border-gray-200 dark:border-zinc-700 flex gap-2">
                    ${isEdit ? `<button onclick="deleteStockItem(${item.id}, '${escapeHtml(item.name)}')" class="btn-secondary text-xs px-3 py-2 text-red-600 dark:text-red-400">Löschen</button>` : ''}
                    <button onclick="closeStockItemModal()" class="btn-secondary text-xs px-3 py-2 flex-1">Abbrechen</button>
                    <button onclick="saveStockItem(${item ? item.id : 'null'})" class="btn-primary text-xs px-3 py-2 flex-1">Speichern</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeStockItemModal() {
    const m = document.getElementById('stockitem-modal-overlay');
    if (m) m.remove();
}

function saveStockItem(itemId) {
    const payload = {
        name: document.getElementById('si-name').value,
        sku: document.getElementById('si-sku').value || null,
        min_stock: parseFloat(document.getElementById('si-min').value) || 0,
        max_stock: parseFloat(document.getElementById('si-max').value) || 0,
        base_unit: document.getElementById('si-baseunit').value || 'Stk',
        purchase_unit: document.getElementById('si-purchaseunit').value || null,
        purchase_to_base_factor: parseFloat(document.getElementById('si-factor').value) || 1,
        reorder_qty: parseFloat(document.getElementById('si-reorder').value) || 0,
    };
    if (!payload.name) { showToast('Name erforderlich'); return; }

    const method = itemId ? 'PUT' : 'POST';
    const url = itemId ? `/admin/api/lager/items/${itemId}` : '/admin/api/lager/items';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(() => {
        closeStockItemModal();
        loadLagerDashboard();
        showToast(itemId ? 'Artikel aktualisiert' : 'Artikel erstellt');
    }).catch(() => showToast('Fehler'));
}

function editStockItem(id) {
    openStockItemModal(id);
}

function deleteStockItem(id, name) {
    if (!confirm(`Artikel "${name}" wirklich löschen? Alle Buchungen bleiben erhalten.`)) return;
    fetch(`/admin/api/lager/items/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(() => {
            closeStockItemModal();
            loadLagerDashboard();
            showToast('Artikel gelöscht');
        })
        .catch(() => showToast('Fehler beim Löschen'));
}

function openSupplierModal(supplierId) {
    closeSupplierModal();
    
    if (supplierId) {
        fetch('/admin/api/lager/suppliers')
            .then(r => r.json())
            .then(data => {
                const supplier = (data.suppliers || []).find(s => s.id === supplierId);
                if (supplier) {
                    _showSupplierModal(supplier);
                } else {
                    showToast('Lieferant nicht gefunden');
                }
            })
            .catch(() => showToast('Fehler beim Laden'));
    } else {
        _showSupplierModal(null);
    }
}

function _showSupplierModal(supplier) {
    const isEdit = !!supplier;
    const modalHtml = `
        <div id="supplier-modal-overlay" class="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onclick="if(event.target.id==='supplier-modal-overlay')closeSupplierModal()">
            <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-md w-full">
                <div class="p-5 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
                    <h3 class="font-extrabold text-base text-zinc-900 dark:text-zinc-100">${isEdit ? 'Lieferant bearbeiten' : 'Neuer Lieferant'}</h3>
                    <button onclick="closeSupplierModal()" class="text-zinc-400 dark:text-zinc-500"><span class="material-symbols-outlined">close</span></button>
                </div>
                <div class="p-5 space-y-3">
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Name *</label><input type="text" id="sup-name" value="${supplier ? escapeHtml(supplier.name) : ''}" class="form-field text-sm w-full" placeholder="z.B. Metro GmbH"></div>
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Ansprechpartner</label><input type="text" id="sup-contact" value="${supplier ? escapeHtml(supplier.contact_name || '') : ''}" class="form-field text-sm w-full"></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Telefon</label><input type="text" id="sup-phone" value="${supplier ? escapeHtml(supplier.phone || '') : ''}" class="form-field text-sm w-full"></div>
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Email</label><input type="email" id="sup-email" value="${supplier ? escapeHtml(supplier.email || '') : ''}" class="form-field text-sm w-full"></div>
                    </div>
                    <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Adresse</label><textarea id="sup-address" rows="2" class="form-field text-sm w-full">${supplier ? escapeHtml(supplier.address || '') : ''}</textarea></div>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Lieferzeit (Tage)</label><input type="number" id="sup-lead" value="${supplier ? supplier.lead_time_days : 2}" min="0" class="form-field text-sm w-full"></div>
                        <div><label class="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Mindestbestellwert (€)</label><input type="number" id="sup-minorder" value="${supplier ? supplier.min_order_value : 0}" step="0.01" class="form-field text-sm w-full"></div>
                    </div>
                </div>
                <div class="p-5 border-t border-gray-200 dark:border-zinc-700 flex gap-2">
                    ${isEdit ? `<button onclick="deleteSupplier(${supplier.id}, '${escapeHtml(supplier.name)}')" class="btn-secondary text-xs px-3 py-2 text-red-600 dark:text-red-400">Löschen</button>` : ''}
                    <button onclick="closeSupplierModal()" class="btn-secondary text-xs px-3 py-2 flex-1">Abbrechen</button>
                    <button onclick="saveSupplier(${supplier ? supplier.id : 'null'})" class="btn-primary text-xs px-3 py-2 flex-1">Speichern</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeSupplierModal() {
    const m = document.getElementById('supplier-modal-overlay');
    if (m) m.remove();
}

function saveSupplier(supplierId) {
    const payload = {
        name: document.getElementById('sup-name').value,
        contact_name: document.getElementById('sup-contact').value || null,
        phone: document.getElementById('sup-phone').value || null,
        email: document.getElementById('sup-email').value || null,
        address: document.getElementById('sup-address').value || null,
        lead_time_days: parseInt(document.getElementById('sup-lead').value) || 2,
        min_order_value: parseFloat(document.getElementById('sup-minorder').value) || 0,
    };
    if (!payload.name) { showToast('Name erforderlich'); return; }

    const method = supplierId ? 'PUT' : 'POST';
    const url = supplierId ? `/admin/api/lager/suppliers/${supplierId}` : '/admin/api/lager/suppliers';

    fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(r => r.json()).then(() => {
        closeSupplierModal();
        loadLagerDashboard();
        showToast(supplierId ? 'Lieferant aktualisiert' : 'Lieferant erstellt');
    }).catch(() => showToast('Fehler'));
}

function editSupplier(id) {
    openSupplierModal(id);
}

function deleteSupplier(id, name) {
    if (!confirm(`Lieferant "${name}" wirklich löschen?`)) return;
    fetch(`/admin/api/lager/suppliers/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(() => {
            closeSupplierModal();
            loadLagerDashboard();
            showToast('Lieferant gelöscht');
        })
        .catch(() => showToast('Fehler beim Löschen'));
}

function startInventoryCount() {
    if (!confirm('Neue Inventur starten? Alle aktuellen Bestände werden als "Erwartet" kopiert.')) return;

    fetch('/admin/api/lager/counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    }).then(r => r.json()).then(data => {
        showToast(`Inventur gestartet — ${data.item_count} Artikel`);
        loadLagerDashboard();
    }).catch(() => showToast('Fehler'));
}

function openCountDetail(countId) {
    // Vereinfacht: lädt Items und zeigt als modal
    fetch(`/admin/api/lager/counts/${countId}/items`).then(r => r.json()).then(data => {
        const items = data.items || [];
        const modalHtml = `
            <div id="count-modal-overlay" class="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onclick="if(event.target.id==='count-modal-overlay')closeCountDetail()">
                <div class="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-5 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-800 z-10">
                        <h3 class="font-extrabold text-base">Inventur: ${escapeHtml(data.count.name)}</h3>
                        <button onclick="closeCountDetail()" class="text-zinc-400"><span class="material-symbols-outlined">close</span></button>
                    </div>
                    <div class="p-5">
                        ${data.count.status === 'completed' ? '<div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs text-green-700 mb-3">✓ Inventur abgeschlossen</div>' : ''}
                        <table class="w-full text-xs">
                            <thead class="bg-gray-50 dark:bg-zinc-900 text-[10px] uppercase text-zinc-500">
                                <tr>
                                    <th class="text-left p-2">Artikel</th>
                                    <th class="text-right p-2">Erwartet</th>
                                    <th class="text-right p-2">Gezählt</th>
                                    <th class="text-right p-2">Differenz</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(i => `
                                    <tr class="border-t border-gray-100 dark:border-zinc-700">
                                        <td class="p-2">${escapeHtml(i.stock_item_name || '')}</td>
                                        <td class="p-2 text-right text-zinc-500">${i.expected_qty} ${i.base_unit || ''}</td>
                                        <td class="p-2 text-right">
                                            ${i.counted_qty !== null ? i.counted_qty : `<input type="number" step="0.001" placeholder="—" class="form-field text-xs w-20 text-right" onblur="updateCountItem(${data.count.id}, ${i.id}, this.value)">`}
                                        </td>
                                        <td class="p-2 text-right ${Math.abs(i.variance || 0) > 0.01 ? 'text-red-600 font-bold' : 'text-green-600'}">
                                            ${i.counted_qty !== null ? `${i.variance > 0 ? '+' : ''}${i.variance}` : '—'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${data.count.status !== 'completed' ? `
                            <button onclick="completeCount(${data.count.id})" class="btn-primary text-xs px-3 py-2 w-full mt-4">Inventur abschließen & Differenzen buchen</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    });
}

function closeCountDetail() {
    const m = document.getElementById('count-modal-overlay');
    if (m) m.remove();
}

function updateCountItem(countId, itemId, value) {
    if (!value) return;
    fetch(`/admin/api/lager/counts/${countId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counted_qty: parseFloat(value) }),
    }).then(r => r.json()).then(() => {
        // Modal aktualisieren
        closeCountDetail();
        openCountDetail(countId);
    });
}

function completeCount(countId) {
    if (!confirm('Inventur abschließen? Differenzen werden als Anpassungen gebucht.')) return;
    fetch(`/admin/api/lager/counts/${countId}/complete`, { method: 'POST' })
        .then(r => r.json()).then(data => {
            showToast(`Abgeschlossen — ${data.adjustments} Anpassungen gebucht`);
            closeCountDetail();
            loadLagerDashboard();
        }).catch(() => showToast('Fehler'));
}

function quickReorder(itemId, itemName) {
    showToast(`Nachbestellung für "${itemName}" — Bestellformular Bald verfügbar`);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST HELPER (falls nicht schon in admin.html)
// ═══════════════════════════════════════════════════════════════════════════

if (typeof showToast !== 'function') {
    window.showToast = function(msg) {
        let t = document.getElementById('pi-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'pi-toast';
            t.className = 'fixed bottom-4 right-4 z-[2000] bg-zinc-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg opacity-0 transition-opacity';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        clearTimeout(t._timeout);
        t._timeout = setTimeout(() => { t.style.opacity = '0'; }, 3000);
    };
}
