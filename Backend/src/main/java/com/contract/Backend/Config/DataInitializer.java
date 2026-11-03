package com.contract.Backend.Config;
import com.contract.Backend.Repository.CompanyRepository;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.Company;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            
            Company defaultCompany = Company.builder()
                    .name("Default Company")
                    .address("123 Main St")
                    .registrationNumber("REG123")
                    .build();
            companyRepository.save(defaultCompany);

            // Create employee user
            User employee = User.builder()
                    .username("employee")
                    .email("employee@company.com")
                    .password(passwordEncoder.encode("password"))
                    .fullName("John Employee")
                    .department("Sales")
                    .role(User.UserRole.EMPLOYEE)
                    .company(defaultCompany)
                    .build();

            // Create legal team user
            User legalTeam = User.builder()
                    .username("legal")
                    .email("legal@company.com")
                    .password(passwordEncoder.encode("password"))
                    .fullName("Sarah Wilson")
                    .department("Legal")
                    .role(User.UserRole.LEGAL_TEAM)
                    .company(defaultCompany)
                    .build();

            userRepository.save(employee);
            userRepository.save(legalTeam);

            // Create admin user
            User admin = User.builder()
                    .username("admin")
                    .email("admin@contractsphere.com")
                    .password(passwordEncoder.encode("admin"))
                    .fullName("System Administrator")
                    .department("IT")
                    .role(User.UserRole.ADMIN)
                    .company(defaultCompany) // Admins might belong to a system company or default
                    .build();
            userRepository.save(admin);

            log.info("Initialized default users (employee, legal, admin) and company");
        }
    }
}
