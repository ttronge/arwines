
require('dotenv').config();
const helpers = require('../utils/helpers')
const User = require("../db/models/User");
const Cart = require("../db/models/Cart");

// const TokenExpired = require("../db/models/TokenExpired") // asumiendo que este la tabla.
// import { createBlackList } from 'jwt-blacklist'; // si usamos black list jwt  // npm install jwt-blacklist

  const jwt = require('jsonwebtoken');
const secret = process.env.SECRET; 

const userController = {}

userController.register = (req, res, next) => {
    User.create(req.body)
   .then((user) => {
        user.getCarts({where: {status : "active"}})
       .then(cart => {
            const token = user.generateToken()
            
            helpers.getCart_items(user.id).then(cart=>{
                return res.status(200).send({ token, cart, user: user.dataValues })
            })
        })    
    })
    .catch(next);
} 
userController.login =  (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({where: {email}})
    .then((user) => {
        console.log(user)
        if(!user){
            return res.status(401).send("Invalid credentials")
        }
        if(!user.validPassword(password)){  
            return res.status(401).send("Invalid credentials")
        }
        const token = user.generateToken()

        helpers.getCart_items(user.id).then(cart=>{
            return res.status(200).send({ token, cart, user: user.dataValues })
        })
    })
}
userController.updateUser = (req, res, next) => {
    User.findByPk(req.params.id)
    .then(data => data ? data.update(req.body)
        .then(data =>  res.send(data) ) : res.sendStatus(404))
    .catch(next)
    }
userController.getUser = (req, res, next) => {
    User.findByPk(req.params.id)
    .then(data => {
    if(!data) res.sendStatus(404)
    })
}
userController.deleteUser = (req, res, next) => {
    User.findByPk(req.params.id)
    .then(data => data ? data.destroy()
        .then(() => res.status(200).send('User was deleted')) : res.sendStatus(404))
    .catch(next);    
}
userController.updateAdmin = (req, res, next) => {
        User.findByPk(req.body.userID)
        .then(data => data ? data.update(req.body)
            .then(data => res.send(data) ) : res.sendStatus(404))
        .catch(next)
}
userController.getUsersAdmin = (req, res, next) => {
    User.findAll({})
    .then(data => res.send(data))
    .catch(next) 
}    
module.exports = userController;