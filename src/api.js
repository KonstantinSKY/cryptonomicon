import { fetchGet, WS } from "@/fetcher"; // Adjust the path to where your api.js is located
import { cryptocompare } from "../security.js";

const tickerHandlers = new Map();

const socket = new WS({
    url: "wss://streamer.cryptocompare.com/v2",
    params: {
        api_key: cryptocompare.key,
    },
});
const AGGREGATE_INDEX = "5";

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
        // console.log("rawData", rawData);
        const updatedPrices = Object.fromEntries(
            Object.entries(rawData).map(([key, value]) => [key, value.USD])
        );
        // console.log("updatedPrices", updatedPrices);
        Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
            const handlers = tickerHandlers.get(currency) ?? [];
            handlers.forEach((fn) => fn(newPrice));
        });
    });
}

socket.addEventListener("message", (e) => {
    const {
        TYPE: type,
        FROMSYMBOL: currency,
        PRICE: newPrice,
    } = JSON.parse(e.data);
    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return;
    }

    const handlers = tickerHandlers.get(currency) ?? [];
    handlers.forEach((fn) => fn(newPrice));
});

function subscribeToTickerOnWs(ticker) {
    socket.sendToWS({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`],
    });
}

function unsubscribeFromTickerOnWs(ticker) {
    socket.sendToWS({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`],
    });
}

export function subscribeToTicker(ticker, callback) {
    // if (!tickers.has(ticker)) {
    //     tickers.set(ticker, []);
    // }
    const subscribers = tickerHandlers.get(ticker) || [];
    tickerHandlers.set(ticker, [...subscribers, callback]);
    subscribeToTickerOnWs(ticker);
}
export function unsubscribeFromTicker(ticker) {
    tickerHandlers.delete(ticker);
    unsubscribeFromTickerOnWs(ticker);
    // const subscribers = tickerHandlers.get(ticker) || [];
    // tickerHandlers.set(
    //     ticker,
    //     subscribers.filter((fn) => fn !== callback)
    // );
}

// setInterval(loadTickers, 3000);
window.tickers = tickerHandlers;
