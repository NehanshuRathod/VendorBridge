package com.vendorbridge.invoice.service;

import com.vendorbridge.user.entity.User;
import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.invoice.dto.CreateInvoiceRequest;
import com.vendorbridge.invoice.mapper.InvoiceMapper;
import com.vendorbridge.invoice.repository.InvoiceRepository;
import com.vendorbridge.purchaseorder.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private InvoiceMapper invoiceMapper;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    @Test
    void testCreateInvoice() {
        User mockUser = new User();
        CustomUserDetails userDetails = new CustomUserDetails(mockUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        CreateInvoiceRequest request = new CreateInvoiceRequest();
        request.setPurchaseOrderId(UUID.randomUUID());

        try {
            invoiceService.createInvoice(request);
        } catch (Exception ignored) {}

        verify(purchaseOrderRepository).findById(any());
    }
}
