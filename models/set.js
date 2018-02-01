function Set() {

}

Set.prototype.definition = {
    name: 'Sets',
    columnDefinitions: {
        id: 'string',
        programId: 'string',
        exerciseId: 'string',
        componentId: 'string',
        sets: 'string',
        reps: 'string',
        rest: 'string',
        tempo: 'string',
        intensity: 'string',
        comment: 'string',
        setOrder: 'int',
        superSet: 'bool',
        setType: 'string'
    }
}

Set.prototype.clone = function () {
    var result = new Set();
    for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        }
    }
    result.id = "";
    return result;
}



