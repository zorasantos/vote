/**
 * Constantes padrão do sistema de votação
 */

export const DEFAULT_BOARD_ROLES = [
  "Presidente",
  "Vice-Presidente",
  "1º Secretário",
  "2º Secretário",
  "1º Tesoureiro",
  "2º Tesoureiro",
  "Conselho Fiscal — Titular 1",
  "Conselho Fiscal — Titular 2",
  "Conselho Fiscal — Titular 3",
  "Conselho Fiscal — Suplente",
] as const;

export const DEFAULT_QUORUM_BASIS = "VALID_VOTES";

export const APP_CONFIG = {
  appName: "Urna Eletrônica da Mesa Diretora",
  version: "1.0.0",
  successCountdownSeconds: 3,
  defaultPin: "1234", // PIN inicial padrão se o operador não definir outro
} as const;
