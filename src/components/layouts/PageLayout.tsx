import { GAME_DATABASE, FUN_GAMES } from "@/constants/routes";
import { PageSelector } from "@/features/PageSelector";
import { usePathname } from "next/navigation";
import { CacheNotice } from "../internal/CacheNotice";
import { GameLayout } from "./GameLayout";
import { FunLayout } from "./FunLayout";

interface PageLayoutProps {
    children: React.ReactNode;
}

/**
 * Page layout component for the app containing redirection and notice
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const isMain = pathname === "/";

    let Layout;
    if (pathname?.startsWith(GAME_DATABASE)) {
        Layout = GameLayout;
    } else if (pathname?.startsWith(FUN_GAMES)) {
        Layout = FunLayout;
    }

    return (
        <div className="w-screen h-dvh sm:h-screen flex flex-col overflow-hidden relative">
            <div className={`w-full h-full`}>
                {Layout ? <Layout>{children}</Layout> : children}
            </div>
            <PageSelector shouldAnimate={isMain} />
            <CacheNotice />
        </div>
    );
};
