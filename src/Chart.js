import React, { useState, useEffect } from "react";
import { Tree, treeUtil } from "react-d3-tree";
import csvdata from './data.csv';
import * as d3 from 'd3';

// const data = {
//   name: "root",
//   children: [
//     {
//       name: "ChatbotNavi_faq",
//       children: [
//         {
//           name: "FAQ",
//           children: [
//             {
//               name: "FAQ",
//               children: []
//             }
//           ]
//         },
//         {
//           name: "ChatbotNavi_faq",
//           children: [
//             {
//               name: "StartOver",
//               children: []
//             },
//             {
//               name: "ChatbotNavi_faq",
//               children: [
//                 {
//                   name: "StartOver",
//                   children: [
//                     {
//                       name: "FAQ",
//                       children: [
//                         {
//                           name: "Recommend_product",
//                           children: [
//                             {
//                               name: "StartOver",
//                               children: []
//                             }
//                           ]
//                         }
//                       ]
//                     },
//                     {
//                       name: "Keyfeature",
//                       children: [
//                         {
//                           name: "Recommend_product",
//                           children: []
//                         }
//                       ]
//                     },
//                     {
//                       name: "Recommend_product",
//                       children: [
//                         {
//                           name: "Keyfeature",
//                           children: []
//                         }
//                       ]
//                     }
//                   ]
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// };

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
  let [data, setData] = useState({})
  const size = useWindowSize();

  useEffect(() => {
    async function get() {
      let root = { name: "root", children: [] };
      const csv = await d3.csv(csvdata);
    
      csv.reduce((r, s) => {
        s.flow.split(",").reduce((a, item) => {
          var array = a.find(v => v.name === item);
          if (!array) {
            a.push((array = { name: item, children: [] }));
          }
          return array.children;
        }, r);
        return r;
      }, root.children);

      setData(root)
    }

    get();
  },[])
  
  return (
    <div style={{ width: size.width, height: size.height }}>
      <Tree data={data} />
    </div>
  );
};

export default Chart;
