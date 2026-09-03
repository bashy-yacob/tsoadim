import {
  IconFlame,
  IconTargetArrow,
} from "@tabler/icons-react";
import Link from "next/link";

export function LandingScreen() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-[1140px]">
        <header className="mb-10 flex items-center justify-between rounded-full bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#F5C4B3] text-[#B94A26]">
              <IconTargetArrow size={18} />
            </div>
            <span className="text-[18px] font-medium text-[#1F1B16]">צועדים</span>
          </div>
          <Link href="/auth" className="rounded-full bg-[#D85A30] px-4 py-2 text-[13px] font-medium text-[#FFF9F5]">
            כבר יש לי חשבון
          </Link>
        </header>

        <section className="mb-16 grid items-center gap-8 rounded-[32px] bg-[#fff] p-6 shadow-[0_12px_28px_rgba(52,31,16,0.06)] md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-[38px] leading-[1.2] text-[#1F1B16]">צועדים. כי יעדים לא משיגים את עצמם.</h1>
            <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[#6B6459]">
              עקוב, תעד, תתקדם – בלי אקסלים, בלי בושה.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/auth" className="rounded-[14px] bg-[#D85A30] px-5 py-3 text-[14px] font-medium text-[#FAECE7]">
                בוא נתחיל לצעוד
              </Link>
              <Link href="/dashboard" className="rounded-[14px] border border-[#E5E1D8] bg-white px-5 py-3 text-[14px] font-medium text-[#2d120b]">
                כבר יש לי חשבון
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#F5F3EF] p-4">
            <div className="rounded-[20px] bg-[#F0997B] p-4 text-[#4A1B0C]">
              <p className="mb-1 text-[12px] font-medium opacity-80">רצף נוכחי</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[36px] font-medium">12</span>
                <span className="text-[14px]">ימים 🔥</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[16px] bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#2d120b]">לרוץ 5 ק&quot;מ</span>
                  <span className="text-[11px] text-[#BA7517]">+120</span>
                </div>
                <div className="h-[8px] rounded-full bg-[#F0DFD5]">
                  <div className="h-full w-[65%] rounded-full bg-[#D85A30]" />
                </div>
              </div>
              <div className="rounded-[16px] bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#2d120b]">אימון יומי</span>
                  <span className="text-[11px] text-[#BA7517]">+10/יום</span>
                </div>
                <div className="h-[8px] rounded-full bg-[#F0DFD5]">
                  <div className="h-full w-[80%] rounded-full bg-[#D85A30]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 grid gap-5 md:grid-cols-3">
          {[
            { icon: <IconTargetArrow size={22} />, title: "יעד לכל דבר", text: "יעד מספרי, רצף יומי או אבן דרך חד-פעמית – הכל במקום אחד." },
            { icon: <IconFlame size={22} />, title: "רצפים שמחזיקים", text: "סמן כל יום, ראה את ההתקדמות, וחזור למסלול כשצריך." },
            { icon: <IconTargetArrow size={22} />, title: "מתקדמים בצעדים", text: "כל עדכון נשמר כדי שתראה את הדרך, לא רק את התוצאה." },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-[42px] w-[42px] items-center justify-center rounded-[12px] bg-[#F5C4B3] text-[#B94A26]">
                {item.icon}
              </div>
              <h2 className="mb-2 text-[17px] font-medium text-[#1F1B16]">{item.title}</h2>
              <p className="text-[14px] leading-6 text-[#6B6459]">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mb-16 rounded-[28px] bg-[#F0997B] p-6 text-center text-[#4A1B0C] shadow-sm">
          <h2 className="mb-2 text-[26px] font-medium">מוכנים לצעד הראשון?</h2>
          <p className="mb-5 text-[14px]">היעד הראשון שלך מחכה. הצעד הראשון הוא תמיד הכי חשוב.</p>
          <Link href="/auth" className="inline-flex rounded-[14px] bg-[#D85A30] px-6 py-3 text-[14px] font-medium text-[#FAECE7]">
            בואו נתחיל לצעוד
          </Link>
        </section>
      </div>
    </main>
  );
}
