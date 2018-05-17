
function Exercise() {


}
Exercise.prototype.definition = {
    name: 'Exercises',
    columnDefinitions: {
        id: 'string',
        name: 'string',
        bodyPart: 'string',
        type: 'string',
        intensityType: 'string',
        comments: 'string',
        equipment: 'string',
        image: 'string'
    }
}

Exercise.prototype.clone = function () {
    var result = new Exercise();
    for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        }
    }
    delete result.id;
    return result;
}
