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
public class DraftResponse {
    private UUID id;
    private String title;
    private String contractType;
    private String content;
    private Integer version;
    private Boolean isFinal;
    private UUID requestId;
    private Boolean hasDocx;
    private String contentSha256;
    private String docxSha256;
    private String notarizationStatus;
    private String notaryTxHash;
    private Long notaryBlockNumber;
    private LocalDateTime notaryBlockTimestamp;
    private String notaryError;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
