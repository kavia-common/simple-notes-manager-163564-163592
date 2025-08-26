import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";

import { Button, Input } from "~/components/ui";
import { commitSession, getSession } from "~/lib/auth.server";
import { makeApiRequest } from "~/lib/api.server";

/**
 * PUBLIC_INTERFACE
 * Loader redirects authenticated users to /notes
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  if (session.get("token")) return redirect("/notes");
  return json({});
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type ActionData = { fieldErrors?: Record<string, string>; formError?: string };

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "");

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Name is required";
  if (!validateEmail(email)) fieldErrors.email = "Please enter a valid email";
  if (!password || password.length < 6) fieldErrors.password = "Password must be at least 6 characters";
  if (Object.keys(fieldErrors).length) {
    return json<ActionData>({ fieldErrors }, { status: 400 });
  }

  try {
    await makeApiRequest("/auth/signup", {
      method: "POST",
      body: { email, password, name },
    });
    // Auto-login after signup
    const { token } = await makeApiRequest<{ token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const session = await getSession(request);
    session.set("token", token);
    return redirect("/notes", { headers: { "Set-Cookie": await commitSession(session) } });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return json<ActionData>({ formError: err?.message || "Signup failed" }, { status: 400 });
  }
}

export default function SignupPage() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-800">Create an account</h1>
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-gray-700">Name</label>
            <Input id="name" type="text" name="name" required placeholder="Jane Doe" />
            {actionData?.fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{actionData.fieldErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-gray-700">Email</label>
            <Input id="email" type="email" name="email" required placeholder="you@example.com" />
            {actionData?.fieldErrors?.email && <p className="mt-1 text-xs text-red-600">{actionData.fieldErrors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-gray-700">Password</label>
            <Input id="password" type="password" name="password" required placeholder="••••••••" />
            {actionData?.fieldErrors?.password && <p className="mt-1 text-xs text-red-600">{actionData.fieldErrors.password}</p>}
          </div>
          {actionData?.formError && <p className="text-sm text-red-600">{actionData.formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign up"}
          </Button>
        </Form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Already have an account?</span>{" "}
          <Link className="text-blue-600 hover:underline" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
