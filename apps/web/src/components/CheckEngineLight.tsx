interface CheckEngineLightProps {
  active: boolean;
}

// Testigo (telltale) de check engine, como el de cualquier tablero real:
// apagado/gris en uso normal, se enciende en ámbar cuando hay una condición de alerta.
export function CheckEngineLight({ active }: CheckEngineLightProps) {
  return (
    <div className={`telltale ${active ? "telltale--active" : ""}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 11h1.5V8h3v3h5V8h1.5l2.5 3H19a2 2 0 012 2v1.5a2 2 0 01-2 2h-.5l-2 3h-7l-2-3H5a2 2 0 01-2-2V13a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="8.5" cy="16.5" r="1.2" fill="currentColor" />
        <circle cx="14.5" cy="16.5" r="1.2" fill="currentColor" />
      </svg>
      <span className="telltale__label">CHECK ENGINE</span>
    </div>
  );
}
