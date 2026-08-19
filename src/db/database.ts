import Dexie, { type Table } from "dexie";
import type { Election, Slate, Vote, Voter } from "~/domain/types";

export class VotingDatabase extends Dexie {
  elections!: Table<Election, string>;
  slates!: Table<Slate, string>;
  votes!: Table<Vote, string>;
  voters!: Table<Voter, string>;

  constructor() {
    super("VotingSystemDB");
    this.version(1).stores({
      elections: "id, status, date",
      slates: "id, electionId, number",
      votes: "id, electionId, createdAt",
      voters: "id, electionId, hasVoted, document",
    });
  }
}

export const db = new VotingDatabase();
