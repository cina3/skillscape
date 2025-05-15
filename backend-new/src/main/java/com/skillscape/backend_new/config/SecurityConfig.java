package com.skillscape.backend_new.config;

import com.skillscape.backend_new.security.AuthEntryPointJwt;
import com.skillscape.backend_new.security.AuthTokenFilter;
import com.skillscape.backend_new.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserService userService;
    private final AuthTokenFilter authTokenFilter;
    private final AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    public SecurityConfig(
            UserService userService,
            AuthTokenFilter authTokenFilter,
            AuthEntryPointJwt unauthorizedHandler
    ) {
        this.userService = userService;
        this.authTokenFilter = authTokenFilter;
        this.unauthorizedHandler = unauthorizedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1) Enable CORS using our corsConfigurationSource() bean
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 2) Disable CSRF (we're stateless / JWT)
            .csrf(csrf -> csrf.disable())
            // 3) Handle unauthorized requests
            .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
            // 4) Stateless session (no HTTP session)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 5) Authorization rules
            .authorizeHttpRequests(auth -> auth
                // allow CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // public endpoints
                .requestMatchers("/", "/favicon.ico", "/error").permitAll()
                .requestMatchers("/api/auth/**").permitAll()          // signup, signin, etc
                .requestMatchers(HttpMethod.GET, "/api/gigs", "/api/gigs/*").permitAll()
                // protected endpoints
                .requestMatchers(HttpMethod.POST, "/api/gigs").authenticated()
                .requestMatchers("/api/gigs/my-gigs").authenticated()
                // everything else requires authentication
                .anyRequest().authenticated()
            );

        // 6) Add our JWT filter before the UsernamePasswordAuthenticationFilter
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration that:
     *  - allows your front-end origin(s)
     *  - permits all headers & methods
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // during dev you can allow all origins, or lock it to your exact front-end host
        cfg.setAllowedOrigins(List.of("http://3.75.88.34:8000", "http://127.0.0.1:8000"));
        // you can also use cfg.setAllowedOriginPatterns(List.of("*")) to permit any
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("Authorization"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}