package com.corporate.benefits.repository;

import com.corporate.benefits.domain.PointTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    @Query("""
            select t from PointTransaction t
            join fetch t.employee e
            join fetch e.company
            order by t.createdAt desc
            """)
    List<PointTransaction> findAllWithDetails();
}
