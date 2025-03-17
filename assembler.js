const INSTRUCTION_SET = {
    'ADD': '00000',
    'SUB': '00001',
    'AND': '00010',
    'OR': '00011',
    'XOR': '00100',
    'NOT': '00101',
    'MOV': '00110',
    'LSL': '00111',
    'LSR': '01000',
    'ASR': '01001',
    'CMP': '01010',
    'JMP': '01011',
    'JEQ': '01100',
    'JNE': '01101',
    'LD': '01110',
    'ST': '01111',
    'B': '10100',
    'BL': '10101',
    'RET': '10110',
    'PUSH': '10111',
    'POP': '11000'
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
        arg = arg.replace(/,$/, '');
        if (arg.startsWith('R')) {
            binaryArgs += parseInt(arg.slice(1)).toString(2).padStart(5, '0');
        } else {
            binaryArgs += parseInt(arg).toString(2).padStart(5, '0');
        }
    }
    return opcode + binaryArgs;
}

export function assemble(script) {
    const machineCode = [];
    const lines = script.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const parsed = parseLine(lines[i]);
        if (parsed) {
            const [label, command, argumentsList] = parsed;
            if (command) {
                machineCode.push(instructionToMachineCode(command, argumentsList));
            } else if (label && i + 1 < lines.length) {
                const nextParsed = parseLine(lines[i + 1]);
                if (nextParsed && nextParsed[1]) {
                    const [, nextCommand, nextArguments] = nextParsed;
                    machineCode.push(instructionToMachineCode(nextCommand, nextArguments));
                }
            }
        }
    }

    return machineCode.join('\n');
}

// Examples for testing
console.log(parseLine("LOOP: ADD R1, R2  # A comment"));
// Output: ['LOOP', 'ADD', ['R1,', 'R2']]

console.log(parseLine("MOV R3, R4"));
// Output: [null, 'MOV', ['R3,', 'R4']]

console.log(parseLine("JUMP:  # Just a label"));
// Output: ['JUMP', null, null]

console.log(parseLine("# This is a comment"));
// Output: null

const script1 = `
LOOP: ADD R1, R2  # A comment
MOV R3, R4
JUMP:  # Just a label
# This is a comment
`;

const script2 = `
START:  MOV R1, 1     # Load 1 into R1  
        CMP R1, R2    # Compare R1 and R2  
        JEQ EQUAL     # Jump if equal  
        JMP END       # Unconditional jump  
EQUAL:  MOV R0, 1     # Set R0 to 1 if equal  
END:    RET           # End of program
`;

console.log(assemble(script1));
// Expected Output: 
// 000000000100010
// 00110001100100

console.log(assemble(script2));
// Expected Output:
// 001100000100001
// 010100000100010
// 0110000NaN
// 0101100NaN
// 001100000000001
// 10110
