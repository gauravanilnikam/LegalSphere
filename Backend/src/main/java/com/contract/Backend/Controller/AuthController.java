package com.contract.Backend.Controller;

import com.contract.Backend.DTO.AuthenticationResponse;
import com.contract.Backend.DTO.SignupRequest;
import com.contract.Backend.Repository.CompanyRepository;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.Security.JwtUtil;
import com.contract.Backend.model.Company;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
        }

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        User.UserRole role;
        try {
             // Handle case sensitivity or mapping if needed
             if ("legal".equalsIgnoreCase(request.getRole())) {
                 role = User.UserRole.LEGAL_TEAM;
             } else {
                 role = User.UserRole.valueOf(request.getRole());
             }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role"));
        }

        // Constraint Checks
        if (role == User.UserRole.LEGAL_TEAM) {
            if (userRepository.existsByCompanyIdAndRole(company.getId(), User.UserRole.LEGAL_TEAM)) {
                return ResponseEntity.badRequest().body(Map.of("message", "This company already has a Legal Team user"));
            }
        } else if (role == User.UserRole.EMPLOYEE) {
            if (userRepository.existsByCompanyIdAndDepartment(company.getId(), request.getDepartment())) {
                return ResponseEntity.badRequest().body(Map.of("message", "This company already has a user for department: " + request.getDepartment()));
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .department(role == User.UserRole.LEGAL_TEAM ? "Legal" : request.getDepartment())
                .company(company)
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User registered successfully"));
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        User user = null;
        
        if (email != null) {
            user = userRepository.findByEmail(email).orElse(null);
        }
        
        if (user == null && username != null) {
            user = userRepository.findByUsername(username).orElse(null);
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), password)
            );
            
            final UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
            final String jwt = jwtUtil.generateToken(userDetails);
            
            return ResponseEntity.ok(AuthenticationResponse.builder()
                    .token(jwt)
                    .expiresIn(36000000L) // 10 hours
                    .role(user.getRole())
                    .username(user.getUsername())
                    .department(user.getDepartment())
                    .companyName(user.getCompany().getName())
                    .build());
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
    }
}