//initialize upcomingEventsApp
angular.module('upcomingEventsApp', ['ngRoute', 'ngMap'])

//enable function $log.info
.config(function($logProvider){
    $logProvider.debugEnabled(true);
})
//configurate routing in our Single Page Application
.config(function($routeProvider) {
    $routeProvider
        .when('/', { //main table with events
            templateUrl: 'template_pages/show_all_events.html',
            controller: 'upcomingEventsCtrl'
        })

        .when('/!/upcomingEvents/:eventId', { //detail information about some event
            templateUrl: 'template_pages/show_event.html',
            controller: 'showEventCtrl'
        })
})

//initialize upcomingEventsCtrl
.controller('upcomingEventsCtrl', ['$scope', '$http', '$log', function($scope, $http, $log) {
    //get only actual events
    function filterEvents(data, start_date) {
        var filteredEvents = data.filter(function(item) {
            moment.tz.setDefault(item.timezone);  //set the default timezone to event's timezone
            return start_date <= moment.tz(item.date_start, 'UTC').format('YYYY MM DD');
        });
        return filteredEvents;
    };
    //add new calculated fields for records
    function addInfo(data) {
        var processedEvents = data;
        var eventWeek;

        angular.forEach(processedEvents, function(item) {
            moment.tz.setDefault(item.timezone);  //set the default timezone to event's timezone
            item.date_start = moment.tz(item.date_start, 'UTC');
            item.startsAt = item.date_start.format('hh:mm A');
            item.localTime = moment().format('hh:mm A');
            item.startIn = item.date_start.fromNow(true);

            //highlight events of this week with eventWeek=true
            eventWeek = item.date_start.week();
            item.thisWeek = (eventWeek == moment().week()) ? true : false;

            item.date_start = item.date_start.format('MM/DD');

        });

        return processedEvents;
    };

    $http.get('https://events.sportwrench.com/api/esw/events').
    success(function (data, status, headers, config) {
        $scope.upcomingEvents = addInfo(filterEvents(data, moment().format('YYYY MM DD')));
        $log.debug('Got only actual events and add calculated localTime, startIn and thisWeek');
        $log.debug($scope.upcomingEvents);
        $scope.sortType = 'date_start'; //parameter for sorting
        $scope.sortReverse = false; //from now to future
    }).
    error(function (data, status, headers, config) {
        // log error
    })
}])

//initialize showEventCtrl
.controller('showEventCtrl', function($scope, $http, $routeParams, $log) {
    //get only needed event
    function getOurEvent(data, event_id) {
        var ourEvent = data.filter(function(item) {
            return item.event_id == event_id;
        });
        return ourEvent;
    };

    $http.get('https://events.sportwrench.com/api/esw/events').
    success(function (data, status, headers, config) {
        $scope.event_details = getOurEvent(data, $routeParams.eventId);
        moment.tz.setDefault($scope.event_details[0].timezone); //set the default timezone to event's timezone
        $scope.event_details[0].date_start = moment.tz($scope.event_details[0].date_start, 'UTC').format('MM/DD/YYYY HH:mm');
        $scope.event_details[0].date_end = moment.tz($scope.event_details[0].date_end, 'UTC').format('MM/DD/YYYY HH:mm');
        $log.debug('Got only event with event_id: ' + $routeParams.eventId);
        $log.debug($scope.event_details);
    }).
    error(function (data, status, headers, config) {
        // log error
    });

    $scope.$back = function() {
        window.history.back();
    };
});

