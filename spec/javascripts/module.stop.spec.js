describe("module stop", function(){
  "use strict";

  var App;

  beforeEach(function(){
    App = new Backbone.Marionette.Application();
  });

  describe("when stopping a module that has been started", function(){
    var mod1, mod2, mod3, beforeStop, stop;

    beforeEach(function(){
      beforeStop = jasmine.createSpy("before:stop");
      stop = jasmine.createSpy("stop");

      mod1 = App.module("Mod1", function(Mod1){
        Mod1.addFinalizer(function(){
          Mod1.isDead = true;
        });
      });

      mod1.on("before:stop", beforeStop);
      mod1.on("stop", stop);

      mod2 = App.module("Mod1.Mod2");
      mod3 = App.module("Mod1.Mod3");

      spyOn(mod2, "stop");
      spyOn(mod3, "stop");

      mod1.start();
      mod1.stop();
    });

    it("should trigger a 'before:stop' event", function(){
      expect(beforeStop).toHaveBeenCalled();
    });

    it("should trigger a 'stop' event", function(){
      expect(stop).toHaveBeenCalled();
    });

    it("should run all finalizers for the module", function(){
      expect(mod1.isDead).toBe(true);
    });

    it("should stop all sub-modules", function(){
      expect(mod2.stop).toHaveBeenCalled();
      expect(mod3.stop).toHaveBeenCalled();
    });

    it("should not remove the module from it's parent module or application", function(){
      expect(App.module("Mod1")).toBe(mod1);
    });

  });

  describe("when stopping a module that has not been started", function(){
    var mod1, mod2, mod3;

    beforeEach(function(){
      mod1 = App.module("Mod1", function(Mod1){
        Mod1.addFinalizer(function(){
          Mod1.isDead = true;
        });
      });

      mod2 = App.module("Mod1.Mod2");
      mod3 = App.module("Mod1.Mod3");

      spyOn(mod2, "stop");
      spyOn(mod3, "stop");

      // this module has not been started
      mod1.stop();
    });

    it("should not run any finalizers", function(){
      expect(mod1.isDead).toBeUndefined();
    });

    it("should not stop sub-modules", function(){
      expect(mod2.stop).not.toHaveBeenCalled();
      expect(mod3.stop).not.toHaveBeenCalled();
    });
  });

  describe("when adding a module finalizer outside of the module definition function and stopping the module", function(){
    var finalizer;

    beforeEach(function(){
      var MyApp = new Marionette.Application();
      var module = MyApp.module("MyModule");

      finalizer = jasmine.createSpy("module finalizer");
      module.addFinalizer(finalizer);

      MyApp.start();
      module.stop();
    });

    it("should run the finalizer", function(){
      expect(finalizer).toHaveBeenCalled();
    });

  });


});
