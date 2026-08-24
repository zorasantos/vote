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

  if (election.totalMembers !== undefined && election.totalMembers <= 0) {
    throw new Error("Informe a quantidade total de pessoas na associação.");
  }

  if (election.presentMembers !== undefined && election.presentMembers <= 0) {
    throw new Error("Informe a quantidade de pessoas presentes na votação.");
  }

  if (
    election.totalMembers !== undefined &&
    election.presentMembers !== undefined &&
    election.presentMembers > election.totalMembers
  ) {
    throw new Error(
      "A quantidade de presentes não pode ser maior que o total de pessoas na associação.",
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
  }

  for (const slate of slates) {
    if (!slate.name?.trim()) {
      throw new Error(
        `A chapa número "${slate.number || "N/A"}" precisa ter um nome preenchido.`,
      );
    }

    if (slate.members && slate.members.length > 0) {
      for (const member of slate.members) {
        if (!member.name?.trim()) {
          throw new Error(
            `Existe um integrante sem nome cadastrado na chapa "${slate.name}".`,
          );
        }
        if (!member.role?.trim()) {
          throw new Error(
            `O cargo do integrante "${member.name}" na chapa "${slate.name}" não foi preenchido.`,
          );
        }
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

  if (election.mode === "SINGLE_SLATE_APPROVAL" || !election.mode) {
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
      election.quorumBasis === "TOTAL_VOTES" ? totalVotes : validVotes;
    const requiredVotesToWin =
      baseVotes > 0 ? Math.floor(baseVotes / 2) + 1 : 1;
    const isElected =
      yesVotes >= requiredVotesToWin && yesVotes > noVotes && baseVotes > 0;
    const targetSlate = slates[0] || {
      id: "slate-01",
      electionId: election.id,
      number: "01",
      name: "Chapa 01",
      members: [],
      createdAt: new Date().toISOString(),
    };

    const divisor = baseVotes > 0 ? baseVotes : 1;
    const yesPct = baseVotes > 0 ? (yesVotes / divisor) * 100 : 0;
    const noPct = baseVotes > 0 ? (noVotes / divisor) * 100 : 0;
    const blankPct = totalVotes > 0 ? (blankVotes / totalVotes) * 100 : 0;

    const proclamationText = isElected
      ? `CHAPA 01 APROVADA: A Chapa 01 obteve ${yesVotes} voto(s) SIM (${yesPct.toFixed(1)}%), atingindo a maioria absoluta dos votos válidos (${requiredVotesToWin} votos necessários).`
      : `CHAPA 01 NÃO APROVADA: A Chapa 01 obteve ${yesVotes} voto(s) SIM (${yesPct.toFixed(1)}%), não atingindo a maioria absoluta mínima de ${requiredVotesToWin} votos válidos.`;

    return {
      electionId: election.id,
      calculatedAt: new Date().toISOString(),
      dataHash: "",
      totalMembers: election.totalMembers,
      presentMembers: election.presentMembers,
      totalVotes,
      validVotes,
      blankVotes,
      quorumBasis: election.quorumBasis,
      requiredVotesToWin,
      mode: "SINGLE_SLATE_APPROVAL",
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
    // Modo Múltiplas Chapas (MULTIPLE_SLATE_CHOICE)
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
      election.quorumBasis === "TOTAL_VOTES" ? totalVotes : validVotes;
    const requiredVotesToWin =
      baseVotes > 0 ? Math.floor(baseVotes / 2) + 1 : 1;

    const divisor = baseVotes > 0 ? baseVotes : 1;
    const slatesTally = slates
      .map((slate) => {
        const vCount = tallyMap.get(slate.id) || 0;
        const percentage = baseVotes > 0 ? (vCount / divisor) * 100 : 0;
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
      totalMembers: election.totalMembers,
      presentMembers: election.presentMembers,
      totalVotes,
      validVotes,
      blankVotes,
      quorumBasis: election.quorumBasis,
      requiredVotesToWin,
      mode: "MULTIPLE_SLATE_CHOICE",
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
