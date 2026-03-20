exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Sadece POST destekleniyor" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Geçersiz JSON" })
    };
  }

  const { message, history } = body;

  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Mesaj boş olamaz" })
    };
  }

  const messages = [
    {
      role: "system",
      content: "You are a friendly Discord bot assistant. Always reply in the same language the user writes in. Keep context of the conversation and give detailed helpful answers."
    }
  ];

  if (history && Array.isArray(history)) {
    messages.push(...history);
  }

  messages.push({ role: "user", content: message });

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 800
      })
    });

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Groq cevap vermedi" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sunucu hatası: " + err.message })
    };
  }
};
