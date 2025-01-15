from abc import ABC, abstractmethod
from app.models.Sequences import *
from tslearn.metrics import lcss,lcss_path, soft_dtw, dtw as tsl_dtw, dtw_path
from dtaidistance import dtw
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import os
import seaborn as sns
from concurrent.futures import ThreadPoolExecutor

class Comparison(ABC):
    sequences: dict
    patients: list
    matrice:list

    def __init__(self):
        self.sequences = {}
        self.patients = []
        self.matrice = []

    def heatmap(self,titre):
        output_dir = "../visuals/"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "HeatMap.png")

        self.matrice = np.array(self.matrice)
        matplotlib.use('Agg')
        # Création de la heatmap
        if (len(self.matrice) < 10):
            sns.heatmap(self.matrice, annot=True, fmt=".2f", cmap="viridis", xticklabels=self.patients, yticklabels=self.patients)
        else:
            sns.heatmap(self.matrice, annot=False, fmt=".2f", cmap="viridis")
        # Personnalisation de la heatmap
        plt.title(titre)
        plt.xlabel("Patients")
        plt.ylabel("Patients")
        plt.xticks(rotation=45)  # Incliner les labels pour plus de lisibilité
        plt.tight_layout()       # Ajuster les marges pour éviter le chevauchement
        plt.savefig(output_path)
        plt.close()
    
    def compute_distance(self,args):
        i, j, seq1, seq2, methode = args
        dist=0
        match methode:
            case "lcss":
                dist = lcss(seq1, seq2, eps=5)
            case "dtw":
                dist = tsl_dtw(seq1, seq2)
            case "soft_dtw":
                dist = soft_dtw(seq1, seq2)
        return i, j, dist

    @abstractmethod
    def compare(self, ids,db_connection):
        """permet la comparaison de séquences"""
        pass

    @abstractmethod
    def illustrate(self):
        """permet d'illustrer la comparaison en fonction de la methode choisie"""

class CompDTW(Comparison):
    def __init__(self, multi=False):
        super().__init__()
        self.multi = multi

    def compare(self,ids,db_connection):
        """permet la comparaison de séquences en utilisant Dynamic Time Warping"""
        if (self.multi):
            seqs = SequencesMulti()
            data = seqs.request(db_connection,ids)
            seqs.formater(data)
            seqs.clean_sequences(replace=True)

            #Récupération des clés des patients
            sequences = seqs.get()
            self.patients = list(sequences.keys())

            # Transformation en une liste de listes de np.array
            sequences_list = [np.array(sequence) for sequence in sequences.values()]
            # Calcul des distances entre toutes les paires de patients
            distances = dtw.distance_matrix_fast(sequences_list)
            # Convertir le résultat en une liste de listes pour le rendre JSON-compatible
            distances_json = distances.tolist()
            self.matrice = np.array(distances_json)
            return distances_json
        else:
            seqs = SequencesUni()
            data = seqs.request(db_connection,ids)
            seqs.formater(data)
            seqs.clean_sequences(replace=True)

            #Récupération des clés des patients
            sequences = seqs.get()
            self.patients = list(sequences.keys())

            # Transformation en une liste de listes de np.array
            sequences_list = [np.array(sequence) for sequence in sequences.values()]
            # Calcul des distances entre toutes les paires de patients
            distances = dtw.distance_matrix_fast(sequences_list)
            # Convertir le résultat en une liste de listes pour le rendre JSON-compatible
            distances_json = distances.tolist()
            self.matrice = np.array(distances_json)
            return distances_json
        
    def illustrate(self):
        if (len(self.sequences) != 2):
            self.heatmap("Heatmap des distances entre patients (DTW)")

class CompLCSS(Comparison):
    def compare(self,ids,db_connection):
        """permet la comparaison de séquences en utilisant Longest Common SubSequence"""
        seqs = SequencesUni()
        data = seqs.request(db_connection,ids)
        
        seqs.formater(data)
        seqs.clean_sequences(replace=False)
        #Récupération des clés des patients
        self.sequences = seqs.get()
        self.patients = list(self.sequences.keys())

        # Initialisation d'une matrice pour stocker les distances
        n = len(self.patients)
        distances = [[0 for _ in range(n)] for _ in range(n)]

        tasks = [
            (i, j, self.sequences[self.patients[i]], self.sequences[self.patients[j]],"lcss")
            for i in range(n)
            for j in range(i + 1, n)
        ]

        # Utiliser un ThreadPoolExecutor pour paralléliser
        with ThreadPoolExecutor() as executor:
            results = executor.map(self.compute_distance, tasks)

        # Remplir la matrice avec les résultats
        for i, j, dist in results:
            distances[i][j] = dist
            distances[j][i] = dist
        self.matrice = np.array(distances)
        return distances
    
        
    def illustrate(self):
        """créer des graphiques spécifiques a LCSS"""
        if (len(self.sequences) == 2):
            
            output_dir = "../visuals/"
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, "compPlot.png")

            seqs = [value for value in self.sequences.values() if isinstance(value, list)]
            seqs = [[[x]for x in seq]for seq in seqs]
            
            lcsspath, sim_lcss = lcss_path(seqs[0], seqs[1],eps=5)

            matplotlib.use('Agg')
            plt.plot(seqs[0], "b-", label="patient " + str(self.patients[0]))
            plt.plot(seqs[1], "g-", label="patient " + str(self.patients[1]))

            for positions in lcsspath:
                plt.plot([positions[0], positions[1]],
                        [seqs[0][positions[0]][0], seqs[1][positions[1]][0]], color='orange')
            plt.legend()
            plt.title("Time series matching with LCSS")
            plt.tight_layout()
            plt.savefig(output_path)
            plt.close()
        else:
            self.heatmap("Heatmap des distances entre patients (LCSS)")

class Comp_TSLDTW(Comparison):
    def compare(self,ids,db_connection):
        """permet la comparaison de séquences en utilisant Dynamic Time Warping"""
        seqs = SequencesUni()
        data = seqs.request(db_connection,ids)
        
        seqs.formater(data)
        seqs.clean_sequences(replace=True)
        #Récupération des clés des patients
        self.sequences = seqs.get()
        self.patients = list(self.sequences.keys())

        # Initialisation d'une matrice pour stocker les distances
        n = len(self.patients)
        distances = [[0 for _ in range(n)] for _ in range(n)]
        # Calcul des distances entre toutes les paires de patients
        tasks = [
            (i, j, self.sequences[self.patients[i]], self.sequences[self.patients[j]],"dtw")
            for i in range(n)
            for j in range(i + 1, n)
        ]

        # Utiliser un ThreadPoolExecutor pour paralléliser
        with ThreadPoolExecutor() as executor:
            results = executor.map(self.compute_distance, tasks)
        
        for i, j, dist in results:
            distances[i][j] = dist
            distances[j][i] = dist
        self.matrice = np.array(distances)
        return distances
        
    def illustrate(self):
        """créer des graphiques spécifiques a DTW"""
        if (len(self.sequences) == 2):
            
            output_dir = "../visuals/"
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, "compPlot.png")

            seqs = [value for value in self.sequences.values() if isinstance(value, list)]
            seqs = [[[x]for x in seq]for seq in seqs]
            
            dtwpath, sim_dtw = dtw_path(seqs[0], seqs[1])

            matplotlib.use('Agg')
            plt.plot(seqs[0], "b-", label="patient " + str(self.patients[0]))
            plt.plot(seqs[1], "g-", label="patient " + str(self.patients[1]))

            for positions in dtwpath:
                plt.plot([positions[0], positions[1]],
                        [seqs[0][positions[0]][0], seqs[1][positions[1]][0]], color='orange')
            plt.legend()
            plt.title("Time series matching with DTW")
            plt.tight_layout()
            plt.savefig(output_path)
            plt.close()
        else:
            self.heatmap("Heatmap des distances entre patients (DTW)")

class CompSoftDTW(Comparison):
    def compare(self,ids,db_connection):
        """permet la comparaison de séquences en utilisant Soft Dynamic Time Warping"""
        seqs = SequencesUni()
        data = seqs.request(db_connection,ids)
        
        seqs.formater(data)
        seqs.clean_sequences(replace=True)
        #Récupération des clés des patients
        self.sequences = seqs.get()
        self.patients = list(self.sequences.keys())

        # Initialisation d'une matrice pour stocker les distances
        n = len(self.patients)
        distances = [[0 for _ in range(n)] for _ in range(n)]
        # Calcul des distances entre toutes les paires de patients
        tasks = [
            (i, j, self.sequences[self.patients[i]], self.sequences[self.patients[j]],"soft_dtw")
            for i in range(n)
            for j in range(i + 1, n)
        ]

        # Utiliser un ThreadPoolExecutor pour paralléliser
        with ThreadPoolExecutor() as executor:
            results = executor.map(self.compute_distance, tasks)
        
        for i, j, dist in results:
            distances[i][j] = dist
            distances[j][i] = dist
        self.matrice = np.array(distances)
        return distances
        
    def illustrate(self):
        if (len(self.sequences) == 2):
            
            output_dir = "../visuals/"
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, "compPlot.png")

            seqs = [value for value in self.sequences.values() if isinstance(value, list)]
            seqs = [[[x]for x in seq]for seq in seqs]
            
            dtwpath, sim_dtw = dtw_path(seqs[0], seqs[1])

            matplotlib.use('Agg')
            plt.plot(seqs[0], "b-", label="patient " + str(self.patients[0]))
            plt.plot(seqs[1], "g-", label="patient " + str(self.patients[1]))

            for positions in dtwpath:
                plt.plot([positions[0], positions[1]],
                        [seqs[0][positions[0]][0], seqs[1][positions[1]][0]], color='orange')
            plt.legend()
            plt.title("Time series matching with DTW")
            plt.tight_layout()
            plt.savefig(output_path)
            plt.close()
        else:
            self.heatmap("Heatmap des distances entre patients (soft-DTW)")