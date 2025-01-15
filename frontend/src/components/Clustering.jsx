import { useState, useEffect, useRef } from 'react'
import { createSwapy } from 'swapy'
import Search from './Search'
import PlotlyLineGraph from "./PlotlyLineGraph"
import axios from "axios" 

const Clustering = () => {

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

    {/*  liste des id des patients selectionner  */ }
    const [patientSelectionner, setPatientSelectionner] = useState([])


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
        for( const id_patient of patientSelectionner){
            GetPatientData(id_patient)
            console.log("Recuperation des donnees pour le patient :", id_patient)
        }
    }


    {/* --------------------------- CLUSTERING  -------------------------------*/}

    {/* liste des clusters (avec les patients ) */}
    const [clusters, setClusters] = useState([])

    {/* recuperer les clusters "par defaut" */}
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

    const [clustersGenerer, setClustersGenerer] = useState([])

    const GenererClusters = () => {
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
        {/* Fermer le formulaire */ }
        setAfficherFormulaire(!afficherFormulaire)

        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données */ }
                setClustersGenerer(response.data)
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })

    }


    {/* Changement de mod -> recuperer les clusters "par defaut" et les patients */ }
    const [modCluster, setModCluster] = useState(false)

    useEffect( () => {
        GetClusters()
    }, [modCluster])

    {/* affichage des modals */ }
    const [idClusterSelectionner, setIdClusterSelectionner] = useState()
    const [afficherCluster, setAfficherCluster] = useState(false)
    const [afficherFormulaire, setAfficherFormulaire] = useState(false)

    {/* ouvrire la modals pour afficher les patients du cluster selectionner */ }
    useEffect( () => {
        setAfficherCluster(idClusterSelectionner)
    },[idClusterSelectionner])
    

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
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Parametres</h3>
                <div className="flex items-center gap-4">

                    {modCluster?  
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                        onClick={ () => setAfficherFormulaire(!afficherFormulaire) }
                    >
                        Generer un Cluster Personnalise
                    </button>
                    :
                    ""
                    }

                    {/* Patients list / Cluster List */}
                    <button
                    className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm"
                    onClick={() => setModCluster(!modCluster)}
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
                <h3 className='text-xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100'>Liste des Patients</h3>
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
                                    {/* sinon on l'ajoute et on recupere les données*/}
                                    setSetlectedPatients([...patientSelectionner, patientId])
                                    GetPatientData(patientId)
                                } 
                            }}
                            className={`${patientSelectionner.includes(patientId)
                                ? 'bg-green-500 dark:hover:bg-green-300'
                                : 'dark:bg-slate-700 dark:hover:bg-slate-600'
                            } p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer`}
                        > 
                            <span className="text-slate-800 dark:text-slate-100 font-medium">
                                {`Patient ${patientId}`}
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
                    {modCluster? 
                        "Graphique" : "Clusters"
                    }
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
                    onClick={() => setIdClusterSelectionner(cluster.id)}
                    className='dark:bg-slate-700 dark:hover:bg-slate-600 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer'
                    >
                    <span className="text-slate-800 dark:text-slate-100 font-medium">
                        {`Cluster ${cluster.id}`}
                    </span>
                    </div>
                ))
                    :
                    patientsDatas ? (
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


        {afficherFormulaire && (
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
                            value={strategieClustering}
                            onChange={(e) => setStrategieClustering(e.target.value)}
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
                            id="clusters"
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
                            onChange={(e) => setNombreCluster(e.target.value)}
                            />
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end gap-2">
                        <button
                        type="button"
                        className="px-4 py-2 bg-gray-300 rounded-md"
                        onClick={() => setAfficherFormulaire(!afficherFormulaire)}
                        >
                        Annuler
                        </button>
                        <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
                        onClick={() => GenererClusters()}
                        >
                        Generer
                        </button>
                    </div>
                </div>
            </div>
        )}


        {afficherCluster && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-full max-w-lg h-full max-h-[50vh] space-y-6 pt-5 px-6 bg-slate-100/70 rounded-xl shadow-md border border-slate-300 dark:bg-slate-800/50 dark:border-slate-700 flex flex-col justify-between">
                <h1 className="text-2xl font-bold white mb-6 text-center">
                    Cluster {afficherCluster}
                </h1>

                {/* Liste des patients du cluster */}
                <div className="space-y-2 overflow-y-auto">
                    {clustersGenerer.cluster_to_patients[idClusterSelectionner]?.map((patientId) => (
                        <div
                            key={patientId}
                            className="dark:bg-slate-700 dark:hover:bg-slate-600 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer"
                        >
                            <span className="text-slate-800 dark:text-slate-100 font-medium">
                                {`Patient ${patientId}`}
                            </span>
                        </div>
                    )) || (
                        <p className="text-slate-800 dark:text-slate-100 text-center">
                            Aucun patient dans ce cluster.
                        </p>
                    )}
                </div>

                {/* Boutons */}
                <div className="flex justify-end gap-2">
                    <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => setAfficherCluster(!afficherCluster)}
                    >
                        Annuler
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