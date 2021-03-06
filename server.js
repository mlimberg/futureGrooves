const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
// const historyFallback = require('connect-history-api-fallback');
const jwt = require('jsonwebtoken');
const jwtconfig = require('dotenv').config().parsed


app.use(cors());

// if (!config.CLIENT_SECRET) {
//   console.log('Make sure you have a CLIENT_SECRET in your .env file')
// }

if(process.env.NODE_ENV === 'production'){
  app.set('secretKey', process.env.CLIENT_SECRET)
}


if (process.env.NODE_ENV === 'development') {
  app.set( 'secretKey', jwtconfig.CLIENT_SECRET)
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const config = require('./webpack.config.js');
  const compiler = webpack(config);

  app.use(webpackHotMiddleware(compiler));
  app.use(webpackDevMiddleware(compiler, {
    publicPath: '/',
    stats: {
      colors: true,
    },
    hot: true,
    inline: true,
    noInfo: true,
  }));
  // app.use(historyFallback());
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static(path.join(__dirname, "build")))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 3000);



const checkAuth = (request, response, next) => {
  const token = request.body.token ||
                request.params.token ||
                request.headers['authorization'] ||
                request.query.token

  if (token) {
    jwt.verify(token, app.get('secretKey'), (error, decoded) => {
      if (error) {
        return response.status(403).send({
          success: false,
          message: 'Invalid authorization token.'
        })
      } else {
        request.decoded = decoded;
        next();
      }
    })
  } else {
    return response.status(403).send({
      success: false,
      message: 'You must be authorized to hit this endpoint'
    });
  }
}

//get all users
app.get('/api/v1/users', (request, response) => {
  database('users').select()
    .then((users) => {
      response.status(200).json(users);
    })
    .catch(function(error) {
      console.error('somethings wrong with db')
      console.log(error)
      response.status(404)
    });
})

//get one user by ID
app.get('/api/v1/users/:id', (request, response) => {
  const { id } = request.params;
  const userFiles = [];

  database('users').where('id', id).select()
  .then((user) => {
    userFiles.push({user})
  })
  .then(()=>{
    database('compositions').where('user_id', id).select()
    .then((compositions) => {
      userFiles.push({compositions})
    })
  })
  .then(()=>{
    database('sounds').where('user_id', id).select()
    .then((sounds) => {
      userFiles.push({sounds})
      if(userFiles[0].user.length<1){
        response.status(404).send({
          error: 'ID did not match any existing users'
        })
      } else {
        response.status(202).json(userFiles)
      }
    })
  })
  .catch((error)=>{
    response.status(404).send({
      error
    })
  })
})

//post a new user
app.post('/api/v1/users', (request, response) => {
  const { username, email, password } = request.body
  const newUser = { username, email, password, deleted:false }

  if(!username || !email){
    response.status(422).json("[]")
  } else {
    database('users').insert(newUser)
    .then(()=> {
      database('users').where('username', username).select()
        .then(user => {
          let token = jwt.sign({username: user[0].username, id: user[0].id}, app.get('secretKey'))
          currentUser = {
            id: user[0].id,
            username: user[0].username,
            token: token
          }
          response.status(200).json(currentUser);
        })
        .catch((error) => {
          response.status(422)
        });
    })
    .catch(err => response.send({ error: err.constraint }))
  }
})

//login a user
app.post('/api/v1/user/login', (request, response) => {
  const { email, password } = request.body
  database('users').where({
    email: email,
    password: password
  }).select()
  .then((user) => {
      let token = jwt.sign({username: user[0].username, id: user[0].id}, app.get('secretKey'))
      currentUser = {
        id: user[0].id,
        username: user[0].username,
        token: token
      }
    response.status(200).send(currentUser)
  })
  .catch((error)=>{
    response.status(404).send({
      error
    })
  })
})

//patch a user
app.patch('/api/v1/users/:id', (request, response) => {
  const { id } = request.params;
  const { username, email } = request.body

  database('users').where('id', id).select().update({ username, email })
    .then(() => {
      database('users').where('id', id).select()
        .then((user) => {
          if(user.length < 1){
            response.status(404).send({
              error: 'ID did not match any existing users'
            })
          } else {
            response.status(200).json(user);
          }
        })
    })
    .catch((error) => {
      response.status(422)
      console.error(error)
    });
})

//delete a user
//not likely using this - will set delete toggle to true instead

app.delete('/api/v1/users/:id', (request, response) => {
  const { id } = request.params;

  database('users').where('id', id).update('deleted', true )
  .then((e) => {
    if(e) {
      database('compositions').where('user_id', id).update('deleted', true )
      .then((e) => {
      database('sounds').where('user_id', id).update('deleted', true )
      })
      .then(() => {
      response.status(200).send('All records have been deleted')
      })
    } else {
      response.status(404).send('User not found')
    }
  })
})

//get request that return total number of a users composititons and sounds
app.get('/api/v1/users/:id/creations', (request, response) => {
  const { id } = request.params;
  let totalCompositions = 0
  let totalSounds = 0
  let userName
  database('compositions').where('user_id', id).select()
  .then((compositions) => {
    if(compositions.length) {
      totalCompositions = compositions.length;
    }
  })
  .then(()=>{
    database('sounds').where('user_id', id).select()
    .then((sounds) => {
      if(sounds.length) {
        totalSounds = sounds.length
      }
    })
  })
  .then(()=>{
    database('users').where('id', id).select()
    .then((user) => {
      if(user.length<1){
        response.status(404).send({
          error: 'ID did not match any existing users'
        })
      } else {
        userName = user[0].username;
        response.send(`${userName} has created ${totalCompositions} compositions and ${totalSounds} sounds!`)
      }
    })
  })
  .catch((error)=>{
    response.status(404).send({
      error: 'ID did not match any existing users'
    })
  })

})

//get compositions also, narrow down compositions by complexity
app.get('/api/v1/compositions', (request, response) => {
  database('compositions').select()
    .then((compositions) => {
        response.status(200).json(compositions);
    })
    .catch(function(error) {
      response.status(404)
      console.error('somethings wrong with db')
      console.log(error)
    });
})

//get one composition by ID
app.get('/api/v1/compositions/:id', (request, response) => {
  const { id } = request.params;
  console.log('id ', id);
  database('compositions').where('id', id).select()
    .then((composition) => {
      if(composition.length<1){
        response.status(404).send({
          error: 'ID did not match any existing compositions'
        })
      } else {
        response.status(202).json(composition)
      }
    })
    .catch((error)=>{
      response.status(404).send({
        error: 'ID did not match any existing compositions'
      })
    })
})

//get compositions by User ID
app.get('/api/v1/userCompositions/:userID', checkAuth, (request, response) => {
  const { userID } = request.params;
  database('compositions').where('user_id', userID).select()
    .then(compositions => {
      response.status(200).send(compositions)
    })
    .catch((error)=>{
      response.status(404).send({
        error: 'ID did not match any existing users'
      })
    })
})

//get sounds by User ID
app.get('/api/v1/userSounds/:userID', checkAuth, (request, response) => {
  const { userID } = request.params;

  database('sounds').where('user_id', userID).select()
    .then(sounds => {
      response.status(200).send(sounds)
    })
    .catch((error)=>{
      response.status(404).send({
        error: 'ID did not match any existing users'
      })
    })
})

//post a composition
app.post('/api/v1/compositions', (request, response) => {
  const { attributes, user_id } = request.body
  const newComposition = { attributes, user_id, deleted:false }

  if(!attributes || !user_id){
    response.status(422).json("[]")
  } else {
    database('compositions').insert(newComposition)
    .then(()=> {
      database('compositions').select()
      .then((compositions) => {
        response.status(200).json(compositions);
      })
      .catch((error) => {
        response.status(422)
        console.error(error)
      });
    })
  }
})

//patch a composition
app.patch('/api/v1/compositions/:id', (request, response) => {
  const { id } = request.params;
  const { attributes } = request.body

  database('compositions').where('id', id).update({ attributes })
    .then(()=> {
      database('compositions').where('id', id).select()
        .then((composition) => {
          if(composition.length<1){
            response.status(404).send({
              error: 'ID did not match any existing compositions'
            })
          } else {
            response.status(202).json(composition)
          }
        })
    })
    .catch((error) => {
      response.status(404)
      console.error(error)
    });
})

//delete a composition
app.delete('/api/v1/compositions/:id', (request, response) => {
  const { id } = request.params;

  database('compositions').where('id', id).del()
  .then((num) => {
    if(num > 0) {
      database('compositions').select()
      .then(comps => {
        response.status(200).send(comps)
      })
    } else {
      response.status(404).send({ error: 'Unable to delete'})
    }
  })
})

//get sounds
app.get('/api/v1/sounds', (request, response) => {
  database('sounds').select()
    .then((sounds) => {
      response.status(200).json(sounds);
    })
    .catch(function(error) {
      response.status(404)
      console.error('somethings wrong with db')
      console.log(error)
    });
})

//get one sound by ID
app.get('/api/v1/sounds/:id', (request, response) => {
  const { id } = request.params;
  database('sounds').where('id', id).select()
    .then((sound) => {
      if(sound.length<1){
        response.status(404).send({
          error: 'ID did not match any existing sounds'
        })
      } else {
        response.status(202).json(sound)
      }
    })
    .catch((error)=>{
      response.status(404).send({
        error: 'ID did not match any existing sounds'
      })
    })
})

//post a sound
app.post('/api/v1/sounds', (request, response) => {
  const { attributes, user_id } = request.body
  const newSound = { attributes, user_id, deleted:false }

  if(!attributes || !user_id){
    response.status(422).json("[]")
  } else {
    database('sounds').insert(newSound)
    .then(()=> {
      database('sounds').select()
        .then((sounds) => {
          response.status(200).json(sounds);
        })
        .catch((error) => {
          response.status(404)
          console.error(error)
        });
    })
  }
})

//patch a sound
app.patch('/api/v1/sounds/:id', (request, response) => {
  const { id } = request.params;
  const { attributes } = request.body

  database('sounds').where('id', id).update({ attributes })
  .then(()=>{
    database('sounds').where('id', id).select()
    .then((sound) => {
      if(sound.length<1){
        response.status(404).send({
          error: 'ID did not match any existing sounds'
        })
      } else {
        response.status(202).json(sound)
      }
    })
  })
    .catch((error) => {
      response.status(404)
      console.error(error)
    });
})

//delete a sound
app.delete('/api/v1/sounds/:id', (request, response) => {
  const { id } = request.params;

  database('sounds').where('id', id).del()
  .then((num) => {
    if(num > 0) {
      database('sounds').select()
      .then(sounds => {
        response.status(200).send(sounds)
      })
    } else {
      response.status(404).send({ error: 'Unable to delete'})
    }
  })
})

app.get('/api/v1/impulses', (request, response) => {
  const { id } = request.query
  const filepath = path.join(__dirname, 'assets', 'audio', 'reverb', id)
  response.set({'Content-Type': 'audio/mpeg'})
  const readStream = fs.createReadStream(filepath)
  readStream.pipe(response)
})

app.get('/api/v1/samples', (request, response) => {
  const { id } = request.query
  const filepath = path.join(__dirname, 'assets', 'audio', 'samples', id)
  response.set({'Content-Type': 'audio/mpeg'})
  const readStream = fs.createReadStream(filepath)
  readStream.pipe(response)
})

// display app at the root and all other routes
app.get('*', function (request, response) {
  response.sendFile(path.join(__dirname, 'build', 'index.html'))
})

if(!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`We running on ${app.get('port')}.`)
  })
}

module.exports = app;
