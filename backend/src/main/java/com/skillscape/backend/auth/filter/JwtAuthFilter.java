package com.skillscape.backend.auth.filter;

import com.skillscape.backend.auth.jwt.JwtUtils;
import com.skillscape.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtils    jwtUtils;
    private final UserService userService;

    public JwtAuthFilter(JwtUtils jwtUtils,
                         @Lazy UserService userService) {
        this.jwtUtils    = jwtUtils;
        this.userService = userService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth")) {
            return true;
        }
        if (path.equals("/register.html")
         || path.equals("/login.html")
         || path.equals("/forgot-password.html")) {
            return true;
        }
        if (path.startsWith("/js/")
         || path.startsWith("/css/")
         || path.startsWith("/images/")) {
            return true;
        }
        return false;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest  req,
            HttpServletResponse res,
            FilterChain         chain
    ) throws ServletException, IOException {
        String h = req.getHeader("Authorization");
        String token = StringUtils.hasText(h) && h.startsWith("Bearer ")
                     ? h.substring(7) : null;

        if (token != null && jwtUtils.validateToken(token)) {
            String email = jwtUtils.getEmailFromToken(token);
            var ud = userService.loadUserByUsername(email);
            var auth = new UsernamePasswordAuthenticationToken(
                            ud, null, ud.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource()
                                .buildDetails(req));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);
    }
}