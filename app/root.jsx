import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import styles from "./styles/styles.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Fonts />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const meta = () => ({
  charset: "utf-8",
  title: "Shop Run App",
  viewport: "width=device-width,initial-scale=1",
});

const Fonts = () => {
  return (
    <>
      <link rel="preload" href="/fonts/IBMPlexSans-Regular.ttf" as="font" type="font/ttf" crossOrigin="true" />
    </>
  );
};

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];
