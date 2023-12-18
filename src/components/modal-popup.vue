<script setup>
import {
    onMounted,
    onBeforeUnmount,
    defineProps,
    defineEmits,
    ref,
    computed,
} from "vue";

let confirmation = ref("");

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: "Modal Title",
    },
    isOkBtn: {
        type: Boolean,
        default: true,
    },
    isCancelBtn: {
        type: Boolean,
        default: false,
    },
    isConfirmInput: {
        type: Boolean,
        default: false,
    },
    confirmationText: {
        type: String,
        default: "I CONFIRMED",
    },
});

const emit = defineEmits({
    ok: null,
    close: null,
});

const isConfirmationCorrect = computed(() => {
    return confirmation.value === props.confirmationText;
});

onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeydown);
});

function handleKeydown(e) {
    if (props.isOpen && e.key === "Escape") {
        close();
    }
}

function close() {
    emit("close");
}

function confirm() {
    emit("ok");
}
</script>

<template>
    <div v-if="isOpen" class="backdrop" @click="close">
        <div class="popup" @click.stop>
            <h1>{{ title }}</h1>
            <hr />
            <slot></slot>
            <hr />
            <div class="footer">
                <slot name="actions" :close="close" :confirm="confirm">
                    <input
                        v-if="isConfirmInput"
                        :placeholder="confirmationText"
                        v-model="confirmation"
                    />
                    <button
                        v-if="isCancelBtn"
                        @click="close"
                        type="button"
                        class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    &nbsp;
                    <button
                        v-if="isOkBtn"
                        @click="confirm"
                        :disabled="!isConfirmationCorrect"
                        type="button"
                        class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Ok
                    </button>
                </slot>
            </div>
        </div>
    </div>
</template>

<style scoped>
.popup {
    top: 50px;
    padding: 20px;
    left: 50%;
    transform: translateX(-50%);
    position: fixed;
    z-index: 101;
    background-color: white;
    border-radius: 10px;
}

.popup h1 {
    text-align: center;
    margin: 0;
}

.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 100;
}

.footer {
    text-align: center;
}
</style>
