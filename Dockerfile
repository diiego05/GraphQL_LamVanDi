# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /build

COPY AloTraWebsite/ .

RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy WAR file
COPY --from=build /build/target/*.war app.war

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.war"]