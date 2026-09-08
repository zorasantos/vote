import { createClient } from "@supabase/supabase-js";
import type {
  Election,
  ElectionStatus,
  QuorumBasis,
  Slate,
  SlateMember,
  Vote,
  VoteChoice,
  Voter,
  VotingMode,
} from "~/domain/types";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Tipagens das linhas relacionais no PostgreSQL / Supabase (snake_case) */
export interface ElectionRow {
  id: string;
  title: string;
  association_name: string;
  association_logo: string | null;
  date: string;
  status: ElectionStatus;
  mode: VotingMode;
  quorum_basis: QuorumBasis;
  allow_blank_vote: boolean;
  total_members: number | null;
  present_members: number | null;
  security_pin_hash: string | null;
  created_at: string;
  opened_at: string | null;
  closed_at: string | null;
}

export interface SlateRow {
  id: string;
  election_id: string;
  number: string;
  name: string;
  slogan: string | null;
  members: SlateMember[];
  created_at: string;
}

export interface VoteRow {
  id: string;
  election_id: string;
  choice: VoteChoice;
  created_at: string;
}

export interface VoterRow {
  id: string;
  election_id: string;
  name: string;
  document: string | null;
  has_voted: boolean;
  registered_at: string;
  presence_confirmed_at: string | null;
}

/** Mappers: Banco (snake_case) <-> Domínio Frontend (camelCase) */

export function mapElectionFromRow(row: ElectionRow): Election {
  return {
    id: row.id,
    title: row.title,
    associationName: row.association_name,
    associationLogo: row.association_logo ?? undefined,
    date: row.date,
    status: row.status,
    mode: row.mode,
    quorumBasis: row.quorum_basis,
    allowBlankVote: row.allow_blank_vote,
    totalMembers: row.total_members ?? undefined,
    presentMembers: row.present_members ?? undefined,
    securityPinHash: row.security_pin_hash ?? undefined,
    createdAt: row.created_at,
    openedAt: row.opened_at ?? undefined,
    closedAt: row.closed_at ?? undefined,
  };
}

export function mapElectionToRow(
  election: Partial<Election>,
): Partial<ElectionRow> {
  const row: Partial<ElectionRow> = {};
  if (election.id !== undefined) row.id = election.id;
  if (election.title !== undefined) row.title = election.title;
  if (election.associationName !== undefined)
    row.association_name = election.associationName;
  if (election.associationLogo !== undefined)
    row.association_logo = election.associationLogo;
  if (election.date !== undefined) row.date = election.date;
  if (election.status !== undefined) row.status = election.status;
  if (election.mode !== undefined) row.mode = election.mode;
  if (election.quorumBasis !== undefined)
    row.quorum_basis = election.quorumBasis;
  if (election.allowBlankVote !== undefined)
    row.allow_blank_vote = election.allowBlankVote;
  if (election.totalMembers !== undefined)
    row.total_members = election.totalMembers;
  if (election.presentMembers !== undefined)
    row.present_members = election.presentMembers;
  if (election.securityPinHash !== undefined)
    row.security_pin_hash = election.securityPinHash;
  if (election.createdAt !== undefined) row.created_at = election.createdAt;
  if (election.openedAt !== undefined) row.opened_at = election.openedAt;
  if (election.closedAt !== undefined) row.closed_at = election.closedAt;
  return row;
}

export function mapSlateFromRow(row: SlateRow): Slate {
  return {
    id: row.id,
    electionId: row.election_id,
    number: row.number,
    name: row.name,
    slogan: row.slogan ?? undefined,
    members: Array.isArray(row.members) ? row.members : [],
    createdAt: row.created_at,
  };
}

export function mapSlateToRow(slate: Partial<Slate>): Partial<SlateRow> {
  const row: Partial<SlateRow> = {};
  if (slate.id !== undefined) row.id = slate.id;
  if (slate.electionId !== undefined) row.election_id = slate.electionId;
  if (slate.number !== undefined) row.number = slate.number;
  if (slate.name !== undefined) row.name = slate.name;
  if (slate.slogan !== undefined) row.slogan = slate.slogan;
  if (slate.members !== undefined) row.members = slate.members;
  if (slate.createdAt !== undefined) row.created_at = slate.createdAt;
  return row;
}

export function mapVoteFromRow(row: VoteRow): Vote {
  return {
    id: row.id,
    electionId: row.election_id,
    choice: row.choice,
    createdAt: row.created_at,
  };
}

export function mapVoteToRow(vote: Partial<Vote>): Partial<VoteRow> {
  const row: Partial<VoteRow> = {};
  if (vote.id !== undefined) row.id = vote.id;
  if (vote.electionId !== undefined) row.election_id = vote.electionId;
  if (vote.choice !== undefined) row.choice = vote.choice;
  if (vote.createdAt !== undefined) row.created_at = vote.createdAt;
  return row;
}

export function mapVoterFromRow(row: VoterRow): Voter {
  return {
    id: row.id,
    electionId: row.election_id,
    name: row.name,
    document: row.document ?? undefined,
    hasVoted: row.has_voted,
    registeredAt: row.registered_at,
    presenceConfirmedAt: row.presence_confirmed_at ?? undefined,
  };
}

export function mapVoterToRow(voter: Partial<Voter>): Partial<VoterRow> {
  const row: Partial<VoterRow> = {};
  if (voter.id !== undefined) row.id = voter.id;
  if (voter.electionId !== undefined) row.election_id = voter.electionId;
  if (voter.name !== undefined) row.name = voter.name;
  if (voter.document !== undefined) row.document = voter.document;
  if (voter.hasVoted !== undefined) row.has_voted = voter.hasVoted;
  if (voter.registeredAt !== undefined) row.registered_at = voter.registeredAt;
  if (voter.presenceConfirmedAt !== undefined)
    row.presence_confirmed_at = voter.presenceConfirmedAt;
  return row;
}
