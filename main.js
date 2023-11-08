import { ReadableStream, WritableStream } from 'streams';
import { HtmlRewritingStream } from 'html-rewriter';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { logger } from 'log';

export async function responseProvider(request) {
    return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(response => {

        try {
            const rewriter = new HtmlRewritingStream();
            rewriter.onElement('esi|include', async el => {
                const url = el.getAttribute('src');
                //el.setAttribute('test', '1');

                const options = {
                    method: 'GET',
                    headers: {
                        'user-agent': 'akamai'
                    }
                };

                const contentResponse = await httpRequest(url, options);
                let htmlContent;
                if (contentResponse.ok) {
                    htmlContent = await contentResponse.text(); 
                } else {
                    htmlContent = `<p>Could not get the content</p>`;
                }
                el.replaceWith(htmlContent);
            });

            return createResponse(200, {},
                    response.body.pipeThrough(rewriter)
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
