package com.contract.Backend.Controller;

import com.contract.Backend.DTO.ContractRequestDTO;
import com.contract.Backend.DTO.ContractRequestResponse;
import com.contract.Backend.Service.ContractRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
@Validated
@Slf4j
public class ContractRequestController {

    private final ContractRequestService contractRequestService;

    @PostMapping
    public ResponseEntity<ContractRequestResponse> createRequest(
            @Valid @RequestBody ContractRequestDTO request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ContractRequestResponse response = contractRequestService.createRequest(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<ContractRequestResponse>> getMyRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ContractRequestResponse> requests = contractRequestService.getMyRequests(username);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ContractRequestResponse>> getPendingRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ContractRequestResponse> requests = contractRequestService.getPendingRequests(username);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<ContractRequestResponse>> getAssignedRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ContractRequestResponse> requests = contractRequestService.getAssignedRequests(username);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/unassigned")
    public ResponseEntity<List<ContractRequestResponse>> getUnassignedRequests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ContractRequestResponse> requests = contractRequestService.getUnassignedRequests(username);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ContractRequestResponse> assignRequest(
            @PathVariable UUID id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ContractRequestResponse response = contractRequestService.assignRequest(id, username);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ContractRequestResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam("status") String status) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(contractRequestService.updateStatus(id, status, username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractRequestResponse> getRequestById(@PathVariable UUID id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(contractRequestService.getRequestById(id, username));
    }
}