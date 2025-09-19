import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const HF_MODEL = "distilgpt2"; // or gpt2, bloomz, etc.
const HF_TOKEN = process.env.HF_TOKEN;

// Root test route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// Dialogflow webhook route
app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.queryResult.queryText;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage,
          parameters: { max_new_tokens: 50 }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("HF API error:", data);
      return res.json({ fulfillmentText: "Error from Hugging Face API." });
    }

    const botReply = data[0]?.generated_text || "Sorry, I couldn’t generate a response.";

    return res.json({ fulfillmentText: botReply });
  } catch (err) {
    console.error("Server error:", err);
    return res.json({ fulfillmentText: "Internal server error." });
  }
});

// Use Render’s PORT or fallback
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
