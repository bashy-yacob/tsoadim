import {
  IconArrowLeft,
  IconTrophy,
} from "@tabler/icons-react";
import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { leaderboardRows } from "@/lib/mock-data";

export default function LeaderboardPage() {
  return (
    <ScreenShell>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowLeft size={18} />
        </Link>
        <p className="text-[15px] font-medium text-[#2d120b]">לוח מנצחים</p>
      </div>

      <div className="mb-4 flex gap-2 rounded-[12px] bg-[#f8eee9] p-1">
        {['כולם', 'החברים שלי'].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`flex-1 rounded-[10px] px-2 py-2 text-[12px] ${index === 0 ? "bg-[#fff] text-[#2d120b]" : "text-[#6b5346]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between rounded-[12px] bg-[#FBEAF0] px-3 py-2">
        <div className="flex items-center gap-2 text-[#72243E]">
          <IconTrophy size={16} />
          <span className="text-[12px] font-medium">פרימיום</span>
        </div>
        <button type="button" className="text-[11px] font-medium text-[#72243E]">הצטרפות</button>
      </div>

      <div className="space-y-2">
        {leaderboardRows.map((row, index) => (
          <div
            key={row.name}
            className={`flex items-center gap-3 rounded-[12px] p-3 ${row.accent ? "border border-[#d98a6b] bg-[#F5C4B3]" : "bg-[#fff7f2]"}`}
          >
            <span className="w-[20px] text-[14px] font-medium text-[#2d120b]">{index + 1}</span>
            <div className={`flex h-[32px] w-[32px] items-center justify-center rounded-full text-[12px] font-medium ${row.accent ? "bg-[#D85A30] text-[#fff]" : "bg-[#f0dfd5] text-[#2d120b]"}`}>
              {row.name === "אתה" ? "ב" : row.name.charAt(0)}
            </div>
            <span className="flex-1 text-[13px] text-[#2d120b]">{row.name}</span>
            <span className="text-[13px] font-medium text-[#6b5346]">{row.points} נק'</span>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}
