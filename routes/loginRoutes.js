const express = require('express');
const User = require('../schemas/UserSchema');
const app = express();
const router = express.Router()
const bcrypt = require('bcrypt')

app.set("view engine", "pug");
app.set("views", "views");

router.get('/',(req, res) => {
    const payload = {
        pageTitle: "Login"
    }
    res.status(200).render("login", payload)
})

router.post("/", async (req, res, next) => {
    const payload = req.body;

    if(req.body.logUsername && req.body.logpassword) {
        const user = await User.findOne({
            $or: [
                { username: req.body.logUsername },
                { email: req.body.logUsername }
            ]
        }).catch((error) => {
            console.log(error);

        })

        if(user != null) {
            var result = await bcrypt.compare(req.body.logpassword, user.password);

            if(result === true) {
                req.session.user = user;
                return res.redirect("/");
            }
        }
        const payload1 = {
            pageTitle: "Login",
            errorMessage : "Login credentials incorrect."
        }
        return res.status(200).render("login", payload1)
    }


    const payload1 = {
        pageTitle: "Login",
        errorMessage : "Make sure each field has a valid value."
    }
    res.status(200).render("login", payload1)
})


module.exports = router;