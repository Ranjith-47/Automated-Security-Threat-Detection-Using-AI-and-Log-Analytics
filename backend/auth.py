"""
Authentication module for Sentinel IDS.
Provides signup/login endpoints with JWT tokens and SQLite user storage.
"""

import os
import sqlite3
import datetime
from typing import Optional

import jwt
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr

# ─── Configuration ────────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "sentinel-ids-dev-secret-key-change-in-prod")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "users.db")

# ─── Database Setup ───────────────────────────────────────────────────────────

def init_db():
    """Initialize the SQLite database and create the users table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print("Auth database initialized.")


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    message: str
    token: Optional[str] = None
    user: Optional[dict] = None

# ─── JWT Utilities ─────────────────────────────────────────────────────────────

def create_access_token(user_id: int, email: str, name: str) -> str:
    """Create a JWT access token."""
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")


async def get_current_user(authorization: str = Header(None)) -> dict:
    """FastAPI dependency to extract the current user from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header.")
    token = authorization.split(" ", 1)[1]
    return verify_token(token)

# ─── Auth Router ───────────────────────────────────────────────────────────────

router = APIRouter(prefix="", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    """Register a new user."""
    # Validate inputs
    if not req.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")
    if not req.email.strip():
        raise HTTPException(status_code=400, detail="Email is required.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    conn = get_db()
    try:
        # Check if email already exists
        existing = conn.execute("SELECT id FROM users WHERE email = ?", (req.email.lower(),)).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        # Hash password
        password_hash = bcrypt.hashpw(req.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Insert user
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (req.name.strip(), req.email.lower().strip(), password_hash),
        )
        conn.commit()
        user_id = cursor.lastrowid

        # Generate token
        token = create_access_token(user_id, req.email.lower().strip(), req.name.strip())

        return AuthResponse(
            message="Account created successfully.",
            token=token,
            user={"id": user_id, "name": req.name.strip(), "email": req.email.lower().strip()},
        )
    finally:
        conn.close()


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Authenticate a user and return a JWT token."""
    if not req.email.strip():
        raise HTTPException(status_code=400, detail="Email is required.")
    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required.")

    conn = get_db()
    try:
        user = conn.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            (req.email.lower().strip(),),
        ).fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        # Verify password
        if not bcrypt.checkpw(req.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        # Generate token
        token = create_access_token(user["id"], user["email"], user["name"])

        return AuthResponse(
            message="Login successful.",
            token=token,
            user={"id": user["id"], "name": user["name"], "email": user["email"]},
        )
    finally:
        conn.close()
