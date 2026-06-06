package com.vendorbridge.invoice.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.vendorbridge.invoice.entity.Invoice;
import com.vendorbridge.invoice.entity.InvoiceLineItem;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class InvoicePdfService {

    public byte[] generatePdf(Invoice invoice) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("INVOICE")
                    .setBold()
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Invoice Number: " + invoice.getInvoiceNumber()));
            document.add(new Paragraph("PO Number: " + invoice.getPurchaseOrder().getPoNumber()));
            document.add(new Paragraph("Vendor: " + invoice.getVendor().getCompanyName()));
            document.add(new Paragraph("Invoice Date: " + invoice.getInvoiceDate()));
            document.add(new Paragraph("Due Date: " + invoice.getDueDate()));
            
            document.add(new Paragraph("\n"));

            Table table = new Table(new float[]{4, 1, 2, 2});
            table.useAllAvailableWidth();
            table.addHeaderCell("Description");
            table.addHeaderCell("Qty");
            table.addHeaderCell("Unit Price");
            table.addHeaderCell("Total Price");

            for (InvoiceLineItem item : invoice.getLineItems()) {
                table.addCell(item.getDescription());
                table.addCell(item.getQuantity().toString());
                table.addCell(item.getUnitPrice().toString());
                table.addCell(item.getTotalAmount().toString());
            }

            document.add(table);

            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Sub Total: " + invoice.getSubTotal())
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Tax Amount: " + invoice.getTaxAmount())
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Total Amount: " + invoice.getTotalAmount())
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
