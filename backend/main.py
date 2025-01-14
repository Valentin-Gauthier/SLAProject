from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sequences, index

app = FastAPI()

# Pour lancer le serveur BACKEND
# dans le dossier ReactProject -> env\Scripts\activate
# dans le dossier backend -> uvicorn main:app --reload --host 127.0.0.1 --port 8000
# Pour lancer le serveur FRONTEND
# dans le dossier frontend -> npm run dev

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sequences.router, prefix="/sequences", tags=["Sequences"])
app.include_router(index.router)