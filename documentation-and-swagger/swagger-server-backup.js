const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.SWAGGER_PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Load OpenAPI specifications
const loadSwaggerSpec = (filePath) => {
  try {
    return YAML.load(filePath);
  } catch (error) {
    console.error(
      `Error loading swagger spec from ${filePath}:`,
      error.message
    );
    return null;
  }
};

// Load API specifications
const chatsServiceSpec = loadSwaggerSpec(
  path.join(__dirname, "docs", "chats-service-api.yaml")
);

// Serve the simple API tester on root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "api-tester.html"));
});

// Custom CSS for better UI styling
const customCss = `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info { margin: 20px 0 }
  .swagger-ui .scheme-container { 
    margin: 20px 0 30px 0; 
    padding: 20px; 
    background: #f7f7f7; 
    border-left: 5px solid #007bff; 
  }
  .swagger-ui .info .title {
    font-size: 2em;
    margin-bottom: 10px;
  }
  .swagger-ui .info .description {
    font-size: 1.1em;
    line-height: 1.6;
  }
  .swagger-ui .auth-wrapper {
    background: #fff3cd !important;
    border: 2px solid #ffeaa7 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    margin: 20px 0 !important;
  }
  .swagger-ui .auth-wrapper .auth-container .auth-btn-wrapper {
    text-align: center;
    margin-top: 15px;
  }
  .swagger-ui .btn.authorize {
    background: #28a745 !important;
    border-color: #28a745 !important;
    font-size: 1.1em !important;
    padding: 10px 20px !important;
  }
  .swagger-ui .btn.authorize:hover {
    background: #218838 !important;
    border-color: #1e7e34 !important;
  }
  .api-key-banner {
    background: linear-gradient(45deg, #007bff, #28a745);
    color: white;
    padding: 20px;
    text-align: center;
    margin-bottom: 0;
    font-size: 1.1em;
    font-weight: 500;
  }
  .api-key-banner code {
    background: rgba(255,255,255,0.2);
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 1.1em;
    font-weight: bold;
  }
  .service-nav { 
    background: #f8f9fa; 
    padding: 15px; 
    margin-bottom: 20px; 
    border-radius: 5px;
    border: 1px solid #dee2e6;
    text-align: center;
  }
  .service-nav h3 { 
    margin: 0 0 10px 0; 
    color: #495057; 
    font-size: 1.2em;
  }
  .service-nav a { 
    display: inline-block; 
    margin: 5px 10px 5px 0; 
    padding: 8px 16px; 
    background: #007bff; 
    color: white; 
    text-decoration: none; 
    border-radius: 4px;
    font-weight: 500;
  }
  .service-nav a:hover { 
    background: #0056b3; 
    text-decoration: none; 
  }
  .service-nav a.active { 
    background: #28a745; 
  }
`; 
    font-size: 1.2em;
  }
  .service-nav a { 
    display: inline-block; 
    margin: 5px 10px 5px 0; 
    padding: 8px 16px; 
    background: #007bff; 
    color: white; 
    text-decoration: none; 
    border-radius: 4px;
    font-weight: 500;
  }
  .service-nav a:hover { 
    background: #0056b3; 
    text-decoration: none; 
  }
  .service-nav a.active { 
    background: #28a745; 
  }
`;

const swaggerOptions = {
  customCss,
  customSiteTitle: "Microservices API Documentation",
  swaggerOptions: {
    urls: [
      {
        url: "/api-docs/chats-service.json",
        name: "Chat Storage Service",
      },
      // { url: '/api-docs/user-service.json', name: 'User Management Service' }
    ],
  },
};

// Routes for individual API specifications
app.get("/api-docs/chats-service.json", (req, res) => {
  if (chatsServiceSpec) {
    res.json(chatsServiceSpec);
  } else {
    res.status(500).json({ error: "Chat service specification not available" });
  }
});

// Landing page with service navigation
app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Microservices API Documentation Hub</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          color: #333;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .header {
          background: #2c3e50;
          color: white;
          padding: 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5em;
          font-weight: 600;
        }
        .header p {
          margin: 0;
          font-size: 1.2em;
          opacity: 0.9;
        }
        .content {
          padding: 40px;
        }
        .api-key-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
          margin: 0 0 30px 0;
          border-left: 5px solid #f39c12;
        }
        .api-key-notice h3 {
          margin: 0 0 10px 0;
          color: #856404;
          font-size: 1.3em;
        }
        .api-key-value {
          background: #2c3e50;
          color: #ecf0f1;
          padding: 15px;
          border-radius: 6px;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 1.1em;
          margin: 10px 0;
          word-break: break-all;
          border: 2px dashed #34495e;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
        .service-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 30px;
          background: #fafafa;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .service-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .service-card h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
          font-size: 1.4em;
        }
        .service-card p {
          margin: 0 0 20px 0;
          color: #666;
          line-height: 1.6;
        }
        .btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          text-align: center;
          transition: all 0.3s ease;
          font-size: 1em;
          min-width: 140px;
        }
        .btn-primary {
          background: #3498db;
          color: white;
        }
        .btn-primary:hover {
          background: #2980b9;
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: #95a5a6;
          color: white;
        }
        .btn-secondary:hover {
          background: #7f8c8d;
          transform: translateY(-2px);
        }
        .btn-success {
          background: #27ae60;
          color: white;
        }
        .btn-success:hover {
          background: #229954;
          transform: translateY(-2px);
        }
        .footer {
          text-align: center;
          padding: 30px;
          color: #7f8c8d;
          border-top: 1px solid #ecf0f1;
          margin-top: 40px;
        }
        .icon {
          font-size: 1.2em;
          margin-right: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 API Documentation Hub</h1>
          <p>Comprehensive documentation and testing for all microservices</p>
        </div>
        
        <div class="content">
          <div class="api-key-notice">
            <h3>🔑 API Authentication Required</h3>
            <p>All APIs require authentication using the <code>x-api-key</code> header. Use this example key for testing:</p>
            <div class="api-key-value">test-api-key-12345</div>
            <p><strong>Header:</strong> <code>x-api-key: test-api-key-12345</code></p>
            <p><strong>Also Required:</strong> <code>Unique-Reference-Code</code> header (can use: REQ-123456789)</p>
          </div>

          <div class="services-grid">
            <div class="service-card">
              <h3>📝 Chat Storage Service</h3>
              <p>Manage chat sessions, messages, and favorites. Provides RESTful endpoints for creating sessions, adding messages, and retrieving chat history with pagination support.</p>
              
              <div class="btn-group">
                <a href="/docs" class="btn btn-primary">
                  <span class="icon">📚</span>Swagger UI Docs
                </a>
                <a href="/api-tester" class="btn btn-success">
                  <span class="icon">🧪</span>Interactive Tester
                </a>
              </div>
            </div>

            <div class="service-card">
              <h3>🔧 API Testing Tools</h3>
              <p>Choose your preferred testing method. Swagger UI provides standard OpenAPI documentation, while our custom tester offers a simplified interface with guaranteed response display.</p>
              
              <div class="btn-group">
                <a href="/docs" class="btn btn-secondary">
                  <span class="icon">📋</span>Standard Docs
                </a>
                <a href="/api-tester" class="btn btn-primary">
                  <span class="icon">⚡</span>Custom Tester
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>💡 <strong>Tip:</strong> The custom API tester is recommended for reliable response display and ease of use.</p>
          <p>🏗️ Chat Storage Microservice Documentation - v1.0.0</p>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Serve the custom API tester
app.get("/api-tester", (req, res) => {
  res.sendFile(path.join(__dirname, "api-tester.html"));
});
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Microservices API Documentation Hub</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5; 
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            h1 { 
                color: #333; 
                border-bottom: 3px solid #007bff; 
                padding-bottom: 10px; 
                margin-bottom: 30px;
            }
            .service-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 20px; 
                margin-top: 30px; 
            }
            .service-card { 
                border: 1px solid #ddd; 
                border-radius: 8px; 
                padding: 20px; 
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .service-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .service-card h3 { 
                margin: 0 0 10px 0; 
                color: #007bff; 
            }
            .service-card p { 
                color: #666; 
                margin: 10px 0; 
                line-height: 1.5;
            }
            .service-card a { 
                display: inline-block; 
                background: #007bff; 
                color: white; 
                padding: 10px 20px; 
                text-decoration: none; 
                border-radius: 4px; 
                margin-top: 10px;
                font-weight: 500;
            }
            .service-card a:hover { 
                background: #0056b3; 
            }
            .status { 
                display: inline-block; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 0.8em; 
                font-weight: 500;
                margin-left: 10px;
            }
            .status.available { 
                background: #d4edda; 
                color: #155724; 
            }
            .status.coming-soon { 
                background: #fff3cd; 
                color: #856404; 
            }
            .info-section {
                background: #e7f3ff;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                border-left: 4px solid #007bff;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                color: #666;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Microservices API Documentation Hub</h1>
            
            <div class="info-section">
                <h3>📖 Welcome to the API Documentation Center</h3>
                <p>This hub provides comprehensive documentation for all microservices in our architecture. Each service includes detailed endpoint specifications, request/response schemas, authentication requirements, and interactive testing capabilities.</p>
                <p><strong>Features:</strong></p>
                <ul>
                    <li>Interactive API testing with Swagger UI</li>
                    <li>Complete request/response examples</li>
                    <li>Authentication and rate limiting documentation</li>
                    <li>Error code reference and troubleshooting guides</li>
                </ul>
            </div>

            <div class="service-grid">
                <div class="service-card">
                    <h3>💬 Chat Storage Service <span class="status available">Available</span></h3>
                    <p><strong>Port:</strong> 3002</p>
                    <p>RAG Chat Storage microservice for managing chat sessions and messages. Provides persistence for user conversations, message history, and session management with encryption and rate limiting.</p>
                    <p><strong>Key Features:</strong></p>
                    <ul>
                        <li>Create and manage chat sessions</li>
                        <li>Store encrypted message content</li>
                        <li>Paginated message retrieval</li>
                        <li>Session favoriting and organization</li>
                    </ul>
                    <a href="/docs/chats-service">View Documentation</a>
                </div>

                <div class="service-card">
                    <h3> User Management Service <span class="status coming-soon">Coming Soon</span></h3>
                    <p><strong>Port:</strong> 3004</p>
                    <p>Comprehensive user management system handling user profiles, preferences, and account operations.</p>
                    <p><strong>Planned Features:</strong></p>
                    <ul>
                        <li>User registration and profiles</li>
                        <li>Account management</li>
                        <li>Preference settings</li>
                        <li>User data export/import</li>
                    </ul>
                    <a href="#" style="background: #6c757d; cursor: not-allowed;">Documentation Coming Soon</a>
                </div>
            </div>

            <div class="footer">
                <p>API Documentation Hub v1.0.0 | Last updated: ${new Date().toLocaleDateString()}</p>
                <p>For technical support or API questions, please contact the development team.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  res.send(html);
});

// Swagger UI for Chat Service
app.use(
  "/docs/chats-service",
  swaggerUi.serveFiles(chatsServiceSpec),
  swaggerUi.setup(chatsServiceSpec, {
    customSiteTitle: "Chat Storage Service API",
    customCss: customCss,
    explorer: true,
    customJsStr: `
      window.onload = function() {
        window.ui = SwaggerUIBundle({
          url: '/api-docs/chats-service.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          validatorUrl: null,
          tryItOutEnabled: true,
          displayRequestDuration: true,
          docExpansion: "list",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'],
          requestInterceptor: function(request) {
            console.log('Swagger Request:', request);
            return request;
          },
          responseInterceptor: function(response) {
            console.log('Swagger Response:', response);
            return response;
          }
        });
      };
    `,
    swaggerOptions: {
      docExpansion: "list",
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      supportedSubmitMethods: [
        "get",
        "post",
        "put",
        "delete",
        "patch",
        "head",
        "options",
      ],
      validatorUrl: null,
    },
  })
);

// Main Swagger UI with service selector
app.use("/docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "swagger-documentation-hub",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    availableServices: {
      "chats-service": chatsServiceSpec ? "available" : "unavailable",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
    availableEndpoints: [
      "/",
      "/docs",
      "/docs/chats-service",
      "/api-docs/chats-service.json",
      "/health",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Swagger server error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log("🚀 Microservices Documentation Hub started successfully!");
  console.log("");
  console.log("📖 Available Documentation:");
  console.log(`   • Main Hub: http://localhost:${PORT}/`);
  console.log(`   • Chat Service: http://localhost:${PORT}/docs/chats-service`);
  console.log(`   • All Services: http://localhost:${PORT}/docs`);
  console.log(`   • Health Check: http://localhost:${PORT}/health`);
  console.log("");
  console.log("💡 Tips:");
  console.log("   • Use the main hub to navigate between services");
  console.log("   • Each service has dedicated documentation with examples");
  console.log("   • Interactive testing is available for all endpoints");
  console.log("");
  console.log(`📊 Server running on port ${PORT}`);

  // Display available specifications
  console.log("");
  console.log("📋 Loaded API Specifications:");
  console.log(
    `   • Chat Service: ${
      chatsServiceSpec ? "✅ Available" : "❌ Failed to load"
    }`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📄 Swagger documentation server shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📄 Swagger documentation server shutting down gracefully...");
  process.exit(0);
});
