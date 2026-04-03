package com.scorecast.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class DatabaseAdminService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final JdbcTemplate jdbc;

    public DatabaseAdminService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String backup() {
        String filename = "backup_" + LocalDateTime.now().format(FMT) + ".zip";
        File dir = new File("data");
        dir.mkdirs();
        String path = dir.getAbsolutePath() + File.separator + filename;
        jdbc.execute("BACKUP TO '" + path + "'");
        return filename;
    }

    public void clearAll() {
        jdbc.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbc.queryForList("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'PUBLIC'")
                .forEach(row -> jdbc.execute("TRUNCATE TABLE \"" + row.get("TABLE_NAME") + "\""));
        jdbc.execute("SET REFERENTIAL_INTEGRITY TRUE");
    }
}
