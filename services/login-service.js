app.service('loginService', function ($q, syncService) {

    //Microsoft Azure MobileServiceClient Singleton 
    var client
    this.getClient = function () {
        if (!client) {
            client = new WindowsAzure.MobileServiceClient('https://fitbook.azurewebsites.net');
        }
        return client
    }

    var refreshClient = function () {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://fitbook.azurewebsites.net/.auth/refresh",
            "method": "GET",
            "headers": {
                "accept": "application/json",
                "X-ZUMO-AUTH": client.currentUser.mobileServiceAuthenticationToken,
                "X-ZUMO-INSTALLATION-ID": "48d08eda-3d80-0396-a1ed-4d2d5789c887",
                "X-ZUMO-VERSION": "ZUMO/2.0 (lang=Web; os=--; os_version=--; arch=--; version=2.0.1)",
                "ZUMO-API-VERSION": "2.0.0"
            }
        }

        $.ajax(settings).done(function (response, status) {
            if (status == "success") {
                client.currentUser.mobileServiceAuthenticationToken = response["authenticationToken"];
            }
            else {
                client = null;
                location.href = '\#';
            }
        });
    }



    this.login = function () {
        var client = this.getClient()
        return $q(function (resolve, reject) {

            if (client.currentUser != null) {
                resolve(client.currentUser);
            } else {
                client.login('google').then(function () {
                    setInterval(refreshClient, 1000 * 60 * 15);
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
                                        syncService.initializeTables(client);
                                    }
                                    resolve(client.currentUser);
                                }, reject)
                            } else {
                                if (window.cordova) {
                                    syncService.initializeTables(client);
                                }
                                resolve(client.currentUser);
                            }
                        }, reject)
                }, reject);
            }
        })
    }
})