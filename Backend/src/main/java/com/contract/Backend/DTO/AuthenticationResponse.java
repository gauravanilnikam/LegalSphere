package com.contract.Backend.DTO;

import com.contract.Backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private Long expiresIn; // milliseconds
    private User.UserRole role;
    private String username;
    private String department;
    private String companyName;
}
