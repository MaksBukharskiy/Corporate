package com.corporate.benefits.controller;

import com.corporate.benefits.dto.ApplicationDto;
import com.corporate.benefits.dto.CompanyDto;
import com.corporate.benefits.dto.CreateApplicationRequest;
import com.corporate.benefits.dto.EmployeeDto;
import com.corporate.benefits.dto.MerchantDto;
import com.corporate.benefits.dto.OfferDto;
import com.corporate.benefits.service.ApplicationService;
import com.corporate.benefits.service.CatalogService;
import com.corporate.benefits.service.QrCodeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final CatalogService catalogService;
    private final ApplicationService applicationService;
    private final QrCodeService qrCodeService;

    public ApiController(
            CatalogService catalogService,
            ApplicationService applicationService,
            QrCodeService qrCodeService
    ) {
        this.catalogService = catalogService;
        this.applicationService = applicationService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping("/companies")
    public List<CompanyDto> getCompanies() {
        return catalogService.getCompanies();
    }

    @GetMapping("/employees")
    public List<EmployeeDto> getEmployees(@RequestParam Long companyId) {
        return catalogService.getEmployees(companyId);
    }

    @GetMapping("/employees/{id}")
    public EmployeeDto getEmployee(@PathVariable Long id) {
        return catalogService.getEmployee(id);
    }

    @GetMapping("/merchants")
    public List<MerchantDto> getMerchants() {
        return catalogService.getMerchants();
    }

    @GetMapping("/catalog")
    public List<OfferDto> getCatalog(@RequestParam(required = false) String category) {
        return catalogService.getOffers(category);
    }

    @GetMapping("/catalog/{id}")
    public OfferDto getOffer(@PathVariable Long id) {
        return catalogService.getOffer(id);
    }

    @PostMapping("/applications")
    public ApplicationDto createApplication(@Valid @RequestBody CreateApplicationRequest request) {
        return applicationService.create(request);
    }

    @GetMapping("/applications")
    public List<ApplicationDto> getApplications(@RequestParam Long employeeId) {
        return applicationService.getByEmployee(employeeId);
    }

    @GetMapping("/applications/pending")
    public List<ApplicationDto> getPendingApplications(@RequestParam Long merchantId) {
        return applicationService.getPendingByMerchant(merchantId);
    }

    @GetMapping("/applications/{id}")
    public ApplicationDto getApplication(@PathVariable Long id) {
        return applicationService.getById(id);
    }

    @PostMapping("/applications/{id}/approve")
    public ApplicationDto approve(@PathVariable Long id) {
        return applicationService.approve(id);
    }

    @PostMapping("/applications/{id}/reject")
    public ApplicationDto reject(@PathVariable Long id) {
        return applicationService.reject(id);
    }

    @PostMapping("/applications/{id}/redeem")
    public ApplicationDto redeem(@PathVariable Long id) {
        return applicationService.redeem(id);
    }

    @GetMapping(value = "/applications/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQr(@PathVariable Long id) {
        String code = applicationService.getVoucherCode(id);
        byte[] png = qrCodeService.generatePng(code);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"voucher-" + id + ".png\"")
                .body(png);
    }
}
