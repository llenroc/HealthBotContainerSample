function requestChatBot(location) {
    // remove current chatbot if exists
    const botContainer = document.getElementById('botContainer');
    if (botContainer.childNodes.length > 0) {
        botContainer.removeChild(botContainer.childNodes[0]);
    }
    botContainer.classList.remove("wc-display");

    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initBotConversation);
    var path = "/chatBot";
    if (location) {
        path += "?lat=" + location.lat + "&long=" + location.long;
    }
    oReq.open("GET", path);
    oReq.send();
}

function chatRequested() {
    var shareLocation = document.getElementById("shareLocation").checked;
    if (shareLocation) {
        getUserLocation(requestChatBot);
    }
    else {
        requestChatBot();
    }
}

function getUserLocation(callback) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            var latitude  = position.coords.latitude;
            var longitude = position.coords.longitude;
            var location = {
                lat: latitude,
                long: longitude
            }
            callback(location);
        },
        function(error) {
            // user declined to share location
            callback();
        });
}

function initBotConversation() {
    if (this.status >= 400) {
        alert(this.statusText);
        return;
    }
    // extract the data from the JWT
    const jsonWebToken = this.response;
    const tokenPayload = JSON.parse(atob(jsonWebToken.split('.')[1]));
    const user = {
        id: tokenPayload.userId,
        name: document.getElementById("userName").value ? document.getElementById("userName").value : "you"
    };
    const botConnection = new BotChat.DirectLine({
        //secret: botSecret,
        token: tokenPayload.connectorToken,
        //domain: "",
        webSocket: true
    });
    botConnection.postActivity({type: "event", value: jsonWebToken, from: user, name: "InitAuthenticatedConversation"}).subscribe(function (id) {startChat(user, botConnection)});
}

function startChat(user, botConnection) {
    const botContainer = document.getElementById('botContainer');
    botContainer.classList.add("wc-display");

    BotChat.App({
        botConnection: botConnection,
        user: user,
        locale: 'en',
        resize: 'detect'
        // sendTyping: true,    // defaults to false. set to true to send 'typing' activities to bot (and other users) when user is typing
    }, botContainer);
}