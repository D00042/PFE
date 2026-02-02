from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from app import models, auth
from app.database import get_db

router = APIRouter()

# --- CONFIGURATION (Move these to .env later) ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SENDER_EMAIL = "jtldouaa@gmail.com"
SENDER_PASSWORD = "wdgi qdva tkfx ipfd" # Replace with 16-character App Password

# In-memory storage (Resets when server restarts)
password_reset_tokens = {}

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

def send_reset_email(email_to: str, token: str):
    """Real SMTP Logic to send email via Gmail"""
    body = f"""
    Hello,
    
    Your password reset token for TUI Financial is: {token}
    
    Paste this token into the application to set your new password.
    This token will expire in 15 minutes.
    """
    msg = MIMEText(body)
    msg['Subject'] = "TUI Financial - Password Reset"
    msg['From'] = SENDER_EMAIL
    msg['To'] = email_to

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, email_to, msg.as_string())
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False

@router.post("/forgot-password")
def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    
    # Security tip: Don't tell hackers if the email doesn't exist
    if not user:
        return {"message": "If the email exists, a reset link has been sent."}
    
    reset_token = secrets.token_urlsafe(32)
    password_reset_tokens[reset_token] = {
        "email": user.email,
        "expires_at": datetime.utcnow() + timedelta(minutes=15)
    }
    
    # Fire the actual email
    success = send_reset_email(user.email, reset_token)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email. Check SMTP settings.")

    return {"message": "A reset token has been sent to your email."}

@router.post("/reset-password")
def reset_password(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    token_data = password_reset_tokens.get(request.token)
    
    if not token_data or datetime.utcnow() > token_data["expires_at"]:
        if request.token in password_reset_tokens: del password_reset_tokens[request.token]
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user = db.query(models.User).filter(models.User.email == token_data["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = auth.get_password_hash(request.new_password)
    db.commit()
    
    del password_reset_tokens[request.token]
    return {"message": "Password reset successful"}