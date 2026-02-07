import requests
import sys

def check_backend():
    try:
        print("Checking Backend (http://localhost:8000/expenses/)...")
        response = requests.get("http://localhost:8000/expenses/")
        if response.status_code == 200:
            print("[PASS] Backend is reachable and returning 200 OK.")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"[FAIL] Backend returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Backend check failed: {e}")
        return False

def check_frontend():
    try:
        print("\nChecking Frontend (http://localhost:5173)...")
        response = requests.get("http://localhost:5173")
        if response.status_code == 200:
            print("[PASS] Frontend is reachable and serving HTML.")
            return True
        else:
            print(f"[FAIL] Frontend returned status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Frontend check failed: {e}")
        return False

def test_create_expense():
    try:
        print("\nTesting Expense Creation (POST /expenses/)...")
        payload = {
            "amount": 12.50,
            "category": "Test",
            "description": "Automated Test",
            "store_name": "Test Store"
        }
        response = requests.post("http://localhost:8000/expenses/", json=payload)
        if response.status_code == 200:
            print("[PASS] Expense created successfully.")
            print(f"   Created Expense: {response.json()}")
            return True
        else:
            print(f"[FAIL] Failed to create expense. Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Expense creation failed: {e}")
        return False

if __name__ == "__main__":
    b_ok = check_backend()
    f_ok = check_frontend()
    
    if b_ok:
        create_ok = test_create_expense()
    else:
        create_ok = False

    if b_ok and f_ok and create_ok:
        print("\n[PASS] SYSTEM VERIFICATION PASSED")
        sys.exit(0)
    else:
        print("\n[FAIL] SYSTEM VERIFICATION FAILED")
        sys.exit(1)
