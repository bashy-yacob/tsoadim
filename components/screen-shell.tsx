import type { PropsWithChildren } from "react";

export function ScreenShell({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4efe9] p-5" dir="rtl">
      <div className="w-full max-w-[420px] rounded-[30px] border border-[#e8d7cd] bg-[#fffaf6] p-4 shadow-[0_20px_50px_rgba(86,45,23,0.08)]">
        {children}
      </div>
    </main>
  );
}
