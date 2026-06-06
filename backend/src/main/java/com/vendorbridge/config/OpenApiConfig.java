package com.vendorbridge.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${vendorbridge.api.base-url:http://localhost:8080}")
    private String baseUrl;

    @Bean
    public OpenAPI vendorBridgeOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("VendorBridge ERP API")
                        .version("1.0.0")
                        .description("VendorBridge – Procurement and Vendor Management ERP Platform. "
                                + "This API provides endpoints for vendor management, purchase orders, "
                                + "invoicing, inventory tracking, and multi-tenant organization support.")
                        .contact(new Contact()
                                .name("VendorBridge Engineering Team")
                                .email("engineering@vendorbridge.com")
                                .url("https://vendorbridge.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://vendorbridge.com/license")))
                .servers(List.of(
                        new Server()
                                .url(baseUrl)
                                .description("Current Environment")))
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT access token obtained from /api/v1/auth/login")));
    }
}
