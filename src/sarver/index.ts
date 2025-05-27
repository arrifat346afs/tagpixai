export async function checkUserSubscription(email: string) {
  const apiKey =
    import.meta.env.VITE_DESKTOP_API_KEY || import.meta.env.DESKTOP_API_KEY;

  const endpoint = `${import.meta.env.VITE_BASE_URL}/api/check-session?email=${encodeURIComponent(email)}`;

  try {
    console.log("🌐 Sending GET request to:", endpoint);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response headers:", JSON.stringify([...response.headers], null, 2));

    const contentType = response.headers.get("content-type");
    console.log("📥 Response content-type:", contentType);

    if (!response.ok) {
      let errorMessage = "Unknown error";

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData, null, 2);
      } else {
        errorMessage = await response.text();
      }

      console.error("❌ API request failed with status", response.status);
      console.error("❌ Error body:\n", errorMessage);
      return null;
    }

    const data = await response.json();
    console.log("✅ Response data:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("🔥 Network or server error:", error);
    return null;
  }
}
