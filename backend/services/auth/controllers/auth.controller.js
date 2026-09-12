import crypto from "crypto";
import { getAuth } from "firebase-admin/auth";

import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import redis from "../../../shared/redis/redis.js";


// ========================================
// LOGIN
// ========================================
export const login = async (req, res) => {
    try {
        console.log("========================================");
        console.log("1. LOGIN CONTROLLER CALLED");
        console.log("========================================");

        const { token } = req.body;

        console.log("2. Token received:", !!token);

        // Check token
        if (!token) {
            console.log("❌ Firebase token is missing");

            return res.status(400).json({
                message: "Firebase token is required",
            });
        }

        console.log("3. Firebase token received");

        // ========================================
        // VERIFY FIREBASE TOKEN
        // ========================================

        console.log("4. Verifying Firebase token...");

        const decoded = await getAuth(app).verifyIdToken(token);

        console.log("5. Firebase token verified");
        console.log("Firebase UID:", decoded.uid);
        console.log("Firebase email:", decoded.email);

        // ========================================
        // FIND USER
        // ========================================

        console.log("6. Searching user in MongoDB...");

        let user = await User.findOne({
            firebaseUid: decoded.uid,
        });

        console.log("7. User exists:", !!user);

        // ========================================
        // CREATE USER
        // ========================================

        if (!user) {
            console.log("8. User does not exist");
            console.log("9. Creating new user...");

            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name || "User",
                email: decoded.email,
                avatar: decoded.picture || "",
            });

            console.log("10. User created successfully");
            console.log("User ID:", user._id);
        } else {
            console.log("8. Existing user found");
            console.log("User ID:", user._id);
        }

        // ========================================
        // CREATE SESSION
        // ========================================

        console.log("11. Creating session ID...");

        const sessionId = crypto.randomUUID();

        console.log("12. Session ID created");

        // ========================================
        // SAVE USER SESSION IN REDIS
        // ========================================

        console.log("13. Saving user session to Redis...");

        await redis.set(
            `user-session-${user._id}`,
            sessionId,
            "EX",
            7 * 24 * 60 * 60
        );

        console.log("14. User session saved in Redis");

        // ========================================
        // SAVE SESSION DATA
        // ========================================

        console.log("15. Saving session data to Redis...");

        await redis.set(
            `session-${sessionId}`,
            JSON.stringify({
                userId: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                plan: user.plan,
                credits: user.credits,
                totalCredits: user.totalCredits,
                planExpiresAt: user.planExpiresAt,
            }),
            "EX",
            7 * 24 * 60 * 60
        );

        console.log("16. Session data saved");

        // ========================================
        // CREATE COOKIE
        // ========================================

        console.log("17. Creating session cookie...");

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("18. Cookie created");

        // ========================================
        // SUCCESS
        // ========================================

        console.log("========================================");
        console.log("19. LOGIN SUCCESSFUL");
        console.log("========================================");

        return res.status(200).json(user);

    } catch (error) {

        console.error("========================================");
        console.error("❌ LOGIN ERROR");
        console.error("========================================");

        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);

        console.error("========================================");

        return res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
};


// ========================================
// LOGOUT
// ========================================
export const logOut = async (req, res) => {
    try {
        console.log("Logout request received");

        const sessionId = req.cookies?.session;

        if (sessionId) {
            await redis.del(`session-${sessionId}`);
        }

        res.clearCookie("session", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        return res.status(200).json({
            message: "Logout successfully",
        });

    } catch (error) {

        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            message: "Logout failed",
            error: error.message,
        });
    }
};


// ========================================
// UPDATE USER PAYMENT
// ========================================
export const updateUserPayment = async (req, res) => {
    try {

        const {
            plan,
            credits,
            userId,
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.plan = plan;

        user.credits += credits;

        user.totalCredits += credits;

        user.planExpiresAt = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        await user.save();

        const sessionId = await redis.get(
            `user-session-${user._id}`
        );

        console.log("sessionId:", sessionId);

        if (sessionId) {

            await redis.set(
                `session-${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    plan: user.plan,
                    credits: user.credits,
                    totalCredits: user.totalCredits,
                    planExpiresAt: user.planExpiresAt,
                }),
                "EX",
                7 * 24 * 60 * 60
            );
        }

        return res.status(200).json({
            success: true,
        });

    } catch (error) {

        console.error(
            "UPDATE PAYMENT ERROR:",
            error
        );

        return res.status(500).json({
            message: "Update payment failed",
            error: error.message,
        });
    }
};


// ========================================
// DEDUCT CREDITS
// ========================================
export const deductCredits = async (req, res) => {
    try {

        const {
            userId,
            agent,
        } = req.body;

        const COST = {
            chat: 1,
            search: 5,
            coding: 10,
            pdf: 10,
            ppt: 10,
            vision: 10,
        };

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        const requiredCredits = COST[agent] || 1;

        if (user.credits < requiredCredits) {
            return res.status(400).json({
                message: "Not enough credits.",
            });
        }

        user.credits -= requiredCredits;

        await user.save();

        const sessionId = await redis.get(
            `user-session-${user._id}`
        );

        console.log("sessionId:", sessionId);

        if (sessionId) {

            await redis.set(
                `session-${sessionId}`,
                JSON.stringify({
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    plan: user.plan,
                    credits: user.credits,
                    totalCredits: user.totalCredits,
                    planExpiresAt: user.planExpiresAt,
                }),
                "EX",
                7 * 24 * 60 * 60
            );
        }

        return res.status(200).json({
            success: true,
            credits: user.credits,
        });

    } catch (error) {

        console.error(
            "DEDUCT CREDITS ERROR:",
            error
        );

        return res.status(500).json({
            message: "Deduct credits failed",
            error: error.message,
        });
    }
};