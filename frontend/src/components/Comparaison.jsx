import { useState, useEffect, useRef } from 'react'
import { createSwapy } from 'swapy'
import Search from './Search'
import PlotlyLineGraph from "./PlotlyLineGraph"
import axios from "axios" 

const Comparaison = () => {

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

    {/* Boolean multi variation*/}
    const [variation, setVariaton] = useState(false)

    {/* Comparaison Methods*/}
    const [method, setMethod] = useState("lcss")

    const methods = [
        {value: "lcss", label:"Longuest Common SubSequence"},
        {value: "dtw", label:"Dynamic Time Warping"},
        {value: "soft_dtw", label:"Soft Dynamic Time Warping"},
        {value: "tsl_dtw", label:"TsLearn Dynamic Time Warping"},
    ]
    useEffect( () => {
        console.log("method : ", method)
    }, [method])

    const handleChangeMethodeComparaison = (e) => {
        const selectedValue = e.target.value;
        setMethod(selectedValue);
    }
    
    {/* Image result*/}
    const [resultImage, setResultImage] = useState("")

    const getResultImage = () => {
        axios.get(`http://127.0.0.1:8000/method=${method}&variation=${variation}`)
        .then(response => {
            console.log(response.data)
            setResultImage(response.data)

        }).catch(error => {
            console.log("Error when fetching datas : ",error)
        })
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
    // Component
    <div className='w-100% h-100%'>
        
        {/* Settings Bar */}
        <div className='w-100%'>
            <div className="flex justify-between items-center px-4 py-2 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h3>
                <div className="flex items-center gap-4">
                    
                    {/* Variation Boolean  */}
                    <div className="flex items-center">
                        <span className="text-slate-900 dark:text-slate-100 mr-2 text-sm">Multiple Variations :</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={variation}
                                onChange={() => setVariaton(!variation)} 
                            />
                            <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-400 dark:peer-focus:ring-green-600 transition-all"/>
                        </label>
                    </div>

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
        <div ref={container} className="grid grid-cols-[3fr_6fr_4fr] gap-2 h-100% w-100% py-2">
            {/* Patients list */}
                <div data-swapy-slot="list">
                    <div data-swapy-item="list" className="pt-5 space-y-6 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
                        <h3 className='text-xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100'>Patients</h3>
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
                                ))}
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
                        <div className="w-100% h-100% flex justify-center items-center">
                            {patientsData ? (
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



                {/* Comparaison */}
                <div className="col-span-1 h-full overflow-y-auto" data-swapy-slot="explications">
                    <div
                        data-swapy-item="explications"
                        className="h-full space-y-6 pt-5 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700"
                    >
                        <h3 className="text-xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
                            Comparaison des Patients Selectionnés
                        </h3>
                        <label id="select-method">Selectionnez une méthode : </label>
                        <select
                            id="methode-select"
                            className="w-30 p-2 border border-gray-300 rounded-md"
                            value={method || ''}
                            onChange={handleChangeMethodeComparaison}
                        >
                            {methods.map((method) => (
                            <option key={method.value} value={method.value}>
                                {method.label}
                            </option>
                            ))}
                        </select>   
                        { selectedPatients.length >= 2 && (
                            <>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
                                    onClick={getResultImage}
                                >
                                    Comparer
                                </button>
                                <div>
                                    {resultImage && (
                                        <img src={resultImage} alt="Image de Comparaison" />
                                    )}
                                </div>
                            </>
                            
                            )}
                           
                    </div>
                </div>


        </div>
    </div>
  )
}

export default Comparaison