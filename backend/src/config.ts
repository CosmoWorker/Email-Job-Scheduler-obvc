function getEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} might be missing or empty`);
    }
    return value;
}

export const config = {
    serverPort: parseInt(getEnv("SERVER_PORT"), 10),
    databaseUrl: getEnv("DATABASE_URL"),
    redisUrl: getEnv("REDIS_URL"),
    corsOriginUrl: getEnv("CLIENT_CORS_ORIGIN_URL"),
    ethereal: {
        username: getEnv("ETHEREAL_USERNAME"),
        password: getEnv("ETHEREAL_PASSWORD"),
        host: getEnv("ETHEREAL_HOST"),
        port: parseInt(getEnv("ETHEREAL_PORT"), 10),
    },
    workerConcurrency: parseInt(getEnv("WORKER_CONCURRENCY"), 10),
    minDelayMs: parseInt(getEnv("MIN_DELAY_MS"), 10),
    maxEmailsPerHour: parseInt(getEnv("MAX_EMAILS_PER_HOUR"), 10),
    // maxEmailsPerHourPerSender: parseInt(getEnv("MAX_EMAILS_PER_HOUR_PER_SENDER"), 10)
};
