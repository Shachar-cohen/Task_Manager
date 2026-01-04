const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ======================
// Low-level Gemini call
// ======================
async function callGemini(prompt) {
  console.log("🧠 Calling Gemini...");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 300,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("❌ Gemini error:", errorData);

    if (errorData?.error?.code === 429) {
      const err = new Error("AI quota exceeded");
      err.statusCode = 429;
      throw err;
    }

    throw new Error("Gemini API error");
  }

  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((p) => (typeof p?.text === "string" ? p.text : ""))
    .join("")
    .trim();

  console.log("✅ Gemini response received");

  return text;
}

// ======================
// Business-level improve
// ======================
async function improveTask({ title, description, priority }) {
  const safeDescription =
    description && description.trim().length > 0
      ? description.trim()
      : "Complete this task.";

  const prompt = `
You are a professional task management assistant.

You will receive:
- A task title
- A task description
- The current priority (low, medium, high)

Your job:
1. Improve the task description so it is clearer and more actionable.
2. Briefly mention whether the current priority is appropriate.
   - If it is appropriate, say so.
   - If not, suggest what the priority SHOULD be.

IMPORTANT RULES:
- Return plain text only.
- Do NOT use bullet points.
- Do NOT use headings or markdown.
- Do NOT label sections.
- Do NOT ask questions.
- Keep it professional and concise.

Task title:
"${title}"

Original description:
"${safeDescription}"

Current priority:
"${priority}"
`;

  const result = await callGemini(prompt);

  if (!result || result.length < 10) {
    throw new Error("Gemini returned empty or invalid response");
  }

  return result;
}

module.exports = { improveTask };
