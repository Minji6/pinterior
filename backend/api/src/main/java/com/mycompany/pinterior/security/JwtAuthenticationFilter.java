package com.mycompany.pinterior.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.pinterior.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 로그인 엔드포인트는 토큰 없이 통과
        if ("/api/users/login".equals(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 프로필 이미지 서빙 GET 요청 토큰 없이 통과
        if ("GET".equals(method) && path.matches("/api/users/\\d+/image/view")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 핀 이미지 서빙 GET 요청 토큰 없이 통과
        if ("GET".equals(method) && path.startsWith("/images/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        if ("GET".equals(method) && path.matches("/api/pins/\\d+/image")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // 전체 핀 목록 조회 GET 요청은 비로그인 허용
        if ("GET".equals(method) && "/api/pins".equals(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 토큰 없거나 유효하지 않으면 401
        if (token == null || !jwtTokenProvider.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                objectMapper.writeValueAsString(
                    ApiResponse.of(401, "토큰이 없거나 만료되었습니다.", null)
                )
            );
            return;
        }

        // 유효한 토큰 → 인증 정보 저장
        Long userId = jwtTokenProvider.getUserId(token);
        request.setAttribute("userId", userId);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}