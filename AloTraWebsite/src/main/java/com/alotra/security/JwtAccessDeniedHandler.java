package com.alotra.security;

import jakarta.servlet.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        // Redirect đến trang login với thông báo lỗi quyền truy cập
        response.sendRedirect("/auth/login?error=forbidden");
    }
}
