# AarogyaAI - Medical AI Assistant

A comprehensive medical AI platform with speech-to-text transcription and AI-powered medical notes generation.

## 🏗️ Project Structure

```
AarogyaAI/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── context/         # React context providers
│   │   ├── lib/             # Utility libraries
│   │   └── data/            # Static data
│   ├── prisma/              # Database schema and migrations
│   └── public/              # Static assets
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Configuration settings
│   │   ├── stt_manager.py   # Speech-to-text management
│   │   └── ai_notes.py      # AI medical notes generation
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
└── .gitignore               # Root-level gitignore
```

## 🚀 Features

### Frontend (Next.js)
- **Patient Management**: Patient profiles, appointments, medical history
- **Doctor Dashboard**: Patient consultations, AI notes, prescription management
- **Speech-to-Text**: Real-time transcription during consultations
- **AI Notes**: Structured medical notes with markdown formatting
- **Authentication**: Role-based access (doctors, patients)

### Backend (FastAPI)
- **STT Integration**: Cartesia API for speech-to-text
- **AI Notes Generation**: Cerebras Llama 3.1 8B for medical notes
- **Structured Output**: Symptoms, Doctor Advice, Medications, Medical Past, Summary
- **Prescription Data**: JSON format for autofill functionality

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip
- PostgreSQL database

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### Environment Variables

#### Backend (.env)
```env
# LiveKit credentials
LIVEKIT_URL=wss://your-livekit-url
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-secret

# Cartesia API
CARTESIA_API_KEY=your-cartesia-api-key

# Cerebras AI
CEREBRAS_API_KEY=your-cerebras-api-key
CEREBRAS_BASE_URL=https://api.cerebras.ai/v1
CEREBRAS_MODEL=llama-3.1-8b-instruct

# STT Configuration
STT_LANGUAGE=en
STT_MODEL=ink-whisper
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_STT_BACKEND_URL=http://localhost:8080
```

## 📋 API Endpoints

### STT Endpoints
- `POST /stt/session/start` - Start speech-to-text session
- `POST /stt/session/stop` - Stop STT session
- `POST /stt/session/stop_and_process` - Stop session and generate AI notes

### AI Notes Endpoints
- `POST /ai/notes` - Generate AI medical notes from transcript

## 🎯 AI Notes Structure

The AI generates structured medical notes with 5 sections:

1. **SYMPTOMS** - Patient-reported symptoms
2. **DOCTOR ADVICE** - Medical recommendations and instructions
3. **MEDICATIONS** - Prescribed medications with dosage
4. **MEDICAL PAST** - Previous medical history
5. **SUMMARY** - Concise consultation summary

## 🔧 Development

### Git Workflow
- Root-level gitignore handles both frontend and backend
- Backend has specific Python/FastAPI ignores
- Frontend has Next.js specific ignores

### Code Structure
- **Frontend**: React components with TypeScript
- **Backend**: FastAPI with async/await patterns
- **Database**: Prisma ORM with PostgreSQL
- **AI Integration**: Cerebras API for medical notes generation

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Docker)
```bash
docker build -t aarogyaai-backend .
docker run -p 8080:8080 aarogyaai-backend
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@aarogyaai.com or create an issue in the repository.
