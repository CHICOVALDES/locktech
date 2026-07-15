import type { Project } from "@bali-moto-track/shared-types";

// Propiedad de obras: qué cliente es dueño de cada obra. Un cliente ve SOLO sus
// obras; el admin ve todas; un usuario NUEVO no ve ninguna hasta que se le asigne.
// Las obras demo pertenecen a la cuenta de demostración "mrrental".
export const PROJECT_OWNERS: Record<string, string> = {
  "villa-uluwatu": "mrrental",
  "villa-canggu": "mrrental",
  "villa-ubud": "mrrental",
};

// Filtra las obras visibles para un usuario: admin ve todas; cada cliente ve
// solo las que le pertenecen (por PROJECT_OWNERS). Nuevo usuario => ninguna.
export function visibleProjects(projects: Project[], username: string, isAdmin: boolean): Project[] {
  if (isAdmin) return projects;
  return projects.filter((p) => PROJECT_OWNERS[p.id] === username);
}
