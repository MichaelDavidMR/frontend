import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COMPANY_INFO = {
  name: 'Michael & Erick Repairs',
  address: 'La Romana, República Dominicana',
  phone: '849-432-2537',
  email: 'michaeldavid220008@gmail.com'
};

export const generateReceiptPDF = (receipt, client) => {
  const doc = new jsPDF();

  // Fuente base
  doc.setFont('helvetica', 'normal');

  // Header
  doc.setFontSize(20);
  doc.text(COMPANY_INFO.name, 14, 20);

  doc.setFontSize(10);
  if (COMPANY_INFO.rnc) {
    doc.text(`RNC: ${COMPANY_INFO.rnc}`, 14, 28);
  }
  doc.text(COMPANY_INFO.address, 14, 33);
  doc.text(`Tel: ${COMPANY_INFO.phone}`, 14, 38);
  doc.text(`Email: ${COMPANY_INFO.email}`, 14, 43);

  // Receipt Info (right)
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text(`RECIBO ${receipt.id}`, 140, 20);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const date = new Date(receipt.createdAt).toLocaleString('es-DO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  doc.text(`Fecha: ${date}`, 140, 28);
  doc.text(`Pago: ${receipt.paymentMethod}`, 140, 33);

  // Cliente
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENTE', 14, 55);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  doc.text(`Nombre: ${client?.name || 'N/A'}`, 14, 62);
  doc.text(`Teléfono: ${client?.phone || 'N/A'}`, 14, 67);

  if (client?.address) {
    const address = doc.splitTextToSize(`Dirección: ${client.address}`, 90);
    doc.text(address, 14, 72);
  }

  // Tabla
  const tableData = receipt.items.map(item => [
    item.description,
    item.qty,
    formatCurrency(item.unitPrice),
    formatCurrency(item.subtotal)
  ]);

  doc.autoTable({
    startY: 80,
    head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  // Totales dinámicos (FIX REAL)
  let yPos = doc.lastAutoTable.finalY + 10;

  const addLine = (label, value, bold = false) => {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.text(label, 120, yPos);
    doc.text(value, 195, yPos, { align: 'right' });
    yPos += 6;
  };

  doc.setFontSize(10);

  addLine('Subtotal:', formatCurrency(receipt.subtotal + receipt.discount));

  if (receipt.discount > 0) {
    addLine('Descuento:', `-${formatCurrency(receipt.discount)}`);
  }

  if (receipt.tax > 0) {
    addLine('ITBIS:', formatCurrency(receipt.tax));
  }

  doc.setFontSize(12);
  addLine('TOTAL:', formatCurrency(receipt.total), true);

  // Notas (con wrap)
  if (receipt.notes) {
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    doc.text('Notas:', 14, yPos);
    yPos += 6;

    const notes = doc.splitTextToSize(receipt.notes, 180);
    doc.text(notes, 14, yPos);
  }

  // Footer dinámico
  const pageHeight = doc.internal.pageSize.height;

  doc.setFontSize(9);
  doc.setTextColor(100);

  doc.text(
    'Este recibo respalda la prestación del servicio. Guardar comprobante.',
    14,
    pageHeight - 20
  );

  doc.text(
    `Control: ${receipt.id} - ${new Date(receipt.createdAt).toISOString().split('T')[0]}`,
    14,
    pageHeight - 10
  );

  return doc;
};

// ================= UTIL =================

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

export const printReceipt = (receipt, client) => {
  const doc = generateReceiptPDF(receipt, client);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

export const downloadReceiptPDF = (receipt, client, filename = null) => {
  const doc = generateReceiptPDF(receipt, client);
  const defaultFilename = `recibo-${receipt.id}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
};

// ================= TÉRMICA =================

export const generateThermalPDF = (receipt, client) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200]
  });

  let y = 5;

  doc.setFont('helvetica', 'normal');

  // Header
  doc.setFontSize(12);
  doc.text(COMPANY_INFO.name, 40, y, { align: 'center' });
  y += 5;

  doc.setFontSize(8);
  doc.text(COMPANY_INFO.address, 40, y, { align: 'center' });
  y += 4;
  doc.text(`Tel: ${COMPANY_INFO.phone}`, 40, y, { align: 'center' });
  y += 6;

  doc.line(5, y, 75, y);
  y += 5;

  // Info
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`RECIBO: ${receipt.id}`, 5, y);
  y += 5;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);

  const date = new Date(receipt.createdAt).toLocaleString('es-DO');
  doc.text(`Fecha: ${date}`, 5, y);
  y += 4;

  doc.text(`Pago: ${receipt.paymentMethod}`, 5, y);
  y += 6;

  doc.text(`Cliente: ${client?.name || 'N/A'}`, 5, y);
  y += 4;

  doc.text(`Tel: ${client?.phone || 'N/A'}`, 5, y);
  y += 6;

  doc.line(5, y, 75, y);
  y += 5;

  // Items
  doc.setFont(undefined, 'bold');
  doc.text('DESCRIPCION', 5, y);
  doc.text('TOTAL', 75, y, { align: 'right' });
  y += 4;

  doc.setFont(undefined, 'normal');

  receipt.items.forEach(item => {
    const line = `${item.qty}x ${item.description}`;
    const split = doc.splitTextToSize(line, 45);

    doc.text(split, 5, y);
    doc.text(formatCurrency(item.subtotal), 75, y, { align: 'right' });

    y += split.length * 4;
  });

  y += 2;
  doc.line(5, y, 75, y);
  y += 5;

  // Totales
  const addLine = (label, value, bold = false) => {
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.text(label, 40, y);
    doc.text(value, 75, y, { align: 'right' });
    y += 4;
  };

  addLine('Subtotal:', formatCurrency(receipt.subtotal + receipt.discount));

  if (receipt.discount > 0) {
    addLine('Descuento:', `-${formatCurrency(receipt.discount)}`);
  }

  if (receipt.tax > 0) {
    addLine('ITBIS:', formatCurrency(receipt.tax));
  }

  addLine('TOTAL:', formatCurrency(receipt.total), true);

  y += 5;

  doc.setFontSize(7);
  doc.text('Este recibo respalda la prestacion', 40, y, { align: 'center' });
  y += 3;
  doc.text('del servicio. Guardar comprobante.', 40, y, { align: 'center' });

  return doc;
};