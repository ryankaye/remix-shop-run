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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans&display=swap" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </>
  );
};

export const links = () => [{ rel: "stylesheet", href: styles }];
