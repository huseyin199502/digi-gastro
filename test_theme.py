from fastapi.testclient import TestClient
import main
from main import app, restaurants
from database import Tenant, SessionLocal
import copy

db = SessionLocal()
tenant = db.query(Tenant).filter_by(slug="demo").first()
if not tenant:
    tenant = Tenant(slug="demo", name="Demo Lounge", email="demo@digi-gastro.de", password="password123", is_setup_completed=True)
    db.add(tenant)
    db.commit()

client = TestClient(app)

# Login to get session
login_resp = client.post("/admin/login", data={"email": "demo@digi-gastro.de", "password": "password123"}, follow_redirects=False)
session_cookie = login_resp.headers.get("set-cookie")
cookie_value = session_cookie.split(";")[0].split("=")[1]
cookies = {"session": cookie_value}

print("Submitting branding update with theme='light'...")
resp = client.post("/admin/branding", data={
    "address": "Teststreet 1",
    "theme": "light"
}, cookies=cookies, follow_redirects=False)

print("Response status code (should be redirect 303):", resp.status_code)

# Check database
db.close()
db = SessionLocal()
updated_tenant = db.query(Tenant).filter_by(slug="demo").first()
print("Saved theme in DB:", updated_tenant.theme)

# Load restaurant dict
r_dict = main.load_restaurant_from_db("demo", db)
print("Loaded theme in dict:", r_dict.get("theme"))
db.close()
