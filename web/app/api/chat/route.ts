import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are Field Shift, an AI agricultural advisor for Bangladesh farmers.
You help farmers choose the best crop rotation plans based on NASA Earth observation data.
You are expert in Bangladeshi farming seasons: Kharif-1 (Aus), Kharif-2 (Aman/monsoon), Rabi (winter).
Key crops: Aman rice, Aus rice, Boro rice, wheat, maize, potato, mustard, lentil, mungbean, sesame, jute.
Give practical, specific, concise advice (under 200 words). Reference scores and farm data when provided.
Respond in Bengali or English matching the user's language.`;

function buildSystemWithContext(farmContext?: Record<string, unknown>): string {
  if (!farmContext || Object.keys(farmContext).length === 0) return SYSTEM_INSTRUCTION;
  return `${SYSTEM_INSTRUCTION}\n\nCURRENT FARM DATA:\n${JSON.stringify(farmContext, null, 2)}\n\nReference this data to give personalized advice.`;
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { messages, farmContext } = (body ?? {}) as {
    messages?: { role: string; content: string }[];
    farmContext?: Record<string, unknown>;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: buildSystemWithContext(farmContext),
      });
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: m.content }],
      }));
      const lastMessage = messages[messages.length - 1];
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage.content);
      const reply = result.response.text();
      if (reply?.trim()) return Response.json({ reply: reply.trim(), provider: "gemini" });
    } catch (err) { console.warn("Gemini error:", err); }
  }

  const mistralKey = (process.env.MISTRAL_API_KEYS ?? process.env.MISTRAL_API_KEY ?? "").split(",")[0]?.trim();
  if (mistralKey && mistralKey.length > 5) {
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${mistralKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.MISTRAL_MODEL || "mistral-small-latest",
          temperature: 0.3, max_tokens: 500,
          messages: [{ role: "system", content: buildSystemWithContext(farmContext) }, ...messages],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (typeof reply === "string" && reply.trim()) return Response.json({ reply: reply.trim(), provider: "mistral" });
      }
    } catch (err) { console.warn("Mistral error:", err); }
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", max_tokens: 500,
          messages: [{ role: "system", content: buildSystemWithContext(farmContext) }, ...messages],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (typeof reply === "string" && reply.trim()) return Response.json({ reply: reply.trim(), provider: "groq" });
      }
    } catch (err) { console.warn("Groq error:", err); }
  }

  return Response.json({ error: "All AI providers unavailable. Please try again." }, { status: 503 });
}
