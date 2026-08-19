import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Election, ElectionResult, Slate } from "~/domain/types";

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export function generateElectionReportPdf(
  election: Election,
  slates: Slate[],
  result: ElectionResult,
): jsPDF {
  const doc: ExtendedJsPDF = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 18;

  // 1. Cabeçalho Institucional
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(election.associationName.toUpperCase(), pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 7;
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text(
    "ATA OFICIAL DE APURAÇÃO E PROCLAMAÇÃO DE RESULTADOS",
    pageWidth / 2,
    currentY,
    {
      align: "center",
    },
  );

  currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(election.title, pageWidth / 2, currentY, { align: "center" });

  currentY += 4;
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.5);
  doc.line(15, currentY, pageWidth - 15, currentY);

  currentY += 8;

  // 2. Preâmbulo / Dados do Pleito
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("1. DADOS GERAIS DO PLEITO", 15, currentY);

  currentY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  const preambuloLines = [
    `Data de Realização: ${election.date}`,
    `Modalidade: ${election.mode === "SINGLE_SLATE_APPROVAL" ? "Chapa Única (Aprovação SIM / NÃO)" : "Múltiplas Chapas"}`,
    `Base Estatutária de Quórum: ${election.quorumBasis === "VALID_VOTES" ? "Maioria Absoluta sobre Votos Válidos (50% + 1)" : "Maioria Absoluta sobre o Total de Votos Depositados (50% + 1)"}`,
    `Horário de Abertura: ${election.openedAt ? new Date(election.openedAt).toLocaleTimeString("pt-BR") : "Não registrado"} | Horário de Encerramento: ${election.closedAt ? new Date(election.closedAt).toLocaleTimeString("pt-BR") : "Em andamento"}`,
    `Total Geral de Votos Depositados: ${result.totalVotes} | Votos Válidos: ${result.validVotes} | Votos em Branco: ${result.blankVotes}`,
    `Votos Mínimos Exigidos para Eleição (50% + 1): ${result.requiredVotesToWin} voto(s)`,
  ];

  for (const line of preambuloLines) {
    doc.text(line, 15, currentY);
    currentY += 4.5;
  }

  currentY += 3;

  // 3. Tabela de Votos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("2. QUADRO DEMONSTRATIVO DE APURAÇÃO", 15, currentY);
  currentY += 3;

  let tableData: string[][] = [];

  if (election.mode === "SINGLE_SLATE_APPROVAL" && result.singleSlateResult) {
    const r = result.singleSlateResult;
    tableData = [
      [
        "SIM (Aprovação da Chapa)",
        `${r.yesVotes}`,
        `${r.yesPercentage.toFixed(2)}%`,
      ],
      [
        "NÃO (Rejeição da Chapa)",
        `${r.noVotes}`,
        `${r.noPercentage.toFixed(2)}%`,
      ],
      [
        "VOTO EM BRANCO",
        `${result.blankVotes}`,
        `${r.blankPercentage.toFixed(2)}%`,
      ],
    ];
  } else if (result.multiSlateResult) {
    tableData = result.multiSlateResult.slatesTally.map((st) => [
      st.slate.name,
      `${st.votes}`,
      `${st.percentage.toFixed(2)}%`,
    ]);
    if (result.blankVotes > 0) {
      const blankPct =
        result.totalVotes > 0
          ? (result.blankVotes / result.totalVotes) * 100
          : 0;
      tableData.push([
        "VOTO EM BRANCO",
        `${result.blankVotes}`,
        `${blankPct.toFixed(2)}%`,
      ]);
    }
  }

  autoTable(doc, {
    startY: currentY,
    head: [["Opção / Chapa", "Votos Computados", "Percentual"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5,
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
  doc.text("3. CONCLUSÃO E PROCLAMAÇÃO OFICIAL", 15, currentY);
  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  let proclamation = "";
  let electedSlate: Slate | undefined;

  if (election.mode === "SINGLE_SLATE_APPROVAL" && result.singleSlateResult) {
    proclamation = result.singleSlateResult.proclamationText;
    if (result.singleSlateResult.isElected) {
      electedSlate = result.singleSlateResult.slate || slates[0];
    }
  } else if (result.multiSlateResult) {
    proclamation = result.multiSlateResult.proclamationText;
    if (
      result.multiSlateResult.isElected &&
      result.multiSlateResult.electedSlate
    ) {
      electedSlate = result.multiSlateResult.electedSlate;
    }
  }

  const splitProclamation = doc.splitTextToSize(proclamation, pageWidth - 30);
  doc.text(splitProclamation, 15, currentY);
  currentY += splitProclamation.length * 4.5 + 4;

  // 5. Mesa Diretora Eleita (se houver)
  if (electedSlate && electedSlate.members.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `4. COMPOSIÇÃO DA MESA DIRETORA ELEITA (${electedSlate.name.toUpperCase()})`,
      15,
      currentY,
    );
    currentY += 3;

    const boardData = electedSlate.members.map((m) => [m.role, m.name]);

    autoTable(doc, {
      startY: currentY,
      head: [["Cargo", "Nome do Membro Eleito"]],
      body: boardData,
      theme: "grid",
      headStyles: {
        fillColor: [5, 150, 105], // Emerald 600
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 110 },
      },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc.lastAutoTable?.finalY ?? currentY) + 8;
  }

  // 6. Evidência de Integridade e Hash
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("5. EVIDÊNCIA DE INTEGRIDADE E CONFERÊNCIA DIGITAL", 15, currentY);
  currentY += 4.5;

  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `SHA-256: ${result.dataHash || "[HASH CANÔNICO DOS DADOS DA VOTAÇÃO]"}`,
    15,
    currentY,
  );
  currentY += 3.5;
  doc.text(
    `ID do Pleito: ${election.id} | Emitido em: ${new Date().toLocaleString("pt-BR")}`,
    15,
    currentY,
  );

  currentY += 12;

  // 7. Termo de Assinaturas
  if (currentY > 240) {
    doc.addPage();
    currentY = 30;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  const sigWidth = 75;
  const col1X = 20;
  const col2X = pageWidth - 20 - sigWidth;

  doc.line(col1X, currentY + 12, col1X + sigWidth, currentY + 12);
  doc.text(
    "Presidente da Mesa Eleitoral",
    col1X + sigWidth / 2,
    currentY + 16,
    { align: "center" },
  );

  doc.line(col2X, currentY + 12, col2X + sigWidth, currentY + 12);
  doc.text("1º Secretário(a)", col2X + sigWidth / 2, currentY + 16, {
    align: "center",
  });

  currentY += 28;

  doc.line(
    pageWidth / 2 - sigWidth / 2,
    currentY + 12,
    pageWidth / 2 + sigWidth / 2,
    currentY + 12,
  );
  doc.text("Fiscal / Representante de Chapa", pageWidth / 2, currentY + 16, {
    align: "center",
  });

  return doc;
}

export function downloadElectionReportPdf(
  election: Election,
  slates: Slate[],
  result: ElectionResult,
): void {
  const doc = generateElectionReportPdf(election, slates, result);
  const dateStr = election.date || new Date().toISOString().split("T")[0];
  doc.save(`ata-apuracao-${dateStr}.pdf`);
}
