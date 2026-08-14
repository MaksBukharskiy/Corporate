package com.corporate.benefits.repository;

import com.corporate.benefits.domain.Employee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    List<Employee> findByCompanyIdOrderByNameAsc(Long companyId);
}
