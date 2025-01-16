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
                setPatientsId(response.data.patient_ids)
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

     {/* url de l'image generer par le clustering*/}
     const [imageHtmlClustering, setImageHtmlClustering] = useState()

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
                {/* Recuperer les données  et les mettre dans le format => [id_cluster : [liste des patients],...] */ }
                setClusters(response.data)
                const cacheBuster = new Date().getTime(); // Horodatage unique
                const imageUrl = `/visuals/clusteringTotal.html?t=${cacheBuster}`; // Ajout du cache buster à l'URL
                setImageHtmlClustering(imageUrl);
            })
            .catch( error => {
                console.error("Erreur lors de la requete : ", error)
            })
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

    {/* Strategie de clustering selectionnee */ }
    const [strategieClustering, setStrategieClustering] = useState("kmeans")
    const StrategiesClustering = [
        {value: "kmeans", label:"K-Means"}, 
        {value: "hirarchical_clustering", label:"Hierarchical Clustering"},
        {value: "dbscan", label:"DBSCAN"}, 
    ]
    {/* nombre de cluster choisi */ }
    const [nombreClusters, setNombreCluster] = useState(1)

    {/* Strategie de comparaison */ }
    const [strategieComparaison, setStrategieComparaison] = useState("lcss")

    const [clustersGenerer, setClustersGenerer] = useState([])

    const GenererClusters = () => {
        {/* préparation de la requete */ }
        let url = `http://127.0.0.1:8000/cluster/cluster?`

        url += `clusteringStrategy=${strategieClustering}&`
        url += `comparisonStrategy=${strategieComparaison}&`
        url += `nbCluster=${nombreClusters}&`

        const listedPatient = patientSelectionner
        .map(patient => `listeIdPatients=${patient}`)
        .join("&")
        url += `${listedPatient}`

        console.log("url finale :" , url)
        {/* Fermer le formulaire */ }
        setAfficherFormulaire(!afficherFormulaire)

        axios
            .get(url)
            .then( response => {
                console.log("Reponse de la requete :", response.data)
                {/* Recuperer les données  et les mettre dans le format => [id_cluster : [liste des patients],...] */ }
                setClusters(response.data.cluster_to_patients)
                const cacheBuster = new Date().getTime(); // Horodatage unique
                const imageUrl = `${response.data.visualization_path}?t=${cacheBuster}`; // Ajout du cache buster à l'URL
                setImageHtmlClustering(imageUrl);
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
                                    setPatientSelectionner(patientSelectionner.filter( (id) => id !== patientId))
                                    GetPatientData(patientId)
                                } else {
                                    {/* sinon on l'ajoute et on recupere les données*/}
                                    setPatientSelectionner([...patientSelectionner, patientId])
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
                        "Clusters" : "Graphique"
                    }
                </h3>
                <div className="w-100% h-100% flex justify-center items-center"
                    style={{
                        maxHeight : '38.9rem',
                        minHeight : '38.9rem',
                        overflow : 'auto',
                    }}>
                    {modCluster ? (
                        Object.entries(clusters).map(([clusterId, patients]) => { // Parcourt chaque cluster par [clusterId, patients]
                            return (
                                <div
                                    key={clusterId} // Clé unique pour chaque cluster
                                    onClick={() => setIdClusterSelectionner(clusterId)} // Sélectionne le cluster au clic
                                    className="dark:bg-slate-800 dark:hover:bg-slate-700 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-between transition-all cursor-pointer hover:shadow-xl"
                                >
                                    {/* Affichage du numéro du cluster */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-800 dark:text-slate-100 font-semibold text-lg">
                                            {`Cluster ${clusterId}`}
                                        </span>
                                    </div>

                                    {/* Affichage du nombre de patients */}
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        {patients.length > 0
                                            ? `${patients.length} patient${patients.length > 1 ? 's' : ''}`
                                            : "Aucun patient"}
                                    </span>
                                </div>
                                
                            );
                            
                        })
                    ) :
                    PlotlyPatientsDatas ? (
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
                            <option value="ward">Ward Hierarchical Clustering</option>
                            <option value="kmedoids">K-medoids</option>
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

                    {/* Type de methodes de comparaison*/}
                    <div className="mb-4">
                        <label
                        htmlFor="methodComparaison"
                        className="block white font-medium mb-2"
                        >
                            Type de méthode de comparaison :
                        </label>
                        <select
                            id="methodComparaison"
                            name="methodComparaison"
                            value={strategieComparaison}
                            onChange={(e) => setStrategieComparaison(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            >
                                <option value="lcss">Longuest Common SubSequence</option>
                                <option value="dtw">Dynamic Time Warping</option>
                                <option value="soft_dtw">Soft Dynamic Time Warping</option>
                                <option value="tsl_dtw">TsLearn Dynamic Time Warping</option>
                        </select>
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
                    {Object.entries(clusters)
                        .filter(([clusterId]) => clusterId === idClusterSelectionner.toString()) // Filtrer par idClusterSelectionner
                        .map(([clusterId, patients]) => { // Déstructurer les entrées du cluster
                            return patients.length > 0 ? (
                                patients.map((patientId) => (
                                    <div
                                        key={patientId}
                                        className="dark:bg-slate-700 dark:hover:bg-slate-600 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex items-center transition-all cursor-pointer"
                                    >
                                        <span className="text-slate-800 dark:text-slate-100 font-medium">
                                            {`Patient ${patientId}`}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-800 dark:text-slate-100 text-center">
                                    Aucun patient dans ce cluster.
                                </p>
                            );
                        })}
                </div>

                {/* Boutons */}
                <div className="flex justify-end gap-2">
                    <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded-md"
                    onClick={() => {
                        setAfficherCluster(!afficherCluster)
                        setIdClusterSelectionner("")
                    }}
                    >
                        Annuler
                    </button>
                </div>
                </div>
            </div>
        )}
        </div>
        {/* IMAGE HTML CLUSTERING */}
        {imageHtmlClustering && (
            <iframe
                key={imageHtmlClustering}
                src={imageHtmlClustering}
                title="Clustering Visualization"
                style={{ width: '100%', height: '500px', border: 'none' }}
            />
        )}
    </div>
  )
}

export default Clustering