import { useUser } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Route, Routes, useLocation } from 'react-router'
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
import InterviewErrorBoundary from './components/InterviewErrorBoundary'

function App() {

  const { isSignedIn, isLoaded } = useUser()
  const location = useLocation()

  //get rid of flickering
  if (!isLoaded) return null;

  const requestedPath = new URLSearchParams(location.search).get("redirect")
  const signedInDestination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
    ? requestedPath
    : "/dashboard"
  const signInDestination = `/?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`
  const protectedPage = (page) => isSignedIn ? page : <Navigate to={signInDestination} replace />

  return (
    <>
      <Routes>
        <Route path='/' element={!isSignedIn ? <HomePage /> : <Navigate to={signedInDestination} replace />} />
        <Route path='/dashboard' element={protectedPage(<DashboardPage />)} />
        <Route path='/problems' element={protectedPage(<ProblemsPage />)} />
        <Route path='/problem/:id' element={protectedPage(<ProblemPage />)} />
        <Route path='/my-problems' element={protectedPage(<MyProblemsPage />)} />
        <Route path='/my-problems/new' element={protectedPage(<ProblemEditorPage />)} />
        <Route path='/my-problems/:id/edit' element={protectedPage(<ProblemEditorPage />)} />
        <Route path='/interviews' element={protectedPage(<InterviewHistoryPage />)} />
        <Route path='/interviews/new' element={protectedPage(<InterviewSetupPage />)} />
        <Route path='/analytics' element={protectedPage(<AnalyticsPage />)} />
        <Route path='/supervisor' element={protectedPage(<SupervisorDashboardPage />)} />
        <Route path='/session/:id' element={protectedPage(<InterviewErrorBoundary><SessionPage /></InterviewErrorBoundary>)} />
        <Route path='/session/:id/review' element={protectedPage(<SessionReviewPage />)} />
        <Route path='/session/:id/report' element={protectedPage(<SessionReportPage />)} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  )
}

export default App
