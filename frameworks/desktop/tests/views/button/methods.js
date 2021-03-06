// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
var b, counter;

module("SC.ButtonView#actions", {
	setup: function() {
	  b = SC.ButtonView.create();
	}
});

test("Emulate mouse click to verify if the button activates", function() {
  b.triggerAction();
  equals(b.get('isActive'), YES, "the should be active for 200ms");
  
});


test("Test different moused states", function() {
  b.set('isEnabled', YES);
  b.mouseDown();
  equals(b.get('isActive'), YES, "the button should be active after a mouseDown event");
  b.mouseExited();
  equals(b.get('isActive'), NO, "the button should be active after a mouseDown event");
  b.mouseEntered();
  equals(b.get('isActive'), b._isMouseDown, "the button should be active after a mouseDown event");  
//  b.mouseUp();
//  equals(b.get('isActive'), NO, "the button should be inactive after a mouseUP event");

  b.set('buttonBehavior', SC.TOGGLE_BEHAVIOR);
  b._action();
  equals(b.get('value'), b.get('toggleOnValue'), "the value should be the same as the toggle value");
 
  b.set('buttonBehavior', SC.TOGGLE_ON_BEHAVIOR);
  b._action();
  equals(b.get('value'), b.get('toggleOnValue'), "the value should be the same as the toggle value");
  
  b.set('buttonBehavior', SC.TOGGLE_OFF_BEHAVIOR);
  b._action();
  equals(b.get('value'), b.get('toggleOffValue'), "the value should be the same as the toggle value");
});

test("Actions should be sent up the responder chain", function() {
  var methodOnParentWasCalled = NO;
  
  // create a pane to test with. It has a child view, and under that, a button.
  // the button sends an action up to its parent. We hope. :)
  var pane = SC.Pane.create({
    childViews: "v".w(),
    v: SC.View.extend({
      methodOnParent: function() {
        methodOnParentWasCalled = YES;
      },
      childViews: "b".w(),
      b: SC.ButtonView.extend({
        action: "methodOnParent"
      })
    })
  });
  
  // the pane has to be in DOM for this to work, apparently.
  pane.append();
  pane.v.b.triggerAction();
  ok(methodOnParentWasCalled, "method on parent should have been called");
  pane.remove();
});

module("SC.ButtonView#actions - SC.HOLD_BEHAVIOR", {
  setup: function() {
    counter = SC.Object.create({
      value: 0,
      increment: function(){
        this.set('value', this.get('value') + 1);
      }
    });

    b = SC.ButtonView.create({
      buttonBehavior: SC.HOLD_BEHAVIOR,
      holdInterval: 5,
      target: counter,
      action: 'increment',

      // Is it a bad idea to stub like this? If we don't do it this way, we need to set up a Pane
      _runAction: function(evt) {
        var action = this.get('action'),
            target = this.get('target') || null;

        target[action]();
      }
    });
  }
});

test('Test triggerAction only happens once', function(){
  b.triggerAction();

  var assertions = function(){
    equals(counter.get('value'), 1, "should only run action once");
    start();
  };

  stop();
  setTimeout(assertions, 10);
});

// This test is not nearly reliable enough
test("Test action repeats while active", function(){
  b.set('isActive', YES);
  b._action();

  var assertions = function(){
    // The actual number of times in not entirely predictable since there can be delays beyond the holdInterval
    ok(counter.get('value') > 2, "should have run more than 2 times");
    b.set('isActive', NO); // Stops triggering
    start();
  };

  stop();
  setTimeout(assertions, 300);
});

test("Test action happens on mouseDown", function(){
  b.mouseDown();
  equals(counter.get('value'), 1, "should have run once");
  b.set('isActive', NO); // Stops triggering
});

test("Test action does not happen on mouseUp", function(){
  b._isMouseDown = YES;
  b.mouseUp();
  equals(counter.get('value'), 0, "should not have run");
});

test("Should stop when inactive", function(){
  b.set('isActive', YES);
  b._action();
  b.set('isActive', NO);

  var assertions = function(){
    equals(counter.get('value'), 1, "should only run action once");
    start();
  };

  stop();
  setTimeout(assertions, 10);
});

