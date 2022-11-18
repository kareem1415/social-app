const express = require("express");
const router = express.Router();
const Message = require("../../schemas/MessageSchame");
const Chat = require("../../schemas/ChatSchema");
const User = require("../../schemas/UserSchema")




router.post("/", async (req, res, next) => {
    if(!req.body.content || !req.body.chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400)
    }

    let newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    Message.create(newMessage)
    .then(async message => {
        message = await message.populate("sender");
        message = await message.populate("chat");
        message = await User.populate(message, { path: "chat.users" })

        Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        .catch(error => console.log(error))
        res.status(201).send(message);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400)
    })
})


module.exports = router;