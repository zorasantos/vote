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
    title: "Votação da Mesa Diretora",
    associationName: "Associação de Moradores",
    date: new Date().toISOString().split("T")[0],
    status: "DRAFT",
    mode: "SINGLE_SLATE_APPROVAL",
    quorumBasis: "VALID_VOTES",
    allowBlankVote: false,
    totalMembers: 100,
    presentMembers: 60,
    createdAt: now,
  };

  const slate: Slate = {
    id: crypto.randomUUID(),
    electionId,
    number: "01",
    name: "Chapa 01",
    slogan: "Chapa Oficial de Candidatura",
    members: [],
    createdAt: now,
  };

  await db.elections.add(election);
  await db.slates.add(slate);

  return { election, slate };
}
