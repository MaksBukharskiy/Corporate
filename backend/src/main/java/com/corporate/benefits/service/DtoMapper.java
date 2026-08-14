package com.corporate.benefits.service;

import com.corporate.benefits.domain.BenefitApplication;
import com.corporate.benefits.domain.Company;
import com.corporate.benefits.domain.Employee;
import com.corporate.benefits.domain.Merchant;
import com.corporate.benefits.domain.Offer;
import com.corporate.benefits.domain.PointTransaction;
import com.corporate.benefits.dto.ApplicationDto;
import com.corporate.benefits.dto.CompanyDto;
import com.corporate.benefits.dto.EmployeeDto;
import com.corporate.benefits.dto.MerchantDto;
import com.corporate.benefits.dto.OfferDto;
import com.corporate.benefits.dto.TransactionDto;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public CompanyDto toCompanyDto(Company company, long employeeCount) {
        return new CompanyDto(company.getId(), company.getName(), company.getLogoUrl(), employeeCount);
    }

    public EmployeeDto toEmployeeDto(Employee employee) {
        return new EmployeeDto(
                employee.getId(),
                employee.getCompany().getId(),
                employee.getCompany().getName(),
                employee.getName(),
                employee.getBalance()
        );
    }

    public MerchantDto toMerchantDto(Merchant merchant) {
        return new MerchantDto(merchant.getId(), merchant.getName(), merchant.getLogoUrl(), merchant.getDescription());
    }

    public OfferDto toOfferDto(Offer offer) {
        return new OfferDto(
                offer.getId(),
                offer.getMerchant().getId(),
                offer.getMerchant().getName(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getImageUrl(),
                offer.getPointsPrice(),
                offer.getCategory()
        );
    }

    public ApplicationDto toApplicationDto(BenefitApplication application) {
        Employee employee = application.getEmployee();
        Offer offer = application.getOffer();
        return new ApplicationDto(
                application.getId(),
                employee.getId(),
                employee.getName(),
                employee.getCompany().getName(),
                offer.getId(),
                offer.getTitle(),
                offer.getMerchant().getName(),
                offer.getPointsPrice(),
                application.getStatus(),
                application.getVoucherCode(),
                application.getCreatedAt(),
                application.getDecidedAt()
        );
    }

    public TransactionDto toTransactionDto(PointTransaction transaction) {
        Employee employee = transaction.getEmployee();
        return new TransactionDto(
                transaction.getId(),
                employee.getId(),
                employee.getName(),
                employee.getCompany().getName(),
                transaction.getAmount(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }
}
