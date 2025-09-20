import { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatBot } from "./ChatBot";
import { BottomNav } from "./BottomNav";
import { ChatRoom } from "./ChatRoom";
import { useAuth } from "@/hooks/useAuth";

export function Layout({ children }: PropsWithChildren) {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:p-2 focus:rounded"
      >
        Skip to content
      </a>
      <Header />
      <main id="content" className="flex-1">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
      <Footer />
      {user?.role === "student" ? (
        <ChatRoom roomName="Global Chat" />
      ) : (
        <ChatBot />
      )}
      <BottomNav />
    </div>
  );
}
