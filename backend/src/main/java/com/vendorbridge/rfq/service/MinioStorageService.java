package com.vendorbridge.rfq.service;

import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MinioStorageService {

    private final MinioClient minioClient;

    public MinioStorageService(
            @Value("${minio.url:http://localhost:9000}") String url,
            @Value("${minio.access-key:minioadmin}") String accessKey,
            @Value("${minio.secret-key:minioadmin}") String secretKey) {
        this.minioClient = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    public String uploadFile(String bucketName, String objectName, InputStream data, String contentType) {
        try {
            ensureBucketExists(bucketName);
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(data, -1, 10485760) // 10MB part size
                            .contentType(contentType)
                            .build()
            );
            log.info("Uploaded file to MinIO: {}/{}", bucketName, objectName);
            return objectName;
        } catch (Exception e) {
            log.error("Failed to upload file to MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to MinIO", e);
        }
    }

    public InputStream downloadFile(String bucketName, String objectName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to download file from MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to download file from MinIO", e);
        }
    }

    public void deleteFile(String bucketName, String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("Deleted file from MinIO: {}/{}", bucketName, objectName);
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from MinIO", e);
        }
    }

    public String getPresignedUrl(String bucketName, String objectName, int hours) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(hours, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to get presigned URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get presigned URL", e);
        }
    }

    private void ensureBucketExists(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );
                log.info("Created MinIO bucket: {}", bucketName);
            }
        } catch (Exception e) {
            log.error("Failed to ensure bucket exists: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to ensure bucket exists", e);
        }
    }
}
