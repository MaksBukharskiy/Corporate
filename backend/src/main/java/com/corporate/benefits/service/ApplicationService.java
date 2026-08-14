package com.corporate.benefits.service;

import com.corporate.benefits.domain.ApplicationStatus;
import com.corporate.benefits.domain.BenefitApplication;
import com.corporate.benefits.domain.Employee;
import com.corporate.benefits.domain.Offer;
import com.corporate.benefits.domain.PointTransaction;
import com.corporate.benefits.domain.TransactionType;
import com.corporate.benefits.dto.ApplicationDto;
import com.corporate.benefits.dto.CreateApplicationRequest;
import com.corporate.benefits.exception.BadRequestException;
import com.corporate.benefits.exception.NotFoundException;
import com.corporate.benefits.repository.BenefitApplicationRepository;
import com.corporate.benefits.repository.EmployeeRepository;
import com.corporate.benefits.repository.OfferRepository;
import com.corporate.benefits.repository.PointTransactionRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationService {

    private final BenefitApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;
    private final OfferRepository offerRepository;
    private final PointTransactionRepository transactionRepository;
    private final DtoMapper mapper;

    public ApplicationService(
            BenefitApplicationRepository applicationRepository,
            EmployeeRepository employeeRepository,
            OfferRepository offerRepository,
            PointTransactionRepository transactionRepository,
            DtoMapper mapper
    ) {
        this.applicationRepository = applicationRepository;
        this.employeeRepository = employeeRepository;
        this.offerRepository = offerRepository;
        this.transactionRepository = transactionRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getByEmployee(Long employeeId) {
        return applicationRepository.findByEmployeeId(employeeId).stream()
                .map(mapper::toApplicationDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getPendingByMerchant(Long merchantId) {
        return applicationRepository.findByMerchantIdAndStatuses(
                        merchantId,
                        List.of(ApplicationStatus.CREATED, ApplicationStatus.PENDING, ApplicationStatus.APPROVED)
                )
                .stream()
                .map(mapper::toApplicationDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationDto getById(Long id) {
        BenefitApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found"));
        return mapper.toApplicationDto(application);
    }

    @Transactional
    public ApplicationDto create(CreateApplicationRequest request) {
        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new NotFoundException("Employee not found"));
        Offer offer = offerRepository.findById(request.offerId())
                .orElseThrow(() -> new NotFoundException("Offer not found"));

        if (!offer.isActive()) {
            throw new BadRequestException("Offer is not active");
        }
        if (employee.getBalance() < offer.getPointsPrice()) {
            throw new BadRequestException("Not enough points");
        }

        BenefitApplication application = new BenefitApplication();
        application.setEmployee(employee);
        application.setOffer(offer);
        application.setStatus(ApplicationStatus.PENDING);
        application.setCreatedAt(Instant.now());

        return mapper.toApplicationDto(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationDto approve(Long id) {
        BenefitApplication application = getApplication(id);
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Application is not pending");
        }

        Employee employee = application.getEmployee();
        Offer offer = application.getOffer();
        int price = offer.getPointsPrice();

        if (employee.getBalance() < price) {
            throw new BadRequestException("Not enough points");
        }

        employee.setBalance(employee.getBalance() - price);
        application.setStatus(ApplicationStatus.APPROVED);
        application.setDecidedAt(Instant.now());
        application.setVoucherCode("CB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        PointTransaction transaction = new PointTransaction();
        transaction.setEmployee(employee);
        transaction.setAmount(price);
        transaction.setType(TransactionType.DEBIT);
        transaction.setDescription("Benefit: " + offer.getTitle());
        transaction.setCreatedAt(Instant.now());
        transactionRepository.save(transaction);

        return mapper.toApplicationDto(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationDto reject(Long id) {
        BenefitApplication application = getApplication(id);
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("Application is not pending");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application.setDecidedAt(Instant.now());
        return mapper.toApplicationDto(applicationRepository.save(application));
    }

    @Transactional
    public ApplicationDto redeem(Long id) {
        BenefitApplication application = getApplication(id);
        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new BadRequestException("Application is not approved");
        }

        application.setStatus(ApplicationStatus.REDEEMED);
        application.setDecidedAt(Instant.now());
        return mapper.toApplicationDto(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public String getVoucherCode(Long id) {
        BenefitApplication application = getApplication(id);
        if (application.getVoucherCode() == null) {
            throw new BadRequestException("Voucher is not generated yet");
        }
        return application.getVoucherCode();
    }

    private BenefitApplication getApplication(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found"));
    }
}
