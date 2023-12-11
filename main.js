import { ReadableStream, WritableStream } from 'streams';
import { HtmlRewritingStream } from 'html-rewriter';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import HTMLStream from '../services/htmlStream.js';
import { logger } from 'log';

export async function responseProvider(request) {
    return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(async response => { 
        try {
            return createResponse(
                response.status,
                response.getHeaders(),
                response.body
                  .pipeThrough(new TextDecoderStream())
                  .pipeThrough(new HTMLStream())
                  .pipeThrough(new TextEncoderStream())
            );

        } catch (exception) {
            return createResponse(
                500,
                { 'Content-Type': ['application/json'] },
                JSON.stringify({ 
                    path: request.path,
                    tagsFoundCount: tagsFoundCount,
                    error: exception,
                    errorMessage: exception.message,
                    stacktrace: exception.stack
                })
            );
        }
    });
}
