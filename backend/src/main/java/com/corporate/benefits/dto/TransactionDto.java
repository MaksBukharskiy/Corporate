package com.corporate.benefits.dto;

import com.corporate.benefits.domain.TransactionType;
import java.time.Instant;

public record TransactionDto(
        Long id,
        Long employeeId,
        String employeeName,
        String companyName,
        Integer amount,
        TransactionType type,
        String description,
        Instant createdAt
) {
}
