"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AiChatModal from "@/components/chat/ai-chat-modal";

// Skapa React-komponenter av dina SVG-filer!
// Klistra in innehållet från dina .svg-filer istället för <path ... />
const HomeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 18" fill="currentColor" className={className}>
    {/* Klistra in innehållet från home.svg här nedan */}
    <path d="M0 15.5V6.5C0 6.18333 0.0709998 5.88333 0.213 5.6C0.355 5.31667 0.550667 5.08333 0.8 4.9L6.8 0.4C7.15 0.133333 7.55 0 8 0C8.45 0 8.85 0.133333 9.2 0.4L15.2 4.9C15.45 5.08333 15.646 5.31667 15.788 5.6C15.93 5.88333 16.0007 6.18333 16 6.5V15.5C16 16.05 15.804 16.521 15.412 16.913C15.02 17.305 14.5493 17.5007 14 17.5H11C10.7167 17.5 10.4793 17.404 10.288 17.212C10.0967 17.02 10.0007 16.7827 10 16.5V11.5C10 11.2167 9.904 10.9793 9.712 10.788C9.52 10.5967 9.28267 10.5007 9 10.5H7C6.71667 10.5 6.47933 10.596 6.288 10.788C6.09667 10.98 6.00067 11.2173 6 11.5V16.5C6 16.7833 5.904 17.021 5.712 17.213C5.52 17.405 5.28267 17.5007 5 17.5H2C1.45 17.5 0.979333 17.3043 0.588 16.913C0.196666 16.5217 0.000666667 16.0507 0 15.5Z" />
  </svg>
);

const CoursesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 18 18" fill="currentColor" className={className}>
    {/* Klistra in innehållet från courses.svg här nedan */}
    <path d="M17.5 0L7.99413 1.38452L7.39577 1.47135L7.40519 1.47471C3.96308 2.1101 1.34615 5.1275 1.34615 8.75C1.34615 10.7908 2.1774 12.6417 3.51817 13.9818L0 17.5L9.50587 16.1155L10.1042 16.0287L10.0948 16.0253C13.5369 15.3899 16.1538 12.3725 16.1538 8.75C16.1544 7.77784 15.9628 6.81515 15.59 5.91729C15.2173 5.01943 14.6707 4.2041 13.9818 3.51817L17.5 0ZM8.75 2.69231C12.0905 2.69231 14.8077 5.40952 14.8077 8.75C14.8077 12.0905 12.0905 14.8077 8.75 14.8077C5.40952 14.8077 2.69231 12.0905 2.69231 8.75C2.69231 5.40952 5.40952 2.69231 8.75 2.69231Z" />
  </svg>
);

const ProfileIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    {/* Klistra in innehållet från profile.svg här nedan */}
    <path d="M8 11.158C6.65491 11.1573 5.33327 11.5119 4.16764 12.1862C3.002 12.8606 2.03333 13.8309 1.35878 15L0 13.7366C0.857986 12.3869 2.04075 11.2762 3.43901 10.5072C4.83727 9.73818 6.40591 9.3356 8 9.33665C11.3607 9.33665 14.313 11.0928 16 13.7347L14.6393 14.9981C13.9647 13.8296 12.9962 12.8598 11.831 12.1859C10.6657 11.5119 9.34458 11.1574 8 11.158Z"></path>
    <path d="M8 0.00191725C8.5997 -0.0156636 9.19681 0.0878143 9.75599 0.306226C10.3152 0.524637 10.825 0.853539 11.2554 1.27346C11.6858 1.69338 12.0279 2.19579 12.2615 2.75093C12.4952 3.30606 12.6156 3.90265 12.6156 4.50537C12.6156 5.10808 12.4952 5.70467 12.2615 6.25981C12.0279 6.81495 11.6858 7.31735 11.2554 7.73727C10.825 8.1572 10.3152 8.4861 9.75599 8.70451C9.19681 8.92292 8.5997 9.0264 8 9.00882C6.82685 8.9845 5.7099 8.49925 4.88878 7.65716C4.06766 6.81506 3.60778 5.68321 3.60778 4.50441C3.60778 3.32561 4.06766 2.19375 4.88878 1.35166C5.7099 0.509567 6.82685 0.0262328 8 0.00191725ZM6.11078 2.60554C6.61183 2.10218 7.29141 1.8194 8 1.8194C8.70859 1.8194 9.38817 2.10218 9.88922 2.60554C10.3903 3.1089 10.6718 3.7916 10.6718 4.50345C10.6718 5.2153 10.3903 5.898 9.88922 6.40136C9.38817 6.90472 8.70859 7.1875 8 7.1875C7.29141 7.1875 6.61183 6.90472 6.11078 6.40136C5.60973 5.898 5.32824 5.2153 5.32824 4.50345C5.32824 3.7916 5.60973 3.1089 6.11078 2.60554Z" />
  </svg>
);

const ChatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 18" fill="none" className={className}>
    {/* Klistra in innehållet från chat.svg här nedan */}
    <path
      d="M19.25 13.993C19.2497 13.0967 19.0271 12.2145 18.6022 11.4253C18.1772 10.6362 17.5632 9.96471 16.8151 9.47107C16.0671 8.97742 15.2082 8.677 14.3155 8.59671C13.4228 8.51642 12.5242 8.65877 11.7 9.011M13.833 7.372C13.3982 7.372 12.9676 7.28636 12.5659 7.11996C12.1642 6.95357 11.7992 6.70969 11.4918 6.40223C11.1843 6.09478 10.9404 5.72977 10.774 5.32806C10.6076 4.92636 10.522 4.49581 10.522 4.061C10.522 3.62619 10.6076 3.19564 10.774 2.79394C10.9404 2.39223 11.1843 2.02722 11.4918 1.71977C11.7992 1.41231 12.1642 1.16843 12.5659 1.00203C12.9676 0.835642 13.3982 0.75 13.833 0.75C14.7111 0.75 15.5533 1.09884 16.1742 1.71977C16.7952 2.3407 17.144 3.18287 17.144 4.061C17.144 4.93913 16.7952 5.7813 16.1742 6.40223C15.5533 7.02316 14.7111 7.372 13.833 7.372Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.3165V11.2054H8.88889V10.0943C8.88801 9.79988 8.77067 9.51777 8.56248 9.30959C8.3543 9.10141 8.07219 8.98406 7.77778 8.98318H6.66667V7.87207H5.55556V8.98318H4.44444V7.87207H3.33333V8.98318H2.22222C1.92781 8.98406 1.6457 9.10141 1.43752 9.30959C1.22934 9.51777 1.11199 9.79988 1.11111 10.0943V11.2054H0V12.3165H1.11111V13.4276H0V14.5387H1.11111V15.6498C1.11199 15.9443 1.22934 16.2264 1.43752 16.4346C1.6457 16.6427 1.92781 16.7601 2.22222 16.761H3.33333V17.8721H4.44444V16.761H5.55556V17.8721H6.66667V16.761H7.77778C8.07219 16.7601 8.3543 16.6427 8.56248 16.4346C8.77067 16.2264 8.88801 15.9443 8.88889 15.6498V14.5387H10V13.4276H8.88889V12.3165H10ZM7.77778 15.6498H2.22222V10.0943H7.77778V15.6498Z"
      fill="currentColor"
    />
    <path
      d="M4.64514 10.6499H3.89792L2.78125 15.0943H3.35181L3.60958 14.0527H4.89625L5.14736 15.0943H5.73736L4.64514 10.6499ZM3.68458 13.6077L4.25014 11.1777H4.27569L4.82181 13.6077H3.68458ZM6.24681 10.6499H6.80236V15.0943H6.24681V10.6499Z"
      fill="currentColor"
    />
  </svg>
);

const links = [
  { href: "/learn", label: "Hem", Icon: HomeIcon },
  { href: "/courses", label: "Utforska", Icon: CoursesIcon },
  { href: "/profile", label: "Om mig", Icon: ProfileIcon },
];

export default function MobileFooter() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 lg:hidden">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#333333] px-4 py-2 pb-1 pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <ul className="flex items-center justify-around">
          {links.slice(0, 2).map(({ href, label, Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href} className={`h-12 rounded-3xl transition-all ${isActive ? "text-[#0C4F80] bg-[#E3F3FB] dark:text-[#E3F3FB] dark:bg-[#0C4F80]" : "text-gray-400 dark:text-gray-500"}`}>
                <Link
                  href={href}
                  className="flex flex-col items-center px-3"
                >
                  <Icon
                    className={`w-14 h-7 p-1.5`}
                  />
                  <span
                    className={`text-xs ${isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                      }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li className="h-12 rounded-3xl transition-all text-gray-400 dark:text-gray-500">
            <AiChatModal
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="flex flex-col items-center px-3"
                >
                  <ChatIcon
                    className="w-14 h-7 p-1.5"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">Chatt</span>
                </button>
              )}
            />
          </li>

          {links.slice(2).map(({ href, label, Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href} className={`h-12 rounded-3xl transition-all ${isActive ? "text-[#0C4F80] bg-[#E3F3FB] dark:text-[#E3F3FB] dark:bg-[#0C4F80]" : "text-gray-400 dark:text-gray-500"}`}>
                <Link
                  href={href}
                  className="flex flex-col items-center px-3"
                >
                  <Icon
                    className={`w-14 h-7 p-1.5`}
                  />
                  <span
                    className={`text-xs ${isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                      }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav >
  );
}