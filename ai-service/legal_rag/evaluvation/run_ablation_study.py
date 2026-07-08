"""
run_ablation_study.py  —  LexAI full ablation
──────────────────────────────────────────────
Runs three retrieval configurations back-to-back:

  1. BM25 keyword baseline         (no reformulation)
  2. FAISS semantic — raw query    (no reformulation)
  3. FAISS semantic + LLM reform   (full pipeline)

Outputs
  • Individual CSV per configuration (detailed per-query rows)
  • ablation_summary.csv            (one row per configuration)
  • ablation_summary.txt            (pretty-printed comparison table)

Usage
-----
  python run_ablation_study.py
  python run_ablation_study.py --ground_truth bns_eval_dataset.json
  python run_ablation_study.py --skip_bm25         # if BNS JSON not ready yet
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import argparse
import csv
import functools
from datetime import datetime
from pathlib import Path

# ── Your existing modules ──────────────────────────────────────────────────────
from retriever import search_sections          # FAISS retriever
from evaluate_v2 import run_evaluation         # updated evaluator with nDCG
from bm25_retriever import search_sections_bm25



K_VALUES = [1, 3, 5]
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")


# ══════════════════════════════════════════════════════════════════════════════
# PRETTY TABLE PRINTER
# ══════════════════════════════════════════════════════════════════════════════

def _fmt(val, pct=True):
    if pct:
        return f"{val * 100:.1f}%"
    return f"{val:.4f}"


def print_comparison_table(summaries: list, out_path: str):
    """
    summaries: list of dicts returned by run_evaluation()
    """
    header = (
        f"{'System':<35}"
        f"{'HR@1':>7}{'HR@3':>7}{'HR@5':>7}"
        f"{'nDCG@1':>8}{'nDCG@3':>8}{'nDCG@5':>8}"
        f"{'MRR':>7}"
        f"{'t/q':>7}"
    )
    sep = "─" * len(header)

    lines = [
        "",
        "=" * len(header),
        "  LexAI Ablation Study — Retrieval Performance Comparison",
        f"  Ground truth: {summaries[0]['n']} queries",
        "=" * len(header),
        header,
        sep,
    ]

    for s in summaries:
        h = s["mean_hit_rates"]
        d = s["mean_ndcg"]
        row = (
            f"{s['tag']:<35}"
            f"{_fmt(h[1]):>7}{_fmt(h[3]):>7}{_fmt(h[5]):>7}"
            f"{_fmt(d[1]):>8}{_fmt(d[3]):>8}{_fmt(d[5]):>8}"
            f"{_fmt(s['mrr'], pct=False):>7}"
            f"{s['avg_elapsed']:>6.1f}s"
        )
        lines.append(row)

    lines += [sep, ""]

    # ── Delta rows ─────────────────────────────────────────────────────────────
    if len(summaries) >= 2:
        lines.append("  Δ  (FAISS no reform vs BM25):")
        b = summaries[0]["mean_hit_rates"]
        f = summaries[1]["mean_hit_rates"]
        db = summaries[0]["mean_ndcg"]
        df = summaries[1]["mean_ndcg"]
        lines.append(
            f"     HR@5  {(f[5]-b[5])*100:+.1f}pp"
            f"   nDCG@5 {(df[5]-db[5])*100:+.1f}pp"
            f"   MRR {summaries[1]['mrr']-summaries[0]['mrr']:+.4f}"
        )

    if len(summaries) >= 3:
        lines.append("  Δ  (FAISS with reform vs FAISS no reform):")
        f0 = summaries[1]["mean_hit_rates"]
        f1 = summaries[2]["mean_hit_rates"]
        d0 = summaries[1]["mean_ndcg"]
        d1 = summaries[2]["mean_ndcg"]
        lines.append(
            f"     HR@5  {(f1[5]-f0[5])*100:+.1f}pp"
            f"   nDCG@5 {(d1[5]-d0[5])*100:+.1f}pp"
            f"   MRR {summaries[2]['mrr']-summaries[1]['mrr']:+.4f}"
        )

    lines.append("")
    table_str = "\n".join(lines)
    print(table_str)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(table_str)
    print(f"  Summary table → {out_path}")


def save_summary_csv(summaries: list, out_path: str):
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "system",
            "n_queries",
            "hr_at_1", "hr_at_3", "hr_at_5",
            "ndcg_at_1", "ndcg_at_3", "ndcg_at_5",
            "mrr",
            "avg_elapsed_s",
        ])
        for s in summaries:
            h = s["mean_hit_rates"]
            d = s["mean_ndcg"]
            writer.writerow([
                s["tag"], s["n"],
                h[1], h[3], h[5],
                d[1], d[3], d[5],
                s["mrr"], s["avg_elapsed"],
            ])
    print(f"  Summary CSV    → {out_path}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Run LexAI ablation study")
    parser.add_argument("--ground_truth",   default="bns_eval_dataset.json")
    parser.add_argument("--bns_sections",   default="bns_sections.json",
                        help="Path to BNS sections JSON (for BM25 index)")
    parser.add_argument("--output_dir",     default="ablation_results")
    parser.add_argument("--skip_bm25",      action="store_true",
                        help="Skip BM25 run (if bns_sections.json not available)")
    args = parser.parse_args()

    Path(args.output_dir).mkdir(exist_ok=True)

    summaries = []

    # ── Configuration 1: BM25 baseline ────────────────────────────────────────
    if not args.skip_bm25:
        print("\n" + "▶" * 3 + "  CONFIG 1/3: BM25 keyword baseline")
        bm25_fn = functools.partial(
            search_sections_bm25, sections_path=args.bns_sections
        )
        s1 = run_evaluation(
            ground_truth_path=args.ground_truth,
            output_path=f"{args.output_dir}/eval_bm25_{TIMESTAMP}.csv",
            use_reformulation=False,          # BM25 raw query
            retriever_fn=bm25_fn,
            tag="BM25 (keyword baseline)",
        )
        summaries.append(s1)
    else:
        print("\n  [SKIP] BM25 baseline — --skip_bm25 flag set")

    # ── Configuration 2: FAISS, no reformulation ──────────────────────────────
    print("\n" + "▶" * 3 + "  CONFIG 2/3: FAISS semantic — no reformulation")
    s2 = run_evaluation(
        ground_truth_path=args.ground_truth,
        output_path=f"{args.output_dir}/eval_faiss_noref_{TIMESTAMP}.csv",
        use_reformulation=False,
        retriever_fn=search_sections,
        tag="FAISS semantic (no reform)",
    )
    summaries.append(s2)

    # ── Configuration 3: FAISS + LLM reformulation ────────────────────────────
    print("\n" + "▶" * 3 + "  CONFIG 3/3: FAISS semantic + LLM reformulation")
    s3 = run_evaluation(
        ground_truth_path=args.ground_truth,
        output_path=f"{args.output_dir}/eval_faiss_reform_{TIMESTAMP}.csv",
        use_reformulation=True,
        retriever_fn=search_sections,
        tag="FAISS + LLM reformulation",
    )
    summaries.append(s3)

    # ── Output ─────────────────────────────────────────────────────────────────
    print_comparison_table(
        summaries,
        out_path=f"{args.output_dir}/ablation_summary.txt",
    )
    save_summary_csv(
        summaries,
        out_path=f"{args.output_dir}/ablation_summary_{TIMESTAMP}.csv",
    )


if __name__ == "__main__":
    main()