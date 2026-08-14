package com.corporate.benefits.controller;

import com.corporate.benefits.dto.AdminStatsDto;
import com.corporate.benefits.dto.CompanyDto;
import com.corporate.benefits.dto.TransactionDto;
import com.corporate.benefits.service.AdminService;
import com.corporate.benefits.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final CatalogService catalogService;

    public AdminController(AdminService adminService, CatalogService catalogService) {
        this.adminService = adminService;
        this.catalogService = catalogService;
    }

    @GetMapping("/stats")
    public AdminStatsDto getStats() {
        return adminService.getStats();
    }

    @GetMapping("/transactions")
    public List<TransactionDto> getTransactions() {
        return adminService.getTransactions();
    }

    @GetMapping("/companies")
    public List<CompanyDto> getCompanies() {
        return catalogService.getCompanies();
    }
}
