export function encodeSourceUrl(sourceUrl: string) {
  const utf8Bytes =
    typeof TextEncoder !== "undefined"
      ? new TextEncoder().encode(sourceUrl)
      : Uint8Array.from(Buffer.from(sourceUrl, "utf8"));

  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(utf8Bytes).toString("base64")
      : btoa(String.fromCharCode(...utf8Bytes));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeSourceUrl(encoded: string) {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const withPadding = `${padded}${"=".repeat((4 - (padded.length % 4)) % 4)}`;

    if (typeof Buffer !== "undefined") {
      return Buffer.from(withPadding, "base64").toString("utf8");
    }

    const binary = atob(withPadding);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}
