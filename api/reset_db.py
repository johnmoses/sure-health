#!/usr/bin/env python3
"""
Database Reset Utility
Drops all tables and recreates them
"""

from app import create_app
from app.extensions import db

def reset_database():
    """Drop all tables and recreate them"""
    
    print("⚠️  Resetting database...")
    
    # Drop all tables
    db.drop_all()
    print("🗑️  Dropped all tables")
    
    # Recreate all tables
    db.create_all()
    print("🏗️  Created all tables")
    
    print("✅ Database reset completed!")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        reset_database()