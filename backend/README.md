# AarogyaAI Backend (LiveKit + Cartesia STT)

## Setup

1. Create and activate a venv
```bash
python3 -m venv .venv && source .venv/bin/activate
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Configure environment
```bash
cp .env.example .env
# fill in LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, CARTESIA_API_KEY
```

## Run
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## API
- POST `/stt/session/start` -> `{ session_id }`
- POST `/stt/session/stop` with `{ session_id }` -> `{ ok: true }`

Sessions connect to LiveKit and stream audio to Cartesia STT using LiveKit Agents.
