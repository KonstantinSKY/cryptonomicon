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
