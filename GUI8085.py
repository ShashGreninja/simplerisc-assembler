import tkinter as tk
from tkinter import filedialog, messagebox

# Import your assembler function here
from assembler8085 import assemble_code  # Update with actual function and file name

def convert_to_machine_code():
    input_text = input_textbox.get("1.0", tk.END).strip()
    if not input_text:
        messagebox.showwarning("Input Error", "Please enter some assembly code.")
        return
    try:
        machine_code = assemble_code(input_text)
        output_textbox.delete("1.0", tk.END)
        output_textbox.insert(tk.END, machine_code)
    except Exception as e:
        messagebox.showerror("Conversion Error", str(e))

def open_file():
    filepath = filedialog.askopenfilename()
    if filepath:
        with open(filepath, "r") as file:
            content = file.read()
            input_textbox.delete("1.0", tk.END)
            input_textbox.insert(tk.END, content)

def save_file():
    filepath = filedialog.asksaveasfilename(defaultextension=".txt")
    if filepath:
        with open(filepath, "w") as file:
            file.write(output_textbox.get("1.0", tk.END))

def clear_text():
    input_textbox.delete("1.0", tk.END)
    output_textbox.delete("1.0", tk.END)

# GUI Setup
root = tk.Tk()
root.title("Assembler to Machine Code Converter")
root.geometry("600x400")

# Input Area
input_label = tk.Label(root, text="Assembly Code:")
input_label.pack()
input_textbox = tk.Text(root, height=10)
input_textbox.pack(fill=tk.BOTH, padx=10, pady=5)

# Convert Button
convert_button = tk.Button(root, text="Convert", command=convert_to_machine_code)
convert_button.pack(pady=5)

# Output Area
output_label = tk.Label(root, text="Machine Code:")
output_label.pack()
output_textbox = tk.Text(root, height=10)
output_textbox.pack(fill=tk.BOTH, padx=10, pady=5)

# File Options
button_frame = tk.Frame(root)
button_frame.pack(pady=5)

open_button = tk.Button(button_frame, text="Open File", command=open_file)
open_button.pack(side=tk.LEFT, padx=5)

save_button = tk.Button(button_frame, text="Save Output", command=save_file)
save_button.pack(side=tk.LEFT, padx=5)

clear_button = tk.Button(button_frame, text="Clear", command=clear_text)
clear_button.pack(side=tk.LEFT, padx=5)

root.mainloop()
