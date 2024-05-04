const bookingForm = document.getElementById('bookingForm');
const calendar = document.getElementById('calendar');

// Function to fetch and display bookings
async function fetchBookings() {
    try {
        const response = await fetch('/bookings');
        const bookings = await response.json();
        renderCalendar(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
}


function renderCalendar(bookings) {
    calendar.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    let dateCounter = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            if ((i === 0 && j < firstDayOfMonth) || dateCounter > daysInMonth) {
                cell.textContent = '';
            } else {
                cell.textContent = dateCounter;
                const bookingsForDate = bookings.filter(booking => {
                    const bookingDate = new Date(booking.date);
                    return bookingDate.getDate() === dateCounter && bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
                });
                if (bookingsForDate.length > 0) {
                    bookingsForDate.forEach(booking => {
                        const li = document.createElement('li');
                        const startTime = new Date(`2000-01-01T${booking.start_time}`);
                        const endTime = new Date(`2000-01-01T${booking.end_time}`);
                        const startTime24h = startTime.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit', hour12: false });
                        const endTime24h = endTime.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit', hour12: false });
                        li.textContent = `${booking.user}: ${startTime24h} - ${endTime24h}`;
                        cell.appendChild(li);
                    });
                }
                dateCounter++;
            }
            row.appendChild(cell);
        }
        table.appendChild(row);
        if (dateCounter > daysInMonth) {
            break;
        }
    }
    calendar.appendChild(table);
}


bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const selectElement = document.getElementById('user');
    const selectedIndex = selectElement.selectedIndex;
    if (selectedIndex !== -1) {
        const user = selectElement.options[selectedIndex].value;
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const response = await fetch('/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, date, start_time: startTime, end_time: endTime }),
        });
        if (response.ok) {
            alert('Booking successful!');
            fetchBookings();
        } else {
            const errorMessage = await response.text();
            alert(errorMessage);
        }
    } else {
        alert('Please select a user.');
    }
});





fetchBookings();