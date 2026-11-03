package com.contract.Backend.Repository;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.ContractTemplate;
import com.contract.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;


@Repository
public interface ContractTemplateRepository extends JpaRepository<ContractTemplate, UUID> {
    List<ContractTemplate> findByIsActiveTrue();
    List<ContractTemplate> findByContractType(String contractType);
    List<ContractTemplate> findByIsActiveTrueOrderByTimesUsedDesc();
}



