# Excel Upload and Validation for FR2
# Create this as app/routers/financial_data.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import pandas as pd
import io
from datetime import datetime
from app import models, auth
from app.database import get_db
from pydantic import BaseModel

router = APIRouter()

# Required columns in Excel template
REQUIRED_COLUMNS = [
    "revenue",
    "cost_of_goods_sold",
    "gross_profit",
    "operating_expenses",
    "ebitda",
    "net_profit",
    "current_assets",
    "total_assets",
    "inventory",
    "cash",
    "accounts_receivable",
    "current_liabilities",
    "shareholders_equity"
]

class PeriodCreate(BaseModel):
    period_type: str  # "monthly" or "quarterly"
    year: int
    month: Optional[int] = None
    quarter: Optional[int] = None

class FinancialDataResponse(BaseModel):
    id: int
    period_id: int
    revenue: float
    net_profit: float
    total_assets: float
    created_at: datetime
    
    class Config:
        from_attributes = True

def validate_excel_template(df: pd.DataFrame) -> tuple[bool, str]:
    """
    Validate Excel file structure
    Returns (is_valid, error_message)
    """
    # Check if all required columns exist
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    
    if missing_columns:
        return False, f"Missing required columns: {', '.join(missing_columns)}"
    
    # Check if there's at least one row of data
    if len(df) == 0:
        return False, "Excel file contains no data rows"
    
    # Validate data types (all should be numeric)
    for col in REQUIRED_COLUMNS:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except:
                return False, f"Column '{col}' contains non-numeric values"
    
    # Check for missing values
    if df[REQUIRED_COLUMNS].isnull().any().any():
        return False, "Excel file contains missing values in required columns"
    
    return True, "Valid"

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_financial_data(
    file: UploadFile = File(...),
    period_type: str = "monthly",
    year: int = 2025,
    month: Optional[int] = None,
    quarter: Optional[int] = None,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload Excel file with financial data
    Only Managers can upload data
    """
    # Check if user is Manager
    if current_user.get("role") not in ["MANAGER", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can upload financial data"
        )
    
    # Validate file type
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files (.xlsx, .xls) are allowed"
        )
    
    try:
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Validate template
        is_valid, error_msg = validate_excel_template(df)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Validate period parameters
        if period_type == "monthly" and (not month or month < 1 or month > 12):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid month. Must be between 1 and 12"
            )
        
        if period_type == "quarterly" and (not quarter or quarter < 1 or quarter > 4):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid quarter. Must be between 1 and 4"
            )
        
        # Create period dates
        if period_type == "monthly":
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
        else:  # quarterly
            start_month = (quarter - 1) * 3 + 1
            start_date = datetime(year, start_month, 1)
            end_month = start_month + 3
            if end_month > 12:
                end_date = datetime(year + 1, end_month - 12, 1)
            else:
                end_date = datetime(year, end_month, 1)
        
        # Get user ID
        user = db.query(models.User).filter(
            models.User.email == current_user["email"]
        ).first()
        
        # Check if period already exists
        existing_period = db.query(models.FinancialPeriod).filter(
            models.FinancialPeriod.period_type == period_type,
            models.FinancialPeriod.year == year,
            models.FinancialPeriod.month == month if period_type == "monthly" else True,
            models.FinancialPeriod.quarter == quarter if period_type == "quarterly" else True
        ).first()
        
        if existing_period:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Financial data for this period already exists (Period ID: {existing_period.id})"
            )
        
        # Create financial period
        new_period = models.FinancialPeriod(
            period_type=period_type,
            year=year,
            month=month if period_type == "monthly" else None,
            quarter=quarter if period_type == "quarterly" else None,
            start_date=start_date,
            end_date=end_date,
            uploaded_by=user.id
        )
        db.add(new_period)
        db.flush()  # Get the period ID
        
        # Create financial data records
        for _, row in df.iterrows():
            financial_data = models.FinancialData(
                period_id=new_period.id,
                revenue=float(row['revenue']),
                cost_of_goods_sold=float(row['cost_of_goods_sold']),
                gross_profit=float(row['gross_profit']),
                operating_expenses=float(row['operating_expenses']),
                ebitda=float(row['ebitda']),
                net_profit=float(row['net_profit']),
                current_assets=float(row['current_assets']),
                total_assets=float(row['total_assets']),
                inventory=float(row['inventory']),
                cash=float(row['cash']),
                accounts_receivable=float(row['accounts_receivable']),
                current_liabilities=float(row['current_liabilities']),
                shareholders_equity=float(row['shareholders_equity'])
            )
            db.add(financial_data)
        
        # Create upload history record
        upload_record = models.UploadHistory(
            filename=file.filename,
            uploaded_by=user.id,
            period_id=new_period.id,
            status="success",
            rows_processed=len(df)
        )
        db.add(upload_record)
        
        db.commit()
        db.refresh(new_period)
        
        return {
            "message": "Financial data uploaded successfully",
            "period_id": new_period.id,
            "period_type": period_type,
            "year": year,
            "month": month,
            "quarter": quarter,
            "rows_processed": len(df)
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel file is empty"
        )
    except Exception as e:
        # Log upload failure
        if 'user' in locals():
            upload_record = models.UploadHistory(
                filename=file.filename,
                uploaded_by=user.id,
                status="failed",
                error_message=str(e)
            )
            db.add(upload_record)
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )

@router.get("/periods")
def get_all_periods(
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all financial periods
    """
    periods = db.query(models.FinancialPeriod).order_by(
        models.FinancialPeriod.year.desc(),
        models.FinancialPeriod.month.desc()
    ).all()
    
    return periods

@router.get("/periods/{period_id}")
def get_period_data(
    period_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get financial data for a specific period
    """
    period = db.query(models.FinancialPeriod).filter(
        models.FinancialPeriod.id == period_id
    ).first()
    
    if not period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Period not found"
        )
    
    financial_data = db.query(models.FinancialData).filter(
        models.FinancialData.period_id == period_id,
        models.FinancialData.is_deleted == False
    ).all()
    
    return {
        "period": period,
        "data": financial_data
    }

@router.delete("/periods/{period_id}")
def delete_period(
    period_id: int,
    current_user: dict = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete financial period and its data (Manager only)
    """
    # Check if user is Manager
    if current_user.get("role") not in ["MANAGER", "Manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can delete financial data"
        )
    
    period = db.query(models.FinancialPeriod).filter(
        models.FinancialPeriod.id == period_id
    ).first()
    
    if not period:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Period not found"
        )
    
    # Soft delete all financial data
    db.query(models.FinancialData).filter(
        models.FinancialData.period_id == period_id
    ).update({"is_deleted": True})
    
    # Delete period
    db.delete(period)
    db.commit()
    
    return {"message": "Period deleted successfully"}

@router.get("/template")
def download_template():
    """
    Download Excel template for financial data upload
    """
    # Create template DataFrame
    template_data = {col: [0.0] for col in REQUIRED_COLUMNS}
    df = pd.DataFrame(template_data)
    
    # Create Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Financial Data')
    
    output.seek(0)
    
    return {
        "message": "Template structure",
        "required_columns": REQUIRED_COLUMNS,
        "note": "Download template from /api/financial/template/download"
    }