import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useNavigate, useSearchParams, useSubmit } from "@remix-run/react";
import { useMemo, useState } from "react";
import { AppHeader, Button, Input, Sidebar, TagBadge, cn } from "~/components/ui";
import { requireUserSession } from "~/lib/auth.server";
import { makeApiRequest } from "~/lib/api.server";
import type { Note } from "~/lib/types";

/**
 * PUBLIC_INTERFACE
 * Loader fetches notes for the authenticated user and returns list and unique tags.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  // Query parameters for search and tag filter are handled on client; backend fetch returns all or could accept query
  const notes = await makeApiRequest<Note[]>("/notes", { method: "GET", session });
  return json({ notes });
}

export default function NotesLayout() {
  const { notes } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const submit = useSubmit();

  const search = params.get("q") || "";
  const tagFilter = params.get("tag") || "";

  const tags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes.filter((n) => {
      const matchesQ = !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !tagFilter || n.tags.includes(tagFilter);
      return matchesQ && matchesTag;
    });
  }, [notes, search, tagFilter]);

  return (
    <div className="flex h-screen flex-col">
      <AppHeader onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <Form
            method="get"
            onChange={(e) => submit(e.currentTarget, { replace: true })}
            className="mb-4"
            role="search"
          >
            <Input name="q" placeholder="Search notes..." defaultValue={search} />
            <input type="hidden" name="tag" value={tagFilter} />
          </Form>

          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</div>
            <div className="flex flex-wrap gap-2">
              <TagBadge
                label="all"
                active={!tagFilter}
                onClick={() => navigate({ pathname: "/notes", search: search ? `?q=${encodeURIComponent(search)}` : "" })}
              />
              {tags.map((t) => (
                <TagBadge
                  key={t}
                  label={t}
                  active={tagFilter === t}
                  onClick={() =>
                    navigate({ pathname: "/notes", search: `?${new URLSearchParams({ ...(search ? { q: search } : {}), tag: t }).toString()}` })
                  }
                />
              ))}
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Your Notes</div>
            <Link to="new">
              <Button variant="secondary">New</Button>
            </Link>
          </div>
          <nav className="space-y-1">
            {filtered.map((n) => (
              <Link
                key={n.id}
                to={n.id}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{n.title || "Untitled"}</span>
                  <span className="text-xs text-gray-400">{new Date(n.updated_at).toLocaleDateString()}</span>
                </div>
                {n.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {n.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                        #{t}
                      </span>
                    ))}
                    {n.tags.length > 3 && <span className="text-[10px] text-gray-500">+{n.tags.length - 3}</span>}
                  </div>
                )}
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-md border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">No notes found</div>
            )}
          </nav>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-white p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
