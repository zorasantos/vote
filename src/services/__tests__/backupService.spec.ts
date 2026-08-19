import { describe, expect, it } from "vitest";
import type { Election, Slate, Vote } from "~/domain/types";
import { createElectionBackup, validateElectionBackup } from "../backupService";

describe("backupService", () => {
  const mockElection: Election = {
    id: "elec-123",
    title: "Eleição 2026",
    associationName: "Associação dos Moradores",
    date: "2026-08-18",
    status: "CLOSED",
    mode: "SINGLE_SLATE_APPROVAL",
    quorumBasis: "VALID_VOTES",
    allowBlankVote: true,
    createdAt: "2026-08-18T10:00:00.000Z",
  };

  const mockSlates: Slate[] = [
    {
      id: "slate-1",
      electionId: "elec-123",
      number: "01",
      name: "Chapa Renovação",
      members: [{ id: "m1", role: "Presidente", name: "João Silva" }],
      createdAt: "2026-08-18T10:00:00.000Z",
    },
  ];

  const mockVotes: Vote[] = [
    {
      id: "v1",
      electionId: "elec-123",
      choice: "YES",
      createdAt: "2026-08-18T10:10:00.000Z",
    },
    {
      id: "v2",
      electionId: "elec-123",
      choice: "NO",
      createdAt: "2026-08-18T10:12:00.000Z",
    },
  ];

  it("deve gerar um backup íntegro e validá-lo com sucesso", async () => {
    const backup = await createElectionBackup(
      mockElection,
      mockSlates,
      mockVotes,
    );

    expect(backup.version).toBe(1);
    expect(backup.dataHash).toMatch(/^[a-f0-9]{64}$/);

    const validated = await validateElectionBackup(backup);
    expect(validated.election.id).toBe("elec-123");
  });

  it("deve rejeitar backup corrompido com hash adulterado", async () => {
    const backup = await createElectionBackup(
      mockElection,
      mockSlates,
      mockVotes,
    );

    // Adulterando dados sem atualizar o hash
    backup.votes.push({
      id: "v3",
      electionId: "elec-123",
      choice: "YES",
      createdAt: "2026-08-18T10:15:00.000Z",
    });

    await expect(validateElectionBackup(backup)).rejects.toThrow(
      "Falha de integridade",
    );
  });

  it("deve rejeitar backup com versão incompatível", async () => {
    const backup: any = {
      version: 2,
      election: mockElection,
      slates: [],
      votes: [],
    };
    await expect(validateElectionBackup(backup)).rejects.toThrow(
      "Versão de backup incompatível",
    );
  });
});
