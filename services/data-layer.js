////////////////
// Data Layer //
////////////////

app.service('syncService', function ($q) {
    //Android Offline sync data store Singleton
    var store
    //Android Offline syncContext
    var syncContext

    var initializeTables = function (client) {
        return $q(function (resolve, reject) {
            store = new WindowsAzure.MobileServiceSqliteStore('store.db');
            syncContext = client.getSyncContext()
            syncContext.initialize(store).then(function () {
                var promises = [
                    // store.defineTable({
                    //     name: 'Users',
                    //     columnDefinitions: {
                    //         id: 'string',
                    //         name: 'string'
                    //     }
                    // }),
                    store.defineTable({
                        name: 'Records',
                        columnDefinitions: {
                            id: 'string',
                            date: 'string',
                            setId: 'string',
                            setNumber: 'string',
                            record: 'string',
                            userId: 'string',
                            exerciseId: 'string',
                            intensity: 'string',
                            programId: 'string'
                        }
                    }).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Records').where({
                            userId: client.currentUser.userId
                        }), 'Records' + 'QueryId')
                    }),

                    store.defineTable({
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
                    }).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Programs'), 'Programs' + 'QueryId')
                    }),

                    store.defineTable({
                        name: 'Exercises',
                        columnDefinitions: {
                            id: 'string',
                            name: 'string',
                            bodyPart: 'string',
                            type: 'string',
                            intensityType: 'string',
                            comments: 'string',
                            equipment: 'string'
                        }
                    }).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Exercises'), 'Exercises' + 'QueryId')
                    }),

                    store.defineTable({
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
                    }).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Sets'), 'Sets' + 'QueryId')
                    }),

                    store.defineTable({
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
                    }).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Components'), 'Components' + 'QueryId')
                    })
                ]

                $q.all(promises).then(function () {
                    syncContext.push();
                    resolve()
                })

            })
        })
    }
});
app.factory('CloudSyncedList', function ($q, loginService, $filter) {


    function CloudSyncedList(tableName) {
        this.tableName = tableName
    }

    var jsHtmlInitialize = function (filter, order) {
        this.list = [];
        var that = this;
        this.order = order ? order : 'id';
        var promise = $q(function (resolve, reject) {
            that.table = loginService.getClient().getTable(that.tableName);
            var load = function (skip) {
                that.table.where(filter).orderBy('id').skip(skip).read()
                    .then(function (results) {
                        that.list.push.apply(that.list, results);
                        if (results.nextLink) {
                            load(that.list.length);
                        } else {
                            that.list.sort(function (a, b) {
                                if (a[that.order] < b[that.order]) {
                                    return -1
                                }
                                if (a[that.order] > b[that.order]) {
                                    return 1
                                }
                                return 0;
                            })
                            resolve(that.list)
                        }
                    }, function (err) {
                        if (err.message == "Unauthorized") {
                            alert("Your Session has Expired.\nPlease login again.");
                            loginService.refreshClient();
                        } else {
                            alert("Error: " + err);
                            reject(err);
                        }
                    })
            }
            load(0);
        })
        return promise;
    }

    var cordovaInitialize = function (filter, order) {
        this.list = [];
        this.order = order ? order : 'id';
        var that = this;
        that.table = loginService.getClient().getSyncTable(that.tableName)
        return that.table.where(filter).orderBy(that.order).read().then(function (results) {
            that.list.push.apply(that.list, results);
        })
    }

    if (window.cordova) {
        CloudSyncedList.prototype.initialize = cordovaInitialize
    } else {
        CloudSyncedList.prototype.initialize = jsHtmlInitialize
    }

    CloudSyncedList.prototype.upsert = function (item, onDone) {
        var table = this.table;
        var list = this.list;
        var order = this.order;

        if (item.id) {

            var itemIndex = list.indexOf(item);
            delete item.createdAt;
            delete item.updatedAt;
            delete item.version;
            delete item.$$hashKey;
            delete item.ROW_NUMBER;
            table.update(item)
                .done(function (updatedItem) {
                    list[itemIndex] = updatedItem;
                    onDone(updatedItem);
                }, function (err) {
                    alert("Failed To Update Item" + err)
                });
        } else {
            table.insert(item)
                .done(function (insertedItem) {
                    var i = 0;
                    while (i < list.length && list[i][order] < insertedItem[order]) {
                        i++;
                    }
                    list.splice(i, 0, insertedItem)
                    onDone(insertedItem);
                }, function () {
                    alert("Failed To Save Item")
                });
        }
    }

    CloudSyncedList.prototype.del = function (item, onDone) {

        var list = this.list;

        this.table.del({ id: item.id })
            .done(function () {
                var index = list.indexOf(item);
                if (index > -1) {
                    list.splice(index, 1);
                }
                onDone();
            }, function () {
                alert("Failed To Delete Item")
            });
    }

    return CloudSyncedList

});

function Record() {

}

Record.prototype.definition = {
    name: 'Records',
    columnDefinitions: {
        id: 'string',
        date: 'string',
        setId: 'string',
        setNumber: 'string',
        record: 'string',
        userId: 'string',
        exerciseId: 'string',
        intensity: 'string',
        programId: 'string'
    }
}

Record.prototype.clone = function (record) {
    var clone = new Record();
    clone.date = this.date;
    clone.setId = this.setId;
    clone.setNumber = this.setNumber;
    clone.record = this.record;
    clone.userId = this.userId;
    clone.exerciseId = this.exerciseId;
    clone.intensity = this.intensity;
    clone.programId = this.programId;
    return clone;
}

Record.prototype.create = function (set, setIndex, programId,userId, record) {
    var result = new Record();
    result.date = new Date();
    result.setId = set.id;
    result.setNumber = setIndex;
    result.record = record;
    result.userId = userId;
    result.exerciseId = set.exerciseId;
    result.intensity = set.intensity ? set.intensity : set.reps;
    result.programId = programId;
    return result;
}