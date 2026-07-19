"use client";

import { useEffect, useState } from "react";
import { listBooks, createBook, updateBook, deleteBook } from "@/lib/local/books";

export default function BooksClient({ userId }) {
  const [books, setBooks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load(selectAfter) {
    setLoading(true);
    const list = await listBooks(userId);
    setBooks(list);
    setSelectedId((prev) => selectAfter ?? prev ?? list[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    const book = await createBook(userId);
    await load(book.id);
  }

  async function handleDelete(id) {
    await deleteBook(userId, id);
    if (id === selectedId) setSelectedId(null);
    await load();
  }

  async function updateField(field, value) {
    setBooks((prev) => prev.map((b) => (b.id === selectedId ? { ...b, [field]: value } : b)));
    await updateBook(userId, selectedId, { [field]: value });
  }

  const draft = books.find((b) => b.id === selectedId) || null;

  if (loading) {
    return <div className="muted" style={{ fontSize: 12 }}>Loading…</div>;
  }

  return (
    <div>
      <div className="page-title">Books</div>

      <div className="split-layout">
        <div className="split-list card" style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>My books</span>
            <button onClick={handleAdd} className="btn-primary" style={{ fontSize: 11, padding: "4px 10px" }}>
              + Add
            </button>
          </div>

          {books.length === 0 ? (
            <div className="muted" style={{ fontSize: 11.5 }}>No books yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {books.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 8px",
                    borderRadius: "var(--radius)",
                    cursor: "pointer",
                    background: b.id === selectedId ? "var(--bg-accent)" : "transparent",
                  }}
                >
                  <span style={{ flex: 1, fontSize: 12.5, fontStyle: b.finish_date ? "normal" : "italic" }}>
                    {b.title || "(untitled)"}
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(b.id);
                    }}
                    style={{ fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}
                    title="Delete"
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="split-main card" style={{ padding: 16 }}>
          {!draft ? (
            <div className="muted" style={{ fontSize: 12 }}>Add a book to get started.</div>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Book review</div>

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Title</label>
                  <input
                    value={draft.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Author</label>
                  <input
                    value={draft.author}
                    onChange={(e) => updateField("author", e.target.value)}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Series</label>
                  <input
                    value={draft.series}
                    onChange={(e) => updateField("series", e.target.value)}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Genre</label>
                  <input
                    value={draft.genre}
                    onChange={(e) => updateField("genre", e.target.value)}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Start</label>
                  <input
                    type="date"
                    value={draft.start_date || ""}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Finish</label>
                  <input
                    type="date"
                    value={draft.finish_date || ""}
                    onChange={(e) => updateField("finish_date", e.target.value)}
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 18, marginBottom: 14, fontSize: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={!!draft.format_paper}
                    onChange={(e) => updateField("format_paper", e.target.checked)}
                  />
                  Paper book
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={!!draft.format_ebook}
                    onChange={(e) => updateField("format_ebook", e.target.checked)}
                  />
                  E-book
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={!!draft.format_audiobook}
                    onChange={(e) => updateField("format_audiobook", e.target.checked)}
                  />
                  Audiobook
                </label>
              </div>

              <div className="two-col" style={{ marginBottom: 10 }}>
                <div>
                  <label className="field-label">Summary</label>
                  <textarea
                    value={draft.summary}
                    onChange={(e) => updateField("summary", e.target.value)}
                    style={{ width: "100%", height: 100, marginTop: 4 }}
                  />
                </div>
                <div>
                  <label className="field-label">Favorite quotes</label>
                  <textarea
                    value={draft.quotes}
                    onChange={(e) => updateField("quotes", e.target.value)}
                    style={{ width: "100%", height: 100, marginTop: 4 }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Review</label>
                <textarea
                  value={draft.review}
                  onChange={(e) => updateField("review", e.target.value)}
                  style={{ width: "100%", height: 90, marginTop: 4 }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 2, fontSize: 18, color: "var(--fill-warning)" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} onClick={() => updateField("rating", n)} style={{ cursor: "pointer" }}>
                      {n <= draft.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span
                  className="pill"
                  style={
                    draft.finish_date
                      ? { background: "var(--bg-success)", color: "var(--text-success)" }
                      : { background: "var(--bg-warning)", color: "var(--text-warning)" }
                  }
                >
                  {draft.finish_date ? "Finished" : "Reading"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
