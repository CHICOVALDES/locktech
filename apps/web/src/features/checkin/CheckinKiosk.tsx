import { useState } from "react";
import { KIDS, type Kid } from "./kids.js";
import type { CampActivity } from "./useCheckinLog.js";

interface CheckinKioskProps {
  onCheckin: (kidName: string, kidEmoji: string, activity: CampActivity) => void;
}

type Step = "pick-kid" | "pick-activity" | "confirm";

// Pantalla de kiosco para que los chicos (5+) se registren solos con toques
// grandes: elegir su avatar, elegir la actividad del día, listo. Sin texto para
// leer más allá del propio nombre, sin teclado, sin pasos intermedios.
export function CheckinKiosk({ onCheckin }: CheckinKioskProps) {
  const [step, setStep] = useState<Step>("pick-kid");
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);

  function pickKid(kid: Kid) {
    setSelectedKid(kid);
    setStep("pick-activity");
  }

  function pickActivity(activity: CampActivity) {
    if (!selectedKid) return;
    onCheckin(selectedKid.name, selectedKid.emoji, activity);
    setStep("confirm");
    setTimeout(() => {
      setStep("pick-kid");
      setSelectedKid(null);
    }, 3000);
  }

  return (
    <div className="kiosk">
      {step === "pick-kid" && (
        <>
          <h1 className="kiosk__prompt">¿Quién sos hoy? 👋</h1>
          <div className="kiosk__grid">
            {KIDS.map((kid) => (
              <button key={kid.id} className="kiosk__kid-card" style={{ background: kid.color }} onClick={() => pickKid(kid)}>
                <span className="kiosk__kid-emoji">{kid.emoji}</span>
                <span className="kiosk__kid-name">{kid.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "pick-activity" && selectedKid && (
        <>
          <h1 className="kiosk__prompt">
            ¡Hola {selectedKid.name}! {selectedKid.emoji}
            <br />
            ¿Qué vas a hacer hoy?
          </h1>
          <div className="kiosk__activities">
            <button className="kiosk__activity-card kiosk__activity-card--motocross" onClick={() => pickActivity("motocross")}>
              <span className="kiosk__activity-emoji">🏍️</span>
              <span className="kiosk__activity-name">MOTOCROSS</span>
            </button>
            <button className="kiosk__activity-card kiosk__activity-card--gokart" onClick={() => pickActivity("gokart")}>
              <span className="kiosk__activity-emoji">🏎️</span>
              <span className="kiosk__activity-name">GO-KART</span>
            </button>
          </div>
          <button className="kiosk__back" onClick={() => setStep("pick-kid")}>
            ← Volver
          </button>
        </>
      )}

      {step === "confirm" && selectedKid && (
        <div className="kiosk__confirm">
          <span className="kiosk__confirm-check">✅</span>
          <h1 className="kiosk__prompt">
            ¡Listo, {selectedKid.name}! {selectedKid.emoji}
            <br />A rodar 🏁
          </h1>
        </div>
      )}
    </div>
  );
}
