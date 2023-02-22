const express = require('express');
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');


mongoose.connect('mongodb://localhost:27017/authDemo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('Database Connected');
});



const ejs = require('ejs');
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true}));
app.use(session({ secret: 'notagoodsecret'}));

app.get('/', (req, res) => {
    res.send('This is the home page');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password: hash
    });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

// middleware to verify userId session
// middleware signature is (req, res, next)
const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    else {
        next();
    }
}

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { password, username } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    } else{
        res.redirect('/login');
    }
});

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    // this will get rid of entire session
    // req.session.destroy();
    res.redirect('/login');
});

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret');
});

app.get('/topsecret', requireLogin, (req, res) => {
    res.send('TOP SECRET')
})

app.listen(3000, () => {
    console.log('Serving your app!');
});