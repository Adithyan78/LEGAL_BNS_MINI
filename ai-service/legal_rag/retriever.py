# import sys, os
# import json
# import numpy as np
# import faiss
# from sentence_transformers import SentenceTransformer

# MODEL_NAME = "BAAI/bge-large-en-v1.5"
# INSTRUCTION = "Represent this legal query for retrieving relevant law sections: "

# print("Loading embedding model...")
# model = SentenceTransformer(MODEL_NAME, device="cpu")

# print("Loading FAISS index...")
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# index = faiss.read_index(os.path.join(BASE_DIR, "faiss_max.bin"))

# print("Loading dataset...")
# with open(os.path.join(BASE_DIR, "bns_max.json"), "r", encoding="utf-8") as f:
#     sections = json.load(f)

# sections = sections[59:]

# # Extract parallel lists — same index as FAISS
# section_ids   = [s["section_id"] for s in sections]
# ipc_equivs    = [s["metadata"].get("ipc_equivalent", "") for s in sections]
# key_diffs     = [s["metadata"].get("key_differences", "") for s in sections]

# print(f"✅ Loaded {index.ntotal} sections")


# def search_sections(query, top_k=15, threshold=0.30):

#     query_text = INSTRUCTION + query

#     query_embedding = model.encode(
#         [query_text],
#         normalize_embeddings=True,
#         convert_to_numpy=True
#     )

#     similarities, indices = index.search(query_embedding, top_k)

#     results = []

#     for idx, similarity in zip(indices[0], similarities[0]):

#         if similarity < threshold:
#             continue

#         results.append({
#             "section_id":    section_ids[idx],
#             "content":       sections[idx].get("search_content", ""),
#             "score":         float(similarity),
#             "ipc_equivalent": ipc_equivs[idx],
#             "key_differences": key_diffs[idx]
#         })

#     return results

import sys, os
import json
import requests
import numpy as np
import faiss
from dotenv import load_dotenv
load_dotenv()

CLOUDFLARE_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
CLOUDFLARE_API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN")

if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_API_TOKEN:
    raise RuntimeError(
        "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your .env file. "
        "Get these from https://dash.cloudflare.com -> Workers AI."
    )

CF_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-large-en-v1.5"
INSTRUCTION = "Represent this legal query for retrieving relevant law sections: "

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading FAISS index...")
index = faiss.read_index(os.path.join(BASE_DIR, "faiss_all.bin"))

print("Loading dataset...")
with open(os.path.join(BASE_DIR, "bns_max.json"), "r", encoding="utf-8") as f:
    sections = json.load(f)
sections = sections[59:]

section_ids = [s["section_id"] for s in sections]
ipc_equivs = [s["metadata"].get("ipc_equivalent", "") for s in sections]
key_diffs = [s["metadata"].get("key_differences", "") for s in sections]
print(f"✅ Loaded {index.ntotal} sections")


def _embed_query(query_text):
    """Call Cloudflare Workers AI's free-hosted bge-large-en-v1.5 to embed a query."""
    resp = requests.post(
        CF_URL,
        headers={
            "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
            "Content-Type": "application/json",
        },
        json={"text": [query_text]},
        timeout=30,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Cloudflare Workers AI error {resp.status_code}: {resp.text[:300]}")

    payload = resp.json()
    if not payload.get("success", False):
        raise RuntimeError(f"Cloudflare Workers AI returned an error: {payload.get('errors')}")

    embedding = np.array(payload["result"]["data"][0], dtype="float32")

    # Cloudflare's raw output isn't guaranteed pre-normalized — L2-normalize to
    # match how faiss_max.bin was originally built (normalize_embeddings=True).
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding.reshape(1, -1)


def search_sections(query, top_k=15, threshold=0.30):
    query_text = INSTRUCTION + query
    query_embedding = _embed_query(query_text)

    similarities, indices = index.search(query_embedding, top_k)

    results = []
    for idx, similarity in zip(indices[0], similarities[0]):
        if similarity < threshold:
            continue
        results.append({
            "section_id": section_ids[idx],
            "content": sections[idx].get("search_content", ""),
            "score": float(similarity),
            "ipc_equivalent": ipc_equivs[idx],
            "key_differences": key_diffs[idx],
        })
    return results