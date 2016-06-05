const fs        = require('fs');
const extractor = require('./extractor-composite');

function dep2linecolor(pDep) {
    if (pDep.coreModule){
        return "\"#999999\"";
    }

    return "black";
}

function toEntities(pDependencies) {
    return Object.keys(pDependencies).reduce(
        (pEntities, pDependency) => pEntities.concat(`\"${pDependency}\" [color=black, fontcolor=black]\n    `),
    "");
}

function renderEdgesForDependant(pDep, pDependencies) {
    return pDependencies[pDep].reduce(
        (pAll, pThing) =>
            pAll.concat(
                `\"${pDep}\" -> \"${pThing.resolved}\" [color=${dep2linecolor(pThing)}]\n    `
            ),
    "");
}

function toEdges(pDependencies) {
    return Object.keys(pDependencies).reduce(
        (pEdges, pDependency) =>
            pEdges.concat(`${renderEdgesForDependant(pDependency, pDependencies)}`),
    "");
}

function toDiGraph(pDependencies) {
    return `
digraph {
    ordering=out
    rankdir=LR
    splines=true
    overlap=false
    node [shape=box, style="rounded, filled",
          color="#999999", fillcolor="#ffffdd", fontcolor="#999999",
          fontname=Helvetica, fontsize=9]
    edge [color=black, arrowhead=vee, fontname="Helvetica", fontsize="9"]

    ${toEntities(pDependencies)}

    ${toEdges(pDependencies)}
}
`;
}

function getDependencyStrings(pDirOrFile, pOptions) {
    if (pOptions.flatDefine){
        throw new Error(
            "Flat define (-d) + rendering as a dot graph (-G) won't work. Did you mean to do one of those?\n"
        );
    }

    if (fs.statSync(pDirOrFile).isDirectory()){
        return toDiGraph(extractor.extractRecursiveDir(pDirOrFile, pOptions));
    } else {
        return toDiGraph(extractor.extractRecursive(pDirOrFile, pOptions));
    }
}

exports.getDependencyStrings = getDependencyStrings;
