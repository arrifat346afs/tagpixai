/**
 * Utility functions for tracking model usage
 */

import { ModelUsageData } from "@/api/modelUsage";

/**
 * Send model usage data to the server
 * @param modelName Name of the model used
 * @param imageCount Number of images generated
 * @returns Promise with the result of the operation
 */
export async function sendModelUsage(
  modelName: string,
  imageCount: number
): Promise<any> {
  try {
    // Get the user email from localStorage
    const userEmail = localStorage.getItem("userEmail");

    // Create the model usage data object
    const modelUsageData: ModelUsageData = {
      modelName,
      imageCount,
      userId: userEmail || undefined, // Include user ID if available
      date: new Date().toISOString(),
    };

    // Send the data to the main process via IPC
    const result = await window.electron.sendModelUsage(modelUsageData);
    return result;
  } catch (error) {
    console.error("Error sending model usage data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all model usage data
 * @returns Promise with the model usage data
 */
export async function getModelUsage(): Promise<any> {
  try {
    const result = await window.electron.getModelUsage();
    return result;
  } catch (error) {
    console.error("Error getting model usage data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Clear all model usage data
 * @returns Promise with the result of the operation
 */
export async function clearModelUsage(): Promise<any> {
  try {
    const result = await window.electron.clearModelUsage();
    return result;
  } catch (error) {
    console.error("Error clearing model usage data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
