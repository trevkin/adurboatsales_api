let categories = [
    { id: "animals", parent: null},
    { id: "mammals", parent: "animals"},
    { id: "dogs", parent: "mammals"},
    { id: "boxer", parent: "dogs"},
    { id: "terrier", parent: "dogs"},
    { id: "spaniel", parent: "dogs"},
    { id: "cats", parent: "mammals"},
    { id: "tabby", parent: "cats"},
    { id: "persian", parent: "cats"},
    { id: "siamese", parent: "cats"},
]

let makeTree = (categories, parent) => {
    let node = {}
    categories
        .filter(c => c.parent === parent)
        .forEach(c => {
            node[c.id] = makeTree(categories, c.id)
        })
    return node
}

console.log(
    JSON.stringify(
        makeTree(categories, null)
    , null, 2)
)


