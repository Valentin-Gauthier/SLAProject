from pydantic import BaseModel
from typing import List

class ClusteringRequest(BaseModel):
    clusteringStrategy: str  # Méthode de clustering (ex: kmean)
    comparisonStrategy: str  # Méthode de comparaison (ex: dtw)
    nbCluster: int  # Nombre de clusters
    listeIdPatients: List[int]  # Liste des IDs de patients