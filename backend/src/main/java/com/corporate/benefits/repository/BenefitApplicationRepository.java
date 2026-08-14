package com.corporate.benefits.repository;

import com.corporate.benefits.domain.ApplicationStatus;
import com.corporate.benefits.domain.BenefitApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BenefitApplicationRepository extends JpaRepository<BenefitApplication, Long> {

    @Query("""
            select a from BenefitApplication a
            join fetch a.employee e
            join fetch a.offer o
            join fetch o.merchant
            where e.id = :employeeId
            order by a.createdAt desc
            """)
    List<BenefitApplication> findByEmployeeId(@Param("employeeId") Long employeeId);

    @Query("""
            select a from BenefitApplication a
            join fetch a.employee e
            join fetch e.company
            join fetch a.offer o
            join fetch o.merchant m
            where m.id = :merchantId
            and a.status in :statuses
            order by a.createdAt desc
            """)
    List<BenefitApplication> findByMerchantIdAndStatuses(
            @Param("merchantId") Long merchantId,
            @Param("statuses") List<ApplicationStatus> statuses);

    @Query("""
            select count(a) from BenefitApplication a
            where a.status in ('APPROVED', 'REDEEMED')
            """)
    long countApproved();

    @Query("""
            select o.title, count(a.id)
            from BenefitApplication a
            join a.offer o
            where a.status in ('APPROVED', 'REDEEMED')
            group by o.title
            order by count(a.id) desc
            """)
    List<Object[]> findTopOffers();
}
