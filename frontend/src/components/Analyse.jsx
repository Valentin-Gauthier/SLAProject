import { TiLocationArrow } from "react-icons/ti";
import { Link } from "react-router-dom";

import Comparaison from './Comparaison'
import Clustering from './Clustering'
import Button from './Button'

const Analyse = () => {
    
  return (
    <div className="w-full flex flex-col items-center space-y-8" style={{marginTop: '10px'}}>
        {/* Comparaison des patients */}
        <div className="w-4/5 h-2/3  min-w-[2/3] min-h-[3/4] max-h-[2/3]"
          style={{
            maxHeight : '52rem',
            minHeight : '52rem',
            overflow : 'hidden',
          }}>
            <Link to="/">
              <Button 
                id="Accueil"
                title="Accueil"
                rightIcon={<TiLocationArrow />}
                containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
                link="/"
              />
            </Link>
            <h3 className="text-2xl font-semibold mb-4">Comparaison des patients</h3>
            <Comparaison />
        </div>

        {/* Clustering */}
        <div className="w-4/5 h-2/3  min-w-[2/3] min-h-[3/4] max-h-[2/3]"
          style={{
            maxHeight : '52rem',
            minHeight : '52rem',
            overflow : 'hidden',
            marginBottom: '10px'
          }}>
            <Link to="/">
              <Button 
                id="Accueil"
                title="Accueil"
                rightIcon={<TiLocationArrow />}
                containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
                link="/"
              />
            </Link>
            <h3 className="text-2xl font-semibold mb-4">Clustering</h3>
            <Clustering />
        </div>
    </div>
  )
}

export default Analyse