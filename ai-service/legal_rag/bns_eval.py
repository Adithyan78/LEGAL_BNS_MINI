"""
BNS RAG Evaluation Script
==========================
Computes Precision@K, Recall@K, and MRR for the BNS retrieval pipeline.

Ground truth file format (ground_truth.json):
[
    {
        "query": "A person intentionally causes the death of another...",
        "sections": ["101", "103"]
    },
    ...
]

Usage:
    python bns_eval.py --ground_truth ground_truth.json --top_k 5 --output results.csv
"""

import json
import csv
import argparse
import time
from datetime import datetime

# ── Import your existing pipeline modules ──────────────────────────────────────
from retriever import search_sections
from llm_ollama import reformulate_query


# ══════════════════════════════════════════════════════════════════════════════
# METRIC FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def normalize_section_id(section_id: str) -> str:
    """
    Normalize section IDs to plain numbers for consistent comparison.
    Handles formats like:
      '_106 (2)' → '106'
      'Section 152' → '152'
      '_100'  → '100'
      '106'   → '106'
    """
    import re
    # Remove leading underscores, strip 'section' word, remove sub-section like (2)
    s = section_id.lower()
    s = s.replace("section", "")
    s = s.lstrip("_").strip()
    s = re.sub(r'\(.*?\)', '', s)   # remove anything in parentheses e.g. (2)
    s = s.strip()
    return s


def precision_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    """1.0 if at least one relevant section appears in top-K retrieved, else 0.0"""
    retrieved_k = retrieved[:k]
    if not retrieved_k:
        return 0.0
    return 1.0 if any(s in relevant for s in retrieved_k) else 0.0


def recall_at_k(retrieved: list[str], relevant: list[str], k: int) -> float:
    """1.0 if at least one relevant section appears in top-K retrieved, else 0.0"""
    retrieved_k = retrieved[:k]
    if not relevant:
        return 0.0
    return 1.0 if any(s in retrieved_k for s in relevant) else 0.0


def reciprocal_rank(retrieved: list[str], relevant: list[str]) -> float:
    """1 / rank of the first relevant section in the retrieved list."""
    for rank, section in enumerate(retrieved, start=1):
        if section in relevant:
            return 1.0 / rank
    return 0.0  # No relevant section found


def f1_score(precision: float, recall: float) -> float:
    if precision + recall == 0:
        return 0.0
    return 2 * (precision * recall) / (precision + recall)


# ══════════════════════════════════════════════════════════════════════════════
# CORE EVALUATION LOGIC
# ══════════════════════════════════════════════════════════════════════════════

def evaluate_single_query(query: str, relevant_sections: list[str], top_k: int, use_reformulation: bool = True):
    """
    Run retrieval for one query and return metrics + raw results.
    """
    # Step 1: Query Reformulation (same as your pipeline)
    if use_reformulation:
        try:
            reformulated = reformulate_query(query)
            if not reformulated or not isinstance(reformulated, str):
                print(f"  ⚠️  Reformulation returned invalid output, using raw query.")
                reformulated = query
            else:
                reformulated = reformulated.strip()
        except Exception as e:
            print(f"  ⚠️  Reformulation failed: {e}. Using raw query.")
            reformulated = query
    else:
        reformulated = query

    # Step 2: Retrieval only (no LLM analysis)
    results = search_sections(reformulated, top_k=top_k)

    # Extract and normalize retrieved section IDs
    retrieved_ids = [normalize_section_id(r["section_id"]) for r in results]

    # Normalize ground truth too (in case of any inconsistency)
    relevant_normalized = [normalize_section_id(s) for s in relevant_sections]

    # Compute metrics
    p_at_k  = precision_at_k(retrieved_ids, relevant_normalized, k=top_k)
    r_at_k  = recall_at_k(retrieved_ids, relevant_normalized, k=top_k)
    rr      = reciprocal_rank(retrieved_ids, relevant_normalized)
    f1      = f1_score(p_at_k, r_at_k)

    return {
        "query":               query,
        "reformulated_query":  reformulated,
        "relevant_sections":   relevant_normalized,
        "retrieved_sections":  retrieved_ids,
        "scores":              [r["score"] for r in results],
        "precision_at_k":      round(p_at_k, 4),
        "recall_at_k":         round(r_at_k, 4),
        "reciprocal_rank":     round(rr, 4),
        "f1_at_k":             round(f1, 4),
    }


def run_evaluation(ground_truth_path: str, top_k: int, output_path: str, use_reformulation: bool = True):
    """
    Main evaluation loop over all queries.
    """
    # Load ground truth
    with open(ground_truth_path, "r", encoding="utf-8") as f:
        ground_truth = json.load(f)

    print(f"\n{'='*70}")
    print(f"  BNS RAG EVALUATION")
    print(f"  Ground truth file : {ground_truth_path}")
    print(f"  Total queries     : {len(ground_truth)}")
    print(f"  Top-K             : {top_k}")
    print(f"  Reformulation     : {'ON' if use_reformulation else 'OFF'}")
    print(f"{'='*70}\n")

    all_results = []

    for idx, item in enumerate(ground_truth, start=1):
        query             = item["query"]
        relevant_sections = item["sections"]  # e.g. ["152", "153"]

        print(f"[{idx}/{len(ground_truth)}] Evaluating: {query[:80]}...")

        start = time.time()
        result = evaluate_single_query(query, relevant_sections, top_k, use_reformulation)
        elapsed = round(time.time() - start, 2)

        result["elapsed_seconds"] = elapsed

        print(f"  Reformulated : {result['reformulated_query'][:80] if use_reformulation else '(skipped)'}")

        print(f"  Retrieved : {result['retrieved_sections']}")
        print(f"  Expected  : {relevant_sections}")
        print(f"  P@{top_k}={result['precision_at_k']}  R@{top_k}={result['recall_at_k']}  RR={result['reciprocal_rank']}  F1={result['f1_at_k']}  [{elapsed}s]\n")

        all_results.append(result)

    # ── Aggregate Metrics ─────────────────────────────────────────────────────
    n = len(all_results)
    mean_precision = round(sum(r["precision_at_k"]  for r in all_results) / n, 4)
    mean_recall    = round(sum(r["recall_at_k"]     for r in all_results) / n, 4)
    mrr            = round(sum(r["reciprocal_rank"] for r in all_results) / n, 4)
    mean_f1        = round(sum(r["f1_at_k"]         for r in all_results) / n, 4)

    print(f"\n{'='*70}")
    print(f"  OVERALL RESULTS  (n={n}, K={top_k})")
    print(f"{'='*70}")
    print(f"  Mean Precision@{top_k} : {mean_precision}")
    print(f"  Mean Recall@{top_k}    : {mean_recall}")
    print(f"  Mean F1@{top_k}        : {mean_f1}")
    print(f"  MRR               : {mrr}")
    print(f"{'='*70}\n")

    # ── Save to CSV ───────────────────────────────────────────────────────────
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        # Header
        writer.writerow([
            "query_id",
            "query",
            "reformulated_query",
            "relevant_sections",
            "retrieved_sections",
            "retrieval_scores",
            f"precision_at_{top_k}",
            f"recall_at_{top_k}",
            f"f1_at_{top_k}",
            "reciprocal_rank",
            "elapsed_seconds"
        ])

        # Per-query rows
        for i, r in enumerate(all_results, start=1):
            writer.writerow([
                i,
                r["query"],
                r["reformulated_query"],
                " | ".join(r["relevant_sections"]),
                " | ".join(r["retrieved_sections"]),
                " | ".join(str(round(s, 4)) for s in r["scores"]),
                r["precision_at_k"],
                r["recall_at_k"],
                r["f1_at_k"],
                r["reciprocal_rank"],
                r["elapsed_seconds"]
            ])

        # Summary row
        writer.writerow([])
        writer.writerow(["SUMMARY", "", "", "", "", "",
                         mean_precision, mean_recall, mean_f1, mrr, ""])

    print(f"  Results saved to: {output_path}")

    return {
        "mean_precision": mean_precision,
        "mean_recall":    mean_recall,
        "mean_f1":        mean_f1,
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
        help="Path to ground truth JSON file"
    )
    parser.add_argument(
        "--top_k",
        type=int,
        default=5,
        help="Number of sections to retrieve per query (default: 5)"
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
        top_k=args.top_k,
        output_path=args.output,
        use_reformulation=not args.no_reformulation
    )