Installation du projet: une fois le projet cloné de puis github voici les étapes à faire
installer python 3.12   (entre 3.9 et 3.12 pour pouvoir utiliser tslearn)
installer node.js       (Latest Stable Version) (v22.13.0 est sure de marcher)
Installer Microsoft Visual C++ Build Tools      (installer Desktop development with C++ et bien sélectionner MSVC v142 et windows 10 SDK)

DANS LE DOSSIER PRINCIPAL (au meme niveau que front end et back end)
python3.12 -m venv env
#Pour windows:
env\Scripts\activate
Pour MacOS:
source env/bin/activate
pip install -r requirements.txt
cd frontend
npm install
(si la commande ne marche pas essayer de l'executer dans un CMD)

Pour faire fonctionner le site:

DANS LE DOSSIER BACKEND:
#Pour windows:
env\Scripts\activate
Pour MacOS:
source env/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000

DANS LE DOSSIER FRONTEND: (utilisez un autre terminale pour ne pas avoir a éteindre le serveur backend)
npm run dev
(si la commande ne marche pas essayer de l'executer dans un CMD)


////////
pip uninstall numpy
pip install numpy==1.26.4

# Configuration de la Base de Données pour le Projet

Vous trouverez ci-dessous les étapes pour configurer la base de données PostgreSQL avec l'extension TimescaleDB. Les fichiers nécessaires, y compris le dump de la base, sont disponibles sur le drive que je vous ai partagé.

---

### Installation des outils

#### PostgreSQL

- **Windows** : https://www.postgresql.org/download/windows/
- **Mac** :
    - Via Homebrew :
        brew install postgresql@17
    - Ou avec l'installeur officiel : https://www.postgresql.org/download/macosx/

#### TimescaleDB

- **Windows** : https://docs.timescale.com/self-hosted/latest/install/installation-windows/
- **Mac** : https://docs.timescale.com/self-hosted/latest/install/installation-macos/

---

### Configuration des Variables d'Environnement

Dans un terminal, configurez les variables d'environnement pour simplifier les commandes ultérieures :

#### Sur macOS

export SOURCE=postgres://postgres:password@localhost:5432/projet_technique
export TARGET=postgres://postgres:password@localhost:5432

#### Sur Windows

set SOURCE=postgres://postgres:password@localhost:5432/projet_technique
set TARGET=postgres://postgres:password@localhost:5432

---

### Configuration de PostgreSQL

1. Ajouter le chemin du dossier `bin` de PostgreSQL au PATH :
    - **Windows** : Ajoutez le chemin vers le dossier `bin` (par exemple, `C:\Program Files\PostgreSQL\17\bin`) dans les variables d'environnement.
    
2. Modifier le fichier `postgresql.conf` :
    - Localisez le fichier `postgresql.conf` (généralement dans le dossier de configuration de votre installation PostgreSQL).
    - Ajoutez ou modifiez la ligne suivante :
        shared_preload_libraries = 'timescaledb'
    - Redémarrez le service PostgreSQL pour appliquer les modifications.

---

### Création de la Base de Données

1. Se connecter à PostgreSQL :
    - **Sur macOS** :
        psql -U postgres -d "$TARGET"
    - **Sur Windows** :
        psql -U postgres -d "%TARGET%"

2. Créer une base et un rôle utilisateur :

    CREATE DATABASE projet_technique;
    CREATE ROLE raphaelmalidin WITH LOGIN;

3. Se connecter à la base et activer TimescaleDB :

    \c projet_technique
    CREATE EXTENSION IF NOT EXISTS timescaledb;

---

### Restauration de la Base de Données

1. Préparer la base pour la restauration :

    SELECT timescaledb_pre_restore();

2. Restaurer la base depuis un autre terminal :

    pg_restore -Fc -d projet_technique -h localhost -U postgres chemin/vers/projet_technique.bak

3. Finaliser la restauration des hypertables :

    SELECT timescaledb_post_restore();

---

### Remarques

- Remplacez `password` dans les variables d'environnement par votre mot de passe PostgreSQL.
