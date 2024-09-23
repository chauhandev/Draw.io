import  React ,{useRef, useEffect ,useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen ,faRotateLeft,faRotateRight ,faDownload ,faEraser  ,faSearchPlus, faSearchMinus, faArrowsAlt, faExpand, faFont,faSlash ,faCircle} from '@fortawesome/free-solid-svg-icons';
import {faCircle as faCircleRegular, faSquare as faSquareRegular} from '@fortawesome/free-regular-svg-icons';
import styles from './index.module.css'
import { useDispatch , useSelector } from 'react-redux';
import {onActiveItemClick,onActionItemClick} from '../../slices/commandSlice';
import { COMMANDS } from '../../constants';
import { undo, redo } from '../../slices/canvasElements';
const iconMap = {
   rotateLeft: faRotateLeft,
   rotateRight: faRotateRight,
   pen: faPen,
   eraser: faEraser,
   circle: faCircleRegular ,
   rectangle:faSquareRegular,
   ellipse:faCircle,
   text:faFont,
   download: faDownload,
   zoomIn: faSearchPlus,
   zoomOut: faSearchMinus,
   pan: faArrowsAlt,
   zoomExtent: faExpand,
   line:faSlash
 };

const Toolbar = ({direction ="horizontal" ,theme="light", items=[]})=>{
  const [showTooltip, setShowTooltip] = useState(null);
  const dispatch = useDispatch();
  const canUndo = useSelector((state) => state.entities.undoStack.length > 0);
  const canRedo = useSelector((state) => state.entities.redoStack.length > 0);

  const handleClick = (CommandName,isActionButton)=>{
    if(isActionButton){
      if(CommandName === COMMANDS.UNDO ){
        dispatch(undo());
      }
      else if(CommandName === COMMANDS.REDO ){
        dispatch(redo())
      }

       dispatch(onActionItemClick(CommandName));
    }
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
            disabled
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