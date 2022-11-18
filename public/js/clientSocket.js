let connected = false

let socket = io("https://khamsa-bako.herokuapp.com/")

socket.emit("setup", userLoggedIn)

socket.on("connected", () => connected = true)
socket.on("message received", (newMessage) => messageReceived(newMessage))

