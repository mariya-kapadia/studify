import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("AI route working");
});


router.post("/generate", async (req, res) => {
    const { topic } = req.body;
    console.log("POST /generate hit! Topic =", topic);


    if (!topic) {
        return res.status(400).json({ error: "Topic required" });
    }

   try {
    console.log("Using key:", process.env.GEMINI_API_KEY);

    console.log("📩 Incoming topic:", topic);

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            contents: [
                {
                    parts: [
                        {
                            text: `Generate structured notes for the topic "${topic}" in clean HTML.

<h2>Topic</h2>
<p>Explanation</p>
<ul>
  <li>Key point</li>
  <li>Key point</li>
</ul>

Then also generate 4 flashcards in JSON format:
{
  "flashcards":[
    {"front":"", "back":""},
    {"front":"", "back":""},
    {"front":"", "back":""},
    {"front":"", "back":""}
  ]
}`
                        }
                    ]
                }
            ]
        }
    );

    console.log("💡 Gemini response full data:", JSON.stringify(response.data, null, 2));

    const output = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output) {
        console.log("❌ No output generated!");
        return res.status(500).json({ error: "Gemini returned empty output" });
    }

    console.log("📝 Raw Output:", output);

    // Extract JSON flashcards
    const match = output.match(/\{[\s\S]*\}/);
    let flashcards = [];

    if (match) {
        flashcards = JSON.parse(match[0]).flashcards;
    }

    const htmlNotes = output.replace(match[0], "").trim();

    res.json({
        notes: htmlNotes,
        flashcards
    });

} catch (err) {
    console.error("🔥 Gemini API Error:", err.response?.data || err);
    res.status(500).json({ error: "Gemini generation failed" });
}

});

export default router;
