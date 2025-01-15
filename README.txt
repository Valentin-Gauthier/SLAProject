Installation du projet: une fois le projet cloné de puis github voici les étapes à faire
installer python 3.12   (entre 3.9 et 3.12 pour pouvoir utiliser tslearn)
installer node.js       (Latest Stable Version) (v22.13.0 est sure de marcher)

DANS LE DOSSIER PRINCIPALE (au meme niveau que front end et back end)
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