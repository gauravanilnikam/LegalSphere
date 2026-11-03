package com.contract.Backend.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;



/**
 * DTO for contract draft request containing all necessary information
 * to generate a contract using AI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractDraftRequest {
    
    
    private String contractType;
    
    
    private String partyA;
    
    
    private String partyB;
    
    
    private String prompt;
}