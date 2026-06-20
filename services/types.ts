export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function success<T>(data: T): Result<T, any> {
  return { success: true, data };
}

export function failure<E>(error: E): Result<any, E> {
  return { success: false, error };
}

export interface UIState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
