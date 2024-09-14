import  React ,{useRef, useEffect ,useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen ,faRotateLeft,faRotateRight ,faDownload ,faEraser,faCircle  ,faSearchPlus, faSearchMinus, faArrowsAlt, faExpand, faSquare, faFont} from '@fortawesome/free-solid-svg-icons'
import styles from './index.module.css'
import { useDispatch } from 'react-redux';
import {onActiveItemClick,onActionItemClick} from '../../slices/commandSlice';
const iconMap = {
   rotateLeft: faRotateLeft,
   rotateRight: faRotateRight,
   pen: faPen,
   eraser: faEraser,
   circle: faCircle,
   rectangle:faSquare,
   ellipse:faCircle,
   text:faFont,
   download: faDownload,
   zoomIn: faSearchPlus,
   zoomOut: faSearchMinus,
   pan: faArrowsAlt,
   zoomExtent: faExpand,
 };

const Toolbar = ({direction ="horizontal" ,theme="light", items=[]})=>{
  const [showTooltip, setShowTooltip] = useState(null);
  const dispatch = useDispatch();
  const handleClick = (CommandName,isActionButton)=>{
    if(isActionButton)
      dispatch(onActionItemClick(CommandName));
    else
       dispatch(onActiveItemClick(CommandName));
  }
  
  return (
    <div  className={`
      ${styles.toolbarContainer}
      ${theme === 'light' ? styles.toolbarContainerLight : styles.toolbarContainerDark }  
      ${direction === 'vertical' ? styles.toolbarContainerVertical : styles.toolbarContainerHorizontal } 
      select-none
     `}
     onMouseDown={(e)=> e.stopPropagation() } 
     >

      {items.map((item, index) => (
        <div
            key={index}
            className={styles.iconwrapper}
            onClick={() => handleClick(item.CommandName, item.isActionButton)}
            onMouseEnter={() => setShowTooltip(index)}
            onMouseLeave={() => setShowTooltip(null)}
            >
            <FontAwesomeIcon icon={iconMap[item.icon]} />
            {showTooltip === index && (
              <div className={`
                ${theme === 'light' ? styles.tooltipLight : styles.tooltipDark }  
                ${direction === 'vertical' ? styles.tooltipVertical : styles.tooltipHorizontal } 
               `}
              >{item.CommandName || "Tooltip"}</div>
            )}
      </div>
      ))}
     
    </div>
  )
}

export default Toolbar;