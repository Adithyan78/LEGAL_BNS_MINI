import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-large-en-v1.5"
INSTRUCTION = "Represent this legal query for retrieving relevant law sections: "

print("Loading embedding model...")
model = SentenceTransformer(MODEL_NAME, device="cpu")

print("Loading FAISS index...")
index = faiss.read_index("faiss_max.bin")

print("Loading dataset...")
with open("bns_max.json", "r", encoding="utf-8") as f:
    sections = json.load(f)

sections = sections[59:]

# Extract parallel lists — same index as FAISS
section_ids   = [s["section_id"] for s in sections]
ipc_equivs    = [s["metadata"].get("ipc_equivalent", "") for s in sections]
key_diffs     = [s["metadata"].get("key_differences", "") for s in sections]

print(f"✅ Loaded {index.ntotal} sections")


def search_sections(query, top_k=15, threshold=0.30):

    query_text = INSTRUCTION + query

    query_embedding = model.encode(
        [query_text],
        normalize_embeddings=True,
        convert_to_numpy=True
    )

    similarities, indices = index.search(query_embedding, top_k)

    results = []

    for idx, similarity in zip(indices[0], similarities[0]):

        if similarity < threshold:
            continue

        results.append({
            "section_id":    section_ids[idx],
            "content":       sections[idx].get("search_content", ""),
            "score":         float(similarity),
            "ipc_equivalent": ipc_equivs[idx],
            "key_differences": key_diffs[idx]
        })

    return results