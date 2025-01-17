// npm modules
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'

//Trust but verify

// pages
import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import Landing from './pages/Landing/Landing'
//profiles
import Profiles from './pages/Profiles/Profiles'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import EditProfile from './pages/EditProfile/EditProfile'
import EditReview from './components/EditReview/EditReview'
//venues
import Venues from './pages/Venues/Venues'
import NewVenue from './pages/NewVenue/NewVenue'
import EditVenue from './pages/EditVenue/EditVenue'
//workshops
import Workshops from './pages/Workshops/Workshops'
import NewWorkshop from './pages/NewWorkshop/NewWorkshop'
import WorkshopDetails from './pages/WorkshopDetails/WorkshopDetails'
//requests
import Requests from './pages/Requests/Requests'
import NewRequest from './pages/NewRequest/NewRequest'
import EditRequest from './pages/EditRequest/EditRequest'


// components
import NavBar from './components/NavBar/NavBar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// services
import * as authService from './services/authService'
import * as profileService from './services/profileService'
import * as venueService from './services/venueService'
import * as workshopService from './services/workshopService'
import * as requestService from './services/requestService'

// styles
import './App.css'

function App() {
  const [user, setUser] = useState(authService.getUser())
  const [profiles, setProfiles] = useState([])
  const [venues, setVenues] = useState([])
  const [requests, setRequests] = useState([])
  const [workshops, setWorkshops] = useState([])  
  const navigate = useNavigate()

  useEffect(() => {
    const fetchWorkshops = async () => {
      const workshopData = await workshopService.getAllWorkshops()
      setWorkshops(workshopData)
    }
    fetchWorkshops()
  }, [])
    
  useEffect (()=>{
    const fetchRequests = async () => {
      if(!user) return
      const requestpData = user.role === 500 ? await requestService.getAllRequests() : await requestService.getMyRequests() 
      setRequests(requestpData)
    }
    fetchRequests()
    
    const fetchVenues = async () => {
      if(!user) return
      const venueData = await venueService.getAllVenues() 
      setVenues(venueData)
    }
    fetchVenues()

    const fetchProfiles = async () => {      
      if(!user) return
      const profileData = await profileService.getAllProfiles()
      setVenues(profileData)
    }
    fetchProfiles()
  }, [user])

  const handleUpdateProfile = async (profileFormData, user) => {
    const updatedProfile = await profileService.updateProfile(profileFormData, user)
    console.log("this is the UPDATED PROFILE ", updatedProfile)
    setProfiles(profiles.map((profile) => updatedProfile._id === profile._id ? updatedProfile : profile))
    navigate(`/profile/${updatedProfile._id}`)
  }

  const handleUpdateVenue = async (venueFormData) => {
    const updatedVenue = await venueService.update(venueFormData)
    setVenues(venues.map(venue => venue._id === updatedVenue._id ? updatedVenue : venue))
    navigate('/venues')
  }

  const handleUpdateRequest = async (requestFormData) => {
    const updatedRequest = await requestService.updateRequest(requestFormData)
    setRequests(requests.map((request) => updatedRequest._id === request._id ? updatedRequest : request))
    navigate(`/requests`)
  }

  const handdleAddWorkshop = async (workshopFormData) => {
    const newWorkshop = await  workshopService.createWorkshop(workshopFormData)
    setWorkshops({ ...workshops,  newWorkshop })
    navigate('/workshops')
  }
  
  const handleDeleteWorkshop = async (workshopId) => {
    const deletedWorkshop = await workshopService.deleteWorkshop(workshopId)
    setWorkshops(workshops.filter(workshop => workshop._id !== deletedWorkshop._id))
    navigate('/workshops')
  }  

  const handleAddRequest = async (requestFormData) => {
    const newRequest = await requestService.createRequest(requestFormData)
    setRequests([newRequest, ...requests])
    navigate('/requests')
  }

  const handleDeleteRequest = async (requestId) => {
    const deletedRequest = await requestService.deleteRequest(requestId)
    setRequests(requests.filter(request => request._id !== deletedRequest._id))
    navigate('/requests')
  }

  const handleAddBid = async (requestId, requestFormData) => {
    const updatedRequest = requests.find(request => request._id === requestId)
    const newBid = await requestService.createBid(requestId, requestFormData)
    setRequests(requests.map((request) => updatedRequest._id === request._id ? {...updatedRequest, bids:[newBid, ...updatedRequest.bids]} : request )) 
    navigate('/requests')
  }

  const handleDeleteBid = async (requestId, bidId) => {
    const updatedRequest = requests.find(request => request._id === requestId)
    await requestService.deleteBid(requestId, bidId) 
    setRequests(requests.map((request) => updatedRequest._id === request._id ? {...requests.find(request => request._id === requestId), bids: updatedRequest.bids.filter((bid) => bid._id !== bidId)} : request ))
    navigate(`/requests`)
  }


  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleAuthEvt = () => {
    setUser(authService.getUser())
  }

  return (
    <div className='page-body'>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>

        {/* profiles */}
        <Route path="/" element={<Landing user={user} />} />
        <Route
          path="/profiles"
          element={
            <ProtectedRoute user={user}>
              <Profiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:profileId"
          element={
            <ProtectedRoute user={user}>
              <ProfilePage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:profileId/edit"
          element={
            <ProtectedRoute user={user}>
              <EditProfile 
                profiles={profiles} 
                user={user} 
                handleUpdateProfile={handleUpdateProfile}/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/profile/:profileId/reviews/:reviewId" 
          element={
            <ProtectedRoute user={user}>
              <EditReview />
            </ProtectedRoute>
          }
        />

        {/* venues */}
        <Route
          path="/venues"
          element={
            <ProtectedRoute user={user}>
              <Venues user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venues/new"
          element={
            <ProtectedRoute user={user}>
              <NewVenue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venues/:venueId"
          element={
            <ProtectedRoute user={user}>
              <Venues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/venues/:venueId/edit"
          element={
            <ProtectedRoute user={user}>
              <EditVenue updateVenue={handleUpdateVenue} />
            </ProtectedRoute>
          }
        />

        {/* workshop */}
        <Route
          path="/workshops"
          element={
            // <ProtectedRoute user={user}>
              <Workshops user={user} workshops={workshops}/>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/workshops/:workshopId"
          element={
            // <ProtectedRoute user={user}>
              <WorkshopDetails user={user} handleDeleteWorkshop={handleDeleteWorkshop}/>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/workshops/new"
          element={
            <ProtectedRoute user={user}>
              <NewWorkshop user={user} handdleAddWorkshop={handdleAddWorkshop}/>
            </ProtectedRoute>
          }
        />

        {/* requests */}
        <Route
          path="/requests"
          element={
            <ProtectedRoute user={user}>
              <Requests user={user} 
                requests={requests}
                handleDeleteRequest={handleDeleteRequest}
                handleAddBid={handleAddBid}
                handleDeleteBid={handleDeleteBid}
                />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newRequest"
          element={
            <ProtectedRoute user={user}>
              <NewRequest user={user} handleAddRequest={handleAddRequest} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editRequest/:requestId"
          element={
            <ProtectedRoute user={user}>
              <EditRequest user={user} handleUpdateRequest={handleUpdateRequest} />
            </ProtectedRoute>
          }
        />

        {/* auth */}
        <Route
          path="/auth/signup"
          element={<Signup handleAuthEvt={handleAuthEvt} />}
        />
        <Route
          path="/auth/login"
          element={<Login handleAuthEvt={handleAuthEvt} />}
        />
        <Route
          path="/auth/change-password"
          element={
            <ProtectedRoute user={user}>
              <ChangePassword handleAuthEvt={handleAuthEvt} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
