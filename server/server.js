const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());
// Define the POST route to receive the data
app.post('/api/tension', (req, res) => {
  const { thickness, frequency } = req.body;

  // Log the received data
  console.log('Received Data:', { thickness, frequency });

  // Respond with a success message
  res.json({ message: 'Data received successfully', data: { thickness, frequency } });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
