from fastapi import APIRouter
from fastapi import HTTPException
from app.models.DatabaseConnection import DatabaseConnection

# récupère les données du patient sélectionné par l'utilisateur

router = APIRouter()

# Instance Singleton de la connexion à la base
db_connection = DatabaseConnection.get_instance()


"""
Méthode pour renvoyer les id de tous les patients valide
parametre : aucun
return  : 
{"patient_ids":[5,7,12,20,22,23]}
"""
@router.get("/allpatient")
def getPatients():
    try:
        query = f"""
        SELECT DISTINCT "1"
        FROM examen
        ORDER BY "1";
        """
        results = db_connection.execute(query)


    # Si aucun résultat n'est trouvé on lève une erreur
        if not results:
            raise HTTPException(status_code=404, detail="Patient not found")

        patient_ids = [row[0] for row in results]
        return {"patient_ids": patient_ids}

    except HTTPException as e:
        raise e
