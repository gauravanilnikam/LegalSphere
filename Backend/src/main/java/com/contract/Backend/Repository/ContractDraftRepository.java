package com.contract.Backend.Repository;
import com.contract.Backend.model.ContractDraft;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractDraftRepository extends JpaRepository<ContractDraft, UUID> {
    List<ContractDraft> findByContractRequest(ContractRequest request);
    List<ContractDraft> findByContractRequestOrderByVersionDesc(ContractRequest request);
    Optional<ContractDraft> findTopByContractRequestOrderByVersionDesc(ContractRequest request);
    List<ContractDraft> findByCreatedBy(User user);
}
