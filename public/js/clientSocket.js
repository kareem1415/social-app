
let connected = false

let socket = io("https://khamsa-bako-amgedomar12.koyeb.app/") //production link

// let socket = io("http://localhost:3000") // devlink

socket.emit("setup", userLoggedIn)

socket.on("connected", () => connected = true)
socket.on("message received", (newMessage) => messageReceived(newMessage))

socket.on("notification received", () => {
    $.get("/api/notifications/latest", (notificationData) => {
        showNotificationPopup(notificationData)
        refreshNotificationsBadge();
    })
})

function emitNotification(userId) {
    if (userId == userLoggedIn._id) return;

    socket.emit("notification received", userId)
}
