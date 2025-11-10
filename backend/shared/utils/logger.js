// backend/shared/utils/logger.js

import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Definimos los niveles de log
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3, // Nivel para logs de peticiones HTTP
  debug: 4,
};

// Asignamos colores a cada nivel
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
});

// --- Definimos los Formatos ---

// 1. Formato para la Consola: Simple, con color y timestamp corto
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

// 2. Formato para Archivos: JSON completo, ideal para análisis
const fileFormat = combine(
  timestamp(), // Timestamp completo
  json()       // Formato JSON
);

// --- Creamos los "Transportes" (Salidas de log) ---
const transports = [
  // 1. Transporte de Consola (para desarrollo)
  new winston.transports.Console({
    format: consoleFormat,
    level: 'debug', // Muestra todo (debug, http, info, warn, error) en consola
  }),
  
  // 2. Transporte de Archivo (Solo Errores)
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error', // Solo guarda si es un error
    format: fileFormat,
    maxsize: 5242880, // 5MB (rotación de logs)
    maxFiles: 5,
  }),
  
  // 3. Transporte de Archivo (Logs combinados)
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    level: 'info', // Guarda info, warn, error
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// --- Creamos la instancia del Logger ---
const logger = winston.createLogger({
  levels: logLevels,
  level: 'info', // El nivel mínimo a loguear por defecto (en los archivos)
  transports,
  exitOnError: false, // No detener la app si hay una excepción no manejada
});

export default logger;