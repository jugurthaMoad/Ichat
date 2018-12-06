'use strict';

const express  = require('express');
const app      = express();
const bp       = require('body-parser');
const connect      = require('./model/user');
const con = connect.connection;
const controle = require('./controler');
const session  = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport     = require('passport');
const bcrypt       = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const port     = process.env.PORT || 3000;


//let personne = user.CreateUser("Moad123","jugu@joe.com","123");
//user.IsMatch("Moad123","123");

app.set('view engine', 'ejs');
app.use(bp());
app.use(express.static('public'));

const options = {
    host: "localhost",
    user: "root",
    password: "",
    database: "Ichat"
};

const sessionStore = new MySQLStore(options);
app.use(session({
  secret: 'azertishgfjifgd',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
//  cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) =>{
    console.log('username = '+ username);
    console.log('password'+ password);
    con.query("SELECT id, motDepasse FROM utilisateur WHERE nom = ?",[username],(err, res) =>{
     if(err) throw err;
     if(res.length === 0){
      done(null,false);}
     else{
       console.log("utisilateur existe et le mp = " + res[0].motDepasse);
       bcrypt.compare(password,res[0].motDepasse, (err, match)=>{
         if(err) throw err;
         if(match ===true){
           return done(null, {user_id: res[0].id});
         }else{
           return done(null, false);
         }
       });
      }


    });

  }
));

controle(app);

app.listen(port, ()=>{
console.log("Server Started on port " + port);
});
