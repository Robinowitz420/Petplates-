#!/usr/bin/env python3
"""
One-command run script for Reddit Lead Radar
Starts ingestion, scoring, and serves the dashboard
"""

import os
import sys
import subprocess
import threading
import time
import webbrowser
from pathlib import Path

def start_radar():
    """Start the Reddit Lead Radar system"""
    print("Starting Reddit Lead Radar for Paws & Plates")
    print("=" * 60)

    # Check if required files exist
    required_files = [
        'config/subreddits.json',
        'config/intent_phrases.json',
        'config/seed_questions.json',
        'config/blacklist.json',
        'reddit_lead_radar.py'
    ]

    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)

    if missing_files:
        print(f"❌ Missing required files: {', '.join(missing_files)}")
        print("Run this script from the reddit-lead-radar directory")
        sys.exit(1)

        print("All required files found")

    # Check Python dependencies
    try:
        import requests
        import feedparser
        print("Python dependencies available")
    except ImportError as e:
        print(f"Missing Python dependencies: {e}")
        print("Run: pip install -r requirements.txt")
        sys.exit(1)

    print("\nStarting ingestion system...")

    # Start the radar in a separate thread
    def run_radar():
        os.system('python reddit_lead_radar.py')

    radar_thread = threading.Thread(target=run_radar, daemon=True)
    radar_thread.start()

    print("Waiting for first data collection (this may take a minute)...")
    time.sleep(5)  # Give it time to start

    # Open dashboard
    dashboard_path = Path('dashboard.html').absolute()
    print(f"\nOpening dashboard: {dashboard_path}")

    try:
        webbrowser.open(f'file://{dashboard_path}')
    except Exception as e:
        print(f"Could not auto-open dashboard: {e}")
        print(f"Manually open: {dashboard_path}")

    print("\n" + "=" * 60)
    print("Reddit Lead Radar is RUNNING!")
    print("=" * 60)
    print("Dashboard: Check browser tab")
    print("Ingestion: Running in background")
    print("Data: lead_queue.json updates automatically")
    print("Stop: Close this terminal or press Ctrl+C")
    print("=" * 60)

    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Reddit Lead Radar...")
        print("Thanks for helping pet parents find nutrition guidance!")
        sys.exit(0)

def show_status():
    """Show current system status"""
    # Change to the script's directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)

    print("Reddit Lead Radar - System Status")
    print("=" * 40)

    # Check database
    if Path('leads.db').exists():
        print("Database: leads.db exists")
    else:
        print("Database: leads.db not found")

    # Check lead queue
    if Path('lead_queue.json').exists():
        try:
            import json
            with open('lead_queue.json', 'r') as f:
                data = json.load(f)
            lead_count = len(data.get('leads', []))
            print(f"Lead Queue: {lead_count} leads ready")
        except:
            print("Lead Queue: Corrupted JSON file")
    else:
        print("Lead Queue: No leads generated yet")

    # Check config files
    config_files = ['config/subreddits.json', 'config/intent_phrases.json',
                   'config/seed_questions.json', 'config/blacklist.json']
    config_ok = all(Path(f).exists() for f in config_files)
    print(f"Config Files: {'All present' if config_ok else 'Some missing'}")

def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        if sys.argv[1] == '--status':
            show_status()
            return
        elif sys.argv[1] == '--help':
            print("Reddit Lead Radar - Run Script")
            print("Usage:")
            print("  python run.py              # Start the system")
            print("  python run.py --status     # Show system status")
            print("  python run.py --help       # Show this help")
            return

    # Default: start the system
    start_radar()

if __name__ == '__main__':
    main()
