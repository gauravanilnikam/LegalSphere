package com.contract.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractRequestResponse {
    private UUID id;
    private String title;
    private String contractType;
    private String description;
    private String status;
    private String priority;
    private UserInfo requestedBy;
    private UserInfo assignedTo;
    private LocalDate dueDate;
    private List<String> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class UserInfo {
        private UUID id;
        private String fullName;
        private String email;
        private String department;
    }
}