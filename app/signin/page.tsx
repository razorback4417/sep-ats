// app/signin/page.tsx

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Sign in to SEP ATS
        </h1>
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
