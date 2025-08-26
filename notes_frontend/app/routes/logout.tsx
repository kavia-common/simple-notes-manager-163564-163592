import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/lib/auth.server";

/**
 * PUBLIC_INTERFACE
 * Logout action clears the session and redirects to /login
 */
export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
