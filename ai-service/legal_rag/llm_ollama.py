# import requests
# import json

# OLLAMA_URL = "http://localhost:11434/api/generate"
# MODEL_NAME = "gemma3:12b"


# # ============================================================
# # NON-STREAMING VERSION (UNCHANGED)
# # ============================================================

# def reformulate_query(user_query):

#     prompt = f"""You are a legal assistant specializing in Indian criminal law.

# Your task: Reformulate the case description into a single, dense, statute-agnostic legal issue statement suitable for embedding-based retrieval.

# INSTRUCTIONS:
# - Identify the core criminal acts
# - Encode actus reus, mens rea, and resulting harm in one paragraph
# - Use precise legal terminology
# - Preserve essential facts
# - Remove narrative details
# - Do NOT ask questions
# - Do NOT use bullet points, headings, or formatting
# - Do NOT mention section numbers or statute names
# - Output exactly 1 to 2 sentences only
# - Output ONLY the reformulated statement

# CASE:
# {user_query}
# """

#     response = requests.post(
#         OLLAMA_URL,
#         json={
#             "model": MODEL_NAME,
#             "prompt": prompt,
#             "temperature": 0.3,
#             "num_predict": 200,
#             "stream": False
#         }
#     )

#     return response.json()["response"].strip()


# # ============================================================
# # STREAMING VERSION OF reformulate_query
# # ============================================================

# def reformulate_query_stream(user_query):

#     prompt = f"""You are a legal assistant specializing in Indian criminal law.

# Your task: Reformulate the case description into a single, dense, statute-agnostic legal issue statement suitable for embedding-based retrieval.

# INSTRUCTIONS:
# - Identify the core criminal acts
# - Encode actus reus, mens rea, and resulting harm in one paragraph
# - Use precise legal terminology
# - Preserve essential facts
# - Remove narrative details
# - Do NOT ask questions
# - Do NOT use bullet points, headings, or formatting
# - Do NOT mention section numbers or statute names
# - Output exactly 1 to 2 sentences only
# - Output ONLY the reformulated statement

# CASE:
# {user_query}
# """

#     response = requests.post(
#         OLLAMA_URL,
#         json={
#             "model": MODEL_NAME,
#             "prompt": prompt,
#             "temperature": 0.3,
#             "num_predict": 200,
#             "stream": True
#         },
#         stream=True
#     )

#     for line in response.iter_lines():

#         if line:

#             data = json.loads(line.decode("utf-8"))

#             if "response" in data:
#                 yield data["response"]


# # ============================================================
# # NON-STREAMING VERSION (UNCHANGED)
# # ============================================================

# def generate_legal_analysis(user_query, retrieved_sections, max_tokens=900):

#     context_text = ""
#     for i, sec in enumerate(retrieved_sections, 1):
#         context_text += f"""
# Retrieved Section #{i}
# Section ID: {sec['section_id']}
# Content: {sec['content']}
# {'='*60}
# """

#     prompt = f"""You are an expert legal analyst specializing in Indian criminal law under the Bharatiya Nyaya Sanhita (BNS), 2023.

# ═══════════════════════════════════════════════════════════
# CASE DETAILS:
# ═══════════════════════════════════════════════════════════
# {user_query}

# ═══════════════════════════════════════════════════════════
# CANDIDATE BNS SECTIONS (Retrieved by semantic search):
# ═══════════════════════════════════════════════════════════
# {context_text}

# ═══════════════════════════════════════════════════════════
# YOUR TASK - CRITICAL INSTRUCTIONS:
# ═══════════════════════════════════════════════════════════

# **PHASE 1: STRICT FILTERING & RERANKING**
# Your primary job is to FILTER OUT sections that don't actually apply. The retrieval system may return semantically similar but legally irrelevant sections.

# For each candidate section, rigorously verify:

# ✓ ACTUS REUS (Criminal Act):
#   - Is there a clear, completed physical act described in the case?
#   - Mere thoughts, plans, or intentions WITHOUT an overt act do NOT suffice
#   - Preparatory acts may not constitute the offense itself

# ✓ MENS REA (Mental Element):
#   - Does the case explicitly show the required mental state (intention, knowledge, negligence)?
#   - Do NOT assume or infer mental state without factual basis
#   - Different sections require different levels of mens rea

# ✓ ESSENTIAL INGREDIENTS:
#   - Are ALL mandatory elements of the section satisfied?
#   - If even ONE essential ingredient is missing/ambiguous, EXCLUDE the section
#   - Common intention (Section 3 BNS) requires explicit evidence of shared purpose

# ✓ FACTUAL SUFFICIENCY:
#   - Are the case facts specific enough to establish the offense?
#   - Vague or incomplete facts cannot support a definitive legal conclusion
#   - When in doubt about applicability, EXCLUDE the section

# **PHASE 2: ANALYSIS FORMAT**

# For ONLY the sections that pass all filters above, provide:

# ───────────────────────────────────────────────────────────

# **APPLICABLE SECTION: [Exact Section ID - e.g., SECTION_103]**

# SECTION DEFINITION:
# [Provide the complete section text/definition from the retrieved content]

# ESSENTIAL INGREDIENTS OF THIS OFFENSE:
# 1. [First essential element]
# 2. [Second essential element]
# 3. [Continue for all elements...]

# CASE FACTS ANALYSIS:
# ✓ Ingredient 1: [Specific fact from case] → [How it satisfies this element]
# ✓ Ingredient 2: [Specific fact from case] → [How it satisfies this element]
# ✓ Ingredient 3: [Specific fact from case] → [How it satisfies this element]
# [Continue for all ingredients...]

# LEGAL REASONING:
# [Detailed explanation of why this section applies. Connect the statutory language to the specific facts.]

# PRESCRIBED PUNISHMENT:
# [State the exact penalty/punishment under this section]

# ───────────────────────────────────────────────────────────

# FINAL LEGAL CONCLUSION:
# ═══════════════════════════════════════════════════════════

# [Provide concise summary listing all applicable sections]

# Begin your rigorous legal analysis now:
# """

#     response = requests.post(
#         OLLAMA_URL,
#         json={
#             "model": MODEL_NAME,
#             "prompt": prompt,
#             "temperature": 0.05,
#             "top_p": 0.9,
#             "num_predict": max_tokens,
#             "stream": False
#         }
#     )

#     return response.json()["response"].strip()


# # ============================================================
# # STREAMING VERSION (PROMPT 100% SAME)
# # ============================================================


# def generate_legal_analysis_stream(user_query, retrieved_sections, max_tokens=900):

#     context_text = ""
#     for i, sec in enumerate(retrieved_sections, 1):
#         ipc_line = f"IPC Equivalent: Section {sec['ipc_equivalent']}" if sec.get('ipc_equivalent') else "IPC Equivalent: N/A"
#         diff_line = f"Key Differences from IPC: {sec['key_differences']}" if sec.get('key_differences') else "Key Differences from IPC: N/A"
#         context_text += f"""
# Retrieved Section #{i}
# Section ID: {sec['section_id']}
# {ipc_line}
# {diff_line}
# Content: {sec['content']}
# {'='*60}
# """

#     prompt = f"""You are an expert legal analyst specializing in Indian criminal law under the Bharatiya Nyaya Sanhita (BNS), 2023.

# ═══════════════════════════════════════════════════════════
# CASE DETAILS:
# ═══════════════════════════════════════════════════════════
# {user_query}

# ═══════════════════════════════════════════════════════════
# CANDIDATE BNS SECTIONS (Retrieved by semantic search):
# ═══════════════════════════════════════════════════════════
# {context_text}

# ═══════════════════════════════════════════════════════════
# YOUR TASK - CRITICAL INSTRUCTIONS:
# ═══════════════════════════════════════════════════════════

# **PHASE 1: STRICT FILTERING & RERANKING**
# Your primary job is to FILTER OUT sections that don't actually apply. The retrieval system may return semantically similar but legally irrelevant sections.

# For each candidate section, rigorously verify:

# ✓ STRICT RETRIEVAL BOUNDARY:
#   - You MUST ONLY analyze sections that are explicitly provided in the CANDIDATE BNS SECTIONS above
#   - NEVER reference, assume, or fabricate content for any section not present in the retrieved context
#   - If a section's full text is not in the retrieved content, DO NOT include it in your analysis
#   - If NO retrieved section fully applies, explicitly state: "No retrieved section sufficiently satisfies all ingredients for this case."
#   - Do NOT use your general legal knowledge to fill gaps in retrieved section text

# ✓ ACTUS REUS (Criminal Act):
#   - Is there a clear, completed physical act described in the case?
#   - Mere thoughts, plans, or intentions WITHOUT an overt act do NOT suffice
#   - Preparatory acts may not constitute the offense itself

# ✓ MENS REA (Mental Element):
#   - Does the case explicitly show the required mental state (intention, knowledge, negligence)?
#   - Do NOT assume or infer mental state without factual basis
#   - Different sections require different levels of mens rea

# ✓ ESSENTIAL INGREDIENTS:
#   - Are ALL mandatory elements of the section satisfied?
#   - If even ONE essential ingredient is missing/ambiguous, EXCLUDE the section
#   - Common intention (Section 3 BNS) requires explicit evidence of shared purpose

# ✓ FACTUAL SUFFICIENCY:
#   - Are the case facts specific enough to establish the offense?
#   - Vague or incomplete facts cannot support a definitive legal conclusion
#   - When in doubt about applicability, EXCLUDE the section

# ✓ SECTION NUMBERING:
#   - Always use BNS section numbers when referencing applicable sections
#   - Never quote IPC section numbers in the punishment or analysis blocks
#   - IPC section numbers must ONLY appear inside the IPC EQUIVALENT & CHANGES block

# **PHASE 2: ANALYSIS FORMAT**

# For ONLY the sections that pass all filters above, provide:

# ───────────────────────────────────────────────────────────

# **APPLICABLE SECTION: [Exact Section ID - e.g., SECTION_103]**

# SECTION DEFINITION:
# [Copy the exact definition ONLY from the retrieved content above. If the section text is not in the retrieved content, SKIP this section entirely - do not assume or generate the definition.]

# ESSENTIAL INGREDIENTS OF THIS OFFENSE:
# 1. [First essential element]
# 2. [Second essential element]
# 3. [Continue for all elements...]

# CASE FACTS ANALYSIS:
# ✓ Ingredient 1: [Specific fact from case] → [How it satisfies this element]
# ✓ Ingredient 2: [Specific fact from case] → [How it satisfies this element]
# ✓ Ingredient 3: [Specific fact from case] → [How it satisfies this element]

# LEGAL REASONING:
# [Detailed explanation of why this section applies.]

# PRESCRIBED PUNISHMENT:
# [State the exact penalty as defined under this BNS section only. Do NOT reference IPC section numbers here.]

# IPC EQUIVALENT & CHANGES:
# - IPC Equivalent: [Only the IPC section number from context, e.g. "IPC Section 300"]
# - Key Differences: [What changed from IPC to BNS for this section. If no change, state "No substantive change."]

# ───────────────────────────────────────────────────────────

# FINAL LEGAL CONCLUSION:
# ═══════════════════════════════════════════════════════════

# [Provide concise summary of applicable sections]

# Begin your rigorous legal analysis now:
# """

#     response = requests.post(
#         OLLAMA_URL,
#         json={
#             "model": MODEL_NAME,
#             "prompt": prompt,
#             "temperature": 0.05,
#             "top_p": 0.9,
#             "num_predict": max_tokens,
#             "stream": True
#         },
#         stream=True
#     )

#     for line in response.iter_lines():

#         if line:

#             data = json.loads(line.decode("utf-8"))

#             if "response" in data:
#                 yield data["response"]

import requests
import json
import os
from dotenv import load_dotenv
load_dotenv()
# ============================================================
# CONFIG
# ============================================================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set. "
        "Get a free key at https://console.groq.com/keys and set it before starting the server."
    )

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}

# Tried in order. First one that responds successfully wins.
MODEL_CHAIN = [
    "llama-3.3-70b-versatile",                    # primary - best quality
    "llama-3.1-8b-instant",                       # fallback 1 - fast, cheap
    "meta-llama/llama-4-scout-17b-16e-instruct",  # fallback 2 - preview, still Llama family
]

RETRYABLE_STATUS = {429, 500, 502, 503, 504}
REQUEST_TIMEOUT = 60  # seconds


# ============================================================
# INTERNAL: fallback-aware call helpers
# ============================================================

def _call_groq(messages, temperature, max_tokens, top_p=1.0):
    """Non-streaming call. Walks MODEL_CHAIN until one model succeeds."""
    last_error = None

    for model in MODEL_CHAIN:
        try:
            resp = requests.post(
                GROQ_URL,
                headers=HEADERS,
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "top_p": top_p,
                    "max_tokens": max_tokens,
                    "stream": False,
                },
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code == 200:
                data = resp.json()
                print(f"✅ Groq call succeeded with model: {model}")
                return data["choices"][0]["message"]["content"].strip()

            print(f"⚠️ {model} failed (HTTP {resp.status_code}), trying next fallback...")
            last_error = f"{model} -> HTTP {resp.status_code}: {resp.text[:200]}"
            continue

        except requests.exceptions.RequestException as e:
            print(f"⚠️ {model} raised {e}, trying next fallback...")
            last_error = f"{model} -> {e}"
            continue

    raise RuntimeError(f"All Groq models in the fallback chain failed. Last error: {last_error}")


def _call_groq_stream(messages, temperature, max_tokens, top_p=1.0):
    """
    Streaming call. Walks MODEL_CHAIN until one model successfully OPENS a stream
    (HTTP 200 + first byte). Once a model starts streaming, we commit to it —
    we don't mid-stream jump to another model, to avoid duplicated/garbled output.
    """
    last_error = None

    for model in MODEL_CHAIN:
        try:
            resp = requests.post(
                GROQ_URL,
                headers=HEADERS,
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "top_p": top_p,
                    "max_tokens": max_tokens,
                    "stream": True,
                },
                stream=True,
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code != 200:
                print(f"⚠️ {model} failed (HTTP {resp.status_code}), trying next fallback...")
                last_error = f"{model} -> HTTP {resp.status_code}: {resp.text[:200]}"
                continue

            print(f"✅ Streaming with model: {model}")

            def _gen(response=resp):
                for line in response.iter_lines():
                    if not line:
                        continue
                    decoded = line.decode("utf-8")
                    if not decoded.startswith("data: "):
                        continue
                    payload = decoded[len("data: "):]
                    if payload.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    delta = chunk["choices"][0]["delta"].get("content")
                    if delta:
                        yield delta

            return _gen()

        except requests.exceptions.RequestException as e:
            print(f"⚠️ {model} raised {e}, trying next fallback...")
            last_error = f"{model} -> {e}"
            continue

    raise RuntimeError(f"All Groq models in the fallback chain failed to start streaming. Last error: {last_error}")


# ============================================================
# NON-STREAMING VERSION
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

    return _call_groq(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=200,
    )


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

    for chunk in _call_groq_stream(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=200,
    ):
        yield chunk


# ============================================================
# NON-STREAMING VERSION
# ============================================================

def generate_legal_analysis(user_query, retrieved_sections, max_tokens=3500):

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

For EVERY retrieved section above, you MUST rigorously verify and produce a verdict — do not silently skip any section, including ones you plan to exclude.

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

✓ INDEPENDENT ACTS DOCTRINE:
  - A single case may contain MULTIPLE separate criminal acts (e.g. a stalking offense AND a resulting death). Do NOT treat an independently completed offense as mere "background context" to a more serious outcome.
  - Evaluate each retrieved section against the specific act it targets, not only against the case's ultimate harm.
  - A section should NOT be excluded just because a different, more severe section also applies to the same case.

✓ MUTUALLY EXCLUSIVE GRADATIONS:
  - If multiple retrieved sections are alternative degrees of the same underlying offense (e.g. different homicide gradations based on degree of intention/knowledge), do NOT include them all as equally applicable.
  - Select the single best-fitting section for that specific harm, and explicitly state in the reasoning why the other gradations were excluded.

✓ MANDATORY VERDICT LOG:
  - Before Phase 2, list every retrieved Section ID with a one-line INCLUDED or EXCLUDED verdict.
  - Every EXCLUDED verdict must name the SPECIFIC missing or unsatisfied ingredient — a vague dismissal ("doesn't directly address X") is not acceptable.
  - A section with a high retrieval similarity score that is excluded requires an especially clear, specific justification.


**PHASE 2: ANALYSIS FORMAT**

First, output the Mandatory Verdict Log (Section ID → INCLUDED/EXCLUDED → reason) for every retrieved section.

Then, for ONLY the sections marked INCLUDED above, provide:

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

    return _call_groq(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.05,
        top_p=0.9,
        max_tokens=max_tokens,
    )


# ============================================================
# STREAMING VERSION (PROMPT 100% SAME)
# ============================================================

def generate_legal_analysis_stream(user_query, retrieved_sections, max_tokens=3500):

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

For EVERY retrieved section above, you MUST rigorously verify and produce a verdict — do not silently skip any section, including ones you plan to exclude.

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

✓ INDEPENDENT ACTS DOCTRINE:
  - A single case may contain MULTIPLE separate criminal acts . Do NOT treat an independently completed offense as mere "background context" to a more serious outcome.
  - Evaluate each retrieved section against the specific act it targets, not only against the case's ultimate harm.
  - A section should NOT be excluded just because a different, more severe section also applies to the same case.

✓ MUTUALLY EXCLUSIVE GRADATIONS:
  - If multiple retrieved sections are alternative degrees of the same underlying offense (e.g. different homicide gradations based on degree of intention/knowledge), do NOT include them all as equally applicable.
  - Select the single best-fitting section for that specific harm, and explicitly state in the reasoning why the other gradations were excluded.

✓ MANDATORY VERDICT LOG:
  - Before Phase 2, list every retrieved Section ID with a one-line INCLUDED or EXCLUDED verdict.
  - Every EXCLUDED verdict must name the SPECIFIC missing or unsatisfied ingredient — a vague dismissal ("doesn't directly address X") is not acceptable.
  - A section with a high retrieval similarity score that is excluded requires an especially clear, specific justification.


**PHASE 2: ANALYSIS FORMAT**

First, output the Mandatory Verdict Log (Section ID → INCLUDED/EXCLUDED → reason) for every retrieved section.

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

    for chunk in _call_groq_stream(
        messages=[{"role": "user", "content": prompt}],
        temperature=0.05,
        top_p=0.9,
        max_tokens=max_tokens,
    ):
        yield chunk