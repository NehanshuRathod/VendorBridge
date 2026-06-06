package com.vendorbridge.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MinioConfig {

    @Value("${vendorbridge.minio.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${vendorbridge.minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${vendorbridge.minio.secret-key:minioadmin}")
    private String secretKey;

    @Value("${vendorbridge.minio.bucket-name:vendorbridge}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    @PostConstruct
    public void initializeBucket() {
        try {
            MinioClient client = minioClient();
            boolean exists = client.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
            if (!exists) {
                client.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
                log.info("MinIO bucket '{}' created successfully", bucketName);
            } else {
                log.info("MinIO bucket '{}' already exists", bucketName);
            }
        } catch (Exception e) {
            log.warn("Could not initialize MinIO bucket '{}': {}. "
                    + "File storage will not work until MinIO is available.", bucketName, e.getMessage());
        }
    }
}
