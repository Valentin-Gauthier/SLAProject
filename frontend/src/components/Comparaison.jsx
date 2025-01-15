import { useState, useEffect, useRef } from 'react'
import { createSwapy } from 'swapy'
import Search from './Search'
import PlotlyLineGraph from "./PlotlyLineGraph"
import axios from "axios" 

const Comparaison = () => {

    {/* --------------- Recuperer tous les patients  ----------------------*/}
     {/*  liste des id des patients */ }
    const [patientsId, setPatientsId] = useState([])

    const GetPatientsId = () => {
        {/* préparation de la requete */ }
        let url = "http://127.0.0.1:8000/allpatient"
        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données */ }
                setPatientsId(response.data)
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

    {/*  liste des id des patients selectionner  */ }
    const [patientSelectionner, setPatientSelectionner] = useState([])

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
        .map(patient => `value=${patient}`)
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
                let image = "../../../visuals/"
                if (patientSelectionner.length === 2){
                    image += "compPlot.png"
                } else {
                    image += "HeatMap.png"
                }
                console.log("Image url :" , image)
                setImageComparaison(image)
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })
    }

    {/* --------------- Recuperer les données d'un patient en fonction de son id  ----------------------*/}
    {/* liste des données des patients selectionnées */}
    const [patientsDatas, setPatientsDatas] = useState([])

    const GetPatientData = (id_patient) => {
        {/* préparation de la requete */ }
        let url = `http://127.0.0.1:8000/patient?id=${id_patient}`

        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données et les ajouter a la liste */ }
                setPatientsDatas(Datas => [...Datas, response.data])

            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })
    }

    {/* recuperer les données de tous les patients selectionné */}
    const GetPatientsDatas = () => {
        for( const id_patient of patientSelectionner.patient_ids){
            GetPatientData(id_patient)
            console.log("Recuperation des donnees pour le patient :", patientSelectionner.patient_ids)
        }
    }
    {/* --------------------------- CLUSTERING  -------------------------------*/}

    {/* liste des clusters (avec les patients ) */}
    const [clusters, setClusters] = useState([])
    
    const GetClusters = () => {
        {/* préparation de la requete */ }
        let url = `http://127.0.0.1:8000/cluster/get_all_clusters_and_patients`

        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données */ }
                setClusters(response.data)
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })
    }

     {/* Strategie de clustering selectionnee */ }
    const [strategieClustering, setStrategieClustering] = useState("kmean")
    const StrategiesClustering = [
        {value: "kmean", label:"K-Means"},
        {value: "hirarchical_clustering", label:"Hierarchical Clustering"},
        {value: "dbscan", label:"DBSCAN"}, 
    ]
    {/* nombre de cluster choisi */ }
    const [nombreClusters, setNombreCluster] = useState(1)

    {/* Strategie de comparaison */ }
    const [strategieComparaison, setStrategieComparaison] = useState("None")

    const [clusterGenerer, setClusterGenerer] = useState([])

    const GenererCluster = () => {
        {/* préparation de la requete */ }
        let url = `http://127.0.0.1:8000/cluster/cluster?`

        url += `clusteringStrategy=${strategieClustering}&`
        url += `comparisonStrategy=${strategieComparaison}&`
        url += `nbCluster=${nombreClusters}&`

        const listedPatient = patientSelectionner
        .map(patient => `listedPatients=${patient}`)
        .join("&")
        url += `${listedPatient}`

        console.log("url finale :" , url)

        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données */ }
                setClusterGenerer(response.data)
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
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
    <div className='w-100% h-100%'>
        
        {/* Parametres */}
        <div className='w-100%'>
            <div className="flex justify-between items-center px-4 py-2 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Parametres</h3>
                <div className="flex items-center gap-4">
                    
                    {/* Variation Boolean  */}
                    <div className="flex items-center">
                        <span className="text-slate-900 dark:text-slate-100 mr-2 text-sm">Variation Multiple :</span>
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
                                {patientsId.map( (patientId) => (
                                    <div
                                        key={patientId}
                                        onClick={ () => {
                                            const alreadySelected = patientSelectionner.includes(patientId)
                                            if (alreadySelected){
                                                {/*  si il est dans la liste on l'enleve*/}
                                                setSetlectedPatients(patientSelectionner.filter( (id) => id !== patientId))
                                            } else {
                                                {/* sinon on l'ajoute */}
                                                setSetlectedPatients([...patientSelectionner, patientId])
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
                            {patientsDatas ? (
                                <PlotlyLineGraph
                                    data={patientsDatas}
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
                            value={methodeComparaison || ''}
                            onChange={handleMethodeComparaison}
                        >
                            {methodesComparaison.map( (methode) => (
                            <option key={methode.value} value={methode.value}>
                                {methode.label}
                            </option>
                            ))}
                        </select>   
                        { patientSelectionner.length >= 2 && (
                            <>
                                <button
                                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600"
                                    onClick={getResultImage}
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