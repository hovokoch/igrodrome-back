const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = (req, res, next) => {
    User.find({email : req.body.email}, function (err, users) {
        if (!users.length){
            bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
                if (err) {
                    res.json({
                        error: err
                    })
                }

                let user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPass,
                    role_id: req.body.role_id
                })

                user.save()
                    .then(user => {
                        res.json({
                            status: 'success',
                            message: 'Вы успешно зарегистрировалтсь'
                        })
                    })
                    .catch(error => {
                        res.json({
                            status: 'error',
                            message: 'Произошла ошибка!'
                        })
                    })
            })
        }else{
            res.json({
                status: 'error',
                message: 'Адрес электронной почты уже существует'
            })
        }
    });
}

const login = (req, res, next) => {
    let email = req.body.email,
        password = req.body.password

    User.findOne({$or: [{email}]})
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        res.json({
                            error: err
                        })
                    }

                    if (result) {
                        let token = jwt.sign({
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role_id: user.role_id,
                            }, process.env.JWT_SECRET_KEY, {expiresIn: '72h'})

                        res.json({
                            status: 'success',
                            message: "Вход выполнен успешно",
                            token
                        })
                    } else {
                        res.json({
                            status: 'error',
                            message: 'Пароль не соответствует'
                        })
                    }
                })
            } else {
                res.json({
                    status: 'error',
                    message: "Пользователь не найден!"
                })
            }
        })
}

const user = (req, res, next) => {
    res.json({
        user: req.user
    })
}

const logout =  (req, res) => {
    return res.status(200).json({
        message: 'Успешный выход из системы'
    });
}

module.exports = {
    register,
    login,
    logout,
    user
}