import type {
  Election,
  ElectionBackup,
  Slate,
  Vote,
  Voter,
} from "~/domain/types";
import { computeDatasetHash } from "./hashService";

/**
 * Cria o payload completo e validado de backup JSON.
 */
export async function createElectionBackup(
  election: Election,
  slates: Slate[],
  votes: Vote[],
  voters: Voter[] = [],
): Promise<ElectionBackup> {
  const dataHash = await computeDatasetHash(election, slates, votes);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    election,
    slates,
    votes,
    voters,
    dataHash,
  };
}

/**
 * Valida a estrutura, integridade relacional e o hash de um backup antes da restauração.
 */
export async function validateElectionBackup(
  backup: unknown,
): Promise<ElectionBackup> {
  if (!backup || typeof backup !== "object") {
    throw new Error("Arquivo de backup inválido ou vazio.");
  }

  const b = backup as Partial<ElectionBackup>;

  if (b.version !== 1) {
    throw new Error(
      `Versão de backup incompatível: ${b.version || "desconhecida"}.`,
    );
  }

  if (!b.election?.id || !b.election.title) {
    throw new Error("Dados da eleição ausentes ou corrompidos no arquivo.");
  }

  if (!Array.isArray(b.slates)) {
    throw new Error("Lista de chapas inválida no arquivo de backup.");
  }

  if (!Array.isArray(b.votes)) {
    throw new Error("Lista de votos inválida no arquivo de backup.");
  }

  // Validação relacional
  const electionId = b.election.id;
  for (const slate of b.slates) {
    if (slate.electionId !== electionId) {
      throw new Error(
        `Chapa "${slate.name}" possui electionId inconsistente com a eleição.`,
      );
    }
  }

  for (const vote of b.votes) {
    if (vote.electionId !== electionId) {
      throw new Error(`Voto id "${vote.id}" possui electionId inconsistente.`);
    }
  }

  // Verificação de integridade via hash SHA-256
  const recalculatedHash = await computeDatasetHash(
    b.election,
    b.slates,
    b.votes,
  );

  if (b.dataHash && b.dataHash !== recalculatedHash) {
    throw new Error(
      "Falha de integridade: O hash do arquivo não coincide com os dados. O arquivo pode ter sido alterado manualmente.",
    );
  }

  return b as ElectionBackup;
}

/**
 * Dispara o download do arquivo de backup no navegador.
 */
export function downloadBackupFile(backup: ElectionBackup): void {
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr =
    backup.election.date || new Date().toISOString().split("T")[0];
  const shortHash = backup.dataHash.substring(0, 8);

  a.href = url;
  a.download = `backup-eleicao-${dateStr}-${shortHash}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
