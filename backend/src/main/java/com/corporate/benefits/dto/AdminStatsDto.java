package com.corporate.benefits.dto;

import java.util.List;

public record AdminStatsDto(
        long totalCompanies,
        long totalEmployees,
        long totalApplications,
        long approvedApplications,
        List<TopOfferDto> topOffers
) {
}
