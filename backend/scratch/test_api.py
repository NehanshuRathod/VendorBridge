import requests
import time
import sys
import datetime

BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "admin@vendorbridge.com"
VENDOR_EMAIL = "vendor@vendorbridge.com"
PASSWORD = "Password123!"

state = {}

def print_step(msg):
    print(f"\n[{datetime.datetime.now().strftime('%H:%M:%S')}] \033[1m{msg}\033[0m")

def print_success(msg):
    print(f"  \033[92m[SUCCESS]\033[0m {msg}")

def print_error(msg):
    print(f"  \033[91m[ERROR]\033[0m {msg}")
    sys.exit(1)

def do_post(endpoint, json=None, headers=None, expect_status=200):
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.post(url, json=json, headers=headers)
        if resp.status_code != expect_status:
            print_error(f"POST {endpoint} failed: {resp.status_code} - {resp.text}")
        return resp.json()
    except Exception as e:
        print_error(f"POST {endpoint} failed: {str(e)}")

def do_get(endpoint, headers=None, expect_status=200):
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.get(url, headers=headers)
        if resp.status_code != expect_status:
            print_error(f"GET {endpoint} failed: {resp.status_code} - {resp.text}")
        return resp.json()
    except Exception as e:
        print_error(f"GET {endpoint} failed: {str(e)}")

def do_put(endpoint, json=None, headers=None, expect_status=200):
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.put(url, json=json, headers=headers)
        if resp.status_code != expect_status:
            print_error(f"PUT {endpoint} failed: {resp.status_code} - {resp.text}")
        return resp.json()
    except Exception as e:
        print_error(f"PUT {endpoint} failed: {str(e)}")

def do_patch(endpoint, json=None, headers=None, expect_status=200):
    url = f"{BASE_URL}{endpoint}"
    try:
        resp = requests.patch(url, json=json, headers=headers)
        if resp.status_code != expect_status:
            print_error(f"PATCH {endpoint} failed: {resp.status_code} - {resp.text}")
        return resp.json()
    except Exception as e:
        print_error(f"PATCH {endpoint} failed: {str(e)}")


def run_tests():
    print_step("1. Waiting for Application to Start")
    retries = 30
    while retries > 0:
        try:
            r = requests.get("http://localhost:8080/actuator/health")
            if r.status_code == 200:
                print_success("Application is up!")
                break
        except requests.exceptions.ConnectionError:
            pass
        print(f"Waiting for app... ({retries} retries left)")
        time.sleep(5)
        retries -= 1
    
    if retries == 0:
        print_error("Application failed to start in time.")

    print_step("2. Register and Login ADMIN")
    resp = do_post("/auth/register", json={
        "email": ADMIN_EMAIL,
        "password": PASSWORD,
        "fullName": "Admin User",
        "role": "ADMIN"
    })
    # Ignore 400 if already exists
    # Or just login
    resp = do_post("/auth/login", json={"email": ADMIN_EMAIL, "password": PASSWORD})
    admin_token = resp['data']['accessToken']
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print_success("Admin logged in")

    print_step("3. Register and Login VENDOR_USER")
    do_post("/auth/register", json={
        "email": VENDOR_EMAIL,
        "password": PASSWORD,
        "fullName": "Vendor Rep",
        "role": "VENDOR_USER"
    }, headers=admin_headers)
    resp = do_post("/auth/login", json={"email": VENDOR_EMAIL, "password": PASSWORD})
    vendor_token = resp['data']['accessToken']
    vendor_headers = {"Authorization": f"Bearer {vendor_token}"}
    vendor_user_email = resp['data']['email']
    print_success("Vendor logged in")

    print_step("4. Admin creates Vendor Entity")
    resp = do_post("/vendors", json={
        "companyName": "Acme Corp",
        "gstNumber": f"GST{int(time.time())}",
        "category": "GOODS",
        "contactName": "John Doe",
        "contactEmail": "contact@acme.com",
        "contactPhone": "1234567890",
        "address": "123 Acme St"
    }, headers=admin_headers)
    vendor_id = resp['data']['id']
    state['vendor_id'] = vendor_id
    print_success(f"Vendor created with ID {vendor_id}")

    print_step("5. Admin assigns Vendor User to Vendor Entity")
    # Actually I need the Vendor User ID. Let's get all users
    users_resp = do_get("/users", headers=admin_headers)
    vendor_user_id = None
    for u in users_resp['data']['content']:
        if u['email'] == VENDOR_EMAIL:
            vendor_user_id = u['id']
            break
    
    do_post(f"/vendors/{vendor_id}/users/{vendor_user_id}", headers=admin_headers)
    print_success("Vendor user assigned to vendor entity")

    print_step("6. Admin creates RFQ")
    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
    resp = do_post("/rfqs", json={
        "title": "Need Laptops",
        "description": "50 high-performance laptops",
        "deadline": tomorrow
    }, headers=admin_headers)
    rfq_id = resp['data']['id']
    state['rfq_id'] = rfq_id
    print_success(f"RFQ created with ID {rfq_id}")

    print_step("7. Admin adds Item to RFQ")
    resp = do_post(f"/rfqs/{rfq_id}/items", json={
        "productName": "MacBook Pro M3",
        "description": "16GB RAM, 512GB SSD",
        "quantity": 50,
        "estimatedUnitPrice": 2000
    }, headers=admin_headers)
    rfq_item_id = resp['data']['id']
    print_success(f"RFQ Item added with ID {rfq_item_id}")

    print_step("8. Admin publishes RFQ")
    do_patch(f"/rfqs/{rfq_id}/status", json={"status": "PUBLISHED"}, headers=admin_headers)
    print_success("RFQ published")

    print_step("9. Admin assigns Vendor to RFQ")
    do_post(f"/rfqs/{rfq_id}/vendors", json={"vendorIds": [vendor_id]}, headers=admin_headers)
    print_success("Vendor assigned to RFQ")

    print_step("10. Vendor creates Quotation")
    next_week = (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
    resp = do_post("/quotations", json={
        "rfqId": rfq_id,
        "validUntil": next_week,
        "notes": "Fast delivery guaranteed"
    }, headers=vendor_headers)
    quotation_id = resp['data']['id']
    state['quotation_id'] = quotation_id
    print_success(f"Quotation created with ID {quotation_id}")

    print_step("11. Vendor adds Item to Quotation")
    do_post(f"/quotations/{quotation_id}/items", json={
        "rfqItemId": rfq_item_id,
        "unitPrice": 1950,
        "quantity": 50
    }, headers=vendor_headers)
    print_success("Quotation Item added")

    print_step("12. Vendor submits Quotation")
    do_post(f"/quotations/{quotation_id}/submit", headers=vendor_headers)
    print_success("Quotation submitted")

    print_step("13. Admin compares and selects Quotation")
    do_get(f"/quotations/rfq/{rfq_id}/compare", headers=admin_headers)
    do_post(f"/quotations/{quotation_id}/select", headers=admin_headers)
    print_success("Quotation selected")

    print_step("14. Admin creates Purchase Order")
    resp = do_post("/purchase-orders", json={
        "quotationId": quotation_id,
        "deliveryAddress": "HQ Tech Park",
        "expectedDeliveryDate": tomorrow,
        "taxRate": 18
    }, headers=admin_headers)
    po_id = resp['data']['id']
    state['po_id'] = po_id
    print_success(f"Purchase Order created with ID {po_id}")

    print_step("15. Vendor acknowledges Purchase Order")
    do_post(f"/purchase-orders/{po_id}/acknowledge", headers=vendor_headers)
    print_success("Purchase Order acknowledged")

    print_step("16. Vendor generates Invoice")
    resp = do_post("/invoices", json={
        "purchaseOrderId": po_id,
        "dueDate": next_week,
        "notes": "Thank you for your business"
    }, headers=vendor_headers)
    invoice_id = resp['data']['id']
    state['invoice_id'] = invoice_id
    print_success(f"Invoice generated with ID {invoice_id}")

    print_step("17. Admin fetches Dashboard Metrics")
    resp = do_get("/reports/dashboard", headers=admin_headers)
    print_success("Dashboard metrics retrieved")
    
    print_step("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
