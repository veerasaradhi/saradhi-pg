// Initialize Data (if not exists)
if (!localStorage.getItem('pgData')) {
    const initialData = {
        tenants: [],
        bookings: [],
        rooms: [
            { id: "101", status: "available" },
            { id: "102", status: "available" },
            { id: "103", status: "available" },
            { id: "104", status: "available" },
            { id: "105", status: "available" },
            { id: "106", status: "available" },
            { id: "201", status: "available" },
            { id: "202", status: "available" },
            { id: "203", status: "available" },
            { id: "204", status: "available" },
            { id: "205", status: "available" },
            { id: "206", status: "available" },
        ],
        revenue: [],
        stats: {
            totalTenants: 0,
            todayBookings: 0,
            bookedLast24h: 0,
            roomsAvailable: 12,
        },
        monthlyData: {
            bookings: [5, 8, 7, 10, 12, 15, 18, 20, 17, 14, 11, 9],
            revenue: [45000, 62000, 58000, 75000, 82000, 95000, 110000, 125000, 105000, 92000, 78000, 65000]
        },
        settings: {
            pgName: "Saradhi PG",
            ownerName: "Veera Saradhi Grandhi",
            contactNumber: "",
            address: ""
        }
    };
    localStorage.setItem('pgData', JSON.stringify(initialData));
}

// Load Data
let pgData = JSON.parse(localStorage.getItem('pgData'));

// Initialize Charts
let bookingsChart, revenueChart;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Set current date as default check-in date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    document.getElementById('tenant-checkin').value = formattedDate;
    
    // Load settings
    if (pgData.settings) {
        document.getElementById('pg-name').value = pgData.settings.pgName || '';
        document.getElementById('owner-name').value = pgData.settings.ownerName || '';
        document.getElementById('contact-number').value = pgData.settings.contactNumber || '';
        document.getElementById('pg-address').value = pgData.settings.address || '';
    }
});

function initApp() {
    updateStats();
    updateRecentBookings();
    populateRoomSelect();
    initCharts();
    setupEventListeners();
    setActiveNav('dashboard');
    updateAllBookings();
    updatePaymentHistory();
    updateTenantsList();
    updateRoomsGrid();
    updateRevenueStats();
}

function updateStats() {
    document.getElementById('today-bookings').textContent = pgData.stats.todayBookings;
    document.getElementById('rooms-available').textContent = pgData.stats.roomsAvailable;
    document.getElementById('booked-last-24h').textContent = pgData.stats.bookedLast24h;
    document.getElementById('total-tenants').textContent = pgData.stats.totalTenants;
}

function updateRecentBookings() {
    const recentBookingsEl = document.getElementById('recent-bookings');
    recentBookingsEl.innerHTML = '';
    
    // Sort bookings by timestamp (newest first)
    const sortedBookings = [...pgData.bookings].sort((a, b) => b.timestamp - a.timestamp);
    const recentBookings = sortedBookings.slice(0, 5);
    
    if (recentBookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                No recent bookings
            </td>
        `;
        recentBookingsEl.appendChild(row);
        return;
    }

    recentBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${booking.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${booking.tenantName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${booking.room}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(booking.checkin)}</td>
            <td class="px-6 py-4 whitespace-nowrap">₹${booking.rent}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
            </td>
        `;
        recentBookingsEl.appendChild(row);
    });
}

function updateAllBookings() {
    const allBookingsEl = document.getElementById('all-bookings');
    allBookingsEl.innerHTML = '';
    
    if (pgData.bookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                No bookings found
            </td>
        `;
        allBookingsEl.appendChild(row);
        return;
    }

    // Sort bookings by timestamp (newest first)
    const sortedBookings = [...pgData.bookings].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${booking.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${booking.tenantName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${booking.room}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(booking.checkin)}</td>
            <td class="px-6 py-4 whitespace-nowrap">₹${booking.rent}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-indigo-600 hover:text-indigo-900" data-booking-id="${booking.id}">Edit</button>
                <button class="ml-2 text-red-600 hover:text-red-900" data-booking-id="${booking.id}">Delete</button>
            </td>
        `;
        allBookingsEl.appendChild(row);
    });
}

function updatePaymentHistory() {
    const paymentHistoryEl = document.getElementById('payment-history');
    paymentHistoryEl.innerHTML = '';
    
    if (pgData.bookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                No payment history found
            </td>
        `;
        paymentHistoryEl.appendChild(row);
        return;
    }

    // Sort bookings by timestamp (newest first)
    const sortedBookings = [...pgData.bookings].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedBookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(booking.checkin)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${booking.tenantName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${booking.room}</td>
            <td class="px-6 py-4 whitespace-nowrap">₹${booking.rent}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span>
            </td>
        `;
        paymentHistoryEl.appendChild(row);
    });
}

function updateTenantsList() {
    const tenantsListEl = document.getElementById('tenants-list');
    tenantsListEl.innerHTML = '';
    
    if (pgData.tenants.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                No tenants found
            </td>
        `;
        tenantsListEl.appendChild(row);
        return;
    }

    pgData.tenants.forEach(tenant => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${tenant.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${tenant.room}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(tenant.checkin)}</td>
            <td class="px-6 py-4 whitespace-nowrap">₹${tenant.rent || 0}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-indigo-600 hover:text-indigo-900" data-tenant-id="${tenant.room}">Edit</button>
                <button class="ml-2 text-red-600 hover:text-red-900" data-tenant-id="${tenant.room}">Check-out</button>
            </td>
        `;
        tenantsListEl.appendChild(row);
    });
}

function updateRoomsGrid() {
    const roomsGridEl = document.getElementById('rooms-grid');
    roomsGridEl.innerHTML = '';
    
    pgData.rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'bg-white p-4 rounded-lg shadow border';
        roomCard.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="text-lg font-medium">Room ${room.id}</h4>
                <span class="px-2 py-1 text-xs rounded-full ${room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${room.status === 'available' ? 'Available' : 'Occupied'}
                </span>
            </div>
            <div class="mt-2">
                <button class="text-indigo-600 hover:text-indigo-900 text-sm" data-room-id="${room.id}">Edit</button>
                <button class="ml-2 text-red-600 hover:text-red-900 text-sm" data-room-id="${room.id}">Delete</button>
            </div>
        `;
        roomsGridEl.appendChild(roomCard);
    });
}

function updateRevenueStats() {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const thisMonthRevenue = pgData.monthlyData.revenue[currentMonth] || 0;
    const lastMonthRevenue = pgData.monthlyData.revenue[lastMonth] || 0;
    const totalRevenue = pgData.monthlyData.revenue.reduce((sum, amount) => sum + amount, 0);
    
    document.getElementById('this-month-revenue').textContent = `₹${thisMonthRevenue}`;
    document.getElementById('last-month-revenue').textContent = `₹${lastMonthRevenue}`;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue}`;
}

function populateRoomSelect() {
    const tenantRoomSelect = document.getElementById('tenant-room');
    tenantRoomSelect.innerHTML = '<option value="">Select Room</option>';
    
    pgData.rooms.forEach(room => {
        if (room.status === "available") {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.id;
            tenantRoomSelect.appendChild(option);
        }
    });
}

function initCharts() {
    const bookingsCtx = document.getElementById('bookingsChart')?.getContext('2d');
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    
    // Destroy existing charts if they exist
    if (bookingsChart) bookingsChart.destroy();
    if (revenueChart) revenueChart.destroy();
    
    if (bookingsCtx) {
        bookingsChart = new Chart(bookingsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Monthly Bookings',
                    data: pgData.monthlyData.bookings,
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    if (revenueCtx) {
        revenueChart = new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: pgData.monthlyData.revenue,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function setupEventListeners() {
    // New tenant form submission
    document.getElementById('new-tenant-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('tenant-name').value;
        const room = document.getElementById('tenant-room').value;
        const checkin = document.getElementById('tenant-checkin').value;
        const rent = document.getElementById('tenant-rent').value;

        if (!name || !room || !checkin || !rent) {
            alert('Please fill all fields');
            return;
        }

        // Create new booking
        const newBooking = {
            id: 'BK' + Math.floor(Math.random() * 10000),
            tenantName: name,
            room,
            checkin,
            rent: parseInt(rent),
            timestamp: new Date().getTime()
        };

        // Create new tenant
        const newTenant = {
            name,
            room,
            checkin,
            rent: parseInt(rent)
        };

        // Update data
        pgData.bookings.unshift(newBooking);
        pgData.tenants.push(newTenant);
        
        // Update stats
        pgData.stats.todayBookings++;
        pgData.stats.totalTenants++;
        pgData.stats.bookedLast24h++;
        pgData.stats.roomsAvailable--;
        
        // Update room status
        const roomIndex = pgData.rooms.findIndex(r => r.id === room);
        if (roomIndex !== -1) {
            pgData.rooms[roomIndex].status = "booked";
        }
        
        // Update monthly data (for demo purposes)
        const currentMonth = new Date().getMonth();
        pgData.monthlyData.bookings[currentMonth]++;
        pgData.monthlyData.revenue[currentMonth] += parseInt(rent);

        // Save to localStorage
        localStorage.setItem('pgData', JSON.stringify(pgData));

        // Reload data
        pgData = JSON.parse(localStorage.getItem('pgData'));

        // Update UI
        updateStats();
        updateRecentBookings();
        populateRoomSelect();
        initCharts();
        updateAllBookings();
        updatePaymentHistory();
        updateTenantsList();
        updateRoomsGrid();
        updateRevenueStats();

        // Reset form
        this.reset();
        
        // Set current date as default
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        document.getElementById('tenant-checkin').value = formattedDate;
        
        alert('Tenant registered successfully!');
    });

    // Generate receipt
    document.getElementById('generate-receipt')?.addEventListener('click', function() {
        if (pgData.bookings.length === 0) {
            alert('No bookings to generate receipt');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text(`${pgData.settings.pgName || 'Saradhi PG'} - Booking Receipt`, 105, 20, { align: 'center' });
        
        // Date
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 30);
        
        // Receipt details
        doc.autoTable({
            head: [['ID', 'Tenant', 'Room', 'Check-in', 'Amount']],
            body: pgData.bookings.slice(0, 5).map(booking => [
                booking.id,
                booking.tenantName,
                booking.room,
                formatDate(booking.checkin),
                `₹${booking.rent}`
            ]),
            startY: 40,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: 255
            },
            styles: {
                cellPadding: 5,
                fontSize: 10
            }
        });
        
        // Total
        const total = pgData.bookings.slice(0, 5).reduce((sum, booking) => sum + booking.rent, 0);
        doc.text(`Total: ₹${total}`, 15, doc.lastAutoTable.finalY + 10);
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Thank you for choosing our PG!", 105, doc.lastAutoTable.finalY + 20, { align: 'center' });
        
        // Save PDF
        doc.save(`${pgData.settings.pgName || 'Saradhi-PG'}-Receipt-${new Date().toISOString().slice(0, 10)}.pdf`);
    });

    // Settings form submission
    document.getElementById('pg-settings-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        pgData.settings = {
            pgName: document.getElementById('pg-name').value,
            ownerName: document.getElementById('owner-name').value,
            contactNumber: document.getElementById('contact-number').value,
            address: document.getElementById('pg-address').value
        };
        
        localStorage.setItem('pgData', JSON.stringify(pgData));
        alert('Settings saved successfully!');
    });

    // Add room button
    document.getElementById('add-room-btn')?.addEventListener('click', function() {
        const newRoomId = prompt('Enter new room number:');
        if (newRoomId) {
            pgData.rooms.push({
                id: newRoomId,
                status: "available"
            });
            pgData.stats.roomsAvailable++;
            localStorage.setItem('pgData', JSON.stringify(pgData));
            updateRoomsGrid();
            populateRoomSelect();
            updateStats();
        }
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            setActiveNav(section);
            
            // Reinitialize charts when switching to revenue section
            if (section === 'revenue') {
                initCharts();
            }
        });
    });

    // Mobile menu toggle
    document.getElementById('mobile-menu-button')?.addEventListener('click', function() {
        document.querySelector('.md\\:flex').classList.toggle('hidden');
    });
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show the selected section
    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) {
        sectionEl.classList.remove('hidden');
    }
}

function setActiveNav(section) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('bg-indigo-900', 'text-white');
        link.classList.add('text-indigo-200', 'hover:bg-indigo-700');
    });
    
    // Add active class to the current nav link
    const activeLink = document.querySelector(`.nav-link[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('bg-indigo-900', 'text-white');
        activeLink.classList.remove('text-indigo-200', 'hover:bg-indigo-700');
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}