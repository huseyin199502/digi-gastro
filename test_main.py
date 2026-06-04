import sys
import copy
import traceback
from fastapi.testclient import TestClient
from main import app, restaurants, INITIAL_RESTAURANTS

client = TestClient(app)

def test_integration():
    print("Starting integration tests for digi-gastro backend...")
    
    # Reset in-memory DB for tests
    restaurants.clear()
    
    # Dynamically seed 'demo' tenant for integration tests
    from database import STANDARD_PRODUCTS
    import copy
    
    demo_tenant = {
        "name": "Demo Lounge",
        "email": "demo@digi-gastro.de",
        "password": "password123",
        "tagesumsatz": 0.00,
        "bestellungen_gesamt": 0,
        "active": True,
        "is_onboarded": True,
        "is_setup_completed": True,  # Keep it True for existing integration tests to pass without hitting setup
        "logo_path": "/static/images/digigastrologo.jpeg",
        "has_kitchen": True,
        "is_shishabar": True,
        "impressum_content": "",
        "datenschutz_content": "",
        "security_token": "demo2026",
        "service_calls": [],
        "categories": ["Burger", "Drinks", "Desserts", "Salads", "Shisha"],
        "products": copy.deepcopy(STANDARD_PRODUCTS),
        "orders": [
            {
                "id": 1,
                "table": "Tisch 5",
                "items": [
                    {"product_id": 1, "name": "Premium Burger", "price": 14.50, "quantity": 2, "category_type": "küche"},
                    {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1, "category_type": "bar"}
                ],
                "total": 32.50,
                "total_with_tip": 32.50,
                "tip_amount": 0.0,
                "status": "ausstehend",
                "timestamp": "2026-05-29 09:30:00",
                "mwst_rate": 19,
                "waiter_id": None
            }
        ],
        "staff": [
            {"name": "Chef", "role": "chef", "pin": "1111", "pin_code": "1111"},
            {"name": "Max Mustermann", "role": "kellner", "pin": "1234", "pin_code": "1234"},
            {"name": "Kessy Köchin", "role": "zubereiter", "pin": "5555", "pin_code": "5555"}
        ],
        "branding": {
            "address": "Forstweg 12, 80331 München",
            "indigo": "",
            "instagram": "@demolounge",
            "facebook": "/demolounge",
            "logo_url": "/static/images/digigastrologo.jpeg"
        },
        "happy_hour": {
            "days": ["Fr", "Sa"],
            "start": "18:00",
            "end": "20:00",
            "discount": 20
        },
        "tables": [
            {"number": "1", "zone": "innen"},
            {"number": "2", "zone": "innen"},
            {"number": "3", "zone": "innen"},
            {"number": "4", "zone": "innen"},
            {"number": "5", "zone": "innen"},
            {"number": "11", "zone": "terrasse"},
            {"number": "12", "zone": "terrasse"},
            {"number": "99", "zone": "innen"}
        ],
        "audit_log": []
    }
    
    demo_tenant["products"].append({
        "id": 7,
        "name": "Klassische Shisha",
        "price": 12.00,
        "description": "Premium traditional shisha.",
        "image": "https://images.unsplash.com/photo-1527137341206-1a2ab818aa6a?auto=format&fit=crop&q=80&w=400",
        "vegan": True,
        "is_vegan": True,
        "is_glutenfree": True,
        "allergens": [],
        "category_type": "shisha",
        "category": "Shisha",
        "is_available": True
    })
    
    restaurants["demo"] = demo_tenant
    
    # 1. Root redirect check
    print("Testing root redirect...")
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code == 307 or resp.status_code == 302, f"Expected redirect, got {resp.status_code}"
    assert resp.headers["location"] == "/demo"
    print("Root redirect: OK")

    # 2. Get customer menu
    print("Testing customer menu (GET /demo)...")
    # Read-only block check
    resp = client.get("/demo")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert "Demo Lounge" in resp.text
    assert "QR-Code Scan erforderlich" in resp.text
    assert "Premium Burger" not in resp.text # Zero data leak in readonly
    
    # Active session check (e.g. scan)
    resp = client.get("/demo?table=99&token=demo2026")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert "Demo Lounge" in resp.text
    assert "Premium Burger" in resp.text
    assert "Spezi" in resp.text
    print("Customer menu: OK")

    # 3. Post a new order - MISSBRAUCHS-SCHUTZ BEIM BESTELLEN TESTS
    print("Testing order placement with missing/invalid token (expect 403)...")
    bad_order_data = {
        "table": "Tisch 99",
        "token": "wrong_token",
        "items": [
            {"product_id": 1, "name": "Premium Burger", "price": 14.50, "quantity": 1}
        ]
    }
    resp = client.post("/demo/bestellen", json=bad_order_data)
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    assert "Ungültiger oder abgelaufener Tisch-Code" in resp.json()["detail"]
    print("Order placement with invalid token blocked: OK")

    print("Testing order placement with correct token (expect 200)...")
    order_data = {
        "table": "Tisch 99",
        "token": "demo2026", # Correct initial token
        "items": [
            {"product_id": 1, "name": "Premium Burger", "price": 14.50, "quantity": 1},
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 2}
        ]
    }
    resp = client.post("/demo/bestellen", json=order_data)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    res_json = resp.json()
    assert res_json["success"] is True
    order_id = res_json["order_id"]
    print(f"Order placement with valid token: OK (Created Order ID: {order_id})")

    # 4. Get staff POS view and verify order is displayed
    print("Testing staff view (Verify order in DB cache)...")
    r_data = restaurants["demo"]
    o_active = [o for o in r_data["orders"] if o["id"] == order_id][0]
    assert o_active["table"] == "Tisch 99"
    assert o_active["total"] == 21.50
    print("Staff view display: OK")

    # 5. Process payment
    print("Testing payment processing...")
    # Get initial values of stats
    r_data = restaurants["demo"]
    initial_revenue = r_data["tagesumsatz"]
    initial_count = r_data["bestellungen_gesamt"]
    
    resp = client.post(f"/demo/tablet/bezahlen/{order_id}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # Check if stats are updated
    assert r_data["tagesumsatz"] == initial_revenue + 21.50, f"Expected {initial_revenue + 21.50}, got {r_data['tagesumsatz']}"
    assert r_data["bestellungen_gesamt"] == initial_count + 1
    print("Payment processing & stats update: OK")

    # 6. Admin auth checks
    print("Testing unauthorized admin dashboard access (expect login redirect)...")
    resp = client.get("/demo/admin", follow_redirects=False)
    assert resp.status_code in [302, 307]
    assert resp.headers["location"] == "/admin"
    
    resp2 = client.get("/admin", follow_redirects=False)
    assert resp2.status_code in [302, 307]
    assert resp2.headers["location"] == "/admin/login"
    print("Admin unauthorized check: OK")

    # 7. Admin login view
    print("Testing admin login page (GET /admin/login)...")
    resp = client.get("/admin/login")
    assert resp.status_code == 200
    assert "Admin Login" in resp.text or "Log-In" in resp.text or "E-Mail" in resp.text
    print("Admin login page load: OK")

    # 8. Admin login processing (failed)
    print("Testing failed admin login...")
    resp = client.post("/admin/login", data={"email": "wrong@email.com", "password": "wrong"})
    assert resp.status_code == 200
    assert "Ungültige" in resp.text
    print("Failed login: OK")

    # 9. Admin login processing (success)
    print("Testing successful admin login...")
    resp = client.post("/admin/login", data={"email": "demo@digi-gastro.de", "password": "password123"}, follow_redirects=False)
    assert resp.status_code in [303, 307]
    assert resp.headers["location"] == "/admin/dashboard"
    # Capture cookie for further requests
    session_cookie = resp.headers.get("set-cookie")
    print("Successful login & cookie emission: OK")

    # Extract session cookie value
    cookie_value = ""
    if session_cookie:
        cookie_value = session_cookie.split(";")[0].split("=")[1]
    
    # Create cookies dict for requests
    dl_cookies = {"session": cookie_value}

    # 10. Admin dashboard authenticated access
    print("Testing authorized admin dashboard access...")
    resp = client.get("/admin/dashboard", cookies=dl_cookies)
    assert resp.status_code == 200
    assert "Admin Dashboard" in resp.text
    # Stats are visible
    assert f"{r_data['bestellungen_gesamt']}" in resp.text
    print("Authorized admin dashboard: OK")

    # 11. Live category creation
    print("Testing dynamic category creation...")
    resp = client.post("/admin/kategorie-erstellen", data={"category-name": "Spezialitäten"}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 303
    assert resp.headers["location"] == "/admin/dashboard"
    assert "Spezialitäten" in r_data["categories"]
    print("Dynamic category creation: OK")

    # 12. Create staff member
    print("Testing dynamic staff creation...")
    resp = client.post("/admin/staff", data={"staff_name": "Anna Schmidt", "role": "Barkeeper", "pin": "9999"}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 303
    assert any(s["name"] == "Anna Schmidt" for s in r_data["staff"])
    print("Dynamic staff creation: OK")

    # 13. Update branding
    print("Testing dynamic branding update...")
    resp = client.post("/admin/branding", data={"logo_url": "https://host/newlogo.png", "address": "Altstadt 4, München", "indigo": "", "instagram": "@neu_ig", "facebook": "/neu_fb"}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 303
    assert r_data["branding"]["address"] == "Altstadt 4, München"
    assert r_data["branding"]["logo_url"] == "https://host/newlogo.png"
    print("Dynamic branding update: OK")


    # ==========================================
    # NEW SAAS PLATFORM TESTS (SÄULE 1 & SÄULE 2)
    # ==========================================
    print("\n--- Starting SaaS Platform & Service channel tests ---")

    # A. Test Service Call placement with invalid token (expect 403)
    print("Testing service calls with invalid token (expect 403)...")
    client.cookies.clear() # Clear any admin/POS bypass cookies for guest simulation
    bad_call_payload = {"type": "kellner", "table": "Tisch 5", "token": "wrong_token"}
    resp = client.post("/demo/service-ruf", json=bad_call_payload)
    assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
    assert "Ungültiger oder abgelaufener Tisch-Code" in resp.json()["detail"]
    print("Service calls with invalid token blocked: OK")

    # B. Test Service Call placement with valid token (expect 200)
    print("Testing service calls with valid token (expect 200)...")
    # Kellner call
    call_payload = {"type": "kellner", "table": "Tisch 5", "token": "demo2026"}
    resp = client.post("/demo/service-ruf", json=call_payload)
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["success"] is True
    call_id_1 = res_json["call_id"]
    
    # Kohle call
    call_payload = {"type": "kohle", "table": "Tisch 5", "token": "demo2026"}
    resp = client.post("/demo/service-ruf", json=call_payload)
    assert resp.status_code == 200
    call_id_2 = resp.json()["call_id"]
    
    # Check that they show up in service_calls cache
    r_data = restaurants["demo"]
    calls = r_data["service_calls"]
    assert any(c["id"] == call_id_1 and c["table"] == "Tisch 5" and c["type"] == "kellner" for c in calls)
    assert any(c["id"] == call_id_2 and c["table"] == "Tisch 5" and c["type"] == "kohle" for c in calls)
    print("Service calls creation: OK")

    # C. Test Service Call resolution
    print("Testing service call resolution (POST /demo/service-erledigt/{id})...")
    resp = client.post(f"/demo/service-erledigt/{call_id_1}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # Verify first call is removed, but second is still there
    r_data = restaurants["demo"]
    calls = r_data["service_calls"]
    assert not any(c["id"] == call_id_1 for c in calls)
    assert any(c["id"] == call_id_2 for c in calls)
    print("Service call resolution: OK")

    # D. Test Token Rotation via Admin
    print("Testing token rotation...")
    old_token = r_data["security_token"]
    resp = client.post("/admin/token-rotieren", cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 303
    new_token = r_data["security_token"]
    assert old_token != new_token, f"Token did not change after rotation! Old: {old_token}, New: {new_token}"
    print(f"Token successfully rotated from '{old_token}' to '{new_token}': OK")

    # Verify old token now fails
    client.cookies.clear() # Clear any admin/POS bypass cookies for guest simulation
    print("Testing order placement using old token after rotation (should be blocked)...")
    old_order_payload = {
        "table": "Tisch 10",
        "token": old_token,
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    }
    resp = client.post("/demo/bestellen", json=old_order_payload)
    assert resp.status_code == 403, f"Expected 403 for old token, got {resp.status_code}"
    print("Order with old token blocked after rotation: OK")

    # Verify new token now succeeds
    print("Testing order placement using new token after rotation (should succeed)...")
    new_order_payload = {
        "table": "Tisch 10",
        "token": new_token,
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    }
    resp = client.post("/demo/bestellen", json=new_order_payload)
    assert resp.status_code == 200, f"Expected 200 for new token, got {resp.status_code}"
    print("Order with new token succeeded after rotation: OK")

    # E. Global Admin unauthorized login / redirect
    print("Testing global admin unauthorized redirect...")
    resp = client.get("/digi-gastro-admin", follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/digi-gastro-admin/login"
    print("Global admin unauthorized redirect: OK")

    # F. Global Admin Login (failed and success)
    print("Testing failed global admin login...")
    resp = client.post("/digi-gastro-admin/login", data={"email": "admin@digi-gastro.de", "password": "wrong"})
    assert resp.status_code == 200
    assert "Ungültige E-Mail-Adresse" in resp.text
    
    print("Testing successful global admin login...")
    resp = client.post("/digi-gastro-admin/login", data={"email": "admin@digi-gastro.de", "password": "superpassword123"}, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/digi-gastro-admin"
    
    global_session_cookie = resp.headers.get("set-cookie")
    global_cookie_value = global_session_cookie.split(";")[0].split("=")[1]
    global_cookies = {"session_global": global_cookie_value}
    print("Global admin login: OK")

    # SaaS Dashboard Security Tests
    print("Testing tenant creation protection (POST /digi-gastro-admin/tenant-erstellen without login -> 403)...")
    anon_client = TestClient(app)
    resp_anon = anon_client.post("/digi-gastro-admin/tenant-erstellen", data={"name": "Secret Bar", "slug": "secretbar"}, follow_redirects=False)
    assert resp_anon.status_code == 403
    print("Tenant creation unauthorized access blocked: OK")

    print("Testing tenant creation (POST /digi-gastro-admin/tenant-erstellen with global admin cookies -> 303)...")
    resp_auth = client.post("/digi-gastro-admin/tenant-erstellen", data={
        "name": "Onboarded Bar", "slug": "onboardedbar"
    }, cookies=global_cookies, follow_redirects=False)
    assert resp_auth.status_code in [302, 303, 307]
    assert "success=" in resp_auth.headers["location"]
    assert "onboardedbar" in restaurants
    
    # Verify auto-generated credentials
    onboarded_tenant = restaurants["onboardedbar"]
    assert onboarded_tenant["email"] == "onboardedbar@digi-gastro.de"
    assert onboarded_tenant["password"].startswith("Gastro-")
    print("Tenant creation with auto-generated credentials: OK")

    # Reset Password Test
    print("Testing password reset (POST /digi-gastro-admin/tenant-reset-password/{slug} -> 303)...")
    old_pw = onboarded_tenant["password"]
    resp_reset = client.post("/digi-gastro-admin/tenant-reset-password/onboardedbar", cookies=global_cookies, follow_redirects=False)
    assert resp_reset.status_code in [302, 303, 307]
    assert "success=" in resp_reset.headers["location"]
    assert restaurants["onboardedbar"]["password"] != old_pw
    print("Tenant password reset: OK")

    # Edit Name Test
    print("Testing tenant name edit (POST /digi-gastro-admin/tenant-edit-name/{slug} -> 303)...")
    resp_edit = client.post("/digi-gastro-admin/tenant-edit-name/onboardedbar", data={"name": "Updated Bar Name"}, cookies=global_cookies, follow_redirects=False)
    assert resp_edit.status_code in [302, 303, 307]
    assert "success=" in resp_edit.headers["location"]
    assert restaurants["onboardedbar"]["name"] == "Updated Bar Name"
    print("Tenant name edit: OK")

    # G. Get SaaS dashboard & check live statistics
    print("Testing SaaS Dashboard load and stats display...")
    resp = client.get("/digi-gastro-admin", cookies=global_cookies)
    assert resp.status_code == 200
    assert "Global Control Center" in resp.text or "Plattform Master-Liste" in resp.text
    # We should see our restaurant listed
    assert "Demo Lounge" in resp.text
    print("SaaS Dashboard stats & tenant list: OK")

    # H. Create new tenant
    print("Testing new tenant creation (POST /digi-gastro-admin/tenant-erstellen)...")
    resp = client.post("/digi-gastro-admin/tenant-erstellen", data={"name": "Luna Bar", "slug": "lunabar"}, cookies=global_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert "lunabar" in restaurants
    
    # Check that new tenant statistics are strictly reset
    luna = restaurants["lunabar"]
    assert luna["name"] == "Luna Bar"
    assert luna["tagesumsatz"] == 0.0
    assert luna["bestellungen_gesamt"] == 0
    assert len(luna["orders"]) == 0
    assert len(luna["staff"]) == 0
    assert luna["active"] is True
    print("New tenant creation & reset variables: OK")

    # I. Block tenant (Status-Toggle)
    print("Testing tenant block/suspension status-toggle...")
    resp = client.post("/digi-gastro-admin/tenant-toggle/lunabar", cookies=global_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert restaurants["lunabar"]["active"] is False
    print("Tenant block toggle: OK")

    # J. Verify blocked tenant redirects to Wartungsseite with 403 status code
    print("Testing accessing suspended tenant (expecting maintenance page with 403)...")
    resp = client.get("/lunabar")
    assert resp.status_code == 403
    assert "Dieses Restaurant ist vorübergehend deaktiviert" in resp.text
    print("Suspended tenant access restriction: OK")

    # K. Toggle tenant back to active and verify it works
    print("Testing tenant activation status-toggle...")
    resp = client.post("/digi-gastro-admin/tenant-toggle/lunabar", cookies=global_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert restaurants["lunabar"]["active"] is True
    
    resp = client.get("/lunabar")
    assert resp.status_code == 200
    assert "Luna Bar" in resp.text
    print("Tenant activation and restore access: OK")

    # L. Shisha mode toggle testing
    print("Testing Shisha mode toggle...")
    # Get initial shisha state for demo (default True)
    assert restaurants["demo"]["is_shishabar"] is True
    
    # Toggle it off
    # Send post to toggle off (is_shishabar not present in form -> False)
    resp = client.post("/admin/shishabar-toggle", data={}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert restaurants["demo"]["is_shishabar"] is False
    print("Shisha mode toggle off: OK")
    
    # Toggle it back on
    resp = client.post("/admin/shishabar-toggle", data={"is_shishabar": "true"}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert restaurants["demo"]["is_shishabar"] is True
    print("Shisha mode toggle on: OK")


    # ==========================================
    # NEW GASTRO FEATURES TESTS (SPLITTING & AVAILABILITY)
    # ==========================================
    print("\n--- Starting New Gastro-Professional Feature Tests ---")

    # Feature 2: Product Availability Toggle ("Ausverkauft")
    print("Testing product availability toggle ('Ausverkauft')...")
    # Verify default is available (True)
    product_1 = next(p for p in r_data["products"] if p["id"] == 1)
    assert product_1.get("is_available", True) is True
    
    # Toggle to "Ausverkauft" (False)
    resp = client.post("/admin/product-toggle/1", cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert product_1["is_available"] is False
    print("Product is_available toggled to False: OK")

    # Access client menu and check visual representation
    resp = client.get(f"/demo?table=99&token={new_token}")
    assert resp.status_code == 200
    assert "Ausverkauft" in resp.text
    # Check that "Premium Burger" is shown as sold out
    assert "opacity-50 grayscale" in resp.text
    print("Visual sold out representation on client menu: OK")

    # Toggle back to "Aktiv" (True)
    resp = client.post("/admin/product-toggle/1", cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert product_1["is_available"] is True
    print("Product is_available toggled back to True: OK")


    # Feature 1: Dynamic Table Splitting (Teilzahlung)
    print("Testing dynamic table splitting (Teilzahlung)...")
    # Let's inspect active order #1: Tisch 5, 2x Premium Burger (€14.50 each) & 1x Spezi (€3.50 each). Total = 32.50.
    order_1 = next(o for o in r_data["orders"] if o["id"] == 1)
    assert order_1["status"] == "ausstehend"
    assert order_1["total"] == 32.50
    
    # Let's pay 1x Premium Burger of order #1
    initial_revenue = r_data["tagesumsatz"]
    initial_completed_count = r_data["bestellungen_gesamt"]

    split_payload = {
        "items": [
            {"product_id": 1, "quantity": 1} # Pay 1x Burger = 14.50 EUR
        ]
    }
    resp = client.post("/demo/tablet/teilzahlung/1", json=split_payload)
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["success"] is True
    assert res_json["remaining_items_count"] == 2 # 1 burger and 1 kola left
    assert res_json["order_status"] == "ausstehend"
    assert res_json["split_amount"] == 14.50

    # Verify that order total and items in backend are updated correctly
    assert order_1["total"] == 18.00 # 1x Burger (14.50) + 1x Kola (3.50)
    burger_item = next(item for item in order_1["items"] if item["product_id"] == 1)
    assert burger_item["quantity"] == 1

    # Verify that tagesumsatz got credited instantly
    assert r_data["tagesumsatz"] == initial_revenue + 14.50
    # Since the order is not fully paid yet, completed count shouldn't increase
    assert r_data["bestellungen_gesamt"] == initial_completed_count
    print("Partial payment of 1 item successfully processed: OK")

    # Now pay off the rest of the order (1x Burger, 1x Kola = 18.00 EUR)
    split_payload_remaining = {
        "items": [
            {"product_id": 1, "quantity": 1},
            {"product_id": 4, "quantity": 1}
        ]
    }
    resp = client.post("/demo/tablet/teilzahlung/1", json=split_payload_remaining)
    assert resp.status_code == 200
    res_json_2 = resp.json()
    assert res_json_2["success"] is True
    assert res_json_2["remaining_items_count"] == 0
    assert res_json_2["order_status"] == "bezahlt"
    assert res_json_2["split_amount"] == 18.00

    # Verify order is fully resolved
    assert order_1["status"] == "bezahlt"
    assert len(order_1["items"]) == 0
    assert order_1["total"] == 0.0

    # Verify tagesumsatz and completed order count
    assert r_data["tagesumsatz"] == initial_revenue + 32.50 # 14.50 + 18.00
    assert r_data["bestellungen_gesamt"] == initial_completed_count + 1
    print("Remaining items split payment processed (Order fully bezahlt): OK")


    # 14. Admin logout
    print("Testing admin logout...")
    resp = client.get("/admin/logout", cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/admin/login"
    print("Admin logout: OK")

    
    # ==========================================
    # MILESTONE: DYNAMIC SETUP & REDIRECTS
    # ==========================================
    print("\n--- Starting Setup & Dynamic Setup Tests ---")

    # 1. Un-setup tenant (lunabar) access attempt to admin routes without login (should redirect to login)
    print("Testing un-setup tenant admin route access redirect without login...")
    luna = restaurants["lunabar"]
    luna["is_setup_completed"] = False
    restaurants["lunabar"] = luna

    resp = client.get("/admin", follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/admin/login"
    print("Un-setup unauthorized redirect to /login: OK")

    # 2. Try accessing other admin dashboard routes without login (should redirect to login)
    resp = client.get("/admin/dashboard", follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/admin/login"
    print("Un-setup dashboard access redirect to /login: OK")

    # 3. Post login to get chef session (which redirects to setup since setup is incomplete)
    print("Posting chef login for lunabar...")
    luna_email = "lunabar@digi-gastro.de"
    luna_db = restaurants["lunabar"]
    luna_pw = luna_db["password"]
    resp = client.post("/admin/login", data={"email": luna_email, "password": luna_pw}, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/admin/setup"
    
    luna_session = resp.headers.get("set-cookie")
    luna_cookie_value = luna_session.split(";")[0].split("=")[1]
    luna_cookies = {"session": luna_cookie_value}
    print("Chef login session captured and setup redirection confirmed: OK")

    # 3b. Authenticated request to /admin should now redirect to setup
    print("Testing authorized admin root redirect to setup...")
    resp_auth = client.get("/admin", cookies=luna_cookies, follow_redirects=False)
    assert resp_auth.status_code in [302, 303, 307]
    assert resp_auth.headers["location"] == "/admin/setup"
    print("Authorized admin root redirect to /setup: OK")

    # 4. Post setup completion form for lunabar
    print("Submitting setup-complete form for lunabar...")
    setup_data = {
        "has_kitchen": "true",
        "is_shishabar": ""
    }
    resp = client.post("/admin/setup-complete", data=setup_data, cookies=luna_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/admin/dashboard"
    print("Setup completion form submitted: OK")

    # 5. Verify DB state after setup
    luna_db = restaurants["lunabar"]
    assert luna_db["is_setup_completed"] is True
    assert luna_db["is_onboarded"] is True
    assert luna_db["has_kitchen"] is True
    assert luna_db["is_shishabar"] is False
    assert len(luna_db["tables"]) == 0
    assert any(s["name"] in ["Chef", "Owner"] and s["role"] == "chef" for s in luna_db["staff"])
    assert "Burger" in luna_db["categories"]
    assert "Shisha" not in luna_db["categories"]
    print("Setup DB variables & settings verified: OK")

    # 6. Access admin dashboard with completed setup session
    resp = client.get("/admin/dashboard", cookies=luna_cookies)
    assert resp.status_code == 200
    assert "Luna Bar" in resp.text
    print("Set up admin dashboard access: OK")

    # 7. Update profile to toggle kitchen off and shisha on
    print("Testing profile settings live updates...")
    resp = client.post("/admin/profile-update", data={
        "has_kitchen": "",
        "is_shishabar": "true",
        "impressum_content": "Custom Impressum Text",
        "datenschutz_content": "Custom Datenschutz Text"
    }, cookies=luna_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    
    # Verify DB updated
    luna_db = restaurants["lunabar"]
    assert luna_db["has_kitchen"] is False
    assert luna_db["is_shishabar"] is True
    assert luna_db["impressum_content"] == "Custom Impressum Text"
    assert luna_db["datenschutz_content"] == "Custom Datenschutz Text"
    assert "Shisha" in luna_db["categories"]
    assert "Burger" not in luna_db["categories"]
    print("Profile update live adjustments: OK")

    # ==========================================
    # NEW REFACTORING TESTS (PRO FEATURE EXTENSIONS)
    # ==========================================
    print("\n--- Starting Pro-Refactoring Integration Tests ---")

    # 1. Test Product Creation via Admin POST Route
    print("Testing custom product creation (POST /admin/produkt-erstellen)...")
    product_data = {
        "name": "Spezial Shisha",
        "preis": 15.99,
        "kategorie": "Spezialitäten",
        "description": "Double apple high-end shisha flavor",
        "image": "",
        "is_vegan": "true",
        "is_glutenfree": ""
    }
    resp_prod = client.post("/admin/produkt-erstellen", data=product_data, cookies=luna_cookies, follow_redirects=False)
    assert resp_prod.status_code in [302, 303, 307]
    
    # Verify product successfully saved to DB
    luna_products = restaurants["lunabar"]["products"]
    created_prod = next((p for p in luna_products if p["name"] == "Spezial Shisha"), None)
    assert created_prod is not None, "Product was not created!"
    assert created_prod["price"] == 15.99
    assert created_prod["category"] == "Spezialitäten"
    assert created_prod["is_vegan"] is True
    assert created_prod["is_glutenfree"] is False
    assert "Spezialitäten" in restaurants["lunabar"]["categories"], "Category was not automatically created!"
    print("Custom product creation and auto category setup: OK")

    # 2. Test Guest Service and Payment Modal API calls
    print("Testing call-service API from guest view (POST /api/lunabar/call-service)...")
    service_payload = {
        "type": "kellner",
        "table": "Tisch 3",
        "token": "lunabar2026"
    }
    resp_service = client.post("/api/lunabar/call-service", json=service_payload)
    assert resp_service.status_code == 200
    res_json = resp_service.json()
    assert res_json["success"] is True
    call_id = res_json["call_id"]
    
    # Verify call successfully saved in DB service calls list
    luna_calls = restaurants["lunabar"]["service_calls"]
    print("DEBUG LUNA CALLS:", luna_calls, "CALL ID:", call_id, "TYPES:", [type(c["id"]) for c in luna_calls], type(call_id))
    assert any(str(c["id"]) == str(call_id) and c["table"] == "Tisch 3" and c["type"] == "kellner" for c in luna_calls)
    print("Service Call API: OK")

    # 3. Test Tablet Polling status API
    print("Testing tablet poller API (GET /api/tablet-status)...")
    resp_status = client.get("/api/tablet-status", cookies=luna_cookies)
    assert resp_status.status_code == 200
    status_json = resp_status.json()
    assert "orders" in status_json
    assert "service_calls" in status_json
    assert any(c["id"] == call_id for c in status_json["service_calls"])
    print("Tablet Poller Status API: OK")

    # 4. Test Employee lock restriction on Web admin (POST table-erstellen with staff waiter cookies -> 403)
    print("Testing staff separation on admin routes...")
    waiter_cookies = {"session": "lunabar:Anna:kellner:1234"}
    resp_staff_blocked = client.post("/admin/table-erstellen", data={"number": "9", "zone": "innen"}, cookies=waiter_cookies, follow_redirects=False)
    assert resp_staff_blocked.status_code == 403
    print("Waiter access to admin POST route blocked: OK")


    # ==========================================
    # NEW TOKEN-BASED GASTRO OS & SECURITY TESTS (PILLARS 1 - 4)
    # ==========================================
    print("\n--- Starting High-End Token-Based Gastro OS & Security Tests ---")

    # 1. Säule 1: Tisch-Tokens & Gäste-Session (Read-only vs. Session-Cookie)
    print("Testing Tisch-Tokens & is_readonly Flag...")
    client.cookies.clear() # Clear any session cookies from previous setup/admin tests
    resp = client.get("/demo")
    assert resp.status_code == 200
    assert resp.context["is_readonly"] is True
    print("Default menu load without params is Read-only: OK")

    # Admin preview bypass check
    resp = client.get("/demo?preview=true")
    assert resp.status_code == 200
    assert resp.context["is_readonly"] is False
    assert resp.context["table"] == "Vorschau"
    print("Admin preview bypass (?preview=true): OK")

    # Set up tables with specific security tokens
    r_data["tables"][0]["security_token"] = "table1tok"
    
    # Access with wrong token -> expecting Sitz expired redirect
    resp = client.get("/demo?tisch=1&token=wrongtoken", follow_redirects=False)
    assert resp.status_code == 302 or resp.status_code == 307 or resp.status_code == 303
    assert resp.headers["location"] == "/demo/sitz-expired"
    print("Access with wrong token redirected to expired: OK")

    # Access with correct token -> expecting cookie emission and is_readonly=False
    resp = client.get("/demo?tisch=1&token=table1tok")
    assert resp.status_code == 200
    assert resp.context["is_readonly"] is False
    # Validate session cookie is set
    guest_cookie = resp.headers.get("set-cookie")
    assert guest_cookie is not None
    assert f"guest_session_demo" in guest_cookie
    guest_cookie_val = guest_cookie.split(";")[0].split("=")[1]
    guest_cookies = {f"guest_session_demo": guest_cookie_val}
    print("Access with valid table token sets session cookie: OK")

    # Order placement without token or cookie -> expect 403
    client.cookies.clear()
    bad_order = {
        "table": "Tisch 1",
        "items": [{"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}]
    }
    resp = client.post("/demo/bestellen", json=bad_order)
    assert resp.status_code == 403
    print("Ordering without token or cookie blocked: OK")

    # Order placement with cookie -> expect 200
    resp = client.post("/demo/bestellen", json=bad_order, cookies=guest_cookies)
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    print("Ordering with guest_session cookie permitted: OK")



    # 4. Säule 4: Chef-PIN storno protection
    print("Testing Chef-PIN storno protection...")
    resp = client.post("/demo/tablet/stornieren/2", data={"pin": "1234"})
    assert resp.status_code == 403
    print("Storno with waiter PIN blocked: OK")

    resp = client.post("/demo/tablet/stornieren/2", data={"pin": "1111"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    print("Storno with chef PIN permitted: OK")

    # 5. Product Update API
    print("Testing Product Update API (PUT /api/products/{product_id})...")
    client.cookies.set("session", "demo:Chef:chef:1111")
    product_update_payload = {
        "name": "Super Burger",
        "price": 12.99,
        "description": "Premium juicy beef burger",
        "category": "Burger"
    }
    resp = client.put("/api/products/1", json=product_update_payload)
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # Check if the product was updated in memory cache
    p_updated = next(p for p in restaurants["demo"]["products"] if p["id"] == 1)
    assert p_updated["name"] == "Super Burger"
    assert p_updated["price"] == 12.99
    print("Product Update API: OK")

    # 6. Order Confirmation API
    print("Testing Order Confirmation API (POST /{slug}/orders/confirm/{order_id})...")
    order_payload = {
        "table": "Tisch 99",
        "token": "mastertoken123",
        "items": [
            {"product_id": 1, "name": "Super Burger", "price": 12.99, "quantity": 1}
        ],
        "tip_amount": 0.0
    }
    resp = client.post("/demo/bestellen", json=order_payload)
    new_order_id = resp.json()["order_id"]
    
    # Confirm the order
    resp = client.post(f"/demo/orders/confirm/{new_order_id}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # Check if order status is now "bestaetigt" in cache
    o_updated = next(o for o in restaurants["demo"]["orders"] if o["id"] == new_order_id)
    assert o_updated["status"] == "bestaetigt"
    print("Order Confirmation API: OK")

    # 7. Table Merge / Transfer API
    print("Testing Table Merge / Transfer API...")
    restaurants["demo"]["tables"] = [
        {"number": "3", "zone": "innen", "security_token": "token-tisch-3"},
        {"number": "4", "zone": "innen", "security_token": "token-tisch-4"}
    ]
    
    # Place order on Tisch 3
    resp = client.post("/demo/bestellen", json={
        "table": "Tisch 3",
        "token": "demo2026",
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    })
    assert resp.status_code == 200
    
    # Place order on Tisch 4
    resp = client.post("/demo/bestellen", json={
        "table": "Tisch 4",
        "token": "demo2026",
        "items": [
            {"product_id": 1, "name": "Super Burger", "price": 12.99, "quantity": 1}
        ]
    })
    assert resp.status_code == 200
    
    # Call merge endpoint
    resp = client.post("/demo/tablet/tische-zusammenfuehren", data={
        "source_table": "3",
        "target_table": "4"
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # Verify the cache values
    tisch3_orders = [o for o in restaurants["demo"]["orders"] if o.get("table") in ["Tisch 3", "3"] and o.get("status") not in ["bezahlt", "storniert"]]
    assert len(tisch3_orders) == 0, f"Expected 0 active orders for Tisch 3, got {len(tisch3_orders)}"
    
    tisch4_orders = [o for o in restaurants["demo"]["orders"] if o.get("table") in ["Tisch 4", "4"] and o.get("status") not in ["bezahlt", "storniert"]]
    assert len(tisch4_orders) == 1
    
    merged_order = tisch4_orders[0]
    # Items should be Burger (qty 1) and Spezi (qty 1)
    assert len(merged_order["items"]) == 2
    spezi_item = next(item for item in merged_order["items"] if item["product_id"] == 4)
    burger_item = next(item for item in merged_order["items"] if item["product_id"] == 1)
    assert spezi_item["quantity"] == 1
    assert burger_item["quantity"] == 1
    
    # Security token of Tisch 4 should match Tisch 3's token
    t3_table = next(t for t in restaurants["demo"]["tables"] if t["number"] == "3")
    t4_table = next(t for t in restaurants["demo"]["tables"] if t["number"] == "4")
    assert t4_table["security_token"] == t3_table["security_token"]
    print("Table Merge / Transfer API: OK")

    # 8. Tisch-Tokens & Sitzung Wiederkehrend-Scan Test
    print("Testing table session printed token scan-to-re-login (Issue 2)...")
    client.cookies.clear() # Clear any session cookies from previous setup/admin/chef tests
    # Reset table 3 token to static initial value
    t3_table = next(t for t in restaurants["demo"]["tables"] if t["number"] == "3")
    t3_table["security_token"] = "token-tisch-3"
    t3_table["active_session_token"] = None
    
    # 8a. Scan the printed QR code first time (Tisch 3, token=token-tisch-3)
    resp = client.get("/demo?tisch=3&token=token-tisch-3")
    assert resp.status_code == 200
    assert resp.context["is_readonly"] is False
    cookie_header = resp.headers.get("set-cookie")
    assert cookie_header is not None
    guest_cookie_val = cookie_header.split(";")[0].split("=")[1]
    guest_cookies_t3 = {"guest_session_demo": guest_cookie_val}
    
    # Verify active session token is populated
    t3_table = next(t for t in restaurants["demo"]["tables"] if t["number"] == "3")
    active_tok_1 = t3_table["active_session_token"]
    assert active_tok_1 is not None
    assert active_tok_1 != "token-tisch-3"
    
    # 8b. Place an order using the guest session cookie
    order_payload = {
        "table": "Tisch 3",
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    }
    resp = client.post("/demo/bestellen", json=order_payload, cookies=guest_cookies_t3)
    assert resp.status_code == 200
    order_id_t3 = resp.json()["order_id"]
    
    # 8c. Process payment/clear table
    resp = client.post(f"/demo/tablet/bezahlen/{order_id_t3}")
    assert resp.status_code == 200
    
    # 8d. Accessing the table with the old session cookie should now redirect to sitz-expired
    resp = client.get("/demo", cookies=guest_cookies_t3, follow_redirects=False)
    assert resp.status_code == 303
    assert resp.headers["location"] == "/demo/sitz-expired"
    
    # 8e. Re-scanning the static printed QR code (Tisch 3, token=token-tisch-3) should succeed and open the menu
    resp = client.get("/demo?tisch=3&token=token-tisch-3")
    assert resp.status_code == 200
    assert resp.context["is_readonly"] is False
    cookie_header_2 = resp.headers.get("set-cookie")
    assert cookie_header_2 is not None
    guest_cookie_val_2 = cookie_header_2.split(";")[0].split("=")[1]
    assert guest_cookie_val_2 != guest_cookie_val
    print("Printed QR Code scan-to-re-login: OK")

    # 9. PWA Tests
    print("Testing PWA routes...")
    resp = client.get("/manifest.json")
    assert resp.status_code == 200
    assert resp.json()["short_name"] == "digi-gastro"
    
    resp = client.get("/sw.js")
    assert resp.status_code == 200
    assert "CACHE_NAME" in resp.text
    print("PWA routes: OK")

    # 10. WebSocket Route Check
    print("Testing WebSocket endpoint...")
    guest_cookies_active = {"guest_session_demo": guest_cookie_val_2}
    with client.websocket_connect("/ws/demo") as websocket:
        # Trigger service call which broadcasts to websockets
        resp = client.post("/demo/service-ruf", json={"type": "service", "table": "Tisch 3"}, cookies=guest_cookies_active)
        assert resp.status_code == 200
        # Receive websocket broadcast
        data = websocket.receive_json()
        assert data == {"type": "update"}
    print("WebSocket endpoint and broadcast: OK")

    # 11. Multilingual product updates and details tests
    print("Testing Multilingual product fields...")
    # Update product 7 ("Klassische Shisha") to have English name and description
    update_payload = {
        "name": "Klassische Shisha",
        "price": 12.00,
        "description": "Klassische Shisha mit intensivem Geschmack",
        "category": "Shisha",
        "name_en": "Classic Shisha",
        "description_en": "Classic shisha with intense flavor"
    }
    resp = client.put("/api/products/7", json=update_payload, cookies=dl_cookies)
    assert resp.status_code == 200
    
    # Get products and check if English fields are stored
    from database import SessionLocal, Product
    db = SessionLocal()
    try:
        prod = db.query(Product).filter_by(id=7).first()
        assert prod.name_en == "Classic Shisha"
        assert prod.description_en == "Classic shisha with intense flavor"
    finally:
        db.close()
    print("Multilingual product database storage: OK")

    # 12. Admin Impersonate and check-session staff bypass tests
    print("Testing admin impersonation and check-session staff bypass...")
    # Impersonating table 3 should redirect and load successfully (expecting 200 follow redirects)
    resp = client.get("/admin/impersonate/3", cookies=dl_cookies, follow_redirects=True)
    assert resp.status_code == 200
    
    # Check check-session API with chef session cookies -> should return active=True
    resp = client.get("/api/demo/check-session", cookies=dl_cookies)
    assert resp.status_code == 200
    assert resp.json() == {"active": True}
    print("Admin impersonation and check-session staff bypass: OK")
 
    # 13. Bulk Pay and Cancel API Tests
    print("Testing bulk pay and cancel APIs...")
    # First, let's create a new order with multiple items
    order_payload = {
        "table": "Tisch 5",
        "token": restaurants["demo"]["security_token"],
        "items": [
            {"product_id": 1, "name": "Premium Burger", "price": 14.50, "quantity": 3},
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 2}
        ]
    }
    resp = client.post("/demo/bestellen", json=order_payload)
    assert resp.status_code == 200
    bulk_order_id = resp.json()["order_id"]

    # Let's perform a bulk pay on:
    # 1x Premium Burger (14.50)
    # 1x Spezi (3.50)
    # total to pay: 18.00
    bulk_pay_payload = {
        "items": [
            {"item_key": "1_", "quantity": 1},
            {"item_key": "4_", "quantity": 1}
        ]
    }
    resp = client.post(f"/demo/tablet/pay-items-bulk/{bulk_order_id}", json=bulk_pay_payload, cookies=dl_cookies)
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    assert resp.json()["paid_amount"] == 18.00

    # Let's check remaining items in restaurants cache
    r_data = restaurants["demo"]
    ord_cached = next(o for o in r_data["orders"] if o["id"] == bulk_order_id)
    # Premium Burger quantity should be 2, Spezi quantity should be 1
    assert any(i["product_id"] == 1 and i["quantity"] == 2 for i in ord_cached["items"])
    assert any(i["product_id"] == 4 and i["quantity"] == 1 for i in ord_cached["items"])

    # Let's perform a bulk cancel on:
    # 1x Premium Burger
    # 1x Spezi
    # total to cancel: 18.00
    bulk_cancel_payload = {
        "items": [
            {"item_key": "1_", "quantity": 1},
            {"item_key": "4_", "quantity": 1}
        ],
        "pin": "1111"  # Chef pin
    }
    resp = client.post(f"/demo/tablet/cancel-items-bulk/{bulk_order_id}", json=bulk_cancel_payload, cookies=dl_cookies)
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    assert ord_cached["items"][0]["product_id"] == 1
    assert ord_cached["items"][0]["quantity"] == 1

    # 14. Test repeat orders (Classic Shisha issue) and status-sensitive splitting
    print("Testing repeat orders logic (Classic Shisha status-sensitive separation)...")
    # Scan Tisch 3 to get a fresh valid session cookie
    resp_scan = client.get("/demo?tisch=3&token=token-tisch-3")
    assert resp_scan.status_code == 200
    cookie_header = resp_scan.headers.get("set-cookie")
    assert cookie_header is not None
    shisha_cookie_val = cookie_header.split(";")[0].split("=")[1]
    shisha_cookies = {"guest_session_demo": shisha_cookie_val}

    shisha_order_payload = {
        "table": "Tisch 3",
        "items": [
            {"product_id": 7, "name": "Klassische Shisha", "price": 12.00, "quantity": 1}
        ]
    }
    resp = client.post("/demo/bestellen", json=shisha_order_payload, cookies=shisha_cookies)
    assert resp.status_code == 200
    shisha_order_id = resp.json()["order_id"]

    r_data = restaurants["demo"]
    ord_cached = next(o for o in r_data["orders"] if o["id"] == shisha_order_id)
    shisha_item = ord_cached["items"][0]
    assert shisha_item["item_status"] == "pending"

    # Confirm and deliver this shisha
    resp = client.post(f"/demo/tablet/item-status/{shisha_order_id}", json={"item_key": "7__pending", "status": "confirmed"}, cookies=dl_cookies)
    assert resp.status_code == 200
    resp = client.post(f"/demo/tablet/item-status/{shisha_order_id}", json={"item_key": "7__confirmed", "status": "delivered"}, cookies=dl_cookies)
    assert resp.status_code == 200

    # Verify status is now 'delivered'
    r_data = restaurants["demo"]
    ord_cached = next(o for o in r_data["orders"] if o["id"] == shisha_order_id)
    assert ord_cached["items"][0]["item_status"] == "delivered"

    # Now order it again
    resp = client.post("/demo/bestellen", json=shisha_order_payload, cookies=shisha_cookies)
    assert resp.status_code == 200
    
    # Verify two separate items in the order
    r_data = restaurants["demo"]
    ord_cached = next(o for o in r_data["orders"] if o["id"] == shisha_order_id)
    assert len(ord_cached["items"]) == 2
    
    delivered_shisha = next(i for i in ord_cached["items"] if i["item_status"] == "delivered")
    pending_shisha = next(i for i in ord_cached["items"] if i["item_status"] == "pending")
    assert delivered_shisha["quantity"] == 1
    assert pending_shisha["quantity"] == 1
    print("Repeat orders status-sensitive separation: OK")

    # 9. New Features and Bug Fixes verification
    print("Testing Tisch umbuchen order merge logic...")

    # Reset tables 3 & 4 with fresh, known tokens and clear their active orders.
    # We build the complete final lists in one step and assign once so the
    # LiveDictProxy.__setitem__ is triggered and saves to the DB.
    r_data = restaurants["demo"]
    current_tables = list(r_data["tables"])            # read from DB → plain list
    new_tables = [t for t in current_tables if t.get("number") not in ("3", "4")]
    new_tables += [
        {"number": "3", "zone": "innen", "security_token": "sec-t3-test", "active_session_token": None},
        {"number": "4", "zone": "innen", "security_token": "sec-t4-test", "active_session_token": None},
    ]
    r_data["tables"] = new_tables                       # single assignment → persists to DB

    current_orders = list(r_data["orders"])             # read from DB → plain list
    new_orders = [
        o for o in current_orders
        if o.get("table") not in ("Tisch 3", "Tisch 4", "3", "4")
        or o.get("status") in ("bezahlt", "storniert")
    ]
    r_data["orders"] = new_orders                       # single assignment → persists to DB

    # Log in as Tisch 3 (table is free → server generates new active_session_token, redirects with set-cookie)
    client.cookies.clear()
    resp = client.get("/demo?tisch=3&token=sec-t3-test", follow_redirects=False)
    assert resp.status_code == 303, f"Tisch 3 login: expected 303, got {resp.status_code}; location={resp.headers.get('location')}"
    sc3 = resp.headers.get("set-cookie")
    assert sc3 is not None, f"No set-cookie for Tisch 3 (redirect to {resp.headers.get('location')})"
    t3_cookie = sc3.split(";")[0].split("=", 1)[1]
    t3_cookies = {"guest_session_demo": t3_cookie}

    # Log in as Tisch 4 using its printed security_token
    client.cookies.clear()
    resp = client.get("/demo?tisch=4&token=sec-t4-test", follow_redirects=False)
    assert resp.status_code == 303, f"Tisch 4 login: expected 303, got {resp.status_code}; location={resp.headers.get('location')}"
    sc4 = resp.headers.get("set-cookie")
    assert sc4 is not None, f"No set-cookie for Tisch 4 (redirect to {resp.headers.get('location')})"
    t4_cookie = sc4.split(";")[0].split("=", 1)[1]
    t4_cookies = {"guest_session_demo": t4_cookie}

    # Add a target order on Tisch 4
    resp = client.post("/demo/bestellen", json={
        "table": "Tisch 4",
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    }, cookies=t4_cookies)
    assert resp.status_code == 200
    tisch4_order_id = resp.json()["order_id"]

    # Place a separate order on Tisch 3
    resp = client.post("/demo/bestellen", json={
        "table": "Tisch 3",
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    }, cookies=t3_cookies)
    assert resp.status_code == 200
    tisch3_order_id = resp.json()["order_id"]

    # Transfer Tisch 3's order to Tisch 4 (should merge quantities)
    resp = client.post("/demo/tablet/transfer-order", json={
        "order_id": tisch3_order_id,
        "target_table": "4"
    }, cookies=dl_cookies)
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    # Verify that tisch3 order was removed from orders, and tisch4 order has Spezi quantity = 2
    r_data = restaurants["demo"]
    o_t3 = next((o for o in r_data["orders"] if o["id"] == tisch3_order_id), None)
    assert o_t3 is None
    o_t4 = next(o for o in r_data["orders"] if o["id"] == tisch4_order_id)
    assert o_t4["items"][0]["quantity"] == 2
    print("Tisch umbuchen order merge logic: OK")

    # ── Test manual product addition via flat endpoint ──
    print("Testing flat manual order item addition...")
    # Add manual product 4 (Spezi) on Tisch 4
    add_payload = {
        "table_number": "4",
        "product_id": 4,
        "quantity": 3
    }
    resp = client.post("/api/admin/orders/add-manual", json=add_payload, cookies=dl_cookies)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert resp.json()["success"] is True
    
    # Verify the order item was added with item_status='pending'
    r_data = restaurants["demo"]
    o_t4 = next(o for o in r_data["orders"] if o["table"] == "Tisch 4" and o["status"] not in ["bezahlt", "storniert"])
    
    spezi_item_pending = next(item for item in o_t4["items"] if item["product_id"] == 4 and (item.get("item_status") or "pending") == "pending")
    assert spezi_item_pending["quantity"] == 5
    print("Flat manual order item addition: OK")

    # ── Test serve order items via flat endpoint ──
    print("Testing flat serve order items...")
    # Place a pending order first
    # Add a pending item to the order manually in r_data for testing
    o_t4["items"].append({
        "product_id": 1,
        "name": "Premium Burger",
        "price": 14.50,
        "quantity": 1,
        "category_type": "küche",
        "note": "",
        "item_status": "pending"
    })
    o_t4["total"] = round(o_t4["total"] + 14.50, 2)
    o_t4["total_with_tip"] = round(o_t4["total_with_tip"] + 14.50, 2)
    r_data["orders"] = list(r_data["orders"]) # sync db
    
    # Confirm it has a pending item
    has_pending = any(item["item_status"] == "pending" for item in o_t4["items"])
    assert has_pending is True
    
    # Call serve endpoint
    serve_payload = {
        "order_id": o_t4["id"]
    }
    resp = client.post("/admin/orders/serve", json=serve_payload, cookies=dl_cookies)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    assert resp.json()["success"] is True
    
    # Verify that all pending items are now 'delivered'
    r_data = restaurants["demo"]
    o_t4_updated = next(o for o in r_data["orders"] if o["id"] == o_t4["id"])
    assert all(item["item_status"] == "delivered" for item in o_t4_updated["items"])
    print("Flat serve order items: OK")

    print("Testing complete order stornieren (BON STORNO)...")
    # After transfer, Tisch 3 is free again. Re-login with its security_token.
    client.cookies.clear()
    resp = client.get("/demo?tisch=3&token=sec-t3-test", follow_redirects=False)
    assert resp.status_code == 303, f"Tisch 3 re-login: expected 303, got {resp.status_code}"
    sc3_new = resp.headers.get("set-cookie")
    assert sc3_new is not None, "No set-cookie for Tisch 3 after transfer"
    t3_cookie_new = sc3_new.split(";")[0].split("=", 1)[1]
    t3_cookies_new = {"guest_session_demo": t3_cookie_new}

    # Place another order on Tisch 3
    resp = client.post("/demo/bestellen", json={
        "table": "Tisch 3",
        "items": [
            {"product_id": 4, "name": "Spezi", "price": 3.50, "quantity": 1}
        ]
    }, cookies=t3_cookies_new)
    assert resp.status_code == 200
    new_order_id = resp.json()["order_id"]

    # Perform BON STORNO with Chef PIN
    resp = client.post(f"/demo/tablet/stornieren/{new_order_id}", data={"pin": "1111"}, cookies=dl_cookies)
    assert resp.status_code == 200
    assert resp.json()["success"] is True

    r_data = restaurants["demo"]
    o_storno = next(o for o in r_data["orders"] if o["id"] == new_order_id)
    assert o_storno["status"] == "storniert"
    print("Complete order stornieren (BON STORNO): OK")

    print("Testing root UID & Tisch redirection...")
    resp = client.get("/?uid=demo&tisch=3", follow_redirects=False)
    assert resp.status_code == 303, f"Expected 303 redirect, got {resp.status_code}"
    assert "tisch=3" in resp.headers["location"]
    assert "token=sec-t3-test" in resp.headers["location"]
    print("Root UID & Tisch redirection: OK")

    print("\nALL INTEGRATION TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    try:
        test_integration()
    except AssertionError as e:
        traceback.print_exc()
        print(f"\nTEST FAILED: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        traceback.print_exc()
        print(f"\nUNEXPECTED ERROR: {e}", file=sys.stderr)
        sys.exit(1)
