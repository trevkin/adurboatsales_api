var animals = [
    {name: "Snookems", type: "dog"},
    {name: "Tabby", type: "cat"},
    {name: "Fluffy", type: "dog"},
    {name: "Toby", type: "cat"},
    {name: "Smiley", type: "dog"}
];
var output = animals.find((animal) => {
    return animal.type === "cat";
})
console.log(output)