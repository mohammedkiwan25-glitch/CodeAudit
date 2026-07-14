import { useUser } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes } from 'react-router'
import DashboardPage from './pages/DashboardWorkspacePage'
import HomePage from './pages/HomeLandingPage'
import ProblemPage from './pages/ProblemPage'
import ProblemsPage from './pages/ProblemsPage'
import SessionPage from './pages/SessionPage'
import SessionReviewPage from './pages/SessionReviewPage'
import AnalyticsPage from './pages/AnalyticsPage'
import InterviewHistoryPage from './pages/InterviewHistoryPage'
import InterviewSetupPage from './pages/InterviewSetupPage'
import MyProblemsPage from './pages/MyProblemsPage'
import ProblemEditorPage from './pages/ProblemEditorPage'
import SessionReportPage from './pages/SessionReportPage'
import SupervisorDashboardPage from './pages/SupervisorDashboardPage'

function App() {

  const { isSignedIn, isLoaded } = useUser()

  //get rid of flickering
  if (!isLoaded) return null;

  return (
    <>
      <Routes>
        <Route path='/' element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path='/dashboard' element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />
        <Route path='/problems' element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />} />
        <Route path='/problem/:id' element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />} />
        <Route path='/my-problems' element={isSignedIn ? <MyProblemsPage /> : <Navigate to={"/"} />} />
        <Route path='/my-problems/new' element={isSignedIn ? <ProblemEditorPage /> : <Navigate to={"/"} />} />
        <Route path='/my-problems/:id/edit' element={isSignedIn ? <ProblemEditorPage /> : <Navigate to={"/"} />} />
        <Route path='/interviews' element={isSignedIn ? <InterviewHistoryPage /> : <Navigate to={"/"} />} />
        <Route path='/interviews/new' element={isSignedIn ? <InterviewSetupPage /> : <Navigate to={"/"} />} />
        <Route path='/analytics' element={isSignedIn ? <AnalyticsPage /> : <Navigate to={"/"} />} />
        <Route path='/supervisor' element={isSignedIn ? <SupervisorDashboardPage /> : <Navigate to={"/"} />} />
        <Route path='/session/:id' element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
        <Route path='/session/:id/review' element={isSignedIn ? <SessionReviewPage /> : <Navigate to={"/"} />} />
        <Route path='/session/:id/report' element={isSignedIn ? <SessionReportPage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  )
}

export default App
