import { useState, useEffect } from 'react'
import axios from "axios"
import HomePage from './components/HomePage'

function App() {

  const [message, setMessage] = useState("")

  // >>>> Recuperer les données du backend <<<<
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/")
        .then((response) => {
            setMessage(response.data.message);
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
  }, []);
  // >>> 

  return (
    <>
      <HomePage />
    </>
  )
}

export default App
