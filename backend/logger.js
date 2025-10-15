import winston from "winston";

const { combine, timestamp, colorize, printf } = winston.format;

// 🧩 Format de log personnalisé
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

// 🎨 Création du logger
const logger = winston.createLogger({
  level: "info",
  format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    new winston.transports.Console(), // Affiche les logs dans Render
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Sauvegarde les erreurs dans un fichier
  ],
});

export default logger;
