app.service('dataService', function () {




});

app.directive('editableLabel', function () {
    return {
        scope: {
            text: '=',
            onChanged:'='
        },
        template: "<input style='background:none' code='13' dl-key-code='edit=false; onChanged()'  ng-show='edit' ng-blur='edit=false; onChanged()' ng-model='text'></input> <span ng-dblclick='edit=true' ng-show='!edit'>{{text}}</span>",
        restrict: "E",
       
      
    }
})

app.directive('dlKeyCode', dlKeyCode);

  function dlKeyCode() {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {
        $element.bind("keypress", function(event) {
          var keyCode = event.which || event.keyCode;

          if (keyCode == $attrs.code) {
            $scope.$apply(function() {
              $scope.$eval($attrs.dlKeyCode, {$event: event});
            });

          }
        });
      }
    };
  }

  app.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
});