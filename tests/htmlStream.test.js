import { http, HttpResponse } from 'msw'
import { TextEncoderStream, TextDecoderStream } from '@stardazed/streams-text-encoding';

import HTMLStream from '../services/htmlStream.js';
import { fireHttpCall, fakeHttpRequest, streamToString } from './utils/testHelpers.js';
import { server } from './mocks/server.js';


beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('streams html', async() => {
	server.use(
	  http.get('http://mock.com/source', () => {
	    return new HttpResponse("hello <esi:include src='http://mock.com/target'/> bye");
	  }),
	  http.get('http://mock.com/target', () => {
	    return new HttpResponse("<div>Replaced!</div>");
	  })
	);

	const result = await fireHttpCall("http://mock.com/source", new HTMLStream(fakeHttpRequest));

	const resultInString = await streamToString(result);
	expect(resultInString).toBe("hello <div>Replaced!</div> bye");
});