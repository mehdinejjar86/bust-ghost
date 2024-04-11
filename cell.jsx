import "./cell.css";
import PropTypes from "prop-types";
import Probability from "../probability/probability";
import { useState } from "react";

const getArrow = (direction) => {
  const arrows = {
    N: "↑",
    NE: "↗",
    E: "→",
    SE: "↘",
    S: "↓",
    SW: "↙",
    W: "←",
    NW: "↖",
  };
  return arrows[direction] || null;
};

const Cell = ({
  probability,
  direction,
  showColorDistance,
  showDirection,
  showProbability,
  hasGhost,
  onClick,
  id,
}) => {
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");

  const handleClick = () => {
    onClick(id, setBackgroundColor); // Pass the id and the setter function for the background color
  };

  const arrow = getArrow(direction);
  const backgroundColorAdaptable =
    showDirection && !showColorDistance ? "#f0f0f0" : backgroundColor;

  console.log(
    "backgroundColor",
    backgroundColor,
    "backgroundColorAdaptable",
    backgroundColorAdaptable
  );

  return (
    <div
      className="cell"
      onClick={handleClick}
      style={{ backgroundColor: backgroundColorAdaptable }}
    >
      <p className="arrow">{arrow}</p>
      {hasGhost && <div className="ghost">👻</div>}
      {showProbability && <Probability probability={probability} />}
    </div>
  );
};

Cell.propTypes = {
  probability: PropTypes.number,
  showColorDistance: PropTypes.bool,
  showDirection: PropTypes.bool,
  hasGhost: PropTypes.bool,
  onClick: PropTypes.func,
  id: PropTypes.number,
  direction: PropTypes.string,
  showProbability: PropTypes.bool,
};

export default Cell;
