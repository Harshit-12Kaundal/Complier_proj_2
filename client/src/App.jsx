import React, { useState } from 'react';
import axios from 'axios';
import AceEditor from 'react-ace'; // Import AceEditor
import 'ace-builds/src-noconflict/mode-text'; // Import mode for plain text
import 'ace-builds/src-noconflict/theme-dracula'; // Import Dracula theme

const App = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [testCasesFile, setTestCasesFile] = useState(null); // Store the file object
  console.log(code);
  console.log(language);
  console.log(testCasesFile);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('code', code);
      formData.append('language', language);
      formData.append('testCasesFile', testCasesFile);

      const response = await axios.post('http://localhost:5001/compile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response && response.data) {
        console.log(response.data);
      } else {
        console.error('Error: Response data is undefined');
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Code Compiler</h1>
      <form onSubmit={handleSubmit} className="space-y-4" >
        <div>
          <label htmlFor="code" className="block mb-2">Code:</label>
          <AceEditor
            mode="text" // Set mode to plain text
            theme="dracula" // Set theme to Dracula
            value={code}
            onChange={(newValue) => setCode(newValue)} // Update code state on change
            height="200px"
            width="100%"
            className="w-full border border-gray-300 rounded p-2" // Apply custom styles
          />
        </div>
        <div>
          <label htmlFor="language" className="block mb-2">Language:</label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border border-gray-300 rounded p-2">
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>
        </div>
        <div>
          <label htmlFor="testCasesFile" className="block mb-2">Test Cases File:</label>
          <input name="testCasesFile" type="file" id="testCasesFile" onChange={(e) => setTestCasesFile(e.target.files[0])} className="w-full border border-gray-300 rounded p-2" />
        </div>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Submit</button>
      </form>
    </div>
  );
};

export default App;
