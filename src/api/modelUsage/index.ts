
export async function sendModelUsage(modelUsageData: any): Promise<any> {
    const endpoint = `${import.meta.env.VITE_BASE_URL}/api/model-usage`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_DESKTOP_API_KEY || import.meta.env.DESKTOP_API_KEY,
      },
      body: JSON.stringify(modelUsageData),
    });
    console.log("📥 Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending model usage data:", error);
    throw error;
  }
}
