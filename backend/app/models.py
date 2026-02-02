from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class FinancialPeriod(Base):
    """
    Stores financial reporting periods (monthly or quarterly)
    """
    __tablename__ = "financial_periods"
    
    id = Column(Integer, primary_key=True, index=True)
    period_type = Column(String, nullable=False)  # "monthly" or "quarterly"
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=True)  # 1-12 for monthly, null for quarterly
    quarter = Column(Integer, nullable=True)  # 1-4 for quarterly, null for monthly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    uploader = relationship("User", back_populates="financial_periods")
    financial_data = relationship("FinancialData", back_populates="period", cascade="all, delete-orphan")

class FinancialData(Base):
    """
    Stores actual financial data uploaded from Excel files
    """
    __tablename__ = "financial_data"
    
    id = Column(Integer, primary_key=True, index=True)
    period_id = Column(Integer, ForeignKey("financial_periods.id"), nullable=False)
    
    # Income Statement Data
    revenue = Column(Float, default=0.0)
    cost_of_goods_sold = Column(Float, default=0.0)
    gross_profit = Column(Float, default=0.0)
    operating_expenses = Column(Float, default=0.0)
    ebitda = Column(Float, default=0.0)
    net_profit = Column(Float, default=0.0)
    
    # Balance Sheet Data
    current_assets = Column(Float, default=0.0)
    total_assets = Column(Float, default=0.0)
    inventory = Column(Float, default=0.0)
    cash = Column(Float, default=0.0)
    accounts_receivable = Column(Float, default=0.0)
    current_liabilities = Column(Float, default=0.0)
    shareholders_equity = Column(Float, default=0.0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)  # Soft delete
    
    # Relationships
    period = relationship("FinancialPeriod", back_populates="financial_data")

class UploadHistory(Base):
    """
    Track all Excel file uploads
    """
    __tablename__ = "upload_history"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    period_id = Column(Integer, ForeignKey("financial_periods.id"), nullable=True)
    status = Column(String, default="pending")  # pending, success, failed
    error_message = Column(Text, nullable=True)
    rows_processed = Column(Integer, default=0)
    
    # Relationships
    uploader = relationship("User")
    period = relationship("FinancialPeriod")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Team Member")  # "Manager" or "Team Member"
    created_at = Column(DateTime, default=datetime.utcnow)
    financial_periods = relationship("FinancialPeriod", back_populates="uploader")