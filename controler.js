'use strict'


module.exports = (app)=>{

  const { check, validationResult } = require('express-validator/check');
  const bcrypt       = require('bcrypt');
  const saltRounds   = 10;
  // Permet l'authorisation d'accés a des pages
  const passport     = require('passport');
  const connect      = require('./model/user');
  const http = require('http');
  const server = http.Server(app);
  const io = require('socket.io')(server);


  //pour faire une connexion avec la base de données
  const con = connect.connection;

//les Router
// Page de depart
  app.get('/', (req, res) =>{
    res.render('./login');
  });
// page d'enregistrement
  app.get('/register', (req, res) =>{
    res.render('./register');
  })
// Page de chat restreinte avec authenticationMiddleware

  app.get('/chatRome',authenticationMiddleware (), (req, res) =>{
    res.render('./chatroom');
  })

  //Deconnexion avec suppression de la session
 app.get('/logout', (req, res)=>{
   req.logout();
   req.session.destroy();
   res.redirect('/');
 })

 //Gestion des formulaires

 // utilisation de passport.authorisate pour sois accedé au chat sois /
  app.post('/login', passport.authenticate(
    'local',{
    successRedirect: "/chatRome",
    failureRedirect: "/",
    failureFlash: "invalid password or username "
  }
), function(req, res){
  req.flash(error)
});

  // verification des champs de saisie
  app.post('/register', [

      check('Name','Nom invalide').isLength({ min: 5 }),
      check('Email','Email invalide').isEmail(),
      check('Password','Password invalide').isLength({ min: 5 })

  ], (req, res) => {
    // Variables qui contienent les valeurs des champs
    const Nom       = req.body.Name;
    const Email     = req.body.Email;
    const Password  = req.body.Password;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
       errors = errors.array();
       req.flash('errors',errors);
       res.redirect('/register');
       res.status(422);
    }
    else {
    // Une fois que tout est bon on les insert dans la base de donnée
      bcrypt.hash(Password, saltRounds, function(err, hash) {
       con.query("INSERT INTO utilisateur (nom,  email, motDepasse) VALUES(?,?,?);", [ Nom, Email, hash] ,(err, result) =>{
          if (err) throw err;
          con.query("SELECT LAST_INSERT_ID() as user_id", function(err, result){
            if(err) throw err;
            const user_id = result[0];
            //Cette fonction permet de creer une session
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

// fonction qui permet de verifier si l'utilisateur est connecter
//pour accedé a la page de chatRome
  function authenticationMiddleware () {
 	return (req, res, next) => {
 	    if (req.isAuthenticated()) return next();
 	    res.redirect('/');
 	}
 }
 

}
