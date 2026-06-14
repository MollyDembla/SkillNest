import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 — Not Found</h1>
        <p className="mb-6">The page you are looking for does not exist.</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded">
          Go Home
        </Link>
      </div>
    </div>
  );
}
