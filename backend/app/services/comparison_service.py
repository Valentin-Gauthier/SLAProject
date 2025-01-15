#fichier de définition des fonctions liées aux comparaisons et utilisés dans routers

import matplotlib.pyplot as plt
from app.models.Sequences import *
from app.models.Comparison import *
from app.models.DatabaseConnection import DatabaseConnection


# Instance Singleton de la connexion à la base
db_connection = DatabaseConnection.get_instance()

def comparaison(ids, methode, multi=False):
    """methode compare n sequences entre elles a partir d'une liste d'id de patients"""
    strategy = None
    if(multi):
        strategy = CompDTW(multi=True)
    else:
        if (methode=="tsl_dtw"):
            strategy = Comp_TSLDTW()
        elif (methode=="lcss"):
            strategy = CompLCSS()
        elif (methode=="soft_dtw"):
            strategy = CompSoftDTW()
        elif (methode=="dtw"):
            strategy = CompDTW(multi=False)
    matrice = strategy.compare(ids,db_connection)
    strategy.illustrate()
    return matrice