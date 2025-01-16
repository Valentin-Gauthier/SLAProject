from app.models.ClusteringStrategy import ClusteringStrategy
from app.models.Comparison import *
from scipy.spatial.distance import squareform
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
import os
import umap.umap_ as umap
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict

class WardHierarchicalClustering(ClusteringStrategy):
    
    def do_clustering(self, listeIdPatients: list, nbCluster: int, db_connection, comparisonStrategy: str):

        # Choisir la stratégie de comparaison
        if comparisonStrategy == "tsl_dtw":
            strategy = Comp_TSLDTW()
        elif comparisonStrategy == "lcss":
            strategy = CompLCSS()
        elif comparisonStrategy == "soft_dtw":
            strategy = CompSoftDTW()
        elif comparisonStrategy == "dtw":
            strategy = CompDTW(multi=False)
        else:
            raise ValueError("Méthode de comparaison inconnue.")
        
        # Calculer la matrice de distance
        matrice_distance = strategy.compare(listeIdPatients, db_connection)
        print(f"Matrice de distance: {matrice_distance}")
        
        # Transformer la matrice de distance en un vecteur de distances
        vecteur_distance = squareform(matrice_distance)

        # Appliquer la méthode de Ward pour le clustering hiérarchique
        Z = linkage(vecteur_distance, method='ward')

        # Découper l'arbre pour obtenir les clusters
        clusters = fcluster(Z, t=nbCluster, criterion='maxclust')

        # Associer chaque patient à son cluster
        patient_id_to_cluster_id = {patient_id: cluster_id for patient_id, cluster_id in zip(listeIdPatients, clusters)}

        # Créer un mapping inversé : cluster -> liste de patients
        cluster_id_to_patients = defaultdict(list)
        for patient_id, cluster_id in patient_id_to_cluster_id.items():
            cluster_id_to_patients[cluster_id].append(patient_id)

        # Convertir `Z` (la matrice de linkage) en une liste Python (chaque élément de `Z` est un tableau NumPy)
        Z_list = Z.tolist()

        # Convertir les résultats en types Python natifs
        patient_id_to_cluster_id = {int(key): int(value) for key, value in patient_id_to_cluster_id.items()}
        cluster_id_to_patients = {int(key): [int(patient) for patient in value] for key, value in cluster_id_to_patients.items()}

        # -----------------------------------------------------------------------------------------------
        # Réduction de dimensions à 2D avec UMAP
        reducer = umap.UMAP(metric="precomputed", n_components=2, random_state=42)
        X_embedded = reducer.fit_transform(matrice_distance)

        # Création du DataFrame pour Plotly
        plot_data = pd.DataFrame({
            "UMAP1": X_embedded[:, 0],
            "UMAP2": X_embedded[:, 1],
            "Cluster": clusters,
            "Patient ID": listeIdPatients
        })

        # Génération du graphique interactif avec Plotly
        fig = px.scatter(
            plot_data,
            x="UMAP1",
            y="UMAP2",
            color="Cluster",
            hover_data={"Patient ID": True, "UMAP1": False, "UMAP2": False, "Cluster": True},
            title="Visualisation des clusters avec Ward et UMAP",
        )

        # Création du dossier si nécessaire
        output_dir = "../frontend/public/visuals/"
        os.makedirs(output_dir, exist_ok=True)

        # Sauvegarder le graphique en tant que fichier HTML
        html_path = os.path.join(output_dir, f"clusters_visualization_{comparisonStrategy}.html")
        fig.write_html(html_path)
        imagePathForFront = f"/visuals/clusters_visualization_{comparisonStrategy}.html"
        # -----------------------------------------------------------------------------------------------

        # Retourner un dictionnaire structuré avec les informations
        return {
            "patient_id_to_cluster_id": patient_id_to_cluster_id,  # Mapping patient -> cluster
            "cluster_to_patients": cluster_id_to_patients,  # Mapping cluster -> liste de patients
            "visualization_path": imagePathForFront
        }