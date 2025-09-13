import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Preflight requests are handled by the cors middleware above
app.use(express.json({ limit: '20mb' }));
app.use(cookieParser())

// Import Routes
import userRouter from "./routes/users.routes.js";
import otpRouter from "./routes/otp.routes.js";


//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/otp", otpRouter);



app.get("/", (req, res) => {
  res.send("Hello World!");
});


// Error middleware (keep this last in the middleware chain)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export default app;