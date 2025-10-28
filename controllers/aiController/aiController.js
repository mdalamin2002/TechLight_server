const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const chatAI = async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: [
        {
          role: "system",
          content:
            "You are an AI shopping assistant for an electronics store. Help with product recommendations, specs explanations, compatibility guidance, and comparisons. Be concise and helpful.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = response.output_text || "I couldn't generate a reply.";

    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({
      reply: "Something went wrong.",
      details: error.message,
    });
  }
};

module.exports = { chatAI };
