import React from 'react';

class NodeLabel extends React.PureComponent {
  render() {
    const {className, nodeData} = this.props
    return (
      <div className={className}>
        <strong>{nodeData.name}</strong>
        {nodeData.attributes ? <strong>{nodeData.attributes.count}</strong> : null}
        <br/>
        {nodeData._children &&
          <button>{nodeData._collapsed ? 'Expand' : 'Collapse'}</button>
        }
      </div>
    )
  }
}

export default NodeLabel;