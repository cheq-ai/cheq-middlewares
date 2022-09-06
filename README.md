# cheq-express-middlewares
CHEQ middlewares for Express.Js



## Features

* [Installation](#installation)
* [Real time interception](#real-time-interception)
    * [Required configuration](#required-configuration)
        * [API key](#api-key)
        * [Tag hash](#tag-hash)
        * [API endpoint](#api-endpoint)
    * [Optional configuration](#optional-configuration)
        * [Mode](#mode)
        * [IP header](#ip-header)
        * [Resource type](#resource-type)
        * [Threat types codes](#threat-types-codes)
        * [URI Exclusion](#uri-exclusion)
        * [Redirect URL](#redirect-url)
        * [Callback function](#callback-function)
        * [Timeout](#timeout)
        * [Custom event name](#custom-event-name)
        * [Ja3](#ja3)
     * [Usage example](#usage-example)
   


## Installation
````bash
$ npm install @cheq.ai/cheq-express-middlewares
````

## Real time interception

Real-Time Interception (RTI) supports API calls to provide detection of invalid traffic (IVT) to your site, in absolute real-time.  RTI will intercept IVT to prevent invalid visitors from harming your conversion efforts.

### Configuration

#### Required configuration

##### API key

Available on the Paradome platform under “Management -> RTI”

```` js
const options = {
    ...
    apiKey: '11abc111-aa11-11aa-1111-11a11a11111'
    ...
}
````

##### Tag hash

Appears in your CHEQ tag. 

```` js
const options = {
    ...
    tagHash: 'c99651e7936e27743ce51c728492aac9'
    ...
}
````

##### API endpoint
The nearest API endpoint to your server. Must be the same region as your tag domain.<br>Can be one of the following:
- US: https://rti-us-east-1.cheqzone.com
- EU: https://rti-eu-west-1.cheqzone.com
- global: https://rti-global.cheqzone.com

```` js
const options = {
    ...
    apiEndpoint: 'https://rti-global.cheqzone.com'
    ...
}
````

#### Optional configuration

##### Mode

- `monitoring` - Will not perform any action

- `blocking` - Will block Invalid traffic or redirect them to a different url (defind in [Redirect URL](#redirect-url)).

The default value will be `monitoring`.

```` js
const options = {
    ...
    mode: 'monitoring'
    ...
}
````


##### IP header

Specify a trusted IP header to be used as client IP
```` js
const options = {
  ...
  trustedIPHeader: 'client-ip'
  ...
};
````



##### Resource type

A mime type of the response content-type header. 

This is recommended to improve detection.

```` js
const options = {
  ...
  resourceType: 'text/html'
  ...
};
````


##### Threat types codes

Threat types are devided to two groups:

1. Block/Redirect - traffic detected as threat types in this group would be blocked or redirected to a different page (defind in [Redirect URL](#redirect-url).<br>
        Default threat type codes for this group:  2,3,6,7,10,11,16,18.
        
2. Captcha - threat type codes in this group would be reffered to [Callback function](#callback-function). <br>
        Default threat type codes for this group:  4,5,13,14,15,17.
Threat type must be unique for each list. 

```` js
const options = {
  ...
    threatTypesCodes: {
        blockRedirect: [2, 3, 6, 7, 10, 11, 16, 18],
        captcha: [4, 5, 13, 14, 15, 17]
    }
  ...
};
````



##### URI Exclusion

An array of regular expressions or path that will be excluded

```` js
const options = {
  ...
  URIExclusion: ['/about', /\/add_to_cart.*item=698/]
  ...
};
````



##### Redirect URL

A URL you would like to redirect invalid users to. 

If it is empty the response will be status code 403 and the user will be blocked.

```` js
const options = {
    ...
     redirectUrl: 'https://invalid-user.com'
    ...
}
````

##### Callback function

A custom callback option, for instance to redirect to captcha page.
If it is empty, will use express next function.

```` js
const options = {
    ...
     callback: function(req, res, next) {
        //do somthing or call next()
        }
    ...
}
````

##### Timeout

Optional timeout in milliseconds, if absent value will be set to 100 milliseconds.

```` js
const options = {
    ...
     timeout: 1000 // one second
    ...
}
````

##### Custom event name

In case a custom event name is used, this function extracts the name of the custom event.<br> 

```` js
const options = {
    ...
     getChannel: function getChannel(req) {
        return req.query.channel
     }
    ...
}
````

##### Ja3

A function that extracts ja3 fingerprint from the request.<br>
SSL/TLS client fingerprints

```` js
const options = {
    ...
     getJa3: function getJa3(req) {
        return req.query.ja3
     }
    ...
}
````

### Usage example


```` js
const express = require('express');
const app = express();
const { rti, eventsTypes } = require('cheq-express-middlewares');

const options = {...};
const middleware = rti(options);

app.get('/subscribe', middleware(eventsTypes.SUBSCRIBE), function (req, res) {
  res.send('Hello World');
})
app.get('/page_load', middleware(eventsTypes.PAGE_LOAD), function (req, res) {
  res.send('Hello World');
})

app.listen(3000);
````

