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
            {"number": "12", "zone": "terrasse"}
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
    print("Testing staff view (GET /demo/tablet)...")
    resp = client.get("/demo/tablet")
    assert resp.status_code == 200
    assert "Tisch 99" in resp.text
    # Total sum: 14.50 + 2*3.50 = 21.50
    assert "21.50" in resp.text
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
    assert resp.status_code == 307 or resp.status_code == 302
    assert resp.headers["location"] == "/demo/admin/login"
    print("Admin unauthorized check: OK")

    # 7. Admin login view
    print("Testing admin login page (GET /demo/admin/login)...")
    resp = client.get("/demo/admin/login")
    assert resp.status_code == 200
    assert "Admin Login" in resp.text or "Log-In" in resp.text or "E-Mail" in resp.text
    print("Admin login page load: OK")

    # 8. Admin login processing (failed)
    print("Testing failed admin login...")
    resp = client.post("/demo/admin/login", data={"email": "wrong@email.com", "password": "wrong"})
    assert resp.status_code == 200
    assert "Ungültige E-Mail-Adresse" in resp.text
    print("Failed login: OK")

    # 9. Admin login processing (success)
    print("Testing successful admin login...")
    resp = client.post("/demo/admin/login", data={"email": "demo@digi-gastro.de", "password": "password123"}, follow_redirects=False)
    assert resp.status_code == 303 or resp.status_code == 307
    assert resp.headers["location"] == "/demo/admin/dashboard"
    # Capture cookie for further requests
    session_cookie = resp.headers.get("set-cookie")
    print("Successful login & cookie emission: OK")

    # Extract session cookie value
    cookie_value = ""
    if session_cookie:
        cookie_value = session_cookie.split(";")[0].split("=")[1]
    
    # Create cookies dict for requests
    dl_cookies = {f"session_demo": cookie_value}

    # 10. Admin dashboard authenticated access
    print("Testing authorized admin dashboard access...")
    resp = client.get("/demo/admin", cookies=dl_cookies)
    assert resp.status_code == 200
    assert "Admin Dashboard" in resp.text
    # Stats are visible
    assert f"{r_data['bestellungen_gesamt']}" in resp.text
    print("Authorized admin dashboard: OK")

    # 11. Live category creation
    print("Testing dynamic category creation...")
    resp = client.post("/demo/kategorie-erstellen", data={"category-name": "Spezialitäten"}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 303
    assert resp.headers["location"] == "/demo/admin"
    assert "Spezialitäten" in r_data["categories"]
    print("Dynamic category creation: OK")

    # 12. Create staff member
    print("Testing dynamic staff creation...")
    resp = client.post("/demo/admin/staff", data={"staff_name": "Anna Schmidt", "role": "Barkeeper", "pin": "9999"}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 303
    assert any(s["name"] == "Anna Schmidt" for s in r_data["staff"])
    print("Dynamic staff creation: OK")

    # 13. Update branding
    print("Testing dynamic branding update...")
    resp = client.post("/demo/admin/branding", data={"logo_url": "https://host/newlogo.png", "address": "Altstadt 4, München", "instagram": "@neu_ig", "facebook": "/neu_fb"}, cookies=dl_cookies, follow_redirects=False)
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
    
    # Check that they show up in tablet view
    resp = client.get("/demo/tablet")
    assert resp.status_code == 200
    assert "Tisch 5" in resp.text
    assert "Kellner gewünscht!" in resp.text or "Kellner" in resp.text
    assert "Neue Kohle!" in resp.text or "Kohle" in resp.text
    print("Service calls creation & display in tablet: OK")

    # C. Test Service Call resolution
    print("Testing service call resolution (POST /demo/service-erledigt/{id})...")
    resp = client.post(f"/demo/service-erledigt/{call_id_1}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # Verify first call is removed, but second is still there
    resp = client.get("/demo/tablet")
    assert resp.status_code == 200
    assert "Neue Kohle!" in resp.text
    print("Service call resolution: OK")

    # D. Test Token Rotation via Admin
    print("Testing token rotation...")
    old_token = r_data["security_token"]
    resp = client.post("/demo/admin/token-rotieren", cookies=dl_cookies, follow_redirects=False)
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
    resp = client.post("/demo/admin/shishabar-toggle", data={}, cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert restaurants["demo"]["is_shishabar"] is False
    print("Shisha mode toggle off: OK")
    
    # Toggle it back on
    resp = client.post("/demo/admin/shishabar-toggle", data={"is_shishabar": "true"}, cookies=dl_cookies, follow_redirects=False)
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
    resp = client.post("/demo/admin/product-toggle/1", cookies=dl_cookies, follow_redirects=False)
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
    resp = client.post("/demo/admin/product-toggle/1", cookies=dl_cookies, follow_redirects=False)
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
    resp = client.get("/demo/admin/logout", cookies=dl_cookies, follow_redirects=False)
    assert resp.status_code == 302 or resp.status_code == 307 or resp.status_code == 303
    assert resp.headers["location"] == "/demo/admin/login"
    print("Admin logout: OK")

    
    # ==========================================
    # MILESTONE: DYNAMIC SETUP & REDIRECTS
    # ==========================================
    print("\n--- Starting Setup & Dynamic Setup Tests ---")

    # 1. Un-setup tenant (lunabar) access attempt to admin routes without login (should redirect to login)
    print("Testing un-setup tenant admin route access redirect without login...")
    restaurants["lunabar"]["is_setup_completed"] = False
    resp = client.get("/lunabar/admin", follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/lunabar/admin/login"
    print("Un-setup unauthorized redirect to /login: OK")

    # 2. Try accessing other admin dashboard routes without login (should redirect to setup first)
    resp = client.get("/lunabar/admin/dashboard", follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/lunabar/admin/setup"
    print("Un-setup dashboard access redirect to /setup: OK")

    # 3. Post login to get chef session (which redirects to setup since setup is incomplete)
    print("Posting chef login for lunabar...")
    resp = client.post("/lunabar/admin/login", data={"pin": "1111"}, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/lunabar/admin/setup"
    
    luna_session = resp.headers.get("set-cookie")
    luna_cookie_value = luna_session.split(";")[0].split("=")[1]
    luna_cookies = {"session_lunabar": luna_cookie_value}
    print("Chef login session captured and setup redirection confirmed: OK")

    # 3b. Authenticated request to /lunabar/admin should now redirect to setup
    print("Testing authorized admin root redirect to setup...")
    resp_auth = client.get("/lunabar/admin", cookies=luna_cookies, follow_redirects=False)
    assert resp_auth.status_code in [302, 303, 307]
    assert resp_auth.headers["location"] == "/lunabar/admin/setup"
    print("Authorized admin root redirect to /setup: OK")
    luna_cookies = {"session_lunabar": luna_cookie_value}
    print("Chef login session captured: OK")

    # 4. Post setup completion form for lunabar
    print("Submitting setup-complete form for lunabar...")
    setup_data = {
        "has_kitchen": "true",
        "is_shishabar": ""
    }
    resp = client.post("/lunabar/admin/setup-complete", data=setup_data, cookies=luna_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    assert resp.headers["location"] == "/lunabar/admin/dashboard"
    print("Setup completion form submitted: OK")

    # 5. Verify DB state after setup
    luna_db = restaurants["lunabar"]
    assert luna_db["is_setup_completed"] is True
    assert luna_db["is_onboarded"] is True
    assert luna_db["has_kitchen"] is True
    assert luna_db["is_shishabar"] is False
    assert len(luna_db["tables"]) == 5
    assert any(s["name"] == "Chef" and s["role"] == "chef" for s in luna_db["staff"])
    assert "Burger" in luna_db["categories"]
    assert "Shisha" not in luna_db["categories"]
    print("Setup DB variables & settings verified: OK")

    # 6. Access admin dashboard with completed setup session
    resp = client.get("/lunabar/admin/dashboard", cookies=luna_cookies)
    assert resp.status_code == 200
    assert "Luna Bar" in resp.text
    print("Set up admin dashboard access: OK")

    # 7. Update profile to toggle kitchen off and shisha on
    print("Testing profile settings live updates...")
    resp = client.post("/lunabar/admin/profile-update", data={
        "has_kitchen": "",
        "is_shishabar": "true",
        "impressum_content": "Custom Impressum Text",
        "datenschutz_content": "Custom Datenschutz Text"
    }, cookies=luna_cookies, follow_redirects=False)
    assert resp.status_code in [302, 303, 307]
    
    # Verify DB updated
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
    print("Testing custom product creation (POST /lunabar/admin/produkt-erstellen)...")
    product_data = {
        "name": "Spezial Shisha",
        "preis": 15.99,
        "kategorie": "Spezialitäten",
        "description": "Double apple high-end shisha flavor",
        "image": "",
        "is_vegan": "true",
        "is_glutenfree": ""
    }
    resp_prod = client.post("/lunabar/admin/produkt-erstellen", data=product_data, cookies=luna_cookies, follow_redirects=False)
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
    print("Testing tablet poller API (GET /api/lunabar/tablet-status)...")
    resp_status = client.get("/api/lunabar/tablet-status")
    assert resp_status.status_code == 200
    status_json = resp_status.json()
    assert "orders" in status_json
    assert "service_calls" in status_json
    assert any(c["id"] == call_id for c in status_json["service_calls"])
    print("Tablet Poller Status API: OK")

    # 4. Test Employee lock restriction on Web admin (POST table-erstellen with staff waiter cookies -> 403)
    print("Testing staff separation on admin routes...")
    waiter_cookies = {"session_lunabar": "Anna:kellner:1234"}
    resp_staff_blocked = client.post("/lunabar/admin/table-erstellen", data={"number": "9", "zone": "innen"}, cookies=waiter_cookies, follow_redirects=False)
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

    # 2. Säule 2: POS Trusted Device Token
    print("Testing POS Trusted Device Cookie Validation...")
    r_data["pos_token"] = "mypostoken123"
    
    auth_data = {"email": "demo@digi-gastro.de", "password": "password123"}
    resp = client.post("/demo/tablet/autorisieren", data=auth_data, follow_redirects=False)
    assert resp.status_code == 303
    pos_cookie = resp.headers.get("set-cookie")
    assert pos_cookie is not None
    assert "pos_token_demo" in pos_cookie
    print("Tablet authorization sets pos_token cookie: OK")

    # 3. Säule 3: Quick-Tap Staff Login
    print("Testing Quick-Tap Staff Login...")
    resp = client.post("/api/demo/quick-login", data={"name": "Max Mustermann"})
    assert resp.status_code == 200
    res_json = resp.json()
    assert res_json["success"] is True
    assert res_json["name"] == "Max Mustermann"
    assert res_json["role"] == "kellner"
    assert res_json["pin"] == "1234"
    print("Quick-Tap login endpoint verification: OK")

    # 4. Säule 4: Chef-PIN storno protection
    print("Testing Chef-PIN storno protection...")
    resp = client.post("/demo/tablet/stornieren/2", data={"pin": "1234"})
    assert resp.status_code == 403
    print("Storno with waiter PIN blocked: OK")

    resp = client.post("/demo/tablet/stornieren/2", data={"pin": "1111"})
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    print("Storno with chef PIN permitted: OK")

    print("\nALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✅")

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
