import React from "react";
import { Tree } from "react-d3-tree";
import csvdata from "./data.csv";
import * as d3 from "d3";
import NodeLabel from "./NodeLabel";
import NodeLabelCard from "./NodeLabelCard";
import { treemapResquarify } from "d3";

const containerStyles = {
  width: "100%",
  height: "100vh"
};

export default class Chart extends React.PureComponent {
  state = {
    data: null,
    translate: { x: 0, y: 0 }
  };

  traverse(tree) {
    if (tree.children) {
      const total = tree.children.reduce((a, c) => {
        a += c.attributes.count;
        return a;
      }, 0);

      tree.children.forEach(child => {
        child.attributes.pct = ((child.attributes.count / total) * 100).toFixed(1);

        if (child.children) {
          this.traverse(child);
        }

        tree.children.sort(function(a, b) {
          return b.attributes.pct - a.attributes.pct;
        });

        // const max_node = tree.children.reduce((p, c) => (p.attributes.count > c.attributes.count) ? p : c)
        // max_node.attributes.isMax = true
      });
    }
  }

  async generateTreeData() {
    let root = { name: "root", attributes: { count: 1, pct: '100.0' }, children: [] };

    const csv = await d3.csv(csvdata);

    csv.reduce((r, s) => {
      s.flow.split(",").reduce((a, item) => {
        var array = a.find(v => v.name === item);
        if (!array) {
          a.push(
            (array = {
              name: item,
              _collapsed: true,
              attributes: { count: 1 },
              children: []
            })
          );
        } else {
          array.attributes.count += 1;
        }
        return array.children;
      }, r);
      return r;
    }, root.children);

    root.attributes.count = root.children.reduce((a, c) => {
      a += c.attributes.count;
      return a;
    }, 0);

    this.traverse(root);
    return root;
  }

  getTreeCentered() {
    const dimensions = this.treeContainer.getBoundingClientRect();
    this.setState({
      translate: {
        // x: 100,
        y: 100,
        x: dimensions.width / 2
        // y: dimensions.height / 2
      }
    });
  }

  componentDidMount() {
    this.generateTreeData().then(res => this.setState({ data: res }));
    this.getTreeCentered();
  }

  render() {
    return (
      <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
        {/* <div style={{ width: size.width, height: size.height }}> */}
        {this.state.data ? (
          <Tree
            transitionDuration={0}
            useCollapseData={true}
            data={this.state.data}
            translate={this.state.translate}
            // orientation={"vertical"}
            allowForeignObjects
            shouldCollapseNeighborNodes={true}
            nodeLabelComponent={{
              render: <NodeLabelCard />,
              foreignObjectWrapper: {
                x: -50,
                y: 24
              }
            }}
          />
        ) : null}
      </div>
    );
  }
}
