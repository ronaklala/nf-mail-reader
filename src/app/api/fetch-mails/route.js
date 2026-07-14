import { NextResponse } from "next/server";
import { google } from "googleapis";

// Helper to decode base64 (URL-safe variant)
function decodeBase64(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(str, "base64").toString("utf-8");
}

// Recursively get the body from payload (handles multipart)
function getBody(payload) {
  if (!payload) return "";
  if (payload.parts) {
    const part =
      payload.parts.find((p) => p.mimeType === "text/html") ||
      payload.parts.find((p) => p.mimeType === "text/plain");
    return part ? decodeBase64(part.body.data || "") : "";
  }
  return decodeBase64(payload.body.data || "");
}

export async function GET(req) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const subjects = [
    '"Important: How to update your Netflix Household"',
    '"Your Netflix temporary access code"',
  ];

  if (!from)
    return NextResponse.json(
      { error: "Missing 'from' query" },
      { status: 400 }
    );

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  // FORCE refresh (surface invalid_grant immediately)
  await oAuth2Client.getAccessToken();

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  try {
    const query = `from:netflix.com to:${from} (${subjects.join(" OR ")})`;
    const listRes = await gmail.users.messages.list({
      userId: process.env.GMAIL_USER,
      q: query,
      maxResults: 1, // only latest email
    });

    const messages = listRes.data.messages;
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No emails found" }, { status: 404 });
    }

    const msg = await gmail.users.messages.get({
      userId: process.env.GMAIL_USER,
      id: messages[0].id,
    });

    const headers = msg.data.payload.headers;
    const snippet = msg.data.snippet;
    const body = getBody(msg.data.payload); // full body

    return NextResponse.json({ id: messages[0].id, headers, snippet, body });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch email" },
      { status: 500 }
    );
  }
}
