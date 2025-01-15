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

class KMean(ClusteringStrategy):

    def do_init_clustering(self, nbCluster: int, db_connection):
        # 1. Récupération des données des patients de la base de données
        sql = 'SELECT "1" AS patient_id, "61" AS valeur FROM examen ORDER BY "1", "3" DESC'
        res = db_connection.execute(sql)
        # print("Résultats de la requête :", res)

        # Convertir les résultats en DataFrame pour faciliter les manipulations
        data = pd.DataFrame(res, columns=["patient_id", "value"])
        # 2. Gestion des NaN (valeurs manquantes)
        # Supprimer les lignes avec des NaN ou les remplir avec une valeur par défaut
        data = data.dropna(subset=["value"])  # Supprime les lignes avec NaN dans "value"
        # 3. Ne garder que les 5 derniers RDV des patients
        data = data.groupby("patient_id").head(4)
        res = data.values.tolist()
        # print("Résultats de la requête après data :", res)

        # 3. Dictionnaire de correspondance patient_id -> valeurs
        patient_id_to_values = {}

        # Utilisation de defaultdict pour facilement ajouter des valeurs dans des listes
        patient_id_to_values = defaultdict(list)

        # Remplir le dictionnaire
        for cle, valeur in res:
            patient_id_to_values[cle].append(valeur)

        # Conversion en dictionnaire normal
        patient_id_to_values = dict(patient_id_to_values)

        # print("Patient_id_to_values : ", patient_id_to_values)

        # 4. Préparer les données pour KMeans
        liste_de_liste_de_valeur = []
        for value in patient_id_to_values.values():
            liste_de_liste_de_valeur.append(np.array(value))

        # print("Liste de liste de valeur : ", liste_de_liste_de_valeur[:20])
        X = np.array(liste_de_liste_de_valeur)
        #print("X : ", X)

        # 5. Préparer les données pour KMeans
        # X = np.array(data["value"]).reshape(-1, 1)  # Les données pour le clustering

        # 5. Appliquer K-Means
        # Entraîner le modèle K-Means avec nbCluster clusters
        kmeans = KMeans(n_clusters=nbCluster, random_state=0)
        kmeans.fit(X)

        # Récupérer les prédictions (clusters des points)
        y_kmeans = kmeans.predict(X)

        # 5. Créer un dictionnaire patient_id -> cluster_id
        patient_id_to_cluster_id = {}
        for i in range(len(patient_id_to_values)):
            patient_id_to_cluster_id[int(list(patient_id_to_values.keys())[i])] = int(y_kmeans[i])

        # print("patient_id_to_cluster_id : ", patient_id_to_cluster_id)

        # Mettre l'attribut cluster de chaque patient dans la base de données à la valeur y_kmeans[i]
        for patient_id, cluster_id in patient_id_to_cluster_id.items():
            sql = 'UPDATE patient SET "185" = %s WHERE "1" = %s;'
            res = db_connection.execute(sql, (cluster_id, patient_id))


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
            output_dir = "../visualsClustering/"
            os.makedirs(output_dir, exist_ok=True)

            # Sauvegarder le graphique en tant que fichier HTML
            html_path = os.path.join(output_dir, "clusters_visualization.html")
            fig.write_html(html_path)


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
                "visualization_path": html_path,  # Chemin du graphique interactif
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }