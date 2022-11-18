const express = require('express');
const app = express();
const router = express.Router()

app.set("view engine", "pug");
app.set("views", "views");

router.get('/',(req, res) => {
    if (req.session) {
        req.session.destroy(()=> {
            res.redirect("/login")
        })
    }
})

module.exports = router;