// Simple API endpoint implementation for model usage tracking
// This is a placeholder implementation for testing purposes

// In-memory storage for model usage data
let modelUsageData = [];

// Handle HTTP requests
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request - return all model usage data
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: modelUsageData
    });
  }
  
  // Handle POST request - add new model usage data
  if (req.method === 'POST') {
    try {
      const data = req.body;
      
      // Validate required fields
      if (!data.modelName || !data.imageCount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: modelName and imageCount are required'
        });
      }
      
      // Add timestamp if not provided
      if (!data.date) {
        data.date = new Date().toISOString();
      }
      
      // Add to storage
      modelUsageData.push(data);
      
      return res.status(200).json({
        success: true,
        message: 'Model usage data recorded successfully'
      });
    } catch (error) {
      console.error('Error processing model usage data:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
  
  // Handle DELETE request - clear all model usage data
  if (req.method === 'DELETE') {
    modelUsageData = [];
    return res.status(200).json({
      success: true,
      message: 'All model usage data cleared'
    });
  }
  
  // Handle unsupported methods
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
