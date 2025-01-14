from fastapi import APIRouter

#fichier de définition des routes demandées par l'utilisateur

router = APIRouter()

@router.get("/sequences")
def get_users():
    # return [{"id": 1, "name": "seq1"}, {"id": 2, "name": "seq2"}]
    return [{"id": 1}, {"id": 2},{"id":3},{"id":4}, {"id":5}, {"id": 6}, {"id":7},{"id":8},{"id":9},{"id":10},{"id":11}]

@router.post("/sequences")
def create_user(seq: dict):
    return {"message": "sequence created", "seq": seq}