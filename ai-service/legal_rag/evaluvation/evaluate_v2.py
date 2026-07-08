"""
evaluate_v2.py  —  LexAI RAG Evaluation  (extended)
─────────────────────────────────────────────────────
Adds nDCG@K on top of the original HR@K + MRR metrics.
Drop-in replacement for the original evaluate.py.

Usage
-----
  python evaluate_v2.py --ground_truth bns_eval_dataset.json
  python evaluate_v2.py --ground_truth bns_eval_dataset.json --no_reformulation
  python evaluate_v2.py --ground_truth bns_eval_dataset.json --tag "faiss_with_reform"
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import re
import json
import csv
import math
import argparse
import time
from datetime import datetime

# ── Import your existing pipeline modules ─────────────────────────────────────
from retriever import search_sections
from llm_ollama import reformulate_query


K_VALUES = [1, 3, 5]
MAX_K    = max(K_VALUES)


# ══════════════════════════════════════════════════════════════════════════════
# NORMALIZATION
# ══════════════════════════════════════════════════════════════════════════════

def normalize_section_id(section_id: str) -> str:
    s = section_id.lower()
    s = s.replace("section", "")
    s = s.lstrip("_").strip()
    s = re.sub(r'\(.*?\)', '', s)
    return s.strip()


# ══════════════════════════════════════════════════════════════════════════════
# METRIC FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def hit_rate(retrieved: list, relevant: list, k: int) -> float:
    return 1.0 if any(s in relevant for s in retrieved[:k]) else 0.0


def reciprocal_rank(retrieved: list, relevant: list) -> float:
    for rank, section in enumerate(retrieved, start=1):
        if section in relevant:
            return 1.0 / rank
    return 0.0


def ndcg_at_k(retrieved: list, relevant: list, k: int) -> float:
    """
    nDCG@K with binary relevance.

    DCG@K  = sum_{i=1}^{K}  rel_i / log2(i + 1)
    IDCG@K = sum_{i=1}^{min(|relevant|,K)}  1 / log2(i + 1)   (ideal: all relevant first)

    Returns 0.0 when relevant is empty.
    """
    if not relevant:
        return 0.0

    dcg = sum(
        (1.0 / math.log2(rank + 1))
        for rank, sec in enumerate(retrieved[:k], start=1)
        if sec in relevant
    )

    ideal_hits = min(len(relevant), k)
    idcg = sum(1.0 / math.log2(rank + 1) for rank in range(1, ideal_hits + 1))

    return round(dcg / idcg, 4) if idcg > 0 else 0.0


# ══════════════════════════════════════════════════════════════════════════════
# CORE EVALUATION LOGIC
# ══════════════════════════════════════════════════════════════════════════════

def evaluate_single_query(
    query: str,
    relevant_sections: list,
    use_reformulation: bool = True,
    retriever_fn=None,
):
    """
    Run retrieval for one query and return all metrics.

    Parameters
    ----------
    retriever_fn : callable, optional
        Function with signature (query: str, top_k: int) -> list[dict]
        Each dict must have keys: ``section_id``, ``score``.
        Defaults to search_sections from retriever.py.
    """
    if retriever_fn is None:
        retriever_fn = search_sections

    # ── Step 1: Query Reformulation ───────────────────────────────────────────
    if use_reformulation:
        try:
            reformulated = reformulate_query(query)
            if not reformulated or not isinstance(reformulated, str):
                print("  Reformulation returned invalid output — using raw query.")
                reformulated = query
            else:
                reformulated = reformulated.strip()
        except Exception as e:
            print(f"  Reformulation failed: {e} — using raw query.")
            reformulated = query
    else:
        reformulated = query

    # ── Step 2: Retrieval ─────────────────────────────────────────────────────
    results = retriever_fn(reformulated, top_k=MAX_K)

    retrieved_ids       = [normalize_section_id(r["section_id"]) for r in results]
    relevant_normalized = [normalize_section_id(s) for s in relevant_sections]

    # ── Step 3: Metrics ───────────────────────────────────────────────────────
    hit_rates  = {k: round(hit_rate(retrieved_ids, relevant_normalized, k), 4) for k in K_VALUES}
    ndcg_scores = {k: ndcg_at_k(retrieved_ids, relevant_normalized, k)          for k in K_VALUES}
    rr         = round(reciprocal_rank(retrieved_ids, relevant_normalized), 4)

    return {
        "query":              query,
        "reformulated_query": reformulated,
        "relevant_sections":  relevant_normalized,
        "retrieved_sections": retrieved_ids,
        "scores":             [r["score"] for r in results],
        "hit_rates":          hit_rates,
        "ndcg_scores":        ndcg_scores,
        "reciprocal_rank":    rr,
    }


# ══════════════════════════════════════════════════════════════════════════════
# MAIN EVALUATION LOOP
# ══════════════════════════════════════════════════════════════════════════════

def run_evaluation(
    ground_truth_path: str,
    output_path: str,
    use_reformulation: bool = True,
    retriever_fn=None,
    tag: str = "",
):
    """
    Returns a summary dict so run_ablation_study.py can collect results
    from multiple configurations in one process.
    """
    with open(ground_truth_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)

    label = tag if tag else ("faiss_reform" if use_reformulation else "faiss_noref")

    print(f"\n{'='*70}")
    print(f"  BNS RAG EVALUATION  [{label}]")
    print(f"  Ground truth : {ground_truth_path}  ({len(ground_truth)} queries)")
    print(f"  Reformulation: {'ON' if use_reformulation else 'OFF'}")
    print(f"  Metrics      : HR@1/3/5 · nDCG@1/3/5 · MRR")
    print(f"{'='*70}\n")

    all_results = []

    for idx, item in enumerate(ground_truth, start=1):
        query             = item["query"]
        relevant_sections = item["sections"]

        print(f"[{idx}/{len(ground_truth)}] {query[:80]}...")

        start   = time.time()
        result  = evaluate_single_query(
            query, relevant_sections, use_reformulation, retriever_fn
        )
        elapsed = round(time.time() - start, 2)
        result["elapsed_seconds"] = elapsed

        h = result["hit_rates"]
        d = result["ndcg_scores"]
        print(
            f"  Retrieved : {result['retrieved_sections']}\n"
            f"  Expected  : {result['relevant_sections']}\n"
            f"  HR@1={h[1]}  HR@3={h[3]}  HR@5={h[5]}"
            f"  | nDCG@5={d[5]}  RR={result['reciprocal_rank']}  [{elapsed}s]\n"
        )
        all_results.append(result)

    # ── Aggregate ─────────────────────────────────────────────────────────────
    n = len(all_results)

    mean_hit_rates  = {k: round(sum(r["hit_rates"][k]   for r in all_results) / n, 4) for k in K_VALUES}
    mean_ndcg       = {k: round(sum(r["ndcg_scores"][k]  for r in all_results) / n, 4) for k in K_VALUES}
    mrr             = round(sum(r["reciprocal_rank"]      for r in all_results) / n, 4)
    avg_elapsed     = round(sum(r["elapsed_seconds"]      for r in all_results) / n, 2)

    print(f"\n{'='*70}")
    print(f"  OVERALL RESULTS  [{label}]  (n={n})")
    print(f"{'='*70}")
    for k in K_VALUES:
        print(f"  HR@{k}    : {mean_hit_rates[k]}")
    print()
    for k in K_VALUES:
        print(f"  nDCG@{k}  : {mean_ndcg[k]}")
    print(f"\n  MRR      : {mrr}")
    print(f"  Avg time : {avg_elapsed}s / query")
    print(f"{'='*70}\n")

    # ── Save CSV ──────────────────────────────────────────────────────────────
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "query_id", "query", "reformulated_query",
            "relevant_sections", "retrieved_sections", "retrieval_scores",
            "hit_rate_at_1", "hit_rate_at_3", "hit_rate_at_5",
            "ndcg_at_1",     "ndcg_at_3",     "ndcg_at_5",
            "reciprocal_rank", "elapsed_seconds",
        ])
        for i, r in enumerate(all_results, start=1):
            writer.writerow([
                i,
                r["query"],
                r["reformulated_query"],
                " | ".join(r["relevant_sections"]),
                " | ".join(r["retrieved_sections"]),
                " | ".join(str(round(s, 4)) for s in r["scores"]),
                r["hit_rates"][1],  r["hit_rates"][3],  r["hit_rates"][5],
                r["ndcg_scores"][1], r["ndcg_scores"][3], r["ndcg_scores"][5],
                r["reciprocal_rank"],
                r["elapsed_seconds"],
            ])

        writer.writerow([])
        writer.writerow([
            "SUMMARY", "", "", "", "", "",
            mean_hit_rates[1], mean_hit_rates[3], mean_hit_rates[5],
            mean_ndcg[1],      mean_ndcg[3],      mean_ndcg[5],
            mrr, avg_elapsed,
        ])

    print(f"  Results saved → {output_path}")

    return {
        "tag":             label,
        "n":               n,
        "mean_hit_rates":  mean_hit_rates,
        "mean_ndcg":       mean_ndcg,
        "mrr":             mrr,
        "avg_elapsed":     avg_elapsed,
        "per_query":       all_results,
    }


# ══════════════════════════════════════════════════════════════════════════════
# CLI
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate LexAI BNS retrieval (v2 — with nDCG)")
    parser.add_argument("--ground_truth",    default="bns_eval_dataset.json")
    parser.add_argument(
        "--output",
        default=f"eval_results_v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
    )
    parser.add_argument("--no_reformulation", action="store_true")
    parser.add_argument("--tag", default="", help="Label for this run (used in ablation tables)")
    args = parser.parse_args()

    run_evaluation(
        ground_truth_path=args.ground_truth,
        output_path=args.output,
        use_reformulation=not args.no_reformulation,
        tag=args.tag,
    )