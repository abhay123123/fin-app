import requests
import csv
import io
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_filtering():
    print("Testing Date Filtering...")
    # 1. Get all expenses to find a valid date range
    all_expenses = requests.get(f"{BASE_URL}/expenses/").json()
    if not all_expenses:
        print("  [WARN] No expenses found to test filtering.")
        return

    # Pick the date of the first expense
    first_date_str = all_expenses[0]['created_at'].split('T')[0]
    print(f"  Target date: {first_date_str}")

    # 2. Filter by that date
    response = requests.get(f"{BASE_URL}/expenses/?start_date={first_date_str}&end_date={first_date_str}")
    if response.status_code != 200:
        print(f"  [X] Filter request failed: {response.text}")
        return
    
    filtered = response.json()
    print(f"  Filtered count: {len(filtered)}")
    
    if len(filtered) > 0:
        print("  [OK] Filtering returned results.")
    else:
        print("  [X] Filtering returned NO results (Expected at least 1).")

def test_export():
    print("\nTesting CSV Export...")
    response = requests.get(f"{BASE_URL}/expenses/export")
    if response.status_code != 200:
        print(f"  [X] Export request failed: {response.text}")
        return
    
    content = response.content.decode('utf-8')
    reader = csv.reader(io.StringIO(content))
    header = next(reader, None)
    
    if header and header[0] == 'ID':
        print(f"  [OK] CSV Header found: {header}")
        rows = list(reader)
        print(f"  [OK] Exported {len(rows)} rows.")
    else:
        print(f"  [X] Invalid CSV content: {content[:100]}...")

if __name__ == "__main__":
    try:
        test_filtering()
        test_export()
    except Exception as e:
        print(f"\n[X] Test failed: {e}")
