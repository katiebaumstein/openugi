#!/usr/bin/env python3
import requests
import json
import csv
from datetime import datetime

CSV_URL = 'https://huggingface.co/spaces/DontPlanToEnd/UGI-Leaderboard/resolve/main/ugi-leaderboard-data.csv'

def fetch_and_convert_data():
    print("Fetching UGI leaderboard data...")
    
    try:
        response = requests.get(CSV_URL)
        response.raise_for_status()
        
        csv_content = response.text
        
        # First, let's check the headers
        lines = csv_content.strip().split('\n')
        if lines:
            print(f"CSV Headers: {lines[0]}")
        
        # Parse CSV with StringIO
        from io import StringIO
        csv_file = StringIO(csv_content)
        csv_reader = csv.DictReader(csv_file)
        
        data = []
        for row in csv_reader:
            # Get correct column names from the CSV
            model = row.get('author/model_name', '') or row.get('﻿author/model_name', '')
            
            # Handle UGI score
            ugi_val = row.get('UGI 🏆', '0')
            try:
                ugi = float(ugi_val) if ugi_val and ugi_val != 'N/A' else 0.0
            except ValueError:
                ugi = 0.0
            
            # Handle W/10 score
            w10_val = row.get('W/10 👍', '0')
            try:
                w10 = float(w10_val) if w10_val and w10_val != 'N/A' else 0.0
            except ValueError:
                w10 = 0.0
            
            ideology = row.get('Ideology Name', 'Unknown')
            
            # Only add entries with valid model names
            if model.strip():
                model_entry = {
                    'model': model.strip(),
                    'ugi': ugi,
                    'w10': w10,
                    'ideology': ideology.strip() if ideology else 'Unknown'
                }
                data.append(model_entry)
        
        data.sort(key=lambda x: x['ugi'], reverse=True)
        
        output = {
            'lastUpdated': datetime.now().isoformat(),
            'data': data
        }
        
        with open('leaderboard_data.json', 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"Successfully fetched {len(data)} models")
        print("Data saved to leaderboard_data.json")
        
    except Exception as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    fetch_and_convert_data()