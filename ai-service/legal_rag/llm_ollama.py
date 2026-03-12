import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma3:12b"


# ============================================================
# NON-STREAMING VERSION (UNCHANGED)
# ============================================================

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


# ============================================================
# STREAMING VERSION OF reformulate_query
# ============================================================

def reformulate_query_stream(user_query):

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
            "stream": True
        },
        stream=True
    )

    for line in response.iter_lines():

        if line:

            data = json.loads(line.decode("utf-8"))

            if "response" in data:
                yield data["response"]


# ============================================================
# NON-STREAMING VERSION (UNCHANGED)
# ============================================================

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
[Detailed explanation of why this section applies. Connect the statutory language to the specific facts.]

PRESCRIBED PUNISHMENT:
[State the exact penalty/punishment under this section]

───────────────────────────────────────────────────────────

FINAL LEGAL CONCLUSION:
═══════════════════════════════════════════════════════════

[Provide concise summary listing all applicable sections]

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


# ============================================================
# STREAMING VERSION (PROMPT 100% SAME)
# ============================================================


def generate_legal_analysis_stream(user_query, retrieved_sections, max_tokens=900):

    context_text = ""
    for i, sec in enumerate(retrieved_sections, 1):
        ipc_line = f"IPC Equivalent: Section {sec['ipc_equivalent']}" if sec.get('ipc_equivalent') else "IPC Equivalent: N/A"
        diff_line = f"Key Differences from IPC: {sec['key_differences']}" if sec.get('key_differences') else "Key Differences from IPC: N/A"
        context_text += f"""
Retrieved Section #{i}
Section ID: {sec['section_id']}
{ipc_line}
{diff_line}
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

✓ STRICT RETRIEVAL BOUNDARY:
  - You MUST ONLY analyze sections that are explicitly provided in the CANDIDATE BNS SECTIONS above
  - NEVER reference, assume, or fabricate content for any section not present in the retrieved context
  - If a section's full text is not in the retrieved content, DO NOT include it in your analysis
  - If NO retrieved section fully applies, explicitly state: "No retrieved section sufficiently satisfies all ingredients for this case."
  - Do NOT use your general legal knowledge to fill gaps in retrieved section text

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

✓ SECTION NUMBERING:
  - Always use BNS section numbers when referencing applicable sections
  - Never quote IPC section numbers in the punishment or analysis blocks
  - IPC section numbers must ONLY appear inside the IPC EQUIVALENT & CHANGES block

**PHASE 2: ANALYSIS FORMAT**

For ONLY the sections that pass all filters above, provide:

───────────────────────────────────────────────────────────

**APPLICABLE SECTION: [Exact Section ID - e.g., SECTION_103]**

SECTION DEFINITION:
[Copy the exact definition ONLY from the retrieved content above. If the section text is not in the retrieved content, SKIP this section entirely - do not assume or generate the definition.]

ESSENTIAL INGREDIENTS OF THIS OFFENSE:
1. [First essential element]
2. [Second essential element]
3. [Continue for all elements...]

CASE FACTS ANALYSIS:
✓ Ingredient 1: [Specific fact from case] → [How it satisfies this element]
✓ Ingredient 2: [Specific fact from case] → [How it satisfies this element]
✓ Ingredient 3: [Specific fact from case] → [How it satisfies this element]

LEGAL REASONING:
[Detailed explanation of why this section applies.]

PRESCRIBED PUNISHMENT:
[State the exact penalty as defined under this BNS section only. Do NOT reference IPC section numbers here.]

IPC EQUIVALENT & CHANGES:
- IPC Equivalent: [Only the IPC section number from context, e.g. "IPC Section 300"]
- Key Differences: [What changed from IPC to BNS for this section. If no change, state "No substantive change."]

───────────────────────────────────────────────────────────

FINAL LEGAL CONCLUSION:
═══════════════════════════════════════════════════════════

[Provide concise summary of applicable sections]

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
            "stream": True
        },
        stream=True
    )

    for line in response.iter_lines():

        if line:

            data = json.loads(line.decode("utf-8"))

            if "response" in data:
                yield data["response"]