package com.vendorbridge.auth.security;

import com.vendorbridge.user.entity.User;
import com.vendorbridge.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load a user by their email address.
     * Spring Security calls this method during authentication.
     *
     * @param email the email address used as the username
     * @return UserDetails containing the user's credentials and authorities
     * @throws UsernameNotFoundException if no user is found with the given email
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user details for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new UsernameNotFoundException(
                            "User not found with email: " + email
                    );
                });

        log.debug("User found: {} with role: {}", user.getEmail(), user.getRole());
        return new CustomUserDetails(user);
    }
}
