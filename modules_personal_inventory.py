"""
digi-gastro — Module: Personal Planung (Schichtplanung) & Lagerverwaltung
Backend API Endpoints für FastAPI.

Dieses Modul kapselt alle Endpoints für:
1. Personal Planung: Schichten, Vorlagen, Urlaubsanträge, Verfügbarkeit, Tausch
2. Lagerverwaltung: Warenartikel, Lieferanten, Bestellungen, Inventur, Rezepte

Importiert in main.py via: from modules_personal_inventory import register_routes
"""
from fastapi import APIRouter, Request, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json

# Importe aus main.py
from database import (
    Shift, ShiftTemplate, TimeOffRequest, StaffAvailability, ShiftSwap,
    UnitOfMeasure, StockCategory, Supplier, StockItem, PurchaseOrder,
    PurchaseOrderItem, StockTransaction, StockCount, StockCountItem, Recipe,
    Staff, Product,
)


def register_routes(app, get_db, require_chef_user_flat):
    """Registriert alle Routen für Personal Planung & Lagerverwaltung."""

    # ═══════════════════════════════════════════════════════════════════════
    # PYDANTIC MODELS
    # ═══════════════════════════════════════════════════════════════════════

    class ShiftCreate(BaseModel):
        staff_id: int
        role: str
        shift_date: str  # ISO date string
        start_time: str  # HH:MM
        end_time: str  # HH:MM
        break_minutes: int = 0
        hourly_rate: float = 0
        position_label: Optional[str] = None
        notes: Optional[str] = None

    class ShiftUpdate(BaseModel):
        staff_id: Optional[int] = None
        role: Optional[str] = None
        shift_date: Optional[str] = None
        start_time: Optional[str] = None
        end_time: Optional[str] = None
        break_minutes: Optional[int] = None
        hourly_rate: Optional[float] = None
        position_label: Optional[str] = None
        notes: Optional[str] = None
        status: Optional[str] = None

    class StaffUpdate(BaseModel):
        name: Optional[str] = None
        role: Optional[str] = None
        email: Optional[str] = None
        phone: Optional[str] = None
        hourly_rate: Optional[float] = None
        weekly_target_hours: Optional[float] = None
        contract_type: Optional[str] = None
        active: Optional[bool] = None
        color: Optional[str] = None

    class StockItemCreate(BaseModel):
        name: str
        sku: Optional[str] = None
        category_id: Optional[int] = None
        supplier_id: Optional[int] = None
        current_stock: float = 0  # NEU: Initialer Bestand beim Anlegen
        min_stock: float = 0
        max_stock: float = 0
        reorder_qty: float = 0
        base_unit: str = "Stk"
        purchase_unit: Optional[str] = None
        purchase_to_base_factor: float = 1
        cost_per_unit: float = 0  # NEU: Einstandspreis beim Anlegen
        product_id: Optional[int] = None
        notes: Optional[str] = None

    class StockItemUpdate(BaseModel):
        name: Optional[str] = None
        sku: Optional[str] = None
        category_id: Optional[int] = None
        supplier_id: Optional[int] = None
        min_stock: Optional[float] = None
        max_stock: Optional[float] = None
        reorder_qty: Optional[float] = None
        base_unit: Optional[str] = None
        purchase_unit: Optional[str] = None
        purchase_to_base_factor: Optional[float] = None
        product_id: Optional[int] = None
        notes: Optional[str] = None
        active: Optional[bool] = None

    class StockTransactionCreate(BaseModel):
        stock_item_id: int
        type: str  # 'in'|'out'|'adjust'|'waste'
        quantity: float  # signed
        unit_cost: float = 0
        reason: Optional[str] = None
        notes: Optional[str] = None

    class SupplierCreate(BaseModel):
        name: str
        contact_name: Optional[str] = None
        phone: Optional[str] = None
        email: Optional[str] = None
        address: Optional[str] = None
        lead_time_days: int = 2
        min_order_value: float = 0
        notes: Optional[str] = None

    class StockCategoryCreate(BaseModel):
        name: str
        color: str = "#374151"

    class RecipeCreate(BaseModel):
        product_id: int
        stock_item_id: int
        quantity: float
        unit: str
        notes: Optional[str] = None

    class TimeOffRequestCreate(BaseModel):
        staff_id: int
        start_date: str
        end_date: str
        request_type: str = "vacation"
        reason: Optional[str] = None

    # ═══════════════════════════════════════════════════════════════════════
    # HELPER
    # ═══════════════════════════════════════════════════════════════════════

    def _parse_date(s: str) -> date:
        try:
            return datetime.strptime(s, "%Y-%m-%d").date()
        except Exception:
            return date.today()

    def _parse_time(s: str) -> time:
        try:
            return datetime.strptime(s, "%H:%M").time()
        except Exception:
            return time(0, 0)

    def _shift_to_dict(shift: Shift, staff_name: str = None) -> dict:
        """Konvertiert Shift-Objekt in Dict für JSON-Response."""
        d = {
            "id": shift.id,
            "staff_id": shift.staff_id,
            "staff_name": staff_name,
            "role": shift.role,
            "shift_date": shift.shift_date.isoformat() if shift.shift_date else None,
            "start_time": shift.start_time.strftime("%H:%M") if shift.start_time else None,
            "end_time": shift.end_time.strftime("%H:%M") if shift.end_time else None,
            "break_minutes": shift.break_minutes or 0,
            "hourly_rate": float(shift.hourly_rate or 0),
            "status": shift.status,
            "position_label": shift.position_label,
            "notes": shift.notes,
        }
        # Berechne Duration (inkl. overnight)
        if shift.start_time and shift.end_time:
            start_dt = datetime.combine(date.today(), shift.start_time)
            end_dt = datetime.combine(date.today(), shift.end_time)
            if end_dt <= start_dt:
                end_dt += timedelta(days=1)  # overnight
            total_minutes = int((end_dt - start_dt).total_seconds() / 60)
            worked_minutes = total_minutes - (shift.break_minutes or 0)
            d["duration_hours"] = round(worked_minutes / 60, 2)
            d["labor_cost"] = round(worked_minutes / 60 * float(shift.hourly_rate or 0), 2)
        return d

    def _validate_arbzg(db: Session, tenant_slug: str, staff_id: int,
                        shift_date: date, start_t: time, end_t: time, break_min: int,
                        exclude_shift_id: int = None) -> list:
        """Prüft Arbeitszeitgesetz-Compliance und gibt Warnungen zurück."""
        warnings = []
        try:
            # 1. Tagesarbeitszeit (§3): max 10h
            start_dt = datetime.combine(shift_date, start_t)
            end_dt = datetime.combine(shift_date, end_t)
            if end_dt <= start_dt:
                end_dt += timedelta(days=1)
            shift_duration = (end_dt - start_dt).total_seconds() / 3600 - break_min / 60

            if shift_duration > 10:
                warnings.append(f"⚠ §3 ArbZG: Schicht dauert {shift_duration:.1f}h (max 10h/Tag erlaubt)")
            elif shift_duration > 8:
                warnings.append(f"⚠ §3 ArbZG: Schicht dauert {shift_duration:.1f}h (über 8h, nur ausnahmsweise erlaubt)")

            # 2. Ruhezeit (§5): 11h zwischen Schichten
            # Prüfe vorherige Schicht
            prev_day = shift_date - timedelta(days=1)
            query = db.query(Shift).filter(
                Shift.tenant_slug == tenant_slug,
                Shift.staff_id == staff_id,
                Shift.shift_date.in_([prev_day, shift_date]),
                Shift.status != 'cancelled',
            )
            if exclude_shift_id:
                query = query.filter(Shift.id != exclude_shift_id)

            for other in query.all():
                other_start = datetime.combine(other.shift_date, other.start_time)
                other_end = datetime.combine(other.shift_date, other.end_time)
                if other_end <= other_start:
                    other_end += timedelta(days=1)

                # Wenn andere Schicht am Vortag endet
                if other.shift_date == prev_day:
                    gap = (start_dt - other_end).total_seconds() / 3600
                    if 0 < gap < 11:
                        warnings.append(f"⚠ §5 ArbZG: Nur {gap:.1f}h Ruhe seit letzter Schicht (min 11h erforderlich)")

                # Wenn andere Schicht am selben Tag
                if other.shift_date == shift_date:
                    # Prüfe Überschneidung
                    if not (end_dt <= other_start or start_dt >= other_end):
                        warnings.append("⚠ Überlappung mit bestehender Schicht am selben Tag")

            # 3. Pausen (§4): >6h = 30min, >9h = 45min
            total_duration = (end_dt - start_dt).total_seconds() / 3600
            if total_duration > 9 and break_min < 45:
                warnings.append(f"⚠ §4 ArbZG: Bei {total_duration:.1f}h Arbeitszeit sind 45min Pause erforderlich (aktuell {break_min}min)")
            elif total_duration > 6 and break_min < 30:
                warnings.append(f"⚠ §4 ArbZG: Bei {total_duration:.1f}h Arbeitszeit sind 30min Pause erforderlich (aktuell {break_min}min)")

        except Exception as e:
            print(f"[ArbZG] Validation error: {e}")
        return warnings

    # ═══════════════════════════════════════════════════════════════════════
    # PERSONAL PLANUNG — STAFF
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/personal/staff")
    def get_staff_list(chef_data: tuple = Depends(require_chef_user_flat),
                       db: Session = Depends(get_db)):
        """Liste aller Mitarbeiter eines Tenants."""
        user, slug, restaurant = chef_data
        staff_list = db.query(Staff).filter_by(tenant_slug=slug).order_by(Staff.name).all()
        return {
            "staff": [
                {
                    "id": s.id,
                    "name": s.name,
                    "role": s.role,
                    "email": s.email,
                    "phone": s.phone,
                    "hourly_rate": float(s.hourly_rate or 0),
                    "weekly_target_hours": float(s.weekly_target_hours or 0),
                    "contract_type": s.contract_type,
                    "active": s.active,
                    "color": s.color,
                }
                for s in staff_list
            ]
        }

    @app.put("/admin/api/personal/staff/{staff_id}")
    def update_staff(staff_id: int, payload: StaffUpdate,
                     chef_data: tuple = Depends(require_chef_user_flat),
                     db: Session = Depends(get_db)):
        """Mitarbeiter aktualisieren."""
        user, slug, restaurant = chef_data
        staff = db.query(Staff).filter_by(id=staff_id, tenant_slug=slug).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")

        update_data = payload.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(staff, key, value)
        db.commit()
        return {"success": True, "staff_id": staff.id}

    # ═══════════════════════════════════════════════════════════════════════
    # PERSONAL PLANUNG — SHIFTS
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/personal/shifts")
    def get_shifts(start_date: str = Query(None),
                   end_date: str = Query(None),
                   chef_data: tuple = Depends(require_chef_user_flat),
                   db: Session = Depends(get_db)):
        """Alle Schichten eines Zeitraums."""
        user, slug, restaurant = chef_data

        query = db.query(Shift).filter(Shift.tenant_slug == slug)
        if start_date:
            sd = _parse_date(start_date)
            query = query.filter(Shift.shift_date >= sd)
        if end_date:
            ed = _parse_date(end_date)
            query = query.filter(Shift.shift_date <= ed)
        query = query.order_by(Shift.shift_date, Shift.start_time)

        shifts = query.all()
        # Lade Staff-Namen in Batch
        staff_ids = list(set(s.staff_id for s in shifts))
        staff_map = {}
        if staff_ids:
            staffs = db.query(Staff).filter(Staff.id.in_(staff_ids)).all()
            staff_map = {s.id: s.name for s in staffs}

        return {
            "shifts": [_shift_to_dict(s, staff_map.get(s.staff_id)) for s in shifts]
        }

    @app.post("/admin/api/personal/shifts")
    def create_shift(payload: ShiftCreate,
                     chef_data: tuple = Depends(require_chef_user_flat),
                     db: Session = Depends(get_db)):
        """Neue Schicht erstellen."""
        user, slug, restaurant = chef_data

        # Validiere Staff
        staff = db.query(Staff).filter_by(id=payload.staff_id, tenant_slug=slug).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")

        shift_d = _parse_date(payload.shift_date)
        start_t = _parse_time(payload.start_time)
        end_t = _parse_time(payload.end_time)

        # ArbZG-Validierung
        warnings = _validate_arbzg(db, slug, payload.staff_id, shift_d, start_t, end_t,
                                   payload.break_minutes)

        # Hourly Rate: übernehmen aus Payload oder von Staff
        hourly_rate = payload.hourly_rate or float(staff.hourly_rate or 0)

        shift = Shift(
            tenant_slug=slug,
            staff_id=payload.staff_id,
            role=payload.role,
            shift_date=shift_d,
            start_time=start_t,
            end_time=end_t,
            break_minutes=payload.break_minutes,
            hourly_rate=hourly_rate,
            position_label=payload.position_label,
            notes=payload.notes,
            status='draft',
            created_by=user.email if hasattr(user, 'email') else None,
        )
        db.add(shift)
        db.commit()
        db.refresh(shift)

        return {
            "success": True,
            "shift": _shift_to_dict(shift, staff.name),
            "warnings": warnings,
        }

    @app.put("/admin/api/personal/shifts/{shift_id}")
    def update_shift(shift_id: int, payload: ShiftUpdate,
                     chef_data: tuple = Depends(require_chef_user_flat),
                     db: Session = Depends(get_db)):
        """Schicht aktualisieren."""
        user, slug, restaurant = chef_data
        shift = db.query(Shift).filter_by(id=shift_id, tenant_slug=slug).first()
        if not shift:
            raise HTTPException(status_code=404, detail="Schicht nicht gefunden")

        update_data = payload.dict(exclude_unset=True)
        warnings = []

        # Konvertiere Datums/Zeit-Strings
        if 'shift_date' in update_data and update_data['shift_date']:
            update_data['shift_date'] = _parse_date(update_data['shift_date'])
        if 'start_time' in update_data and update_data['start_time']:
            update_data['start_time'] = _parse_time(update_data['start_time'])
        if 'end_time' in update_data and update_data['end_time']:
            update_data['end_time'] = _parse_time(update_data['end_time'])

        for key, value in update_data.items():
            setattr(shift, key, value)

        # ArbZG neu validieren wenn Zeiten geändert wurden
        if 'shift_date' in update_data or 'start_time' in update_data or 'end_time' in update_data or 'break_minutes' in update_data:
            warnings = _validate_arbzg(db, slug, shift.staff_id, shift.shift_date,
                                       shift.start_time, shift.end_time, shift.break_minutes,
                                       exclude_shift_id=shift.id)

        db.commit()
        db.refresh(shift)

        staff = db.query(Staff).filter_by(id=shift.staff_id).first()
        return {
            "success": True,
            "shift": _shift_to_dict(shift, staff.name if staff else None),
            "warnings": warnings,
        }

    @app.delete("/admin/api/personal/shifts/{shift_id}")
    def delete_shift(shift_id: int,
                     chef_data: tuple = Depends(require_chef_user_flat),
                     db: Session = Depends(get_db)):
        """Schicht löschen."""
        user, slug, restaurant = chef_data
        shift = db.query(Shift).filter_by(id=shift_id, tenant_slug=slug).first()
        if not shift:
            raise HTTPException(status_code=404, detail="Schicht nicht gefunden")
        db.delete(shift)
        db.commit()
        return {"success": True}

    @app.post("/admin/api/personal/shifts/publish")
    def publish_week(payload: dict,
                     chef_data: tuple = Depends(require_chef_user_flat),
                     db: Session = Depends(get_db)):
        """Schichten einer Woche veröffentlichen."""
        user, slug, restaurant = chef_data
        start_date_str = payload.get("start_date")
        end_date_str = payload.get("end_date")

        if not start_date_str or not end_date_str:
            raise HTTPException(status_code=400, detail="start_date und end_date erforderlich")

        sd = _parse_date(start_date_str)
        ed = _parse_date(end_date_str)

        shifts = db.query(Shift).filter(
            Shift.tenant_slug == slug,
            Shift.shift_date >= sd,
            Shift.shift_date <= ed,
            Shift.status == 'draft',
        ).all()

        count = 0
        for shift in shifts:
            shift.status = 'published'
            count += 1
        db.commit()

        return {"success": True, "published_count": count}

    @app.get("/admin/api/personal/shifts/stats")
    def get_shift_stats(start_date: str = Query(...),
                        end_date: str = Query(...),
                        chef_data: tuple = Depends(require_chef_user_flat),
                        db: Session = Depends(get_db)):
        """Statistiken: Stunden, Kosten pro Mitarbeiter."""
        user, slug, restaurant = chef_data
        sd = _parse_date(start_date)
        ed = _parse_date(end_date)

        shifts = db.query(Shift).filter(
            Shift.tenant_slug == slug,
            Shift.shift_date >= sd,
            Shift.shift_date <= ed,
            Shift.status != 'cancelled',
        ).all()

        # Pro Mitarbeiter aggregieren
        staff_ids = list(set(s.staff_id for s in shifts))
        staffs = db.query(Staff).filter(Staff.id.in_(staff_ids)).all() if staff_ids else []
        staff_map = {s.id: s for s in staffs}

        stats_per_staff = {}
        for shift in shifts:
            sid = shift.staff_id
            if sid not in stats_per_staff:
                stats_per_staff[sid] = {
                    "staff_id": sid,
                    "staff_name": staff_map.get(sid, None).name if staff_map.get(sid) else None,
                    "total_hours": 0,
                    "total_cost": 0,
                    "shift_count": 0,
                }
            # Berechne Stunden
            start_dt = datetime.combine(shift.shift_date, shift.start_time)
            end_dt = datetime.combine(shift.shift_date, shift.end_time)
            if end_dt <= start_dt:
                end_dt += timedelta(days=1)
            total_min = int((end_dt - start_dt).total_seconds() / 60)
            worked_min = total_min - (shift.break_minutes or 0)
            hours = worked_min / 60
            cost = hours * float(shift.hourly_rate or 0)

            stats_per_staff[sid]["total_hours"] += hours
            stats_per_staff[sid]["total_cost"] += cost
            stats_per_staff[sid]["shift_count"] += 1

        # Runde Werte
        for s in stats_per_staff.values():
            s["total_hours"] = round(s["total_hours"], 1)
            s["total_cost"] = round(s["total_cost"], 2)

        return {
            "per_staff": list(stats_per_staff.values()),
            "total_hours": round(sum(s["total_hours"] for s in stats_per_staff.values()), 1),
            "total_cost": round(sum(s["total_cost"] for s in stats_per_staff.values()), 2),
            "shift_count": sum(s["shift_count"] for s in stats_per_staff.values()),
        }

    # ═══════════════════════════════════════════════════════════════════════
    # PERSONAL PLANUNG — TIME OFF REQUESTS
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/personal/time-off")
    def get_time_off_requests(chef_data: tuple = Depends(require_chef_user_flat),
                              db: Session = Depends(get_db)):
        """Alle Urlaubsanträge."""
        user, slug, restaurant = chef_data
        requests = db.query(TimeOffRequest).filter_by(tenant_slug=slug).order_by(
            TimeOffRequest.created_at.desc()
        ).all()

        staff_ids = list(set(r.staff_id for r in requests))
        staff_map = {}
        if staff_ids:
            staffs = db.query(Staff).filter(Staff.id.in_(staff_ids)).all()
            staff_map = {s.id: s.name for s in staffs}

        return {
            "requests": [
                {
                    "id": r.id,
                    "staff_id": r.staff_id,
                    "staff_name": staff_map.get(r.staff_id),
                    "start_date": r.start_date.isoformat(),
                    "end_date": r.end_date.isoformat(),
                    "request_type": r.request_type,
                    "reason": r.reason,
                    "status": r.status,
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
                for r in requests
            ]
        }

    @app.post("/admin/api/personal/time-off")
    def create_time_off(payload: TimeOffRequestCreate,
                        chef_data: tuple = Depends(require_chef_user_flat),
                        db: Session = Depends(get_db)):
        """Urlaubsantrag erstellen (für Mitarbeiter)."""
        user, slug, restaurant = chef_data
        staff = db.query(Staff).filter_by(id=payload.staff_id, tenant_slug=slug).first()
        if not staff:
            raise HTTPException(status_code=404, detail="Mitarbeiter nicht gefunden")

        req = TimeOffRequest(
            tenant_slug=slug,
            staff_id=payload.staff_id,
            start_date=_parse_date(payload.start_date),
            end_date=_parse_date(payload.end_date),
            request_type=payload.request_type,
            reason=payload.reason,
            status='pending',
        )
        db.add(req)
        db.commit()
        return {"success": True, "id": req.id}

    @app.post("/admin/api/personal/time-off/{req_id}/approve")
    def approve_time_off(req_id: int,
                         chef_data: tuple = Depends(require_chef_user_flat),
                         db: Session = Depends(get_db)):
        """Urlaubsantrag genehmigen."""
        user, slug, restaurant = chef_data
        req = db.query(TimeOffRequest).filter_by(id=req_id, tenant_slug=slug).first()
        if not req:
            raise HTTPException(status_code=404, detail="Antrag nicht gefunden")
        req.status = 'approved'
        req.reviewed_by = user.email if hasattr(user, 'email') else None
        req.reviewed_at = datetime.utcnow()
        db.commit()
        return {"success": True}

    @app.post("/admin/api/personal/time-off/{req_id}/deny")
    def deny_time_off(req_id: int,
                      chef_data: tuple = Depends(require_chef_user_flat),
                      db: Session = Depends(get_db)):
        """Urlaubsantrag ablehnen."""
        user, slug, restaurant = chef_data
        req = db.query(TimeOffRequest).filter_by(id=req_id, tenant_slug=slug).first()
        if not req:
            raise HTTPException(status_code=404, detail="Antrag nicht gefunden")
        req.status = 'denied'
        req.reviewed_by = user.email if hasattr(user, 'email') else None
        req.reviewed_at = datetime.utcnow()
        db.commit()
        return {"success": True}

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — UNITS & CATEGORIES
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/lager/units")
    def get_units(chef_data: tuple = Depends(require_chef_user_flat),
                  db: Session = Depends(get_db)):
        """Alle Mengeneinheiten."""
        user, slug, restaurant = chef_data
        units = db.query(UnitOfMeasure).all()
        return {"units": [{"id": u.id, "name": u.name, "short": u.short, "base_unit": u.base_unit} for u in units]}

    @app.get("/admin/api/lager/categories")
    def get_stock_categories(chef_data: tuple = Depends(require_chef_user_flat),
                             db: Session = Depends(get_db)):
        """Alle Lager-Kategorien."""
        user, slug, restaurant = chef_data
        cats = db.query(StockCategory).filter_by(tenant_slug=slug).order_by(StockCategory.position).all()
        return {"categories": [{"id": c.id, "name": c.name, "color": c.color, "position": c.position} for c in cats]}

    @app.post("/admin/api/lager/categories")
    def create_stock_category(payload: StockCategoryCreate,
                              chef_data: tuple = Depends(require_chef_user_flat),
                              db: Session = Depends(get_db)):
        """Lager-Kategorie erstellen."""
        user, slug, restaurant = chef_data
        cat = StockCategory(
            tenant_slug=slug,
            name=payload.name,
            color=payload.color,
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)
        return {"success": True, "id": cat.id}

    @app.delete("/admin/api/lager/categories/{cat_id}")
    def delete_stock_category(cat_id: int,
                              chef_data: tuple = Depends(require_chef_user_flat),
                              db: Session = Depends(get_db)):
        """Lager-Kategorie löschen."""
        user, slug, restaurant = chef_data
        cat = db.query(StockCategory).filter_by(id=cat_id, tenant_slug=slug).first()
        if not cat:
            raise HTTPException(status_code=404, detail="Kategorie nicht gefunden")
        db.delete(cat)
        db.commit()
        return {"success": True}

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — SUPPLIERS
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/lager/suppliers")
    def get_suppliers(chef_data: tuple = Depends(require_chef_user_flat),
                      db: Session = Depends(get_db)):
        """Alle Lieferanten."""
        user, slug, restaurant = chef_data
        suppliers = db.query(Supplier).filter_by(tenant_slug=slug).order_by(Supplier.name).all()
        return {
            "suppliers": [
                {
                    "id": s.id,
                    "name": s.name,
                    "contact_name": s.contact_name,
                    "phone": s.phone,
                    "email": s.email,
                    "address": s.address,
                    "lead_time_days": s.lead_time_days,
                    "min_order_value": float(s.min_order_value or 0),
                    "active": s.active,
                    "notes": s.notes,
                }
                for s in suppliers
            ]
        }

    @app.post("/admin/api/lager/suppliers")
    def create_supplier(payload: SupplierCreate,
                        chef_data: tuple = Depends(require_chef_user_flat),
                        db: Session = Depends(get_db)):
        """Lieferant erstellen."""
        user, slug, restaurant = chef_data
        supplier = Supplier(
            tenant_slug=slug,
            name=payload.name,
            contact_name=payload.contact_name,
            phone=payload.phone,
            email=payload.email,
            address=payload.address,
            lead_time_days=payload.lead_time_days,
            min_order_value=payload.min_order_value,
            notes=payload.notes,
        )
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return {"success": True, "id": supplier.id}

    @app.put("/admin/api/lager/suppliers/{supplier_id}")
    def update_supplier(supplier_id: int, payload: SupplierCreate,
                        chef_data: tuple = Depends(require_chef_user_flat),
                        db: Session = Depends(get_db)):
        """Lieferant aktualisieren."""
        user, slug, restaurant = chef_data
        supplier = db.query(Supplier).filter_by(id=supplier_id, tenant_slug=slug).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Lieferant nicht gefunden")
        supplier.name = payload.name
        supplier.contact_name = payload.contact_name
        supplier.phone = payload.phone
        supplier.email = payload.email
        supplier.address = payload.address
        supplier.lead_time_days = payload.lead_time_days
        supplier.min_order_value = payload.min_order_value
        supplier.notes = payload.notes
        db.commit()
        return {"success": True}

    @app.delete("/admin/api/lager/suppliers/{supplier_id}")
    def delete_supplier(supplier_id: int,
                        chef_data: tuple = Depends(require_chef_user_flat),
                        db: Session = Depends(get_db)):
        """Lieferant löschen."""
        user, slug, restaurant = chef_data
        supplier = db.query(Supplier).filter_by(id=supplier_id, tenant_slug=slug).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Lieferant nicht gefunden")
        db.delete(supplier)
        db.commit()
        return {"success": True}

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — STOCK ITEMS
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/lager/items")
    def get_stock_items(category_id: int = Query(None),
                        low_stock_only: bool = Query(False),
                        search: str = Query(None),
                        chef_data: tuple = Depends(require_chef_user_flat),
                        db: Session = Depends(get_db)):
        """Alle Lagerartikel."""
        user, slug, restaurant = chef_data
        query = db.query(StockItem).filter_by(tenant_slug=slug)
        if category_id:
            query = query.filter_by(category_id=category_id)
        if search:
            query = query.filter(StockItem.name.ilike(f"%{search}%"))
        if low_stock_only:
            query = query.filter(
                StockItem.min_stock > 0,
                StockItem.current_stock <= StockItem.min_stock
            )
        query = query.order_by(StockItem.name)
        items = query.all()

        return {
            "items": [
                {
                    "id": i.id,
                    "name": i.name,
                    "sku": i.sku,
                    "category_id": i.category_id,
                    "supplier_id": i.supplier_id,
                    "current_stock": float(i.current_stock or 0),
                    "min_stock": float(i.min_stock or 0),
                    "max_stock": float(i.max_stock or 0),
                    "reorder_qty": float(i.reorder_qty or 0),
                    "base_unit": i.base_unit,
                    "purchase_unit": i.purchase_unit,
                    "purchase_to_base_factor": float(i.purchase_to_base_factor or 1),
                    "avg_cost": float(i.avg_cost or 0),
                    "last_purchase_price": float(i.last_purchase_price or 0),
                    "product_id": i.product_id,
                    "active": i.active,
                    "is_low_stock": float(i.min_stock or 0) > 0 and float(i.current_stock or 0) <= float(i.min_stock or 0),
                    "stock_value": float(i.current_stock or 0) * float(i.avg_cost or 0),
                }
                for i in items
            ]
        }

    @app.post("/admin/api/lager/items")
    def create_stock_item(payload: StockItemCreate,
                          chef_data: tuple = Depends(require_chef_user_flat),
                          db: Session = Depends(get_db)):
        """Lagerartikel erstellen. Bei current_stock > 0 wird automatisch
        eine Initial-Buchung (type='in') für den Audit-Trail erstellt."""
        user, slug, restaurant = chef_data
        item = StockItem(
            tenant_slug=slug,
            name=payload.name,
            sku=payload.sku,
            category_id=payload.category_id,
            supplier_id=payload.supplier_id,
            current_stock=float(payload.current_stock or 0),  # NEU
            min_stock=payload.min_stock,
            max_stock=payload.max_stock,
            reorder_qty=payload.reorder_qty,
            base_unit=payload.base_unit,
            purchase_unit=payload.purchase_unit,
            purchase_to_base_factor=payload.purchase_to_base_factor,
            avg_cost=float(payload.cost_per_unit or 0),  # NEU
            last_purchase_price=float(payload.cost_per_unit or 0),  # NEU
            product_id=payload.product_id,
            notes=payload.notes,
        )
        db.add(item)
        db.commit()
        db.refresh(item)

        # NEU: Automatische Initial-Buchung für Audit-Trail, falls Bestand > 0
        if payload.current_stock and float(payload.current_stock) > 0:
            txn = StockTransaction(
                tenant_slug=slug,
                stock_item_id=item.id,
                type='in',
                quantity=float(payload.current_stock),
                unit_cost=float(payload.cost_per_unit or 0),
                reason='Initialbestand bei Anlage',
                notes='Automatisch beim Erstellen des Artikels gebucht',
            )
            db.add(txn)
            db.commit()

        return {"success": True, "id": item.id}

    @app.put("/admin/api/lager/items/{item_id}")
    def update_stock_item(item_id: int, payload: StockItemUpdate,
                          chef_data: tuple = Depends(require_chef_user_flat),
                          db: Session = Depends(get_db)):
        """Lagerartikel aktualisieren."""
        user, slug, restaurant = chef_data
        item = db.query(StockItem).filter_by(id=item_id, tenant_slug=slug).first()
        if not item:
            raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
        update_data = payload.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        db.commit()
        return {"success": True}

    @app.delete("/admin/api/lager/items/{item_id}")
    def delete_stock_item(item_id: int,
                          chef_data: tuple = Depends(require_chef_user_flat),
                          db: Session = Depends(get_db)):
        """Lagerartikel löschen."""
        user, slug, restaurant = chef_data
        item = db.query(StockItem).filter_by(id=item_id, tenant_slug=slug).first()
        if not item:
            raise HTTPException(status_code=404, detail="Artikel nicht gefunden")
        db.delete(item)
        db.commit()
        return {"success": True}

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — STOCK TRANSACTIONS
    # ═══════════════════════════════════════════════════════════════════════

    @app.post("/admin/api/lager/transactions")
    def create_stock_transaction(payload: StockTransactionCreate,
                                 chef_data: tuple = Depends(require_chef_user_flat),
                                 db: Session = Depends(get_db)):
        """Lager-Buchung erstellen (in/out/adjust/waste)."""
        user, slug, restaurant = chef_data
        item = db.query(StockItem).filter_by(id=payload.stock_item_id, tenant_slug=slug).first()
        if not item:
            raise HTTPException(status_code=404, detail="Artikel nicht gefunden")

        # Signed quantity: 'out'/'waste' = negativ
        signed_qty = payload.quantity
        if payload.type in ('out', 'waste') and signed_qty > 0:
            signed_qty = -signed_qty
        elif payload.type == 'in' and signed_qty < 0:
            signed_qty = abs(signed_qty)

        txn = StockTransaction(
            tenant_slug=slug,
            stock_item_id=payload.stock_item_id,
            type=payload.type,
            quantity=signed_qty,
            unit_cost=payload.unit_cost,
            reason=payload.reason,
            notes=payload.notes,
        )
        db.add(txn)

        # Update cache: current_stock
        item.current_stock = float(item.current_stock or 0) + signed_qty

        # Update avg_cost bei 'in' (weighted average)
        if payload.type == 'in' and payload.unit_cost > 0:
            new_qty = float(item.current_stock or 0)
            old_value = float(item.avg_cost or 0) * (new_qty - signed_qty)
            new_value = payload.unit_cost * abs(signed_qty)
            if new_qty > 0:
                item.avg_cost = (old_value + new_value) / new_qty
            item.last_purchase_price = payload.unit_cost

        db.commit()
        db.refresh(txn)

        return {
            "success": True,
            "transaction_id": txn.id,
            "new_stock": float(item.current_stock or 0),
        }

    @app.get("/admin/api/lager/transactions")
    def get_stock_transactions(stock_item_id: int = Query(None),
                               limit: int = Query(50),
                               chef_data: tuple = Depends(require_chef_user_flat),
                               db: Session = Depends(get_db)):
        """Lager-Buchungen abrufen."""
        user, slug, restaurant = chef_data
        query = db.query(StockTransaction).filter_by(tenant_slug=slug)
        if stock_item_id:
            query = query.filter_by(stock_item_id=stock_item_id)
        query = query.order_by(StockTransaction.created_at.desc()).limit(limit)
        txns = query.all()
        return {
            "transactions": [
                {
                    "id": t.id,
                    "stock_item_id": t.stock_item_id,
                    "type": t.type,
                    "quantity": float(t.quantity),
                    "unit_cost": float(t.unit_cost or 0),
                    "reason": t.reason,
                    "notes": t.notes,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in txns
            ]
        }

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — DASHBOARD
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/lager/dashboard")
    def get_inventory_dashboard(chef_data: tuple = Depends(require_chef_user_flat),
                                db: Session = Depends(get_db)):
        """Lager-Dashboard: Statistiken, Low-Stock, etc."""
        user, slug, restaurant = chef_data

        items = db.query(StockItem).filter_by(tenant_slug=slug, active=True).all()
        total_value = sum(float(i.current_stock or 0) * float(i.avg_cost or 0) for i in items)
        # Low stock only when min_stock > 0 AND current <= min (avoid alert for new items with 0/0)
        low_stock_items = [i for i in items if float(i.min_stock or 0) > 0 and float(i.current_stock or 0) <= float(i.min_stock or 0)]

        # Letzte 10 Transaktionen
        recent_txns = db.query(StockTransaction).filter_by(tenant_slug=slug).order_by(
            StockTransaction.created_at.desc()
        ).limit(10).all()

        return {
            "total_items": len(items),
            "total_value": round(total_value, 2),
            "low_stock_count": len(low_stock_items),
            "low_stock_items": [
                {
                    "id": i.id,
                    "name": i.name,
                    "current_stock": float(i.current_stock or 0),
                    "min_stock": float(i.min_stock or 0),
                    "base_unit": i.base_unit,
                    "reorder_qty": float(i.reorder_qty or 0),
                }
                for i in low_stock_items
            ],
            "recent_transactions": [
                {
                    "id": t.id,
                    "stock_item_id": t.stock_item_id,
                    "type": t.type,
                    "quantity": float(t.quantity),
                    "reason": t.reason,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
                for t in recent_txns
            ],
        }

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — RECIPES
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/lager/recipes")
    def get_recipes(product_id: int = Query(None),
                    chef_data: tuple = Depends(require_chef_user_flat),
                    db: Session = Depends(get_db)):
        """Rezepte abrufen (optional für ein Produkt)."""
        user, slug, restaurant = chef_data
        query = db.query(Recipe).filter_by(tenant_slug=slug)
        if product_id:
            query = query.filter_by(product_id=product_id)
        recipes = query.all()
        return {
            "recipes": [
                {
                    "id": r.id,
                    "product_id": r.product_id,
                    "stock_item_id": r.stock_item_id,
                    "quantity": float(r.quantity),
                    "unit": r.unit,
                    "notes": r.notes,
                }
                for r in recipes
            ]
        }

    @app.post("/admin/api/lager/recipes")
    def create_recipe(payload: RecipeCreate,
                      chef_data: tuple = Depends(require_chef_user_flat),
                      db: Session = Depends(get_db)):
        """Rezept erstellen."""
        user, slug, restaurant = chef_data
        recipe = Recipe(
            tenant_slug=slug,
            product_id=payload.product_id,
            stock_item_id=payload.stock_item_id,
            quantity=payload.quantity,
            unit=payload.unit,
            notes=payload.notes,
        )
        db.add(recipe)
        db.commit()
        db.refresh(recipe)
        return {"success": True, "id": recipe.id}

    @app.delete("/admin/api/lager/recipes/{recipe_id}")
    def delete_recipe(recipe_id: int,
                      chef_data: tuple = Depends(require_chef_user_flat),
                      db: Session = Depends(get_db)):
        """Rezept löschen."""
        user, slug, restaurant = chef_data
        recipe = db.query(Recipe).filter_by(id=recipe_id, tenant_slug=slug).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Rezept nicht gefunden")
        db.delete(recipe)
        db.commit()
        return {"success": True}

    # ═══════════════════════════════════════════════════════════════════════
    # LAGERVERWALTUNG — STOCK COUNTS (INVENTUR)
    # ═══════════════════════════════════════════════════════════════════════

    @app.get("/admin/api/lager/counts")
    def get_stock_counts(chef_data: tuple = Depends(require_chef_user_flat),
                         db: Session = Depends(get_db)):
        """Inventuren auflisten."""
        user, slug, restaurant = chef_data
        counts = db.query(StockCount).filter_by(tenant_slug=slug).order_by(
            StockCount.created_at.desc()
        ).all()
        return {
            "counts": [
                {
                    "id": c.id,
                    "name": c.name,
                    "status": c.status,
                    "count_date": c.count_date.isoformat(),
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "completed_at": c.completed_at.isoformat() if c.completed_at else None,
                }
                for c in counts
            ]
        }

    @app.post("/admin/api/lager/counts")
    def create_stock_count(payload: dict,
                           chef_data: tuple = Depends(require_chef_user_flat),
                           db: Session = Depends(get_db)):
        """Neue Inventur starten — kopiert aktuelle Bestände als 'expected'."""
        user, slug, restaurant = chef_data
        name = payload.get("name", f"Inventur {date.today().isoformat()}")
        count_date_str = payload.get("count_date", date.today().isoformat())

        count = StockCount(
            tenant_slug=slug,
            name=name,
            status='open',
            count_date=_parse_date(count_date_str),
            created_by=user.email if hasattr(user, 'email') else None,
        )
        db.add(count)
        db.flush()  # um count.id zu bekommen

        # Alle aktiven Items als CountItems anlegen
        items = db.query(StockItem).filter_by(tenant_slug=slug, active=True).all()
        for item in items:
            ci = StockCountItem(
                stock_count_id=count.id,
                stock_item_id=item.id,
                expected_qty=float(item.current_stock or 0),
                counted_qty=None,
                variance=0,
            )
            db.add(ci)
        db.commit()
        return {"success": True, "id": count.id, "item_count": len(items)}

    @app.get("/admin/api/lager/counts/{count_id}/items")
    def get_stock_count_items(count_id: int,
                              chef_data: tuple = Depends(require_chef_user_flat),
                              db: Session = Depends(get_db)):
        """Einzelne Inventur-Positionen abrufen."""
        user, slug, restaurant = chef_data
        count = db.query(StockCount).filter_by(id=count_id, tenant_slug=slug).first()
        if not count:
            raise HTTPException(status_code=404, detail="Inventur nicht gefunden")

        items = db.query(StockCountItem).filter_by(stock_count_id=count_id).all()
        # Lade StockItem-Namen
        item_ids = [ci.stock_item_id for ci in items]
        stock_items = db.query(StockItem).filter(StockItem.id.in_(item_ids)).all() if item_ids else []
        item_map = {i.id: i for i in stock_items}

        return {
            "count": {
                "id": count.id,
                "name": count.name,
                "status": count.status,
                "count_date": count.count_date.isoformat(),
            },
            "items": [
                {
                    "id": ci.id,
                    "stock_item_id": ci.stock_item_id,
                    "stock_item_name": item_map.get(ci.stock_item_id, None).name if item_map.get(ci.stock_item_id) else None,
                    "base_unit": item_map.get(ci.stock_item_id, None).base_unit if item_map.get(ci.stock_item_id) else None,
                    "expected_qty": float(ci.expected_qty or 0),
                    "counted_qty": float(ci.counted_qty) if ci.counted_qty is not None else None,
                    "variance": float(ci.variance or 0),
                    "notes": ci.notes,
                }
                for ci in items
            ],
        }

    @app.put("/admin/api/lager/counts/{count_id}/items/{item_id}")
    def update_stock_count_item(count_id: int, item_id: int, payload: dict,
                                chef_data: tuple = Depends(require_chef_user_flat),
                                db: Session = Depends(get_db)):
        """Zähl-Ergebnis eintragen."""
        user, slug, restaurant = chef_data
        ci = db.query(StockCountItem).filter_by(id=item_id, stock_count_id=count_id).first()
        if not ci:
            raise HTTPException(status_code=404, detail="Position nicht gefunden")

        counted = payload.get("counted_qty")
        if counted is not None:
            ci.counted_qty = float(counted)
            ci.variance = float(counted) - float(ci.expected_qty or 0)
        if 'notes' in payload:
            ci.notes = payload['notes']
        db.commit()
        return {"success": True, "variance": float(ci.variance or 0)}

    @app.post("/admin/api/lager/counts/{count_id}/complete")
    def complete_stock_count(count_id: int,
                             chef_data: tuple = Depends(require_chef_user_flat),
                             db: Session = Depends(get_db)):
        """Inventur abschließen — schreibt Differenzen als 'adjust'-Transaktionen."""
        user, slug, restaurant = chef_data
        count = db.query(StockCount).filter_by(id=count_id, tenant_slug=slug).first()
        if not count:
            raise HTTPException(status_code=404, detail="Inventur nicht gefunden")

        items = db.query(StockCountItem).filter_by(stock_count_id=count_id).all()
        adjust_count = 0
        for ci in items:
            if ci.counted_qty is None:
                continue
            variance = float(ci.counted_qty) - float(ci.expected_qty or 0)
            if abs(variance) < 0.001:
                continue
            # Adjust-Transaction erstellen
            txn = StockTransaction(
                tenant_slug=slug,
                stock_item_id=ci.stock_item_id,
                type='adjust',
                quantity=variance,
                reason=f"Inventur {count.name}",
                stock_count_id=count.id,
                notes=f"Erwartet: {ci.expected_qty}, Gezählt: {ci.counted_qty}",
            )
            db.add(txn)
            # Stock aktualisieren
            stock_item = db.query(StockItem).filter_by(id=ci.stock_item_id).first()
            if stock_item:
                stock_item.current_stock = float(ci.counted_qty)
            adjust_count += 1

        count.status = 'completed'
        count.completed_at = datetime.utcnow()
        db.commit()
        return {"success": True, "adjustments": adjust_count}
