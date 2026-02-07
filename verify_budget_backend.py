import requests

API_URL = "http://localhost:8000/budget/"

def test_budget():
    print("Testing Budget API...")
    
    # 1. Update/Set Budget
    new_budget = {"limit_amount": 1000.0, "period": "monthly"}
    print(f"Setting budget to: {new_budget}")
    try:
        response = requests.post(API_URL, json=new_budget)
        if response.status_code == 200:
            print("[PASS] Budget updated successfully.")
            print(f"Response: {response.json()}")
        else:
            print(f"[FAIL] Failed to update budget. Status: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")
        return

    # 2. Get Budget
    print("Fetching budget...")
    try:
        response = requests.get(API_URL)
        if response.status_code == 200:
            data = response.json()
            if data['limit_amount'] == 1000.0:
                print("[PASS] Budget fetched correctly.")
            else:
                print(f"[FAIL] Budget mismatch. Expected 1000.0, got {data.get('limit_amount')}")
        else:
            print(f"[FAIL] Failed to get budget. Status: {response.status_code}")
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")

if __name__ == "__main__":
    test_budget()
