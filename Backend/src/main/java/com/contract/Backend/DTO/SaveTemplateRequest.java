package com.contract.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveTemplateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Contract type is required")
    private String contractType;

    private String description;

    @NotBlank(message = "Content is required")
    private String content;
    private String docxBase64; // optional base64-encoded DOCX bytes
}