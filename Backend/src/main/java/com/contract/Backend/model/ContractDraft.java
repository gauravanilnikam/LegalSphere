package com.contract.Backend.model;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contract_drafts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractDraft {

    public enum NotarizationStatus {
        DISABLED,
        PENDING,
        SUBMITTED,
        CONFIRMED,
        FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private ContractRequest contractRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private ContractTemplate template;

    @Column(nullable = false)
    private String title;

    @Column(name = "contract_type", nullable = false)
    private String contractType;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb", nullable = false)
    private String content;

    @Lob
    @Column(name = "docx_bytes")
    private byte[] docxBytes;
    
    @Column(name = "content_sha256", length = 64)
    private String contentSha256;

    @Column(name = "docx_sha256", length = 64)
    private String docxSha256;

    @Enumerated(EnumType.STRING)
    @Column(name = "notarization_status", nullable = false)
    private NotarizationStatus notarizationStatus = NotarizationStatus.DISABLED;

    @Column(name = "notary_tx_hash", length = 66)
    private String notaryTxHash;

    @Column(name = "notary_block_number")
    private Long notaryBlockNumber;

    @Column(name = "notary_block_timestamp")
    private LocalDateTime notaryBlockTimestamp;

    @Column(name = "notary_error", length = 1000)
    private String notaryError;
    
    private Integer version = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "is_final")
    private Boolean isFinal = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
