app.service('dataService', function () {




});

app.directive('editableLabel', function () {
  return {
    scope: {
      text: '=',
      onChanged: '&',
    },
    template: "<input style='background:none; width:100%; height:100%' code='13' dl-key-code='edit=false;' ng-show='edit' ng-blur='edit=false;' ng-model='text'></input> <div style='width:100%; height:100%' ng-click='edit=true' ng-show='!edit'>{{text}}</div>",
    restrict: "E",
    link :function(scope, element, attrs){
      
      var oldValue = scope.text;
      scope.$watch('edit', function(){
        if(scope.edit){
          oldValue = scope.text;
        } else if(scope.text != oldValue) {
          scope.onChanged();
        }
      })
    }
  }
})

app.directive('dlKeyCode', dlKeyCode);

function dlKeyCode() {
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      $element.bind("keypress", function (event) {
        var keyCode = event.which || event.keyCode;

        if (keyCode == $attrs.code) {
          $scope.$apply(function () {
            $scope.$eval($attrs.dlKeyCode, { $event: event });
          });

        }
      });
    }
  };
}

app.directive('stringToNumber', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function (value) {
        return '' + value;
      });
      ngModel.$formatters.push(function (value) {
        return parseFloat(value);
      });
    }
  };
});

app.service('Utilities', function () {
  utilities = {}
  utilities.scrollTo = function scrollTo(element, to, duration) {
    var scrollHandle;
    var start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;
    if (scrollHandle != undefined) {
      clearTimeout(scrollHandle);
      scrollHandle = undefined;
    }
    var animateScroll = function () {
      currentTime += increment;
      var val = Math.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      if (currentTime < duration) {
        scrollHandle = setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
    return scrollHandle;
  }

  //t = current time
  //b = start value
  //c = change in value
  //d = duration
  Math.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  };
  return utilities;
});

app.service('repMaxCalc', function () {
  var repmax = {
    lookup: [1, 1, 0.93, 0.90, 0.86, 0.84, 0.82,
      0.80, 0.77, 0.75, 0.72, 0.67, 0.65,
      0.63, 0.60, 0.57, 0.53, 0.55, 0.52,
      0.50, 0.47, 0.46, 0.45, 0.44, 0.43,
      0.42, 0.40, 0.37, 0.35, 0.33, 0.30],

    oneRepMax: function (liftedWeight, liftedReps) {
      return liftedWeight / this.lookup[liftedReps];
    },

    xRepMax: function (oneRM, reps) {
      return oneRM * this.lookup[reps];
    },

    suggestWeight: function (oldWeight, oldReps, newReps) {
      return oldWeight / this.lookup[oldReps] * this.lookup[newReps] * 1.02;
    }
  }
  return repmax;
});