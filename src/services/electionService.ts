import type {
  Election,
  ElectionResult,
  Slate,
  Vote,
  VoteChoice,
} from "~/domain/types";

/**
 * Checklist de validação rigorosa para abertura da eleição (DRAFT -> OPEN).
 * Garante que a eleição e suas chapas estejam íntegras antes do início da votação.
 */
export function validateElectionForOpening(
  election: Election | null | undefined,
  slates: Slate[],
): void {
  if (!election) {
    throw new Error("Nenhuma eleição ativa encontrada para abertura.");
  }

  if (election.status !== "DRAFT") {
    throw new Error(
      `Apenas eleições com status 'DRAFT' podem ser abertas. Status atual: ${election.status}.`,
    );
  }

  if (!election.associationName || !election.associationName.trim()) {
    throw new Error("O nome da associação é obrigatório para abrir a votação.");
  }

  if (!election.title || !election.title.trim()) {
    throw new Error("O título da eleição é obrigatório para abrir a votação.");
  }

  if (!election.date || !election.date.trim()) {
    throw new Error("A data da eleição deve estar devidamente definida.");
  }

  if (
    election.quorumBasis !== "VALID_VOTES" &&
    election.quorumBasis !== "TOTAL_VOTES"
  ) {
    throw new Error(
      "A base de quórum de maioria absoluta deve ser definida como VALID_VOTES ou TOTAL_VOTES.",
    );
  }

  if (!slates || slates.length === 0) {
    throw new Error(
      "A eleição precisa ter pelo menos uma chapa cadastrada antes de ser aberta.",
    );
  }

  if (election.mode === "SINGLE_SLATE_APPROVAL") {
    if (slates.length !== 1) {
      throw new Error(
        `O modo de chapa única exige exatamente 1 chapa cadastrada. Encontradas: ${slates.length}.`,
      );
    }
  } else if (election.mode === "MULTIPLE_SLATE_CHOICE") {
    if (slates.length < 2) {
      throw new Error(
        `O modo de múltiplas chapas exige pelo menos 2 chapas cadastradas. Encontradas: ${slates.length}.`,
      );
    }
  } else {
    throw new Error("Modo de votação inválido ou não suportado.");
  }

  for (const slate of slates) {
    if (!slate.name || !slate.name.trim()) {
      throw new Error(
        `A chapa número "${slate.number || "N/A"}" precisa ter um nome preenchido.`,
      );
    }

    if (!slate.members || slate.members.length === 0) {
      throw new Error(
        `A chapa "${slate.name}" precisa de pelo menos um integrante (ex: Presidente) cadastrado.`,
      );
    }

    for (const member of slate.members) {
      if (!member.name || !member.name.trim()) {
        throw new Error(
          `Existe um integrante sem nome cadastrado na chapa "${slate.name}".`,
        );
      }
      if (!member.role || !member.role.trim()) {
        throw new Error(
          `O cargo do integrante "${member.name}" na chapa "${slate.name}" não foi preenchido.`,
        );
      }
    }
  }
}

/**
 * Validação defensiva no momento do registro do voto.
 */
export function validateVoteRegistration(
  election: Election,
  slates: Slate[],
  choice: VoteChoice,
): void {
  if (election.status !== "OPEN") {
    throw new Error(
      "A votação não está aberta. Não é possível registrar votos.",
    );
  }

  if (choice === "BLANK" && !election.allowBlankVote) {
    throw new Error("Voto em branco não é permitido nesta eleição.");
  }

  if (election.mode === "SINGLE_SLATE_APPROVAL") {
    if (choice !== "YES" && choice !== "NO" && choice !== "BLANK") {
      throw new Error("Opção de voto inválida para eleição de chapa única.");
    }
  } else if (election.mode === "MULTIPLE_SLATE_CHOICE") {
    if (choice === "YES" || choice === "NO") {
      throw new Error(
        "Opção SIM/NÃO inválida para eleição de múltiplas chapas.",
      );
    }

    if (typeof choice === "object" && choice.type === "SLATE") {
      const slateExists = slates.some((s) => s.id === choice.slateId);
      if (!slateExists) {
        throw new Error("A chapa selecionada não existe nesta eleição.");
      }
    }
  }
}

/**
 * Função pura e determinística que calcula a apuração e aplica a regra de maioria absoluta (50% + 1).
 */
export function calculateElectionResult(
  election: Election,
  slates: Slate[],
  votes: Vote[],
): ElectionResult {
  const totalVotes = votes.length;
  let blankVotes = 0;
  let validVotes = 0;

  if (election.mode === "SINGLE_SLATE_APPROVAL") {
    let yesVotes = 0;
    let noVotes = 0;

    for (const vote of votes) {
      if (vote.choice === "YES") {
        yesVotes++;
      } else if (vote.choice === "NO") {
        noVotes++;
      } else if (vote.choice === "BLANK") {
        blankVotes++;
      }
    }

    validVotes = yesVotes + noVotes;
    const baseVotes =
      election.quorumBasis === "VALID_VOTES" ? validVotes : totalVotes;
    const requiredVotesToWin =
      baseVotes > 0 ? Math.floor(baseVotes / 2) + 1 : 1;
    const isElected = yesVotes >= requiredVotesToWin && baseVotes > 0;
    const targetSlate = slates[0];

    const yesDenominator =
      election.quorumBasis === "VALID_VOTES"
        ? validVotes || 1
        : totalVotes || 1;
    const yesPct = totalVotes > 0 ? (yesVotes / yesDenominator) * 100 : 0;
    const noPct = totalVotes > 0 ? (noVotes / yesDenominator) * 100 : 0;
    const blankPct =
      totalVotes > 0 ? (blankVotes / (totalVotes || 1)) * 100 : 0;

    const proclamationText = isElected
      ? `CHAPA ELEITA: A "${targetSlate?.name || "Chapa"}" obteve ${yesVotes} votos favoráveis (${yesPct.toFixed(1)}%), atingindo a maioria absoluta necessária de ${requiredVotesToWin} votos.`
      : `CHAPA NÃO ELEITA: A "${targetSlate?.name || "Chapa"}" obteve ${yesVotes} votos favoráveis, não atingindo a maioria absoluta mínima de ${requiredVotesToWin} votos exigida pelo estatuto.`;

    return {
      electionId: election.id,
      calculatedAt: new Date().toISOString(),
      dataHash: "",
      totalVotes,
      validVotes,
      blankVotes,
      quorumBasis: election.quorumBasis,
      requiredVotesToWin,
      mode: election.mode,
      singleSlateResult: {
        slate: targetSlate,
        yesVotes,
        noVotes,
        yesPercentage: Number(yesPct.toFixed(2)),
        noPercentage: Number(noPct.toFixed(2)),
        blankPercentage: Number(blankPct.toFixed(2)),
        isElected,
        proclamationText,
      },
    };
  } else {
    // Modo Múltiplas Chapas
    const tallyMap = new Map<string, number>();
    for (const slate of slates) {
      tallyMap.set(slate.id, 0);
    }

    for (const vote of votes) {
      if (typeof vote.choice === "object" && vote.choice.type === "SLATE") {
        const current = tallyMap.get(vote.choice.slateId) || 0;
        tallyMap.set(vote.choice.slateId, current + 1);
        validVotes++;
      } else if (vote.choice === "BLANK") {
        blankVotes++;
      }
    }

    const baseVotes =
      election.quorumBasis === "VALID_VOTES" ? validVotes : totalVotes;
    const requiredVotesToWin =
      baseVotes > 0 ? Math.floor(baseVotes / 2) + 1 : 1;

    const slatesTally = slates
      .map((slate) => {
        const vCount = tallyMap.get(slate.id) || 0;
        const divisor =
          election.quorumBasis === "VALID_VOTES"
            ? validVotes || 1
            : totalVotes || 1;
        const percentage = totalVotes > 0 ? (vCount / divisor) * 100 : 0;
        return {
          slate,
          votes: vCount,
          percentage: Number(percentage.toFixed(2)),
        };
      })
      .sort((a, b) => b.votes - a.votes);

    const leader = slatesTally.length > 0 ? slatesTally[0] : null;
    const isElected = Boolean(
      leader && leader.votes >= requiredVotesToWin && baseVotes > 0,
    );
    const requiresSecondRound = !isElected;

    const proclamationText =
      isElected && leader
        ? `CHAPA ELEITA EM 1º TURNO: A "${leader.slate.name}" obteve ${leader.votes} votos (${leader.percentage}%), superando a marca mínima de ${requiredVotesToWin} votos.`
        : `REQUER NOVO PLEITO / 2º TURNO: Nenhuma chapa atingiu a maioria absoluta de 50% + 1 (${requiredVotesToWin} votos). Chapa mais votada: "${leader?.slate.name || "N/A"}" com ${leader?.votes || 0} votos.`;

    return {
      electionId: election.id,
      calculatedAt: new Date().toISOString(),
      dataHash: "",
      totalVotes,
      validVotes,
      blankVotes,
      quorumBasis: election.quorumBasis,
      requiredVotesToWin,
      mode: election.mode,
      multiSlateResult: {
        slatesTally,
        electedSlate: isElected && leader ? leader.slate : null,
        isElected,
        requiresSecondRound,
        proclamationText,
      },
    };
  }
}
