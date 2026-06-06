package com.vendorbridge.quotation.service;

import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.quotation.dto.CreateQuotationRequest;
import com.vendorbridge.quotation.dto.QuotationResponse;
import com.vendorbridge.quotation.entity.Quotation;
import com.vendorbridge.quotation.entity.QuotationItem;
import com.vendorbridge.quotation.mapper.QuotationMapper;
import com.vendorbridge.quotation.repository.QuotationItemRepository;
import com.vendorbridge.quotation.repository.QuotationRepository;
import com.vendorbridge.quotation.service.QuotationServiceImpl;
import com.vendorbridge.rfq.entity.Rfq;
import com.vendorbridge.rfq.entity.RfqVendorAssignment;
import com.vendorbridge.rfq.repository.RfqRepository;
import com.vendorbridge.rfq.repository.RfqVendorAssignmentRepository;
import com.vendorbridge.shared.enums.RfqStatus;
import com.vendorbridge.user.entity.User;
import com.vendorbridge.vendor.entity.Vendor;
import com.vendorbridge.vendor.entity.VendorUser;
import com.vendorbridge.vendor.repository.VendorUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class QuotationServiceTest {

    @Mock
    private QuotationRepository quotationRepository;

    @Mock
    private QuotationItemRepository quotationItemRepository;

    @Mock
    private RfqRepository rfqRepository;

    @Mock
    private RfqVendorAssignmentRepository rfqVendorAssignmentRepository;

    @Mock
    private VendorUserRepository vendorUserRepository;

    @Mock
    private QuotationMapper quotationMapper;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private QuotationServiceImpl quotationService;

    @Test
    void testCreateQuotation() {
        UUID userId = UUID.randomUUID();
        UUID rfqId = UUID.randomUUID();
        UUID vendorId = UUID.randomUUID();

        User mockUser = new User();
        mockUser.setId(userId);
        CustomUserDetails userDetails = new CustomUserDetails(mockUser);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Vendor vendor = new Vendor();
        vendor.setId(vendorId);

        VendorUser vendorUser = new VendorUser();
        vendorUser.setUser(mockUser);
        vendorUser.setVendor(vendor);

        Rfq rfq = new Rfq();
        rfq.setId(rfqId);
        rfq.setStatus(RfqStatus.PUBLISHED);
        rfq.setDeadline(LocalDate.now().plusDays(5));

        CreateQuotationRequest request = new CreateQuotationRequest();
        request.setRfqId(rfqId);
        request.setValidUntil(LocalDate.now().plusDays(10));
        request.setNotes("Test quotation");

        Quotation quotation = new Quotation();

        when(vendorUserRepository.findByUserId(userId)).thenReturn(Optional.of(vendorUser));
        when(rfqRepository.findById(rfqId)).thenReturn(Optional.of(rfq));
        when(rfqVendorAssignmentRepository.findByRfqIdAndVendorId(rfqId, vendorId)).thenReturn(Optional.of(new RfqVendorAssignment()));
        when(quotationRepository.existsByRfqIdAndVendorId(rfqId, vendorId)).thenReturn(false);
        when(quotationMapper.toEntity(request)).thenReturn(quotation);
        when(quotationRepository.save(quotation)).thenReturn(quotation);

        QuotationResponse response = new QuotationResponse();
        when(quotationMapper.toResponse(quotation)).thenReturn(response);

        QuotationResponse result = quotationService.createQuotation(request);

        assertSame(response, result);
        verify(quotationMapper).toEntity(request);
        verify(quotationRepository).save(quotation);
        verify(rfqVendorAssignmentRepository).save(any(RfqVendorAssignment.class));
    }
}
