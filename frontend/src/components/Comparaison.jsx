import { useState, useEffect, useRef } from 'react'
import { createSwapy } from 'swapy'
import Search from './Search'
import PlotlyLineGraph from "./PlotlyLineGraph"
import axios from "axios" 
import { Link } from "react-router-dom";

const Comparaison = () => {

    {/* --------------- Recuperer tous les patients  ----------------------*/}
     {/*  liste des id des patients */ }
    const [patientsId, setPatientsId] = useState([])

    {/*  liste des id des patients selectionner  */ }
    const [patientSelectionner, setPatientSelectionner] = useState([])

    const GetPatientsId = () => {
        {/* préparation de la requete */ }
        let url = "http://127.0.0.1:8000/allpatient"
        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données */ }
                setPatientsId(response.data.patient_ids)
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })
    }

    useEffect( () => {
        GetPatientsId()
    },[])

    {/* --------------------------- COMPARAISON DES PATIENTS  -------------------------------*/}

    {/*  url de l'image   */ }
    const [imageComparaison, setImageComparaison] = useState(null)

    {/*  methode de comparaison selectionné  */ }
    const [methodeComparaison, setMethodeComparaison] =  useState("lcss")

    const handleMethodeComparaison= (e) => {
        setMethodeComparaison(e.target.value)
    }

    {/*  methode de comparaison disponible  */ }
    const methodesComparaison = [
        {value: "lcss", label:"Longuest Common SubSequence"},
        {value: "dtw", label:"Dynamic Time Warping"},
        {value: "soft_dtw", label:"Soft Dynamic Time Warping"},
        {value: "tsl_dtw", label:"TsLearn Dynamic Time Warping"},
    ]

    {/*  boolean de multivariance */ }
    const [multiVariance, setMultiVariance] = useState(false)

    {/*  matrice de distance */ }
    const [matriceDistance, setMatriceDistance] = useState([])

    const getComparaison = () => {
        {/* préparation de la requete */ }
        let url = "http://127.0.0.1:8000/comparison?"
        {/* ajouter les patients sélectionnés */ }
        const values = patientSelectionner
        .map(patient => `values=${patient}`)
        .join("&")
        url += `${values}`
        {/* ajouter la méthode de comparaison choisit */ }
        url += `&metric=${methodeComparaison}`
        {/* ajouter l'état de la multiVariance */ }
        url += `&multi=${multiVariance}`

        console.log("URL finale :", url)

        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données */ }
                setMatriceDistance(response.data)
                {/* Recuperer l'image */ }
                let image = "/visuals/"
                if (patientSelectionner.length === 2){
                    image += "compPlot.png"
                } else {
                    image += "HeatMap.png"
                }
                // Ajouter un timestamp pour éviter la mise en cache
                const cacheBuster = new Date().getTime(); // Horodatage unique
                const imageUrl = `${image}?t=${cacheBuster}`;
                setImageComparaison(imageUrl)
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })
    }

    {/* --------------- Recuperer les données d'un patient en fonction de son id  ----------------------*/}
    {/* liste des données des patients selectionnées */}
    const [patientsDatas, setPatientsDatas] = useState([])

    const GetPatientData = (id_patient) => {
        // Préparation de la requête
        let url = `http://127.0.0.1:8000/patient?id=${id_patient}`;
    
        axios
            .get(url)
            .then(response => {
                console.log("Données reçues :", response.data.patients);
                // Récupérer les données et les ajouter si elles ne sont pas déjà présentes
                setPatientsDatas(prevPatientsDatas => {
                    const patientExist = prevPatientsDatas.some(patient => patient.id === id_patient);
                    if (!patientExist) {
                        return [...prevPatientsDatas, ...response.data.patients];
                    } else {
                        console.log(`Les données du patient ${id_patient} sont déjà chargées`);
                        return prevPatientsDatas.filter(patient => patient.id !== id_patient);
                    }
                });
            })
            .catch(error => {
                console.error("Erreur lors de la requête : ", error);
            });
    };

    {/* recuperer les données de tous les patients selectionné */}
    const GetPatientsDatas = () => {
        for( const id_patient of patientSelectionner){
            GetPatientData(id_patient)
            console.log("Recuperation des donnees pour le patient :", id_patient)
        }
    }

    const formatDataForPlotly = () => {
        const formattedData = [];
        console.log("Données avant formatage :", patientsDatas);
    
        patientsDatas.forEach(patient => {
            const { id, courbes } = patient;
            Object.keys(courbes).forEach(key => {
                const { nbJours: x, yData: y } = courbes[key];
                formattedData.push({
                    x: x, 
                    y: y, 
                    type: 'scatter',
                    mode: 'lines',
                    name: `${key} (Patient ${id})`
                });
            });
        });
    
        return formattedData;
    };
    

    const [PlotlyPatientsDatas,setPlotlyPatientsDatas] = useState()
    
    useEffect( () => (
    setPlotlyPatientsDatas(formatDataForPlotly())
    ),[patientsDatas])


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
    <div className='w-100% h-100%'
    style={{ background: "linear-gradient(135deg, #05192d, #1b4d4b)" }}
    >
        
        {/* Parametres */}
        <div className='w-100%'>
            <div className="flex justify-between items-center px-4 py-2 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Parametres</h3>
                <div className="flex items-center gap-4">
                <Link to="/">
                <button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                        >Accueil
                        
                    </button>
                </Link>
                <Link to="/clustering">
                <button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                        >Clustering
                        
                    </button>
                </Link>
                    
                    {/* Variation Boolean  */}
                    <div className="flex items-center">
                        <span className="text-slate-900 dark:text-slate-100 mr-2 text-sm">Multivariable :</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={multiVariance}
                                onChange={() => setMultiVariance(!multiVariance)} 
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
                                <div>
                                    {patientsId && patientsId.length > 0 && (
                                        <div>
                                            {(() => {
                                                const patientElements = [];
                                                for (const patientId of patientsId) {
                                                    patientElements.push(
                                                        <div
                                                            key={patientId}
                                                            onClick={() => {
                                                                const alreadySelected = patientSelectionner.includes(patientId);
                                                                if (alreadySelected) {
                                                                    // Si l'ID est déjà dans la liste, on l'enlève
                                                                    setPatientSelectionner(patientSelectionner.filter((id) => id !== patientId));
                                                                    GetPatientData(patientId)
                                                                } else {
                                                                    // Sinon, on l'ajoute et on récupère les données
                                                                    setPatientSelectionner([...patientSelectionner, patientId]);
                                                                    GetPatientData(patientId);
                                                                }
                                                            }}
                                                            className={`${
                                                                patientSelectionner.includes(patientId)
                                                                    ? 'bg-green-500 dark:hover:bg-green-300'
                                                                    : 'dark:bg-slate-700 dark:hover:bg-slate-600'
                                                            } p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer`}
                                                        >
                                                            <span className="text-slate-800 dark:text-slate-100 font-medium">
                                                                {`Patient ${patientId}`}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return patientElements;
                                            })()}
                                        </div>
                                    )}
                                </div>
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
                            {PlotlyPatientsDatas ? (
                                <PlotlyLineGraph
                                    data={PlotlyPatientsDatas}
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
                        <label id="select-method" className='text-white'>Selectionnez une méthode : </label>
                        <select
                            id="methode-select"
                            className="w-30 p-2 border border-gray-300 rounded-md"
                            value={methodeComparaison || ''}
                            onChange={handleMethodeComparaison}
                        >
                            {methodesComparaison
                                .filter((methode) => !(patientSelectionner.length <= 2 && methode.value === "dtw"))
                                .map((methode) => (
                                    <option key={methode.value} value={methode.value}>
                                        {methode.label}
                                    </option>
                                ))}
                        </select>   
                        { ((patientSelectionner.length >= 2 && !multiVariance) || (patientSelectionner.length >= 3 && multiVariance && methodeComparaison === "dtw")) && (
                            <>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
                                    onClick={()=>getComparaison()}
                                >
                                    Comparer
                                </button>
                                <div>
                                    {imageComparaison && (
                                        <img src={imageComparaison} alt="Image de Comparaison" />
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