// app/signin/page.tsx

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-100">
      <div className="p-8 max-w-sm w-full bg-gray-900 shadow-lg rounded-lg border border-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">
          Sign in to SEP ATS
        </h1>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}