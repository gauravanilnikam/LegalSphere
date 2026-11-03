package com.contract.Backend.Controller;

import com.contract.Backend.DTO.DraftResponse;
import com.contract.Backend.DTO.SaveDraftRequest;
import com.contract.Backend.Service.DraftService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/drafts")
@RequiredArgsConstructor
@Validated
@Slf4j
public class DraftController {

    private final DraftService draftService;

    @PostMapping
    public ResponseEntity<DraftResponse> saveDraft(
            @Valid @RequestBody SaveDraftRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        DraftResponse response = draftService.saveDraft(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<DraftResponse>> getMyDrafts() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(draftService.getMyDrafts(username));
    }

    @GetMapping("/by-request/{id}")
    public ResponseEntity<List<DraftResponse>> getDraftsByRequest(@PathVariable UUID id) {
        return ResponseEntity.ok(draftService.getDraftsByRequest(id));
    }

    @PostMapping("/complete-request/{requestId}")
    public ResponseEntity<DraftResponse> completeRequestWithDraft(
            @PathVariable UUID requestId,
            @RequestParam("draftId") UUID draftId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(draftService.markRequestCompletedWithDraft(requestId, draftId, username));
    }

    @GetMapping("/{id}/docx")
    public ResponseEntity<byte[]> downloadDraftDocx(
            @PathVariable UUID id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        byte[] bytes = draftService.getDraftDocx(id, username);
        String title = draftService.getDraftTitle(id, username);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + title + ".docx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(bytes);
    }
}