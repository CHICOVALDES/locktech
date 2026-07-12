import { useEffect, useState } from "react";
import { LiveMap } from "./features/map/LiveMap.js";
import { GaugeCluster } from "./features/dashboard/GaugeCluster.js";
import { TuningPanel } from "./features/customization/TuningPanel.js";
import { DEFAULT_CUSTOMIZATION, LIVERY_PRESETS, type VehicleCustomization } from "./features/customization/presets.js";
import { useRealtimePositions } from "./hooks/useDemoPositions.js";
import { CheckinKiosk } from "./features/checkin/CheckinKiosk.js";
import { RegistrosLog } from "./features/checkin/RegistrosLog.js";
import { useCheckinLog } from "./features/checkin/useCheckinLog.js";
import { CameraFeed } from "./features/cameras/CameraFeed.js";
import { RecoveryTimelapse } from "./features/recovery/RecoveryTimelapse.js";
import { useAuth } from "./features/auth/useAuth.js";
import { LoginScreen } from "./features/auth/LoginScreen.js";
import { AdminFleet } from "./features/admin/AdminFleet.js";
import { DeviceManager } from "./features/admin/DeviceManager.js";
import { UserManager } from "./features/admin/UserManager.js";

type View = "flota" | "usuarios" | "dispositivos" | "tracking" | "checkin" | "registros" | "camaras" | "recovery";

export function App() {
  const { account, login, register, logout } = useAuth();
  // Fuente de datos: "demo" = motos simuladas; "live" = GPS real vía Traccar.
  const [source, setSource] = useState<"demo" | "live">("demo");
  const { vehicles, status } = useRealtimePositions(source === "live" ? "/realtime/live" : "/realtime/demo");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<"home" | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, VehicleCustomization>>({});
  const [view, setView] = useState<View>("tracking");
  const { records, addCheckin } = useCheckinLog();

  const isAdmin = account?.role === "admin";

  // Al iniciar sesión, el admin aterriza en la vista de flota; los clientes, en tracking.
  useEffect(() => {
    if (!account) return;
    setView(account.role === "admin" ? "flota" : "tracking");
  }, [account]);

  // Gate de autenticación: sin sesión no se ve la plataforma.
  if (!account) {
    return <LoginScreen onLogin={login} onRegister={register} />;
  }

  // El admin ve toda la flota; cada cliente ve solo sus dispositivos asignados.
  const myVehicles = isAdmin
    ? vehicles
    : vehicles.filter((v) => account.devices.some((d) => d.vehicleId === v.position.vehicleId));

  const activeVehicleId = selectedVehicleId ?? myVehicles[0]?.position.vehicleId ?? null;
  const activeCustomization = (activeVehicleId && customizations[activeVehicleId]) || DEFAULT_CUSTOMIZATION;
  const activeAccentColor = LIVERY_PRESETS.find((p) => p.id === activeCustomization.liveryId)?.primary ?? "#c41e2a";

  function updateCustomization(next: VehicleCustomization) {
    if (!activeVehicleId) return;
    setCustomizations((prev) => ({ ...prev, [activeVehicleId]: next }));
  }

  function selectVehicle(vehicleId: string) {
    setCameraTarget(null);
    setSelectedVehicleId(vehicleId);
  }

  function selectHome() {
    setCameraTarget("home");
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo">BALI MOTO TRACK</span>
        <nav className="app__nav">
          {isAdmin && (
            <button className={`app__nav-btn ${view === "flota" ? "app__nav-btn--active" : ""}`} onClick={() => setView("flota")}>
              Flota
            </button>
          )}
          {isAdmin && (
            <button className={`app__nav-btn ${view === "usuarios" ? "app__nav-btn--active" : ""}`} onClick={() => setView("usuarios")}>
              Usuarios
            </button>
          )}
          {isAdmin && (
            <button className={`app__nav-btn ${view === "dispositivos" ? "app__nav-btn--active" : ""}`} onClick={() => setView("dispositivos")}>
              Equipos
            </button>
          )}
          <button className={`app__nav-btn ${view === "tracking" ? "app__nav-btn--active" : ""}`} onClick={() => setView("tracking")}>
            Tracking
          </button>
          <button className={`app__nav-btn ${view === "checkin" ? "app__nav-btn--active" : ""}`} onClick={() => setView("checkin")}>
            BMA Check-in
          </button>
          <button className={`app__nav-btn ${view === "registros" ? "app__nav-btn--active" : ""}`} onClick={() => setView("registros")}>
            Registros
          </button>
          {cameraTarget === "home" && (
            <button className={`app__nav-btn ${view === "camaras" ? "app__nav-btn--active" : ""}`} onClick={() => setView("camaras")}>
              Cámaras
            </button>
          )}
          {cameraTarget === "home" && (
            <button className={`app__nav-btn ${view === "recovery" ? "app__nav-btn--active" : ""}`} onClick={() => setView("recovery")}>
              Recovery
            </button>
          )}
        </nav>
        <div className="app__header-right">
          {view === "tracking" && (
            <>
              <button
                className="app__nav-btn"
                onClick={() => setSource((s) => (s === "demo" ? "live" : "demo"))}
                title="Cambiar entre motos simuladas y GPS real (Traccar)"
              >
                {source === "live" ? "Fuente: GPS real" : "Fuente: Demo"}
              </button>
              <span className={`app__status app__status--${status}`}>
                {status === "open"
                  ? source === "live"
                    ? "● EN VIVO (real)"
                    : "● EN VIVO (demo)"
                  : status === "connecting"
                    ? "○ CONECTANDO..."
                    : "○ DESCONECTADO"}
              </span>
            </>
          )}
          <div className="app__client">
            <span className="app__client-name">{account.profile.businessName}</span>
            <span className="app__client-meta">
              {account.profile.plan} · {myVehicles.length} disp.
            </span>
          </div>
          <button className="app__logout" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      {view === "flota" && isAdmin && (
        <main className="app__body app__body--single">
          <AdminFleet
            vehicles={myVehicles}
            onOpenVehicle={(vehicleId) => {
              selectVehicle(vehicleId);
              setView("tracking");
            }}
          />
        </main>
      )}

      {view === "usuarios" && isAdmin && (
        <main className="app__body app__body--single">
          <UserManager />
        </main>
      )}

      {view === "dispositivos" && isAdmin && (
        <main className="app__body app__body--single">
          <DeviceManager />
        </main>
      )}

      {view === "tracking" && (
        <main className="app__body">
          <LiveMap
            positions={myVehicles.map((v) => v.position)}
            selectedVehicleId={activeVehicleId}
            onSelectVehicle={selectVehicle}
            customizations={customizations}
            cameraTarget={cameraTarget}
          />
          <div className="app__sidebar">
            <GaugeCluster
              vehicles={myVehicles}
              selectedVehicleId={activeVehicleId}
              onSelectVehicle={selectVehicle}
              onSelectHome={selectHome}
              isHomeSelected={cameraTarget === "home"}
              accentColor={activeAccentColor}
              iconId={activeCustomization.iconId}
            />
            <TuningPanel vehicleId={activeVehicleId} customization={activeCustomization} onChange={updateCustomization} />
          </div>
        </main>
      )}

      {view === "checkin" && (
        <main className="app__body app__body--single">
          <CheckinKiosk onCheckin={addCheckin} />
        </main>
      )}

      {view === "registros" && (
        <main className="app__body app__body--single">
          <RegistrosLog records={records} />
        </main>
      )}

      {view === "camaras" && (
        <main className="app__body app__body--single">
          <CameraFeed />
        </main>
      )}

      {view === "recovery" && (
        <main className="app__body app__body--single">
          <RecoveryTimelapse />
        </main>
      )}
    </div>
  );
}
