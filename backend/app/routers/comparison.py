from fastapi import APIRouter, Query
from app.services.comparison_service import comparaison

router = APIRouter()

# compare les séquences de n patients selectionnés
@router.get("/comparison")
def compare(values: list[int] = Query(...), metric: str = "soft_dtw", multi: bool = False):
    print(metric)
    return {"result": comparaison(values, metric, multi=multi)}