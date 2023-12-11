import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { ReadableStream, WritableStream } from 'streams';
import { logger } from 'log';
import HTMLStream from './services/htmlStream.js';

const UNSAFE_RESPONSE_HEADERS = ['content-length', 'transfer-encoding', 'connection', 'vary',
  'accept-encoding', 'content-encoding', 'keep-alive',
  'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'upgrade'];

export async function responseProvider(request) {
  return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(async response => { 
    try {
      return createResponse(
          response.status,
          getSafeResponseHeaders(response.getHeaders()),
          response.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(new HTMLStream(httpRequest))
            .pipeThrough(new TextEncoderStream())
      );

    } catch (exception) {
      return createResponse(
          500,
          { 'Content-Type': ['application/json'] },
          JSON.stringify({ 
              path: request.path,
              error: exception,
              errorMessage: exception.message,
              stacktrace: exception.stack
          })
      );
    }
  });
}

function getSafeResponseHeaders(headers) {
  for (let unsafeResponseHeader of UNSAFE_RESPONSE_HEADERS) {
      if (unsafeResponseHeader in headers) {
          delete headers[unsafeResponseHeader]
      }
  }
  return headers;
}