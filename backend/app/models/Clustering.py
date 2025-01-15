from app.models.ClusteringStrategy import ClusteringStrategy
from app.models.KMean import KMean
from app.models.KMedoids import KMedoids
from app.models.WardHierarchicalClustering import WardHierarchicalClustering

class Clustering:

    # Attributs d'instance
    _strategy = None
    _nb_cluster_instance = 0
    
    # Attribut de classe
    _db_connection = None
    _nb_cluster_classe = 0

    def __init__(self, strategy, nb_cluster):
        if strategy == "kmean":
            self._strategy = KMean()
        elif strategy == "kmedoids":
            self._strategy = KMedoids()
        elif strategy == "wardHierarchical":
            self._strategy = WardHierarchicalClustering()
        else:
            raise ValueError("Stratégie inconnue pour le clustering.")
        self._nb_cluster = nb_cluster

    def cluster(self, listeIdPatients: list[int], comparisonStrategy: str):
        # STRATEGY PATTERN
        print("Strategy de Clustering: ", self._strategy)
        return self._strategy.do_clustering(listeIdPatients, self._nb_cluster, Clustering._db_connection, comparisonStrategy)


    # Méthodes statiques

    @staticmethod
    def get_all_clusters():
        # Cluster fait automatiquement quand on entre les données

        cluster_and_patients = {}
        sql = 'SELECT COUNT(DISTINCT "185") FROM patient'
        nbCluster = Clustering._db_connection.execute(sql)[0][0]

        for cluster_id in range(nbCluster):
            patients = Clustering.get_patients_by_cluster(cluster_id)
            cluster_and_patients[cluster_id] = patients

        return cluster_and_patients

    @staticmethod
    def get_patients_by_cluster(idCluster: int):
        # Cluster fait automatiquement quand on entre les données
        
        sql = 'SELECT "1" FROM patient WHERE "185" = %s ORDER BY "1"'
        patients = Clustering._db_connection.execute(sql, (idCluster,))
        return patients

    @staticmethod
    def get_cluster_and_patients_by_patient(idPatient: int):
        # Cluster fait automatiquement quand on entre les données
        
        sql = 'SELECT "185" FROM patient WHERE "1" = %s'
        cluster_id = Clustering._db_connection.execute(sql, (idPatient,))
        cluster_id = cluster_id[0][0]
        patients = Clustering.get_patients_by_cluster(cluster_id)
        return {cluster_id: patients}
    
    # APPELER QUAND ?
    @staticmethod
    def add_patient(patient: tuple):
        # Ajoute le patient dans la base de données
        # Refait le clustering en incluant le nouveau patient
        sql = "INSERT INTO patients VALUES (%s)"
        Clustering._db_connection.execute(sql, (patient,)) # A RE FAIRE CAR PATIENT != LISTE DE SES ATTRIBUTS
        kmean = kmean()
        kmean.do_init_clustering(Clustering._nb_cluster_classe, Clustering._db_connection)
    
    @staticmethod
    def do_init_clustering(nb_cluster, db_connection):
        kmean = KMean()
        Clustering._nb_cluster_classe = nb_cluster
        Clustering._db_connection = db_connection
        return kmean.do_init_clustering(nb_cluster, db_connection)