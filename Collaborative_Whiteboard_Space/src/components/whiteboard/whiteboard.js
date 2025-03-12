import React, { useRef, useState, useEffect, useCallback } from "react";
import classes from "./whiteboard.module.css";

import { useSelector } from "react-redux";

import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../backend/createClient";

import checkerBoard from "../checkers/checkerboard.png";

import Konva from "konva";

import {
  IoTriangle,
  IoShapesOutline, //off
  IoShapes, //on
} from "react-icons/io5";

import {
  Stage,
  Layer,
  Line,
  Image,
  Rect,
  Circle,
  Star,
  Ellipse,
  Text,
  Transformer,
  Group,
} from "react-konva";

import {
  TbEraser,
  TbEraserOff,
  TbBallpen,
  TbBallpenFilled,
  TbBallpenOff,
  TbOvalVerticalFilled,
} from "react-icons/tb";

import {
  MdOutlineTextFields,
  MdStar,
  MdCircle,
  MdRectangle,
  MdHexagon,
} from "react-icons/md";

import { BiSolidChess, BiCloudUpload } from "react-icons/bi";
import { CgCardHearts } from "react-icons/cg";
import { FaUndo, FaRedo } from "react-icons/fa";

/**
 * Functional component representing a whiteboard.
 * @returns {JSX.Element} Whiteboard component JSX
 */
const Whiteboard = () => {
  /**
   * Manages the reference to the stage element.
   * @type {React.RefObject} A reference object used to access the stage element.
   * @description Used to initialize display start position, track user actions, and manage the stage.
   */
  const stage = useRef(null);

  /**
   * Manages the state variable for drawing mode.
   * @type {[boolean, function]} A tuple containing the drawing mode state and a function to update it.
   */
  const [drawingMode, setDrawingMode] = useState(false);

  /**
   * Manages the state variable for tracking if drawing is in progress.
   * @type {[boolean, function]} A tuple containing the drawing state and a function to update it.
   */
  const [isDrawing, setIsDrawing] = useState(false);

  /**
   * Manages the state variable for the current line being drawn.
   * @type {[Object|null, function]} A tuple containing the current line state and a function to update it.
   */
  const [currentLine, setCurrentLine] = useState(null);

  /**
   * Manages the state variable for pen color.
   * @type {[string, function]} A tuple containing the pen color state and a function to update it.
   */
  const [penColor, setPenColor] = useState("#000000");

  /**
   * Manages the state variable for pen thickness.
   * @type {[number, function]} A tuple containing the pen thickness state and a function to update it.
   */
  const [penThickness, setPenThickness] = useState(2);

  /**
   * Manages the state variable for eraser mode.
   * @type {[boolean, function]} A tuple containing the eraser mode state and a function to update it.
   */
  const [eraserMode, setEraserMode] = useState(false);

  /**
   * Manages the state variable for the shapes array.
   * @type {[Array, function]} A tuple containing the shapes state and a function to update it.
   */
  const [shapes, setShapes] = useState([]);

  /**
   * Manages the state variable for the selected shape ID.
   * @type {[string|null, function]} A tuple containing the selected shape ID state and a function to update it.
   */
  const [selectedShapeId, setSelectedShapeId] = useState(null);

  /**
   * Manages the state variable for the selected shape color.
   * @type {[string, function]} A tuple containing the selected shape color state and a function to update it.
   */
  const [selectedShapeColor, setSelectedShapeColor] = useState("#000000");

  /**
   * Manages the state variable for the pen tray.
   * @type {[boolean, function]} A tuple containing the boolean of isPenOpen and a function to update it.
   */
  const [isPenOpen, setIsPenOpen] = useState(false);
   /**
   * Manages the state variable for the shape tray.
   * @type {[boolean, function]} A tuple containing the boolean of isShapeOpen and a function to update it.
   */
  const [isShapeOpen, setIsShapeOpen] = useState(false);

  /**
   * Manages the state variable for text editing mode.
   * @type {[boolean, function]} A tuple containing the text editing mode state and a function to update it.
   */
  const [isEditing, setIsEditing] = useState(false);

  /**
   * Manages the state variable for the text being edited.
   * @type {[string, function]} A tuple containing the editing text state and a function to update it.
   */
  const [editingText, setEditingText] = useState("");

  /**
   * Manages the state variable for the ID of the text being edited.
   * @type {[string|null, function]} A tuple containing the editing ID state and a function to update it.
   */
  const [editingId, setEditingId] = useState(null);

  const [lines, setLines] = useState([]);
  const [previousLines, setPreviousLines] = useState([]);
  const [dragState, setDragState] = useState({
    dragX: 0,
    dragY: 0,
    centerX: 0,
    centerY: 0,
  });
  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! supabase data fetching

  const { user } = useSelector((state) => state.user);
  const { sessionCode } = useSelector((state) => state.sessionCode);
  const cdn_url =
    "https://lcsfxowjqfottjbtjcur.supabase.co/storage/v1/object/public/Images";

  /**
   * Fetches initial session data from the database and updates the shapes state variable.
   */
  useEffect(() => {
    /**
     * Asynchronously retrieves session data from the Supabase database.
     */
    const sessionRetrieval = async () => {
      // Retrieve session data from Supabase database where sessionCode matches
      const sessionData = await supabase
        .from("Objects")
        .select()
        .eq("sessionCode", sessionCode);

      // Update the shapes state variable with retrieved session data
      setShapes(sessionData.data);
      console.log("session retrieved");
    };

    sessionRetrieval();
  }, []);

  /**
   * Listens for realtime database updates and calls the appropriate handler function.
   * @function
   * @returns {void}
   */
  supabase
    .channel("schema-db-changes")
    // Listen for any changes in the "public" schema
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
      },
      /**
       * Callback function to handle database changes.
       * @callback changeHandler
       * @param {object} payload - The payload containing information about the database changes.
       */
      (payload) => handleListenWhiteboardMovement(payload)
    )
    // Subscribe to the channel
    .subscribe();

  /**
   * Handles updates received from the database and updates the shapes accordingly.
   * @param {object} payload - The payload containing information about the database updates.
   * @returns {void}
   */
  const handleListenWhiteboardMovement = async (payload) => {
    const sessionData = await supabase
      .from("Objects")
      .select()
      .eq("sessionCode", sessionCode);

    setShapes(sessionData.data);
    console.log("listened shape");
  };

  /**
   * Updates the database with position movements of a shape and calls the corresponding handlers.
   * @param {object} shape - The shape object to be updated.
   * @param {object} e - The event object containing information about the movement.
   * @returns {void}
   */
  const handleSentWhiteboardMovement = async (shape, e) => {
    setDrawingMode(false);
    setEraserMode(false);

    // Store the current coordinates as the previous coordinates before updating
    const prevPosition = {
      x: shape.posX,
      y: shape.posY,
    };

    // Update the shape's position with the new coordinates
    shape.posX = e.target.attrs.x;
    shape.posY = e.target.attrs.y;

    // store the shapes new position
    const newPosition = {
      x: shape.posX,
      y: shape.posY,
    };

    // Call handleObjectMovement function to handle object movement
    handleObjectMovement(shape, prevPosition, newPosition);

    // update the database with new positions
    const response = await supabase
      .from("Objects")
      .update({
        shape: shape.shape,
        config: shape.config,
        posX: shape.posX,
        posY: shape.posY,
      })
      .eq("uuid", shape.uuid)
      .eq("sessionCode", sessionCode)
      .select();

    console.log("updated shape position");
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! pens

  /**
   * Toggles the application to drawing mode.
   * @returns {void}
   */
  const toggleDrawing = () => {
    const newDrawingMode = !drawingMode;
    setDrawingMode(newDrawingMode);
    // Ensure eraser mode is turned off when switching to drawing mode
    if (newDrawingMode) {
      setEraserMode(false);
    }
  };

  /**
   * Toggles the application to erasing mode.
   * @returns {void}
   */
  const toggleEraser = () => {
    const newEraserMode = !eraserMode;
    setEraserMode(newEraserMode);
    // Ensure drawing mode is turned off when switching to eraser mode
    if (newEraserMode) {
      setDrawingMode(false);
    }
  };

  /**
   * Retrieves the current exact position of the pen on the whiteboard relative to the node.
   * @param {Node} node - The node to which the position is relative.
   * @returns {Object} - The position of the pen.
   */
  const getRelativePointerPosition = (node) => {
    const transform = node.getAbsoluteTransform().copy().invert();
    const pos = node.getStage().getPointerPosition();
    return transform.point(pos);
  };

  /**
   * Initiates pen movement on the whiteboard.
   * @param {Event} e - The event object representing the pen down action.
   * @returns {void}
   */
  const handlePenDown = (e) => {
    if (drawingMode || eraserMode) {
      setIsDrawing(true);
      const point = getRelativePointerPosition(stage.current.getStage());

      const newLine = {
        uuid: uuidv4(),
        points: [point.x, point.y],
        stroke: penColor,
        strokeWidth: penThickness,
        globalCompositeOperation: eraserMode
          ? "destination-out"
          : "source-over",
      };

      // Set the current line to start drawing
      setCurrentLine(newLine);

      setLines((lines) => [...lines, newLine]);
    }
  };

  /**
   * Adds points to the pen line as it moves.
   * @param {Event} e - The event object representing the pen move action.
   * @returns {void}
   */
  const handlePenMove = (e) => {
    if (!isDrawing) return;
    const point = getRelativePointerPosition(stage.current.getStage());

    // Update the points of the current line in the state
    setCurrentLine((prevLine) => ({
      ...prevLine,
      points: [...prevLine.points, point.x, point.y],
    }));

    setLines((lines) => {
      let newLines = [...lines];
      let lastIndex = newLines.length - 1;
      newLines[lastIndex] = {
        ...newLines[lastIndex],
        points: [...newLines[lastIndex].points, point.x, point.y],
      };
      return newLines;
    });
  };


  /**
   * Handles the pen up action by adding the drawn line as a shape to the whiteboard.
   * @returns {void}
   */
  const handlePenUp = async () => {
    setIsDrawing(false);
    if (!currentLine) return;

    // Add the drawn line as a shape to the whiteboard
    handleAddShape({
      shape: "pen",
      config: {
        line: currentLine,
        thickness: penThickness,
        color: penColor,
        points: currentLine.points,
        stroke: penColor,
        strokeWidth: penThickness,
        globalCompositeOperation: eraserMode
          ? "destination-out"
          : "source-over",
      },
      posX: 0,
      posY: 0,
    });

    // Checks if the current line's globalCompositeOperation is set to "destination-out"
    if (currentLine.globalCompositeOperation === "destination-out") {
      // Filters out the lines with globalCompositeOperation not equal to "destination-out"
      const filteredLines = lines.filter(
        (line) => line.globalCompositeOperation !== "destination-out"
      );
      // Sets the lines state with the filtered lines
      setLines(filteredLines);
      // Clears the lines state
      setLines([]);
    }

    // Reset the current line
    setCurrentLine(null);
    //setLines(null);
  };

  /**
   * Handles the creation of a pen object and updates the history and redo stack accordingly.
   * @param {Object} newObject - The newly created pen object.
   * @returns {void}
   */
  const handlePenCreation = (newObject) => {
    // Update history for the created object and its movement
    const penData = {
      type: "DRAW",
      object: newObject,
      uuid: newObject.uuid,
      line: newObject.config.line,
      thickness: newObject.config.thickness,
      color: newObject.config.color,
    };

    //add to the history of the local machine
    const newHistory = [...history, penData];
    setHistory(newHistory);

    // Clear the redo stack after a new action
    setRedoStack([]);
  };

  /**
   * Redraws the canvas when lines change.
   * @returns {void}
   */
  useEffect(() => {
    const layer = stage.current?.getLayer();
    if (layer) {
      layer.batchDraw();
    }
  }, [shapes]);


  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! cards

  /**
   * Manages the index of the current card in the deck.
   * @type {[number, function]} A tuple containing the current card index and a function to update it.
   */
  const [cardIndex, setCardIndex] = useState(0);

  /**
   * Imports all the card images and creates a card deck.
   * @param {Object} requireContext - The require context object.
   * @returns {Array} An array representing the card deck with image objects and their corresponding indices.
   */
  // import all the cards and map them in a card deck
  const importAll = (requireContext) =>
    requireContext.keys().map(requireContext);
  const cardDeck = importAll(
    require.context("../cards", false, /\.(png)$/)
  ).map((image, index) => ({
    index: index,
    image: image,
  }));

  // require.context("../cards", false, /\.(png|jpe?g|svg)$/)

  /**
   * Toggles the visibility of the card from private hand to whiteboard.
   * @param {Object} shape - The shape object representing the card.
   * @returns {Promise<void>} A Promise that resolves after updating the card visibility.
   */
  const handleToggleCardHidden = async (shape) => {
    const response = await supabase
      .from("Objects")
      .update({
        ...shape,
        config: {
          ...shape.config,
          hidden: !shape.config.hidden,
        },
        user: user.user,
      })
      .eq("uuid", shape.uuid)
      .eq("sessionCode", sessionCode)
      .select();
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! image uploading

  /**
   * Handles the upload of an image file.
   * Reads the selected file and uploads it to the Supabase storage.
   * Calls handleAddImage with the uploaded image key and name.
   *
   * @param {Event} event - The file upload event containing the selected image file.
   */
  const handleImageUpload = async (event) => {
    // Retrieves the uploaded file from the event
  const file = event.target.files[0];

  // Uploads the file to the Supabase storage
  const { data: imageUpload, error } = await supabase.storage
    .from(`Images`)
    .upload(file.name, file);

  // Checks if there was an error during the upload
  if (error) {
    // Logs the error message to the console
    console.error("Error uploading image:", error.message);
  } else {
    // Logs a message indicating the upload is in progress
    console.log("uploading");
    // Calls a function to handle the addition of the uploaded image
    handleAddImage(imageUpload.Key, file.name);
  }
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! undo-redo logic

  /**
   * Initializes history and redo stacks as empty arrays.
   */
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  /**
   * Handles the editing of text in an object.
   * Updates the history for the edited text and its movement.
   *
   * @param {object} newObject - The object being edited.
   * @param {string} previousText - The previous text content.
   * @param {string} editingText - The new text content.
   */
  const handleTextEdit = async (newObject, previousText, editingText) => {
    // Update history for the edited Text
    const editData = {
      type: "EDIT",
      object: newObject,
      uuid: newObject.uuid,
      prevText: previousText,
      newText: editingText,
    };

    // Add the previous text to the array of previous texts in the object
    newObject.config.previousTexts = [
      ...newObject.config.previousTexts,
      previousText,
    ];

    // Add the previous text to the array
    const newHistory = [...history, editData];
    setHistory(newHistory);

    // Clear the redo stack after a new action
    setRedoStack([]);

    const updatedMovement = await supabase
      .from("Objects")
      .update({
        config: {
          ...newObject.config,
          text: editingText,
          previousTexts: newObject.config.previousTexts,
        },
      })
      .eq("uuid", newObject.uuid)
      .eq("sessionCode", sessionCode)
      .select();
  };

  /**
   * Handles the creation of an object on the whiteboard.
   * Updates the history for the created object and its movement.
   *
   * @param {object} newObject - The object being created.
   */
  const handleObjectCreation = (newObject) => {
    // Update history for the created object and its movement
    const creationData = {
      type: "CREATE",
      uuid: newObject.uuid,
      object: newObject,
      x: newObject.posX,
      y: newObject.posY,
    };

    const newHistory = [...history, creationData];
    setHistory(newHistory);

    // Clear the redo stack after a new action
    setRedoStack([]);
  };

  /**
   * Handles the movement of an object on the whiteboard.
   * Updates the history and redo stack for the moved object.
   *
   * @param {object} object - The object being moved.
   * @param {object} prevPosition - The previous position of the object.
   * @param {object} newPosition - The new position of the object.
   */
  const handleObjectMovement = (object, prevPosition, newPosition) => {
    // Update history and redo stack for the moved object
    const moveData = { type: "MOVE", object, prevPosition, newPosition };
    const newHistory = [...history, moveData];
    setHistory(newHistory);
    // Clear redo stack after new action
    setRedoStack([]);
  };

  /**
   * Handles the deletion of an object from the whiteboard.
   * Finds the object associated with the provided ID, deletes it from the database,
   * and adds deletion data to the history.
   *
   * @param {string} id - The ID of the object to be deleted.
   */
  const handleObjectDeletion = async (uuid) => {
    // Find the object associated with the selected shape ID
    const deletedObject = shapes.find((shape) => shape.uuid === uuid);
    if (!deletedObject) return;

    const existingRecord = await supabase
      .from("Objects")
      .select()
      .eq("uuid", deletedObject.uuid)
      .eq("sessionCode", sessionCode);

    if (existingRecord.data) {
      const res = await supabase
        .from("Objects")
        .delete()
        .eq("uuid", deletedObject.uuid)
        .eq("sessionCode", sessionCode);
    }

    console.log("deleted shape");

    // Add deletion data to history
    const deletionData = {
      type: "DELETE",
      uuid: deletedObject.uuid,
      object: deletedObject,
      x: deletedObject.posX,
      y: deletedObject.posY,
    };

    const newHistory = [...history, deletionData];
    setHistory(newHistory);

    // Clear redo stack after new action
    setRedoStack([]);
  };

  /**
   * useEffect hook to handle key press events for shape deletion.
   * Listens for the Delete key press and calls the function to delete the selected shape.
   * Deselects the shape after deletion.
   *
   * @param {string} selectedShapeId - The ID of the selected shape.
   */
  useEffect(() => {
    // Define a function to handle key press events
    const handleKeyPress = (event) => {
      // Check if the Delete key is pressed and a shape is selected
      if (event.key === "Delete" && selectedShapeId) {
        // Call function to handle deletion of the selected shape
        handleObjectDeletion(selectedShapeId);
        // Deselect the shape
        setSelectedShapeId(null);
      }
    };
    // Add event listener for keydown event to listen for Delete key press
    window.addEventListener("keydown", handleKeyPress);
    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedShapeId]); // Dependency array ensures the effect runs when selectedShapeId changes

  /**
   * Function to handle undoing the last action performed on the whiteboard.
   * It retrieves the last action from the history stack and undoes it accordingly.
   */
  const handleUndo = async () => {
    // // Check if there are any actions in the history stack
    if (history.length === 0) {
      console.log("No actions to undo");
      return;
    }

    // Retrieve the last two actions from history
    const lastAction = history.pop();

    // Undo based on action type
    switch (lastAction.type) {
      case "CREATE":
        console.log("created in undo");
        setShapes((prevShapes) =>
          prevShapes.filter((shape) => shape.id !== lastAction.uuid)
        );
        // Handle undo for object creation
        const deletedObject = shapes.find(
          (shape) => shape.uuid === lastAction.uuid
        );

        console.log("undo in " + deletedObject.uuid);
        if (!deletedObject) return;

        const existingRecord = await supabase
          .from("Objects")
          .select()
          .eq("uuid", deletedObject.uuid)
          .eq("sessionCode", sessionCode);
        // Remove the object from the database
        if (existingRecord.data) {
          console.log("found");
          const res = await supabase
            .from("Objects")
            .delete()
            .eq("uuid", deletedObject.uuid)
            .eq("sessionCode", sessionCode);
        }

        console.log("creation undone");

        break;

      case "MOVE":
        // Handle undo for object movement
        console.log("Object movement undone");
        // Restore the previous position of the shape
        const movedShapeIndex = shapes.findIndex(
          (shape) => shape.id === lastAction.object.id
        );

        console.log("movedObject.uid is " + lastAction.object.uuid);
        if (movedShapeIndex !== -1) {
          const updatedShapes = [...shapes];
          updatedShapes[movedShapeIndex].posX = lastAction.prevPosition.x;
          updatedShapes[movedShapeIndex].posY = lastAction.prevPosition.y;
          setShapes(updatedShapes);

          // Update the object position in the database
          const updatedMovement = await supabase
            .from("Objects")
            .update({
              shape: lastAction.object.shape,
              config: lastAction.object.config,
              posX: lastAction.prevPosition.x,
              posY: lastAction.prevPosition.y,
            })
            .eq("uuid", lastAction.object.uuid)
            .eq("sessionCode", sessionCode)
            .select();
        }

        break;
      case "DELETE":
        // Handle undo for object deletion
        const newShape = {
          uuid: lastAction.uuid,
          shape: lastAction.object.shape,
          config: lastAction.object.config,
          posX: lastAction.x,
          posY: lastAction.y,
        };

        setShapes((prevShapes) => [...prevShapes, newShape]);
        console.log("added redone new shape");
        // Insert the object back into the database
        const deletedSearch = await supabase.from("Objects").insert({
          uuid: lastAction.uuid,
          shape: lastAction.object.shape,
          config: lastAction.object.config,
          posX: lastAction.x,
          posY: lastAction.y,
        });

        console.log("sent redone shape");
        handleObjectCreation(newShape);
        console.log("Object deletion undone");
        break;
      case "DRAW":
        const removedLine = lines[lines.length - 1]; // Get the removed line
        setPreviousLines((prevLines) => [...prevLines, removedLine]);
        const newLines = lines.slice(0, -1);
        setLines(newLines);

        // Handle undo for drawing action
        const deletedPen = shapes.find(
          // (lines) => lines.uuid === lastAction.uuid
          (shape) => shape.uuid === lastAction.uuid
        );

        console.log(deletedPen);

        // Check if the object to be deleted exists
        if (!deletedPen) {
          console.log("Object to be deleted not found.");
          return;
        }

        // Remove the drawn object from the database
        const penRecord = await supabase
          .from("Objects")
          .select()
          .eq("uuid", deletedPen.uuid)
          .eq("sessionCode", sessionCode);
        if (penRecord.data) {
          console.log("found");
          const res = await supabase
            .from("Objects")
            .delete()
            .eq("uuid", deletedPen.uuid)
            .eq("sessionCode", sessionCode);
        }

        console.log("undone pen");
        break;

      case "EDIT":
        const editedObject = shapes.find(
          // (lines) => lines.uuid === lastAction.uuid
          (shape) => shape.uuid === lastAction.uuid
        );

        console.log(editedObject.uuid + "id is " + editedObject.id);
        // Check if the object to be deleted exists
        if (!editedObject) {
          console.log("Object to be deleted not found.");
          return;
        }

        const lastTextobject = await supabase
          .from("Objects")
          .select()
          .eq("uuid", lastAction.uuid)
          .eq("sessionCode", sessionCode);

        console.log(lastTextobject);

        if (lastTextobject.data) {
          const lastTextReverted =
            editedObject.config.previousTexts[
              editedObject.config.previousTexts.length - 1
            ];
          const prevTexts = editedObject.config.previousTexts;
          console.log(lastAction.newText);

          // Update the text in the database
          const updatedText = await supabase
            .from("Objects")
            .update({
              config: {
                ...editedObject.config,
                text: lastTextReverted,
                previousTexts: prevTexts,
                undoneTexts: lastAction.newText,
              },
            })
            .eq("uuid", lastAction.uuid)
            .eq("sessionCode", sessionCode)
            .select();

          console.log("Text edit undone");
        }
        break;

      default:
        console.error("Unknown action type:", lastAction.type);
        break;
    }
    // Push the create action to the redo stack for possible redo
    setRedoStack([...redoStack, lastAction]);
  };

  /**
   * Function to redo the last undone action on the whiteboard.
   * It retrieves the last undone action from the redo stack and redoes it accordingly.
   */
  const handleRedo = async () => {
    if (redoStack.length === 0) {
      console.log("No actions to redo");
      return;
    }
    // Retrieve the next action from redoStack
    const nextAction = redoStack.pop();
    // Redo based on action type
    switch (nextAction.type) {
      case "CREATE":
        // Handle redo for object creation
        const newShape = {
          uuid: nextAction.uuid,
          shape: nextAction.object.shape,
          config: nextAction.object.config,
          posX: nextAction.x,
          posY: nextAction.y,
        };

        setShapes((prevShapes) => [...prevShapes, newShape]);
        console.log("added redone new shape");
        // Insert the object back into the database
        const res = await supabase.from("Objects").insert({
          uuid: nextAction.uuid,
          shape: nextAction.object.shape,
          config: nextAction.object.config,
          posX: nextAction.x,
          posY: nextAction.y,
        });
        console.log("sent redone shape");
        handleObjectCreation(newShape);

        //handleAddShape(nextAction.object);
        break;
      case "MOVE":
        // Handle redo for object movement
        console.log("redo movement");
        setShapes((prevShapes) =>
          prevShapes.map((shape) =>
            shape.id === nextAction.object.uuid
              ? {
                  ...shape,
                  x: nextAction.newPosition.x,
                  y: nextAction.newPosition.y,
                }
              : shape
          )
        );
        // Update the object position in the database
        const updatedMovement = await supabase
          .from("Objects")
          .update({
            shape: nextAction.object.shape,
            config: nextAction.object.config,
            posX: nextAction.newPosition.x,
            posY: nextAction.newPosition.y,
          })
          .eq("uuid", nextAction.object.uuid)
          .eq("sessionCode", sessionCode)
          .select();
        break;
      case "DRAW":
        const newPen = {
          uuid: nextAction.uuid,
          shape: nextAction.object.shape,
          config: nextAction.object.config,
          posX: nextAction.object.posX,
          posY: nextAction.object.posY,
        };

        const newLines = [...lines, newPen];
        setLines(newLines);
        setPreviousLines(previousLines);

        setShapes((prevShapes) => [...prevShapes, newPen]);
        console.log("added redone new shape");
        // Insert the drawn object back into the database
        const redoPen = await supabase.from("Objects").insert({
          uuid: nextAction.uuid,
          shape: nextAction.object.shape,
          config: nextAction.object.config,
          posX: nextAction.object.posX,
          posY: nextAction.object.posY,
        });
        console.log("sent redone shape");
        //handleObjectCreation(newPen);

        break;
      case "DELETE":
        // Handle redo for object deletion
        setShapes((prevShapes) =>
          prevShapes.filter((shape) => shape.id !== nextAction.uuid)
        );
        // Handle undo for object creation
        const deletedObject = shapes.find(
          (shape) => shape.uuid === nextAction.uuid
        );

        console.log("undo in " + deletedObject.uuid);
        if (!deletedObject) return;
        // Remove the object from the database
        const existingRecord = await supabase
          .from("Objects")
          .select()
          .eq("uuid", deletedObject.uuid)
          .eq("sessionCode", sessionCode);

        if (existingRecord.data) {
          console.log("found");
          const res = await supabase
            .from("Objects")
            .delete()
            .eq("uuid", deletedObject.uuid)
            .eq("sessionCode", sessionCode);
        }
        break;

      case "EDIT":
        const editedObject = shapes.find(
          (shape) => shape.uuid === nextAction.uuid
        );

        // Check if the object to be edited exists
        if (!editedObject) {
          console.log("Object to be edited not found.");
          return;
        }

        // Check if there's a text redo available
        if (editedObject.config.undoneTexts.length === 0) {
          console.log("No text redo available.");
          return;
        }

        const lastTextReverted =
          editedObject.config.undoneTexts[
            editedObject.config.undoneTexts.length - 1
          ];
        const prevTexts = editedObject.config.undoneTexts;

        // Update the text to the next redo state
        const updatedText = await supabase
          .from("Objects")
          .update({
            config: {
              ...editedObject.config,
              text: lastTextReverted,
              previousTexts: prevTexts,
              undoneTexts: nextAction.prevText,
            },
          })
          .eq("uuid", nextAction.uuid)
          .eq("sessionCode", sessionCode)
          .select();

        console.log("Text redo applied.");

        // Update the editing text in your application state
        setEditingText(editingText);

        break;
      default:
        console.error("Unknown action type:", nextAction.type);
        break;
    }

    // Update history with the redone action
    setHistory([...history, nextAction]);
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! textboxes

  /**
   * Function to save changes made to text.
   * It updates the text of the selected shape with the edited text and triggers
   * the appropriate actions to handle text editing history.
   */
  const saveTextChanges = () => {
    // Update the shapes array with the edited text
    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        // Check if the current shape matches the shape being edited
        if (shape.uuid === editingId) {
          // Get the previous text
          const previousText = shape.config.text;
          // Call handleTextEdit to update history
          handleTextEdit(shape, previousText, editingText);
          // Return a new shape object with the edited text
          return { ...shape, text: editingText };
        }
        return shape;
      })
    );
    // Set editing state to false to indicate that editing has finished
    setIsEditing(false);
    // Reset the editing ID to null
    setEditingId(null);
  };

  // Define an input element for editing text if currently in editing mode
  let editInput = null;
  if (isEditing) {
    const editingTextbox = shapes.find((shape) => shape.uuid === editingId);
    console.log(editingTextbox.posX + " " + editingTextbox.posY);
    if (editingTextbox) {
      editInput = (
        <input
          style={{
            position: "relative",
            top: `${editingTextbox.posY}px`,
            left: `${editingTextbox.posX}px`,
            fontSize: `${editingTextbox.config.fontSize}px`,
            fontFamily: editingTextbox.config.fontFamily,
            color: editingTextbox.config.fill,
            border: "1px solid #000",
            resize: "none",
            overflow: "hidden",
          }}
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={saveTextChanges}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveTextChanges();
            }
            if (e.key === "Escape") {
              setIsEditing(false);
            }
          }}
          autoFocus
        />
      );
    }
  }

  /**
   * Handles the selection of a shape by its ID.
   * It sets the selectedShapeId to the provided ID if it's different from the current selected shape ID,
   * or it sets it to null if the provided ID is the same as the current selected shape ID.
   * Additionally, it logs the ID of the selected shape for debugging purposes.
   *
   * @param {string} id - The ID of the shape to be selected.
   */
  const handleSelectShape = (id) => {
    // Get the shape by its ID and set transformer properties
    setSelectedShapeId(id === selectedShapeId ? null : id);
    // Find the shape in the shapes array by its ID
    const shape = shapes.find((shape) => shape.id === id);
    console.log("shape id: " + id);
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! toggle tools

  /**
   * Toggles penTray to open
   * @returns {void}
   */
  const togglePenTray = () => {
    const newPenTray = !isPenOpen;
    setIsPenOpen(newPenTray);
    // Ensure shape tray is turned closed when opening to pen tray
    if (isShapeOpen) {
      setIsShapeOpen(false);
    }
  };

  /**
   * Toggles shapeTray to open
   * @returns {void}
   */
  const toggleShapeTray = () => {
    const newShapeTray = !isShapeOpen;
    setIsShapeOpen(newShapeTray);
    // Ensure pen tray is turned closed when opening to shape tray
    if (isPenOpen) {
      setIsPenOpen(false);
    }
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! session shapes

  /**
   * Handles the addition of a new shape to the whiteboard.
   *
   * @param {Object} shape - The shape object containing information about the new shape to be added.
   * @param {string} shape.shape - The type of shape to be added (e.g., "image", "text", "pen", etc.).
   * @param {Object} shape.config - The configuration of the shape (e.g., style, dimensions, etc.).
   * @param {number} shape.posX - The X-coordinate position of the shape.
   * @param {number} shape.posY - The Y-coordinate position of the shape.
   */
  const handleAddShape = async (shape) => {
    const newShape = {
      uuid: uuidv4(), // Generate a new UUID for the shape
      shape: shape.shape, // Shape type (e.g., "image", "text", "pen", etc.)
      config: shape.config, // Shape configuration (e.g., style, dimensions, etc.)
      posX: shape.posX, // X-coordinate position of the shape
      posY: shape.posY, // Y-coordinate position of the shape
      user: user.user, // Current user of the shape
      sessionCode: sessionCode, // Session code associated with the shape
    };

    // Update the shapes array by adding the new shape
    setShapes((prevShapes) => [...prevShapes, newShape]);
    console.log("added shape");

    // Insert the new shape into the database
    const response = await supabase.from("Objects").insert({
      uuid: newShape.uuid,
      shape: newShape.shape,
      config: newShape.config,
      posX: newShape.posX,
      posY: newShape.posY,
      user: newShape.user,
      sessionCode: newShape.sessionCode,
    });
    console.log("sent shape");

    // If the added shape is not a pen, call handleObjectCreation
    if (newShape.shape === "pen") {
      handlePenCreation(newShape);
    } else if (newShape.shape !== "pen") {
      handleObjectCreation(newShape);
      setDrawingMode(false);
      setEraserMode(false);
    }
  };

  /**
   * Handles the addition of a rectangle shape to the whiteboard.
   *
   * @function handleAddRectangle
   */
  const handleAddRectangle = () => {
    // Calculate the center position relative to the current view of the whiteboard
    handleAddShape({
      shape: "rectangle", // Shape type is 'rectangle'
      config: {
        width: 100, // Default width of the rectangle
        height: 50, // Default height of the rectangle
        fill: selectedShapeColor, // Fill color of the rectangle (selected color)
        draggable: true, // Allow the rectangle to be draggable
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 150, // Set initial Y position to the center of the stage
    });
    console.log("added rectangle");
  };

  /**
   * Handles the addition of a circle shape to the whiteboard.
   *
   * @function handleAddCircle
   */
  const handleAddCircle = () => {
    handleAddShape({
      shape: "circle", // Shape type is 'circle'
      config: {
        radius: 25, // Default radius of the circle
        fill: selectedShapeColor, // Fill color of the circle (selected color)
        draggable: true, // Allow the circle to be draggable
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 150, // Set initial Y position to the center of the stage
    });
    console.log("added circle");
  };

  /**
   * Handles the addition of a star shape to the whiteboard.
   *
   * @function handleAddStar
   */
  const handleAddStar = () => {
    handleAddShape({
      shape: "star", // Shape type is 'star'
      config: {
        numPoints: 5, // Number of points in the star
        innerRadius: 20, // Inner radius of the star
        outerRadius: 40, // Outer radius of the star
        fill: selectedShapeColor, // Fill color of the star (selected color)
        draggable: true, // Allow the star to be draggable
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 150, // Set initial Y position to the center of the stage
    });
    console.log("added star");
  };

  /**
   * Handles the addition of a triangle shape to the whiteboard.
   *
   * @function handleAddTriangle
   */
  const handleAddTriangle = () => {
    handleAddShape({
      shape: "star", // Shape type is 'triangle'
      config: {
        // points: [0, 100, 100, 100, 50, 0], // Points that define the triangle
        numPoints: 3, // Number of points in the star
        innerRadius: 15, // Inner radius of the star
        outerRadius: 30, // Outer radius of the star
        fill: selectedShapeColor, // Fill color of the triangle (selected color)
        draggable: true, // Allow the triangle to be draggable
      },
      posX: stage.current.width() * 0.5, // Set initial X position to the center of the stage
      posY: stage.current.height() * 0.5, // Set initial Y position to the center of the stage
    });
    console.log("added triangle");
  };

  /**
   * Handles the addition of a triangle shape to the whiteboard.
   *
   * @function handleAddHexagon
   */
  const handleAddHexagon = () => {
    handleAddShape({
      shape: "star", // Shape type is 'triangle'
      config: {
        numPoints: 3, // Number of points in the star
        innerRadius: 30, // Inner radius of the star
        outerRadius: 30, // Outer radius of the star
        fill: selectedShapeColor, // Fill color of the triangle (selected color)
        draggable: true, // Allow the triangle to be draggable
      },
      posX: stage.current.width() * 0.5, // Set initial X position to the center of the stage
      posY: stage.current.height() * 0.5, // Set initial Y position to the center of the stage
    });
    console.log("added triangle");
  };

  /**
   * Handles the addition of an oval shape to the whiteboard.
   *
   * @function handleAddOval
   */
  const handleAddOval = () => {
    handleAddShape({
      shape: "ellipse", // Shape type is 'ellipse' (oval)
      config: {
        radiusX: 50, // X-axis radius of the ellipse
        radiusY: 25, // Y-axis radius of the ellipse
        fill: selectedShapeColor, // Fill color of the ellipse (selected color)
        draggable: true, // Allow the ellipse to be draggable
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 150, // Set initial Y position to the center of the stage
    });
    console.log("added ellipse");
  };

  /**
   * Handles the addition of a text shape to the whiteboard.
   *
   * @function handleAddText
   */
  const handleAddText = () => {
    handleAddShape({
      shape: "text", // Shape type is text
      config: {
        text: "Your text here", // Default text content
        fontSize: 20, // Default font size
        fontFamily: "Arial", // Default font family
        fill: selectedShapeColor, // Default text color
        draggable: true, // Allow the text to be draggable
        previousTexts: [], // Array to store previous versions of the text (for undo functionality)
        undoneTexts: [], // Array to store undone versions of the text (for redo functionality)
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 150, // Set initial Y position to the center of the stage
    });
    console.log("added new text");
  };

  /**
   * Handles the addition of a card shape to the whiteboard.
   *
   * @function handleAddCard
   */
  const handleAddCard = () => {
    handleAddShape({
      shape: "card", // Shape type is card
      config: {
        index: cardIndex, // stores the card index
        width: 75, // Default width
        height: 100, // Default width
        draggable: true, // Allows the card to be draggable
        hidden: true, // Allows the card to be hidden to be placed in the private hand
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 150, // Set initial Y position to the center of the stage
    });

    if(cardIndex < 52){
      setCardIndex(cardIndex + 1);
    }
  };

  /**
   * Toggles the visibility of the checkers board.
   * Adds a new Checkers component to the layers if it's not already present.
   */

  const handleAddCheckers = () => {
    handleAddShape({
      shape: "checkers",
      config: {
        width: 500, // Default width of image
        height: 500, // Default height of image
        draggable: true, // Allows the image to be draggable
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x + 80, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y - 300, // Set initial Y position to the center of the stage
    });
  };

  /**
   * Handles the addition of an image shape to the whiteboard.
   *
   * @function handleAddImage
   * @param {string} key - The key of the image.
   * @param {string} filename - The filename of the image.
   */
  const handleAddImage = (key, filename) => {
    handleAddShape({
      shape: "image", // Shape is type image
      config: {
        key: key, // Stores the image key
        filename: filename, // Stores the filename
        width: 200, // Default width of image
        height: 200, // Default height of image
        draggable: true, // Allows the image to be draggable
      },
      posX: getRelativePointerPosition(stage.current.getStage()).x, // Set initial X position to the center of the stage
      posY: getRelativePointerPosition(stage.current.getStage()).y, // Set initial Y position to the center of the stage
    });
    console.log("added image");
  };

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! exporting ss to supabase

  // works for everything apart from images

  // Function to download a data URI as a file
  const downloadURI = (uri, name) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri || "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to handle exporting a screenshot of the whiteboard
  const handleExportScreenShot = useCallback(() => {
    // Converts the stage to a data URI with a pixel ratio of 3
    const dataUri = stage?.current?.toDataURL({ pixelRatio: 3 });
    // Downloads the data URI as a PNG file with a name based on the session code
    downloadURI(dataUri, "session_" + sessionCode + "_export_image.png");
  });

  //! -----------------------------------------------------------------------------------------------------------------------------------------------
  //! frontend rendering

  const board = useRef(null);

  /**
   * Renders the Whiteboard component.
   *
   * @returns {JSX.Element} The JSX representation of the Whiteboard component
   */
  return (
    <div className={classes.whiteboard}>
      {editInput}

      <div className={classes.toolBar}>
        {/* private hands */}
        <div className={classes.privateHands}>
          {shapes &&
            shapes.map((shape) => {
              switch (shape.shape) {
                case "card":
                  if (!shape.config.hidden) return;
                  if (user.user !== shape.user) return;
                  return (
                    <img
                      key={shape.uuid}
                      className={classes.card}
                      src={cardDeck[shape.config.index].image}
                      width={75}
                      height={100}
                      onClick={(e) => handleToggleCardHidden(shape)}
                    />
                  );
                default:
                  return null;
              }
            })}
        </div>

        {/* tools */}
        <div className={classes.whiteboardTools}>
          <div className={classes.tools}>
            <button className={classes.toolButton} onClick={togglePenTray}>
              {isPenOpen ? (
                <TbBallpenFilled size={25} />
              ) : (
                <TbBallpen size={25} />
              )}
            </button>
            <div
              className={`${classes.trayContainer} ${
                isPenOpen ? classes.open : ""
              }`}
            >
              <div className={classes.tools}>
                <div className={classes.toolButton}>
                  <input
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                  />
                </div>
                <div className={classes.toolButton}>
                  <input
                    type="range"
                    value={penThickness}
                    min="1"
                    max="20"
                    onChange={(e) =>
                      setPenThickness(parseInt(e.target.value, 10))
                    }
                  />
                </div>
                {drawingMode && (
                  <button
                    className={classes.toolButton}
                    onClick={toggleDrawing}
                  >
                    <TbBallpen size={25} />
                  </button>
                )}
                {!drawingMode && (
                  <button
                    className={classes.toolButton}
                    onClick={toggleDrawing}
                  >
                    <TbBallpenOff size={25} />
                  </button>
                )}
                {eraserMode && (
                  <button
                    className={classes.toolButton}
                    onClick={(e) => {
                      toggleEraser();
                    }}
                  >
                    <TbEraser size={25} />
                  </button>
                )}
                {!eraserMode && (
                  <button
                    className={classes.toolButton}
                    onClick={(e) => {
                      toggleEraser();
                    }}
                  >
                    <TbEraserOff size={25} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Shape Tools */}
          <div className={classes.tools}>
            <button className={classes.toolButton} onClick={toggleShapeTray}>
              {isShapeOpen ? (
                <IoShapes size={25} />
              ) : (
                <IoShapesOutline size={25} />
              )}
            </button>
            <div
              className={`${classes.trayContainer} ${
                isShapeOpen ? classes.open : ""
              }`}
            >
              <div className={classes.tools}>
                <div className={classes.toolButton}>
                  <input
                    type="color"
                    value={selectedShapeColor}
                    onChange={(e) => setSelectedShapeColor(e.target.value)}
                  />
                </div>
                <button className={classes.toolButton} onClick={handleAddText}>
                  <MdOutlineTextFields size={25} />
                </button>
                <button className={classes.toolButton} onClick={handleAddStar}>
                  <MdStar size={25} />
                </button>
                <button className={classes.toolButton} onClick={handleAddOval}>
                  <TbOvalVerticalFilled size={25} />
                </button>
                <button
                  className={classes.toolButton}
                  onClick={handleAddRectangle}
                >
                  <MdRectangle size={25} />
                </button>
                <button
                  className={classes.toolButton}
                  onClick={handleAddCircle}
                >
                  <MdCircle size={25} />
                </button>
                <button
                  className={classes.toolButton}
                  onClick={handleAddTriangle}
                >
                  <IoTriangle size={25} />
                </button>
                <button
                  className={classes.toolButton}
                  onClick={handleAddHexagon}
                >
                  <MdHexagon size={25} />
                </button>
              </div>
            </div>
          </div>

          {/* Game Tools */}
          <div className={classes.tools}>
            <button className={classes.toolButton} onClick={handleAddCheckers}>
              <BiSolidChess size={25} />
            </button>

            <button className={classes.toolButton} onClick={handleAddCard}>
              <CgCardHearts size={25} />
            </button>

            <div className={classes.toolButton}>
              <label for="file-upload">
                <BiCloudUpload size={25}/>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={classes.toolButton}
              />
            </div>

            <button className={classes.toolButton} onClick={handleExportScreenShot}>
              EXPORT
            </button>
          </div>
        </div>
      </div>

      {/* controls */}
      <div className={classes.whiteboardControls}>
        {/* Undo Button */}
        <button className={classes.undoRedoButton} onClick={handleUndo}>
          <FaUndo />
        </button>
        {/* Redo Button */}
        <button className={classes.undoRedoButton} onClick={handleRedo}>
          <FaRedo />
        </button>
      </div>

      {/* whiteboard */}
      <div className={classes.board} ref={board}>
        <Stage
          width={board.current?.offsetWidth}
          height={board.current?.offsetHeight}
          onMouseDown={handlePenDown}
          onMouseMove={handlePenMove}
          onMouseUp={handlePenUp}
          onTouchStart={handlePenDown}
          onTouchMove={handlePenMove}
          onTouchEnd={handlePenUp}
          draggable={!drawingMode && !eraserMode}

          ref={stage}
        >
          <Layer>
            {lines
              .filter((line) => line)
              .map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  globalCompositeOperation={
                    line.globalCompositeOperation || "source-over"
                  }
                  tension={0.5}
                  lineCap="round"
                />
              ))}
            </Layer>

            {/* Layer for rendering pens */}
            <Layer>
              {shapes &&
                shapes.map((shape) => {
                  if (shape.shape === "pen") {
                    return (
                      <Line
                        key={shape.uuid}
                        points={shape.config.points}
                        stroke={shape.config.stroke}
                        strokeWidth={shape.config.strokeWidth}
                        globalCompositeOperation={
                          shape.config.globalCompositeOperation || "source-over"
                        }
                        tension={0.5}
                        lineCap="round"
                      />
                    );
                  }
                  return null;
                })}
            </Layer>



          <Layer>
            {shapes &&
              shapes.map((shape, i) => {
                switch (shape.shape) {
                  case "card":
                    if (shape.config.hidden) return;
                    const card = new window.Image();
                    card.src = cardDeck[shape.config.index].image;
                    return (
                      <Image
                        key={shape.uuid}
                        image={card}
                        width={shape.config.width}
                        height={shape.config.height}
                        x={shape.posX}
                        y={shape.posY}
                        draggable={shape.config.draggable}
                        onDragEnd={(e) =>
                          handleSentWhiteboardMovement(shape, e)
                        }
                        onClick={(e) => handleSelectShape(shape.uuid)}
                        onDblClick={(e) => handleToggleCardHidden(shape)}
                      />
                    );

                  case "checkers":
                    const checkerboard = new window.Image();
                    checkerboard.src = checkerBoard;
                    return (
                      <Image
                        key={shape.uuid}
                        image={checkerboard}
                        x={shape.posX}
                        y={shape.posY}
                        width={shape.config.width}
                        height={shape.config.height}
                        draggable={shape.config.draggable}
                        onDragEnd={(e) =>
                          handleSentWhiteboardMovement(shape, e)
                        }
                        onClick={(e) => handleSelectShape(shape.uuid)}
                      />
                    );

                  case "image":
                    const img = new window.Image();
                    img.src = cdn_url + "/" + shape.config.filename;
                    return (
                      <Image
                        key={shape.uuid}
                        image={img}
                        x={shape.posX}
                        y={shape.posY}
                        width={shape.config.width}
                        height={shape.config.height}
                        draggable={shape.config.draggable}
                        onDragEnd={(e) =>
                          handleSentWhiteboardMovement(shape, e)
                        }
                        onClick={(e) => handleSelectShape(shape.uuid)}
                      />
                    );

                  case "text":
                    return (
                      <Text
                        key={shape.uuid}
                        text={shape.config.text}
                        fontSize={shape.config.fontSize}
                        fontFamily={shape.config.fontFamily}
                        fill={shape.config.fill}
                        x={shape.posX}
                        y={shape.posY}
                        draggable={shape.config.draggable}
                        onDragEnd={(e) =>
                          handleSentWhiteboardMovement(shape, e)
                        }
                        onClick={(e) => handleSelectShape(shape.uuid)}
                        onDblClick={(e) => {
                          console.log(
                            "x and y found is " + shape.posX + " " + shape.posY
                          );
                          setIsEditing(true);
                          setEditingText(shape.config.text);
                          setEditingId(shape.uuid);
                        }}
                      />
                    );

                  case "star":
                    return (
                      <React.Fragment key={shape.uuid}>
                        <Star
                          x={shape.posX}
                          y={shape.posY}
                          numPoints={shape.config.numPoints}
                          innerRadius={shape.config.innerRadius}
                          outerRadius={shape.config.outerRadius}
                          fill={shape.config.fill}
                          draggable={shape.config.draggable}
                          onDragEnd={(e) =>
                            handleSentWhiteboardMovement(shape, e)
                          }
                          onClick={(e) => handleSelectShape(shape.uuid)}
                        />
                      </React.Fragment>
                    );

                  case "ellipse":
                    return (
                      <React.Fragment key={shape.uuid}>
                        <Ellipse
                          x={shape.posX}
                          y={shape.posY}
                          radiusX={shape.config.radiusX}
                          radiusY={shape.config.radiusY}
                          fill={shape.config.fill}
                          draggable={shape.config.draggable}
                          onDragEnd={(e) =>
                            handleSentWhiteboardMovement(shape, e)
                          }
                          onClick={(e) => handleSelectShape(shape.uuid)}
                        />
                      </React.Fragment>
                    );

                    case "rectangle":
                      return (
                        <React.Fragment key={shape.uuid}>
                          <Rect
                            x={shape.posX}
                            y={shape.posY}
                            width={shape.config.width}
                            height={shape.config.height}
                            fill={shape.config.fill}
                            draggable={shape.config.draggable}
                            onDragEnd={(e) =>
                              handleSentWhiteboardMovement(shape, e)
                            }
                            onClick={(e) => handleSelectShape(shape.uuid)}
                          />
                        </React.Fragment>
                      );

                  case "circle":
                    return (
                      <React.Fragment key={shape.uuid}>
                        <Circle
                          x={shape.posX}
                          y={shape.posY}
                          radius={shape.config.radius}
                          fill={shape.config.fill}
                          draggable={shape.config.draggable}
                          onDragEnd={(e) =>
                            handleSentWhiteboardMovement(shape, e)
                          }
                          onClick={(e) => handleSelectShape(shape.uuid)}
                        />
                      </React.Fragment>
                    );
                  default:
                    return null;
                }
              })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Whiteboard;
