const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
app.use(bodyParser.json());

const HF_TOKEN = process.env.HF_TOKEN; // Set in Render environment
const HF_MODEL = process.env.HF_MODEL || "distilgpt2"; // default model

// Dialogflow webhook endpoint
app.post("/webhook", async (req, res) => {
  try {
    const queryText = req.body.queryResult.queryText;

    console.log("📝 User Query:", queryText);

    // Call Hugging Face Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: queryText }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HuggingFace API Error:", response.status, errorText);
      return res.json({
        fulfillmentText: "Sorry, I couldn't generate a response right now.",
      });
    }

    const data = await response.json();
    console.log("✅ HuggingFace API Response:", JSON.stringify(data));

    let botReply = "Sorry, I couldn't think of a reply.";
    if (Array.isArray(data) && data[0]?.generated_text) {
      botReply = data[0].generated_text;
    }

    // Send response back to Dialogflow
    res.json({ fulfillmentText: botReply });

  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.json({
      fulfillmentText: "Something went wrong. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
