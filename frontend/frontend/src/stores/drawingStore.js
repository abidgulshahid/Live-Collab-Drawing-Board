import { defineStore } from 'pinia';

export const useDrawingStore = defineStore('drawing', {
    state: () => ({
        lines: [],
    }),
    actions: {
        addLine(line) {
            this.lines.push(line);
        },
        clearLines() {
            this.lines = [];
        },
    },
});