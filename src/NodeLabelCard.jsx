import React from "react";
import "./App.css";

class NodeLabelCard extends React.PureComponent {
  render() {
    const { className, nodeData } = this.props;

    return (
      <>
        <div className="card">
          <div className={nodeData.attributes.isMax ? "card-header-reverse" : "card-header"}>
            {nodeData.attributes.pct}% ({nodeData.attributes.count})
          </div>
          <div className="card-main">
            <div className="main-description">{nodeData.name}</div>
            {/* {nodeData._children && <button>{nodeData._collapsed ? "Expand" : "Collapse"}</button>} */}
          </div>
        </div>
      </>
    );
  }
}

export default NodeLabelCard;
