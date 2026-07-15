FROM gradle:9.5.1-jdk17 AS build

WORKDIR /home/gradle/project
COPY --chown=gradle:gradle . .

RUN --mount=type=cache,target=/home/gradle/.gradle,uid=1000,gid=1000 \
    gradle bootJar --no-daemon \
    && find build/libs -name "*.jar" ! -name "*-plain.jar" -exec cp {} /home/gradle/app.jar \;

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /home/gradle/app.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
