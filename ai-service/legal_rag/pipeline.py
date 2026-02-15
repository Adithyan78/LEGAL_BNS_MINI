from retriever import search_sections
from llm_ollama import generate_legal_analysis, reformulate_query


def analyze_case(case_description, top_k=5):

    print("=" * 80)
    print("CASE DESCRIPTION:")
    print("=" * 80)
    print(case_description)

    # 🔹 STEP 1: Reformulate Query
    print("\n" + "=" * 80)
    print("REFORMULATING QUERY FOR BETTER RETRIEVAL...")
    print("=" * 80)

    refined_query = reformulate_query(case_description)

    print("\nReformulated Query:")
    print(refined_query)

    # 🔹 STEP 2: Retrieval using reformulated query
    print("\n" + "=" * 80)
    print("RETRIEVING RELEVANT SECTIONS...")
    print("=" * 80)

    results = search_sections(refined_query, top_k=top_k)

    if not results:
        print("⚠️ No relevant sections found.")
        return {
            "query": case_description,
            "reformulated_query": refined_query,
            "retrieved_sections": [],
            "analysis": "No relevant legal sections found above similarity threshold."
        }

    for i, r in enumerate(results, 1):
        print(f"\n{i}. {r['section_id']} (Similarity: {r['score']:.4f})")

    # 🔹 STEP 3: Legal Analysis using ORIGINAL case facts
    print("\n" + "=" * 80)
    print("LEGAL ANALYSIS:")
    print("=" * 80 + "\n")

    analysis = generate_legal_analysis(case_description, results)

    print(analysis)

    return {
        "query": case_description,
        "reformulated_query": refined_query,
        "retrieved_sections": results,
        "analysis": analysis
    }
