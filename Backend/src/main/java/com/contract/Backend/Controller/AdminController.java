package com.contract.Backend.Controller;

import com.contract.Backend.Repository.CompanyRepository;
import com.contract.Backend.model.Company;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final CompanyRepository companyRepository;

    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        if (companyRepository.existsByName(company.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Company already exists"));
        }
        
        Company savedCompany = companyRepository.save(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCompany);
    }
}
