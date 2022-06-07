# cheq-express-middlewares
CHEQ middlewares for Express.Js



## Features

- [Installing](#installing)
- [Real time interception](#real-time-interception)


## installing
````bash
$ npm install cheq-express-middlewares
````

## Real time interception

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
    // api key this value is required
    apiKey: 'xyz',
    
    // tag hash this value is required
    tagHash: '$jsk8Kte5',
    
    // mode bloking or monitor. this value is optional, if missing value will be set to blocking
    mode: 'blocking',
    
    // redirectUrl, redirct invalid users to a given URL
    // if empty will response with 403 status code
    redirectUrl: 'https://invalid-user.com',
    
    // callback a function for redirect to capch page 
    // if missing the middleware will use express next function
    callback: function(req, res, next) {
        //do somthing or call next()
        }
}
````
