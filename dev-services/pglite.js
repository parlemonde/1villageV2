#!/usr/bin/env node
/* eslint-disable no-console */

const { PGlite } = require('@electric-sql/pglite');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

try {
    process.loadEnvFile?.(path.join(projectRoot, '.env'));
} catch {
    // Optional convenience for local dev; explicit environment variables still win.
}

const dataDir = path.join(projectRoot, '.pglite');
const host = process.env.PGLITE_HOST || '127.0.0.1';
const port = parsePort(process.env.PGLITE_PORT, 5432);
const shutdownDelayMs = parseNonNegativeInteger(process.env.PGLITE_SHUTDOWN_DELAY_MS, 1_000, 'PGLITE_SHUTDOWN_DELAY_MS');
const databaseUrl = `postgresql://postgres:postgres@${host}:${port}/postgres?sslmode=disable`;

let db;
let server;
let isStopping = false;

start().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

async function start() {
    db = await PGlite.create(dataDir);
    server = new PGLiteSocketServer({
        db,
        host,
        port,
        maxConnections: parsePositiveInteger(process.env.PGLITE_MAX_CONNECTIONS, 100, 'PGLITE_MAX_CONNECTIONS'),
    });

    await server.start();
    console.log(`PGlite dev database listening on ${host}:${port}`);
    console.log(`PGlite data directory: ${dataDir}`);
    console.log(`export DATABASE_URL=${databaseUrl}`);
}

async function stop(signal) {
    if (isStopping) {
        return;
    }

    isStopping = true;

    try {
        if (signal && shutdownDelayMs > 0) {
            console.log(`PGlite dev database received ${signal}, stopping in ${shutdownDelayMs}ms`);
            await delay(shutdownDelayMs);
        }

        await server?.stop();
        await db?.close();
        console.log('PGlite dev database stopped');
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}

function parsePort(value, fallback) {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        console.error(`Invalid PGLITE_PORT: ${value}`);
        process.exit(1);
    }

    return parsed;
}

function parsePositiveInteger(value, fallback, name) {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        console.error(`Invalid ${name}: ${value}`);
        process.exit(1);
    }

    return parsed;
}

function parseNonNegativeInteger(value, fallback, name) {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
        console.error(`Invalid ${name}: ${value}`);
        process.exit(1);
    }

    return parsed;
}

function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

process.on('SIGINT', () => {
    handleSignal('SIGINT');
});

process.on('SIGTERM', () => {
    handleSignal('SIGTERM');
});

async function handleSignal(signal) {
    if (isStopping) {
        return;
    }

    await stop(signal);
    process.exit(process.exitCode ?? 0);
}
