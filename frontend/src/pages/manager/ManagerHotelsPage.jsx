import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client.js'
import { useAuth } from '../../auth/auth.jsx'

export function ManagerHotelsPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTab, setCurrentTab] = useState('rooms')
  const [staffFormOpen, setStaffFormOpen] = useState(false)
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' })
  const [savingStaff, setSavingStaff] = useState(false)
  const [staffMsg, setStaffMsg] = useState('')
  const [roomForm, setRoomForm] = useState({ room_num: '', type: 'STANDARD', price_per_night: '' })
  const [roomMsg, setRoomMsg] = useState('')
  const [savingRoom, setSavingRoom] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError('')
      try {
        const myAssignments = await api.myHotels({ token: auth.token })
        if (!myAssignments || myAssignments.length === 0) {
          throw new Error('No hotel assigned')
        }
        const assignment = myAssignments[0] // Assuming one hotel
        const hotelId = assignment.hotel_id

        const [hotelData, roomsData, staffData] = await Promise.all([
          api.getHotel({ hotelId }),
          api.getRooms({ hotelId }),
          api.getHotelStaff({ token: auth.token, hotelId }),
        ])

        if (!cancelled) {
          setAssignments(myAssignments)
          setHotel(hotelData)
          setRooms(roomsData || [])
          setStaff(staffData || [])
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [auth.token])

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter((r) => String(r.status).toUpperCase() === 'OCCUPIED').length
  const availableRooms = rooms.filter((r) => String(r.status).toUpperCase() === 'AVAILABLE').length
  const bookedRooms = rooms.filter((r) => String(r.status).toUpperCase() === 'BOOKED').length
  const needCleaning = rooms.filter((r) => String(r.status).toUpperCase() === 'CLEANING_NEEDED').length

  function roomColor(status) {
    const normalized = String(status || '').toUpperCase()
    if (normalized.includes('AVAILABLE')) return 'bg-emerald-100 border-emerald-300 text-emerald-800'
    if (normalized.includes('OCCUPIED')) return 'bg-rose-100 border-rose-300 text-rose-800'
    if (normalized.includes('BOOKED')) return 'bg-blue-100 border-blue-300 text-blue-800'
    if (normalized.includes('CLEANING_NEEDED')) return 'bg-amber-100 border-amber-300 text-amber-900'
    return 'bg-gray-100 border-gray-300 text-gray-800'
  }

  function goToBooking() {
    if (assignments.length > 0) {
      navigate(`/book/${assignments[0].hotel_id}`)
    }
  }

  async function addStaff(e) {
    e.preventDefault()
    setStaffMsg('')
    setSavingStaff(true)
    try {
      await api.createHotelStaff({
        token: auth.token,
        hotelId: assignments[0].hotel_id,
        payload: { ...newStaff, role: 'STAFF' },
      })
      setStaffMsg('Staff account created')
      setNewStaff({ name: '', email: '', password: '' })
      setStaffFormOpen(false)
      // Refresh staff list
      if (assignments.length > 0) {
        const staffData = await api.getHotelStaff({ token: auth.token, hotelId: assignments[0].hotel_id })
        setStaff(staffData || [])
      }
    } catch (err) {
      setStaffMsg(err.message || 'Failed to create staff')
    } finally {
      setSavingStaff(false)
    }
  }

  async function addRoom(e) {
    e.preventDefault()
    setRoomMsg('')
    setSavingRoom(true)
    try {
      await api.createRoom({
        token: auth.token,
        payload: {
          hotel_id: assignments[0].hotel_id,
          room_num: roomForm.room_num,
          type: roomForm.type,
          price_per_night: Number(roomForm.price_per_night),
        },
      })
      const updatedRooms = await api.getRooms({ hotelId: assignments[0].hotel_id })
      setRooms(updatedRooms || [])
      setRoomForm({ room_num: '', type: 'STANDARD', price_per_night: '' })
      setRoomMsg('Room added')
    } catch (err) {
      setRoomMsg(err.message || 'Failed to add room')
    } finally {
      setSavingRoom(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
      <aside className="glass-panel-strong h-fit p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Manager panel</h2>
        <p className="mt-2 text-sm text-blue-100/95">Operate rooms and staff from the hotel you&apos;ve been assigned.</p>
        <div className="mt-6 space-y-2 text-sm">
          <button
            type="button"
            className={`w-full rounded-xl px-3 py-2.5 text-left shadow-sm transition ${currentTab === 'rooms' ? 'bg-white/20 ring-2 ring-white/25' : 'bg-black/15 hover:bg-black/25'}`}
            onClick={() => setCurrentTab('rooms')}
          >
            Manage rooms
          </button>
          <button
            type="button"
            className="w-full rounded-xl bg-black/15 px-3 py-2.5 text-left transition hover:bg-black/25"
            onClick={goToBooking}
          >
            Open booking
          </button>
          <button
            type="button"
            className={`w-full rounded-xl px-3 py-2.5 text-left transition ${currentTab === 'staff' ? 'bg-white/20 ring-2 ring-white/25' : 'bg-black/15 hover:bg-black/25'}`}
            onClick={() => setCurrentTab('staff')}
          >
            Staff
          </button>
        </div>
      </aside>

      <section>
        {currentTab === 'rooms' && (
          <div className="space-y-6">
            <div className="glass-card p-6 sm:p-8">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Manage rooms — {hotel?.name}
              </h1>
              <p className="mt-2 text-sm text-slate-600">Monitor and manage room inventory.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-5">
                <div className="glass-inset p-4">
                  <p className="text-xs text-slate-500">Total Rooms</p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">{totalRooms}</p>
                </div>
                <div className="glass-inset p-4">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="mt-1 text-3xl font-semibold text-emerald-700">{availableRooms}</p>
                </div>
                <div className="glass-inset p-4">
                  <p className="text-xs text-slate-500">Occupied</p>
                  <p className="mt-1 text-3xl font-semibold text-rose-600">{occupiedRooms}</p>
                </div>
                <div className="glass-inset p-4">
                  <p className="text-xs text-slate-500">Booked</p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">{bookedRooms}</p>
                </div>
                <div className="glass-inset p-4">
                  <p className="text-xs text-slate-500">Need Cleaning</p>
                  <p className="mt-1 text-3xl font-semibold text-amber-600">{needCleaning}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900">Room grid</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {rooms.map((room) => (
                  <div key={room.room_id} className={`rounded-xl border p-4 ${roomColor(room.status)}`}>
                    <h3 className="font-semibold">Room {room.room_num}</h3>
                    <p className="text-sm">Type: {room.type}</p>
                    <p className="text-sm">Status: {room.status}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={addRoom} className="glass-inset mt-6 grid gap-3 p-4 sm:grid-cols-4">
                <input
                  className="input-lux"
                  placeholder="Room number"
                  value={roomForm.room_num}
                  onChange={(e) => setRoomForm((prev) => ({ ...prev, room_num: e.target.value }))}
                  required
                />
                <select
                  className="input-lux"
                  value={roomForm.type}
                  onChange={(e) => setRoomForm((prev) => ({ ...prev, type: e.target.value }))}
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="DELUXE">DELUXE</option>
                  <option value="SUITE">SUITE</option>
                </select>
                <input
                  className="input-lux"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Price per night"
                  value={roomForm.price_per_night}
                  onChange={(e) => setRoomForm((prev) => ({ ...prev, price_per_night: e.target.value }))}
                  required
                />
                <button className="btn-primary" type="submit" disabled={savingRoom}>
                  {savingRoom ? 'Adding...' : 'Add Room'}
                </button>
              </form>
              {roomMsg ? <p className="mt-3 text-sm text-slate-600">{roomMsg}</p> : null}
            </div>
          </div>
        )}

        {currentTab === 'staff' && (
          <div className="glass-card p-6 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Staff — {hotel?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600">Manage hotel staff.</p>
            <div className="mt-5 space-y-4">
              {staff.map((s) => (
                <div key={s.user_id} className="glass-inset p-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="text-sm text-slate-600">{s.email}</p>
                    </div>
                    <button className="btn-danger text-xs">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="btn-primary" onClick={() => setStaffFormOpen(true)}>Add New Staff</button>
            </div>
            {staffFormOpen && (
              <div className="glass-inset mt-4 p-4">
                <h3 className="font-semibold text-slate-900">Add New Staff</h3>
                <form onSubmit={addStaff} className="mt-3 grid gap-3 sm:grid-cols-4">
                  <input
                    className="input-lux"
                    placeholder="Name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    required
                  />
                  <input
                    className="input-lux"
                    placeholder="Email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required
                  />
                  <input
                    className="input-lux"
                    placeholder="Password"
                    type="password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    required
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={savingStaff} className="btn-primary">
                      {savingStaff ? 'Adding...' : 'Add'}
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => setStaffFormOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
                {staffMsg && <div className="mt-2 text-sm text-slate-600">{staffMsg}</div>}
              </div>
            )}
          </div>
        )}

        {loading && <div className="mt-6 text-sm text-slate-600">Loading...</div>}
        {error && <div className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </section>
    </div>
  )
}

