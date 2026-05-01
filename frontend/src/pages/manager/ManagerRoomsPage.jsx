import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

function money(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return n.toFixed(2)
}

export function ManagerRoomsPage() {
  const { hotelId } = useParams()
  const auth = useAuth()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [roomNumber, setRoomNumber] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [bookings, setBookings] = useState([])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [availableRooms, setAvailableRooms] = useState([])
  const [bookingForm, setBookingForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomId: '',
    customerName: '',
    mobile: '',
    age: '',
    guestCount: '1',
    paymentMethod: 'CASH',
    transactionId: '',
  })

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [list, bookingList] = await Promise.all([
        api.getRooms({ hotelId }),
        api.hotelBookings({ token: auth.token, hotelId }),
      ])
      setRooms(list || [])
      setBookings(bookingList || [])
    } catch (err) {
      setError(err.message || 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }, [auth.token, hotelId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  async function addRoom(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    try {
      const payload = {
        hotel_id: Number(hotelId),
        room_num: roomNumber,
        type,
        price_per_night: Number(price),
      }
      await api.createRoom({ token: auth.token, payload })
      setRoomNumber('')
      setType('')
      setPrice('')
      setMsg('Room created')
      await refresh()
    } catch (err) {
      setMsg(err.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  const nights = useMemo(() => {
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return 0
    const start = new Date(bookingForm.checkInDate)
    const end = new Date(bookingForm.checkOutDate)
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [bookingForm.checkInDate, bookingForm.checkOutDate])

  const selectedRoom = useMemo(
    () => availableRooms.find((r) => Number(r.room_id) === Number(bookingForm.roomId)),
    [availableRooms, bookingForm.roomId],
  )
  const estimatedAmount = Number(selectedRoom?.price || 0) * nights
  const upiLink = `upi://pay?pa=hotel@upi&pn=Hotel&am=${money(estimatedAmount)}`
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`

  async function checkAvailability() {
    setBookingError('')
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate) {
      setBookingError('Select check-in and check-out dates first')
      return
    }
    if (nights <= 0) {
      setBookingError('Check-out date must be after check-in date')
      return
    }
    setBookingLoading(true)
    try {
      const available = await api.getAvailableRooms({
        hotelId,
        checkInDate: bookingForm.checkInDate,
        checkOutDate: bookingForm.checkOutDate,
      })
      setAvailableRooms(available || [])
      if (!available?.length) setBookingError('No rooms available for selected dates')
    } catch (err) {
      setBookingError(err.message || 'Failed to fetch available rooms')
    } finally {
      setBookingLoading(false)
    }
  }

  async function submitBooking(e) {
    e.preventDefault()
    setBookingError('')
    if (!bookingForm.roomId) {
      setBookingError('Please select an available room')
      return
    }
    if (!bookingForm.customerName.trim() || !bookingForm.mobile.trim() || !bookingForm.age) {
      setBookingError('Customer name, mobile and age are required')
      return
    }
    if (bookingForm.paymentMethod === 'UPI' && !bookingForm.transactionId.trim()) {
      setBookingError('Transaction ID is required for UPI payment')
      return
    }

    setBookingLoading(true)
    try {
      await api.bookRoom({
        token: auth.token,
        payload: {
          hotel_id: Number(hotelId),
          room_id: Number(bookingForm.roomId),
          check_in_date: bookingForm.checkInDate,
          check_out_date: bookingForm.checkOutDate,
          booked_by: bookingForm.customerName.trim(),
          phone_num: bookingForm.mobile.trim(),
          adult_guests: Number(bookingForm.age),
          child_guests: 0,
          transaction_id: bookingForm.paymentMethod === 'UPI' ? bookingForm.transactionId.trim() : null,
        },
      })
      setBookingOpen(false)
      setAvailableRooms([])
      setBookingForm({
        checkInDate: '',
        checkOutDate: '',
        roomId: '',
        customerName: '',
        mobile: '',
        age: '',
        guestCount: '1',
        paymentMethod: 'CASH',
        transactionId: '',
      })
      await refresh()
      setMsg('Booking confirmed')
    } catch (err) {
      setBookingError(err.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  async function onCheckIn(bookingId) {
    setMsg('')
    try {
      await api.checkInBooking({ token: auth.token, bookingId })
      await refresh()
      setMsg('Check-in completed')
    } catch (err) {
      setMsg(err.message || 'Check-in failed')
    }
  }

  async function onCheckOut(bookingId) {
    setMsg('')
    try {
      await api.checkOutBooking({ token: auth.token, bookingId })
      await refresh()
      setMsg('Check-out completed. Room sent to cleaning.')
    } catch (err) {
      setMsg(err.message || 'Check-out failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Rooms · Hotel #{hotelId}</h1>
            <p className="mt-1 text-sm text-slate-600">Manage room inventory and housekeeping status in one place.</p>
          </div>
          <button className="btn-secondary" onClick={refresh}>
            Refresh
          </button>
          <button className="btn-primary" onClick={() => setBookingOpen(true)}>
            Book Room
          </button>
        </div>
      </div>

      <form onSubmit={addRoom} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="text-sm font-semibold text-slate-900">Add New Room</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Room number</label>
            <input
              className="input-lux mt-1"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Type</label>
            <input className="input-lux mt-1" value={type} onChange={(e) => setType(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Price</label>
            <input className="input-lux mt-1" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="flex items-end">
            <button disabled={saving} className="btn-primary w-full">
              {saving ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm text-slate-600">{msg}</div> : null}
      </form>

      {loading ? <div className="text-sm text-slate-600">Loading rooms...</div> : null}
      {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rooms.map((r) => (
          <RoomEditor key={r.room_id} room={r} hotelId={hotelId} token={auth.token} onChanged={refresh} />
        ))}
        {!loading && !error && rooms.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No rooms found.</div>
        ) : null}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900">Booking Lifecycle</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="px-2 py-2">Room</th>
                <th className="px-2 py-2">Guest</th>
                <th className="px-2 py-2">Dates</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id} className="border-b">
                  <td className="px-2 py-2">#{b.room_number}</td>
                  <td className="px-2 py-2">
                    <div>{b.customer_name}</div>
                    <div className="text-xs text-slate-500">{b.customer_mobile}</div>
                  </td>
                  <td className="px-2 py-2">
                    {String(b.check_in_date)} → {String(b.check_out_date)} ({b.nights} nights)
                  </td>
                  <td className="px-2 py-2">{String(b.status)}</td>
                  <td className="px-2 py-2">₹{money(b.total_amount)}</td>
                  <td className="px-2 py-2">
                    {String(b.status) === 'CONFIRMED' ? (
                      <button className="btn-secondary" onClick={() => onCheckIn(b.booking_id)}>
                        Check-In
                      </button>
                    ) : null}
                    {String(b.status) === 'CHECKED_IN' ? (
                      <button className="btn-secondary" onClick={() => onCheckOut(b.booking_id)}>
                        Check-Out
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bookings.length ? <div className="p-2 text-sm text-slate-500">No bookings yet for this hotel.</div> : null}
        </div>
      </section>

      {bookingOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4">
          <form onSubmit={submitBooking} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Book Room</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Check-in date</label>
                <input
                  type="date"
                  className="input-lux mt-1"
                  value={bookingForm.checkInDate}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, checkInDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Check-out date</label>
                <input
                  type="date"
                  className="input-lux mt-1"
                  value={bookingForm.checkOutDate}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, checkOutDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="mt-2 text-sm text-slate-600">Nights: {nights}</div>

            <button type="button" className="btn-secondary mt-3" onClick={checkAvailability} disabled={bookingLoading}>
              {bookingLoading ? 'Checking...' : 'Check Availability'}
            </button>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">Available rooms</label>
              <select
                className="input-lux mt-1"
                value={bookingForm.roomId}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, roomId: e.target.value }))}
                required
              >
                <option value="">Select room</option>
                {availableRooms.map((r) => (
                  <option key={r.room_id} value={r.room_id}>
                    Room #{r.room_number} · {r.type} · ₹{money(r.price)}/night
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                className="input-lux"
                placeholder="Customer Name"
                value={bookingForm.customerName}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, customerName: e.target.value }))}
                required
              />
              <input
                className="input-lux"
                placeholder="Mobile Number"
                value={bookingForm.mobile}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, mobile: e.target.value }))}
                required
              />
              <input
                type="number"
                className="input-lux"
                placeholder="Age"
                value={bookingForm.age}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, age: e.target.value }))}
                required
              />
              <input
                type="number"
                min="1"
                className="input-lux"
                placeholder="Guest Count"
                value={bookingForm.guestCount}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, guestCount: e.target.value }))}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select
                className="input-lux"
                value={bookingForm.paymentMethod}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
              </select>
              {bookingForm.paymentMethod === 'UPI' ? (
                <input
                  className="input-lux"
                  placeholder="Transaction ID"
                  value={bookingForm.transactionId}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                  required
                />
              ) : (
                <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">Cash payment on confirmation</div>
              )}
            </div>
            {bookingForm.paymentMethod === 'UPI' ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <img src={upiQrUrl} alt="UPI QR" className="mb-2 h-32 w-32 rounded border border-slate-200 bg-white p-1" />
                UPI amount: ₹{money(estimatedAmount)}
              </div>
            ) : null}
            <div className="mt-3 text-sm font-semibold text-slate-800">Total: ₹{money(estimatedAmount)}</div>

            {bookingError ? <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{bookingError}</div> : null}

            <div className="mt-5 flex gap-2">
              <button type="submit" className="btn-primary" disabled={bookingLoading}>
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setBookingOpen(false)
                  setBookingError('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

function statusClass(status) {
  const normalized = String(status || '').toUpperCase()
  if (normalized.includes('AVAILABLE')) return 'bg-emerald-100 text-emerald-700'
  if (normalized.includes('CLEAN')) return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

function RoomEditor({ room, hotelId, token, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [roomNumber, setRoomNumber] = useState(String(room.room_number ?? ''))
  const [type, setType] = useState(String(room.type ?? ''))
  const [price, setPrice] = useState(String(room.price ?? ''))
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function save() {
    setMsg('')
    setLoading(true)
    try {
      const payload = {
        hotel_id: Number(hotelId),
        room_number: Number(roomNumber),
        type,
        price: Number(price),
      }
      await api.updateRoom({ token, roomId: room.room_id, payload })
      setEditing(false)
      setMsg('Saved')
      onChanged()
    } catch (err) {
      setMsg(err.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (!confirm(`Delete room_id ${room.room_id}?`)) return
    setMsg('')
    setLoading(true)
    try {
      await api.deleteRoom({ token, roomId: room.room_id })
      onChanged()
    } catch (err) {
      setMsg(err.message || 'Delete failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg transition duration-300 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Room #{room.room_number} <span className="text-slate-400">·</span> {room.type}
          </h3>
          <p className="mt-1 text-sm text-slate-600">room_id {room.room_id}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(room.status)}`}>{room.status}</span>
      </div>

      <p className="mt-3 text-lg font-semibold text-blue-600">₹{money(price)} / night</p>

      {editing ? (
        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Room Number</label>
            <input
              className="input-lux mt-1"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Type</label>
            <input className="input-lux mt-1" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Price</label>
            <input className="input-lux mt-1" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <button
          className="btn-secondary border-rose-200 text-rose-700 hover:bg-rose-50"
          disabled={loading}
          onClick={remove}
        >
          Delete
        </button>
      </div>
      {editing ? (
        <button className="btn-primary mt-4 w-full" disabled={loading} onClick={save} type="button">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      ) : null}

      {msg ? <div className="mt-3 text-sm text-slate-600">{msg}</div> : null}
    </article>
  )
}

