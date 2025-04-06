import winston from "winston";

/*
returns date time in this format - 2024-11-20T10:00:00Z
*/
export const getCurrentDateTime = (): string => {
  const now = new Date();
  return now.toISOString().split(".")[0] + "Z";
};

export const generateTimestampUUID = (): string => {
  const timestamp = Date.now().toString(16); // Convert milliseconds to hexadecimal
  const random = Math.random().toString(16).slice(2, 10); // Random part for uniqueness
  const node = Math.floor(Math.random() * 1e10).toString(16); // Optional machine-specific part

  return `${timestamp}-${random}-${node}`;
};

export const customFormat = winston.format.printf(
  ({ timestamp, level, message, ...metadata }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(metadata).length) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    return log;
  }
);
