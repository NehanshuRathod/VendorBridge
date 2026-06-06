package com.vendorbridge.purchaseorder.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import com.vendorbridge.quotation.entity.QuotationItem;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PurchaseOrderPdfService {

    public byte[] generatePdf(PurchaseOrder po) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("PURCHASE ORDER")
                    .setBold()
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("PO Number: " + po.getPoNumber()));
            document.add(new Paragraph("Vendor: " + po.getVendor().getCompanyName()));
            document.add(new Paragraph("Delivery Address: " + po.getDeliveryAddress()));
            document.add(new Paragraph("Delivery Date: " + po.getDeliveryDate()));
            document.add(new Paragraph("Payment Terms: " + po.getPaymentTerms()));
            
            document.add(new Paragraph("\n"));

            Table table = new Table(new float[]{4, 1, 2, 2});
            table.useAllAvailableWidth();
            table.addHeaderCell("Item Description");
            table.addHeaderCell("Qty");
            table.addHeaderCell("Unit Price");
            table.addHeaderCell("Total Price");

            for (QuotationItem item : po.getQuotation().getItems()) {
                table.addCell(item.getRfqItem().getProductName());
                table.addCell(item.getQuantity().toString());
                table.addCell(item.getUnitPrice().toString());
                table.addCell(item.getTotalPrice().toString());
            }

            document.add(table);

            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Total Amount: " + po.getTotalAmount())
                    .setBold()
                    .setTextAlignment(TextAlignment.RIGHT));

            document.add(new Paragraph("\nNotes:\n" + po.getNotes()));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
