export function fetchGet(endpointParams) {
    const url = new URL(endpointParams.url);
    const params = new URLSearchParams(endpointParams.params);

    url.search = params.toString();
    return fetch(url.toString())
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // Assuming the response is JSON
        })
        .catch((error) => {
            // Handle any errors
            console.error(
                "There was a problem with the fetch operation:",
                error
            );
        });
}

export class WS extends WebSocket {
    constructor(endpointParams, protocols) {
        const url = new URL(endpointParams.url);
        const params = new URLSearchParams(endpointParams.params);
        url.search = params.toString();
        super(url.toString(), protocols);

        this.onopen = (event) => {
            console.log("WebSocket connection opened:", event);
            // Additional logic for when the WebSocket connection opens
        };

        // this.onmessage = (event) => {...
        //     // console.log("Message received from server:", event.data);
        //     // Additional logic for handling incoming messages
        // };
        //
        this.onerror = (event) => {
            console.error("WebSocket error:", event);
            // Additional error handling logic
        };

        this.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
            // Additional logic for when the WebSocket connection closes
        };
    }

    sendToWS(message) {
        const stringifiedMessage = JSON.stringify(message);

        if (this.readyState === WebSocket.OPEN) {
            this.send(stringifiedMessage);
            return;
        }

        this.addEventListener(
            "open",
            () => {
                this.send(stringifiedMessage);
            },
            { once: true }
        );
    }
}
