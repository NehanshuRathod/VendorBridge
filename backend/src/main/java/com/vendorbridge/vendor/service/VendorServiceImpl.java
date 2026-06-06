package com.vendorbridge.vendor.service;

import com.vendorbridge.shared.audit.Auditable;
import com.vendorbridge.shared.dto.PagedResponse;
import com.vendorbridge.shared.enums.VendorCategory;
import com.vendorbridge.shared.enums.VendorStatus;
import com.vendorbridge.shared.exceptions.DuplicateResourceException;
import com.vendorbridge.shared.exceptions.ResourceNotFoundException;
import com.vendorbridge.vendor.dto.CreateVendorRequest;
import com.vendorbridge.vendor.dto.UpdateVendorRequest;
import com.vendorbridge.vendor.dto.VendorResponse;
import com.vendorbridge.vendor.entity.Vendor;
import com.vendorbridge.vendor.mapper.VendorMapper;
import com.vendorbridge.vendor.repository.VendorRepository;
import com.vendorbridge.vendor.specification.VendorSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final VendorMapper vendorMapper;

    @Override
    @Transactional
    @Auditable(action = "CREATE_VENDOR")
    @CacheEvict(value = "vendors", allEntries = true)
    public VendorResponse createVendor(CreateVendorRequest request) {
        if (request.getGstNumber() != null && vendorRepository.existsByGstNumber(request.getGstNumber())) {
            throw new DuplicateResourceException("Vendor", "gstNumber", request.getGstNumber());
        }
        Vendor vendor = vendorMapper.toEntity(request);
        vendor.setStatus(VendorStatus.PENDING_APPROVAL);
        vendor = vendorRepository.save(vendor);
        return vendorMapper.toResponse(vendor);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "vendors")
    public PagedResponse<VendorResponse> getAllVendors(VendorStatus status, VendorCategory category, String search, Pageable pageable) {
        Specification<Vendor> spec = Specification.where(VendorSpecification.hasStatus(status))
                .and(VendorSpecification.hasCategory(category))
                .and(VendorSpecification.companyNameContains(search));

        Page<Vendor> page = vendorRepository.findAll(spec, pageable);
        return PagedResponse.from(page.map(vendorMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public VendorResponse getVendorById(UUID id) {
        Vendor vendor = findVendorById(id);
        return vendorMapper.toResponse(vendor);
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_VENDOR")
    @CacheEvict(value = "vendors", allEntries = true)
    public VendorResponse updateVendor(UUID id, UpdateVendorRequest request) {
        Vendor vendor = findVendorById(id);
        
        if (request.getGstNumber() != null && !request.getGstNumber().equals(vendor.getGstNumber()) 
                && vendorRepository.existsByGstNumber(request.getGstNumber())) {
            throw new DuplicateResourceException("Vendor", "gstNumber", request.getGstNumber());
        }

        vendorMapper.updateEntity(request, vendor);
        vendor = vendorRepository.save(vendor);
        return vendorMapper.toResponse(vendor);
    }

    @Override
    @Transactional
    @Auditable(action = "DELETE_VENDOR")
    @CacheEvict(value = "vendors", allEntries = true)
    public void deleteVendor(UUID id) {
        Vendor vendor = findVendorById(id);
        vendorRepository.delete(vendor);
    }

    @Override
    @Transactional
    @Auditable(action = "UPDATE_VENDOR_STATUS")
    @CacheEvict(value = "vendors", allEntries = true)
    public VendorResponse updateStatus(UUID id, VendorStatus status) {
        Vendor vendor = findVendorById(id);
        vendor.setStatus(status);
        vendor = vendorRepository.save(vendor);
        return vendorMapper.toResponse(vendor);
    }

    private Vendor findVendorById(UUID id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", id));
    }
}
