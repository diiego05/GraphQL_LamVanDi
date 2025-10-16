# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /build

# Copy toàn bộ AloTraWebsite folder
COPY AloTraWebsite/ .

# Build JAR
RUN mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy JAR từ build stage
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]