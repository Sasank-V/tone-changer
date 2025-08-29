export interface ChangeToneRequest {
  text: string;
  tones: string[];
  tryAgain?: boolean;
}

export interface ChangeToneResponse {
  result: string;
  attemptNumber: number;
  hasMutlipleAttempts?: boolean;
  totalAttempts?: number;
}
