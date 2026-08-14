package com.corporate.benefits.dto;

public record OfferDto(
        Long id,
        Long merchantId,
        String merchantName,
        String title,
        String description,
        String imageUrl,
        Integer pointsPrice,
        String category
) {
}
