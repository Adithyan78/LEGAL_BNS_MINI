"""
bm25_retriever.py  —  BM25 keyword baseline for LexAI
──────────────────────────────────────────────────────
Provides a search_sections_bm25() function with the same
interface as the FAISS search_sections(), so it can be
swapped into evaluate_v2.py via the retriever_fn argument.

Dependencies
------------
    pip install rank-bm25

BNS sections JSON format expected (same file your FAISS index was built from):
    [
        {
            "section_id": "101",
            "title":      "Murder",
            "text":       "Whoever commits murder shall be punished..."
        },
        ...
    ]

If your BNS data file has different key names, update SECTION_ID_KEY / TEXT_KEYS below.
"""

import json
import math
import re
import string
from pathlib import Path
from typing import List, Dict

# ── Install guard ──────────────────────────────────────────────────────────────
try:
    from rank_bm25 import BM25Okapi
except ImportError:
    raise ImportError(
        "rank-bm25 is not installed.\n"
        "Run:  pip install rank-bm25"
    )

# ── Key names in your BNS JSON — adjust if needed ─────────────────────────────
SECTION_ID_KEY = "section_id"        # field that holds the section number
TEXT_KEYS = ["search_content", "text", "content", "description", "body"]
TITLE_KEY      = "title"


# ══════════════════════════════════════════════════════════════════════════════
# TEXT PREPROCESSING
# ══════════════════════════════════════════════════════════════════════════════

# Simple English stopwords — avoids needing NLTK
_STOPWORDS = {
    "a","an","the","is","are","was","were","be","been","being",
    "have","has","had","do","does","did","will","would","could",
    "should","may","might","shall","can","need","dare","ought",
    "used","to","of","in","for","on","with","at","by","from",
    "as","into","through","during","before","after","above","below",
    "between","out","off","over","under","again","further","then",
    "once","and","or","but","if","while","although","because","since",
    "so","yet","both","either","neither","nor","not","only","own","same",
    "than","too","very","s","t","just","don","who","what","which","this",
    "that","these","those","am","i","he","she","they","we","you","it","its",
    "their","our","my","your","his","her","their","them","him","me","us",
    "such","no","how","all","each","every","more","most","other","some",
    "any","any","also","now","when","where","why","there","here","about",
}

def _tokenize(text: str) -> List[str]:
    text = text.lower()
    text = re.sub(r'\d+', ' NUM ', text)          # normalize numbers
    text = text.translate(str.maketrans('', '', string.punctuation))
    tokens = text.split()
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]


def _get_text(section: dict) -> str:
    """Extract the main text from a section dict, trying multiple key names."""
    parts = []
    if TITLE_KEY in section:
        parts.append(str(section[TITLE_KEY]))
    for key in TEXT_KEYS:
        if key in section:
            parts.append(str(section[key]))
            break
    return " ".join(parts)


# ══════════════════════════════════════════════════════════════════════════════
# BM25 INDEX — built once, reused per process
# ══════════════════════════════════════════════════════════════════════════════

class BM25Index:
    """Wraps a BM25Okapi index over the BNS sections corpus."""

    def __init__(self, sections_path: str):
        self.sections_path = sections_path
        self._sections: List[dict] = []
        self._bm25: BM25Okapi = None
        self._build()

    def _build(self):
        print(f"[BM25] Loading sections from {self.sections_path} ...")
        with open(self.sections_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Unwrap if the JSON has a top-level wrapper key
        if isinstance(data, dict):
            for key in ("sections", "data", "bns", "provisions"):
                if key in data and isinstance(data[key], list):
                    data = data[key]
                    break

        self._sections = data
        corpus_tokens = [_tokenize(_get_text(sec)) for sec in self._sections]
        self._bm25 = BM25Okapi(corpus_tokens)
        print(f"[BM25] Index built — {len(self._sections)} sections indexed.")

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Returns top_k results as a list of dicts:
            [{"section_id": "101", "score": 3.42}, ...]

        The score is the raw BM25 score (not normalized to [0,1]);
        it is fine for ranking but not directly comparable to cosine similarity.
        """
        tokens = _tokenize(query)
        if not tokens:
            return []

        raw_scores = self._bm25.get_scores(tokens)

        # Pair with section IDs and sort descending
        scored = sorted(
            [(self._sections[i][SECTION_ID_KEY], float(raw_scores[i]))
             for i in range(len(self._sections))],
            key=lambda x: x[1],
            reverse=True,
        )

        return [
            {"section_id": sec_id, "score": score}
            for sec_id, score in scored[:top_k]
        ]


# ══════════════════════════════════════════════════════════════════════════════
# MODULE-LEVEL SINGLETON  (lazy-loaded)
# ══════════════════════════════════════════════════════════════════════════════

_index: BM25Index = None

def _get_index(sections_path: str = "bns_sections.json") -> BM25Index:
    global _index
    if _index is None:
        _index = BM25Index(sections_path)
    return _index


def search_sections_bm25(
    query: str,
    top_k: int = 5,
    sections_path: str = "bns_sections.json",
) -> List[Dict]:
    """
    Drop-in replacement for retriever.search_sections().
    Pass this as retriever_fn to evaluate_v2.run_evaluation().

    Example
    -------
        from bm25_retriever import search_sections_bm25
        import functools

        bm25_fn = functools.partial(search_sections_bm25, sections_path="bns_sections.json")
        run_evaluation(..., retriever_fn=bm25_fn)
    """
    idx = _get_index(sections_path)
    return idx.search(query, top_k=top_k)


# ══════════════════════════════════════════════════════════════════════════════
# QUICK SMOKE-TEST
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    path = sys.argv[1] if len(sys.argv) > 1 else "bns_sections.json"
    if not Path(path).exists():
        print(f"File not found: {path}")
        sys.exit(1)

    idx = BM25Index(path)
    test_queries = [
        "murder intentional killing with gun",
        "acid attack grievous hurt disfigurement",
        "wrongful confinement unlawful detention",
        "organised crime syndicate extortion kidnapping",
    ]
    for q in test_queries:
        results = idx.search(q, top_k=5)
        ids = [r["section_id"] for r in results]
        print(f"Q: {q}\n   → {ids}\n")