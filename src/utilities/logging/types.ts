export type Action = (message: string | Error, details?: Record<string, unknown>) => void;
