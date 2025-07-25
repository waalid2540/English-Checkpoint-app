from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Optional
import sqlite3
import json
import re
from datetime import datetime
import hashlib
import secrets
import uuid

app = FastAPI(title="Somali AI Dataset API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication setup
security = HTTPBearer()

# Database setup
def init_db():
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            api_key TEXT UNIQUE NOT NULL,
            plan TEXT DEFAULT 'free',
            requests_used INTEGER DEFAULT 0,
            requests_limit INTEGER DEFAULT 100,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS somali_sentences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT UNIQUE NOT NULL,
            translation TEXT,
            dialect TEXT,
            quality_score REAL,
            source TEXT,
            validated BOOLEAN DEFAULT FALSE,
            scholar_approved BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            metadata TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quality_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sentence_id INTEGER,
            accuracy_score REAL,
            cultural_score REAL,
            grammar_score REAL,
            completeness_score REAL,
            overall_score REAL,
            validator_notes TEXT,
            FOREIGN KEY (sentence_id) REFERENCES somali_sentences (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            endpoint TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Authentication functions
def generate_api_key():
    """Generate a secure API key"""
    return f"sk_live_{secrets.token_urlsafe(32)}"

def verify_api_key(api_key: str):
    """Verify API key and return user info"""
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, email, plan, requests_used, requests_limit, is_active 
        FROM users WHERE api_key = ? AND is_active = 1
    ''', (api_key,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    user_id, email, plan, requests_used, requests_limit, is_active = user
    
    if requests_used >= requests_limit:
        raise HTTPException(status_code=429, detail="API rate limit exceeded")
    
    return {
        "user_id": user_id,
        "email": email,
        "plan": plan,
        "requests_used": requests_used,
        "requests_limit": requests_limit
    }

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user"""
    return verify_api_key(credentials.credentials)

def track_api_usage(user_id: int, endpoint: str):
    """Track API usage for billing"""
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    # Log the usage
    cursor.execute('''
        INSERT INTO api_usage (user_id, endpoint) VALUES (?, ?)
    ''', (user_id, endpoint))
    
    # Increment user's request count
    cursor.execute('''
        UPDATE users SET requests_used = requests_used + 1 WHERE id = ?
    ''', (user_id,))
    
    conn.commit()
    conn.close()

# Pydantic models
class UserSignup(BaseModel):
    email: str
    plan: str = "free"
class SomaliSentence(BaseModel):
    text: str
    translation: Optional[str] = None
    dialect: Optional[str] = "Northern Somali"
    source: Optional[str] = "manual"
    metadata: Optional[Dict] = {}

class QualityAnalysis(BaseModel):
    text: str

class DatasetStats(BaseModel):
    total_sentences: int
    validated_sentences: int
    scholar_approved: int
    average_quality: float
    dialects: Dict[str, int]

# Quality analysis functions
def calculate_quality_score(text: str) -> Dict:
    """Calculate quality metrics for Somali text"""
    
    # Basic quality indicators
    length_score = min(len(text.split()) / 10, 1.0) * 25  # Good length
    
    # Character diversity (Somali uses specific characters)
    somali_chars = set('abcdefghijklmnopqrstuvwxyzáéíóúÁÉÍÓÚ')
    char_diversity = len(set(text.lower()) & somali_chars) / len(somali_chars) * 25
    
    # Sentence structure
    has_punctuation = 1 if any(p in text for p in '.!?') else 0
    structure_score = has_punctuation * 25
    
    # Word complexity (longer words often indicate quality)
    words = text.split()
    avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
    complexity_score = min(avg_word_length / 6, 1.0) * 25
    
    total_score = length_score + char_diversity + structure_score + complexity_score
    
    return {
        "overall_score": round(total_score, 1),
        "length_score": round(length_score, 1),
        "character_diversity": round(char_diversity, 1),
        "structure_score": round(structure_score, 1),
        "complexity_score": round(complexity_score, 1),
        "word_count": len(words),
        "character_count": len(text)
    }

def detect_dialect(text: str) -> Dict:
    """Detect Somali dialect from text patterns"""
    
    # Simple dialect detection based on common patterns
    northern_indicators = ['waa', 'baa', 'ayaa', 'oo', 'iyo']
    southern_indicators = ['ka', 'ku', 'la', 'ah', 'uu']
    central_indicators = ['si', 'ugu', 'kala', 'soo', 'aan']
    
    northern_count = sum(1 for word in northern_indicators if word in text.lower())
    southern_count = sum(1 for word in southern_indicators if word in text.lower())
    central_count = sum(1 for word in central_indicators if word in text.lower())
    
    total_indicators = northern_count + southern_count + central_count
    
    if total_indicators == 0:
        return {"dialect": "Unknown", "confidence": 0}
    
    if northern_count >= southern_count and northern_count >= central_count:
        confidence = (northern_count / total_indicators) * 100
        return {"dialect": "Northern Somali", "confidence": round(confidence, 1)}
    elif southern_count >= central_count:
        confidence = (southern_count / total_indicators) * 100
        return {"dialect": "Southern Somali", "confidence": round(confidence, 1)}
    else:
        confidence = (central_count / total_indicators) * 100
        return {"dialect": "Central Somali", "confidence": round(confidence, 1)}

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Somali AI Dataset API", "status": "active", "version": "1.0.0"}

@app.post("/signup")
async def signup_user(user: UserSignup):
    """Sign up a new user and get API key"""
    
    api_key = generate_api_key()
    
    # Set limits based on plan
    limits = {
        "free": 100,
        "basic": 1000,
        "premium": 10000,
        "enterprise": 100000
    }
    
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO users (email, api_key, plan, requests_limit)
            VALUES (?, ?, ?, ?)
        ''', (user.email, api_key, user.plan, limits.get(user.plan, 100)))
        
        conn.commit()
        
        return {
            "message": "User created successfully",
            "api_key": api_key,
            "plan": user.plan,
            "requests_limit": limits.get(user.plan, 100)
        }
        
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()

@app.post("/analyze")
async def analyze_text(analysis: QualityAnalysis, current_user: dict = Depends(get_current_user)):
    """Analyze Somali text for quality and dialect"""
    
    if not analysis.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Track API usage
    track_api_usage(current_user["user_id"], "/analyze")
    
    quality_metrics = calculate_quality_score(analysis.text)
    dialect_info = detect_dialect(analysis.text)
    
    return {
        "text": analysis.text,
        "quality_metrics": quality_metrics,
        "dialect_detection": dialect_info,
        "validation_status": "processed",
        "timestamp": datetime.now().isoformat(),
        "user_plan": current_user["plan"],
        "requests_remaining": current_user["requests_limit"] - current_user["requests_used"] - 1
    }

@app.post("/sentences")
async def add_sentence(sentence: SomaliSentence):
    """Add a new Somali sentence to the dataset"""
    
    # Calculate quality score
    quality_metrics = calculate_quality_score(sentence.text)
    dialect_info = detect_dialect(sentence.text)
    
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO somali_sentences 
            (text, translation, dialect, quality_score, source, metadata)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            sentence.text,
            sentence.translation,
            dialect_info["dialect"],
            quality_metrics["overall_score"],
            sentence.source,
            json.dumps(sentence.metadata)
        ))
        
        sentence_id = cursor.lastrowid
        
        # Add quality metrics
        cursor.execute('''
            INSERT INTO quality_metrics
            (sentence_id, accuracy_score, cultural_score, grammar_score, 
             completeness_score, overall_score)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            sentence_id,
            quality_metrics["length_score"],
            quality_metrics["character_diversity"],
            quality_metrics["structure_score"],
            quality_metrics["complexity_score"],
            quality_metrics["overall_score"]
        ))
        
        conn.commit()
        
        return {
            "id": sentence_id,
            "message": "Sentence added successfully",
            "quality_score": quality_metrics["overall_score"],
            "dialect": dialect_info["dialect"]
        }
        
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Sentence already exists")
    finally:
        conn.close()

@app.get("/sentences")
async def get_sentences(limit: int = 10, validated: Optional[bool] = None):
    """Get sentences from the dataset"""
    
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    query = "SELECT * FROM somali_sentences"
    params = []
    
    if validated is not None:
        query += " WHERE validated = ?"
        params.append(validated)
    
    query += " ORDER BY quality_score DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    sentences = cursor.fetchall()
    
    conn.close()
    
    return {
        "sentences": [
            {
                "id": s[0],
                "text": s[1],
                "translation": s[2],
                "dialect": s[3],
                "quality_score": s[4],
                "source": s[5],
                "validated": bool(s[6]),
                "scholar_approved": bool(s[7]),
                "created_at": s[8]
            }
            for s in sentences
        ]
    }

@app.get("/stats")
async def get_dataset_stats():
    """Get dataset statistics"""
    
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    # Total sentences
    cursor.execute("SELECT COUNT(*) FROM somali_sentences")
    total = cursor.fetchone()[0]
    
    # Validated sentences
    cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE validated = 1")
    validated = cursor.fetchone()[0]
    
    # Scholar approved
    cursor.execute("SELECT COUNT(*) FROM somali_sentences WHERE scholar_approved = 1")
    scholar_approved = cursor.fetchone()[0]
    
    # Average quality
    cursor.execute("SELECT AVG(quality_score) FROM somali_sentences")
    avg_quality = cursor.fetchone()[0] or 0
    
    # Dialect distribution
    cursor.execute("SELECT dialect, COUNT(*) FROM somali_sentences GROUP BY dialect")
    dialects = dict(cursor.fetchall())
    
    conn.close()
    
    return {
        "total_sentences": total,
        "validated_sentences": validated,
        "scholar_approved": scholar_approved,
        "average_quality": round(avg_quality, 1),
        "dialects": dialects,
        "last_updated": datetime.now().isoformat()
    }

@app.put("/sentences/{sentence_id}/validate")
async def validate_sentence(sentence_id: int, scholar_approved: bool = False):
    """Validate a sentence (mark as reviewed)"""
    
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE somali_sentences 
        SET validated = 1, scholar_approved = ?
        WHERE id = ?
    ''', (scholar_approved, sentence_id))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Sentence not found")
    
    conn.commit()
    conn.close()
    
    return {"message": "Sentence validated successfully"}

@app.delete("/sentences/{sentence_id}")
async def delete_sentence(sentence_id: int):
    """Delete a sentence from the dataset"""
    
    conn = sqlite3.connect('somali_dataset.db')
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM somali_sentences WHERE id = ?", (sentence_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Sentence not found")
    
    conn.commit()
    conn.close()
    
    return {"message": "Sentence deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)