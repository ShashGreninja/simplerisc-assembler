import re  # used for working with regular expressions

INSTRUCTION_SET = {
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
}

def parse_line(line):
    # Remove comments and leading and trailing whitespaces
    line = re.sub(r'#.*', '', line).strip()
    if not line:
        return None
     # Check if the line starts with a label
    label = None
    if ':' in line:  
        parts = line.split(':', 1)  # Split at the first ':'
        label = parts[0].strip()  # Extract the label
        line = parts[1].strip() if len(parts) > 1 else ""  # Get the remaining instruction

    # If there's no instruction after the label, return only the label
    if not line:
        return (label, None, None)

    # Split remaining part into command and arguments
    parts = line.split()
    return (label, parts[0], parts[1:])  # (Label, Command, Arguments)

def instruction_to_machine_code(command, arguments):
    opcode = INSTRUCTION_SET.get(command)
    if not opcode:
        raise ValueError(f"Unknown command: {command}")
    
    # Convert arguments to binary (this is a simplified example)
    binary_args = ''
    for arg in arguments:
        arg = arg.rstrip(',')  # Remove trailing commas if any
        if arg.startswith('R'):
            binary_args += format(int(arg[1:]), '05b')
        else:
            # Handle other types of arguments if needed
            binary_args += format(int(arg), '05b')
    
    return opcode + binary_args

def assemble(script):
    machine_code = []
    for line in script.splitlines():
        parsed = parse_line(line)
        if parsed:
            label, command, arguments = parsed
            if command:
                machine_code.append(instruction_to_machine_code(command, arguments))
    return '\n'.join(machine_code)

#Examples : 
print(parse_line("LOOP: ADD R1, R2  # A comment"))
# Output: ('LOOP', 'ADD', ['R1,', 'R2'])

print(parse_line("MOV R3, R4"))
# Output: (None, 'MOVE', ['R3,', 'R4'])

print(parse_line("JUMP:  # Just a label"))
# Output: ('JUMP', None, None)

print(parse_line("# This is a comment"))
# Output: None

# Example usage
script = """
LOOP: ADD R1, R2  # A comment
MOV R3, R4
JUMP:  # Just a label
# This is a comment
"""

print(assemble(script))
# Output: 
# 000000000100010
# 000000000110100
