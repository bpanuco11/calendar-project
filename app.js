// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { ulid } = require('ulid');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); // To handle form data
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up the MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Set up sessions
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Declare a global variable for currentPath
let currentPath = '';

// Middleware to check if the user is authenticated
function checkAuthentication(req, res, next) {
  if (req.session.user_id) {
    // User is authenticated, proceed to the next middleware/route handler
    next();
  } else {
    // User is not authenticated, check the global currentPath variable
    if (currentPath === '/signup') {
      // Redirect to signup page if trying to access /signup
      res.redirect('/signup');
    } else {
      // Redirect to login page if trying to access any other protected route
      res.redirect('/login');
    }
  }
}

// Route for login page
app.get('/login', (req, res) => {
  currentPath = '/login'; // Update the global variable
  res.render('login-page.ejs', { error: null });
  console.log('Login page loaded correctly');
});

// Route for signup page
app.get('/signup', (req, res) => {
  currentPath = '/signup'; // Update the global variable
  res.render('signup-page.ejs', { error: null });
  console.log('Signup page loaded correctly');
});

// Route for calendar page
app.get('/calendar', checkAuthentication, async (req, res) => {
  currentPath = '/calendar'; // Update the global variable
  const userId = req.session.user_id;

  // res.render('calendar-page.ejs', {error: null});
  try {
    // Create a promise-based connection for this route
    const connection = await mysqlPromise.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Query the database for all entries related to this user using async/await
    const [entries] = await connection.execute(
      'SELECT entry_id, entry_date, entry_title, entry_input, entry_label FROM entries WHERE user_id = ?',
      [userId]
    );

    // Close the connection for this route
    await connection.end();
    // console.log(entries);
    // Render the calendar page and pass the retrieved data
    res.render('calendar-page.ejs', { entries });

  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).send('Error loading the calendar');
  }
});

// Handle form submission for login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);

  connection.query(
    'SELECT user_id, password FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.render('login-page.ejs', { error: 'Database error. Please try again.' });
      }

      if (results.length === 0) {
        return res.render('login-page.ejs', { error: 'USERNAME DOES NOT EXIST' });
      }

      const { user_id, password: hashedPassword } = results[0];

      bcrypt.compare(password, hashedPassword, (err, match) => {
        if (err) {
          return res.render('login-page.ejs', { error: 'Login failed. Please try again.' });
        }

        if (match) {
          req.session.user_id = user_id;
          res.redirect('/calendar');
        } else {
          res.render('login-page.ejs', { error: 'PASSWORD INCORRECT' });
        }
      });
    }
  );
});

// Handle form submission for signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  connection.query(
    'SELECT username FROM users WHERE username = ?',
    [username],
    (err, results) => {
      if (err) {
        return res.render('signup-page.ejs', { error: 'Database error. Please try again.' });
      }

      if (results.length > 0) {
        return res.render('signup-page.ejs', { error: 'USERNAME ALREADY TAKEN' });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.render('signup-page.ejs', { error: 'Registration failed. Please try again.' });
        }

        const userId = ulid();

        connection.query(
          'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)',
          [userId, username, hashedPassword],
          (err) => {
            if (err) {
              return res.render('signup-page.ejs', { error: 'Registration failed. Please try again.' });
            }

            req.session.user_id = userId;
            res.redirect('/calendar');
          }
        );
      });
    }
  );
});

// manage save button in calendar page
app.post('/save-entry', (req, res) => {
  console.log('Received POST /save-entry');
  console.log('Request body:', req.body);

  const { title, content, label, date } = req.body;
  const userId = req.session.user_id || 1; // assuming you're using session and logged-in user

  // Validate that all necessary fields are provided
  if (!title || !content || !label || !date) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Insert entry into the database
  const query = `
      INSERT INTO entries (user_id, entry_date, entry_title, entry_input, entry_label)
      VALUES (?, ?, ?, ?, ?)
  `;
  connection.query(query, [userId, date, title, content, label], (err, results) => {
      if (err) {
          console.error('Error saving entry:', err);
          return res.status(500).json({ success: false, message: 'Failed to save entry.' });
      }

      res.json({ success: true });
      //res.redirect('/calendar');
  });
});

app.post('/update-entry', (req, res) => {
  const { entry_id, entry_title, entry_input, entry_label } = req.body;

  // Here, you would use your database logic to update the entry in the 'entries' table
  const sql = `
      UPDATE entries 
      SET entry_title = ?, entry_input = ?, entry_label = ?
      WHERE entry_id = ?
  `;
  
  const values = [entry_title, entry_input, entry_label, entry_id];

  // Assuming you have a database connection pool
  connection.query(sql, values, (error, results) => {
      if (error) {
          console.error('Error updating entry:', error);
          res.status(500).json({ success: false, message: 'Failed to update entry' });
      } else {
          res.json({ success: true, message: 'Entry updated successfully' });
      }
  });
});

app.delete('/delete-entry/:entry_id', (req, res) => {
  const entryId = req.params.entry_id;
  
  if (!entryId) {
      return res.status(400).json({ success: false, message: 'Entry ID is required.' });
  }

  const query = 'DELETE FROM entries WHERE entry_id = ?';
  
  connection.query(query, [entryId], (err, results) => {
      if (err) {
          console.error('Error deleting entry:', err);
          return res.status(500).json({ success: false, message: 'Failed to delete entry.' });
      }
      
      if (results.affectedRows === 0) {
          return res.status(404).json({ success: false, message: 'Entry not found.' });
      }

      res.json({ success: true, message: 'Entry deleted successfully.' });
  });
});

app.get('/update-day', (req, res) => {
  const { date } = req.query;
  const userId = req.session.user_id;

  // Create the MySQL connection
  const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
  });

  // Connect to the database and execute the query
  connection.connect(err => {
      if (err) {
          console.error('Error connecting to the database:', err);
          return res.status(500).json({ message: 'Error connecting to the database' });
      }

      // Query the database for the user's entries on the specific date
      connection.query(
          'SELECT entry_id, entry_date, entry_title, entry_input, entry_label FROM entries WHERE user_id = ? AND entry_date = ?',
          [userId, date],
          (err, results) => {
              if (err) {
                  console.error('Error fetching entries:', err);
                  return res.status(500).json({ message: 'Error fetching entries' });
              }

              // Return the entries as a JSON response
              res.json({ entries: results });
          }
      );

      // Close the connection after the query
      connection.end(err => {
          if (err) {
              console.error('Error closing the database connection:', err);
          }
      });
  });
});

app.get('/entries', (req, res) => {
  const userId = req.session.user_id;

  // Connect to the database and fetch entries
  const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
  });

  connection.query(
      'SELECT entry_id, entry_date, entry_title, entry_input, entry_label FROM entries WHERE user_id = ?',
      [userId],
      (err, results) => {
          if (err) {
              console.error('Error fetching entries:', err);
              return res.status(500).json({ message: 'Error fetching entries' });
          }

          // Return the entries as JSON
          res.json({ entries: results });
      }
  );

  // Close the connection after the query
  connection.end(err => {
      if (err) {
          console.error('Error closing the database connection:', err);
      }
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});