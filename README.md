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

app.user(middleware(eventsTypes.PAGE_LOAD));

app.get('/', function (req, res) {
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
    
    // mode, bloking or monitor. this value is optional, if missing value will be set to blocking
    mode: 'blocking',
    
    // redirectUrl, redirct invalid users to a given URL
    // if missing will response with 404 status code
    redirectUrl: 'https://invalid-user.com',
    
    // callback a function for redirect to capch page 
    // if missing the middleware will use express next function
    callback: function(data) {
        //do somthing 
        }
}
````