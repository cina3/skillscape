package com.skillscape.backend.auth.config;

import com.skillscape.backend.auth.filter.JwtAuthFilter;
import com.skillscape.backend.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final UserService userService;

    public SecurityConfig(@Lazy UserService userService) {
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Lazy JwtAuthFilter jwtAuthFilter
    ) throws Exception {
        http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sess ->
            sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
            .requestMatchers(HttpMethod.GET,
                "/",                      // For a potential root mapping if you have one
                "/index.html",            // If you have an index.html directly in static
                "/404.html",              // Your custom 404 page
                "/landing/**",            // All files under /landing/
                "/auth/**",               // All files under /auth/
                "/role-choice/**",        // All files under /role-choice/
                "/freelancer/**",         // All files under /freelancer/
                "/customer/**",           // All files under /customer/
                "/shared/**"              // All files under /shared/ (CSS, JS, images)
            ).permitAll()
            .requestMatchers(HttpMethod.POST,
                "/api/auth/register",
                "/api/auth/login",
                "/api/auth/forgot-password",
                "/api/auth/reset-password"
            ).permitAll()
            .requestMatchers(HttpMethod.GET, "/api/auth/**").permitAll() 
            .requestMatchers(HttpMethod.GET,
                "/api/gigs",
                "/api/gigs/*",
                "/api/gigs/*/reviews",
                "/api/gigs/*/attachments",
                "/api/attachments/**",
                "/api/gigs/cover/**",
                "/api/jobs",
                "/api/jobs/*",
                "/api/jobs/*/reviews",
                "/api/jobs/*/attachments",
                "/api/job-attachments/**",
                "/api/jobs/cover/**",
                "/api/events",
                "/api/events/*",
                "/api/users/me/avatar/**"
            ).permitAll()
            .anyRequest().authenticated()
        )
        .authenticationProvider(daoAuthProvider())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public DaoAuthenticationProvider daoAuthProvider() {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(userService);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean
    public AuthenticationManager authenticationManager(
        org.springframework.security.config.annotation
            .authentication.configuration.AuthenticationConfiguration ac
    ) throws Exception {
        return ac.getAuthenticationManager();
    }

    @Bean 
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}