import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, googleProvider } from "../../utils/firebase";
import api from "../../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";

import { setUserdata } from "../redux/userSlice";
import SideBar from "../components/SideBar";
import ChatArea from "../components/ChatArea";
import Artifact from "../components/Artifact";

function Home() {
    const { userData } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    // =========================
    // LOGIN TO BACKEND
    // =========================
    const handleLogin = async (token) => {
        try {
            console.log("========== FRONTEND LOGIN ==========");
            console.log("Token exists:", !!token);

            if (!token) {
                console.error("Firebase token is missing");
                return;
            }

            const { data } = await api.post(
                "/api/auth/login",
                {
                    token: token,
                },
                {
                    withCredentials: true,
                }
            );

            console.log("Backend login successful:");
            console.log(data);

            dispatch(setUserdata(data));

        } catch (error) {
            console.error("========== FRONTEND LOGIN ERROR ==========");

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Response:",
                error.response?.data
            );

            console.error(
                "Message:",
                error.message
            );

            console.error("==========================================");
        }
    };

    // =========================
    // GOOGLE LOGIN
    // =========================
    const googleLogin = async () => {
        try {
            console.log("Starting Google login...");

            const result = await signInWithPopup(
                auth,
                googleProvider
            );

            console.log("Google login successful");
            console.log("User:", result.user);

            // Get Firebase ID token
            const token = await result.user.getIdToken();

            console.log(
                "Firebase ID token received:",
                !!token
            );

            // Send Firebase token to backend
            await handleLogin(token);

        } catch (error) {
            console.error("========== GOOGLE LOGIN ERROR ==========");
            console.error(error);
            console.error("========================================");
        }
    };

    return (
        <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden">

            <SideBar />

            <ChatArea />

            <Artifact />

            {!userData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">

                    <div className="w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">

                        <div className="flex flex-col gap-1">

                            <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight">
                                Welcome to CortexAI
                            </h2>

                            <p className="text-[13px] text-slate-500">
                                Please login to continue using the app.
                            </p>

                        </div>

                        <button
                            className="w-full flex items-center justify-center gap-3 py-[11px] rounded-xl text-sm font-medium text-black/90 bg-white hover:bg-gray-200 transition-all duration-150 cursor-pointer"
                            onClick={googleLogin}
                        >
                            <FcGoogle size={15} />
                            Continue With Google
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Home;