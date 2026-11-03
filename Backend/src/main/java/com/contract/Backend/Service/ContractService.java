package com.contract.Backend.Service;

import com.contract.Backend.DTO.ContractDraftRequest;
import com.contract.Backend.DTO.ContractDraftResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Service for generating contract drafts using Ollama AI integration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContractService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    /**
     * Generate a contract draft based on the provided request
     */
    /**
     * Generate a contract draft based on the provided request
     */
    public ContractDraftResponse generateContractDraft(ContractDraftRequest request) {
        try {
            log.info("Generating contract draft for type: {}", request.getContractType());

            // Create the AI prompt for contract generation
            String aiPrompt = buildContractPrompt(request);

            // Call Ollama AI directly to generate the contract
            String aiResponse;
            try {
                aiResponse = callOllamaDirectly(aiPrompt);
                log.debug("AI Response received successfully");
                log.trace("AI Response content: {}", aiResponse);

            } catch (Exception aiException) {
                log.error("Error calling Ollama AI service", aiException);
                // Fallback to a basic contract template if AI fails
                aiResponse = generateFallbackContractJson(request);
                log.info("Using fallback contract template due to AI service error");
            }

            // Parse and structure the AI response
            return parseAiResponseJson(aiResponse, request);

        } catch (Exception e) {
            log.error("Error generating contract draft", e);
            throw new RuntimeException("Failed to generate contract draft: " + e.getMessage(), e);
        }
    }

    /**
     * Call Ollama API directly
     */
    private String callOllamaDirectly(String prompt) {
        try {
            // Create the request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-oss:20b-cloud");
            requestBody.put("prompt", prompt);
            requestBody.put("stream", false);

            // Make the API call
            RestClient restClient = RestClient.create();
            String response = restClient.post()
                    .uri("http://localhost:11434/api/generate")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            // Parse the response to extract the actual content
            JsonNode responseJson = objectMapper.readTree(response);
            return responseJson.path("response").asText();

        } catch (Exception e) {
            log.error("Error calling Ollama directly", e);
            throw new RuntimeException("Failed to call Ollama: " + e.getMessage(), e);
        }
    }

    /**
     * Build a comprehensive prompt for AI contract generation requesting JSON response
     */
    /**
     * Build a comprehensive prompt for AI contract generation requesting JSON response
     */
    private String buildContractPrompt(ContractDraftRequest request) {
        String specificSections = getSectionsForContractType(request.getContractType());

        return String.format("""
        Generate a professional %s contract between the following parties:
        
        Party A: %s
        Party B: %s
        
        Requirements: %s
        
        Please structure the contract and provide your response ONLY as a valid JSON object with the following structure:
        {
          "preamble": "Contract introduction text",
          "sections": [
            {
              "title": "Section title",
              "content": "Section content",
              "subsections": ["Subsection 1", "Subsection 2"]
            },
            {
              "title": "Another section title",
              "content": "Section content",
              "subsections": []
            }
          ],
          "conclusion": "Contract conclusion text with signature placeholders",
          "riskAnalysis": {
            "overallRisk": "low/medium/high",
            "summary": "Summary of risks",
            "risks": [
              {
                "type": "low/medium/high",
                "title": "Risk title",
                "description": "Risk description",
                "location": "Section where risk occurs",
                "recommendation": "Recommendation to mitigate risk"
              }
            ]
          }
        }
        
        Include standard sections such as:
        %s
        
        IMPORTANT: Respond with ONLY the JSON object. Do not include any additional text, explanations, or formatting before or after the JSON.
        """,
                request.getContractType(),
                request.getPartyA(),
                request.getPartyB(),
                request.getPrompt(),
                specificSections
        );
    }

    private String getSectionsForContractType(String contractType) {
        if (contractType == null) return "";
        
        switch (contractType) {
            case "Founders Agreement":
                return """
                    1. Ownership Split & Equity Distribution
                    2. Roles & Responsibilities of Founders
                    3. Vesting Schedule (Standard 4-year with 1-year cliff)
                    4. Decision Making & Voting Rights
                    5. IP Assignment (Transfer to Company)
                    6. Exit Strategy & Buyout Clauses
                    7. Dispute Resolution
                    """;
            case "Shareholders Agreement (SHA)":
                return """
                    1. Share Classes & Rights (Voting vs Non-Voting)
                    2. Board Composition & Appointment Rights
                    3. Pre-emptive Rights & Anti-Dilution
                    4. Right of First Refusal (ROFR) & Tag-Along/Drag-Along Rights
                    5. Dividend Policy
                    6. Exit Mechanisms (IPO, Acquisition)
                    """;
            case "MSA + SOW Template":
                return """
                    1. Scope of Services (Master Agreement)
                    2. Payment Terms & Invoicing
                    3. Intellectual Property Rights
                    4. Liability & Indemnification
                    5. Statement of Work (SOW) Structure
                    6. Change Order Process
                    """;
            case "Vendor Agreement":
                return """
                    1. Scope of Supply/Services
                    2. Pricing & Payment Terms
                    3. Delivery Schedule & Acceptance Criteria
                    4. Warranties & SLAs
                    5. Confidentiality & Data Protection
                    6. Termination & Force Majeure
                    """;
            case "Employment Agreement + IP Assignment":
                return """
                    1. Job Role, Duties & Compensation
                    2. Probation Period & Benefits
                    3. Intellectual Property Assignment (Work for Hire)
                    4. Non-Compete & Non-Solicitation
                    5. Confidentiality & Data Privacy
                    6. Termination & Severance
                    """;
            case "Privacy Policy":
                return """
                    1. Data Collection (Types of Data Collected)
                    2. Purpose of Data Usage
                    3. Data Sharing & Third-Party Disclosures
                    4. User Rights (Access, Deletion, Opt-out)
                    5. Cookies & Tracking Technologies
                    6. GDPR/CCPA Compliance (if applicable)
                    """;
            case "Terms & Conditions":
                return """
                    1. Acceptance of Terms
                    2. User Accounts & Responsibilities
                    3. Acceptable Use Policy
                    4. Payment & Subscription Terms
                    5. Disclaimers & Limitation of Liability
                    6. Governing Law & Dispute Resolution
                    """;
            case "ESOP Plan":
                return """
                    1. Eligibility Criteria for Options
                    2. Vesting Schedule & Cliff Period
                    3. Exercise Price & Method
                    4. Expiry & Termination of Options
                    5. Transfer Restrictions
                    6. Liquidity Events
                    """;
            case "Refund/Return + Cancellation Policy":
                return """
                    1. Eligibility for Refunds/Returns
                    2. Timeframe for Requests
                    3. Non-Refundable Items/Services
                    4. Process for Return/Cancellation
                    5. Deduction & Processing Fees
                    """;
            case "NDA":
            case "NDA Template":
                return """
                    1. Definitions of Confidential Information
                    2. Obligations of Receiving Party
                    3. Exclusions from Confidentiality
                    4. Term of Confidentiality
                    5. Return or Destruction of Materials
                    6. Remedies for Breach
                    """;
            default:
                return """
                    1. Definitions (if applicable)
                    2. Main Terms and Conditions
                    3. Obligations of each party
                    4. Term and Termination
                    5. Governing Law and Jurisdiction
                    """;
        }
    }

    /**
     * Parse AI JSON response and convert to structured ContractDraftResponse
     */
    /**
     * Parse AI JSON response and convert to structured ContractDraftResponse
     */
    private ContractDraftResponse parseAiResponseJson(String aiResponse, ContractDraftRequest request) {
        try {
            log.info("Raw AI response: {}", aiResponse);

            // Extract JSON from AI response (in case there's extra text)
            String jsonContent = extractJsonFromResponse(aiResponse);
            log.info("Extracted JSON content: {}", jsonContent);

            // Parse the JSON response
            JsonNode rootNode = objectMapper.readTree(jsonContent);

            // Extract contract sections from JSON
            List<ContractDraftResponse.ContractSection> sections = extractSectionsFromJson(rootNode);

            // Extract risk analysis
            ContractDraftResponse.RiskAnalysis riskAnalysis = extractRiskAnalysisFromJson(rootNode);

            return ContractDraftResponse.builder()
                    .contractTitle(generateContractTitle(request))
                    .contractType(request.getContractType())
                    .partyA(request.getPartyA())
                    .partyB(request.getPartyB())
                    .generatedAt(LocalDateTime.now())
                    .preamble(rootNode.path("preamble").asText())
                    .sections(sections)
                    .conclusion(rootNode.path("conclusion").asText())
                    .jurisdiction("United States")
                    .governingLaw("State Law")
                    .effectiveDate(LocalDateTime.now().toLocalDate().toString())
                    .expirationDate(LocalDateTime.now().plusYears(1).toLocalDate().toString())
                    .riskAnalysis(riskAnalysis)
                    .build();

        } catch (JsonProcessingException e) {
            log.error("Error parsing AI JSON response", e);
            // Fallback to parsing the response as plain text
            log.info("Falling back to text-based parsing due to JSON parsing failure");
            return parseAiResponseText(aiResponse, request);
        } catch (Exception e) {
            log.error("Error processing AI response", e);
            throw new RuntimeException("Failed to process AI response: " + e.getMessage(), e);
        }
    }

    /**
     * Extract JSON content from AI response (removing any extra text)
     */
    private String extractJsonFromResponse(String aiResponse) {
        // Find JSON object boundaries
        int jsonStart = aiResponse.indexOf("{");
        int jsonEnd = aiResponse.lastIndexOf("}");

        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            return aiResponse.substring(jsonStart, jsonEnd + 1);
        }

        // If no clear JSON boundaries found, return the raw response
        return aiResponse;
    }

    /**
     * Extract contract sections from JSON
     */
    private List<ContractDraftResponse.ContractSection> extractSectionsFromJson(JsonNode rootNode) {
        List<ContractDraftResponse.ContractSection> sections = new ArrayList<>();

        JsonNode sectionsNode = rootNode.path("sections");
        if (sectionsNode.isArray()) {
            for (int i = 0; i < sectionsNode.size(); i++) {
                JsonNode sectionNode = sectionsNode.get(i);

                List<String> subsections = new ArrayList<>();
                JsonNode subsectionsNode = sectionNode.path("subsections");
                if (subsectionsNode.isArray()) {
                    for (int j = 0; j < subsectionsNode.size(); j++) {
                        subsections.add(subsectionsNode.get(j).asText());
                    }
                }

                sections.add(ContractDraftResponse.ContractSection.builder()
                        .title(sectionNode.path("title").asText())
                        .content(sectionNode.path("content").asText())
                        .sectionNumber(i + 1)
                        .subsections(subsections)
                        .build());
            }
        }

        return sections;
    }

    /**
     * Extract risk analysis from JSON
     */
    private ContractDraftResponse.RiskAnalysis extractRiskAnalysisFromJson(JsonNode rootNode) {
        JsonNode riskAnalysisNode = rootNode.path("riskAnalysis");

        List<ContractDraftResponse.RiskAnalysis.RiskItem> risks = new ArrayList<>();
        JsonNode risksNode = riskAnalysisNode.path("risks");
        if (risksNode.isArray()) {
            for (int i = 0; i < risksNode.size(); i++) {
                JsonNode riskNode = risksNode.get(i);

                risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                        .type(riskNode.path("type").asText())
                        .title(riskNode.path("title").asText())
                        .description(riskNode.path("description").asText())
                        .location(riskNode.path("location").asText())
                        .recommendation(riskNode.path("recommendation").asText())
                        .build());
            }
        }

        return ContractDraftResponse.RiskAnalysis.builder()
                .overallRisk(riskAnalysisNode.path("overallRisk").asText("medium"))
                .risks(risks)
                .summary(riskAnalysisNode.path("summary").asText("The contract contains standard terms with moderate risk levels. Review recommended sections before execution."))
                .build();
    }

    /**
     * Fallback method to parse text-based response if JSON parsing fails
     */
    private ContractDraftResponse parseAiResponseText(String aiResponse, ContractDraftRequest request) {
        // This method contains the original parsing logic as a fallback
        // Extract contract sections from AI response
        List<ContractDraftResponse.ContractSection> sections = extractSectionsFromText(aiResponse);

        // Generate risk analysis
        ContractDraftResponse.RiskAnalysis riskAnalysis = generateRiskAnalysis(aiResponse, request.getContractType());

        return ContractDraftResponse.builder()
                .contractTitle(generateContractTitle(request))
                .contractType(request.getContractType())
                .partyA(request.getPartyA())
                .partyB(request.getPartyB())
                .generatedAt(LocalDateTime.now())
                .preamble(extractPreamble(aiResponse))
                .sections(sections)
                .conclusion(extractConclusion(aiResponse))
                .jurisdiction("United States")
                .governingLaw("State Law")
                .effectiveDate(LocalDateTime.now().toLocalDate().toString())
                .expirationDate(LocalDateTime.now().plusYears(1).toLocalDate().toString())
                .riskAnalysis(riskAnalysis)
                .build();
    }

    /**
     * Extract contract sections from text (original method)
     */
    private List<ContractDraftResponse.ContractSection> extractSectionsFromText(String aiResponse) {
        List<ContractDraftResponse.ContractSection> sections = new ArrayList<>();

        // Split response into sections based on numbered headings
        String[] lines = aiResponse.split("\n");
        StringBuilder currentSection = new StringBuilder();
        String currentTitle = "";
        int sectionNumber = 1;

        for (String line : lines) {
            if (line.matches("^\\d+\\..*") || line.matches("^[A-Z][A-Z ]+:.*")) {
                // Save previous section if exists
                if (!currentTitle.isEmpty() && currentSection.length() > 0) {
                    sections.add(ContractDraftResponse.ContractSection.builder()
                            .title(currentTitle)
                            .content(currentSection.toString().trim())
                            .sectionNumber(sectionNumber++)
                            .subsections(new ArrayList<>())
                            .build());
                }

                // Start new section
                currentTitle = line.replaceFirst("^\\d+\\.", "").trim();
                currentSection = new StringBuilder();
            } else if (!line.trim().isEmpty()) {
                currentSection.append(line).append("\n");
            }
        }

        // Add last section
        if (!currentTitle.isEmpty() && currentSection.length() > 0) {
            sections.add(ContractDraftResponse.ContractSection.builder()
                    .title(currentTitle)
                    .content(currentSection.toString().trim())
                    .sectionNumber(sectionNumber)
                    .subsections(new ArrayList<>())
                    .build());
        }

        return sections;
    }

    /**
     * Generate risk analysis for the contract
     */
    private ContractDraftResponse.RiskAnalysis generateRiskAnalysis(String contractContent, String contractType) {
        List<ContractDraftResponse.RiskAnalysis.RiskItem> risks = new ArrayList<>();

        // Add common risks based on contract type
        if ("NDA".equals(contractType) || "NDA Template".equals(contractType)) {
            risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                    .type("medium")
                    .title("Broad Definition of Confidential Information")
                    .description("The definition of confidential information may be too broad, potentially restricting normal business operations.")
                    .location("Definitions Section")
                    .recommendation("Consider narrowing the scope of confidential information to specific categories.")
                    .build());

            risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                    .type("low")
                    .title("Term Duration")
                    .description("The confidentiality obligations may extend beyond the business relationship.")
                    .location("Term Section")
                    .recommendation("Ensure the term is reasonable for the type of information being protected.")
                    .build());
        }

        // Add general contract risks
        risks.add(ContractDraftResponse.RiskAnalysis.RiskItem.builder()
                .type("medium")
                .title("Jurisdiction and Governing Law")
                .description("Contract specifies governing law and jurisdiction which may impact enforceability.")
                .location("Governing Law Section")
                .recommendation("Ensure the chosen jurisdiction is favorable and accessible to both parties.")
                .build());

        return ContractDraftResponse.RiskAnalysis.builder()
                .overallRisk("medium")
                .risks(risks)
                .summary("The contract contains standard terms with moderate risk levels. Review recommended sections before execution.")
                .build();
    }

    /**
     * Extract preamble from AI response
     */
    private String extractPreamble(String aiResponse) {
        String[] lines = aiResponse.split("\n");
        StringBuilder preamble = new StringBuilder();

        for (String line : lines) {
            if (line.matches("^\\d+\\..*") || line.matches("^[A-Z][A-Z ]+:.*")) {
                break; // Stop at first numbered section
            }
            if (!line.trim().isEmpty()) {
                preamble.append(line).append("\n");
            }
        }

        return preamble.toString().trim();
    }

    /**
     * Extract conclusion from AI response
     */
    private String extractConclusion(String aiResponse) {
        // Look for signature section or conclusion
        if (aiResponse.toLowerCase().contains("signature")) {
            int signatureIndex = aiResponse.toLowerCase().lastIndexOf("signature");
            return aiResponse.substring(signatureIndex).trim();
        }

        return "IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.\n\n" +
                "Party A: _________________________\n" +
                "Party B: _________________________";
    }

    /**
     * Generate fallback contract when AI service is unavailable (JSON format)
     */
    private String generateFallbackContractJson(ContractDraftRequest request) {
        return String.format("""
            {
              "preamble": "This %s Agreement is entered into on [DATE] between %s and %s.",
              "sections": [
                {
                  "title": "Confidential Information",
                  "content": "The parties acknowledge that confidential information may be disclosed during their business relationship. %s",
                  "subsections": []
                },
                {
                  "title": "Obligations",
                  "content": "The Receiving Party agrees to maintain confidentiality of all disclosed information and use it solely for the intended purpose.",
                  "subsections": ["Maintain confidentiality", "Use information solely for intended purpose", "No disclosure to third parties"]
                },
                {
                  "title": "Term",
                  "content": "This Agreement shall remain in effect for a period of two (2) years from the date of execution.",
                  "subsections": []
                },
                {
                  "title": "Governing Law",
                  "content": "This Agreement shall be governed by the laws of the applicable jurisdiction.",
                  "subsections": []
                }
              ],
              "conclusion": "IN WITNESS WHEREOF, the parties have executed this Agreement.\\n\\nParty A: _________________________\\nParty B: _________________________",
              "riskAnalysis": {
                "overallRisk": "medium",
                "summary": "This is a fallback contract with standard terms. Review and customize before use.",
                "risks": [
                  {
                    "type": "medium",
                    "title": "Generic Terms",
                    "description": "This is a generic template and may not address specific requirements.",
                    "location": "Entire Document",
                    "recommendation": "Review and customize the contract to address specific needs."
                  }
                ]
              }
            }
            """,
                request.getContractType(),
                request.getPartyA(),
                request.getPartyB(),
                request.getPrompt()
        );
    }

    /**
     * Generate contract title based on request
     */
    private String generateContractTitle(ContractDraftRequest request) {
        return String.format("%s Agreement between %s and %s",
                request.getContractType(),
                request.getPartyA(),
                request.getPartyB());
    }
}