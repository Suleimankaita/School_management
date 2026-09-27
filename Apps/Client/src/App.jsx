import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Layout from './Layout/Layout'
import Gallery from './components/pages/Gallery'
import Portal from './components/pages/Portal'
import Admissions from './components/pages/AdmissionPage'
import Events from './components/pages/Events'
import FAQ from './components/pages/Faqs'
import Nursery from './components/pages/Nursery'
import Primary from './components/pages/Primary'
import Secondary from './components/pages/Scholl'
import ICTTraining from './components/pages/ICtTraining'
import Sports from './components/pages/Supports'
import ContactPage from './components/pages/Contact'
import Programs from './components/Programs'
import ProgramsPage from './components/pages/Programs'
import AboutPage from './components/pages/About'
import Login from './pages/Auth/Login'
import SchoolProfileSystem from './components/pages/prs'
import S from './S'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import PrivateLayout from './Layout/PrivateLayout'
import Dashboard from './pages/private/Dashbord'
import StudentRegistration from './pages/private/students/StudentRegistration'
import Students from './pages/private/students/Students'
import StudentProfile from './pages/private/students/StudentProfile'
import StudentProfile_edit from './pages/private/students/Student_Edit_profile' 
import Attendance from './pages/private/students/Student_Atendance'
import ATS from './pages/private/students/ATS'
import Results from './pages/private/Result/Result'
import Teachers from './pages/private/Teacher/Teacher'
import TeacherId from './pages/private/Teacher/TeacherId'
const App = () => {
  return (
      <Routes>
        <Route path='/s' element={<S/>}></Route>
        <Route path='/Login' element={<Login />} />
        <Route path='/ForgotPassword' element={<ForgotPassword />} />
        <Route path='/ResetPassword' element={<ResetPassword />} />
        

          <Route element={<PrivateLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/StudentRegistration"
          element={<StudentRegistration/>}
        />
        
        <Route
          path="/Teachers"
        >

          <Route index element={<Teachers/>}/>
          <Route path=':id' element={<TeacherId/>}/>

        </Route>
        <Route
          path="/Students"
        >
          <Route
            index
            element={<Students/>}
          />
          <Route
            path=":id"
            element={<StudentProfile/>}
          />
          <Route
            path="Attendance"
            element={<Attendance/>}
          />
          <Route
            path=":id/edit"
            element={<StudentProfile_edit/>}
          />
          <Route
            path=":id/attendance"
            element={<ATS/>}
          />
          
          <Route
            path="results"
            element={<Results/>}
          />
          
        </Route>
       
        </Route>


        <Route path="/" element={<Layout/>} >
        <Route index element={<Home />} />
        <Route path='/Gallery' element={<Gallery />} />
        <Route path='/Contact' element={<ContactPage />} />
        <Route path='/Programs' element={<ProgramsPage />} />
        <Route path='/About' element={<AboutPage />} />
        <Route path='/Admissions' element={<Admissions />} />
        <Route path='/Portal' element={<Portal />} />
        <Route path='/Events' element={<Events />} />
        <Route path='/FAQ' element={<FAQ />} />
        <Route path='/Nursery' element={<Nursery />} />
        <Route path='/Primary' element={<Primary />} />
        <Route path='/Secondary' element={<Secondary />} />
        <Route path='/ICTTraining' element={<ICTTraining />} />
        <Route path='/Sports' element={<Sports/>} />
        <Route path='/SchoolProfile/:position' element={<SchoolProfileSystem/>} />
        </Route>
      </Routes>
  )
}

export default App
