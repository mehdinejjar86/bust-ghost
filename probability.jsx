import "./probability.css";
import PropTypes from "prop-types";

const Probability = ({ probability }) => {
  return (
    <div className="probability-container">
      <div className="probability">{`${probability.toFixed(4)}`}</div>
    </div>
  );
};

Probability.propTypes = {
  probability: PropTypes.number,
};

export default Probability;
