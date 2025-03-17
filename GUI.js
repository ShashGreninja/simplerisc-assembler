import { assemble } from './assembler.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputTextarea = document.getElementById('inputArea');
    const outputTextarea = document.getElementById('outputArea');

    document.getElementById('convertButton').addEventListener('click', () => {
        const inputText = inputTextarea.value.trim();
        if (!inputText) {
            alert('Please enter some assembly code.');
            return;
        }
        try {
            const machineCode = assemble(inputText);
            outputTextarea.value = machineCode;
        } catch (error) {
            alert(`Conversion Error: ${error.message}`);
        }
    });

    document.getElementById('openFile').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                inputTextarea.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    document.getElementById('saveButton').addEventListener('click', () => {
        const blob = new Blob([outputTextarea.value], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'machine_code.txt';
        a.click();
    });

    document.getElementById('clearButton').addEventListener('click', () => {
        inputTextarea.value = '';
        outputTextarea.value = '';
        document.getElementById('openFile').value = '';
    });
});
