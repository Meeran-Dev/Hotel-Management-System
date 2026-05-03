-- ----------------------
-- USERS
-- ----------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'STAFF') NOT NULL
);

-- ----------------------
-- HOTELS
-- ----------------------
CREATE TABLE hotels (
    hotel_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    num_rooms INT DEFAULT 0
);

-- ----------------------
-- ROOMS
-- ----------------------
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_num VARCHAR(50) NOT NULL,
    type ENUM('STANDARD', 'DELUXE', 'SUITE') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status ENUM('BOOKED', 'OCCUPIED', 'AVAILABLE', 'CLEANING_NEEDED') DEFAULT 'AVAILABLE',

    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    UNIQUE (hotel_id, room_num) -- prevents duplicate room numbers per hotel
);

-- ----------------------
-- HOTEL ASSIGNMENT (Many-to-Many)
-- ----------------------
CREATE TABLE hotel_assignment (
    user_id INT,
    hotel_id INT,

    PRIMARY KEY (user_id, hotel_id),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE
);

-- ----------------------
-- BOOKINGS
-- ----------------------
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_id INT NOT NULL,

    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INT,

    booked_by VARCHAR(255),
    phone_num VARCHAR(20),

    adult_guests INT DEFAULT 1,
    child_guests INT DEFAULT 0,

    transaction_id VARCHAR(255),

    check_in_time DATETIME,
    check_out_time DATETIME,

    status ENUM('CANCELLED', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED') DEFAULT 'CONFIRMED',

    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- ----------------------
-- CLEANING TASKS
-- ----------------------
CREATE TABLE cleaning_tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_id INT NOT NULL,

    notes TEXT,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',

    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);