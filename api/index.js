const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const bcrypt = require("bcryptjs")
const UserModel = require('./models/User')
const MessageModel = require("./models/Messages")
const ws = require("ws")


dotenv.config()
mongoose.connect(process.env.MONGO_URL)
const jwtSecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))

const getUserDataFromRequest = async (req) => {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err
                resolve(userData)
            })
        } else{
            reject('no token')
        }
    })
}

app.get("/test", (req, res) => {
    res.json("test ok")
})

app.get("/messages/:userId", async (req, res) => {
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req)
    const ourUserId = userData.userId
    const messages = await MessageModel.find({
        sender: {$in:[userId, ourUserId]},
        recipient:{$in:[userId, ourUserId]}
    }).sort({createdAt: true})
    res.json(messages)
})

app.get('/people', async(req, res) => { 
    const users = await UserModel.find({}, {'_id': true, username: true})
    res.json(users)
})

app.get("/profile", (req, res) => {
    const token = req.cookies?.token
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err
            res.json(userData)
        })
    } else {
        res.status(401).json("no token")
    }
    
})

app.post("/login", async(req, res) => {
    const {username, password} = req.body;
    UserModel.find({username})
    const foundUser = await UserModel.findOne({username})
    if (foundUser){
        const passOk = bcrypt.compareSync(password, foundUser.password)
        if (passOk) {
            jwt.sign({userId: foundUser._id, username:username}, jwtSecret, {}, (err, token) => {
                if (err) throw err
                res.cookie("token", token, {sameSite: 'none', secure:true}).json({
                id: foundUser._id,
                })
            })
        }
    }
})

app.post("/logout", async(req, res) => {
    res.cookie('/token', '', {sameSite:'none', secure:true}).json("ok")
})

app.post("/register", async (req, res) => {
    const {username, password} = req.body
    try{    
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
        const createdUser = await UserModel.create({username: username, password: hashedPassword})
        jwt.sign({userId: createdUser._id, username:username}, jwtSecret, {}, (err, token) => {
            if (err) throw err
            res.cookie("token", token, {sameSite: 'none', secure:true}).status(201).json({
                id: createdUser._id,
            })
        })
    } catch(err){
        if (err) throw err
        res.status(500).json("error")
    }
    
})

const server = app.listen(4040)

const wss = new ws.WebSocketServer({server})

wss.on('connection', (connection, req) => {

    const notifyAboutOnlinePeople = () => {
        //notify everyone about online people (when someone connects)
        [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({userId:c.userId, username:c.username}))
        }
        ))
    })
    }

    connection.isAlive = true

    connection.timer = setInterval(() => {
        connection.ping()
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer)
            connection.terminate
            notifyAboutOnlinePeople()
        }, 1000)
    }, 5000)

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer)
    })

    //read username and id from the cookie for this connection
    const cookies = req.headers.cookie
    if (cookies){
        const tokenCookieString = cookies.split(";").find(str => str.startsWith('token='))
        if (tokenCookieString){
            const token = tokenCookieString.split("=")[1]
            if (token){
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err
                    const {userId, username} = userData
                    connection.userId = userId
                    connection.username = username
                })
            }
        }
    }

    connection.on('message', async(message) => {
        const messageData = JSON.parse(message.toString())
        const {recipient, text} = messageData
        if (recipient && text){
            const messageDoc = await MessageModel.create({ 
                sender: connection.userId,
                recipient: recipient,
                text: text,

            });
            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text:text, 
                    sender: connection.userId,
                    recipient: recipient,
                    _id: messageDoc._id
                })))
        }
    });

    //notify everyone about online people (when someone connects)
    notifyAboutOnlinePeople()
   
})

wss.on('close', () => {
    console.log('disconnected', data)
})
