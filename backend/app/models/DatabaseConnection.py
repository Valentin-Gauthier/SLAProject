
import psycopg2


class DatabaseConnection:
    """
    Classe Singleton pour gérer les connexions à la base de données.
    """

    _instance = None  # Instance unique de la classe
    _connection = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls, *args, **kwargs)
        return cls._instance

    @classmethod
    def get_instance(cls):
        """
        Retourne l'instance unique de DatabaseConnection.
        """
        if cls._instance is None:
            cls._instance = DatabaseConnection()
        return cls._instance

    def connect(self, connection):
        """
        Se connecter à la base de données.
        """
        if self._connection is None:
            try:
                self._connection = psycopg2.connect(connection)
                print("Connexion à la base de données établie.")
            except Exception as e:
                print(f"Échec de la connexion à la base de données : {e}")
        else:
            print("La connexion à la base de données est déjà établie.")

    def execute(self, query, params=None):
        """
        Exécuter une requête SQL sur la base de données.
        """
        if self._connection is None:
            print("Erreur : connexion à la base de données non établie hello")
            return None
        try:
            with self._connection.cursor() as cursor:
                cursor.execute(query, params)
                print("Requête exécutée avec succès.")
                if cursor.description:
                    results = cursor.fetchall()
                    return results
                self._connection.commit()
        except Exception as e:
            print(f"Erreur lors de l'exécution de la requête : {e}")
            self._connection.rollback()
            return None

    def disconnect(self):
        """
        Fermer la connexion à la base de données.
        """
        if self._connection is not None:
            self._connection.close()
            self._connection = None
            print("Connexion à la base de données fermée.")
