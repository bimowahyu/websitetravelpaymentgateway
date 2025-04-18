const express = require('express')
const db = require('./config/dataBase')
const cors = require("cors");
const session = require('express-session');
const helmet = require('helmet')
const bodyParser = require('body-parser');
const moment = require('moment');
const cookieParser = require('cookie-parser');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const authRoute = require('./route/authRoute')
const userRoute = require('./route/userRoute')
const wisataRoute = require('./route/wisataRoute')
const transaksiRoute = require('./route/transaksiRoute')
const bokingRoute = require('./route/bokingRoute')
const kategoriRoute = require('./route/kategoriRoute')
const konfigurasiRoute = require('./route/konfigurasiRoute')
const TIMEZONE = "Asia/Jakarta";
const fileUpload = require('express-fileupload');
const path = require('path')

const { setupAssociations } = require('./model/associations')

setupAssociations();

const app = express()
const SESS_SECRET = "qwertysaqdunasndjwnqnkndklawkdwk";

const store = new SequelizeStore({
    db: db
});
// (async() => {
//    await db.sync();
// })();
app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: true,//'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(fileUpload());


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Date', moment().tz(TIMEZONE).format('ddd, DD MMM YYYY HH:mm:ss [GMT+0700]'));
    next();
});
app.use(session({
    secret: SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: false, // Untuk pengujian lokal, gunakan `false`
        httpOnly: true,
        sameSite: 'lax',
    }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
//app.use('/uploads', express.static('public/uploads'));
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads/config', express.static(path.join(__dirname, 'uploads/config')));



app.use(authRoute)
app.use(userRoute)
app.use(kategoriRoute)
app.use(wisataRoute)
app.use(transaksiRoute)
app.use(bokingRoute)
app.use(konfigurasiRoute)

app.get('/',(req,res)=> {
    res.send('Hello everyone')
})

// store.sync();

const port = 2025

app.listen(port,()=> {console.log('server')})