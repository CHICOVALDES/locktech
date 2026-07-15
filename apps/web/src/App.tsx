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
import { LandingPage } from "./features/landing/LandingPage.js";
import { AdminFleet } from "./features/admin/AdminFleet.js";
import { ClientsOverview } from "./features/admin/ClientsOverview.js";
import { DeviceManager } from "./features/admin/DeviceManager.js";
import { UserManager } from "./features/admin/UserManager.js";
import { BtLogo } from "./components/BtLogo.js";
import { ObrasDashboard } from "./features/buildtrack/ObrasDashboard.js";
import { LanguageSwitcher } from "./i18n/LanguageSwitcher.js";
import { useI18n } from "./i18n/I18nProvider.js";

type View = "flota" | "usuarios" | "dispositivos" | "tracking" | "checkin" | "registros" | "camaras" | "recovery" | "obras";

export function App() {
  const { t } = useI18n();
  const { account, login, register, logout } = useAuth();
  // Fuente de datos: "demo" = motos simuladas; "live" = GPS real vía Traccar.
  const [source, setSource] = useState<"demo" | "live">("demo");
  const { vehicles, status } = useRealtimePositions(source === "live" ? "/realtime/live" : "/realtime/demo");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<"home" | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, VehicleCustomization>>({});
  const [view, setView] = useState<View>("tracking");
  // Landing de presentación: se ve al entrar, antes del login (una vez por carga).
  const [showLanding, setShowLanding] = useState(true);
  const { records, addCheckin } = useCheckinLog();

  const isAdmin = account?.role === "admin";

  // Al iniciar sesión: admin → flota; cliente con motos → tracking; cliente sin
  // dispositivos (ej. restaurante La Parada, solo monitoreo) → directo a Cámaras.
  useEffect(() => {
    if (!account) return;
    if (account.role === "admin") setView("flota");
    else setView(account.devices.length === 0 ? "camaras" : "tracking");
  }, [account]);

  // Landing de presentación antes del login (solo si no hay sesión activa).
  if (!account && showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

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

  // Herramientas de monitoreo (BuildTrack / Cámaras / Recovery): visibles al
  // seleccionar la casa en Tracking, o siempre para clientes sin motos (ej. el
  // restaurante La Parada, que es solo monitoreo por cámara).
  const showHouseTools = cameraTarget === "home" || (!isAdmin && account.devices.length === 0);

  function updateCustomization(next: VehicleCustomization) {
    if (!activeVehicleId) return;
    setCustomizations((prev) => ({ ...prev, [activeVehicleId]: next }));
  }

  function selectVehicle(vehicleId: string) {
    setCameraTarget(null);
    setSelectedVehicleId(vehicleId);
  }

  function selectHome() {
    // Entrar a "la Casa" = entrar a BuildTrack (monitoreo de obras). Además deja
    // visibles las herramientas de la casa (BuildTrack / Cámaras / Recovery).
    setCameraTarget("home");
    setView("obras");
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo">
          <BtLogo height={26} />
          <span className="app__logo-name">BUILD TRACKING</span>
        </span>
        <nav className="app__nav">
          {isAdmin && (
            <button className={`app__nav-btn ${view === "flota" ? "app__nav-btn--active" : ""}`} onClick={() => setView("flota")}>
              {t("nav.fleet")}
            </button>
          )}
          {isAdmin && (
            <button className={`app__nav-btn ${view === "usuarios" ? "app__nav-btn--active" : ""}`} onClick={() => setView("usuarios")}>
              {t("nav.users")}
            </button>
          )}
          {isAdmin && (
            <button className={`app__nav-btn ${view === "dispositivos" ? "app__nav-btn--active" : ""}`} onClick={() => setView("dispositivos")}>
              {t("nav.devices")}
            </button>
          )}
          {/* Tracking / Check-in / Registros son operativos del CLIENTE. El admin
              gestiona (clientes, unidades, GPS, cámaras, usuarios), no opera. */}
          {!isAdmin && (
            <>
              <button className={`app__nav-btn ${view === "tracking" ? "app__nav-btn--active" : ""}`} onClick={() => setView("tracking")}>
                {t("nav.tracking")}
              </button>
              <button className={`app__nav-btn ${view === "checkin" ? "app__nav-btn--active" : ""}`} onClick={() => setView("checkin")}>
                {t("nav.checkin")}
              </button>
              <button className={`app__nav-btn ${view === "registros" ? "app__nav-btn--active" : ""}`} onClick={() => setView("registros")}>
                {t("nav.records")}
              </button>
            </>
          )}
          {/* Herramientas de monitoreo — al seleccionar la casa, o siempre para
              clientes sin motos (restaurante La Parada). */}
          {showHouseTools && (
            <>
              <span className="app__nav-divider" aria-hidden="true" />
              <button
                className={`app__nav-btn app__nav-btn--bt ${view === "obras" ? "app__nav-btn--active" : ""}`}
                onClick={() => setView("obras")}
              >
                {t("nav.buildtrack")}
              </button>
              <button className={`app__nav-btn ${view === "camaras" ? "app__nav-btn--active" : ""}`} onClick={() => setView("camaras")}>
                {t("nav.cameras")}
              </button>
              <button className={`app__nav-btn ${view === "recovery" ? "app__nav-btn--active" : ""}`} onClick={() => setView("recovery")}>
                {t("nav.recovery")}
              </button>
            </>
          )}
        </nav>
        <div className="app__header-right">
          {view === "tracking" && (
            <>
              <button
                className="app__nav-btn"
                onClick={() => setSource((s) => (s === "demo" ? "live" : "demo"))}
                title={t("header.sourceTitle")}
              >
                {source === "live" ? t("header.sourceReal") : t("header.sourceDemo")}
              </button>
              <span className={`app__status app__status--${status}`}>
                {status === "open"
                  ? source === "live"
                    ? t("status.liveReal")
                    : t("status.liveDemo")
                  : status === "connecting"
                    ? t("status.connecting")
                    : t("status.disconnected")}
              </span>
            </>
          )}
          <div className="app__client">
            <span className="app__client-name">{account.profile.businessName}</span>
            <span className="app__client-meta">
              {account.profile.plan} · {myVehicles.length} {t("header.devicesShort")}
            </span>
          </div>
          <LanguageSwitcher />
          <button className="app__logout" onClick={logout}>
            {t("header.logout")}
          </button>
        </div>
      </header>

      {view === "flota" && isAdmin && (
        <main className="app__body app__body--single">
          <ClientsOverview
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
          <CameraFeed clientUsername={account.username} />
        </main>
      )}

      {view === "recovery" && (
        <main className="app__body app__body--single">
          <RecoveryTimelapse />
        </main>
      )}

      {view === "obras" && (
        <main className="app__body app__body--single">
          <ObrasDashboard clientUsername={account.username} isAdmin={isAdmin} />
        </main>
      )}
    </div>
  );
}
