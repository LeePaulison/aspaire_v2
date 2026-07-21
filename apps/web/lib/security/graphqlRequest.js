export async function validateGraphqlRequest({ request, maxBodyBytes, production }) {
  if (production && request.method === "GET") {
    return { status: 405, message: "Method not allowed", headers: { Allow: "POST" } };
  }

  if (request.method !== "POST") return null;

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return { status: 415, message: "Content-Type must be application/json" };
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBodyBytes) {
    return { status: 413, message: "Request body too large", bodyBytes: contentLength };
  }

  const bodyBytes = (await request.clone().arrayBuffer()).byteLength;
  if (bodyBytes > maxBodyBytes) {
    return { status: 413, message: "Request body too large", bodyBytes };
  }

  return null;
}
