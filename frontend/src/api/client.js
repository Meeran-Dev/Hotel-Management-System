const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://127.0.0.1:8000'

function buildUrl(path) {
  if (path.startsWith('http')) return path
  if (!path.startsWith('/')) return `${API_BASE_URL}/${path}`
  return `${API_BASE_URL}${path}`
}

async function request(path, { method = 'GET', token, headers, body } = {}) {
  const res = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body:
      body == null
        ? undefined
        : body instanceof FormData
          ? body
          : typeof body === 'string'
            ? body
            : JSON.stringify(body),
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const detail =
      typeof data === 'object' && data && 'detail' in data ? data.detail : 'Request failed'
    const msg = Array.isArray(detail) ? JSON.stringify(detail) : String(detail)
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const api = {
  signup: (payload) => request('/signup', { method: 'POST', body: payload }),
  login: async ({ email, password }) => {
    // Backend uses OAuth2PasswordRequestForm => form-encoded with fields: username, password
    const body = new URLSearchParams()
    body.set('username', email)
    body.set('password', password)
    return request('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
  },

  getHotels: () => request('/hotels/'),
  getHotel: ({ hotelId }) => request(`/hotels/${hotelId}`),
  createHotel: ({ token, payload }) => request('/hotels/', { method: 'POST', token, body: payload }),
  updateHotel: ({ token, hotelId, payload }) =>
    request(`/hotels/${hotelId}`, { method: 'PUT', token, body: payload }),
  deleteHotel: ({ token, hotelId }) => request(`/hotels/${hotelId}`, { method: 'DELETE', token }),

  getRooms: ({ hotelId }) => request(`/rooms/${hotelId}`),
  createRoom: ({ token, payload }) => request('/rooms/', { method: 'POST', token, body: payload }),
  updateRoom: ({ token, roomId, payload }) =>
    request(`/rooms/${roomId}`, { method: 'PUT', token, body: payload }),
  deleteRoom: ({ token, roomId }) => request(`/rooms/${roomId}`, { method: 'DELETE', token }),

  bookRoom: ({ token, payload }) =>
    request('/booking/', { method: 'POST', token, body: payload }),
  myBookings: ({ token }) => request('/booking/my', { token }),
  hotelBookings: ({ token, hotelId }) => request(`/booking/hotel/${hotelId}`, { token }),
  getAvailableRooms: ({ hotelId, checkInDate, checkOutDate }) =>
    request(`/booking/available-rooms/${hotelId}?check_in_date=${checkInDate}&check_out_date=${checkOutDate}`),
  checkInBooking: ({ token, bookingId }) =>
    request('/booking/check-in', { method: 'POST', token, body: { booking_id: bookingId } }),
  checkOutBooking: ({ token, bookingId }) =>
    request('/booking/check-out', { method: 'POST', token, body: { booking_id: bookingId } }),
  getHousekeepingTasks: ({ token }) => request('/housekeeping/tasks', { token }),
  completeHousekeepingTask: ({ token, taskId }) =>
    request(`/housekeeping/tasks/${taskId}/complete`, { method: 'POST', token }),

  assignManager: ({ token, managerId, hotelId }) =>
    request(`/manager/assign?manager_id=${managerId}&hotel_id=${hotelId}`, {
      method: 'POST',
      token,
    }),
  listManagers: ({ token }) => request('/manager/managers', { token }),
  myHotels: ({ token }) => request('/manager/my-hotels', { token }),
  getHotelStaff: ({ token, hotelId }) => request(`/manager/staff/${hotelId}`, { token }),
  createHotelStaff: ({ token, hotelId, payload }) =>
    request(`/manager/staff/${hotelId}`, { method: 'POST', token, body: payload }),
}

