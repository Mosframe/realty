// Configuration for API endpoints
// Change this to your deployed Render.com URL
const CONFIG = {
    // For Render.com deployment, use your actual URL like:
    // API_BASE_URL: 'https://your-app-name.onrender.com/api'
    // For local development:
    // API_BASE_URL: 'http://localhost:3000/api'
    API_BASE_URL: 'https://realty-api.onrender.com/api'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
