package com.corporate.benefits.service;

import com.corporate.benefits.dto.AdminStatsDto;
import com.corporate.benefits.dto.TopOfferDto;
import com.corporate.benefits.dto.TransactionDto;
import com.corporate.benefits.repository.BenefitApplicationRepository;
import com.corporate.benefits.repository.CompanyRepository;
import com.corporate.benefits.repository.EmployeeRepository;
import com.corporate.benefits.repository.PointTransactionRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final CompanyRepository companyRepository;
    private final EmployeeRepository employeeRepository;
    private final BenefitApplicationRepository applicationRepository;
    private final PointTransactionRepository transactionRepository;
    private final DtoMapper mapper;

    public AdminService(
            CompanyRepository companyRepository,
            EmployeeRepository employeeRepository,
            BenefitApplicationRepository applicationRepository,
            PointTransactionRepository transactionRepository,
            DtoMapper mapper
    ) {
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
        this.applicationRepository = applicationRepository;
        this.transactionRepository = transactionRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getStats() {
        List<TopOfferDto> topOffers = applicationRepository.findTopOffers().stream()
                .limit(5)
                .map(row -> new TopOfferDto((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        long approved = applicationRepository.countApproved();

        return new AdminStatsDto(
                companyRepository.count(),
                employeeRepository.count(),
                applicationRepository.count(),
                approved,
                topOffers
        );
    }

    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactions() {
        return transactionRepository.findAllWithDetails().stream()
                .map(mapper::toTransactionDto)
                .toList();
    }
}
