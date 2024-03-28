import "./grid.css";
import Cell from "../cell/cell";
import { useState, useEffect } from "react";
 
const Grid = () => {
  const [showProbabilities, setShowProbabilities] = useState(false);
  const [ghostPosition, setGhostPosition] = useState(null);
  const [cells, setCells] = useState([]); // State to hold cell information
  const [lastClickedCell, setLastClickedCell] = useState(null);
  const [bustsUsed, setBustsUsed] = useState(0);
  const maxBustsAllowed = 2;
  const [credits, setCredits] = useState(5); // Initialize with 5 credits
  const [gameOver, setGameOver] = useState(false);
 
  const totalCells = 9 * 12; // Define totalCells here
 
  useEffect(() => {
    const randomCellIndex = Math.floor(Math.random() * totalCells);
    setGhostPosition(randomCellIndex);
 
    // Initialize cells with equal probability
    const initialCells = Array.from({ length: 9 * 12 }, (_, index) => ({
      id: index,
      probability: 1 / (9 * 12),
      hasGhost: index === randomCellIndex,
    }));
 
    setCells(initialCells);
  }, []);
 
  const getDistance = (index1, index2) => {
    const x1 = index1 % 12;
    const y1 = Math.floor(index1 / 12);
    const x2 = index2 % 12;
    const y2 = Math.floor(index2 / 12);
 
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  };
 
  const handleCellClick = (id, setColor) => {
    const distance = getDistance(id, ghostPosition);
    let newColor;
 
    if (credits <= 0) {
      alert("You have no more credits left!");
      return; // Exit if no credits are left
    }
 
    if (bustsUsed >= maxBustsAllowed) {
      alert("You've used all your busts!");
      return;
    }
 
    if (gameOver) {
      alert("Game over! You can't bust the ghost anymore.");
      return;
    }
 
    // Determine the color and likelihood based on the distance
    if (distance === 0) {
      newColor = "red";
    } else if (distance >= 1 && distance <= 2) {
      newColor = "orange";
    } else if (distance >= 3 && distance <= 4) {
      newColor = "yellow";
    } else {
      newColor = "green";
    }
    setColor(newColor);
 
    // Update the probabilities based on the observed color/distance
    const updatedCells = cells.map((cell) => {
      const cellDistance = getDistance(id, cell.id);
      let likelihood;
 
      switch (newColor) {
        case "red":
          likelihood = cellDistance === 0 ? 0.9 : 0.1 / (totalCells - 1);
          break;
        case "orange":
          likelihood =
            cellDistance >= 1 && cellDistance <= 2
              ? 0.8
              : 0.2 / (totalCells - 1);
          break;
        case "yellow":
          likelihood =
            cellDistance >= 3 && cellDistance <= 4
              ? 0.7
              : 0.3 / (totalCells - 1);
          break;
        case "green":
          likelihood = cellDistance > 4 ? 0.9 : 0.1 / (totalCells - 1);
          break;
        default:
          likelihood = 1 / totalCells; // Default case to handle unexpected scenarios
      }
 
      return {
        ...cell,
        probability: cell.probability * likelihood, // Update the probability based on the likelihood
      };
    });
 
    // Normalize the probabilities so they sum to 1
    const sum = updatedCells.reduce((acc, cell) => acc + cell.probability, 0);
    const normalizedCells = updatedCells.map((cell) => ({
      ...cell,
      probability: cell.probability / sum,
    }));
 
    setCells(normalizedCells); // Update the cell state with new probabilities
    setLastClickedCell(id);
    setCredits(credits - 1);
  };
 
  const handleBust = () => {
    if (bustsUsed >= maxBustsAllowed) {
      alert("You've used all your busts!");
      return;
    }
 
    if (lastClickedCell === null) {
      alert("No cell has been selected yet!");
      return;
    }
 
    const isGhostFound = cells[lastClickedCell].hasGhost;
    if (isGhostFound) {
      alert("You've found the ghost! You win!");
      setGameOver(true);
      // Optionally, reset the game or make further updates here
    } else {
      alert("No ghost here! Try again!");
      setBustsUsed(bustsUsed + 1);
 
      // If the player has reached the maximum number of busts, show a losing message.
      if (bustsUsed + 1 >= maxBustsAllowed) {
        alert("You've used all your busts! Game over!");
      }
    }
  };
 
  return (
    <div>
      <button onClick={() => setShowProbabilities(!showProbabilities)}>
        Peep
      </button>
      <button
        onClick={handleBust}
        disabled={bustsUsed >= maxBustsAllowed || credits <= 0 || gameOver}
      >
        Bust
      </button>
      <p>Remaining Busts: {maxBustsAllowed - bustsUsed}</p>
      <p>Remaining Credits: {credits}</p>
      <div className="grid-container">
        {cells.map((cell) => (
          <Cell
            key={cell.id}
            id={cell.id}
            probability={cell.probability}
            showProbability={showProbabilities}
            hasGhost={cell.hasGhost}
            onClick={handleCellClick}
          />
        ))}
      </div>
    </div>
  );
};
 
export default Grid;