import { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatBot } from "./ChatBot";

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatBot />
    </div>
  );
}
