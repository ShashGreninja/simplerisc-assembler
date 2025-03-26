const INSTRUCTION_SET = {
    'ADD': '00000', // RR-type
    'SUB': '00001', // RR-type
    'MUL': '00010', // RR-type
    'DIV': '00011', // RR-type
    'MOD': '00100', // RR-type
    'CMP': '00101',  // RR-type
    'AND': '00110', // RR-type
    'OR': '00111', // RR-type
    'NOT': '01000',  // RR-type
    'MOV': '01001',  // RR-type
    'LSL': '01010', // RR-type
    'LSR': '01011', // RR-type
    'ASR': '01100', // RR-type
    'NOP': '01101', // Special
    'LD': '01110', // RI-type
    'ST': '01111' , // RI-type
    'BEQ': '10000', // B-type
    'BGT': '10001', // B-type
    'B': '10010', // B-type
    'CALL': '10011', // B-type
    'RET': '10100', // Special
    'add': '00000', // RR-type
    'sub': '00001', // RR-type
    'mul': '00010', // RR-type
    'div': '00011', // RR-type
    'mod': '00100', // RR-type
    'cmp': '00101',  // RR-type
    'and': '00110', // RR-type
    'or': '00111', // RR-type
    'not': '01000',  // RR-type
    'mov': '01001',  // RR-type
    'lsl': '01010', // RR-type
    'lsr': '01011', // RR-type
    'asr': '01100', // RR-type
    'nop': '01101', // Special
    'ld': '01110', // RI-type
    'st': '01111' , // RI-type
    'beq': '10000', // B-type
    'bgt': '10001', // B-type
    'b': '10010', // B-type
    'call': '10011', // B-type
    'ret': '10100', // Special
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

function instructionToMachineCode(command, argumentsList, currentAddress, symbolTable) {
    const opcode = INSTRUCTION_SET[command];
    if (!opcode) throw new Error(`Unknown command: ${command}`);

    let binaryInstruction = opcode; // Start with the opcode

    if (['ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'LSL', 'LSR', 'ASR','add', 'sub', 'mul', 'div', 'mod', 'lsl', 'lsr', 'asr'].includes(command)) {
        // Register Instructions: Opcode (5 bits) + I (1 bit) + rd (5 bits) + rs1 (5 bits) + rs2 (5 bits) + Unused (11 bits)
        const [rd, rs1, rs2] = argumentsList;
        if(rs2.startsWith('R')||rs2.startsWith('r')){
            binaryInstruction += '0' + parseRegister(rd) + parseRegister(rs1) + parseRegister(rs2) + '0'.repeat(11);
        }
        else{
            binaryInstruction += '1' + parseRegister(rd) + parseRegister(rs1) + parseImmediate(rs2, 16);
        }

    } else if (['CMP', 'AND', 'OR', 'NOT', 'MOV', 'LD', 'ST','cmp', 'and', 'or', 'not', 'mov', 'ld', 'st'].includes(command)) {
        // Immediate Instructions: Opcode (5 bits) + I (1 bit) + rd (5 bits) + rs1 (5 bits)/ + imm (16 bits)
        const [rd, rs1OrImm] = argumentsList;
        if (rs1OrImm.startsWith('R')||rs1OrImm.startsWith('r')) {
            // If the second argument is a register
            binaryInstruction += '0' + parseRegister(rd) + parseRegister(rs1OrImm) + '0'.repeat(16);
        } else {
            // If the second argument is an immediate value
            binaryInstruction += '1' + parseRegister(rd) + '0'.repeat(5) + parseImmediate(rs1OrImm, 16);
        }
    } else if (['BEQ', 'BGT', 'B', 'CALL','beq', 'bgt', 'b', 'call'].includes(command)) {
        // Branch Instructions: Opcode (6 bits) + Offset (26 bits)
        const [label] = argumentsList;
        const offset = calculateOffset(label, currentAddress, symbolTable);
        binaryInstruction += parseImmediate(offset, 27);
    } else if (['NOP','RET','nop','ret'].includes(command)) {
        // Special: 
        binaryInstruction += '0'.repeat(27);
    } else {
        throw new Error(`Unsupported command: ${command}`);
    }

    return binaryInstruction;
}

function parseRegister(register) {
    if (!(register.startsWith('R')||register.startsWith('r'))) throw new Error(`Invalid register: ${register}`);
    const regNum = parseInt(register.slice(1));
    if (isNaN(regNum) || regNum < 0 || regNum > 31) throw new Error(`Invalid register number: ${register}`);
    return regNum.toString(2).padStart(5, '0'); // Convert to 5-bit binary
}

function parseImmediate(value, bitWidth) {
    let num = parseInt(value);
    if (isNaN(num)) throw new Error(`Invalid immediate value: ${value}`);
    if (num < 0) {
        // Handle negative numbers using two's complement
        num = (1 << bitWidth) + num;
    }
    return num.toString(2).padStart(bitWidth, '0'); // Convert to binary with padding
}

function calculateOffset(label, currentAddress, symbolTable) {
    if (!symbolTable.hasOwnProperty(label)) throw new Error(`Undefined label: ${label}`);
    const labelAddress = symbolTable[label];
    return labelAddress - (currentAddress + 1); // Offset = label_address - (current_address + 1)
}

export function assemble(script) {
    const machineCode = [];
    const symbolTable = {}; // Symbol table to store label addresses
    const lines = script.split('\n');
    let currentAddress = 0;

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
    currentAddress = 0;
    for (let i = 0; i < lines.length; i++) {
        const parsed = parseLine(lines[i]);
        if (parsed) {
            const [, command, argumentsList] = parsed;
            if (command) {
                const binaryInstruction = instructionToMachineCode(command, argumentsList, currentAddress, symbolTable);
                machineCode.push(binaryInstruction);
                currentAddress++;
            }
        }
    }

    return machineCode.join('\n');
}

// Example Script for SimpleRISC
const script = `
START:  MOV R1, 5        # Load 5 into R1
        mov R2, 7        # Load 7 into R2
        ADD R3, R1, R2   # R3 = R1 + R2 (5 + 7 = 12)
        NOP              # End of program

`;

console.log(assemble(script));
