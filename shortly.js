var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
// app.use(cookieParser());
app.use(session({
    secret: 'shhhhh secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/', 
function(req, res) {

  restrict(req, res, function(){
    res.render('index');    
  }, '/login');
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.get('/create', 
function(req, res) {
  restrict(req, res, function(){
    res.render('index');    
  }, '/login');
});

app.get('/links', 
function(req, res) {
  //console.log(req.session.user);
  restrict(req, res, function(){
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
  }, '/login');
  // Links.reset().fetch().then(function(links) {
  //     res.send(200, links.models);
  //   });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});


app.post('/signup', 
function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // If Valid TODO

  new User({username: username, password: password}).fetch().then(function(found) {
    if(found){
      res.send(200, found.attributes);
    } else {
      Users.create({
        username: username,
        password: password
      })
      .then(function(newUser){
        // console.log(newUser);
        // res.send(200, 'index');
        //res.writeHead(200);
        req.session.regenerate(function(){
        req.session.user = username;
        res.redirect('/');
      })
        //res.render('index');
      })
    }
  })
});

// app.post('/login',
// function(req, res){
//   var username = req.body.username;
//   var password = req.body.password;


//   })

/************************************************************/
// Write your authentication routes here
/************************************************************/

// var express = require('express');
// var app = express();
 
// app.use(express.bodyParser());

 
 
function restrict(req, res, next, redirectTo) {
  //console.log(req.session.user);
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect(redirectTo);
  }
}
 

 
app.post('/login', function(request, response) {
 
    var username = request.body.username;
    var password = request.body.password;
    var checkPassword = function(password, checkAgainstDb){
      var bcryptAsync = Promise.promisify(bcrypt.compare);
      return bcryptAsync(password, checkAgainstDb).then(function(match){
        return match;
      })
    }
   // var dbPassword;
    //var myModel = Users.findWhere({username: username});
    db.knex('users').where({username: username}).then(function(result){
      // console.log(result[0]['username']);
      if (result[0] && result[0]['password']){
        return result[0]['password'];
      }
    }).then(function(dbPassword){
      if(dbPassword){
      if(checkPassword(password, dbPassword)){
          request.session.regenerate(function(){
          request.session.user = username;
          response.redirect('/');
          });
      }
      else {
         response.redirect('/login');
      }
    } else {
      response.redirect('/login');
    }   
  }
    )




    // .select('salt').
    // console.log(temp);
    //console.log("dbPassword: ", dbPassword, "password", password)
    
});
 
app.get('/logout', function(request, response){

    //session.destroy();
    request.session.destroy(function(){
      // response.render('login');
      response.redirect('/');
        
    });
    //request.session = null;
});
 
// app.get('/restricted', restrict, function(request, response){
//   console.log("here too!");
//   response.send('This is the restricted area! Hello ' + request.session.user + '! click <a href="/logout">here to logout</a>');
// });
 


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);