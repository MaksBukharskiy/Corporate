package com.corporate.benefits.service;

import com.corporate.benefits.dto.CompanyDto;
import com.corporate.benefits.dto.EmployeeDto;
import com.corporate.benefits.dto.MerchantDto;
import com.corporate.benefits.dto.OfferDto;
import com.corporate.benefits.exception.NotFoundException;
import com.corporate.benefits.repository.CompanyRepository;
import com.corporate.benefits.repository.EmployeeRepository;
import com.corporate.benefits.repository.MerchantRepository;
import com.corporate.benefits.repository.OfferRepository;
import com.corporate.benefits.repository.PointTransactionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final MerchantRepository merchantRepository;
    private final OfferRepository offerRepository;
    private final DtoMapper mapper;

    public CatalogService(
            CompanyRepository companyRepository,
            EmployeeRepository employeeRepository,
            MerchantRepository merchantRepository,
            OfferRepository offerRepository,
            DtoMapper mapper
    ) {
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
        this.merchantRepository = merchantRepository;
        this.offerRepository = offerRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<CompanyDto> getCompanies() {
        return companyRepository.findAll().stream()
                .map(company -> mapper.toCompanyDto(
                        company,
                        employeeRepository.findByCompanyIdOrderByNameAsc(company.getId()).size()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployees(Long companyId) {
        return employeeRepository.findByCompanyIdOrderByNameAsc(companyId).stream()
                .map(mapper::toEmployeeDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeDto getEmployee(Long id) {
        return employeeRepository.findById(id)
                .map(mapper::toEmployeeDto)
                .orElseThrow(() -> new NotFoundException("Employee not found"));
    }

    @Transactional(readOnly = true)
    public List<MerchantDto> getMerchants() {
        return merchantRepository.findAll().stream()
                .map(mapper::toMerchantDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OfferDto> getOffers(String category) {
        return offerRepository.findActiveOffers(category).stream()
                .map(mapper::toOfferDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OfferDto getOffer(Long id) {
        return offerRepository.findById(id)
                .map(mapper::toOfferDto)
                .orElseThrow(() -> new NotFoundException("Offer not found"));
    }
}
