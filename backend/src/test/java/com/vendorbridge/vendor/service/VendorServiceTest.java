package com.vendorbridge.vendor.service;

import com.vendorbridge.vendor.dto.CreateVendorRequest;
import com.vendorbridge.vendor.mapper.VendorMapper;
import com.vendorbridge.vendor.repository.VendorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class VendorServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private VendorMapper vendorMapper;

    @InjectMocks
    private VendorServiceImpl vendorService;

    @Test
    void testCreateVendor() {
        CreateVendorRequest request = new CreateVendorRequest();
        request.setCompanyName("Test Vendor");

        try {
            vendorService.createVendor(request);
        } catch (Exception ignored) {}

        verify(vendorMapper).toEntity(any());
    }
}
