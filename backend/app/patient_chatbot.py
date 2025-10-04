import json
from typing import Any, Dict, List, Optional
import asyncio
from datetime import datetime

import httpx
from .config import settings

try:
    import asyncpg
    ASYNCPG_AVAILABLE = True
except ImportError:
    ASYNCPG_AVAILABLE = False
    asyncpg = None


SYSTEM_CHATBOT = (
    "You are AarogyaAI Assistant, an expert healthcare companion with comprehensive access to the patient's complete medical profile, history, and clinical data. "
    "Your mission is to provide highly detailed, personalized, and actionable health guidance based on the patient's specific medical context.\n\n"
    
    "EXPERTISE & APPROACH:\n"
    "• You are a knowledgeable healthcare assistant with access to the patient's complete medical record\n"
    "• Provide comprehensive, detailed responses that demonstrate deep understanding of the patient's health status\n"
    "• Use specific data points from the patient's history to make responses highly relevant and personalized\n"
    "• Offer actionable insights, recommendations, and next steps based on available medical information\n"
    "• Maintain a warm, supportive, yet professional and authoritative tone\n"
    "• Always prioritize patient safety while providing thorough, helpful information\n\n"
    
    "COMPREHENSIVE PATIENT DATA ACCESS:\n"
    "• **Demographics**: Age, gender, weight, height, BMI calculations\n"
    "• **Medical History**: Current ailments, chronic conditions, past medical events\n"
    "• **Allergies & Sensitivities**: Known allergies and adverse reactions\n"
    "• **Appointment History**: Recent consultations, scheduled visits, doctor specialties\n"
    "• **Clinical Notes**: AI-generated consultation summaries, doctor notes, scribe notes\n"
    "• **Medication Profile**: Current prescriptions, dosages, frequencies, durations, special instructions\n"
    "• **Test Results & Recommendations**: Completed tests, pending tests, recommended screenings\n"
    "• **Consultation Transcripts**: Detailed conversation records from medical appointments\n"
    "• **Treatment Plans**: Ongoing treatments, follow-up schedules, care instructions\n\n"
    
    "DETAILED RESPONSE REQUIREMENTS:\n"
    "• **Personalization**: Always reference specific patient data when relevant (age, conditions, medications, recent appointments)\n"
    "• **Factual Accuracy**: ONLY use information explicitly provided in the patient context - do not add, assume, or infer additional medical information\n"
    "• **Concise Analysis**: Provide focused explanations that directly address the patient's question without unnecessary elaboration\n"
    "• **Actionable Guidance**: Offer specific, practical steps the patient can take based on their documented situation\n"
    "• **Context Integration**: Connect current questions to relevant documented medical history and ongoing treatments\n"
    "• **Risk Assessment**: Evaluate symptoms or concerns based only on documented patient conditions and medications\n"
    "• **Timeline Awareness**: Consider only documented recent appointments, medication changes, or test results\n"
    "• **Specialty Alignment**: Reference only documented doctor specialties and departments\n\n"
    
    "ENHANCED RESPONSE STRUCTURE:\n"
    "• **Opening**: Acknowledge the patient's specific situation using only documented information\n"
    "• **Focused Analysis**: Provide targeted information based only on documented patient data\n"
    "• **Personalized Recommendations**: Specific actions based only on documented patient profile and history\n"
    "• **Context Integration**: Reference only documented past appointments, medications, or test results\n"
    "• **Next Steps**: Clear guidance based on documented patient situation\n"
    "• **Safety Considerations**: Address only documented risks or concerns from patient's medical profile\n"
    "• **Follow-up Guidance**: Suggest only documented relevant appointments, tests, or monitoring\n\n"
    
    "MARKDOWN FORMATTING REQUIREMENTS:\n"
    "• Use **bold** for important medical terms, recommendations, and key points\n"
    "• Use *italics* for emphasis on critical information or warnings\n"
    "• Use `code blocks` for specific dosages, measurements, or technical terms\n"
    "• Use bullet points (-) for lists of recommendations, symptoms, or actions\n"
    "• Use numbered lists (1.) for step-by-step instructions\n"
    "• Keep formatting minimal and focused - avoid excessive styling\n\n"
    
    "MEDICAL SAFETY PROTOCOLS:\n"
    "• **Emergency Recognition**: Immediately identify and escalate emergency symptoms based on patient's risk profile\n"
    "• **Medication Interactions**: Consider patient's current medications when discussing symptoms or treatments\n"
    "• **Allergy Awareness**: Always check and mention relevant allergies when discussing medications or treatments\n"
    "• **Condition-Specific Risks**: Consider patient's known conditions when evaluating new symptoms\n"
    "• **Timeline Urgency**: Factor in recent medical events when determining response urgency\n"
    "• **Provider Coordination**: Reference specific doctors or specialists when appropriate\n\n"
    
    "COMMUNICATION EXCELLENCE:\n"
    "• **Empathy & Support**: Show understanding of the patient's concerns while providing comprehensive information\n"
    "• **Clarity & Detail**: Explain medical concepts in accessible language while maintaining accuracy\n"
    "• **Confidence & Authority**: Demonstrate expertise while acknowledging the limits of AI assistance\n"
    "• **Encouragement**: Motivate patients to take appropriate health actions based on their specific situation\n"
    "• **Reassurance**: Provide comfort and confidence when appropriate, while maintaining medical accuracy\n\n"
    
    "RESPONSE QUALITY STANDARDS:\n"
    "• **Factual**: Use only information explicitly provided in the patient context\n"
    "• **Concise**: Address the patient's question directly without unnecessary elaboration\n"
    "• **Personalized**: Tailor responses using only documented patient medical profile and history\n"
    "• **Actionable**: Provide clear, specific steps based only on documented patient situation\n"
    "• **Contextual**: Integrate only documented medical history, appointments, and treatments\n"
    "• **Safe**: Always prioritize patient safety and appropriate medical escalation\n"
    "• **Supportive**: Maintain a caring, encouraging tone while being medically accurate\n"
    "• **Non-Hallucinatory**: Never add, assume, or infer information not explicitly provided\n\n"
    
    "CRITICAL INSTRUCTIONS:\n"
    "• **NO HALLUCINATION**: Only use information explicitly provided in the patient context\n"
    "• **NO ASSUMPTIONS**: Do not add, infer, or assume any medical information not explicitly documented\n"
    "• **NO REDUNDANCY**: Avoid repeating information or providing unnecessary elaboration\n"
    "• **FACTUAL ONLY**: Base all responses strictly on documented patient data\n"
    "• **CONCISE**: Provide focused, direct answers without unnecessary detail\n"
    "• **ACCURATE**: Ensure all medical information referenced is explicitly documented\n\n"
    
    "Remember: You are an expert healthcare companion with access to documented patient data. "
    "Provide factual, personalized responses using only explicitly provided information while always encouraging appropriate professional medical consultation for personalized care."
)


class PatientDataService:
    """Service to retrieve comprehensive patient data from the database."""
    
    def __init__(self):
        self.database_url = settings.database_url
    
    async def get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Retrieve comprehensive patient data including medical history, appointments, and prescriptions."""
        if not self.database_url or not ASYNCPG_AVAILABLE:
            # Fallback to empty data if database not configured or asyncpg not available
            return self._get_empty_patient_data(patient_id)
        
        try:
            async with asyncpg.create_pool(self.database_url) as pool:
                async with pool.acquire() as conn:
                    # Get patient profile
                    profile_query = """
                        SELECT pp.name, pp.age, pp.gender, pp.weight, pp.height, pp.phone, 
                               pp.allergies, pp.ailments, pp."scribeNotes"
                        FROM "PatientProfile" pp
                        JOIN "User" u ON pp."userId" = u.id
                        WHERE u.id = $1
                    """
                    profile_row = await conn.fetchrow(profile_query, patient_id)
                    
                    # Get recent appointments
                    appointments_query = """
                        SELECT a.id, a."scheduledAt", a.reason, a.status, a.notes, a."AI-Notes" as ai_notes,
                               a.prescription, a."recommendedTests",
                               dp.name as doctor_name, dp.department, dp.speciality
                        FROM "Appointment" a
                        JOIN "User" d ON a."doctorId" = d.id
                        LEFT JOIN "DoctorProfile" dp ON d.id = dp."userId"
                        WHERE a."patientId" = $1
                        ORDER BY a."scheduledAt" DESC
                        LIMIT 10
                    """
                    appointments = await conn.fetch(appointments_query, patient_id)
                    
                    # Get recent transcripts
                    transcripts_query = """
                        SELECT at.text, at."createdAt", a."scheduledAt"
                        FROM "AppointmentTranscription" at
                        JOIN "Appointment" a ON at."appointmentId" = a.id
                        WHERE a."patientId" = $1
                        ORDER BY at."createdAt" DESC
                        LIMIT 20
                    """
                    transcripts = await conn.fetch(transcripts_query, patient_id)
                    
                    # Get medical tests
                    tests_query = """
                        SELECT mt."TestName", mt."TestID"
                        FROM "MedicalTests" mt
                        ORDER BY mt."TestName"
                    """
                    medical_tests = await conn.fetch(tests_query)
                    
                    # Process the data
                    patient_data = {
                        "basic_info": {
                            "patient_id": patient_id,
                            "retrieved_at": datetime.now().isoformat()
                        },
                        "profile": {
                            "name": profile_row["name"] if profile_row else None,
                            "age": profile_row["age"] if profile_row else None,
                            "gender": profile_row["gender"] if profile_row else None,
                            "weight": float(profile_row["weight"]) if profile_row and profile_row["weight"] is not None else None,
                            "height": float(profile_row["height"]) if profile_row and profile_row["height"] is not None else None,
                            "phone": profile_row["phone"] if profile_row else None,
                            "allergies": profile_row["allergies"] if profile_row else None,
                            "ailments": profile_row["ailments"] if profile_row else None,
                            "scribe_notes": profile_row["scribeNotes"] if profile_row else None,
                        },
                        "appointments": [],
                        "prescriptions": [],
                        "ai_notes": [],
                        "transcripts": [],
                        "medical_tests": [],
                        "recommended_tests": []
                    }
                    
                    # Process appointments
                    for appt in appointments:
                        appointment_data = {
                            "id": appt["id"],
                            "date": appt["scheduledAt"].isoformat() if appt["scheduledAt"] else None,
                            "doctor": appt["doctor_name"] or "Unknown Doctor",
                            "department": appt["department"],
                            "speciality": appt["speciality"],
                            "reason": appt["reason"],
                            "status": appt["status"],
                            "notes": appt["notes"],
                            "ai_notes": appt["ai_notes"]
                        }
                        patient_data["appointments"].append(appointment_data)
                        
                        # Extract prescription data
                        if appt["prescription"]:
                            try:
                                prescription_data = json.loads(appt["prescription"])
                                if isinstance(prescription_data, dict):
                                    patient_data["prescriptions"].extend(prescription_data.get("medications", []))
                            except (json.JSONDecodeError, TypeError):
                                pass
                        
                        # Extract recommended tests
                        if appt["recommendedTests"]:
                            try:
                                test_ids = json.loads(appt["recommendedTests"])
                                if isinstance(test_ids, list):
                                    for test_id in test_ids:
                                        # Find test name
                                        for test in medical_tests:
                                            if test["TestID"] == test_id:
                                                patient_data["recommended_tests"].append({
                                                    "id": test_id,
                                                    "name": test["TestName"],
                                                    "status": "Pending"
                                                })
                                                break
                            except (json.JSONDecodeError, TypeError):
                                pass
                    
                    # Process transcripts
                    for transcript in transcripts:
                        patient_data["transcripts"].append({
                            "text": transcript["text"],
                            "created_at": transcript["createdAt"].isoformat() if transcript["createdAt"] else None,
                            "appointment_date": transcript["scheduledAt"].isoformat() if transcript["scheduledAt"] else None
                        })
                    
                    # Process AI notes
                    for appt in appointments:
                        if appt["ai_notes"]:
                            patient_data["ai_notes"].append({
                                "date": appt["scheduledAt"].isoformat() if appt["scheduledAt"] else None,
                                "summary": appt["ai_notes"][:200] + "..." if len(appt["ai_notes"]) > 200 else appt["ai_notes"]
                            })
                    
                    # Process medical tests
                    for test in medical_tests:
                        patient_data["medical_tests"].append({
                            "id": test["TestID"],
                            "name": test["TestName"]
                        })
                    
                    return patient_data
                    
        except Exception as e:
            # Log error and return empty data
            print(f"Error retrieving patient data: {e}")
            return self._get_empty_patient_data(patient_id)
    
    def _get_empty_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """Return empty patient data structure when database is unavailable."""
        return {
            "basic_info": {
                "patient_id": patient_id,
                "retrieved_at": datetime.now().isoformat(),
                "note": "Database not available - using fallback mode"
            },
            "profile": {
                "name": None,
                "age": None,
                "gender": None,
                "weight": None,
                "height": None,
                "phone": None,
                "allergies": None,
                "ailments": None,
                "scribe_notes": None
            },
            "appointments": [],
            "prescriptions": [],
            "ai_notes": [],
            "transcripts": [],
            "medical_tests": [],
            "recommended_tests": []
        }
    
    def format_patient_context(self, patient_data: Dict[str, Any]) -> str:
        """Format patient data into a comprehensive, structured context for the AI."""
        context_parts = []
        
        # Basic profile information with enhanced details
        profile = patient_data.get("profile", {})
        if any(profile.values()):
            context_parts.append("=== COMPREHENSIVE PATIENT PROFILE ===")
            if profile.get("name"):
                context_parts.append(f"Patient Name: {profile['name']}")
            if profile.get("age"):
                context_parts.append(f"Age: {profile['age']} years old")
            if profile.get("gender"):
                context_parts.append(f"Gender: {profile['gender']}")
            if profile.get("weight") and profile.get("height"):
                bmi = profile["weight"] / ((profile["height"] / 100) ** 2)
                bmi_category = self._get_bmi_category(bmi)
                context_parts.append(f"Physical Stats: {profile['weight']} kg, {profile['height']} cm")
                context_parts.append(f"BMI: {bmi:.1f} ({bmi_category})")
            if profile.get("phone"):
                context_parts.append(f"Contact: {profile['phone']}")
            if profile.get("allergies"):
                context_parts.append(f"Known Allergies: {profile['allergies']}")
            if profile.get("ailments"):
                context_parts.append(f"Current Medical Conditions: {profile['ailments']}")
            if profile.get("scribe_notes"):
                context_parts.append(f"Additional Notes: {profile['scribe_notes']}")
            context_parts.append("")
        
        # Recent appointments with comprehensive details
        appointments = patient_data.get("appointments", [])
        if appointments:
            context_parts.append("=== RECENT MEDICAL APPOINTMENTS ===")
            for i, appt in enumerate(appointments[-5:], 1):  # Show last 5 appointments
                context_parts.append(f"Appointment #{i}:")
                if appt.get('date'):
                    context_parts.append(f"  Date: {appt['date']}")
                if appt.get('doctor'):
                    context_parts.append(f"  Doctor: {appt['doctor']}")
                if appt.get('department'):
                    context_parts.append(f"  Department: {appt['department']}")
                if appt.get('speciality'):
                    context_parts.append(f"  Specialty: {appt['speciality']}")
                if appt.get('reason'):
                    context_parts.append(f"  Reason for Visit: {appt['reason']}")
                if appt.get('status'):
                    context_parts.append(f"  Status: {appt['status']}")
                if appt.get('notes'):
                    context_parts.append(f"  Doctor Notes: {appt['notes']}")
                if appt.get('ai_notes'):
                    context_parts.append(f"  AI Consultation Summary: {appt['ai_notes'][:300]}...")
                context_parts.append("")
        
        # Current medications with detailed information
        prescriptions = patient_data.get("prescriptions", [])
        if prescriptions:
            context_parts.append("=== CURRENT MEDICATION REGIMEN ===")
            for i, med in enumerate(prescriptions, 1):
                if med.get("name"):
                    context_parts.append(f"Medication #{i}: {med['name']}")
                    if med.get("dose"):
                        context_parts.append(f"  Dosage: {med['dose']}")
                    if med.get("route"):
                        context_parts.append(f"  Route: {med['route']}")
                    if med.get("frequency"):
                        context_parts.append(f"  Frequency: {med['frequency']}")
                    if med.get("duration"):
                        context_parts.append(f"  Duration: {med['duration']}")
                    if med.get("notes"):
                        context_parts.append(f"  Special Instructions: {med['notes']}")
                    context_parts.append("")
        
        # Recent AI notes with full context
        ai_notes = patient_data.get("ai_notes", [])
        if ai_notes:
            context_parts.append("=== RECENT CONSULTATION SUMMARIES ===")
            for i, note in enumerate(ai_notes[-3:], 1):  # Show last 3 consultation summaries
                context_parts.append(f"Consultation Summary #{i}:")
                if note.get('date'):
                    context_parts.append(f"  Date: {note['date']}")
                if note.get('summary'):
                    context_parts.append(f"  Summary: {note['summary']}")
                context_parts.append("")
        
        # Consultation transcripts for context
        transcripts = patient_data.get("transcripts", [])
        if transcripts:
            context_parts.append("=== RECENT CONSULTATION TRANSCRIPTS ===")
            for i, transcript in enumerate(transcripts[-3:], 1):  # Show last 3 transcripts
                context_parts.append(f"Transcript #{i}:")
                if transcript.get('appointment_date'):
                    context_parts.append(f"  Appointment Date: {transcript['appointment_date']}")
                if transcript.get('text'):
                    # Truncate long transcripts but keep key information
                    text = transcript['text']
                    if len(text) > 200:
                        text = text[:200] + "..."
                    context_parts.append(f"  Content: {text}")
                context_parts.append("")
        
        # Recommended and available tests
        recommended_tests = patient_data.get("recommended_tests", [])
        medical_tests = patient_data.get("medical_tests", [])
        if recommended_tests or medical_tests:
            context_parts.append("=== MEDICAL TESTS & RECOMMENDATIONS ===")
            if recommended_tests:
                context_parts.append("Recommended Tests:")
                for test in recommended_tests:
                    context_parts.append(f"  • {test.get('name', 'Test')} - Status: {test.get('status', 'Pending')}")
                context_parts.append("")
            if medical_tests:
                context_parts.append("Available Tests in System:")
                for test in medical_tests[:10]:  # Show first 10 available tests
                    context_parts.append(f"  • {test.get('name', 'Test')}")
                context_parts.append("")
        
        # Data retrieval timestamp
        basic_info = patient_data.get("basic_info", {})
        if basic_info.get("retrieved_at"):
            context_parts.append(f"Data Retrieved: {basic_info['retrieved_at']}")
        
        return "\n".join(context_parts) if context_parts else "No specific patient data available for this session."
    
    def _get_bmi_category(self, bmi: float) -> str:
        """Get BMI category for better context."""
        if bmi < 18.5:
            return "Underweight"
        elif bmi < 25:
            return "Normal weight"
        elif bmi < 30:
            return "Overweight"
        else:
            return "Obese"


class IntelligentChatbotClient:
    """Intelligent chatbot client using Cerebras for personalized health assistance."""
    
    def __init__(self):
        self.base_url = settings.cerebras_base_url.rstrip("/")
        self.api_key = settings.cerebras_api_key
        self.model = settings.cerebras_model
        self.patient_data_service = PatientDataService()
        self._headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "AarogyaAI-Chatbot/1.0.0",
        }
    
    async def _chat(self, messages: List[Dict[str, str]], max_output_tokens: int = 1500) -> str:
        """Make a chat completion request to Cerebras API."""
        if not self.api_key:
            raise ValueError("Cerebras API key is required")
        
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.35,  # Low temperature to prevent hallucination and ensure factual responses
            "max_tokens": max_output_tokens,
        }
        
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, headers=self._headers, json=payload)
                
                if resp.status_code == 400:
                    # Get detailed error information for 400 Bad Request
                    try:
                        error_data = resp.json()
                        error_detail = error_data.get("error", {}).get("message", "Bad Request")
                        raise ValueError(f"Cerebras API Bad Request: {error_detail}")
                    except:
                        raise ValueError("Cerebras API Bad Request: Invalid request format or parameters")
                elif resp.status_code == 401:
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
            raise ValueError("Request timeout. The query may be too complex or the API is slow.")
        except httpx.RequestError as e:
            raise ValueError(f"Network error connecting to Cerebras API: {e}")
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON response from Cerebras API")
        except KeyError as e:
            raise ValueError(f"Unexpected response format from Cerebras API: missing {e}")
        except Exception as e:
            raise ValueError(f"Unexpected error with Cerebras API: {e}")
    
    async def generate_response(self, patient_id: str, user_message: str) -> str:
        """Generate intelligent response using patient data and Cerebras AI."""
        if not user_message or not user_message.strip():
            raise ValueError("User message cannot be empty")
        
        try:
            # Retrieve patient data
            patient_data = await self.patient_data_service.get_patient_data(patient_id)
            patient_context = self.patient_data_service.format_patient_context(patient_data)
            
            # Prepare messages for Cerebras
            if "Database not available" in patient_context:
                # Use a simpler prompt when database is not available
                system_prompt = (
                    "You are AarogyaAI Assistant, a helpful healthcare companion. "
                    "Provide general health guidance and always recommend consulting with healthcare providers for medical advice. "
                    "Be supportive, accurate, and include appropriate medical disclaimers."
                )
                user_prompt = f"""USER QUESTION: {user_message.strip()}

Please provide helpful health guidance. Since I don't have access to your specific medical history right now, I'll provide general information. Always recommend consulting with your healthcare provider for personalized medical advice."""
            else:
                # Use full context when patient data is available
                system_prompt = SYSTEM_CHATBOT
                user_prompt = f"""COMPREHENSIVE PATIENT MEDICAL CONTEXT:
{patient_context}

PATIENT'S QUESTION: {user_message.strip()}

INSTRUCTIONS FOR YOUR RESPONSE:
1. **Analyze the patient's question** using only documented medical information
2. **Reference specific patient data** only when explicitly documented (age, conditions, medications, appointments)
3. **Provide focused, factual information** based strictly on documented health status
4. **Offer personalized recommendations** based only on documented medical history and current situation
5. **Include actionable next steps** based only on documented patient profile
6. **Address safety concerns** considering only documented conditions and medications
7. **Reference doctors or specialists** only when explicitly documented
8. **Be concise and direct** while maintaining medical accuracy
9. **Show empathy and support** while being professional and authoritative
10. **CRITICAL: Do not add, assume, or infer any information not explicitly provided**
11. **Use minimal markdown formatting** for better readability (bold, italics, lists, code blocks)

Please provide a factual, personalized response using only explicitly documented patient data with minimal markdown formatting to give the most helpful and relevant guidance possible."""

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            # Generate response
            response = await self._chat(messages, max_output_tokens=1500)
            
            # Add medical disclaimer
            disclaimer = "\n\n⚠️ *This information is for general guidance only and should not replace professional medical advice. Please consult with your healthcare provider for personalized medical care.*"
            
            return response + disclaimer
            
        except Exception as e:
            # Fallback response if AI fails
            error_msg = str(e)
            if "400" in error_msg or "Bad Request" in error_msg:
                fallback_response = """I apologize, but I'm experiencing some technical difficulties with the AI service right now. 

Let me provide you with general health guidance based on your question:

"""
                # Add basic fallback logic based on the user's question
                user_question_lower = user_message.lower()
                if any(word in user_question_lower for word in ["pain", "hurt", "ache", "symptom"]):
                    fallback_response += """• If you're experiencing pain or symptoms, monitor them closely
• Note the severity, duration, and any triggers
• Contact your healthcare provider if symptoms worsen or persist
• For severe pain or emergency symptoms, seek immediate medical attention"""
                elif any(word in user_question_lower for word in ["appointment", "visit", "schedule"]):
                    fallback_response += """• You can book appointments through your patient dashboard
• Contact your healthcare provider's office for scheduling
• Check your upcoming appointments in the appointments section"""
                elif any(word in user_question_lower for word in ["medication", "medicine", "prescription"]):
                    fallback_response += """• For medication questions, consult your healthcare provider or pharmacist
• Take medications as prescribed and follow dosage instructions
• Report any side effects to your healthcare provider immediately"""
                else:
                    fallback_response += """• For general health questions, consult with your healthcare provider
• Maintain a healthy lifestyle with proper diet and exercise
• Don't hesitate to seek professional medical advice when needed"""
                
                fallback_response += """

⚠️ *This is general information only. Please consult with your healthcare provider for personalized medical advice.*"""
                return fallback_response
            else:
                return f"""I apologize, but I'm experiencing some technical difficulties accessing your medical information right now. 

For immediate health concerns, please contact your healthcare provider directly. For general health questions, I recommend consulting with a medical professional.

Technical issue: {error_msg}

Is there anything else I can help you with?"""


# Global instances
patient_data_service = PatientDataService()
intelligent_chatbot = IntelligentChatbotClient()


async def generate_chatbot_response(patient_id: str, user_message: str) -> str:
    """
    Generate intelligent chatbot response using patient data and Cerebras AI.
    
    Args:
        patient_id: The patient's unique identifier
        user_message: The user's question or message
        
    Returns:
        Personalized response from the intelligent chatbot
        
    Raises:
        ValueError: If inputs are invalid or API calls fail
    """
    return await intelligent_chatbot.generate_response(patient_id, user_message)
