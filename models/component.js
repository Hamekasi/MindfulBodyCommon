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

scopComponent.prototype.overridesNumberReps = function () {
    var compType = this.type;
    return compType != "Tabata" && compType != "AMRAP";
}

Component.prototype.overridesRest = function () {
    var compType = this.type;
    return compType != "Tabata" && compType != "AMRAP" && compType != "EMOM";
}


Component.prototype.showComponentRounds = function (component) {
    return component.type == 'Superset' || component.type == 'Tabata' || component.type == 'EMOM';
}

Component.prototype.showComponentRest = function (component) {
    return component.type == 'Superset' || component.type == 'Tabata';
}

Component.prototype.showComponentDuration = function (component) {
    return component.type == 'AMRAP' || component.type == 'EMOM' || component.type == 'Tabata';
}

Component.prototype.getDurationLabel = function (component) {
    if (component.type == 'AMRAP') return 'in';
    if (component.type == 'EMOM') return 'every';
    if (component.type == 'Tabata') return 'activity';
}

Component.prototype.getRestLabel = function (component) {
    if (component.type == 'Tabata') return 'rest'
    return 'rest';
}

Component.prototype.needsManualStart = function () {
    var componentType = this.type;
    return componentType == "AMRAP" || componentType == "EMOM" || componentType == "Tabata"
}