package com.contract.Backend.Service;

import com.contract.Backend.DTO.SaveTemplateRequest;
import com.contract.Backend.DTO.TemplateResponse;
import com.contract.Backend.Repository.ContractTemplateRepository;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.ContractTemplate;
import com.contract.Backend.model.User;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateLibraryService {

    private final ContractTemplateRepository templateRepository;
    private final UserRepository userRepository;

    @Transactional
    public TemplateResponse saveTemplate(SaveTemplateRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractTemplate template = ContractTemplate.builder()
                .title(request.getTitle())
                .contractType(request.getContractType())
                .description(request.getDescription())
                .content(request.getContent())
                .timesUsed(0)
                .createdBy(user)
                .build();

        if (request.getDocxBase64() != null && !request.getDocxBase64().isBlank()) {
            try {
                byte[] bytes = Base64.getDecoder().decode(request.getDocxBase64());
                template.setDocxBytes(bytes);
            } catch (Exception e) {
                log.warn("Failed to decode docxBase64 for template: {}", e.getMessage());
            }
        }

        ContractTemplate saved = templateRepository.save(template);
        log.info("Saved template {} by user {}", saved.getId(), username);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> getAllTemplates() {
        return templateRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TemplateResponse getTemplateById(UUID id) {
        ContractTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        return mapToResponse(template);
    }

    @Transactional
    public void incrementUsage(UUID templateId) {
        ContractTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setTimesUsed(template.getTimesUsed() + 1);
        templateRepository.save(template);
    }

    @Transactional
    public TemplateResponse updateTemplate(UUID id, SaveTemplateRequest request) {
        ContractTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setTitle(request.getTitle());
        template.setDescription(request.getDescription());
        template.setContent(request.getContent());

        ContractTemplate updated = templateRepository.save(template);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        ContractTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setIsActive(false);
        templateRepository.save(template);
    }

    private TemplateResponse mapToResponse(ContractTemplate template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .title(template.getTitle())
                .contractType(template.getContractType())
                .description(template.getDescription())
                .content(template.getContent())
                .timesUsed(template.getTimesUsed())
                .hasDocx(template.getDocxBytes() != null && template.getDocxBytes().length > 0)
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] getTemplateDocx(UUID id) {
        ContractTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        if (template.getDocxBytes() == null || template.getDocxBytes().length == 0) {
            throw new RuntimeException("DOCX not available for this template");
        }
        return template.getDocxBytes();
    }

    @Transactional(readOnly = true)
    public String getTemplateTitle(UUID id) {
        ContractTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        return template.getTitle();
    }
}