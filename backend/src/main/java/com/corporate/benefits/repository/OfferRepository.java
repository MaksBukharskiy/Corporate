package com.corporate.benefits.repository;

import com.corporate.benefits.domain.Offer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OfferRepository extends JpaRepository<Offer, Long> {

    @Query("""
            select o from Offer o
            join fetch o.merchant m
            where o.active = true
            and (:category is null or o.category = :category)
            order by o.title asc
            """)
    List<Offer> findActiveOffers(@Param("category") String category);
}
