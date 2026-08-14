package com.corporate.benefits.dto;

import jakarta.validation.constraints.NotNull;

public record CreateApplicationRequest(@NotNull Long employeeId, @NotNull Long offerId) {
}
