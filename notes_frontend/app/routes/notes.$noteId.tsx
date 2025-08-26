import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui";
import { requireUserSession } from "~/lib/auth.server";
import { makeApiRequest } from "~/lib/api.server";
import type { Note } from "~/lib/types";

/**
 * PUBLIC_INTERFACE
 * Loader loads a single note by ID.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const noteId = params.noteId as string;
  const note = await makeApiRequest<Note>(`/notes/${noteId}`, { session });
  return json({ note });
}

/**
 * PUBLIC_INTERFACE
 * Action handles delete note.
 */
export async function action({ request, params }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  const noteId = params.noteId as string;
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  if (intent === "delete") {
    await makeApiRequest(`/notes/${noteId}`, { method: "DELETE", session });
    return redirect("/notes");
  }
  return json({ ok: true });
}

export default function NoteDetails() {
  const { note } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{note.title || "Untitled"}</h1>
        <div className="flex items-center gap-2">
          <Form method="get" action="edit">
            <Button variant="ghost" type="submit">Edit</Button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="delete" />
            <Button variant="ghost" type="submit" disabled={navigation.state === "submitting"}>
              {navigation.state === "submitting" ? "Deleting..." : "Delete"}
            </Button>
          </Form>
        </div>
      </div>
      <div className="prose max-w-none whitespace-pre-wrap text-gray-800">{note.content}</div>
      {note.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {note.tags.map((t) => (
            <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">#{t}</span>
          ))}
        </div>
      )}
      <div className="mt-6 text-xs text-gray-500">Updated {new Date(note.updated_at).toLocaleString()}</div>
    </div>
  );
}
