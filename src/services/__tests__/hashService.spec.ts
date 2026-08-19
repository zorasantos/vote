import { describe, expect, it } from "vitest";
import type { Election, Slate, Vote } from "~/domain/types";
import { canonicalStringify, computeDatasetHash } from "../hashService";

describe("hashService", () => {
  it("canonicalStringify deve produzir a mesma string para objetos com chaves em ordens diferentes", () => {
    const objA = { z: 1, a: 2, m: { y: "test", b: true } };
    const objB = { a: 2, m: { b: true, y: "test" }, z: 1 };

    expect(canonicalStringify(objA)).toBe(canonicalStringify(objB));
    expect(canonicalStringify(objA)).toBe(
      '{"a":2,"m":{"b":true,"y":"test"},"z":1}',
    );
  });

  it("computeDatasetHash deve calcular um SHA-256 válido em formato hexadecimal de 64 caracteres", async () => {
    const mockElection: Election = {
      id: "elec-1",
      title: "Eleição 2026",
      associationName: "Associação Teste",
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
        electionId: "elec-1",
        number: "01",
        name: "Chapa 1",
        members: [{ id: "m1", role: "Presidente", name: "João" }],
        createdAt: "2026-08-18T10:00:00.000Z",
      },
    ];

    const mockVotes: Vote[] = [
      {
        id: "v1",
        electionId: "elec-1",
        choice: "YES",
        createdAt: "2026-08-18T10:05:00.000Z",
      },
      {
        id: "v2",
        electionId: "elec-1",
        choice: "NO",
        createdAt: "2026-08-18T10:06:00.000Z",
      },
    ];

    const hash1 = await computeDatasetHash(mockElection, mockSlates, mockVotes);

    expect(hash1).toMatch(/^[a-f0-9]{64}$/);

    // O mesmo dataset deve gerar exatamente o mesmo hash
    const hash2 = await computeDatasetHash(mockElection, mockSlates, mockVotes);
    expect(hash1).toBe(hash2);

    // Alterando apenas 1 voto no dataset deve produzir um hash diferente
    const alteredVotes: Vote[] = [
      {
        id: "v1",
        electionId: "elec-1",
        choice: "YES",
        createdAt: "2026-08-18T10:05:00.000Z",
      },
      {
        id: "v2",
        electionId: "elec-1",
        choice: "YES",
        createdAt: "2026-08-18T10:06:00.000Z",
      }, // alterado de NO para YES
    ];

    const alteredHash = await computeDatasetHash(
      mockElection,
      mockSlates,
      alteredVotes,
    );
    expect(alteredHash).not.toBe(hash1);
  });
});
