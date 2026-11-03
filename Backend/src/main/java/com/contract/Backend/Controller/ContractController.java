package com.contract.Backend.Controller;

import com.contract.Backend.DTO.ContractDraftRequest;
import com.contract.Backend.DTO.ContractDraftResponse;
import com.contract.Backend.Service.ContractService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for contract-related operations
 */
@RestController
@RequestMapping("/api/v1/contracts")
@Validated
@Slf4j
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    /**
     * Generate a contract draft based on user input
     * 
     * @param request Contract draft request containing type, parties, and prompt
     * @return Structured contract response with formatted content
     */
    @PostMapping("/draft")
    public ResponseEntity<?> generateContractDraft( @RequestBody ContractDraftRequest request) {
        try {

            
            // Generate the contract draft using AI service
            ContractDraftResponse response = contractService.generateContractDraft(request);
            

            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(createErrorResponse("Invalid request parameters", e.getMessage()));
                    
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error", "Failed to generate contract draft"));
        }
    }

    /**
     * Health check endpoint for the contract service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Contract Service");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Get supported contract types
     */
    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getSupportedContractTypes() {
        Map<String, Object> response = new HashMap<>();
        response.put("supportedTypes", new String[]{
            "Founders Agreement", 
            "Shareholders Agreement (SHA)", 
            "NDA Template", 
            "MSA + SOW Template", 
            "Vendor Agreement", 
            "Employment Agreement + IP Assignment", 
            "Privacy Policy", 
            "Terms & Conditions", 
            "ESOP Plan", 
            "Refund/Return + Cancellation Policy"
        });
        response.put("defaultType", "NDA Template");
        return ResponseEntity.ok(response);
    }

    /**
     * Create standardized error response
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
        errorResponse.put("status", "error");
        return errorResponse;
    }
}