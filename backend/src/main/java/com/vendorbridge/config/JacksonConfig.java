package com.vendorbridge.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // Register Java 8 date/time module
        objectMapper.registerModule(new JavaTimeModule());

        // Write dates as ISO-8601 strings, not timestamps
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Don't fail on unknown properties during deserialization
        objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

        // Don't fail on empty beans
        objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        // Exclude null fields from JSON output
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

        return objectMapper;
    }
}
