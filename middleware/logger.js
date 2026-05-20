// middleware/logger.js
import chalk from "chalk"; // For colors
import dayjs from "dayjs"; // For timestamp

const logger = (req, res, next) => {
  const timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const method = req.method;
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  console.log(chalk.green(`[${timestamp}]`) + " " + chalk.blue(`[${method}]`) + " " + chalk.yellow(fullUrl));

  next();
};

export default logger;
