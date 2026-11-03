package com.contract.Backend.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveDraftRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String contractType;

    // JSON string (TipTap doc or structured contract JSON)
    @NotBlank
    private String content;

    // Optional: link to a specific request
    private UUID requestId;
    private String docxBase64; // optional base64-encoded DOCX bytes
}