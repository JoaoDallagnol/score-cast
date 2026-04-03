package com.scorecast.controller;

import com.scorecast.service.DatabaseAdminService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/admin/db")
public class DatabaseAdminController {

    private final DatabaseAdminService adminService;

    public DatabaseAdminController(DatabaseAdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/backup")
    public Map<String, Object> backup() {
        String filename = adminService.backup();
        return Map.of("file", filename, "createdAt", Instant.now());
    }

    @DeleteMapping("/clear")
    public Map<String, String> clear() {
        adminService.clearAll();
        return Map.of("message", "All data cleared successfully");
    }
}
