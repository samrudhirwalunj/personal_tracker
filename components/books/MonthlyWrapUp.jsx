"use client";

import { useMemo, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function stars(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function MonthlyWrapUp({ books, onSelectBook }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11

  const monthBooks = useMemo(() => {
    return books.filter((b) => {
      if (!b.finish_date) return false;
      const d = new Date(b.finish_date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [books, year, month]);

  const rated = monthBooks.filter((b) => b.rating > 0);
  const favorite = rated.length ? rated.reduce((a, b) => (b.rating > a.rating ? b : a)) : null;
  const leastFavorite = rated.length ? rated.reduce((a, b) => (b.rating < a.rating ? b : a)) : null;

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 1 }}>MONTHLY WRAP-UP</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8 }}>
          <button onClick={() => setYear((y) => y - 1)} style={{ fontSize: 12, padding: "4px 8px" }}>
            ‹
          </button>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{year}</span>
          <button onClick={() => setYear((y) => y + 1)} style={{ fontSize: 12, padding: "4px 8px" }}>
            ›
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18 }}>
        {MONTHS.map((m, i) => (
          <span
            key={m}
            onClick={() => setMonth(i)}
            className="pill"
            style={{
              cursor: "pointer",
              background: i === month ? "var(--fill-accent)" : "var(--surface-1)",
              color: i === month ? "var(--on-accent)" : "var(--text-secondary)",
              padding: "5px 10px",
            }}
          >
            {m.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Books read</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{monthBooks.length}</div>
        </div>
        <div className="card" style={{ padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Currently reading</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{books.filter((b) => !b.finish_date).length}</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 8 }}>Favorite book this month</div>
          {favorite ? (
            <div onClick={() => onSelectBook(favorite.id)} style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{favorite.title || "(untitled)"}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{favorite.author}</div>
              <div style={{ color: "var(--fill-warning)", fontSize: 13, marginTop: 4 }}>{stars(favorite.rating)}</div>
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 11.5 }}>No rated books this month.</div>
          )}
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 8 }}>Least favorite this month</div>
          {leastFavorite ? (
            <div onClick={() => onSelectBook(leastFavorite.id)} style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{leastFavorite.title || "(untitled)"}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{leastFavorite.author}</div>
              <div style={{ color: "var(--fill-warning)", fontSize: 13, marginTop: 4 }}>
                {stars(leastFavorite.rating)}
              </div>
            </div>
          ) : (
            <div className="muted" style={{ fontSize: 11.5 }}>No rated books this month.</div>
          )}
        </div>
      </div>

      {favorite?.quotes && (
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 500, marginBottom: 6 }}>Favorite quote</div>
          <div style={{ fontSize: 12.5, fontStyle: "italic", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
            &ldquo;{favorite.quotes.split("\n")[0]}&rdquo;
          </div>
        </div>
      )}

      <div className="card" style={{ overflowX: "auto" }}>
        <div style={{ fontSize: 11.5, fontWeight: 500, padding: "10px 12px", borderBottom: "0.5px solid var(--border)" }}>
          Books read this month
        </div>
        {monthBooks.length === 0 ? (
          <div className="muted" style={{ fontSize: 11.5, padding: 14 }}>
            No books finished in {MONTHS[month]} {year}.
          </div>
        ) : (
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Title</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Author</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Start</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Finish</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-secondary)" }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {monthBooks.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => onSelectBook(b.id)}
                  style={{ borderBottom: "0.5px solid var(--border)", cursor: "pointer" }}
                >
                  <td style={{ padding: "8px 12px" }}>{b.title || "(untitled)"}</td>
                  <td style={{ padding: "8px 12px" }}>{b.author}</td>
                  <td style={{ padding: "8px 12px" }}>{b.start_date}</td>
                  <td style={{ padding: "8px 12px" }}>{b.finish_date}</td>
                  <td style={{ padding: "8px 12px", color: "var(--fill-warning)" }}>{stars(b.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
