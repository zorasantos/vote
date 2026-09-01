/**
 * Tipos e contratos de domínio para o Sistema de Votação de Mesa Diretora.
 * Totalmente desacoplado de bibliotecas de interface e persistência.
 */

/** Status do ciclo de vida da eleição */
export type ElectionStatus = "DRAFT" | "OPEN" | "CLOSED";

/** Modo de votação do pleito */
export type VotingMode = "SINGLE_SLATE_APPROVAL" | "MULTIPLE_SLATE_CHOICE";

/** Base de cálculo do quórum de maioria absoluta */
export type QuorumBasis =
  | "VALID_VOTES" // Considera apenas votos nominais (SIM + NÃO ou Chapas), excluindo brancos
  | "TOTAL_VOTES"; // Considera todos os votos depositados na urna (incluindo brancos)

/** Cargo e membro integrante da chapa */
export interface SlateMember {
  id: string;
  role: string; // Ex: "Presidente", "Vice-Presidente", "1º Secretário", "1º Tesoureiro", etc.
  name: string; // Nome completo do candidato associado
}

/** Chapa concorrente */
export interface Slate {
  id: string;
  electionId: string;
  number: string; // Número da chapa (ex: "01", "10", "100")
  name: string; // Nome oficial da chapa (ex: "Chapa 1 — Renovação e Transparência")
  slogan?: string; // Lema opcional da chapa
  members: SlateMember[]; // Relação nominal de integrantes e respectivos cargos
  createdAt: string; // Timestamp ISO
}

/** Entidade Eleição */
export interface Election {
  id: string;
  title: string; // Ex: "Eleição da Mesa Diretora — Biênio 2026/2028"
  associationName: string; // Ex: "Associação Cearense de Escritores - ACE"
  associationLogo?: string; // Caminho ou data URL da logomarca da entidade
  date: string; // Data do pleito (YYYY-MM-DD)
  status: ElectionStatus;
  mode: VotingMode;
  quorumBasis: QuorumBasis;
  allowBlankVote: boolean; // Define se a opção "Voto em Branco" estará disponível na cabine
  totalMembers?: number; // Quantidade de pessoas na associação
  presentMembers?: number; // Quantidade de pessoas presentes na votação
  securityPinHash?: string; // SHA-256 do PIN operacional do mesário
  createdAt: string;
  openedAt?: string;
  closedAt?: string;
}

/**
 * Escolha do voto - Modelo estrito e inequívoco
 *
 * Em Chapa Única:
 * - 'YES': Aprovação da chapa
 * - 'NO': Rejeição da chapa
 * - 'BLANK': Voto em branco (se permitido)
 *
 * Em Múltiplas Chapas:
 * - { type: 'SLATE'; slateId: string }: Voto nominal na chapa indicada
 * - 'BLANK': Voto em branco (se permitido)
 */
export type VoteChoice =
  | "YES"
  | "NO"
  | "BLANK"
  | { type: "SLATE"; slateId: string };

/**
 * Cédula de Voto Eletrônico (Totalmente Anônima)
 * Não contém nenhuma referência ou rastreabilidade ao associado/eleitor.
 */
export interface Vote {
  id: string;
  electionId: string;
  choice: VoteChoice;
  createdAt: string; // Timestamp ISO de registro da cédula
}

/**
 * Controle de Presença / Livro de Presença (Opcional e Desacoplado)
 * Funciona como a folha física de assinaturas da assembleia: registra apenas que o
 * associado compareceu à assembleia e está apto a votar, sem qualquer vínculo ou
 * possibilidade de correlação com a cédula depositada na urna.
 */
export interface Voter {
  id: string;
  electionId: string;
  name: string;
  document?: string; // CPF ou Matrícula
  hasVoted: boolean; // Indica apenas que assinou a presença / habilitou o voto
  registeredAt: string; // Data de cadastro no livro de associados
  presenceConfirmedAt?: string; // Horário de registro da presença na assembleia
}

/** Resultado formal da apuração */
export interface ElectionResult {
  electionId: string;
  calculatedAt: string;
  dataHash: string; // Hash SHA-256 canônico de auditoria

  totalMembers?: number;
  presentMembers?: number;
  totalVotes: number;
  validVotes: number;
  blankVotes: number;
  quorumBasis: QuorumBasis;
  requiredVotesToWin: number; // Math.floor(baseVotes / 2) + 1

  mode: VotingMode;

  // Apuração para Chapa Única
  singleSlateResult?: {
    slate?: Slate;
    yesVotes: number;
    noVotes: number;
    yesPercentage: number;
    noPercentage: number;
    blankPercentage: number;
    isElected: boolean;
    proclamationText: string;
  };

  // Apuração para Múltiplas Chapas
  multiSlateResult?: {
    slatesTally: Array<{
      slate: Slate;
      votes: number;
      percentage: number;
    }>;
    electedSlate: Slate | null;
    isElected: boolean;
    requiresSecondRound: boolean;
    proclamationText: string;
  };
}

/** Estrutura do Backup JSON */
export interface ElectionBackup {
  version: 1;
  exportedAt: string;
  election: Election;
  slates: Slate[];
  votes: Vote[];
  voters?: Voter[];
  dataHash: string;
}
