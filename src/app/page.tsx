const APP_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz1D4prFnJsygZ4ynWeJnRwqD0pNJiov4VZaYdpKlJO8mwwrzEN8FwjarcOptuIJXScXw/exec";

export default function HomePage() {
  return (
    <main className="app-shell">
      <iframe
        className="app-frame"
        src={APP_SCRIPT_URL}
        title="Gestor WebApp"
        allow="clipboard-read; clipboard-write; fullscreen"
        allowFullScreen
        loading="eager"
      />
    </main>
  );
}
