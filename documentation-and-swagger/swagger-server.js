const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

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

const swaggerOptions = {
  customCss,
  customSiteTitle: "Microservices API Documentation",
  swaggerOptions: {
    urls: [
      {
        url: "/api-docs/chats-service.json",
        name: "Chat Storage Service",
      },
    ],
    validatorUrl: null,
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
      <title>API Documentation Hub</title>
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background: #f8fafc;
          color: #334155;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }
        
        .subtitle {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
        }
        
        .api-key-notice {
          background: white;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #f59e0b;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .api-key-notice h3 {
          margin: 0 0 1rem 0;
          color: #92400e;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .api-key-value {
          background: #1e293b;
          color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 0.95rem;
          margin: 1rem 0;
          word-break: break-all;
        }
        
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .service-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 2rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .service-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .service-card h3 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .service-card p {
          margin: 0 0 1.5rem 0;
          color: #64748b;
          line-height: 1.6;
        }
        
        .btn-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 500;
          text-align: center;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          flex: 1;
          justify-content: center;
          min-width: 140px;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        
        .btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #4b5563;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
        }
        
        .btn-success {
          background: #059669;
          color: white;
        }
        
        .btn-success:hover {
          background: #047857;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        
        footer {
          text-align: center;
          padding: 2rem 0;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          margin-top: 3rem;
        }
        
        .icon {
          font-size: 1.1em;
          margin-right: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .btn-group {
            flex-direction: column;
          }
          
          .btn {
            flex: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>API Documentation Hub</h1>
          <p class="subtitle">Simple and elegant documentation for all microservices</p>
        </header>
        
        <div class="api-key-notice">
          <h3>🔑 Authentication Required</h3>
          <p>All APIs require authentication using the <code>x-api-key</code> header:</p>
          <div class="api-key-value">dev-api-key-2024</div>
          <p><strong>Required Headers:</strong></p>
          <ul>
            <li><code>x-api-key: dev-api-key-2024</code></li>
            <li><code>Unique-Reference-Code: REQ-123456789</code></li>
          </ul>
        </div>

        <div class="services-grid">
          <div class="service-card">
            <h3>📝 Chat Storage Service</h3>
            <p>Manage chat sessions, messages, and favorites. RESTful endpoints for creating sessions, adding messages, and retrieving chat history.</p>
            
            <div class="btn-group">
              <a href="/docs" class="btn btn-primary">
                <span class="icon">📚</span>Swagger UI
              </a>
              <a href="/api-tester" class="btn btn-success">
                <span class="icon">🧪</span>API Tester
              </a>
            </div>
          </div>

          <div class="service-card">
            <h3>🔧 Testing Options</h3>
            <p>Choose your preferred testing method. Swagger UI for standard documentation or our custom tester for a simplified experience.</p>
            
            <div class="btn-group">
              <a href="/docs" class="btn btn-secondary">
                <span class="icon">📋</span>Standard Docs
              </a>
              <a href="/api-tester" class="btn btn-primary">
                <span class="icon">⚡</span>Simple Tester
              </a>
            </div>
          </div>

          <div class="service-card">
            <h3>🧪 Test Reports</h3>
            <p>View comprehensive automation test results with detailed reports, trace files, and performance metrics.</p>
            
            <div class="btn-group">
              <a href="/test-reports" class="btn btn-success" target="_blank">
                <span class="icon">📊</span>View Reports
              </a>
              <a href="/run-tests" class="btn btn-secondary">
                <span class="icon">▶️</span>Run Tests
              </a>
            </div>
          </div>
        </div>

        <footer>
          <p>💡 <strong>Tip:</strong> The custom API tester provides a simplified interface with guaranteed response display.</p>
          <p>Chat Storage Microservice Documentation • v1.0.0</p>
        </footer>
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

// Serve Playwright test reports
app.use("/test-reports", express.static(path.join(__dirname, "../automation/playwright-report")));

// Test reports route
app.get("/test-reports", (req, res) => {
  const reportPath = path.join(__dirname, "../automation/playwright-report/index.html");
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).json({
      error: "Test reports not found",
      message: "Please run the tests first to generate reports: npm test",
      hint: "Run 'cd automation && npm test' to generate test reports"
    });
  }
});

// Run tests endpoint
app.post("/run-tests", async (req, res) => {
  const { spawn } = require('child_process');
  const axios = require('axios');
  
  try {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*'
    });
    
    res.write('🚀 Starting automation tests...\n\n');
    
    // Check if chat service is ready before running tests
    res.write('⏳ Checking service readiness...\n');
    
    try {
      const healthResponse = await axios.get('http://localhost:3002/chats-service/api/v1/health', {
        headers: {
          'x-api-key': 'dev-api-key-2024',
          'Unique-Reference-Code': 'ui-test-runner-health-check'
        },
        timeout: 5000
      });
      
      if (healthResponse.status === 200) {
        res.write('✅ Chat service is ready!\n\n');
      } else {
        throw new Error(`Service not ready: ${healthResponse.status}`);
      }
    } catch (healthError) {
      res.write(`❌ Service health check failed: ${healthError.message}\n`);
      res.write('🔧 Please ensure all services are running with: docker-compose up -d\n');
      res.write('⏳ Waiting a bit longer for services to start...\n\n');
      
      // Wait a bit and try to continue anyway
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const testProcess = spawn('npm', ['test'], {
      cwd: path.join(__dirname, '../automation'),
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    testProcess.stdout.on('data', (data) => {
      res.write(data);
    });
    
    testProcess.stderr.on('data', (data) => {
      res.write(`ERROR: ${data}`);
    });
    
    testProcess.on('close', (code) => {
      res.write(`\n\n✅ Tests completed with exit code: ${code}\n`);
      res.write(`📊 View detailed reports at: /test-reports\n`);
      res.end();
    });
    
    testProcess.on('error', (error) => {
      res.write(`\n❌ Failed to start test process: ${error.message}\n`);
      res.end();
    });
    
  } catch (error) {
    res.status(500).json({
      error: "Failed to run tests",
      message: error.message
    });
  }
});

// UI for running tests
app.get("/run-tests", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Run API Tests</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 0.75rem;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .btn {
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          margin-right: 1rem;
        }
        .btn:hover {
          background: #2563eb;
        }
        .btn-success {
          background: #059669;
        }
        .btn-success:hover {
          background: #047857;
        }
        #output {
          background: #1e293b;
          color: #f1f5f9;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-top: 1rem;
          font-family: monospace;
          white-space: pre-wrap;
          max-height: 500px;
          overflow-y: auto;
          display: none;
        }
        .loading {
          display: none;
          color: #3b82f6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧪 API Test Runner</h1>
        <p>Run comprehensive automation tests for the Chat Service API</p>
        
        <button onclick="runTests()" class="btn" id="runBtn">
          ▶️ Run All Tests
        </button>
        
        <a href="/test-reports" class="btn btn-success" target="_blank">
          📊 View Last Report
        </a>
        
        <a href="/" class="btn" style="background: #6b7280;">
          🏠 Back to Hub
        </a>
        
        <div class="loading" id="loading">
          🔄 Running tests... This may take a few minutes.
        </div>
        
        <div id="output"></div>
      </div>
      
      <script>
        async function runTests() {
          const runBtn = document.getElementById('runBtn');
          const loading = document.getElementById('loading');
          const output = document.getElementById('output');
          
          runBtn.disabled = true;
          runBtn.textContent = '⏳ Running...';
          loading.style.display = 'block';
          output.style.display = 'block';
          output.textContent = '';
          
          try {
            const response = await fetch('/run-tests', {
              method: 'POST'
            });
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const text = decoder.decode(value);
              output.textContent += text;
              output.scrollTop = output.scrollHeight;
            }
          } catch (error) {
            output.textContent += 'Error: ' + error.message;
          } finally {
            runBtn.disabled = false;
            runBtn.textContent = '▶️ Run All Tests';
            loading.style.display = 'none';
          }
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

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
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "/",
      "/docs",
      "/api-tester",
      "/test-reports",
      "/run-tests",
      "/health",
      "/api-docs/chats-service.json",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Documentation Hub running on http://localhost:${PORT}`);
  console.log(`📚 Swagger UI available at: http://localhost:${PORT}/docs`);
  console.log(`🧪 Custom API Tester at: http://localhost:${PORT}/api-tester`);
  console.log(`🏠 Documentation Hub at: http://localhost:${PORT}/`);

  if (chatsServiceSpec) {
    console.log("✅ Chat Service API specification loaded successfully");
  } else {
    console.log("⚠️  Chat Service API specification failed to load");
  }
});
