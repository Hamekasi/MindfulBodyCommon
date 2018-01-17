app.service('dataService', function () {




});

app.directive('editableLabel', function () {
  return {
    scope: {
      text: '=',
      onChanged: '='
    },
    template: "<input style='background:none' code='13' dl-key-code='edit=false; onChanged()'  ng-show='edit' ng-blur='edit=false; onChanged()' ng-model='text'></input> <span ng-dblclick='edit=true' ng-show='!edit'>{{text}}</span>",
    restrict: "E",


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