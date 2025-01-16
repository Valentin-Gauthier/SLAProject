import { useState, useRef } from "react";
import { TiLocationArrow } from "react-icons/ti";

export const BentoTilt = ({ children, className = "" }) => {
  const [transformStyle, setTransformStyle] = useState("");
  const itemRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!itemRef.current) return;

    const { left, top, width, height } =
      itemRef.current.getBoundingClientRect();

    const relativeX = (event.clientX - left) / width;
    const relativeY = (event.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 5;
    const tiltY = (relativeX - 0.5) * -5;

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`;
    setTransformStyle(newTransform);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
  };

  return (
    <div
      ref={itemRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
      id="documentation"
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ title, description, link, Style}) => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverOpacity, setHoverOpacity] = useState(0);
  const hoverButtonRef = useRef(null);

  const handleMouseMove = (event) => {
    if (!hoverButtonRef.current) return;
    const rect = hoverButtonRef.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setHoverOpacity(1);
  const handleMouseLeave = () => setHoverOpacity(0);

  return (
    <div className="relative size-full" style={Style}>
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">{title}</h1>
          {description && (
            <p className="mt-3 text-xs md:text-xl">{description}</p>
          )}
        </div>

        
        <div
          ref={hoverButtonRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="border-hsla relative flex w-fit cursor-pointer items-center gap-1 overflow-hidden rounded-full bg-black px-5 py-2 text-xs uppercase text-white/20"
        >
          {/* Radial gradient hover effect */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
            style={{
              opacity: hoverOpacity,
              background: `radial-gradient(100px circle at ${cursorPosition.x}px ${cursorPosition.y}px, #656fe288, #00000026)`,
            }}
          />
          <a className="flex items-center space-x-2" href={link} target="_blank" rel="noopener noreferrer">
            <button>SOURCE</button>
            <TiLocationArrow />
          </a>
        </div>
      </div>
    </div>
  );
};

const Documentation = () => (
  <section className="bg-black pb-52">
    <div className="container mx-auto px-3 md:px-10">
      <div className="px-5 py-32">
        <p className="font-circular-web text-lg text-blue-50">
          Documentation
        </p>
        <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
          Pour les plus curieux, découvrez ici les détails du projets,
          en passant par React et Tailwind jusqu'au méthodes de clustering.
        </p>
      </div>

      <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[80vh]">
        <BentoCard
          title={
            <>
              clusteri<b>n</b>g
            </>
          }
          description={
            <>
              <p>
              Le clustering k-means est une méthode de quantification vectorielle, qui vise à répartir n observations en k grappes dans lesquelles chaque observation appartient à la grappe dont la moyenne est la plus proche (centre de la grappe ou centroïde de la grappe), qui sert de prototype de la grappe. Il en résulte un partitionnement de l'espace de données en cellules de Voronoï. Le regroupement par k-means minimise les variances à l'intérieur des grappes (distances euclidiennes au carré), mais pas les distances euclidiennes régulières, ce qui serait le problème de Weber le plus difficile : la moyenne optimise les erreurs au carré, alors que seule la médiane géométrique minimise les distances euclidiennes. Par exemple, de meilleures solutions euclidiennes peuvent être trouvées en utilisant les k-médianes et les k-médoïdes.
              </p>
              <br />
              <p>
              Le problème des k-médoïdes est un problème de regroupement similaire à celui des k-means. Les algorithmes k-means et k-medoids sont tous deux partitionnels (ils divisent l'ensemble de données en groupes) et tentent de minimiser la distance entre les points étiquetés comme faisant partie d'un groupe et un point désigné comme étant le centre de ce groupe. Contrairement à l'algorithme k-means, k-medoids choisit des points de données réels comme centres (médoïdes ou exemplaires), ce qui permet une plus grande interprétabilité des centres de grappes que dans k-means, où le centre d'une grappe n'est pas nécessairement l'un des points de données d'entrée (il s'agit de la moyenne entre les points de la grappe).
              </p>
              <br />
              <p>
              Dans le domaine de l'exploration de données et des statistiques, le clustering hiérarchique (également appelé analyse de cluster hiérarchique ou HCA) est une méthode d'analyse de cluster qui cherche à construire une hiérarchie de clusters. Les stratégies de regroupement hiérarchique se répartissent généralement en deux catégories. L'approche agglomérative : il s'agit d'une approche « ascendante », chaque observation commence dans sa propre grappe et les paires de grappes sont fusionnées au fur et à mesure que l'on s'élève dans la hiérarchie. Divisif : il s'agit d'une approche « descendante », toutes les observations commencent dans une seule grappe et les scissions sont effectuées de manière récursive au fur et à mesure que l'on descend dans la hiérarchie. En général, les fusions et les divisions sont déterminées de manière avide. Les résultats de la classification hiérarchique sont généralement présentés sous la forme d'un dendrogramme.
              </p>
            </>
          }
          link="https://scikit-learn.org/1.5/modules/clustering.html#overview-of-clustering-methods"
          Style={{background: "linear-gradient(135deg, #4e2a2a, #121212)"}}
        />
      </BentoTilt>

      <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
        <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
          <BentoCard
            title={
              <>
                methodes de co<b>m</b>paraison
              </>
            }
            description={
              <>
              <p>
              Le Longest Common Subsequence (LCS), ou Plus Longue Sous-Séquence Commune, est un algorithme qui permet de trouver une sous-séquence ordonnée partagée par deux séquences, sans que cette sous-séquence ait besoin d’être contiguë. L’objectif est de maximiser la longueur de cette sous-séquence.
              </p>
              <br />
              <p>
                Le dynamic time warping (DTW) est un algorithme qui permet de mesurer la similarité entre deux séries temporelles, même si elles sont décalées ou déformées dans le temps. Il est couramment utilisé pour comparer des signaux (comme des enregistrements audio, des séries de données ou des trajectoires) lorsqu’il peut y avoir des variations dans la vitesse ou le rythme des séries.
              </p>
              <br />
              <p>
              Le Soft-DTW est une version différentiable du DTW. Il introduit une relaxation douce de la notion de chemin d'alignement optimal, ce qui le rend mieux adapté pour des tâches d'optimisation, comme l'entraînement de modèles d'apprentissage automatique. Contrairement au DTW classique, qui trouve le chemin unique et optimal en minimisant la distance totale, le Soft-DTW calcule une sorte de moyenne pondérée de tous les chemins possibles dans la matrice des coûts. Cela permet de rendre l'alignement plus stable et de mieux gérer le bruit ou les petites variations dans les données.
              </p>
              </>
            }
            link="https://tslearn.readthedocs.io/en/stable/auto_examples/metrics/"
            Style={{background: "linear-gradient(135deg, #000000, #434343)"}}
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
          <BentoCard
            title={
              <>
                r<b>e</b>act
              </>
            }
            description="React et Tailwind ont été utilisés pour mettre en place l'interface utilisateur. React est une bibliothèque JavaScript open-source utilisée pour construire des interfaces utilisateur spécifiquement pour les applications à page unique. Il est utilisé pour gérer l'état de l'application et pour afficher les composants de l'interface utilisateur. Tailwind est un framework CSS open-source qui permet de créer des designs personnalisés sans avoir à écrire de CSS personnalisé. Il est utilisé pour styliser les composants React et pour rendre l'interface utilisateur plus attrayante."
            link="https://fr.react.dev/"
            Style={{background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"}}
          />
        </BentoTilt>

        <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
          <BentoCard
            title={
              <>
                <b>d</b>ata
              </>
            }
            description={
              <>
                <p>
                Compréhension, nettoyage et stockage des données dans une base TimeScaleDB (extension de PostgreSQL pour les séries temporelles). Interpolation de données pour obtenir des résultats plus pertinents. Utilisation de pandas afin de visualiser et analyser les données.
                </p>
              </>
            }
            link="https://pandas.pydata.org/docs/"
            Style={{background: "linear-gradient(135deg, #8e0e00, #1a0000)"}}
          />
        </BentoTilt>
      </div>
    </div>
  </section>
);

export default Documentation;