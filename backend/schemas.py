from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ActivityBase(BaseModel):
    """Base schema for Activity"""
    title: str
    description: Optional[str] = None
    date: str  # Format: YYYY-MM-DD
    time: Optional[str] = None  # Format: HH:MM


class ActivityCreate(ActivityBase):
    """Schema for creating a new activity"""
    pass


class ActivityUpdate(BaseModel):
    """Schema for updating an activity"""
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None


class ActivityResponse(ActivityBase):
    """Schema for activity responses"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Schema for chat requests"""
    message: str


class ChatResponse(BaseModel):
    """Schema for chat responses"""
    response: str
