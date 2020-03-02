const fs = require("fs");
const d3 = require("d3");

function readFile(path) {
  var fileContent;
  return new Promise(function(resolve) {
    fileContent = fs.readFileSync(path, { encoding: "utf8" });
    resolve(fileContent);
  });
}

async function get() {
  let root = { name: "root", attributes: { count: 1 }, children: [] };
  const csv = await readFile("./data_simple.csv");

  csv
    .split("\n")
    .slice(1)
    .reduce((r, s) => {
      s.split(",").reduce((a, item) => {
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
          // console.log(array)
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

  return root;
}

const traverse = obj => {
  for (let k in obj) {
    // console.log(k)
    if (obj[k] && typeof obj[k] === "object") {
      // console.log(1, k)
      traverse(obj[k]);
    } else {
      // Do something with obj[k]
      console.log(obj[k]);
    }
  }
};

const traverse2 = tree => {
  if (tree.children) {
    tree.children.forEach(child => {
      child.attributes.pct = Math.round(
        (child.attributes.count / tree.attributes.count) * 100,
        2
      );

      if (child.children) {
        traverse2(child);
      }
    });
  }
};

(async () => {
  const result = await get();

  // const tree = d3.hierarchy(result);
  // console.log(tree)
  // traverse(family.data)
  traverse2(result);
  console.log(JSON.stringify(result, null, 2));
  // console.log(JSON.stringify(result, null, 2))
})();
