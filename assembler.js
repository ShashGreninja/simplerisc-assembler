const INSTRUCTION_SET = {
    'ADD': '00000','add': '00000',
    'SUB': '00001','sub': '00001',
    'MUL': '00010','mul': '00010',
    'DIV': '00011','div': '00011',
    'MOD': '00100','mod': '00100',
    'CMP': '00101','cmp': '00101',
    'AND': '00110','and': '00110',
    'OR': '00111','or': '00111',
    'NOT': '01000','not': '01000',
    'MOV': '01001','mov': '01001',
    'LSL': '01010','lsl': '01010',
    'LSR': '01011','lsr': '01011',
    'ASR': '01100','asr': '01100',
    'NOP': '01101','nop': '01101',
    'LD': '01110','ld': '01110',
    'ST': '01111','st': '01111',
    'BEQ': '10100','beq': '10100',
    'BGT': '10101','bgt': '10101',
    'B': '10110','b': '10110',
    'CALL': '10111','call': '10111',
    'RET': '11000','ret': '11000'
};

function parseLine(line) {
    // Remove comments and leading/trailing whitespaces
    line = line.replace(/#.*$/, '').trim();
    if (!line) return null;

    let label = null;
    if (line.includes(':')) {
        const parts = line.split(':');
        label = parts[0].trim();
        line = parts[1] ? parts[1].trim() : '';
    }

    if (!line) return [label, null, null];

    const parts = line.split(/\s+/);
    return [label, parts[0], parts.slice(1)];
}

function instructionToMachineCode(command, argumentsList) {
    const opcode = INSTRUCTION_SET[command];
    if (!opcode) throw new Error(`Unknown command: ${command}`);

    let binaryArgs = '';
    for (let arg of argumentsList) {
        arg = String(arg).replace(/,$/, ''); // Ensure arg is a string and remove trailing commas
        if (arg.startsWith('R')) {
            binaryArgs += parseInt(arg.slice(1)).toString(2).padStart(5, '0'); // Convert register (e.g., R1) to binary
        }  
         else {
            binaryArgs += parseInt(arg).toString(2).padStart(5, '0'); // Convert immediate values or label addresses to binary
        }
    }
    return opcode + binaryArgs;
}

export function assemble(script) {
    const machineCode = [];
    const symbolTable = {}; // Symbol table to store label addresses
    const lines = script.split('\n');
    let currentAddress = '0000000000';

    // First Pass: Build the symbol table
    for (let i = 0; i < lines.length; i++) {
        const parsed = parseLine(lines[i]);
        if (parsed) {
            const [label, command] = parsed;
            if (label) { 
                symbolTable[label] = currentAddress; // Store the label and its address
            }
            if (command) {
                currentAddress++; // Increment address only for valid instructions
            }
        }
    }
    // Second Pass: Generate machine code
    for (let i = 0; i < lines.length; i++) {
        const parsed = parseLine(lines[i]);
        if (parsed) {
            const [label, command, argumentsList] = parsed;
            if (command) {
                // Replace label references with addresses
                const resolvedArguments = argumentsList.map(arg => {
                    arg = String(arg).replace(/,$/, ''); // Remove trailing commas
                    if (symbolTable.hasOwnProperty(arg)) {
                        return symbolTable[arg]; // Replace label with its address
                    } else if (arg.startsWith('R') || !isNaN(arg)) {
                        return arg; // Keep registers or immediate values as is
                    } else {
                        throw new Error(`Undefined label: ${arg}`);
                    }
                });
                machineCode.push(instructionToMachineCode(command, resolvedArguments));
            }
        }
    }
    return machineCode.join('\n');
}

// Examples for testing
//console.log(parseLine("LOOP: ADD R1, R2  # A comment"));
// Output: ['LOOP', 'ADD', ['R1,', 'R2']]

//console.log(parseLine("MOV R3, R4"));
// Output: [null, 'MOV', ['R3,', 'R4']]

//console.log(parseLine("JUMP:  # Just a label"));
// Output: ['JUMP', null, null]

//console.log(parseLine("# This is a comment"));
// Output: null

const script1 = `
LOOP: add R1, R2  # A comment
mov R3, R4
JUMP:  # Just a label
# This is a comment
`;

const script2 = `
START:  MOV R1, 1     # Load 1 into R1  
        CMP R1, R2    # Compare R1 and R2  
        BEQ EQUAL     # Jump if equal  
        B  END       # Unconditional jump  
EQUAL:  MOV R0, 1     # Set R0 to 1 if equal  
END:    RET           # End of program
`;

console.log(assemble(script1));
// Expected Output: 
// 0000000000100010
// 001100011000100

// console.log(assemble(script2));
// Expected Output:
// 001100000100001
// 010100000100010
// 011000000000100
// 010110000000101
// 001100000000001
// 101100000000000
