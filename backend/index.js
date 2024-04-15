const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const dotenv = require('dotenv');


dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:3000'
}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.json({ "success": true });
});

app.post('/compile', upload.single('testCasesFile'), async (req, res) => {
    const { code, language } = req.body;

    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'Test cases file is missing' });
    }
    let codeFile;
    fs.readFile(req.file.path, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading test cases file: ${err.message}`);
            return res.status(500).json({ error: 'Internal server error', message: err.message });
        }

        try {
            const testCases = JSON.parse(data);
            const results = [];

            // Loop through each test case
            let completedTests = 0;
            testCases.forEach(testCase => {
                const input = testCase.input;
                const expectedOutput = testCase.output;

                // Write code to a temporary file
                codeFile = `temp.${language}`;
                fs.writeFile(codeFile, code, (err) => {
                    if (err) {
                        console.error(`Error writing code to file: ${err.message}`);
                        results.push({ input, output: 'Execution error', isCorrect: false });
                        completedTests++;
                        checkCompleted();
                        return;
                    }

                    // Execute the user-provided code with the input
                    const execCommand = language === 'cpp' 
                    ? `g++ -o temp.cpp.out ${codeFile} && ./temp.cpp.out`
                    : `python -c "${code.replace(/"/g, '\\"')}"`;
                
                exec(`echo "${input}" | ${execCommand}`, (error, stdout, stderr) => {
                    completedTests++;
                    if (error) {
                        console.error(`Execution error: ${error.message}`);
                        results.push({ input, output: 'Execution error', isCorrect: false });
                    } else if (stderr) {
                        console.error(`Execution stderr: ${stderr}`);
                        results.push({ input, output: 'Execution error', isCorrect: false });
                    } else {
                        // Trim whitespace from the output
                        const actualOutput = stdout.trim();
                        console.log(actualOutput);
                        // Compare the actual output with the expected output
                        const isCorrect = actualOutput === expectedOutput;
                        // Push the result to the results array
                        results.push({ input, actualOutput, expectedOutput, isCorrect });
                    }
                
                    // Check if all tests are completed
                    checkCompleted();
                });
                
                });
            });

            // Function to check if all tests are completed
            function checkCompleted() {
                if (completedTests === testCases.length) {
                    // Delete the temporary code file
                    fs.unlink(codeFile, (err) => {
                        if (err) {
                            console.error(`Error deleting code file: ${err.message}`);
                        }
                    });
                    // Send the results back to the client
                    // console.log(results);
                    res.json({results});
                }
            }
        } catch (parseError) {
            console.error(`Error parsing test cases JSON: ${parseError.message}`);
            res.status(500).json({ error: 'Internal server error', message: parseError.message });
        }
    });
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
