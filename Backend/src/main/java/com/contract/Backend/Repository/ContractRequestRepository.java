package com.contract.Backend.Repository;
import com.contract.Backend.model.Company;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContractRequestRepository extends JpaRepository<ContractRequest, UUID> {
    List<ContractRequest> findByRequestedBy(User user);
    List<ContractRequest> findByAssignedTo(User user);
    List<ContractRequest> findByStatus(ContractRequest.RequestStatus status);
    List<ContractRequest> findByAssignedToIsNull();
    
    // New methods for Company isolation
    List<ContractRequest> findByStatusAndRequestedBy_Company(ContractRequest.RequestStatus status, Company company);
    List<ContractRequest> findByAssignedToIsNullAndRequestedBy_Company(Company company);
}
