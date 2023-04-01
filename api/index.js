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
const fs = require("fs")

//config and import secrets
dotenv.config()
mongoose.connect(process.env.MONGO_URL)
const jwtSecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)

const app = express()

//setup
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))


//
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

//test to verify server
app.get("/test", (req, res) => {
    res.json("test ok")
})

//search for messages on user request
app.get("/messages/:userId", async (req, res) => {
    // 
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req)
    const ourUserId = userData.userId
    //go into db and look for sender messages with our sender/recipient, sort in chronological order
    const messages = await MessageModel.find({
        sender: {$in:[userId, ourUserId]},
        recipient:{$in:[userId, ourUserId]}
    }).sort({createdAt: 1})
    res.json(messages)
})

//if user requests people, search db find people
app.get('/people', async(req, res) => { 
    const users = await UserModel.find({}, {'_id': 1, username: 1})
    res.json(users)
})

//profile request, verify that browser has a token in cookies, if so send the user's data
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

app.post("/friend-request", async(req, res) => {
    const {username, target} = req.body
    
    if (target != username){
        UserModel.findOneAndUpdate(
            {username: target},
            { $addToSet: { frequests: [username] } },
            { new: true }).then((hello) => {
                console.log(hello)
        })
    }
    
})

app.get("/friend-request/:username", async(req, res) => {
    const {username} = req.params
    const user = await UserModel.findOne({username: username})

    res.json(user?.frequests) 
})

app.put("/friend-request/", async(req, res) => {
    const {username, target, state} = req.body
    UserModel.findOneAndUpdate(
        {username: username},
        { $pull: { frequests: target } },
        { new: true }).then((hello) => {
            console.log(hello)
    })
    if (state){
        UserModel.findOneAndUpdate(
            {username: username},
            { $addToSet: { friends: [target] } },
            { new: true }).then((hello) => {
                console.log(hello)
        })
        UserModel.findOneAndUpdate(
            {username: target},
            { $addToSet: { friends: [username] } },
            { new: true }).then((hello) => {
                console.log(hello)
        })
    }

})

app.get("/friends/:username", async(req, res) => {
    const {username} = req.params
    const user = await UserModel.findOne({username: username})

    res.json(user?.friends) 
})

//on login request
app.post("/login", async(req, res) => {
    //look for the user's name
    const {username, password} = req.body;
    UserModel.find({username})
    const foundUser = await UserModel.findOne({username})
    //compare decrypted password
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

//clear cookies on logout
app.post("/logout", async(req, res) => {
    res.clearCookie('token').json("ok")
})

//on register
app.post("/register", async (req, res) => {
    //get username and password
    const {username, password} = req.body
    try{    
        //hash the password, create a user in the db and sign the token in cookies
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
        const createdUser = await UserModel.create({username: username, password: hashedPassword})
        //create jwt and add it to cookie 
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

//start server at port 4040
const server = app.listen(4040)

//start web socket connection server
const wss = new ws.WebSocketServer({server})

//on connection
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

    //evert 5 seconds send a ping to see if user is still online
    connection.timer = setInterval(() => {
        connection.ping()
        //if the user does not respond in 1 second, kill their connection
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false
            clearInterval(connection.timer)
            connection.terminate()
            notifyAboutOnlinePeople()
        }, 1000)
      }, 5000)
    
    //if the user repsonds, don't kill connection
    connection.on('pong', () => {
        clearTimeout(connection.deathTimer)
    })

    //read username and id from the cookie for this connection
    const cookies = req.headers.cookie
    if (cookies){
        //split and search cookies for token
        const tokenCookieString = cookies.split(";").find(str => str.startsWith('token='))
        if (tokenCookieString){
            const token = tokenCookieString.split("=")[1]
            //if we find a token in the cookies, verify the token and create a new connection
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
        // reveive message from user
        const messageData = JSON.parse(message.toString())
        const {recipient, text, file} = messageData
        let filename = null
        //if the message contains a file
        if (file){
            //split file name into parts into extention
            const parts = file.name.split('.')
            const ext = parts[parts.length-1]
            //use DateTime as the file name 
            filename = Date.now() + '.' + ext
            const path = __dirname + '/uploads/' + filename
            const bufferData = new Buffer.from(file.data.split(',')[1], 'base64')
            fs.writeFile(path, bufferData, () => {
                console.log('file saved:' + path)
            })
        }
        if (recipient && text || file){
            const messageDoc = await MessageModel.create({ 
                sender: connection.userId,
                recipient: recipient,
                text: text,
                file: file ? filename : null,
            });
            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text:text, 
                    sender: connection.userId,
                    recipient: recipient,
                    file: file ? filename : null,
                    _id: messageDoc._id
                })))
        }
    });

    //notify everyone about online people (when someone connects)
    notifyAboutOnlinePeople()
   
})

//on close, confirm disconnect
wss.on('close', () => {
    console.log('disconnected', data)
})
