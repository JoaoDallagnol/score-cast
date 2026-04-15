package com.scorecast.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Redireciona rotas desconhecidas para o index.html do React,
 * permitindo que o React Router gerencie a navegação no frontend.
 * Rotas que começam com /api/ retornam o erro original sem redirecionamento.
 */
@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object statusCode = request.getAttribute("jakarta.servlet.error.status_code");
        String path = (String) request.getAttribute("jakarta.servlet.error.request_uri");

        // Erros de API devem retornar JSON, não o index.html
        if (path != null && path.startsWith("/api/")) {
            return null; // deixa o handler padrão do Spring tratar
        }

        // Para rotas do frontend (React Router), serve o index.html
        return "forward:/index.html";
    }
}
