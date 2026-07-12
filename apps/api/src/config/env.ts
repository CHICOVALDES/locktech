function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/bali_moto_track"),
  redisUrl: required("REDIS_URL", "redis://localhost:6379"),
  traccarApiUrl: required("TRACCAR_API_URL", "http://localhost:8082"),
  // Puerto TCP donde escuchamos a los trackers GPS reales (protocolo H02, ej.
  // SinoTrack ST-901). El equipo se apunta acá por SMS. Sin Traccar de por medio.
  gpsTcpPort: Number(process.env.GPS_TCP_PORT ?? 5013),
};
