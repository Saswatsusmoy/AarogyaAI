import json
from typing import Any, Dict, List, Optional, Tuple

import httpx

from .config import settings


SYSTEM_NOTES = (
    "You are an expert clinical scribe AI specialized in generating comprehensive medical notes from doctor-patient consultation transcripts. "
    "Your task is to analyze the conversation and create structured, professional medical documentation.\n\n"
    "GUIDELINES:\n"
    "• Extract information ONLY from what is explicitly stated in the transcript\n"
    "• Do not infer, assume, or hallucinate any medical information\n"
    "• Maintain medical terminology and professional language\n"
    "• Structure the output with clear sections and bullet points\n"
    "• If information is not available in a section, write 'Not mentioned'\n\n"
    "REQUIRED FORMAT:\n"
    "## 1. CHIEF COMPLAINT\n"
    "• Primary reason for visit as stated by patient\n\n"
    "## 2. HISTORY OF PRESENT ILLNESS\n"
    "• Detailed description of current symptoms\n"
    "• Duration, severity, and progression of symptoms\n"
    "• Associated symptoms or triggers mentioned\n\n"
    "## 3. PAST MEDICAL HISTORY\n"
    "• Previous conditions, surgeries, or hospitalizations mentioned\n"
    "• Chronic conditions or ongoing treatments\n\n"
    "## 4. MEDICATIONS\n"
    "• Current medications mentioned by patient\n"
    "• New medications prescribed by doctor\n"
    "• Dosage, frequency, and duration if specified\n\n"
    "## 5. PHYSICAL EXAMINATION FINDINGS\n"
    "• Any examination findings mentioned by the doctor\n"
    "• Vital signs if discussed\n\n"
    "## 6. ASSESSMENT AND PLAN\n"
    "• Doctor's clinical impressions or diagnoses\n"
    "• Treatment recommendations and instructions\n"
    "• Follow-up instructions and next steps\n\n"
    "## 7. PATIENT EDUCATION\n"
    "• Any educational information provided to the patient\n"
    "• Lifestyle modifications or precautions discussed\n\n"
    "## 8. SUMMARY\n"
    "• Concise 2-3 sentence summary of the consultation\n"
    "• Key findings and next steps\n\n"
    "Remember: Only include information that is explicitly stated in the transcript. Do not add medical advice or recommendations beyond what was discussed."
)


SYSTEM_PRESCRIPTION = (
    "You are a medical prescription assistant that extracts structured prescription information from doctor-patient consultation transcripts. "
    "Return ONLY valid JSON with the exact structure specified below.\n\n"
    "GUIDELINES:\n"
    "• Extract information ONLY from what is explicitly stated in the transcript\n"
    "• Do not infer, assume, or hallucinate any medical information\n"
    "• Use standard medical terminology and abbreviations\n"
    "• Keep all content concise and professional\n"
    "• Use null for missing information, not empty strings\n\n"
    "REQUIRED JSON STRUCTURE:\n"
    "{\n"
    '  "diagnoses": ["condition1", "condition2"],\n'
    '  "medications": [\n'
    '    {\n'
    '      "name": "medication name",\n'
    '      "dose": "dosage amount",\n'
    '      "route": "oral/topical/injection",\n'
    '      "frequency": "daily/twice daily/as needed",\n'
    '      "duration": "duration of treatment",\n'
    '      "notes": "special instructions"\n'
    '    }\n'
    '  ],\n'
    '  "advice": "brief lifestyle or care instructions",\n'
    '  "follow_up": "follow-up instructions or next appointment"\n'
    '}\n\n'
    "EXAMPLES:\n"
    '• Diagnoses: ["Hypertension", "Type 2 Diabetes"]\n'
    '• Medications: [{"name": "Metformin", "dose": "500mg", "route": "oral", "frequency": "twice daily", "duration": "ongoing", "notes": "with meals"}]\n'
    '• Advice: "Maintain low-sodium diet and regular exercise"\n'
    '• Follow_up: "Return in 3 months for blood pressure check"\n\n'
    "Return ONLY the JSON object, no additional text or explanations."
)


class CerebrasClient:
    def __init__(self) -> None:
        self.base_url = settings.cerebras_base_url.rstrip("/")
        self.api_key = settings.cerebras_api_key
        self.model = settings.cerebras_model
        self._headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AarogyaAI-Backend/1.0.0",
        }

    async def _chat(self, messages: List[Dict[str, str]], *, response_format: Optional[Dict[str, Any]] = None, max_output_tokens: int = 1024) -> str:
        """Make a chat completion request to Cerebras API with proper error handling."""
        if not self.api_key:
            raise ValueError("Cerebras API key is required")
        
        url = f"{self.base_url}/chat/completions"
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,  # Lower temperature for more consistent medical notes
            "max_tokens": max_output_tokens,
            "top_p": 0.9,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0,
        }
        
        if response_format is not None:
            # OpenAI-compatible response_format for structured output
            payload["response_format"] = response_format
        
        try:
            async with httpx.AsyncClient(timeout=120) as client:  # Increased timeout for medical processing
                resp = await client.post(url, headers=self._headers, json=payload)
                
                if resp.status_code == 401:
                    raise ValueError("Invalid Cerebras API key")
                elif resp.status_code == 429:
                    raise ValueError("Rate limit exceeded. Please try again later.")
                elif resp.status_code == 500:
                    raise ValueError("Cerebras API server error. Please try again later.")
                
                resp.raise_for_status()
                data = resp.json()
                
                if "choices" not in data or not data["choices"]:
                    raise ValueError("Invalid response format from Cerebras API")
                
                content = data["choices"][0]["message"]["content"]
                if not content:
                    raise ValueError("Empty response from Cerebras API")
                
                return content.strip()
                
        except httpx.TimeoutException:
            raise ValueError("Request timeout. The transcript may be too long or the API is slow.")
        except httpx.RequestError as e:
            raise ValueError(f"Network error connecting to Cerebras API: {e}")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON response from Cerebras API")
        except KeyError as e:
            raise ValueError(f"Unexpected response format from Cerebras API: missing {e}")
        except Exception as e:
            raise ValueError(f"Unexpected error with Cerebras API: {e}")

    async def generate_notes(self, transcript: str) -> str:
        """Generate comprehensive medical notes from consultation transcript."""
        if not transcript or not transcript.strip():
            raise ValueError("Transcript cannot be empty")
        
        # Clean and prepare transcript
        clean_transcript = transcript.strip()
        
        # Check transcript length (Cerebras has token limits)
        if len(clean_transcript) > 50000:  # Rough estimate for token limit
            raise ValueError("Transcript is too long. Please provide a shorter transcript.")
        
        messages = [
            {"role": "system", "content": SYSTEM_NOTES},
            {"role": "user", "content": f"Please analyze this doctor-patient consultation transcript and generate comprehensive medical notes:\n\n{clean_transcript}"},
        ]
        
        try:
            return await self._chat(messages, max_output_tokens=2000)  # Increased for comprehensive notes
        except Exception as e:
            raise ValueError(f"Failed to generate medical notes: {e}")

    async def generate_prescription_json(self, transcript: str) -> Dict[str, Any]:
        """Generate structured prescription data from consultation transcript."""
        if not transcript or not transcript.strip():
            raise ValueError("Transcript cannot be empty")
        
        # Clean and prepare transcript
        clean_transcript = transcript.strip()
        
        # Check transcript length
        if len(clean_transcript) > 50000:
            raise ValueError("Transcript is too long. Please provide a shorter transcript.")
        
        messages = [
            {"role": "system", "content": SYSTEM_PRESCRIPTION},
            {"role": "user", "content": f"Extract prescription information from this doctor-patient consultation transcript:\n\n{clean_transcript}\n\nReturn only valid JSON with the specified structure."},
        ]
        
        # Use structured output for reliable JSON generation
        response_format = {"type": "json_object"}
        
        try:
            content = await self._chat(messages, response_format=response_format, max_output_tokens=1000)
            
            # Parse JSON response
            try:
                prescription_data = json.loads(content)
                
                # Validate required structure
                required_keys = ["diagnoses", "medications", "advice", "follow_up"]
                for key in required_keys:
                    if key not in prescription_data:
                        prescription_data[key] = None
                
                # Ensure medications is a list
                if not isinstance(prescription_data.get("medications"), list):
                    prescription_data["medications"] = []
                
                return prescription_data
                
            except json.JSONDecodeError:
                # Fallback: attempt to extract JSON from response
                start = content.find("{")
                end = content.rfind("}")
                if start != -1 and end != -1 and end > start:
                    json_str = content[start:end + 1]
                    prescription_data = json.loads(json_str)
                    
                    # Validate structure
                    required_keys = ["diagnoses", "medications", "advice", "follow_up"]
                    for key in required_keys:
                        if key not in prescription_data:
                            prescription_data[key] = None
                    
                    if not isinstance(prescription_data.get("medications"), list):
                        prescription_data["medications"] = []
                    
                    return prescription_data
                
                # If JSON extraction fails, return empty structure
                return {
                    "diagnoses": [],
                    "medications": [],
                    "advice": None,
                    "follow_up": None
                }
                
        except Exception as e:
            raise ValueError(f"Failed to generate prescription data: {e}")


cerebras_client = CerebrasClient()


async def generate_notes_and_prescription(transcript: str) -> Tuple[str, Dict[str, Any]]:
    """
    Generate both medical notes and prescription data from consultation transcript.
    
    Args:
        transcript: The doctor-patient consultation transcript
        
    Returns:
        Tuple of (medical_notes, prescription_data)
        
    Raises:
        ValueError: If transcript is invalid or API calls fail
    """
    if not transcript or not transcript.strip():
        raise ValueError("Transcript cannot be empty")
    
    try:
        # Generate both notes and prescription in parallel for efficiency
        import asyncio
        
        # Run both operations concurrently
        notes_task = cerebras_client.generate_notes(transcript)
        prescription_task = cerebras_client.generate_prescription_json(transcript)
        
        notes, prescription = await asyncio.gather(notes_task, prescription_task)
        
        return notes, prescription
        
    except Exception as e:
        # If parallel execution fails, try sequential
        try:
            notes = await cerebras_client.generate_notes(transcript)
            prescription = await cerebras_client.generate_prescription_json(transcript)
            return notes, prescription
        except Exception as inner_e:
            raise ValueError(f"Failed to generate medical documentation: {inner_e}")


