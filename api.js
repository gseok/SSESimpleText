const axios = require("axios");
const EventSource = require("eventsource");
const subscriptionType = "LOCATIONIDS";
const subscriptionFilter = ["ALL"];

function startStream(accessToken) {
    return axios({
        method: "POST",
        url: `https://apis.smartthingsgdev.com/client/subscription`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        data: [{
            type: subscriptionType,
            value: subscriptionFilter
        }]
    })
    .then(function(resp) {
        console.log("Response from creating subscription:");  
        console.log("Success subscription URL > ", resp.data.registrationUrl);
        return resp.data.registrationUrl;
    })
    .catch(function(err) {
        console.error(`Error: ${err}`);
    });
}

function activateStream(url, accessToken, writeFn) {
    const events = [
        "CONTROL_EVENT",
        "DEVICE_EVENT",
        "DEVICE_LIFECYCLE_EVENT",
        "DEVICE_JOIN_EVENT",
        "MODE_EVENT",
        "SMART_APP_EVENT",
        "SECURITY_ARM_STATE_EVENT",
        "SECURITY_ARM_FAILURE_EVENT",
        "HUB_HEALTH_EVENT",
        "DEVICE_HEALTH_EVENT",
        "LOCATION_LIFECYCLE_EVENT",
        "INSTALLED_APP_LIFECYCLE_EVENT",
        "PAID_SUBSCRIPTIONS_EVENT",
        "HUB_LIFECYCLE_EVENT",
        "EXECUTION_RESULT_EVENT",
        "HUB_ZWAVE_STATUS",
        "HUB_ZWAVE_EXCEPTION",
        "HUB_ZWAVE_S2_AUTH_REQUEST",
        "HUB_ZWAVE_SECURE_JOIN_RESULT"
    ];
    var source = new EventSource(url, {"headers": {
        Authorization: `Bearer: ${accessToken}`
    }});

    events.forEach(function(eventName) {
        source.addEventListener(eventName, function(evt) {
            let data = evt.data;
            try {
                data = JSON.parse(data);
                console.log(`${eventName}:`);
            } catch(e) {} 
        });
    });

    source.addEventListener("open", function() {
        console.log("Success !!!! SSE connection..!!!!!");
        writeFn("Success !!!! SSE connection..!!!!!")
    });

    source.addEventListener("message", function(event) {
        console.log(`message > ${event.data}`);
        writeFn(event.data);
    });

    // TODO does this catch unauthorized error (subscription TTL is 60 minutes)
    source.addEventListener("error", function(event) {
        if (event.readyState == EventSource.CLOSED) {
            console.error("Connection was closed!", event);
        } else {
            console.error("An unknown error occurred: ", event);
        }
    }, false);
}

function writeMessage(message) {
    const messageArea = document.getElementById('message');
    const newMessage = document.createElement('div');
    newMessage.textContent = message;

    messageArea.appendChild(newMessage);
}

document.addEventListener('DOMContentLoaded', () => {
    const accessTokenInputEl = document.getElementById('access-token-box');
    let accessToken = '';
    let url = '';

    accessTokenInputEl.addEventListener('input', () => {
        accessToken = accessTokenInputEl.value;
    });

    const getURLButton = document.getElementById('getURLBt');
    getURLButton.addEventListener('click', () => {
        startStream(accessToken).then((subscriptionURL) => {
            url = subscriptionURL;

            const textEl = document.getElementById('urltext');
            textEl.textContent = `curl -X GET -H "Authorization: Bearer ${accessToken}" "${url}"`;
        });
    });

    const connectURLButton = document.getElementById('connectURLBt');
    connectURLButton.addEventListener('click', () => {
        activateStream(url, accessToken, writeMessage);
    })
});
