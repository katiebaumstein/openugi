#!/usr/bin/env python3
import time
import subprocess
import os
from datetime import datetime

def fetch_data():
    """Execute the fetch_data.py script"""
    try:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Fetching latest UGI data...")
        result = subprocess.run(['python3', 'fetch_data.py'], 
                              capture_output=True, 
                              text=True,
                              cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ✅ Data successfully updated")
        else:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ Error: {result.stderr}")
    except Exception as e:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ❌ Exception: {str(e)}")

def main():
    """Main loop to fetch data every hour"""
    print("🔄 Auto-fetch service started. Will update data every hour.")
    print("Press Ctrl+C to stop.\n")
    
    # Fetch immediately on start
    fetch_data()
    
    # Then fetch every hour
    while True:
        time.sleep(3600)  # Sleep for 1 hour
        fetch_data()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Auto-fetch service stopped.")