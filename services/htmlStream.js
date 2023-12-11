import { ReadableStream, WritableStream } from 'streams';

export class HTMLStream {
  constructor (httpRequest) {
    let readController = null;
    
    this.readable = new ReadableStream({
      start (controller) {
        readController = controller;
      }
    });

    async function handleTemplate (responseText) {
      const esiTagRegex = /(<esi:include[^/]*src=['"](.*?)['"][^\/]*\/>)/g;

      let match;
      if ((match = esiTagRegex.exec(responseText)) !== null) {
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

        const replacedText = responseText.replace(taggedContent, htmlContent);
        readController.enqueue(replacedText);
      } else {
        readController.enqueue(responseText);
      }
    }

    let completeProcessing = Promise.resolve();

    this.writable = new WritableStream({
      write (text) {
        completeProcessing = handleTemplate(text, 0);
        return completeProcessing;
      },
      close (controller) {
        return completeProcessing.then(() => readController.close());
      }
    });
  }
}

export default HTMLStream;