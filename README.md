# cheq-express-middlewares
CHEQ middlewares for Express.Js



## Features

- [Installation](#installation)
- [Real time interception](#real-time-interception)


## Installation
````bash
$ npm install cheq-express-middlewares
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

Appears in your Cheq tag. 

```` js
const options = {
    ...
    tagHash: 'c99651e7936e27743ce51c728492aac9'
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

##### Redirect URL

A path you would like to redirect invalid users to. 

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

### Options object

```` js
{
    // api key, this value is required
    apiKey: '11abc111-aa11-11aa-1111-11a11a11111',
    
    // tag hash, this value is required
    tagHash: '4d7d2a6e01b6438af7d403a172e7b243',
    
    // mode blocking or monitor. this value is optional, if missing value will be set to monitoring
    mode: 'monitoring',
    
    // redirectUrl, redirct invalid users to a given URL
    // if empty will respond with 403 status code
    redirectUrl: 'https://invalid-user.com',
    
    // callback a function for redirect to captcha page 
    // if missing the middleware will use express next function
    callback: function(req, res, next) {
        //do somthing or call next()
        }
}
````
