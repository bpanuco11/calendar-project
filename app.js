const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); // To handle form data

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',   // Replace with your MySQL username
  password: 'bp880427',   // Replace with your MySQL password
  database: 'user_auth'
});

// Route for login page
app.get('/login', (req, res) => {
  res.render('login-page.ejs', { error: null });
  console.log('login loaded correctly');
});

// Route for signup page
app.get('/signup', (req, res) => {
  res.render('signup-page.ejs', { error: null });
  console.log('Signup page loaded correctly');
});


// Handle form submission
app.post('/login', (req, res) => {
  console.log('Login form submitted');  // Add this line to see if the request is hitting the route

  const { username, password } = req.body;
  console.log('Username:', username);  // Log the received username
  console.log('Password:', password);  // Log the received password

  // Query the database to find the user
  connection.query(
    'SELECT password FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.render('login-page.ejs', { error: 'Database error. Please try again.' });
      }

      console.log('Database query results:', results);  // Log the query results

      if (results.length === 0) {
        // Username does not exist
        return res.render('login-page.ejs', { error: 'Username does not exist.' });
      }

      const hashedPassword = results[0].password;
      console.log('Hashed Password:', hashedPassword);  // Log the hashed password from the database

      // Compare the password with the hashed password
      bcrypt.compare(password, hashedPassword, (err, match) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.render('login-page.ejs', { error: 'Login failed. Please try again.' });
        }

        if (match) {
          // Passwords match, log in successful
          res.send('Login successful!');
          console.log('Login successful!');  // Log successful login
        } else {
          // Passwords do not match
          res.render('login-page.ejs', { error: 'Password does not match.' });
          console.log('Password does not match');  // Log failed login
        }
      });
    }
  );
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
