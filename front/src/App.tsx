import { useEffect, useState } from "react";

type Email = {
  subject: string;
  from: string;
  receivedTime: string;
  textBody: string;
  snippet: string;
};

function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchEmails = async () => {
    try {
      const res = await fetch(
        "http://localhost:5678/webhook/get-unread-emails",
      );
      const data = await res.json();

      const formatted = data.map((email: any) => ({
        subject: email.subject,
        from: email.from,
        receivedTime: new Date(email.receivedTime).toLocaleString(),
        textBody: email.textBody,
        snippet:
          email.textBody.slice(0, 200) +
          (email.textBody.length > 200 ? "..." : ""),
      }));

      setEmails(formatted);
    } catch (err) {
      setMessage("❌ Failed to fetch emails.");
    }
  };

  const summarize = async () => {
    setLoading(true);
    setMessage("⏳ Processing...");
    setSummary(null);
    try {
      const res = await fetch(
        "http://localhost:5678/webhook/summarize-unread",
        {
          method: "POST",
        },
      );
      const json = await res.json();
      setSummary(json.output || "No summary generated.");
      setMessage("✅ Summary complete!");
    } catch (err) {
      setMessage("❌ Failed to summarize.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📬 Unread Emails</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={summarize} disabled={loading}>
          Summarize Unread Emails
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}

      {summary && (
        <div
          style={{
            background: "#f6f6f6",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            whiteSpace: "pre-wrap",
            marginBottom: "2rem",
          }}
        >
          {summary}
        </div>
      )}

      <div>
        {emails.length === 0 ? (
          <p>No unread emails found.</p>
        ) : (
          emails.map((email, index) => (
            <div
              key={index}
              style={{
                borderBottom: "1px solid #ccc",
                marginBottom: "1rem",
                paddingBottom: "0.5rem",
              }}
            >
              <strong>{email.subject}</strong> <br />
              <em>{email.from}</em> <br />
              <small>{email.receivedTime}</small>
              <p>{email.snippet}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
