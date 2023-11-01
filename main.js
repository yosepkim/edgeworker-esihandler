import { ReadableStream, WritableStream } from 'streams';
import { HtmlRewritingStream } from 'html-rewriter';
import { httpRequest } from 'http-request';
import { createResponse } from 'create-response';
import { TextEncoderStream, TextDecoderStream } from 'text-encode-transform';
import { logger } from 'log';

export async function responseProvider(request) {
    return httpRequest(`${request.scheme}://${request.host}${request.url}`).then(async response => {
        const esiTagRegex = /(<esi:include[^/]*src=['"](.*?)['"][^\/]*\/>)/g;
        let tagsFoundCount = 0;
        
        try {
            let responseText = await response.text();
            let match;
            while ((match = esiTagRegex.exec(responseText)) != null) { 
                const taggedContent = match[1]; 
                const url = match[2];

                const options = {
                    method: 'GET',
                    headers: {
                        'user-agent': 'akamai'
                    }
                };
                let htmlContent;
                const contentResponse = await httpRequest(url, options);
                if (contentResponse.ok) {
                    htmlContent = await contentResponse.text(); 
                } else {
                    htmlContent = `<p>Could not get the content</p>`;
                }

                responseText = responseText.replace(taggedContent, htmlContent);
                tagsFoundCount = tagsFoundCount + 1;
            }

            return createResponse(
                response.status,
                response.getHeaders(),
                responseText
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
