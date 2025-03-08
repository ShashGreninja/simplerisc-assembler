import re
# used for working with regular expressions

INSTRUCTION_SET = {
    'ADD': '00000',
    'SUB': '00001',
    'LD': '01110',
    'ST': '01111',
    'B': '10100',
    # Add more instructions as needed
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

#Examples : 
print(parse_line("LOOP: ADD R1, R2  # A comment"))
# Output: ('LOOP', 'ADD', ['R1,', 'R2'])

print(parse_line("MOVE R3, R4"))
# Output: (None, 'MOVE', ['R3,', 'R4'])

print(parse_line("JUMP:  # Just a label"))
# Output: ('JUMP', None, None)

print(parse_line("# This is a comment"))
# Output: None
 