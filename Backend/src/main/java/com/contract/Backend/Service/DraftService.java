package com.contract.Backend.Service;

import com.contract.Backend.DTO.DraftResponse;
import com.contract.Backend.DTO.SaveDraftRequest;
import com.contract.Backend.Repository.ContractDraftRepository;
import com.contract.Backend.Repository.ContractRequestRepository;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.ContractDraft;
import com.contract.Backend.model.ContractRequest;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DraftService {

    private final ContractDraftRepository draftRepository;
    private final ContractRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final HashingService hashingService;
    private final BlockchainNotaryService blockchainNotaryService;

    @Transactional
    public DraftResponse saveDraft(SaveDraftRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Integer version = 1;
        ContractRequest req = null;
        if (request.getRequestId() != null) {
            req = requestRepository.findById(request.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Request not found"));
            version = draftRepository.findTopByContractRequestOrderByVersionDesc(req)
                    .map(d -> d.getVersion() + 1)
                    .orElse(1);
        }

        ContractDraft draft = ContractDraft.builder()
                .title(request.getTitle())
                .contractType(request.getContractType())
                .content(request.getContent())
                .createdBy(user)
                .version(version)
                .isFinal(false)
                .build();

        if (request.getDocxBase64() != null && !request.getDocxBase64().isBlank()) {
            try {
                byte[] bytes = Base64.getDecoder().decode(request.getDocxBase64());
                draft.setDocxBytes(bytes);
            } catch (Exception e) {
                log.warn("Failed to decode docxBase64 for draft: {}", e.getMessage());
            }
        }

        if (req != null) {
            draft.setContractRequest(req);
        }

        draft.setContentSha256(hashingService.sha256Hex(hashingService.canonicalJsonUtf8Bytes(draft.getContent())));
        if (draft.getDocxBytes() != null && draft.getDocxBytes().length > 0) {
            draft.setDocxSha256(hashingService.sha256Hex(draft.getDocxBytes()));
        }

        draft.setNotarizationStatus(ContractDraft.NotarizationStatus.PENDING);

        ContractDraft saved = draftRepository.save(draft);
        saved = blockchainNotaryService.notarizeDraft(saved);
        log.info("Saved draft {} by user {}", saved.getId(), username);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DraftResponse> getMyDrafts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return draftRepository.findByCreatedBy(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DraftResponse> getDraftsByRequest(UUID requestId) {
        ContractRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        return draftRepository.findByContractRequest(request)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DraftResponse markRequestCompletedWithDraft(UUID requestId, UUID draftId, String username) {
        // validate user exists
        userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        ContractDraft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new RuntimeException("Draft not found"));

        // link and mark final
        draft.setContractRequest(request);
        draft.setIsFinal(true);
        ContractDraft savedDraft = draftRepository.save(draft);
        if (savedDraft.getNotarizationStatus() == ContractDraft.NotarizationStatus.PENDING
                || savedDraft.getNotarizationStatus() == ContractDraft.NotarizationStatus.FAILED) {
            savedDraft = blockchainNotaryService.notarizeDraft(savedDraft);
        }

        // update request status
        request.setStatus(ContractRequest.RequestStatus.COMPLETED);
        requestRepository.save(request);
        log.info("Request {} marked COMPLETED with final draft {}", requestId, draftId);
        return mapToResponse(savedDraft);
    }

    @Transactional(readOnly = true)
    public DraftResponse getFinalDraftForRequest(UUID requestId) {
        ContractRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return draftRepository.findByContractRequestOrderByVersionDesc(req)
                .stream()
                .filter(ContractDraft::getIsFinal)
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null);
    }

    private DraftResponse mapToResponse(ContractDraft draft) {
        return DraftResponse.builder()
                .id(draft.getId())
                .title(draft.getTitle())
                .contractType(draft.getContractType())
                .content(draft.getContent())
                .version(draft.getVersion())
                .isFinal(draft.getIsFinal())
                .requestId(draft.getContractRequest() != null ? draft.getContractRequest().getId() : null)
                .hasDocx(draft.getDocxBytes() != null && draft.getDocxBytes().length > 0)
                .contentSha256(draft.getContentSha256())
                .docxSha256(draft.getDocxSha256())
                .notarizationStatus(draft.getNotarizationStatus() != null ? draft.getNotarizationStatus().name() : null)
                .notaryTxHash(draft.getNotaryTxHash())
                .notaryBlockNumber(draft.getNotaryBlockNumber())
                .notaryBlockTimestamp(draft.getNotaryBlockTimestamp())
                .notaryError(draft.getNotaryError())
                .createdAt(draft.getCreatedAt())
                .updatedAt(draft.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] getDraftDocx(UUID id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractDraft draft = draftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        
        validateAccessToDraft(draft, user);

        if (draft.getDocxBytes() == null || draft.getDocxBytes().length == 0) {
            throw new RuntimeException("DOCX not available for this draft");
        }
        return draft.getDocxBytes();
    }

    @Transactional(readOnly = true)
    public String getDraftTitle(UUID id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContractDraft draft = draftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Draft not found"));
        
        validateAccessToDraft(draft, user);

        return draft.getTitle();
    }

    private void validateAccessToDraft(ContractDraft draft, User user) {
        if (draft.getContractRequest() != null) {
            if (!draft.getContractRequest().getRequestedBy().getCompany().getId().equals(user.getCompany().getId())) {
                throw new RuntimeException("Access denied: Draft belongs to another company");
            }
        } else {
            if (!draft.getCreatedBy().getCompany().getId().equals(user.getCompany().getId())) {
                 throw new RuntimeException("Access denied: Draft belongs to another company");
            }
        }
    }
}
