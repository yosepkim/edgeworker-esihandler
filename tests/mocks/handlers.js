import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://some-url.com/*', () => {
    return new HttpResponse('fallback');
  }),
];