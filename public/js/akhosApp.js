(function() {
    var app = angular.module('akhosApp', ['ui.router', 'ngResource', 'ngAnimate']);

    app.run(['$rootScope', '$state', '$stateParams', 'posts',
        function($rootScope, $state, $stateParams, posts) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }
    ]);

    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {

            $stateProvider.state('home', {
                url: '/',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts',
                        function(posts) {
                            return posts.getAll();
                        }
                    ]
                }
            }).state('post', {
                url: '/post',
                controller: 'MainCtrl',
                templateUrl: '/post.html',
            }).state('posts', {
                url: '/posts/:id',
                controller: 'PostsCtrl',
                templateUrl: '/posts.html',
                resolve: {
                    post: ['$stateParams', 'posts',
                        function($stateParams, posts) {
                            return posts.get($stateParams.id);
                        }
                    ]
                }
            }).state('login', {
                url: '/login',
                templateUrl: '/login.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth',
                    function($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }
                ]
            }).state('register', {
                url: '/register',
                templateUrl: '/register.html',
                controller: 'AuthCtrl',
                onEnter: ['$state', 'auth',
                    function($state, auth) {
                        if (auth.isLoggedIn()) {
                            $state.go('home');
                        }
                    }
                ]
            }).state('privacy', {
                url: '/privacy',
                templateUrl: '/privacy.html',
                controller: 'MainCtrl'
            }).state('terms', {
                url: '/terms',
                templateUrl: '/terms.html',
                controller: 'MainCtrl'
            });

            $locationProvider.html5Mode(true);

            $urlRouterProvider.otherwise('/');
        }
    ]);

    app.factory('auth', ['$http', '$window', '$state',
        function($http, $window, $state) {
            var auth = {};

            auth.saveToken = function(token) {
                $window.localStorage['akhos-token'] = token;
            };

            auth.getToken = function() {
                return $window.localStorage['akhos-token'];
            }

            auth.isLoggedIn = function() {
                var token = auth.getToken();

                if (token) {
                    var payload = JSON.parse($window.atob(token.split('.')[1]));

                    return payload.exp > Date.now() / 1000;
                } else {
                    return false;
                }
            };

            auth.currentUser = function() {
                if (auth.isLoggedIn()) {
                    var token = auth.getToken();
                    var payload = JSON.parse($window.atob(token.split('.')[1]));

                    return payload.username;
                }
            };

            auth.register = function(user) {
                return $http.post('/register', user).success(function(data) {
                    auth.saveToken(data.token);
                    $state.go("home");
                });
            };

            auth.logIn = function(user) {
                return $http.post('/login', user).success(function(data) {
                    auth.saveToken(data.token);
                    $state.go("post");
                });
            };

            auth.logOut = function() {
                $window.localStorage.removeItem('akhos-token');
            };

            return auth;
        }
    ]);

    app.factory('posts', ['$http', 'auth',
        function($http, auth) {
            var o = {
                posts: []
            };

            o.getAll = function() {
                return $http.get('/posts').success(function(data) {
                    angular.copy(data, o.posts);
                });
            };

            o.create = function(post) {
                return $http.post('/posts', post, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(data) {
                    o.posts.push(data);
                });
            };

            o.upvote = function(post) {
                return $http.put('/posts/' + post._id + '/upvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(data) {
                    post.upvotes += 1;
                });
            };

            o.downvote = function(post) {
                return $http.put('/posts/' + post._id + '/downvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(data) {
                    post.upvotes -= 1;
                });
            };

            o.get = function(id) {
                return $http.get('/posts/' + id).then(function(res) {
                    return res.data;
                });
            };

            o.addComment = function(id, comment) {
                return $http.post('/posts/' + id + '/comments', comment, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                });
            };

            o.upvoteComment = function(post, comment) {
                return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(data) {
                    comment.upvotes += 1;
                });
            };

            o.downvoteComment = function(post, comment) {
                return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(data) {
                    comment.upvotes -= 1;
                });
            };
            return o;
        }
    ]);

    app.service('tabs', ['$http', '$window',
        function($http, $window) {
            this.tab = 1;

            this.setTab = function(num) {
                this.tab = num;
            };

            this.isTab = function(num) {
                return this.tab === num;
            };

            this.plusTab = function() {
                this.tab += 1;
            };

            this.minusTab = function() {
                this.tab -= 1;
            };

        }
    ]);

    app.controller('MainCtrl', ['$scope', 'posts', 'auth', 'tabs',
        function($scope, posts, auth, tabs) {
            $scope.tab = tabs.tab;
            $scope.setTab = tabs.setTab;
            $scope.isTab = tabs.isTab;
            $scope.plusTab = tabs.plusTab;
            $scope.minusTab = tabs.minusTab;

            $scope.posts = posts.posts;
            $scope.isLoggedIn = auth.isLoggedIn;

            $scope.title = '';

            $scope.addPost = function() {
                if ($scope.title === '') {
                    return;
                }
                posts.create({
                    title: $scope.title,
                    link: $scope.link,
                    tags: $scope.tags,
                    author: 'user',
                });
                $scope.title = '';
                $scope.link = '';
                $scope.tags = '';
            };

            $scope.upvotePost = function(post) {
                console.log('Upvoting:' + post.title + "votes before:" + post.upvotes);
                posts.upvote(post);
            };
            $scope.downvotePost = function(post) {
                posts.downvote(post);
            };


        }
    ]);

    app.controller('PostsCtrl', ['$scope', 'posts', 'post', 'auth', 'tabs',
        function($scope, posts, post, auth) {
            $scope.post = post;
            $scope.posts = posts.posts;
            $scope.isLoggedIn = auth.isLoggedIn;

            $scope.upvotePost = function(post) {
                posts.upvote(post);
            };
            $scope.downvotePost = function(post) {
                posts.downvote(post);
            };

            $scope.addComment = function() {
                if ($scope.body === '') {
                    return;
                }
                posts.addComment(post._id, {
                    body: $scope.body,
                    author: 'user'
                }).success(function(comment) {
                    $scope.post.comments.push(comment);
                });
                $scope.body = '';
            };
            $scope.upvoteComment = function(comment) {
                posts.upvoteComment(post, comment);
            };

            $scope.downvoteComment = function(comment) {
                posts.downvoteComment(post, comment);
            };

        }
    ]);

    app.controller('AuthCtrl', ['$scope', '$state', 'auth',
        function($scope, $state, auth) {
            $scope.user = {};

            $scope.register = function() {
                auth.register($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('home');
                });
            };

            $scope.logIn = function() {
                auth.logIn($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go('home');
                });
            };

        }
    ]);

    app.controller('NavCtrl', ['$scope', 'auth',
        function($scope, auth) {
            $scope.isLoggedIn = auth.isLoggedIn;
            $scope.currentUser = auth.currentUser;
            $scope.logOut = auth.logOut;
        }
    ]);

})();
