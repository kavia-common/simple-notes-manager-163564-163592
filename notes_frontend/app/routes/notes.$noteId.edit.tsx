import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { Button, Input, TextArea } from "~/components/ui";
import { requireUserSession } from "~/lib/auth.server";
import { makeApiRequest } from "~/lib/api.server";
import type { Note } from "~/lib/types";

/**
 * PUBLIC_INTERFACE
 * Loader loads note for editing.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const noteId = params.noteId as string;
  const note = await makeApiRequest<Note>(`/notes/${noteId}`, { session });
  return json({ note });
}

function normalizeTags(input: string) {
  return input ? input.split(",").map((t) => t.trim()).filter(Boolean) : [];
}

/**
 * PUBLIC_INTERFACE
 * Action updates the note via API.
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  const noteId = params.noteId as string;
  const formData = await request.formData();
  const title = String(formData.get("title") || "");
  const content = String(formData.get("content") || "");
  const tagsRaw = String(formData.get("tags") || "");
  if (!title) {
    return json({ fieldErrors: { title: "Title is required" } }, { status: 400 });
  }
  await makeApiRequest(`/notes/${noteId}`, {
    method: "PUT",
    session,
    body: { title, content, tags: normalizeTags(tagsRaw) },
  });
  return redirect(`/notes/${noteId}`);
}

export default function EditNote() {
  const { note } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Edit note</h1>
      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm text-gray-700">Title</label>
          <Input id="title" name="title" defaultValue={note.title} required />
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm text-gray-700">Content</label>
          <TextArea id="content" name="content" rows={10} defaultValue={note.content} />
        </div>
        <div>
          <label htmlFor="tags" className="mb-1 block text-sm text-gray-700">Tags (comma-separated)</label>
          <Input id="tags" name="tags" defaultValue={note.tags.join(", ")} />
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
          <Button type="button" variant="ghost" onClick={() => history.back()}>Cancel</Button>
        </div>
      </Form>
    </div>
  );
}
