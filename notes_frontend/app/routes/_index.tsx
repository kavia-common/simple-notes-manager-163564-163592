import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getSession } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const token = session.get("token");
  if (token) return redirect("/notes");
  return redirect("/login");
}

export default function Index() {
  return null;
}
