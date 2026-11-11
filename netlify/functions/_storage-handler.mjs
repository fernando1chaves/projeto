export function storageHandler(handler) {
  return async (request) => {
    const event = {
      httpMethod: request.method,
      headers: Object.fromEntries(request.headers),
      readBody: () => request.text()
    };
    const response = await handler(event);
    return new Response(response.body, {
      status: response.statusCode,
      headers: response.headers
    });
  };
}
