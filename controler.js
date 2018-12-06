'use strict'


module.exports = (app)=>{

  const { check, validationResult } = require('express-validator/check');
  const bcrypt       = require('bcrypt');
  const saltRounds   = 10;
  const passport     = require('passport');
  const connect      = require('./model/user');
  const con = connect.connection;

  app.get('/', (req, res) =>{
    res.render('./login');
  });

  app.get('/register', (req, res) =>{
    res.render('./register');
  })

  app.get('/chatRome',authenticationMiddleware (), (req, res) =>{
    res.render('./chatroom');
  })
 app.get('/logout', (req, res)=>{
   req.logout();
   req.session.destroy();
   res.redirect('/');
 })
  app.post('/login', passport.authenticate(
    'local',{
    successRedirect: "/chatRome",
    failureRedirect: "/"
  }
  ))
  app.post('/register', [

      check('Name','Nom invalide').isLength({ min: 5 }),
      check('Email','Email invalide').isEmail(),
      check('Password','Password invalide').isLength({ min: 5 })

  ], (req, res) => {

    const Nom       = req.body.Name;
    const Email     = req.body.Email;
    const Password  = req.body.Password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
    }
    else {

      bcrypt.hash(Password, saltRounds, function(err, hash) {
       con.query("INSERT INTO utilisateur (nom,  email, motDepasse) VALUES(?,?,?);", [ Nom, Email, hash] ,(err, result) =>{
          if (err) throw err;
          console.log("1 record inserted");
          con.query("SELECT LAST_INSERT_ID() as user_id", function(err, result){
            if(err) throw err;
            const user_id = result[0];
            console.log('Result[0] =', user_id);
            req.login(user_id, function(err){
              res.redirect('/chatRome');
            });
          });
      });
      });

    }

  });


  passport.serializeUser(function(user_id, done) {
    done(null, user_id);
  });

  passport.deserializeUser(function(user_id, done) {

      done(null, user_id);
  });

  function authenticationMiddleware () {
 	return (req, res, next) => {
 		console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

 	    if (req.isAuthenticated()) return next();
 	    res.redirect('/')
 	}
 }
}




/*

'use strict'

const express = require('express');
const app = express();
const bp = require('body-parser');
const user = require('./model/user');
app.use(bp());
//let personne = user.CreateUser("Moad123","jugu@joe.com","123");
//user.IsMatch("Moad123","123");

app.set('view engine', 'ejs');
app.use(bp());
app.use(express.static('public'));

app.get('/', (req, res) =>{
  res.render('./login');
})


*/
