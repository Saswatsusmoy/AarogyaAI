import asyncio
import json
import logging
import uuid
from typing import Dict, Optional, Callable
import websockets
import websockets.exceptions
from pydantic import BaseModel

from .stt_manager import stt_manager
from .config import settings

logger = logging.getLogger(__name__)


class MeetTranscriptionRequest(BaseModel):
    meet_url: str
    appointment_id: Optional[str] = None
    callback_url: Optional[str] = None


class MeetTranscriptionSession:
    def __init__(self, session_id: str, meet_url: str, appointment_id: Optional[str] = None):
        self.session_id = session_id
        self.meet_url = meet_url
        self.appointment_id = appointment_id
        self.stt_session_id: Optional[str] = None
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self.is_running = False
        self.transcription_callback: Optional[Callable[[str], None]] = None
        self.transcriptions: list = []

    async def start(self) -> bool:
        """Start the Meet transcription session"""
        try:
            # Start STT session
            self.stt_session_id = await stt_manager.start_session()
            self.is_running = True
            
            logger.info(f"Started Meet transcription session {self.session_id} for {self.meet_url}")
            logger.info("Waiting for real audio input from Google Meet...")
            return True
        except Exception as e:
            logger.error(f"Failed to start Meet transcription session: {e}")
            return False

    async def stop(self) -> bool:
        """Stop the Meet transcription session"""
        try:
            self.is_running = False
            
            # Stop STT session
            if self.stt_session_id:
                await stt_manager.stop_session(self.stt_session_id)
                self.stt_session_id = None
            
            # Close websocket if open
            if self.websocket:
                await self.websocket.close()
                self.websocket = None
            
            logger.info(f"Stopped Meet transcription session {self.session_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to stop Meet transcription session: {e}")
            return False

    async def process_audio_chunk(self, audio_data: bytes) -> str:
        """Process audio chunk and return transcription"""
        if not self.is_running or not self.stt_session_id:
            return ""
        
        try:
            logger.info(f"Processing audio chunk of {len(audio_data)} bytes")
            
            # Get the STT session
            stt_session = stt_manager._sessions.get(self.stt_session_id)
            if not stt_session or not stt_session.session:
                logger.warning("STT session not available")
                return ""
            
            # Process audio through STT
            # Note: This is a simplified approach. In production, you'd need to:
            # 1. Convert WebM to the format expected by Cartesia
            # 2. Handle audio streaming properly
            # 3. Accumulate partial results
            
            # For now, we'll use a simple approach with the existing STT
            # The audio needs to be in the right format for Cartesia
            
            import io
            import time
            
            # Create a simple transcription from the audio
            # In a real implementation, you'd send this to Cartesia STT
            transcription_text = f"[Audio processed: {len(audio_data)} bytes at {time.time():.2f}]"
            
            # Store the transcription
            current_time = time.time()
            transcription = {
                "text": transcription_text,
                "timestamp": current_time
            }
            self.transcriptions.append(transcription)
            
            # Call callback if set
            if self.transcription_callback:
                self.transcription_callback(transcription_text)
            
            logger.info(f"Transcription created: {transcription_text}")
            return transcription_text
                
        except Exception as e:
            logger.error(f"Failed to process audio chunk: {e}")
            return ""

    def get_transcriptions(self) -> list:
        """Get all transcriptions for this session"""
        return self.transcriptions.copy()

    def set_transcription_callback(self, callback: Callable[[str], None]) -> None:
        """Set callback function for transcription results"""
        self.transcription_callback = callback


class MeetTranscriberManager:
    def __init__(self):
        self.sessions: Dict[str, MeetTranscriptionSession] = {}

    async def create_session(self, meet_url: str, appointment_id: Optional[str] = None) -> str:
        """Create a new Meet transcription session"""
        session_id = str(uuid.uuid4())
        session = MeetTranscriptionSession(session_id, meet_url, appointment_id)
        
        success = await session.start()
        if success:
            self.sessions[session_id] = session
            return session_id
        else:
            raise RuntimeError("Failed to create Meet transcription session")

    async def stop_session(self, session_id: str) -> bool:
        """Stop a Meet transcription session"""
        session = self.sessions.pop(session_id, None)
        if not session:
            return False
        
        return await session.stop()

    def get_session(self, session_id: str) -> Optional[MeetTranscriptionSession]:
        """Get a Meet transcription session by ID"""
        return self.sessions.get(session_id)

    async def cleanup_all_sessions(self) -> None:
        """Cleanup all active sessions"""
        for session_id in list(self.sessions.keys()):
            await self.stop_session(session_id)


# Global manager instance
meet_transcriber_manager = MeetTranscriberManager()


class MeetTranscriptionBot:
    """Simple Google Meet transcription bot"""
    
    def __init__(self, meet_url: str, appointment_id: Optional[str] = None):
        self.meet_url = meet_url
        self.appointment_id = appointment_id
        self.session_id: Optional[str] = None
        self.transcriptions = []
        self.is_running = False

    async def start(self) -> str:
        """Start the transcription bot"""
        if self.is_running:
            return self.session_id or ""
        
        try:
            self.session_id = await meet_transcriber_manager.create_session(
                self.meet_url, self.appointment_id
            )
            
            # Set up transcription callback
            session = meet_transcriber_manager.get_session(self.session_id)
            if session:
                session.set_transcription_callback(self._on_transcription)
            
            self.is_running = True
            logger.info(f"Started Meet bot for {self.meet_url}")
            logger.info("Ready to receive real audio from Google Meet")
            return self.session_id
            
        except Exception as e:
            logger.error(f"Failed to start Meet bot: {e}")
            raise

    async def stop(self) -> bool:
        """Stop the transcription bot"""
        if not self.is_running or not self.session_id:
            return True
        
        try:
            success = await meet_transcriber_manager.stop_session(self.session_id)
            self.is_running = False
            self.session_id = None
            logger.info(f"Stopped Meet bot for {self.meet_url}")
            return success
        except Exception as e:
            logger.error(f"Failed to stop Meet bot: {e}")
            return False

    def _on_transcription(self, text: str) -> None:
        """Handle transcription results"""
        self.transcriptions.append({
            "text": text,
            "timestamp": asyncio.get_event_loop().time()
        })
        logger.info(f"Transcription: {text}")

    def get_transcriptions(self) -> list:
        """Get all transcriptions"""
        return self.transcriptions.copy()

    def clear_transcriptions(self) -> None:
        """Clear all transcriptions"""
        self.transcriptions.clear()


# Utility function to create and manage Meet bots
async def create_meet_bot(meet_url: str, appointment_id: Optional[str] = None) -> MeetTranscriptionBot:
    """Create a new Meet transcription bot"""
    bot = MeetTranscriptionBot(meet_url, appointment_id)
    await bot.start()
    return bot


# Cleanup function for graceful shutdown
async def cleanup_meet_transcriber() -> None:
    """Cleanup all Meet transcription sessions"""
    await meet_transcriber_manager.cleanup_all_sessions()
