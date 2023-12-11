## What is ESI?

[Edge Side Includes (ESI)](https://en.wikipedia.org/wiki/Edge_Side_Includes) is used for dynamically assembling HTML contents on the Edge (i.e. CDN). When a HTML page is requested, an ESI processor running on the Edge intercepts and looks for tags (e.g. `<esi:include src='http://some.com/page' />`, fetches the content from the `src`, then replace the ESI tag with the content.

## EdgeWorker to the Rescue

If your codebase still uses ESI tags and has no longer access to the ESI handler, one can use Akamai [EdgeWorker](https://techdocs.akamai.com/edgeworkers/docs/welcome-to-edgeworkers) to enable the feature. This project demonstrates just that. 

In the `main.js`, using regex, the code looks for `<esi:include />` tags. The `.exec()` method returns a match at a time, which makes it ideal to handle each occurences. 

The code is for educational purposes only. It does not have minimum tests and lacks error handling. Also, note that ESI specification has more than the `includes`, which the codebase does not address. 

To run tests, execute the following:

`$ node --experimental-vm-modules node_modules/.bin/jest`