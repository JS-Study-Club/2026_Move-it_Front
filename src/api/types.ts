// NestJS 글로벌 필터 응답 규격에 맞춤
export interface NestErrorResponse {
  success: boolean;
  status: number;
  error: {
    code: string;
    message: {
      message: string | string[]; // class-validator 배열 대응
      error: string;
      statusCode: number;
    };
    timestamp: string;
  };
}

// 공통 HTTP 응답 규격
export interface ApiResponse<T> {
  data: T;
  message?: string;
}