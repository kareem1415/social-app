let typing = false;
let lastTypingTime;

$(document).ready(() => {

    socket.emit("join room", chatId);
    socket.on("typing", () => $(".typingDots").show())
    socket.on("stop typing", () => $(".typingDots").hide())

    $.get(`/api/chats/${chatId}`, (data) => $("#chatName").text(getChatName(data)))

    $.get(`/api/chats/${chatId}/messages`, (data) => {
        let messages = [];
        let lastSenderId = "";

        data.forEach((message, index) => {
            var html = createMessageHtml(message, data[index + 1], lastSenderId);
            messages.push(html);

            lastSenderId = message.sender._id;
        })

        let messagesHtml = messages.join("");

        addMessagesToHtml(messagesHtml);
        scrollToBottom(false);
        markAllMessagesAsRead()

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible")
    })
})

$("#chatNameButton").click(() => {
    let name = $("#chatNameTextbox").val().trim();

    $.ajax({
        url: "/api/chats/" + chatId,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if(xhr.status != 204 ){
                alert("can't update")
            } else {
                location.reload();
            }
        }
    })
})

$(".sendMessageButton").click(() => {
    messageSubmitted();
})

$(".inputTextbox").keydown((event) => {
    updateTyping()

    if ( event.which === 13 && !event.shiftKey ) {
        messageSubmitted();
        return false;
    }
})

function updateTyping() {
    if(!connected) return;

    if(!typing) {
        typing = true;
        socket.emit("typing", chatId);
    }

    lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    setTimeout(() => {
        let timeNow = new Date().getTime();
        let timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing) {
            socket.emit("stop typing", chatId)
            typing = false
        }
    }, timerLength)
}

function addMessagesToHtml(html) {
    $(".chatMessages").append(html)

    scrollToBottom(false)
}

function messageSubmitted() {
    let content = $(".inputTextbox").val().trim();

    if (content != "") {
        sendMessage(content)
        $(".inputTextbox").val("")
        socket.emit("stop typing", chatId)
        typing = false
    }

}

function sendMessage(content) {
    $.post("/api/messages", { content: content, chatId: chatId }, (data, status, xhr) => {
        if(xhr.status != 201) {
            alert("Could not send message");
            $(".inputTextbox").val(content);
            return;
        }

        addChatMessageHtml(data)

        if(connected) {
            socket.emit("new message", data)
        }
    })
}

function addChatMessageHtml(message){
    if (!message || !message._id) {
        alert("Message is not valid");
        return;
    }

    let messageDiv = createMessageHtml(message, null, "");

    addMessagesToHtml(messageDiv)
    scrollToBottom(true)

    
}

function createMessageHtml(message, nextMessage, lastSenderId) {
    let sender = message.sender;
    let senderName = sender.firstName + " " + sender.lastName;

    let currentSenderId = sender._id;
    let nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    let isFirst = lastSenderId != currentSenderId;
    let isLast = nextSenderId != currentSenderId;

    let isMine = message.sender._id == userLoggedIn._id;
    let liClassName = isMine ? "mine" : "theirs";

    let nameElement = ""

    if(isFirst) {
        liClassName += " first";

        if(!isMine) {
            nameElement = `<span class='senderName'>${senderName}</span>`
        }
    }

    let profileImage = "";
    if(isLast) {
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'>`
    }

    let imageContainer = "";
    if(!isMine) {
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated) {
    var container = $(".chatMessages");
    var scrollHeight = container[0].scrollHeight;

    if(animated) {
        container.animate({ scrollTop: scrollHeight }, "slow");
    }
    else {
        container.scrollTop(scrollHeight);
    }
}


function markAllMessagesAsRead() {
    $.ajax({
        url: `/api/chats/${chatId}/messages/markAsRead`,
        type: "PUT",
        success: () => refreshMessagesBadge()
    })
}