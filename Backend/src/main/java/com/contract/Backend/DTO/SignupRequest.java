package com.contract.Backend.DTO;

import lombok.Data;
import java.util.UUID;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String role; // "EMPLOYEE" or "LEGAL_TEAM"
    private String department; // Required if EMPLOYEE
    private UUID companyId;
}
