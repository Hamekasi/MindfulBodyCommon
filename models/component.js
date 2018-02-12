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


Component.prototype.overridesNumberSets = function () {
    return this.type != "";
}

Component.prototype.overridesNumberReps = function () {
    var compType = this.type;
    return compType != "Tabata" && compType != "AMRAP";
}

Component.prototype.overridesRest = function () {
    var compType = this.type;
    return compType != "Tabata" && compType != "AMRAP" && compType != "EMOM";
}


Component.prototype.showComponentRounds = function (component) {
    return this.type == 'Superset' || this.type == 'Tabata' || this.type == 'EMOM';
}

Component.prototype.showComponentRest = function (component) {
    return this.type == 'Superset' || this.type == 'Tabata';
}

Component.prototype.showComponentDuration = function (component) {
    return this.type == 'AMRAP' || this.type == 'EMOM' || this.type == 'Tabata';
}

Component.prototype.getDurationLabel = function (component) {
    if (this.type == 'AMRAP') return 'in';
    if (this.type == 'EMOM') return 'every';
    if (this.type == 'Tabata') return 'activity';
}

Component.prototype.getRestLabel = function (component) {
    if (this.type == 'Tabata') return 'rest'
    return 'rest';
}

Component.prototype.needsManualStart = function () {
    var componentType = this.type;
    return componentType == "AMRAP" || componentType == "EMOM" || componentType == "Tabata"
}