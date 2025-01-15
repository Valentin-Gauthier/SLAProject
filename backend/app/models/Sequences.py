from abc import ABC, abstractmethod
from fastapi import HTTPException
from collections import defaultdict
import math

class Sequences(ABC):
    sequences: dict
    query: str

    def afficher_sequences(self):
        print("Séquences par patient :")
        for patient_id, seq in self.sequences.items():
            print(f"Patient {patient_id}: {seq}") 

    def request(self, db_connection, ids):
        """retourne les données en fonction de la requete spécifiée"""
        data = db_connection.execute(self.query, (tuple(ids),))
        # Si aucun résultat n'est trouvé on lève une erreur
        if not data:
            raise HTTPException(status_code=404, detail="Patient not found")
        return data

    
    @abstractmethod
    def is_valid_sequence(self):
        """
        Vérifie si une séquence est valide (au moins un élément non-None dans les sous-séquences).
        """
        pass

    @abstractmethod
    def clean_sequences(self,patients_sequences, replace=False):
        """
        Supprime les patients ayant des séquences entièrement composées de None.
        """
        pass

    @abstractmethod
    def formater(self,data):
        """Grouper les données par patient format {patient1: [[1,2,3],[1,2,3],[1,2,3]]}"""
        pass

    def get(self):
        return self.sequences
    

class SequencesMulti(Sequences):
    def __init__(self):
        # Initialiser l'attribut sequences avec une structure spécifique
        self.sequences = {}
        # Requête pour récupérer les donées (plusieurs variables) de la table examen (1836 est le dernier id patient)
        self.query =  """
            SELECT "1","61","53","54","55","56","57"
            FROM examen 
            WHERE "1" in %s
            ORDER BY "1","60";
            """
    
    def is_valid_sequence(self, sequence):
        """
        Vérifie si une séquence est valide (au moins un élément non-None dans les sous-séquences).
        """
        for sub_seq in sequence:
            # Vérifie si tous les éléments de la sous-séquence sont None
            if any(x is not None for x in sub_seq):
                return True
        return False
    
    def clean_sequences(self, replace=False):
        """
        Supprime les patients ayant des séquences entièrement composées de None.
        """
        def replace_nan(sequence):
            """
            Remplace nan et None par des 0 dans une séquence.
            """
            #return [[0 if x is None or math.isnan(x) for x in sub_seq] for sub_seq in sequence]
            return [[0 if x is None or (isinstance(x, float) and math.isnan(x)) else x for x in sub_seq] for sub_seq in sequence]

        cleaned_sequences = {}
        for patient, seq in self.sequences.items():
            if replace:
                seq = replace_nan(seq)
            # Vérifier si la séquence est valide
            if self.is_valid_sequence(seq):
                cleaned_sequences[patient] = seq
        self.sequences = cleaned_sequences

    def formater(self, data):
        """Grouper les données par patient format {patient1: [[1,2,3],[1,2,3],[1,2,3]]}"""
        self.sequences = defaultdict(list)

        for entry in data:
            patient_id = entry[0]
            if len(self.sequences[patient_id]) == 0:
                for i in range(1,len(entry)):
                    self.sequences[patient_id].append([entry[i]])
            else:
                for i in range(1,len(entry)):
                    self.sequences[patient_id][i-1].append(entry[i])


class SequencesUni(Sequences):
    def __init__(self):
        # Initialiser l'attribut sequences avec une structure spécifique
        self.sequences = {}
        # Requête pour récupérer les donées (une variable) de la table examen (1836 est le dernier id patient)
        self.query = """
            SELECT "1","61"
            FROM examen 
            WHERE "1" IN %s
            ORDER BY "1","60";
            """

    def is_valid_sequence(self,sequence):
        """
        Vérifie si une séquence est valide (au moins un élément non-None dans les sous-séquences).
        """
        # Vérifie si tous les éléments de la séquence sont None
        return any(x is not None and (not isinstance(x, float) or not math.isnan(x)) for x in sequence)
    
    def clean_sequences(self, replace=False):
        """
        Supprime les patients ayant des séquences entièrement composées de Nan.
        """
        def replace_nan(seq):
            """
            Remplace nan ans une séquence.
            """
            return [x for x in seq if not math.isnan(x)]
        
        cleaned_sequences = {}
        i = 0
        for patient, seq in self.sequences.items():
            if replace:
                # Remplacer None par 0 dans chaque séquence
                seq = replace_nan(seq)
            # Vérifier si la séquence est valide
            if self.is_valid_sequence(seq):
                cleaned_sequences[patient] = seq
        self.sequences = cleaned_sequences
    
    def formater(self,data):
        """Grouper les données par patient format {patient1: [1,2,3,4,5]}"""
        self.sequences = defaultdict(list)

        for entry in data:
            patient_id = entry[0]
            self.sequences[patient_id].append(entry[1])