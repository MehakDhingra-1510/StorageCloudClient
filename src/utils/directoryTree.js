import Directory from "../models/directoryModel.js";

// Returns the ancestor chain of `startDirId`, ordered from the immediate
// parent out to the root: [parent, grandparent, ..., root].
// Does NOT include startDirId itself.
//
// This replaces the old pattern (used separately in permissions.js and
// directoryController.js) of walking up one Directory.findById() at a time
// in a while loop — an N+1 query for every file/directory request, worse the
// deeper the item is nested. $graphLookup resolves the whole chain in a
// single round trip to Mongo, with `depth` telling us the distance so we can
// still process "closest ancestor first".
export async function getAncestorChain(startDirId) {
    if (!startDirId) return [];

    const [result] = await Directory.aggregate([
        { $match: { _id: startDirId } },
        {
            $graphLookup: {
                from: "directories",
                startWith: "$parentDirId",
                connectFromField: "parentDirId",
                connectToField: "_id",
                as: "ancestors",
                depthField: "depth",
            },
        },
        { $project: { ancestors: { _id: 1, name: 1, parentDirId: 1, depth: 1 } } },
    ]);

    if (!result) return [];

    return result.ancestors
        .sort((a, b) => a.depth - b.depth)
        .map((a) => ({ _id: a._id, name: a.name, parentDirId: a.parentDirId }));
}