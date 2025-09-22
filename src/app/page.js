"use client";
import { useState } from "react";

export default function Home() {
  const [fromEmail, setFromEmail] = useState("");
  const [emailData, setEmails] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState(false);

  const fetchEmails = async () => {
    setFetching(true);
    const res = await fetch(`/api/fetch-mails?from=${fromEmail}`);
    setFetchedData(true);
    setFetching(false);
    if (res.status === 404) {
      setEmails(null);
      return;
    }
    const data = await res.json();
    setEmails(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-400 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-[800px] bg-white dark:bg-gray-950 shadow-lg rounded-2xl px-8 py-10">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-5 tracking-tight">
          BOB Store Household Update Netflix.
        </h2>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
          >
            Your Email
          </label>
          <input
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="Enter Email"
            type="email"
            id="email"
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 transition-shadow shadow-sm focus:shadow-lg disabled:opacity-60"
            required
          />
        </div>

        <button
          type="submit"
          onClick={fetchEmails}
          disabled={fetching || !fromEmail}
          className={`w-full inline-flex items-center justify-center px-5 py-3 mt-1 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900 rounded-xl transition-colors duration-150 ${
            fetching || !fromEmail ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {fetching ? (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            "Submit"
          )}
        </button>

        {fetchedData && !fetching && !emailData && (
          <div
            className="p-4 mt-6 mb-4 text-base text-red-700 bg-red-100 border border-red-300 rounded-xl dark:bg-gray-900 dark:text-red-400 dark:border-red-900 flex items-center gap-2"
            role="alert"
          >
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
              ></path>
            </svg>
            <span className="font-bold">Alert:</span> No emails found in last 15
            minutes. Please try again.
          </div>
        )}

        {emailData && !fetching && fetchedData && (
          <div className="mt-8">
            <div className="bg-blue-50 dark:bg-gray-900 border border-blue-200 dark:border-blue-900 rounded-xl p-5 shadow-inner">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-2">
                Email Details:
              </p>
              <p className="mb-1">
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  From:
                </span>{" "}
                <span>
                  {emailData.headers.find((h) => h.name === "From")?.value}
                </span>
              </p>
              <p className="mb-1">
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  To:
                </span>{" "}
                <span>
                  {emailData.headers.find((h) => h.name === "To")?.value}
                </span>
              </p>
              <p className="mb-2">
                <span className="font-bold text-gray-800 dark:text-gray-100">
                  Subject:
                </span>{" "}
                <span>
                  {emailData.headers.find((h) => h.name === "Subject")?.value}
                </span>
              </p>
              <div className="w-full max-w-[800px] mx-auto bg-white dark:bg-gray-900 rounded-xl shadow">
                <div
                  className="w-full max-w-[800px] prose prose-sm dark:prose-invert max-w-none overflow-x-scroll"
                  dangerouslySetInnerHTML={{ __html: emailData.body }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
