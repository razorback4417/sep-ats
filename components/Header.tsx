// components/Header.tsx

"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Menu } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="SEP Logo" className="h-8 w-auto" />
            <span className="text-xl font-semibold text-white">SEP ATS</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white">
              Dashboard
            </Link>
            <Link href="/applicant-search" className="text-sm font-medium text-gray-300 hover:text-white">
              Search Applicants
            </Link>
            {session ? (
              <button
                onClick={() => signOut()}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-600"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signin"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                Sign in
              </Link>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              Dashboard
            </Link>
            <Link href="/applicant-search" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
              Search Applicants
            </Link>
            {session ? (
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/signin"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-500"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}