from app.models.ClusteringStrategy import ClusteringStrategy
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
import numpy as np
import pandas as pd  # Pour manipuler les données plus facilement
from collections import defaultdict
import os
import umap
import plotly.express as px
import plotly.graph_objects as go
from collections import defaultdict

class KMean(ClusteringStrategy):

    def do_init_clustering(self, nbCluster: int, db_connection):
        # 1. Récupération des données des patients de la base de données
        sql = 'SELECT "1" AS patient_id, "61" AS valeur FROM examen ORDER BY "1", "3" DESC'
        res = db_connection.execute(sql)

        # Convertir les résultats en DataFrame
        data = pd.DataFrame(res, columns=["patient_id", "value"])

        # 2. Gestion des NaN (valeurs manquantes)
        data = data.dropna(subset=["value"])

        # 3. Ne garder que les 4 derniers RDV des patients
        data = data.groupby("patient_id").head(4)
        res = data.values.tolist()

        # 4. Créer un dictionnaire patient_id -> valeurs
        patient_id_to_values = defaultdict(list)
        for patient_id, value in res:
            patient_id_to_values[patient_id].append(value)
        patient_id_to_values = dict(patient_id_to_values)

        # 5. Préparer les données pour KMeans
        liste_de_liste_de_valeur = [np.array(value) for value in patient_id_to_values.values()]
        X = np.array(liste_de_liste_de_valeur)

        # 6. Appliquer K-Means
        kmeans = KMeans(n_clusters=nbCluster, random_state=0)
        kmeans.fit(X)

        # Récupérer les prédictions (clusters des points)
        y_kmeans = kmeans.predict(X)

        # 7. Créer un dictionnaire patient_id -> cluster_id
        patient_id_to_cluster_id = {
            int(list(patient_id_to_values.keys())[i]): int(y_kmeans[i])
            for i in range(len(patient_id_to_values))
        }
 
        # Mettre à jour les clusters dans la base de données
        for patient_id, cluster_id in patient_id_to_cluster_id.items():
            sql = 'UPDATE patient SET "185" = %s WHERE "1" = %s;'
            db_connection.execute(sql, (cluster_id, patient_id))

        # 8. Visualisation avec UMAP
        reducer = umap.UMAP(n_components=2, random_state=42)
        X_embedded = reducer.fit_transform(X)

        # Réduire les centroïdes à 2 dimensions
        centroids_embedded = reducer.transform(kmeans.cluster_centers_)

        # Création du DataFrame pour Plotly
        plot_data = pd.DataFrame({
            "UMAP1": X_embedded[:, 0],
            "UMAP2": X_embedded[:, 1],
            "Cluster": y_kmeans,
            "Patient ID": list(patient_id_to_values.keys())
        })

        # Génération du graphique interactif avec Plotly
        fig = px.scatter(
            plot_data,
            x="UMAP1",
            y="UMAP2",
            color="Cluster",
            hover_data={"Patient ID": True, "UMAP1": False, "UMAP2": False, "Cluster": True},
            title="Visualisation des clusters avec K-Means et UMAP",
        )

        # Ajouter les centroïdes
        fig.add_trace(go.Scatter(
            x=centroids_embedded[:, 0],
            y=centroids_embedded[:, 1],
            mode="markers",
            name="Centroids",
            marker=dict(size=15, color="black", symbol="x"),
            text=[f"Centroid {i}" for i in range(len(centroids_embedded))],
            hoverinfo="text"
        ))

        # 9. Sauvegarder le graphique en tant que fichier HTML
        output_dir = "../frontend/public/visuals/"
        os.makedirs(output_dir, exist_ok=True)
        html_path = os.path.join(output_dir, "clusteringTotal.html")
        fig.write_html(html_path)
        imagePathForFront = "/visuals/clusteringTotal.html"

        return {
            "patient_to_cluster": patient_id_to_cluster_id,
            "visualization_path": imagePathForFront
        }


    def do_clustering(self, listeIdPatients: list, nbCluster: int, db_connection, comparisonStrategy: str):
        try:
            # 1. Construire et exécuter la requête SQL
            sql = """
                SELECT "1" AS patient_id, "61" AS value
                FROM examen
                WHERE "1" IN (%s)
                ORDER BY "1", "61" DESC
            """ % ','.join(['%s'] * len(listeIdPatients))
            
            # Exécution de la requête
            res = db_connection.execute(sql, tuple(listeIdPatients))
            
            # 2. Transformer les résultats en DataFrame
            data = pd.DataFrame(res, columns=["patient_id", "value"])
            data = data.dropna(subset=["value"])  # Supprimer les valeurs manquantes
            data = data.groupby("patient_id").head(4)  # Limiter à 4 valeurs par patient
            
            # 3. Préparer les données pour KMeans
            patient_id_to_values = defaultdict(list)
            for cle, valeur in data.values:
                patient_id_to_values[cle].append(valeur)
            patient_id_to_values = dict(patient_id_to_values)
            
            X = np.array([np.array(v) for v in patient_id_to_values.values()])
            patient_ids = list(patient_id_to_values.keys())

            # 4. Appliquer KMeans
            kmeans = KMeans(n_clusters=nbCluster, random_state=0)
            kmeans.fit(X)
            y_kmeans = kmeans.predict(X)
            
            # 5. Créer les structures de résultat
            patient_to_cluster = {
                int(patient_id): int(cluster_id)
                for patient_id, cluster_id in zip(patient_id_to_values.keys(), y_kmeans)
            }
            
            cluster_to_patients = defaultdict(list)
            for patient_id, cluster_id in patient_to_cluster.items():
                cluster_to_patients[cluster_id].append(patient_id)

            # -----------------------------------------------------------------------------------------------
            # 6. Création du HTML IMAGE
            reducer = umap.UMAP(n_components=2, random_state=42)
            X_embedded = reducer.fit_transform(X)  # Réduction des dimensions à 2D

            # Réduire les centroïdes à 2 dimensions
            centroids_embedded = reducer.transform(kmeans.cluster_centers_)

            # Création du DataFrame pour Plotly
            plot_data = pd.DataFrame({
                "UMAP1": X_embedded[:, 0],
                "UMAP2": X_embedded[:, 1],
                "Cluster": y_kmeans,
                "Patient ID": patient_ids
            })

            # Génération du graphique interactif avec Plotly
            fig = px.scatter(
                plot_data,
                x="UMAP1",
                y="UMAP2",
                color="Cluster",
                hover_data={"Patient ID": True, "UMAP1": False, "UMAP2": False, "Cluster": True},
                title="Visualisation des clusters avec UMAP",
            )

            # Ajouter les centroïdes
            # fig.add_trace(go.Scatter(
            #     x=centroids_embedded[:, 0],
            #     y=centroids_embedded[:, 1],
            #     mode="markers",
            #     name="Centroids",
            #     marker=dict(size=15, color="black", symbol="x"),
            #     text=[f"Centroid {i}" for i in range(len(centroids_embedded))],
            #     hoverinfo="text"
            # ))

            # Création du dossier si nécessaire
            output_dir = "../frontend/public/visuals/"
            os.makedirs(output_dir, exist_ok=True)

            # Sauvegarder le graphique en tant que fichier HTML
            html_path = os.path.join(output_dir, "clusters_visualization.html")
            fig.write_html(html_path)
            imagePathForFront = "/visuals/clusters_visualization.html"

            # OU IMAGE PNG
            # reducer = umap.UMAP(n_components=2, random_state=42)
            # X_embedded = reducer.fit_transform(X)  # Réduction des dimensions à 2D

            # # Création du dossier si nécessaire
            # output_dir = "../visualsClustering/"
            # os.makedirs(output_dir, exist_ok=True)

            # # Génération de l'image
            # plt.figure(figsize=(10, 8))
            # scatter = plt.scatter(X_embedded[:, 0], X_embedded[:, 1], c=y_kmeans, cmap='viridis', s=50)
            # plt.colorbar(scatter, label="Clusters")
            # plt.title("Visualisation des clusters avec UMAP")
            # plt.xlabel("UMAP Dimension 1")
            # plt.ylabel("UMAP Dimension 2")

            # # Sauvegarder l'image
            # image_path = os.path.join(output_dir, "clusters_visualization.png")
            # plt.savefig(image_path)
            # plt.close()

            # -----------------------------------------------------------------------------------------------
            
            # 6. Retourner les résultats
            return {
                "patient_to_cluster": patient_to_cluster,
                "cluster_to_patients": dict(cluster_to_patients),
                "visualization_path": imagePathForFront,  # Chemin du graphique interactif
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }