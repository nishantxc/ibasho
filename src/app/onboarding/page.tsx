// src/app/onboarding/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../../supabase/Supabase";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";


// --- AVATAR OPTIONS (add your own images/SVGs in public/) ---
const AVATARS = [
  { key: "window", src: "/another.png", label: "Window with rain" },
  { key: "books", src: "/japanese.png", label: "Books & tea" },
  { key: "hands", src: "/scar.png", label: "Hands holding light" },
  { key: "globe", src: "/board.jpg", label: "Soft globe" },
  { key: "sunset", src: "/hailuo.png", label: "Sunset" },
];

// --- SOFT USERNAME GENERATOR ---
// const SOFT_NAMES = [
//   "softsunset", "bluewindow", "quietstorm", "gentleleaf", "warmtea", "dawnlight", "sagecloud"
// ];
// function generateUsername() {
//   return SOFT_NAMES[Math.floor(Math.random() * SOFT_NAMES.length)];
// }

// --- USERNAME VALIDATION ---
function validateUsername(username: string) {
  return /^[a-z0-9_]+$/.test(username);
}

export default function OnboardingPage() {
  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState(true);
  const [usernameUnique, setUsernameUnique] = useState(true);
  const [checking, setChecking] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.users.createUser({
        username: username,
        bio: "",
        avatar: avatar,
      });
      console.log("User created:", response);
      router.push('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
      return;
    }

    if (!username || !validateUsername(username)) {
      setUsernameValid(false);
      setError("Please enter a valid username.");
      return;
    }
    if (!usernameUnique) {
      setError("That username is taken.");
      return;
    }
    if (!avatar) {
      setError("Please select an avatar.");
      return;
    }
    // Save to Supabase (replace with your logic)
    // await supabase.from("profiles").insert([{ username, avatar }]);
    setSuccess(true);
  };

  // Visuals
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f7ede2] via-[#e9ecef] to-[#d6e2e9] relative">
      {/* Moodboard background (optional: add more images, blur, etc.) */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <Image
          src="/quan.jpg"
          alt="Moodboard"
          fill
          style={{ objectFit: "cover" }}
          className="blur-sm"
        />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto bg-white/80 rounded-3xl shadow-xl p-8 flex flex-col items-center">
        {/* Headings */}
        <h1 className="font-serif text-3xl text-[#7d5a50] mb-2">✨ Welcome Home</h1>
        <p className="font-sans text-lg text-[#7d5a50] mb-6 text-center">
          Create a space that feels like <em>you</em>
        </p>

        {/* Form */}
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block font-serif text-[#7d5a50] mb-1">
              Choose your Ibasho name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className={`w-full text-[#7d5a50] rounded-xl border px-4 py-2 font-sans text-lg bg-[#f7ede2] focus:outline-none focus:ring-2 focus:ring-[#b39286] transition ${
                  !usernameValid || !usernameUnique ? "border-red-400" : "border-[#e9ecef]"
                }`}
                placeholder="enter your username"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setUsernameValid(true);
                  setError("");
                }}
                maxLength={20}
                autoFocus
              />
              {/* <button
                type="button"
                className="rounded-lg px-3 py-2 bg-[#e9ecef] text-[#7d5a50] font-sans text-sm hover:bg-[#d6e2e9] transition"
                onClick={() => setUsername(generateUsername())}
                tabIndex={-1}
              >
                Generate
              </button> */}
            </div>
            <div className="text-xs mt-1 text-[#b39286]">
              Only lowercase letters, numbers, and underscores.
            </div>
            {!usernameValid && (
              <div className="text-xs text-red-500 mt-1">Invalid username format.</div>
            )}
            {!usernameUnique && (
              <div className="text-xs text-red-500 mt-1">Username is taken.</div>
            )}
            {checking && (
              <div className="text-xs text-gray-400 mt-1">Checking availability…</div>
            )}
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block font-serif text-[#7d5a50] mb-2">
              Pick the mood that represents you
            </label>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map(a => (
                <button
                  type="button"
                  key={a.key}
                  className={`rounded-2xl p-2 border-2 transition-all bg-[#f7ede2] flex flex-col items-center justify-center shadow-sm
                    ${
                      avatar === a.key
                        ? "border-[#b39286] ring-2 ring-[#b39286] scale-105"
                        : "border-transparent hover:border-[#b39286]/50 hover:scale-105"
                    }`}
                  onClick={() => setAvatar(a.key)}
                  tabIndex={0}
                  aria-label={a.label}
                >
                  <Image
                    src={a.src}
                    alt={a.label}
                    width={64}
                    height={64}
                    className="mb-1"
                  />
                  <span className="text-xs text-[#7d5a50]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          {/* Continue Button */}
          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-2xl bg-[#b39286] text-white font-serif text-lg shadow-lg hover:bg-[#a1745e] transition-all"
            disabled={checking || !username || !avatar}
          >
            Claim Your Space
          </button>
        </form>

        {/* Optional note */}
        <div className="mt-4 text-xs text-[#b39286] text-center">
          You’ll be able to change these later.
        </div>

        {/* Success message */}
        {success && (
          <div className="mt-4 text-green-600 text-center font-serif">
            🎉 Welcome to Ibasho!
          </div>
        )}
      </div>
    </div>
  );
}