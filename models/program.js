function Program() {

}

Program.prototype.clone = function () {
    var result = new Program();
    for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        }
    }
    delete result.id;
    result.name = "Copy of " + this.name;
    return result;
}

Program.prototype.definition = {
    name: 'Programs',
    columnDefinitions: {
        id: 'string',
        name: 'string',
        author: 'string',
        private: 'string',
        goal: 'string',
        weeks: 'string',
        days: 'string',
        day1: 'string',
        day2: 'string',
        day3: 'string',
        day4: 'string',
        day5: 'string',
        day6: 'string',
        day7: 'string',
    }
}

Program.prototype.create = function () {
    var clone = new Program();
    clone.name = this.name;
    clone.author = this.author;
    clone.private = this.private;
    clone.goal = "";
    clone.weeks = 1;
    clone.days = 7;
    clone.day1 = "Monday";
    clone.day2 = "Tuesday";
    clone.day3 = "Wednesday";
    clone.day4 = "Thursday";
    clone.day5 = "Friday";
    clone.day6 = "Saturday";
    clone.day7 = "Sunday";
    return clone;
}
