import React, { useState, useEffect } from "react";
import { Tree } from "react-d3-tree";
import csvdata from "./data.csv";
import * as d3 from "d3";

// Hook
function useWindowSize() {
  const isClient = typeof window === "object";

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
}

const Chart = () => {
  let [data, setData] = useState({});
  const size = useWindowSize();

  const traverse = tree => {
    if (tree.children) {
      const total = tree.children.reduce((a, c) => {
        a += c.attributes.count;
        return a;
      }, 0);

      tree.children.forEach(child => {
        child.attributes.pct = (
          (child.attributes.count / total) *
          100
        ).toFixed(2);

        if (child.children) {
          traverse(child);
        }
      });
    }
  };

  useEffect(() => {
    async function get() {
      let root = { name: "root", attributes: { count: 1 }, children: [] };
      const csv = await d3.csv(csvdata);

      csv.reduce((r, s) => {
        s.flow.split(",").reduce((a, item) => {
          var array = a.find(v => v.name === item);
          if (!array) {
            a.push(
              (array = {
                name: item,
                // _collapsed: true,
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

      traverse(root);
      console.log(JSON.stringify(root, null, 2));

      setData(root);
    }

    get();
  }, []);

  // const onClick = (nodeData, evt) => {
  //   console.log(nodeData);

  //   if (nodeData.children) {
  //     nodeData.children.forEach(child => {
  //       child.attributes.pct = (
  //         (child.attributes.count / nodeData.attributes.count) *
  //         100
  //       ).toFixed(2);
  //     });
  //   }
  // };

  return (
    <div style={{ width: size.width, height: size.height }}>
      <Tree transitionDuration={0} useCollapseData={true} data={data} />
    </div>
  );
};

export default Chart;
