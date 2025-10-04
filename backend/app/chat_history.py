"""
Chat History Service for managing patient chatbot conversations.
"""

import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import asyncio

# Try to import asyncpg for database operations
try:
    import asyncpg
    ASYNCPG_AVAILABLE = True
except ImportError:
    ASYNCPG_AVAILABLE = False
    asyncpg = None

from .config import settings


class ChatHistoryService:
    """Service to manage chat history in the database."""
    
    def __init__(self):
        self.database_url = settings.database_url
    
    async def save_message(self, patient_id: str, message: str, is_user: bool) -> Optional[str]:
        """Save a chat message to the database."""
        if not self.database_url or not ASYNCPG_AVAILABLE:
            return None
        
        try:
            async with asyncpg.create_pool(self.database_url) as pool:
                async with pool.acquire() as conn:
                    query = """
                        INSERT INTO "ChatHistory" (id, "patientId", message, "isUser", "createdAt")
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING id
                    """
                    
                    # Generate a simple ID (in production, use proper UUID generation)
                    message_id = f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(message) % 10000}"
                    
                    result = await conn.fetchval(
                        query,
                        message_id,
                        patient_id,
                        message,
                        is_user,
                        datetime.now()
                    )
                    
                    return result
                    
        except Exception as e:
            print(f"Error saving chat message: {e}")
            return None
    
    async def get_chat_history(self, patient_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve chat history for a patient."""
        if not self.database_url or not ASYNCPG_AVAILABLE:
            return []
        
        try:
            async with asyncpg.create_pool(self.database_url) as pool:
                async with pool.acquire() as conn:
                    query = """
                        SELECT id, message, "isUser", "createdAt"
                        FROM "ChatHistory"
                        WHERE "patientId" = $1
                        ORDER BY "createdAt" DESC
                        LIMIT $2
                    """
                    
                    rows = await conn.fetch(query, patient_id, limit)
                    
                    # Convert to list of dictionaries and reverse order (oldest first)
                    chat_history = []
                    for row in reversed(rows):
                        chat_history.append({
                            "id": row["id"],
                            "message": row["message"],
                            "is_user": row["isUser"],
                            "created_at": row["createdAt"].isoformat() if row["createdAt"] else None
                        })
                    
                    return chat_history
                    
        except Exception as e:
            print(f"Error retrieving chat history: {e}")
            return []
    
    async def clear_chat_history(self, patient_id: str) -> bool:
        """Clear all chat history for a patient."""
        if not self.database_url or not ASYNCPG_AVAILABLE:
            return False
        
        try:
            async with asyncpg.create_pool(self.database_url) as pool:
                async with pool.acquire() as conn:
                    query = """
                        DELETE FROM "ChatHistory"
                        WHERE "patientId" = $1
                    """
                    
                    await conn.execute(query, patient_id)
                    return True
                    
        except Exception as e:
            print(f"Error clearing chat history: {e}")
            return False


# Global instance
chat_history_service = ChatHistoryService()
