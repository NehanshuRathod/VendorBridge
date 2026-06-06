package com.vendorbridge.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway configuration.
 *
 * <p>Flyway is primarily auto-configured through application properties:
 * <ul>
 *   <li>{@code spring.flyway.enabled=true}</li>
 *   <li>{@code spring.flyway.locations=classpath:db/migration}</li>
 *   <li>{@code spring.flyway.baseline-on-migrate=true}</li>
 * </ul>
 *
 * <p>This configuration class provides a custom migration strategy
 * that repairs checksum mismatches before running migrations, which
 * is useful during development.
 */
@Configuration
public class FlywayConfig {

    /**
     * Custom migration strategy that runs repair before migrate.
     * This handles checksum mismatches that may occur during development
     * when migration scripts are edited.
     *
     * <p>In production, you should disable this and rely on strict migration.
     *
     * @return the Flyway migration strategy
     */
    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return (Flyway flyway) -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
