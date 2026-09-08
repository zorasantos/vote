import type { RealtimeChannel } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  type ElectionRow,
  mapElectionFromRow,
  mapElectionToRow,
  mapSlateFromRow,
  mapSlateToRow,
  mapVoteFromRow,
  mapVoterFromRow,
  mapVoterToRow,
  mapVoteToRow,
  type SlateRow,
  supabase,
  type VoteRow,
  type VoterRow,
} from "~/db/supabase";
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

  let realtimeChannel: RealtimeChannel | null = null;

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

  function setupRealtime(electionId: string) {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    realtimeChannel = supabase
      .channel(`election-realtime-${electionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `election_id=eq.${electionId}`,
        },
        async (payload) => {
          const newVote = mapVoteFromRow(payload.new as VoteRow);
          if (!votes.value.some((v) => v.id === newVote.id)) {
            votes.value.push(newVote);
            await updateHash();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "elections",
          filter: `id=eq.${electionId}`,
        },
        async (payload) => {
          const updatedElection = mapElectionFromRow(
            payload.new as ElectionRow,
          );
          currentElection.value = updatedElection;
          await updateHash();
        },
      )
      .subscribe();
  }

  async function ensureDefaultSlate(electionId: string): Promise<Slate> {
    const { data: existingRows } = await supabase
      .from("slates")
      .select("*")
      .eq("election_id", electionId)
      .limit(1);

    if (existingRows && existingRows.length > 0) {
      return mapSlateFromRow(existingRows[0] as SlateRow);
    }

    const defaultSlate: Slate = {
      id: crypto.randomUUID(),
      electionId,
      number: "01",
      name: "Chapa 01",
      slogan: "Chapa Oficial",
      members: [],
      createdAt: new Date().toISOString(),
    };

    const slateRow = mapSlateToRow(defaultSlate);
    const { error: insertError } = await supabase
      .from("slates")
      .insert(slateRow);
    if (insertError) {
      console.error("Erro ao criar chapa padrão no Supabase:", insertError);
    }
    return defaultSlate;
  }

  let loadPromise: Promise<void> | null = null;

  async function loadActiveElection(): Promise<void> {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const { data: electionRows, error: fetchError } = await supabase
          .from("elections")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw new Error(
            `Erro ao buscar eleições no Supabase: ${fetchError.message}`,
          );
        }

        const allElections: Election[] = (electionRows || []).map((r) =>
          mapElectionFromRow(r as ElectionRow),
        );

        if (allElections.length === 0) {
          // Banco vazio: NÃO SALVA NADA NO BANCO!
          // Mantém as variáveis zeradas até o usuário clicar em "Salvar Configuração"
          currentElection.value = null;
          slates.value = [];
          votes.value = [];
          voters.value = [];
          lastCalculatedHash.value = "";
          return;
        }

        const active =
          allElections.find((e) => e.status === "OPEN") ||
          allElections.find((e) => e.status === "DRAFT") ||
          allElections[0];

        currentElection.value = active;

        // Busca chapas apenas com SELECT (sem inserção automática)
        const { data: slateRows } = await supabase
          .from("slates")
          .select("*")
          .eq("election_id", active.id)
          .order("created_at", { ascending: true });

        slates.value = (slateRows || []).map((r) =>
          mapSlateFromRow(r as SlateRow),
        );

        // Busca votos apenas com SELECT
        const { data: voteRows } = await supabase
          .from("votes")
          .select("*")
          .eq("election_id", active.id)
          .order("created_at", { ascending: true });

        votes.value = (voteRows || []).map((r) => mapVoteFromRow(r as VoteRow));

        // Busca votantes / livro de presenças
        const { data: voterRows } = await supabase
          .from("voters")
          .select("*")
          .eq("election_id", active.id)
          .order("registered_at", { ascending: true });

        voters.value = (voterRows || []).map((r) =>
          mapVoterFromRow(r as VoterRow),
        );

        await updateHash();
        setupRealtime(active.id);
      } catch (e: unknown) {
        error.value =
          e instanceof Error
            ? e.message
            : "Erro ao carregar dados do Supabase.";
      } finally {
        isLoading.value = false;
      }
    })().finally(() => {
      loadPromise = null;
    });

    return loadPromise;
  }

  async function createOrUpdateElection(
    data: Partial<Election>,
  ): Promise<Election> {
    isLoading.value = true;
    error.value = null;
    try {
      // Se não há eleição em memória, busca se já existe uma no Supabase antes de criar
      if (!currentElection.value) {
        const { data: existingElections } = await supabase
          .from("elections")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (existingElections && existingElections.length > 0) {
          currentElection.value = mapElectionFromRow(
            existingElections[0] as ElectionRow,
          );
        }
      }

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

        const { error: insertErr } = await supabase
          .from("elections")
          .insert(mapElectionToRow(newElection));
        if (insertErr) throw new Error(insertErr.message);

        const defaultSlate = await ensureDefaultSlate(newElection.id);
        currentElection.value = newElection;
        slates.value = [defaultSlate];
        setupRealtime(newElection.id);
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

        const { error: updateErr } = await supabase
          .from("elections")
          .update(mapElectionToRow(updated))
          .eq("id", updated.id);
        if (updateErr) throw new Error(updateErr.message);

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

    const { error: insertErr } = await supabase
      .from("slates")
      .insert(mapSlateToRow(newSlate));
    if (insertErr) throw new Error(insertErr.message);

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
    const { error: updateErr } = await supabase
      .from("slates")
      .update(mapSlateToRow(updated))
      .eq("id", slateId);
    if (updateErr) throw new Error(updateErr.message);

    slates.value[idx] = updated;
    await updateHash();
  }

  async function removeSlate(slateId: string): Promise<void> {
    if (currentElection.value?.status !== "DRAFT") {
      throw new Error("Chapas só podem ser removidas em rascunho.");
    }

    const { error: deleteErr } = await supabase
      .from("slates")
      .delete()
      .eq("id", slateId);
    if (deleteErr) throw new Error(deleteErr.message);

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
    const { error: updateErr } = await supabase
      .from("elections")
      .update({
        status: "OPEN",
        opened_at: now,
      })
      .eq("id", currentElection.value.id);

    if (updateErr) throw new Error(updateErr.message);

    currentElection.value.status = "OPEN";
    currentElection.value.openedAt = now;
    await updateHash();
  }

  async function closeElection(): Promise<void> {
    if (!currentElection.value) throw new Error("Nenhuma eleição ativa.");
    if (currentElection.value.status !== "OPEN") {
      throw new Error("Apenas eleições em andamento podem ser encerradas.");
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabase
      .from("elections")
      .update({
        status: "CLOSED",
        closed_at: now,
      })
      .eq("id", currentElection.value.id);

    if (updateErr) throw new Error(updateErr.message);

    currentElection.value.status = "CLOSED";
    currentElection.value.closedAt = now;
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

    const { error: insertErr } = await supabase
      .from("votes")
      .insert(mapVoteToRow(newVote));

    if (insertErr) {
      throw new Error(
        `Falha ao registrar voto no Supabase: ${insertErr.message}`,
      );
    }

    // Se o Realtime ainda não tiver entregue o evento localmente, adiciona
    if (!votes.value.some((v) => v.id === newVote.id)) {
      votes.value.push(newVote);
    }
    await updateHash();
  }

  async function resetDatabase(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. Invoca a função RPC atômica que executa TRUNCATE no Supabase
      const { error: rpcErr } = await supabase.rpc("reset_all_election_data");

      if (rpcErr) {
        console.error("Erro na RPC reset_all_election_data:", rpcErr);
        throw new Error(`Falha no Supabase ao zerar banco: ${rpcErr.message}`);
      }

      // 2. Limpa dados de bloqueio de voto por dispositivo no localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("voted_election_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => {
          localStorage.removeItem(k);
        });
      }

      currentElection.value = null;
      slates.value = [];
      votes.value = [];
      voters.value = [];
      lastCalculatedHash.value = "";

      // 3. Inicializa uma nova eleição limpa no Supabase
      await loadActiveElection();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao resetar banco.";
      error.value = msg;
      throw new Error(msg);
    } finally {
      isLoading.value = false;
    }
  }

  async function restoreFromBackup(backup: ElectionBackup): Promise<void> {
    isLoading.value = true;
    try {
      // Limpa dados anteriores
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

      // Insere eleição
      const electionRow = mapElectionToRow(backup.election);
      const { error: eErr } = await supabase
        .from("elections")
        .insert(electionRow);
      if (eErr) throw new Error(`Erro ao restaurar eleição: ${eErr.message}`);

      // Insere chapas
      if (backup.slates.length > 0) {
        const slateRows = backup.slates.map((s) => mapSlateToRow(s));
        const { error: sErr } = await supabase.from("slates").insert(slateRows);
        if (sErr) throw new Error(`Erro ao restaurar chapas: ${sErr.message}`);
      }

      // Insere votos
      if (backup.votes.length > 0) {
        const voteRows = backup.votes.map((v) => mapVoteToRow(v));
        const { error: vErr } = await supabase.from("votes").insert(voteRows);
        if (vErr) throw new Error(`Erro ao restaurar votos: ${vErr.message}`);
      }

      // Insere votantes se existirem
      if (backup.voters && backup.voters.length > 0) {
        const voterRows = backup.voters.map((vt) => mapVoterToRow(vt));
        const { error: vtErr } = await supabase
          .from("voters")
          .insert(voterRows);
        if (vtErr)
          throw new Error(`Erro ao restaurar votantes: ${vtErr.message}`);
      }

      currentElection.value = backup.election;
      slates.value = backup.slates;
      votes.value = backup.votes;
      voters.value = backup.voters || [];
      await updateHash();
      setupRealtime(backup.election.id);
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
