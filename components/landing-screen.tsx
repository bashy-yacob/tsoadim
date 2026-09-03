import {
  IconFlame,
  IconTargetArrow,
  IconClock,
  IconChartLine,
  IconTrophy,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";

export function LandingScreen() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-8" dir="rtl">
      <div className="mx-auto max-w-[1140px]">
        {/* NAV */}
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

        {/* HERO */}
        <section className="mb-6 grid items-center gap-8 rounded-[32px] bg-white p-6 shadow-[0_12px_28px_rgba(52,31,16,0.06)] md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="mb-4 inline-block rounded-full bg-[#FBE6DC] px-3 py-1 text-[12px] font-medium text-[#D85A30]">
              🔥 חדש: לוח מנצחים ותחרות בין חברים
            </span>
            <h1 className="text-[38px] leading-[1.25] text-[#1F1B16]">
              לרשום מטרה זה קל. להתמיד — זו הבעיה.
              <br />
              בשביל זה בנינו את צועדים.
            </h1>
            <p className="mt-4 max-w-[560px] text-[15px] leading-7 text-[#6B6459]">
              צועדים שומר את הרצף שלך חי, מראה את ההתקדמות בגרף אמיתי, ומזכיר לך לפני
              שהרצף נשבר — לא אחרי. יעדי כושר, הרגלים יומיים ואבני דרך גדולות, הכל
              במקום אחד, בעברית מלאה.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/auth" className="rounded-[14px] bg-[#D85A30] px-5 py-3 text-[14px] font-medium text-[#FAECE7]">
                התחילו את הרצף שלכם
              </Link>
              <Link href="/dashboard" className="rounded-[14px] border border-[#E5E1D8] bg-white px-5 py-3 text-[14px] font-medium text-[#2d120b]">
                כבר יש לי חשבון
              </Link>
            </div>
            <p className="mt-3 text-[12px] text-[#9C8C81]">
              ללא כרטיס אשראי · מצטרפים תוך פחות מדקה · 14 יום פרימיום חינם
            </p>
          </div>

          <div className="rounded-[28px] bg-[#F5F3EF] p-4">
            <div className="rounded-[20px] bg-[#F0997B] p-4 text-[#4A1B0C]">
              <p className="mb-1 text-[12px] font-medium opacity-80">רצף נוכחי</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[36px] font-medium">12</span>
                <span className="inline-flex items-center gap-1 text-[14px]">
                  ימים <IconFlame size={15} aria-hidden="true" />
                </span>
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

        {/* TRUST LINE */}
        <p className="mb-16 text-center text-[13px] text-[#9C8C81]">
          מצטרפים לאנשים שכבר עוקבים אחרי ההתקדמות שלהם — יום אחרי יום, בלי לוותר
        </p>

        {/* FEATURES */}
        <section className="mb-16">
          <h2 className="mb-8 text-center text-[22px] font-medium text-[#1F1B16]">
            כל מה שצריך כדי לא לוותר בפעם הזאת
          </h2>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              {
                icon: <IconTargetArrow size={22} />,
                iconBg: "bg-[#F5C4B3]",
                iconColor: "text-[#B94A26]",
                title: "יעד אחד לכל מה שחשוב",
                text: "מריצה של 5 ק\"מ ועד קריאת פרק ביום — כל סוג יעד מקבל בדיוק את המעקב שמתאים לו.",
              },
              {
                icon: <IconClock size={22} />,
                iconBg: "bg-[#FAC775]",
                iconColor: "text-[#633806]",
                title: 'לוחצים "התחל" וזהו',
                text: "הטיימר סופר בשבילך, והרצף מתעדכן לבד — אין תירוץ של \"שכחתי לסמן\".",
              },
              {
                icon: <IconChartLine size={22} />,
                iconBg: "bg-[#9FE1CB]",
                iconColor: "text-[#085041]",
                title: "רואים את זה — וממשיכים",
                text: "כל עדכון נכנס לגרף שמראה בדיוק לאן אתה הולך, לא רק את המספר של היום.",
              },
              {
                icon: <IconTrophy size={22} />,
                iconBg: "bg-[#FBEAF0]",
                iconColor: "text-[#72243E]",
                title: "לוח מנצחים",
                badge: "פרימיום",
                text: "כשחברים רואים את הרצף שלך, קשה יותר לוותר עליו — opt-in בלבד, השליטה אצלך.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] bg-white p-5 shadow-sm">
                <div className={`mb-3 flex h-[42px] w-[42px] items-center justify-center rounded-[12px] ${item.iconBg} ${item.iconColor}`}>
                  {item.icon}
                </div>
                <h3 className="mb-2 flex items-center gap-2 text-[15px] font-medium text-[#1F1B16]">
                  {item.title}
                  {item.badge && (
                    <span className="rounded-full bg-[#FBEAF0] px-2 py-0.5 text-[10px] font-medium text-[#72243E]">
                      {item.badge}
                    </span>
                  )}
                </h3>
                <p className="text-[13px] leading-5 text-[#6B6459]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="mb-16 rounded-[32px] bg-[#F5F3EF] p-8">
          <h2 className="mb-1 text-center text-[22px] font-medium text-[#1F1B16]">
            התחילו בחינם, שדרגו כשתרגישו את ההבדל
          </h2>
          <p className="mb-8 text-center text-[14px] text-[#6B6459]">
            14 יום פרימיום על הבית, ללא כרטיס אשראי
          </p>

          <div className="mx-auto grid max-w-[640px] gap-5 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-[20px] border border-[#E5E1D8] bg-white p-7">
              <p className="mb-1.5 text-[13px] font-medium text-[#6B6459]">חינם</p>
              <p className="mb-5 text-[30px] font-medium text-[#1F1B16]">₪0</p>
              <ul className="mb-6 space-y-2.5">
                <li className="flex items-center gap-2 text-[13px] text-[#1F1B16]">
                  <IconCheck size={16} className="text-[#1D9E75]" /> יעדים ללא הגבלה
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#1F1B16]">
                  <IconCheck size={16} className="text-[#1D9E75]" /> גרפים והיסטוריה מלאה
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#1F1B16]">
                  <IconCheck size={16} className="text-[#1D9E75]" /> טיימר וסטריקים
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#9C8C81]">
                  <IconX size={16} /> לוח מנצחים
                </li>
              </ul>
              <Link href="/auth" className="block rounded-[12px] border border-[#E5E1D8] bg-white py-3 text-center text-[14px] font-medium text-[#1F1B16]">
                התחילו חינם
              </Link>
            </div>

            {/* Premium */}
            <div className="relative rounded-[20px] bg-[#4A1B0C] p-7">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FAC775] px-3 py-1 text-[11px] font-medium text-[#412402]">
                הכי פופולרי
              </span>
              <p className="mb-1.5 text-[13px] font-medium text-[#F5C4B3]">פרימיום</p>
              <p className="mb-0.5 text-[30px] font-medium text-[#FAECE7]">
                ₪14.90<span className="text-[14px] font-normal text-[#F5C4B3]">/חודש</span>
              </p>
              <p className="mb-4 text-[12px] text-[#E8B49E]">פחות מכוס קפה בשבוע</p>
              <ul className="mb-6 space-y-2.5">
                <li className="flex items-center gap-2 text-[13px] text-[#FAECE7]">
                  <IconCheck size={16} className="text-[#FAC775]" /> הכל מהחינמי
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#FAECE7]">
                  <IconCheck size={16} className="text-[#FAC775]" /> לוח מנצחים גלובלי וקבוצתי
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#FAECE7]">
                  <IconCheck size={16} className="text-[#FAC775]" /> קבוצות תחרות ללא הגבלה
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#FAECE7]">
                  <IconCheck size={16} className="text-[#FAC775]" /> באדג&apos;ים ותובנות מתקדמות
                </li>
              </ul>
              <Link href="/auth" className="block rounded-[12px] bg-[#D85A30] py-3 text-center text-[14px] font-medium text-[#FAECE7]">
                נסו 14 יום חינם
              </Link>
            </div>
          </div>
          <p className="mt-5 text-center text-[12px] text-[#9C8C81]">
            יש גם מסלול שנתי במחיר מוזל — זמין בהרשמה
          </p>
        </section>

        {/* FINAL CTA */}
        <section className="mb-8 rounded-[28px] bg-[#F0997B] p-6 text-center text-[#4A1B0C] shadow-sm">
          <h2 className="mb-2 text-[26px] font-medium">הרצף הראשון שלך מתחיל היום</h2>
          <p className="mb-5 text-[14px]">
            דקה אחת עכשיו, בלי כרטיס אשראי — ותוכל לראות בעצמך למה קשה להפסיק.
          </p>
          <Link href="/auth" className="inline-flex rounded-[14px] bg-[#D85A30] px-6 py-3 text-[14px] font-medium text-[#FAECE7]">
            הרשמה חינם
          </Link>
        </section>

        {/* FOOTER */}
        <footer className="pb-4 text-center text-[12px] text-[#9C8C81]">
          צועדים © 2026 · תנאי שימוש · פרטיות
        </footer>
      </div>
    </main>
  );
}