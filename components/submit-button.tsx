"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  className?: string;
};

export function SubmitButton({
  label,
  pendingLabel,
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm sm:tracking-[0.24em] ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
