package com.corporate.benefits.dto;

import com.corporate.benefits.domain.ApplicationStatus;
import java.time.Instant;

public record ApplicationDto(
        Long id,
        Long employeeId,
        String employeeName,
        String companyName,
        Long offerId,
        String offerTitle,
        String merchantName,
        Integer pointsPrice,
        ApplicationStatus status,
        String voucherCode,
        Instant createdAt,
        Instant decidedAt
) {
}
