import "./cell.css";
import PropTypes from "prop-types";
import Probability from "../probability/probability";
import { useState } from "react";

const Cell = ({ probability, showProbability, hasGhost, onClick, id }) => {
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");

  const handleClick = () => {
    onClick(id, setBackgroundColor); // Pass the id and the setter function for the background color
  };

  return (
    <div className="cell" onClick={handleClick} style={{ backgroundColor }}>
      {hasGhost && <div className="ghost"></div>} {/*ghost here*/} 
      {showProbability && <Probability probability={probability} />}
    </div>
  );
};

Cell.propTypes = {
  probability: PropTypes.number,
  showProbability: PropTypes.bool,
  hasGhost: PropTypes.bool,
  onClick: PropTypes.func,
  id: PropTypes.number,
};

export default Cell;
