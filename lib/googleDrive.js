"use client";

// Client-only helper for the optional "back up to your own Google Drive" feature.
// Uses Google Identity Services' implicit token flow (no client secret, no
// refresh token stored anywhere), so every sync re-prompts a Google popup —
// that's a side effect of keeping the app server-side stateless about Drive
// credentials, not a bug.

const BACKUP_FILENAME = "personal-tracker-backup.json.gz";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";

let tokenClient;

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Identity Services"));
    document.head.appendChild(script);
  });
}

async function requestAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google Drive backup isn't configured yet");

  await loadGis();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) return reject(new Error(response.error));
        resolve(response.access_token);
      },
    });
    tokenClient.requestAccessToken();
  });
}

async function compress(jsonString) {
  const stream = new Blob([jsonString]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Response(stream).blob();
}

async function decompress(blob) {
  const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

async function findBackupFileId(token) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name%3D%27${BACKUP_FILENAME}%27&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Could not look up existing Drive backup");
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

export async function uploadBackup(jsonData) {
  const token = await requestAccessToken();
  const compressed = await compress(JSON.stringify(jsonData));
  const existingId = await findBackupFileId(token);

  const metadata = existingId ? { name: BACKUP_FILENAME } : { name: BACKUP_FILENAME, parents: ["appDataFolder"] };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", compressed, BACKUP_FILENAME);

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const res = await fetch(url, {
    method: existingId ? "PATCH" : "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error("Google Drive upload failed");
  return res.json();
}

export async function downloadBackup() {
  const token = await requestAccessToken();
  const fileId = await findBackupFileId(token);
  if (!fileId) return null;

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Google Drive download failed");

  const blob = await res.blob();
  const text = await decompress(blob);
  return JSON.parse(text);
}
