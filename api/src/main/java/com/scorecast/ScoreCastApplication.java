package com.scorecast;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class ScoreCastApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScoreCastApplication.class, args);
    }
}
