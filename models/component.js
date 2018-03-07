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
    return compType == "Tabata";
}

Component.prototype.overridesRest = function () {
    var compType = this.type;
    return compType == "Tabata" || compType == "AMRAP" || compType == "EMOM" || compType == "EMOM_ALT";
}


Component.prototype.showComponentRounds = function (component) {
    return this.type == 'Superset' || this.type == 'Tabata' || this.type == 'EMOM' || this.type == 'EMOM_ALT';
}

Component.prototype.showComponentRest = function (component) {
    return this.type == 'Superset' || this.type == 'Tabata';
}

Component.prototype.showComponentDuration = function (component) {
    return this.type == 'AMRAP' || this.type == 'EMOM' || this.type == 'EMOM_ALT' || this.type == 'Tabata';
}

Component.prototype.getDurationLabel = function (component) {
    if (this.type == 'AMRAP') return 'in';
    if (this.type == 'EMOM') return 'every';
    if (this.type == 'EMOM_ALT') return 'every';
    if (this.type == 'Tabata') return 'activity';
}

Component.prototype.getRestLabel = function (component) {
    if (this.type == 'Tabata') return 'rest'
    return 'rest';
}

Component.prototype.nextStopsTimer = function () {
    var componentType = this.type;
    return componentType == "EMOM_ALT" || componentType == "Tabata"
}

Component.prototype.needsManualStart = function () {
    var componentType = this.type;
    return componentType == "AMRAP" || componentType == "EMOM" || componentType == "EMOM_ALT" || componentType == "Tabata"
}

Component.fromDTO = function (dto) {
    var obj;
    switch (dto.type) {
        case '':
            obj = new NormalComponent();
            break;
        case 'Superset':
            obj = new SupersetComponent();
            break;
        case 'EMOM':
            obj = new EMOMComponent();
            break;
        case 'AMRAP':
            obj = new AMRAPComponent();
            break;
        case 'EMOM_ALT':
            obj = new EMOM_ALTComponent();
            break;
        case 'Tabata':
            obj = new TabataComponent();
            break;
        default:
            break;
    }
    for (var prop in this.prototype.definition.columnDefinitions) {
        obj[prop] = dto[prop];
    }
    return obj;
}




var nextSet = function ($scope) {
    var set = $scope.currentComponent.sets[$scope.currentExerciseIndex];
    if(!set){
        return false;
    }
    if ($scope.currentSetIndex < set.sets - 1) {
        $scope.currentSetIndex++;
        return true;
    }
    return false;
}

var previousSet = function ($scope) {
    if ($scope.currentSetIndex > 0) {
        $scope.currentSetIndex--;
        return true;
    }
    return false;
}

var nextExercise = function ($scope) {

    if ($scope.currentExerciseIndex < $scope.currentComponent.sets.length - 1) {
        $scope.currentExerciseIndex++
        $scope.currentSetIndex = 0;
        return true;
    }
    return false;
}
var previousExercise = function ($scope) {

    if ($scope.currentExerciseIndex > 0) {
        $scope.currentExerciseIndex--
        var set = $scope.currentComponent.sets[$scope.currentExerciseIndex];
        if(!set) {
            return false;
        }
        $scope.currentSetIndex = set.sets - 1;
        return true;
    }
    return false;
}

var nextExerciseSupereset = function ($scope) {
    if ($scope.currentExerciseIndex < $scope.currentComponent.sets.length - 1) {
        $scope.currentExerciseIndex++
        return true;
    }
    return false;
}
var nextRoundSupereset = function ($scope) {
    if ($scope.currentRoundIndex < $scope.currentComponent.rounds - 1) {
        $scope.currentRoundIndex++;
        $scope.currentSetIndex = $scope.currentRoundIndex;
        $scope.currentExerciseIndex = 0;
        return true;
    }
    return false;
}

var previousExerciseSuperset = function ($scope) {
    if ($scope.currentExerciseIndex > 0) {
        $scope.currentExerciseIndex--;
        return true;
    }
    return false;
}

var previousRoundSupereset = function ($scope) {
    if ($scope.currentRoundIndex > 0) {
        $scope.currentRoundIndex--;
        $scope.currentExerciseIndex = $scope.currentComponent.sets.length - 1;
        $scope.currentSetIndex = $scope.currentRoundIndex;
        return true;
    }
    return false;
}

////////////////////////////////////////////////////////////////////////////////////////NORMAL

function NormalComponent() {
}
NormalComponent.prototype = new Component();
NormalComponent.prototype.next = function ($scope) {
    var result = nextSet($scope) || nextExercise($scope);
    var set = $scope.currentComponent.sets[$scope.currentExerciseIndex];
    if(!set) {
        return false;
    }
    $scope.timerControl.resetTo(set.rest, "Rest");
    $scope.buttonMode = "done";
    return result;
}
NormalComponent.prototype.previous = function ($scope) {
    var result = previousSet($scope) || previousExercise($scope);
    var set = $scope.currentComponent.sets[$scope.currentExerciseIndex];
    if(!set) {
        return false;
    }
    $scope.timerControl.resetTo(set.rest, "Rest");
    $scope.buttonMode = "done";
    return result;
}

////////////////////////////////////////////////////////////////////////////////////////SUPERSET

function SupersetComponent() {
}
SupersetComponent.prototype = new Component();
SupersetComponent.prototype.next = function ($scope) {
    var result = nextExerciseSupereset($scope) || nextRoundSupereset($scope);
    var set = $scope.currentComponent.sets[$scope.currentExerciseIndex];
    if(!set) {
        return false;
    }
    if ($scope.currentComponent.sets.length - 1 == $scope.currentExerciseIndex) {
        set.rest = this.rest;
    }
    $scope.timerControl.resetTo(set.rest, "Rest");
    $scope.buttonMode = "done";
    return result;
}
SupersetComponent.prototype.previous = function ($scope) {
    var result = previousExerciseSuperset($scope) || previousRoundSupereset($scope);
    var set = $scope.currentComponent.sets[$scope.currentExerciseIndex];
    if (!set) {
        return false;
    }
    $scope.timerControl.resetTo(set.rest, "Rest");
    $scope.buttonMode = "done";
    return result;
}

////////////////////////////////////////////////////////////////////////////////////////EMOM

function EMOMComponent() {
}
EMOMComponent.prototype = new Component();
EMOMComponent.prototype.next = function ($scope) {
    if (nextExerciseSupereset($scope)) {
        return true;
    }

    var result = nextRoundSupereset($scope);
    if (result) {
        $scope.timerControl.resetTo(this.duration, "EMOM Time");
        $scope.buttonMode = "startComponent";
    }
    return result;
}

EMOMComponent.prototype.previous = function ($scope) {
    if (previousExerciseSuperset($scope)) {
        return true;
    }

    var result = previousRoundSupereset($scope);
    if (result) {
        $scope.timerControl.resetTo(this.duration, "EMOM Time");
        $scope.buttonMode = "startComponent";
    }
    return result;
}

EMOMComponent.prototype.start = function ($scope) {
    //$scope.buttonMode = "done";
    var comp = this;
    var componentRound = function () {
        $scope.startTimer(comp.duration,
            function () {
                if (nextRoundSupereset($scope)) {
                    componentRound();
                }
            }, "EMOM Time");
    }
    componentRound();
}


////////////////////////////////////////////////////////////////////////////////////////EMOM ALT

function EMOM_ALTComponent() {
}
EMOM_ALTComponent.prototype = new Component();
EMOM_ALTComponent.prototype.next = function ($scope) {

    if ($scope.currentExerciseIndex < $scope.currentComponent.sets.length - 1) {
        $scope.currentExerciseIndex++;
    } else if ($scope.currentRoundIndex < $scope.currentComponent.rounds - 1) {
        $scope.currentExerciseIndex = 0;
    }

    var result = false;
    if ($scope.currentRoundIndex < $scope.currentComponent.rounds - 1) {
        $scope.currentRoundIndex++;
        $scope.currentSetIndex = $scope.currentRoundIndex;
        result = true;
        $scope.timerControl.resetTo(this.duration, "EMOM Time");
        $scope.buttonMode = "startComponent";
    }

    return result;

}
EMOM_ALTComponent.prototype.previous = function ($scope) {

    var result = false;
    if ($scope.currentExerciseIndex > 0) {
        $scope.currentExerciseIndex--;
        result = true;
    } else if ($scope.currentRoundIndex > 0) {
        $scope.currentExerciseIndex = $scope.currentComponent.sets.length - 1;
    }

    if ($scope.currentRoundIndex > 0) {
        $scope.currentRoundIndex--;
        $scope.currentSetIndex = $scope.currentRoundIndex;
        result = true;
    }

    if (result) {
        $scope.timerControl.resetTo(this.duration, "EMOM Time");
        $scope.buttonMode = "startComponent";
    }
    return result;
}

EMOM_ALTComponent.prototype.start = function ($scope) {
    var comp = this;
    var componentRound = function () {
        $scope.startTimer(comp.duration,
            function () {
                $scope.done(false).then(function () {
                    if ($scope.currentRoundIndex < comp.rounds - 1) {
                        $scope.next();
                        componentRound()
                    }
                })
            }, "EMOM Time");
    }
    componentRound();
}


////////////////////////////////////////////////////////////////////////////////////////AMRAP

function AMRAPComponent() {
}
AMRAPComponent.prototype = new Component();
AMRAPComponent.prototype.next = function ($scope) {

    if ($scope.currentExerciseIndex < $scope.currentComponent.sets.length - 1) {
        $scope.currentExerciseIndex++
        return true;
    }

    $scope.currentRoundIndex++;
    $scope.currentSetIndex = $scope.currentRoundIndex;
    $scope.currentExerciseIndex = 0;
    return true;
}
AMRAPComponent.prototype.previous = function ($scope) {
    return previousExerciseSuperset($scope) || previousRoundSupereset($scope);
}

AMRAPComponent.prototype.start = function ($scope) {
    var comp = this;
    $scope.startTimer(comp.duration,
        function () {
            // record the number of times
        }, "AMRAP in");

}

////////////////////////////////////////////////////////////////////////////////////////TABATA

function TabataComponent() {
}
TabataComponent.prototype = new Component();
TabataComponent.prototype.next = function ($scope) {
    var result = nextExerciseSupereset($scope) || nextRoundSupereset($scope);
    if (result) {
        $scope.timerControl.resetTo(this.duration, "Go!");
        $scope.buttonMode = "startComponent";
    }
    return result;

}
TabataComponent.prototype.previous = function ($scope) {
    var result = previousExerciseSuperset($scope) || previousRoundSupereset($scope);
    if (result) {
        $scope.timerControl.resetTo(this.duration, "Go!");
        $scope.buttonMode = "startComponent";
    }
    return result;
}
TabataComponent.prototype.start = function ($scope) {
    var comp = this;
    var componentRound = function () {
        $scope.startTimer(comp.duration,
            function () {
                $scope.done(false).then(function () {
                    $scope.startTimer(comp.rest, function () {
                        if ($scope.currentRoundIndex < comp.rounds - 1) {
                            $scope.next();
                            componentRound()
                        }
                    })
                }, "Rest!")
            }, "Go!");
    }
    componentRound();
}


