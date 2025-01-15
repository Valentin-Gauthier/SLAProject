from abc import ABC, abstractmethod

# Définition de l'interface
class ClusteringStrategy(ABC):

    @abstractmethod
    def do_clustering(self, listeIdPatients: list, nbCluster: int, db_connection, comparisonStrategy: str):
        """Une méthode abstraite à implémenter"""
        pass