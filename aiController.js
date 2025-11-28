// controllers/aiControllers.js
import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateNotes = async (req, res) => {
  const { topic } = req.body;

  console.log("📩 Incoming topic:", topic);

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate structured HTML notes for the topic "${topic}" using:

<h2>Topic</h2>
<p>Explanation...</p>
<ul>
  <li>Point 1</li>
  <li>Point 2</li>
</ul>

Then generate 4 flashcards in JSON format ONLY at the end:

{
  "flashcards": [
    {"front": "", "back": ""},
    {"front": "", "back": ""},
    {"front": "", "back": ""},
    {"front": "", "back": ""}
  ]
}`
        }
      ]
    });

    const output = completion.choices[0].message.content;
    console.log("📝 AI Raw Output:", output);

    // Extract flashcards JSON
    const match = output.match(/\{[\s\S]*\}$/);
    let flashcards = [];

    if (match) {
      try {
        flashcards = JSON.parse(match[0]).flashcards || [];
      } catch (err) {
        console.log("❌ Flashcard JSON parse error:", err.message);
      }
    }

    // Remove JSON from notes HTML
    const htmlNotes = match ? output.replace(match[0], "").trim() : output;

    res.json({
      notes: htmlNotes,
      flashcards
    });

  } catch (error) {
    console.error("🔥 OpenAI API ERROR:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
};
