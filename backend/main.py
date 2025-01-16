from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sequences, index, patient, allPatient, comparison, cluster
from app.models.DatabaseConnection import DatabaseConnection
from app.models.Clustering import Clustering

app = FastAPI()

# Pour lancer le serveur BACKEND (sur windows)
# dans le dossier ReactProject -> env\Scripts\activate
# dans le dossier backend -> uvicorn main:app --reload --host 127.0.0.1 --port 8000
# Pour lancer le serveur FRONTEND
# dans le dossier frontend -> npm run dev

# Pour lancer le serveur BACKEND (sur mac)
#dans le dossier ReactProject -> python3 -m venv env
#dans le dossier ReactProject -> source env/bin/activate
#dans le dossier ReactProject -> pip install fastapi uvicorn
#dans le dossier backend -> uvicorn main:app --reload --host 127.0.0.1 --port 8000

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_connection = DatabaseConnection.get_instance()
db_connection.connect("postgres://postgres:password@localhost:5432/projet_technique")



app.include_router(patient.router)
app.include_router(allPatient.router)
app.include_router(cluster.router)
app.include_router(index.router)
app.include_router(comparison.router)

# Premier clustering de tous les patients
Clustering.do_init_clustering(5, db_connection)

# Déconnecter la base de données lors de l'arrêt de l'application
@app.on_event("shutdown")
def shutdown_event():
    db_connection.disconnect()