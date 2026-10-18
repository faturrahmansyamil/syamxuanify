import type { ReactNode } from "react";

export default function LayoutAuth({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-white">
      <div className="flex min-h-full flex-col px-[24px] py-[40px]">
        <div className="mx-auto my-auto w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
