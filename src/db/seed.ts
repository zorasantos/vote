import type { Election, Slate } from "~/domain/types";
import { db } from "./database";

export async function seedSingleSlateElection(): Promise<{
  election: Election;
  slate: Slate;
}> {
  await db.transaction(
    "rw",
    db.elections,
    db.slates,
    db.votes,
    db.voters,
    async () => {
      await db.votes.clear();
      await db.voters.clear();
      await db.slates.clear();
      await db.elections.clear();
    },
  );

  const electionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const election: Election = {
    id: electionId,
    title: "Eleição da Mesa Diretora — Gestão 2026/2028",
    associationName: "Associação Comunitária Viva Bem",
    date: new Date().toISOString().split("T")[0],
    status: "DRAFT",
    mode: "SINGLE_SLATE_APPROVAL",
    quorumBasis: "VALID_VOTES",
    allowBlankVote: true,
    createdAt: now,
  };

  const slate: Slate = {
    id: crypto.randomUUID(),
    electionId,
    number: "01",
    name: "Chapa 1 — Renovação, Ética & Transparência",
    slogan: "Unidos por uma gestão participativa e democrática.",
    members: [
      {
        id: crypto.randomUUID(),
        role: "Presidente",
        name: "João Carlos da Silva",
      },
      {
        id: crypto.randomUUID(),
        role: "Vice-Presidente",
        name: "Maria Helena dos Santos",
      },
      {
        id: crypto.randomUUID(),
        role: "1º Secretário",
        name: "Pedro Henrique Oliveira",
      },
      {
        id: crypto.randomUUID(),
        role: "2º Secretário",
        name: "Juliana Beatriz Costa",
      },
      {
        id: crypto.randomUUID(),
        role: "1º Tesoureiro",
        name: "Carlos Eduardo Souza",
      },
      {
        id: crypto.randomUUID(),
        role: "2º Tesoureiro",
        name: "Fernanda Lima Rocha",
      },
      {
        id: crypto.randomUUID(),
        role: "Conselho Fiscal — Titular",
        name: "Antônio Ferreira Lima",
      },
      {
        id: crypto.randomUUID(),
        role: "Conselho Fiscal — Titular",
        name: "Cláudia Regina Mendes",
      },
      {
        id: crypto.randomUUID(),
        role: "Conselho Fiscal — Titular",
        name: "Roberto Gonçalves Ramos",
      },
    ],
    createdAt: now,
  };

  await db.elections.add(election);
  await db.slates.add(slate);

  return { election, slate };
}
