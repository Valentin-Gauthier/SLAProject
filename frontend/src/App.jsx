import { useState, useEffect } from 'react'
import axios from "axios"

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
      <h3>{message}</h3>
    </>
  )
}

export default App
