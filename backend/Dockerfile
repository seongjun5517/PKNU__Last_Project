FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app
COPY . .

RUN chmod +x gradlew \
    && ./gradlew bootJar --no-daemon \
    && find build/libs -name "*.jar" ! -name "*-plain.jar" -exec cp {} /app/app.jar \;

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
