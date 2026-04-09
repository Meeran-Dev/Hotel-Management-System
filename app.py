import mysql.connector
from datetime import datetime
import hashlib

# ================= DATABASE CONNECTION =================
def get_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="aditya@sql123",
            database="hotel_management"
        )
        return conn
    except Exception as e:
        print("DB Connection Error:", e)
        return None

# ================= SECURITY =================
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ================= USER FUNCTIONS =================
def register_user(name, email, password, role="customer"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        hashed = hash_password(password)
        query = "INSERT INTO User (name, email, password, role) VALUES (%s,%s,%s,%s)"
        cursor.execute(query, (name, email, hashed, role))
        conn.commit()
        print("User registered successfully")
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()


def login_user(email, password):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        hashed = hash_password(password)
        query = "SELECT * FROM User WHERE email=%s AND password=%s"
        cursor.execute(query, (email, hashed))
        user = cursor.fetchone()

        if user:
            print("Login Success")
            return user
        else:
            print("Invalid credentials")
            return None
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()

# ================= HOTEL =================
def add_hotel(name, location, num_rooms):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("INSERT INTO Hotel (name, location, num_rooms) VALUES (%s,%s,%s)",
                       (name, location, num_rooms))
        conn.commit()
        print("Hotel added")
    except Exception as e:
        print(e)
    finally:
        conn.close()


def view_hotels():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM Hotel")
        for h in cursor.fetchall():
            print(h)
    except Exception as e:
        print(e)
    finally:
        conn.close()

# ================= ROOM =================
def add_room(hotel_id, room_no, room_type, price):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("INSERT INTO Room (hotel_id, room_no, type, price, status) VALUES (%s,%s,%s,%s,'Available')",
                       (hotel_id, room_no, room_type, price))
        conn.commit()
        print("Room added")
    except Exception as e:
        print(e)
    finally:
        conn.close()


def search_rooms(hotel_id, max_price=None, room_type=None):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = "SELECT * FROM Room WHERE hotel_id=%s"
        params = [hotel_id]

        if max_price:
            query += " AND price <= %s"
            params.append(max_price)
        if room_type:
            query += " AND type=%s"
            params.append(room_type)

        cursor.execute(query, tuple(params))
        rooms = cursor.fetchall()

        for r in rooms:
            print(r)
        return rooms
    except Exception as e:
        print(e)
    finally:
        conn.close()

# ================= BOOKING =================
def is_room_available(room_id, check_in, check_out):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
        SELECT * FROM Booking
        WHERE room_id=%s AND status='Booked'
        AND (check_in <= %s AND check_out >= %s)
        """
        cursor.execute(query, (room_id, check_out, check_in))
        result = cursor.fetchall()

        return len(result) == 0
    except Exception as e:
        print(e)
        return False
    finally:
        conn.close()


def book_room(user_id, room_id, check_in, check_out):
    try:
        check_in = datetime.strptime(check_in, "%Y-%m-%d")
        check_out = datetime.strptime(check_out, "%Y-%m-%d")

        if check_in >= check_out:
            print("Invalid dates")
            return

        if not is_room_available(room_id, check_in, check_out):
            print("Room not available")
            return

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("INSERT INTO Booking (user_id, room_id, check_in, check_out, status) VALUES (%s,%s,%s,%s,'Booked')",
                       (user_id, room_id, check_in, check_out))
        conn.commit()

        print("Booking successful")
    except Exception as e:
        print(e)
    finally:
        conn.close()


def booking_history(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM Booking WHERE user_id=%s", (user_id,))
        for b in cursor.fetchall():
            print(b)
    except Exception as e:
        print(e)
    finally:
        conn.close()

# ================= MENUS =================
def admin_menu():
    while True:
        print("\nADMIN MENU")
        print("1.Add Hotel 2.View Hotels 3.Add Room 4.Exit")
        ch = input("Choice: ")

        if ch == '1':
            add_hotel(input("Name:"), input("Location:"), int(input("Rooms:")))
        elif ch == '2':
            view_hotels()
        elif ch == '3':
            add_room(int(input("Hotel ID:")), int(input("Room No:")), input("Type:"), float(input("Price:")))
        elif ch == '4':
            break


def user_menu(user_id):
    while True:
        print("\nUSER MENU")
        print("1.View Hotels 2.Search Rooms 3.Book 4.History 5.Exit")
        ch = input("Choice: ")

        if ch == '1':
            view_hotels()
        elif ch == '2':
            hotel_id = int(input("Hotel ID: "))
            max_price = input("Max price (optional): ")
            max_price = float(max_price) if max_price != "" else None
            room_type = input("Type (optional): ")
            room_type = room_type if room_type != "" else None
            search_rooms(hotel_id, max_price, room_type)
            
        elif ch == '3':
            book_room(user_id, int(input("Room ID:")), input("Check-in:"), input("Check-out:"))
        elif ch == '4':
            booking_history(user_id)
        elif ch == '5':
            break

# ================= MAIN =================
def main():
    while True:
        print("\n1.Register 2.Login 3.Exit")
        ch = input("Choice: ")

        if ch == '1':
            register_user(input("Name:"), input("Email:"), input("Password:"))
        elif ch == '2':
            user = login_user(input("Email:"), input("Password:"))
            if user:
                if user[4] == 'admin':
                    admin_menu()
                else:
                    user_menu(user[0])
        elif ch == '3':
            break


if __name__ == "__main__":
    main()
