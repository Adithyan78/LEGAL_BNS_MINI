import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-large-en-v1.5"   # stronger than bge-m3
INSTRUCTION = "Represent this legal query for retrieving relevant law sections: "

print("Loading embedding model...")
model = SentenceTransformer(MODEL_NAME, device="cpu")

print("Loading FAISS index...")
index = faiss.read_index("faiss_max.bin")

print("Loading dataset...")
with open("bns_max.json", "r", encoding="utf-8") as f:
    sections = json.load(f)

# Skip first 59 to match embedding preprocessing
sections = sections[59:]

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

        current_section = sections[idx]
        content = current_section.get("search_content", "")

        results.append({
    "section_id": current_section["section_id"],
    "content": content,
    "score": float(similarity)   # 👈 use 'score' to match your print line
})


    return results

