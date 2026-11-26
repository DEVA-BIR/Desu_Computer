
const express = require("express");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        error: "Message is too long.",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are the customer-support assistant for
        Desu Computer Solution. Help with computer hardware,
        software, repairs, and troubleshooting.
        Be friendly and concise. Never invent company prices,
        policies, or contact details.`,
      },
    ];

    if (Array.isArray(history)) {
      history
        .filter(
          (item) =>
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
        )
        .slice(-8)
        .forEach((item) => {
          messages.push({
            role: item.role,
            content: item.content.slice(0, 2000),
          });
        });
    }

    messages.push({
      role: "user",
      content: message.trim(),
    });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages,
          max_completion_tokens: 350,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);

      if (response.status === 429 || response.status === 503) {
        return res.status(503).json({
          error: "The AI is busy right now. Please try again shortly.",
        });
      }

      return res.status(502).json({
        error: "The AI service could not respond. Please try again.",
      });
    }

    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "The AI returned an empty response.",
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("AI route error:", error.message);

    return res.status(500).json({
      error: "The assistant is temporarily unavailable.",
    });
  }
});

module.exports = router;
