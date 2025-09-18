import { RequestHandler } from "express";

export const handleChat: RequestHandler = async (req, res) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };

  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Missing messages" });

  const apiKey = process.env.OPENAI_API_KEY;
  const lastUser = messages.filter((m) => m.role === "user").slice(-1)[0];
  const userText = lastUser?.content ?? "";

  if (!apiKey) {
    // Mock rule-based responder for offline use.
    let reply = "Sorry, I don't have AI enabled. Try asking about your course progress or assignments.";
    const txt = userText.toLowerCase();
    if (txt.includes("progress")) reply = "You can view your course progress on the Student Dashboard. Try opening the Dashboard to see detailed progress bars.";
    else if (txt.includes("assignment")) reply = "To submit an assignment, go to the Assignments area and upload your file or add a note. Instructors will grade it there.";
    else if (txt.includes("recommend")) reply = "I recommend practicing topics where your score is lowest. Check AI Recommendations on your dashboard for personalized suggestions.";
    else if (txt.includes("hello") || txt.includes("hi")) reply = "Hi! I'm AdeptBot — ask me about courses, assignments, or learning tips.";

    return res.json({ reply, model: "mock" });
  }

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("OpenAI error", resp.status, txt);
      return res.status(502).json({ error: "AI service error" });
    }

    const j = await resp.json();
    const reply = j.choices?.[0]?.message?.content ?? "";
    res.json({ reply, model: j.model });
  } catch (e) {
    console.error("AI handler error", e);
    res.status(500).json({ error: "Internal AI error" });
  }
};
