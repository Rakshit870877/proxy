// require("dotenv").config();

// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const https = require("https");

// const app = express();
// const PORT = process.env.PORT || 5001;

// // Create an Axios instance that ignores SSL certificate validation & sets a timeout
// const axiosInstance = axios.create({
//   httpsAgent: new https.Agent({
//     rejectUnauthorized: false, // Ignore SSL verification
//   }),
//   timeout: 90000, // Increase timeout to 30 seconds
// });

// // Middleware to log all incoming requests
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
//   if (req.method === "POST" || req.method === "PUT") {
//     console.log("Body:", JSON.stringify(req.body, null, 2)); // Log formatted body
//   }
//   next();
// });

// // Enable CORS for frontend requests
// app.use(cors({ origin: "*", credentials: true }));
// app.use(express.json()); // Parse JSON request body

// // Middleware to forward all requests to the Spring Boot backend
// app.use("/api", async (req, res) => {
//   try {
//     const backendURL = `https://79e4-220-158-136-242.ngrok-free.app${req.originalUrl}`;

//     // Remove the `host` header to prevent SSL issues
//     const headers = { ...req.headers };
//     delete headers.host;

//     // Forward request to the Spring Boot backend
//     const response = await axiosInstance({
//       method: req.method, // Forward the same HTTP method (GET, POST, etc.)
//       url: backendURL, // Forward the request to the backend
//       data: req.body, // Forward the request body
//       headers, // Forward necessary headers
//     });

//     console.log(`Response from backend (${response.status}):`, response.data);

//     // Send backend's response to the client
//     res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error forwarding request:", error.message);

//     if (error.code === "ECONNRESET") {
//       console.error("Connection reset by peer (backend may be down).");
//       return res
//         .status(502)
//         .json({ error: "Backend server is not responding." });
//     }

//     if (error.code === "ETIMEDOUT") {
//       console.error("Request timed out.");
//       return res
//         .status(504)
//         .json({ error: "Backend server took too long to respond." });
//     }

//     if (error.response) {
//       console.error(
//         "Backend error:",
//         error.response.status,
//         error.response.data
//       );
//       return res.status(error.response.status).json(error.response.data);
//     }

//     res.status(500).json({
//       error: "An unknown error occurred while processing your request.",
//     });
//   }
// });

// // Start the server
// app.listen(PORT, () => {
//   console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
// });

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const path = require("path");

const app = express();
const PORT = 5001;

const BACKEND_URL_API = "http://64.227.139.142:9091/api"; // ✅ This includes /api
const BACKEND_URL_BOB = "http://64.227.139.142:9000";

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  timeout: 90000,
});
// Serve frontend static files
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route: return index.html for React Router to handle routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (["POST", "PUT"].includes(req.method)) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Generic proxy
const proxyHandler =
  (backendBaseUrl, pathRewrite = null) =>
  async (req, res) => {
    try {
      const rewrittenPath = pathRewrite
        ? req.originalUrl.replace(pathRewrite.from, pathRewrite.to)
        : req.originalUrl;

      const targetURL = `${backendBaseUrl}${rewrittenPath}`;
      console.log("➡️ Forwarding to:", targetURL);

      const headers = { ...req.headers };
      delete headers.host;

      const response = await axiosInstance({
        method: req.method,
        url: targetURL,
        data: req.body,
        headers,
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      console.error("❌ Proxy error:", error.message);
      if (error.response) {
        console.error(
          "Backend error:",
          error.response.status,
          error.response.data
        );
        return res.status(error.response.status).json(error.response.data);
      }
      if (error.code === "ECONNRESET") {
        return res
          .status(502)
          .json({ error: "Backend server not responding." });
      }
      if (error.code === "ETIMEDOUT") {
        return res.status(504).json({ error: "Backend timeout." });
      }
      res.status(500).json({ error: "Unknown error." });
    }
  };

// 👇 Fix is here: strip only `/api` so `/kyc/auth/login` is sent to the backend
app.use(
  "/api",
  proxyHandler(BACKEND_URL_API, {
    from: /^\/api/,
    to: "",
  })
);

// Bob proxy
app.use(
  "/api2/bob",
  proxyHandler(BACKEND_URL_BOB, {
    from: /^\/api2\/bob/,
    to: "",
  })
);

// Health
app.get("/", (req, res) => res.send("Proxy is running."));

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
});

// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const https = require("https");

// const app = express();
// const PORT = 5001;

// // Hardcoded backend URLs
// const BACKEND_URL_API = "http://64.227.139.142:9091/";
// const BACKEND_URL_BOB = "http://64.227.139.142:9000";

// // Axios instance for SSL ignoring & timeout
// const axiosInstance = axios.create({
//   httpsAgent: new https.Agent({
//     rejectUnauthorized: false,
//   }),
//   timeout: 90000,
// });

// // Logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
//   if (["POST", "PUT"].includes(req.method)) {
//     console.log("Body:", JSON.stringify(req.body, null, 2));
//   }
//   next();
// });

// // Middleware
// app.use(cors({ origin: "*", credentials: true }));
// app.use(express.json());

// // 🔁 Generic proxy handler function
// const proxyHandler =
//   (backendBaseUrl, pathRewrite = null) =>
//   async (req, res) => {
//     try {
//       const rewrittenPath = pathRewrite
//         ? req.originalUrl.replace(pathRewrite.from, pathRewrite.to)
//         : req.originalUrl;

//       const targetURL = `${backendBaseUrl}${rewrittenPath}`;
//       console.log("➡️ Forwarding to:", targetURL);

//       const headers = { ...req.headers };
//       delete headers.host;

//       const response = await axiosInstance({
//         method: req.method,
//         url: targetURL,
//         data: req.body,
//         headers,
//       });

//       console.log(`✅ Response (${response.status})`);
//       res.status(response.status).json(response.data);
//     } catch (error) {
//       console.error("❌ Proxy error:", error.message);

//       if (error.code === "ECONNRESET") {
//         return res
//           .status(502)
//           .json({ error: "Backend server not responding." });
//       }
//       if (error.code === "ETIMEDOUT") {
//         return res.status(504).json({ error: "Backend server timed out." });
//       }
//       if (error.response) {
//         console.error(
//           "Backend error:",
//           error.response.status,
//           error.response.data
//         );
//         return res.status(error.response.status).json(error.response.data);
//       }

//       res.status(500).json({ error: "An unknown error occurred." });
//     }
//   };

// // 🌐 Routes

// // Route 1: Spring Boot via ngrok
// app.use("/api", proxyHandler(BACKEND_URL_API));

// // Route 2: Bob backend (strip /api2/bob)
// app.use(
//   "/api2/bob",
//   proxyHandler(BACKEND_URL_BOB, {
//     from: /^\/api2\/bob/,
//     to: "",
//   })
// );

// // Health check route
// app.get("/", (req, res) => {
//   res.send("✅ Proxy server is running!");
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Proxy running at http://localhost:${PORT}`);
// });
