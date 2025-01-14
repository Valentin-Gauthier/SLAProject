import { useState, useEffect, useRef } from 'react'
import { createSwapy } from 'swapy'
import Search from './Search'
import axios from "axios" 
import PlotlyLineGraph from "./PlotlyLineGraph"

const Clustering = () => {

    {/* Init Fetching patient list*/}
    const [patients, setPatients] = useState([])
  
    const getPatient = () => {
        axios.get("http://127.0.0.1:8000/sequences/sequences") 
        .then(response => {
            console.log(response.data)
            // check data
            if( Array.isArray(response.data)){
                setPatients(response.data)
            } else {
                console.error("The data received is not an array", response.data)
                setPatients([]) //default
            }  
        }).catch(error => {
            console.log("Error when fetching datas : ",error)
        })
    }
    // call getPatient only one time
    useEffect( () => {
        getPatient()
    }, [])

    
    {/* patients list selected*/}
    const [selectedPatients, setSetlectedPatients] = useState([])

    useEffect( () => {
        // FETCH  data and add to patientsData
        console.log("Selected Patients : ", selectedPatients)
    }, [selectedPatients])


    {/* On patient Click  fetching Patient data */}
    const [patientsData, setPatientsData] = useState([])
    useEffect( () => {
        axios.get("http://127.0.0.1:8000/sequences/sequences") 
        .then(response => {
            console.log(response.data)
            // check data
            if( Array.isArray(response.data)){
                setPatientsData(response.data)
            } else {
                console.error("The data received is not an array", response.data)
                setPatientsData([]) //default
            }  
        }).catch(error => {
            console.log("Error when fetching datas : ",error)
        })

    }, [selectedPatients])


    {/* Generat Cluster with all patients */}
    const [clusters, setClusters] = useState([])

    const GetClusters = () => {
      axios.get("http://127.0.0.1:8000/sequences/sequences") 
      .then(response => {
          console.log(response.data)
          // check data
          if( Array.isArray(response.data)){
            setClusters(response.data)
          } else {
              console.error("The data received is not an array", response.data)
              setClusters([]) //default
          }  
      }).catch(error => {
          console.log("Error when fetching datas : ",error)
      })
    }

    {/* fetch all data from a cluster by his ID*/}
    const GetClusterData = (cluterId) => {

    }

    useEffect( () => {
      console.log("Clusters : ", clusters)
    }, [clusters])

    {/* --------- Mod  ------------ */}
    const [modCluster, setModCluster] = useState(false)

    useEffect( () => {
      console.log(modCluster)
      GetClusters()
      console.log("clusters : ", clusters)
    },[modCluster])

      
    const handleModCluster = () => {
      setModCluster(!modCluster)
    }


  {/* ----------------- Clustering form -------------------*/}

  const [showForm, setShowForm] = useState(false)

  const handleShowForm = () => {
    setShowForm(!showForm)
  }

  const [nbClusters, setNbClusters] = useState(1);
  const [methodCluster, setMethodCluster] = useState("kmeans");

  const GenerateClusters = () => {
    console.log("nbClusters : ", nbClusters)
    console.log("methodCluster : " , methodCluster)

    setShowForm(!showForm)
  }

  {/* ----------------- Show Patients From Cluster -------------------*/}
  
  const [clusterSelected, setClusterSelected] = useState()
  const [dataFromSelectedCluster, setDataFromSelectedCluster] = useState([])
  const [showCluster, setShowCluster] = useState(false)

  const handleShowCluster = () => {
    setShowCluster(!showCluster)
  }

  const ShowSelectedCluster = (e) => {
    setClusterSelected(e)

    setShowCluster(!showCluster)
    // setDataFromSelectedCluster()
  }



  {/* ----------------- Swapy -------------------*/}
      const swapy = useRef(null)
      const container = useRef(null)
      const [swapyLock, setSwapyLock] = useState(false)
  
      useEffect( () => {
          if(container.current) {
              swapy.current = createSwapy(container.current)
              swapy.current?.enable(swapyLock);
          }
          return () =>{
              
              swapy.current?.destroy()
          }
      }, [swapyLock]) // run on mount + when swapyLock change is value

  return (
    <div className='w-100% h-100%'>

      {/* Settings Bar */}
      <div className='w-100%'>
          <div className="flex justify-between items-center px-4 py-2 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h3>
                <div className="flex items-center gap-4">

                  {modCluster?  
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                      onClick={handleShowForm}
                    >
                      Generat personalized Cluster 
                    </button>
                    :
                    ""
                  }

                  {/* Patients list / Cluster List */}
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                    onClick={handleModCluster}
                    >
                      {modCluster ? "Mod Patients" : "Mod Cluster"}
                   
                  </button>
                    {/* Lock / UnLock Swapy mod */}
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                        onClick={() => setSwapyLock(!swapyLock)}
                    >
                        {swapyLock ? "Lock" : "UnLock"}
                    </button>
                </div>
          </div>
      </div>


      {/* ------------------ Main Container ---------------- */}
      <div ref={container} className="grid grid-cols-[3fr_10fr] gap-2 h-100% w-100% py-2">
        {/* Patients list */}
        <div data-swapy-slot="list">
          <div data-swapy-item="list" className="pt-5 space-y-6 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
              <h3 className='text-xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100'>Patients List</h3>
              {/* list container */}
              <div className='px-4'>
                  {/* search bar */}
                  <Search />
                  {/* list */}
                  <div className="space-y-4 px-1 py-2"
                  style={{
                      maxHeight : '37.8rem',
                      minHeight : '37.8rem',
                      overflow : 'auto',
                  }}>
                      {patients.map( (patient) => (
                        <div
                            key={patient.id}
                            onClick={ () => {
                                const alreadySelected = selectedPatients.find( (idpatient) => idpatient.id === patient.id)
                                if (alreadySelected){
                                    // if in the list , remove him
                                    setSetlectedPatients(selectedPatients.filter( (idpatient) => idpatient.id !== patient.id))
                                } else {
                                    // if not , add him 
                                    setSetlectedPatients([...selectedPatients, patient])
                                } 
                            }}
                            className={`${selectedPatients.find( (idpatient) => idpatient.id === patient.id)
                                ? 'bg-green-500 dark:hover:bg-green-300'
                                : 'dark:bg-slate-700 dark:hover:bg-slate-600'
                            } p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer`}
                        > 
                            <span className="text-slate-800 dark:text-slate-100 font-medium">
                                {`Patient ${patient.id}`}
                            </span>
                        </div>    
                    ))
                    
                    }
                  </div>
              </div>
          </div>
      </div>



      {/* -- Graphics --- */}
      <div data-swapy-slot="main" className="col-span-1 h-100% flex flex-col">
          <div data-swapy-item="main" className="h-100% space-y-6 pt-5 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 flex flex-col justify-center items-center">
              <h3 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
                  Graphique
              </h3>
              <div className="w-100% h-100% flex justify-center items-center"
              style={{
                maxHeight : '38.9rem',
                minHeight : '38.9rem',
                overflow : 'auto',
            }}>

              {modCluster ? 
                clusters.map( (cluster) => (
                  <div
                    key={cluster.id}
                    onClick={() => ShowSelectedCluster(cluster.id)}
                    className='dark:bg-slate-700 dark:hover:bg-slate-600 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer'
                  >
                    <span className="text-slate-800 dark:text-slate-100 font-medium">
                        {`Cluster ${cluster.id}`}
                    </span>
                  </div>
                ))
                  :
                  patientsData ? (
                      <PlotlyLineGraph
                          data={patientsData}
                          GraphTitle={"Données des Patients Sélectionnés"}
                          GraphWidth={800}
                          GraphHeight={620}
                          NameX={"Nombre de jours"}
                          NameY={"Valeurs"}
                      />
                  ) : (
                      <p>Sélectionnez des patients pour voir une analyse.</p>
                  )}
              </div>
          </div>
      </div>


      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-full max-w-lg h-full max-h-[50vh] space-y-6 pt-5 px-6 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 flex flex-col justify-between">
            <h1 className="text-2xl font-bold white mb-6 text-center">
              Formulaire de Clustering
            </h1>

            {/* Champ de sélection */}
            <div className="mb-4">
              <label
                htmlFor="method"
                className="block white font-medium mb-2"
              >
                Type de méthode :
              </label>
              <select
                id="method"
                name="method"
                value={methodCluster}
                onChange={(e) => setMethodCluster(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="kmeans">K-Means</option>
                <option value="hierarchical">Hierarchical Clustering</option>
                <option value="dbscan">DBSCAN</option>
              </select>
            </div>

            {/* Champ de saisie */}
            <div className="mb-4">
              <label
                htmlFor="clusters"
                className="block white font-medium mb-2"
              >
                Nombre de clusters :
              </label>
              <input
                type="number"
                id="clusters"
                name="clusters"
                min="1"
                className="w-full border border-gray-300 rounded-md p-2 white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={handleShowForm}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                onClick={GenerateClusters}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}


      {showCluster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-full max-w-lg h-full max-h-[50vh] space-y-6 pt-5 px-6 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 flex flex-col justify-between">
            <h1 className="text-2xl font-bold white mb-6 text-center">
              Cluster {clusterSelected}
            </h1>

            {/* lsit of patients */}
              {dataFromSelectedCluster.map( (patient) => (
                <div className='dark:bg-slate-700 dark:hover:bg-slate-600 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer'> 
                  <span className="text-slate-800 dark:text-slate-100 font-medium">
                    {`Patient ${patient.id}`}
                </span>
                </div>
              ))
              }
            {/* Boutons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded-md"
                onClick={handleShowCluster}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default Clustering