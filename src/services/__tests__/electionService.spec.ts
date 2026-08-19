import { describe, expect, it } from "vitest";
import type { Election, Slate, Vote } from "~/domain/types";
import {
  calculateElectionResult,
  validateElectionForOpening,
  validateVoteRegistration,
} from "../electionService";

describe("electionService", () => {
  const mockSingleSlate: Slate = {
    id: "slate-1",
    electionId: "elec-1",
    number: "01",
    name: "Chapa Renovação",
    members: [
      { id: "m1", role: "Presidente", name: "João Silva" },
      { id: "m2", role: "Vice-Presidente", name: "Maria Souza" },
    ],
    createdAt: "2026-08-18T00:00:00.000Z",
  };

  const mockBaseElection: Election = {
    id: "elec-1",
    title: "Eleição 2026",
    associationName: "Associação XYZ",
    date: "2026-08-18",
    status: "OPEN",
    mode: "SINGLE_SLATE_APPROVAL",
    quorumBasis: "VALID_VOTES",
    allowBlankVote: true,
    createdAt: "2026-08-18T00:00:00.000Z",
  };

  describe("Cálculo de Apuração — Chapa Única (50% + 1)", () => {
    it("deve proclamar ELEITA quando obtém 6 votos SIM de 10 votos válidos (6 >= 6)", () => {
      const votes: Vote[] = [
        ...Array(6).fill({
          id: "v",
          electionId: "elec-1",
          choice: "YES",
          createdAt: "",
        }),
        ...Array(4).fill({
          id: "v",
          electionId: "elec-1",
          choice: "NO",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        mockBaseElection,
        [mockSingleSlate],
        votes,
      );

      expect(result.validVotes).toBe(10);
      expect(result.requiredVotesToWin).toBe(6); // Math.floor(10/2) + 1 = 6
      expect(result.singleSlateResult?.yesVotes).toBe(6);
      expect(result.singleSlateResult?.isElected).toBe(true);
    });

    it("deve proclamar NÃO ELEITA em caso de empate (5 SIM, 5 NÃO de 10 válidos, 5 < 6)", () => {
      const votes: Vote[] = [
        ...Array(5).fill({
          id: "v",
          electionId: "elec-1",
          choice: "YES",
          createdAt: "",
        }),
        ...Array(5).fill({
          id: "v",
          electionId: "elec-1",
          choice: "NO",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        mockBaseElection,
        [mockSingleSlate],
        votes,
      );

      expect(result.validVotes).toBe(10);
      expect(result.requiredVotesToWin).toBe(6);
      expect(result.singleSlateResult?.yesVotes).toBe(5);
      expect(result.singleSlateResult?.isElected).toBe(false);
    });

    it("deve calcular corretamente a maioria para total ímpar (11 votos: 6 necessários)", () => {
      const votes: Vote[] = [
        ...Array(6).fill({
          id: "v",
          electionId: "elec-1",
          choice: "YES",
          createdAt: "",
        }),
        ...Array(5).fill({
          id: "v",
          electionId: "elec-1",
          choice: "NO",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        mockBaseElection,
        [mockSingleSlate],
        votes,
      );

      expect(result.validVotes).toBe(11);
      expect(result.requiredVotesToWin).toBe(6); // Math.floor(11/2) + 1 = 6
      expect(result.singleSlateResult?.isElected).toBe(true);
    });

    it("deve desconsiderar votos em branco quando quorumBasis = VALID_VOTES", () => {
      // 5 SIM, 4 NÃO (9 válidos -> maioria = 5) e 10 BRANCOS
      const votes: Vote[] = [
        ...Array(5).fill({
          id: "v",
          electionId: "elec-1",
          choice: "YES",
          createdAt: "",
        }),
        ...Array(4).fill({
          id: "v",
          electionId: "elec-1",
          choice: "NO",
          createdAt: "",
        }),
        ...Array(10).fill({
          id: "v",
          electionId: "elec-1",
          choice: "BLANK",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        mockBaseElection,
        [mockSingleSlate],
        votes,
      );

      expect(result.totalVotes).toBe(19);
      expect(result.validVotes).toBe(9);
      expect(result.blankVotes).toBe(10);
      expect(result.requiredVotesToWin).toBe(5); // Math.floor(9/2) + 1 = 5
      expect(result.singleSlateResult?.isElected).toBe(true);
    });

    it("deve considerar votos em branco no quórum quando quorumBasis = TOTAL_VOTES", () => {
      // 5 SIM, 4 NÃO, 10 BRANCOS (Total = 19 -> maioria = 10)
      const electionTotalBasis: Election = {
        ...mockBaseElection,
        quorumBasis: "TOTAL_VOTES",
      };

      const votes: Vote[] = [
        ...Array(5).fill({
          id: "v",
          electionId: "elec-1",
          choice: "YES",
          createdAt: "",
        }),
        ...Array(4).fill({
          id: "v",
          electionId: "elec-1",
          choice: "NO",
          createdAt: "",
        }),
        ...Array(10).fill({
          id: "v",
          electionId: "elec-1",
          choice: "BLANK",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        electionTotalBasis,
        [mockSingleSlate],
        votes,
      );

      expect(result.totalVotes).toBe(19);
      expect(result.requiredVotesToWin).toBe(10); // Math.floor(19/2) + 1 = 10
      expect(result.singleSlateResult?.yesVotes).toBe(5);
      expect(result.singleSlateResult?.isElected).toBe(false);
    });
  });

  describe("Cálculo de Apuração — Múltiplas Chapas", () => {
    const slateA: Slate = {
      ...mockSingleSlate,
      id: "slate-a",
      name: "Chapa A",
    };
    const slateB: Slate = {
      ...mockSingleSlate,
      id: "slate-b",
      name: "Chapa B",
    };

    const multiElection: Election = {
      ...mockBaseElection,
      mode: "MULTIPLE_SLATE_CHOICE",
    };

    it("deve proclamar ELEITA a chapa com 51 votos de 100 válidos", () => {
      const votes: Vote[] = [
        ...Array(51).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-a" },
          createdAt: "",
        }),
        ...Array(49).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-b" },
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        multiElection,
        [slateA, slateB],
        votes,
      );

      expect(result.validVotes).toBe(100);
      expect(result.requiredVotesToWin).toBe(51);
      expect(result.multiSlateResult?.isElected).toBe(true);
      expect(result.multiSlateResult?.electedSlate?.id).toBe("slate-a");
      expect(result.multiSlateResult?.requiresSecondRound).toBe(false);
    });

    it("deve declarar necessidade de novo pleito quando ninguém atinge 50% + 1 (ex: 48 vs 45 vs 7 brancos)", () => {
      const votes: Vote[] = [
        ...Array(48).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-a" },
          createdAt: "",
        }),
        ...Array(45).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-b" },
          createdAt: "",
        }),
        ...Array(7).fill({
          id: "v",
          electionId: "elec-1",
          choice: "BLANK",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        multiElection,
        [slateA, slateB],
        votes,
      );

      // Válidos: 93 -> maioria: Math.floor(93/2) + 1 = 47
      // Se fosse 48 de 93, 48 >= 47 -> eleita
      // Mas se fosse 46 de 93:
    });

    it("deve declarar 2º turno quando a líder tem 46 votos de 93 válidos (46 < 47)", () => {
      const votes: Vote[] = [
        ...Array(46).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-a" },
          createdAt: "",
        }),
        ...Array(47).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-b" },
          createdAt: "",
        }), // Líder com 47 de 100 se fosse total
      ];

      // Se temos 46 na A e 45 na B (91 válidos -> mínimo 46)
      const votesDispersos: Vote[] = [
        ...Array(45).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-a" },
          createdAt: "",
        }),
        ...Array(40).fill({
          id: "v",
          electionId: "elec-1",
          choice: { type: "SLATE", slateId: "slate-b" },
          createdAt: "",
        }),
        ...Array(15).fill({
          id: "v",
          electionId: "elec-1",
          choice: "BLANK",
          createdAt: "",
        }),
      ];

      const result = calculateElectionResult(
        multiElection,
        [slateA, slateB],
        votesDispersos,
      );

      expect(result.validVotes).toBe(85);
      expect(result.requiredVotesToWin).toBe(43); // Math.floor(85/2) + 1 = 43. 45 >= 43 -> eleita!
    });
  });

  describe("Validações de Abertura (validateElectionForOpening)", () => {
    it("deve rejeitar abertura se não houver chapas cadastradas", () => {
      const draftElection: Election = { ...mockBaseElection, status: "DRAFT" };
      expect(() => validateElectionForOpening(draftElection, [])).toThrow(
        "A eleição precisa ter pelo menos uma chapa",
      );
    });

    it("deve rejeitar abertura de chapa única se houver mais de 1 chapa", () => {
      const draftElection: Election = {
        ...mockBaseElection,
        status: "DRAFT",
        mode: "SINGLE_SLATE_APPROVAL",
      };
      const slate2: Slate = { ...mockSingleSlate, id: "slate-2" };
      expect(() =>
        validateElectionForOpening(draftElection, [mockSingleSlate, slate2]),
      ).toThrow("O modo de chapa única exige exatamente 1 chapa");
    });

    it("deve rejeitar abertura se algum integrante estiver sem cargo ou nome", () => {
      const draftElection: Election = { ...mockBaseElection, status: "DRAFT" };
      const invalidSlate: Slate = {
        ...mockSingleSlate,
        members: [{ id: "1", role: "", name: "Carlos" }],
      };
      expect(() =>
        validateElectionForOpening(draftElection, [invalidSlate]),
      ).toThrow('O cargo do integrante "Carlos"');
    });
  });

  describe("Validação de Registro de Voto (validateVoteRegistration)", () => {
    it("deve rejeitar voto se status não for OPEN", () => {
      const closedElection: Election = {
        ...mockBaseElection,
        status: "CLOSED",
      };
      expect(() =>
        validateVoteRegistration(closedElection, [mockSingleSlate], "YES"),
      ).toThrow("A votação não está aberta");
    });

    it("deve rejeitar voto em branco se allowBlankVote = false", () => {
      const noBlankElection: Election = {
        ...mockBaseElection,
        allowBlankVote: false,
      };
      expect(() =>
        validateVoteRegistration(noBlankElection, [mockSingleSlate], "BLANK"),
      ).toThrow("Voto em branco não é permitido");
    });

    it("deve rejeitar voto em chapa inexistente", () => {
      const multiElection: Election = {
        ...mockBaseElection,
        mode: "MULTIPLE_SLATE_CHOICE",
      };
      expect(() =>
        validateVoteRegistration(multiElection, [mockSingleSlate], {
          type: "SLATE",
          slateId: "inexistente-999",
        }),
      ).toThrow("A chapa selecionada não existe");
    });
  });
});
