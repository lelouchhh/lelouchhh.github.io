(function( $ ) {
	$.fn.pixelCurrentStep = function () {
		return $(this).pixelWizard("currentStep");
	}
	$.fn.pixelFirstStep = function () {
		return $(this).pixelCurrentStep() == 1;
	}
	$.fn.pixelLastStep = function () {
		return $(this).pixelCurrentStep() == $(this).pixelCountSteps();
	}
	$.fn.pixelCountSteps = function () {
		var self = $(this);
		return self.find(".wizard-steps > li").length;
	}
	$.fn.pixelNextStep = function (callback) {
		var self = $(this);
		var currStep = $(this).pixelCurrentStep();
		if (currStep >= self.pixelCountSteps()) {
			return currStep;
		}
		self.pixelWizard("setCurrentStep",++currStep, callback);
		return currStep;
	}
	$.fn.pixelPrevStep = function (callback) {
		var self = $(this);
		var currStep = self.pixelCurrentStep();
		if (currStep <= 1) {
			return currStep;
		}
		self.pixelWizard("setCurrentStep",--currStep, callback);
		return currStep;
	}
	$.fn.pixelSetCurrentStep = function (step, callback) {
		var self = $(this);
		var currStep = self.pixelCurrentStep();
		if ((step < 1) && (step > self.pixelCountSteps())) {
			return currStep;
		}
		self.pixelWizard("setCurrentStep",step, callback);
		return currStep;
	}
})( jQuery );