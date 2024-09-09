// components/Header.tsx

"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          SEP ATS
        </Link>
        <nav>
          <Link href="/dashboard" className="mr-4">
            Dashboard
          </Link>
          <Link href="/applicant-search" className="mr-4">
            Search Applicants
          </Link>
          {session ? (
            <>
              <span className="mr-4">Hello, {session.user?.name}</span>
              <button onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <Link
              href="/signin"
              className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-100"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
