import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Dialogflow Webhook is running 🚀");
});

// Webhook route
app.post("/webhook", (req, res) => {
  console.log("Webhook request body:", JSON.stringify(req.body, null, 2));

  try {
    const intent = req.body.queryResult?.intent?.displayName;
    let responseText = "Sorry, I didn’t get that.";

    if (intent === "Default Welcome Intent") {
      responseText = "Hi! How can I help you today?";
    } else if (intent === "YourCustomIntentName") {
      responseText = "This is a response from the webhook for your custom intent.";
    }

    res.json({ fulfillmentText: responseText });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.json({ fulfillmentText: "Something went wrong in the webhook." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
