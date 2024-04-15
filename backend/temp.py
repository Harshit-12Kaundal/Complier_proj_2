# Open the test case file for reading
with open('testcase.txt', 'r') as f:
    # Read each line from the file
    for line in f:
        # Strip newline characters and split the line into input values
        inputs = line.strip().split()
        
        # Process the inputs (assuming two integer inputs in this example)
        if len(inputs) == 2:
            # Assuming the inputs are integers, convert them
            a = int(inputs[0])
            b = int(inputs[1])
            
            # Perform operations with the inputs
            print("You entered", a, "and", b)
        else:
            # Handle incorrect input format
            print("Invalid input format:", inputs)
