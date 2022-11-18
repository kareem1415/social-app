const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const Chat = require('../schemas/ChatSchema');
const User = require('../schemas/UserSchema')


router.get("/", (req, res, next) => {
    res.status(200).render("inboxPage", {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    })
})

router.get("/new", (req, res, next) => {
    res.status(200).render("newMessages", {
        pageTitle: "New Messages",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    })
})

router.get("/:chatId", async (req, res, next) => {

    let userId = req.session.user._id;
    let chatId = req.params.chatId;
    let isValidId = mongoose.isValidObjectId(chatId);

    let payload = {
        pageTitle: "Chat",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    if(!isValidId) {
        payload.errorMessage = "Chat does not exist or you do not have permission to view it.";
        return res.status(200).render("chatPage", payload)
    }

    let chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId } } })
    .populate("users")

    if(chat == null) {
        // Check if chat id is really user id
        let userFound = await User.findById(chatId);

        if(userFound != null) {
            // get chat using user id
            chat = await getChatByUserId(userFound._id, userId)
        }
    }

    if (chat == null) {
        payload.errorMessage = "Chat does not exist or you do not have permission to view it."
    } else {
        payload.chat = chat;
    }

    res.status(200).render("chatPage", payload)
})

function getChatByUserId(userLoggedInId, otherUserId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                { $elemMatch: { $eq: userLoggedInId }},
                { $elemMatch: { $eq: otherUserId }}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    },
    {
        new: true,
        upsert: true
    })
    .populate("users");
}


module.exports = router