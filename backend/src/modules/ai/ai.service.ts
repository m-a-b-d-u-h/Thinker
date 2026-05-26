import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../lib/errors";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_RETRIES = 2;

async function callGemini(prompt: string, maxTokens = 8192): Promise<string> {
  if (!env.gemini.apiKey) {
    throw new AppError("API key AI belum dikonfigurasi di .env", 500);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const wait = 2000 * attempt;
      console.log(`[AI] Retry ${attempt}/${MAX_RETRIES} in ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(`${GEMINI_URL}?key=${env.gemini.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[AI] Gemini responded with status ${res.status}:`, errText.slice(0, 500));

        let geminiMsg = "";
        try {
          const errJson = JSON.parse(errText);
          geminiMsg = errJson?.error?.message || "";
        } catch { /* ignore */ }

        if (res.status === 400) {
          const detail = geminiMsg ? `: ${geminiMsg}` : " — mungkin konten tidak sesuai safety filter";
          throw new AppError(`Permintaan ke AI ditolak${detail}`, 502);
        }
        if (res.status === 403) {
          throw new AppError("API key AI tidak valid atau tidak memiliki akses", 502);
        }
        if (res.status === 429) {
          throw new AppError("Server AI sedang sibuk (rate limit), coba lagi nanti", 429);
        }
        if (res.status >= 500) {
          const detail = geminiMsg ? `: ${geminiMsg}` : "";
          throw new AppError(`Server AI mengalami gangguan${detail}`, 502);
        }
        const detail = geminiMsg ? `: ${geminiMsg}` : "";
        throw new AppError(`Gagal menghubungi server AI (${res.status})${detail}`, 502);
      }

      const data = (await res.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new AppError("Server AI tidak mengembalikan konten", 502);

      return text;
    } catch (err: any) {
      clearTimeout(timeout);
      lastError = err;

      if (err instanceof AppError) {
        if (err.statusCode === 429 || err.statusCode >= 500) {
          if (attempt < MAX_RETRIES) continue;
          throw err;
        }
        if (err.statusCode === 504) throw err;
        throw err;
      }

      // Network-level errors — retryable
      const isTimeout =
        err.name === "AbortError" ||
        err.code === "UND_ERR_CONNECT_TIMEOUT" ||
        err.cause?.code === "UND_ERR_CONNECT_TIMEOUT";

      if (isTimeout) {
        if (attempt < MAX_RETRIES) continue;
        throw new AppError("Koneksi ke server AI timeout, coba lagi nanti", 504);
      }

      throw new AppError("Gagal terhubung ke server AI, periksa koneksi internet", 503);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new AppError("Gagal menghasilkan konten AI", 502);
}

/** Fallback JSON parser for small blocks (questions, graph, etc.) */
function extractJson(text: string): any {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let raw = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try { return JSON.parse(raw); } catch { /* fall through */ }

  raw = raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
    .replace(/,(\s*[}\]])/g, "$1");

  try { return JSON.parse(raw); } catch { return null; }
}

/** Parse delimiter-based response from Gemini */
function parseResponse(raw: string) {
  const getSection = (start: string, end: string): string => {
    const s = raw.indexOf(start);
    if (s === -1) return "";
    const from = s + start.length;
    const e = end ? raw.indexOf(end, from) : raw.length;
    return (e === -1 ? raw.slice(from) : raw.slice(from, e)).trim();
  };

  let title = getSection("###TITLE###", "###DESC###");
  const description = getSection("###DESC###", "###CONTENT###");
  const content = getSection("###CONTENT###", "###NODES###");
  const nodesRaw = getSection("###NODES###", "###EDGES###");
  const edgesRaw = getSection("###EDGES###", "###QUESTIONS###");
  const questionsRaw = getSection("###QUESTIONS###", "");

  if (!title) {
    const firstLine = raw.split("\n").find((l) => l.trim().length > 0 && !l.startsWith("#"));
    if (firstLine) title = firstLine.trim();
  }

  let nodes: any[] = [];
  let edges: any[] = [];
  let questions: any[] = [];

  try { nodes = JSON.parse(nodesRaw || "[]"); } catch { nodes = []; }
  try { edges = JSON.parse(edgesRaw || "[]"); } catch { edges = []; }
  try { questions = JSON.parse(questionsRaw || "[]"); } catch { questions = []; }

  return { title, description, content, nodes, edges, questions };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export namespace AiService {
  export async function getCategoriesInfo() {
    const categories = await prisma.module.groupBy({
      by: ["category"],
      where: { isDraft: false },
      _count: { category: true },
      orderBy: { category: "asc" },
    });

    const titles = await prisma.module.findMany({
      where: { isDraft: false },
      select: { title: true, slug: true, category: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      categories: categories.map((c) => ({ name: c.category, count: c._count.category })),
      existingTitles: titles.map((t) => ({ title: t.title, slug: t.slug, category: t.category })),
    };
  }

  export async function autoGenerate(selectedCategory?: string) {
    const info = await getCategoriesInfo();
    const existingTitles = info.existingTitles.map((t) => t.title);

    let category: string;
    if (selectedCategory && info.categories.find((c) => c.name === selectedCategory)) {
      category = selectedCategory;
    } else {
      info.categories.sort((a, b) => a.count - b.count);
      category = info.categories[0]?.name || "mindset";
    }

    const prompt = `You are a premium ghostwriter for high-end mindset courses. Create a complete mental model module in the "${category}" category.

ALREADY COVERED TOPICS (DO NOT repeat these titles): ${existingTitles.join(", ") || "None"}

Generate a fresh, unique topic within "${category}" that is NOT in the list above. Title must be between 2 and 7 words.

CRITICAL — You MUST follow this exact format STRICTLY. Every single marker (###TITLE###, ###DESC###, ###CONTENT###, ###NODES###, ###EDGES###, ###QUESTIONS###) MUST appear exactly as shown. Do not add, remove, or modify any marker. Do not add extra text before ###TITLE### or after ###QUESTIONS###.

=== START OF FORMAT ===
###TITLE###
[Short punchy title, 2-7 words]

###DESC###
[One sentence that sells the transformation]

###CONTENT###
[Full markdown content, 5000-10000 characters. Use ## for sections, ### for subsections, - for bullet points. NO greetings, NO welcome, DO NOT repeat the title. Dive straight in. Every concept MUST have a real-life example.]

###NODES###
[Valid JSON array of 3-7 nodes: [{"id":"topic-1","label":"Word","type":"start|process|end","positionX":0,"positionY":0}]]
Structure: EXACTLY 1 node with type "start" → 1-5 nodes with type "process" (can branch) → EXACTLY 1 node with type "end".
Spacing rules:
- START node: positionX = 0, positionY = 0
- PROCESS nodes: positionX increases by 200-300 per depth level, positionY varies by 150-200 for branching nodes at same depth
- END node: positionX = last process X + 200-300, positionY = same as START Y (0)
Each label: 1-2 simple words only, no jargon.

###EDGES###
[Valid JSON array connecting the flow]
Connect START to the first process nodes. Process nodes can branch to multiple paths. ALL paths must eventually lead to the single END node.
No cycles, no dead ends. Every node must have a path to END.
Each edge label: 1-3 simple words.

###QUESTIONS###
[Valid JSON array of 3-5 questions: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]]
=== END OF FORMAT ===

WARNING: Your output is parsed by a machine. If you omit ANY marker (###TITLE###, ###DESC###, ###CONTENT###, ###NODES###, ###EDGES###, ###QUESTIONS###), the entire response will be REJECTED and your work will be wasted. The title line must be non-empty, between 2-7 words, and placed directly after ###TITLE### on the very next line.

REQUIREMENTS:
- Content: 5000-10000 characters, NO title repeat, NO greetings
- Title: 2-7 words, unique (not in ALREADY COVERED TOPICS)
- 3-7 nodes: exactly 1 type "start" → 1-5 type "process" (can branch) → exactly 1 type "end"
- Each node label: 1-2 simple words only (e.g. "Overthinking" not "The Spiral of Overthinking"), avoid 3+ words
- Edges: START connects to first processes, processes can branch, ALL paths lead to END
- No cycles, no dead ends. Every node must connect to END somehow
- Edge labels: 1-3 simple words per connection
- Node spacing: X gap = 200-300 between depth levels, Y gap = 150-200 for branching nodes
- 3-5 questions, correctAnswer is 0-based index
- Tone: direct, premium, persuasive, easy to digest yet high-value
- Every concept MUST include a concrete real-life example
- Write like a high-end mentor — no fluff, no filler
- IMPORTANT: In the CONTENT section, write PLAIN TEXT markdown. Do NOT escape anything. Just write naturally.`;

    const raw = await callGemini(prompt, 8192);
    const parsed = parseResponse(raw);

    if (!parsed.title || !parsed.content) {
      console.error("[AI] Parse failed. Raw:", raw.slice(0, 800));
      throw new AppError(`AI tidak menghasilkan konten yang valid (title:${!!parsed.title}, content:${!!parsed.content})`, 502);
    }

    const slug = slugify(parsed.title);

    let finalSlug = slug;
    let counter = 1;
    while (await prisma.module.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const idSuffix = Math.random().toString(36).slice(2, 8);

    const module = await prisma.module.create({
      data: {
        slug: finalSlug,
        title: parsed.title,
        description: parsed.description || "",
        category,
        content: parsed.content,
        isPremium: true,
        isDraft: true,
        nodes: (parsed.nodes || []).length > 0
          ? { create: (parsed.nodes as any[]).map((n: any) => ({
              id: `${n.id || "node"}-${idSuffix}`,
              positionX: n.positionX ?? 250,
              positionY: n.positionY ?? 150,
              label: n.label || "Node",
              type: "custom",
            }))}
          : undefined,
        edges: (parsed.edges || []).length > 0
          ? { create: (parsed.edges as any[]).map((e: any) => ({
              id: `edge-${idSuffix}-${e.source}-${e.target}`,
              source: `${e.source}-${idSuffix}`,
              target: `${e.target}-${idSuffix}`,
              label: e.label || "",
              animated: e.animated ?? true,
            }))}
          : undefined,
        questions: (parsed.questions || []).length > 0
          ? { create: (parsed.questions as any[]).map((q: any) => ({
              question: q.question || "",
              options: q.options || [],
              correctAnswer: q.correctAnswer ?? 0,
              explanation: q.explanation || "",
            }))}
          : undefined,
      },
    });

    return module;
  }

  export async function generate(mode: string, title?: string, description?: string, content?: string) {
    const prompts: Record<string, string> = {
      content: `Write a premium mindset module about "${title || "this topic"}".

Description: ${description || ""}

Write structured markdown content:
- NO greetings, NO welcome phrases, DO NOT repeat the title
- Dive straight into the substance with ## headings
- Use ### for sub-sections, - for bullet points
- Include real-life examples for every concept
- Tone: direct, premium, persuasive, easy to digest yet high-value
- Write like a high-end mentor — sharp, no fluff

Return ONLY the markdown content, no extra commentary.`,
      questions: `You are an educational assessment creator. Based on this content, create 3-5 quiz questions.

Content: ${content || title || "General topic"}

Return a valid JSON array ONLY (no markdown, no extra text). Each item:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why this answer is correct"
}
correctAnswer is the 0-based index of the correct option.`,
      graph: `Based on this content, suggest a flow chart.

Title: ${title || "Module"}
Content: ${content || "Topic"}

Structure: 1 START node → several PROCESS nodes (can branch) → 1 END node. All paths lead to END.

Return a valid JSON object ONLY (no markdown, no extra text):
{
  "nodes": [
    { "id": "slug-1", "label": "Start", "positionX": 100, "positionY": 100 },
    { "id": "slug-2", "label": "Process", "positionX": 350, "positionY": 50 },
    { "id": "slug-3", "label": "Branch", "positionX": 350, "positionY": 200 },
    { "id": "slug-4", "label": "End", "positionX": 600, "positionY": 100 }
  ],
  "edges": [
    { "source": "slug-1", "target": "slug-2", "label": "step", "animated": true },
    { "source": "slug-2", "target": "slug-4", "label": "step", "animated": true },
    { "source": "slug-3", "target": "slug-4", "label": "step", "animated": true }
  ]
}
Create 3-7 nodes: 1 start, 1 end, rest are process nodes in between. Labels: 1-2 simple words. Edges can branch but ALL must lead to the end node. No cycles. No dead ends. Use "slug-" prefix for ids.`,
    };

    const prompt = prompts[mode];
    if (!prompt) throw new AppError("Mode tidak valid", 400);

    const text = await callGemini(prompt, mode === "content" ? 8192 : 2048);

    switch (mode) {
      case "content":
        return { content: text.replace(/^```[a-z]*\n?/i, "").replace(/\n```$/i, "").trim() };
      case "questions": {
        const parsed = extractJson(text);
        return { questions: Array.isArray(parsed) ? parsed : [] };
      }
      case "graph": {
        const parsed = extractJson(text) || {};
        return {
          nodes: (parsed.nodes || []).map((n: any) => ({
            id: n.id || `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            positionX: n.positionX ?? 250,
            positionY: n.positionY ?? 150,
            label: n.label || "Node",
            type: "custom",
          })),
          edges: (parsed.edges || []).map((e: any) => ({
            id: `edge-${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            label: e.label || "",
            animated: e.animated ?? true,
          })),
        };
      }
      default:
        throw new AppError("Mode tidak valid", 400);
    }
  }
}
