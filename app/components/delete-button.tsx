'use client';

export default function DeleteButton({
  action,
  confirmMessage,
  label,
  className,
}: {
  action: () => void | Promise<void>;
  confirmMessage: string;
  label: string;
  className?: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={
          className ??
          'rounded-sm border border-red-200 text-red-700 px-3 py-1.5 text-[0.76rem] font-label hover:bg-red-50 shrink-0'
        }
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault();
        }}
      >
        {label}
      </button>
    </form>
  );
}
