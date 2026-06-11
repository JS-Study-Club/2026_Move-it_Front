// 백엔드 공통 에러 응답에서 사람이 읽을 메시지를 안전하게 추출합니다.
//
// 에러 envelope (HttpExceptionFilter):
//   { success:false, status, error: { code, message, timestamp } }
// 여기서 error.message 는 상황에 따라 형태가 다릅니다.
//   - ValidationPipe:    { message: string[], error: 'Bad Request', statusCode }
//   - ConflictException: { message: '이미 사용 중인 아이디입니다' }
//   - Unprocessable:     { status, errors: { password: 'incorrect pw' } }
//   - 문자열 그대로
export function getApiErrorMessage(
  error: any,
  fallback = "요청을 처리하지 못했습니다.",
): string {
  if (!error?.response) {
    // 네트워크/CORS 등 응답 자체가 없는 경우
    return "서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }

  const data = error.response.data;
  // 공통 envelope 우선, 일부 경로는 envelope 없이 내려올 수 있어 message 도 함께 확인
  const msg = data?.error?.message ?? data?.message ?? data;

  const fromNode = (node: any): string | null => {
    if (!node) return null;
    if (typeof node === "string") return node;
    if (typeof node.message === "string") return node.message;
    if (Array.isArray(node.message) && node.message.length > 0)
      return String(node.message[0]);
    if (node.errors && typeof node.errors === "object") {
      const first = Object.values(node.errors)[0];
      if (typeof first === "string") return first;
    }
    return null;
  };

  return fromNode(msg) ?? fallback;
}
