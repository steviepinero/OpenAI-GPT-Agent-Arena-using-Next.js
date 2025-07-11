import "@/styles/globals.css";
import { ConversationsProvider } from "../lib/ConversationsContext";

export default function App({ Component, pageProps }) {
  return (
    <ConversationsProvider>
      <Component {...pageProps} />
    </ConversationsProvider>
  );
}
