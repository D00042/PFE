from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from . import models, auth
from .database import engine, get_db
from app.routers import password_reset



models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TUI Financial Decision Support API")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",  # Add this one!
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allow our specific origins
    allow_credentials=True,
    allow_methods=["*"],               # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],               # Allow all headers
)
app.include_router(
    password_reset.router,
    prefix="/api/auth",
    tags=["authentication"]
)

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str 
    password: str
    role: str = "Team Member"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "TUI Financial Decision Support API is running!"}
@app.post("/api/auth/register", response_model=TokenResponse)
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Create new user
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_pw,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = auth.create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = auth.create_access_token({"sub": user.email, "role": user.role})
    
    # ADD THIS: Return user info so React can save it!
    return {
        "access_token": token, 
        "token_type": "bearer",
        "full_name": user.full_name,  # Add this
        "email": user.email,          # Add this
        "role": user.role             # Add this
    }
    