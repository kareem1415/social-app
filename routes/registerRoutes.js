const express = require('express');
const User = require('../schemas/UserSchema');
const app = express();
const router = express.Router();
const bcrypt = require('bcrypt')

app.set("view engine", "pug");
app.set("views", "views");

router.get('/',(req, res) => {
    const payload = {
        pageTitle: "Register"
    }
    res.status(200).render("register", payload)
})

router.post('/', async (req, res) => {

    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const payload = req.body;

    if(firstName && lastName && username && email && password) {
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        }).catch((error) => {
            console.log(error)
            const payload = {
                pageTitle: "Register",
                errorMessage : "Something went wrong."
            }
            res.status(200).render("register", payload);
        })

        if (user == null) {
            const data = req.body;

            data.password = await bcrypt.hash(password, 10)

            User.create(data)
            .then((user) => {
                req.session.user = user;
                return res.redirect("/")
            })

        } else {
            // User found
            if (email == user.email) {
                payload.errorMessage = "Email already in use.";
            }
            else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render("register", payload);
        }
        } else {
        const payload = {
            pageTitle: "Register",
            errorMessage : "Make sure each field has valid value."
        }
        res.status(200).render("register", payload)
    }

})

module.exports = router;