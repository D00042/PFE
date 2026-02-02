"""
Database Initialization Script
Creates all tables defined in models.py
"""

import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.database import engine, Base
from app import models

def init_database():
    """Create all database tables"""
    try:
        print("🔄 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        print("  - users")
        print("\nYou can now start the FastAPI server:")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        print("\nPlease check:")
        print("  1. PostgreSQL is running")
        print("  2. Database 'pfe_db' exists")
        print("  3. User 'postgres' has correct password")
        sys.exit(1)

if __name__ == "__main__":
    init_database()