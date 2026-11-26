
import { useState, useRef, useEffect } from "react";
import "./chatbot.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [history, loading]);

  async function sendMessage(e) {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const previousHistory = history;
    const nextHistory = [
      ...previousHistory,
      { role: "user", content: text },
    ];

    setHistory(nextHistory);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: previousHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to get an AI response."
        );
      }

      setHistory([
        ...nextHistory,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setHistory(previousHistory);
      setMessage(text);
      setError(
        err.message || "Could not connect to the AI assistant."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    if (loading) return;

    setHistory([]);
    setMessage("");
    setError("");
  }

  return (
    <section className="ai-chat">
      <header className="ai-chat__header">
        <div>
          <h2>Desu AI Assistant</h2>
          <p>How can we help you today?</p>
        </div>

        <button
          type="button"
          className="ai-chat__clear"
          onClick={clearChat}
          disabled={loading || history.length === 0}
        >
          New chat
        </button>
      </header>

      <div className="ai-chat__messages" aria-live="polite">
        {history.length === 0 && (
          <div className="ai-chat__welcome">
            <h3>Hello! 👋</h3>
            <p>
              Welcome to Desu Computer Solution.
              Ask me about computer repairs,
              hardware, software, or troubleshooting.
            </p>
          </div>
        )}

        {history.map((item, index) => (
          <div
            key={`${index}-${item.role}`}
            className={`ai-chat__message ai-chat__message--${item.role}`}
          >
            <span className="ai-chat__sender">
              {item.role === "user" ? "You" : "Desu AI"}
            </span>
            <p>{item.content}</p>
          </div>
        ))}

        {loading && (
          <p className="ai-chat__loading">
            Desu AI is thinking...
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <p className="ai-chat__error" role="alert">
          {error}
        </p>
      )}

      <form className="ai-chat__form" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about computer services..."
          aria-label="Your message"
          maxLength={2000}
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
        >
          {loading ? "..." : "Send"}
        </button>
      </form>

      <p className="ai-chat__note">
        AI responses may not always be accurate.
      </p>
    </section>
  );
}
