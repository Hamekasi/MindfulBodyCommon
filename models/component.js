function Component() {

}
Component.prototype.definition = {
    name: 'Components',
    columnDefinitions: {
        id: 'string',
        programId: 'string',
        rounds: 'string',
        rest: 'string',
        duration: 'string',
        week: 'int',
        day: 'int',
        componentOrder: 'int',
        name: 'string',
        type: 'string'
    }
}
Component.prototype.clone = function () {
    var result = new Component();
    for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        }
    }
    result.id = "";
    return result;
}

