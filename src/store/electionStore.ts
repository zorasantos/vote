import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { db } from "~/db/database";
import type {
  Election,
  ElectionBackup,
  ElectionResult,
  Slate,
  Vote,
  VoteChoice,
  Voter,
} from "~/domain/types";
import {
  calculateElectionResult,
  validateElectionForOpening,
  validateVoteRegistration,
} from "~/services/electionService";
import { computeDatasetHash } from "~/services/hashService";

export const useElectionStore = defineStore("election", () => {
  const currentElection = ref<Election | null>(null);
  const slates = ref<Slate[]>([]);
  const votes = ref<Vote[]>([]);
  const voters = ref<Voter[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastCalculatedHash = ref<string>("");

  const isDraft = computed(() => currentElection.value?.status === "DRAFT");
  const isOpen = computed(() => currentElection.value?.status === "OPEN");
  const isClosed = computed(() => currentElection.value?.status === "CLOSED");
  const totalVotesCount = computed(() => votes.value.length);

  const electionResult = computed<ElectionResult | null>(() => {
    if (!currentElection.value) return null;
    const res = calculateElectionResult(
      currentElection.value,
      slates.value,
      votes.value,
    );
    res.dataHash = lastCalculatedHash.value;
    return res;
  });

  async function updateHash(): Promise<string> {
    if (!currentElection.value) return "";
    const hash = await computeDatasetHash(
      currentElection.value,
      slates.value,
      votes.value,
    );
    lastCalculatedHash.value = hash;
    return hash;
  }

  async function ensureDefaultSlate(electionId: string): Promise<Slate> {
    const existing = await db.slates
      .where("electionId")
      .equals(electionId)
      .first();
    if (existing) return existing;

    const defaultSlate: Slate = {
      id: crypto.randomUUID(),
      electionId,
      number: "01",
      name: "Chapa 01",
      slogan: "Chapa Oficial",
      members: [],
      createdAt: new Date().toISOString(),
    };
    await db.slates.add(defaultSlate);
    return defaultSlate;
  }

  async function loadActiveElection(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const allElections = await db.elections.toArray();
      if (allElections.length === 0) {
        // Cria automaticamente eleição padrão simplificada
        const now = new Date().toISOString();
        const newElection: Election = {
          id: crypto.randomUUID(),
          title: "Eleição da Mesa Diretora — Biênio 2026/2028",
          associationName: "Associação Cearense de Escritores - ACE",
          associationLogo: "/ace-logo.jpg",
          date: now.split("T")[0],
          status: "DRAFT",
          mode: "SINGLE_SLATE_APPROVAL",
          quorumBasis: "VALID_VOTES",
          allowBlankVote: false,
          totalMembers: 100,
          presentMembers: 50,
          createdAt: now,
        };
        await db.elections.add(newElection);
        const defaultSlate = await ensureDefaultSlate(newElection.id);

        currentElection.value = newElection;
        slates.value = [defaultSlate];
        votes.value = [];
        voters.value = [];
        await updateHash();
        return;
      }

      const active =
        allElections.find((e) => e.status === "OPEN") ||
        allElections.find((e) => e.status === "DRAFT") ||
        allElections[allElections.length - 1];

      // Força a atualização do nome e logotipo para a Associação Cearense de Escritores - ACE
      if (
        active.associationName !== "Associação Cearense de Escritores - ACE" ||
        active.associationLogo !== "/ace-logo.jpg"
      ) {
        active.associationName = "Associação Cearense de Escritores - ACE";
        active.associationLogo = "/ace-logo.jpg";
        if (
          !active.title ||
          active.title === "Votação da Mesa Diretora" ||
          active.title === "Votação da Mesa Diretora — Chapa 01"
        ) {
          active.title = "Eleição da Mesa Diretora — Biênio 2026/2028";
        }
        await db.elections.put(active);
      }

      currentElection.value = active;
      let loadedSlates = await db.slates
        .where("electionId")
        .equals(active.id)
        .toArray();

      if (loadedSlates.length === 0) {
        const defaultSlate = await ensureDefaultSlate(active.id);
        loadedSlates = [defaultSlate];
      }

      slates.value = loadedSlates;
      votes.value = await db.votes
        .where("electionId")
        .equals(active.id)
        .toArray();
      voters.value = await db.voters
        .where("electionId")
        .equals(active.id)
        .toArray();

      await updateHash();
    } catch (e: unknown) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erro ao carregar dados do banco local.";
    } finally {
      isLoading.value = false;
    }
  }

  async function createOrUpdateElection(
    data: Partial<Election>,
  ): Promise<Election> {
    isLoading.value = true;
    error.value = null;
    try {
      const now = new Date().toISOString();
      if (!currentElection.value) {
        const newElection: Election = {
          id: crypto.randomUUID(),
          title: data.title || "Eleição da Mesa Diretora — Biênio 2026/2028",
          associationName: "Associação Cearense de Escritores - ACE",
          associationLogo: "/ace-logo.jpg",
          date: data.date || now.split("T")[0],
          status: "DRAFT",
          mode: "SINGLE_SLATE_APPROVAL",
          quorumBasis: "VALID_VOTES",
          allowBlankVote: false,
          totalMembers: data.totalMembers ?? 100,
          presentMembers: data.presentMembers ?? 50,
          createdAt: now,
        };
        await db.elections.add(newElection);
        const defaultSlate = await ensureDefaultSlate(newElection.id);
        currentElection.value = newElection;
        slates.value = [defaultSlate];
      } else {
        if (currentElection.value.status === "CLOSED") {
          throw new Error("Eleição encerrada não pode ser modificada.");
        }
        const updated: Election = {
          ...currentElection.value,
          ...data,
          associationName: "Associação Cearense de Escritores - ACE",
          associationLogo: "/ace-logo.jpg",
          mode: "SINGLE_SLATE_APPROVAL",
          allowBlankVote: false,
        };
        await db.elections.put(updated);
        currentElection.value = updated;
        if (slates.value.length === 0) {
          const defaultSlate = await ensureDefaultSlate(updated.id);
          slates.value = [defaultSlate];
        }
      }
      await updateHash();
      return currentElection.value;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "Erro ao salvar eleição.";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function addSlate(
    slateData: Omit<Slate, "id" | "electionId" | "createdAt">,
  ): Promise<Slate> {
    if (!currentElection.value)
      throw new Error("Crie ou selecione uma eleição antes.");
    if (currentElection.value.status !== "DRAFT") {
      throw new Error(
        "Chapas só podem ser adicionadas enquanto a eleição estiver em rascunho.",
      );
    }

    const newSlate: Slate = {
      id: crypto.randomUUID(),
      electionId: currentElection.value.id,
      number: slateData.number,
      name: slateData.name,
      slogan: slateData.slogan,
      members: slateData.members,
      createdAt: new Date().toISOString(),
    };

    await db.slates.add(newSlate);
    slates.value.push(newSlate);
    await updateHash();
    return newSlate;
  }

  async function updateSlate(
    slateId: string,
    slateData: Partial<Slate>,
  ): Promise<void> {
    if (currentElection.value?.status !== "DRAFT") {
      throw new Error(
        "Chapas só podem ser editadas enquanto a eleição estiver em rascunho.",
      );
    }

    const idx = slates.value.findIndex((s) => s.id === slateId);
    if (idx === -1) throw new Error("Chapa não encontrada.");

    const updated = { ...slates.value[idx], ...slateData };
    await db.slates.put(updated);
    slates.value[idx] = updated;
    await updateHash();
  }

  async function removeSlate(slateId: string): Promise<void> {
    if (currentElection.value?.status !== "DRAFT") {
      throw new Error("Chapas só podem ser removidas em rascunho.");
    }

    await db.slates.delete(slateId);
    slates.value = slates.value.filter((s) => s.id !== slateId);
    await updateHash();
  }

  async function openElection(): Promise<void> {
    if (!currentElection.value) {
      await createOrUpdateElection({
        totalMembers: 100,
        presentMembers: 50,
      });
    }

    if (!currentElection.value) throw new Error("Nenhuma eleição selecionada.");

    if (slates.value.length === 0) {
      const defaultSlate = await ensureDefaultSlate(currentElection.value.id);
      slates.value = [defaultSlate];
    }

    validateElectionForOpening(currentElection.value, slates.value);

    const now = new Date().toISOString();
    currentElection.value.status = "OPEN";
    currentElection.value.openedAt = now;

    await db.elections.update(currentElection.value.id, {
      status: "OPEN",
      openedAt: now,
    });
    await updateHash();
  }

  async function closeElection(): Promise<void> {
    if (!currentElection.value) throw new Error("Nenhuma eleição ativa.");
    if (currentElection.value.status !== "OPEN") {
      throw new Error("Apenas eleições em andamento podem ser encerradas.");
    }

    const now = new Date().toISOString();
    currentElection.value.status = "CLOSED";
    currentElection.value.closedAt = now;

    await db.elections.update(currentElection.value.id, {
      status: "CLOSED",
      closedAt: now,
    });
    await updateHash();
  }

  async function registerVote(choice: VoteChoice): Promise<void> {
    if (!currentElection.value) throw new Error("Nenhuma eleição ativa.");

    validateVoteRegistration(currentElection.value, slates.value, choice);

    const newVote: Vote = {
      id: crypto.randomUUID(),
      electionId: currentElection.value.id,
      choice,
      createdAt: new Date().toISOString(),
    };

    await db.votes.add(newVote);
    votes.value.push(newVote);
    await updateHash();
  }

  async function resetDatabase(): Promise<void> {
    isLoading.value = true;
    try {
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
      currentElection.value = null;
      slates.value = [];
      votes.value = [];
      voters.value = [];
      lastCalculatedHash.value = "";
    } finally {
      isLoading.value = false;
    }
  }

  async function restoreFromBackup(backup: ElectionBackup): Promise<void> {
    isLoading.value = true;
    try {
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

          await db.elections.add(backup.election);
          if (backup.slates.length > 0) await db.slates.bulkAdd(backup.slates);
          if (backup.votes.length > 0) await db.votes.bulkAdd(backup.votes);
          if (backup.voters && backup.voters.length > 0)
            await db.voters.bulkAdd(backup.voters);
        },
      );

      currentElection.value = backup.election;
      slates.value = backup.slates;
      votes.value = backup.votes;
      voters.value = backup.voters || [];
      await updateHash();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    currentElection,
    slates,
    votes,
    voters,
    isLoading,
    error,
    isDraft,
    isOpen,
    isClosed,
    totalVotesCount,
    electionResult,
    lastCalculatedHash,
    updateHash,
    loadActiveElection,
    createOrUpdateElection,
    addSlate,
    updateSlate,
    removeSlate,
    openElection,
    closeElection,
    registerVote,
    resetDatabase,
    restoreFromBackup,
  };
});
