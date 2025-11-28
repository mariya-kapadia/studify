import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";

const router = express.Router();
const client = new Groq({ apiKey:process.env.GROQ_API_KEY});

router.post("/generate", async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
Write clean HTML notes for topic "${topic}". 
Then give 4 flashcards in JSON format like:
{
  "flashcards":[
    {"front":"","back":""}
  ]
}
`
        }
      ]
    });

    const result = completion.choices[0].message.content;

    // Extract JSON flashcards
    const match = result.match(/\{[\s\S]*\}/);
    let flashcards = [];

    if (match) {
      flashcards = JSON.parse(match[0]).flashcards || [];
    }

    const htmlNotes = match ? result.replace(match[0], "").trim() : result;

    res.json({ notes: htmlNotes, flashcards });

  } catch (err) {
     console.log("🔥 Groq Error:", err.response?.data || err.message || err);
  return res.status(500).json({ error: "AI Failed", details: err.message });
  }
});

export default router;
