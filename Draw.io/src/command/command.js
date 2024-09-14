export class AddElementCommand {
    constructor(elements, element) {
      this.elements = elements;
      this.element = element;
    }
  
    execute() {
      this.elements.push(this.element);
    }
  
    undo() {
      this.elements.pop();
    }
  }
  
  export class RemoveElementCommand {
    constructor(elements, index) {
      this.elements = elements;
      this.index = index;
      this.removedElement = null;
    }
  
    execute() {
      this.removedElement = this.elements.splice(this.index, 1)[0];
    }
  
    undo() {
      if (this.removedElement) {
        this.elements.splice(this.index, 0, this.removedElement);
      }
    }
  }
  
  export class History {
    constructor() {
      this.undoStack = [];
      this.redoStack = [];
    }
  
    execute(command) {
      command.execute();
      this.undoStack.push(command);
      this.redoStack = []; // Clear redo stack when a new command is executed
    }
  
    undo() {
      const command = this.undoStack.pop();
      if (command) {
        command.undo();
        this.redoStack.push(command);
      }
    }
  
    redo() {
      const command = this.redoStack.pop();
      if (command) {
        command.execute();
        this.undoStack.push(command);
      }
    }
  
    canUndo() {
      return this.undoStack.length > 0;
    }
  
    canRedo() {
      return this.redoStack.length > 0;
    }
  }