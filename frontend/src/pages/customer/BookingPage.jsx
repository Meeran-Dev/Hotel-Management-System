import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function BookingPage() {
  const { hotelId } = useParams()
  const auth = useAuth()
  const isManager = auth.role === 'MANAGER'

  const [hotel, setHotel] = useState(null)
  const [bookings, setBookings] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingResult, setBookingResult] = useState(null)
  const [form, setForm] = useState({
    check_in_date: '',
    check_out_date: '',
    room_id: '',
    booked_by: '',
    phone_num: '',
    adult_guests: 1,
    child_guests: 0,
    transaction_id: '',
  })

  const nights = useMemo(() => {
    if (!form.check_in_date || !form.check_out_date) return 0
    const start = new Date(form.check_in_date)
    const end = new Date(form.check_out_date)
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [form.check_in_date, form.check_out_date])

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => Number(room.room_id) === Number(form.room_id)),
    [availableRooms, form.room_id],
  )
  const estimatedAmount = Number(selectedRoom?.price_per_night || 0) * nights

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')
      try {
        const hotelData = await api.getHotels().then((items) => items.find((item) => item.hotel_id === Number(hotelId)))
        setHotel(hotelData || null)

        if (form.check_in_date && form.check_out_date) {
          const available = await api.getAvailableRooms({
            hotelId,
            checkInDate: form.check_in_date,
            checkOutDate: form.check_out_date,
          })
          setAvailableRooms(available || [])
        } else {
          setAvailableRooms([])
        }

        if (isManager && auth.token) {
          const list = await api.hotelBookings({ token: auth.token, hotelId })
          setBookings(list || [])
        }
      } catch (err) {
        setError(err.message || 'Failed to load booking data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [hotelId, form.check_in_date, form.check_out_date, isManager, auth.token])

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submitBooking(e) {
    e.preventDefault()
    setError('')
    try {
      const result = await api.bookRoom({
        token: auth.token || undefined,
        payload: {
          hotel_id: Number(hotelId),
          room_id: Number(form.room_id),
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          booked_by: form.booked_by,
          phone_num: form.phone_num,
          adult_guests: Number(form.adult_guests),
          child_guests: Number(form.child_guests || 0),
          transaction_id: form.transaction_id || null,
        },
      })
      setBookingResult(result)
      setForm({
        check_in_date: '',
        check_out_date: '',
        room_id: '',
        booked_by: '',
        phone_num: '',
        adult_guests: 1,
        child_guests: 0,
        transaction_id: '',
      })
      setAvailableRooms([])
      if (isManager && auth.token) {
        const list = await api.hotelBookings({ token: auth.token, hotelId })
        setBookings(list || [])
      }
    } catch (err) {
      setError(err.message || 'Booking failed')
    }
  }

  async function onCheckIn(bookingId) {
    try {
      await api.checkInBooking({ token: auth.token, bookingId })
      const list = await api.hotelBookings({ token: auth.token, hotelId })
      setBookings(list || [])
    } catch (err) {
      setError(err.message || 'Check-in failed')
    }
  }

  async function onCheckOut(bookingId) {
    try {
      await api.checkOutBooking({ token: auth.token, bookingId })
      const list = await api.hotelBookings({ token: auth.token, hotelId })
      setBookings(list || [])
    } catch (err) {
      setError(err.message || 'Check-out failed')
    }
  }

  if (loading) return <div className="py-10 text-center">Loading...</div>

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Booking System - {hotel?.name}</h1>
        <p className="text-slate-600">
          {hotel?.city}, {hotel?.state}
        </p>
      </div>

      <form onSubmit={submitBooking} className="glass-card space-y-4 p-6">
        <h2 className="text-xl font-semibold">Create Booking</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Check-in Date</label>
            <input
              type="date"
              value={form.check_in_date}
              onChange={(e) => updateForm('check_in_date', e.target.value)}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Check-out Date</label>
            <input
              type="date"
              value={form.check_out_date}
              onChange={(e) => updateForm('check_out_date', e.target.value)}
              className="input-field"
              min={form.check_in_date || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Available Room</label>
          <select
            className="input-field"
            value={form.room_id}
            onChange={(e) => updateForm('room_id', e.target.value)}
            required
          >
            <option value="">Select room</option>
            {availableRooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                Room {room.room_num} - {room.type} - Rs. {room.price_per_night}/night
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Booked By"
            value={form.booked_by}
            onChange={(e) => updateForm('booked_by', e.target.value)}
            className="input-field"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={form.phone_num}
            onChange={(e) => updateForm('phone_num', e.target.value)}
            className="input-field"
            required
          />
          <input
            type="number"
            placeholder="Adult Guests"
            value={form.adult_guests}
            onChange={(e) => updateForm('adult_guests', e.target.value)}
            className="input-field"
            min="1"
            required
          />
          <input
            type="number"
            placeholder="Child Guests"
            value={form.child_guests}
            onChange={(e) => updateForm('child_guests', e.target.value)}
            className="input-field"
            min="0"
          />
        </div>

        <input
          type="text"
          placeholder="Transaction ID (optional)"
          value={form.transaction_id}
          onChange={(e) => updateForm('transaction_id', e.target.value)}
          className="input-field"
        />

        <div className="text-sm text-slate-600">
          Nights: {nights} | Estimated: Rs. {estimatedAmount}
        </div>
        <button className="btn-primary" type="submit" disabled={!form.room_id || nights <= 0}>
          Confirm Booking
        </button>
        {bookingResult ? (
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">Booking confirmed. ID: {bookingResult.booking_id}</div>
        ) : null}
      </form>

      {isManager ? (
        <section className="glass-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Booking Lifecycle</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="px-2 py-2">Room</th>
                  <th className="px-2 py-2">Guest</th>
                  <th className="px-2 py-2">Dates</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.booking_id} className="border-b">
                    <td className="px-2 py-2">#{booking.room_num}</td>
                    <td className="px-2 py-2">{booking.booked_by}</td>
                    <td className="px-2 py-2">
                      {String(booking.check_in_date)} - {String(booking.check_out_date)}
                    </td>
                    <td className="px-2 py-2">{String(booking.status)}</td>
                    <td className="px-2 py-2">
                      {String(booking.status) === 'CONFIRMED' ? (
                        <button className="btn-secondary" type="button" onClick={() => onCheckIn(booking.booking_id)}>
                          Check-In
                        </button>
                      ) : null}
                      {String(booking.status) === 'CHECKED_IN' ? (
                        <button className="btn-secondary" type="button" onClick={() => onCheckOut(booking.booking_id)}>
                          Check-Out
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {error ? <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div> : null}
    </div>
  )
}
