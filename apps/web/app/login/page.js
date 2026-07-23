"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export default function LoginPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const githubEnabled = process.env.NEXT_PUBLIC_ENABLE_GITHUB_AUTH === "true";
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== "false";

  async function handleLogin({ provider }) {
    await authClient.signIn.social({
      provider: provider,
      callbackURL: "/chat",
    });
  }

  useEffect(() => {
    if (!session) return;

    if (session.user) {
      router.replace("/chat");
    }
  }, [session, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-360 items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Saigely</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A modern AI workspace featuring configurable AI models, persistent
            conversation history, and technical problem solving.
          </p>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-surface p-4">
          <h2 className="mb-2 text-sm font-semibold">Features</h2>

          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Real-time response streaming</li>
            <li>Persistent conversation history</li>
            <li>Multiple AI models</li>
            <li>Configurable reasoning, verbosity & temperature</li>
            <li>Markdown & code support</li>
            <li>Secure OAuth authentication</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          {githubEnabled ? (
            <button
              onClick={() => handleLogin({ provider: "github" })}
              className="rounded-md border border-ring px-4 py-3 hover:bg-surface cursor-pointer"
            >
              Continue with GitHub
            </button>
          ) : null}

          {googleEnabled ? (
            <button
              onClick={() => handleLogin({ provider: "google" })}
              className="rounded-md border border-ring px-4 py-3 hover:bg-surface cursor-pointer"
            >
              Continue with Google
            </button>
          ) : null}
        </div>

        <aside className="mt-6 rounded-lg border border-ring/35 bg-surface p-4 text-xs text-muted-foreground">
          <h2 className="text-sm font-semibold text-foreground">
            What Saigely accesses
          </h2>

          <ul className="mt-3 space-y-3">
            {githubEnabled ? (
              <li>
                <span className="font-medium text-foreground">GitHub:</span>{" "}
                read-only access to your basic profile and email addresses
                (<code>read:user</code> and <code>user:email</code>). AspAIre does
                not request access to repositories, source code, organizations,
                issues, or pull requests.
              </li>
            ) : null}
            <li>
              <span className="font-medium text-foreground">Google:</span>{" "}
              your basic account identity, including name, profile photo, and
              primary email address (<code>openid</code>, <code>profile</code>,
              and <code>email</code>). AspAIre does not request access to Gmail,
              Drive, Calendar, contacts, or other Google services.
            </li>
          </ul>

          <p className="mt-3 border-t border-border pt-3 leading-relaxed">
            This information is used to create and secure your account, display
            your identity in the app, and associate your preferences and
            conversations with you. OAuth credentials are handled by Better
            Auth and are not used to access unrelated provider APIs.
          </p>
        </aside>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sign in to access your conversations and personalized AI preferences.
        </p>
      </div>
    </main>
  );
}
