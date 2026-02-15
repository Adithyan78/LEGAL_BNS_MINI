import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.1:8b"

def reformulate_query(user_query):

    prompt = f"""You are a legal assistant specializing in Indian criminal law.

Your task: Reformulate the case description into a single, dense, statute-agnostic legal issue statement suitable for embedding-based retrieval.

INSTRUCTIONS:
- Identify the core criminal acts
- Encode actus reus, mens rea, and resulting harm in one paragraph
- Use precise legal terminology
- Preserve essential facts
- Remove narrative details
- Do NOT ask questions
- Do NOT use bullet points, headings, or formatting
- Do NOT mention section numbers or statute names
- Output exactly 1 to 2 sentences only
- Output ONLY the reformulated statement

CASE:
{user_query}
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "temperature": 0.3,
            "num_predict": 200,
            "stream": False
        }
    )

    return response.json()["response"].strip()

def generate_legal_analysis(user_query, retrieved_sections, max_tokens=900):

    context_text = ""
    for i, sec in enumerate(retrieved_sections, 1):
        context_text += f"""
Retrieved Section #{i}
Section ID: {sec['section_id']}
Content: {sec['content']}
{'='*60}
"""

    prompt = f"""You are an expert legal analyst specializing in Indian criminal law under the Bharatiya Nyaya Sanhita (BNS), 2023.

═══════════════════════════════════════════════════════════
CASE DETAILS:
═══════════════════════════════════════════════════════════
{user_query}

═══════════════════════════════════════════════════════════
CANDIDATE BNS SECTIONS (Retrieved by semantic search):
═══════════════════════════════════════════════════════════
{context_text}

═══════════════════════════════════════════════════════════
YOUR TASK - CRITICAL INSTRUCTIONS:
═══════════════════════════════════════════════════════════

**PHASE 1: STRICT FILTERING & RERANKING**
Your primary job is to FILTER OUT sections that don't actually apply. The retrieval system may return semantically similar but legally irrelevant sections.

For each candidate section, rigorously verify:

✓ ACTUS REUS (Criminal Act):
  - Is there a clear, completed physical act described in the case?
  - Mere thoughts, plans, or intentions WITHOUT an overt act do NOT suffice
  - Preparatory acts may not constitute the offense itself

✓ MENS REA (Mental Element):
  - Does the case explicitly show the required mental state (intention, knowledge, negligence)?
  - Do NOT assume or infer mental state without factual basis
  - Different sections require different levels of mens rea

✓ ESSENTIAL INGREDIENTS:
  - Are ALL mandatory elements of the section satisfied?
  - If even ONE essential ingredient is missing/ambiguous, EXCLUDE the section
  - Common intention (Section 3 BNS) requires explicit evidence of shared purpose

✓ FACTUAL SUFFICIENCY:
  - Are the case facts specific enough to establish the offense?
  - Vague or incomplete facts cannot support a definitive legal conclusion
  - When in doubt about applicability, EXCLUDE the section

**PHASE 2: ANALYSIS FORMAT**

For ONLY the sections that pass all filters above, provide:

───────────────────────────────────────────────────────────

**APPLICABLE SECTION: [Exact Section ID - e.g., SECTION_103]**

SECTION DEFINITION:
[Provide the complete section text/definition from the retrieved content]

ESSENTIAL INGREDIENTS OF THIS OFFENSE:
1. [First essential element]
2. [Second essential element]
3. [Continue for all elements...]

CASE FACTS ANALYSIS:
✓ Ingredient 1: [Specific fact from case] → [How it satisfies this element]
✓ Ingredient 2: [Specific fact from case] → [How it satisfies this element]
✓ Ingredient 3: [Specific fact from case] → [How it satisfies this element]
[Continue for all ingredients...]

LEGAL REASONING:
[Detailed explanation of why this section applies. Connect the statutory language to the specific facts. Address any potential ambiguities. Cite relevant legal principles.]

PRESCRIBED PUNISHMENT:
[State the exact penalty/punishment under this section]

───────────────────────────────────────────────────────────

**REPEAT THE ABOVE FORMAT FOR EACH APPLICABLE SECTION**

═══════════════════════════════════════════════════════════
FINAL LEGAL CONCLUSION:
═══════════════════════════════════════════════════════════

[Provide a concise summary listing all applicable sections with their exact Section IDs]

**Applicable Offenses:**
- [SECTION_XXX]: [Brief description] - Punishment: [penalty]
- [SECTION_YYY]: [Brief description] - Punishment: [penalty]

**Overall Assessment:**
[2-3 sentences summarizing the legal position]

═══════════════════════════════════════════════════════════
IMPORTANT RULES - NEVER VIOLATE:
═══════════════════════════════════════════════════════════

❌ DO NOT use generic references like "Section 1" or "Section 2"
✓ ALWAYS use exact Section IDs (e.g., SECTION_103, SECTION_302, SECTION_34)

❌ DO NOT apply sections where essential ingredients are missing
✓ ONLY include sections where ALL elements are clearly satisfied

❌ DO NOT infer facts not stated in the case
✓ ONLY rely on explicitly stated facts

❌ DO NOT assume common intention without evidence
✓ REQUIRE explicit proof of shared criminal purpose

❌ DO NOT criminalize mere thoughts or intentions
✓ REQUIRE an overt criminal act (actus reus)

**IF NO SECTIONS APPLY:**
If after rigorous analysis NO retrieved sections actually fit the case facts, state:

"LEGAL ANALYSIS RESULT: No Applicable Offenses

After careful examination of the case facts against all retrieved BNS sections, none of the candidate sections apply because:

[Explain specifically why each section was excluded - e.g.:]
- SECTION_XXX: Excluded because [missing ingredient/element]
- SECTION_YYY: Excluded because [factual insufficiency]
- SECTION_ZZZ: Excluded because [no actus reus established]

CONCLUSION: Based on the facts provided and the retrieved sections, no criminal offense under BNS is established. [Optionally suggest what additional facts would be needed, or note if different sections might apply]"

═══════════════════════════════════════════════════════════

Begin your rigorous legal analysis now:
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "temperature": 0.05,
            "top_p": 0.9,
            "num_predict": max_tokens,
            "stream": False
        }
    )

    return response.json()["response"].strip()


