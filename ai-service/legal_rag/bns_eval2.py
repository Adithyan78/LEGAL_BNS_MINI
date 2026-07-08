"""
BNS RAG Evaluation Script
==========================
Computes Hit Rate@5 and MRR for the BNS retrieval pipeline.

Metrics:
  - Hit Rate@5 (binary) : 1.0 if correct section found in top-5, else 0.0
  - MRR                  : mean of 1/rank of first correct section across all queries

Ground truth file format (bns_eval_dataset.json):
[
    {
        "query": "A man spread propaganda online encouraging armed rebellion...",
        "sections": ["152"]
    },
    ...
]

Usage:
    python bns_eval.py
    python bns_eval.py --no_reformulation
    python bns_eval.py --output my_results.csv
"""

import re
import json
import csv
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
    """
    Normalize section IDs to plain numbers for consistent comparison.
    Handles formats like:
      '_106 (2)' -> '106'
      'Section 152' -> '152'
      '_100'  -> '100'
      '106'   -> '106'
    """
    s = section_id.lower()
    s = s.replace("section", "")
    s = s.lstrip("_").strip()
    s = re.sub(r'\(.*?\)', '', s)  # remove sub-section e.g. (2)
    return s.strip()


# ══════════════════════════════════════════════════════════════════════════════
# METRIC FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def hit_rate(retrieved: list, relevant: list, k: int) -> float:
    """
    Hit Rate@K : 1.0 if correct section is anywhere in top-K, else 0.0
    """
    return 1.0 if any(s in relevant for s in retrieved[:k]) else 0.0


def reciprocal_rank(retrieved: list, relevant: list) -> float:
    """
    Reciprocal Rank = 1 / rank of the first correct section.
    Correct at rank 1 -> 1.0
    Correct at rank 2 -> 0.5
    Correct at rank 3 -> 0.33
    Not found         -> 0.0
    """
    for rank, section in enumerate(retrieved, start=1):
        if section in relevant:
            return 1.0 / rank
    return 0.0


# ══════════════════════════════════════════════════════════════════════════════
# CORE EVALUATION LOGIC
# ══════════════════════════════════════════════════════════════════════════════

def evaluate_single_query(query: str, relevant_sections: list, use_reformulation: bool = True):
    """
    Run retrieval for one query and return Hit Rate@5 + RR.
    """
    # Step 1: Query Reformulation
    if use_reformulation:
        try:
            reformulated = reformulate_query(query)
            if not reformulated or not isinstance(reformulated, str):
                print(f"  Reformulation returned invalid output, using raw query.")
                reformulated = query
            else:
                reformulated = reformulated.strip()
        except Exception as e:
            print(f"  Reformulation failed: {e}. Using raw query.")
            reformulated = query
    else:
        reformulated = query

    # Step 2: Retrieval only (no LLM analysis)
    results = search_sections(reformulated, top_k=MAX_K)

    # Normalize section IDs
    retrieved_ids       = [normalize_section_id(r["section_id"]) for r in results]
    relevant_normalized = [normalize_section_id(s) for s in relevant_sections]

    # Compute Hit Rate for each K
    hit_rates = {
        k: round(hit_rate(retrieved_ids, relevant_normalized, k), 4)
        for k in K_VALUES
    }

    # Compute Reciprocal Rank (uses full retrieved list)
    rr = round(reciprocal_rank(retrieved_ids, relevant_normalized), 4)

    return {
        "query":              query,
        "reformulated_query": reformulated,
        "relevant_sections":  relevant_normalized,
        "retrieved_sections": retrieved_ids,
        "scores":             [r["score"] for r in results],
        "hit_rates":          hit_rates,
        "reciprocal_rank":    rr,
    }


# ══════════════════════════════════════════════════════════════════════════════
# MAIN EVALUATION LOOP
# ══════════════════════════════════════════════════════════════════════════════

def run_evaluation(ground_truth_path: str, output_path: str, use_reformulation: bool = True):

    with open(ground_truth_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)

    print(f"\n{'='*70}")
    print(f"  BNS RAG EVALUATION")
    print(f"  Ground truth file : {ground_truth_path}")
    print(f"  Total queries     : {len(ground_truth)}")
    print(f"  K values          : {K_VALUES}")
    print(f"  Reformulation     : {'ON' if use_reformulation else 'OFF'}")
    print(f"  Metrics           : Hit Rate@1, Hit Rate@3, Hit Rate@5, MRR")
    print(f"{'='*70}\n")

    all_results = []

    for idx, item in enumerate(ground_truth, start=1):
        query             = item["query"]
        relevant_sections = item["sections"]

        print(f"[{idx}/{len(ground_truth)}] Evaluating: {query[:80]}...")

        start   = time.time()
        result  = evaluate_single_query(query, relevant_sections, use_reformulation)
        elapsed = round(time.time() - start, 2)

        result["elapsed_seconds"] = elapsed

        h = result["hit_rates"]
        print(f"  Reformulated : {result['reformulated_query'][:80] if use_reformulation else '(skipped)'}")
        print(f"  Retrieved    : {result['retrieved_sections']}")
        print(f"  Expected     : {result['relevant_sections']}")
        print(f"  HR@1={h[1]}  HR@3={h[3]}  HR@5={h[5]}  RR={result['reciprocal_rank']}  [{elapsed}s]\n")

        all_results.append(result)

    # ── Aggregate Metrics ─────────────────────────────────────────────────────
    n = len(all_results)
    mean_hit_rates = {
        k: round(sum(r["hit_rates"][k] for r in all_results) / n, 4)
        for k in K_VALUES
    }
    mrr = round(sum(r["reciprocal_rank"] for r in all_results) / n, 4)

    print(f"\n{'='*70}")
    print(f"  OVERALL RESULTS  (n={n})")
    print(f"{'='*70}")
    for k in K_VALUES:
        print(f"  Mean Hit Rate@{k} : {mean_hit_rates[k]}")
    print(f"  MRR              : {mrr}")
    print(f"{'='*70}\n")

    # ── Save to CSV ───────────────────────────────────────────────────────────
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        writer.writerow([
            "query_id",
            "query",
            "reformulated_query",
            "relevant_sections",
            "retrieved_sections",
            "retrieval_scores",
            "hit_rate_at_1",
            "hit_rate_at_3",
            "hit_rate_at_5",
            "reciprocal_rank",
            "elapsed_seconds"
        ])

        for i, r in enumerate(all_results, start=1):
            writer.writerow([
                i,
                r["query"],
                r["reformulated_query"],
                " | ".join(r["relevant_sections"]),
                " | ".join(r["retrieved_sections"]),
                " | ".join(str(round(s, 4)) for s in r["scores"]),
                r["hit_rates"][1],
                r["hit_rates"][3],
                r["hit_rates"][5],
                r["reciprocal_rank"],
                r["elapsed_seconds"]
            ])

        # Summary row
        writer.writerow([])
        writer.writerow(["SUMMARY", "", "", "", "", "",
                         mean_hit_rates[1], mean_hit_rates[3], mean_hit_rates[5], mrr, ""])

    print(f"  Results saved to: {output_path}")

    return {
        "mean_hit_rate": mean_hit_rate,
        "mrr":            mrr,
        "per_query":      all_results
    }


# ══════════════════════════════════════════════════════════════════════════════
# CLI ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate BNS RAG retrieval pipeline")

    parser.add_argument(
        "--ground_truth",
        type=str,
        default="bns_eval_dataset.json",
        help="Path to ground truth JSON file (default: bns_eval_dataset.json)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=f"eval_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        help="Output CSV file path"
    )
    parser.add_argument(
        "--no_reformulation",
        action="store_true",
        help="Skip query reformulation step (use raw query directly)"
    )

    args = parser.parse_args()

    run_evaluation(
        ground_truth_path=args.ground_truth,
        output_path=args.output,
        use_reformulation=not args.no_reformulation
    )