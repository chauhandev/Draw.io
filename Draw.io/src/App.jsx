import Toolbar from "./Components/Toolbar/Toolbar"
import PorpertiesToolBar from "./Components/PropertiesToolBar/PorpertiesToolBar"
import DrawingBoard from "./Components/DrawingBoard"
import { COMMANDS } from "./constants";
function App() {
 
  const items = [
    { icon: 'rotateLeft', CommandName: COMMANDS.UNDO , isActionButton : true},
    { icon: 'rotateRight', CommandName: COMMANDS.REDO, isActionButton : true },
    { icon: 'pen', CommandName: COMMANDS.FREEHAND , isActionButton : false},
    { icon: 'eraser', CommandName:  COMMANDS.ERASER, isActionButton : false },
    { icon: 'circle', CommandName:  COMMANDS.LINE , isActionButton : false},
    { icon: 'circle', CommandName:  COMMANDS.CIRCLE , isActionButton : false},
    { icon: 'rectangle', CommandName:  COMMANDS.RECTANGLE , isActionButton : false},
    { icon: 'ellipse', CommandName:  COMMANDS.ELLIPSE , isActionButton : false},
    { icon: 'text', CommandName:  COMMANDS.TEXT , isActionButton : false},
    { icon: 'download', CommandName:  COMMANDS.DOWNLOAD , isActionButton : true},
  ];

  const zoomPanitems = [
    { icon: 'zoomIn', CommandName: COMMANDS.ZOOMIN , isActionButton : true},
    { icon: 'zoomOut', CommandName:COMMANDS.ZOOMOUT , isActionButton : true},
    { icon: 'pan', CommandName: COMMANDS.PAN , isActionButton : false },
    { icon: 'zoomExtent', CommandName: COMMANDS.ZOOMEXTENT , isActionButton : true},
  ];
  
  return (
    <>
      <DrawingBoard/>
      <Toolbar items={items}/>
      <Toolbar direction="vertical" theme={"dark"}items={zoomPanitems}/>
      <PorpertiesToolBar/>
    
    </>
  )
}

export default App;
