import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Election, ElectionResult } from "~/domain/types";

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export function generateElectionReportPdf(
  election: Election,
  result: ElectionResult,
): jsPDF {
  const doc: ExtendedJsPDF = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // 1. Cabeçalho Institucional
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  const assocName = (
    election.associationName || "Associação Cearense de Escritores - ACE"
  ).toUpperCase();
  doc.text(assocName, pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 6;
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Slate 800
  const docTitle = election.title
    ? `ATA OFICIAL DE APURAÇÃO — ${election.title.toUpperCase()}`
    : "ATA OFICIAL DE APURAÇÃO DA VOTAÇÃO — CHAPA 01";
  doc.text(docTitle, pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 4;
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 8;

  // 2. Preâmbulo / Dados do Pleito
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("1. DADOS GERAIS DA ASSEMBLEIA", 15, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const preambuloLines = [
    `Data da Realização: ${election.date || new Date().toISOString().split("T")[0]}`,
    `Candidatura Submetida: Chapa 01 (Votação SIM / NÃO)`,
    `Quantidade de Pessoas na Associação (Total de Associados): ${result.totalMembers || election.totalMembers || 0}`,
    `Quantidade de Pessoas Presentes na Votação: ${result.presentMembers || election.presentMembers || 0}`,
    `Total de Cédulas Depositadas na Urna: ${result.totalVotes}`,
  ];

  for (const line of preambuloLines) {
    doc.text(line, 15, currentY);
    currentY += 5;
  }

  currentY += 4;

  // 3. Tabela de Votos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("2. QUADRO DE APURAÇÃO DOS VOTOS", 15, currentY);
  currentY += 3;

  const r = result.singleSlateResult || {
    yesVotes: 0,
    noVotes: 0,
    yesPercentage: 0,
    noPercentage: 0,
    isElected: false,
    proclamationText: "",
  };

  const tableData: string[][] = [
    [
      "SIM (Aprovação da Chapa 01)",
      `${r.yesVotes}`,
      `${r.yesPercentage.toFixed(2)}%`,
    ],
    [
      "NÃO (Rejeição da Chapa 01)",
      `${r.noVotes}`,
      `${r.noPercentage.toFixed(2)}%`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Opção de Voto", "Votos Computados", "Percentual"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
    },
    styles: {
      fontSize: 9.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: "center" },
      2: { cellWidth: 40, halign: "center" },
    },
    margin: { left: 15, right: 15 },
  });

  currentY = (doc.lastAutoTable?.finalY ?? currentY) + 8;

  // 4. Parecer Conclusivo e Proclamação
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("3. CONCLUSÃO E PROCLAMAÇÃO DO RESULTADO", 15, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const proclamation = r.proclamationText;
  const splitProclamation = doc.splitTextToSize(proclamation, pageWidth - 30);
  doc.text(splitProclamation, 15, currentY);
  currentY += splitProclamation.length * 5 + 8;

  // 5. Evidência de Integridade e Hash
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("4. EVIDÊNCIA DE INTEGRIDADE DIGITAL", 15, currentY);
  currentY += 4.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `SHA-256: ${result.dataHash || "[HASH DOS DADOS DA VOTAÇÃO]"}`,
    15,
    currentY,
  );
  currentY += 3.5;
  doc.text(`Emitido em: ${new Date().toLocaleString("pt-BR")}`, 15, currentY);

  currentY += 16;

  // 6. Termo de Assinaturas
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const sigWidth = 75;
  const col1X = 20;
  const col2X = pageWidth - 20 - sigWidth;

  doc.line(col1X, currentY + 12, col1X + sigWidth, currentY + 12);
  doc.text("Presidente da Assembleia", col1X + sigWidth / 2, currentY + 16, {
    align: "center",
  });

  doc.line(col2X, currentY + 12, col2X + sigWidth, currentY + 12);
  doc.text("Secretário(a) da Mesa", col2X + sigWidth / 2, currentY + 16, {
    align: "center",
  });

  return doc;
}

export function downloadElectionReportPdf(
  election: Election,
  result: ElectionResult,
): void {
  const doc = generateElectionReportPdf(election, result);
  const dateStr = election.date || new Date().toISOString().split("T")[0];
  doc.save(`ata-votacao-chapa01-${dateStr}.pdf`);
}
