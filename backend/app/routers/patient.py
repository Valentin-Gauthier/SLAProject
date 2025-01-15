from fastapi import APIRouter
from fastapi import HTTPException
from app.models.DatabaseConnection import DatabaseConnection


# récupère les données du patient sélectionné par l'utilisateur

router = APIRouter()

# Instance Singleton de la connexion à la base
db_connection = DatabaseConnection.get_instance()


def get_patient_data(idPatient: int):
    nomColonnes = ["IMC", "Poids", "Score ALS FRS-R"]
    colonnes = ["54", "53", "5", "59"]  # IMC / POIDS / score ALS respectivement les colonnes 54 53 et 5 et on récupère également le temps depuis le premier rdv donc colonne 59

    colonnes_str = ", ".join(f'"{col}"' for col in colonnes)

    # on créer la requête
    query = f"""
    SELECT {colonnes_str}
    FROM examen
    WHERE "1" = %s
    ORDER BY "59";
    """
    results = db_connection.execute(query, (idPatient,))
    # Si aucun résultat n'est trouvé on lève une erreur
    if not results:
        raise HTTPException(status_code=404, detail="Patient not found")

    courbes = {nom: {"nbJours": [], "yData": []} for nom in nomColonnes} 
    
    for row in results:
        nbJours = int(row[-1]) # La valeur de la colonne 59 (nombre de jours depuis le premier RDV)
         # on remplit les données dynamiquement en utilisant les indices des colonnes
        for i, nom in enumerate(nomColonnes):
            valeur = row[i] 
            if valeur is not None:
                courbes[nom]["nbJours"].append(nbJours)
                courbes[nom]["yData"].append(valeur)

    return {
        "patients": [
            {
                "id": idPatient,
                "courbes": courbes
            }
        ]
    }

"""
Méthode pour renvoyer les données d'un patient
parametre : entier correspondant à l'id du patient du type : http://127.0.0.1:8000/patient?id=5
return  : 
{"patients":[
    {
        "id":5,
        "courbes":{
            "IMC":{"nbJours":[0,20,181],"yData":[25.18,24.86,25.83]},
            "Poids":{"nbJours":[0,20,181],"yData":[78.0,77.0,80.0]},
            "Score ALS FRS-R":{"nbJours":[0,20,72],"yData":[42.0,42.0,40.0]}
            }
    }
    ]
} 
"""
@router.get("/patient")
def compare(id : int):
    try:
        data = get_patient_data(id)
    except HTTPException as e:
        raise e
    return data
