import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { ScreenShell } from "@/components/screen-shell";
import { profile } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <ScreenShell>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-[18px] text-[#6b5346]" aria-label="חזרה">
          <IconArrowLeft size={18} />
        </Link>
        <p className="text-[15px] font-medium text-[#2d120b]">הגדרות</p>
      </div>

      <div className="mb-4 rounded-[16px] bg-[#fff8f3] p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-[#2d120b]">{profile.display_name}</p>
            <p className="text-[12px] text-[#6B6459]">מנוי חינמי</p>
          </div>
          <span className="rounded-full bg-[#FBEAF0] px-2 py-1 text-[10px] font-medium text-[#72243E]">פרימיום</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-[12px] bg-[#f6f0eb] px-3 py-3">
          <span className="text-[13px] text-[#2d120b]">לוח מנצחים</span>
          <button type="button" className="rounded-full bg-[#D85A30] px-2 py-1 text-[11px] font-medium text-white">פעיל</button>
        </div>
        <div className="flex items-center justify-between rounded-[12px] bg-[#f6f0eb] px-3 py-3">
          <span className="text-[13px] text-[#2d120b]">מנוי</span>
          <span className="text-[12px] text-[#6B6459]">חודשי</span>
        </div>
        <div className="flex items-center justify-between rounded-[12px] bg-[#f6f0eb] px-3 py-3">
          <span className="text-[13px] text-[#2d120b]">אימות דו-שלבי</span>
          <IconCheck size={18} color="#1D7A4C" />
        </div>
      </div>
    </ScreenShell>
  );
}
