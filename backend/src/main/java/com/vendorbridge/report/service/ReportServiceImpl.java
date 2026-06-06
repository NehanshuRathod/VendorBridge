package com.vendorbridge.report.service;

import com.vendorbridge.approval.repository.ApprovalRequestRepository;
import com.vendorbridge.invoice.entity.Invoice;
import com.vendorbridge.invoice.repository.InvoiceRepository;
import com.vendorbridge.notification.repository.NotificationRepository;
import com.vendorbridge.purchaseorder.entity.PurchaseOrder;
import com.vendorbridge.purchaseorder.repository.PurchaseOrderRepository;
import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.quotation.repository.QuotationRepository;
import com.vendorbridge.report.dto.*;
import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.rfq.repository.RfqRepository;
import com.vendorbridge.shared.enums.ApprovalStatus;
import com.vendorbridge.shared.enums.InvoiceStatus;
import com.vendorbridge.shared.enums.PoStatus;
import com.vendorbridge.shared.enums.QuotationStatus;
import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.vendor.entity.Vendor;
import com.vendorbridge.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final VendorRepository vendorRepository;
    private final RfqRepository rfqRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics(UUID userId) {
        long totalVendors = vendorRepository.count();
        long activeRfqs = rfqRepository.countByStatus(RfqStatus.PUBLISHED);
        long pendingApprovals = approvalRequestRepository.countByApproverIdAndStatus(userId, ApprovalStatus.PENDING);
        long unreadNotifications = notificationRepository.countByRecipientIdAndReadFalse(userId);

        PurchaseOrderSummary poSummary = PurchaseOrderSummary.builder()
                .totalCount(purchaseOrderRepository.count())
                .generatedCount(purchaseOrderRepository.countByStatus(PoStatus.GENERATED))
                .acknowledgedCount(purchaseOrderRepository.countByStatus(PoStatus.ACKNOWLEDGED))
                .completedCount(purchaseOrderRepository.countByStatus(PoStatus.DELIVERED))
                .totalValue(purchaseOrderRepository.sumTotalAmount())
                .build();

        long paidInvoices = invoiceRepository.countByStatus(InvoiceStatus.PAID);
        long overdueInvoices = invoiceRepository.countByStatus(InvoiceStatus.OVERDUE);
        long sentInvoices = invoiceRepository.countByStatus(InvoiceStatus.SENT);
        BigDecimal pendingValue = invoiceRepository.findByStatusIn(List.of(InvoiceStatus.GENERATED, InvoiceStatus.SENT, InvoiceStatus.RECEIVED, InvoiceStatus.APPROVED, InvoiceStatus.OVERDUE))
                .stream()
                .map(invoice -> invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        InvoiceSummary invoiceSummary = InvoiceSummary.builder()
                .totalCount(invoiceRepository.count())
                .generatedCount(invoiceRepository.countByStatus(InvoiceStatus.GENERATED))
                .sentCount(sentInvoices)
                .paidCount(paidInvoices)
                .overdueCount(overdueInvoices)
                .totalValue(invoiceRepository.sumTotalAmount())
                .pendingValue(pendingValue)
                .build();

        return DashboardResponse.builder()
                .totalVendors(totalVendors)
                .activeRfqs(activeRfqs)
                .pendingApprovals(pendingApprovals)
                .unreadNotifications(unreadNotifications)
                .poSummary(poSummary)
                .invoiceSummary(invoiceSummary)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorPerformanceResponse> getVendorPerformance(LocalDate startDate, LocalDate endDate) {
        List<VendorPerformanceResponse> responses = new ArrayList<>();
        List<Vendor> vendors = vendorRepository.findAll();

        for (Vendor vendor : vendors) {
            long submittedCount = quotationRepository.countByVendorId(vendor.getId());
            long selectedCount = quotationRepository.countByVendorIdAndStatus(vendor.getId(), QuotationStatus.SELECTED);
            long rfqsParticipated = quotationRepository.countByVendorId(vendor.getId());
            long fulfilledOrders = purchaseOrderRepository.findByVendorId(vendor.getId(), Pageable.unpaged()).getTotalElements();

            BigDecimal successRate = submittedCount == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(selectedCount * 100.0 / submittedCount);

            responses.add(VendorPerformanceResponse.builder()
                    .vendorId(vendor.getId())
                    .companyName(vendor.getCompanyName())
                    .rfqsParticipated(rfqsParticipated)
                    .quotationsSubmitted(submittedCount)
                    .quotationsSelected(selectedCount)
                    .successRate(successRate)
                    .purchaseOrdersFulfilled((int) fulfilledOrders)
                    .currentRating(vendor.getRating() != null ? vendor.getRating() : BigDecimal.ZERO)
                    .build());
        }

        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public SpendingSummaryResponse getSpendingSummary(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(12);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        List<Invoice> invoices = invoiceRepository.findByInvoiceDateBetween(start, end);

        Map<String, BigDecimal> spendByCategory = invoices.stream()
                .filter(invoice -> invoice.getVendor() != null && invoice.getVendor().getCategory() != null)
                .collect(Collectors.groupingBy(
                        invoice -> invoice.getVendor().getCategory().name(),
                        Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)
                ));

        Map<String, BigDecimal> spendByVendor = invoices.stream()
                .filter(invoice -> invoice.getVendor() != null && invoice.getVendor().getCompanyName() != null)
                .collect(Collectors.groupingBy(
                        invoice -> invoice.getVendor().getCompanyName(),
                        Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)
                ));

        Map<String, BigDecimal> spendByMonth = invoices.stream()
                .filter(invoice -> invoice.getInvoiceDate() != null)
                .collect(Collectors.groupingBy(
                        invoice -> invoice.getInvoiceDate().getMonth().name().substring(0, 3) + " " + invoice.getInvoiceDate().getYear(),
                        Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)
                ));

        BigDecimal totalSpend = invoices.stream()
                .map(invoice -> invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SpendingSummaryResponse.builder()
                .totalSpend(totalSpend)
                .spendByCategory(spendByCategory)
                .spendByVendor(spendByVendor)
                .spendByMonth(spendByMonth)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProcurementTrendResponse getProcurementTrends(int lastMonths) {
        LocalDateTime from = LocalDateTime.now().minusMonths(lastMonths);
        LocalDateTime to = LocalDateTime.now();

        List<Rfq> rfqs = rfqRepository.findByCreatedAtBetween(from, to);
        List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByCreatedAtBetween(from, to);
        List<Invoice> invoices = invoiceRepository.findByInvoiceDateBetween(from.toLocalDate(), to.toLocalDate());

        Map<String, Long> rfqsByMonth = rfqs.stream()
                .filter(rfq -> rfq.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        rfq -> rfq.getCreatedAt().getMonth().name().substring(0, 3) + " " + rfq.getCreatedAt().getYear(),
                        Collectors.counting()
                ));

        Map<String, Long> posByMonth = purchaseOrders.stream()
                .filter(po -> po.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        po -> po.getCreatedAt().getMonth().name().substring(0, 3) + " " + po.getCreatedAt().getYear(),
                        Collectors.counting()
                ));

        Map<String, BigDecimal> spendByMonth = invoices.stream()
                .filter(invoice -> invoice.getInvoiceDate() != null)
                .collect(Collectors.groupingBy(
                        invoice -> invoice.getInvoiceDate().getMonth().name().substring(0, 3) + " " + invoice.getInvoiceDate().getYear(),
                        Collectors.reducing(BigDecimal.ZERO, invoice -> invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add)
                ));

        List<Long> days = purchaseOrders.stream()
                .filter(po -> po.getRfq() != null && po.getCreatedAt() != null && po.getRfq().getCreatedAt() != null)
                .map(po -> java.time.Duration.between(po.getRfq().getCreatedAt(), po.getCreatedAt()).toDays())
                .collect(Collectors.toList());

        BigDecimal averageRfqToPoDays = days.isEmpty() ? BigDecimal.ZERO : BigDecimal.valueOf(days.stream().mapToLong(Long::longValue).average().orElse(0));

        return ProcurementTrendResponse.builder()
                .rfqsByMonth(rfqsByMonth)
                .posByMonth(posByMonth)
                .spendByMonth(spendByMonth)
                .averageRfqToPoDays(averageRfqToPoDays)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportVendorPerformanceToExcel(LocalDate startDate, LocalDate endDate) {
        // Using Apache POI to generate Excel would go here
        // Returning empty byte array for mock
        return new byte[0];
    }
}
