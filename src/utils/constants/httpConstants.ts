export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH001',
  INVALID_TOKEN: 'AUTH002',
  SESSION_EXPIRED: 'AUTH003',
  SERVER_ERROR: 'SRV001',
  NETWORK_ERROR: 'NET001',
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.INVALID_TOKEN]: 'Invalid authentication token',
  [ERROR_CODES.SESSION_EXPIRED]: 'Session has expired',
  [ERROR_CODES.SERVER_ERROR]: 'Internal server error',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred',
} as const;
