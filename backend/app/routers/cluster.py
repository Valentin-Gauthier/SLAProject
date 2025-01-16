from fastapi import APIRouter, FastAPI, Query
from typing import List
from app.models.Clustering import Clustering
from app.models.ClusteringRequest import ClusteringRequest

router = APIRouter()

@router.get("/cluster/get_all_clusters_and_patients")
def get_all_clusters_and_patients():
    return Clustering.get_all_clusters()

@router.get("/cluster/get_patients_by_cluster")
def get_patients_by_cluster(idCluster: int = 0):
    return Clustering.get_patients_by_cluster(idCluster)

@router.get("/cluster/get_cluster_and_patients_by_patient")
def get_cluster_and_patients_by_patient(idPatient: int):
    return Clustering.get_cluster_and_patients_by_patient(idPatient)

@router.get("/cluster/add_patient")
def add_patient(patient: tuple = Query(...)):
    return Clustering.add_patient(patient)

@router.get("/cluster/cluster")
def cluster(clusteringStrategy: str = "kmeans", comparisonStrategy: str = "None", nbCluster: int = 2, listeIdPatients: List[int] = Query(...)):
    print(f"Strategy de Clustering: {clusteringStrategy}")
    print(f"Strategy de Comparaison: {comparisonStrategy}")
    print(f"Nombre de cluster: {nbCluster}")
    print(f"Liste id des patients: {listeIdPatients}")
    clustering = Clustering(clusteringStrategy, nbCluster)
    clustering_result = clustering.cluster(listeIdPatients, comparisonStrategy)
    return clustering_result

# @router.post("/cluster")
# def cluster(request: ClusteringRequest):
#     print(f"Strategy de Clustering: {request.clusteringStrategy}")
#     print(f"Strategy de Comparaison: {request.comparisonStrategy}")
#     print(f"Nombre de cluster: {request.nbCluster}")
#     print(f"Liste id des patients: {request.listeIdPatients}")
#     clustering = Clustering(request.clusteringStrategy, request.nbCluster)
#     clustering_result = clustering.cluster(request.listeIdPatients, request.comparisonStrategy)

#     # Retourner les résultats
#     return {
#         "success": True,
#         "message": "Clustering effectué avec succès.",
#         "data": clustering_result
#     }
