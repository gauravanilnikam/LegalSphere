package com.contract.Backend.Controller;

import com.contract.Backend.DTO.SaveTemplateRequest;
import com.contract.Backend.DTO.TemplateResponse;
import com.contract.Backend.Service.TemplateLibraryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@Validated
@Slf4j
public class TemplateLibraryController {

    private final TemplateLibraryService templateService;

    @PostMapping
    public ResponseEntity<TemplateResponse> saveTemplate(
            @Valid @RequestBody SaveTemplateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        TemplateResponse response = templateService.saveTemplate(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> getAllTemplates() {
        List<TemplateResponse> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponse> getTemplate(@PathVariable UUID id) {
        TemplateResponse template = templateService.getTemplateById(id);
        return ResponseEntity.ok(template);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody SaveTemplateRequest request) {

        TemplateResponse response = templateService.updateTemplate(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/use")
    public ResponseEntity<Void> incrementUsage(@PathVariable UUID id) {
        templateService.incrementUsage(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/docx")
    public ResponseEntity<byte[]> downloadTemplateDocx(@PathVariable UUID id) {
        byte[] bytes = templateService.getTemplateDocx(id);
        String title = templateService.getTemplateTitle(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + title + ".docx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(bytes);
    }
}