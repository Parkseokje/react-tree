import React from "react";
import { Tree } from "react-d3-tree";
import csvdata from "./data.csv";
import * as d3 from "d3";
// import NodeLabel from "./NodeLabel";
import NodeLabelCard from "./NodeLabelCard";

const containerStyles = {
  width: "100%",
  height: "100vh"
};

export default class Chart extends React.PureComponent {
  state = {
    data: null,
    translate: { x: 0, y: 0 },
    orientation: "vertical",
    top: 0.9,
    percentage_lower_limit: 20,
    last_applied_filter: "top",
    collapsed: true,
    display_count: 10
  };

  traverse(tree) {
    if (tree.children) {
      const total = tree.children.reduce((a, c) => {
        a += c.attributes.count;
        return a;
      }, 0);

      tree.children.forEach(x => (x.attributes.pct = parseFloat(((x.attributes.count / total) * 100).toFixed(1))));

      if (this.state.last_applied_filter === "top" && this.state.top < 1)
        tree.children = tree.children.filter(x => x.attributes.count >= total * (1 - this.state.top));
      // 상위 60%
      else if (this.state.last_applied_filter === "percentage") {
        tree.children = tree.children.filter(x => x.attributes.pct >= this.state.percentage_lower_limit);
      }

      tree.children.sort(function(a, b) {
        return b.attributes.pct - a.attributes.pct;
      });

      const others = tree.children.slice(this.state.display_count);

      if (others && others.length) {
        tree.children.splice(this.state.display_count, tree.children.length - this.state.display_count);

        const { count, pct } = others.reduce(
          (p, c) => {
            // console.log(p, c)
            p.count += c.attributes.count;
            p.pct += c.attributes.pct;
            return p;
          },
          { count: 0, pct: 0 }
        );

        tree.children.push({
          name: "others",
          attributes: { count, pct: parseFloat(pct.toFixed(2)) }
        });
      }

      tree.children.forEach(child => {
        if (child.children) {
          this.traverse(child);
        }
      });
    }
  }

  async generateTreeData() {
    let root = { name: "root", attributes: { count: 1, pct: "100.0" }, children: [] };

    const csv = await d3.csv(csvdata);

    csv.reduce((r, s) => {
      s.flow.split(",").reduce((a, item) => {
        var array = a.find(v => v.name === item);
        if (!array) {
          a.push(
            (array = {
              name: item,
              _collapsed: this.state.collapsed,
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

    this.traverse(root, this.state.last_applied_filter);
    return root;
  }

  getTreeCentered() {
    const dimensions = this.treeContainer.getBoundingClientRect();

    this.setState({ translate: { x: 0, y: 0 } });
    this.setState({
      translate: {
        y: 100,
        x: dimensions.width / 2
      }
    });
  }

  componentDidMount() {
    this.generateTreeData().then(res => this.setState({ data: res }));
    this.getTreeCentered();
  }

  onTopChange(e) {
    if (e && e.target && e.target.value) this.setState({ top: parseFloat(e.target.value) });

    this.setState({ last_applied_filter: "top" });
    this.generateTreeData().then(res => {
      this.setState({ data: res });
      this.getTreeCentered();
    });
  }

  onPercentageLowerLimitChange(e) {
    if (e && e.target && e.target.value) this.setState({ percentage_lower_limit: parseInt(e.target.value) });

    this.setState({ last_applied_filter: "percentage" });
    this.generateTreeData().then(res => {
      this.setState({ data: res });
      this.getTreeCentered();
    });
  }

  onExpand(e) {
    const {
      target: { checked }
    } = e;
    this.setState({ collapsed: !checked });
    this.generateTreeData(this.state.last_applied_filter).then(res => {
      this.setState({ data: res });
      this.getTreeCentered();
    });
  }

  onDisplayCountChange(e) {
    if (e && e.target && e.target.value) this.setState({ display_count: parseInt(e.target.value) });

    this.generateTreeData(this.state.last_applied_filter).then(res => {
      this.setState({ data: res });
      this.getTreeCentered();
    });
  }

  render() {
    return (
      <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
        <div className="header">
          <div className="filter">
            <label>orientation : </label>
            <select
              onClick={e => e.stopPropagation()}
              onChange={e => this.setState({ orientation: e.target.value })}
              value={this.state.orientation}
            >
              <option value="vertical">vertical</option>
              <option value="horizontal">horizontal</option>
            </select>
          </div>

          <div className="filter">
            <label>top : </label>
            <select onClick={e => e.stopPropagation()} onChange={e => this.onTopChange(e)} value={this.state.top}>
              <option value="1">All</option>
              <option value="0.1">10%</option>
              <option value="0.2">20%</option>
              <option value="0.3">30%</option>
              <option value="0.4">40%</option>
              <option value="0.5">50%</option>
              <option value="0.6">60%</option>
              <option value="0.7">70%</option>
              <option value="0.8">80%</option>
              <option value="0.9">90%</option>
            </select>
            <button className="apply" onClick={() => this.onTopChange()}>
              apply
            </button>
          </div>

          <div className="filter">
            <label>greater then : </label>
            <select
              onClick={e => e.stopPropagation()}
              onChange={e => this.onPercentageLowerLimitChange(e)}
              value={this.state.percentage_lower_limit}
            >
              <option value="0">All</option>
              <option value="10">10%</option>
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="60">60%</option>
              <option value="70">70%</option>
              <option value="80">80%</option>
              <option value="90">90%</option>
            </select>
            <button className="apply" onClick={() => this.onPercentageLowerLimitChange()}>
              apply
            </button>
          </div>

          <div className="filter">
            <label>expand all:</label>
            <input type="checkbox" checked={!this.state.collapsed} onChange={e => this.onExpand(e)} />
          </div>

          <div className="filter number-input">
            <label>display count : </label>
            <input type="number" value={this.state.display_count} onChange={e => this.onDisplayCountChange(e)} />
            <button className="apply" onClick={() => this.onDisplayCountChange()}>
              apply
            </button>
          </div>
        </div>

        {/* <div style={{ width: size.width, height: size.height }}> */}
        {this.state.data ? (
          <Tree
            transitionDuration={0}
            useCollapseData={true}
            data={this.state.data}
            translate={this.state.translate}
            orientation={this.state.orientation}
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
