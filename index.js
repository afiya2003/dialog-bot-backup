const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

// Hugging Face model + token
const HF_MODEL = "distilgpt2"; // light and safe model
const HF_TOKEN = process.env.HF_TOKEN; // set in Render environment variables

app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Dialog-bot is running ✅");
});

// Webhook route for Dialogflow
app.post("/webhook", async (req, res) => {
  try {
    const userQuery =
      req.body.queryResult?.queryText || "Hello, I am lost 🤖";

    // Call Hugging Face API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: userQuery },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply =
      response.data[0]?.generated_text ||
      "Sorry, I couldn’t generate a response.";

    // Send back to Dialogflow
    res.json({
      fulfillmentText: botReply,
    });
  } catch (error) {
    console.error("Error in webhook:", error.message);
    res.json({
      fulfillmentText:
        "⚠️ There was an error generating a response. Please try again.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
