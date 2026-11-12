import { getProjects, projectUrl, type Project } from "../../lib/projects";

/** A gallery piece: a website you can open, or a system explained with its diagram. */
export interface Piece {
  id: string;
  kind: "web" | "system";
  name: string;
  org: string;
  year: string;
  role: string;
  summary: string;
  stack: string[];
  href: string;
  project?: Project;
  /** The system, left to right, and what it stands on. */
  chain?: string[];
  base?: string;
}

export const kinds = { web: "Web", system: "Sistema" } as const;

// Lab only, in Spanish. Every fact here is already stated on the home page (path and hero); nothing new is claimed.
const systems: Piece[] = [
  {
    id: "plataforma",
    kind: "system",
    name: "La plataforma de Power Analyst",
    org: "RatedPower · Enverus",
    year: "2024",
    role: "Construcción y mantenimiento",
    summary: "El cloud donde funcionan Power Analyst y otros productos de energía: Kubernetes en AWS, definido en Terraform y con observabilidad.",
    stack: ["AWS", "Kubernetes", "Terraform", "ArgoCD", "GitHub Actions", "Grafana"],
    href: "#",
    chain: ["Commit", "GitHub Actions", "ArgoCD", "Kubernetes", "Grafana"],
    base: "Terraform · AWS",
  },
  {
    id: "agentes",
    kind: "system",
    name: "Agentes de IA en producción",
    org: "RatedPower · Enverus",
    year: "2024",
    role: "Construcción y mantenimiento",
    summary: "Agentes de IA que trabajan en producción dentro de los productos de energía, sobre Bedrock.",
    stack: ["Bedrock", "AWS"],
    href: "#",
    chain: ["Petición", "Agente", "Bedrock", "Respuesta"],
    base: "AWS",
  },
  {
    id: "backends",
    kind: "system",
    name: "Backends para clientes públicos y privados",
    org: "PwC",
    year: "2023",
    role: "Desarrollo backend",
    summary: "Servicios en Java y Spring Boot para clientes públicos y privados, en equipos ágiles.",
    stack: ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
    href: "#",
    chain: ["API", "Spring Boot", "Kafka", "PostgreSQL"],
    base: "Java",
  },
];

export async function getPieces(): Promise<Piece[]> {
  const webs: Piece[] = (await getProjects()).map((project) => ({
    id: project.id,
    kind: "web",
    name: project.data.name,
    org: project.data.client.es.split(" · ")[0],
    year: String(project.data.year),
    role: project.data.role.es,
    summary: project.data.summary.es,
    stack: [...project.data.stack, ...project.data.tools].map((s) => s.name),
    href: projectUrl(project, "es"),
    project,
  }));
  const [platform, agents, backends] = systems;
  return [platform, ...webs, agents, backends];
}
