const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Hugging Face token from environment
const HF_API_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = 'gpt2';

app.post('/webhook', async (req, res) => {
    const userMessage = req.body.queryResult.queryText;
    const intent = req.body.queryResult.intent.displayName;

    if (intent === 'Default Fallback Intent') {
        try {
            const generatedText = await getHuggingFaceResponse(userMessage);
            return res.json({ fulfillmentText: generatedText });
        } catch (err) {
            console.error(err);
            return res.json({ fulfillmentText: "Sorry, I couldn't generate a response." });
        }
    } else {
        return res.json({ fulfillmentText: 'Intent matched normally.' });
    }
});

async function getHuggingFaceResponse(input) {
    const response = await axios.post(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        { inputs: input },
        {
            headers: { Authorization: `Bearer ${HF_API_TOKEN}` },
            timeout: 60000
        }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
        return response.data[0].generated_text;
    } else if (typeof response.data === 'string') {
        return response.data;
    } else {
        return "I'm not sure how to respond to that.";
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
