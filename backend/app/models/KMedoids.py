from app.models.ClusteringStrategy import ClusteringStrategy
from app.models.Comparison import *
import numpy as np
from sklearn_extra.cluster import KMedoids as KM
import umap.umap_ as umap
import matplotlib.pyplot as plt
import os
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict

class KMedoids(ClusteringStrategy):

    def do_clustering(self, listeIdPatients: list, nbCluster: int, db_connection, comparisonStrategy: str):
        # Choix de la stratégie de comparaison
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

        # Initialiser et ajuster le modèle K-medoids
        kmedoids = KM(n_clusters=nbCluster, metric="precomputed", random_state=42)
        kmedoids.fit(matrice_distance)

        # Obtenir les clusters
        clusters = kmedoids.labels_

        # Obtenir les indices des médioïdes (points centraux)
        medoids = kmedoids.medoid_indices_

        # Associer chaque patient à son cluster
        patients_id_to_clusters_id = {
            patient: int(cluster) for patient, cluster in zip(listeIdPatients, clusters)
        }

        # Créer un mapping cluster -> liste des patients
        cluster_to_patients = defaultdict(list)
        for patient, cluster in patients_id_to_clusters_id.items():
            cluster_to_patients[int(cluster)].append(patient)


        # -----------------------------------------------------------------------------------------------
        # Réduction de dimensions à 2D avec UMAP
        reducer = umap.UMAP(metric="precomputed", n_components=2, random_state=42)
        X_embedded = reducer.fit_transform(matrice_distance)

        # Extraire les coordonnées des médioïdes
        medoids_embedded = X_embedded[medoids]

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
            title="Visualisation des clusters avec K-Medoids et UMAP",
        )

        # Ajouter les médioïdes au graphique
        fig.add_trace(go.Scatter(
            x=medoids_embedded[:, 0],
            y=medoids_embedded[:, 1],
            mode="markers",
            name="Medoids",
            marker=dict(size=15, color="black", symbol="x"),
            text=[f"Medoid {i}" for i in range(len(medoids_embedded))],
            hoverinfo="text"
        ))

        # Création du dossier si nécessaire
        output_dir = "../frontend/public/visuals/"
        os.makedirs(output_dir, exist_ok=True)

        # Sauvegarder le graphique en tant que fichier HTML
        html_path = os.path.join(output_dir, f"clusters_visualization_{comparisonStrategy}.html")
        fig.write_html(html_path)
        imagePathForFront = f"/visuals/clusters_visualization_{comparisonStrategy}.html"

        #Structurer le retour
        result = {
            "patient_to_cluster": patients_id_to_clusters_id,  # Mapping patient -> cluster
            "cluster_to_patients": {int(k): v for k, v in cluster_to_patients.items()},  # JSON-compatible
            "visualization_path": imagePathForFront,  # Chemin de l'image générée
        }

        return result
