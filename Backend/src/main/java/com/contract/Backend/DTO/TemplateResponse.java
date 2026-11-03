package com.contract.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateResponse {
    private UUID id;
    private String title;
    private String contractType;
    private String description;
    private String content;
    private Integer timesUsed;
    private Boolean hasDocx;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}