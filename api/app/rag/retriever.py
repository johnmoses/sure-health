# def fetch_context(query: str, patient_id: int = None, top_k: int = 3) -> str:
    #     """
#     Retrieve relevant EHR documents or notes for use as LLM context.
#     This stub uses SQL filtering but you could use Milvus/FAISS/Haystack as needed.
#     """
#     from app.ehr.models import MedicalRecord
#     records = MedicalRecord.query.filter_by(patient_id=patient_id).order_by(
#         MedicalRecord.record_date.desc()
#     ).limit(top_k).all()
#     if not records:
#         return ""
#     return "\n---\n".join([r.description or "" for r in records])

from app.extensions import init_embed_model, search_vectors  # Your embedding model init
from typing import Optional

def fetch_context(query: str, patient_id: Optional[int] = None, top_k: int = 3) -> str:
    """
    Retrieve relevant EHR documents as LLM context using vector-based similarity search.
    If patient_id is provided, restrict search to that patient's docs.
    """
    embed_model = init_embed_model()
    embedding = embed_model.encode(query).tolist()

    # Vector search returns list of documents or textual chunks
    results = search_vectors(embedding, top_k=top_k, patient_id=patient_id)  # Implement patient filtering in your search_vectors

    if not results or not results[0]:
        return ""

    # Concatenate textual content from results into single context string
    context = "\n---\n".join(doc['text'] for doc in results[0])
    return context

