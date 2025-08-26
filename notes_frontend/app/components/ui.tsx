/* eslint-disable react/prop-types */
import { Link } from "@remix-run/react";
import React from "react";

export function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const colors = {
  primary: "#4F8EF7",
  secondary: "#F7B32B",
  accent: "#F76E5C",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };
export function Button(props: ButtonProps) {
  const { className, variant = "primary", ...rest } = props;
  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2";
  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300"
      : variant === "secondary"
      ? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300"
      : "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300";
  return <button className={cn(base, variantClass, className || "")} {...rest} />;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Input(props: InputProps) {
  const { className, ...rest } = props;
  return (
    <input
      className={cn(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
        className || ""
      )}
      {...rest}
    />
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function TextArea(props: TextAreaProps) {
  const { className, ...rest } = props;
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
        className || ""
      )}
      {...rest}
    />
  );
}

export function TagBadge({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium border transition",
        active ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
      )}
    >
      #{label}
    </button>
  );
}

export function AppHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button className="rounded-md p-2 hover:bg-gray-100 md:hidden" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <Link to="/notes" className="text-lg font-semibold text-gray-800">
          Notes
        </Link>
      </div>
      <div>
        <form method="post" action="/logout">
          <Button variant="ghost" type="submit">Logout</Button>
        </form>
      </div>
    </header>
  );
}

export function Sidebar({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-72 transform bg-white shadow-md transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="complementary"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 md:hidden">
            <span className="text-base font-semibold text-gray-700">Navigation</span>
            <button className="rounded-md p-2 hover:bg-gray-100" onClick={onClose} aria-label="Close sidebar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 8.586l4.95-4.95 1.414 1.415L11.414 10l4.95 4.95-1.415 1.414L10 11.414l-4.95 4.95-1.414-1.415L8.586 10l-4.95-4.95L5.05 3.636 10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar backdrop"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClose();
          }}
        />
      )}
    </>
  );
}
