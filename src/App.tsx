import { LocalizationProvider } from '@mui/x-date-pickers'
import './App.css'
import { RegistrationForm } from './components/RegistrationForm'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function App() {
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RegistrationForm />
      </LocalizationProvider>
    </>
  )
}

export default App
