<template>
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
        <div class="container">
            <h1>Cryptonomicon</h1>
            <section>
                <div class="flex">
                    <div class="max-w-xs">
                        <label
                            for="wallet"
                            class="block text-sm font-medium text-gray-700"
                            >Ticker {{ ticker }}</label
                        >
                        <div class="mt-1 relative rounded-md shadow-md">
                            <input
                                id="wallet"
                                v-model="ticker"
                                @keydown.enter="add()"
                                @keydown="checkSymbol($event)"
                                @keyup="searchTickers"
                                @focus="tickerError = ''"
                                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                                name="wallet"
                                placeholder="For Instance: DOGE"
                                type="text"
                            />
                        </div>
                        <!--                        <template v-if="foundTickers.length > 0">-->
                        <div
                            v-if="foundTickers.length > 0"
                            class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
                        >
                            <span
                                v-for="t in foundTickers"
                                :key="t"
                                @click="clickTickerBadge(t)"
                                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                            >
                                {{ t }}
                            </span>
                        </div>
                        <!--                        </template>-->
                        <div v-if="tickerError" class="text-sm text-red-600">
                            {{ tickerError }}
                        </div>
                    </div>
                </div>
                <button
                    @click="add()"
                    type="button"
                    class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    <!-- Heroicon name: solid/mail -->
                    <svg
                        class="-ml-0.5 mr-2 h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="#ffffff"
                    >
                        <path
                            d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                        ></path>
                    </svg>
                    Add
                </button>
                <br />
                Filter: <input v-model="filter" />
                <button
                    v-if="page > 1"
                    @click="page -= 1"
                    class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Back
                </button>
                <button
                    v-if="hasNextPage"
                    @click="page += 1"
                    class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Forward
                </button>
                <div v-if="filteredTickers.length">Page: {{ page }}</div>
                <div v-if="selectedTicker">
                    Selected Ticker: {{ selectedTicker.name }}
                    <hr />
                </div>
            </section>
            <template v-if="tickers.length">
                <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div
                        v-for="t in paginatedTickers"
                        :key="t.name"
                        @click="selectedTicker = t"
                        :class="{
                            'border-4': selectedTicker === t,
                        }"
                        class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
                    >
                        <div class="px-4 py-5 sm:p-6 text-center">
                            <dt
                                class="text-sm font-medium text-gray-500 truncate"
                            >
                                <!--                            WTF - USD-->
                                {{ t.name }} - USD
                            </dt>
                            <dd
                                class="mt-1 text-3xl font-semibold text-gray-900"
                            >
                                {{ t.price }}
                            </dd>
                        </div>
                        <div class="w-full border-t border-gray-200"></div>
                        <button
                            @click.stop="handleDelete(t)"
                            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
                        >
                            <svg
                                class="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="#718096"
                                aria-hidden="true"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clip-rule="evenodd"
                                ></path>
                            </svg>
                            Delete
                        </button>
                    </div>
                </dl>
                <hr class="w-full border-t border-gray-600 my-4" />
            </template>
            <section class="relative" v-if="selectedTicker">
                <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
                    {{ selectedTicker.name }} - USD
                </h3>
                <div
                    class="flex items-end border-gray-600 border-b border-l h-64"
                >
                    <div
                        v-for="(bar, idx) in normalizedGraph"
                        :key="idx"
                        :style="{ height: `${bar}%` }"
                        class="bg-purple-800 border w-10"
                    ></div>
                </div>
                <button
                    type="button"
                    @click="selectedTicker = null"
                    class="absolute top-0 right-0"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        xmlns:svgjs="http://svgjs.com/svgjs"
                        version="1.1"
                        width="30"
                        height="30"
                        x="0"
                        y="0"
                        viewBox="0 0 511.76 511.76"
                        style="enable-background: new 0 0 512 512"
                        xml:space="preserve"
                    >
                        <g>
                            <path
                                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                                fill="#718096"
                                data-original="#000000"
                            ></path>
                        </g>
                    </svg>
                </button>
            </section>
            <Popup
                :is-open="isPopupOpen"
                :title="popupOptions.Title"
                :is-cancel-btn="popupOptions.isCancelBtn"
                :is-confirm-input="popupOptions.isConfirmInput"
                @ok="popupConfirmed"
                @close="isPopupOpen = false"
            >
                <small>{{ popupOptions.Text }}</small>
            </Popup>
        </div>
    </div>
</template>

<!--<script>-->
<!--export default {-->
<!--    name: "App",-->
<!--    data() {-->
<!--        return {-->
<!--            ticker: "default",-->
<!--        };-->
<!--    },-->
<!--};-->
<!--</script>-->

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import Popup from "./components/modal-popup.vue";
import {
    loadTickerList,
    subscribeToTicker,
    unsubscribeFromTicker,
} from "@/api";

let ticker = ref(""),
    filter = ref(""),
    tickers = ref([]),
    selectedTicker = ref(null),
    graph = ref([]),
    foundTickers = ref([]),
    tickerList = {},
    tickerError = ref(""),
    page = ref(1),
    isPopupOpen = ref(false);

// const subcribedIDs = {};

// Getting data from Storages
tickers.value = JSON.parse(localStorage.getItem("crypto-list") || "[]");
// tickers.value.forEach((t) => subscribeToUpdate(t.name));

tickers.value.forEach((t) => {
    // console.log("subscrabed for ", t.name);
    subscribeToTicker(t.name, (newPrice) => {
        updateTicker(t.name, newPrice);
        // console.log("ticker price changed to", newPrice, t.name);
    });
});

const windowData = Object.fromEntries(new URL(window.location).searchParams);
filter.value = windowData.filter || "";
page.value = Number(windowData.page) || 1;

let popupOptions = {
    Title: "new Modal Popup Title",
    Text: "new Modal Popup Text",
};

//Computed methods
/** @type {ComputedRef<number>} */
const startIndex = computed(() => {
    return (page.value - 1) * 6;
});
/** @type {ComputedRef<number>} */
const endIndex = computed(() => {
    return page.value * 6;
});

const filteredTickers = computed(() => {
    return tickers.value.filter((t) =>
        t.name.includes(filter.value.toLocaleUpperCase())
    );
});

const paginatedTickers = computed(() => {
    return filteredTickers.value.slice(startIndex.value, endIndex.value);
});

const hasNextPage = computed(() => {
    return filteredTickers.value.length > endIndex.value;
});

const normalizedGraph = computed(() => {
    const maxValue = Math.max(...graph.value),
        minValue = Math.min(...graph.value);

    if (maxValue === minValue) {
        return graph.value.map(() => 50);
    }
    return graph.value.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
    );
});

const pageStateOptions = computed(() => {
    return {
        filter: filter.value,
        page: page.value,
    };
});

function checkTickerErrors() {
    const isExistsTicker = Object.values(tickerList.value).some(
        (tickerObj) => tickerObj.Symbol === ticker.value.toLocaleUpperCase()
    );
    const isTickerAdded = tickers.value.some(
        (tickerObj) => tickerObj.name === ticker.value.toLocaleUpperCase()
    );
    console.log("isExistsTicker", isExistsTicker);
    if (!isExistsTicker) {
        tickerError.value = "Ticker in not exists";
        return true;
    } else if (isTickerAdded) {
        tickerError.value = "The ticker is already added";
        return true;
    }
    return false;
}

onMounted(() => {
    getTickerList();
});

async function getTickerList() {
    tickerList.value = await loadTickerList();
    console.log("ticker_list:", tickerList.value);
}

function checkSymbol(event) {
    console.log("Event", event);
    if (event.key === "Enter" || event.key === "Backspace") {
        return;
    }
    const validKeys = /^[A-Za-z0-9]$/; // Regular expression for letters and digits

    if (!validKeys.test(event.key)) {
        event.preventDefault();
        return;
    }
}

function searchTickers() {
    if (!ticker.value) {
        return;
    }
    console.log("found ticker value", ticker.value);
    foundTickers.value = [];
    // console.log("found ticker value2", ticker.value);
    const searchQuery = ticker.value.toLowerCase();
    let matchCount = 0;

    console.log("TickerList", tickerList);
    for (let t of Object.values(tickerList.value)) {
        if (matchCount >= 4) {
            break; // Stop the loop if 4 matches are found
        }
        // console.log("t", t);
        if (
            t.Symbol.toLowerCase().includes(searchQuery) ||
            t.FullName.toLowerCase().includes(searchQuery)
        ) {
            foundTickers.value.push(t.Symbol); // Add only the Symbol to the array
            matchCount++;
        }
        console.log("Found Tickers, ", foundTickers.value);
    }
}

function clickTickerBadge(t) {
    ticker.value = t;
    tickerError.value = "";
    add();
}

// function subscribeToUpdate(tickerName) {
//     subcribedIDs[tickerName] = setInterval(async () => {
//         const data = await loadTickerPrice(tickerName);
//         if (data.Response === "Error") {
//             console.log("Response Error:", data.Message);
//             clearInterval(subcribedIDs[tickerName]);
//             return;
//         }
//         let tickerToUpdate = tickers.value.find((t) => t.name === tickerName);
//         if (tickerToUpdate) {
//             tickerToUpdate.price = data.USD;
//             if (selectedTicker.value?.name === tickerName) {
//                 graph.value.push(data.USD);
//                 console.log("Added new GraphBar", data.USD);
//             }
//         } else {
//             console.log("Ticker not found:", tickerName);
//         }
//     }, 3000);
// }
//
function updateTicker(tickerName, price) {
    tickers.value
        .filter((t) => t.name === tickerName)
        .forEach((t) => {
            t.price = price;
        });
}

const add = () => {
    if (checkTickerErrors()) {
        return;
    }

    const currentTicker = {
        name: ticker.value.toLocaleUpperCase(),
        price: "-",
    };

    tickers.value = [...tickers.value, currentTicker];

    console.log("Tickers after Added", tickers.value);
    // subscribeToUpdate(currentTicker.name);
    subscribeToTicker(currentTicker.name, (newPrice) => {
        updateTicker(currentTicker.name, newPrice);
    });
    ticker.value = "";
    foundTickers.value = [];
};

function handleDelete(tickerToRemove) {
    popupOptions = {
        Title: "Delete Ticker!",
        Text:
            "Are you sure for delete the ticker " +
            tickerToRemove.name +
            " - USD ?",
        isCancelBtn: false,
        isConfirmInput: true,
        confirmationText: "I confirmedo"
    };
    isPopupOpen.value = true;
    tickers.value = tickers.value.filter((t) => t !== tickerToRemove);

    // const index = tickers.value.findIndex(
    //     (t) => t.name === tickerToRemove.name
    // );
    //
    // console.log("Clicked for Delete", tickerToRemove, "from", tickers);
    // // alert("Clicked for Delete", tickerToRemove);
    // alert("Deleting:" + tickerToRemove.name);
    // clearInterval(subcribedIDs[tickerToRemove.name]);
    unsubscribeFromTicker(tickerToRemove.name);
    if (selectedTicker.value === tickerToRemove) {
        selectedTicker.value = null;
    }
    // tickers = tickers.filter((t) => t !== tickerToRemove);
}

function popupConfirmed() {
    alert("Confirmed!");
    this.isPopupOpen = false;
}

watch(tickers, () => {
    console.log("NEW TICKERS", tickers.value);
    localStorage.setItem("crypto-list", JSON.stringify(tickers.value));
});

watch(selectedTicker, () => {
    graph.value = [];
});

watch(paginatedTickers, () => {
    if (paginatedTickers.value.length === 0 && page.value > 1) {
        page.value -= 1;
    }
});

watch(filter, () => {
    page.value = 1;
});

watch(pageStateOptions, (value) => {
    window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
    );
});
// ... any other composition logic ...
</script>

<style src="./app.css"></style>
