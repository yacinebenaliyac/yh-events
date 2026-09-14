import PDFDocument from "pdfkit";

export const generateQuotePDF = (quote, provider, res) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="devis-${quote.number}.pdf"`);
  doc.pipe(res);

  // En-tête
  doc.fontSize(22).fillColor("#234027").text("Y-H Events", { align: "left" });
  doc.fontSize(10).fillColor("#666").text("Plateforme de prestataires artistiques", { align: "left" });
  doc.moveDown(2);

  // Titre
  doc.fontSize(18).fillColor("#1a301d").text(`DEVIS N° ${quote.number}`, { align: "center" });
  doc.moveDown();

  // Infos
  doc.fontSize(11).fillColor("#333");
  doc.text(`Prestataire : ${provider.name}`);
  doc.text(`Ville : ${provider.city}`);
  doc.text(`Téléphone : ${provider.phone}`);
  doc.text(`Date : ${new Date(quote.createdAt).toLocaleDateString("fr-FR")}`);
  if (quote.validUntil) doc.text(`Valide jusqu'au : ${new Date(quote.validUntil).toLocaleDateString("fr-FR")}`);
  doc.moveDown(2);

  // Tableau
  const startX = 50;
  let y = doc.y;
  doc.fontSize(11).fillColor("#234027").text("Description", startX, y);
  doc.text("Qté", 350, y);
  doc.text("P.U.", 400, y);
  doc.text("Total", 480, y);
  y += 20;
  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 10;

  doc.fillColor("#333");
  quote.items.forEach((it) => {
    doc.text(it.description, startX, y, { width: 280 });
    doc.text(String(it.quantity), 350, y);
    doc.text(`${it.unitPrice.toLocaleString()}`, 400, y);
    doc.text(`${(it.quantity * it.unitPrice).toLocaleString()}`, 480, y);
    y += 20;
  });

  doc.moveDown(2);
  doc.fontSize(12).fillColor("#234027");
  doc.text(`Sous-total : ${quote.subtotal?.toLocaleString()} ${quote.currency}`, { align: "right" });
  if (quote.discount > 0) doc.text(`Remise : -${quote.discount.toLocaleString()} ${quote.currency}`, { align: "right" });
  doc.fontSize(14).text(`TOTAL : ${quote.total?.toLocaleString()} ${quote.currency}`, { align: "right" });

  if (quote.notes) {
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#666").text("Notes :", { underline: true });
    doc.text(quote.notes);
  }

  doc.moveDown(3);
  doc.fontSize(9).fillColor("#999").text("Merci de votre confiance — Y-H Events", { align: "center" });

  doc.end();
};