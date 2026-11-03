package com.contract.Backend.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for contract draft response containing structured contract information
 * formatted for professional document display
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractDraftResponse {
    
    private String contractTitle;
    private String contractType;
    private String partyA;
    private String partyB;
    private LocalDateTime generatedAt;
    
    // Contract sections
    private String preamble;
    private List<ContractSection> sections;
    private String conclusion;
    
    // Metadata
    private String jurisdiction;
    private String governingLaw;
    private String effectiveDate;
    private String expirationDate;
    
    // Risk analysis
    private RiskAnalysis riskAnalysis;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContractSection {
        private String title;
        private String content;
        private int sectionNumber;
        private List<String> subsections;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskAnalysis {
        private String overallRisk; // low, medium, high
        private List<RiskItem> risks;
        private String summary;
        
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class RiskItem {
            private String type; // low, medium, high
            private String title;
            private String description;
            private String location;
            private String recommendation;
        }
    }
}