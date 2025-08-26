import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { Button, Input, TextArea } from "~/components/ui";
import { requireUserSession } from "~/lib/auth.server";
import { makeApiRequest } from "~/lib/api.server";

/**
 * PUBLIC_INTERFACE
 * Loader ensures user is authenticated.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserSession(request);
  return json({});
}

function normalizeTags(input: string) {
  return input ? input.split(",").map((t) => t.trim()).filter(Boolean) : [];
}

/**
 * PUBLIC_INTERFACE
 * Action creates a note and redirects to its page.
 */
export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  const formData = await request.formData();
  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  const tagsRaw = String(formData.get("tags") || "");
  if (!title) {
    return json({ fieldErrors: { title: "Title is required" } }, { status: 400 });
  }
  const created = await makeApiRequest<{ id: string }>("/notes", {
    method: "POST",
    session,
    body: { title, content, tags: normalizeTags(tagsRaw) },
  });
  return redirect(`/notes/${created.id}`);
}

export default function NewNote() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">New note</h1>
      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-gray-700">Title</label>
          <Input id="title" name="title" required placeholder="Note title" />
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm text-gray-700">Content</label>
          <TextArea id="content" name="content" rows={10} placeholder="Write your note..." />
        </div>
        <div>
          <label htmlFor="tags" className="mb-1 block text-sm text-gray-700">Tags (comma-separated)</label>
          <Input id="tags" name="tags" placeholder="work, personal, ideas" />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
          <Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button>
        </div>
      </Form>
    </div>
  );
}
