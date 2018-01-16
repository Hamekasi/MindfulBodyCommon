app.service('loginService', function ($q,syncService) {

    //Microsoft Azure MobileServiceClient Singleton 
    var client
    this.getClient = function () {
        if (!client) {
            client = new WindowsAzure.MobileServiceClient('https://fitbook.azurewebsites.net');
        }
        return client
    }

    this.refreshClient = function() {
        client = null;
        location.href = '\#';
    }

    this.login = function () {
        var client = this.getClient()
        return $q(function (resolve, reject) {

            if (client.currentUser != null) {
                resolve(client.currentUser);
            } else {
                client.login('google').then(function () {
                    var usersTable = client.getTable('Users');
                    usersTable.where({
                        userId: client.currentUser.userId
                    }).read()
                        .then(function (results) {
                            if (results.length == 0) {
                                usersTable.insert({
                                    userId: client.currentUser.userId
                                }).then(function () {
                                    if (window.cordova) {
                                        syncService.initializeTables(client).then(function () {
                                            resolve(client.currentUser)
                                        })
                                    } else {
                                        resolve(client.currentUser)
                                    }
                                }, reject)
                            } else {
                                if (window.cordova) {
                                    syncService.initializeTables(client).then(function () {
                                        resolve(client.currentUser)
                                    })
                                } else {
                                    resolve(client.currentUser)
                                }
                            }
                        }, reject)
                }, reject);
            }
        })
    }
})