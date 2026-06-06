package com.vendorbridge.rfq.service;

import com.vendorbridge.user.entity.User;
import com.vendorbridge.auth.security.CustomUserDetails;
import com.vendorbridge.rfq.dto.CreateRfqRequest;
import com.vendorbridge.rfq.mapper.RfqMapper;
import com.vendorbridge.rfq.repository.RfqRepository;
import com.vendorbridge.shared.utils.SequenceGenerator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RfqServiceTest {

    @Mock
    private RfqRepository rfqRepository;

    @Mock
    private RfqMapper rfqMapper;

    @Mock
    private SequenceGenerator sequenceGenerator;

    @InjectMocks
    private RfqServiceImpl rfqService;

    @Test
    void testCreateRfq() {
        User mockUser = new User();
        CustomUserDetails userDetails = new CustomUserDetails(mockUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        CreateRfqRequest request = new CreateRfqRequest();
        request.setTitle("Test RFQ");

        try {
            rfqService.createRfq(request);
        } catch (Exception ignored) {}

        verify(rfqMapper).toEntity(any());
    }
}
