////////////////
// Data Layer //
////////////////
var offlineSynced = false;
app.service('syncService', function ($q) {
    var syncServ = {};
    //Android Offline sync data store Singleton
    var store
    //Android Offline syncContext
    var syncContext

    syncServ.initializeTables = function (client) {
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
                    store.defineTable(Record.prototype.definition).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Records').where({
                            userId: client.currentUser.userId
                        }), 'Records' + 'QueryId')
                    }),

                    store.defineTable(Program.prototype.definition).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Programs').where({
                            deleted: false
                        }), 'Programs' + 'QueryId')
                    }),

                    store.defineTable(Exercise.prototype.definition).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Exercises').where({
                            deleted: false
                        }), 'Exercises' + 'QueryId')
                    }),

                    store.defineTable(Set.prototype.definition).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Sets').where({
                            deleted: false
                        }), 'Sets' + 'QueryId')
                    }),

                    store.defineTable(Component.prototype.definition).then(function () {
                        return syncContext.pull(new WindowsAzure.Query('Components').where({
                            deleted: false
                        }), 'Components' + 'QueryId')
                    })
                ]

                $q.all(promises).then(function () {
                    syncContext.push();
                    OfflineSynced = true;
                    resolve()
                })

            })
        })
    }
    return syncServ;
});

app.factory('CloudSyncedList', function ($q, loginService, $filter) {
    function CloudSyncedList(tableName) {
        this.tableName = tableName
        switch (tableName) {
            case 'Programs':
                this.ObjectType = Program;
                break;
            case 'Sets':
                this.ObjectType = Set;
                break;
            case 'Records':
                this.ObjectType = Record;
                break;
            case 'Exercises':
                this.ObjectType = Exercise;
                break;
            case 'Components':
                this.ObjectType = Component;
                break;
            case 'Clients':
                this.ObjectType = User;
                break;
            default:
                break;
        }

        if (window.cordova) {
            // offline sync is currently disabled as the loading it slow
            CloudSyncedList.prototype.initialize = offlineSynced ? cordovaInitialize : jsHtmlInitialize
        } else {
            CloudSyncedList.prototype.initialize = jsHtmlInitialize
        }
    }

    CloudSyncedList.prototype.toDTO = function (item) {
        var dto = {}
        for (var prop in this.ObjectType.prototype.definition.columnDefinitions) {
            dto[prop] = item[prop];
        }
        return dto;
    }

    CloudSyncedList.prototype.fromDTO = function (dto) {
        if (this.ObjectType.fromDTO) {
            return this.ObjectType.fromDTO(dto);
        }
        var program = new this.ObjectType();
        for (var prop in this.ObjectType.prototype.definition.columnDefinitions) {
            program[prop] = dto[prop];
        }
        return program;
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

                        for (let index = 0; index < results.length; index++) {
                            that.list.push(that.fromDTO(results[index]));
                        }

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
                        loginService.refreshClient();
                        if (err.message == "Unauthorized") {
                            alert("Your Session has Expired.\nPlease login again.");
                            
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
            for (let index = 0; index < results.length; index++) {
                that.list.push(that.fromDTO(results[index]));
            }
        })
    }

    CloudSyncedList.prototype.upsert = function (item, onDone) {
        var table = this.table;
        var list = this.list;
        var order = this.order;
        var that = this;
        var dto = this.toDTO(item);
        if (dto.id && dto.id != "") {
            var itemIndex = list.indexOf(item);
            table.update(dto)
                .done(function (updatedItem) {
                    updatedItem = that.fromDTO(updatedItem);
                    list[itemIndex] = updatedItem;
                    onDone(updatedItem);
                }, function (err) {
                    alert("Failed To Update Item" + err)
                });
        } else {
            table.insert(dto)
                .done(function (insertedItem) {
                    insertedItem = that.fromDTO(insertedItem);
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



