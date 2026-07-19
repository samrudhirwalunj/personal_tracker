"use client";

import { getLocalDb } from "./db";

export async function listBooks(userId) {
  const db = await getLocalDb(userId);
  const books = await db.getAll("books");
  return books.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function createBook(userId, overrides = {}) {
  const db = await getLocalDb(userId);
  const id = await db.add("books", {
    title: "New book",
    author: "",
    series: "",
    genre: "",
    start_date: "",
    finish_date: "",
    format_paper: false,
    format_ebook: false,
    format_audiobook: false,
    summary: "",
    quotes: "",
    review: "",
    rating: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  });
  return db.get("books", id);
}

export async function updateBook(userId, bookId, updates) {
  const db = await getLocalDb(userId);
  const book = await db.get("books", bookId);
  if (!book) return null;
  Object.assign(book, updates);
  await db.put("books", book);
  return book;
}

export async function deleteBook(userId, bookId) {
  const db = await getLocalDb(userId);
  await db.delete("books", bookId);
}

export async function replaceAllBooks(userId, books) {
  const db = await getLocalDb(userId);
  const tx = db.transaction("books", "readwrite");
  await tx.store.clear();
  for (const b of books || []) await tx.store.add(b);
  await tx.done;
}
