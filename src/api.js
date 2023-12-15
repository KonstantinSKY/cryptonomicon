import { fetchGet } from "@/fetcher"; // Adjust the path to where your api.js is located
import { cryptocompare } from "../security.js";

const tickerHandlers = new Map();

export function loadTickerList() {
    const endpointParams = {
        url: "https://min-api.cryptocompare.com/data/all/coinlist",
        params: {
            summary: true,
            api_key: cryptocompare.key,
        },
    };

    return fetchGet(endpointParams).then((data) => {
        if (data && data.Data) {
            return data.Data;
        } else {
            throw new Error("Data is not Exist");
        }
    });
}

export function loadTickerPrice(tickerName) {
    const endpointParams = {
        url: "https://min-api.cryptocompare.com/data/price",
        params: {
            fsym: tickerName,
            tsyms: "USD",
            api_key: cryptocompare.key,
        },
    };

    return fetchGet(endpointParams).then((data) => {
        if (data && data) {
            return data;
        } else {
            throw new Error("Data is not Exist");
        }
    });
}

export function loadTickers() {
    if (tickerHandlers.size === 0) {
        return;
    }
    const endpointParams = {
        url: "https://min-api.cryptocompare.com/data/pricemulti",
        params: {
            fsyms: [...tickerHandlers.keys()].join(","),
            tsyms: "USD",
            api_key: cryptocompare.key,
        },
    };

    return fetchGet(endpointParams).then((rawData) => {
        console.log("rawData", rawData);
        const updatedPrices = Object.fromEntries(
            Object.entries(rawData).map(([key, value]) => [key, value.USD])
        );
        console.log("updatedPrices", updatedPrices);
        Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
            const handlers = tickerHandlers.get(currency) ?? [];
            handlers.forEach((fn) => fn(newPrice));
        });
    });
}

export function subscribeToTicker(ticker, callback) {
    // if (!tickers.has(ticker)) {
    //     tickers.set(ticker, []);
    // }
    const subscribers = tickerHandlers.get(ticker) || [];
    tickerHandlers.set(ticker, [...subscribers, callback]);
}
export function unsubscribeFromTicker(ticker) {
    tickerHandlers.delete(ticker);

    // const subscribers = tickerHandlers.get(ticker) || [];
    // tickerHandlers.set(
    //     ticker,
    //     subscribers.filter((fn) => fn !== callback)
    // );
}
setInterval(loadTickers, 3000);
window.tickers = tickerHandlers;
