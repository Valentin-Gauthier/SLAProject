from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sequences, index
from app.routers import cluster
from app.models.DatabaseConnection import DatabaseConnection

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

db_connection = DatabaseConnection.get_instance()
db_connection.connect("postgres://postgres:admin@localhost:5432/projet_technique")

app.include_router(sequences.router, prefix="/sequences", tags=["Sequences"])
app.include_router(cluster.router)
app.include_router(index.router)
#app.include_router(patient.router)

# Premier clustering de tous les patients
from app.models.Clustering import Clustering
Clustering.do_init_clustering(5, db_connection)

# Déconnecter la base de données lors de l'arrêt de l'application
@app.on_event("shutdown")
def shutdown_event():
    db_connection.disconnect()