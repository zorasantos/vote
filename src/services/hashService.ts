import type { Election, Slate, Vote } from "~/domain/types";

/**
 * Serialização canônica determinística que ordena todas as chaves alfabeticamente de forma recursiva.
 * Garante que objetos idênticos com propriedades em ordens diferentes gerem exatamente a mesma string.
 */
export function canonicalStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalStringify).join(",")}]`;
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (k) =>
      `${JSON.stringify(k)}:${canonicalStringify((obj as Record<string, unknown>)[k])}`,
  );
  return `{${pairs.join(",")}}`;
}

/**
 * Calcula o hash SHA-256 canônico sobre o conjunto de dados da eleição (dados gerais, chapas e votos).
 * Utiliza a Web Crypto API nativa do navegador (window.crypto.subtle ou globalThis.crypto.subtle).
 */
export async function computeDatasetHash(
  election: Election,
  slates: Slate[],
  votes: Vote[],
): Promise<string> {
  const sortedSlates = [...slates].sort((a, b) => a.id.localeCompare(b.id));
  const sortedVotes = [...votes].sort((a, b) => a.id.localeCompare(b.id));

  const canonicalPayload = canonicalStringify({
    election: {
      id: election.id,
      title: election.title,
      date: election.date,
      status: election.status,
      mode: election.mode,
      quorumBasis: election.quorumBasis,
    },
    slates: sortedSlates.map((s) => ({
      id: s.id,
      number: s.number,
      name: s.name,
      members: s.members,
    })),
    votes: sortedVotes.map((v) => ({
      id: v.id,
      choice: v.choice,
      createdAt: v.createdAt,
    })),
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalPayload);
  const cryptoObj =
    typeof window !== "undefined" ? window.crypto : globalThis.crypto;

  const hashBuffer = await cryptoObj.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
