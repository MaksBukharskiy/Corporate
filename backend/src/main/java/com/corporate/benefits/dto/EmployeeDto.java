package com.corporate.benefits.dto;

public record EmployeeDto(Long id, Long companyId, String companyName, String name, Integer balance) {
}
