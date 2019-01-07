'use strict';

const express  = require('express');
const app      = express();
const http = require('http');
const server = http.Server(app);
const io = require('socket.io')(server);
const bp       = require('body-parser');
const connect  = require('./model/user');
const con      = connect.connection;
const controle = require('./controler');
const session  = require('express-session');
const flash    = require('express-flash');
const port     = process.env.PORT || 3000;
// Session sur la base de données
const MySQLStore = require('express-mysql-session')(session);
const passport     = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt       = require('bcrypt');

//verification sur une base de données locale



//Template pour les views
app.set('view engine', 'ejs');

//Body parser pour pouvoir manipuler les corps des repenses
app.use(bp());

//le dossier public contient des fichier statique Html Javascript Css
app.use(express.static('public'));

// Pour la base données
const options = {
  host     : "localhost",
  user     : "root",
  password : "",
  database : "Ichat"
};

// Creation d'une connexion pour la table session
const sessionStore = new MySQLStore(options);

//Creation d'une session a chaque connexion
app.use(session({
  secret: 'azertishgfjifgd',
  resave: false,
  store: sessionStore,
  saveUninitialized: false,
//  cookie: { secure: true }
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// verification du nom mot de passe sur la base de donnée

passport.use(new LocalStrategy(
  (username, password, done)  =>{

    con.query("SELECT id, motDepasse FROM utilisateur WHERE nom = ?",[username],(err, res) =>{
     if(err) throw err;

     // utilisateur existe pas
     if(res.length === 0){
      done(null,false,{ message: 'Invalid username '});}
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

io.on('connection', (socket)=>{
  console.log(' user Is Connected ... ');
  socket.on('chat', (data)=>{
    console.log('Message : ' + data.message);
    io.sockets.emit('chat', data);
  })
})
controle(app);

server.listen(port, ()=>{
console.log("Server Started on port " + port);
});
