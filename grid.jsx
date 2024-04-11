import "./grid.css";
import Cell from "../cell/cell";
import { useState, useEffect } from "react";

const Grid = () => {
  const [showColorDistanceProbbility, setShowColorDistanceProbbility] =
    useState(false);
  const [showDirectionalProbability, setShowDirectionalProbability] =
    useState(false);
  const [cells, setCells] = useState([]); // State to hold cell information
  const [cellsColorDistance, setCellsColorDistance] = useState([]); // State to hold cell color and distance
  const [cellsDirection, setCellsDirection] = useState([]); // State to hold cell direction
  const [cellsCombined, setCellsCombined] = useState([]); // State to hold cell combined information

  const [ghostPosition, setGhostPosition] = useState(null);
  const [lastClickedCell, setLastClickedCell] = useState(null);
  const [bustsUsed, setBustsUsed] = useState(0);
  const maxBustsAllowed = 2;
  const [credits, setCredits] = useState(15); // Initialize with 5 credits
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
      direction: null,
    }));

    setCells(initialCells);
    setCellsColorDistance(initialCells);
    setCellsDirection(initialCells);
    setCellsCombined(initialCells);
  }, []);

  const getDistance = (index1, index2) => {
    const x1 = index1 % 12;
    const y1 = Math.floor(index1 / 12);
    const x2 = index2 % 12;
    const y2 = Math.floor(index2 / 12);

    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  };

  const getDirection = (clickedId, ghostId) => {
    const clickedX = clickedId % 12;
    const clickedY = Math.floor(clickedId / 12);
    const ghostX = ghostId % 12;
    const ghostY = Math.floor(ghostId / 12);

    const deltaX = ghostX - clickedX;
    const deltaY = ghostY - clickedY;

    // Diagonal and direct movement checks
    if (deltaX > 0 && deltaY > 0) {
      return "SE";
    } else if (deltaX > 0 && deltaY < 0) {
      return "NE";
    } else if (deltaX < 0 && deltaY > 0) {
      return "SW";
    } else if (deltaX < 0 && deltaY < 0) {
      return "NW";
    } else if (deltaX === 0 && deltaY > 0) {
      return "S";
    } else if (deltaX === 0 && deltaY < 0) {
      return "N";
    } else if (deltaX > 0 && deltaY === 0) {
      return "E";
    } else if (deltaX < 0 && deltaY === 0) {
      return "W";
    }

    return null; // Return null if the ghost is in the clicked cell
  };

  const colorDistance = (cells, id, newdirection, newcolor) => {
    const updatedCells = cells.map((cell, index) => {
      const cellDistance = getDistance(id, cell.id);
      let likelihood;

      switch (newcolor) {
        case "red":
          likelihood = cellDistance === 0 ? 1 : 0.1 / (totalCells - 1);
          break;
        case "orange":
          likelihood =
            cellDistance >= 1 && cellDistance <= 2
              ? 0.9
              : 0.2 / (totalCells - 1);
          break;
        case "yellow":
          likelihood =
            cellDistance >= 3 && cellDistance <= 4
              ? 0.8
              : 0.3 / (totalCells - 1);
          break;
        case "green":
          likelihood = cellDistance > 4 ? 0.9 : 0.1 / (totalCells - 1);
          break;
        default:
          likelihood = 1 / totalCells; // Default case to handle unexpected scenarios
      }

      if (index === id) {
        return {
          ...cell,
          probability: cell.probability * likelihood,
        };
      } else {
        return {
          ...cell,
          probability: cell.probability * likelihood, // Update the probability based on the likelihood
        };
      }
    });
    // Normalize the probabilities so they sum to 1
    const sum = updatedCells.reduce((acc, cell) => acc + cell.probability, 0);

    const normalizedCells = updatedCells.map((cell) => ({
      ...cell,
      probability: cell.probability / sum,
    }));

    return normalizedCells;
  };

  const updateProbabilitiesWithDirection = (
    cells,
    clickedId,
    direction,
    hasGhost
  ) => {
    if (hasGhost) {
      return cells.map((cell) => ({
        ...cell,
        probability: cell.id === clickedId ? 1 : 0,
      }));
    }
    const clickedX = clickedId % 12;
    const clickedY = Math.floor(clickedId / 12);

    let originalCells = cells;
    let updatedCells = cells.map((cell) => ({ ...cell, probability: 0 }));
    // Reset all probabilities to zero initially

    // Function to set probabilities based on direction
    const setProbability = (cellId, probability) => {
      updatedCells = updatedCells.map((cell) =>
        cell.id === cellId ? { ...cell, probability } : cell
      );
    };

    // Check the direction and update probabilities accordingly
    if (["N", "S", "E", "W"].includes(direction)) {
      // If the direction is straight (non-diagonal), only the cells in the direction will have non-zero probability
      updatedCells.forEach((cell) => {
        const cellX = cell.id % 12;
        const cellY = Math.floor(cell.id / 12);
        if (
          (direction === "N" && cellX === clickedX && cellY < clickedY) ||
          (direction === "S" && cellX === clickedX && cellY > clickedY) ||
          (direction === "E" && cellY === clickedY && cellX > clickedX) ||
          (direction === "W" && cellY === clickedY && cellX < clickedX)
        ) {
          if (originalCells[cell.id].probability !== 0) {
            setProbability(cell.id, 1);
          }
          // Placeholder for actual probability calculation
          else setProbability(cell.id, 0); // Placeholder for actual probability calculation
        }
      });
    } else if (["NE", "NW", "SE", "SW"].includes(direction)) {
      // If the direction is diagonal, define the rectangle of cells that have non-zero probability
      updatedCells.forEach((cell) => {
        const cellX = cell.id % 12;
        const cellY = Math.floor(cell.id / 12);
        const inDiagonalRectangle =
          (direction === "NE" && cellX > clickedX && cellY < clickedY) ||
          (direction === "NW" && cellX < clickedX && cellY < clickedY) ||
          (direction === "SE" && cellX > clickedX && cellY > clickedY) ||
          (direction === "SW" && cellX < clickedX && cellY > clickedY);
        if (inDiagonalRectangle) {
          if (originalCells[cell.id].probability !== 0)
            setProbability(cell.id, 1);
          // Placeholder for actual probability calculation
          else setProbability(cell.id, 0); // Placeholder for actual probability calculation // Placeholder for actual probability calculation
        }
      });
    }

    // Normalize the probabilities so they sum to 1
    const sumOfProbabilities = updatedCells.reduce(
      (acc, cell) => acc + cell.probability,
      0
    );

    if (sumOfProbabilities > 0) {
      updatedCells = updatedCells.map((cell) => ({
        ...cell,
        probability: cell.probability / sumOfProbabilities,
        direction: cell.id === clickedId ? direction : cell.direction,
      }));
    }

    return updatedCells;
  };

  const handleCellClick = (id, setColor) => {
    if (gameOver) {
      alert("Game over! You can't bust the ghost anymore.");
      return;
    }

    if (credits <= 0) {
      alert("You have no more credits left!");
      return; // Exit if no credits are left
    }

    if (bustsUsed >= maxBustsAllowed) {
      alert("You've used all your busts!");
      return;
    }

    const distance = getDistance(id, ghostPosition);
    let newColor;

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
    // get the direction of the ghost
    const newdirection = getDirection(id, ghostPosition);

    // Update the probabilities based on the observed color/distance
    const ColorDistanceUpdate = colorDistance(
      cellsColorDistance,
      id,
      newdirection,
      newColor
    );

    const directionalUpdatedCells = updateProbabilitiesWithDirection(
      cellsDirection,
      id,
      newdirection,
      cellsDirection[id].hasGhost
    );

    const CombinedDirectionalUpdate = updateProbabilitiesWithDirection(
      cellsDirection,
      id,
      newdirection,
      cellsDirection[id].hasGhost
    );

    const CombinedColorDistanceUpdate = colorDistance(
      CombinedDirectionalUpdate,
      id,
      newdirection,
      newColor
    );

    setCellsCombined(CombinedColorDistanceUpdate);
    setCellsColorDistance(ColorDistanceUpdate);
    setCellsDirection(directionalUpdatedCells);
    setLastClickedCell(id);
    setCredits(credits - 1);

    // Update cells with the new direction
    setCells(
      cells.map((cell, index) => {
        if (index === id) {
          return { ...cell, direction: newdirection };
        }
        return cell;
      })
    );
  };

  const handleBust = () => {
    setBustsUsed(bustsUsed + 1);
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

      // If the player has reached the maximum number of busts, show a losing message.
      if (bustsUsed + 1 >= maxBustsAllowed) {
        alert("You've used all your busts! Game over!");
      }
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          setShowColorDistanceProbbility(!showColorDistanceProbbility);
        }}
      >
        {showColorDistanceProbbility ? "Peep ✅" : "Peep"}
      </button>
      <button
        onClick={() => {
          setShowDirectionalProbability(!showDirectionalProbability);
        }}
      >
        {showDirectionalProbability ? "Directional ✅" : "Directional"}
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
        {showColorDistanceProbbility
          ? showDirectionalProbability
            ? cellsCombined.map((cell) => (
                <Cell
                  key={cell.id}
                  id={cell.id}
                  probability={cell.probability}
                  showProbability={
                    showColorDistanceProbbility && showDirectionalProbability
                  }
                  showColorDistance={showColorDistanceProbbility}
                  showDirection={showDirectionalProbability}
                  hasGhost={cell.hasGhost}
                  direction={cell.direction}
                  onClick={handleCellClick}
                />
              ))
            : cellsColorDistance.map((cell) => (
                <Cell
                  key={cell.id}
                  id={cell.id}
                  probability={cell.probability}
                  showProbability={showColorDistanceProbbility}
                  showColorDistance={showColorDistanceProbbility}
                  showDirection={showDirectionalProbability}
                  hasGhost={cell.hasGhost}
                  direction={cell.direction}
                  onClick={handleCellClick}
                />
              ))
          : showDirectionalProbability
          ? cellsDirection.map((cell) => (
              <Cell
                key={cell.id}
                id={cell.id}
                probability={cell.probability}
                showProbability={showDirectionalProbability}
                showColorDistance={showColorDistanceProbbility}
                showDirection={showDirectionalProbability}
                hasGhost={cell.hasGhost}
                direction={cell.direction}
                onClick={handleCellClick}
              />
            ))
          : cells.map((cell) => (
              <Cell
                key={cell.id}
                id={cell.id}
                probability={cell.probability}
                showProbability={false}
                showColorDistance={showColorDistanceProbbility}
                showDirection={showDirectionalProbability}
                hasGhost={cell.hasGhost}
                direction={cell.direction}
                onClick={handleCellClick}
              />
            ))}
      </div>
    </div>
  );
};

export default Grid;
