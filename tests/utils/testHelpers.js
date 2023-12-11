function fireHttpCall(url, htmlStream) {
	return fetch(url)
		.then((response) => {
			return response.body
				.pipeThrough(new TextDecoderStream())
				.pipeThrough(htmlStream)
				.pipeThrough(new TextEncoderStream());
	});
}

async function fakeHttpRequest(url, _option) {
  return await fetch(url);
}

async function streamToString(stream) {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();
  let result = '';

  async function read() {
    const { done, value } = await reader.read();

    if (done) {
      return result;
    }

    result += textDecoder.decode(value, { stream: true });
    return read();
  }

  return read();
}

export { fireHttpCall, fakeHttpRequest, streamToString };