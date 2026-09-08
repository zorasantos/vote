import type { Election, Slate } from "~/domain/types";
import { mapElectionToRow, mapSlateToRow, supabase } from "./supabase";

export async function seedSingleSlateElection(): Promise<{
  election: Election;
  slate: Slate;
}> {
  // Limpa tabelas no Supabase
  await supabase
    .from("votes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("voters")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("slates")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("elections")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const electionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const election: Election = {
    id: electionId,
    title: "Eleição da Mesa Diretora — Biênio 2026/2028",
    associationName: "Associação Cearense de Escritores - ACE",
    associationLogo: "/ace-logo.jpg",
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

  const electionRow = mapElectionToRow(election);
  const slateRow = mapSlateToRow(slate);

  const { error: electionError } = await supabase
    .from("elections")
    .insert(electionRow);
  if (electionError)
    throw new Error(`Falha ao criar eleição: ${electionError.message}`);

  const { error: slateError } = await supabase.from("slates").insert(slateRow);
  if (slateError)
    throw new Error(`Falha ao criar chapa: ${slateError.message}`);

  return { election, slate };
}
