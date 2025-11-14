/**
 * Result类型 - Rust风格的错误处理
 * 替代传统的try-catch，提供类型安全的错误处理
 */

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * 创建成功结果
 */
export const Ok = <T>(value: T): Result<T, never> => ({
  ok: true,
  value,
});

/**
 * 创建失败结果
 */
export const Err = <E>(error: E): Result<never, E> => ({
  ok: false,
  error,
});

/**
 * Result工具函数
 */
export class ResultUtils {
  /**
   * 判断是否成功
   */
  static isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
    return result.ok === true;
  }

  /**
   * 判断是否失败
   */
  static isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
    return result.ok === false;
  }

  /**
   * 映射成功值
   */
  static map<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U
  ): Result<U, E> {
    if (result.ok) {
      return Ok(fn(result.value));
    }
    return result;
  }

  /**
   * 映射错误
   */
  static mapErr<T, E, F>(
    result: Result<T, E>,
    fn: (error: E) => F
  ): Result<T, F> {
    if (!result.ok) {
      return Err(fn(result.error));
    }
    return result;
  }

  /**
   * 链式调用（flatMap）
   */
  static andThen<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>
  ): Result<U, E> {
    if (result.ok) {
      return fn(result.value);
    }
    return result;
  }

  /**
   * 提供默认值
   */
  static unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    return result.ok ? result.value : defaultValue;
  }

  /**
   * 解包或抛出错误
   */
  static unwrap<T, E>(result: Result<T, E>): T {
    if (result.ok) {
      return result.value;
    }
    throw result.error;
  }

  /**
   * 批量处理Results
   */
  static all<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    
    for (const result of results) {
      if (!result.ok) {
        return result;
      }
      values.push(result.value);
    }
    
    return Ok(values);
  }

  /**
   * 从Promise创建Result
   */
  static async fromPromise<T>(
    promise: Promise<T>
  ): Promise<Result<T, Error>> {
    try {
      const value = await promise;
      return Ok(value);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * 匹配模式
   */
  static match<T, E, U>(
    result: Result<T, E>,
    handlers: {
      ok: (value: T) => U;
      err: (error: E) => U;
    }
  ): U {
    return result.ok ? handlers.ok(result.value) : handlers.err(result.error);
  }
}

/**
 * 错误类型层次结构
 */
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, { fields });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with id '${id}' not found`,
      'NOT_FOUND',
      404,
      { resource, id }
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, resource: string) {
    super(message, 'CONFLICT', 409, { resource });
  }
}

export class NetworkError extends AppError {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message, 'NETWORK_ERROR', 0, { originalError });
  }
}

export class ServerError extends AppError {
  constructor(message: string) {
    super(message, 'SERVER_ERROR', 500);
  }
}

/**
 * 辅助函数：包装可能抛出异常的函数
 */
export function tryCatch<T, E = Error>(
  fn: () => T,
  errorHandler?: (error: unknown) => E
): Result<T, E> {
  try {
    return Ok(fn());
  } catch (error) {
    const finalError = errorHandler
      ? errorHandler(error)
      : (error as E);
    return Err(finalError);
  }
}

/**
 * 辅助函数：包装异步函数
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => E
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return Ok(value);
  } catch (error) {
    const finalError = errorHandler
      ? errorHandler(error)
      : (error as E);
    return Err(finalError);
  }
}

const ResultExports = {
  Ok,
  Err,
  ...ResultUtils,
  tryCatch,
  tryCatchAsync,
};

export default ResultExports;
