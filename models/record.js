function Record() {

}

Record.prototype.definition = {
    name: 'Records',
    columnDefinitions: {
        id: 'string',
        date: 'string',
        setId: 'string',
        setNumber: 'string',
        recordValue: 'string',
        userId: 'string',
        exerciseId: 'string',
        intensity: 'string',
        programId: 'string'
    }
}

Record.prototype.clone = function () {
    var result = new Record();
    for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        }
    }
    result.id = "";
    return result;
}


Record.prototype.create = function (userId, set, setNumber, recordValue) {
    var result = new Record();
    result.date = new Date();
    result.setId = set.id;
    result.setNumber = setNumber;
    result.recordValue = recordValue;
    result.userId = userId;
    result.exerciseId = set.exerciseId;
    result.intensity = set.intensity ? set.intensity : set.reps;
    result.programId = set.programId;
    return result;
}

app.factory('Records', function ($q, CloudSyncedList) {
    var list;
    function Records() {
        list = new CloudSyncedList('Records');
    }

    Records.prototype.initialize = function (filter, order) {
        return list.initialize(filter, order);
    }

    Records.prototype.upsert = function (item) {
        var d = $q.defer();
        list.upsert(item, function () { d.resolve(); });
        return d.promise;
    }

    Records.prototype.del = function (item) {
        var d = $q.defer();
        list.del(item, function () { d.resolve(); });
        return d.promise;
    }


    Records.prototype.findRecord = function (setId, setNumeber) {
        var record = list.list.find(function (record) {
            return record.setId == setId && record.setNumber == setNumeber;
        })

        return record;
    }

    Records.prototype.addRecord = function (userId, set, setNumber, recordValue) {
        var d = $q.defer();
        var currentRecord = this.findRecord(set.id, setNumber);
        if (currentRecord) {
            currentRecord.recordValue = recordValue;
        } else {
            currentRecord = Record.prototype.create(userId, set, setNumber, recordValue);
        }
        list.upsert(currentRecord, function (record) { d.resolve(record) });
        return d.promise;
    };

    Records.prototype.getExerciseRecords = function (exerciseId) {
        var exerciseRecords = list.list.filter(function (record) {
            return record.exerciseId === exerciseId
        });

        function compare(a, b) {
            if (a.date < b.date)
                return 1;
            if (a.date > b.date)
                return -1;
            return 0;
        }

        exerciseRecords.sort(compare);
        return exerciseRecords;
    }


    return Records;
});