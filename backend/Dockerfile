# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S vendorbridge && adduser -S vendorbridge -G vendorbridge

COPY --from=builder /app/target/*.jar app.jar

RUN chown -R vendorbridge:vendorbridge /app
USER vendorbridge

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
