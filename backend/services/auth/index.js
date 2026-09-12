import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/db.js";
import router from "./routes/auth.route.js";

dotenv.config();

const port = process.env.PORT || 8001;

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", router);

app.get("/", (req, res) => {
    res.json({
        message: "hello from auth",
    });
});

app.listen(port, () => {
    console.log(`auth started at ${port}`);

    connectDb();
});