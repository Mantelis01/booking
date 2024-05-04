const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

let db = new sqlite3.Database('bookings.db');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, user TEXT, date TEXT, start_time TEXT, end_time TEXT)");
});

app.post('/bookings', (req, res) => {
    const { user, date, start_time, end_time } = req.body;
    // Check if the time period is already booked for the specified date
    db.get('SELECT COUNT(*) as count FROM bookings WHERE date = ? AND ((start_time >= ? AND start_time < ?) OR (end_time > ? AND end_time <= ?))',
        [date, start_time, end_time, start_time, end_time], (err, row) => {
            if (err) {
                console.error('Error checking availability:', err);
                res.status(500).send("Error checking availability.");
            } else {
                if (row.count > 0) {
                    res.status(400).send("Selected time slot is already booked.");
                } else {
                    db.run(`INSERT INTO bookings (user, date, start_time, end_time) VALUES (?, ?, ?, ?)`,
                        [user, date, start_time, end_time], (err) => {
                            if (err) {
                                console.error('Error booking the studio:', err);
                                res.status(500).send("Error booking the studio.");
                            } else {
                                console.log('Booking successful:', { user, date, start_time, end_time });
                                res.status(200).send("Booking successful!");
                            }
                        });
                }
            }
        });
});




app.get('/bookings', (req, res) => {
    db.all("SELECT * FROM bookings", (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).send("Error fetching bookings.");
        } else {
            const bookings = rows.map(row => ({ user: row.user, date: row.date, start_time: row.start_time, end_time: row.end_time }));
            res.status(200).json(bookings);
        }
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});